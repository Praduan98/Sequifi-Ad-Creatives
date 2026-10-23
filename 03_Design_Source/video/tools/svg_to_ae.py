"""Convert the Sequifi logo SVG paths into After Effects shape data (vertices + in/out tangents).

    python svg_to_ae.py <logo.svg> <out.json>

Output: {"viewBox": [w, h], "mark": [subpath...], "word": [subpath...]}
where each subpath is {"closed": bool, "v": [[x, y]...], "i": [[dx, dy]...], "o": [[dx, dy]...]} in SVG units.
The mark is the stroked .cls-1 paths; the wordmark is the filled .cls-2 paths (compound, even-odd).
"""
import json
import re
import sys

TOKEN = re.compile(r"[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][-+]?\d+)?")
ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}


def parse(d):
    toks, i, out = TOKEN.findall(d), 0, []
    cmd = None
    while i < len(toks):
        t = toks[i]
        if re.match(r"[A-Za-z]", t):
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append((cmd, []))
                continue
        n = ARGS[cmd.upper()]
        args = [float(x) for x in toks[i:i + n]]
        i += n
        out.append((cmd, args))
        if cmd == "M":
            cmd = "L"  # implicit lineto after moveto
        elif cmd == "m":
            cmd = "l"
    return out


def to_subpaths(d):
    subs, cur = [], None
    x = y = sx = sy = 0.0
    last_ctrl = None  # reflection point for S/T
    def start(px, py):
        nonlocal cur
        cur = {"pts": [[px, py]], "i": [[0, 0]], "o": [[0, 0]], "closed": False}
        subs.append(cur)
    def seg(c1, c2, p):
        cur["o"][-1] = [c1[0] - cur["pts"][-1][0], c1[1] - cur["pts"][-1][1]]
        cur["pts"].append(list(p))
        cur["i"].append([c2[0] - p[0], c2[1] - p[1]])
        cur["o"].append([0, 0])
    for cmd, a in parse(d):
        rel = cmd.islower()
        C = cmd.upper()
        if C == "M":
            x, y = (x + a[0], y + a[1]) if rel else (a[0], a[1])
            sx, sy = x, y
            start(x, y)
            last_ctrl = None
        elif C in "LHV":
            if C == "L":
                nx, ny = (x + a[0], y + a[1]) if rel else (a[0], a[1])
            elif C == "H":
                nx, ny = (x + a[0] if rel else a[0]), y
            else:
                nx, ny = x, (y + a[0] if rel else a[0])
            seg((x, y), (nx, ny), (nx, ny))
            x, y = nx, ny
            last_ctrl = None
        elif C in "CS":
            if C == "C":
                c1 = (x + a[0], y + a[1]) if rel else (a[0], a[1])
                c2 = (x + a[2], y + a[3]) if rel else (a[2], a[3])
                p = (x + a[4], y + a[5]) if rel else (a[4], a[5])
            else:
                c1 = (2 * x - last_ctrl[0], 2 * y - last_ctrl[1]) if last_ctrl else (x, y)
                c2 = (x + a[0], y + a[1]) if rel else (a[0], a[1])
                p = (x + a[2], y + a[3]) if rel else (a[2], a[3])
            seg(c1, c2, p)
            last_ctrl = c2
            x, y = p
        elif C in "QT":
            if C == "Q":
                q = (x + a[0], y + a[1]) if rel else (a[0], a[1])
                p = (x + a[2], y + a[3]) if rel else (a[2], a[3])
            else:
                q = (2 * x - last_ctrl[0], 2 * y - last_ctrl[1]) if last_ctrl else (x, y)
                p = (x + a[0], y + a[1]) if rel else (a[0], a[1])
            c1 = (x + 2 / 3 * (q[0] - x), y + 2 / 3 * (q[1] - y))
            c2 = (p[0] + 2 / 3 * (q[0] - p[0]), p[1] + 2 / 3 * (q[1] - p[1]))
            seg(c1, c2, p)
            last_ctrl = q
            x, y = p
        elif C == "A":
            raise ValueError("arc commands are not used by the Sequifi logo")
        elif C == "Z":
            cur["closed"] = True
            first, last = cur["pts"][0], cur["pts"][-1]
            if abs(first[0] - last[0]) < 1e-3 and abs(first[1] - last[1]) < 1e-3 and len(cur["pts"]) > 1:
                cur["i"][0] = cur["i"][-1]  # fold the closing duplicate vertex into the first one
                cur["pts"].pop(); cur["i"].pop(); cur["o"].pop()
            x, y = sx, sy
            last_ctrl = None
    return [{"closed": s["closed"], "v": s["pts"], "i": s["i"], "o": s["o"]} for s in subs]


def main(svg, out):
    s = open(svg, encoding="utf8").read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    data = {"viewBox": vb[2:], "mark": [], "word": []}
    for m in re.finditer(r'<path\b[^>]*class="(cls-\d)"[^>]*\bd="([^"]+)"', s):
        data["mark" if m.group(1) == "cls-1" else "word"].extend(to_subpaths(m.group(2)))
    json.dump(data, open(out, "w"), indent=1)
    print(f"mark subpaths {len(data['mark'])}, word subpaths {len(data['word'])}, viewBox {data['viewBox']}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
