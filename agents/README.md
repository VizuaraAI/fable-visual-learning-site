# The agent workflows, as they ran

These are the Claude Code Workflow scripts that wrote and examined the chapter guides, copied here unchanged from the session records (only the absolute project path inside them is local to the machine they ran on). Each one queues chapters, launches subagents in small waves, and returns a summary. The writer prompt every agent received is the `writerPrompt` template; the examiner prompt is the `reviewer` template. `content/PROMPT.md` and `content/SCHEMA.md` are the two documents the prompts point at.

| Script | What it did |
|---|---|
| `vl-chapter-guides-a2-wf_5be065ed-8ad.js` | Write the remaining Class 12 Physics and Chemistry preparation guides for visuallearning.in |
| `vl-chapter-guides-b2-wf_abb8ab77-dd0.js` | Write one CBSE preparation guide per chapter (Class 11, Class 9, Biology) for visuallearning.in |
| `vl-chapter-guides-paced-2-wf_a7d16ee8-a14.js` | Write the remaining 33 CBSE preparation guides, three chapters at a time, full brief |
| `vl-chapter-guides-paced-wf_b9debe11-63e.js` | Write the remaining CBSE preparation guides, three chapters at a time, full brief |
| `vl-chapter-guides-wf_dc0c9eb1-d2c.js` | Write and fact-check one CBSE preparation guide per chapter for visuallearning.in |
| `vl-examine-50-wf_14559604-135.js` | Senior-CBSE-examiner recheck of the 50 Class 10 Science + Class 12 Physics/Chemistry/Biology guides on Sonnet, six at a time, editing in place and revalidating |
| `vl-finish-all-wf_35fdf8e1-73f.js` | Write the last 30 CBSE guides (12 Bio then 11 Bio) three at a time with a deploy after each subject, then examine all 50 Class 10 + Class 12 guides three at a time, then final deploy |
| `vl-write-11bio-missing-wf_18e03459-833.js` | Write the missing Class 11 Biology CBSE guides (chapters 12-19) three at a time with the saved writer prompt, one retry per empty writer |

The table is alphabetical. In the order they ran: `vl-chapter-guides` (4 September, the first writer-and-checker version), then `b2` and `a2` (larger batches, split by class), then `paced` and `paced-2` (where the wave size settled at three writers at a time with the full brief), then on 5 September `vl-finish-all` (the fullest version: writers, a deploy after each subject, then the examiner pass), `vl-write-11bio-missing` (the last eight Class 11 Biology chapters, relaunched after a session limit), and `vl-examine-50` (the final examiner run on Sonnet, six guides at a time).
