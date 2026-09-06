# Visual Learning: the site, and how it was made

This repository is the source of **https://visuallearning-concept.vercel.app**, a rebuild of visuallearning.in done on 4 and 5 September 2026 with Claude Fable 5.1 running inside Claude Code. The landing page, the 104 chapter preparation guides, the animated hero, the theme system, the recorded narration and the four alternative home pages were all written by the model and its subagents. The people involved decided what to build, read the results, and sent things back when they were not good enough. Nothing here needs a build server: the whole site is static files.

## What is on the site

- **A landing page** for Class 9 to 12: the channel, how a chapter is taught (watch, read, solve, practise, test), a live lesson on the electric motor, the curriculum, a practice quiz, plans and founders.
- **A live 3D hero.** The first screen is a 44-second dive into a living cell, drawn in the browser with three.js as you watch: the membrane opens, the camera passes the mitochondria, orbits the nucleus, goes in through a pore to the DNA, and pulls back out. Captions carry the explanation; there is no voiceover.
- **104 chapter guides**, one page per NCERT chapter: Class 9 Science (12), Class 10 Science (13), Class 11 Physics, Chemistry and Biology (14, 9, 19), Class 12 Physics, Chemistry and Biology (14, 10, 13). Each guide has an exam profile (weightage, the six CBSE question types, hot topics), every NCERT section taught in order with its formulas and a tip, key terms, a formula sheet (key facts for biology), diagrams with how-to-draw notes, solved NCERT questions, a set of board-style questions with answers, a practice quiz with explanations, common mistakes, a preparation strategy, a revision checklist, and the channel's video where one exists.
- **117 pages in all**: the landing, four class hubs, eight subject pages, the 104 guides, plus site search and a sitemap.
- **Light by default, with a dark toggle** on every page. The hero and the lesson player stay dark because they are scenes.

Counted from the JSON files in `content/`:

| Resource | Total |
|---|---|
| Taught sections | 1,194 |
| Key terms defined | 2,017 |
| Formula-sheet entries | 1,290 (plus 1,476 formulas inside sections) |
| Diagrams with drawing notes | 624 |
| NCERT questions solved | 1,478 |
| Board-style questions with answers | 2,738 (MCQ 790, Assertion–Reason 380, VSA 513, SA 494, LA 344, case-based 217) |
| Practice quiz MCQs | 1,783 |
| Common mistakes | 892 |
| Revision checklist items | 1,543 |
| Words of content | about 1.38 million |

Of the board-style questions, 410 carry a CBSE year the examiner pass was confident of; the other 2,328 are labelled "frequently asked".

## How it was made

Four pieces, in the order they happened.

### 1. The landing page (4 September, morning)

`src/index.html`, `src/styles.css` and `src/app.js` are the page. `build.py` inlines the CSS, the JS and every image into one HTML file (`dist/index.html`), and reads `content/curriculum.json` to build the curriculum table. The design brief was an editorial dark look: Playfair Display italic for headings, Instrument Sans for text, IBM Plex Mono for labels, a pill nav and a violet call to action, merged with the channel's own video grammar (cyan label pills, the typed definition box, the serif "thanks for watching" card).

### 2. The chapter guides (4 September afternoon to 5 September noon)

This is the part that took the most machine time, and the part worth copying.

- `content/curriculum.json` lists the 104 chapters with slug, title, the channel's YouTube id where a full-chapter video exists, and rough size.
- Each chapter is one JSON file at `content/class-N/<subject>/NN-slug.json`, in the exact shape described by `content/SCHEMA.md`. The schema fixes the sections and their minimum counts (at least 22 board questions across six types, 15 quiz questions, 10 NCERT questions, 12 key terms, and so on) and the accuracy rules (a year on a question only when sure, every numerical worked twice, NCERT wording and symbols).
- `content/PROMPT.md` is the brief every writer agent received: read the schema, do at most four web searches on what the board asks from this chapter, write the whole chapter in NCERT order in the voice of a calm teacher the week before the exam, run `content/validate.py` until it prints OK, then do a named accuracy pass before replying.
- The fan-out was done with Claude Code's Workflow tool. `agents/` holds the scripts as they ran: a JavaScript file that queues chapters and launches writer agents three at a time, retries a writer once if it returns nothing, and stops the queue when a whole wave fails so it can be resumed later with only the missing chapters. A writer typically used 150,000 to 240,000 tokens; a wave of three took 10 to 25 minutes.
- The examiner pass. Once all 104 guides were on disk, a second workflow sent the 50 board-class guides (Class 10 Science, Class 12 Physics, Chemistry and Biology) to an agent briefed as a senior CBSE examiner: recheck every MCQ key and numerical answer, every formula, unit, constant and definition against NCERT, every question year, the section coverage against the rationalised syllabus, and edit the file in place, revalidating. Two runs made 342 corrections: 66 across the first 8 guides, then 276 across the remaining 42, the second run on Sonnet six at a time in 69 minutes. The commonest fixes were unverifiable question years removed (including several invented "CBSE 2026" ones), wrong MCQ keys or options, unit and constant slips, off-by-one NCERT section numbers, and deleted-syllabus content taken out. The Class 9 and Class 11 guides have not had this pass.
- `build_site.py` turns the JSON into the pages, the search index and the sitemap, and `deploy.sh` builds, syncs and deploys to Vercel.

### 3. The hero, and the four home-page concepts (5 September afternoon)

`hero-concepts/` holds four complete alternative home pages, each opening on a live three.js scene: a dive into a cell, an electric motor that comes apart as you scroll, one continuous zoom from a leaf to a magnesium atom, and a nerve impulse chased down an axon to the synapse. They are live at https://visuallearning-heroes.vercel.app. The cell dive was chosen and became the hero of the real site: `static/hero/cell-hero.js` is the scene, `static/hero/shared.js` is the small engine under all four (renderer with bloom, a keyed camera director, a glass shader for membranes and organelles, captions and dots), and `static/hero/three.min.js` plus the post-processing files are three.js r128, vendored so nothing depends on a CDN.

### 4. Theme and narration (5 September evening)

Both stylesheets are token-based, with the light values on `:root` and the dark ones under `[data-theme="dark"]`; translucent colours use rgb triplets so they flip with the theme. `static/hero/theme.js` is the toggle (a sun that slides and becomes a crescent moon, with the page changing through a circular reveal from the button) and remembers the choice in the browser. The six lines of the motor lesson were recorded with the same ElevenLabs voice the channel's video pipeline uses, in English and in Hindi, by `tools_narration.py`; the clips live in `static/hero/narration/` and the lesson's step timing follows their lengths.

## Repository layout

```
src/                 landing page source (index.html, styles.css, app.js)
build.py             inlines src/ + assets/ into dist/index.html
content/             curriculum.json, SCHEMA.md, PROMPT.md, validate.py, and the 104 chapter JSON files
build_site.py        content -> site/ (landing, hubs, subject pages, guides, search index, sitemap)
static/site.css      stylesheet for the guide pages
static/guide.js      search, quiz, accordions and lightbox on the guide pages
static/hero/         the hero scene, the shared 3D engine, the theme toggle, vendored three.js, narration clips
tools_narration.py   re-records the lesson narration (needs ELEVENLABS_API_KEY and ffmpeg)
deploy.sh            build_site.py, rsync, vercel deploy --prod
agents/              the Workflow scripts that wrote and examined the guides, as they ran
hero-concepts/       the four alternative home pages
assets/              logo, founder photos, video thumbnails
```

## Run it locally

```
python3 build_site.py
python3 -m http.server 4173 --directory site
```

The build needs only Python 3. Re-recording narration needs `ffmpeg` and an ElevenLabs key in the `ELEVENLABS_API_KEY` environment variable. Deploying needs the Vercel CLI logged in to the project. There are no secrets in this repository.

## Add or rewrite a chapter

1. Add the chapter to `content/curriculum.json` (slug, title, YouTube id or null).
2. Give an agent the writer prompt from `agents/vl-finish-all-wf_35fdf8e1-73f.js` (the `writerPrompt` template) together with `content/PROMPT.md` and `content/SCHEMA.md`. It writes the JSON file and validates it.
3. Give a second agent the examiner prompt from the same file (the `reviewer` template) for that file.
4. `python3 build_site.py`, then `./deploy.sh`.

The same recipe, pointed at a different schema and brief, produces a different kind of page. The pieces that made it work were the fixed schema with minimum counts, a validator the writer must satisfy before it may stop, small waves with one retry, and a separate examiner agent that edits in place.

## Not done

- The Class 9 and Class 11 guides (54) are written and validated but have not had the examiner pass.
- Only 36 chapters have a channel video linked; Class 11 Chemistry and Biology and Class 12 Biology have none yet.
- There are no separate workbooks or mock papers; the practice material lives inside each chapter guide.
- Only the motor lesson has recorded narration.

Built with Claude Fable 5.1 in Claude Code, 4 and 5 September 2026, for Visual Learning AI Pvt. Ltd.
