/* Visual Learning — light/dark theme. Light is the default; the choice is remembered per browser.
   The switch is a circular reveal from the toggle (View Transitions API) with a plain fade as the fallback. */
(() => {
  const KEY = 'vl-theme', root = document.documentElement;
  const get = () => root.dataset.theme === 'dark' ? 'dark' : 'light';
  function apply(t) {
    root.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch (e) { }
    document.querySelectorAll('.tt').forEach(b => { b.setAttribute('aria-pressed', t === 'dark'); b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); b.title = b.getAttribute('aria-label'); });
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#07090f' : '#f5f3ec');
  }
  async function toggle(ev) {
    const next = get() === 'dark' ? 'light' : 'dark';
    const b = ev && ev.currentTarget; const r = b && b.getBoundingClientRect ? b.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top + r.height / 2 : innerHeight / 2;
    if (!document.startViewTransition || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('theme-fade'); apply(next); setTimeout(() => root.classList.remove('theme-fade'), 700); return; }
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theming');
    const vt = document.startViewTransition(() => apply(next));
    try {
      await vt.ready;
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] }, { duration: 800, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' });
    } catch (e) { }
    try { await vt.finished; } catch (e) { }
    root.classList.remove('theming');
  }
  function bind() {
    document.querySelectorAll('.tt').forEach(b => { if (b.dataset.bound) return; b.dataset.bound = '1'; b.addEventListener('click', toggle); });
    apply(get());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  window.VLTheme = { get, set: apply, toggle };
})();
