/* Day loader shared by the front page and the board pages.
   Phoenix can run several times a day; each run is its own file (YYYY-MM-DD, YYYY-MM-DD-2, ...).
   The site shows one entry per date: all of that day's runs merged, each story once (matched by id),
   using the newest run's version. Owner request 2026-10-23: "group those on terms of date. and not
   create multiple categories." The run files themselves are never changed. */
(function () {
  const dateOf = file => String(file).slice(0, 10);
  const runOf = file => { const m = /^\d{4}-\d{2}-\d{2}-(\d+)$/.exec(file); return m ? Number(m[1]) : 1; };

  // index.json (newest first) -> [{ date, label, files: [oldest..newest] }], newest date first.
  function groupDays(editions) {
    const byDate = new Map();
    editions.forEach(e => {
      const d = dateOf(e.file);
      if (!byDate.has(d)) byDate.set(d, { date: d, label: String(e.label || d).replace(/\s*\(run \d+\)\s*$/, ''), files: [] });
      byDate.get(d).files.push(e.file);
    });
    const days = [...byDate.values()];
    days.forEach(day => day.files.sort((a, b) => runOf(a) - runOf(b)));
    return days.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  // runs: edition objects, oldest first. Returns one edition-shaped object.
  function merge(day, runs) {
    const newest = runs[runs.length - 1];
    const order = [], secs = new Map();
    runs.forEach(run => run.sections.forEach(sec => {
      if (!secs.has(sec.id)) { secs.set(sec.id, { meta: sec, stories: new Map() }); order.push(sec.id); }
      const slot = secs.get(sec.id);
      slot.meta = sec; // newest title and blurb win
      sec.stories.forEach(st => { slot.stories.delete(st.id); slot.stories.set(st.id, { ...st, generated: run.generated }); });
    }));
    const newestOrder = newest.sections.map(s => s.id);
    const ids = [...newestOrder, ...order.filter(id => !newestOrder.includes(id))];
    const notes = [...(newest.notes || [])];
    if (runs.length > 1) notes.push(`This page merges ${runs.length} Phoenix runs from ${day.label} (${runs.map(r => r.generated).join('; ')}). A story that appeared in more than one run is shown once, in its newest version.`);
    return {
      ...newest,
      edition: day.label,
      notes,
      runs: runs.length,
      sections: ids.map(id => ({ ...secs.get(id).meta, stories: [...secs.get(id).stories.values()] })),
    };
  }

  // Reads ?d=YYYY-MM-DD (or an old ?e=<file> link, mapped to its date).
  async function loadDay(params) {
    let editions = [];
    try { const r = await fetch('/data/index.json', { cache: 'no-cache' }); if (r.ok) editions = await r.json(); } catch (e) {}
    const days = groupDays(editions);
    const asked = params.get('d') || (params.get('e') ? dateOf(params.get('e')) : null);
    const day = days.find(d => d.date === asked) || days[0];
    if (!day) {
      // No index: fall back to latest.json alone.
      const r = await fetch('/data/latest.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return { days, day: null, isLatest: true, data: await r.json() };
    }
    const runs = (await Promise.all(day.files.map(async f => {
      try { const r = await fetch(`/data/${encodeURIComponent(f)}.json`, { cache: 'no-cache' }); return r.ok ? r.json() : null; } catch (e) { return null; }
    }))).filter(Boolean);
    if (!runs.length) throw new Error('no edition file could be loaded');
    return { days, day, isLatest: day === days[0], data: merge(day, runs) };
  }

  window.Nachrichts = { loadDay, groupDays, merge };
})();
