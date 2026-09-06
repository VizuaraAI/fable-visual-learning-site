export const meta = {
  name: 'vl-chapter-guides-b2',
  description: 'Write one CBSE preparation guide per chapter (Class 11, Class 9, Biology) for visuallearning.in',
  phases: [
    { title: 'Write', detail: 'one writer per chapter: research, write JSON, self-check, validate' },
  ],
}
const ROOT = '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-reimagined'
const items = Array.isArray(args) ? args : []
log(`${items.length} chapters queued`)
const pad = n => (n < 10 ? '0' + n : '' + n)
const pathOf = it => `content/class-${it.c}/${it.ss}/${pad(it.i)}-${it.slug}.json`

const writer = it => agent(
`Project folder: ${ROOT}

First read content/PROMPT.md and content/SCHEMA.md in that folder in full and follow them exactly, including the "Before you finish" accuracy pass.

Your chapter: Class ${it.c} ${it.s}, Chapter ${it.i}, "${it.t}" (NCERT, current rationalised syllabus). slug: ${it.slug}.
${it.v ? `The channel has a full 3D video for it, YouTube id ${it.v}, title "${it.t} · full chapter" — put it in "videos".` : 'No channel video is known for this chapter: set "videos": [].'}
${it.c === 9 ? 'Class 9 Science is one paper covering physics, chemistry and biology chapters; question types are MCQ (1), Assertion–Reason (1), VSA (2), SA (3), LA (5) and case-based (4). Year-tagged board PYQs do not exist for Class 9 (there is no board exam), so set every pyq "year" to null and draw the questions from NCERT exercises, exemplar and the questions schools ask most; keep the pyq types and counts the schema requires.' : ''}
${it.c === 11 ? 'Class 11 has no board exam, but the chapter is examined in the school final and is the base for Class 12 boards, JEE and NEET. Set pyq "year" to null unless the question is a well-known CBSE sample-paper item; draw questions from NCERT exercises, NCERT exemplar and the most commonly asked school-exam questions.' : ''}
${it.s === 'Biology' ? 'For a biology chapter, formula_sheet holds the key facts, values, names, examples and diagrams-to-label the examiner expects instead of formulas.' : ''}

Output path (create directories as needed): ${pathOf(it)}

Cover every NCERT section of this chapter, in NCERT order, including every derivation, mechanism, diagram and named reaction that is asked. Validate with \`python3 content/validate.py ${pathOf(it)}\` until it prints OK. Then reply with the three lines described in PROMPT.md.`,
  { label: `write ${it.c} ${it.ss} ${it.slug}`, phase: 'Write', agentType: 'general-purpose', model: 'sonnet', effort: 'medium' })

const results = await pipeline(items, writer)
const summary = items.map((it, i) => ({ path: pathOf(it), result: results[i] ? String(results[i]).slice(0, 300) : 'FAILED' }))
const failed = summary.filter(s => s.result === 'FAILED').length
log(`done: ${items.length - failed} written, ${failed} failed`)
return summary