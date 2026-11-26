/* 11장 「한밤의 제본소」 (3편 「종이의 뒷면」 첫 장 · 어른 난이도)
 * 책의 뒷면 세계. 나방 제본사 모리의 실이 다 떨어져, 뒷면 세계를 묶어 두는 실이 풀리고 있다.
 * 새 책 한 권을 처음부터 제본해야 한다. 두 갈래가 마지막에 합쳐진다.
 *  갈래 가 — 책 몸통: 빨랫줄 접장 6묶음 → (북 가죽 책 등의 '계단 표시'를 보고) 꿰매기 틀에서 순서 맞추기
 *            실: 서 대들보의 빈 고치(손이 안 닿음) ← 동 바구니의 창문 갈고리 막대
 *            밀랍: 비단실은 미끄러움 → 북 작업대 밀랍에 문지르기 (모리: 옛 제본사는 꿀벌이 만든 걸로…)
 *            바늘: 남 고슴도치 바늘꽂이 핀 7개 중 귀가 있는 것 하나 → 실 꿴 바늘 → 틀에서 꿰매기
 *  갈래 나 — 표지: 북 두루마리 바구니의 백지 표지 → 남 풀무로 동쪽 창의 구름을 밀어내기(빨랫줄을 먼저 걷어야 함)
 *            → 달빛에 비춰 비침 무늬(나방 하나, 그 아래 별 셋) → 남 활자판: 활자는 거울 글씨라 오른쪽부터 놓아야 바로 찍힘
 *            → 활자를 난로에 데워 금박 위에 찍기 (차가운 활자는 금박이 안 붙음)
 *  합류 — 책 몸통 + 표지 → 북 책 누르개(손잡이가 없음 → 남 서랍장 밑에 굴러간 T자 손잡이) → 모리가 실을 이어 서쪽 책장이 열림
 */
(function () {
  const F = (s) => s.flags;
  const SIG_START = [3, 6, 1, 5, 2, 4]; // 빨랫줄에 널린 순서 (숫자 = 등의 표시가 위에서 몇 번째 높이인지)
  const TYPES = ['moth', 'star', 'moon', 'book', 'key', 'feather', 'candle', 'leaf', 'spiral', 'crown', 'fish', 'bell'];
  const TNAME = { moth: '나방', star: '별', moon: '달', book: '책', key: '열쇠', feather: '깃털', candle: '촛불', leaf: '잎', spiral: '소용돌이', crown: '왕관', fish: '물고기', bell: '종' };
  const TITLE = ['moth', 'star', 'star', 'star']; // 비침 무늬: 나방 하나, 그 아래 별 셋 (읽는 순서)
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  /* ── 꿰매기 틀: 접장 여섯 묶음의 순서 맞추기 (둘을 차례로 누르면 자리가 바뀐다) ── */
  function frameWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.sig-row');
    if (f.collated) { if (box) box.remove(); return; }
    f.sigOrder = f.sigOrder || SIG_START.slice();
    if (!box) { box = document.createElement('div'); box.className = 'sig-row'; container.appendChild(box); }
    box.innerHTML = '';
    f.sigOrder.forEach((r, i) => {
      const b = document.createElement('button');
      b.className = 'piece sig' + (f.sigPick === i ? ' picked' : '');
      b.style.cssText = `left:${225 + i * 200}px;top:200px;width:150px;height:474px`;
      b.dataset.rank = r;
      b.setAttribute('aria-label', `접장 ${i + 1}번째 자리`);
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`props/sig_${r}.webp`); b.appendChild(im);
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        if (f.sigPick == null) { f.sigPick = i; api.sfx('tap'); game.save(); frameWidget(container, api, game); return; }
        const j = f.sigPick; f.sigPick = null;
        if (j !== i) { [f.sigOrder[i], f.sigOrder[j]] = [f.sigOrder[j], f.sigOrder[i]]; api.sfx('scrape'); }
        game.save(); frameWidget(container, api, game);
        if (same(f.sigOrder, [1, 2, 3, 4, 5, 6])) {
          f.collated = true; game.busy = true; game.save();
          setTimeout(() => {
            game.busy = false; api.sfx('unlock');
            api.say('검은 네모가 왼쪽 위에서 오른쪽 아래로 계단처럼 이어졌어. 가죽 책 등이랑 똑같아! 접장을 틀에 차례로 걸었어.', 5200);
            game.s.zoom = null; game.save(); game.render();
          }, 500);
        } else if (same(f.sigOrder, [6, 5, 4, 3, 2, 1])) {
          api.say('계단 모양이긴 한데 거꾸로 올라가. 가죽 책 등에선 첫 묶음 표시가 맨 위였어.', 4200);
        }
      };
      box.appendChild(b);
    });
  }

  /* ── 활자판: 조판 막대 네 칸에 활자를 놓고 시험 찍기. 활자는 거울 글씨라 찍으면 좌우가 뒤집혀 나온다 ── */
  function typeWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.type-desk');
    if (f.typeSet) { if (box) box.remove(); return; }
    f.stick = f.stick || [];
    if (!box) { box = document.createElement('div'); box.className = 'type-desk'; container.appendChild(box); }
    box.innerHTML = '';
    const add = (cls, css, label, onclick, img) => {
      const b = document.createElement('button');
      b.className = cls; b.style.cssText = css; b.setAttribute('aria-label', label);
      if (img) { const im = document.createElement('img'); im.alt = ''; im.src = game.src(img); b.appendChild(im); }
      b.onclick = (e) => { e.stopPropagation(); if (!game.busy) onclick(); };
      box.appendChild(b); return b;
    };
    // 조판 막대 (활자 면을 보고 있다: 그림이 거울처럼 뒤집혀 보인다)
    const stick = document.createElement('div'); stick.className = 'type-stick'; stick.style.cssText = 'left:440px;top:96px;width:720px;height:190px'; box.appendChild(stick);
    for (let i = 0; i < 4; i++) {
      const t = f.stick[i];
      add('piece type-slot', `left:${465 + i * 172}px;top:112px;width:160px;height:160px`, t ? `조판 ${i + 1}칸: ${TNAME[t]} (빼기)` : `조판 ${i + 1}칸: 비어 있음`,
        () => { if (!t) return; f.stick.splice(i, 1); api.sfx('clink'); game.save(); typeWidget(container, api, game); }, t ? `props/type_${t}.webp` : '');
    }
    // 시험 찍은 종이
    if (f.proof) {
      const pr = document.createElement('div'); pr.className = 'type-proof'; pr.style.cssText = 'left:500px;top:300px;width:600px;height:120px'; pr.setAttribute('aria-label', '시험 찍은 종이');
      f.proof.forEach((t) => { const im = document.createElement('img'); im.alt = TNAME[t]; im.src = game.src(`props/print_${t}.webp`); pr.appendChild(im); });
      box.appendChild(pr);
    }
    // 활자 상자 (12가지, 서랍에 여러 벌)
    TYPES.forEach((t, k) => {
      add('piece type-pick', `left:${330 + (k % 6) * 160}px;top:${440 + Math.floor(k / 6) * 148}px;width:132px;height:132px`, `${TNAME[t]} 활자`,
        () => { if (f.stick.length >= 4) { api.say('조판 막대는 네 칸뿐이야. 빼고 싶은 활자를 눌러서 빼자.'); return; } f.stick.push(t); f.proof = null; api.sfx('clink'); game.save(); typeWidget(container, api, game); }, `props/type_${t}.webp`);
    });
    add('plain-btn type-btn', 'left:1210px;top:120px;width:250px;height:64px', '시험 찍기', () => {
      if (f.stick.length < 4) { api.say('네 칸을 다 채워야 찍을 수 있어.'); return; }
      const printed = f.stick.slice().reverse();
      f.proof = printed; api.sfx('dial'); game.save(); typeWidget(container, api, game);
      if (same(printed, TITLE)) {
        f.typeSet = true; f.stick = []; game.busy = true; game.save();
        setTimeout(() => {
          game.busy = false; api.give('typeset'); api.sfx('unlock');
          api.say('찍힌 그림: 나방, 별, 별, 별. 표지 종이 속 무늬랑 똑같아! 조판한 활자를 통째로 챙겼어.', 5200);
          game.s.zoom = null; game.save(); game.render();
        }, 900);
      } else if (same(f.stick, TITLE)) {
        api.say('어? 찍어 보니 별 셋이 먼저 나오고 나방이 맨 끝이야. 열쇠 같은 그림은 좌우도 뒤집혀 찍히고… 활자는 도장처럼 거꾸로 찍히는구나!', 6600);
      } else {
        api.say('찍힌 그림: ' + printed.map((t) => TNAME[t]).join(', ') + '.', 4200);
      }
    }).textContent = '시험 찍기';
    add('plain-btn type-btn', 'left:1210px;top:200px;width:250px;height:64px', '모두 빼기', () => { f.stick = []; f.proof = null; api.sfx('clink'); game.save(); typeWidget(container, api, game); }).textContent = '모두 빼기';
  }

  function moriTalk(api) {
    const f = api.flags, has = api.has;
    if (!f.talked) {
      f.talked = true;
      api.lock(5600);
      api.say('모리: “아, 손님… 저는 이 제본소의 나방 제본사 모리예요. 큰일이에요. 뒷면 세계를 묶어 두는 실이 풀리고 있어요.”', 5600, { who: 'mori' });
      api.after(5600, () => api.say('모리: “새 책을 한 권 꿰매서 실을 다시 이어야 해요. 그런데 제 실은… 다 써 버렸어요. 접장은 빨랫줄에 널어 둔 채 순서가 뒤죽박죽이고요.”', 6600, { who: 'mori', note: '모리의 부탁' }));
      return;
    }
    if (f.moriDone) { api.say('모리: “실이 다시 이어졌어요. 다음 쪽은… 물이 마르고 있어요.”', 0, { who: 'mori' }); return; }
    if (f.pressed) {
      f.moriDone = true; f.opened = true;
      api.lock(5000); api.sfx('door'); api.flash('#fff1c4', 1400); api.burst('spark', 1130, 560, 40);
      api.say('모리가 날개를 활짝 펴자, 새 책 등의 비단실이 반짝이며 서쪽 책장으로 길게 뻗어 나갔어! 어디선가 책장이 끼익— 하고 움직이는 소리.', 6000);
      api.after(5000, () => api.say('모리: “실이 다시 이어졌어요. 다음 쪽은… 물이 마르고 있어요. 서쪽 책장 뒤로 가 보세요.”', 6000, { who: 'mori' }));
      return;
    }
    if (has('book')) { api.say('모리: “아직 표지가 들떠 있어요. 책 누르개로 하룻밤… 아니, 꾹 한 번이면 돼요.”', 0, { who: 'mori' }); return; }
    if (f.sewn) { api.say('모리: “책 몸통이 생겼어요! 이제 표지가 있어야 해요. 그 책의 이름은… 표지 종이 속에 숨겨 뒀었는데, 어두우면 안 보여요.”', 0, { who: 'mori' }); return; }
    if (has('silk')) { api.say('모리: “제 고치 실이네요! 그대로는 미끄러워서 꿰맬 수 없어요. 옛날 제본사들은 꿀벌이 만든 걸로 실을 문질렀대요.”', 0, { who: 'mori' }); return; }
    if (!f.silkTaken) { api.say('모리: “실이 없어요… 저는 원래 고치에서 나왔는데, 제 빈 고치가 어디 있더라.”', 0, { who: 'mori' }); return; }
    api.say('모리: “접장은 페이지 번호가 없어요. 대신 등에 작은 표시가 있죠.”', 0, { who: 'mori' });
  }

  function pressBook(api) {
    if (!api.has('thandle')) { api.say('책을 넣었는데 나사를 돌릴 손잡이가 없어. 위쪽 네모 구멍에 끼울 긴 손잡이가 필요해.'); return; }
    api.take('book'); api.take('thandle'); api.set('pressed');
    api.sfx('creak'); api.burst('dust', 430, 470, 18);
    api.say('책을 누르개에 넣고, 쇠 손잡이를 나사 구멍에 끼워 끝까지 돌렸어. 끼익… 꾹! 들떠 있던 표지가 단단하게 붙었어. 모리에게 알려 주자.', 5600);
  }

  Engine.registerRoom({
    id: 'bindery',
    chapter: '11장',
    title: '한밤의 제본소',
    assets: 'assets/rooms/bindery/',
    sky: ['assets/rooms/bindery/bg/north.webp', 'assets/rooms/bindery/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 40, // 3편: 어른 난이도. 힌트는 천천히
    isLit: () => true,
    ambient: (s) => (F(s).opened ? 'night' : 'attic'),
    guide: { name: '나방 모리', img: 'assets/rooms/bindery/props/mori_worried.webp' },
    intro: '할머니 책 마지막 장 뒤쪽에서 잉크가 거꾸로 배어 나왔어. 손을 대자… 촛불 냄새 나는 다락 제본소야. 여기가 책의 뒷면?',

    repair(s, fix) {
      const f = s.flags;
      if (f.moriDone && !f.opened) f.opened = true;
      if (f.typeSet && !f.heated && !s.inv.includes('typeset') && !s.inv.includes('hottype') && !f.titled) fix.give('typeset');
    },

    items: {
      sigs: { name: '접장 여섯 묶음', img: 'items/sigs.webp', desc: '반으로 접은 종이 묶음 여섯 개. 페이지 번호가 하나도 없어. 등마다 작은 검은 네모가 하나씩.' },
      hook: { name: '갈고리 막대', img: 'items/hook.webp', desc: '끝이 굽은 긴 쇠막대. 높은 창을 여닫을 때 쓰는 거야.' },
      silk: { name: '비단실', img: 'items/silk.webp', desc: '고치에서 풀어낸 반짝이는 비단실. 손가락 사이로 스르르 미끄러져.' },
      waxsilk: { name: '밀랍 먹인 실', img: 'items/waxsilk.webp', desc: '밀랍에 문질러 뻣뻣하고 매끈해진 비단실. 엉키지도 미끄러지지도 않아.' },
      needle: { name: '바늘', img: 'items/needle.webp', desc: '끝에 길쭉한 귀가 뚫린 제본용 바늘.' },
      threaded: { name: '실 꿴 바늘', img: 'items/threaded.webp', desc: '밀랍 먹인 비단실을 꿴 바늘. 이제 꿰맬 수 있어.' },
      textblock: { name: '책 몸통', img: 'items/textblock.webp', desc: '여섯 묶음을 차례로 꿰맨 책 몸통. 표지가 없어서 아직 책이라고 하긴 어려워.' },
      cover: { name: '표지 종이', img: 'items/cover.webp', desc: '아무것도 안 그려진 도톰한 크림색 종이. 촛불에 비춰 보면 결이 살짝 보여.' },
      bellows: { name: '풀무', img: 'items/bellows.webp', desc: '가죽 주름이 달린 바람 풀무. 손잡이를 누르면 휘익 바람이 나와.' },
      goldleaf: { name: '금박', img: 'items/goldleaf.webp', desc: '숨만 쉬어도 날아갈 것 같은 얇디얇은 금박 한 장.' },
      leafcover: { name: '금박 올린 표지', img: 'items/leafcover.webp', desc: '표지 종이 한가운데에 금박을 살짝 얹었어. 아직 붙지는 않았어.' },
      typeset: { name: '조판한 활자', img: 'items/typeset.webp', desc: '조판 막대에 끼운 활자 네 개. 차가운 쇠 냄새.' },
      hottype: { name: '뜨거운 활자', img: 'items/hottype.webp', desc: '난로에 달군 활자. 뜨끈뜨끈해!' },
      titlecover: { name: '제목 찍은 표지', img: 'items/titlecover.webp', desc: '금박으로 나방과 별 셋을 찍은 표지.' },
      book: { name: '새 책', img: 'items/book.webp', desc: '책 몸통에 표지를 감쌌어. 아직 표지가 들떠 있어.' },
      thandle: { name: 'T자 쇠 손잡이', img: 'items/thandle.webp', desc: '굵은 쇠 T자 손잡이. 아래쪽에 네모난 촉이 있어.' },
    },
    combos: [
      { a: 'silk', b: 'needle', say: '비단실이 너무 미끄러워서 바늘귀에 꿰어도 쏙 빠져 버려. 뭔가로 실을 뻑뻑하게 만들어야 해.' },
      { a: 'waxsilk', b: 'needle', result: 'threaded', say: '밀랍 먹인 실은 바늘귀에 착 걸렸어. 실 꿴 바늘 완성!' },
      { a: 'cover', b: 'goldleaf', result: 'leafcover', say: '표지 종이 한가운데에 금박을 살며시 얹었어.' },
      { a: 'typeset', b: 'leafcover', say: '차가운 활자로 꾹 눌렀더니 금박이 하나도 안 붙어. 금박은 뜨겁게 눌러야 붙는대.' },
      { a: 'typeset', b: 'cover', say: '잉크도 금박도 없이 누르니 종이에 자국만 살짝 남아.' },
      { a: 'hottype', b: 'cover', say: '뜨거운 활자를 그냥 누르면 종이가 눌어붙어 갈색 자국만 남을 거야. 금박을 먼저 얹자.' },
      { a: 'hottype', b: 'leafcover', result: 'titlecover', say: '달군 활자를 금박 위에 꾹— 떼어 내니 나방 하나와 별 셋이 반짝반짝 찍혔어!' },
      { a: 'textblock', b: 'cover', say: '이름 없는 표지로 싸면 뒷면 세계가 이 책을 못 알아볼 거야. 모리가 이름은 종이 속에 숨겨 뒀다고 했지.' },
      { a: 'textblock', b: 'leafcover', say: '금박만 얹고 아직 아무것도 안 찍었어. 제목부터 찍자.' },
      { a: 'textblock', b: 'titlecover', result: 'book', say: '책 몸통 등에 풀을 바르고 표지로 감쌌어. 그런데 표지가 자꾸 들떠.' },
      { a: 'silk', b: 'hook', say: '이미 실은 풀어냈어.' },
    ],

    views: {
      /* ───── 북쪽: 제본 작업대 (책 누르개, 꿰매기 틀, 밀랍, 가죽 책, 두루마리 바구니) ───── */
      north: {
        name: '제본 작업대',
        bg: (s) => (F(s).pressed ? 'bg/north_done.webp' : 'bg/north.webp'),
        objects: [
          { id: 'racks', x: 0, y: 0, w: 0, h: 0, img: '', hit: [490, 60, 610, 250], label: '도구 선반', look: '뼈 접칼, 송곳, 풀 붓이 가지런해. 실이나 바늘은 하나도 없어.' },
          { id: 'roundWinN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1130, 30, 330, 340], label: '둥근 창', look: '둥근 창 너머로 지붕들이 보여. 이쪽엔 달이 없어.' },
          { id: 'candleN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1240, 360, 100, 180], label: '촛불', look: '작은 촛불이 일렁여. 촛농이 받침에 고여 있어.' },
          {
            id: 'basketN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 560, 245, 240], label: '두루마리 바구니',
            click: (api, n) => {
              if (api.flags.coverTaken) { api.say('낡은 두루마리들. 글씨가 빽빽해서 표지로는 못 써.'); return; }
              api.set('coverTaken'); api.give('cover', n); api.sfx('pick');
              api.say('글씨 빽빽한 두루마리 사이에서, 아무것도 안 그려진 도톰한 종이 한 장을 찾았어. 표지로 쓰면 딱이겠다.');
            },
          },
          {
            id: 'press', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 265, 290, 280], label: '책 누르개',
            click: (api) => {
              if (api.flags.pressed) { api.say('새 책이 누르개 속에서 꾹 눌려 있어.'); return; }
              api.say('무쇠 책 누르개. 나사 꼭대기에 긴 손잡이를 끼우는 네모 구멍만 비어 있어. 가운데 짧은 놋쇠 막대로는 힘이 하나도 안 들어가.', 5600);
            },
            use: {
              book: (api) => pressBook(api),
              thandle: (api) => api.say('손잡이는 딱 맞겠어. 그런데 누를 책이 아직 없어.'),
              textblock: (api) => api.say('표지도 없이 누르면… 표지를 먼저 씌우자.'),
              titlecover: (api) => api.say('표지만 눌러서 뭐 해. 책 몸통이랑 합쳐야지.'),
            },
          },
          {
            id: 'frame', x: 0, y: 0, w: 0, h: 0, img: '', hit: [630, 340, 230, 200], label: '꿰매기 틀',
            click: (api) => {
              const f = api.flags;
              if (f.sewn) { api.say('틀이 비었어. 책 몸통은 내가 챙겼어.'); return; }
              if (f.sigsOn && !f.collated) { api.zoom('frame'); return; }
              if (f.collated) { api.say('접장 여섯 묶음이 순서대로 걸려 있어. 이제 실 꿴 바늘만 있으면 돼.'); return; }
              api.say('접장을 걸어 꿰매는 나무 틀이야. 세로로 질긴 끈이 다섯 가닥 매여 있어.');
            },
            use: {
              sigs: (api) => { api.take('sigs'); api.set('sigsOn'); api.sfx('pick'); api.zoom('frame'); api.say('접장을 틀 앞에 늘어놓았어. 페이지 번호가 없으니… 순서를 어떻게 알지?', 4600); },
              threaded: (api, n) => {
                if (!api.flags.collated) { api.say('접장 순서부터 맞춰야 해. 뒤죽박죽으로 꿰매면 이야기가 엉켜.'); return; }
                api.take('threaded'); api.set('sewn'); api.give('textblock', n); api.sfx('combine');
                api.say('끈을 감아 돌며 한 묶음씩 꿰맸어. 밀랍 먹인 실이 쓱쓱 잘 나가! 책 몸통 완성.', 5000);
              },
              needle: (api) => api.say('실 없는 바늘로는 못 꿰매.'),
              silk: (api) => api.say('실만으론 꿰맬 수 없어. 바늘이 필요해. 게다가 이 실, 너무 미끄러워.'),
              waxsilk: (api) => api.say('실만으론 꿰맬 수 없어. 바늘에 꿰어야지.'),
            },
          },
          {
            id: 'wax', x: 0, y: 0, w: 0, h: 0, img: '', hit: [875, 470, 120, 75], label: '밀랍 덩어리',
            click: (api) => api.say('꿀 냄새가 나는 노란 밀랍 덩어리. 겉에 가느다란 실 자국이 잔뜩 나 있어.'),
            use: {
              silk: (api) => { api.swap('silk', 'waxsilk'); api.sfx('scrape'); api.say('비단실을 밀랍에 쓱쓱 문질렀어. 실이 뻣뻣하고 매끈해졌어. 이제 안 미끄러지겠다!'); },
              waxsilk: (api) => api.say('이미 밀랍을 충분히 먹였어.'),
            },
          },
          { id: 'leather', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1005, 475, 225, 80], label: '가죽 책', click: (api) => api.zoom('spine') },
        ],
      },

      /* ───── 동쪽: 둥근 창(구름), 접장 빨랫줄, 독서대, 모리 ───── */
      east: {
        name: '둥근 창',
        bg: (s) => (F(s).moon ? 'bg/east_moon.webp' : F(s).sigsTaken ? 'bg/east_empty.webp' : 'bg/east.webp'),
        objects: [
          // 창 왼쪽·오른쪽으로 나눠 잡는다 (가운데는 창)
          ...[['lineL', [220, 215, 410, 250]], ['lineR', [970, 215, 420, 250]]].map(([id, hit]) => ({
            id, x: 0, y: 0, w: 0, h: 0, img: '', hit, label: '빨랫줄의 접장', show: (s) => !F(s).sigsTaken,
            click: (api, n) => { api.set('sigsTaken'); api.give('sigs', n); api.sfx('pick'); api.say('빨랫줄에 널린 접장 여섯 묶음을 걷었어. 바싹 말랐네. 그런데 페이지 번호가 하나도 없어…', 4800); },
          })),
          ...[['lineEmptyL', [220, 200, 410, 90]], ['lineEmptyR', [970, 200, 420, 90]]].map(([id, hit]) => ({ id, x: 0, y: 0, w: 0, h: 0, img: '', hit, label: '빈 빨랫줄', show: (s) => !!F(s).sigsTaken, look: '빨래집게만 남은 빨랫줄.' })),
          {
            id: 'eastWin', x: 0, y: 0, w: 0, h: 0, img: '', hit: [630, 70, 340, 300], label: '동쪽 둥근 창',
            click: (api) => api.say(api.flags.moon ? '커다란 보름달이 창 가득 환해. 은빛 빛줄기가 방 안까지 들어와.' : '두꺼운 먹구름이 달을 꽁꽁 가렸어. 창밖이 어두컴컴해.'),
            use: {
              bellows: (api) => {
                const f = api.flags;
                if (f.moon) { api.say('구름은 이미 멀리 날아갔어.'); return; }
                if (!f.sigsTaken) { api.say('여기서 바람을 일으키면 빨랫줄의 종이 묶음이 다 날아가 버릴 거야. 먼저 걷자.'); return; }
                api.take('bellows'); api.set('moon'); api.sfx('shine'); api.flash('#dfe8ff', 900);
                api.say('창을 활짝 열고 풀무를 힘껏 눌렀어. 휘이익— 종이처럼 가벼운 뒷면 세계의 구름이 밀려나고, 보름달이 떴어!', 5600);
              },
              cover: (api) => {
                if (!api.flags.moon) { api.say('창에 종이를 대 봤는데 구름 때문에 너무 어두워. 아무것도 안 비쳐.'); return; }
                api.set('watermarkSeen'); api.zoom('watermark');
              },
              // 금박을 먼저 올렸어도 막히지 않게: 금박 둘레 맨 종이로도 무늬가 비친다
              leafcover: (api) => {
                if (!api.flags.moon) { api.say('창에 종이를 대 봤는데 구름 때문에 너무 어두워. 아무것도 안 비쳐.'); return; }
                api.set('watermarkSeen'); api.zoom('watermark'); api.say('금박 둘레의 맨 종이 쪽으로 달빛이 비쳐 들어와… 종이 속 무늬가 보여!', 4200);
              },
              titlecover: (api) => { api.set('watermarkSeen'); api.zoom('watermark'); },
              sigs: (api) => api.say('접장은 글씨가 빼곡해서 비춰 봐도 알 수 없어.'),
              hook: (api) => api.say(api.flags.moon ? '창은 이미 열었어.' : '갈고리로 창을 열어 봤자 구름은 그대로야.'),
            },
          },
          { id: 'stand', x: 0, y: 0, w: 0, h: 0, img: '', hit: [640, 510, 310, 290], label: '독서대', look: '책을 펼쳐 놓는 나무 독서대. 비어 있어.' },
          {
            id: 'tableE', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 420, 420, 340], label: '작은 탁자와 촛불',
            click: (api) => api.say('촛불과 솔, 송곳이 놓인 작은 탁자.'),
            use: { cover: (api) => api.say('촛불에 대면 종이가 그을릴 거야. 더 크고 차가운 빛이 필요해.') },
          },
          {
            id: 'basketE', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1280, 550, 260, 260], label: '두루마리 바구니',
            click: (api, n) => {
              if (api.flags.hookTaken) { api.say('두루마리만 남았어.'); return; }
              api.set('hookTaken'); api.give('hook', n); api.sfx('pick');
              api.say('두루마리 사이에 끝이 굽은 긴 쇠막대가 꽂혀 있었어. 높은 창을 여닫을 때 쓰는 갈고리 막대야.');
            },
          },
          {
            id: 'mori', img: (s) => `props/${F(s).moriDone ? 'mori_happy' : F(s).sewn ? 'mori_surprised' : 'mori_worried'}.webp`, x: 900, y: 470, w: 450, h: 320, cls: 'bob', hit: [1010, 480, 230, 310], label: '나방 모리',
            click: moriTalk,
            use: {
              silk: (api) => api.say('모리: “제 고치 실이에요! 그대로는 미끄러워서 바늘이 쏙 빠져요.”', 0, { who: 'mori' }),
              book: (api) => api.say('모리: “아직 표지가 들떠 있어요. 책 누르개로 꾹 눌러 주세요.”', 0, { who: 'mori' }),
              sigs: (api) => api.say('모리: “순서요? 다 쓴 책 등을 보면 알 수 있어요. 제가 만든 가죽 책이 작업대에 있을 거예요.”', 0, { who: 'mori' }),
              cover: (api) => api.say('모리: “그 종이엔 이름이 숨어 있어요. 밝은 빛에 비춰야 보여요.”', 0, { who: 'mori' }),
            },
            wrong: '모리: “그건… 제본에 쓰는 건 아닌 것 같아요.”',
          },
        ],
      },

      /* ───── 남쪽: 활자 서랍장, 풀무, 난로, 금박 책자, 고슴도치 바늘꽂이 ───── */
      south: {
        name: '활자와 금박',
        bg: (s) => (F(s).bellowsTaken ? 'bg/south_nobellows.webp' : 'bg/south.webp'),
        objects: [
          { id: 'drawers', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 300, 600, 380], label: '활자 서랍장', look: '작은 서랍마다 같은 그림 활자가 여러 벌씩 들어 있어. 하나 꺼내 써도 또 있어.' },
          { id: 'typecase', x: 0, y: 0, w: 0, h: 0, img: '', hit: [185, 160, 530, 120], label: '활자 판', click: (api) => api.zoom('typecase') },
          {
            id: 'bellows', x: 0, y: 0, w: 0, h: 0, img: '', hit: [745, 50, 170, 480], label: '풀무', show: (s) => !F(s).bellowsTaken,
            click: (api, n) => { api.set('bellowsTaken'); api.give('bellows', n); api.sfx('pick'); api.say('고리에 걸린 가죽 풀무를 내렸어. 손잡이를 누르니 휘익, 바람이 세다!'); },
          },
          {
            id: 'stove', x: 0, y: 0, w: 0, h: 0, img: '', hit: [960, 340, 240, 320], label: '작은 난로',
            click: (api) => api.say('작은 무쇠 난로 안에서 불씨가 타닥타닥. 위에 놓인 놋쇠 냄비가 뜨끈해.'),
            use: {
              typeset: (api) => { api.swap('typeset', 'hottype'); api.set('heated'); api.sfx('shine'); api.say('조판한 활자를 냄비 위에 올려 달궜어. 손잡이까지 뜨끈뜨끈!'); },
              cover: (api) => api.say('종이를 난로에 대면 타 버려!'),
              leafcover: (api) => api.say('종이를 난로에 대면 타 버려!'),
              waxsilk: (api) => api.say('밀랍이 녹아 버릴 거야.'),
              silk: (api) => api.say('실을 데울 필요는 없어.'),
            },
          },
          {
            id: 'gold', x: 0, y: 0, w: 0, h: 0, img: '', hit: [630, 660, 370, 190], label: '금박 책자',
            click: (api, n) => {
              if (api.flags.goldTaken) { api.say('금박 책자. 남은 금박은 아껴 두자.'); return; }
              api.set('goldTaken'); api.give('goldleaf', n); api.sfx('shine');
              api.say('얇디얇은 금박 한 장을 조심스럽게 떼어 냈어. 숨만 쉬어도 날아갈 것 같아.');
            },
          },
          { id: 'hedgehog', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1060, 620, 290, 220], label: '고슴도치 바늘꽂이', click: (api) => api.zoom('hedgehog') },
          { id: 'candleS', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1360, 430, 170, 350], label: '촛불', look: '촛농이 흘러내린 굵은 초.' },
          { id: 'roundWinS', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1090, 20, 370, 370], label: '둥근 창', look: '이쪽 창으론 지붕만 보여. 달은 반대쪽에 있나 봐.' },
          {
            id: 'thandle', img: 'props/thandle_floor.webp', x: 230, y: 680, w: 140, h: 132, cls: 'under', show: (s) => !F(s).thandleTaken, label: 'T자 쇠 손잡이',
            click: (api, n) => { api.set('thandleTaken'); api.give('thandle', n); api.sfx('clink'); api.say('서랍장 밑 그늘에 굵은 T자 쇠 손잡이가 굴러가 있었어. 아래쪽에 네모난 촉이 달렸네.'); },
          },
        ],
      },

      /* ───── 서쪽: 고치가 매달린 대들보, 실패 선반, 털실, 큰 책장 ───── */
      west: {
        name: '고치 대들보',
        bg: (s) => (F(s).opened ? 'bg/west_open.webp' : 'bg/west.webp'),
        objects: [
          { id: 'roundWinW', x: 0, y: 0, w: 0, h: 0, img: '', hit: [50, 190, 430, 430], label: '작은 둥근 창', look: '창 귀퉁이에 달이 살짝 보여. 하지만 창이 높고 유리가 뿌예서 뭘 비춰 보기는 어렵겠어.' },
          { id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [520, 310, 120, 270], label: '벽 등잔', look: '등잔 불빛에 작은 나방 두 마리가 맴돌아.' },
          { id: 'cocoons', x: 0, y: 0, w: 0, h: 0, img: '', hit: [480, 110, 760, 230], label: '고치들', look: '대들보에 매달린 나방 고치들. 아직 그 안에서 잠들어 있나 봐. 건드리지 말자.' },
          {
            id: 'bigCocoon', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1340, 30, 180, 420], label: '커다란 빈 고치',
            click: (api) => api.say(api.flags.silkTaken ? '실을 풀어낸 빈 고치가 대롱대롱.' : '맨 끝의 커다란 빈 고치에서 반짝이는 비단실이 흘러나와. 너무 높아서 까치발을 해도 손이 안 닿아.'),
            use: {
              hook: (api, n) => {
                if (api.flags.silkTaken) { api.say('실은 이미 풀어냈어.'); return; }
                api.set('silkTaken'); api.give('silk', n); api.sfx('pick');
                api.say('갈고리 끝에 실 끝을 걸어 빙글빙글 감았더니, 고치에서 비단실이 술술 풀려 나왔어!', 4800);
              },
              thandle: (api) => api.say('손잡이는 짧아서 닿지도 않아.'),
            },
          },
          {
            id: 'spools', x: 0, y: 0, w: 0, h: 0, img: '', hit: [70, 620, 410, 140], label: '오래된 실패들',
            click: (api) => api.say('실패에 감긴 실이 너무 오래돼서 손만 대도 툭툭 끊어져. 꿰매는 데는 못 써.'),
          },
          {
            id: 'wool', x: 0, y: 0, w: 0, h: 0, img: '', hit: [478, 640, 150, 130], label: '빨간 털실 뭉치',
            click: (api) => api.say('굵고 포근한 빨간 털실 뭉치.'),
            use: {
              needle: (api) => api.say('털실은 너무 굵어서 바늘귀에 안 들어가.'),
              threaded: (api) => api.say('바늘엔 이미 실을 꿰었어.'),
            },
          },
          {
            id: 'bookcase', x: 0, y: 0, w: 0, h: 0, img: '', hit: [750, 330, 840, 560], label: '큰 책장', show: (s) => !F(s).opened,
            click: (api) => api.say('빽빽한 큰 책장. 책들이 모두 등을 이쪽으로 하고 있는데, 제목이 하나도 없어. 밀어도 꿈쩍 안 해.'),
          },
          {
            id: 'passage', x: 0, y: 0, w: 0, h: 0, img: '', hit: [730, 340, 230, 500], label: '책장 뒤 통로', show: (s) => !!F(s).opened,
            click: (api) => { api.sfx('step'); api.win(); },
          },
        ],
      },
    },

    zooms: {
      spine: {
        bg: 'zoom/spine.webp',
        note: ['가죽 책의 등', '묶음 여섯 개, 묶음마다 작은 검은 네모 하나. 위 묶음부터 아래로 갈수록 오른쪽으로, 계단처럼 비스듬히.'],
        objects: [
          { id: 'spineBody', x: 0, y: 0, w: 0, h: 0, img: '', hit: [540, 90, 540, 760], label: '책 등', look: '모리가 만든 책의 등이야. 묶음마다 찍힌 검은 네모가 위에서 아래로 계단처럼 내려가.' },
          { id: 'waxBowl', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 620, 300, 200], label: '밀랍 그릇', look: '밀랍 부스러기. 실 자국이 나 있어.' },
        ],
      },
      frame: {
        bg: 'zoom/frame_bg.webp',
        note: ['꿰매기 틀', '접장 여섯 묶음. 둘을 차례로 누르면 자리가 바뀐다.'],
        widget: frameWidget,
      },
      hedgehog: {
        bg: (s) => (F(s).needleTaken ? 'zoom/hedgehog_noneedle.webp' : 'zoom/hedgehog.webp'),
        objects: [
          ...[[395, 230], [530, 120], [695, 75], [1048, 115], [1168, 180], [1285, 300]].map(([x, y], i) => ({
            id: 'pin' + i, x: 0, y: 0, w: 0, h: 0, img: '', hit: [x, y, 105, 105], label: '핀',
            click: (api) => api.say('동그란 머리가 달린 핀이야. 귀가 없어서 실을 꿸 수 없어.'),
          })),
          {
            id: 'needlePin', x: 0, y: 0, w: 0, h: 0, img: '', hit: [880, 15, 115, 330], label: '긴 바늘', show: (s) => !F(s).needleTaken,
            click: (api, n) => { api.set('needleTaken'); api.give('needle', n); api.sfx('pick'); api.say('머리 대신 길쭉한 귀가 뚫린 것 하나! 이게 진짜 바늘이야.'); },
          },
        ],
      },
      watermark: {
        bg: 'zoom/watermark.webp',
        note: ['표지 종이의 비침 무늬', '보름달에 비추니 종이 속에서 무늬가 떠올랐다: 나방 하나, 그 아래 별 셋.'],
        objects: [
          { id: 'wmPaper', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 130, 420, 620], label: '비친 종이', look: '빈 종이였는데 달빛에 대니 종이 속에서 나방 하나와 그 아래 별 셋이 떠올라. 모리가 숨겨 둔 책 이름이구나!' },
        ],
      },
      typecase: {
        bg: 'zoom/type_bg.webp',
        note: ['활자판', '조판 막대 네 칸에 그림 활자를 놓고 시험 찍기. 활자 면은 거울처럼 좌우가 뒤집혀 보인다.'],
        widget: typeWidget,
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.opened) return { key: 'go', steps: ['실이 이어졌어요! 어딘가 길이 열렸어요.', '서쪽 큰 책장이 문처럼 열렸어요.', '서쪽 책장 뒤 통로를 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['이 방의 주인을 찾아봐요.', '동쪽 독서대 옆에 누가 있어요.', '동쪽 나방 모리를 누르세요.'] };
      if (f.pressed) return { key: 'mori', steps: ['책이 완성됐어요. 누구에게 보여 줘야 할까요?', '책이 필요했던 건 모리예요.', '동쪽 모리를 누르세요.'] };
      if (has('book')) {
        if (!has('thandle')) return { key: 'thandle', steps: ['책 누르개를 조일 손잡이가 없어요. 방 어딘가에 굴러가 있지 않을까요?', '바닥 가까이, 그늘진 곳을 보세요.', '남쪽 서랍장 밑의 T자 쇠 손잡이를 주우세요.'] };
        return { key: 'press', steps: ['표지가 들떠 있어요. 꾹 눌러 줘야 해요.', '북쪽 작업대의 무쇠 책 누르개예요.', '새 책을 고른 채 책 누르개를 누르세요. (손잡이는 가방에 있으면 돼요)'] };
      }
      // 갈래 가: 책 몸통
      if (!f.sewn) {
        if (!f.sigsTaken) return { key: 'sigs', steps: ['책은 종이 묶음(접장)으로 만들어요. 어디 널려 있을까요?', '동쪽 둥근 창 앞 빨랫줄을 보세요.', '동쪽 빨랫줄의 접장을 누르세요.'] };
        if (!f.collated) return { key: 'collate', steps: ['접장엔 페이지 번호가 없어요. 대신 등에 작은 표시가 있어요. 다 만든 책과 비교해 봐요.', '북쪽 작업대의 가죽 책을 눌러 책 등을 보세요. 표시가 계단처럼 이어져요.', f.sigsOn ? '꿰매기 틀에서 검은 네모가 왼쪽 맨 위에서 오른쪽 맨 아래로 한 칸씩 내려가게 바꾸세요.' : '접장을 고른 채 북쪽 꿰매기 틀을 누르고, 검은 네모가 왼쪽 맨 위에서 오른쪽 맨 아래로 내려가게 바꾸세요.'] };
        if (!has('threaded')) {
          if (!has('waxsilk')) {
            if (!has('silk')) {
              if (!has('hook')) return { key: 'hook', steps: ['꿰맬 실이 없어요. 모리는 원래 어디서 나왔을까요?', '서쪽 대들보의 커다란 빈 고치에 실이 남아 있어요. 하지만 너무 높아요. 긴 막대가 필요해요.', '동쪽 두루마리 바구니에서 갈고리 막대를 꺼내세요.'] };
              return { key: 'silk', steps: ['갈고리로 높은 곳의 실을 걸어 와요.', '서쪽 맨 끝의 커다란 빈 고치예요.', '갈고리 막대를 고른 채 서쪽 커다란 빈 고치를 누르세요.'] };
            }
            return { key: 'wax', steps: ['비단실은 너무 미끄러워요. 진짜 제본사들은 실에 무언가를 먹여요.', '꿀벌이 만든 것, 실 자국이 난 것… 북쪽 작업대에 있어요.', '비단실을 고른 채 북쪽 밀랍 덩어리를 누르세요.'] };
          }
          if (!has('needle')) return { key: 'needle', steps: ['바늘이 필요해요. 핀이 잔뜩 꽂힌 곳이 있어요.', '남쪽 고슴도치 바늘꽂이를 자세히 보세요. 실을 꿸 수 있는 건 하나뿐이에요.', '머리가 없고 귀가 뚫린 긴 바늘을 누르세요.'] };
          return { key: 'thread', steps: ['실과 바늘을 합쳐요.', '가방에서 밀랍 먹인 실과 바늘을 겹쳐 보세요.', '밀랍 먹인 실을 고른 채 가방의 바늘을 누르세요.'] };
        }
        return { key: 'sew', steps: ['이제 꿰매요.', '북쪽 꿰매기 틀이에요.', '실 꿴 바늘을 고른 채 북쪽 꿰매기 틀을 누르세요.'] };
      }
      // 갈래 나: 제목 찍은 표지
      if (!has('titlecover')) {
        if (!f.coverTaken) return { key: 'cover', steps: ['표지로 쓸 종이가 필요해요.', '북쪽, 두루마리가 꽂힌 바구니를 보세요.', '북쪽 두루마리 바구니를 누르세요.'] };
        if (!f.watermarkSeen) {
          if (!f.moon) {
            if (!f.bellowsTaken) return { key: 'bellows', steps: ['모리 말로는 책 이름이 종이 속에 숨어 있고, 어두우면 안 보인대요. 종이를 밝은 빛에 비춰야 해요.', '가장 밝은 빛은 동쪽 창의 달인데 구름이 가렸어요. 구름을 밀어낼 바람을 만드는 도구가 있어요.', '남쪽 벽의 풀무를 내리세요.'] };
            return { key: 'moon', steps: ['구름을 날려 보내요.', '동쪽 둥근 창이에요. 빨랫줄 접장을 먼저 걷어야 해요.', '풀무를 고른 채 동쪽 둥근 창을 누르세요.'] };
          }
          return { key: 'watermark', steps: ['보름달이 떴어요. 종이를 비춰 봐요.', '동쪽 둥근 창이에요.', '표지 종이(금박을 올렸어도 괜찮아요)를 고른 채 동쪽 둥근 창을 누르세요.'] };
        }
        if (!f.typeSet) return { key: 'type', steps: ['비침 무늬(나방 하나, 그 아래 별 셋)를 표지에 찍어요. 남쪽 활자판을 보세요.', '활자 면은 거울처럼 뒤집혀 있어요. 도장을 찍으면 좌우가 바뀌어 나와요.', '조판 막대에 별, 별, 별, 나방 순서로 놓고 시험 찍기를 누르세요.'] };
        if (!has('leafcover')) {
          if (!f.goldTaken) return { key: 'gold', steps: ['반짝이는 제목을 찍으려면 금박이 필요해요.', '남쪽 탁자 위 책자예요.', '남쪽 금박 책자를 누르세요.'] };
          return { key: 'leaf', steps: ['금박을 표지에 얹어요.', '가방에서 표지 종이와 금박을 겹쳐요.', '금박을 고른 채 가방의 표지 종이를 누르세요.'] };
        }
        if (!has('hottype')) return { key: 'heat', steps: ['차가운 활자로는 금박이 붙지 않아요.', '남쪽에 뜨거운 것이 있어요.', '조판한 활자를 고른 채 남쪽 작은 난로를 누르세요.'] };
        return { key: 'stamp', steps: ['뜨거운 활자로 금박을 찍어요.', '가방에서 뜨거운 활자와 금박 올린 표지를 겹쳐요.', '뜨거운 활자를 고른 채 가방의 금박 올린 표지를 누르세요.'] };
      }
      return { key: 'wrap', steps: ['책 몸통과 표지를 합쳐요.', '가방에서 둘을 겹쳐요.', '제목 찍은 표지를 고른 채 가방의 책 몸통을 누르세요.'] };
    },

    ending: {
      title: '실이 다시 이어진 밤',
      text: ['책장 뒤 통로는 거대한 책장의 뒷면으로 이어져 있었어요. 발밑에서 은빛 비단실이 반짝이며 길을 알려 주었지요.', '뒤를 돌아보니 모리가 금박 나방이 찍힌 새 책을 꼭 끌어안고 손을 흔들었어요. “고마워요. 실은 다시 이어졌어요!”', '그런데 통로 끝에서 축축한 냄새가 났어요. 다음 쪽의 물이… 마르고 있었어요.'],
      next: '3편 · 12장 「김 서린 찻집」은 만드는 중이에요',
      image: 'assets/rooms/bindery/bg/west_open.webp',
    },
  });
})();
