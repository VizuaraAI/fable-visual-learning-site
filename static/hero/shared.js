/* Visual Learning — shared engine for the four hero concepts.
   three.js r128 + UnrealBloom, a small camera director, captions, parallax, auto-scroll. */
window.VL = (() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const smooth = (a, b, t) => { const x = range(t, a, b); return x * x * (3 - 2 * x); };
  const ease = {
    lin: t => t,
    io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    ioq: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    in: t => t * t * t,
    inq: t => t * t,
    out: t => 1 - Math.pow(1 - t, 3),
    outq: t => 1 - (1 - t) * (1 - t),
    sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  };
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- GLSL ---------- */
  const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

  const GLASS_VERT = `
uniform float uTime,uWobble,uWobbleFreq;
varying vec3 vN,vOp,vVp; varying vec2 vUv;
#include <fog_pars_vertex>
${NOISE}
void main(){
  vec3 p=position; vUv=uv;
  if(uWobble>0.0){ float n=snoise(p*uWobbleFreq+vec3(0.0,uTime*0.22,uTime*0.15)); p+=normal*n*uWobble; }
  vOp=p;
  vec4 wp=modelMatrix*vec4(p,1.0);
  vec4 mvPosition=viewMatrix*wp;
  vN=normalize(normalMatrix*normal);
  vVp=mvPosition.xyz;
  gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;

  const GLASS_FRAG = `
uniform vec3 uColor,uRim,uEmissive,uOpenDir,uLightA,uLightB,uLightColA,uLightColB,uHeadCol;
uniform float uAlpha,uRimPow,uOpen,uOpenEdge,uTime,uGlow,uHead,uHeadW,uShade,uSpec,uBack,uFade,uSeg;
varying vec3 vN,vOp,vVp; varying vec2 vUv;
#include <fog_pars_fragment>
${NOISE}
void main(){
  if(uSeg>0.0 && fract(vUv.x*uSeg)>0.84) discard;
  vec3 N=normalize(vN); float bk=1.0; if(!gl_FrontFacing){ N=-N; bk=uBack; }
  vec3 V=normalize(-vVp);
  float ndv=max(dot(N,V),0.0);
  float fres=pow(1.0-ndv,uRimPow)*bk;
  float edge=0.0;
  if(uOpen>0.0){
    float d=dot(normalize(vOp),uOpenDir);
    float e=1.0-uOpen*(1.0-uOpenEdge);
    float nz=snoise(vOp*1.1+vec3(uTime*0.35))*0.045;
    if(d>e+nz) discard;
    edge=smoothstep(e+nz-0.05,e+nz,d);
  }
  vec3 LA=normalize((viewMatrix*vec4(uLightA,0.0)).xyz);
  vec3 LB=normalize((viewMatrix*vec4(uLightB,0.0)).xyz);
  vec3 diff=uLightColA*max(dot(N,LA),0.0)+uLightColB*max(dot(N,LB),0.0)*0.6;
  vec3 H=normalize(LA+V); float spec=pow(max(dot(N,H),0.0),48.0)*uSpec;
  vec3 col=uColor*(0.35+uShade*diff)+uRim*fres+uEmissive+spec*uLightColA;
  col+=uGlow*uRim*1.6;
  if(uHead>=0.0){ float hd=abs(vUv.x-uHead); float h=exp(-hd*hd/(uHeadW*uHeadW)); col+=uHeadCol*h*2.6; }
  col+=edge*vec3(0.55,0.85,1.0);
  float a=uAlpha*mix(0.6,1.0,bk)+fres*(1.0-uAlpha)*0.7+edge*0.6+uGlow*0.3+spec*0.5;
  gl_FragColor=vec4(col,clamp(a,0.0,1.0)*uFade);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
}`;

  function glassMat(o = {}) {
    const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(o.color ?? 0x1d6f7a) },
      uRim: { value: new THREE.Color(o.rim ?? 0x7ce8ff) },
      uEmissive: { value: new THREE.Color(o.emissive ?? 0x000000) },
      uAlpha: { value: o.alpha ?? 0.25 }, uRimPow: { value: o.rimPow ?? 2.5 },
      uWobble: { value: o.wobble ?? 0 }, uWobbleFreq: { value: o.wobbleFreq ?? 0.5 },
      uOpen: { value: 0 }, uOpenEdge: { value: o.openEdge ?? 0.82 }, uOpenDir: { value: new THREE.Vector3(0, 0, 1) },
      uGlow: { value: o.glow ?? 0 }, uShade: { value: o.shade ?? 0.8 }, uSpec: { value: o.spec ?? 0.35 }, uBack: { value: o.back ?? 0.3 }, uFade: { value: 1 }, uSeg: { value: o.seg ?? 0 },
      uLightA: { value: new THREE.Vector3(0.6, 0.8, 0.4) }, uLightB: { value: new THREE.Vector3(-0.7, -0.3, 0.6) },
      uLightColA: { value: new THREE.Color(o.lightA ?? 0xffffff) }, uLightColB: { value: new THREE.Color(o.lightB ?? 0x8090ff) },
      uHead: { value: -1 }, uHeadW: { value: 0.05 }, uHeadCol: { value: new THREE.Color(o.headCol ?? 0xbfffff) },
    }]);
    const m = new THREE.ShaderMaterial({
      uniforms, vertexShader: GLASS_VERT, fragmentShader: GLASS_FRAG,
      transparent: o.opaque ? false : true, depthWrite: o.depthWrite ?? !!o.opaque,
      side: o.side ?? THREE.DoubleSide, fog: true, blending: o.blending ?? THREE.NormalBlending,
    });
    m.u = uniforms;
    return m;
  }

  /* ---------- renderer ---------- */
  function setup(canvas, opt = {}) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !opt.bloom, alpha: false, powerPreference: 'high-performance', stencil: false });
    } catch (e) { return null; }
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = opt.exposure ?? 1.1;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(opt.bg ?? 0x07090f);
    if (opt.fog) scene.fog = new THREE.FogExp2(opt.fog.color, opt.fog.density);
    const camera = new THREE.PerspectiveCamera(opt.fov ?? 50, 1, opt.near ?? 0.05, opt.far ?? 400);
    let composer = null, bloom = null, fxaa = null;
    let maxDpr = opt.dpr ?? 1.5, bloomScale = opt.bloomScale ?? 0.5;
    if (opt.bloom && THREE.EffectComposer) {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(512, 512), opt.bloom.strength ?? 0.8, opt.bloom.radius ?? 0.5, opt.bloom.threshold ?? 0.6);
      composer.addPass(bloom);
      if (THREE.FXAAShader) { fxaa = new THREE.ShaderPass(THREE.FXAAShader); composer.addPass(fxaa); }
      if (THREE.GammaCorrectionShader) composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
    }
    let lastW = 0, lastH = 0;
    function size() {
      const w = canvas.clientWidth || innerWidth || 1280, h = canvas.clientHeight || innerHeight || 720;
      lastW = w; lastH = h;
      const dpr = Math.min(devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (composer) {
        composer.setPixelRatio(dpr); composer.setSize(w, h);
        if (bloom) bloom.setSize(Math.max(64, w * dpr * bloomScale), Math.max(64, h * dpr * bloomScale));
        if (fxaa) fxaa.material.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr));
      }
    }
    size(); addEventListener('resize', size);
    const api = {
      renderer, scene, camera, composer, bloom, size,
      render() { if (canvas.clientWidth && (canvas.clientWidth !== lastW || canvas.clientHeight !== lastH)) size(); composer ? composer.render() : renderer.render(scene, camera); },
      degrade() { maxDpr = 1; bloomScale = 0.35; if (fxaa) fxaa.enabled = false; size(); document.documentElement.classList.add('degraded'); },
    };
    return api;
  }

  /* ---------- camera director ---------- */
  class Director {
    constructor(keys) { this.keys = keys.slice().sort((a, b) => a.t - b.t); this._a = new THREE.Vector3(); this._b = new THREE.Vector3(); }
    static posOf(k, out) {
      if (k.orbit) { const o = k.orbit; out.set(o.c[0] + o.r * Math.sin(o.a), o.c[1] + o.y, o.c[2] + o.r * Math.cos(o.a)); }
      else out.set(k.pos[0], k.pos[1], k.pos[2]);
      return out;
    }
    static lookOf(k, out) { if (k.look) out.set(k.look[0], k.look[1], k.look[2]); else if (k.orbit) out.set(k.orbit.c[0], k.orbit.c[1], k.orbit.c[2]); return out; }
    at(t, out) {
      const k = this.keys; let i = 0;
      while (i < k.length - 2 && t >= k[i + 1].t) i++;
      const a = k[i], b = k[i + 1] || k[i];
      let u = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1; u = clamp(u, 0, 1);
      if (b.cut && u < 1) u = 0;
      const e = ease[b.ease || 'io'](u);
      if (a.orbit && b.orbit) {
        const oa = a.orbit, ob = b.orbit;
        const A = lerp(oa.a, ob.a, e), R = lerp(oa.r, ob.r, e), Y = lerp(oa.y, ob.y, e);
        out.pos.set(lerp(oa.c[0], ob.c[0], e) + R * Math.sin(A), lerp(oa.c[1], ob.c[1], e) + Y, lerp(oa.c[2], ob.c[2], e) + R * Math.cos(A));
      } else {
        Director.posOf(a, this._a); Director.posOf(b, this._b); out.pos.lerpVectors(this._a, this._b, e);
      }
      Director.lookOf(a, this._a); Director.lookOf(b, this._b); out.look.lerpVectors(this._a, this._b, e);
      out.fov = lerp(a.fov ?? 50, b.fov ?? 50, e); out.seg = i; out.u = u; out.e = e;
      return out;
    }
  }

  /* ---------- captions + dots ---------- */
  function captions(container, beats) {
    container.innerHTML = beats.map((b, i) => `<div class="beat" data-i="${i}">${b.kicker ? `<p class="kicker">${b.kicker}</p>` : ''}<h2>${b.title}</h2>${b.body ? `<p>${b.body}</p>` : ''}</div>`).join('');
    const els = [...container.children]; let cur = -1;
    return {
      index(t) { let i = 0; while (i < beats.length - 1 && t >= beats[i + 1].t) i++; return i; },
      update(t) { const i = this.index(t); if (i !== cur) { els.forEach((e, j) => e.classList.toggle('on', j === i)); cur = i; } return i; },
      get current() { return cur; },
    };
  }
  function dots(container, beats, total, onJump) {
    container.innerHTML = beats.map((b, i) => `<button aria-label="${b.title.replace(/"/g, '')}" data-i="${i}"></button>`).join('');
    const els = [...container.children];
    els.forEach((el, i) => el.addEventListener('click', () => onJump && onJump(beats[i].t, i)));
    return {
      update(t) {
        let i = 0; while (i < beats.length - 1 && t >= beats[i + 1].t) i++;
        const end = i < beats.length - 1 ? beats[i + 1].t : total;
        els.forEach((el, j) => { el.classList.toggle('done', j < i); el.classList.toggle('on', j === i); if (j === i) el.style.setProperty('--p', (100 * range(t, beats[i].t, end)).toFixed(1) + '%'); });
      }
    };
  }

  /* ---------- loop with a quality check ---------- */
  function loop(fn, api) {
    let last = performance.now(), n = 0, s = 0, adapted = false;
    function f(now) {
      requestAnimationFrame(f);
      if (document.hidden) { last = now; return; }
      let dt = (now - last) / 1000; last = now; if (dt > 0.1) dt = 0.1;
      n++; if (n > 120 && n <= 300) s += dt;
      if (n === 300 && api && !adapted) { adapted = true; if (s / 180 > 1 / 26) api.degrade(); }
      fn(dt, now / 1000);
    }
    requestAnimationFrame(f);
    return { tick(dt = 0.016, now) { fn(dt, now ?? performance.now() / 1000); } };
  }

  /* ---------- small helpers ---------- */
  function spriteTex(size = 64, hard = 0.25) {
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(hard, 'rgba(255,255,255,.55)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function points(n, fill, opt = {}) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) { const r = fill(i, c); pos[i * 3] = r[0]; pos[i * 3 + 1] = r[1]; pos[i * 3 + 2] = r[2]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; sz[i] = r[3] ?? 1; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTex: { value: opt.tex || spriteTex() }, uSize: { value: opt.size ?? 1 }, uOpacity: { value: opt.opacity ?? 1 }, uTime: { value: 0 } }]),
      vertexShader: `attribute float aSize; varying vec3 vC; varying float vF; uniform float uSize,uTime; ${opt.drift ? 'attribute vec3 aDrift;' : ''}
        #include <fog_pars_vertex>
        void main(){ vC=color; vec3 p=position; ${opt.drift ? 'p+=vec3(sin(uTime*0.7+p.y*0.5),cos(uTime*0.5+p.x*0.4),sin(uTime*0.6+p.z*0.3))*aDrift;' : ''}
          vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=min(aSize*uSize*(${(opt.scale ?? 300).toFixed(1)}/-mv.z),${(opt.maxSize ?? 40).toFixed(1)}); vF=smoothstep(${(opt.nearFade ?? 0.3).toFixed(2)},${((opt.nearFade ?? 0.3) * 6).toFixed(2)},-mv.z);
          #define mvPosition mv
          #include <fog_vertex>
        }`,
      fragmentShader: `uniform sampler2D uTex; uniform float uOpacity; varying vec3 vC; varying float vF;
        #include <fog_pars_fragment>
        void main(){ vec4 t=texture2D(uTex,gl_PointCoord); gl_FragColor=vec4(vC*t.rgb*vF,t.a*uOpacity*vF);
          #include <fog_fragment>
        }`,
      transparent: true, depthWrite: false, blending: opt.blending ?? THREE.AdditiveBlending, vertexColors: true, fog: true,
    });
    if (opt.drift) { const d = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) d[i] = (Math.random() * 2 - 1) * opt.drift; g.setAttribute('aDrift', new THREE.BufferAttribute(d, 3)); }
    const p = new THREE.Points(g, m); p.u = m.uniforms; p.frustumCulled = false; return p;
  }
  function tube(pts, radius, segs = 120, radial = 8, closed = false, tension = 0.5) {
    const curve = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', tension);
    const geo = new THREE.TubeGeometry(curve, segs, radius, radial, closed);
    geo.curve = curve; return geo;
  }
  function fib(n, r = 1) {
    const out = []; const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2; const rad = Math.sqrt(1 - y * y); const th = phi * i; out.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r)); }
    return out;
  }
  function fmtLength(m) {
    const f = (v) => v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2);
    if (m >= 1) return f(m) + ' m';
    if (m >= 1e-2) return f(m * 100) + ' cm';
    if (m >= 1e-3) return f(m * 1e3) + ' mm';
    if (m >= 1e-6) return f(m * 1e6) + ' µm';
    if (m >= 1e-10) return f(m * 1e9) + ' nm';
    return f(m * 1e12) + ' pm';
  }

  /* ---------- mouse parallax ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mouse.on = true; mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });
  function mouseStep(dt) { const k = 1 - Math.exp(-dt * 2.5); mouse.x += (mouse.tx - mouse.x) * k; mouse.y += (mouse.ty - mouse.y) * k; }

  /* ---------- auto-scroll for the scroll-driven pages ---------- */
  function autoScroll(opt) {
    let on = false, raf = 0, y = 0, last = 0, stopped = RM;
    const state = { get on() { return on; } };
    const stop = () => { stopped = true; if (!on) return; on = false; cancelAnimationFrame(raf); document.documentElement.classList.remove('autoscroll'); opt.onStop && opt.onStop(); };
    const step = now => {
      if (!on) return; const dt = Math.min(0.1, (now - last) / 1000); last = now;
      y += opt.speed() * dt; const max = opt.max();
      if (y >= max) { y = max; scrollTo({ top: y, behavior: 'instant' }); on = false; document.documentElement.classList.remove('autoscroll'); opt.onEnd && opt.onEnd(); return; }
      scrollTo({ top: y, behavior: 'instant' }); raf = requestAnimationFrame(step);
    };
    const start = () => { if (on || stopped) return; on = true; y = scrollY; last = performance.now(); document.documentElement.classList.add('autoscroll'); raf = requestAnimationFrame(step); };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => addEventListener(ev, stop, { passive: true }));
    setTimeout(start, opt.delay ?? 1600);
    state.stop = stop; state.start = start;
    return state;
  }

  /* ---------- nav ---------- */
  function nav() {
    const n = document.getElementById('nav'); if (!n) return;
    const f = () => n.classList.toggle('scrolled', scrollY > 24); f(); addEventListener('scroll', f, { passive: true });
    const cur = document.body.dataset.concept; if (cur) n.querySelectorAll('.pill a').forEach(a => a.classList.toggle('on', a.dataset.c === cur));
  }

  return { RM, clamp, lerp, range, smooth, ease, rng, NOISE, glassMat, setup, Director, captions, dots, loop, spriteTex, points, tube, fib, fmtLength, mouse, mouseStep, autoScroll, nav };
})();
