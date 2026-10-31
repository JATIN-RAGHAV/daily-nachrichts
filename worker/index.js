// Daily Nachrichts Worker. Static pages come from public/ (the assets binding); this script handles only /api/*.
//
// Likes (owner request 2026-10-30): "add a like feature, so that a user can like a post. And make it so that a single
// user can only like a post once." Owner's ruling on how: "you don't have to put a server side or user side
// verification for user indentity, you can just make it so that when a user reclicks on the like button, it gets sent
// as unlike ... Unless they are sending direct backend requests which is fine." So the server keeps a count per thread
// and does not identify anyone; the browser remembers what it liked and sends "unlike" on the second tap.
//
//   GET  /api/likes?keys=<key>,<key>,...   -> { counts: { <key>: n } }   (up to 100 keys)
//   POST /api/like  { key, op: "like" | "unlike" } -> { key, count }
//
// A key is "<YYYY-MM-DD>/<story id>": one count per thread per day, so a story id reused on a later day starts at 0.
// Counts never go below 0. All counts live in one Durable Object ("likes") with SQLite storage.
import { DurableObject } from 'cloudflare:workers';

const KEY = /^\d{4}-\d{2}-\d{2}\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_KEYS = 100;

export class Likes extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS likes (k TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0)');
  }
  counts(keys) {
    const out = Object.fromEntries(keys.map(k => [k, 0]));
    if (!keys.length) return out;
    const rows = this.ctx.storage.sql.exec(`SELECT k, n FROM likes WHERE k IN (${keys.map(() => '?').join(',')})`, ...keys);
    for (const r of rows) out[r.k] = r.n;
    return out;
  }
  change(key, delta) {
    this.ctx.storage.sql.exec(
      'INSERT INTO likes (k, n) VALUES (?, max(0, ?)) ON CONFLICT(k) DO UPDATE SET n = max(0, n + ?)', key, delta, delta);
    return this.ctx.storage.sql.exec('SELECT n FROM likes WHERE k = ?', key).one().n;
  }
}

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

async function api(request, env, url) {
  const store = env.LIKES.get(env.LIKES.idFromName('likes'));
  if (url.pathname === '/api/likes' && request.method === 'GET') {
    const keys = [...new Set((url.searchParams.get('keys') || '').split(',').filter(Boolean))];
    if (keys.length > MAX_KEYS || !keys.every(k => KEY.test(k))) return json({ error: 'bad keys' }, 400);
    return json({ counts: await store.counts(keys) });
  }
  if (url.pathname === '/api/like' && request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
    const { key, op } = body || {};
    if (typeof key !== 'string' || key.length > 200 || !KEY.test(key) || !['like', 'unlike'].includes(op)) {
      return json({ error: 'bad request' }, 400);
    }
    return json({ key, count: await store.change(key, op === 'like' ? 1 : -1) });
  }
  return json({ error: 'not found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return api(request, env, url);
    return env.ASSETS.fetch(request);
  },
};
