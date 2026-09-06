#!/usr/bin/env python3
"""Inline CSS, JS and image assets into a single HTML file.

dist/artifact.html  - fragment (no doctype/html/head/body), for the Artifact tool; videos link out (sandbox blocks embeds)
dist/index.html     - full standalone document for Vercel or any static host; videos play inline
"""
import base64, json, pathlib, re, sys

def landing_curr():
    cur = json.load(open(root / 'content' / 'curriculum.json'))
    out = {}
    for cl in cur['classes']:
        rows = []
        for s in cl['subjects']:
            for ch in s['chapters']:
                m = ch[3] if len(ch) > 3 else {}
                subj = s['subject'] if s['subject'] != 'Science' else guess_subject(ch[1])
                rows.append([subj, ch[1], m, f"/class-{cl['class']}/{s['slug']}/{ch[0]}/"])
        out[cl['class']] = {'label': cl['label'], 'rows': rows}
    return json.dumps(out, ensure_ascii=False)

CHEM = ('matter', 'atoms', 'structure of the atom', 'chemical', 'acids', 'metals', 'carbon')
BIO = ('life', 'tissues', 'diversity', 'control', 'reproduce', 'heredity', 'environment', 'food')
def guess_subject(title):
    t = title.lower()
    if any(k in t for k in CHEM): return 'Chemistry'
    if any(k in t for k in BIO): return 'Biology'
    return 'Physics'

root = pathlib.Path(__file__).resolve().parent
src = (root / 'src' / 'index.html').read_text()
css = (root / 'src' / 'styles.css').read_text()
js = (root / 'src' / 'app.js').read_text()
html = src.replace('{{CSS}}', css).replace('{{JS}}', js.replace('{{CURR}}', landing_curr()))

missing = []
assets = {}
def asset(m):
    name = m.group(1)
    if name not in assets:
        p = root / 'assets' / name
        if not p.exists():
            missing.append(name)
            return ''
        mime = 'image/png' if name.endswith('.png') else 'image/jpeg'
        assets[name] = f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"
    return assets[name]

html = re.sub(r'\{\{ASSET:([^}]+)\}\}', asset, html)

LIBS = ['three.min.js', 'CopyShader.js', 'LuminosityHighPassShader.js', 'FXAAShader.js', 'GammaCorrectionShader.js',
        'EffectComposer.js', 'RenderPass.js', 'ShaderPass.js', 'MaskPass.js', 'UnrealBloomPass.js']
hero_local = ''.join(f'<script src="/hero/{l}"></script>\n' for l in LIBS) + '<script src="/hero/shared.js"></script>\n<script src="/hero/cell-hero.js"></script>\n<script src="/hero/theme.js"></script>'
CDN_EX = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/'
hero_cdn = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
            + ''.join(f'<script src="{CDN_EX}{q}"></script>\n' for q in ['shaders/CopyShader.js', 'shaders/LuminosityHighPassShader.js', 'shaders/FXAAShader.js', 'shaders/GammaCorrectionShader.js', 'postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js', 'postprocessing/ShaderPass.js', 'postprocessing/MaskPass.js', 'postprocessing/UnrealBloomPass.js'])
            + '<script>\n' + (root / 'static' / 'hero' / 'shared.js').read_text() + '\n' + (root / 'static' / 'hero' / 'cell-hero.js').read_text() + '\n' + (root / 'static' / 'hero' / 'theme.js').read_text() + '\n</script>')
if missing:
    print('MISSING ASSETS:', missing, file=sys.stderr)
    sys.exit(1)

dist = root / 'dist'
dist.mkdir(exist_ok=True)

fragment = html.replace('{{EMBED}}', '0').replace('{{HEROSCRIPTS}}', hero_cdn)
if '{{' in fragment:
    print('WARNING: unreplaced placeholder left in output', file=sys.stderr)
(dist / 'artifact.html').write_text(fragment)

body = html.replace('{{EMBED}}', '1').replace('{{HEROSCRIPTS}}', hero_local).replace('<title>Visual Learning</title>\n', '', 1)
desc = ('3D animated lessons for Class 9 to 12, with visual notes, NCERT and PYQ solutions and chapter quizzes. '
        'A concept for the next visuallearning.in.')
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        '<title>Visual Learning</title>\n'
        f'<meta name="description" content="{desc}">\n'
        '<meta property="og:title" content="Visual Learning">\n'
        f'<meta property="og:description" content="{desc}">\n'
        '<meta property="og:type" content="website">\n'
        '<meta name="theme-color" content="#f5f3ec">\n'
        f'<link rel="icon" type="image/png" href="{asset(re.match(r"(logo.png)", "logo.png"))}">\n'
        '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
(dist / 'index.html').write_text(full)
print(f"artifact.html {len(fragment)/1024:.0f} KB, index.html {len(full)/1024:.0f} KB")
