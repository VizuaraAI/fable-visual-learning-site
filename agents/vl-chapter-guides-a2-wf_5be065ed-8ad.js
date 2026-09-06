export const meta = {
  name: 'vl-chapter-guides-a2',
  description: 'Write the remaining Class 12 Physics and Chemistry preparation guides for visuallearning.in',
  phases: [{ title: 'Write', detail: 'one writer per chapter: research, write JSON, self-check, validate' }],
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

Output path (create directories as needed): ${pathOf(it)}

Cover every NCERT section of this chapter, in NCERT order, including every derivation, mechanism, diagram and named reaction the board asks for. Validate with \`python3 content/validate.py ${pathOf(it)}\` until it prints OK. Then reply with the three lines described in PROMPT.md.`,
  { label: `write ${it.c} ${it.ss} ${it.slug}`, phase: 'Write', agentType: 'general-purpose' })
const results = await pipeline(items, writer)
const summary = items.map((it, i) => ({ path: pathOf(it), result: results[i] ? String(results[i]).slice(0, 300) : 'FAILED' }))
log(`done: ${summary.filter(s => s.result !== 'FAILED').length} written, ${summary.filter(s => s.result === 'FAILED').length} failed`)
return summary