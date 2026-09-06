export const meta = {
  name: 'vl-finish-all',
  description: 'Write the last 30 CBSE guides (12 Bio then 11 Bio) three at a time with a deploy after each subject, then examine all 50 Class 10 + Class 12 guides three at a time, then final deploy',
  phases: [
    { title: 'Write 12 Bio', detail: '11 chapters, waves of 3' },
    { title: 'Deploy', detail: 'build_site.py + vercel --prod after each subject and at the end' },
    { title: 'Write 11 Bio', detail: '19 chapters, waves of 3' },
    { title: 'Examine', detail: '50 Class 10 + 12 guides, senior-examiner recheck, waves of 3' },
  ],
}
const ROOT = '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-reimagined'
const WAVE = 3
const write = (args && Array.isArray(args.write)) ? args.write : []
const review = (args && Array.isArray(args.review)) ? args.review : []
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

const writer = (it, attempt) => agent(writerPrompt(it), { label: `write ${it.c} ${it.ss} ${it.slug}${attempt ? ' (retry)' : ''}`, phase: `Write ${it.c} Bio`, agentType: 'general-purpose' })

const deployer = (tag) => agent(`Project folder: ${ROOT}

Run exactly this and wait for it to finish (it can take a few minutes):
  cd "${ROOT}" && ./deploy.sh 2>&1 | tail -40

It builds the study site with build_site.py, rsyncs site/ into visuallearning-concept/ and runs vercel deploy --prod. Do not edit any file. If build_site.py fails, report the full error text. Reply with two lines: the production URL vercel printed (or the error), and the number of chapter JSON files under content/ (\`find content -name '*.json' -path '*class-*' | wc -l\`).`,
  { label: `deploy ${tag}`, phase: 'Deploy', effort: 'low' })

const reviewer = it => agent(`Project folder: ${ROOT}

You are a senior CBSE examiner checking a generated preparation guide for factual accuracy before it is published. File: ${pathOf(it)} (Class ${it.c} ${it.s}, "${it.t}"). Read content/SCHEMA.md, then read the JSON file in full.

Check and fix, editing the JSON file in place:
1. Every MCQ key ("answer" letter in pyq, "answer_index" in practice_mcq) points at the one correct option. Recompute every numerical answer; correct the working if wrong.
2. Every formula, definition, law statement, unit, constant, name and value matches NCERT. Chemical equations are balanced.
3. PYQ years: keep a year only if you are confident that question appeared in that CBSE paper or sample paper; otherwise set "year": null.
4. Sections cover the whole NCERT chapter in NCERT order; nothing from the rationalised syllabus is missing and nothing deleted from it is presented as examinable.
5. Notation: HTML sub/sup and Unicode only, no LaTeX or $.
Do not shorten content. Keep the JSON valid. Run \`python3 content/validate.py ${pathOf(it)}\` until it prints OK.

Reply with exactly two lines: "fixes: <number>" and a brief comma-separated list of what you corrected (or "none").`,
  { label: `examine ${it.c} ${it.ss} ${it.slug}`, phase: 'Examine', agentType: 'general-purpose', effort: 'high' })

const summary = { written: [], writeFailed: [], deploys: [], reviewed: [], reviewFailed: [] }

async function writeWaves(items, tag) {
  log(`${tag}: ${items.length} chapters queued, ${WAVE} at a time`)
  const waves = Math.ceil(items.length / WAVE)
  for (let i = 0; i < items.length; i += WAVE) {
    const wave = items.slice(i, i + WAVE)
    const res = await parallel(wave.map(it => () => writer(it, 0)))
    const retry = wave.filter((it, k) => !res[k])
    let res2 = []
    if (retry.length) {
      log(`${tag} wave ${Math.floor(i / WAVE) + 1}: ${retry.length} writer(s) returned nothing, retrying once`)
      res2 = await parallel(retry.map(it => () => writer(it, 1)))
    }
    wave.forEach((it, k) => {
      const r = res[k] || res2[retry.indexOf(it)]
      if (r) summary.written.push({ path: pathOf(it), result: String(r).slice(0, 200) })
      else summary.writeFailed.push(pathOf(it))
    })
    log(`${tag} wave ${Math.floor(i / WAVE) + 1}/${waves} done: ${summary.written.length} written so far, ${summary.writeFailed.length} failed`)
    if (retry.length === wave.length && res2.every(r => !r)) { log('a whole wave failed twice (limit?); stopping the queue so it can resume later'); return false }
  }
  return true
}

const bio12 = write.filter(it => it.c === 12)
const bio11 = write.filter(it => it.c === 11)

let ok = await writeWaves(bio12, 'Class 12 Biology')
const d1 = await deployer('after 12 Bio'); summary.deploys.push(String(d1).slice(0, 300))
if (!ok) return summary

ok = await writeWaves(bio11, 'Class 11 Biology')
const d2 = await deployer('after 11 Bio'); summary.deploys.push(String(d2).slice(0, 300))
if (!ok) return summary

log(`Examiner pass: ${review.length} guides, ${WAVE} at a time`)
const rwaves = Math.ceil(review.length / WAVE)
for (let i = 0; i < review.length; i += WAVE) {
  const wave = review.slice(i, i + WAVE)
  const res = await parallel(wave.map(it => () => reviewer(it)))
  wave.forEach((it, k) => { if (res[k]) summary.reviewed.push({ path: pathOf(it), review: String(res[k]).slice(0, 240) }); else summary.reviewFailed.push(pathOf(it)) })
  log(`examine wave ${Math.floor(i / WAVE) + 1}/${rwaves} done: ${summary.reviewed.length} reviewed, ${summary.reviewFailed.length} failed`)
  if (res.every(r => !r)) { log('a whole examiner wave failed (limit?); stopping so it can resume later'); break }
}

const d3 = await deployer('final'); summary.deploys.push(String(d3).slice(0, 300))
return summary