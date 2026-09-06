#!/usr/bin/env python3
"""Validate a chapter JSON against content/SCHEMA.md minimums. Usage: python3 content/validate.py path.json"""
import json, re, sys

MIN = dict(key_terms=12, formula_sheet=8, diagrams=3, ncert_questions=10, pyq=22, practice_mcq=15, common_mistakes=6, revision_checklist=10, sections=6)
PYQ_MIN = {'MCQ': 6, 'Assertion–Reason': 3, 'VSA': 4, 'SA': 4, 'LA': 3, 'Case': 2}
REQ = ['class', 'subject', 'chapter_no', 'slug', 'title', 'summary', 'exam_profile', 'sections', 'key_terms', 'formula_sheet', 'diagrams', 'ncert_questions', 'pyq', 'practice_mcq', 'common_mistakes', 'strategy', 'revision_checklist', 'videos']

def words(x):
    if isinstance(x, str): return len(re.sub(r'<[^>]+>', ' ', x).split())
    if isinstance(x, list): return sum(words(i) for i in x)
    if isinstance(x, dict): return sum(words(v) for v in x.values())
    return 0

def main(path):
    errs = []
    try:
        d = json.load(open(path))
    except Exception as e:
        print('INVALID JSON:', e); sys.exit(1)
    for k in REQ:
        if k not in d: errs.append(f'missing key: {k}')
    for k, n in MIN.items():
        if isinstance(d.get(k), list) and len(d[k]) < n: errs.append(f'{k}: {len(d[k])} < {n}')
    counts = {}
    for p in d.get('pyq', []):
        t = p.get('type', '?').replace('-', '–'); counts[t] = counts.get(t, 0) + 1
        if t == 'MCQ' or t == 'Assertion–Reason':
            opts = p.get('options') or []
            if len(opts) != 4: errs.append(f'pyq {t} "{p.get("q","")[:40]}" needs 4 options')
            if str(p.get('answer', '')).strip().lower()[:1] not in 'abcd': errs.append(f'pyq {t} "{p.get("q","")[:40]}" answer must be a/b/c/d')
        else:
            if not p.get('answer'): errs.append(f'pyq {t} "{p.get("q","")[:40]}" missing answer')
        if p.get('year') not in (None, '') and not re.match(r'^CBSE', str(p['year'])): errs.append(f'pyq year must start with CBSE or be null: {p["year"]}')
    for t, n in PYQ_MIN.items():
        if counts.get(t, 0) < n: errs.append(f'pyq type {t}: {counts.get(t,0)} < {n}')
    for i, m in enumerate(d.get('practice_mcq', [])):
        opts = m.get('options') or []
        if len(opts) != 4: errs.append(f'practice_mcq[{i}] needs 4 options')
        ai = m.get('answer_index')
        if not isinstance(ai, int) or not (0 <= ai < len(opts)): errs.append(f'practice_mcq[{i}] answer_index invalid')
        if not m.get('explanation'): errs.append(f'practice_mcq[{i}] missing explanation')
    for i, s in enumerate(d.get('sections', [])):
        if words(s.get('body', '')) < 80: errs.append(f'sections[{i}] "{s.get("heading","")}" body too short ({words(s.get("body",""))} words)')
    if '$' in json.dumps(d) or '\\frac' in json.dumps(d): errs.append('LaTeX / $ found; use HTML sub/sup + Unicode')
    ep = d.get('exam_profile', {})
    if len(ep.get('question_types', [])) < 4: errs.append('exam_profile.question_types < 4')
    if len(ep.get('hot_topics', [])) < 5: errs.append('exam_profile.hot_topics < 5')
    total = words(d)
    if total < 4000: errs.append(f'total words {total} < 4000')
    summary = f"words={total} sections={len(d.get('sections',[]))} key_terms={len(d.get('key_terms',[]))} formulas={len(d.get('formula_sheet',[]))} ncert={len(d.get('ncert_questions',[]))} pyq={len(d.get('pyq',[]))} {counts} mcq={len(d.get('practice_mcq',[]))}"
    if errs:
        print('PROBLEMS:'); [print(' -', e) for e in errs]; print(summary); sys.exit(1)
    print('OK', summary)

if __name__ == '__main__':
    main(sys.argv[1])
