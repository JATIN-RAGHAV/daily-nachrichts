# Daily Nachrichts (personal project, not ProCMO work)

_Last updated: 2026-10-31 04:27 UTC (09:57 IST) by Claude Opus 5.5 (claude-opus-5-5)_

Static news site for Walrus in a plain imageboard layout: a front page listing five news boards
(/tech/, /geo/, /krieg/, /ind/, /cinema/; /cinema/ added 2026-10-27, /krieg/ 2026-10-30) with popular threads, today's notes and the edition list; each board page
lists that section's stories as threads (expand to read the detail paragraphs and sources). A 0-100
criticality score per story. Served at https://news.walrus.codes by the assets-only Cloudflare Worker `daily-nachrichts` in Walrus's personal Cloudflare account, deployed by GitHub Actions on every push to main of https://github.com/JATIN-RAGHAV/daily-nachrichts (wrangler is never run locally). Vercel hosting was dropped on 2026-10-23 (owner ruling: "make this not deploy on vercel but deploy this as a worker on cloudflare", then "put this worker on news.walrus.codes"); the old Vercel deployment at daily-brief-delta-pied.vercel.app is no longer updated. Nothing here goes into
pro-cmo-brain or the Library of Alexandria: this is personal.

## Layout

| Path | Content |
|---|---|
| public/day.js | Day loader shared by every page: groups index.json by date and merges all Phoenix runs of one day into one view (each story once by id, newest run's version wins; title, notes and headline from the newest run). `?d=YYYY-MM-DD` picks a day; an old `?e=<file>` link opens its day. Owner request 2026-10-23: "group those on terms of date. and not create multiple categories." Run files are not changed. |
| public/index.html | Front page: no Boards box (owner request 2026-10-23: "remove the boards section"; boards are reached from the top and bottom board lists), "Zurzeit Threads" (renamed from Popular Threads on owner request 2026-10-23), grouped by news board (/tech/, /geo/, /ind/, and /cinema/ from 2026-10-27) with each board's five loudest threads (owner request 2026-10-23: "only 3 /category/ things on in that zurzeit thing", when there were three boards), the day's headline and notes, one Editions line per date. Data comes from day.js (formerly /data/latest.json or `/?e=<file>`). The Editions list links to each edition's front page (owner request 2026-10-23: "those editions that I have at the bottom should open up the home page for that edition"); board and thread links keep `?d=` for a past day. |
| public/tech/, public/geo/, public/ind/ | One index.html per board (identical shells, `<body data-board>` differs). The India board is shown as /ind/ (owner request 2026-10-23: "chagne the name to IND instead of india"); its section id in the data stays `india`, so editions, CI and publish.py are unchanged. |
| public/_redirects | /india/ and anything under it redirect (301) to /ind/; /wort/ redirects (301) to / since 2026-10-30. |
| public/krieg/index.html | The /krieg/ board (added 2026-10-30): every war and armed conflict worldwide (Iran, Ukraine, Gaza, Sudan and the rest), section id `krieg`, placed after geo. War stories no longer go on /geo/. Days before 2026-10-30 have no krieg section; their war stories stay on /geo/ (past editions are not edited), and the board says so. /kreig/ redirects here. |
| public/cinema/index.html | The /cinema/ board (added 2026-10-27): Hollywood and Bollywood movie news in one board, section id `cinema`, same shell as the other boards. Days before 2026-10-27 have no cinema section; the board says so. |
| archive/wort/ | The former /wort/ board (page, wort.js, wort.json), removed from the site 2026-10-30 on owner request ("also remove the wort section."). Kept unchanged, not served; /wort/ redirects to /. See archive/wort/README.md. |
| public/board.js | Board renderer: threads sorted by score, an optional per-story `about` shown first as an "About" post when a thread is expanded (added 2026-10-27: who or what a less-known subject is; left out for well-known names, rule in the Phoenix skill step 6), `?d=` day via day.js (kept on the Home and board links for a past day), `?min=` filter, `#story-id` opens a thread. Each thread's dateline is the time of the run it came from. |
| public/card.js | Thread as an image (added 2026-10-30): each thread on a board page has a [Save] link (named [Image] until 2026-10-31, owner request: "instead of 'image', change it to 'save'"), and a [Share] link, always shown (owner 2026-10-30: "I don't see the share button, it is supposed to be there"): the share sheet with the image attached where the browser can share files, else the share sheet with the title and link, else the image downloads and WhatsApp opens with the link (owner request 2026-10-30: "a share option that when I am doing this from mobile, I can just share it directly on whatsapp"). [Image] that downloads the whole thread (title, score, summary, heat, About, every detail paragraph, sources, link back) as one PNG drawn on a canvas in the site's colours. board.js loads card.js on the first click, so it works for every edition, past and new, with no change to the edition files. Owner request 2026-10-30: "make it so that on each new article I can click on a button and I set an option to download that as an image, that image will contain the whole brief". |
| public/og.png, og-source/og.html | Link-preview image (1200x630 PNG, site colours) shown when a page is shared on WhatsApp and elsewhere; every page carries og: and twitter: meta tags pointing at https://news.walrus.codes/og.png, each with its own title and description. Owner request 2026-10-27: "put something there so that when I send it on whatsapp to someone they see a thumbnail." To redraw it (for example after adding a board), edit og-source/og.html and run: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --force-device-scale-factor=1 --screenshot=public/og.png "file://$PWD/og-source/og.html"`. WhatsApp caches a preview per URL, so a changed image can take a while to show for a link already sent. |
| public/style.css | The whole look: Yotsuba-B palette (#eef2ff page, #d6daf0 posts, #af0a0f titles), Arial 10pt, no web fonts. |
| public/data/YYYY-MM-DD.json | One edition. Never edited after the day it was published. |
| public/data/latest.json | Byte-for-byte copy of the newest edition. |
| public/data/index.json | List of editions, newest first, for the edition switcher. |
| worker/index.js | The Worker script (added 2026-10-30), run only for /api/*: likes. `GET /api/likes?keys=` returns counts, `POST /api/like {key, op}` adds or removes one. Key = `<YYYY-MM-DD>/<story id>`. Counts live in the SQLite Durable Object `Likes`; they never go below 0. No identity check (owner ruling 2026-10-30: "you don't have to put a server side or user side verification for user indentity, you can just make it so that when a user reclicks on the like button, it gets sent a s unlike ... Unless they are sending direct backend requests which is fine."). board.js shows [Like n] on each thread, remembers this browser's likes in localStorage (`nachrichts-liked`), and sends unlike on the second tap. |
| wrangler.jsonc | Cloudflare Worker config: main worker/index.js for /api/* only (run_worker_first), Durable Object binding LIKES with migration v1, assets directory public/, custom domain news.walrus.codes (Cloudflare owns its DNS record), workers.dev off. |
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

- Clear statements (owner rule 2026-10-31: "just remember from now on to make the statements clear."): every title and
  summary reads correctly on its own; when a sentence joins two people, films or figures, each is tied to its own
  subject. Trigger: the IIFA title of 2026-10-31 read as if Aneet Padda won for Dhurandhar (she won for Saiyaara);
  corrected in run 2026-10-31-2. Details in the Phoenix skill, step 6.
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

## Scheduled Phoenix runs (2026-10-24)

Owner request 2026-10-24: "Can you automate this whole Phoenix process and also always make sure that none of
this goes to PCMO brain?" Choices made the same day: twice daily at 07:00 and 19:00 IST, on this Mac (launchd),
with a scoped allowlist instead of skipping permission checks.

| Piece | Path |
|---|---|
| launchd job `codes.walrus.phoenix` | `~/Library/LaunchAgents/codes.walrus.phoenix.plist` (a slot missed while the Mac sleeps runs on wake) |
| Runner | `~/.claude/skills/phoenix/scripts/auto-run.sh`: lock, wait for network, `git pull --ff-only`, then `claude -p "run phoenix" --permission-mode dontAsk` with an allowlist (web search and fetch, agents, writes only to `public/data/` and `/private/tmp/`, the two Phoenix scripts, read-only git/gh/curl). 90-minute hard stop; `caffeinate` while it runs. |
| Logs | `~/Library/Logs/phoenix/<date>-<HHMM>.log` (one per run) and `launchd.log` |

Keeping it out of pro-cmo-brain, in layers: the run starts in this folder, outside the pcmo work tree; its
session id goes into `~/.claude/personal-sessions` before it starts; the allowlist cannot write outside this
project; and a local pre-commit hook in pro-cmo-brain (`.git/hooks/pre-commit`, not committed there) rejects any
commit that mentions Daily Nachrichts, news.walrus.codes, daily-nachrichts, projects/daily-brief or skills/phoenix.
Enforcement: Automated for all four; tested 2026-10-24 (guard blocked a test commit in a scratch repo).

Pause: `launchctl bootout gui/$(id -u)/codes.walrus.phoenix`. Resume:
`launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/codes.walrus.phoenix.plist`. Run now:
`launchctl kickstart gui/$(id -u)/codes.walrus.phoenix`.

Known limits: the Mac must be on (asleep is fine, off is not); publish.py stages with `git add -A`, so any stray
untracked file in the repo is committed with the next edition.

## Wort board (2026-10-25; removed 2026-10-30)

**Removed 2026-10-30.** Owner request: "also remove the wort section." The board is gone from the site and its files are in `archive/wort/`. The text below is kept for history and no longer applies.

Owner request 2026-10-25: "add another section to it. call it wort. Where you will put words that I tell you
to daily. It should include the worlds' oxfored dictionary's definition and it's example use in places which
makese sense. keep 3-4 example uses and proper definitions, like if it is used as a nount and as a verb then,
definition for both. Also put their synonyms there." First words: tumultuous and consecrated.

How to add words (when Walrus names them): add a new object at the top of `days` in `public/data/wort.json`
with that day's date, one entry per word: `id`, `word`, `pron` (uk, us), `forms`,
`senses` (one per sense: `pos`, `def`, optional `label`, `source`, `examples`), `synonyms` (groups with `for`
and `words`), `opposites`, `origin`, optional `note`, `sources`. Update `updated` and `model`. Commit and push
to main; the GitHub Actions deploy publishes it.

- Spelling: if Walrus misspells a word, use only the correct spelling everywhere (data and page) and do not
  mention the misspelling. Owner ruling 2026-10-25: "i gave you wrong spelling for tumultuous, you should have
  fixed that and only put the proper spelling there."
- Definitions: Oxford Learner's Dictionaries (free; the full OED needs a login). Its pages return HTTP 403 to
  automated fetches, so wording comes from web search results that quote it. When a sense's wording is from a
  search summary, or from another dictionary because Oxford has no entry, its `source` says so. Do not use
  tricks to get past Oxford's bot check.
- Examples: 3 to 4 per word in total, written for the page (not copied from a dictionary), in contexts where the
  word fits. Every part of speech gets its definitions even when it has no example.
- Phoenix never writes wort.json and the CI check does not read it. The Zurzeit box on the front page stays
  limited to the news boards (ruling of 2026-10-23: one group per board); /wort/ is reached from the board list.
  Since 2026-10-27 the news boards are four (cinema added), so Zurzeit shows four groups; open question put to
  Walrus the same day.

## Krieg board (2026-10-30)

Owner request 2026-10-30: "add a section about war there, name it kreig, It shall have all the war related things that
happen around the world. like Iran war and ukrain war. and remove the war stuff from the geo section."

- Every edition from 2026-10-30-2 on has five sections, `tech`, `geo`, `krieg`, `india`, `cinema`, in that order
  (publish.py checks this, and that no story id is on two boards). The CI check accepts three, four or five sections.
- /geo/ keeps geopolitics that is not war; anything about a war or armed conflict goes on /krieg/ (rules in the
  Phoenix skill, step 2a).
- Run 2026-10-30-2 moved that day's six war stories from geo to krieg under the same ids. public/day.js shows a story
  that moved boards between runs once, on its newest board, and a story with its own `generated` field (a story
  carried over unchanged into a later run) keeps that time on its dateline.

## Cinema board (2026-10-27)

Owner request 2026-10-27: "I want you to add another section to daily nachricht site, from now on you will also
get movie news, hollywood and bollywood in the same cinema category. For this you can goto moctale.in and other
places where people can find movie news, you can goto reddit and stuff, now make a run for it and make that
category now."

- Phoenix writes it: every edition from 2026-10-27-2 on has four sections, `tech`, `geo`, `india`, `cinema`, in
  that order (publish.py checks this). The CI check accepts three or four sections, so older editions stay valid.
- Sources: movie subreddits via `~/.claude/skills/phoenix/scripts/fetch-reddit.sh` (RSS; the JSON API is 403 and
  Reddit allows about one request a minute), trade press, Indian box office sites. Moctale is behind a Cloudflare
  bot check (403 to automated fetches); it is read only through a connected browser or search results quoting it.
- Film news goes on /cinema/, not on the India board.

## X accounts for politics (2026-10-27)

Owner request 2026-10-27: "for political stuff about india and world you should goto X and look at arvind's tweeets.
and if they seem good enough then put them on the board", then "by arving I meant this https://x.com/aravind. and
also add keshav bedi to the list https://x.com/keshavbedi." Phoenix reads https://x.com/aravind and
https://x.com/keshavbedi for India and world politics (rules in the Phoenix skill, step 3a). The posts load only in a
logged-in browser: without one, X sends just the bio and web search does not index the posts (checked 2026-10-27),
so the scheduled runs skip them and say so in the notes. @aravind's bio says "I post conspiracies and nothing I say
is real. Don't believe anything I post.", so every @aravind thread is marked unverified.
