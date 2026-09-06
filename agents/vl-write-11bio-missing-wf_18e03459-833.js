export const meta = {
  name: 'vl-write-11bio-missing',
  description: 'Write the missing Class 11 Biology CBSE guides (chapters 12-19) three at a time with the saved writer prompt, one retry per empty writer',
  phases: [
    { title: 'Write 11 Bio', detail: 'missing chapters only, waves of 3, general-purpose agents, full brief' },
  ],
}
const ROOT = '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-reimagined'
const WAVE = 3
const write = (args && Array.isArray(args.write)) ? args.write : []
const pad = n => (n < 10 ? '0' + n : '' + n)
const pathOf = it => `content/class-${it.c}/${it.ss}/${pad(it.i)}-${it.slug}.json`

const writerPrompt = it => `Project folder: ${ROOT}

First read content/PROMPT.md and content/SCHEMA.md in that folder in full and follow them exactly, including the "Before you finish" accuracy pass. There is no word cap: write the chapter once, completely, and stop. Never spend time shortening a finished draft.

Your chapter: Class ${it.c} ${it.s}, Chapter ${it.i}, "${it.t}" (NCERT, current rationalised syllabus). slug: ${it.slug}.
${it.v ? `The channel has a full 3D video for it, YouTube id ${it.v}, title "${it.t} · full chapter" — put it in "videos".` : 'No channel video is known for this chapter: set "videos": [].'}
${it.c === 11 ? 'Class 11 has no board exam, but the chapter is examined in the school final and is the base for Class 12 boards and NEET. Set pyq "year" to null unless the question is a well-known CBSE sample-paper item; draw questions from NCERT exercises, NCERT exemplar and the most commonly asked school-exam questions.' : 'Class 12 Biology is a board paper: use real CBSE years on pyq only when you are confident of them, otherwise null.'}
For a biology chapter, formula_sheet holds the key facts, values, names, examples and diagrams-to-label the examiner expects instead of formulas. Biology boards reward labelled diagrams and precise NCERT terminology; give the diagrams section real attention (aim for 8 labelled-diagram entries).

Output path (create directories as needed): ${pathOf(it)}

Cover every NCERT section of this chapter, in NCERT order, including every mechanism, diagram, example and named process that is asked. Validate with \`python3 content/validate.py ${pathOf(it)}\` until it prints OK. Then reply with the three lines described in PROMPT.md and stop immediately.`

const writer = (it, attempt) => agent(writerPrompt(it), { label: `write ${it.c} ${it.ss} ${it.slug}${attempt ? ' (retry)' : ''}`, phase: 'Write 11 Bio', agentType: 'general-purpose' })

const summary = { written: [], writeFailed: [], stoppedEarly: false }
phase('Write 11 Bio')
log(`Class 11 Biology: ${write.length} missing chapters queued, ${WAVE} at a time`)
const waves = Math.ceil(write.length / WAVE)
for (let i = 0; i < write.length; i += WAVE) {
  const wave = write.slice(i, i + WAVE)
  const res = await parallel(wave.map(it => () => writer(it, 0)))
  const retry = wave.filter((it, k) => !res[k])
  let res2 = []
  if (retry.length) {
    log(`wave ${Math.floor(i / WAVE) + 1}: ${retry.length} writer(s) returned nothing, retrying once`)
    res2 = await parallel(retry.map(it => () => writer(it, 1)))
  }
  wave.forEach((it, k) => {
    const r = res[k] || res2[retry.indexOf(it)]
    if (r) summary.written.push({ path: pathOf(it), result: String(r).slice(0, 200) })
    else summary.writeFailed.push(pathOf(it))
  })
  log(`wave ${Math.floor(i / WAVE) + 1}/${waves} done: ${summary.written.length} written so far, ${summary.writeFailed.length} failed`)
  if (retry.length === wave.length && res2.every(r => !r)) { log('a whole wave failed twice (limit?); stopping the queue so it can resume later'); summary.stoppedEarly = true; break }
}
return summary