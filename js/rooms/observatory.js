/* 13장 「태엽 천문대」 (3편 셋째 장 · 어른 난이도) — 되찾을 것: 빛(별)
 * 부엉이 천문 박사 휘의 천문대. 별이 하나씩 꺼지고 있다.
 *  1 달의 모양: 창밖 달은 오른쪽이 빛나는 반달 → 달력 서랍 8칸 중 같은 모양 → 태엽 열쇠 (왼쪽 반달은 미끼)
 *     (틀린 서랍을 열면 달력 서랍이 20초 잠긴다 — 아무거나 열어 보는 걸 막음)
 *  2 톱니 비율: 손잡이 1바퀴에 안쪽 1칸, 가운데 1/2칸, 바깥 1/3칸. 감을 바퀴 수(1~60)를 계산해 정하고 태엽을 푼다.
 *     틀리면 처음 자리로 돌아감. 시작 자리 0·6·8칸 → 12바퀴만 셋 다 맨 위(창 쪽) → 받침 서랍의 큰 렌즈
 *  3 작은 렌즈: 동쪽 책상 돋보기
 *  4 볼록렌즈 초점: 등잔 아래 종이 위에서 렌즈 높이(1~12칸)를 바꿔 빛이 한 점으로 모이는 높이 (큰 9칸, 작은 3칸)
 *  5 망원경: 두 렌즈를 끼우고 통 길이(1~24칸)를 초점 거리의 합(12칸)으로 정해 들여다보기. 틀리면 똑같이 뿌옇다 → 별자리
 *  6 서쪽 남색 문: 별 단추 12개 중 별자리 자리 7개 → 문이 열림
 * 좌표(hit)는 그림을 받은 뒤 맞춘다 (ORDER-13.json).
 */
(function () {
  const F = (s) => s.flags;
  const MOONS = ['new', 'wax1', 'firstq', 'wax3', 'full', 'wane3', 'lastq', 'wane1'];
  const MNAME = { new: '그믐(깜깜한 달)', wax1: '오른쪽이 가늘게 빛나는 초승달', firstq: '오른쪽이 빛나는 반달', wax3: '오른쪽이 불룩한 달', full: '보름달', wane3: '거의 둥근 달', lastq: '왼쪽이 빛나는 반달', wane1: '왼쪽이 가늘게 빛나는 그믐달' };
  // 행성 고리는 비스듬히 본 타원 (zoom/orrery_top 그림의 고리 반지름: 가로 rx, 세로 ry, 중심 800,445)
  const ORB = [{ c: 'red', rx: 200, ry: 155, speed: 1, start: 0 }, { c: 'blue', rx: 280, ry: 225, speed: 1 / 2, start: 6 }, { c: 'green', rx: 362, ry: 290, speed: 1 / 3, start: 8 }];
  const FOCAL = { big: 9, small: 3 }; // 등잔 아래에서 빛이 한 점으로 모이는 높이 (자 눈금 칸)
  const TUBE = FOCAL.big + FOCAL.small; // 두 렌즈 거리 = 초점 거리의 합 (12칸)
  const LENS_MAX = 12, TUBE_MAX = 24, TURN_MAX = 60;
  const JAM_MS = 20000; // 달력 서랍을 잘못 열면 잠기는 시간
  // 별 단추 12개 (문 확대 화면 좌표)와 별자리가 쓰는 7개
  const STUDS = [[420, 210], [640, 170], [880, 230], [1080, 180], [360, 430], [600, 400], [850, 460], [1050, 420], [450, 650], [700, 610], [960, 680], [1100, 640]]; // 오른쪽 문손잡이(1120~) 피함
  const CONST = [1, 2, 5, 6, 7, 9, 10];
  const mod = (a, m) => ((a % m) + m) % m;
  const posAt = (t) => ORB.map((o) => mod(o.start + t * o.speed, 12));
  const isTop = (v) => Math.abs(v) < 1e-6 || Math.abs(v - 12) < 1e-6;

  // 숫자 칸 고르기 버튼 한 줄 (−10 −1 [값] +1 +10)
  function stepper(box, game, { x, y, label, value, min, max, big, onChange }) {
    const row = document.createElement('div'); row.className = 'stepper'; row.style.cssText = `left:${x}px;top:${y}px`;
    const cap = document.createElement('div'); cap.className = 'stepper-cap'; cap.textContent = label; row.appendChild(cap);
    const mk = (t, d) => {
      const b = document.createElement('button'); b.className = 'plain-btn stepper-btn'; b.textContent = t; b.setAttribute('aria-label', `${label} ${t}`);
      b.onclick = (e) => { e.stopPropagation(); if (game.busy) return; onChange(Math.min(max, Math.max(min, value + d))); };
      row.appendChild(b);
    };
    if (big) mk('−' + big, -big);
    mk('−1', -1);
    const v = document.createElement('div'); v.className = 'stepper-val'; v.textContent = value; v.dataset.value = value; row.appendChild(v);
    mk('+1', 1);
    if (big) mk('+' + big, big);
    box.appendChild(row);
  }

  /* ── 행성 모형: 몇 바퀴 감을지 정하고 태엽을 푼다. 맞지 않으면 처음 자리로 돌아간다 ── */
  function orreryWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.orrery');
    if (!box) { box = document.createElement('div'); box.className = 'orrery'; container.appendChild(box); }
    box.innerHTML = '';
    f.turnsSet = f.turnsSet || 1;
    const draw = (t) => {
      [...box.querySelectorAll('.planet')].forEach((x) => x.remove());
      posAt(t).forEach((p, i) => {
        const o = ORB[i], a = (p / 12) * Math.PI * 2 - Math.PI / 2;
        const im = document.createElement('img'); im.className = 'planet'; im.alt = ''; im.src = game.src(`props/planet_${o.c}.webp`);
        im.style.cssText = `left:${800 + Math.cos(a) * o.rx - 36}px;top:${445 + Math.sin(a) * o.ry - 36}px`;
        im.dataset.pos = p; box.appendChild(im);
      });
    };
    draw(f.aligned ? 12 : 0);
    if (f.aligned) return;
    stepper(box, game, { x: 1140, y: 80, label: '감을 바퀴 수', value: f.turnsSet, min: 1, max: TURN_MAX, big: 10, onChange: (v) => { f.turnsSet = v; api.sfx('tap'); game.save(); orreryWidget(container, api, game); } });
    const go = document.createElement('button'); go.className = 'plain-btn orrery-go'; go.textContent = '태엽 풀기'; go.setAttribute('aria-label', '태엽 풀기');
    go.style.cssText = 'left:1280px;top:720px;width:240px;height:76px';
    go.onclick = (e) => {
      e.stopPropagation(); if (game.busy) return;
      const n = f.turnsSet; game.busy = true; api.sfx('dial');
      const step = Math.max(40, Math.min(110, 2400 / n));
      for (let t = 1; t <= n; t++) game.after(t * step, () => draw(t));
      game.after(n * step + 500, () => {
        if (posAt(n).every(isTop)) {
          f.aligned = true; game.busy = false; game.save(); api.sfx('unlock');
          api.say('딸깍! 세 행성이 창 쪽으로 한 줄로 서자 받침 서랍이 스르르 열렸어. 안에 커다란 유리 렌즈!', 5200);
          game.s.zoom = null; game.save(); game.render();
          return;
        }
        const p = posAt(n);
        api.say(p[0] === p[1] && p[1] === p[2] ? '한 줄로 서긴 했는데 창 쪽이 아니야… 태엽이 다 풀리자 행성들이 처음 자리로 스르르 돌아갔어.' : `${n}바퀴 돌고 멈췄어. 셋이 제각각이야. 태엽이 풀리자 행성들이 처음 자리로 돌아갔어.`, 4800);
        game.after(1400, () => { game.busy = false; draw(0); });
      });
    };
    box.appendChild(go);
  }

  /* ── 등잔 아래 렌즈 높이: 빛이 한 점으로 모이는 높이가 초점 거리 ── */
  function focusWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.focus');
    if (!box) { box = document.createElement('div'); box.className = 'focus'; container.appendChild(box); }
    box.innerHTML = '';
    const lens = f.focusLens || 'big';
    f.lensH = f.lensH || 2;
    const h = f.lensH, F0 = FOCAL[lens];
    const lensIm = document.createElement('img'); lensIm.className = 'focus-lens'; lensIm.alt = ''; lensIm.src = game.src(`items/${lens === 'big' ? 'lensbig' : 'lenssmall'}.webp`);
    // 위에서 내려다본 책상: 종이 가운데(860,450)에 빛 동그라미. 렌즈는 높이 올라갈수록 눈에 가까워 크게 보인다.
    const spot = document.createElement('div'); spot.className = 'focus-spot';
    const r = 10 + Math.abs(h - F0) * 24;
    spot.style.cssText = `left:${860 - r}px;top:${450 - r}px;width:${r * 2}px;height:${r * 2}px;opacity:${Math.max(0.25, 1 - Math.abs(h - F0) * 0.08)}`;
    const ls = (lens === 'big' ? 170 : 110) + h * 14;
    lensIm.style.cssText = `left:${860 - ls / 2 + h * 9}px;top:${450 - ls / 2 - h * 7}px;width:${ls}px;height:${ls}px`;
    box.appendChild(lensIm);
    box.appendChild(spot); // 빛 동그라미가 보이도록 렌즈 위에 그린다
    stepper(box, game, {
      x: 90, y: 560, label: '렌즈 높이 (자 눈금)', value: h, min: 1, max: LENS_MAX,
      onChange: (v) => {
        f.lensH = v; api.sfx('tap'); game.save(); focusWidget(container, api, game);
        if (v === F0) {
          const name = lens === 'big' ? '큰 렌즈' : '작은 렌즈';
          api.say(`빛이 바늘 끝처럼 작고 밝게 모였어! ${name}는 종이에서 ${F0}칸 높이일 때야.`, 4200);
          api.note(`${name}의 초점`, `등잔 빛이 한 점으로 모이는 높이: 자 눈금 ${F0}칸.`);
          f['focal_' + lens] = true;
        }
      },
    });
  }

  /* ── 망원경: 통 길이를 정하고 들여다본다. 맞을 때만 또렷하다 (조금 틀려도 똑같이 뿌옇다) ── */
  function scopeWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.scope');
    if (!box) { box = document.createElement('div'); box.className = 'scope'; container.appendChild(box); }
    box.innerHTML = '';
    f.tube = f.tube || 6;
    const sky = document.createElement('div'); sky.className = 'scope-sky' + (f.focused ? '' : ' fog');
    if (f.focused) {
      const svg = ['<svg viewBox="0 0 1600 900" width="1600" height="900" aria-hidden="true">'];
      const pts = CONST.map((i) => [450 + STUDS[i][0] * 0.55, 160 + STUDS[i][1] * 0.6]);
      for (let k = 0; k < pts.length - 1; k++) svg.push(`<line x1="${pts[k][0]}" y1="${pts[k][1]}" x2="${pts[k + 1][0]}" y2="${pts[k + 1][1]}" stroke="rgba(220,230,255,.35)" stroke-width="2" stroke-dasharray="4 6"/>`);
      pts.forEach(([x, y]) => svg.push(`<circle cx="${x}" cy="${y}" r="9" fill="#fff8dc"/><circle cx="${x}" cy="${y}" r="22" fill="rgba(255,240,190,.25)"/>`));
      svg.push('</svg>'); sky.innerHTML = svg.join('');
    }
    box.appendChild(sky);
    if (f.focused) return;
    stepper(box, game, { x: 1290, y: 230, label: '통 길이 (칸)', value: f.tube, min: 1, max: TUBE_MAX, onChange: (v) => { f.tube = v; api.sfx('dial'); game.save(); scopeWidget(container, api, game); } });
    const look = document.createElement('button'); look.className = 'plain-btn scope-look'; look.textContent = '들여다보기'; look.setAttribute('aria-label', '들여다보기');
    look.style.cssText = 'left:1290px;top:400px;width:220px;height:76px';
    look.onclick = (e) => {
      e.stopPropagation(); if (game.busy) return;
      if (f.tube === TUBE) {
        f.focused = true; game.save(); api.sfx('shine'); scopeWidget(container, api, game);
        api.say('또렷해졌어! 별 일곱 개가 이어진 별자리가 보여. 다른 별들은 꺼져 가는데 이 일곱 개만 반짝여.', 5600);
        api.note('망원경 속 별자리', `통 길이 ${TUBE}칸(큰 렌즈 ${FOCAL.big}칸 + 작은 렌즈 ${FOCAL.small}칸)에서 또렷. 별 일곱 개짜리 별자리.`);
        return;
      }
      game.busy = true; api.sfx('nope');
      api.say(`통 ${f.tube}칸… 뿌옇게 번져서 별이 하나도 안 보여. 눈이 시려서 잠깐 쉬어야겠어.`, 3000);
      game.after(3000, () => { game.busy = false; });
    };
    box.appendChild(look);
  }

  /* ── 서쪽 문: 별 단추 ── */
  function doorWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.studs');
    if (f.doorOpen) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.className = 'studs'; container.appendChild(box); }
    box.innerHTML = '';
    f.lit = f.lit || [];
    STUDS.forEach(([x, y], i) => {
      const b = document.createElement('button'); b.className = 'piece stud' + (f.lit.includes(i) ? ' lit' : '');
      b.style.cssText = `left:${x - 45}px;top:${y - 45}px;width:90px;height:90px`;
      b.dataset.i = i; b.setAttribute('aria-label', `별 단추 ${i + 1}`);
      const im = document.createElement('img'); im.alt = ''; im.src = game.src('props/stud.webp'); b.appendChild(im);
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy) return;
        f.lit = f.lit.includes(i) ? f.lit.filter((k) => k !== i) : [...f.lit, i];
        api.sfx('clink'); game.save(); doorWidget(container, api, game);
        if (f.lit.length === CONST.length && CONST.every((k) => f.lit.includes(k))) {
          f.doorOpen = true; game.busy = true; game.save();
          game.after(800, () => { game.busy = false; api.sfx('door'); api.flash('#e8f0ff', 1200); api.say('일곱 개 단추가 별처럼 켜지자 남색 문이 소리 없이 열렸어. 밖으로 별길이 이어져!', 5200); game.s.zoom = null; game.save(); game.render(); });
        }
      };
      box.appendChild(b);
    });
    const r = document.createElement('button'); r.className = 'plain-btn studs-reset'; r.textContent = '모두 끄기'; r.setAttribute('aria-label', '모두 끄기');
    r.style.cssText = 'left:1260px;top:780px;width:260px;height:64px';
    r.onclick = (e) => { e.stopPropagation(); f.lit = []; api.sfx('tap'); game.save(); doorWidget(container, api, game); };
    box.appendChild(r);
  }

  function whiTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true; api.lock(5600);
      api.say('휘: “부엉… 어서 와요. 저는 이 천문대의 휘예요. 큰일이에요, 별이 하나씩 꺼지고 있어요.”', 5600, { who: 'whi' });
      api.after(5600, () => api.say('휘: “망원경 렌즈 두 개가 빠져 버렸고, 태엽 행성 모형도 멈췄어요. 별을 다시 찾아야 꺼진 별을 켤 수 있어요.”', 6400, { who: 'whi', note: '휘의 부탁' }));
      return;
    }
    if (f.doorOpen) { api.say('휘: “별이 다시 켜졌어요. 다음 쪽은… 그림자가 몸을 잃었대요.”', 0, { who: 'whi' }); return; }
    if (f.bigIn && f.smallIn) { api.say('휘: “렌즈 두 개 사이 거리가 중요해요. 각 렌즈가 빛을 모으는 거리를 더한 만큼이요.”', 0, { who: 'whi' }); return; }
    if (api.has('lensbig') || api.has('lenssmall')) { api.say('휘: “렌즈마다 빛을 한 점에 모으는 거리가 달라요. 등잔 아래에서 재 볼 수 있어요.”', 0, { who: 'whi' }); return; }
    if (f.keyTaken) { api.say('휘: “행성 모형은 지난번에 셋이 한 줄로 섰을 때 그림을 그려 뒀어요. 남쪽 벽에요.”', 0, { who: 'whi' }); return; }
    api.say('휘: “태엽 열쇠는… 오늘 달 모양 서랍에 넣어 뒀던 것 같아요. 오늘 달이 어땠더라.”', 0, { who: 'whi' });
  }

  Engine.registerRoom({
    id: 'observatory',
    chapter: '13장',
    title: '태엽 천문대',
    assets: 'assets/rooms/observatory/',
    sky: ['assets/rooms/observatory/bg/north.webp', 'assets/rooms/observatory/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 40,
    isLit: () => true,
    ambient: (s) => (F(s).doorOpen ? 'sea' : 'night'),
    guide: { name: '부엉이 휘', img: 'assets/rooms/observatory/props/whi_sleepy.webp' },
    intro: '물길을 따라 올라오니 둥근 지붕 아래 놋쇠 냄새가 나. 천문대야. 그런데 창밖 별들이 하나씩 깜빡이며 꺼져…',

    repair(s, fix) {
      const f = s.flags;
      if (f.aligned && !f.lensBigTaken && !s.inv.includes('lensbig')) { /* 서랍은 열린 채, 렌즈는 눌러서 꺼낸다 */ }
    },

    items: {
      key: { name: '태엽 열쇠', img: 'items/key.webp', desc: '작은 놋쇠 태엽 열쇠. 무언가의 태엽을 감는 데 써.' },
      lensbig: { name: '큰 렌즈', img: 'items/lensbig.webp', desc: '놋쇠 테에 끼운 크고 둥근 유리 렌즈. 가운데가 볼록해.' },
      lenssmall: { name: '작은 렌즈', img: 'items/lenssmall.webp', desc: '돋보기에서 빼낸 작은 볼록 렌즈.' },
    },
    combos: [
      { a: 'lensbig', b: 'lenssmall', say: '두 렌즈를 겹쳐 봤는데 아무것도 또렷하지 않아. 사이를 얼마나 띄워야 할까?' },
    ],

    views: {
      /* ───── 북쪽: 큰 망원경, 휘 ───── */
      north: {
        name: '큰 망원경',
        bg: 'bg/north.webp',
        objects: [
          {
            id: 'scope', x: 0, y: 0, w: 0, h: 0, img: '', hit: [470, 110, 660, 520], label: '큰 망원경',
            click: (api) => {
              const f = api.flags;
              if (f.bigIn && f.smallIn) { api.zoom('scope'); return; }
              api.say(f.bigIn || f.smallIn ? '렌즈 하나만 끼웠어. 한쪽 렌즈만으론 뿌옇게 아무것도 안 보여.' : '앞쪽 고리도, 눈 대는 고리도 텅 비었어. 렌즈 두 개가 빠졌네.');
            },
            use: {
              lensbig: (api) => { api.take('lensbig'); api.set('bigIn'); api.sfx('clink'); api.say('큰 렌즈를 망원경 앞쪽 고리에 끼웠어. 딱 맞아!'); },
              lenssmall: (api) => { api.take('lenssmall'); api.set('smallIn'); api.sfx('clink'); api.say('작은 렌즈를 눈 대는 쪽 고리에 끼웠어.'); },
            },
          },
          {
            id: 'whi', img: (s) => `props/${F(s).doorOpen ? 'whi_happy' : F(s).focused ? 'whi_surprised' : 'whi_sleepy'}.webp`, x: 55, y: 130, w: 480, h: 400, cls: 'bob', hit: [180, 140, 230, 370], label: '부엉이 휘',
            click: whiTalk,
            use: {
              key: (api) => api.say('휘: “그건 행성 모형 태엽 열쇠예요!”', 0, { who: 'whi' }),
              lensbig: (api) => api.say('휘: “망원경 앞쪽에 끼우는 큰 렌즈예요.”', 0, { who: 'whi' }),
            },
            wrong: '휘: “부엉… 그건 별이랑 상관없는 것 같아요.”',
          },
          { id: 'charts', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1240, 530, 180, 260], label: '별 지도 바구니', look: '둘둘 만 별 지도들. 펼쳐 보니 별자리마다 별 몇 개가 하얗게 지워져 있어.' },
        ],
      },

      /* ───── 동쪽: 창밖 반달, 달 모양 달력, 책상 등잔과 돋보기 ───── */
      east: {
        name: '달 달력',
        bg: 'bg/east.webp',
        objects: [
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [615, 60, 330, 340], label: '둥근 창', look: '창밖에 반달이 떠 있어. 오른쪽 반이 환하고 왼쪽 반은 어두워.' },
          ...MOONS.map((m, i) => ({
            id: 'moon_' + m, x: 0, y: 0, w: 0, h: 0, img: '', hit: [226 + i * 109.5, 478, 100, 176], label: `${MNAME[m]} 서랍`,
            click: (api, n) => {
              const f = api.flags;
              if (f.keyTaken) { api.say(m === 'firstq' ? '빈 서랍이야.' : `${MNAME[m]} 서랍. 별 가루만 조금 있어.`); return; }
              const left = Math.ceil(((f.calJam || 0) - Date.now()) / 1000);
              if (left > 0) { api.sfx('locked'); api.say(`서랍들이 꽉 잠겨 있어. 톱니 소리가 째깍째깍… ${left}초쯤 뒤에 풀릴 것 같아.`); return; }
              if (m !== 'firstq') {
                f.calJam = Date.now() + JAM_MS; api.sfx('locked');
                api.say(m === 'lastq' ? '반달 서랍인데… 철컥! 달력 서랍이 전부 잠겨 버렸어. 오늘 달과 다른 모양이었나 봐. 창밖 달을 다시 봐야겠어.' : `${MNAME[m]} 서랍을 당기자 철컥! 달력 서랍이 전부 잠겨 버렸어. 오늘 달 모양 서랍만 열어야 하나 봐.`, 5200);
                return;
              }
              f.keyTaken = true; api.give('key', n); api.sfx('unlock'); api.say('오늘 달과 같은 모양 서랍! 안에 작은 놋쇠 태엽 열쇠가 있었어.');
            },
          })),
          {
            id: 'magnifier', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1370, 385, 190, 225], label: '책상 돋보기', show: (s) => !F(s).magTaken,
            click: (api, n) => { api.set('magTaken'); api.give('lenssmall', n); api.sfx('pick'); api.say('돋보기 틀에서 작은 볼록 렌즈를 빼냈어.'); },
          },
          {
            id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1240, 340, 110, 250], label: '책상 등잔',
            click: (api) => api.say('밝은 등잔 아래 빈 종이와 세워 둔 자가 있어. 렌즈를 대 보면 빛을 모을 수 있겠다.'),
            use: {
              lensbig: (api) => { api.flags.focusLens = 'big'; api.flags.lensH = 2; api.zoom('focus'); },
              lenssmall: (api) => { api.flags.focusLens = 'small'; api.flags.lensH = 8; api.zoom('focus'); },
            },
          },
        ],
      },

      /* ───── 남쪽: 태엽 행성 모형, 벽의 '한 줄로 선 날' 그림 ───── */
      south: {
        name: '행성 모형',
        bg: 'bg/south.webp',
        objects: [
          { id: 'drawing', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1105, 165, 440, 320], label: '벽에 걸린 그림', look: '행성 모형 그림. 빨강·파랑·초록 행성 셋이 한 줄로 서서, 종이 가장자리의 작은 창을 똑바로 가리키고 있어.' },
          {
            id: 'orrery', x: 0, y: 0, w: 0, h: 0, img: '', hit: [430, 240, 660, 450], label: '태엽 행성 모형',
            click: (api, n) => {
              const f = api.flags;
              if (f.aligned) {
                if (f.lensBigTaken) { api.say('받침 서랍은 비었어. 세 행성은 창 쪽으로 나란히.'); return; }
                f.lensBigTaken = true; api.give('lensbig', n); api.sfx('pick'); api.say('받침 서랍에서 큰 렌즈를 꺼냈어.'); return;
              }
              if (!f.keyIn) { api.say('손잡이를 돌려도 헛돌아. 태엽이 다 풀렸나 봐. 받침에 열쇠 구멍이 있어.'); return; }
              api.zoom('orrery');
            },
            use: { key: (api) => { api.take('key'); api.set('keyIn'); api.sfx('dial'); api.say('태엽 열쇠를 끼워 끝까지 감았어. 이제 손잡이가 돌아가!'); api.zoom('orrery'); } },
          },
        ],
      },

      /* ───── 서쪽: 책장, 천구의, 남색 문 ───── */
      west: {
        name: '남색 문',
        bg: (s) => (F(s).doorOpen ? 'bg/west_open.webp' : 'bg/west.webp'),
        objects: [
          { id: 'globe', x: 0, y: 0, w: 0, h: 0, img: '', hit: [950, 400, 215, 370], label: '천구의', look: '별자리가 새겨진 놋쇠 천구의. 빙글 돌려 보니 별들이 반은 지워져 있어.' },
          { id: 'books', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 130, 865, 560], label: '별 지도 책장', look: '두꺼운 별 지도책들. 펼쳐 보니 별자리마다 별 몇 개가 하얗게 비어 있어.' },
          {
            id: 'door', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1240, 190, 270, 590], label: '남색 문',
            click: (api) => { if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; } api.zoom('door'); },
          },
        ],
      },
    },

    zooms: {
      orrery: { bg: 'zoom/orrery_top.webp', note: ['행성 모형 손잡이', '손잡이 한 바퀴에 빨강 1칸, 파랑 반 칸, 초록 3분의 1칸 (한 바퀴 둘레는 12칸). 처음 자리: 빨강 맨 위(0칸), 파랑 6칸, 초록 8칸.'], widget: orreryWidget },
      focus: { bg: 'zoom/lampdesk.webp', note: ['등잔 아래 렌즈', '렌즈 높이를 바꾸면 종이 위 빛 동그라미 크기가 바뀐다.'], widget: focusWidget },
      scope: { bg: 'zoom/sky.webp', widget: scopeWidget },
      door: { bg: 'zoom/door_panel.webp', note: ['남색 문의 별 단추', '단추 열두 개. 누르면 켜지고, 다시 누르면 꺼진다.'], widget: doorWidget },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.doorOpen) return { key: 'go', steps: ['별이 다시 켜졌어요! 길이 열렸어요.', '서쪽 남색 문이에요.', '서쪽 남색 문을 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['천문대 주인을 찾아봐요.', '북쪽 망원경 옆 횃대에 누가 있어요.', '북쪽 부엉이 휘를 누르세요.'] };
      if (f.focused) return { key: 'door', steps: ['망원경 속 별자리를 기억해요.', '서쪽 남색 문의 별 단추 열두 개 중 일곱 개가 별자리 자리와 같아요.', '망원경에서 본 별자리 모양대로 문 단추 일곱 개를 켜세요.'] };
      if (!f.keyTaken) return { key: 'moon', steps: ['휘는 태엽 열쇠를 오늘 달 모양 서랍에 넣었대요. 틀린 서랍을 열면 한동안 잠겨요.', '동쪽 창밖 달을 보세요. 어느 쪽이 빛나나요?', '달력에서 오른쪽이 빛나는 반달 서랍(왼쪽에서 셋째)을 여세요.'] };
      if (!f.aligned) {
        if (!f.keyIn) return { key: 'key', steps: ['태엽 열쇠는 행성 모형에 써요.', '남쪽 행성 모형이에요.', '태엽 열쇠를 고른 채 남쪽 행성 모형을 누르세요.'] };
        return { key: 'orrery', steps: ['남쪽 벽 그림처럼 세 행성을 창 쪽(맨 위)으로 한 줄로 세워요. 감을 바퀴 수를 계산해서 정해야 해요.', '둘레는 12칸. 빨강은 0칸에서 1칸씩, 파랑은 6칸에서 ½칸씩, 초록은 8칸에서 ⅓칸씩 가요. 셋이 동시에 12칸(맨 위)에 닿는 바퀴 수는?', '빨강은 12의 배수, 파랑은 6칸 더 가야 하니 12바퀴, 초록은 4칸 더 가야 하니 12바퀴. 12바퀴로 정하고 태엽을 푸세요.'] };
      }
      if (!f.lensBigTaken) return { key: 'lensbig', steps: ['받침 서랍이 열렸어요.', '남쪽 행성 모형이에요.', '행성 모형을 눌러 큰 렌즈를 꺼내세요.'] };
      if (!f.magTaken) return { key: 'lenssmall', steps: ['망원경엔 렌즈가 하나 더 필요해요.', '동쪽 책상에 볼록 렌즈가 달린 물건이 있어요.', '동쪽 책상 돋보기를 누르세요.'] };
      if (!(f.focal_big && f.focal_small) && (has('lensbig') || has('lenssmall'))) return { key: 'focal', steps: ['망원경에 끼우기 전에, 렌즈마다 빛을 한 점에 모으는 거리를 재 봐요.', '동쪽 책상 등잔에 렌즈를 대고 종이 위로 올렸다 내렸다 해 봐요.', '렌즈를 고른 채 동쪽 등잔을 누르고, 빛이 바늘 끝처럼 작아지는 높이를 찾으세요. (큰 렌즈 9칸, 작은 렌즈 3칸)'] };
      if (!f.bigIn || !f.smallIn) return { key: 'lensin', steps: ['렌즈를 망원경에 끼워요.', '북쪽 큰 망원경이에요.', '큰 렌즈와 작은 렌즈를 각각 고른 채 망원경을 누르세요.'] };
      return { key: 'tube', steps: ['망원경 두 렌즈 사이 거리는 두 렌즈의 초점 거리를 더한 만큼이에요. 등잔에서 잰 높이를 떠올려요.', '큰 렌즈 9칸 + 작은 렌즈 3칸.', '망원경 통 길이를 12칸으로 맞추고 들여다보세요.'] };
    },

    ending: {
      title: '다시 켜진 별',
      text: ['남색 문 밖으로 별길이 이어졌어요. 꺼져 가던 별들이 하나둘 다시 반짝였지요.', '휘가 날개를 활짝 펴고 부엉부엉 웃었어요. “별이 다시 켜졌어요!”', '그런데 별빛 아래 어딘가에서… 주인 없는 그림자 하나가 길을 헤매고 있었어요.'],
      next: '3편 · 14장 「그림자 인형극장」은 만드는 중이에요',
      image: 'assets/rooms/observatory/bg/west_open.webp',
    },
  });
})();
