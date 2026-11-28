/* 15장 「접히는 집」 (3편 마지막 · 어른 난이도) — 되찾을 것: 접힘
 * 종이로 접은 집이 자꾸 펼쳐지려 한다. 종이학 접이와 함께 '접어서 잇는' 세 가지를 풀어 앞면 세계로 돌아간다.
 *  1 접어 맞추기 포스터(MAD fold-in): 긴 포스터의 접는 선 다섯 개 중 ¼·¾ 두 선으로 접어 가운데 ½을 숨기면
 *    양 끝이 맞닿아 '새 ─ 별'이 이어진다. 가운데 크게 그려진 '찻주전자 ─ 배'는 미끼
 *  2 지도 접기 지름길: 지도 위 표식 여섯. 접는 선 여섯 개 중 새를 별 위에 정확히 포개는 선 = 두 점의 수직이등분선
 *    (접기 = 대칭). 미끼: 찻주전자↔배를 포개는 선, 가운데를 지나는 세로선, 두 점을 지나는 선… 틀리면 지도가 구겨져 15초
 *  3 앞뒤 종이: 앞면엔 열쇠 왼쪽 절반, 뒷면(뒤집어 본 모습)엔 오른쪽 절반이 좌우 뒤집혀 있다. 등잔이 꺼져 비춰 볼 수 없다.
 *    앞에서 비추면 뒷면 그림은 다시 뒤집혀 보이므로 → 온전한 열쇠. 서쪽 문 그림 판 여섯 중 고르기 (틀리면 15초 잠김)
 *  4 문이 열리면 모리·달래·휘·너울이 무대에 모이고, 서쪽 문으로 앞면 세계(할머니 부엌)로
 */
(function () {
  const F = (s) => s.flags;
  const JAM_MS = 15000;
  const left = (t) => Math.ceil(((t || 0) - Date.now()) / 1000);

  /* ── 포스터 (zoom/poster: 양피지 70~1532, 252~662) ── */
  const PX = 70, PY = 252, PW = 1462, PH = 410;
  const FOLDS = [1 / 8, 1 / 4, 1 / 2, 3 / 4, 7 / 8];
  const QA = PW / 4, QB = (PW * 3) / 4; // 365.5, 1096.5
  function posterArt(game) {
    // 포스터 위 그림 한 장 (양피지 기준 좌표)
    const art = document.createElement('div'); art.className = 'poster-art';
    art.style.cssText = `width:${PW}px;height:${PH}px`;
    const mark = (n, x, y, s) => { const im = document.createElement('img'); im.alt = ''; im.src = game.src(`props/mark_${n}.webp`); im.style.cssText = `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px`; art.appendChild(im); };
    mark('bird', 165, 140, 170);
    mark('star', QB + 205, 130, 160);
    mark('teapot', 520, 150, 170);
    mark('boat', 940, 150, 170);
    mark('moon', 735, 300, 110);
    const svg = `<svg viewBox="0 0 ${PW} ${PH}" width="${PW}" height="${PH}" aria-hidden="true">
      <path d="M215 205 Q 290 250 ${QA} 300" fill="none" stroke="#4a3020" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round"/>
      <path d="M${QB} 300 Q ${QB + 80} 250 ${QB + 160} 190" fill="none" stroke="#4a3020" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round"/>
      <path d="M610 165 L 850 165" fill="none" stroke="#4a3020" stroke-width="9" stroke-dasharray="4 18" stroke-linecap="round"/>
    </svg>`;
    art.insertAdjacentHTML('afterbegin', svg);
    return art;
  }
  function posterWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.poster-w');
    if (!box) { box = document.createElement('div'); box.className = 'poster-w'; container.appendChild(box); }
    box.innerHTML = '';
    f.picks = f.picks || [];
    if (f.folded) {
      const [a, b] = f.folded.map((k) => FOLDS[k] * PW);
      const wL = a, wR = PW - b, total = wL + wR;
      const view = document.createElement('div'); view.className = 'poster-folded';
      view.style.cssText = `left:${800 - total / 2}px;top:${PY}px;width:${total}px;height:${PH}px`;
      const part = (x0, w, at) => { const d = document.createElement('div'); d.className = 'poster-part'; d.style.cssText = `left:${at}px;width:${w}px;height:${PH}px;background:url(${game.src('zoom/poster.webp')}) ${-(PX + x0)}px ${-PY}px / 1600px 900px`; const art = posterArt(game); art.style.left = -x0 + 'px'; d.appendChild(art); view.appendChild(d); };
      part(0, wL, 0); part(b, wR, wL);
      const crease = document.createElement('i'); crease.className = 'poster-crease'; crease.style.left = wL - 2 + 'px'; view.appendChild(crease);
      box.appendChild(view);
      const un = document.createElement('button'); un.className = 'plain-btn poster-btn'; un.textContent = '펴기'; un.setAttribute('aria-label', '펴기');
      un.style.cssText = 'left:690px;top:676px;width:220px;height:62px';
      un.onclick = (e) => { e.stopPropagation(); f.folded = null; f.picks = []; api.sfx('tap'); game.save(); posterWidget(container, api, game); };
      box.appendChild(un);
      return;
    }
    const art = posterArt(game); art.style.left = PX + 'px'; art.style.top = PY + 'px'; box.appendChild(art);
    FOLDS.forEach((fr, k) => {
      const x = PX + fr * PW;
      const b = document.createElement('button'); b.className = 'poster-line' + (f.picks.includes(k) ? ' on' : '');
      b.style.cssText = `left:${x - 22}px;top:${PY - 40}px;width:44px;height:${PH + 80}px`;
      b.setAttribute('aria-label', `접는 선 ${k + 1}`);
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy) return;
        f.picks = f.picks.includes(k) ? f.picks.filter((v) => v !== k) : [...f.picks, k].slice(-2);
        api.sfx('tap'); game.save(); posterWidget(container, api, game);
      };
      box.appendChild(b);
    });
    const go = document.createElement('button'); go.className = 'plain-btn poster-btn'; go.textContent = '두 선으로 접기'; go.setAttribute('aria-label', '두 선으로 접기');
    go.style.cssText = 'left:650px;top:676px;width:300px;height:62px';
    go.onclick = (e) => {
      e.stopPropagation(); if (game.busy) return;
      if (f.picks.length < 2) { api.say('접는 선을 두 개 골라야 해.'); return; }
      f.folded = [...f.picks].sort((a, b) => a - b); api.sfx('creak');
      if (f.folded[0] === 1 && f.folded[1] === 3 && !f.foldin) { f.foldin = true; api.note('접은 포스터', '가운데를 접어 숨기니 양 끝의 새와 별이 점선으로 이어졌다.'); }
      api.say('가운데를 뒤로 접어 넘겼어.', 2600);
      game.save(); posterWidget(container, api, game);
    };
    box.appendChild(go);
  }

  /* ── 지도 (zoom/map: 종이 안쪽 220~1380, 130~740) ── */
  const MAPR = { x0: 200, y0: 110, x1: 1400, y1: 760 };
  const MARKS = { bird: [430, 290], star: [1010, 570], teapot: [440, 600], boat: [1180, 270], key: [1230, 640], moon: [740, 210] };
  const MNAME = { bird: '새', star: '별', teapot: '찻주전자', boat: '배', key: '태엽 열쇠', moon: '달' };
  const LINES = [[[720, 430], [-280, 580]], [[810, 435], [330, 740]], [[720, 430], [0, 1]], [[430, 290], [580, 280]], [[720, 380], [1, 0]], [[985, 425], [-430, 490]]];
  const RIGHT = 0;
  const reflect = ([px, py], [[x0, y0], [dx, dy]]) => { const n = Math.hypot(dx, dy); dx /= n; dy /= n; const d = (px - x0) * dx + (py - y0) * dy; const qx = x0 + d * dx, qy = y0 + d * dy; return [2 * qx - px, 2 * qy - py]; };
  const side = ([px, py], [[x0, y0], [dx, dy]]) => Math.sign((px - x0) * dy - (py - y0) * dx);
  function clip([[x0, y0], [dx, dy]]) { // 선을 지도 사각형 안으로 자른 두 끝점
    const ts = [];
    if (dx) ts.push((MAPR.x0 - x0) / dx, (MAPR.x1 - x0) / dx);
    if (dy) ts.push((MAPR.y0 - y0) / dy, (MAPR.y1 - y0) / dy);
    const pts = ts.map((t) => [x0 + t * dx, y0 + t * dy]).filter(([x, y]) => x >= MAPR.x0 - 0.5 && x <= MAPR.x1 + 0.5 && y >= MAPR.y0 - 0.5 && y <= MAPR.y1 + 0.5);
    pts.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    return [pts[0], pts[pts.length - 1]];
  }
  function mapWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.map-w');
    if (!box) { box = document.createElement('div'); box.className = 'map-w'; container.appendChild(box); }
    box.innerHTML = '';
    const fold = f.mapFolded ? RIGHT : f.mapTry;
    let svg = `<svg viewBox="0 0 1600 900" width="1600" height="900" aria-hidden="true">`;
    LINES.forEach((l, k) => { const [a, b] = clip(l); svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${fold === k ? '#8a2a1a' : '#5a4030'}" stroke-width="${fold === k ? 5 : 3}" stroke-dasharray="14 12" opacity="${fold === k ? 0.95 : 0.6}"/>`; });
    svg += '</svg>';
    box.insertAdjacentHTML('afterbegin', svg);
    Object.entries(MARKS).forEach(([n, [x, y]]) => {
      const im = document.createElement('img'); im.className = 'map-mark'; im.alt = ''; im.src = game.src(`props/mark_${n}.webp`);
      im.style.cssText = `left:${x - 55}px;top:${y - 55}px;width:110px;height:110px`; box.appendChild(im);
    });
    if (fold != null) { // 접힌 쪽(새가 있는 쪽) 표식이 포개지는 자리
      const l = LINES[fold], s0 = side(MARKS.bird, l);
      Object.entries(MARKS).forEach(([n, p]) => {
        if (side(p, l) !== s0) return;
        const [x, y] = reflect(p, l);
        const im = document.createElement('img'); im.className = 'map-ghost'; im.alt = ''; im.src = game.src(`props/mark_${n}.webp`);
        im.style.cssText = `left:${x - 55}px;top:${y - 55}px;width:110px;height:110px;transform:scaleX(-1)`; box.appendChild(im);
      });
    }
    // 접는 선 손잡이 (지도 가장자리)
    LINES.forEach((l, k) => {
      const ends = clip(l), a = k === 1 ? ends[1] : ends[0]; // 2번 선은 아래쪽 끝에 손잡이 (3번과 겹치지 않게)
      const b = document.createElement('button'); b.className = 'map-handle' + (fold === k ? ' on' : '');
      b.style.cssText = `left:${Math.min(1440, Math.max(150, a[0])) - 30}px;top:${Math.min(700, Math.max(70, a[1] - 60))}px;width:60px;height:60px`;
      b.textContent = String(k + 1); b.setAttribute('aria-label', `접는 선 ${k + 1}로 접기`);
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy || f.mapFolded) return;
        if (left(f.mapJam) > 0) { api.say(`구겨진 지도를 펴는 중이야… ${left(f.mapJam)}초만.`); return; }
        f.mapTry = k; api.sfx('creak'); game.save(); mapWidget(container, api, game);
        const [x, y] = reflect(MARKS.bird, l), [sx, sy] = MARKS.star;
        if (Math.hypot(x - sx, y - sy) < 25) {
          f.mapFolded = true; game.save(); api.sfx('shine');
          api.say('새가 별 위에 꼭 포개졌어! 두 곳이 맞닿은 틈으로 손을 넣으니… 건너편 선반의 종이 한 장이 잡혀.', 5600);
          if (!api.has('sheet')) api.give('sheet');
          return;
        }
        f.mapJam = Date.now() + JAM_MS; game.save();
        api.say('새는 엉뚱한 곳에 닿았어. 지도가 구겨져 버렸어. 한동안 펴야 해.', 4200);
      };
      box.appendChild(b);
    });
  }

  /* ── 앞뒤 종이 (zoom/sheet: 이젤 위 종이 510~1070, 120~640) ── */
  function sheetWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.sheet-w');
    if (!box) { box = document.createElement('div'); box.className = 'sheet-w'; container.appendChild(box); }
    box.innerHTML = '';
    if (!f.sheetOn) return;
    const pap = document.createElement('div'); pap.className = 'sheet-paper' + (f.sheetBack ? ' back' : '');
    pap.style.cssText = 'left:512px;top:122px;width:556px;height:516px';
    const im = document.createElement('img'); im.alt = ''; im.src = game.src(`props/${f.sheetBack ? 'sheet_back' : 'sheet_front'}.webp`);
    im.style.cssText = 'left:68px;top:48px;width:420px;height:420px'; pap.appendChild(im);
    box.appendChild(pap);
    const b = document.createElement('button'); b.className = 'plain-btn sheet-btn'; b.textContent = f.sheetBack ? '앞면 보기' : '뒤집어 뒷면 보기'; b.setAttribute('aria-label', '종이 뒤집기');
    b.style.cssText = 'left:120px;top:690px;width:300px;height:66px';
    b.onclick = (e) => { e.stopPropagation(); f.sheetBack = !f.sheetBack; api.sfx('creak'); game.save(); sheetWidget(container, api, game); };
    box.appendChild(b);
  }

  /* ── 서쪽 문 그림 판 (zoom/door) ── */
  const TILES = ['naive', 'mirror', 'whole', 'twoleft', 'flipv', 'tworight'];
  function doorWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.door-w');
    if (f.doorOpen) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.className = 'door-w'; container.appendChild(box); }
    box.innerHTML = '';
    TILES.forEach((t, i) => {
      const x = [560, 800, 1040][i % 3], y = i < 3 ? 215 : 715;
      const b = document.createElement('button'); b.className = 'piece door-tile';
      b.style.cssText = `left:${x - 70}px;top:${y - 70}px;width:140px;height:140px`;
      b.setAttribute('aria-label', `그림 판 ${i + 1}`);
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`props/keyc_${t}.webp`); b.appendChild(im);
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy) return;
        if (left(f.doorJam) > 0) { api.sfx('locked'); api.say(`판이 굳어 안 눌려. ${left(f.doorJam)}초쯤 뒤에.`); return; }
        if (t === 'whole') {
          f.doorOpen = true; game.busy = true; game.save(); api.sfx('unlock');
          api.say('찰칵. 온전한 열쇠 그림을 누르자 종이 문이 부채처럼 촤르르 펼쳐졌어. 그 너머로 아침 햇살과… 익숙한 부엌 냄새!', 6000);
          game.after(1600, () => { game.busy = false; api.flash('#fff6dc', 1000); game.s.zoom = null; game.save(); game.render(); });
          return;
        }
        f.doorJam = Date.now() + JAM_MS; game.save(); api.sfx('locked');
        api.say('철컥. 판이 굳어 버렸어.', 3000);
      };
      box.appendChild(b);
    });
  }

  function craneTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true; api.lock(5400);
      api.say('접이: “왔구나! 나 기억하지? 종이학 접이야. 큰일이야, 이 집이 자꾸 펼쳐지려고 해. 접힘이 사라졌거든.”', 5400, { who: 'crane' });
      api.after(5400, () => api.say('접이: “서쪽 문 너머가 앞면 세계야. 떨어진 곳들을 접어서 이어야 돌아갈 수 있어.”', 5600, { who: 'crane', note: '접이의 말' }));
      return;
    }
    if (f.doorOpen) { api.say('접이: “다들 모였어! 이제 마지막 장을 접어 닫자.”', 0, { who: 'crane' }); return; }
    api.say('접이: “접으면 멀리 있는 것끼리 맞닿아. 종이라면 다 그래.”', 0, { who: 'crane' });
  }

  Engine.registerRoom({
    id: 'foldhouse',
    chapter: '15장',
    title: '접히는 집',
    assets: 'assets/rooms/foldhouse/',
    sky: ['assets/rooms/foldhouse/bg/north.webp', 'assets/rooms/foldhouse/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 40,
    isLit: () => true,
    ambient: (s) => (F(s).doorOpen ? 'garden' : 'attic'),
    guide: { name: '종이학 접이', img: 'assets/rooms/desk/props/crane_idle.webp' },
    intro: '긴 통로 끝, 온통 종이로 접은 집이야. 벽이 바스락거리며 조금씩… 펴지고 있어.',

    repair(s, fix) {
      const f = s.flags;
      if (f.mapFolded && !s.inv.includes('sheet') && !f.sheetOn) fix.give('sheet');
    },

    items: {
      sheet: { name: '앞뒤 그림 종이', img: 'items/sheet.webp', desc: '얇은 종이 한 장. 앞면에도 뒷면에도 무언가 그려져 있어.' },
    },
    combos: [],

    views: {
      /* ───── 북쪽: 긴 포스터, 무대, 접이 ───── */
      north: {
        name: '긴 포스터',
        bg: 'bg/north.webp',
        objects: [
          { id: 'poster', x: 0, y: 0, w: 0, h: 0, img: '', hit: [270, 285, 1070, 260], label: '긴 포스터', click: (api) => api.zoom('poster') },
          { id: 'stage', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 620, 1000, 120], label: '낮은 무대', look: '종이로 접은 낮은 무대. 비어 있어.', show: (s) => !F(s).doorOpen },
          { id: 'mori', img: 'assets/rooms/bindery/props/mori_happy.webp', x: 290, y: 470, w: 300, h: 213, cls: 'bob', show: (s) => !!F(s).doorOpen },
          { id: 'dalle', img: 'assets/rooms/teahouse/props/dalle_happy.webp', x: 600, y: 495, w: 210, h: 192, cls: 'bob', show: (s) => !!F(s).doorOpen },
          { id: 'whi', img: 'assets/rooms/observatory/props/whi_happy.webp', x: 820, y: 497, w: 230, h: 192, cls: 'bob', show: (s) => !!F(s).doorOpen },
          { id: 'nuul', img: 'assets/rooms/shadow/props/nuul_happy.webp', x: 1060, y: 490, w: 170, h: 197, cls: 'bob', show: (s) => !!F(s).doorOpen },
          {
            id: 'crane', img: (s) => `assets/rooms/desk/props/${F(s).doorOpen ? 'crane_happy' : 'crane_idle'}.webp`, x: 40, y: 360, w: 220, h: 200, cls: 'bob',
            hit: [85, 370, 160, 190], label: '종이학 접이', click: craneTalk, wrong: '접이: “그건 문 쪽에 써 봐.”',
          },
        ],
      },

      /* ───── 동쪽: 지도 탁자, 높은 선반 ───── */
      east: {
        name: '지도 탁자',
        bg: 'bg/east.webp',
        objects: [
          { id: 'map', x: 0, y: 0, w: 0, h: 0, img: '', hit: [380, 495, 900, 200], label: '탁자 위 지도', click: (api) => api.zoom('map') },
          { id: 'shelf', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1250, 225, 260, 100], label: '높은 선반', click: (api) => api.say(api.flags.mapFolded ? '선반이 비었어.' : '방 건너편 높은 선반에 종이 한 장이 얹혀 있어. 너무 멀고 높아서 닿지 않아.') },
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 150, 260, 320], label: '종이 창', look: '창밖이 새벽빛으로 물들어.' },
        ],
      },

      /* ───── 남쪽: 책상, 꺼진 등잔, 이젤 ───── */
      south: {
        name: '책상',
        bg: 'bg/south.webp',
        objects: [
          {
            id: 'easel', x: 0, y: 0, w: 0, h: 0, img: '', hit: [860, 330, 200, 250], label: '작은 이젤',
            click: (api) => (api.flags.sheetOn ? api.zoom('sheet') : api.say('빈 이젤이야.')),
            use: { sheet: (api) => { api.take('sheet'); api.set('sheetOn'); api.sfx('pick'); api.zoom('sheet'); } },
          },
          { id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [505, 340, 150, 235], label: '놋쇠 등잔', click: (api) => api.say('기름이 바닥났어. 불이 켜지지 않아.') },
          { id: 'birds', x: 0, y: 0, w: 0, h: 0, img: '', hit: [520, 230, 570, 130], label: '종이새 줄', look: '줄에 매단 종이새들이 바스락 흔들려.' },
        ],
      },

      /* ───── 서쪽: 종이 문 ───── */
      west: {
        name: '종이 문',
        bg: (s) => (F(s).doorOpen ? 'bg/west_open.webp' : 'bg/west.webp'),
        objects: [
          { id: 'plant', x: 0, y: 0, w: 0, h: 0, img: '', hit: [250, 470, 160, 300], label: '종이 화분', look: '종이로 접은 잎이 파릇해.' },
          {
            id: 'door', x: 0, y: 0, w: 0, h: 0, img: '', hit: [860, 150, 460, 610], label: '종이 문',
            click: (api) => { if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; } api.zoom('door'); },
          },
        ],
      },
    },

    zooms: {
      poster: { bg: 'zoom/poster.webp', note: ['긴 포스터', '세로 점선 다섯 줄. 두 줄을 골라 접을 수 있다.'], widget: posterWidget },
      map: { bg: 'zoom/map.webp', note: ['탁자 위 지도', '표식 여섯 곳과 접는 선 여섯 줄.'], widget: mapWidget },
      sheet: { bg: 'zoom/sheet.webp', widget: sheetWidget },
      door: { bg: 'zoom/door.webp', note: ['종이 문의 그림 판', '열쇠 그림 여섯 장.'], widget: doorWidget },
    },

    hints(s) {
      const f = s.flags, h = (i) => s.inv.includes(i);
      if (f.doorOpen) return { key: 'go', steps: ['문이 열렸어요. 다들 모였어요.', '서쪽 종이 문이에요.', '서쪽 종이 문을 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['누가 기다리고 있어요.', '북쪽 횃대의 종이학이에요.', '북쪽 종이학 접이를 누르세요.'] };
      if (!f.foldin && !f.mapFolded) return { key: 'poster', steps: ['북쪽 긴 포스터의 양 끝 그림을 보세요. 점선이 가장자리에서 끊겨요.', '가운데를 뒤로 접어 숨기면 양 끝이 맞닿아요. 가운데 큰 그림은 눈속임이에요.', '포스터에서 2번(¼)과 4번(¾) 선을 골라 접으세요. 새와 별이 이어져요.'] };
      if (!f.mapFolded) return { key: 'map', steps: ['동쪽 지도에서 새와 별을 맞닿게 접어요. 접으면 한쪽이 거울처럼 넘어가요.', '새를 별 위에 정확히 포개는 접는 선은, 새와 별을 잇는 선의 한가운데를 직각으로 지나요.', '지도에서 1번 선으로 접으세요.'] };
      if (!f.sheetOn) return { key: 'sheet', steps: ['건너온 종이에 앞뒤로 그림이 있어요.', '남쪽 이젤에 세워 놓고 보면 편해요.', '앞뒤 그림 종이를 고른 채 남쪽 이젤을 누르세요.'] };
      if (h('sheet') || f.sheetOn) return { key: 'door', steps: ['종이를 빛에 비춰 보면 앞뒤 그림이 겹쳐 보이죠. 등잔이 꺼졌으니 머릿속으로 겹쳐요.', '앞에서 비춰 보면 뒷면 그림은 좌우가 다시 뒤집혀 보여요. 그래서 오른쪽 절반이 제자리로 가요.', '서쪽 문 그림 판에서 온전한 열쇠(고리가 왼쪽, 이가 오른쪽, 3번째)를 누르세요.'] };
      return { key: 'door', steps: ['서쪽 문을 보세요.', '', ''] };
    },

    ending: {
      title: '접어 닫은 마지막 장',
      text: ['모리가 실을, 달래가 물을, 휘가 별빛을, 너울이 그림자를 건넸어요. 접이가 마지막 장을 반으로 사르르 접었지요.', '종이 집이 고요해지고, 문 너머로 할머니 부엌의 아침 햇살이 쏟아졌어요. 식탁 위엔 그 종이 책이 놓여 있었어요.', '책을 펼치면 뒷면에서 누군가 작게 손을 흔들어요. 이제 앞면도 뒷면도, 둘 다 우리 이야기예요.'],
      next: '3편 「종이의 뒷면」 끝. 함께해 줘서 고마워요!',
      image: 'assets/rooms/foldhouse/bg/west_open.webp',
    },
  });
})();
