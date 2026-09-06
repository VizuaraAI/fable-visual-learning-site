#!/usr/bin/env python3
"""Generate the multi-page study site from content/*.json into site/.

site/index.html                         landing (from dist/index.html, built by build.py)
site/class-12/index.html                class hub
site/class-12/physics/index.html        subject page
site/class-12/physics/<slug>/index.html chapter guide (or a stub if the JSON is not written yet)
site/search-index.json, site/site.css, site/guide.js, site/sitemap.xml
"""
import html, json, pathlib, re, shutil, subprocess, sys, datetime

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / 'site'
CURR = json.load(open(ROOT / 'content' / 'curriculum.json'))
BASE = 'https://visuallearning-concept.vercel.app'
LOGO = 'data:image/png;base64,' + __import__('base64').b64encode((ROOT / 'assets' / 'logo.png').read_bytes()).decode()

def esc(s): return html.escape(str(s), quote=True)
def anchor(s): return re.sub(r'[^a-z0-9]+', '-', str(s).lower()).strip('-')[:60] or 'x'

# ---------------------------------------------------------------- shell
def shell(title, body, desc='', crumbs=None, extra=''):
    crumb_html = ''
    if crumbs:
        crumb_html = '<nav class="crumbs" aria-label="Breadcrumb">' + ' <span>›</span> '.join(
            f'<a href="{esc(u)}">{esc(t)}</a>' if u else f'<span class="here">{esc(t)}</span>' for t, u in crumbs) + '</nav>'
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} · Visual Learning</title>
<meta name="description" content="{esc(desc or title)}">
<meta property="og:title" content="{esc(title)} · Visual Learning">
<meta property="og:description" content="{esc(desc or title)}">
<meta name="theme-color" content="#f5f3ec">
<script>(function(){{try{{if(localStorage.getItem('vl-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}}})()</script>
<link rel="icon" type="image/png" href="{LOGO}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/site.css">
{extra}
</head>
<body>
<nav class="nav" id="nav">
  <div class="wrap">
    <a class="brand" href="/"><img src="{LOGO}" alt="" width="30"> Visual Learning</a>
    <div class="pill">
      <a href="/class-9/">Class 9</a><a href="/class-10/">Class 10</a><a href="/class-11/">Class 11</a><a href="/class-12/">Class 12</a>
    </div>
    <div class="nav-r">
      <div class="search" id="search"><input type="search" id="q" placeholder="Search chapters, terms…" autocomplete="off" aria-label="Search"><div class="results" id="results" hidden></div></div>
      <button class="tt" type="button" aria-label="Switch to dark mode" aria-pressed="false"><span class="stars"></span><span class="cloud"></span><span class="knob"></span></button>
      <a class="btn btn-primary btn-sm" href="https://www.visuallearning.in/auth/signup" target="_blank" rel="noopener">Start free</a>
    </div>
  </div>
</nav>
<button class="menu-btn" id="menubtn" aria-label="Menu">☰</button>
{crumb_html}
{body}
<footer class="foot">
  <div class="wrap">
    <div class="fbot">
      <div>© 2026 Visual Learning AI Pvt. Ltd. · <a href="/">Home</a> · <a href="https://www.youtube.com/@visuallearning3D" target="_blank" rel="noopener">YouTube</a> · <a href="https://play.google.com/store/apps/details?id=com.visuallearning247.app" target="_blank" rel="noopener">Android app</a></div>
      <div class="colophon">Study guides follow the NCERT syllabus that CBSE and most state boards examine. Questions marked with a year appeared in that CBSE paper; the rest are the ones that come up most often.</div>
    </div>
  </div>
</footer>
<div class="lightbox" id="lightbox" hidden><div class="lb-inner" role="dialog" aria-modal="true"><button class="lb-close" id="lbclose" aria-label="Close">×</button><div class="lb-frame" id="lbframe"></div><div class="lb-title" id="lbtitle"></div></div></div>
<script src="/guide.js"></script>
<script src="/hero/theme.js"></script>
</body>
</html>
'''

# ---------------------------------------------------------------- data access
def chapter_path(cls, subj_slug, idx, slug):
    return ROOT / 'content' / f'class-{cls}' / subj_slug / f'{idx:02d}-{slug}.json'

def load(cls, subj_slug, idx, slug):
    p = chapter_path(cls, subj_slug, idx, slug)
    if not p.exists(): return None
    try:
        return json.load(open(p))
    except Exception as e:
        print('BAD JSON', p, e, file=sys.stderr); return None

def url(cls, subj_slug, slug=None):
    return f'/class-{cls}/{subj_slug}/' + (f'{slug}/' if slug else '')

# ---------------------------------------------------------------- pieces
def video_button(vid, title, cls_label):
    if not vid: return ''
    return f'<a class="btn btn-ghost vid-btn" href="https://www.youtube.com/watch?v={esc(vid)}" data-id="{esc(vid)}" data-title="{esc(title)}" data-meta="{esc(cls_label)}" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Watch the 3D chapter</a>'

def formulas_html(fs):
    if not fs: return ''
    out = []
    for f in fs:
        where = ''
        if f.get('where'):
            where = '<div class="where">' + ''.join(f'<b>{w[0]}</b><span>{w[1]}</span>' for w in f['where'] if len(w) == 2) + '</div>'
        out.append(f'<div class="formula-box"><div class="expr">{f.get("expr","")}</div>{where}</div>')
    return ''.join(out)

def years_html(years):
    if not years: return ''
    return '<span class="pyq-tag">PYQ ' + ' · '.join(str(y) for y in years) + '</span>'

def sections_html(d):
    out = []
    for i, s in enumerate(d.get('sections', [])):
        tip = f'<div class="tip"><b>Exam tip</b> {s["tip"]}</div>' if s.get('tip') else ''
        out.append(f'''<section class="sec-note" id="s-{i+1}">
<h3 class="note-h"><span class="n">{i+1:02d}</span> {esc(s.get("heading",""))} {years_html(s.get("pyq_years"))}</h3>
<div class="prose">{s.get("body","")}</div>
{formulas_html(s.get("formulas"))}
{tip}
</section>''')
    return ''.join(out)

def exam_profile_html(d):
    ep = d.get('exam_profile', {})
    rows = ''.join(f'<tr><td>{esc(q.get("type",""))}</td><td class="num">{esc(q.get("marks",""))}</td><td>{q.get("note","")}</td></tr>' for q in ep.get('question_types', []))
    hot = ''.join(f'<li>{h}</li>' for h in ep.get('hot_topics', []))
    return f'''<section class="block" id="exam">
<h2 class="block-h"><span class="eyebrow">Before you start</span>What the board asks from this chapter</h2>
<p class="prose">{ep.get("weightage","")}</p>
<div class="duo">
<div class="tablewrap"><table class="tbl"><thead><tr><th>Question type</th><th>Marks</th><th>Usually asked</th></tr></thead><tbody>{rows}</tbody></table></div>
<div class="hot"><h4>Hot topics, in order</h4><ol>{hot}</ol></div>
</div>
</section>'''

def key_terms_html(d):
    items = ''.join(f'<div class="term"><b>{esc(t.get("term",""))}</b><span>{t.get("definition","")}</span></div>' for t in d.get('key_terms', []))
    return f'<section class="block" id="terms"><h2 class="block-h"><span class="eyebrow">Vocabulary</span>Key terms</h2><div class="terms">{items}</div></section>'

def formula_sheet_html(d):
    fs = d.get('formula_sheet', [])
    if not fs: return ''
    rows = ''.join(f'<tr><td>{esc(f.get("name",""))}</td><td class="expr-cell">{f.get("expr","")}</td><td>{f.get("note","")}</td></tr>' for f in fs)
    label = 'Formula sheet' if d.get('subject') != 'Biology' else 'Facts and values to remember'
    return f'<section class="block" id="formulas"><h2 class="block-h"><span class="eyebrow">Keep this on one page</span>{label}</h2><div class="tablewrap"><table class="tbl"><thead><tr><th>Name</th><th>Expression</th><th>Notes</th></tr></thead><tbody>{rows}</tbody></table></div></section>'

def diagrams_html(d):
    ds = d.get('diagrams', [])
    if not ds: return ''
    cards = ''.join(f'<div class="card-d"><h4>{esc(x.get("title",""))}</h4><p>{x.get("how_to_draw","")}</p></div>' for x in ds)
    return f'<section class="block" id="diagrams"><h2 class="block-h"><span class="eyebrow">Practise with a pencil</span>Diagrams that earn marks</h2><div class="dgrid">{cards}</div></section>'

def acc(q, a, meta='', open_=False):
    return f'<details class="acc"{" open" if open_ else ""}><summary><span class="acc-q">{q}</span>{meta}</summary><div class="acc-a">{a}</div></details>'

def ncert_html(d):
    qs = d.get('ncert_questions', [])
    items = ''.join(acc(f'<span class="qn">{esc(q.get("number",""))}</span> {q.get("q","")}', q.get('a', ''), f'<span class="marks">{esc(q.get("marks",""))} m</span>' if q.get('marks') else '') for q in qs)
    return f'<section class="block" id="ncert"><h2 class="block-h"><span class="eyebrow">Textbook</span>NCERT questions the board keeps asking</h2><div class="accs">{items}</div></section>'

TYPE_LABEL = {'MCQ': 'MCQ', 'Assertion–Reason': 'Assertion–Reason', 'Assertion-Reason': 'Assertion–Reason', 'VSA': 'Very short answer', 'SA': 'Short answer', 'LA': 'Long answer', 'Case': 'Case-based'}

def pyq_html(d):
    qs = d.get('pyq', [])
    order = ['MCQ', 'Assertion–Reason', 'VSA', 'SA', 'LA', 'Case']
    groups = {k: [] for k in order}
    for q in qs:
        t = q.get('type', 'SA').replace('-', '–')
        groups.setdefault(t, []).append(q)
    chips = ''.join(f'<button class="chip-f{" on" if i == 0 else ""}" data-f="{"all" if i == 0 else esc(k)}">{"All" if i == 0 else esc(TYPE_LABEL.get(k, k))} <span>{len(qs) if i == 0 else len(groups.get(k, []))}</span></button>' for i, k in enumerate(['all'] + order))
    items = []
    for k in order:
        for q in groups.get(k, []):
            year = q.get('year')
            tag = f'<span class="ytag">{esc(year)}</span>' if year else '<span class="ytag freq">Frequently asked</span>'
            marks = f'<span class="marks">{esc(q.get("marks",""))} m</span>' if q.get('marks') else ''
            body = q.get('q', '')
            if q.get('options'):
                body += '<ol class="opts-l" type="a">' + ''.join(f'<li>{o}</li>' for o in q['options']) + '</ol>'
            ans = q.get('answer', '')
            if q.get('options') and len(str(ans)) <= 2:
                ans = f'<b>Answer: ({esc(str(ans).strip().lower())})</b>'
            sol = q.get('solution') or ''
            a = f'{ans}{"<div class=sol>" + sol + "</div>" if sol else ""}'
            items.append(f'<div class="pyq-item" data-t="{esc(k)}">' + acc(f'<span class="ttag">{esc(TYPE_LABEL.get(k, k))}</span> {body}', a, tag + marks) + '</div>')
    return f'<section class="block" id="pyq"><h2 class="block-h"><span class="eyebrow">Previous years and frequently asked</span>Board questions with model answers</h2><div class="filters">{chips}</div><div class="accs" id="pyqlist">{"".join(items)}</div></section>'

def quiz_html(d):
    data = json.dumps(d.get('practice_mcq', []), ensure_ascii=False).replace('</', '<\\/')
    return f'<section class="block" id="quiz"><h2 class="block-h"><span class="eyebrow">Test yourself</span>Practice quiz</h2><div class="panel" id="quizbox"></div><script type="application/json" id="quiz-data">{data}</script></section>'

def mistakes_html(d):
    items = ''.join(f'<li>{m}</li>' for m in d.get('common_mistakes', []))
    return f'<section class="block" id="mistakes"><h2 class="block-h"><span class="eyebrow">Marks lost every year</span>Common mistakes</h2><ul class="mist">{items}</ul></section>'

def strategy_html(d):
    return f'<section class="block" id="strategy"><h2 class="block-h"><span class="eyebrow">How to prepare</span>Strategy for this chapter</h2><div class="prose wide">{d.get("strategy","")}</div></section>'

def checklist_html(d, key):
    items = ''.join(f'<label class="chk"><input type="checkbox" data-k="{key}:{i}"><span>{c}</span></label>' for i, c in enumerate(d.get('revision_checklist', [])))
    return f'<section class="block" id="revision"><h2 class="block-h"><span class="eyebrow">Last look</span>Revision checklist</h2><div class="checks">{items}</div><div class="done-row"><button class="btn btn-primary" id="markdone" data-k="{key}">Mark chapter done</button><span class="score" id="donestate"></span></div></section>'

def toc_html(d):
    secs = ''.join(f'<a href="#s-{i+1}" class="sub">{i+1:02d} {esc(s.get("heading",""))}</a>' for i, s in enumerate(d.get('sections', [])))
    return f'''<aside class="toc"><div class="toc-in">
<div class="toc-h">On this page</div>
<a href="#exam">What the board asks</a>
<a href="#notes">Notes</a>
<div class="subs">{secs}</div>
<a href="#terms">Key terms</a>
<a href="#formulas">{"Facts and values" if d.get("subject") == "Biology" else "Formula sheet"}</a>
<a href="#diagrams">Diagrams</a>
<a href="#ncert">NCERT questions</a>
<a href="#pyq">Board questions</a>
<a href="#quiz">Practice quiz</a>
<a href="#mistakes">Common mistakes</a>
<a href="#strategy">Strategy</a>
<a href="#revision">Revision checklist</a>
</div></aside>'''

def counts(d):
    return dict(sections=len(d.get('sections', [])), ncert=len(d.get('ncert_questions', [])), pyq=len(d.get('pyq', [])), mcq=len(d.get('practice_mcq', [])), terms=len(d.get('key_terms', [])))

# ---------------------------------------------------------------- pages
def chapter_page(cls, cl, subj, idx, slug, title, vid, d, prev, nxt):
    key = f'{cls}/{subj["slug"]}/{slug}'
    crumbs = [('Home', '/'), (cl['label'], f'/class-{cls}/'), (subj['subject'], url(cls, subj['slug'])), (title, None)]
    cls_label = f'{cl["label"]} · {subj["subject"]} · Chapter {idx}'
    pn = '<nav class="prevnext">'
    pn += f'<a href="{url(cls, subj["slug"], prev[0])}"><span>Previous</span>{esc(prev[1])}</a>' if prev else '<span></span>'
    pn += f'<a href="{url(cls, subj["slug"], nxt[0])}" class="r"><span>Next</span>{esc(nxt[1])}</a>' if nxt else '<span></span>'
    pn += '</nav>'
    if not d:
        body = f'''<main class="guide stub"><article class="doc">
<header class="doc-head"><p class="eyebrow">{esc(cls_label)}</p><h1 class="display">{esc(title)}</h1>
<p class="lede">This guide is being written. It will cover the whole NCERT chapter with notes, the formula sheet, NCERT solutions, previous-year board questions with model answers, a practice quiz and a revision checklist.</p>
<div class="head-actions">{video_button(vid, title, cls_label)}<a class="btn btn-ghost" href="{url(cls, subj["slug"])}">All {esc(subj["subject"])} chapters</a></div></header>{pn}</article></main>'''
        return shell(title, body, f'{cls_label}: preparation guide (in progress).', crumbs)
    c = counts(d)
    videos = d.get('videos') or ([] if not vid else [{'id': vid, 'title': title}])
    vb = video_button(videos[0]['id'], videos[0].get('title', title), cls_label) if videos else ''
    body = f'''<main class="guide">
{toc_html(d)}
<article class="doc">
<header class="doc-head">
<p class="eyebrow">{esc(cls_label)}</p>
<h1 class="display">{esc(d.get("title", title))}</h1>
<p class="lede">{d.get("summary","")}</p>
<div class="meta-chips"><span class="chip">{c["sections"]} sections</span><span class="chip">{c["ncert"]} NCERT questions</span><span class="chip">{c["pyq"]} board questions</span><span class="chip">{c["mcq"]}-question quiz</span></div>
<div class="head-actions">{vb}<button class="btn btn-ghost" id="printbtn">Print this guide</button></div>
</header>
{exam_profile_html(d)}
<section class="block" id="notes"><h2 class="block-h"><span class="eyebrow">The whole chapter, in order</span>Notes</h2>{sections_html(d)}</section>
{key_terms_html(d)}
{formula_sheet_html(d)}
{diagrams_html(d)}
{ncert_html(d)}
{pyq_html(d)}
{quiz_html(d)}
{mistakes_html(d)}
{strategy_html(d)}
{checklist_html(d, key)}
{pn}
</article>
</main>'''
    return shell(d.get('title', title), body, d.get('summary', ''), crumbs)

def subject_page(cls, cl, subj, ready):
    cards = []
    for i, (slug, title, vid) in enumerate([c[:3] for c in subj['chapters']], 1):
        d = ready.get(slug)
        status = f'<span class="st ok">{counts(d)["pyq"]} board questions · {counts(d)["mcq"]} MCQs</span>' if d else '<span class="st">Guide in preparation</span>'
        v = '<span class="st vid">3D chapter video</span>' if vid else ''
        cards.append(f'<a class="chap" href="{url(cls, subj["slug"], slug)}" data-k="{cls}/{subj["slug"]}/{slug}"><span class="no">{i:02d}</span><span class="t">{esc(title)}</span><span class="sts">{status}{v}</span><span class="done-badge" hidden>Done</span></a>')
    others = ''.join(f'<a class="tab" href="{url(cls, s["slug"])}"{" aria-current=page" if s is subj else ""}>{esc(s["subject"])}</a>' for s in cl['subjects'])
    body = f'''<main class="hub"><div class="wrap">
<p class="eyebrow">{esc(cl["label"])}</p>
<h1 class="display">{esc(subj["subject"])}</h1>
<p class="lede">{len(subj["chapters"])} chapters in NCERT order. Each guide has the notes, the formula sheet, NCERT solutions, board questions with model answers, a practice quiz and a revision checklist.</p>
<div class="tabs">{others}</div>
<div class="chaps">{"".join(cards)}</div>
</div></main>'''
    return shell(f'{cl["label"]} {subj["subject"]}', body, f'{cl["label"]} {subj["subject"]}: chapter-wise preparation guides.', [('Home', '/'), (cl['label'], f'/class-{cls}/'), (subj['subject'], None)])

def class_page(cls, cl, ready_by_subj):
    blocks = []
    for subj in cl['subjects']:
        n_ready = sum(1 for c in subj['chapters'] if ready_by_subj[subj['slug']].get(c[0]))
        items = ''.join(f'<li><a href="{url(cls, subj["slug"], slug)}">{esc(t)}</a>{" <span class=st>soon</span>" if not ready_by_subj[subj["slug"]].get(slug) else ""}</li>' for slug, t, _ in [c[:3] for c in subj['chapters']])
        blocks.append(f'<section class="subj"><div class="subj-h"><h2 class="display"><a href="{url(cls, subj["slug"])}">{esc(subj["subject"])}</a></h2><span class="score">{n_ready} of {len(subj["chapters"])} guides ready</span></div><ol class="chlist">{items}</ol></section>')
    other = ''.join(f'<a class="tab" href="/class-{c["class"]}/"{" aria-current=page" if c is cl else ""}>{esc(c["label"])}</a>' for c in CURR['classes'])
    body = f'''<main class="hub"><div class="wrap">
<p class="eyebrow">Preparation guides</p>
<h1 class="display">{esc(cl["label"])}</h1>
<p class="lede">Every chapter, in the order NCERT teaches it. Open a chapter for the notes, the formula sheet, NCERT solutions, board questions with model answers, a quiz and a revision checklist.</p>
<div class="tabs">{other}</div>
{"".join(blocks)}
</div></main>'''
    return shell(cl['label'], body, f'{cl["label"]} chapter-wise preparation guides for CBSE.', [('Home', '/'), (cl['label'], None)])

# ---------------------------------------------------------------- build
def main():
    if OUT.exists():
        for p in OUT.iterdir():
            if p.name == '.vercel': continue
            shutil.rmtree(p) if p.is_dir() else p.unlink()
    OUT.mkdir(exist_ok=True)
    subprocess.run([sys.executable, str(ROOT / 'build.py')], check=True)
    shutil.copy(ROOT / 'dist' / 'index.html', OUT / 'index.html')
    shutil.copy(ROOT / 'static' / 'site.css', OUT / 'site.css')
    shutil.copy(ROOT / 'static' / 'guide.js', OUT / 'guide.js')
    shutil.copytree(ROOT / 'static' / 'hero', OUT / 'hero', dirs_exist_ok=True)
    index, urls, ready_total, total = [], ['/'], 0, 0
    for cl in CURR['classes']:
        cls = cl['class']
        ready_by_subj = {}
        for subj in cl['subjects']:
            ready = {}
            chs = [c[:3] for c in subj['chapters']]
            for i, (slug, title, vid) in enumerate(chs, 1):
                d = load(cls, subj['slug'], i, slug)
                total += 1
                if d:
                    ready[slug] = d; ready_total += 1
                    index.append({'t': d.get('title', title), 'c': cl['label'], 's': subj['subject'], 'u': url(cls, subj['slug'], slug),
                                  'k': ' '.join([x.get('term', '') for x in d.get('key_terms', [])] + [x.get('heading', '') for x in d.get('sections', [])])[:600]})
                else:
                    index.append({'t': title, 'c': cl['label'], 's': subj['subject'], 'u': url(cls, subj['slug'], slug), 'k': ''})
                prev = (chs[i-2][0], chs[i-2][1]) if i > 1 else None
                nxt = (chs[i][0], chs[i][1]) if i < len(chs) else None
                pdir = OUT / f'class-{cls}' / subj['slug'] / slug
                pdir.mkdir(parents=True, exist_ok=True)
                (pdir / 'index.html').write_text(chapter_page(cls, cl, subj, i, slug, title, vid, d, prev, nxt))
                urls.append(url(cls, subj['slug'], slug))
            ready_by_subj[subj['slug']] = ready
            sdir = OUT / f'class-{cls}' / subj['slug']
            (sdir / 'index.html').write_text(subject_page(cls, cl, subj, ready))
            urls.append(url(cls, subj['slug']))
        (OUT / f'class-{cls}' / 'index.html').write_text(class_page(cls, cl, ready_by_subj))
        urls.append(f'/class-{cls}/')
    (OUT / 'search-index.json').write_text(json.dumps(index, ensure_ascii=False))
    today = datetime.date.today().isoformat()
    (OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod></url>' for u in urls) + '</urlset>')
    (OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n')
    print(f'site: {ready_total}/{total} chapter guides ready, {len(urls)} pages')

if __name__ == '__main__':
    main()
