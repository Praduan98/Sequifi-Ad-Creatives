// Export review stills of the main comp: AfterFX.exe -r export_frames.jsx  (times/dir from frames_job.txt next to this script)
(function () {
  var here = File($.fileName).parent.fsName, job = new File(here + "/frames_job.txt");
  job.open("r"); var lines = job.read().split("\n"); job.close();
  var dir = lines[0].replace(/\s+$/, ""), times = lines[1].split(","), main = null;
  for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name === "Sequifi_Promo_30s") main = app.project.item(i);
  var log = new File(dir + "/frames_done.txt");
  if (!main) { log.open("w"); log.write("no main comp"); log.close(); return; }
  for (var k = 0; k < times.length; k++) {
    var t = parseFloat(times[k]);
    main.saveFrameToPng(t, new File(dir + "/f_" + ("00000" + Math.round(t * 100)).slice(-5) + ".png"));
  }
  log.open("w"); log.write("queued " + times.length); log.close();
})();
