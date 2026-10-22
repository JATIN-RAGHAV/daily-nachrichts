# Daily Nachrichts (personal project, not ProCMO work)

_Last updated: 2026-10-22 15:47 UTC (21:17 IST) by Claude Fable 5.1 (claude-fable-5-1)_

Static news-brief site for Walrus. Three sections (Tech, Geopolitics, India), expandable cards,
a 0-100 criticality score per story. Hosted on Vercel from this folder. Nothing here goes into
pro-cmo-brain or the Library of Alexandria: this is personal.

## Layout

| Path | Content |
|---|---|
| public/index.html | The whole page. Fetches data/latest.json and renders it. No build step. |
| public/data/YYYY-MM-DD.json | One edition. Never edited after the day it was published. |
| public/data/latest.json | Byte-for-byte copy of the newest edition. |
| public/data/index.json | List of editions, newest first, for the edition switcher. |
| vercel.json | Static hosting config: output dir is public/, clean URLs. |

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
4. Copy it to latest.json, prepend the edition to index.json, commit, then deploy with
   vercel --prod --yes from this folder.
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
- No credentials in the repo. The Vercel login lives in the CLI's own store.
- Commit after each edition lands; git log is the change history.

## Naming and type (owner ruling 2026-10-22)

The site is called "Daily Nachrichts"; the word "brief" is not used in the page chrome. Every font role is Comic Sans (Comic Sans MS, with Comic Neue from Google Fonts as fallback). Owner words: "make it so that it says nachrichts instead of saying brief. Also change the font and change it to comic sans". Past edition JSON files are not rewritten for the rename.
