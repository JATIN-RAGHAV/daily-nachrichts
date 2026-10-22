# Daily Brief

_Last updated: 2026-10-22 15:41 UTC (21:11 IST) by Claude Fable 5.1 (claude-fable-5-1)_

A personal daily news brief: Tech (Hacker News front page plus what is trending), Geopolitics
(Ground News and the wider web), and India (anything big: political, economic, tech or otherwise).
Each card has a one-line summary, a click-to-expand full account with sources, and a criticality
score from 0 to 100 that says how loudly the story is being discussed, not how important it is.

Static site, no build. The page reads public/data/latest.json. See CLAUDE.md for the update
procedure and the scoring rubric.

Run locally:

    npx serve public

Deploy:

    vercel --prod --yes
