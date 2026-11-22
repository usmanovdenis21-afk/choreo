'use strict';
(() => {
/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r2 = v => Math.round(v * 100) / 100;
const ease = k => k * k * (3 - 2 * k);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const PALETTE = ['#e8505b', '#f9a03f', '#f6d743', '#7bd389', '#2ec4b6', '#3a86ff', '#8b5cf6', '#ff70a6', '#d0d0d8', '#c97b4a', '#00b4d8', '#a3c94f'];

const P = {
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  share: '<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>',
  prev: '<path d="M6 5v14"/><path d="M19 5 9 12l10 7z"/>',
  next: '<path d="M18 5v14"/><path d="M5 5l10 7-10 7z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  multi: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="m14 17.5 2.5 2.5 4.5-5"/>',
  magnet: '<path d="M6 3v8a6 6 0 0 0 12 0V3"/><path d="M6 7h4M14 7h4"/><path d="M10 3v8a2 2 0 0 0 4 0V3"/>',
  path: '<circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="6" r="2.5"/><path d="M7 16.5c3-1 2-6 5-7.5s3.5-1 5-2" stroke-dasharray="2.5 2.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.2A5 5 0 0 1 21.5 19"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  stage: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M3 20h18"/><path d="M12 4v12" stroke-dasharray="2 2.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  mirror: '<path d="M12 3v18" stroke-dasharray="2 2"/><path d="M9 7 3 17h6zM15 7l6 10h-6z"/>',
  row: '<circle cx="4.5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19.5" cy="12" r="2.2"/>',
  col: '<circle cx="12" cy="4.5" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="19.5" r="2.2"/>',
  swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>',
  all: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  upload: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
};
const icon = n => `<svg class="i" viewBox="0 0 24 24">${P[n] || ''}</svg>`;
function hydrateIcons(root = document) { $$('[data-icon]', root).forEach(el => { el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); el.removeAttribute('data-icon'); }); }

function toast(msg, ms = 2200) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.tm); toast.tm = setTimeout(() => t.classList.remove('show'), ms);
}
function modal(html, bind) {
  const m = $('#modal'), c = $('#modalCard'); c.innerHTML = html; hydrateIcons(c); m.classList.remove('hidden');
  const close = () => m.classList.add('hidden');
  m.onclick = e => { if (e.target === m) close(); };
  bind && bind(c, close);
  return close;
}
function textColor(hex) {
  const n = parseInt(hex.slice(1), 16); const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#111' : '#fff';
}
function initials(name) {
  const w = String(name).trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '?';
  if (w.length > 1) return (w[0][0] + w[1][0]).toUpperCase();
  return w[0].slice(0, 2);
}
const fmtTime = t => { t = Math.max(0, t); const m = Math.floor(t / 60); const s = t - m * 60; return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`; };
const plural = (n, a, b, c) => { n = Math.abs(n) % 100; const n1 = n % 10; if (n > 10 && n < 20) return c; if (n1 > 1 && n1 < 5) return b; if (n1 === 1) return a; return c; };

/* ================= storage ================= */
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('choreo', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('projects', { keyPath: 'id' }); d.createObjectStore('audio'); };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(name, mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(name, mode); const req = fn(t.objectStore(name));
      t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  },
  all() { return this.tx('projects', 'readonly', s => s.getAll()); },
  put(p) { return this.tx('projects', 'readwrite', s => s.put(p)); },
  del(id) { return this.tx('projects', 'readwrite', s => s.delete(id)); },
  getAudio(k) { return this.tx('audio', 'readonly', s => s.get(k)); },
  putAudio(k, v) { return this.tx('audio', 'readwrite', s => s.put(v, k)); },
  delAudio(k) { return this.tx('audio', 'readwrite', s => s.delete(k)); },
};

/* ================= state ================= */
const S = {
  p: null, fi: 0, t: 0, playing: false, sel: new Set(),
  multi: false, snap: store.get('snap', true), paths: store.get('paths', true),
  undo: [], redo: [], musicURL: null, peaks: null, peaksRate: 50, musicDur: 0,
  pps: store.get('pps', 24), scrollX: 0, rate: 1, taps: [],
};

function newProject(name = 'Новая постановка') {
  const dancers = Array.from({ length: 6 }, (_, i) => ({ id: uid(), name: `Танцор ${i + 1}`, color: PALETTE[i % PALETTE.length], group: '' }));
  const pos = {}; dancers.forEach((d, i) => { pos[d.id] = [r2(-3.75 + i * 1.5), 4]; });
  return {
    id: uid(), name, created: Date.now(), updated: Date.now(),
    stage: { w: 10, d: 8, grid: 1 }, size: 1, showNames: true,
    bpm: 120, offset: 0, music: null, dancers,
    formations: [{ id: uid(), name: 'Начало', hold: 8, trans: 8, notes: '', pos }],
  };
}

let saveTm = null;
function save() { S.p.updated = Date.now(); clearTimeout(saveTm); saveTm = setTimeout(flush, 350); }
function flush() { clearTimeout(saveTm); saveTm = null; if (S.p) DB.put(S.p).catch(e => toast('Ошибка сохранения: ' + e.message)); }

function commit() { S.undo.push(JSON.stringify(S.p)); if (S.undo.length > 80) S.undo.shift(); S.redo = []; updUndo(); }
function mut(fn) { commit(); fn(); save(); renderAll(); }
function undo() { if (!S.undo.length) return; S.redo.push(JSON.stringify(S.p)); restore(S.undo.pop()); }
function redo() { if (!S.redo.length) return; S.undo.push(JSON.stringify(S.p)); restore(S.redo.pop()); }
function restore(json) {
  const music = S.p.music; S.p = JSON.parse(json);
  S.fi = clamp(S.fi, 0, S.p.formations.length - 1);
  S.sel = new Set([...S.sel].filter(id => S.p.dancers.some(d => d.id === id)));
  save();
  if ((music && music.key) !== (S.p.music && S.p.music.key)) loadMusic();
  renderAll();
}
function updUndo() { $('#btnUndo').disabled = !S.undo.length; $('#btnRedo').disabled = !S.redo.length; }

/* ================= timing ================= */
const spb = () => 60 / (S.p.bpm || 120);
function starts() {
  let t = S.p.offset || 0; const F = S.p.formations;
  return F.map((f, i) => { const s = t, h = s + f.hold * spb(), e = i < F.length - 1 ? h + f.trans * spb() : h; t = e; return { s, h, e }; });
}
function choreoEnd() { const st = starts(); return st[st.length - 1].h; }
function totalDur() { return Math.max(choreoEnd() + 2, S.musicDur || 0, 10); }
function stateAt(t) {
  const F = S.p.formations, st = starts();
  for (let i = 0; i < F.length; i++) {
    if (t < st[i].h || i === F.length - 1) return { fi: i, k: 0 };
    if (t < st[i].e) return { fi: i, k: (t - st[i].h) / (st[i].e - st[i].h) };
  }
  return { fi: F.length - 1, k: 0 };
}
function posOf(f, d) { return f.pos[d.id] || [0, S.p.stage.d / 2]; }
function positionsAt(t) {
  const { fi, k } = stateAt(t), F = S.p.formations, m = {};
  for (const d of S.p.dancers) {
    const a = posOf(F[fi], d);
    if (k > 0) { const b = posOf(F[fi + 1], d), e = ease(k); m[d.id] = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]; }
    else m[d.id] = a;
  }
  return { m, fi, k };
}
function countAt(t) {
  const off = S.p.offset || 0;
  if (t < off - 1e-6) return null;
  const b = Math.floor((t - off) / spb() + 1e-6);
  return { eight: Math.floor(b / 8) + 1, count: (b % 8) + 1 };
}
function countLabel(t) { const c = countAt(t); return c ? `${c.eight}-я восьмёрка · ${c.count}` : 'вступление'; }
const cnt = n => `${n} сч.`;
const secs = n => `${(n * spb()).toFixed(1)} с`;

/* ================= stage ================= */
const svg = $('#stage');
const MARGIN = 1.3;
function renderStage() {
  const { w, d, grid } = S.p.stage, M = MARGIN;
  const vx = -w / 2 - M, vy = -M - 0.3, vw = w + 2 * M, vh = d + 2 * M + 0.6;
  svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
  let g = `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#141417"/>`;
  g += `<rect x="${-w / 2}" y="0" width="${w}" height="${d}" fill="#202026" stroke="#5a5a66" stroke-width="0.04"/>`;
  for (let x = grid; x < w / 2 - 1e-6; x += grid) for (const sx of [x, -x]) g += `<line x1="${sx}" y1="0" x2="${sx}" y2="${d}" stroke="#2f2f38" stroke-width="0.02"/>`;
  for (let y = d - grid; y > 1e-6; y -= grid) g += `<line x1="${-w / 2}" y1="${y}" x2="${w / 2}" y2="${y}" stroke="#2f2f38" stroke-width="0.02"/>`;
  g += `<line x1="0" y1="0" x2="0" y2="${d}" stroke="#55556a" stroke-width="0.03" stroke-dasharray="0.15 0.12"/>`;
  const ls = w > 14 ? 2 : 1;
  for (let x = 0; x <= w / 2 + 1e-6; x += ls) for (const sx of x ? [x, -x] : [0]) g += `<text x="${sx}" y="${d + 0.42}" font-size="0.28" fill="#6f6f80" text-anchor="middle">${Math.round(x)}</text>`;
  for (let y = 1; y < d; y += ls) g += `<text x="${-w / 2 - 0.15}" y="${d - y + 0.1}" font-size="0.26" fill="#5c5c6c" text-anchor="end">${y}</text>`;
  g += `<text x="0" y="${d + M + 0.05}" font-size="0.36" fill="#8a8a9c" text-anchor="middle" letter-spacing="0.12" font-weight="600">ЗРИТЕЛИ</text>`;
  g += `<text x="0" y="-0.3" font-size="0.26" fill="#5c5c6c" text-anchor="middle" letter-spacing="0.1">ЗАДНИК</text>`;
  g += '<g id="dyn"></g>';
  svg.innerHTML = g;
  renderDyn();
}
function renderDyn() {
  const dyn = $('#dyn'); if (!dyn) return;
  const { m, fi, k } = positionsAt(S.t), F = S.p.formations;
  const R = 0.32 * (S.p.size || 1);
  const editing = !S.playing && k === 0;
  let out = '';
  if (editing && S.paths && fi > 0) {
    const prev = F[fi - 1];
    for (const d of S.p.dancers) {
      const a = posOf(prev, d), b = m[d.id];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.05) continue;
      out += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${d.color}" stroke-opacity=".55" stroke-width="0.05" stroke-dasharray="0.12 0.1"/>`;
      out += `<circle cx="${a[0]}" cy="${a[1]}" r="${R * 0.8}" fill="none" stroke="${d.color}" stroke-opacity=".45" stroke-width="0.04"/>`;
    }
  }
  const list = [...S.p.dancers].sort((a, b) => S.sel.has(a.id) - S.sel.has(b.id));
  for (const d of list) {
    const [x, y] = m[d.id], sel = S.sel.has(d.id);
    out += `<g class="dn" data-id="${d.id}" transform="translate(${r2(x)} ${r2(y)})">`;
    out += `<circle r="${Math.max(R * 1.7, 0.5)}" fill="transparent"/>`;
    if (sel) out += `<circle r="${R + 0.11}" fill="none" stroke="#fff" stroke-width="0.07"/>`;
    out += `<circle r="${R}" fill="${d.color}"/>`;
    out += `<text y="${R * 0.3}" font-size="${R * 0.82}" font-weight="700" fill="${textColor(d.color)}" text-anchor="middle">${esc(initials(d.name))}</text>`;
    if (S.p.showNames) out += `<text y="${R + 0.33}" font-size="${0.27 * Math.max(1, S.p.size || 1)}" fill="#e4e4ea" text-anchor="middle">${esc(d.name)}</text>`;
    out += '</g>';
  }
  dyn.innerHTML = out;
}

function toStage(e) {
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function ensureEditTime() {
  const s = stateAt(S.t);
  if (s.k > 0 || s.fi !== S.fi) { S.t = starts()[S.fi].s; drawTL(); updateClock(); }
}
let drag = null;
svg.addEventListener('pointerdown', e => {
  if (e.button > 0 || !S.p) return;
  if (S.playing) pause();
  ensureEditTime();
  svg.setPointerCapture(e.pointerId);
  const g = e.target.closest('.dn');
  if (!g) { drag = { type: 'empty', x0: e.clientX, y0: e.clientY }; return; }
  const id = g.dataset.id, wasSel = S.sel.has(id);
  if (!wasSel) { if (S.multi) S.sel.add(id); else S.sel = new Set([id]); }
  const f = S.p.formations[S.fi], start = {};
  for (const sid of S.sel) { const d = S.p.dancers.find(x => x.id === sid); if (d) start[sid] = [...posOf(f, d)]; }
  drag = { type: 'd', id, wasSel, p0: toStage(e), x0: e.clientX, y0: e.clientY, moved: false, start, committed: false };
  renderDyn(); renderSelBar();
});
svg.addEventListener('pointermove', e => {
  if (!drag || drag.type !== 'd') return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 4) return;
  drag.moved = true;
  if (!drag.committed) { commit(); drag.committed = true; }
  const p = toStage(e), { w, d, grid } = S.p.stage, step = grid / 2, M = MARGIN - 0.25;
  let dx = p.x - drag.p0.x, dy = p.y - drag.p0.y;
  const ids = Object.keys(drag.start), single = ids.length === 1;
  if (S.snap && !single) { dx = Math.round(dx / step) * step; dy = Math.round(dy / step) * step; }
  const f = S.p.formations[S.fi];
  for (const id of ids) {
    let [x, y] = drag.start[id]; x += dx; y += dy;
    if (S.snap && single) { x = Math.round(x / step) * step; y = d - Math.round((d - y) / step) * step; }
    f.pos[id] = [r2(clamp(x, -w / 2 - M, w / 2 + M)), r2(clamp(y, -M, d + M))];
  }
  renderDyn();
});
function endDrag(e) {
  if (!drag) return;
  if (drag.type === 'empty') {
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6 && S.sel.size) { S.sel.clear(); renderDyn(); renderSelBar(); }
  } else if (!drag.moved) {
    if (drag.wasSel) {
      if (S.multi) S.sel.delete(drag.id);
      else if (S.sel.size > 1) S.sel = new Set([drag.id]);
      else S.sel.clear();
    }
    renderDyn(); renderSelBar();
  } else save();
  drag = null;
}
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);

/* selection actions */
function renderSelBar() {
  const bar = $('#selBar');
  if (!S.sel.size || S.playing) { bar.classList.add('hidden'); return; }
  const n = S.sel.size;
  const one = n === 1 ? S.p.dancers.find(d => S.sel.has(d.id)) : null;
  let h = `<span class="cnt">${one ? esc(one.name) : n + ' ' + plural(n, 'танцор', 'танцора', 'танцоров')}</span>`;
  h += `<button data-a="all">${icon('all')}Все</button>`;
  h += `<button data-a="mirror">${icon('mirror')}Зеркало</button>`;
  if (n >= 2) h += `<button data-a="row">${icon('row')}В ряд</button><button data-a="col">${icon('col')}В колонну</button>`;
  if (n === 2) h += `<button data-a="swap">${icon('swap')}Обмен</button>`;
  h += `<button data-a="none">${icon('close')}Снять</button>`;
  bar.innerHTML = h; bar.classList.remove('hidden');
}
$('#selBar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const a = b.dataset.a, f = S.p.formations[S.fi];
  const ds = S.p.dancers.filter(d => S.sel.has(d.id));
  if (a === 'none') { S.sel.clear(); renderDyn(); renderSelBar(); return; }
  if (a === 'all') { S.sel = new Set(S.p.dancers.map(d => d.id)); renderDyn(); renderSelBar(); return; }
  mut(() => {
    if (a === 'mirror') ds.forEach(d => { const [x, y] = posOf(f, d); f.pos[d.id] = [r2(-x), y]; });
    if (a === 'swap') { const [p1, p2] = ds.map(d => posOf(f, d)); f.pos[ds[0].id] = [...p2]; f.pos[ds[1].id] = [...p1]; }
    if (a === 'row' || a === 'col') {
      const ax = a === 'row' ? 0 : 1, ox = 1 - ax;
      const sorted = ds.map(d => ({ d, p: posOf(f, d) })).sort((u, v) => u.p[ax] - v.p[ax]);
      const avg = sorted.reduce((s, o) => s + o.p[ox], 0) / sorted.length;
      let lo = sorted[0].p[ax], hi = sorted[sorted.length - 1].p[ax];
      if (hi - lo < 0.5) { const c = (hi + lo) / 2; lo = c - (sorted.length - 1) / 2; hi = c + (sorted.length - 1) / 2; }
      sorted.forEach((o, i) => { const v = lo + (hi - lo) * i / (sorted.length - 1); const np = []; np[ax] = r2(v); np[ox] = r2(avg); f.pos[o.d.id] = np; });
    }
  });
});

/* ================= timeline ================= */
const tl = $('#tl'), TL = { w: 0, h: 0, dpr: 1 };
const t2x = t => t * S.pps - S.scrollX;
const x2t = x => (x + S.scrollX) / S.pps;
function clampScroll(v) { return clamp(v, 0, Math.max(0, totalDur() * S.pps - TL.w + 40)); }
function tlResize() {
  const r = tl.getBoundingClientRect(); TL.w = r.width; TL.h = r.height; TL.dpr = window.devicePixelRatio || 1;
  tl.width = Math.round(r.width * TL.dpr); tl.height = Math.round(r.height * TL.dpr); drawTL();
}
function rrect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function drawTL() {
  if (!S.p || !TL.w) return;
  const c = tl.getContext('2d'), W = TL.w, H = TL.h;
  c.setTransform(TL.dpr, 0, 0, TL.dpr, 0, 0);
  c.clearRect(0, 0, W, H);
  const RU = 14, WV0 = 15, WV1 = H - 30, BL0 = H - 27, BL1 = H - 4;
  const t0 = x2t(0), t1 = x2t(W), sp = spb(), off = S.p.offset || 0;
  // beats & eights
  c.font = '10px -apple-system, Segoe UI, sans-serif'; c.textBaseline = 'middle';
  const showBeats = S.pps * sp >= 6;
  let b = Math.max(0, Math.floor((t0 - off) / sp));
  for (let t = off + b * sp; t <= t1; t = off + (++b) * sp) {
    const x = Math.round(t2x(t)) + 0.5;
    if (b % 8 === 0) {
      c.fillStyle = '#3a3a46'; c.fillRect(x, 0, 1, BL0 - 2);
      c.fillStyle = '#a0a0b0'; c.fillText(String(b / 8 + 1), x + 3, RU / 2 + 1);
    } else if (showBeats) { c.fillStyle = '#34343e'; c.fillRect(x, RU - 5, 1, 5); }
  }
  if (off > 0 && t2x(off) > 0) { c.fillStyle = '#e2557b88'; c.fillRect(Math.round(t2x(off)), 0, 2, RU); }
  // waveform
  const mid = (WV0 + WV1) / 2, amp = (WV1 - WV0) / 2;
  if (S.peaks) {
    c.fillStyle = '#e2557b66';
    for (let x = 0; x < W; x += 2) {
      const i0 = Math.floor(x2t(x) * S.peaksRate), i1 = Math.max(i0 + 1, Math.floor(x2t(x + 2) * S.peaksRate));
      if (i0 >= S.peaks.length) break;
      let m = 0; for (let i = Math.max(0, i0); i < i1 && i < S.peaks.length; i++) if (S.peaks[i] > m) m = S.peaks[i];
      const hh = Math.max(1, m * amp); c.fillRect(x, mid - hh, 1.5, hh * 2);
    }
  } else { c.fillStyle = '#2a2a32'; c.fillRect(0, mid, W, 1); }
  // formations
  const st = starts(), F = S.p.formations;
  c.font = '600 11px -apple-system, Segoe UI, sans-serif';
  st.forEach((s, i) => {
    const x1 = t2x(s.s), x2 = t2x(s.h), x3 = t2x(s.e);
    if (x3 < -2 || x1 > W) return;
    const cur = i === S.fi;
    if (x3 > x2 + 1) {
      c.fillStyle = cur ? '#e2557b40' : '#ffffff14'; c.fillRect(x2, BL0 + 6, x3 - x2, BL1 - BL0 - 12);
      c.strokeStyle = cur ? '#e2557b' : '#666674'; c.lineWidth = 1; c.beginPath(); c.moveTo(x2, (BL0 + BL1) / 2); c.lineTo(x3 - 3, (BL0 + BL1) / 2); c.stroke();
    }
    const bw = Math.max(2, x2 - x1 - 1);
    rrect(c, x1, BL0, bw, BL1 - BL0, 5);
    c.fillStyle = cur ? '#e2557b' : '#3b3b46'; c.fill();
    if (bw > 16) {
      c.save(); c.beginPath(); c.rect(x1 + 4, BL0, bw - 8, BL1 - BL0); c.clip();
      c.fillStyle = cur ? '#fff' : '#d6d6de'; c.fillText(`${i + 1}. ${F[i].name}`, x1 + 6, (BL0 + BL1) / 2 + 1);
      c.restore();
    }
  });
  // music end
  if (S.musicDur) { const x = t2x(S.musicDur); if (x > 0 && x < W) { c.fillStyle = '#ff6b6b'; c.fillRect(x, WV0, 1, WV1 - WV0); } }
  // playhead
  const px = Math.round(t2x(S.t));
  if (px >= -2 && px <= W + 2) {
    c.fillStyle = '#fff'; c.fillRect(px - 1, 0, 2, H);
    c.beginPath(); c.moveTo(px - 5, 0); c.lineTo(px + 5, 0); c.lineTo(px, 6); c.fill();
  }
}
function keepVisible(t, follow) {
  const x = t2x(t);
  if (follow ? (x > TL.w * 0.75 || x < 0) : (x < 20 || x > TL.w - 40)) S.scrollX = clampScroll(t * S.pps - TL.w * 0.3);
}
let tld = null;
tl.addEventListener('pointerdown', e => {
  tl.setPointerCapture(e.pointerId);
  const r = tl.getBoundingClientRect();
  tld = { x0: e.clientX, s0: S.scrollX, moved: false, x: e.clientX - r.left, y: e.clientY - r.top };
});
tl.addEventListener('pointermove', e => {
  if (!tld) return; const dx = e.clientX - tld.x0;
  if (!tld.moved && Math.abs(dx) < 6) return;
  tld.moved = true; S.scrollX = clampScroll(tld.s0 - dx); drawTL();
});
tl.addEventListener('pointerup', () => {
  if (!tld) return;
  if (!tld.moved) {
    const t = x2t(tld.x);
    if (tld.y >= TL.h - 28) {
      const i = starts().findIndex(s => t >= s.s && t < s.h);
      if (i >= 0) { goFormation(i); tld = null; return; }
    }
    seek(t);
  }
  tld = null;
});
tl.addEventListener('pointercancel', () => { tld = null; });
tl.addEventListener('wheel', e => { e.preventDefault(); S.scrollX = clampScroll(S.scrollX + (e.deltaX || e.deltaY)); drawTL(); }, { passive: false });
function zoom(f) {
  const ct = x2t(TL.w / 2); S.pps = clamp(S.pps * f, 4, 200); store.set('pps', S.pps);
  S.scrollX = clampScroll(ct * S.pps - TL.w / 2); drawTL();
}
$('#zIn').onclick = () => zoom(1.5);
$('#zOut').onclick = () => zoom(1 / 1.5);

/* ================= playback ================= */
const audio = $('#audio');
let wakeLock = null;
async function requestWake() { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {} }
function releaseWake() { try { wakeLock?.release(); } catch {} wakeLock = null; }

function play() {
  if (S.playing) return;
  if (S.t >= choreoEnd() - 0.05 && S.t >= (S.musicDur || 0) - 0.05) S.t = 0;
  S.playing = true; S.sel.clear();
  if (S.musicURL && S.t < S.musicDur) {
    audio.playbackRate = S.rate; try { audio.preservesPitch = true; } catch {}
    audio.currentTime = S.t;
    const pr = audio.play(); if (pr) pr.catch(() => toast('Не удалось включить звук'));
  }
  S.clockStart = performance.now(); S.clockT = S.t;
  requestWake(); renderTransport(); renderSelBar(); renderDyn();
  requestAnimationFrame(tick);
}
function tick() {
  if (!S.playing) return;
  let t;
  if (S.musicURL && !audio.paused && !audio.ended) { t = audio.currentTime; S.clockStart = performance.now(); S.clockT = t; }
  else t = S.clockT + (performance.now() - S.clockStart) / 1000 * S.rate;
  const end = Math.max(choreoEnd(), S.musicDur || 0);
  S.t = t;
  if (t >= end) { S.t = end; pause(); return; }
  const fi = stateAt(t).fi; if (fi !== S.fi) { S.fi = fi; renderHeader(); }
  renderDyn(); keepVisible(t, true); drawTL(); updateClock();
  requestAnimationFrame(tick);
}
function pause() {
  if (!S.playing) return;
  S.playing = false; audio.pause(); releaseWake();
  S.fi = stateAt(S.t).fi; renderAll();
}
function seek(t) {
  S.t = clamp(t, 0, totalDur()); S.fi = stateAt(S.t).fi;
  if (S.playing) {
    if (S.musicURL && S.t < S.musicDur) { audio.currentTime = S.t; if (audio.paused) audio.play().catch(() => {}); } else audio.pause();
    S.clockStart = performance.now(); S.clockT = S.t;
  }
  renderHeader(); renderDyn(); drawTL(); updateClock(); renderSheetIf('formation');
}
function goFormation(i) {
  i = clamp(i, 0, S.p.formations.length - 1);
  S.fi = i; const t = starts()[i].s;
  if (S.playing) seek(t); else S.t = t;
  keepVisible(S.t, false); renderAll();
}
$('#btnPlay').onclick = () => S.playing ? pause() : play();
$('#btnPrev').onclick = () => {
  const s = starts()[S.fi].s;
  goFormation(S.t > s + 0.3 ? S.fi : S.fi - 1);
};
$('#btnNext').onclick = () => goFormation(S.fi + 1);
$('#btnAddF').onclick = () => addFormation();

function addFormation() {
  if (S.playing) pause();
  const cur = S.p.formations[S.fi];
  mut(() => {
    const n = S.p.formations.length + 1;
    const f = { id: uid(), name: `Формация ${n}`, hold: 8, trans: 8, notes: '', pos: JSON.parse(JSON.stringify(cur.pos)) };
    S.p.formations.splice(S.fi + 1, 0, f);
    S.fi = S.fi + 1; S.t = starts()[S.fi].s;
  });
  keepVisible(S.t, false); drawTL();
  toast('Формация добавлена — двигайте танцоров');
}

/* ================= render ================= */
function renderHeader() {
  $('#projName').textContent = S.p.name;
  const f = S.p.formations[S.fi];
  $('#fmInfo').textContent = `Формация ${S.fi + 1}/${S.p.formations.length} · ${f.name}`;
}
function updateClock() {
  $('#tTime').textContent = fmtTime(S.t);
  $('#tCount').textContent = countLabel(S.t);
}
function renderTransport() {
  const b = $('#btnPlay'); b.innerHTML = icon(S.playing ? 'pause' : 'play');
  b.setAttribute('aria-label', S.playing ? 'Пауза' : 'Играть');
}
function renderToolBtns() {
  $('#tMulti').classList.toggle('on', S.multi);
  $('#tSnap').classList.toggle('on', S.snap);
  $('#tPaths').classList.toggle('on', S.paths);
}
function renderAll() {
  if (!S.p) return;
  S.fi = clamp(S.fi, 0, S.p.formations.length - 1);
  renderHeader(); renderStage(); renderSelBar(); renderTransport(); renderToolBtns(); updateClock(); drawTL(); updUndo(); renderSheet();
}

$('#tMulti').onclick = () => { S.multi = !S.multi; renderToolBtns(); toast(S.multi ? 'Выбор нескольких: касайтесь танцоров' : 'Выбор одного'); };
$('#tSnap').onclick = () => { S.snap = !S.snap; store.set('snap', S.snap); renderToolBtns(); toast(S.snap ? 'Привязка к сетке включена' : 'Привязка выключена'); };
$('#tPaths').onclick = () => { S.paths = !S.paths; store.set('paths', S.paths); renderToolBtns(); renderDyn(); };
$('#btnUndo').onclick = undo;
$('#btnRedo').onclick = redo;

/* ================= sheets ================= */
let sheetTab = null;
function openSheet(tab) {
  if (sheetTab === tab) return closeSheet();
  sheetTab = tab; $('#sheet').classList.remove('hidden'); renderSheet();
  $('#sheetBody').scrollTop = 0;
}
function closeSheet() { sheetTab = null; $('#sheet').classList.add('hidden'); $$('.tabs button').forEach(b => b.classList.remove('on')); }
function renderSheetIf(tab) { if (sheetTab === tab) renderSheet(); }
function renderSheet() {
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === sheetTab));
  if (!sheetTab) return;
  const sh = SHEETS[sheetTab], body = $('#sheetBody');
  $('#sheetTitle').textContent = sh.title();
  body.innerHTML = sh.html(); hydrateIcons(body); sh.bind(body);
}
$$('.tabs button').forEach(b => { b.onclick = () => openSheet(b.dataset.tab); });
$('#sheetClose').onclick = closeSheet;
$('#btnMenu').onclick = () => openSheet('projects');
$('#btnShare').onclick = () => openSheet('export');

function stepper(key, val, disabled) {
  return `<div class="stepper ${disabled ? 'dis' : ''}"><button data-step="${key}" data-d="-1">−</button><div class="val" data-ask="${key}">${cnt(val)}<small>${secs(val)}</small></div><button data-step="${key}" data-d="1">+</button></div>`;
}
const toggleRow = (key, label, on) => `<div class="toggle" data-tg="${key}"><span>${label}</span><span class="sw-t ${on ? 'on' : ''}"></span></div>`;

const SHEETS = {
  formation: {
    title: () => `Формация ${S.fi + 1} из ${S.p.formations.length}`,
    html() {
      const f = S.p.formations[S.fi], st = starts()[S.fi], last = S.fi === S.p.formations.length - 1;
      return `
        <input class="inp" data-f="name" value="${esc(f.name)}" placeholder="Название">
        <div class="grid2">
          <div class="fld"><label>Стоим в формации</label>${stepper('hold', f.hold)}</div>
          <div class="fld"><label>Переход к следующей</label>${stepper('trans', f.trans, last)}</div>
        </div>
        <div class="info">Начало: ${fmtTime(st.s)} · ${countLabel(st.s)}</div>
        <textarea class="inp" data-f="notes" placeholder="Заметки: движения, акценты, кто куда смотрит…">${esc(f.notes)}</textarea>
        <div class="btnrow">
          <button class="btn" data-a="dup" data-icon="copy">Дублировать</button>
          <button class="btn" data-a="mirror" data-icon="mirror">Зеркально</button>
          <button class="btn" data-a="left" data-icon="left">Раньше</button>
          <button class="btn" data-a="right" data-icon="right">Позже</button>
          <button class="btn danger" data-a="del" data-icon="trash">Удалить</button>
        </div>`;
    },
    bind(b) {
      const f = S.p.formations[S.fi];
      $$('[data-f]', b).forEach(el => { el.onchange = () => mut(() => { f[el.dataset.f] = el.value; }); });
      $$('[data-step]', b).forEach(el => { el.onclick = () => mut(() => { const k = el.dataset.step; f[k] = Math.max(0, f[k] + +el.dataset.d); }); });
      $$('[data-ask]', b).forEach(el => { el.onclick = () => {
        const k = el.dataset.ask, v = prompt(k === 'hold' ? 'Сколько счетов стоим в формации?' : 'Сколько счетов длится переход?', f[k]);
        if (v == null) return; const n = parseFloat(String(v).replace(',', '.'));
        if (isFinite(n) && n >= 0) mut(() => { f[k] = Math.round(n * 2) / 2; });
      }; });
      $$('[data-a]', b).forEach(el => { el.onclick = () => {
        const a = el.dataset.a, F = S.p.formations, i = S.fi;
        if (a === 'dup') mut(() => { F.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(f)), id: uid(), name: f.name + ' (копия)' }); S.fi = i + 1; S.t = starts()[S.fi].s; });
        if (a === 'mirror') mut(() => { for (const id in f.pos) f.pos[id] = [r2(-f.pos[id][0]), f.pos[id][1]]; });
        if (a === 'left' && i > 0) mut(() => { [F[i - 1], F[i]] = [F[i], F[i - 1]]; S.fi = i - 1; S.t = starts()[S.fi].s; });
        if (a === 'right' && i < F.length - 1) mut(() => { [F[i + 1], F[i]] = [F[i], F[i + 1]]; S.fi = i + 1; S.t = starts()[S.fi].s; });
        if (a === 'del') {
          if (F.length < 2) return toast('Это единственная формация');
          if (!confirm(`Удалить формацию «${f.name}»?`)) return;
          mut(() => { F.splice(i, 1); S.fi = Math.max(0, i - 1); S.t = starts()[S.fi].s; });
        }
      }; });
    },
  },

  dancers: {
    title: () => `Танцоры (${S.p.dancers.length})`,
    html() {
      const groups = [...new Set(S.p.dancers.map(d => d.group).filter(Boolean))];
      let h = `<div class="btnrow" style="margin-top:4px">
          <button class="btn pri" data-a="add" data-icon="plus">Танцор</button>
          <button class="btn" data-a="list" data-icon="users">Добавить списком</button>
        </div>`;
      if (groups.length) {
        h += `<h4>Группы — коснитесь, чтобы выделить</h4><div class="chips">` + groups.map(g => {
          const ds = S.p.dancers.filter(d => d.group === g);
          return `<button class="chip" data-g="${esc(g)}"><i style="background:${ds[0].color}"></i>${esc(g)} · ${ds.length}</button>`;
        }).join('') + '</div>';
      }
      h += `<h4>Состав</h4><datalist id="grpList">${groups.map(g => `<option value="${esc(g)}">`).join('')}</datalist>`;
      h += S.p.dancers.map(d => `<div class="drow" data-id="${d.id}">
          <input type="color" class="sw" value="${d.color}">
          <input class="inp" data-k="name" value="${esc(d.name)}" placeholder="Имя">
          <input class="inp g" data-k="group" value="${esc(d.group)}" placeholder="Группа" list="grpList">
          <button class="ib" data-a="del" aria-label="Удалить" data-icon="trash"></button>
        </div>`).join('');
      if (groups.length) h += `<p class="hint">Цвет группы: выделите группу и поменяйте цвет у одного танцора — применится ко всем выделенным.</p>`;
      return h;
    },
    bind(b) {
      $$('.drow', b).forEach(row => {
        const id = row.dataset.id, d = S.p.dancers.find(x => x.id === id);
        $$('[data-k]', row).forEach(el => { el.onchange = () => mut(() => { d[el.dataset.k] = el.value.trim(); }); });
        $('.sw', row).onchange = e => mut(() => {
          const targets = S.sel.has(id) ? S.p.dancers.filter(x => S.sel.has(x.id)) : [d];
          targets.forEach(x => { x.color = e.target.value; });
        });
        $('[data-a=del]', row).onclick = () => {
          if (!confirm(`Удалить «${d.name}» из всех формаций?`)) return;
          mut(() => { S.p.dancers = S.p.dancers.filter(x => x.id !== id); S.p.formations.forEach(f => delete f.pos[id]); S.sel.delete(id); });
        };
      });
      $$('[data-g]', b).forEach(el => { el.onclick = () => {
        S.sel = new Set(S.p.dancers.filter(d => d.group === el.dataset.g).map(d => d.id)); S.multi = true;
        renderToolBtns(); renderDyn(); renderSelBar(); toast(`Выделена группа «${el.dataset.g}»`);
      }; });
      $('[data-a=add]', b).onclick = () => mut(() => addDancers([`Танцор ${S.p.dancers.length + 1}`]));
      $('[data-a=list]', b).onclick = () => {
        const v = prompt('Имена через запятую:', ''); if (!v) return;
        const names = v.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
        if (names.length) mut(() => addDancers(names));
      };
    },
  },

  music: {
    title: () => 'Музыка и счёт',
    html() {
      const m = S.p.music;
      let h = m ? `<div class="card">${icon('music')}<div class="grow"><div class="nm">${esc(m.name)}</div><div class="sub">${S.musicDur ? fmtTime(S.musicDur) : 'загрузка…'}</div></div></div>
          <div class="btnrow"><button class="btn" data-a="load" data-icon="upload">Заменить</button><button class="btn danger" data-a="rm" data-icon="trash">Убрать</button></div>`
        : `<button class="btn pri big" data-a="load" data-icon="upload">Загрузить трек из «Файлов»</button>
           <p class="hint">mp3, m4a, wav. Треки из Apple Music защищены и не загрузятся — сохраните файл в приложение «Файлы» (например, из Telegram: «Сохранить в Файлы»).</p>`;
      h += `<h4>Счёт по восьмёркам</h4>
        <div class="grid2">
          <div class="fld"><label>Темп, BPM</label><input class="inp" type="number" inputmode="decimal" data-n="bpm" value="${S.p.bpm}"></div>
          <div class="fld"><label>&nbsp;</label><button class="btn big" data-a="tap" style="padding:10px">Тап-темп</button></div>
        </div>
        <div class="grid2">
          <div class="fld"><label>Первый счёт «1», сек</label><input class="inp" type="number" inputmode="decimal" step="0.01" data-n="offset" value="${S.p.offset}"></div>
          <div class="fld"><label>&nbsp;</label><button class="btn big" data-a="here" style="padding:10px">= текущее время</button></div>
        </div>
        <p class="hint">Тап-темп: включите музыку и стучите по кнопке в такт (4+ раза). Длительности формаций задаются в счётах — при смене темпа таймлайн пересчитается.</p>
        <h4>Скорость репетиции</h4>
        <div class="chips">${[0.5, 0.75, 1].map(r => `<button class="chip ${S.rate === r ? 'on' : ''}" data-rate="${r}">${r === 1 ? 'Обычная' : r + '×'}</button>`).join('')}</div>`;
      return h;
    },
    bind(b) {
      $$('[data-a=load]', b).forEach(el => { el.onclick = () => $('#fileAudio').click(); });
      const rm = $('[data-a=rm]', b);
      if (rm) rm.onclick = () => { if (confirm('Убрать музыку из постановки?')) { const k = S.p.music.key; mut(() => { S.p.music = null; }); loadMusic(); cleanupAudio(k); } };
      $$('[data-n]', b).forEach(el => { el.onchange = () => {
        const v = parseFloat(String(el.value).replace(',', '.')), k = el.dataset.n;
        if (!isFinite(v) || (k === 'bpm' && (v < 20 || v > 400)) || v < 0) { el.value = S.p[k]; return toast('Неверное значение'); }
        mut(() => { S.p[k] = r2(v); });
      }; });
      $('[data-a=here]', b).onclick = () => mut(() => { S.p.offset = r2(S.t); });
      $('[data-a=tap]', b).onclick = () => {
        const now = performance.now(); if (S.taps.length && now - S.taps[S.taps.length - 1] > 2000) S.taps = [];
        S.taps.push(now); if (S.taps.length > 12) S.taps.shift();
        if (S.taps.length >= 4) {
          const iv = (S.taps[S.taps.length - 1] - S.taps[0]) / (S.taps.length - 1), bpm = Math.round(60000 / iv);
          if (S.taps.length === 4) commit();
          S.p.bpm = bpm; save(); $('[data-n=bpm]', b).value = bpm; drawTL(); updateClock();
          toast(`Темп: ${bpm} BPM`, 900);
        } else toast(`Ещё ${4 - S.taps.length}…`, 600);
      };
      $$('[data-rate]', b).forEach(el => { el.onclick = () => { S.rate = +el.dataset.rate; audio.playbackRate = S.rate; if (S.playing) { S.clockStart = performance.now(); S.clockT = S.t; } renderSheet(); }; });
    },
  },

  stage: {
    title: () => 'Сцена и вид',
    html() {
      const s = S.p.stage;
      return `<div class="grid2">
          <div class="fld"><label>Ширина, м</label><input class="inp" type="number" inputmode="decimal" data-s="w" value="${s.w}"></div>
          <div class="fld"><label>Глубина, м</label><input class="inp" type="number" inputmode="decimal" data-s="d" value="${s.d}"></div>
        </div>
        <h4>Шаг сетки</h4>
        <div class="chips">${[0.5, 1, 2].map(g => `<button class="chip ${s.grid === g ? 'on' : ''}" data-grid="${g}">${g} м</button>`).join('')}</div>
        <h4>Размер фигур</h4>
        <input type="range" min="0.6" max="1.8" step="0.1" value="${S.p.size || 1}" data-size>
        <h4>Отображение</h4>
        ${toggleRow('names', 'Имена под фигурами', S.p.showNames)}
        ${toggleRow('paths', 'Пути из прошлой формации', S.paths)}
        ${toggleRow('snap', 'Привязка к сетке', S.snap)}
        <p class="hint">Танцоров можно ставить и за сценой — в кулисах вокруг площадки, для выходов и уходов.</p>`;
    },
    bind(b) {
      $$('[data-s]', b).forEach(el => { el.onchange = () => {
        const v = parseFloat(String(el.value).replace(',', '.'));
        if (!isFinite(v) || v < 2 || v > 60) { el.value = S.p.stage[el.dataset.s]; return toast('От 2 до 60 м'); }
        mut(() => { S.p.stage[el.dataset.s] = r2(v); });
      }; });
      $$('[data-grid]', b).forEach(el => { el.onclick = () => mut(() => { S.p.stage.grid = +el.dataset.grid; }); });
      const sz = $('[data-size]', b);
      sz.oninput = () => { S.p.size = +sz.value; renderDyn(); };
      sz.onchange = () => { S.p.size = +sz.value; save(); };
      $$('[data-tg]', b).forEach(el => { el.onclick = () => {
        const k = el.dataset.tg;
        if (k === 'names') mut(() => { S.p.showNames = !S.p.showNames; });
        if (k === 'paths') { S.paths = !S.paths; store.set('paths', S.paths); renderAll(); }
        if (k === 'snap') { S.snap = !S.snap; store.set('snap', S.snap); renderAll(); }
      }; });
    },
  },

  projects: {
    title: () => 'Постановки',
    html() {
      return `<div class="btnrow" style="margin-top:4px">
          <button class="btn pri" data-a="new" data-icon="plus">Новая</button>
          <button class="btn" data-a="import" data-icon="upload">Открыть файл</button>
        </div><div class="plist" id="plist"><p class="hint">Загрузка…</p></div>`;
    },
    bind(b) {
      $('[data-a=new]', b).onclick = async () => {
        const name = prompt('Название постановки:', 'Новая постановка'); if (!name) return;
        const p = newProject(name.trim()); await DB.put(p); await openProject(p); closeSheet();
      };
      $('[data-a=import]', b).onclick = () => $('#fileImport').click();
      DB.all().then(list => {
        list.sort((a, c) => c.updated - a.updated);
        const el = $('#plist', b); if (!el) return;
        el.innerHTML = list.map(p => `<div class="card ${p.id === S.p.id ? 'cur' : ''}" data-id="${p.id}">
            <div class="grow" data-a="open"><div class="nm">${esc(p.id === S.p.id ? S.p.name : p.name)}</div>
            <div class="sub">${p.formations.length} ${plural(p.formations.length, 'формация', 'формации', 'формаций')} · ${p.dancers.length} ${plural(p.dancers.length, 'танцор', 'танцора', 'танцоров')} · ${new Date(p.updated).toLocaleDateString('ru')}</div></div>
            <button class="ib" data-a="ren" aria-label="Переименовать">${icon('edit')}</button>
            <button class="ib" data-a="copy" aria-label="Копия">${icon('copy')}</button>
            <button class="ib" data-a="del" aria-label="Удалить">${icon('trash')}</button>
          </div>`).join('');
        $$('.card', el).forEach(card => {
          const id = card.dataset.id, p = list.find(x => x.id === id);
          $('[data-a=open]', card).onclick = async () => { if (id !== S.p.id) { flush(); await openProject(p); } closeSheet(); };
          $('[data-a=ren]', card).onclick = async () => {
            const n = prompt('Новое название:', id === S.p.id ? S.p.name : p.name); if (!n) return;
            if (id === S.p.id) { mut(() => { S.p.name = n.trim(); }); flush(); } else { p.name = n.trim(); await DB.put(p); }
            renderSheet();
          };
          $('[data-a=copy]', card).onclick = async () => {
            flush(); const src = id === S.p.id ? S.p : p;
            const c = { ...JSON.parse(JSON.stringify(src)), id: uid(), name: src.name + ' (копия)', created: Date.now(), updated: Date.now() };
            if (src.music) { const rec = await DB.getAudio(src.music.key); if (rec) { const k = uid(); await DB.putAudio(k, rec); c.music = { ...src.music, key: k }; } }
            await DB.put(c); renderSheet(); toast('Копия создана');
          };
          $('[data-a=del]', card).onclick = async () => {
            if (!confirm(`Удалить постановку «${p.name}» навсегда? Это нельзя отменить.`)) return;
            await DB.del(id); if (p.music) cleanupAudio(p.music.key);
            if (id === S.p.id) { const rest = (await DB.all()).sort((a, c) => c.updated - a.updated); let np = rest[0]; if (!np) { np = newProject('Моя постановка'); await DB.put(np); } await openProject(np); }
            renderSheet();
          };
        });
      });
    },
  },

  export: {
    title: () => 'Поделиться и сохранить',
    html() {
      return `<h4>Для танцоров</h4>
        <button class="btn big" data-a="png" data-icon="image">Картинка текущей формации (PNG)</button>
        <div style="height:8px"></div>
        <button class="btn big" data-a="pdf" data-icon="file">Все формации одним PDF</button>
        <h4>Резервная копия</h4>
        <button class="btn big" data-a="backup" data-icon="share">Файл постановки${S.p.music ? ' с музыкой' : ''}</button>
        <div style="height:8px"></div>
        <button class="btn big" data-a="import" data-icon="upload">Открыть файл постановки</button>
        <p class="hint">Данные хранятся только на этом телефоне. Время от времени сохраняйте файл постановки в «Файлы» или iCloud — из него всё восстанавливается, его же можно открыть на другом устройстве.</p>`;
    },
    bind(b) {
      $('[data-a=png]', b).onclick = exportPNG;
      $('[data-a=pdf]', b).onclick = exportPDF;
      $('[data-a=backup]', b).onclick = exportProject;
      $('[data-a=import]', b).onclick = () => $('#fileImport').click();
    },
  },
};

function addDancers(names) {
  const { w, d } = S.p.stage, used = S.p.dancers.length;
  names.forEach((name, i) => {
    const dn = { id: uid(), name, color: PALETTE[(used + i) % PALETTE.length], group: '' };
    S.p.dancers.push(dn);
    for (const f of S.p.formations) f.pos[dn.id] = freeSpot(f, w, d);
  });
}
function freeSpot(f, w, d) {
  const taken = Object.values(f.pos);
  for (let row = 0; row < d * 2; row++) {
    const y = d - 1 - row * 0.5; if (y < 0.5) break;
    for (let k = 0; k <= w; k++) {
      for (const x of k ? [k / 2, -k / 2] : [0]) {
        if (Math.abs(x) > w / 2 - 0.5) continue;
        if (taken.every(p => Math.hypot(p[0] - x, p[1] - y) >= 1)) return [x, y];
      }
    }
  }
  return [0, d / 2];
}

/* ================= music ================= */
$('#fileAudio').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  toast('Загружаю трек…', 4000);
  try {
    const buf = await file.arrayBuffer(), key = uid(), old = S.p.music && S.p.music.key;
    await DB.putAudio(key, { buf, type: file.type || 'audio/mpeg', name: file.name });
    mut(() => { S.p.music = { key, name: file.name.replace(/\.[^.]+$/, '') }; });
    flush(); await loadMusic(); if (old) cleanupAudio(old);
    renderSheetIf('music'); toast('Музыка загружена');
  } catch (err) { toast('Не удалось загрузить: ' + err.message, 4000); }
};
async function cleanupAudio(key) {
  const list = await DB.all();
  if (!list.some(p => p.music && p.music.key === key) && !(S.p.music && S.p.music.key === key)) DB.delAudio(key);
}
async function loadMusic() {
  if (S.musicURL) { URL.revokeObjectURL(S.musicURL); S.musicURL = null; }
  S.peaks = null; S.musicDur = 0; audio.removeAttribute('src'); audio.load();
  const m = S.p.music; if (!m) { drawTL(); return; }
  const rec = await DB.getAudio(m.key);
  if (!rec) { toast('Музыка не найдена — загрузите трек заново'); return; }
  S.musicURL = URL.createObjectURL(new Blob([rec.buf], { type: rec.type || 'audio/mpeg' }));
  audio.src = S.musicURL; audio.load();
  audio.addEventListener('loadedmetadata', () => { if (!S.musicDur && isFinite(audio.duration)) { S.musicDur = audio.duration; drawTL(); renderSheetIf('music'); } }, { once: true });
  try {
    const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC();
    const ab = await new Promise((res, rej) => ctx.decodeAudioData(rec.buf.slice(0), res, rej));
    S.musicDur = ab.duration; S.peaks = computePeaks(ab); ctx.close && ctx.close();
  } catch {}
  drawTL(); renderSheetIf('music');
}
function computePeaks(ab) {
  const rate = S.peaksRate, ch = ab.getChannelData(0), step = Math.max(1, Math.floor(ab.sampleRate / rate));
  const n = Math.ceil(ch.length / step), out = new Float32Array(n); let mx = 0;
  for (let i = 0; i < n; i++) {
    let m = 0; const e = Math.min(ch.length, (i + 1) * step);
    for (let j = i * step; j < e; j += 4) { const v = Math.abs(ch[j]); if (v > m) m = v; }
    out[i] = m; if (m > mx) mx = m;
  }
  if (mx > 0) for (let i = 0; i < n; i++) out[i] /= mx;
  return out;
}

/* ================= export ================= */
function wrapText(s, max) {
  const out = [];
  for (const para of String(s || '').split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/)) {
      if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
    }
    out.push(line);
  }
  return out.filter((l, i, a) => l || (i > 0 && i < a.length - 1));
}
function formationSVG(i) {
  const p = S.p, f = p.formations[i], { w, d, grid } = p.stage, M = 1, PX = 64;
  const st = starts()[i], last = i === p.formations.length - 1;
  const W = Math.max((w + 2 * M) * PX, 640), HEAD = 112;
  const sx = W / 2, stageH = (d + 2 * M) * PX;
  const notes = wrapText(f.notes, Math.floor(W / 11.5));
  const H = HEAD + stageH + 40 + (notes.length ? notes.length * 26 + 24 : 0);
  const font = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${font}">`;
  s += `<rect width="${W}" height="${H}" fill="#ffffff"/>`;
  s += `<text x="28" y="40" font-size="26" font-weight="700" fill="#111">${esc(p.name)}</text>`;
  s += `<text x="28" y="72" font-size="21" fill="#222">Формация ${i + 1}/${p.formations.length} — ${esc(f.name)}</text>`;
  const tline = `${fmtTime(st.s)} · ${countLabel(st.s)} · стоим ${cnt(f.hold)}${!last && f.trans ? ` · переход ${cnt(f.trans)}` : ''}`;
  s += `<text x="28" y="98" font-size="16" fill="#666">${esc(tline)}</text>`;
  const U = v => r2(v * PX);
  const X = x => r2(sx + x * PX), Y = y => r2(HEAD + (y + M) * PX);
  s += `<rect x="${X(-w / 2)}" y="${Y(0)}" width="${U(w)}" height="${U(d)}" fill="#f6f6f8" stroke="#888" stroke-width="2"/>`;
  for (let x = grid; x < w / 2 - 1e-6; x += grid) for (const gx of [x, -x]) s += `<line x1="${X(gx)}" y1="${Y(0)}" x2="${X(gx)}" y2="${Y(d)}" stroke="#e1e1e6" stroke-width="1"/>`;
  for (let y = d - grid; y > 1e-6; y -= grid) s += `<line x1="${X(-w / 2)}" y1="${Y(y)}" x2="${X(w / 2)}" y2="${Y(y)}" stroke="#e1e1e6" stroke-width="1"/>`;
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(d)}" stroke="#b5b5c0" stroke-width="1.5" stroke-dasharray="8 6"/>`;
  for (let x = 0; x <= w / 2 + 1e-6; x += (w > 14 ? 2 : 1)) for (const gx of x ? [x, -x] : [0]) s += `<text x="${X(gx)}" y="${Y(d) + 20}" font-size="14" fill="#999" text-anchor="middle">${Math.round(x)}</text>`;
  s += `<text x="${X(0)}" y="${Y(d) + M * PX - 4}" font-size="18" font-weight="600" fill="#777" text-anchor="middle" letter-spacing="4">ЗРИТЕЛИ</text>`;
  s += `<text x="${X(0)}" y="${Y(0) - 12}" font-size="14" fill="#aaa" text-anchor="middle" letter-spacing="3">ЗАДНИК</text>`;
  const R = 0.32 * (p.size || 1) * PX;
  if (i > 0) {
    const prev = p.formations[i - 1];
    for (const dn of p.dancers) {
      const a = posOf(prev, dn), b = posOf(f, dn);
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.05) continue;
      s += `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${dn.color}" stroke-width="2.5" stroke-dasharray="6 5" opacity=".7"/>`;
      s += `<circle cx="${X(a[0])}" cy="${Y(a[1])}" r="${r2(R * 0.75)}" fill="none" stroke="${dn.color}" stroke-width="2" opacity=".55"/>`;
    }
  }
  for (const dn of p.dancers) {
    const [x, y] = posOf(f, dn);
    s += `<circle cx="${X(x)}" cy="${Y(y)}" r="${r2(R)}" fill="${dn.color}" stroke="#00000033" stroke-width="1.5"/>`;
    s += `<text x="${X(x)}" y="${r2(Y(y) + R * 0.3)}" font-size="${r2(R * 0.82)}" font-weight="700" fill="${textColor(dn.color)}" text-anchor="middle">${esc(initials(dn.name))}</text>`;
    s += `<text x="${X(x)}" y="${r2(Y(y) + R + 17)}" font-size="15" font-weight="600" fill="#222" text-anchor="middle">${esc(dn.name)}</text>`;
  }
  if (notes.length) {
    let y = HEAD + stageH + 40;
    s += `<text x="28" y="${y}" font-size="15" font-weight="700" fill="#666">ЗАМЕТКИ</text>`;
    notes.forEach((l, k) => { s += `<text x="28" y="${y + 26 * (k + 1)}" font-size="18" fill="#222">${esc(l)}</text>`; });
  }
  return { svg: s + '</svg>', W, H };
}
async function renderCanvas(i, scale = 2) {
  const { svg: str, W, H } = formationSVG(i);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  await (img.decode ? img.decode() : new Promise((res, rej) => { img.onload = res; img.onerror = rej; }));
  const c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}
const safeName = s => String(s).replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 60) || 'choreo';
function offerFile(blob, name, title) {
  const file = new File([blob], name, { type: blob.type });
  const canShare = navigator.canShare && navigator.canShare({ files: [file] });
  modal(`<h3>${esc(title)}</h3><p>${esc(name)} · ${(blob.size / 1024 / 1024).toFixed(1)} МБ</p>
    <div class="btnrow">${canShare ? '<button class="btn pri" data-a="share" data-icon="share">Поделиться</button>' : ''}
    <button class="btn ${canShare ? '' : 'pri'}" data-a="save" data-icon="upload">Сохранить</button>
    <button class="btn" data-a="close">Закрыть</button></div>`, (c, close) => {
    const sh = $('[data-a=share]', c);
    if (sh) sh.onclick = async () => { try { await navigator.share({ files: [file], title: name }); close(); } catch (e) { if (e.name !== 'AbortError') toast('Не получилось: ' + e.message); } };
    $('[data-a=save]', c).onclick = () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); close();
    };
    $('[data-a=close]', c).onclick = close;
  });
}
async function exportPNG() {
  try {
    const c = await renderCanvas(S.fi);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    offerFile(blob, `${safeName(S.p.name)} — ${S.fi + 1}. ${safeName(S.p.formations[S.fi].name)}.png`, 'Картинка готова');
  } catch (e) { toast('Ошибка: ' + e.message, 4000); }
}
async function exportPDF() {
  try {
    const pages = [];
    for (let i = 0; i < S.p.formations.length; i++) {
      toast(`Готовлю PDF: ${i + 1}/${S.p.formations.length}`, 3000);
      const c = await renderCanvas(i, 1.6);
      const bin = atob(c.toDataURL('image/jpeg', 0.88).split(',')[1]);
      const bytes = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      pages.push({ jpeg: bytes, w: c.width, h: c.height });
    }
    offerFile(makePDF(pages), `${safeName(S.p.name)}.pdf`, 'PDF готов');
  } catch (e) { toast('Ошибка: ' + e.message, 4000); }
}
function makePDF(pages) {
  const enc = new TextEncoder(), parts = [], offs = [];
  let len = 0;
  const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, body, stream) => {
    offs[n] = len; push(`${n} 0 obj\n${body}\n`);
    if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); }
    push('endobj\n');
  };
  push('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');
  const n = pages.length, kids = pages.map((_, k) => `${3 + k * 3} 0 R`).join(' ');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
  pages.forEach((pg, k) => {
    const id = 3 + k * 3, land = pg.w >= pg.h, PW = land ? 842 : 595, PH = land ? 595 : 842;
    const sc = Math.min((PW - 36) / pg.w, (PH - 36) / pg.h), dw = (pg.w * sc).toFixed(2), dh = (pg.h * sc).toFixed(2);
    const x = ((PW - pg.w * sc) / 2).toFixed(2), y = ((PH - pg.h * sc) / 2).toFixed(2);
    obj(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`);
    const content = enc.encode(`q ${dw} 0 0 ${dh} ${x} ${y} cm /Im0 Do Q`);
    obj(id + 1, `<< /Length ${content.length} >>`, content);
    obj(id + 2, `<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>`, pg.jpeg);
  });
  const total = 3 + n * 3, xref = len;
  let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let k = 1; k < total; k++) x += String(offs[k]).padStart(10, '0') + ' 00000 n \n';
  push(x + `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}
function abToB64(buf) { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function b64ToAb(s) { const bin = atob(s), b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b.buffer; }
async function exportProject() {
  try {
    flush();
    const out = { app: 'choreo', v: 1, project: S.p, music: null };
    if (S.p.music) { const rec = await DB.getAudio(S.p.music.key); if (rec) out.music = { type: rec.type, name: rec.name, b64: abToB64(rec.buf) }; }
    const blob = new Blob([JSON.stringify(out)], { type: 'application/json' });
    const d = new Date(), stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    offerFile(blob, `${safeName(S.p.name)} ${stamp}.choreo.json`, 'Файл постановки');
  } catch (e) { toast('Ошибка: ' + e.message, 4000); }
}
$('#fileImport').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'choreo' || !data.project || !Array.isArray(data.project.formations)) throw new Error('это не файл постановки');
    const p = data.project; p.id = uid(); p.updated = Date.now(); p.music = null;
    if (data.music) { const key = uid(); await DB.putAudio(key, { buf: b64ToAb(data.music.b64), type: data.music.type, name: data.music.name }); p.music = { key, name: data.project.music ? data.project.music.name : data.music.name }; }
    flush(); await DB.put(p); await openProject(p); closeSheet(); toast(`Открыта «${p.name}»`);
  } catch (err) { toast('Не удалось открыть: ' + err.message, 4000); }
};

/* ================= boot ================= */
async function openProject(p) {
  if (S.playing) pause();
  S.p = p; S.fi = 0; S.t = 0; S.sel.clear(); S.undo = []; S.redo = []; S.scrollX = 0;
  store.set('lastProject', p.id);
  renderAll();
  await loadMusic();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (S.playing) pause(); flush(); } });
window.addEventListener('pagehide', flush);
window.addEventListener('resize', () => { tlResize(); });
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); S.playing ? pause() : play(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  if (e.key === 'ArrowRight') goFormation(S.fi + 1);
  if (e.key === 'ArrowLeft') goFormation(S.fi - 1);
});

async function init() {
  hydrateIcons();
  try { await DB.open(); } catch (e) { toast('Хранилище недоступно: ' + e.message, 6000); return; }
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
  const list = await DB.all(), last = store.get('lastProject', null);
  let p = list.find(x => x.id === last) || list.sort((a, b) => b.updated - a.updated)[0];
  if (!p) { p = newProject('Моя первая постановка'); await DB.put(p); }
  tlResize();
  await openProject(p);
  tlResize();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
init();
})();
