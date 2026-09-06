# Chapter guide schema (one JSON file per chapter)

Every chapter page on the site is rendered from one JSON file that follows this shape exactly. Keys are required unless marked optional. All prose values are plain text or a small HTML subset: `<p>`, `<ul>`, `<ol>`, `<li>`, `<b>`, `<i>`, `<sub>`, `<sup>`, `<br>`. No headings inside values, no images, no LaTeX. Write maths with Unicode and sub/sup, e.g. `F = (1/4πε<sub>0</sub>) · q<sub>1</sub>q<sub>2</sub>/r<sup>2</sup>`, `ΔH = −92.4 kJ mol<sup>−1</sup>`, `v<sup>2</sup> = u<sup>2</sup> + 2as`.

```json
{
  "class": 12,
  "subject": "Physics",
  "chapter_no": 1,
  "slug": "electric-charges-and-fields",
  "title": "Electric Charges and Fields",
  "summary": "One or two sentences on what the chapter covers and why it matters for the exam.",
  "exam_profile": {
    "weightage": "Plain text: how many marks this chapter typically carries in the board paper (say 'about 8 marks' only if reasonably sure; otherwise describe the unit it belongs to).",
    "question_types": [
      {"type": "MCQ", "marks": 1, "note": "What is usually asked in this form from this chapter."},
      {"type": "Assertion–Reason", "marks": 1, "note": "..."},
      {"type": "Very short answer", "marks": 2, "note": "..."},
      {"type": "Short answer", "marks": 3, "note": "..."},
      {"type": "Long answer", "marks": 5, "note": "..."},
      {"type": "Case-based", "marks": 4, "note": "..."}
    ],
    "hot_topics": ["Topics that come up most often, in priority order, 5–8 items"]
  },
  "sections": [
    {
      "heading": "Section title as in NCERT (e.g. 1.6 Coulomb's Law)",
      "pyq_years": [2023, 2020],
      "body": "HTML subset. 150–400 words. Teach the idea plainly, the way a good teacher explains it in class, including the derivation where the board asks for it.",
      "formulas": [
        {"expr": "F = (1/4πε<sub>0</sub>) · |q<sub>1</sub>||q<sub>2</sub>|/r<sup>2</sup>", "where": [["F", "electrostatic force (N)"], ["ε<sub>0</sub>", "permittivity of free space, 8.85 × 10<sup>−12</sup> C<sup>2</sup> N<sup>−1</sup> m<sup>−2</sup>"]]}
      ],
      "tip": "Optional. One exam tip or common trap for this section."
    }
  ],
  "key_terms": [{"term": "Quantisation of charge", "definition": "One or two sentences."}],
  "formula_sheet": [{"name": "Coulomb's law", "expr": "...", "note": "when it applies / units"}],
  "diagrams": [{"title": "Field lines of a dipole", "how_to_draw": "What to draw and label so it earns full marks; 2–4 sentences."}],
  "ncert_questions": [
    {"kind": "exercise", "number": "1.1", "q": "Question text.", "a": "Complete model answer with working. HTML subset.", "marks": 2}
  ],
  "pyq": [
    {"type": "MCQ", "year": "CBSE 2023", "marks": 1, "q": "...", "options": ["...", "...", "...", "..."], "answer": "b", "solution": "Why, in 1–3 sentences."},
    {"type": "Assertion–Reason", "year": null, "marks": 1, "q": "Assertion (A): ... Reason (R): ...", "options": ["Both A and R are true and R is the correct explanation of A", "Both A and R are true but R is not the correct explanation of A", "A is true but R is false", "A is false but R is true"], "answer": "a", "solution": "..."},
    {"type": "VSA", "year": "CBSE 2022", "marks": 2, "q": "...", "answer": "Model answer as it should be written in the exam, with the marking points.", "solution": ""},
    {"type": "SA", "year": null, "marks": 3, "q": "...", "answer": "...", "solution": ""},
    {"type": "LA", "year": "CBSE 2020", "marks": 5, "q": "...", "answer": "...", "solution": ""},
    {"type": "Case", "year": null, "marks": 4, "q": "Passage followed by the sub-questions (i)–(iv) in the same string, separated by <br>.", "answer": "Answers to each sub-question.", "solution": ""}
  ],
  "practice_mcq": [
    {"q": "...", "options": ["...", "...", "...", "..."], "answer_index": 2, "explanation": "One or two sentences."}
  ],
  "common_mistakes": ["Plain sentences. What students get wrong and how the examiner penalises it."],
  "strategy": "HTML subset, 150–300 words: how to prepare this chapter, what to memorise, what to derive, how to allocate time.",
  "revision_checklist": ["Short checkable items, 10–15 of them."],
  "videos": [{"id": "nN9n3quiJto", "title": "Electric Charges and Fields · full chapter"}]
}
```

## Minimum counts

| key | minimum |
|---|---|
| sections | every NCERT section of the chapter, usually 6–14 |
| key_terms | 12 |
| formula_sheet | 8 (biology chapters: 8 key facts/values instead) |
| diagrams | 3 |
| ncert_questions | 10, the ones most often asked |
| pyq | 22 total: at least 6 MCQ, 3 Assertion–Reason, 4 VSA, 4 SA, 3 LA, 2 Case |
| practice_mcq | 15 |
| common_mistakes | 6 |
| revision_checklist | 10 |

## Accuracy rules (absolute)

- Put a year on a PYQ only if you are sure that question (or a very close variant) appeared in that CBSE board paper or sample paper. Otherwise set `"year": null`; the page will label it "Frequently asked".
- Work every numerical answer twice. Show the working in the answer.
- Options in MCQs must contain exactly one correct option and `answer` / `answer_index` must point to it.
- Do not invent statistics, weightages or years. If unsure, say "typically" or describe the unit.
- Definitions and formulas must match NCERT. Use NCERT symbols.
