export const meta = {
  name: 'vl-chapter-guides',
  description: 'Write and fact-check one CBSE preparation guide per chapter for visuallearning.in',
  phases: [
    { title: 'Write', detail: 'one writer per chapter: research, write JSON, validate' },
    { title: 'Review', detail: 'one examiner per chapter: recheck answers, fix, revalidate' },
  ],
}
const ROOT = '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-reimagined'
const items = Array.isArray(args) ? args : []
log(`${items.length} chapters queued`)
const pad = n => (n < 10 ? '0' + n : '' + n)
const pathOf = it => `content/class-${it.c}/${it.ss}/${pad(it.i)}-${it.slug}.json`

const writer = it => agent(
`Project folder: ${ROOT}

First read content/PROMPT.md and content/SCHEMA.md in that folder in full and follow them exactly.

Your chapter: Class ${it.c} ${it.s}, Chapter ${it.i}, "${it.t}" (NCERT, current rationalised syllabus). slug: ${it.slug}.
${it.v ? `The channel has a full 3D video for it, YouTube id ${it.v}, title "${it.t} · full chapter" — put it in "videos".` : 'No channel video is known for this chapter: set "videos": [].'}
${it.c === 10 ? 'Class 10 Science is one board paper covering physics, chemistry and biology chapters; question types are MCQ (1), Assertion–Reason (1), VSA (2), SA (3), LA (5) and case-based (4). Reflect that in exam_profile.' : ''}
${it.s === 'Biology' ? 'For a biology chapter, formula_sheet holds the key facts, values, names and examples the examiner expects instead of formulas.' : ''}

Output path (create directories as needed): ${pathOf(it)}

Cover every NCERT section of this chapter, in NCERT order, including every derivation, mechanism, diagram and named reaction the board asks for. Validate with \`python3 content/validate.py ${pathOf(it)}\` until it prints OK. Then reply with the three lines described in PROMPT.md.`,
  { label: `write ${it.c} ${it.ss} ${it.slug}`, phase: 'Write', agentType: 'general-purpose' })

const reviewer = (prev, it) => agent(
`Project folder: ${ROOT}

You are a senior CBSE examiner checking a generated preparation guide for factual accuracy before it is published. File: ${pathOf(it)} (Class ${it.c} ${it.s}, "${it.t}"). Read content/SCHEMA.md, then read the JSON file in full.

Check and fix, editing the JSON file in place:
1. Every MCQ key ("answer" letter in pyq, "answer_index" in practice_mcq) points at the one correct option. Recompute every numerical answer; correct the working if wrong.
2. Every formula, definition, law statement, unit and constant matches NCERT. Chemical equations are balanced.
3. PYQ years: keep a year only if you are confident that question appeared in that CBSE paper or sample paper; otherwise set "year": null.
4. Sections cover the whole NCERT chapter in NCERT order; nothing from the rationalised syllabus is missing and nothing deleted from it is presented as examinable.
5. Notation: HTML sub/sup and Unicode only, no LaTeX or $.
Do not shorten content. Keep the JSON valid. Run \`python3 content/validate.py ${pathOf(it)}\` until it prints OK.

Reply with exactly two lines: "fixes: <number>" and a brief comma-separated list of what you corrected (or "none").`,
  { label: `review ${it.c} ${it.ss} ${it.slug}`, phase: 'Review', agentType: 'general-purpose', effort: 'high' })

const results = await pipeline(items, writer, reviewer)
const summary = items.map((it, i) => ({ path: pathOf(it), review: results[i] ? String(results[i]).slice(0, 300) : 'FAILED' }))
const failed = summary.filter(s => s.review === 'FAILED').length
log(`done: ${items.length - failed} reviewed, ${failed} failed`)
return summary