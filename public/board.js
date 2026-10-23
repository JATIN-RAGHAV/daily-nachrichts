/* Board page renderer. The page sets <body data-board="tech|geo|india">. Day via ?d=YYYY-MM-DD (all of that
   day's Phoenix runs merged by /day.js; an old ?e=<file> link opens its day). */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const BOARD = document.body.dataset.board;
  const params = new URLSearchParams(location.search);
  let minScore = Number(params.get('min') || 0), data = null, days = [], day = null;

  function band(s) {
    if (s >= 85) return ['Critical', 'crit'];
    if (s >= 70) return ['High', 'high'];
    if (s >= 40) return ['Moderate', 'mod'];
    return ['Low', 'low'];
  }
  function thread(st, i) {
    const [bname, cls] = band(st.score);
    const when = esc((st.generated || data.generated).slice(0, 16));
    const paras = (st.detail || []).map((p, k) => `<div class="post reply"><div class="postinfo"><span class="name">Nachrichts</span> <span class="dateline">${when}</span> <span class="small">&gt;&gt;${k + 1}</span></div><div class="body">${esc(p)}</div></div>`).join('');
    const srcs = (st.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('');
    const src = srcs ? `<div class="post reply"><div class="postinfo"><span class="name">Sources</span></div><div class="body sources">${srcs}</div></div>` : '';
    return `<div class="thread" id="${esc(st.id)}">
      <div class="post op">
        <div class="postinfo">
          <span class="subject">${esc(st.title)}</span>
          <span class="name">Nachrichts</span>
          <span class="dateline">${when}</span>
          No.${i + 1}
          <span class="score ${cls}">[${st.score} ${bname}]</span>
          ${st.unverified ? '<span class="unv">[unverified]</span>' : ''}
          <a class="toggle" data-toggle="${esc(st.id)}" href="#${esc(st.id)}">[<span class="c">Expand</span><span class="o">Collapse</span>]</a>
        </div>
        <div class="body">${esc(st.summary)}</div>
        <div class="heat">${esc(st.heat || '')}${(st.tags || []).length ? ' · ' + st.tags.map(esc).join(', ') : ''}</div>
      </div>
      <div class="replies">${paras}${src}</div>
    </div>`;
  }
  function render() {
    const sec = data.sections.find(s => s.id === BOARD);
    if (!sec) { $('#threads').innerHTML = '<p class="status">No such board in this edition.</p>'; return; }
    document.title = `/${BOARD}/ - ${sec.title} - Daily Nachrichts`;
    $('#board-title').textContent = `/${BOARD}/ - ${sec.title}`;
    $('#board-blurb').textContent = sec.blurb || '';
    $('#board-edition').innerHTML = `${esc(data.edition)} &middot; ${data.runs > 1 ? `${data.runs} runs merged, last ` : ''}generated ${esc(data.generated)}`;
    const stories = sec.stories.filter(s => s.score >= minScore).sort((a, b) => b.score - a.score);
    $('#count').textContent = `${stories.length} of ${sec.stories.length} threads`;
    $('#threads').innerHTML = stories.length ? stories.map(thread).join('') : '<p class="status">No threads at this threshold.</p>';
    document.querySelectorAll('.filters a').forEach(a => a.classList.toggle('on', Number(a.dataset.min) === minScore));
    $('#editions').innerHTML = days.map((e, i) => `<li><a href="${i === 0 ? '?' : `?d=${esc(e.date)}`}">${day && day.date === e.date ? `<b>${esc(e.label)}</b>` : esc(e.label)}</a>${e.files.length > 1 ? ` <span class="small">(${e.files.length} runs)</span>` : ''}${i === 0 ? ' <span class="small">(latest)</span>' : ''}</li>`).join('');
    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) { el.classList.add('open'); el.scrollIntoView(); } }
  }
  async function init() {
    try {
      const got = await Nachrichts.loadDay(params);
      days = got.days; day = got.day; data = got.data;
      // Viewing a past day: keep it on the Home and board links.
      if (day && !got.isLatest) {
        const q = `?d=${encodeURIComponent(day.date)}`;
        document.querySelectorAll('.boardlist a[href="/"], .boardlist a[href="/tech/"], .boardlist a[href="/geo/"], .boardlist a[href="/india/"]').forEach(a => a.setAttribute('href', a.getAttribute('href') + q));
      }
      render();
    } catch (e) {
      $('#threads').innerHTML = `<p class="status">Could not load the edition (${esc(e.message)}).</p>`;
    }
    document.addEventListener('click', ev => {
      const t = ev.target.closest('a[data-toggle]');
      if (t) { ev.preventDefault(); const el = document.getElementById(t.dataset.toggle); el.classList.toggle('open'); history.replaceState(null, '', '#' + t.dataset.toggle); return; }
      const f = ev.target.closest('.filters a[data-min]');
      if (f) { ev.preventDefault(); minScore = Number(f.dataset.min); const p = new URLSearchParams(location.search); p.set('min', minScore); if (!minScore) p.delete('min'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '')); render(); }
    });
  }
  init();
})();
