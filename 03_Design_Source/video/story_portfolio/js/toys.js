// Toy characters for the portfolio cut: soft, glossy 3D blobs with simple faces (Three.js), drawn in one off-screen renderer
// and copied into 2D canvases. A draw is a pure function of the pose, so every frame stays a pure function of t.
//   Toys.draw(ctx, name, pose)   pose: {yaw, pitch, roll (rad), look: [x, y] (-1..1), blink 0..1, happy 0..1, wob (rad)}
//   Toys.icon(name, px)          a still of the character as a data URL (the app icon in the device)
// Characters: hero (the travelling mascot), hardhat (field rep), specs (manager), headset (operator).
import * as THREE from "three";
import { RoomEnvironment } from "../../vendor/three/RoomEnvironment.js";
import { mergeVertices } from "../../vendor/three/BufferGeometryUtils.js";

const RES = 512, VIEW = 3.75, DIST = 9;   // render size (px), world height the camera frames, camera distance
let renderer, scene, camera;
const CAST = {};

const C = (hex) => new THREE.Color(hex);
const toy = (hex, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: hex, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.2,
  sheen: 0.8, sheenRoughness: 0.45, sheenColor: C(hex).lerp(C(0xffffff), 0.55) }, o));
const ink = () => new THREE.MeshPhysicalMaterial({ color: 0x14162a, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
const WHITE = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
const SPH = new THREE.SphereGeometry(1, 40, 28);

// a sphere pushed towards a rounded box (n > 2), widened towards the bottom (pear), flattened underneath, then scaled
function blob({ sx = 1, sy = 1, sz = 0.92, n = 2, pear = 0.1, flat = 0.72 }) {
  let g = new THREE.SphereGeometry(1, 128, 96);
  g.deleteAttribute("uv"); g.deleteAttribute("normal");
  g = mergeVertices(g);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.multiplyScalar(Math.pow(Math.abs(v.x) ** n + Math.abs(v.y) ** n + Math.abs(v.z) ** n, -1 / n));
    const w = 1 + pear * -v.y; v.x *= w; v.z *= w;
    if (v.y < -flat) v.y = -flat + (v.y + flat) * 0.35;
    p.setXYZ(i, v.x * sx, v.y * sy, v.z * sz);
  }
  g.computeVertexNormals();
  return g;
}

// where a ray from the front (or from above / the side) meets the body
const ray = new THREE.Raycaster();
function hit(body, from, dir) { ray.set(from, dir); const h = ray.intersectObject(body)[0]; return h && { p: h.point.clone(), n: h.face.normal.clone() }; }
const front = (body, x, y) => hit(body, new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1));
const topY = (body, x = 0) => hit(body, new THREE.Vector3(x, 5, 0), new THREE.Vector3(0, -1, 0)).p.y;
const botY = (body) => hit(body, new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 1, 0)).p.y;
const halfW = (body, y) => hit(body, new THREE.Vector3(5, y, 0), new THREE.Vector3(-1, 0, 0)).p.x;
// put obj on the front surface at (x, y), facing out along the surface normal (obj is modelled facing +z)
function stick(obj, body, x, y, lift = 0) { const s = front(body, x, y); obj.position.copy(s.p).addScaledVector(s.n, lift); obj.lookAt(obj.position.clone().add(s.n)); return obj; }

function eye(size = 1) {
  const g = new THREE.Group(), e = new THREE.Mesh(SPH, ink());
  e.scale.set(0.115 * size, 0.165 * size, 0.07 * size); g.add(e);
  [[-0.036, 0.062, 0.044], [0.036, -0.05, 0.02]].forEach(([x, y, r]) => { const h = new THREE.Mesh(SPH, WHITE); h.scale.setScalar(r * size); h.position.set(x * size, y * size, 0.058 * size); g.add(h); });
  return g;
}
function smile(w = 0.075) { const m = new THREE.Mesh(new THREE.TorusGeometry(w, 0.021, 12, 28, Math.PI), ink()); m.rotation.z = Math.PI; const g = new THREE.Group(); g.add(m); return g; }
function cheek() { const m = new THREE.Mesh(SPH, toy(0xff9ec4, { roughness: 0.75, clearcoat: 0, sheen: 0 })); m.scale.set(0.12, 0.07, 0.03); const g = new THREE.Group(); g.add(m); return g; }
const tube = (pts, r, mat) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 32, r, 10), mat);

// body + face (eyes, smile, cheeks) on a face group that turns for the look direction
function character(hex, shape, f = {}) {
  const root = new THREE.Group(), body = new THREE.Mesh(blob(shape), toy(hex));
  root.add(body); body.updateMatrixWorld();
  const face = new THREE.Group(); root.add(face);
  const ex = f.ex || 0.28, ey = f.ey || 0.12, es = f.es || 1.18;
  const eyes = [-1, 1].map((s) => { const e = stick(eye(es), body, s * ex, ey, -0.03); face.add(e); return e; });
  eyes.forEach((e) => (e.userData.s = e.scale.clone()));
  if (f.mouth !== false) face.add(stick(smile(f.mw), body, 0, ey - 0.25, -0.005));
  if (f.cheeks !== false) [-1, 1].forEach((s) => face.add(stick(cheek(), body, s * (ex + 0.21), ey - 0.22, -0.012)));
  const top = topY(body), bot = botY(body);
  return { root, body, face, eyes, top, bot, centre: (top + bot) / 2, extra: {} };
}

function build() {
  // hero: periwinkle gumdrop with an antenna that ends in a little glowing bead
  const hero = character(0x7b8bff, { sx: 0.98, sy: 1.0, pear: 0.14 });
  const ant = new THREE.Group(); ant.position.set(0, hero.top - 0.06, 0); hero.root.add(ant);
  ant.add(tube([[0, 0, 0], [0.04, 0.22, 0], [0.16, 0.44, 0]], 0.034, toy(0x6577f0)));
  const bead = new THREE.Mesh(SPH, toy(0xffd34d, { emissive: 0xffb21a, emissiveIntensity: 0.55, roughness: 0.3, clearcoat: 1, sheen: 0 }));
  bead.scale.setScalar(0.13); bead.position.set(0.17, 0.5, 0); ant.add(bead);
  hero.extra.ant = ant;
  CAST.hero = hero;

  // field rep: wide mint blob in an orange hard hat
  const hh = character(0x3fd6a2, { sx: 1.12, sy: 0.88, pear: 0.12 }, { ey: 0.04, ex: 0.3 });
  const hy = hh.top - 0.34, hr = halfW(hh.body, hy) + 0.05, hat = new THREE.Group(), orange = toy(0xff9a3d, { clearcoat: 0.9 });
  hat.position.set(0, hy, 0); hat.rotation.x = -0.1; hh.root.add(hat);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), orange); dome.scale.set(hr * 0.92, 0.52, hr * 0.9); hat.add(dome);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.06, 64), orange); brim.scale.set(hr * 1.1, 1, hr * 1.12); brim.position.set(0, 0.01, 0.06); hat.add(brim);
  const ridge = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 10, 48, Math.PI), orange); ridge.rotation.y = Math.PI / 2; ridge.scale.set(hr * 0.9, 0.53, 1); hat.add(ridge);
  CAST.hardhat = hh;

  // manager: tall coral pill in round glasses
  const sp = character(0xff7c66, { sx: 0.84, sy: 1.12, n: 2.4, pear: 0.04 }, { ey: 0.2, ex: 0.25, es: 1.05, mw: 0.065 });
  const frame = ink();
  [-1, 1].forEach((s) => sp.face.add(stick(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 12, 48), frame), sp.body, s * 0.25, 0.2, 0.07)));
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.024, 8, 20, Math.PI), frame); sp.face.add(stick(bridge, sp.body, 0, 0.22, 0.1));
  CAST.specs = sp;

  // operator: rounded-square yellow blob in a headset
  const hs = character(0xffc83d, { sx: 1.0, sy: 0.94, n: 2.8, pear: 0.06 }, { ey: 0.1 });
  const by = 0.1, bw = halfW(hs.body, by) + 0.05, dark = toy(0x2b2f52, { clearcoat: 0.8 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 12, 64, Math.PI), dark); band.position.y = by; band.scale.set(bw, (hs.top - by) + 0.07, 1); hs.root.add(band);
  [-1, 1].forEach((s) => { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.16, 32), dark); cup.rotation.z = Math.PI / 2; cup.position.set(s * (bw + 0.02), by, 0); hs.root.add(cup); });
  const tip = front(hs.body, -0.3, -0.32);
  hs.root.add(tube([[-(bw + 0.05), by - 0.05, 0.1], [-(bw - 0.05), -0.25, 0.55], [tip.p.x - 0.04, tip.p.y, tip.p.z + 0.1]], 0.026, dark));
  const mic = new THREE.Mesh(SPH, dark); mic.scale.setScalar(0.07); mic.position.set(tip.p.x, tip.p.y, tip.p.z + 0.11); hs.root.add(mic);
  CAST.headset = hs;

  Object.values(CAST).forEach((c) => { c.root.visible = false; scene.add(c.root); });
}

function init() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1); renderer.setSize(RES, RES, false); renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture; scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8d0ff, 2.2); rim.position.set(3.5, 2.5, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffe6f0, 0.45); fill.position.set(2, -3, 4); scene.add(fill);
  camera = new THREE.PerspectiveCamera((2 * Math.atan(VIEW / 2 / DIST) * 180) / Math.PI, 1, 0.1, 50);
  build();
}

function pose(c, p = {}) {
  c.root.visible = true;
  c.root.position.set(0, -c.centre, 0);
  c.root.rotation.set(p.pitch || 0, p.yaw || 0, p.roll || 0);
  const [lx, ly] = p.look || [0, 0];
  c.face.rotation.set(-ly * 0.2, lx * 0.3, 0);
  const shut = Math.max(0.92 * (p.blink || 0), 0.55 * (p.happy || 0));
  c.eyes.forEach((e) => e.scale.set(e.userData.s.x, e.userData.s.y * (1 - shut), e.userData.s.z));
  if (c.extra.ant) c.extra.ant.rotation.z = p.wob || 0;
}

function draw(ctx, name, p) {
  init();
  const c = CAST[name];
  pose(c, p);
  camera.position.set(0, 0, DIST); camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  c.root.visible = false;
  const cv = ctx.canvas;
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(renderer.domElement, 0, 0, cv.width, cv.height);
}

function icon(name, px, p) {
  const cv = document.createElement("canvas"); cv.width = cv.height = px;
  draw(cv.getContext("2d"), name, p || { look: [0.1, -0.1] });
  return cv.toDataURL("image/png");
}

// half the body's height in view units (the canvas centre is the body's centre), for standing and landing
const half = (name) => { init(); const c = CAST[name]; return (c.top - c.bot) / 2; };

window.Toys = { init, draw, icon, half, VIEW };
