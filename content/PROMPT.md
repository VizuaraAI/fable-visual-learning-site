# Writer brief (read fully before starting)

You are writing the complete exam-preparation guide for one CBSE chapter for visuallearning.in, an Indian ed-tech site for Class 9–12 (3D animated lessons, visual notes, NCERT and PYQ solutions, quizzes). The guide must let a student prepare the whole chapter for the board exam from this one page.

## Steps

1. Read `content/SCHEMA.md` in this project folder. Your output must follow it exactly.
2. Research before writing (use WebSearch, and WebFetch on the most useful 2–3 results):
   - `"<chapter title>" class <N> important questions CBSE`
   - `"<chapter title>" class <N> previous year questions`
   - `"<chapter title>" class <N> most important questions youtube`
   - `"<chapter title>" NCERT solutions class <N>`
   Use what you find to decide which topics and questions recur. Do not copy text from those pages; write everything yourself.
3. Write the chapter JSON to the exact output path you were given. Cover the entire NCERT chapter, section by section, in NCERT order.
4. Validate: run `python3 -m json.tool <path> > /dev/null` and fix any error. Then run `python3 content/validate.py <path>` and fix everything it reports until it prints OK.
5. Reply with three lines: the path, the counts the validator printed, and any place where you were unsure about a fact (so it can be checked).

## Voice

Write like a calm, experienced CBSE teacher explaining to a student the week before the exam. Plain sentences, direct, no hype, no emojis, no "in this article". Contractions are fine. Say what the examiner wants to see. Where a derivation is asked in boards, give the derivation in full with the steps a marking scheme rewards.

## Maths and chemistry notation

HTML subset only: `<sub>`, `<sup>`, `<b>`, `<i>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<br>`. Unicode for symbols: → ⇌ Δ π ε μ λ ν ω θ ° × ÷ ≤ ≥ ≈ ∝ √ ∑ ∫ ½. Chemical equations as `2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O`. Never LaTeX, never `$`.

## Size

There is no word cap. A complete guide for a full NCERT chapter usually lands between 8,000 and 14,000 words; write what the chapter needs and stop. Never trim correct, exam-relevant content to hit a number, and never spend time splitting or shortening a finished draft. Quality over padding: every question needs a complete, exam-ready answer, but do not repeat the same point in three places. Keep research to at most 4 searches and 3 page fetches.

## Before you finish (do this, it is the accuracy pass)

1. Reread every MCQ in `pyq` and `practice_mcq`: confirm the marked option is the only correct one.
2. Recompute every numerical answer from scratch; fix any mismatch between the working and the final value.
3. Check each formula, constant and definition against NCERT wording.
4. Remove any PYQ year you are not sure of (set it to null).
5. Only then run the validator and reply.
