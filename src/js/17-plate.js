/* ───────── plate: the Superhuman texture, in the palette of the chart's strongest element (--plate-* in 05-hero.css) ───────── */
(() => {
  const canvas = $('#plate'),
    gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime, uDpr; uniform vec3 uC[5]; uniform vec3 uHi;
out vec4 o;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1. + 2. * fract(sin(p) * 43758.5453123); }
float h1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p), u = f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(dot(h2(i), f), dot(h2(i+vec2(1,0)), f-vec2(1,0)), u.x), mix(dot(h2(i+vec2(0,1)), f-vec2(0,1)), dot(h2(i+vec2(1,1)), f-vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float a=.5, s=0., n=0.; mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for (int i=0;i<3;i++){ float w = clamp(2.6-float(i),0.,1.); s += a*w*noise(p); n += a*w; p = m*p; a *= .5; } return s/max(n,1e-3); }
vec3 ramp(float t){ t = clamp(t,0.,1.)*4.; vec3 c = mix(uC[0],uC[1],smoothstep(0.,1.,t)); c = mix(c,uC[2],smoothstep(1.,2.,t)); c = mix(c,uC[3],smoothstep(2.,3.,t)); return mix(c,uC[4],smoothstep(3.,4.,t)); }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes) / uRes.y; float t = uTime;
  vec2 q = rot(radians(-24.)) * p; q.x /= 3.2; q = q*.85*2. + 7.3;
  vec2 w1 = vec2(fbm(q+vec2(0.,.11*t)), fbm(q+vec2(5.2,1.3)-.08*t));
  vec2 w2 = vec2(fbm(q+1.9*w1+vec2(1.7,9.2)+.05*t), fbm(q+1.9*w1+vec2(8.3,2.8)-.06*t));
  float f = fbm(q+1.9*w2)*.5+.5; f = clamp((f-.5)*.95*1.6+.5,0.,1.);
  vec3 col = ramp(f);
  float ridge = abs(sin(3.14159*(f*1.6+length(w2)*.9))); col = mix(col, uHi, pow(1.-ridge,8.)*smoothstep(.25,.75,f)*.2);
  col += (vec3(.02,-.01,.03)*w1.x + vec3(-.02,.015,.01)*w2.y)*.8;
  vec2 hp = rot(radians(45.)) * (gl_FragCoord.xy/uDpr); float d = abs(fract(hp.x/7.)-.5)*7.;
  float spots = smoothstep(.42,.62, fbm(p*1.1+vec2(3.1,7.4)+.02*t)*.5+.5);
  col = mix(col, vec3(1.), (1.-smoothstep(.2,.9,d))*spots*.06);
  col += (h1(gl_FragCoord.xy + fract(t*7.)*91.) - .5)*.035;
  o = vec4(clamp(col,0.,1.),1.);
}`;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRes', 'uTime', 'uDpr', 'uC', 'uHi'].forEach((n) => {
    U[n] = gl.getUniformLocation(prog, n);
  });
  const rgb = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const tok = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  gl.uniform3fv(U.uC, [0, 1, 2, 3, 4].map((i) => tok('--plate-' + i)).flatMap(rgb));
  gl.uniform3fv(U.uHi, rgb(tok('--plate-hi')));
  // the texture is soft noise: a 0.75× buffer upscaled is indistinguishable, and it drifts slowly enough for ~30fps
  let dpr = 0.75,
    time = 3,
    last = performance.now(),
    visible = true,
    raf = 0,
    sizeT = 0;
  const size = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * dpr));
    canvas.height = Math.max(2, Math.round(r.height * dpr));
    draw();
  };
  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uDpr, dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => {
    raf = 0;
    if (now - last >= 32) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt * 0.12;
      draw();
    }
    if (visible && !RM) raf = requestAnimationFrame(loop);
  };
  // while the rail pushes the page (or the window drags), CSS stretches the old buffer; reallocate once it settles
  size();
  new ResizeObserver(() => {
    clearTimeout(sizeT);
    sizeT = setTimeout(size, 140);
  }).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !RM && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && !RM && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  });
})();
