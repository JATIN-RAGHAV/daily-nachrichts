# Daily Nachrichts

_Last updated: 2026-10-23 08:43 UTC (14:13 IST) by Claude Fable 5.1 (claude-fable-5-1)_

A personal daily news site, live at https://news.walrus.codes. Three boards: /tech/ (Hacker News
front page plus what is trending), /geo/ (Ground News and the wider web) and /india/ (anything big:
political, economic, tech or otherwise). The front page lists the boards, the ten most-discussed
threads of the day, the edition's notes and the edition archive. On a board, every story is a
thread: subject, one-line summary, and an [Expand] that shows the full account as reply posts with
sources. Each thread carries a criticality score from 0 to 100 that says how loudly the story is
being discussed, not how important it is.

Static site, no build, plain imageboard look. The pages read `public/data/latest.json` (or
`?e=YYYY-MM-DD` for a past edition) and `public/data/index.json` for the archive. See CLAUDE.md for
the layout, the update procedure (the Phoenix skill) and the scoring rubric.

Run locally:

    npx serve public

Deploy: push to `main`. The GitHub Actions workflow `.github/workflows/deploy.yml` validates the
latest edition, runs `wrangler deploy` for the assets-only Worker `daily-nachrichts` (route
news.walrus.codes/*), and checks the live page. Nobody runs wrangler by hand. The workflow needs the
repo secrets `CLOUDFLARE_API_TOKEN` (personal Cloudflare account, template "Edit Cloudflare Workers",
zone walrus.codes) and `CLOUDFLARE_ACCOUNT_ID`.

Repository: https://github.com/JATIN-RAGHAV/daily-nachrichts (public). Editions are dated records
and are never edited after publication.
