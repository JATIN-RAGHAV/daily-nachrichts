/* Story card as a PNG image: the whole thread (title, score, summary, heat, About, every detail paragraph,
   sources) drawn on a canvas in the site's colours, then downloaded. Loaded by board.js on the first click of a
   thread's [Image] link, so it works for every edition, past and future.
   Owner request 2026-10-30: "make it so that on each new article I can click on a button and I set an option to
   download that as an image, that image will contain the whole brief". No library, Arial only, like the site. */
(function () {
  const W = 1080, PAD = 48, INNER = W - PAD * 2, SCALE = 2;
  const C = { page: '#eef2ff', post: '#d6daf0', border: '#b7c5d9', title: '#af0a0f', subject: '#0f0c5d',
    name: '#117743', grey: '#707070', link: '#34345c', red: '#dd0000', text: '#000000' };
  const BAND = s => s >= 85 ? ['Critical', '#af0a0f'] : s >= 70 ? ['High', '#c4402f'] : s >= 40 ? ['Moderate', '#996600'] : ['Low', '#707070'];

  // Split text into lines that fit maxW at the current font. Long unbroken strings (URLs) are cut by character.
  function wrap(ctx, text, maxW) {
    const out = [];
    for (const para of String(text ?? '').split('\n')) {
      let line = '';
      for (let word of para.split(/\s+/).filter(Boolean)) {
        while (ctx.measureText(word).width > maxW) {
          let n = word.length; while (n > 1 && ctx.measureText(word.slice(0, n)).width > maxW) n--;
          if (line) { out.push(line); line = ''; }
          out.push(word.slice(0, n)); word = word.slice(n);
        }
        const t = line ? line + ' ' + word : word;
        if (ctx.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t;
      }
      out.push(line);
    }
    return out;
  }

  // One pass computes the height, the second draws; both run the same steps.
  function paint(ctx, st, meta, draw) {
    let y = PAD;
    const font = (size, weight = 'normal') => { ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`; };
    const text = (s, x, size, color, weight, maxW, lh) => {
      font(size, weight); ctx.fillStyle = color;
      for (const l of wrap(ctx, s, maxW)) { if (draw) ctx.fillText(l, x, y + size); y += lh; }
    };
    if (draw) { ctx.fillStyle = C.page; ctx.fillRect(0, 0, W, ctx.canvas.height / SCALE); }

    // Masthead
    font(34, 'bold'); if (draw) { ctx.fillStyle = C.title; ctx.fillText('Daily Nachrichts', PAD, y + 34); }
    const mw = ctx.measureText('Daily Nachrichts').width;
    font(20); if (draw) { ctx.fillStyle = C.grey; ctx.fillText(`/${meta.board}/ \u00b7 ${meta.edition}`, PAD + mw + 16, y + 34); }
    y += 50;
    if (draw) { ctx.fillStyle = C.border; ctx.fillRect(PAD, y, INNER, 2); }
    y += 22;

    // Opening post
    text(st.title, PAD, 30, C.subject, 'bold', INNER, 38);
    y += 6;
    const [bname, bcol] = BAND(st.score);
    font(20, 'bold');
    const parts = [[`[${st.score} ${bname}]`, bcol, 'bold'], ...(st.unverified ? [['[unverified]', C.red, 'bold']] : []), [meta.when, C.grey, 'normal']];
    let x = PAD;
    for (const [s, col, w] of parts) { font(20, w); if (draw) { ctx.fillStyle = col; ctx.fillText(s, x, y + 20); } x += ctx.measureText(s).width + 14; }
    y += 36;
    text(st.summary, PAD, 24, C.text, 'normal', INNER, 34);
    y += 8;
    const heat = (st.heat || '') + ((st.tags || []).length ? ' \u00b7 ' + st.tags.join(', ') : '');
    if (heat) text(heat, PAD, 18, C.grey, 'normal', INNER, 26);
    y += 14;

    // Replies: About, detail paragraphs, sources, each in a post box
    const box = (label, body) => {
      const top = y, bx = PAD + 20, bw = INNER - 20, tx = bx + 18, tw = bw - 36;
      const start = y; y += 14;
      // measure the box first so its background sits under the text
      const save = y; const was = draw; draw = false; text(label, tx, 20, C.name, 'bold', tw, 30); body(tx, tw); const h = y - start + 16; y = save; draw = was;
      if (draw) { ctx.fillStyle = C.post; ctx.fillRect(bx, top, bw, h); ctx.fillStyle = C.border; ctx.fillRect(bx, top + h - 2, bw, 2); ctx.fillRect(bx + bw - 2, top, 2, h); }
      text(label, tx, 20, C.name, 'bold', tw, 30); body(tx, tw);
      y = top + h + 12;
    };
    if (st.about) box('About', (tx, tw) => text(st.about, tx, 22, C.text, 'normal', tw, 32));
    (st.detail || []).forEach((p, k) => box(`Nachrichts  >>${k + 1}`, (tx, tw) => text(p, tx, 22, C.text, 'normal', tw, 32)));
    if ((st.sources || []).length) box('Sources', (tx, tw) => st.sources.forEach(s => {
      text(s.name, tx, 20, C.link, 'bold', tw, 28);
      if (s.url) text(s.url, tx, 16, C.grey, 'normal', tw, 24);
      y += 4;
    }));

    // Footer: where the thread lives
    y += 10;
    if (draw) { ctx.fillStyle = C.border; ctx.fillRect(PAD, y, INNER, 2); }
    y += 14;
    text(meta.url, PAD, 18, C.link, 'normal', INNER, 26);
    text('Score = how loudly a story is being talked about (0 to 100), not how important it is.', PAD, 16, C.grey, 'normal', INNER, 24);
    return y + PAD - 10;
  }

  async function download(st, meta) {
    const blob = await render(st, meta);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName(st, meta);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  // [Share]: the phone's share sheet (WhatsApp and the rest) with the image attached.
  // Owner request 2026-10-30: "a share option that when I am doing this from mobile, I can just share it directly on whatsapp".
  // navigator.share needs the click's user activation, so the image is made straight away, with no network wait.
  async function share(st, meta) {
    const file = new File([await render(st, meta)], fileName(st, meta), { type: 'image/png' });
    if (!(navigator.canShare && navigator.canShare({ files: [file] }))) return download(st, meta);
    try {
      await navigator.share({ files: [file], title: st.title, text: `${st.title}\nhttps://${meta.url}` });
    } catch (e) {
      if (e.name !== 'AbortError') throw e; // AbortError = the share sheet was closed
    }
  }

  const fileName = (st, meta) => `nachrichts-${meta.date}-${st.id}.png`;

  async function render(st, meta) {
    const c = document.createElement('canvas'), ctx = c.getContext('2d');
    c.width = W * SCALE; c.height = 10;
    ctx.scale(SCALE, SCALE);
    const h = Math.ceil(paint(ctx, st, meta, false));
    c.width = W * SCALE; c.height = h * SCALE; // resizing resets the context
    ctx.scale(SCALE, SCALE); ctx.textBaseline = 'alphabetic';
    paint(ctx, st, meta, true);
    return new Promise(r => c.toBlob(r, 'image/png'));
  }

  window.NachrichtsCard = { download, share };
})();
