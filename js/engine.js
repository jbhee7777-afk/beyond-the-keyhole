/* PAPERDOOR(페이퍼도어) — 포인트 앤 클릭 엔진
 * 방(room) 데이터는 js/rooms/*.js 에서 Engine.registerRoom({...}) 으로 등록한다.
 * 무대는 1600x900 좌표계이고, 화면 크기에 맞춰 통째로 확대/축소된다.
 * file:// 로 열어도 돌아가도록 ES 모듈 대신 일반 스크립트로 작성했다.
 *
 * 진행 불가 방지 규칙
 *  - 한 행동의 "결과"(아이템 지급, 다음 단계 플래그)는 가능한 한 즉시 상태에 넣는다.
 *  - 시간차 연출이 꼭 필요하면 방의 repair(s, fix)가 불러올 때 중간 상태를 마무리해 준다.
 *  - api.after로 예약한 일은 화면을 떠나면(destroy) 모두 취소된다.
 */
(function () {
  'use strict';
  const W = 1600, H = 900;
  const SAVE_VERSION = 2;
  const Engine = (window.Engine = { rooms: {}, order: [], registerRoom(r) { this.rooms[r.id] = r; this.order.push(r.id); } });

  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경은 무시 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } },
  };
  Engine.store = store;
  // 설정: 글자 크기, 느린 자막, 모든 장 열기
  Engine.settings = Object.assign({ bigText: false, slowText: false, unlockAll: false }, store.get('btk.settings') || {});
  Engine.saveSettings = () => store.set('btk.settings', Engine.settings);
  // 한 번 본 조작 안내
  const tipsSeen = new Set(store.get('btk.tips') || []);
  Engine.resetTips = () => { tipsSeen.clear(); store.set('btk.tips', []); };
  const sfx = (n) => window.Sfx && window.Sfx.play(n);

  // 받침 유무로 조사 고르기: josa('실타래', '은', '는')
  const josa = (word, a, b) => { const c = word.charCodeAt(word.length - 1); if (c < 0xac00 || c > 0xd7a3) return word + b; return word + ((c - 0xac00) % 28 ? a : b); };
  Engine.josa = josa;
  const DIRS = { north: '북', east: '동', south: '남', west: '서' };

  class Game {
    constructor(app, room, opts = {}) {
      this.app = app; this.room = room; this.opts = opts;
      this.key = 'btk.save.' + room.id;
      this.timers = new Set();
      let saved = opts.fresh ? null : store.get(this.key);
      if (saved && saved.v !== SAVE_VERSION) saved = null; // 예전 형식 저장은 버리고 새로 시작
      this.s = saved || { v: SAVE_VERSION, view: room.start, flags: {}, inv: [], sel: null, zoom: null, hint: { key: '', level: 0, at: 0 }, notes: [] };
      this.s.sel = null;
      this.s.notes = this.s.notes || [];
      this.repair();
      this.nodes = new Map();
      this.zoomNodes = new Map();
      this.renderedView = null;
      this.lastAction = Date.now();
      this.build();
      this.render(true);
      if (!saved && room.intro) this.after(500, () => this.say(room.intro, 7000));
      this.after(saved ? 600 : 7800, () => this.tip('move', '화살표를 누르면 다른 벽을 볼 수 있어. 위쪽 나침반이 지금 보고 있는 쪽을 알려 줘.'));
      this.idleTimer = setInterval(() => { if (Date.now() - this.lastAction > 60000) { this.lastAction = Date.now(); this.tip('stuck', '막혔다면 왼쪽 위 돋보기로 둘러보거나, 달팽이 껍데기를 눌러 힌트를 받아 봐.'); } }, 5000);
    }

    /* ── 진행 불가 복구 ── */
    repair() {
      if (!this.room.repair) return;
      const s = this.s;
      const fix = {
        has: (id) => s.inv.includes(id),
        give: (id) => { if (!s.inv.includes(id)) s.inv.push(id); },
        take: (id) => { s.inv = s.inv.filter((x) => x !== id); },
        set: (k, v = true) => { s.flags[k] = v; },
      };
      this.room.repair(s, fix);
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
      st.classList.toggle('big-text', !!Engine.settings.bigText);
      if (this.room.dim) { st.style.setProperty('--night', this.room.dim.color); st.style.setProperty('--dim-op', this.room.dim.opacity); }
      this.skyA = el('img', 'layer sky', st); this.skyA.src = this.src(this.room.sky[0]); this.skyA.alt = '';
      this.skyB = el('img', 'layer sky sky-lit', st); this.skyB.src = this.src(this.room.sky[1]); this.skyB.alt = '';
      this.viewEl = el('div', 'layer view', st);
      this.beams = el('img', 'layer beams', st); this.beams.alt = '';
      this.dim = el('div', 'layer dim', st);
      this.dust = el('canvas', 'layer dust', st); this.dust.width = W; this.dust.height = H;
      this.zoomEl = el('div', 'layer zoom', st); this.zoomEl.hidden = true;
      this.zoomInner = el('div', 'zoom-inner', this.zoomEl);
      this.zoomDim = el('div', 'layer dim zoom-dim', this.zoomEl);
      this.fx = el('div', 'layer fx', st);
      this.grain = el('div', 'layer grain', st);
      this.vignette = el('div', 'layer vignette', st);

      // 화살표
      this.navL = el('button', 'nav nav-left', st); this.navL.setAttribute('aria-label', '왼쪽 벽으로');
      this.navR = el('button', 'nav nav-right', st); this.navR.setAttribute('aria-label', '오른쪽 벽으로');
      this.navB = el('button', 'nav nav-back', st); this.navB.setAttribute('aria-label', '뒤로');
      this.navL.onclick = () => this.turn(-1);
      this.navR.onclick = () => this.turn(1);
      this.navB.onclick = () => this.closeZoom();

      // 나침반: 지금 보고 있는 벽
      this.compass = el('div', 'compass', st);
      this.compass.setAttribute('aria-live', 'polite');

      // 가방과 손에 든 것
      this.inv = el('div', 'inventory', st);
      this.inv.setAttribute('aria-label', '가방');
      this.heldLabel = el('div', 'held-label', st); this.heldLabel.hidden = true;
      this.held = el('img', 'held', st); this.held.alt = ''; this.held.hidden = true;
      st.addEventListener('pointermove', (e) => this.moveHeld(e));

      // 상단 도구
      const tools = el('div', 'tools', st);
      const tool = (cls, title, fn) => { const b = el('button', 'tool ' + cls, tools); b.title = title; b.setAttribute('aria-label', title); b.onclick = (e) => { e.stopPropagation(); fn(); }; return b; };
      this.btnMenu = tool('tool-book', '책 덮기 (처음 화면)', () => this.opts.onExit && this.opts.onExit());
      this.btnHint = tool('tool-hint', '힌트', () => this.openHint());
      this.btnLens = tool('tool-lens', '돋보기: 살펴볼 곳 찾기', () => this.lens());
      this.btnNotes = tool('tool-notes', '단서 수첩', () => this.openNotes());
      this.btnSound = tool('tool-sound', '소리', () => { window.Sfx && window.Sfx.toggle(); this.syncSound(); });
      this.syncSound();
      this.chapter = el('div', 'chapter-label', st);
      this.chapter.textContent = this.room.chapter + ' · ' + this.room.title;

      // 자막 (누르면 닫힘)
      this.sub = el('div', 'subtitle', st);
      this.sub.setAttribute('role', 'status');
      this.sub.addEventListener('click', (e) => {
        // 자막을 누르면 닫히고, 그 아래 있던 물건도 그대로 눌린다 (자막이 보상 물건을 가려도 막히지 않게)
        e.stopPropagation(); this.sub.classList.remove('show');
        const under = document.elementFromPoint(e.clientX, e.clientY);
        if (under && under !== this.sub && !this.sub.contains(under)) under.click();
      });
      // 조작 안내 말풍선
      this.tipEl = el('div', 'tip', st); this.tipEl.hidden = true;
      this.tipEl.addEventListener('click', (e) => { e.stopPropagation(); this.tipEl.hidden = true; });

      // 살펴보기 / 힌트 / 수첩 / 엔딩 오버레이
      this.inspectEl = el('div', 'overlay inspect', st); this.inspectEl.hidden = true;
      this.hintEl = el('div', 'overlay hintbox', st); this.hintEl.hidden = true;
      this.notesEl = el('div', 'overlay notesbox', st); this.notesEl.hidden = true;
      this.endEl = el('div', 'overlay ending', st); this.endEl.hidden = true;

      // 빈 곳 클릭 = 선택 해제, 누른 자리에 잉크 자국
      this.viewEl.addEventListener('click', (e) => { if (e.target === this.viewEl && this.s.sel) { this.s.sel = null; this.renderInv(); } });
      st.addEventListener('pointerdown', (e) => this.ripple(e));
      st.addEventListener('contextmenu', (e) => { e.preventDefault(); if (this.s.sel) { this.s.sel = null; this.renderInv(); } });

      this.fit = () => {
        const r = this.app.getBoundingClientRect();
        const sc = Math.min(r.width / W, r.height / H);
        this.scale = sc;
        st.style.transform = `translate(-50%, -50%) scale(${sc})`;
        // 작은 화면에서는 단추와 가방을 크게
        st.classList.toggle('small-screen', sc < 0.62);
      };
      window.addEventListener('resize', this.fit);
      this.fit();
      this.startDust();
      this.keyHandler = (e) => {
        if (e.key === 'ArrowLeft' && !this.s.zoom) this.turn(-1);
        else if (e.key === 'ArrowRight' && !this.s.zoom) this.turn(1);
        else if (e.key === 'Escape') this.closeTop();
      };
      window.addEventListener('keydown', this.keyHandler);
    }
    closeTop() {
      if (!this.inspectEl.hidden) this.closeInspect();
      else if (!this.hintEl.hidden) this.hintEl.hidden = true;
      else if (!this.notesEl.hidden) this.notesEl.hidden = true;
      else if (this.s.zoom) this.closeZoom();
      else if (this.s.sel) { this.s.sel = null; this.renderInv(); }
    }
    destroy() {
      this.dead = true;
      window.removeEventListener('resize', this.fit);
      window.removeEventListener('keydown', this.keyHandler);
      cancelAnimationFrame(this.dustRaf);
      clearTimeout(this.subT); clearTimeout(this.tipT);
      clearInterval(this.idleTimer); clearInterval(this.hintTick);
      this.timers.forEach((t) => clearTimeout(t)); this.timers.clear();
      window.Sfx && window.Sfx.ambient && window.Sfx.ambient(null);
    }
    syncSound() { this.btnSound.classList.toggle('off', !!(window.Sfx && window.Sfx.muted)); }

    /* ── 핸들러에 건네는 도구 ── */
    get api() {
      const g = this;
      return {
        s: g.s, flags: g.s.flags, game: g,
        has: (id) => g.s.inv.includes(id),
        set: (k, v = true) => { g.s.flags[k] = v; },
        // opts: { note: '수첩 제목' } 이면 단서 수첩에도 적는다. { who: '오브젝트 id' } 이면 그 캐릭터가 말하는 움직임
        say: (t, ms, opts) => g.say(t, ms, opts),
        note: (title, text) => g.note(title, text),
        give: (id, fromEl) => g.give(id, fromEl),
        take: (id) => { g.s.inv = g.s.inv.filter((x) => x !== id); if (g.s.sel === id) g.s.sel = null; },
        swap: (a, b) => { const i = g.s.inv.indexOf(a); if (i >= 0) g.s.inv[i] = b; else g.s.inv.push(b); if (g.s.sel === a) g.s.sel = null; },
        zoom: (id) => g.openZoom(id),
        close: () => g.closeZoom(),
        sfx,
        after: (ms, fn) => g.after(ms, fn),
        render: () => g.render(),
        save: () => g.save(),
        anim: (id, cls, ms = 1200) => g.anim(id, cls, ms),
        burst: (kind, x, y, n) => g.burst(kind, x, y, n),
        flash: (color, ms) => g.flash(color, ms),
        lock: (ms) => { g.busy = true; g.after(ms, () => { g.busy = false; }); },
        win: () => g.win(),
        hint: () => g.openHint(),
        go: (view) => { g.s.view = view; g.s.zoom = null; g.render(); },
      };
    }
    after(ms, fn) {
      const t = setTimeout(() => { this.timers.delete(t); if (this.dead) return; fn(); this.save(); this.render(); }, ms);
      this.timers.add(t);
    }
    save() { if (!this.dead) store.set(this.key, this.s); }

    /* ── 렌더링 ── */
    isLit() { return this.room.isLit ? this.room.isLit(this.s) : true; }
    render(first) {
      if (this.dead) return;
      const s = this.s, room = this.room;
      const lit = this.isLit();
      this.stage.classList.toggle('is-lit', lit);
      this.stage.classList.toggle('is-dark', !lit);
      // 방 전체가 거꾸로 (4장): 방 레이어만 180도 돌린다. 확대 화면과 UI는 그대로
      this.stage.classList.toggle('upside', !!(room.upside && room.upside(s)));
      if (room.dim) {
        const d = lit ? room.dimLit : room.dim;
        this.dim.style.background = d ? d.color : room.dim.color;
        this.dim.style.opacity = d ? d.opacity : 0;
        // room.dimFade: 어둠이 바뀌는 시간(초). 스위치처럼 바로 바뀌어야 하는 방은 짧게
        if (room.dimFade != null) this.dim.style.transitionDuration = room.dimFade + 's';
      }
      this.skyB.style.opacity = lit ? 1 : 0;
      const beamSrc = room.beams && room.beams[s.view] ? this.src(room.beams[s.view]) : '';
      if (this.beams.dataset.src !== beamSrc) { this.beams.dataset.src = beamSrc; this.beams.src = beamSrc || 'data:,'; }
      if (window.Sfx && window.Sfx.ambient) window.Sfx.ambient(room.ambient ? room.ambient(s) : null);

      if (this.renderedView !== s.view) {
        this.viewEl.querySelectorAll('.hit').forEach((h) => h.remove());
        const old = this.viewEl.querySelectorAll('.obj');
        if (!first) { old.forEach((n) => { n.classList.add('leaving'); setTimeout(() => n.remove(), 320); }); } else old.forEach((n) => n.remove());
        this.nodes = new Map();
        this.renderedView = s.view;
        this.viewEl.classList.remove('enter'); void this.viewEl.offsetWidth; this.viewEl.classList.add('enter');
      }
      const v = room.views[s.view];
      // room.frame: 방마다 다른 앞쪽 틀(인형의 집 단면, 서까래, 잠수 돔 창…). 누르는 곳은 가리지 않는다.
      const frame = room.frame ? [{ id: '__frame', img: room.frame, x: 0, y: 0, w: W, h: H, cls: 'fg frame' }] : [];
      this.renderObjects(this.viewEl, this.nodes, [{ id: '__bg', img: v.bg, x: 0, y: 0, w: W, h: H, bg: true }, ...v.objects, ...frame]);

      // 확대 화면
      if (s.zoom) {
        const z = room.zooms[s.zoom];
        if (this.zoomEl.hidden || this.zoomEl.dataset.id !== s.zoom) {
          this.zoomInner.innerHTML = ''; this.zoomNodes = new Map();
          this.zoomEl.dataset.id = s.zoom; this.zoomEl.hidden = false;
          this.zoomEl.classList.remove('enter'); void this.zoomEl.offsetWidth; this.zoomEl.classList.add('enter');
          if (z.note) { const n = typeof z.note === 'function' ? z.note(s) : z.note; if (n) this.note(n[0], n[1]); }
          this.tip('zoom', '자세히 보는 중이야. 아래 화살표를 누르면 방으로 돌아가.');
        }
        const bg = typeof z.bg === 'function' ? z.bg(s) : z.bg;
        this.renderObjects(this.zoomInner, this.zoomNodes, [{ id: '__bg', img: bg, x: 0, y: 0, w: W, h: H, bg: true }, ...(z.objects || [])]);
        if (z.text) {
          let t = this.zoomInner.querySelector('.zoom-text');
          if (!t) t = el('div', 'zoom-text' + (z.textClass ? ' ' + z.textClass : ''), this.zoomInner);
          t.innerHTML = typeof z.text === 'function' ? z.text(s) : z.text;
        }
        if (z.widget) z.widget(this.zoomInner, this.api, this);
        this.zoomDim.style.opacity = lit ? (z.dimLit ?? 0) : (z.dim ?? 0.38);
      } else if (!this.zoomEl.hidden) {
        this.zoomEl.hidden = true; this.zoomEl.dataset.id = '';
        if (this.pendingTip) { const [k, x] = this.pendingTip; this.pendingTip = null; this.tip(k, x); }
      }
      this.navL.hidden = this.navR.hidden = !!s.zoom;
      this.navB.hidden = !s.zoom;
      this.stage.classList.toggle('zooming', !!s.zoom);
      this.renderCompass();
      this.renderInv();
    }

    renderCompass() {
      const c = this.compass, s = this.s;
      c.innerHTML = '';
      const ring = el('div', 'compass-dirs', c);
      this.room.order.forEach((d) => { const sp = el('span', d === s.view ? 'on' : '', ring); sp.textContent = DIRS[d]; });
      const name = el('div', 'compass-name', c);
      const v = this.room.views[s.view];
      name.textContent = s.zoom ? '자세히 보는 중' : (DIRS[s.view] + '쪽' + (v.name ? ' · ' + v.name : ''));
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
          n.dataset.id = o.id;
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
            hit.setAttribute('aria-label', o.label || labelFrom(o) || o.id); hit.dataset.id = o.id;
            hit.tabIndex = 0;
            hit.addEventListener('click', (e) => { e.stopPropagation(); this.onObj(o, n); });
            hit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onObj(o, n); } });
          } else n.style.pointerEvents = 'none';
          map.set(o.id, n);
        }
        if (src && n.dataset.src !== src) {
          const prev = n.querySelector('img:not(.out):not(.blink-lid)');
          const img = el('img', '', n);
          img.alt = ''; img.draggable = false; img.src = src;
          if (prev && n.dataset.src) {
            img.classList.add('in');
            prev.classList.add('out');
            setTimeout(() => prev.remove(), 600);
          }
          n.dataset.src = src;
        }
        // 눈 깜빡임: blink 그림(감은 눈꺼풀)을 몇 초마다 잠깐 겹쳐 보인다
        const lidName = typeof o.blink === 'function' ? o.blink(s) : o.blink;
        if (lidName) {
          if (!n._lid) { n._lid = el('img', 'blink-lid', n); n._lid.alt = ''; n._lid.draggable = false; n._lid.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's'; n._lid.style.animationDuration = (3.6 + Math.random() * 1.8).toFixed(2) + 's'; }
          const ls = this.src(lidName);
          if (n._lid.dataset.src !== ls) { n._lid.src = ls; n._lid.dataset.src = ls; }
          if (n.lastElementChild !== n._lid) n.appendChild(n._lid);
        } else if (n._lid) { n._lid.remove(); n._lid = null; }
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
      const n = Math.max(6, s.inv.length);
      // 가방이 화면 밖으로 넘치지 않게 칸 크기를 줄인다
      const room = 900 - 130;
      const size = Math.min(100, Math.floor(room / n) - 8);
      inv.style.setProperty('--slot', size + 'px');
      for (let i = 0; i < n; i++) {
        const id = s.inv[i];
        const b = el('button', 'slot' + (id && s.sel === id ? ' sel' : '') + (id ? '' : ' empty'), inv);
        if (id) {
          const it = this.room.items[id];
          const img = el('img', '', b); img.src = this.src(it.img); img.alt = ''; img.draggable = false;
          b.title = it.name;
          b.setAttribute('aria-label', it.name + (s.sel === id ? ' (손에 듦)' : ''));
          b.onclick = (e) => { e.stopPropagation(); this.onSlot(id); };
          b.dataset.item = id;
        } else b.disabled = true;
      }
      this.stage.classList.toggle('holding', !!s.sel);
      // 손에 든 것 표시
      if (s.sel && this.room.items[s.sel]) {
        const it = this.room.items[s.sel];
        this.heldLabel.textContent = '손에 든 것: ' + it.name;
        this.heldLabel.hidden = false;
        this.held.src = this.src(it.img); this.held.hidden = false;
        if (this.heldPos) { this.held.style.left = this.heldPos[0] + 'px'; this.held.style.top = this.heldPos[1] + 'px'; }
      } else { this.heldLabel.hidden = true; this.held.hidden = true; }
    }
    toStage(e) {
      const r = this.stage.getBoundingClientRect();
      return [(e.clientX - r.left) / (r.width / W), (e.clientY - r.top) / (r.height / H)];
    }
    moveHeld(e) {
      const [x, y] = this.toStage(e);
      this.heldPos = [x + 18, y + 14];
      if (!this.held.hidden) { this.held.style.left = this.heldPos[0] + 'px'; this.held.style.top = this.heldPos[1] + 'px'; }
    }
    ripple(e) {
      if (e.target.closest && e.target.closest('.tools, .overlay, .inventory, .nav')) return;
      const [x, y] = this.toStage(e);
      this.heldPos = [x + 18, y + 14];
      const r = el('div', 'ripple', this.fx);
      r.style.left = x + 'px'; r.style.top = y + 'px';
      setTimeout(() => r.remove(), 600);
    }

    /* ── 상호작용 ── */
    onObj(o, n) {
      if (this.busy) return;
      this.lastAction = Date.now();
      const s = this.s, api = this.api;
      if (s.sel) {
        const f = o.use && o.use[s.sel];
        if (f) { s.sel = null; f(api, n); }
        else {
          const nope = typeof o.wrong === 'function' ? o.wrong(s) : o.wrong;
          const name = this.room.items[s.sel] ? this.room.items[s.sel].name : '그것';
          this.say(nope || pickOne([`${josa(name, '은', '는')} 여기엔 안 맞아.`, `여기에 ${josa(name, '을', '를')} 써도 아무 일도 안 일어나.`, `${josa(name, '은', '는')} 다른 곳에 쓰는 게 좋겠어.`]));
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
      this.lastAction = Date.now();
      if (!s.sel) {
        s.sel = id; sfx('tap');
        this.tip('select', '손에 들었어! 방 안 물건을 누르면 써 볼 수 있어. 같은 아이템을 한 번 더 누르면 자세히 보고, 다른 아이템을 누르면 둘을 합쳐 봐.');
      } else if (s.sel === id) { this.inspect(id); }
      else {
        const c = this.room.combos.find((c) => (c.a === s.sel && c.b === id) || (c.a === id && c.b === s.sel));
        if (c && !c.result) { this.say(c.say); sfx('nope'); s.sel = null; this.renderInv(); return; }
        if (c) {
          s.inv = s.inv.filter((x) => x !== c.a && x !== c.b);
          s.inv.push(c.result); s.sel = null;
          sfx('combine'); this.say(c.say);
          if (c.after) c.after(this.api);
          this.save(); this.render();
          const nb = this.inv.querySelector(`[data-item="${c.result}"]`); if (nb) { nb.classList.add('pop'); }
          return;
        }
        const a = this.room.items[s.sel].name, b = this.room.items[id].name;
        this.say(`${josa(a, '과', '와')} ${josa(b, '은', '는')} 합쳐지지 않아.`); sfx('nope');
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
      if (fromEl && slot && fromEl.isConnected) {
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
      this.tip('firstItem', '가방에 들어갔어! 오른쪽 꼬리표를 눌러 손에 들어 봐.');
      if (this.s.inv.length >= 2) this.tip('combine', '아이템 두 개를 합칠 수도 있어. 하나를 손에 든 채 다른 하나를 눌러 봐.');
      return it;
    }
    anim(id, cls, ms) {
      const n = this.nodes.get(id) || this.zoomNodes.get(id);
      if (!n) return;
      n.classList.remove(cls); void n.offsetWidth; n.classList.add(cls);
      setTimeout(() => n.classList.remove(cls), ms);
    }
    // 반짝이·색종이·거품 같은 짧은 효과 (무대 좌표)
    burst(kind, x, y, n = 24) {
      const colors = { confetti: ['#d98c95', '#f4d98b', '#9fcfb9', '#8fb3d9', '#f6ecd8'], spark: ['#fff6c8', '#ffe38a', '#ffffff'], bubble: ['#dff4f4'], dust: ['#fff4c8', '#e8dcff'] }[kind] || ['#fff'];
      for (let i = 0; i < n; i++) {
        const p = el('div', 'particle p-' + kind, this.fx);
        const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 260;
        const dx = kind === 'bubble' ? (Math.random() - 0.5) * 120 : Math.cos(a) * d;
        const dy = kind === 'bubble' ? -300 - Math.random() * 400 : Math.sin(a) * d + (kind === 'confetti' ? 200 : 0);
        p.style.cssText = `left:${x}px;top:${y}px;background:${pickOne(colors)};--dx:${dx}px;--dy:${dy}px;--r:${Math.random() * 720 - 360}deg;animation-delay:${Math.random() * 0.25}s`;
        setTimeout(() => p.remove(), 2600);
      }
    }
    flash(color = '#fff8dc', ms = 900) {
      const f = el('div', 'flash', this.fx);
      f.style.background = color; f.style.animationDuration = ms + 'ms';
      setTimeout(() => f.remove(), ms + 50);
    }
    turn(d) {
      if (this.busy) return;
      this.lastAction = Date.now();
      const order = this.room.order;
      const i = order.indexOf(this.s.view);
      this.s.view = order[(i + d + order.length) % order.length];
      this.s.sel = null;
      sfx('step');
      this.save(); this.render();
    }
    openZoom(id) { this.s.zoom = id; this.render(); }
    closeZoom() { if (this.busy) return; this.s.zoom = null; sfx('step'); this.save(); this.render(); }

    say(text, ms, opts = {}) {
      clearTimeout(this.subT);
      this.sub.innerHTML = '';
      const p = el('p', '', this.sub);
      p.textContent = text;
      this.sub.classList.remove('show'); void this.sub.offsetWidth; this.sub.classList.add('show');
      const slow = Engine.settings.slowText ? 1.7 : 1;
      const dur = Math.max(ms || 0, 3800 + text.length * 120) * slow;
      this.subT = setTimeout(() => this.sub.classList.remove('show'), dur);
      if (opts.note) this.note(opts.note, text);
      if (opts.who) this.anim(opts.who, 'talk', 1600);
    }
    // 단서 수첩: 같은 제목은 한 번만
    note(title, text) {
      if (this.s.notes.some((n) => n.t === title)) return;
      this.s.notes.push({ t: title, x: text });
      this.btnNotes.classList.remove('new'); void this.btnNotes.offsetWidth; this.btnNotes.classList.add('new');
      this.save();
    }
    tip(key, text) {
      if (tipsSeen.has(key) || this.dead) return;
      if (key === 'move' && this.s.zoom) { this.pendingTip = [key, text]; return; }
      tipsSeen.add(key); store.set('btk.tips', [...tipsSeen]);
      clearTimeout(this.tipT);
      this.tipEl.innerHTML = '';
      const p = el('p', '', this.tipEl); p.textContent = text;
      const s2 = el('span', 'tip-close', this.tipEl); s2.textContent = '알겠어';
      this.tipEl.hidden = false;
      this.tipT = setTimeout(() => { this.tipEl.hidden = true; }, 11000 * (Engine.settings.slowText ? 1.5 : 1));
    }
    // 돋보기: 지금 화면에서 누를 수 있는 곳을 잠깐 반짝인다 (다시 쓰려면 잠깐 기다림)
    lens() {
      if (this.lensCool) { this.say('돋보기가 쉬는 중이야. 조금 있다가 다시 눌러 봐.'); return; }
      this.lensCool = true; this.btnLens.classList.add('cool');
      setTimeout(() => { this.lensCool = false; this.btnLens.classList.remove('cool'); }, 8000);
      const layer = this.s.zoom ? this.zoomInner : this.viewEl;
      const sr = this.stage.getBoundingClientRect(), sc = sr.width / W;
      let count = 0;
      layer.querySelectorAll('.clickable, .dial, .piece, .pin-cell, .knob, .mailbox, .turn-btn').forEach((h) => {
        const r = h.getBoundingClientRect();
        if (r.width < 2) return;
        const x = (r.left + r.width / 2 - sr.left) / sc, y = (r.top + r.height / 2 - sr.top) / sc;
        if (x < 0 || x > W || y < 0 || y > H) return;
        const g = el('div', 'lens-spark', this.fx);
        g.style.left = x + 'px'; g.style.top = y + 'px';
        g.style.animationDelay = (count++ * 0.06) + 's';
        setTimeout(() => g.remove(), 2200);
      });
      sfx('shine');
    }

    inspect(id) {
      const it = this.room.items[id];
      const box = this.inspectEl;
      box.innerHTML = '';
      const card = el('div', 'inspect-card', box);
      const img = el('img', 'inspect-img', card); img.src = this.src(it.img); img.alt = it.name;
      const t = el('h2', '', card); t.textContent = it.name;
      const desc = typeof it.desc === 'function' ? it.desc(this.s) : it.desc;
      const d = el('p', '', card); d.textContent = desc;
      if (it.clue) this.note(it.name, desc);
      const c = el('button', 'plain-btn', card); c.textContent = '내려놓기';
      c.onclick = () => this.closeInspect();
      box.onclick = (e) => { if (e.target === box) this.closeInspect(); };
      box.hidden = false;
      sfx('tap');
    }
    closeInspect() { this.inspectEl.hidden = true; this.s.sel = null; this.renderInv(); }

    openNotes() {
      const box = this.notesEl;
      box.innerHTML = '';
      const card = el('div', 'notes-card', box);
      const h = el('h2', '', card); h.textContent = '단서 수첩';
      if (!this.s.notes.length) { const p = el('p', 'notes-empty', card); p.textContent = '아직 적은 단서가 없어. 쪽지를 읽거나 누가 중요한 말을 하면 여기에 적혀.'; }
      const list = el('ol', 'notes-list', card);
      this.s.notes.forEach((n) => { const li = el('li', '', list); const b = el('b', '', li); b.textContent = n.t; const sp = el('span', '', li); sp.textContent = n.x; });
      const row = el('div', 'hint-row', card);
      const c = el('button', 'plain-btn', row); c.textContent = '수첩 덮기';
      c.onclick = () => { box.hidden = true; };
      box.onclick = (e) => { if (e.target === box) box.hidden = true; };
      box.hidden = false;
      this.btnNotes.classList.remove('new');
      sfx('step');
    }

    openHint() {
      const h = this.room.hints(this.s);
      if (this.s.hint.key !== h.key) this.s.hint = { key: h.key, level: 0, at: Date.now() };
      const box = this.hintEl;
      const WAIT = 12000; // 다음 힌트까지 잠깐 생각할 시간
      clearInterval(this.hintTick);
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
          const more = el('button', 'plain-btn', row);
          const isLast = lvl === h.steps.length - 2;
          const update = () => {
            const left = Math.ceil((WAIT - (Date.now() - (this.s.hint.at || 0))) / 1000);
            if (left > 0) { more.disabled = true; more.textContent = `조금만 더 생각해 봐 (${left})`; }
            else { more.disabled = false; more.textContent = this.confirmLast ? '정말 정답을 볼래?' : (isLast ? '정답 알려줘' : '조금 더 알려줘'); }
          };
          update();
          this.hintTick = setInterval(update, 500);
          more.onclick = () => {
            if (more.disabled) return;
            if (isLast && !this.confirmLast) { this.confirmLast = true; update(); return; }
            this.confirmLast = false;
            this.s.hint.level++; this.s.hint.at = Date.now(); this.save(); sfx('tap'); clearInterval(this.hintTick); draw();
          };
        }
        const close = el('button', 'plain-btn ghost', row); close.textContent = '혼자 해 볼게';
        close.onclick = () => { box.hidden = true; clearInterval(this.hintTick); this.confirmLast = false; };
      };
      draw();
      box.onclick = (e) => { if (e.target === box) { box.hidden = true; clearInterval(this.hintTick); } };
      box.hidden = false;
      sfx('tap');
    }

    win() {
      const e = this.room.ending;
      const box = this.endEl;
      box.innerHTML = '';
      if (e.image) { const im = el('img', 'ending-art', box); im.src = e.image; im.alt = ''; }
      const card = el('div', 'ending-card' + (e.image ? ' with-art' : ''), box);
      const seal = el('img', 'ending-seal', card); seal.src = 'assets/ui/seal.svg'; seal.alt = '';
      const k = el('p', 'ending-kicker', card); k.textContent = this.room.chapter + ' 탈출 · 이야기 열쇠를 얻었어요';
      const t = el('h2', '', card); t.textContent = e.title;
      e.text.forEach((line) => { const p = el('p', '', card); p.textContent = line; });
      const n = el('p', 'ending-next', card); n.textContent = e.next;
      const row = el('div', 'hint-row', card);
      if (this.opts.onNext) { const bn = el('button', 'plain-btn', row); bn.textContent = '다음 장으로'; bn.onclick = () => this.opts.onNext(); }
      const b1 = el('button', 'plain-btn' + (this.opts.onNext ? ' ghost' : ''), row); b1.textContent = '책장 덮기';
      b1.onclick = () => this.opts.onExit && this.opts.onExit();
      const b2 = el('button', 'plain-btn ghost', row); b2.textContent = '처음부터 다시';
      b2.onclick = () => { store.del(this.key); this.opts.onRestart && this.opts.onRestart(); };
      store.set('btk.cleared.' + this.room.id, true);
      this.s.flags.__won = true; this.save();
      box.hidden = false;
      sfx('win');
      this.burst('confetti', 800, 300, 60);
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
  // 이름표가 없을 때: 살펴보기 문장의 첫 마디로 이름을 만든다 (화면 읽기 프로그램용)
  function labelFrom(o) {
    if (typeof o.look === 'string') return o.look.split(/[.!?…,]/)[0].slice(0, 24);
    if (o.zoom) return '자세히 보기';
    return '살펴볼 곳';
  }
  Engine.Game = Game;
  Engine.W = W; Engine.H = H; Engine.SAVE_VERSION = SAVE_VERSION;
})();
