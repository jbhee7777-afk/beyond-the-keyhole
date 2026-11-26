/* 12장 「김 서린 찻집」 (3편 둘째 장 · 어른 난이도) — 되찾을 것: 물
 * 수달 달래의 찻집. 샘이 말라 뒷면 세계의 물이 사라지는 중이다.
 *  1 주전자: 화로 위 구리 주전자가 비어 있다 → 동쪽 물항아리에서 국자로 찬물을 떠 와 붓기 → 끓는다
 *  2 김 서린 창: 끓는 김이 바로 뒤 차가운 유리창에 서리면, 손가락으로 그렸던 새 네 마리만 또렷이 떠오른다
 *  3 물잔 실로폰: 새 높이 = 음 높이. 하지만 물이 많을수록 소리가 낮다 → 높이를 뒤집어 물을 붓는다 → 찻장이 열림
 *  4 찻잎 통 라벨: 온도계 다섯 눈금 중 넷째(80도). 끓는 물(100) 큰 주전자 3잔 + 찬물(20) 작은 잔 1잔 = 80
 *  5 달래가 차를 마시고 남긴 찻잎 모양 = 물고기 → 서쪽 그림 서랍 중 물고기 → 샘물 병
 *  6 물얼룩 지도: 물은 높은 데서 낮은 데로. 산꼭대기에 샘물을 떨어뜨려야 물길이 문까지 이어진다 → 둥근 문이 열림
 * 좌표(hit)는 그림을 받은 뒤 맞춘다 (art-src/teahouse, ORDER-12.json).
 */
(function () {
  const F = (s) => s.flags;
  const BIRDS = [3, 1, 4, 2]; // 김 서린 창의 새 높이 (4 = 가장 높음)
  const WATER = BIRDS.map((b) => 5 - b); // 정답 물 높이: 높은 음일수록 물이 적다 → [2, 4, 1, 3]
  const DRAWERS = ['fish', 'bird', 'leaf', 'moon', 'sun', 'flower', 'shell', 'cloud', 'cat', 'teapot', 'star', 'boat'];
  const DNAME = { fish: '물고기', bird: '새', leaf: '잎', moon: '달', sun: '해', flower: '꽃', shell: '조개', cloud: '구름', cat: '고양이', teapot: '찻주전자', star: '별', boat: '배' };
  const HOT = 100, COLD = 20, POT = 4;
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  /* ── 물잔 실로폰: 잔을 누르면 물이 한 칸씩 (1→4→비움). 두드려 보기로 소리 확인 ── */
  function glassWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.glass-row');
    if (f.cabinetOpen) { if (box) box.remove(); return; }
    f.levels = f.levels || [0, 0, 0, 0];
    if (!box) { box = document.createElement('div'); box.className = 'glass-row'; container.appendChild(box); }
    box.innerHTML = '';
    f.levels.forEach((lv, i) => {
      const b = document.createElement('button');
      b.className = 'piece glass';
      b.style.cssText = `left:${330 + i * 250}px;top:250px;width:190px;height:300px`;
      b.dataset.level = lv;
      b.setAttribute('aria-label', `${i + 1}번째 물잔`);
      const empty = document.createElement('img'); empty.alt = ''; empty.src = game.src('props/glass_empty.webp'); b.appendChild(empty);
      const full = document.createElement('img'); full.alt = ''; full.src = game.src('props/glass_full.webp'); full.className = 'water';
      full.style.clipPath = `inset(${100 - lv * 22}% 0 0 0)`; b.appendChild(full);
      b.onclick = (e) => {
        e.stopPropagation(); if (game.busy) return;
        f.levels[i] = (f.levels[i] + 1) % 5; api.sfx(f.levels[i] ? 'water' : 'splash'); game.save(); glassWidget(container, api, game);
      };
      box.appendChild(b);
    });
    const tap = document.createElement('button');
    tap.className = 'plain-btn glass-tap'; tap.textContent = '두드려 보기'; tap.setAttribute('aria-label', '두드려 보기');
    tap.style.cssText = 'left:650px;top:620px;width:300px;height:70px';
    tap.onclick = (e) => {
      e.stopPropagation(); if (game.busy) return;
      if (f.levels.some((l) => !l)) { api.say('빈 잔은 딱, 하고 둔한 소리만 나. 네 잔 모두 물을 부어야 해.'); return; }
      game.busy = true;
      f.levels.forEach((l, i) => game.after(i * 420, () => { if (window.Sfx && window.Sfx.tone) window.Sfx.tone(330 + (5 - l) * 110, 0.5); if (box.children[i]) box.children[i].classList.add('ring'); }));
      game.after(f.levels.length * 420 + 300, () => {
        game.busy = false;
        [...box.querySelectorAll('.ring')].forEach((x) => x.classList.remove('ring'));
        if (same(f.levels, WATER)) {
          f.cabinetOpen = true; game.save(); api.sfx('unlock');
          api.say('띵— 딩— 띠잉— 딩. 창에 그려진 새들의 노래야! 찰칵, 유리문 찻장이 저절로 열렸어.', 5200);
          game.s.zoom = null; game.render();
        } else if (same(f.levels, BIRDS)) {
          api.say('새 높이대로 물을 부었는데… 노래가 거꾸로 들려. 높은 새 자리에서 낮은 소리가 나. 물이 많을수록 소리가 낮아지잖아!', 6200);
        } else {
          api.say('띵, 딩, 동… 그냥 아무 소리야. 노래가 되지 않아.', 3600);
        }
      });
    };
    box.appendChild(tap);
  }

  /* ── 차 우리기: 찻주전자는 4잔 들이. 큰 주전자(3잔)·작은 잔(1잔)으로 끓는 물·찬물을 붓는다 ── */
  function brewWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.brew');
    if (f.brewed) { if (box) box.remove(); return; }
    f.pot = f.pot || [];
    f.tool = f.tool || 'jug';
    if (!box) { box = document.createElement('div'); box.className = 'brew'; container.appendChild(box); }
    box.innerHTML = '';
    const amount = f.pot.reduce((a, p) => a + p.n, 0);
    const temp = amount ? Math.round(f.pot.reduce((a, p) => a + p.n * p.t, 0) / amount) : 0;
    const btn = (cls, css, label, fn, img) => {
      const b = document.createElement('button'); b.className = cls; b.style.cssText = css; b.setAttribute('aria-label', label);
      if (img) { const im = document.createElement('img'); im.alt = ''; im.src = game.src(img); b.appendChild(im); } else b.textContent = label;
      b.onclick = (e) => { e.stopPropagation(); if (!game.busy) fn(); }; box.appendChild(b); return b;
    };
    // 따르는 도구
    btn('piece brew-tool' + (f.tool === 'jug' ? ' on' : ''), 'left:150px;top:180px;width:220px;height:220px', '큰 계량 주전자 (3잔)', () => { f.tool = 'jug'; game.save(); brewWidget(container, api, game); }, 'items/jug.webp');
    btn('piece brew-tool' + (f.tool === 'cup' ? ' on' : ''), 'left:180px;top:450px;width:160px;height:160px', '작은 잔 (1잔)', () => { f.tool = 'cup'; game.save(); brewWidget(container, api, game); }, 'items/cup.webp');
    const pour = (t, name) => {
      const n = f.tool === 'jug' ? 3 : 1;
      if (amount + n > POT) { api.say(`${f.tool === 'jug' ? '큰 주전자' : '작은 잔'}로 ${name}을 부으면 찻주전자가 넘쳐. 찻주전자는 네 잔 들이야.`); return; }
      f.pot.push({ n, t }); api.sfx('water'); game.save(); brewWidget(container, api, game);
      const amt = amount + n;
      if (amt === POT) {
        const tt = Math.round((f.pot.reduce((a, p) => a + p.n * p.t, 0)) / POT);
        if (tt === 80) {
          f.brewed = true; game.busy = true; game.save();
          game.after(900, () => { game.busy = false; api.give('tea'); api.sfx('shine'); api.say('온도계 빨간 줄이 넷째 눈금에 딱! 찻잎이 활짝 피어나며 초록빛 차가 우러났어. 한 잔 따랐어.', 5600); game.s.zoom = null; game.save(); game.render(); });
        } else if (tt > 80) api.say('김이 펄펄. 너무 뜨거워서 찻잎이 타 버리겠어. 맛이 쓸 거야.');
        else api.say('미지근해서 찻잎이 안 풀려. 맹맹한 맛일 거야.');
      }
    };
    btn('piece brew-src', 'left:1180px;top:170px;width:260px;height:260px', '화로의 끓는 물', () => pour(HOT, '끓는 물'), 'items/kettle.webp');
    btn('piece brew-src', 'left:1180px;top:460px;width:260px;height:260px', '국자의 찬물', () => { if (!api.has('ladle')) { api.say('찬물이 없어. 동쪽 항아리에서 국자로 떠 와야 해.'); return; } pour(COLD, '찬물'); }, 'items/ladle.webp');
    // 찻주전자와 온도계
    const pot = document.createElement('div'); pot.className = 'brew-pot'; pot.style.cssText = 'left:520px;top:230px;width:420px;height:420px';
    const pim = document.createElement('img'); pim.alt = ''; pim.src = game.src('items/teapot.webp'); pot.appendChild(pim);
    const lv = document.createElement('div'); lv.className = 'brew-level'; lv.textContent = '●'.repeat(amount) + '○'.repeat(POT - amount); lv.setAttribute('aria-label', `찻주전자 ${amount}잔`); pot.appendChild(lv);
    box.appendChild(pot);
    const th = document.createElement('div'); th.className = 'thermo'; th.style.cssText = 'left:990px;top:180px;width:70px;height:480px'; th.setAttribute('aria-label', '온도계');
    for (let k = 1; k <= 5; k++) { const tick = document.createElement('i'); tick.style.bottom = (k * 16) + '%'; th.appendChild(tick); }
    const fill = document.createElement('b'); fill.style.height = amount ? (temp / 100) * 80 + '%' : '0'; th.appendChild(fill);
    box.appendChild(th);
    btn('plain-btn brew-empty', 'left:560px;top:690px;width:340px;height:64px', '찻주전자 비우기', () => { f.pot = []; api.sfx('splash'); game.save(); brewWidget(container, api, game); });
  }

  function dalleTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true; api.lock(5600);
      api.say('달래: “어서 와요… 미안해요, 차를 못 내드려요. 이 찻집 밑으로 흐르던 샘이 말라 버렸거든요.”', 5600, { who: 'dalle' });
      api.after(5600, () => api.say('달래: “제대로 우린 차 한 잔만 마셔도 기운이 날 텐데… 찻잎은 노래로 잠기는 찻장에 있어요. 노래가 뭐였더라.”', 6400, { who: 'dalle', note: '달래의 부탁' }));
      return;
    }
    if (f.doorOpen) { api.say('달래: “물이 다시 흘러요. 다음 쪽은… 별빛이 꺼지고 있대요.”', 0, { who: 'dalle' }); return; }
    if (f.served) { api.say('달래: “찻잔 바닥에 남은 찻잎 모양, 봤어요? 옛날엔 그걸로 물건 둔 자리를 점쳤대요.”', 0, { who: 'dalle' }); return; }
    if (f.cabinetOpen) { api.say('달래: “이 찻잎은 너무 뜨거운 물을 싫어해요. 통에 적힌 대로 맞춰 주세요.”', 0, { who: 'dalle' }); return; }
    if (f.fogged) { api.say('달래: “창에 새 그림! 그 노래였어요. 물잔으로 치면 열리는데… 저는 늘 높고 낮은 게 헷갈렸어요.”', 0, { who: 'dalle' }); return; }
    api.say('달래: “찻장 노래는 제가 김 서린 창에 손가락으로 적어 뒀는데… 주전자가 말라서 김이 안 나요.”', 0, { who: 'dalle' });
  }

  Engine.registerRoom({
    id: 'teahouse',
    chapter: '12장',
    title: '김 서린 찻집',
    assets: 'assets/rooms/teahouse/',
    sky: ['assets/rooms/teahouse/bg/north.webp', 'assets/rooms/teahouse/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 40,
    isLit: () => true,
    ambient: (s) => (F(s).doorOpen ? 'sea' : 'night'),
    guide: { name: '수달 달래', img: 'assets/rooms/teahouse/props/dalle_tired.webp' },
    intro: '통로를 지나자 하얀 김이 자욱한 찻집이야. 그런데 이상해… 찻주전자들이 모두 바싹 말라 있어.',

    repair(s, fix) {
      const f = s.flags;
      if (f.brewed && !f.served && !s.inv.includes('tea')) fix.give('tea');
      if (f.flowed && !f.doorOpen) f.doorOpen = true;
    },

    items: {
      ladle: { name: '찬물 담은 국자', img: 'items/ladle.webp', desc: '물항아리에서 뜬 찬물이 국자 가득. 흘리지 않게 조심조심.' },
      tin: { name: '찻잎 통', img: 'items/tin.webp', desc: '동그란 찻잎 통. 라벨에 찻잎과 온도계 그림.' },
      tea: { name: '우린 차', img: 'items/tea.webp', desc: '알맞게 우린 초록빛 차 한 잔.' },
      spring: { name: '샘물 병', img: 'items/spring.webp', desc: '코르크 마개를 한 작은 병. 반짝이는 샘물이 찰랑여.' },
    },
    combos: [
      { a: 'ladle', b: 'tin', say: '찬물에 찻잎을 넣어 봤자 안 우러나.' },
      { a: 'spring', b: 'tea', say: '아까운 샘물을 차에 섞을 순 없어.' },
      { a: 'spring', b: 'ladle', say: '샘물은 보통 물이랑 섞으면 안 될 것 같아.' },
    ],

    views: {
      /* ───── 북쪽: 계산대, 숯 화로와 구리 주전자, 큰 유리창 ───── */
      north: {
        name: '계산대',
        bg: (s) => (F(s).fogged ? 'bg/north_fog.webp' : 'bg/north.webp'),
        objects: [
          {
            id: 'brazier', x: 0, y: 0, w: 0, h: 0, img: '', hit: [640, 380, 310, 225], label: '화로 위 구리 주전자',
            click: (api) => api.say(api.flags.boiled ? '주전자가 펄펄 끓어. 하얀 김이 뒤쪽 창으로 피어올라.' : '숯불 위 구리 주전자. 들어 보니 텅 비었어. 바닥이 달궈져 따끈해.'),
            use: {
              ladle: (api) => {
                if (api.flags.boiled) { api.say('주전자엔 물이 충분해.'); return; }
                api.take('ladle'); api.set('boiled'); api.set('fogged'); api.sfx('water');
                api.note('김 서린 창의 그림', '나뭇가지 위 새 네 마리. 왼쪽부터: 조금 높음, 가장 낮음, 가장 높음, 조금 낮음.');
                api.say('국자의 찬물을 주전자에 부었어. 보글보글… 금세 끓어올라 하얀 김이 바로 뒤 유리창에 서리기 시작했어.', 5200);
                api.after(5200, () => api.say('어? 김 서린 유리에 손가락으로 그린 그림만 또렷하게 떠올랐어! 나뭇가지 위 새 네 마리야.', 5200));
              },
            },
          },
          {
            id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [580, 120, 440, 255], label: '큰 유리창',
            click: (api) => api.say(api.flags.fogged ? '하얗게 김 서린 유리에 손가락 그림이 떠올랐어. 나뭇가지 위 새 네 마리, 앉은 높이가 다 달라.' : '차갑고 까만 유리창. 손을 대니 얼음처럼 차가워. 유리에 희미한 손자국 같은 게 있어.'),
            use: { ladle: (api) => api.say('창에 물을 끼얹어 봤자 흘러내릴 뿐이야. 김처럼 고르게 서려야 해.') },
          },
          {
            id: 'tray', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1035, 500, 240, 115], label: '찻주전자 쟁반',
            click: (api) => {
              const f = api.flags;
              if (f.brewed) { api.say('찻주전자가 비었어. 차는 내가 한 잔 따라 뒀어.'); return; }
              if (!f.tinTaken || !f.toolsTaken) { api.say('빈 찻주전자들. 찻잎도 계량 도구도 없어.'); return; }
              if (!f.boiled) { api.say('찻잎은 있는데, 끓는 물이 없어.'); return; }
              api.zoom('brew');
            },
            use: { tin: (api) => (api.flags.boiled && api.flags.toolsTaken ? api.zoom('brew') : api.say('찻잎만으론 안 돼. 끓는 물과 계량 도구가 있어야 해.')) },
          },
          { id: 'shelvesL', x: 0, y: 0, w: 0, h: 0, img: '', hit: [210, 190, 300, 320], label: '찻그릇 선반', look: '청자 찻주전자와 찻사발이 줄지어 있어. 모두 바싹 말라 있어.' },
          { id: 'shelvesR', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1095, 180, 290, 300], label: '구리 찻그릇 선반', look: '구리 주전자와 찻사발. 먼지만 소복해.' },
        ],
      },

      /* ───── 동쪽: 물잔 네 개, 유리문 찻장, 물항아리 ───── */
      east: {
        name: '찻장',
        bg: (s) => (F(s).cabinetOpen ? 'bg/east_open.webp' : 'bg/east.webp'),
        objects: [
          { id: 'glasses', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 300, 460, 220], label: '물잔 네 개', click: (api) => (api.flags.cabinetOpen ? api.say('물잔들이 맑게 반짝여. 노래는 이미 끝났어.') : api.zoom('glasses')) },
          {
            id: 'cabinet', x: 0, y: 0, w: 0, h: 0, img: '', hit: [620, 120, 380, 560], label: '유리문 찻장',
            click: (api, n) => {
              const f = api.flags;
              if (!f.cabinetOpen) { api.say('유리문 찻장이 잠겨 있어. 열쇠 구멍 대신 작은 종 모양 자물쇠… 소리로 여는 건가 봐.'); return; }
              if (!f.tinTaken) { f.tinTaken = true; api.give('tin', n); api.sfx('pick'); api.zoom('tinlabel'); return; }
              if (!f.toolsTaken) { f.toolsTaken = true; api.sfx('pick'); api.say('큰 계량 주전자(세 잔 들이)와 작은 잔(한 잔 들이)도 챙겼어. 차는 북쪽 계산대 찻주전자에서 우리자.'); return; }
              api.say('찻장이 비었어.');
            },
          },
          {
            id: 'jar', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1150, 300, 360, 420], label: '물항아리',
            click: (api, n) => {
              if (api.has('ladle')) { api.say('국자엔 이미 찬물이 가득해.'); return; }
              api.give('ladle', n); api.sfx('water'); api.say('걸려 있던 국자로 찬물을 한가득 떴어. 얼음처럼 차가워.');
            },
          },
        ],
      },

      /* ───── 남쪽: 물얼룩 지도가 남은 탁자, 달래 ───── */
      south: {
        name: '물얼룩 탁자',
        bg: (s) => (F(s).flowed ? 'bg/south_wet.webp' : 'bg/south.webp'),
        objects: [
          { id: 'table', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 420, 900, 380], label: '물얼룩 지도', click: (api) => api.zoom('map') },
          {
            id: 'dalle', img: (s) => `props/${F(s).doorOpen ? 'dalle_happy' : F(s).served ? 'dalle_surprised' : 'dalle_tired'}.webp`, x: 1150, y: 360, w: 420, h: 300, cls: 'bob', hit: [1250, 370, 220, 280], label: '수달 달래',
            click: dalleTalk,
            use: {
              tea: (api) => { api.take('tea'); api.set('served'); api.sfx('shine'); api.say('달래: “아아… 이 맛이에요!” 달래가 차를 호로록 비우고 빈 찻잔을 내밀었어. 바닥에 찻잎이 몇 장 붙어 있어.', 5600, { who: 'dalle' }); api.after(1800, () => api.zoom('leaves')); },
              ladle: (api) => api.say('달래: “맹물보다는… 차가 좋아요.”', 0, { who: 'dalle' }),
              tin: (api) => api.say('달래: “찻잎을 그냥 씹을 순 없잖아요.”', 0, { who: 'dalle' }),
              spring: (api) => api.say('달래: “그건 마시는 물이 아니에요. 샘이 마른 자리에 돌려줘야 해요.”', 0, { who: 'dalle' }),
            },
            wrong: '달래: “음… 그건 차가 아니잖아요.”',
          },
        ],
      },

      /* ───── 서쪽: 그림 서랍 12칸, 둥근 문 ───── */
      west: {
        name: '찻잎 서랍장',
        bg: (s) => (F(s).doorOpen ? 'bg/west_open.webp' : 'bg/west.webp'),
        objects: [
          ...DRAWERS.map((d, i) => ({
            id: 'drawer_' + d, x: 0, y: 0, w: 0, h: 0, img: '', hit: [90 + (i % 4) * 150, 180 + Math.floor(i / 4) * 150, 140, 140], label: `${DNAME[d]} 서랍`,
            click: (api, n) => {
              if (d !== 'fish') { api.say(`${DNAME[d]} 그림 서랍. 말린 찻잎만 가득해.`); return; }
              if (api.flags.springTaken) { api.say('물고기 서랍. 이제 비었어.'); return; }
              api.set('springTaken'); api.give('spring', n); api.sfx('unlock');
              api.say('물고기 그림 서랍 안에 작은 병이 누워 있었어. 반짝이는 샘물이 찰랑찰랑!');
            },
          })),
          { id: 'door', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1000, 150, 420, 620], label: '둥근 문', click: (api) => { if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; } api.sfx('locked'); api.say('둥근 나무 문. 쇠고리를 당겨도 꼼짝 안 해. 문틈이 바싹 말라 쩍쩍 갈라졌어.'); } },
        ],
      },
    },

    zooms: {
      glasses: { bg: 'zoom/glass_bg.webp', note: ['물잔 네 개', '잔을 누르면 물이 한 칸씩 늘어난다. 두드리면 소리가 난다.'], widget: glassWidget },
      tinlabel: { bg: 'zoom/tinlabel.webp', note: ['찻잎 통 라벨', '찻잎 그림 옆에 온도계. 다섯 눈금 중 아래에서 넷째까지 빨간 줄.'] },
      brew: { bg: 'zoom/brew_bg.webp', note: ['차 우리기', '찻주전자는 네 잔 들이. 큰 계량 주전자는 세 잔, 작은 잔은 한 잔.'], widget: brewWidget },
      leaves: { bg: 'zoom/leaves.webp', note: ['찻잔 바닥의 찻잎', '젖은 찻잎이 물고기 모양으로 붙어 있다.'] },
      map: {
        bg: (s) => (F(s).flowed ? 'zoom/map_wet.webp' : 'zoom/map_dry.webp'),
        note: ['물얼룩 지도', '맨 위 산, 가운데 호수, 왼쪽 바위, 오른쪽 나무, 맨 아래 작은 둥근 문. 마른 물길이 산에서부터 아래로 이어져 있다.'],
        objects: [
          ...[['mountain', '산', [690, 40, 220, 170]], ['lake', '호수', [680, 360, 240, 170]], ['rock', '바위', [240, 330, 200, 180]], ['tree', '나무', [1160, 320, 200, 200]], ['mdoor', '작은 문', [700, 700, 200, 150]]].map(([id, name, hit]) => ({
            id: 'map_' + id, x: 0, y: 0, w: 0, h: 0, img: '', hit, label: '지도의 ' + name,
            click: (api) => api.say(`마른 물얼룩으로 그린 ${name}.`),
            use: {
              spring: (api) => {
                const f = api.flags;
                if (f.flowed) { api.say('물은 이미 문까지 흘러.'); return; }
                if (id !== 'mountain') { api.sfx('splash'); api.say(`${name}에 한 방울 떨어뜨렸어. 물이 아래쪽으로만 조금 번지다 멈췄어. 위쪽 물길은 바싹 마른 그대로야.`); return; }
                api.take('spring'); api.set('flowed'); api.set('doorOpen'); api.sfx('water'); api.burst('bubble', 800, 200, 30);
                api.say('산꼭대기에 샘물을 똑. 물이 마른 물길을 따라 아래로아래로 흘러 호수를 채우고, 작은 문까지 닿았어! 서쪽에서 물소리가 들려.', 6200);
              },
              ladle: (api) => api.say('보통 물을 부으면 얼룩만 번져서 지도가 망가질 거야.'),
            },
          })),
        ],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.doorOpen) return { key: 'go', steps: ['물이 다시 흘러요! 어딘가 열렸어요.', '서쪽 둥근 문이에요.', '서쪽 둥근 문을 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['찻집 주인을 찾아봐요.', '남쪽 탁자 옆에 누가 있어요.', '남쪽 수달 달래를 누르세요.'] };
      if (has('spring')) return { key: 'drop', steps: ['샘물을 마른 물얼룩 지도에 돌려줘요. 어디에 떨어뜨려야 물길 전체가 이어질까요?', '물은 높은 곳에서 낮은 곳으로 흘러요.', '남쪽 지도를 열고, 샘물 병을 고른 채 맨 위 산을 누르세요.'] };
      if (f.served) return { key: 'drawer', steps: ['찻잔 바닥에 남은 찻잎 모양을 기억해요.', '서쪽 서랍마다 그림이 있어요. 찻잎 모양과 같은 그림은?', '서쪽 물고기 서랍을 누르세요.'] };
      if (has('tea')) return { key: 'serve', steps: ['차를 마셔야 할 분이 있어요.', '남쪽 달래예요.', '우린 차를 고른 채 달래를 누르세요.'] };
      if (!f.cabinetOpen) {
        if (!f.fogged) {
          if (!has('ladle')) return { key: 'water', steps: ['달래는 찻장 노래를 김 서린 창에 적어 뒀대요. 김을 만들어야 해요. 북쪽 주전자가 비어 있어요.', '물은 동쪽 큰 물항아리에 있어요.', '동쪽 물항아리를 눌러 국자로 찬물을 뜨세요.'] };
          return { key: 'boil', steps: ['주전자에 물을 부어 끓여요.', '북쪽 화로 위 구리 주전자예요. 바로 뒤가 유리창이죠.', '찬물 담은 국자를 고른 채 북쪽 주전자를 누르세요.'] };
        }
        return { key: 'glass', steps: ['창의 새 네 마리 높이가 노래예요. 동쪽 물잔 네 개로 쳐 봐요.', '물이 많을수록 소리가 낮아요. 그러니 높은 새는 물을 적게.', '왼쪽부터 물을 2칸, 4칸, 1칸, 3칸 붓고 두드려 보세요.'] };
      }
      if (!f.tinTaken) return { key: 'tin', steps: ['찻장이 열렸어요.', '동쪽 찻장 안을 보세요.', '동쪽 유리문 찻장을 누르세요.'] };
      if (!f.toolsTaken) return { key: 'tools', steps: ['찻장에 계량 도구가 더 있어요.', '동쪽 찻장이에요.', '동쪽 찻장을 한 번 더 누르세요.'] };
      if (!has('ladle')) return { key: 'cold', steps: ['차 온도를 맞추려면 찬물도 있어야 해요.', '동쪽 물항아리예요.', '동쪽 물항아리를 눌러 찬물을 뜨세요.'] };
      return { key: 'brew', steps: ['찻잎 통 라벨의 온도계를 보세요. 다섯 눈금 중 넷째, 80도예요. 북쪽 찻주전자 쟁반에서 우려요.', '끓는 물은 100도, 찬물은 20도. 찻주전자는 네 잔 들이예요.', '큰 계량 주전자로 끓는 물 3잔, 작은 잔으로 찬물 1잔을 부으세요.'] };
    },

    ending: {
      title: '물이 돌아온 찻집',
      text: ['둥근 문 너머로 얕고 반짝이는 물길이 이어져 있었어요. 찻집의 마른 찻주전자들에서도 보글보글 소리가 났지요.', '달래가 김이 오르는 찻잔을 높이 들었어요. “고마워요. 물이 다시 흘러요!”', '그런데 물길 끝 하늘이 이상했어요. 별이… 하나씩 꺼지고 있었어요.'],
      next: '3편 · 13장 「태엽 천문대」는 만드는 중이에요',
      image: 'assets/rooms/teahouse/bg/west_open.webp',
    },
  });
})();
