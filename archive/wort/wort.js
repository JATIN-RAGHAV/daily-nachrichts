/* Wort board renderer: words Walrus asks for, grouped by day, newest first. Data: /data/wort.json
   (separate from the Phoenix editions; Phoenix never writes it). #word-id opens and scrolls to a word. */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

  function reply(name, html) {
    return `<div class="post reply"><div class="postinfo"><span class="name">${esc(name)}</span></div><div class="body">${html}</div></div>`;
  }
  function word(w, date, n) {
    const pos = [...new Set(w.senses.map(s => s.pos.replace(/ \(.*\)$/, '')))].join(', ');
    const pron = [w.pron?.uk && `UK ${esc(w.pron.uk)}`, w.pron?.us && `US ${esc(w.pron.us)}`].filter(Boolean).join(' &middot; ');
    // One reply per part of speech, senses numbered inside it.
    const groups = [];
    w.senses.forEach(s => { let g = groups.find(x => x.pos === s.pos); if (!g) groups.push(g = { pos: s.pos, senses: [] }); g.senses.push(s); });
    const senses = groups.map(g => reply(g.pos, g.senses.map((s, i) =>
      `<p><b>${i + 1}.</b> ${esc(s.def)}${s.label ? ` <span class="small">(${esc(s.label)})</span>` : ''}<br><span class="small">Source: ${esc(s.source)}</span>` +
      (s.examples || []).map(e => `<br><span class="quote">&gt;${esc(e)}</span>`).join('') + '</p>').join(''))).join('');
    const syn = (w.synonyms || []).map(g => `<p><b>${esc(g.for)}:</b> ${g.words.map(esc).join(', ')}</p>`).join('') +
      ((w.opposites || []).length ? `<p><b>Opposites:</b> ${w.opposites.map(esc).join(', ')}</p>` : '');
    const srcs = (w.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('');
    return `<div class="thread open" id="${esc(w.id)}">
      <div class="post op">
        <div class="postinfo">
          <span class="subject">${esc(w.word)}</span>
          <span class="name">Wort</span>
          <span class="dateline">${esc(date)}</span>
          No.${n}
          <span class="small">${esc(pos)}</span>
          <a class="toggle" data-toggle="${esc(w.id)}" href="#${esc(w.id)}">[<span class="c">Expand</span><span class="o">Collapse</span>]</a>
        </div>
        <div class="body">${pron}${w.forms ? `<br><span class="small">${esc(w.forms)}</span>` : ''}${w.note ? `<br><span class="unv">${esc(w.note)}</span>` : ''}</div>
      </div>
      <div class="replies">${senses}${syn ? reply('Synonyms', syn) : ''}${w.origin ? reply('Origin', `<p>${esc(w.origin)}</p>`) : ''}${srcs ? reply('Sources', `<div class="sources">${srcs}</div>`) : ''}</div>
    </div>`;
  }
  async function init() {
    try {
      const r = await fetch('/data/wort.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      const days = [...d.days].sort((a, b) => b.date.localeCompare(a.date));
      const total = days.reduce((n, x) => n + x.words.length, 0);
      $('#board-blurb').textContent = d.about || '';
      $('#board-edition').textContent = `${total} words over ${days.length} day${days.length === 1 ? '' : 's'} · updated ${d.updated}`;
      let n = 0;
      $('#threads').innerHTML = days.map(x => `<h3 class="wortday">${esc(label(x.date))}</h3>` + x.words.map(w => word(w, x.date, ++n)).join('')).join('<hr>') || '<p class="status">No words yet.</p>';
      if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) { el.classList.add('open'); el.scrollIntoView(); } }
    } catch (e) {
      $('#threads').innerHTML = `<p class="status">Could not load the words (${esc(e.message)}).</p>`;
    }
    document.addEventListener('click', ev => {
      const t = ev.target.closest('a[data-toggle]');
      if (t) { ev.preventDefault(); document.getElementById(t.dataset.toggle).classList.toggle('open'); history.replaceState(null, '', '#' + t.dataset.toggle); }
    });
  }
  init();
})();
