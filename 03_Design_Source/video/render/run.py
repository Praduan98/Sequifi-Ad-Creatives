"""One-command build of a 45 s film: cue sheet → score → frames (12-sample motion blur) → MP4s.

    python run.py <work dir> [--workers=4] [--film=promo|story]

--film=promo (default): the iOS 26 promo (web/)               → Sequifi_Promo_45s_1080p.mp4 / _web.mp4
--film=story:           the brand story with the spark (story/) → Sequifi_Brand_Story_45s_1080p.mp4 / _web.mp4
Both use the same score; only the sound design (from each film's cue sheet) differs. Use a separate work dir per film.

1. exports the sound cue sheet from the film and synthesizes the score (audio/score.py)
2. renders every frame as 12 sub-frames across a 180° shutter (28–40 inside the film's fast-motion windows) with
   headless Chrome workers in parallel, while parallel mergers average them in linear light into the final frames
3. encodes the film's two MP4s into 04_Final_Exports/Video
About 40 minutes on this PC (GeForce GT 730); re-running with the same work dir resumes. The work dir holds temporary frames (about 4 GB); delete it afterwards.
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
VIDEO = HERE.parent
EXPORTS = VIDEO.parent.parent / "04_Final_Exports" / "Video"
FPS = 30
FILMS = {   # page (from the repo root), cue sheet, mix, output name
    "promo": ("/03_Design_Source/video/web/index.html", "cues.json", "Sequifi_Promo_45s_mix.wav", "Sequifi_Promo_45s_1080p"),
    "story": ("/03_Design_Source/video/story/index.html", "story_cues.json", "Sequifi_Brand_Story_45s_mix.wav", "Sequifi_Brand_Story_45s_1080p"),
}

def workers(n, out, extra):
    procs = [subprocess.Popen(["node", str(HERE / "render.mjs"), "frames", f"--out={out}", f"--step={n}", f"--offset={i}", *extra])
             for i in range(n)]
    return procs


def main():
    work = Path(sys.argv[1]).resolve()
    n = int(next((a.split("=")[1] for a in sys.argv[2:] if a.startswith("--workers=")), 4))
    page, cues, mix, name = FILMS[next((a.split("=")[1] for a in sys.argv[2:] if a.startswith("--film=")), "promo")]
    work.mkdir(parents=True, exist_ok=True)
    audio = VIDEO / "audio"
    subprocess.run(["node", str(HERE / "render.mjs"), "cues", f"--page={page}", f"--out={audio / cues}"], check=True)
    subprocess.run([sys.executable, str(audio / "score.py"), str(audio / cues), str(audio / mix)], check=True)

    sub, frames = work / "sub", work / "frames"
    procs = workers(n, sub, [f"--page={page}", "--sub=12", "--subfast=28", "--shutter=0.5", f"--skipdir={frames}"])   # re-running resumes
    mergers = [subprocess.Popen([sys.executable, str(HERE / "merge.py"), str(sub), str(frames), "--sub=12", "--watch", f"--mod={n}", f"--rem={i}"])
               for i in range(n)]
    for p in procs + mergers:
        p.wait()

    subprocess.run([sys.executable, str(HERE / "compose.py"), str(frames), str(audio / mix), str(EXPORTS), name], check=True)


if __name__ == "__main__":
    main()
