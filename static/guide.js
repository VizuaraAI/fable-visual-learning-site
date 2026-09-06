(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };

  /* active class link */
  $$('.pill a').forEach(a => { if (location.pathname.startsWith(a.getAttribute('href'))) a.classList.add('on'); });

  /* search */
  (function () {
    const input = $('#q'), box = $('#results'); if (!input) return;
    let idx = null, sel = -1;
    const load = () => idx || fetch('/search-index.json').then(r => r.json()).then(j => (idx = j));
    const render = items => {
      sel = -1;
      if (!items.length) { box.innerHTML = '<div class="none">Nothing found. Try a chapter name or a term.</div>'; box.hidden = false; return; }
      box.innerHTML = items.slice(0, 10).map(i => `<a href="${i.u}"><b>${i.t}</b><span>${i.c} · ${i.s}</span></a>`).join(''); box.hidden = false;
    };
    const run = () => {
      const q = input.value.trim().toLowerCase(); if (q.length < 2) { box.hidden = true; return; }
      load().then(list => {
        const toks = q.split(/\s+/);
        const scored = list.map(i => { const hay = (i.t + ' ' + i.c + ' ' + i.s + ' ' + i.k).toLowerCase(); let s = 0; toks.forEach(t => { if (i.t.toLowerCase().includes(t)) s += 3; if (hay.includes(t)) s += 1; }); return [s, i]; }).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).map(x => x[1]);
        render(scored);
      });
    };
    input.addEventListener('input', run); input.addEventListener('focus', () => { load(); if (input.value.trim().length >= 2) run(); });
    input.addEventListener('keydown', e => {
      const items = $$('a', box); if (box.hidden || !items.length) return;
      if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); items.forEach((a, i) => a.classList.toggle('sel', i === sel)); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); items.forEach((a, i) => a.classList.toggle('sel', i === sel)); e.preventDefault(); }
      if (e.key === 'Enter' && sel >= 0) { location.href = items[sel].href; }
      if (e.key === 'Escape') box.hidden = true;
    });
    document.addEventListener('click', e => { if (!e.target.closest('.search')) box.hidden = true; });
  })();

  /* video lightbox */
  (function () {
    const lb = $('#lightbox'), frame = $('#lbframe'), title = $('#lbtitle'); if (!lb) return;
    const open = a => { frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${a.dataset.id}?autoplay=1&rel=0&modestbranding=1" title="${a.dataset.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; title.innerHTML = `<div>${a.dataset.title}</div><span>${a.dataset.meta || ''} · <a href="${a.href}" target="_blank" rel="noopener" style="text-decoration:underline">open on YouTube</a></span>`; lb.hidden = false; document.body.style.overflow = 'hidden'; };
    const close = () => { lb.hidden = true; frame.innerHTML = ''; document.body.style.overflow = ''; };
    document.addEventListener('click', e => { const a = e.target.closest('a.vid-btn'); if (a && !e.metaKey && !e.ctrlKey) { e.preventDefault(); open(a); } });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    $('#lbclose').addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
  })();

  /* TOC active state */
  (function () {
    const links = $$('.toc a'); if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = map.get(e.target.id); if (a) a.classList.add('on'); } }); }, { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((a, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  })();

  /* PYQ filters */
  (function () {
    const chips = $$('.chip-f'); if (!chips.length) return;
    chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.classList.toggle('on', x === c)); const f = c.dataset.f; $$('.pyq-item').forEach(it => it.hidden = f !== 'all' && it.dataset.t !== f); }));
  })();

  /* quiz */
  (function () {
    const box = $('#quizbox'), data = $('#quiz-data'); if (!box || !data) return;
    let QUIZ = []; try { QUIZ = JSON.parse(data.textContent); } catch (e) { return; }
    if (!QUIZ.length) return;
    let i = 0, score = 0;
    const key = 'vl:quiz:' + location.pathname;
    function render() {
      if (i >= QUIZ.length) {
        store.set(key, score + '/' + QUIZ.length);
        box.innerHTML = `<div class="q-head"><span>Result</span><span>${QUIZ.length} questions</span></div><div class="q-done"><div class="big">${score} / ${QUIZ.length}</div><p style="margin:0;color:var(--mute);max-width:40ch">${score === QUIZ.length ? 'Full marks. Move to the board questions above and write two long answers under time.' : score >= QUIZ.length * .7 ? 'Good. Reread the sections behind the questions you missed, then try the board questions.' : 'Go back to the notes for the topics you missed, then take the quiz again before the board questions.'}</p><button class="btn btn-ghost" id="qagain">Try again</button></div>`;
        $('#qagain').addEventListener('click', () => { i = 0; score = 0; render(); }); return;
      }
      const q = QUIZ[i];
      box.innerHTML = `<div class="q-head"><span>Question ${i + 1} of ${QUIZ.length}</span><span>Score ${score}</span></div><div class="q-text">${q.q}</div><div class="opts">${q.options.map((o, k) => `<button class="opt" data-k="${k}"><b>${'abcd'[k]}</b><span>${o}</span></button>`).join('')}</div><div class="fb" id="fb"></div><div class="q-foot"><span class="score">${i} answered</span><button class="btn btn-primary btn-sm" id="qnext" hidden>Next</button></div>`;
      $$('.opt', box).forEach(b => b.addEventListener('click', () => {
        const k = +b.dataset.k; $$('.opt', box).forEach(x => x.disabled = true);
        if (k === q.answer_index) { b.classList.add('ok'); score++; } else { b.classList.add('bad'); $$('.opt', box)[q.answer_index].classList.add('ok'); }
        const fb = $('#fb'); fb.textContent = (k === q.answer_index ? 'Correct. ' : 'Not quite. ') + (q.explanation || ''); fb.classList.add('show');
        const n = $('#qnext'); n.hidden = false; n.textContent = i + 1 < QUIZ.length ? 'Next question' : 'See result'; n.addEventListener('click', () => { i++; render(); });
      }));
    }
    render();
  })();

  /* checklist + done state */
  (function () {
    $$('.chk input').forEach(c => { const k = 'vl:chk:' + c.dataset.k; if (store.get(k) === '1') { c.checked = true; c.parentElement.classList.add('on'); } c.addEventListener('change', () => { c.parentElement.classList.toggle('on', c.checked); c.checked ? store.set(k, '1') : store.del(k); }); });
    const btn = $('#markdone'), state = $('#donestate'); if (btn) {
      const k = 'vl:done:' + btn.dataset.k;
      const paint = () => { const d = store.get(k) === '1'; btn.textContent = d ? 'Marked done · undo' : 'Mark chapter done'; state.textContent = d ? 'This chapter is marked done on this device.' : ''; };
      btn.addEventListener('click', () => { store.get(k) === '1' ? store.del(k) : store.set(k, '1'); paint(); }); paint();
    }
    $$('.chap[data-k]').forEach(a => { if (store.get('vl:done:' + a.dataset.k) === '1') $('.done-badge', a).hidden = false; });
    const p = $('#printbtn'); if (p) p.addEventListener('click', () => { $$('details').forEach(d => d.open = true); print(); });
  })();
})();
