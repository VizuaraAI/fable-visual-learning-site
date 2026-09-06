export const meta = {
  name: 'vl-examine-50',
  description: 'Senior-CBSE-examiner recheck of the 50 Class 10 Science + Class 12 Physics/Chemistry/Biology guides on Sonnet, six at a time, editing in place and revalidating',
  phases: [
    { title: 'Examine', detail: '50 guides, waves of 6, Sonnet effort high', model: 'sonnet' },
  ],
}
const ROOT = '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-reimagined'
const WAVE = 6
const review = (args && Array.isArray(args.review)) ? args.review : []
const pad = n => (n < 10 ? '0' + n : '' + n)
const pathOf = it => `content/class-${it.c}/${it.ss}/${pad(it.i)}-${it.slug}.json`

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
  { label: `examine ${it.c} ${it.ss} ${it.slug}`, phase: 'Examine', agentType: 'general-purpose', model: 'sonnet', effort: 'high' })

const summary = { reviewed: [], reviewFailed: [], totalFixes: 0 }
phase('Examine')
log(`Examiner pass: ${review.length} guides, ${WAVE} at a time on Sonnet`)
const rwaves = Math.ceil(review.length / WAVE)
for (let i = 0; i < review.length; i += WAVE) {
  const wave = review.slice(i, i + WAVE)
  const res = await parallel(wave.map(it => () => reviewer(it)))
  wave.forEach((it, k) => {
    if (res[k]) {
      const txt = String(res[k])
      const m = txt.match(/fixes:\s*(\d+)/i)
      const n = m ? parseInt(m[1], 10) : null
      if (n !== null) summary.totalFixes += n
      summary.reviewed.push({ path: pathOf(it), fixes: n, review: txt.slice(0, 300) })
    } else summary.reviewFailed.push(pathOf(it))
  })
  log(`examine wave ${Math.floor(i / WAVE) + 1}/${rwaves} done: ${summary.reviewed.length} reviewed, ${summary.reviewFailed.length} failed, ${summary.totalFixes} fixes so far`)
  if (res.every(r => !r)) { log('a whole examiner wave failed (limit?); stopping so it can resume later'); break }
}
return summary