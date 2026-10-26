// Background for the brand story: big soft glows that drift (organic edges from a domain warp), an optional blurred
// light ring, in two palettes (dark navy / light ice) mixed per pixel by a circular wipe, so a scene can flip from dark
// to light from a point (the spark). Pure function of the uniforms.
"use strict";

const Background = (() => {
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uT, uDark;
uniform vec4 uB[4];      // blobs: x, y (shader space), radius, intensity
uniform vec4 uRing;      // ring: x, y, radius, intensity
uniform vec4 uWipe;      // x, y, radius, softness (light inside when uIn = 1)
uniform vec2 uMode;      // (mode outside the wipe, mode inside): 0 dark, 1 light
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3. - 2.*f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a*noise(p); p = p*2.03 + 7.1; a *= .5; } return v; }
float blob(vec2 p, vec4 b){ vec2 d = p - b.xy; return b.w*exp(-dot(d, d)/(b.z*b.z)); }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec2 q = p + .07*vec2(fbm(p*2.2 + vec2(0., uT*.06)) - .5, fbm(p*2.2 + vec2(5.2, -uT*.05)) - .5);
  float b0 = blob(q, uB[0]), b1 = blob(q, uB[1]), b2 = blob(q, uB[2]), b3 = blob(q, uB[3]);
  float rd = length(q - uRing.xy) - uRing.z; float ring = uRing.w*exp(-rd*rd/.004);   // a thick, soft ring of light
  // dark: navy base, periwinkle / deep / mint / soft glows
  vec3 peri = vec3(.376, .471, .925), deep = vec3(.290, .357, .816), mint = vec3(.169, .710, .580), soft = vec3(.561, .627, .961);
  vec3 dk = mix(vec3(.012, .020, .060), vec3(.030, .043, .115), smoothstep(0., 1., uv.y));
  dk += peri*b0*.62 + mint*b1*.42 + deep*b2*.55 + soft*b3*.42 + mix(peri, mint, .35)*ring*.8;
  float vig = smoothstep(1.35, .25, length((uv - .5)*vec2(1.2, 1.)));
  dk *= mix(.45, 1., vig);
  // light: ice base, pale periwinkle / mint / lilac tints, white highlight
  vec3 lt = mix(vec3(.925, .937, .992), vec3(.965, .972, 1.), smoothstep(0., 1., uv.y));
  lt = mix(lt, vec3(.80, .84, 1.), clamp(b0*.75, 0., 1.));
  lt = mix(lt, vec3(.80, .94, .89), clamp(b1*.7, 0., 1.));
  lt = mix(lt, vec3(.87, .85, .99), clamp(b2*.7, 0., 1.));
  lt = mix(lt, vec3(1., 1., 1.), clamp(b3*.8, 0., 1.));
  lt = mix(lt, vec3(.72, .78, 1.), clamp(ring*.6, 0., 1.));
  float inside = smoothstep(uWipe.z + uWipe.w, uWipe.z - uWipe.w, length(p - uWipe.xy));
  float m = mix(uMode.x, uMode.y, inside);
  vec3 col = mix(dk, lt, m);
  col *= 1. - uDark;
  gl_FragColor = vec4(col, 1.);
}`;
  let gl, U = {};

  function init(canvas) {
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uRes", "uT", "uDark", "uB", "uRing", "uWipe", "uMode"]) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
  }

  // stage px → shader space
  const X = (x) => (x - 960) / 1080, Y = (y) => (540 - y) / 1080, R = (r) => r / 1080;

  // s: {blobs: [[x, y, r, k] × 4] (stage px), ring: [x, y, r, k], wipe: [x, y, r, soft], mode: [outside, inside], dark}
  function draw(t, s) {
    gl.uniform1f(U.uT, t); gl.uniform1f(U.uDark, s.dark);
    const b = new Float32Array(16);
    s.blobs.forEach(([x, y, r, k], i) => b.set([X(x), Y(y), R(r), k], i * 4));
    gl.uniform4fv(U.uB, b);
    const [rx, ry, rr, rk] = s.ring; gl.uniform4f(U.uRing, X(rx), Y(ry), R(rr), rk);
    const [wx, wy, wr, ws] = s.wipe; gl.uniform4f(U.uWipe, X(wx), Y(wy), R(wr), R(ws));
    gl.uniform2f(U.uMode, s.mode[0], s.mode[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  return { init, draw };
})();
