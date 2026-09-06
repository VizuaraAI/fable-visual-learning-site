export const meta = {
  name: 'vl-chapter-guides-paced',
  description: 'Write the remaining CBSE preparation guides, three chapters at a time, full brief',
  phases: [{ title: 'Write', detail: 'waves of 3 writers; each researches, writes, self-checks, validates' }],
}
const ROOT = '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-reimagined'
const items = Array.isArray(args) ? args : []
const WAVE = 3
log(`${items.length} chapters queued, ${WAVE} at a time`)
const pad = n => (n < 10 ? '0' + n : '' + n)
const pathOf = it => `content/class-${it.c}/${it.ss}/${pad(it.i)}-${it.slug}.json`
const writer = it => agent(
`Project folder: ${ROOT}

First read content/PROMPT.md and content/SCHEMA.md in that folder in full and follow them exactly, including the "Before you finish" accuracy pass.

Your chapter: Class ${it.c} ${it.s}, Chapter ${it.i}, "${it.t}" (NCERT, current rationalised syllabus). slug: ${it.slug}.
${it.v ? `The channel has a full 3D video for it, YouTube id ${it.v}, title "${it.t} · full chapter" — put it in "videos".` : 'No channel video is known for this chapter: set "videos": [].'}
${it.c === 11 ? 'Class 11 has no board exam, but the chapter is examined in the school final and is the base for Class 12 boards, JEE and NEET. Set pyq "year" to null unless the question is a well-known CBSE sample-paper item; draw questions from NCERT exercises, NCERT exemplar and the most commonly asked school-exam questions.' : ''}
${it.s === 'Biology' ? 'For a biology chapter, formula_sheet holds the key facts, values, names, examples and diagrams-to-label the examiner expects instead of formulas. Biology boards reward labelled diagrams and precise NCERT terminology; give the diagrams section real attention.' : ''}

Output path (create directories as needed): ${pathOf(it)}

Cover every NCERT section of this chapter, in NCERT order, including every derivation, mechanism, diagram and named reaction that is asked. Validate with \`python3 content/validate.py ${pathOf(it)}\` until it prints OK. Then reply with the three lines described in PROMPT.md.`,
  { label: `write ${it.c} ${it.ss} ${it.slug}`, phase: 'Write', agentType: 'general-purpose' })
const summary = []
for (let i = 0; i < items.length; i += WAVE) {
  const wave = items.slice(i, i + WAVE)
  const res = await parallel(wave.map(it => () => writer(it)))
  wave.forEach((it, k) => summary.push({ path: pathOf(it), result: res[k] ? String(res[k]).slice(0, 240) : 'FAILED' }))
  const fails = summary.filter(s => s.result === 'FAILED').length
  log(`wave ${Math.floor(i / WAVE) + 1}/${Math.ceil(items.length / WAVE)} done: ${summary.length - fails} written, ${fails} failed`)
  if (fails >= 3 && res.every(r => !r)) { log('three failures in one wave; stopping so the rest can resume later'); break }
}
return summary