/* 열쇠 구멍 너머 — 포인트 앤 클릭 엔진
 * 방(room) 데이터는 js/rooms/*.js 에서 Engine.registerRoom({...}) 으로 등록한다.
 * 무대는 1600x900 좌표계이고, 화면 크기에 맞춰 통째로 확대/축소된다.
 * file:// 로 열어도 돌아가도록 ES 모듈 대신 일반 스크립트로 작성했다.
 */
(function () {
  'use strict';
  const W = 1600, H = 900;
  const Engine = (window.Engine = { rooms: {}, order: [], registerRoom(r) { this.rooms[r.id] = r; this.order.push(r.id); } });

  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경은 무시 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } },
  };
  Engine.store = store;
  const sfx = (n) => window.Sfx && window.Sfx.play(n);

  class Game {
    constructor(app, room, opts = {}) {
      this.app = app; this.room = room; this.opts = opts;
      this.key = 'btk.save.' + room.id;
      const saved = opts.fresh ? null : store.get(this.key);
      this.s = saved || { view: room.start, flags: {}, inv: [], sel: null, zoom: null, hint: { key: '', level: 0 } };
      this.s.sel = null;
      this.nodes = new Map();
      this.zoomNodes = new Map();
      this.renderedView = null;
      this.build();
      this.render(true);
      if (!saved && room.intro) this.after(500, () => this.say(room.intro, 6000));
    }

    /* ── 경로 ── */
    src(name) {
      if (!name) return '';
      if (name.includes('/') && name.includes('.')) return name;
      return this.room.assets + name + (name.includes('.') ? '' : '.svg');
    }

    /* ── DOM 뼈대 ── */
    build() {
      const app = this.app;
      app.innerHTML = '';
      this.frame = el('div', 'frame', app);
      const st = (this.stage = el('div', 'stage', this.frame));
      st.dataset.room = this.room.id;
      this.skyA = el('img', 'layer sky', st); this.skyA.src = this.src(this.room.sky[0]); this.skyA.alt = '';
      this.skyB = el('img', 'layer sky sky-lit', st); this.skyB.src = this.src(this.room.sky[1]); this.skyB.alt = '';
      this.viewEl = el('div', 'layer view', st);
      this.beams = el('img', 'layer beams', st); this.beams.alt = '';
      this.dim = el('div', 'layer dim', st);
      this.dust = el('canvas', 'layer dust', st); this.dust.width = W; this.dust.height = H;
      this.zoomEl = el('div', 'layer zoom', st); this.zoomEl.hidden = true;
      this.zoomInner = el('div', 'zoom-inner', this.zoomEl);
      this.zoomDim = el('div', 'layer dim zoom-dim', this.zoomEl);
      this.grain = el('div', 'layer grain', st);
      this.vignette = el('div', 'layer vignette', st);

      // 화살표
      this.navL = el('button', 'nav nav-left', st); this.navL.setAttribute('aria-label', '왼쪽 벽으로');
      this.navR = el('button', 'nav nav-right', st); this.navR.setAttribute('aria-label', '오른쪽 벽으로');
      this.navB = el('button', 'nav nav-back', st); this.navB.setAttribute('aria-label', '뒤로');
      this.navL.onclick = () => this.turn(-1);
      this.navR.onclick = () => this.turn(1);
      this.navB.onclick = () => this.closeZoom();

      // 인벤토리
      this.inv = el('div', 'inventory', st);
      this.inv.setAttribute('aria-label', '가방');

      // 상단 도구
      const tools = el('div', 'tools', st);
      this.btnMenu = el('button', 'tool tool-book', tools); this.btnMenu.title = '책 덮기 (처음 화면)';
      this.btnHint = el('button', 'tool tool-hint', tools); this.btnHint.title = '힌트';
      this.btnSound = el('button', 'tool tool-sound', tools); this.btnSound.title = '소리';
      this.btnMenu.onclick = () => this.opts.onExit && this.opts.onExit();
      this.btnHint.onclick = () => this.openHint();
      this.btnSound.onclick = () => { window.Sfx && window.Sfx.toggle(); this.syncSound(); };
      this.syncSound();
      this.chapter = el('div', 'chapter-label', st);
      this.chapter.textContent = this.room.chapter + ' · ' + this.room.title;

      // 자막
      this.sub = el('div', 'subtitle', st);
      this.sub.setAttribute('role', 'status');

      // 살펴보기 / 힌트 / 엔딩 오버레이
      this.inspectEl = el('div', 'overlay inspect', st); this.inspectEl.hidden = true;
      this.hintEl = el('div', 'overlay hintbox', st); this.hintEl.hidden = true;
      this.endEl = el('div', 'overlay ending', st); this.endEl.hidden = true;

      // 빈 곳 클릭 = 선택 해제
      this.viewEl.addEventListener('click', (e) => { if (e.target === this.viewEl && this.s.sel) { this.s.sel = null; this.renderInv(); } });
      st.addEventListener('contextmenu', (e) => { e.preventDefault(); if (this.s.sel) { this.s.sel = null; this.renderInv(); } });

      this.fit = () => {
        const r = this.app.getBoundingClientRect();
        const sc = Math.min(r.width / W, r.height / H);
        st.style.transform = `translate(-50%, -50%) scale(${sc})`;
      };
      window.addEventListener('resize', this.fit);
      this.fit();
      this.startDust();
      this.keyHandler = (e) => {
        if (e.key === 'ArrowLeft' && !this.s.zoom) this.turn(-1);
        else if (e.key === 'ArrowRight' && !this.s.zoom) this.turn(1);
        else if (e.key === 'Escape') { if (!this.inspectEl.hidden) this.closeInspect(); else if (!this.hintEl.hidden) this.hintEl.hidden = true; else if (this.s.zoom) this.closeZoom(); }
      };
      window.addEventListener('keydown', this.keyHandler);
    }
    destroy() {
      window.removeEventListener('resize', this.fit);
      window.removeEventListener('keydown', this.keyHandler);
      cancelAnimationFrame(this.dustRaf);
      clearTimeout(this.subT);
    }
    syncSound() { this.btnSound.classList.toggle('off', !!(window.Sfx && window.Sfx.muted)); }

    /* ── 핸들러에 건네는 도구 ── */
    get api() {
      const g = this;
      return {
        s: g.s, flags: g.s.flags,
        has: (id) => g.s.inv.includes(id),
        set: (k, v = true) => { g.s.flags[k] = v; },
        say: (t, ms) => g.say(t, ms),
        give: (id, fromEl) => g.give(id, fromEl),
        take: (id) => { g.s.inv = g.s.inv.filter((x) => x !== id); if (g.s.sel === id) g.s.sel = null; },
        swap: (a, b) => { const i = g.s.inv.indexOf(a); if (i >= 0) g.s.inv[i] = b; else g.s.inv.push(b); if (g.s.sel === a) g.s.sel = null; },
        zoom: (id) => g.openZoom(id),
        close: () => g.closeZoom(),
        sfx,
        after: (ms, fn) => g.after(ms, fn),
        render: () => g.render(),
        anim: (id, cls, ms = 1200) => g.anim(id, cls, ms),
        lock: (ms) => { g.busy = true; g.after(ms, () => { g.busy = false; }); },
        win: () => g.win(),
        go: (view) => { g.s.view = view; g.s.zoom = null; g.render(); },
      };
    }
    after(ms, fn) { setTimeout(() => { fn(); this.save(); this.render(); }, ms); }
    save() { store.set(this.key, this.s); }

    /* ── 렌더링 ── */
    isLit() { return this.room.isLit ? this.room.isLit(this.s) : true; }
    render(first) {
      const s = this.s, room = this.room;
      const lit = this.isLit();
      this.stage.classList.toggle('is-lit', lit);
      this.stage.classList.toggle('is-dark', !lit);
      this.skyB.style.opacity = lit ? 1 : 0;
      const beamSrc = room.beams && room.beams[s.view] ? this.src(room.beams[s.view]) : '';
      if (this.beams.dataset.src !== beamSrc) { this.beams.dataset.src = beamSrc; this.beams.src = beamSrc || 'data:,'; }

      if (this.renderedView !== s.view) {
        this.viewEl.querySelectorAll('.hit').forEach((h) => h.remove());
        const old = this.viewEl.querySelectorAll('.obj');
        if (!first) { old.forEach((n) => { n.classList.add('leaving'); setTimeout(() => n.remove(), 320); }); } else old.forEach((n) => n.remove());
        this.nodes = new Map();
        this.renderedView = s.view;
        this.viewEl.classList.remove('enter'); void this.viewEl.offsetWidth; this.viewEl.classList.add('enter');
      }
      const v = room.views[s.view];
      this.renderObjects(this.viewEl, this.nodes, [{ id: '__bg', img: v.bg, x: 0, y: 0, w: W, h: H, bg: true }, ...v.objects]);

      // 확대 화면
      if (s.zoom) {
        const z = room.zooms[s.zoom];
        if (this.zoomEl.hidden || this.zoomEl.dataset.id !== s.zoom) {
          this.zoomInner.innerHTML = ''; this.zoomNodes = new Map();
          this.zoomEl.dataset.id = s.zoom; this.zoomEl.hidden = false;
          this.zoomEl.classList.remove('enter'); void this.zoomEl.offsetWidth; this.zoomEl.classList.add('enter');
        }
        const bg = typeof z.bg === 'function' ? z.bg(s) : z.bg;
        this.renderObjects(this.zoomInner, this.zoomNodes, [{ id: '__bg', img: bg, x: 0, y: 0, w: W, h: H, bg: true }, ...(z.objects || [])]);
        if (z.text) {
          let t = this.zoomInner.querySelector('.zoom-text');
          if (!t) t = el('div', 'zoom-text', this.zoomInner);
          t.innerHTML = typeof z.text === 'function' ? z.text(s) : z.text;
        }
        if (z.widget) z.widget(this.zoomInner, this.api, this);
        this.zoomDim.style.opacity = lit ? 0 : (z.dim ?? 0.38);
      } else if (!this.zoomEl.hidden) {
        this.zoomEl.hidden = true; this.zoomEl.dataset.id = '';
      }
      this.navL.hidden = this.navR.hidden = !!s.zoom;
      this.navB.hidden = !s.zoom;
      this.stage.classList.toggle('zooming', !!s.zoom);
      this.renderInv();
    }

    renderObjects(layer, map, list) {
      const s = this.s;
      const seen = new Set();
      list.forEach((o, i) => {
        if (o.show && !o.show(s)) return;
        seen.add(o.id);
        let n = map.get(o.id);
        const imgName = typeof o.img === 'function' ? o.img(s) : o.img;
        const src = this.src(imgName);
        if (!n) {
          n = el('div', 'obj' + (o.bg ? ' obj-bg' : '') + (o.cls ? ' ' + o.cls : ''), layer);
          n.style.cssText = `left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;z-index:${i + 1}`;
          if (o.origin) n.style.transformOrigin = o.origin;
          if (!o.bg) n.classList.add('appear');
          const interactive = o.click || o.use || o.look || o.zoom;
          if (interactive) {
            let hit = n;
            if (o.hit) {
              hit = el('div', 'hit', layer);
              const [hx, hy, hw, hh] = o.hit;
              hit.style.cssText = `left:${hx}px;top:${hy}px;width:${hw}px;height:${hh}px;z-index:${i + 1}`;
              n.style.pointerEvents = 'none';
              n._hit = hit;
            }
            hit.classList.add('clickable');
            hit.setAttribute('role', 'button');
            hit.setAttribute('aria-label', o.label || o.id);
            hit.tabIndex = 0;
            hit.addEventListener('click', (e) => { e.stopPropagation(); this.onObj(o, n); });
            hit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onObj(o, n); } });
          }
          else n.style.pointerEvents = 'none';
          map.set(o.id, n);
        }
        if (src && n.dataset.src !== src) {
          const prev = n.querySelector('img:not(.out)');
          const img = el('img', '', n);
          img.alt = ''; img.draggable = false; img.src = src;
          if (prev && n.dataset.src) {
            img.classList.add('in');
            prev.classList.add('out');
            setTimeout(() => prev.remove(), 600);
          }
          n.dataset.src = src;
        }
      });
      for (const [id, n] of map) {
        if (!seen.has(id)) {
          map.delete(id);
          n.classList.add('leaving');
          if (n._hit) n._hit.remove();
          setTimeout(() => n.remove(), 420);
        }
      }
    }

    renderInv() {
      const s = this.s, inv = this.inv;
      inv.innerHTML = '';
      const slots = Math.max(6, s.inv.length);
      for (let i = 0; i < slots; i++) {
        const id = s.inv[i];
        const b = el('button', 'slot' + (id && s.sel === id ? ' sel' : '') + (id ? '' : ' empty'), inv);
        if (id) {
          const it = this.room.items[id];
          const img = el('img', '', b); img.src = this.src(it.img); img.alt = ''; img.draggable = false;
          b.title = it.name;
          b.setAttribute('aria-label', it.name + (s.sel === id ? ' (선택됨)' : ''));
          b.onclick = (e) => { e.stopPropagation(); this.onSlot(id); };
          b.dataset.item = id;
        } else b.disabled = true;
      }
      this.stage.classList.toggle('holding', !!s.sel);
    }

    /* ── 상호작용 ── */
    onObj(o, n) {
      if (this.busy) return;
      const s = this.s, api = this.api;
      if (s.sel) {
        const f = o.use && o.use[s.sel];
        if (f) { s.sel = null; f(api, n); }
        else {
          const nope = typeof o.wrong === 'function' ? o.wrong(s) : o.wrong;
          this.say(nope || pickOne(['그건 여기에 쓸 수 없을 것 같아.', '음… 여기엔 안 맞는 것 같아.', '다른 데 써 보자.']));
          sfx('nope');
          s.sel = null;
        }
      } else if (o.click) o.click(api, n);
      else if (o.zoom) { sfx('step'); this.openZoom(o.zoom); }
      else if (o.look) { this.say(typeof o.look === 'function' ? o.look(s) : o.look); sfx('tap'); }
      this.save(); this.render();
    }
    onSlot(id) {
      const s = this.s;
      if (!s.sel) { s.sel = id; sfx('tap'); }
      else if (s.sel === id) { this.inspect(id); }
      else {
        const c = this.room.combos.find((c) => (c.a === s.sel && c.b === id) || (c.a === id && c.b === s.sel));
        if (c) {
          s.inv = s.inv.filter((x) => x !== c.a && x !== c.b);
          s.inv.push(c.result); s.sel = null;
          sfx('combine'); this.say(c.say);
          this.save(); this.render();
          const nb = this.inv.querySelector(`[data-item="${c.result}"]`); if (nb) { nb.classList.add('pop'); }
          return;
        }
        this.say('이 둘은 합쳐지지 않아.'); sfx('nope');
        s.sel = id;
      }
      this.renderInv();
    }
    give(id, fromEl) {
      if (!this.s.inv.includes(id)) this.s.inv.push(id);
      sfx('pick');
      const it = this.room.items[id];
      this.renderInv();
      const slot = this.inv.querySelector(`[data-item="${id}"]`);
      if (fromEl && slot) {
        const a = fromEl.getBoundingClientRect(), b = slot.getBoundingClientRect(), sr = this.stage.getBoundingClientRect();
        const sc = sr.width / W;
        const fly = el('img', 'flying', this.stage);
        fly.src = this.src(it.img); fly.alt = '';
        const size = 110;
        const sx = (a.left + a.width / 2 - sr.left) / sc - size / 2, sy = (a.top + a.height / 2 - sr.top) / sc - size / 2;
        const ex = (b.left + b.width / 2 - sr.left) / sc - size / 2, ey = (b.top + b.height / 2 - sr.top) / sc - size / 2;
        fly.style.cssText = `left:${sx}px;top:${sy}px;width:${size}px;height:${size}px`;
        slot.style.visibility = 'hidden';
        requestAnimationFrame(() => requestAnimationFrame(() => { fly.style.transform = `translate(${ex - sx}px, ${ey - sy}px) scale(0.7)`; }));
        setTimeout(() => { fly.remove(); slot.style.visibility = ''; slot.classList.add('pop'); }, 720);
      }
      return it;
    }
    anim(id, cls, ms) {
      const n = this.nodes.get(id) || this.zoomNodes.get(id);
      if (!n) return;
      n.classList.remove(cls); void n.offsetWidth; n.classList.add(cls);
      setTimeout(() => n.classList.remove(cls), ms);
    }
    turn(d) {
      if (this.busy) return;
      const order = this.room.order;
      const i = order.indexOf(this.s.view);
      this.s.view = order[(i + d + order.length) % order.length];
      this.s.sel = null;
      sfx('step');
      this.save(); this.render();
    }
    openZoom(id) { this.s.zoom = id; this.render(); }
    closeZoom() { if (this.busy) return; this.s.zoom = null; sfx('step'); this.save(); this.render(); }

    say(text, ms) {
      clearTimeout(this.subT);
      this.sub.innerHTML = '';
      const p = el('p', '', this.sub);
      p.textContent = text;
      this.sub.classList.remove('show'); void this.sub.offsetWidth; this.sub.classList.add('show');
      this.subT = setTimeout(() => this.sub.classList.remove('show'), ms || Math.max(2800, text.length * 95));
    }

    inspect(id) {
      const it = this.room.items[id];
      const box = this.inspectEl;
      box.innerHTML = '';
      const card = el('div', 'inspect-card', box);
      const img = el('img', 'inspect-img', card); img.src = this.src(it.img); img.alt = it.name;
      const t = el('h2', '', card); t.textContent = it.name;
      const d = el('p', '', card); d.textContent = typeof it.desc === 'function' ? it.desc(this.s) : it.desc;
      const c = el('button', 'plain-btn', card); c.textContent = '내려놓기';
      c.onclick = () => this.closeInspect();
      box.onclick = (e) => { if (e.target === box) this.closeInspect(); };
      box.hidden = false;
      sfx('tap');
    }
    closeInspect() { this.inspectEl.hidden = true; this.s.sel = null; this.renderInv(); }

    openHint() {
      const h = this.room.hints(this.s);
      if (this.s.hint.key !== h.key) this.s.hint = { key: h.key, level: 0 };
      const box = this.hintEl;
      const draw = () => {
        box.innerHTML = '';
        const card = el('div', 'hint-card', box);
        const who = el('div', 'hint-who', card);
        const face = el('img', '', who); face.src = this.src(this.room.guide.img); face.alt = '';
        const nm = el('span', '', who); nm.textContent = this.room.guide.name;
        const lvl = this.s.hint.level;
        h.steps.forEach((txt, i) => {
          const p = el('p', 'hint-line' + (i <= lvl ? '' : ' locked'), card);
          const tag = el('span', 'hint-n', p); tag.textContent = ['첫째', '둘째', '셋째'][i] + ' 힌트';
          const tx = el('span', 'hint-t', p); tx.textContent = i <= lvl ? txt : '…';
        });
        const row = el('div', 'hint-row', card);
        if (lvl < h.steps.length - 1) {
          const more = el('button', 'plain-btn', row); more.textContent = lvl === h.steps.length - 2 ? '정답 알려줘' : '조금 더 알려줘';
          more.onclick = () => { this.s.hint.level++; this.save(); sfx('tap'); draw(); };
        }
        const close = el('button', 'plain-btn ghost', row); close.textContent = '혼자 해 볼게';
        close.onclick = () => { box.hidden = true; };
      };
      draw();
      box.onclick = (e) => { if (e.target === box) box.hidden = true; };
      box.hidden = false;
      sfx('tap');
    }

    win() {
      const e = this.room.ending;
      const box = this.endEl;
      box.innerHTML = '';
      const card = el('div', 'ending-card', box);
      const seal = el('img', 'ending-seal', card); seal.src = 'assets/ui/seal.svg'; seal.alt = '';
      const k = el('p', 'ending-kicker', card); k.textContent = this.room.chapter + ' 탈출';
      const t = el('h2', '', card); t.textContent = e.title;
      e.text.forEach((line) => { const p = el('p', '', card); p.textContent = line; });
      const n = el('p', 'ending-next', card); n.textContent = e.next;
      const row = el('div', 'hint-row', card);
      const b1 = el('button', 'plain-btn', row); b1.textContent = '책장 덮기';
      b1.onclick = () => this.opts.onExit && this.opts.onExit();
      const b2 = el('button', 'plain-btn ghost', row); b2.textContent = '처음부터 다시';
      b2.onclick = () => { store.del(this.key); this.opts.onRestart && this.opts.onRestart(); };
      store.set('btk.cleared.' + this.room.id, true);
      this.s.flags.__won = true; this.save();
      box.hidden = false;
      sfx('win');
    }

    /* ── 햇빛 속 먼지 ── */
    startDust() {
      const ctx = this.dust.getContext('2d');
      const motes = [...Array(70)].map(() => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + 0.6, vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.18 - 0.04, p: Math.random() * 6 }));
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tick = (t) => {
        ctx.clearRect(0, 0, W, H);
        if (this.isLit() && !reduce) {
          for (const m of motes) {
            m.x += m.vx + Math.sin(t / 2000 + m.p) * 0.1; m.y += m.vy;
            if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
            ctx.globalAlpha = 0.35 + Math.sin(t / 700 + m.p) * 0.25;
            ctx.fillStyle = '#fff4c8';
            ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
          }
        }
        this.dustRaf = requestAnimationFrame(tick);
      };
      this.dustRaf = requestAnimationFrame(tick);
    }
  }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  Engine.Game = Game;
  Engine.W = W; Engine.H = H;
})();
