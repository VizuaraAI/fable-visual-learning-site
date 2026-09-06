#!/usr/bin/env python3
"""Print the examiner work still to do: the 50 Class 10 Sci + Class 12 Phy/Chem/Bio guides minus those a finished reviewer already edited.
Usage: python3 tools_examiner_remaining.py <workflow transcript dir> [more dirs...]  -> writes remaining.json (args.review shape) and prints reviewed/fixes."""
import json, re, glob, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
c = json.load(open(os.path.join(ROOT, 'content/curriculum.json')))
def items(cn, ss):
    for cls in c['classes']:
        if cls['class'] != cn: continue
        for s in cls['subjects']:
            if s['slug'] != ss: continue
            for i, ch in enumerate(s['chapters'], 1):
                yield dict(c=cn, s=s['subject'], ss=ss, i=i, t=ch[1], slug=ch[0])
review = list(items(10,'science')) + list(items(12,'physics')) + list(items(12,'chemistry')) + list(items(12,'biology'))
path = lambda it: f"content/class-{it['c']}/{it['ss']}/{it['i']:02d}-{it['slug']}.json"
done, fixes = {}, 0
for D in sys.argv[1:]:
    for l in open(os.path.join(D, 'journal.jsonl')):
        d = json.loads(l)
        if d.get('type') != 'result' or not d.get('result'): continue
        p = None
        for h in glob.glob(os.path.join(D, f"agent-{d.get('agentId')}.jsonl")):
            m = re.search(r'File: (content/class-\d+/\w+/\d\d-[\w-]+\.json)', open(h, errors='ignore').read())
            if m: p = m.group(1)
        if not p:
            m = re.search(r'(content/class-\d+/\w+/\d\d-[\w-]+\.json)', str(d['result']))
            p = m.group(1) if m else None
        if p:
            done[p] = str(d['result'])[:300]
            m = re.search(r'fixes:\s*(\d+)', str(d['result']), re.I)
            if m: fixes += int(m.group(1))
remaining = [it for it in review if path(it) not in done]
json.dump({'review': remaining}, open(os.path.join(ROOT, 'remaining.json'), 'w'), indent=1)
print(f'reviewed={len(done)} fixes_counted={fixes} remaining={len(remaining)} -> remaining.json')
for p in done: print('  done', p)
