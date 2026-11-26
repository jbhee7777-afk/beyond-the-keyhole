/* 13장 「태엽 천문대」 (3편 셋째 장 · 어른 난이도) — 되찾을 것: 빛(별)
 * 부엉이 천문 박사 휘의 천문대. 별이 하나씩 꺼지고 있다.
 *  1 달의 모양: 창밖 달은 오른쪽이 빛나는 반달 → 달력 서랍 8칸 중 같은 모양 → 태엽 열쇠 (왼쪽 반달은 미끼)
 *  2 톱니 비율: 손잡이 1바퀴에 안쪽 1칸, 가운데 1/2칸, 바깥 1/3칸. 셋이 창 쪽(위)으로 한 줄 → 받침 서랍의 큰 렌즈
 *  3 작은 렌즈: 동쪽 책상 돋보기
 *  4 볼록렌즈 초점: 등잔 아래 종이 위에서 렌즈 높이를 바꿔 빛이 한 점으로 모이는 높이 (큰 4칸, 작은 1칸)
 *  5 망원경: 두 렌즈를 끼우고 통 길이를 초점 거리의 합(5칸)으로 → 별 일곱 개 별자리
 *  6 서쪽 남색 문: 별 단추 12개 중 별자리 자리 7개 → 문이 열림
 * 좌표(hit)는 그림을 받은 뒤 맞춘다 (ORDER-13.json).
 */
(function () {
  const F = (s) => s.flags;
  const MOONS = ['new', 'wax1', 'firstq', 'wax3', 'full', 'wane3', 'lastq', 'wane1'];
  const MNAME = { new: '그믐(깜깜한 달)', wax1: '오른쪽이 가늘게 빛나는 초승달', firstq: '오른쪽이 빛나는 반달', wax3: '오른쪽이 불룩한 달', full: '보름달', wane3: '왼쪽이 불룩한 달', lastq: '왼쪽이 빛나는 반달', wane1: '왼쪽이 가늘게 빛나는 그믐달' };
  const ORB = [{ c: 'red', r: 150, speed: 1, start: 0 }, { c: 'blue', r: 250, speed: 1 / 2, start: 6 }, { c: 'green', r: 340, speed: 1 / 3, start: 8 }];
  const FOCAL = { big: 4, small: 1 };
  const TUBE = FOCAL.big + FOCAL.small; // 두 렌즈 거리 = 초점 거리의 합
  // 별 단추 12개 (문 확대 화면 좌표)와 별자리가 쓰는 7개
  const STUDS = [[420, 210], [640, 170], [880, 230], [1120, 180], [360, 430], [600, 400], [850, 460], [1150, 420], [450, 650], [700, 610], [960, 680], [1180, 640]];
  const CONST = [1, 2, 5, 6, 7, 9, 10];
  const mod = (a, m) => ((a % m) + m) % m;

  /* ── 행성 모형: 손잡이 돌리기 ── */
  function orreryWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.orrery');
    if (!box) { box = document.createElement('div'); box.className = 'orrery'; container.appendChild(box); }
    box.innerHTML = '';
    f.turns = f.turns || 0;
    const pos = ORB.map((o) => mod(o.start + f.turns * o.speed, 12));
    ORB.forEach((o, i) => {
      const a = (pos[i] / 12) * Math.PI * 2 - Math.PI / 2;
      const im = document.createElement('img'); im.className = 'planet'; im.alt = ''; im.src = game.src(`props/planet_${o.c}.webp`);
      im.style.cssText = `left:${800 + Math.cos(a) * o.r - 36}px;top:${450 + Math.sin(a) * o.r - 36}px`;
      im.dataset.pos = pos[i];
      box.appendChild(im);
    });
    const crank = (d) => {
      if (game.busy || f.aligned) return;
      f.turns += d; api.sfx('dial'); game.save(); orreryWidget(container, api, game);
      const p = ORB.map((o) => mod(o.start + f.turns * o.speed, 12));
      if (p.every((v) => Math.abs(v) < 1e-6 || Math.abs(v - 12) < 1e-6)) {
        f.aligned = true; game.busy = true; game.save();
        game.after(700, () => { game.busy = false; api.sfx('unlock'); api.say('딸깍! 세 행성이 창 쪽으로 한 줄로 서자 받침 서랍이 스르르 열렸어. 안에 커다란 유리 렌즈!', 5200); game.s.zoom = null; game.save(); game.render(); });
      } else if (p[0] === p[1] && p[1] === p[2]) {
        api.say('한 줄로 서긴 했는데 창 쪽이 아니야. 벽 그림에선 창을 가리키고 있었어.');
      }
    };
    [['손잡이 한 바퀴 돌리기', 1, 1220], ['손잡이 거꾸로 한 바퀴', -1, 1220]].forEach(([label, d, x], k) => {
      const b = document.createElement('button'); b.className = 'plain-btn orrery-btn'; b.textContent = label; b.setAttribute('aria-label', label);
      b.style.cssText = `left:${x}px;top:${330 + k * 100}px;width:330px;height:70px`;
      b.onclick = (e) => { e.stopPropagation(); crank(d); };
      box.appendChild(b);
    });
  }

  /* ── 등잔 아래 렌즈 높이: 빛이 한 점으로 모이는 높이가 초점 거리 ── */
  function focusWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.focus');
    if (!box) { box = document.createElement('div'); box.className = 'focus'; container.appendChild(box); }
    box.innerHTML = '';
    const lens = f.focusLens || 'big';
    f.lensH = f.lensH || 3;
    const h = f.lensH, F0 = FOCAL[lens];
    const lensIm = document.createElement('img'); lensIm.className = 'focus-lens'; lensIm.alt = ''; lensIm.src = game.src(`items/${lens === 'big' ? 'lensbig' : 'lenssmall'}.webp`);
    lensIm.style.cssText = `left:640px;top:${620 - h * 80}px;width:320px;height:120px`;
    box.appendChild(lensIm);
    const spot = document.createElement('div'); spot.className = 'focus-spot';
    const r = 14 + Math.abs(h - F0) * 46;
    spot.style.cssText = `left:${800 - r}px;top:${720 - r * 0.35}px;width:${r * 2}px;height:${r * 0.7}px;opacity:${Math.max(0.25, 1 - Math.abs(h - F0) * 0.2)}`;
    box.appendChild(spot);
    const btn = (label, d, y) => {
      const b = document.createElement('button'); b.className = 'plain-btn focus-btn'; b.textContent = label; b.setAttribute('aria-label', label);
      b.style.cssText = `left:1180px;top:${y}px;width:300px;height:70px`;
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy) return;
        f.lensH = Math.min(6, Math.max(1, f.lensH + d)); api.sfx('tap'); game.save(); focusWidget(container, api, game);
        if (f.lensH === F0) {
          const name = lens === 'big' ? '큰 렌즈' : '작은 렌즈';
          api.say(`빛이 바늘 끝처럼 작고 밝게 모였어! ${name}는 종이에서 ${F0}칸 높이일 때야.`, 4200);
          api.note(`${name}의 초점`, `등잔 빛이 한 점으로 모이는 높이: 자 눈금 ${F0}칸.`);
          f['focal_' + lens] = true;
        }
      };
      box.appendChild(b);
    };
    btn('렌즈 올리기', 1, 300); btn('렌즈 내리기', -1, 400);
  }

  /* ── 망원경: 통 길이 ── */
  function scopeWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.scope');
    if (!box) { box = document.createElement('div'); box.className = 'scope'; container.appendChild(box); }
    box.innerHTML = '';
    f.tube = f.tube || 2;
    const blur = Math.abs(f.tube - TUBE) * 4;
    const sky = document.createElement('div'); sky.className = 'scope-sky'; sky.style.filter = `blur(${blur}px)`;
    if (f.tube === TUBE) {
      const svg = ['<svg viewBox="0 0 1600 900" width="1600" height="900" aria-hidden="true">'];
      const pts = CONST.map((i) => [450 + STUDS[i][0] * 0.55, 160 + STUDS[i][1] * 0.6]);
      for (let k = 0; k < pts.length - 1; k++) svg.push(`<line x1="${pts[k][0]}" y1="${pts[k][1]}" x2="${pts[k + 1][0]}" y2="${pts[k + 1][1]}" stroke="rgba(220,230,255,.35)" stroke-width="2" stroke-dasharray="4 6"/>`);
      pts.forEach(([x, y]) => svg.push(`<circle cx="${x}" cy="${y}" r="9" fill="#fff8dc"/><circle cx="${x}" cy="${y}" r="22" fill="rgba(255,240,190,.25)"/>`));
      svg.push('</svg>'); sky.innerHTML = svg.join('');
    }
    box.appendChild(sky);
    const lv = document.createElement('div'); lv.className = 'scope-len'; lv.textContent = '통 길이 ' + '■'.repeat(f.tube) + '□'.repeat(8 - f.tube); box.appendChild(lv);
    const btn = (label, d, y) => {
      const b = document.createElement('button'); b.className = 'plain-btn scope-btn'; b.textContent = label; b.setAttribute('aria-label', label);
      b.style.cssText = `left:1240px;top:${y}px;width:300px;height:70px`;
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy) return;
        f.tube = Math.min(8, Math.max(1, f.tube + d)); api.sfx('dial'); game.save(); scopeWidget(container, api, game);
        if (f.tube === TUBE && !f.focused) {
          f.focused = true; game.save(); api.sfx('shine');
          api.say('또렷해졌어! 별 일곱 개가 이어진 별자리가 보여. 다른 별들은 꺼져 가는데 이 일곱 개만 반짝여.', 5600);
          api.note('망원경 속 별자리', '통 길이 5칸(큰 렌즈 4칸 + 작은 렌즈 1칸)에서 또렷. 별 일곱 개짜리 별자리.');
        }
      };
      box.appendChild(b);
    };
    btn('통 늘이기', 1, 300); btn('통 줄이기', -1, 400);
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
            id: 'whi', img: (s) => `props/${F(s).doorOpen ? 'whi_happy' : F(s).focused ? 'whi_surprised' : 'whi_sleepy'}.webp`, x: 140, y: 200, w: 300, h: 300, cls: 'bob', hit: [205, 220, 170, 280], label: '부엉이 휘',
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
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [620, 60, 360, 300], label: '둥근 창', look: '창밖에 반달이 떠 있어. 오른쪽 반이 환하고 왼쪽 반은 어두워.' },
          { id: 'calendar', x: 0, y: 0, w: 0, h: 0, img: '', hit: [260, 380, 1000, 200], label: '달 모양 달력', click: (api) => api.zoom('calendar') },
          {
            id: 'magnifier', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1260, 520, 200, 200], label: '책상 돋보기', show: (s) => !F(s).magTaken,
            click: (api, n) => { api.set('magTaken'); api.give('lenssmall', n); api.sfx('pick'); api.say('돋보기 틀에서 작은 볼록 렌즈를 빼냈어.'); },
          },
          {
            id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1100, 420, 160, 300], label: '책상 등잔',
            click: (api) => api.say('밝은 등잔 아래 빈 종이와 세워 둔 자가 있어. 렌즈를 대 보면 빛을 모을 수 있겠다.'),
            use: {
              lensbig: (api) => { api.flags.focusLens = 'big'; api.flags.lensH = 2; api.zoom('focus'); },
              lenssmall: (api) => { api.flags.focusLens = 'small'; api.flags.lensH = 3; api.zoom('focus'); },
            },
          },
        ],
      },

      /* ───── 남쪽: 태엽 행성 모형, 벽의 '한 줄로 선 날' 그림 ───── */
      south: {
        name: '행성 모형',
        bg: 'bg/south.webp',
        objects: [
          { id: 'drawing', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 60, 480, 280], label: '벽에 걸린 그림', look: '행성 모형 그림. 빨강·파랑·초록 행성 셋이 한 줄로 서서, 종이 가장자리의 작은 창을 똑바로 가리키고 있어.' },
          {
            id: 'orrery', x: 0, y: 0, w: 0, h: 0, img: '', hit: [480, 360, 640, 420], label: '태엽 행성 모형',
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
          { id: 'globe', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 380, 260, 380], label: '천구의', look: '별자리가 새겨진 놋쇠 천구의. 빙글 돌려 보니 별들이 반은 지워져 있어.' },
          { id: 'books', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 120, 460, 640], label: '별 지도 책장', look: '두꺼운 별 지도책들. 펼쳐 보니 별자리마다 별 몇 개가 하얗게 비어 있어.' },
          {
            id: 'door', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1000, 120, 420, 680], label: '남색 문',
            click: (api) => { if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; } api.zoom('door'); },
          },
        ],
      },
    },

    zooms: {
      calendar: {
        bg: 'zoom/calendar.webp',
        note: ['달 모양 달력', '달 그림 여덟 개, 아래마다 작은 서랍.'],
        objects: MOONS.map((m, i) => ({
          id: 'moon_' + m, x: 0, y: 0, w: 0, h: 0, img: '', hit: [110 + i * 175, 560, 160, 160], label: `${MNAME[m]} 서랍`,
          click: (api, n) => {
            const f = api.flags;
            if (m === 'lastq') { api.say('반달이긴 한데… 이건 왼쪽이 빛나는 반달이야. 창밖 달은 오른쪽이 빛났어.'); return; }
            if (m !== 'firstq') { api.say(`${MNAME[m]} 서랍. 별 가루만 조금 있어.`); return; }
            if (f.keyTaken) { api.say('빈 서랍이야.'); return; }
            f.keyTaken = true; api.give('key', n); api.sfx('unlock'); api.say('오늘 달과 같은 모양 서랍! 안에 작은 놋쇠 태엽 열쇠가 있었어.');
          },
        })),
      },
      orrery: { bg: 'zoom/orrery_top.webp', note: ['행성 모형 손잡이', '한 바퀴에 빨강 1칸, 파랑 반 칸, 초록 3분의 1칸.'], widget: orreryWidget },
      focus: { bg: 'zoom/lampdesk.webp', note: ['등잔 아래 렌즈', '렌즈 높이를 바꾸면 종이 위 빛 동그라미 크기가 바뀐다.'], widget: focusWidget },
      scope: { bg: 'zoom/sky.webp', widget: scopeWidget },
      door: { bg: 'zoom/door_panel.webp', note: ['남색 문의 별 단추', '단추 열두 개. 누르면 켜지고, 다시 누르면 꺼진다.'], widget: doorWidget },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.doorOpen) return { key: 'go', steps: ['별이 다시 켜졌어요! 길이 열렸어요.', '서쪽 남색 문이에요.', '서쪽 남색 문을 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['천문대 주인을 찾아봐요.', '북쪽 망원경 옆 횃대에 누가 있어요.', '북쪽 부엉이 휘를 누르세요.'] };
      if (f.focused) return { key: 'door', steps: ['망원경 속 별자리를 기억해요.', '서쪽 남색 문의 별 단추 열두 개 중 일곱 개가 별자리 자리와 같아요.', '망원경에서 본 별자리 모양대로 문 단추 일곱 개를 켜세요.'] };
      if (!f.keyTaken) return { key: 'moon', steps: ['휘는 태엽 열쇠를 오늘 달 모양 서랍에 넣었대요.', '동쪽 창밖 달을 보세요. 어느 쪽이 빛나나요?', '달력에서 오른쪽이 빛나는 반달 서랍을 여세요.'] };
      if (!f.aligned) {
        if (!f.keyIn) return { key: 'key', steps: ['태엽 열쇠는 행성 모형에 써요.', '남쪽 행성 모형이에요.', '태엽 열쇠를 고른 채 남쪽 행성 모형을 누르세요.'] };
        return { key: 'orrery', steps: ['남쪽 벽 그림처럼 세 행성을 창 쪽으로 한 줄로 세워요.', '손잡이 한 바퀴에 빨강 1칸, 파랑 ½칸, 초록 ⅓칸. 셋이 모두 맨 위로 오려면 몇 바퀴일까요?', '손잡이를 12바퀴 돌리세요.'] };
      }
      if (!f.lensBigTaken) return { key: 'lensbig', steps: ['받침 서랍이 열렸어요.', '남쪽 행성 모형이에요.', '행성 모형을 눌러 큰 렌즈를 꺼내세요.'] };
      if (!f.magTaken) return { key: 'lenssmall', steps: ['망원경엔 렌즈가 하나 더 필요해요.', '동쪽 책상에 볼록 렌즈가 달린 물건이 있어요.', '동쪽 책상 돋보기를 누르세요.'] };
      if (!f.bigIn || !f.smallIn) return { key: 'lensin', steps: ['렌즈를 망원경에 끼워요.', '북쪽 큰 망원경이에요.', '큰 렌즈와 작은 렌즈를 각각 고른 채 망원경을 누르세요.'] };
      if (!(f.focal_big && f.focal_small)) return { key: 'focal', steps: ['망원경 통 길이를 맞추려면 각 렌즈가 빛을 모으는 거리를 알아야 해요.', '동쪽 책상 등잔 아래에서 렌즈를 종이 위로 올렸다 내렸다 해 봐요. (끼운 렌즈는 망원경을 눌러 보는 대신, 여기서 먼저 재도 돼요)', '큰 렌즈는 4칸, 작은 렌즈는 1칸에서 빛이 한 점에 모여요.'] };
      return { key: 'tube', steps: ['두 렌즈 사이 거리 = 두 초점 거리의 합이에요.', '4칸 + 1칸.', '망원경을 열고 통 길이를 5칸으로 맞추세요.'] };
    },

    ending: {
      title: '다시 켜진 별',
      text: ['남색 문 밖으로 별길이 이어졌어요. 꺼져 가던 별들이 하나둘 다시 반짝였지요.', '휘가 날개를 활짝 펴고 부엉부엉 웃었어요. “별이 다시 켜졌어요!”', '그런데 별빛 아래 어딘가에서… 주인 없는 그림자 하나가 길을 헤매고 있었어요.'],
      next: '3편 · 14장 「그림자 인형극장」은 만드는 중이에요',
      image: 'assets/rooms/observatory/bg/west_open.webp',
    },
  });
})();
