# Daily Nachrichts (personal project, not ProCMO work)

_Last updated: 2026-10-23 14:11 UTC (19:41 IST) by Claude Opus 5.5 (claude-opus-5-5)_

Static news site for Walrus in a plain imageboard layout: a front page listing three boards
(/tech/, /geo/, /india/) with popular threads, today's notes and the edition list; each board page
lists that section's stories as threads (expand to read the detail paragraphs and sources). A 0-100
criticality score per story. Served at https://news.walrus.codes by the assets-only Cloudflare Worker `daily-nachrichts` in Walrus's personal Cloudflare account, deployed by GitHub Actions on every push to main of https://github.com/JATIN-RAGHAV/daily-nachrichts (wrangler is never run locally). Vercel hosting was dropped on 2026-10-23 (owner ruling: "make this not deploy on vercel but deploy this as a worker on cloudflare", then "put this worker on news.walrus.codes"); the old Vercel deployment at daily-brief-delta-pied.vercel.app is no longer updated. Nothing here goes into
pro-cmo-brain or the Library of Alexandria: this is personal.

## Layout

| Path | Content |
|---|---|
| public/day.js | Day loader shared by every page: groups index.json by date and merges all Phoenix runs of one day into one view (each story once by id, newest run's version wins; title, notes and headline from the newest run). `?d=YYYY-MM-DD` picks a day; an old `?e=<file>` link opens its day. Owner request 2026-10-23: "group those on terms of date. and not create multiple categories." Run files are not changed. |
| public/index.html | Front page: boards, popular threads (top 10 by score), the day's headline and notes, one Editions line per date. Data comes from day.js (formerly /data/latest.json or `/?e=<file>`). The Editions list links to each edition's front page (owner request 2026-10-23: "those editions that I have at the bottom should open up the home page for that edition"); board and thread links keep `?e=` for a past edition. |
| public/tech/, public/geo/, public/india/ | One index.html per board (identical shells, `<body data-board>` differs). |
| public/board.js | Board renderer: threads sorted by score, `?d=` day via day.js (kept on the Home and board links for a past day), `?min=` filter, `#story-id` opens a thread. Each thread's dateline is the time of the run it came from. |
| public/style.css | The whole look: Yotsuba-B palette (#eef2ff page, #d6daf0 posts, #af0a0f titles), Arial 10pt, no web fonts. |
| public/data/YYYY-MM-DD.json | One edition. Never edited after the day it was published. |
| public/data/latest.json | Byte-for-byte copy of the newest edition. |
| public/data/index.json | List of editions, newest first, for the edition switcher. |
| wrangler.jsonc | Cloudflare Worker config: assets directory public/, custom domain news.walrus.codes (Cloudflare owns its DNS record), workers.dev off. |
| .github/workflows/deploy.yml | CI/CD: on push to main, validate latest.json, wrangler deploy, verify live. |
| public/_headers | Cache-Control for /data/* (60 s, must-revalidate). |
| vercel.json | Former Vercel config, kept for history only; not used since 2026-10-23. |

## How an update is done (when Walrus says "update the brief" or similar)

1. Gather, in parallel: Hacker News top 30 via the Firebase API (score, descendants, url, id);
   web searches for world/geopolitics, India (politics, economy, business, anything big),
   and what is trending in tech; Ground News front page and /interest/india via a web-fetch
   agent (gives source counts and bias splits). The owner's X feed is NOT reachable from
   here unless a browser session is connected; say so in the edition notes.
2. For each candidate story worth a card, fetch the primary page for the full-detail text.
3. Write public/data/YYYY-MM-DD.json using the schema in the existing edition. Score every
   story with the rubric below and show the raw inputs in the "heat" field. Mark anything
   resting on one source or on a claimant's own publication as "unverified": true.
4. Copy it to latest.json, prepend the edition to index.json, commit and push to main. GitHub
   Actions (.github/workflows/deploy.yml) runs wrangler deploy and checks the live page. Do not run
   wrangler deploy locally (owner ruling 2026-10-23: "you won't be using wrangler anylong for
   updating the worker's code").
5. Stamp: the edition's "generated" and "model" fields carry the time (from date -u and
   TZ=Asia/Kolkata date) and the model that wrote it.

## Criticality rubric (0-100)

A judgment composite of three inputs, each shown to the reader in the card's heat line:
- Platform heat: HN points and comments relative to the day's front-page maximum; Ground
  News source counts; X trend presence when observable.
- Breadth: how many distinct major outlets independently carry it (wire services, national
  papers, specialist press).
- Velocity: still escalating today versus a story that peaked days ago.
Bands: 85+ Critical (everyone is talking about it), 70-84 High, 40-69 Moderate, under 40 Low.
A story is not scored higher for being important; the score measures how much it is being
talked about. Importance goes in the summary text.

## Rules

- Editions are dated records: never edit a past edition's JSON. Fix a mistake by publishing
  a new edition or appending a correction note in the newer one.
- No credentials in the repo. Deploys run in GitHub Actions with the repo secrets
  CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID (set 2026-10-23; the token is a Workers-edit token
  from the owner's personal Cloudflare account). The local wrangler login is no longer used for deploys.
- news.walrus.codes is a Worker custom domain (since 2026-10-23 10:32 UTC): Cloudflare creates and owns
  its DNS record, so do not add or delete a record for `news` by hand. History: until then the Worker ran
  on a zone route that depended on an older proxied record pointing at a dead origin; that record was
  deleted between 08:49 and 10:21 UTC on 2026-10-23, the name went NXDOMAIN and the site was down until
  the switch (owner request: "fix that").
- Git identity: every commit is `Walrus <jrag137@gmail.com>` (GitHub account JATIN-RAGHAV), set in this
  repo's local git config and in Phoenix's publish.py. Owner ruling 2026-10-23: "all the commits made by my
  personal claude should be by my account on GH". Until then commits used priyanshutanwar249@gmail.com,
  which GitHub maps to a different account; all 15 earlier commits were rewritten and force-pushed on
  2026-10-23 on the owner's instruction, so commit hashes before 079c7cf differ from older notes.
- Branches (owner ruling 2026-10-23): never create a branch in this repo; commit straight to `main` and
  push after every commit. Owner's words: "for these local projects, don't create new branches, just push
  to the main, this includes this brief project and n9n. and also to just remind again don't put any data
  from these into the pcmo brain since all thsi is personal."
- Commit after each edition lands; git log is the change history. Remote: origin =
  https://github.com/JATIN-RAGHAV/daily-nachrichts (public, created 2026-10-23 on the owner's
  request). Push after every commit; publish.py pushes after committing an edition.

## Look, layout and type (owner rulings 2026-10-22 and 2026-10-23)

**Current (2026-10-23, later the same day):** the site looks like 4chan: plain, simple, Arial 10pt,
Yotsuba-B colours, boards on the front page, one board page per section, stories as threads.
Owner words: "don't put all in one page, make it so that, on the main page I see categories like I
see on 4chan and when I click on tech I see tech stuff. Also change the whole site's look. and make
it look more like 4chan with simple plain stuff". This supersedes both earlier type rulings below
(Comic Sans, then Newsreader/Inter/Plex Mono); the name "Daily Nachrichts" stands.

**Superseded (kept for history):**

**Type, current (2026-10-23):** headlines in Newsreader (serif), body in Inter, small labels and
heat lines in IBM Plex Mono, all from Google Fonts with system fallbacks. Owner words (2026-10-23):
"make the font look more professional". This supersedes the Comic Sans ruling below; the name
ruling stands.

**Superseded 2026-10-23 (kept for history):**

The site is called "Daily Nachrichts"; the word "brief" is not used in the page chrome. Every font role is Comic Sans (Comic Sans MS, with Comic Neue from Google Fonts as fallback). Owner words: "make it so that it says nachrichts instead of saying brief. Also change the font and change it to comic sans". Past edition JSON files are not rewritten for the rename.

## Phoenix (2026-10-23)

The update cycle is the user-level skill `~/.claude/skills/phoenix/SKILL.md` (canonical procedure; helpers in `~/.claude/skills/phoenix/scripts/`: `fetch-hn.sh` and `publish.py`). "run Phoenix" in any session means: load that skill and follow it. This file keeps the schema and rubric; the skill keeps the procedure. Plan of record: `~/library-of-alexandria/projects/phoenix/phoenix-plan.md`.
