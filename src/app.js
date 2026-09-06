(function(){
'use strict';
document.documentElement.classList.add('js');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

/* ---------------- data ---------------- */
const VIDEOS = [
  ['ggzzmtqGgls','Alcohol, Phenol and Ether','Class 12 · 41 min','{{ASSET:thumb_s_ggzzmtqGgls.jpg}}'],
  ['04PLOCCnJjo','Gravitation','Class 9 · 14 min','{{ASSET:thumb_s_04PLOCCnJjo.jpg}}'],
  ['hRRdT6WURpM','The d- and f-Block Elements','Class 12 · 50 min','{{ASSET:thumb_s_hRRdT6WURpM.jpg}}'],
  ['FAzhttHWaMU','Electrostatic Potential and Capacitance','Class 12 · 57 min','{{ASSET:thumb_s_FAzhttHWaMU.jpg}}'],
  ['Q2E8PGUuONY','Force and Laws of Motion','Class 9 · 13 min','{{ASSET:thumb_s_Q2E8PGUuONY.jpg}}'],
  ['-uXGT0qUArg','Haloalkanes and Haloarenes','Class 12 · 52 min','{{ASSET:thumb_s_-uXGT0qUArg.jpg}}'],
  ['LPjttsaZm5g','Tissues','Class 9 · 16 min','{{ASSET:thumb_s_LPjttsaZm5g.jpg}}'],
  ['9MG4BEEYz-A','How do Organisms Reproduce?','Class 10 · 11 min','{{ASSET:thumb_s_9MG4BEEYz-A.jpg}}'],
  ['xB__6i7q9mE','Acids, Bases and Salts','Class 10 · 14 min','{{ASSET:thumb_s_xB__6i7q9mE.jpg}}'],
  ['x9x53P8iP_g','Chemical Kinetics','Class 12 · 12 min','{{ASSET:thumb_s_x9x53P8iP_g.jpg}}'],
  ['p8W1bJs6Gaw','Electrochemistry','Class 12 · 21 min','{{ASSET:thumb_s_p8W1bJs6Gaw.jpg}}'],
  ['aBEhb3LEYf4','Laws of Motion','Class 11 · 25 min','{{ASSET:thumb_s_aBEhb3LEYf4.jpg}}'],
  ['KtHqOtCVAvc','Work, Energy and Power','Class 11 · 28 min','{{ASSET:thumb_s_KtHqOtCVAvc.jpg}}'],
  ['nN9n3quiJto','Electric Charges and Fields','Class 12 · 35 min','{{ASSET:thumb_s_nN9n3quiJto.jpg}}'],
  ['rMEq31F6kYU','Magnetic Effects of Electric Current','Class 10 · 22 min','{{ASSET:thumb_s_rMEq31F6kYU.jpg}}'],
  ['U8KipTkeH9Q','The Human Eye and the Colourful World','Class 10 · 11 min','{{ASSET:thumb_s_U8KipTkeH9Q.jpg}}'],
  ['PMdicnPf0u8','Electricity','Class 10 · 12 min','{{ASSET:thumb_s_PMdicnPf0u8.jpg}}'],
  ['D6u8ZCRE1iQ','Heredity and Evolution','Class 10 · 16 min','{{ASSET:thumb_s_D6u8ZCRE1iQ.jpg}}'],
  ['itfMRu_P1kw','Electric Motor','Class 10 · 3 min','{{ASSET:thumb_s_itfMRu_P1kw.jpg}}'],
  ['JeYgmeWhHKo','The Human Eye','Class 10 · 3 min','{{ASSET:thumb_s_JeYgmeWhHKo.jpg}}']
];

const CURR = {{CURR}};

const QUIZ = [
  {src:'CBSE 2025',q:'Which one of the following statements is correct? Electric field due to static charges is',
   o:['conservative, and field lines do not form closed loops','conservative, and field lines form closed loops','non-conservative, and field lines do not form closed loops','non-conservative, and field lines form closed loops'],
   a:0,x:'The electrostatic field is conservative: the work done around any closed path is zero. Its field lines begin on positive charges and end on negative ones, so they never close on themselves.'},
  {src:'CBSE 2023',q:'An isolated point charge produces electric field E at a point 3 m away. The distance of the point where the field is E/4 will be',
   o:['2 m','3 m','4 m','6 m'],a:3,x:'E falls off as 1/r². To quarter the field you double the distance: 3 m becomes 6 m.'},
  {src:'CBSE SQP 2021–22',q:'Two charges in a medium of dielectric constant 5, separated by r, experience a force F. The force between them in vacuum at the same distance is',
   o:['5F','F','F/2','F/5'],a:0,x:'In a medium the force drops by the dielectric constant: F(medium) = F(vacuum)/K. With K = 5, the vacuum force is 5F.'},
  {src:'CBSE 2024',q:'An electric dipole of dipole moment p is kept in a uniform electric field E. The work done to rotate it from stable equilibrium to unstable equilibrium is',
   o:['2pE','−2pE','pE','zero'],a:0,x:'U = −pE cos θ. Stable equilibrium is θ = 0 (U = −pE), unstable is θ = 180° (U = +pE). The difference is 2pE.'}
];

/* ---------------- reveal + nav ---------------- */
const rvs = $$('.rv');
if ('IntersectionObserver' in window && !RM) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .06 });
  rvs.forEach(el => io.observe(el));
  setTimeout(() => rvs.forEach(el => el.classList.add('in')), 5000);
} else rvs.forEach(el => el.classList.add('in'));

const nav = $('#nav');
const heroEl = $('#top');
const onScroll = () => { nav.classList.toggle('scrolled', scrollY > 24); nav.classList.toggle('over-hero', !!heroEl && scrollY < heroEl.offsetHeight - 74); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const navLinks = $$('.pill a');
if ('IntersectionObserver' in window) {
  const secs = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -50% 0px' });
  secs.forEach(s => io2.observe(s));
}

/* ---------------- count-up ---------------- */
$$('[data-count]').forEach(el => {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  const fmt = n => n.toLocaleString('en-IN');
  const run = () => {
    if (RM) { el.textContent = fmt(target) + suffix; return; }
    const t0 = performance.now(), dur = 1800;
    const tick = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(target * e)) + suffix; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .5 }); io.observe(el); } else run();
});

/* ---------------- spotlight ---------------- */
$$('.card,.panel').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true }));

/* ---------------- marquee + inline player ---------------- */
const EMBED = (() => { const c = $('#cfg'); return !!c && c.dataset.embed === '1'; })();
function buildMarquee(track, list) {
  const html = list.map(v => `<a class="vid" href="https://www.youtube.com/watch?v=${v[0]}" target="_blank" rel="noopener" data-id="${v[0]}" data-title="${v[1]}" data-meta="${v[2]}" aria-label="${v[1]} on YouTube"><img src="${v[3]}" alt="" loading="lazy" width="400" height="225"><div class="play"><i><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></i></div><div class="cap"><div>${v[1]}</div><span>${v[2]}</span></div></a>`).join('');
  track.innerHTML = html + html;
}
buildMarquee($('#track1'), VIDEOS.slice(0, 10));
buildMarquee($('#track2'), VIDEOS.slice(10));
(function () {
  const lb = $('#lightbox'), frame = $('#lbframe'), title = $('#lbtitle'); if (!lb || !EMBED) return;
  const open = a => {
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${a.dataset.id}?autoplay=1&rel=0&modestbranding=1" title="${a.dataset.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    title.innerHTML = `<div>${a.dataset.title}</div><span>${a.dataset.meta} · <a href="${a.href}" target="_blank" rel="noopener" style="text-decoration:underline">open on YouTube</a></span>`;
    lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbclose').focus();
  };
  const close = () => { lb.hidden = true; frame.innerHTML = ''; document.body.style.overflow = ''; };
  document.addEventListener('click', e => { const a = e.target.closest('a.vid'); if (a && !e.metaKey && !e.ctrlKey) { e.preventDefault(); open(a); } });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  $('#lbclose').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
})();

/* ---------------- curriculum ---------------- */
(function () {
  const tabs = $('#tabs'), rows = $('#rows'); if (!tabs) return;
  Object.keys(CURR).forEach(k => { const c = CURR[k]; const b = document.createElement('button'); b.className = 'tab'; b.dataset.k = k; b.innerHTML = `${c.label} <span>${c.rows.length} chapters</span>`; b.addEventListener('click', () => show(k)); tabs.appendChild(b); });
  const hub = document.createElement('a'); hub.className = 'tab hub-link'; tabs.appendChild(hub);
  function show(k) {
    $$('.tab', tabs).forEach(b => b.classList.toggle('on', b.dataset.k === String(k)));
    const hub = $('.hub-link', tabs); if (hub) { hub.href = `/class-${k}/`; hub.textContent = `All ${CURR[k].label} guides →`; }
    rows.innerHTML = CURR[k].rows.map((r, i) => {
      const m = r[2] || {}; const chips = [];
      if (m.v) chips.push(`<span class="chip c">3D chapter · ${m.v} min</span>`);
      if (m.c) chips.push(`<span class="chip o">${m.c} concept video${m.c > 1 ? 's' : ''}</span>`);
      chips.push(`<span class="chip">Guide →</span>`);
      return `<a class="row" href="${r[3]}" style="animation-delay:${Math.min(i, 14) * 35}ms"><div class="sub">${r[0]}</div><div class="ch">${r[1]}</div><div class="meta">${chips.join('')}</div></a>`;
    }).join('');
  }
  show(10);
})();

/* ---------------- quiz ---------------- */
(function () {
  const box = $('#quiz'); if (!box) return;
  let i = 0, score = 0;
  function render() {
    if (i >= QUIZ.length) {
      box.innerHTML = `<div class="q-head"><span>Result</span><span>${QUIZ.length} questions</span></div><div class="q-done"><div class="big">${score} / ${QUIZ.length}</div><p style="margin:0;color:var(--mute);max-width:36ch">${score === QUIZ.length ? 'All four. The chapter quizzes on the site have many more, with the same instant feedback.' : 'Every quiz on the site works like this: pick, see the reason, move on. The result analysis shows which topics need another look.'}</p><button class="btn btn-ghost" id="qagain">Try again</button></div>`;
      $('#qagain').addEventListener('click', () => { i = 0; score = 0; render(); });
      return;
    }
    const q = QUIZ[i];
    box.innerHTML = `<div class="q-head"><span>Question ${i + 1} of ${QUIZ.length}</span><span class="pyq">${q.src}</span></div><div class="q-text">${q.q}</div><div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}"><b>${'abcd'[k]}</b><span>${o}</span></button>`).join('')}</div><div class="fb" id="fb"></div><div class="q-foot"><span class="score">Score ${score} / ${i}</span><button class="btn btn-primary btn-sm" id="qnext" hidden>Next question</button></div>`;
    $$('.opt', box).forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k; $$('.opt', box).forEach(x => x.disabled = true);
      if (k === q.a) { b.classList.add('ok'); score++; } else { b.classList.add('bad'); $$('.opt', box)[q.a].classList.add('ok'); }
      const fb = $('#fb'); fb.textContent = (k === q.a ? 'Correct. ' : 'Not quite. ') + q.x; fb.classList.add('show');
      $('.score', box).textContent = `Score ${score} / ${i + 1}`;
      const n = $('#qnext'); n.hidden = false; n.textContent = i + 1 < QUIZ.length ? 'Next question' : 'See result'; n.addEventListener('click', () => { i++; render(); });
    }));
  }
  render();
})();

/* ---------------- plans ---------------- */
$$('.plan[data-max]').forEach(plan => {
  const max = +plan.dataset.max, chips = $$('.chips button', plan), pick = $('.pick', plan), btn = $('.btn', plan);
  const sel = new Set();
  const update = () => {
    chips.forEach(c => { c.classList.toggle('on', sel.has(c.textContent)); c.disabled = !sel.has(c.textContent) && sel.size >= max; });
    const list = [...sel].sort().map(n => 'Class ' + n);
    if (!sel.size) { pick.textContent = `Select ${max} class${max > 1 ? 'es' : ''} (0/${max})`; btn.textContent = plan.dataset.cta; }
    else { pick.textContent = `${list.join(' + ')} (${sel.size}/${max})`; btn.textContent = sel.size === max ? `Continue with ${list.join(' & ')}` : `Pick ${max - sel.size} more`; }
  };
  chips.forEach(c => c.addEventListener('click', () => { const n = c.textContent; if (sel.has(n)) sel.delete(n); else if (sel.size < max) sel.add(n); update(); }));
  update();
});

/* ---------------- lesson: electric motor ---------------- */
function motorLesson() {
  const canvas = $('#motor-canvas'); if (!canvas || !window.THREE) return;
  const player = canvas.parentElement, hud = $('#hud'), capbox = $('#capbox'), endcard = $('#endcard'), startcard = $('#startcard');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#3b4352');
  const cam = new THREE.PerspectiveCamera(32, 16 / 9, .1, 100);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const HOME = V(1.0, 1.9, 5.7), HOME_LOOK = V(0, -.15, -.3);
  const COMM = V(2.6, 1.4, -4.4), COMM_LOOK = V(0, -.3, -1.4);
  let camGoal = HOME.clone(), lookGoal = HOME_LOOK.clone(); const camPos = HOME.clone(), lookPos = HOME_LOOK.clone();
  scene.add(new THREE.HemisphereLight(0xe3ebff, 0x1a1f2a, .95));
  const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(4, 6, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fc9ff, .5); fill.position.set(-5, 2, -4); scene.add(fill);
  const steel = new THREE.MeshStandardMaterial({ color: 0xb7bdc8, metalness: .85, roughness: .35 });
  const mkTex = dash => { const c = document.createElement('canvas'); c.width = 256; c.height = 8; const g = c.getContext('2d'); g.fillStyle = '#b8763a'; g.fillRect(0, 0, 256, 8); if (dash) { g.fillStyle = '#e9fbff'; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 13, 8); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const coilPlain = mkTex(false), coilDash = mkTex(true); coilPlain.repeat.set(72, 1); coilDash.repeat.set(72, 1);
  const wirePlainL = mkTex(false), wireDashL = mkTex(true), wirePlainR = mkTex(false), wireDashR = mkTex(true);
  [wirePlainL, wireDashL, wirePlainR, wireDashR].forEach(t => t.repeat.set(26, 1));
  const coilMat = new THREE.MeshStandardMaterial({ map: coilPlain, metalness: .45, roughness: .45 });
  const wireMatL = new THREE.MeshStandardMaterial({ map: wirePlainL, metalness: .45, roughness: .45 });
  const wireMatR = new THREE.MeshStandardMaterial({ map: wirePlainR, metalness: .45, roughness: .45 });
  const rotor = new THREE.Group(); scene.add(rotor);
  const W = 1.05, H = .8;
  const A = V(-W, 0, -H), B = V(-W, 0, H), C = V(W, 0, H), D = V(W, 0, -H);
  const rounded = seq => { const out = [seq[0]]; for (let i = 1; i < seq.length - 1; i++) { const p = seq[i]; const a = seq[i - 1].clone().sub(p).normalize().multiplyScalar(.09).add(p), b = seq[i + 1].clone().sub(p).normalize().multiplyScalar(.09).add(p); out.push(a, b); } out.push(seq[seq.length - 1]); return new THREE.CatmullRomCurve3(out, false, 'centripetal', .5); };
  const coilCurve = rounded([V(-.13, 0, -1.34), V(-.13, 0, -H), A, B, C, D, V(.13, 0, -H), V(.13, 0, -1.34)]);
  rotor.add(new THREE.Mesh(new THREE.TubeGeometry(coilCurve, 700, .038, 10, false), coilMat));
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, 3.7, 24), steel); axle.rotation.x = Math.PI / 2; axle.position.z = -.6; rotor.add(axle);
  const gap = .26, ringZ = -1.42;
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xc78a4c, metalness: .6, roughness: .35 });
  const halfP = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .42, 32, 1, false, -Math.PI / 2 - (Math.PI - gap) / 2, Math.PI - gap), ringMat);
  const halfQ = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .42, 32, 1, false, Math.PI / 2 - (Math.PI - gap) / 2, Math.PI - gap), ringMat);
  [halfP, halfQ].forEach(h => { h.rotation.x = Math.PI / 2; h.position.z = ringZ; rotor.add(h); });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .44, 24), new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: .8 })); core.rotation.x = Math.PI / 2; core.position.z = ringZ; rotor.add(core);
  const brushMat = new THREE.MeshStandardMaterial({ color: 0x23262c, roughness: .9 });
  [-1, 1].forEach(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(.16, .22, .26), brushMat); b.position.set(s * .34, 0, ringZ); scene.add(b); });
  const wireL = rounded([V(-.32, -1.35, ringZ), V(-.98, -1.35, ringZ), V(-.98, 0, ringZ), V(-.42, 0, ringZ)]);
  const wireR = rounded([V(.42, 0, ringZ), V(.98, 0, ringZ), V(.98, -1.35, ringZ), V(.32, -1.35, ringZ)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireL, 200, .03, 8, false), wireMatL));
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireR, 200, .03, 8, false), wireMatR));
  const batt = new THREE.Group();
  const bBody = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .62, 28), new THREE.MeshStandardMaterial({ color: 0x1f2a3a, metalness: .3, roughness: .5 })); bBody.rotation.z = Math.PI / 2; batt.add(bBody);
  const bCap = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .08, 16), new THREE.MeshStandardMaterial({ color: 0xd9dde5, metalness: .8, roughness: .3 })); bCap.rotation.z = Math.PI / 2; bCap.position.x = -.35; batt.add(bCap);
  const bBand = new THREE.Mesh(new THREE.CylinderGeometry(.172, .172, .18, 28), new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: .6 })); bBand.rotation.z = Math.PI / 2; bBand.position.x = -.18; batt.add(bBand);
  batt.position.set(0, -1.35, ringZ); scene.add(batt);
  const fieldG = new THREE.Group();
  [-.8, -.4, 0, .4, .8].forEach(y => [-.55, 0, .55].forEach(z => {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-1.44, y, z), V(1.44, y, z)]), new THREE.LineDashedMaterial({ color: 0x7fe9ff, dashSize: .12, gapSize: .08, transparent: true, opacity: .6 })); l.computeLineDistances(); fieldG.add(l);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.045, .15, 10), new THREE.MeshBasicMaterial({ color: 0x7fe9ff })); cone.rotation.z = -Math.PI / 2; cone.position.set(.32, y, z); fieldG.add(cone);
  }));
  fieldG.visible = false; scene.add(fieldG);
  const shoe = (sign, color) => {
    const R1 = 1.5, R2 = 1.72, len = 1.3, a = sign < 0 ? Math.PI : 0;
    const s = new THREE.Shape(); s.absarc(0, 0, R2, a - len / 2, a + len / 2, false); s.absarc(0, 0, R1, a + len / 2, a - len / 2, true);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: false, curveSegments: 40 }); g.translate(0, 0, -.8);
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xaeb4bf, metalness: .7, roughness: .4 })));
    const face = new THREE.Mesh(new THREE.CylinderGeometry(R1 - .012, R1 - .012, 1.6, 40, 1, true, (sign < 0 ? -Math.PI / 2 : Math.PI / 2) - len / 2, len), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: .55 }));
    face.rotation.x = Math.PI / 2; grp.add(face); return grp;
  };
  scene.add(shoe(-1, 0xc8232c)); scene.add(shoe(1, 0x1e4fd1));
  const arrowL = new THREE.ArrowHelper(V(0, 1, 0), V(0, 0, 0), .8, 0xffffff, .22, .13), arrowR = new THREE.ArrowHelper(V(0, -1, 0), V(0, 0, 0), .8, 0xffffff, .22, .13);
  arrowL.visible = arrowR.visible = false; scene.add(arrowL, arrowR);

  /* labels */
  const labels = [];
  const mkLabel = (text, pos, opts) => { const el = document.createElement('div'); el.className = 'lbl' + (opts.cls ? ' ' + opts.cls : ''); el.textContent = text; hud.appendChild(el); const L = { el, pos, local: !!opts.local, off: opts.off || V(0, 0, 0), key: opts.key || text }; labels.push(L); return L; };
  mkLabel('A', A, { local: true, off: V(-.16, .12, -.1), key: 'A' }); mkLabel('B', B, { local: true, off: V(-.16, .12, .1), key: 'B' });
  mkLabel('C', C, { local: true, off: V(.16, .12, .1), key: 'C' }); mkLabel('D', D, { local: true, off: V(.16, .12, -.1), key: 'D' });
  mkLabel('N', V(-1.95, 1.05, 0), { cls: 'pole', key: 'N' }); mkLabel('S', V(1.95, 1.05, 0), { cls: 'pole', key: 'S' });
  mkLabel('Brush X', V(-.62, .28, ringZ), { cls: 'small', key: 'BX' }); mkLabel('Brush Y', V(.62, .28, ringZ), { cls: 'small', key: 'BY' });
  mkLabel('Split ring', V(0, -.5, ringZ - .2), { cls: 'small', key: 'SR' }); mkLabel('Battery', V(0, -1.72, ringZ), { cls: 'small', key: 'BAT' });
  mkLabel('Magnetic field B', V(0, 1.22, .3), { cls: 'small', key: 'FIELD' });
  const fL = mkLabel('F', V(0, 0, 0), { cls: 'f', key: 'FL' }), fR = mkLabel('F', V(0, 0, 0), { cls: 'f', key: 'FR' });
  const showLabels = keys => labels.forEach(l => l.el.classList.toggle('show', keys.includes(l.key)));

  /* script */
  const STEPS = [
    { at: 0, en: 'This is a rectangular coil ABCD. It sits between the north and south poles of a magnet, so a magnetic field runs across it from N to S.', hi: 'Yeh ek rectangular coil ABCD hai. Yeh magnet ke North aur South pole ke beech rakhi hai, isliye magnetic field iske aar-paar N se S ki taraf chalti hai.',
      enter() { fieldG.visible = true; showLabels(['A', 'B', 'C', 'D', 'N', 'S', 'FIELD']); camGoal = HOME.clone(); lookGoal = HOME_LOOK.clone(); } },
    { at: 9, en: 'The two ends of the coil are joined to a split ring. Two brushes, X and Y, press on the ring and connect it to a battery. Current comes in at X and flows through A, B, C and D.', hi: 'Coil ke dono ends ek split ring se jude hain. Do brushes, X aur Y, ring par dabti hain aur use battery se jodti hain. Current X se andar aata hai aur A, B, C, D se hokar behta hai.',
      enter() { current = true; showLabels(['A', 'B', 'C', 'D', 'BX', 'BY', 'SR', 'BAT']); camGoal = V(3.2, 1.4, -3.2); lookGoal = V(0, -.5, -1.1); } },
    { at: 19, en: 'Arm AB carries current one way and arm CD the other way. In the same field, AB is pushed up and CD is pushed down. Fleming’s left-hand rule gives the directions.', hi: 'Arm AB mein current ek taraf hai aur arm CD mein doosri taraf. Same field mein AB upar dhakela jaata hai aur CD neeche. Direction Fleming ke left-hand rule se milti hai.',
      enter() { forces = true; showLabels(['A', 'B', 'C', 'D', 'N', 'S', 'FL', 'FR']); camGoal = HOME.clone(); lookGoal = HOME_LOOK.clone(); } },
    { at: 28, en: 'Two equal forces in opposite directions make a couple, and the coil starts to turn about its axle.', hi: 'Do barabar aur opposite forces ek couple banati hain, aur coil apne axle ke around ghoomne lagti hai.',
      enter() { omegaGoal = 1.0; } },
    { at: 35, en: 'After half a turn the split ring swaps brushes. The current in the coil reverses, so the arm on the left is always pushed up, and the coil keeps turning the same way.', hi: 'Aadhe chakkar ke baad split ring brushes badal leti hai. Coil ka current ulta ho jaata hai, isliye left wala arm hamesha upar dhakela jaata hai, aur coil usi direction mein ghoomti rehti hai.',
      enter() { omegaGoal = .75; camGoal = COMM.clone(); lookGoal = COMM_LOOK.clone(); showLabels(['A', 'B', 'C', 'D', 'BX', 'BY', 'SR', 'FL', 'FR']); } },
    { at: 46, en: 'That is an electric motor: electrical energy in, rotation out.', hi: 'Yahi electric motor hai: electrical energy andar, rotation bahar.',
      enter() { omegaGoal = 2.8; camGoal = HOME.clone(); lookGoal = HOME_LOOK.clone(); showLabels(['A', 'B', 'C', 'D', 'N', 'S']); } },
    { at: 52, end: true }
  ];
  const stepsEl = $('#steps'); STEPS.slice(0, -1).forEach(() => { const b = document.createElement('b'); b.innerHTML = '<i></i>'; stepsEl.appendChild(b); });
  const bars = $$('i', stepsEl);

  /* state */
  let theta = 0, omega = 0, omegaGoal = 0, current = false, forces = false, dashOff = 0, wireOff = 0;
  let playing = false, clock = 0, stepIdx = -1, lang = 'en', narrate = true, ended = false;
  /* narration: clips voiced with the channel's ElevenLabs voice (static/hero/narration), with the step timing following the clips */
  const BASE_AT = STEPS.map(s => s.at);
  const NARR = { base: '/hero/narration/', man: null, clips: {}, loading: null, cur: null };
  const loadNarration = () => { if (!NARR.loading) NARR.loading = fetch(NARR.base + 'manifest.json').then(r => r.ok ? r.json() : null).then(m => { NARR.man = m; if (m) for (let i = 0; i < 6; i++) clipFor(lang, i); }).catch(() => { NARR.man = null; }); return NARR.loading; };
  const clipFor = (l, i) => { const k = l + i; if (!NARR.clips[k]) { const a = new Audio(NARR.base + `motor-${l}-${i}.mp3`); a.preload = 'auto'; NARR.clips[k] = a; } return NARR.clips[k]; };
  const clipDur = (l, i) => NARR.man && NARR.man[l] && NARR.man[l][i] ? NARR.man[l][i] : 0;
  const stopNarration = () => { if (NARR.cur) { NARR.cur.pause(); NARR.cur.currentTime = 0; NARR.cur = null; } };
  const layout = from => { for (let i = Math.max(0, from); i < STEPS.length - 1; i++) { const base = BASE_AT[i + 1] - BASE_AT[i]; const d = narrate ? Math.max(base, clipDur(lang, i) + 1.0) : base; STEPS[i + 1].at = STEPS[i].at + d; } };
  const speak = i => { stopNarration(); if (!narrate || !NARR.man || i < 0 || STEPS[i].end) return; const a = clipFor(lang, i); NARR.cur = a; a.currentTime = 0; a.play().catch(() => { }); };
  const reset = () => {
    theta = 0; omega = 0; omegaGoal = 0; current = false; forces = false; clock = 0; stepIdx = -1; ended = false;
    fieldG.visible = false; arrowL.visible = arrowR.visible = false; showLabels(['A', 'B', 'C', 'D']);
    capbox.classList.remove('show'); capbox.textContent = ''; endcard.classList.remove('show');
    camGoal = HOME.clone(); lookGoal = HOME_LOOK.clone(); bars.forEach(b => b.style.transform = 'scaleX(0)');
    stopNarration(); STEPS.forEach((st, i) => st.at = BASE_AT[i]); layout(0);
  };
  reset();
  const playBtn = $('#playbtn');
  const setPlaying = p => { playing = p; playBtn.textContent = p ? 'Pause' : 'Play'; playBtn.classList.toggle('on', p); startcard.classList.toggle('hide', p || clock > 0); if (NARR.cur) { if (p) NARR.cur.play().catch(() => { }); else NARR.cur.pause(); } };
  const enterStep = i => {
    stepIdx = i; const s = STEPS[i];
    if (s.end) { ended = true; stopNarration(); capbox.classList.remove('show'); endcard.classList.add('show'); setPlaying(false); return; }
    s.enter(); capbox.classList.add('show'); speak(i);
  };
  const start = () => loadNarration().then(() => { if (ended) reset(); if (clock === 0) layout(0); setPlaying(true); });
  $('#bigplay').addEventListener('click', start);
  playBtn.addEventListener('click', () => { if (playing) setPlaying(false); else start(); });
  const replay = () => loadNarration().then(() => { reset(); setPlaying(true); });
  $('#replay').addEventListener('click', replay); $('#replay2').addEventListener('click', replay);
  $$('#langseg button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; $$('#langseg button').forEach(x => x.classList.toggle('on', x === b)); loadNarration().then(() => { for (let i = 0; i < 6; i++) clipFor(lang, i); layout(stepIdx); if (stepIdx >= 0 && !STEPS[stepIdx].end) { capbox.textContent = STEPS[stepIdx][lang]; if (playing) speak(stepIdx); } }); }));
  const narBtn = $('#narrate');
  narBtn.addEventListener('click', () => { narrate = !narrate; narBtn.textContent = narrate ? 'Narration on' : 'Narration off'; narBtn.classList.toggle('on', narrate); loadNarration().then(() => { layout(stepIdx); if (narrate && playing && stepIdx >= 0 && !STEPS[stepIdx].end) speak(stepIdx); }); if (!narrate) stopNarration(); });

  /* frame */
  const v = new THREE.Vector3(), w2 = new THREE.Vector3();
  const place = L => { v.copy(L.pos).add(L.off); if (L.local) rotor.localToWorld(v); v.project(cam); L.el.style.transform = `translate(${(v.x * .5 + .5) * player.clientWidth}px,${(-v.y * .5 + .5) * player.clientHeight}px) translate(-50%,-50%)`; };
  const resize = () => { const w = player.clientWidth || 16, h = player.clientHeight || 9; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(player); resize();
  let visible = true; new IntersectionObserver(es => { visible = es[0].isIntersecting; if (!visible && playing) setPlaying(false); }, { threshold: .15 }).observe(player);
  let last = performance.now(), tt = 0;
  const frame = (now, force) => {
    if (!visible && !force) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; tt += dt;
    if (playing) {
      clock += dt;
      let idx = 0; for (let i = 0; i < STEPS.length; i++) if (clock >= STEPS[i].at) idx = i;
      if (idx !== stepIdx) enterStep(idx);
      if (stepIdx >= 0 && !STEPS[stepIdx].end) { const s = STEPS[stepIdx]; const full = s[lang]; const cd = narrate ? clipDur(lang, stepIdx) : 0; const rate = cd > 0 ? full.length / cd : 34; const n = Math.min(full.length, Math.floor((clock - s.at) * rate)); capbox.textContent = full.slice(0, n); }
      bars.forEach((b, i) => { const s = STEPS[i], e = STEPS[i + 1].at; b.style.transform = `scaleX(${Math.max(0, Math.min(1, (clock - s.at) / (e - s.at)))})`; });
    }
    omega += (omegaGoal - omega) * (1 - Math.exp(-dt * 1.2));
    if (playing || omega > .001) theta += omega * dt * (playing ? 1 : 0);
    rotor.rotation.z = -theta;
    const cosT = Math.cos(theta), contact = Math.abs(cosT) > .1;
    if (current) {
      if (contact) dashOff -= (cosT > 0 ? 1 : -1) * dt * 1.15;
      wireOff -= dt * 1.15;
      coilDash.offset.x = dashOff; wireDashL.offset.x = wireOff; wireDashR.offset.x = wireOff;
      if (coilMat.map !== coilDash) { coilMat.map = coilDash; wireMatL.map = wireDashL; wireMatR.map = wireDashR; coilMat.needsUpdate = wireMatL.needsUpdate = wireMatR.needsUpdate = true; }
    } else if (coilMat.map !== coilPlain) { coilMat.map = coilPlain; wireMatL.map = wirePlainL; wireMatR.map = wirePlainR; coilMat.needsUpdate = wireMatL.needsUpdate = wireMatR.needsUpdate = true; }
    rotor.updateMatrixWorld();
    if (forces) {
      const showF = contact;
      [[arrowL, V(-W, 0, 0), fL], [arrowR, V(W, 0, 0), fR]].forEach(([arr, local, lab]) => {
        rotor.localToWorld(w2.copy(local)); const up = w2.x < 0; arr.position.copy(w2); arr.setDirection(V(0, up ? 1 : -1, 0)); arr.visible = showF;
        lab.pos.copy(w2); lab.pos.y += up ? .98 : -.98; lab.el.classList.toggle('show', showF && (stepIdx === 2 || stepIdx === 3 || stepIdx === 4));
      });
    }
    const k = 1 - Math.exp(-dt * 1.6); camPos.lerp(camGoal, k); lookPos.lerp(lookGoal, k);
    cam.position.copy(camPos); cam.position.y += Math.sin(tt * .5) * .04; cam.position.x += Math.sin(tt * .33) * .05; cam.lookAt(lookPos);
    labels.forEach(place);
    renderer.render(scene, cam);
  };
  const loop = now => { requestAnimationFrame(loop); frame(now, false); };
  requestAnimationFrame(loop);
  /* debug hooks: render a given moment of the lesson into a 2D canvas (used for review, harmless in production) */
  window.__vl = {
    seek(t) {
      reset(); clock = t; let idx = 0; for (let i = 0; i < STEPS.length; i++) if (t >= STEPS[i].at) idx = i;
      for (let i = 0; i <= idx; i++) { stepIdx = i; const s = STEPS[i]; if (s.end) { ended = true; endcard.classList.add('show'); } else s.enter(); }
      theta = idx >= 3 ? (t - 28) * .9 : 0; omega = omegaGoal; camPos.copy(camGoal); lookPos.copy(lookGoal);
      if (stepIdx >= 0 && !STEPS[stepIdx].end) { capbox.classList.add('show'); capbox.textContent = STEPS[stepIdx][lang]; }
    },
    shot(ctx, dx, dy, dw, dh) {
      resize(); frame(performance.now(), true); ctx.drawImage(canvas, dx, dy, dw, dh);
      const sx = dw / (player.clientWidth || 1), sy = dh / (player.clientHeight || 1);
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      labels.forEach(L => { if (!L.el.classList.contains('show')) return; const m = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(L.el.style.transform); if (!m) return; ctx.fillStyle = L.el.classList.contains('f') || L.el.classList.contains('pole') ? '#fff' : '#5fe0ff'; ctx.fillText(L.el.textContent, dx + (+m[1]) * sx, dy + (+m[2]) * sy + 5); });
      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(9,17,28,.9)'; ctx.fillRect(dx + 10, dy + dh - 30, dw - 20, 22); ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.fillText(capbox.textContent.slice(0, 110), dx + 14, dy + dh - 14);
    }
  };
}

if (window.THREE) { motorLesson(); }
else { addEventListener('load', () => { if (window.THREE) { motorLesson(); } }); }
})();
