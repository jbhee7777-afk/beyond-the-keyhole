/* 10장 「봄이의 작업실」 (2편 마지막 장)
 * 별빛 열차가 멈춘 곳은 할머니 집 다락방. 어린 봄이가 이 종이 책을 만들던 작업실이다. 책의 마지막 장이 비어 있다.
 * 퍼즐 흐름 (두 갈래가 책에서 합쳐진다)
 *  갈래 가: 종이 뜨기 — 휴지통 습작 종이 → 물통(종이죽) → 벽의 종이 뜨는 틀로 뜨기 → 창가 빨랫줄에 말리기 → 접이가 문 페이지로 접기
 *          (벽에 붙은 봄이의 순서 그림: 찢기 → 물통 → 뜨기 → 말리기)
 *  갈래 나: 반짇고리 그림 자물쇠 — 서쪽 벽 봄이의 여행 지도 순서(책상 → 구름 → 등대 → 기차)대로 칸을 맞추면 바늘과 실 (2편 여정 되짚기)
 *  합류: 책에 문 페이지를 대고 바늘과 실로 꿰매면 책이 완성 → 바닥 문이 열리고 아래층에서 할머니 목소리
 */
(function () {
  const F = (s) => s.flags;
  // 다섯째 그림(집)은 미끼: 지도의 마지막 칸이지만 자물쇠는 네 칸뿐이라 '집'까지 가기 전 네 곳만 넣어야 한다
  const ICONS = ['desk', 'cloud', 'light', 'train', 'house'];
  const NAMES = { desk: '책상', cloud: '구름', light: '등대', train: '기차', house: '집' };

  function tinWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.tin-lock');
    if (f.tinOpen) { if (box) box.remove(); return; }
    if (box) return;
    f.slots = f.slots || [2, 0, 3, 1];
    box = document.createElement('div');
    box.className = 'tin-lock';
    f.slots.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'piece tin-slot';
      b.style.cssText = `left:${385 + i * 215}px;top:175px;width:180px;height:180px`;
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`zoom/ic_${ICONS[v]}.webp`); b.appendChild(im);
      const label = () => b.setAttribute('aria-label', `${i + 1}번째 칸 (${NAMES[ICONS[f.slots[i]]]})`);
      label();
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        f.slots[i] = (f.slots[i] + 1) % ICONS.length; im.src = game.src(`zoom/ic_${ICONS[f.slots[i]]}.webp`); label();
        api.sfx('click');
        if (f.slots.every((s, k) => s === k)) {
          f.tinOpen = true; game.busy = true;
          setTimeout(() => { game.busy = false; api.sfx('unlock'); api.say('딸깍! 봄이가 지나간 순서대로 맞추자 반짇고리가 열렸어.'); game.s.zoom = null; game.save(); game.render(); }, 450);
        }
        game.save();
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  }

  function bindBook(api) {
    if (!api.has('needle')) { api.say('문 페이지를 대 봤는데 자꾸 빠져. 바늘과 실로 꿰매야 해.'); return; }
    api.take('doorpage'); api.take('needle'); api.set('pageIn'); api.set('bookDone');
    api.sfx('grow'); api.flash('#fff3c0', 1200); api.burst('spark', 800, 360, 50);
    api.say('마지막 장을 한 땀 한 땀 꿰매자 책이 환하게 빛났어! 그때 바닥 문이 덜컥 열리고… “얘야, 다락방에 있니? 간식 먹으렴~”', 7000);
  }

  function craneTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true;
      api.lock(5400);
      api.say('접이: “여기가… 봄이의 작업실이야! 이 책이 태어난 곳. 그런데 봐, 마지막 장이 비어 있어.”', 5400, { who: 'crane' });
      api.after(5400, () => api.say('접이: “새 종이를 떠서 마지막 장을 만들고, 꿰매 넣으면 책이 완성될 거야. 그럼 집으로 가는 문도 열리겠지!”', 6200, { who: 'crane', note: '접이의 말' }));
      return;
    }
    if (f.bookDone) { api.say('접이: “우리가 해냈어! 아래층에 누가 기다리고 있는 것 같아.”', 0, { who: 'crane' }); return; }
    api.say('접이: “종이만 가져오면 마지막 장을 멋진 문으로 접어 줄게!”', 0, { who: 'crane' });
  }

  Engine.registerRoom({
    id: 'studio',
    chapter: '10장',
    title: '봄이의 작업실',
    assets: 'assets/rooms/studio/',
    sky: ['assets/rooms/studio/bg/north.webp', 'assets/rooms/studio/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 25, // 2편: 다음 힌트까지 조금 더 오래 생각하게
    isLit: () => true,
    ambient: (s) => (F(s).bookDone ? 'party' : 'garden'),
    guide: { name: '종이학 접이', img: 'assets/rooms/desk/props/crane_happy.webp' },
    intro: '별빛 열차에서 내리니… 해 질 녘 다락방이야. 어? 여기, 처음 그 책을 찾았던 할머니 집 다락방이잖아!',

    items: {
      scraps: { name: '습작 종이', img: 'items/scraps.webp', desc: '봄이가 연습하다 버린 종이 조각들. 해님, 토끼, 시계… 낯익은 그림이 있어.' },
      mould: { name: '종이 뜨는 틀', img: 'items/mould.webp', desc: '촘촘한 그물이 달린 나무 틀. 종이죽을 떠서 새 종이를 만들어.' },
      wetsheet: { name: '젖은 종이', img: 'items/wetsheet.webp', desc: '틀로 막 떠낸 젖은 종이. 말려야 쓸 수 있어.' },
      paper: { name: '새 종이', img: 'items/paper.webp', desc: '직접 떠서 말린 도톰한 새 종이.' },
      doorpage: { name: '문 페이지', img: 'items/doorpage.webp', desc: '접이가 접어 준 문 모양 페이지. 펼치면 문이 톡 일어서.' },
      needle: { name: '실 꿴 바늘', img: 'items/needle.webp', desc: '빨간 실을 꿴 바늘. 책장을 꿰맬 수 있어.' },
    },
    combos: [
      { a: 'scraps', b: 'mould', say: '종이 조각을 틀에 올려 봤자 종이가 되진 않아. 먼저 물에 불려야 해.' },
      { a: 'needle', b: 'paper', say: '그냥 종이를 꿰매면 평범한 쪽이 될 거야. 마지막 장은 특별해야지! 접이가 접어 준다고 했어.' },
    ],

    views: {
      /* ───── 북쪽: 책 받침대의 펼친 종이 책, 창가의 접이 ───── */
      north: {
        name: '책 받침대',
        bg: 'bg/north.webp',
        objects: [
          { id: 'roundWin', x: 0, y: 0, w: 0, h: 0, img: '', hit: [110, 40, 420, 380], label: '둥근 창', look: '둥근 창 너머로 노을 진 마을 지붕들이 보여.' },
          { id: 'height', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1250, 200, 100, 300], label: '키 재기 눈금', look: '벽에 빨간 키 재기 눈금이 여섯 줄. 봄이가 한 살씩 자랄 때마다 그었나 봐.' },
          { id: 'drawings', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1340, 200, 136, 196], label: '벽에 붙은 그림', look: '꽃 그림이랑 돛단배 그림. 봄이의 어릴 적 그림이야.' },
          { id: 'yarnN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1220, 550, 256, 230], label: '털실 바구니', look: '털실 뭉치와 뜨개바늘. 할머니 냄새가 나.' },
          { id: 'boxes', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 500, 450, 330], label: '종이 상자', look: '옛날 종이 묶음과 상자들. 깨끗한 새 종이는 없어.' },
          {
            id: 'book', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 160, 600, 340], label: '종이 책',
            click: (api) => { api.zoom('bookpage'); },
            use: {
              doorpage: (api) => bindBook(api),
              needle: (api) => api.say(api.has('doorpage') ? '먼저 문 페이지를 책에 대고 꿰매야지. 문 페이지를 들고 책을 눌러 봐.' : '꿰맬 마지막 장이 아직 없어.'),
              paper: (api) => api.say('그냥 종이보다… 마지막 장은 특별해야지. 접이가 접어 준다고 했어.'),
            },
          },
          { id: 'doorOnBook', img: 'props/door_on_book.webp', x: 920, y: 250, w: 230, h: 170, show: (s) => !!F(s).pageIn },
          { id: 'bookGlow', img: 'props/book_glow.webp', x: 560, y: 100, w: 720, h: 440, cls: 'glow', show: (s) => !!F(s).bookDone },
          { id: 'crane', img: (s) => (F(s).bookDone ? 'assets/rooms/desk/props/crane_happy.webp' : 'assets/rooms/desk/props/crane_idle.webp'), x: 300, y: 196, w: 280, h: 255, cls: 'bob', hit: [360, 210, 170, 240], label: '종이학 접이',
            click: craneTalk,
            use: {
              paper: (api, n) => { api.take('paper'); api.set('folded'); api.give('doorpage', n); api.sfx('rip'); api.say('접이: “마지막 장은 이거야! 착, 착, 착… 펼치면 문이 톡 일어서는 문 페이지 완성!”', 5600, { who: 'crane' }); },
              wetsheet: (api) => api.say('접이: “젖은 종이는 접으면 찢어져. 먼저 바싹 말려 줘!”', 0, { who: 'crane' }),
              scraps: (api) => api.say('접이: “조각 종이로는 큰 문을 못 접어. 새 종이를 떠 와!”', 0, { who: 'crane' }),
            },
            wrong: '접이: “그건 종이가 아니잖아~”',
          },
        ],
      },

      /* ───── 동쪽: 작업대 (물통, 종이 뜨는 틀, 습작 휴지통, 순서 그림, 의자) ───── */
      east: {
        name: '종이 작업대',
        bg: (s) => (F(s).stoolMoved ? 'bg/east_nostool.webp' : 'bg/east.webp'),
        objects: [
          { id: 'steps', x: 0, y: 0, w: 0, h: 0, img: '', hit: [890, 150, 560, 220], label: '종이 뜨기 순서 그림', look: '봄이가 그린 순서 그림: 종이를 찢어서 → 물통에 넣고 → 틀로 뜬 다음 → 햇볕에 말린다.' },
          { id: 'jars', x: 0, y: 0, w: 0, h: 0, img: '', hit: [500, 120, 380, 150], label: '선반 병', look: '풀 병, 단추 병, 붓 꽂이. 종이 뜨는 틀은 여기 없어.' },
          {
            id: 'tub', x: 0, y: 0, w: 0, h: 0, img: '', hit: [550, 400, 520, 150], label: '물통',
            click: (api) => api.say(api.flags.pulp ? '찢은 종이가 물에 풀려서 하얀 종이죽이 됐어.' : '맑은 물이 담긴 넓은 나무 물통이야.'),
            use: {
              scraps: (api) => { api.take('scraps'); api.set('pulp'); api.sfx('splash'); api.say('종이 조각을 물에 넣고 휘휘 저었더니 뽀얀 종이죽이 됐어.'); },
              mould: (api, n) => {
                if (!api.flags.pulp) { api.say('맑은 물만 떠져. 찢은 종이를 넣어 종이죽을 만들어야 해.'); return; }
                api.take('mould'); api.give('wetsheet', n); api.sfx('water'); api.say('틀을 쑥 넣었다가 살살 들어 올리자, 그물 위에 얇은 종이가 떠졌어!');
              },
            },
          },
          { id: 'pulpLayer', img: 'props/pulp.webp', x: 560, y: 405, w: 500, h: 80, show: (s) => !!F(s).pulp },
          {
            id: 'mould', img: 'props/mould_wall.webp', x: 1070, y: 92, w: 200, h: 125, show: (s) => !F(s).mouldTaken, label: '종이 뜨는 틀',
            click: (api, n) => {
              if (!api.flags.stoolMoved) { api.say('벽 높이 못에 걸린 틀이야. 까치발을 해도 손이 안 닿아. 밟고 올라설 게 있으면…'); return; }
              api.set('mouldTaken'); api.give('mould', n); api.sfx('pick'); api.say('의자를 밟고 올라가 종이 뜨는 틀을 내렸어.');
            },
          },
          {
            id: 'stool', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1110, 600, 230, 260], show: (s) => !F(s).stoolMoved, label: '나무 의자',
            click: (api) => {
              if (api.flags.stoolMoved) { api.say('틀 밑에 의자를 받쳐 뒀어.'); return; }
              api.set('stoolMoved'); api.sfx('step'); api.say('작은 나무 의자를 벽 쪽 못 아래로 끌어다 놓았어. 이제 올라설 수 있겠다.');
            },
          },
          { id: 'stoolPlaced', img: 'props/stool_moved.webp', x: 1040, y: 640, w: 260, h: 274, show: (s) => !!F(s).stoolMoved },
          {
            id: 'basket', x: 0, y: 0, w: 0, h: 0, img: '', hit: [170, 600, 210, 230], label: '습작 휴지통',
            click: (api, n) => {
              if (api.flags.scrapsTaken) { api.say('휴지통에 쓸 만한 종이는 다 꺼냈어.'); return; }
              api.set('scrapsTaken'); api.give('scraps', n);
              api.say('구겨진 습작 종이들… 해님 기계, 토끼, 13시 시계, 거꾸로 방… 다 내가 지나온 방들이야! 봄이가 연습한 그림이었구나.', 6000);
            },
          },
          { id: 'towel', x: 0, y: 0, w: 0, h: 0, img: '', hit: [400, 500, 160, 170], label: '수건', look: '물기 닦는 수건. 젖은 종이를 이걸로 닦으면 찢어질 거야.' },
        ],
      },

      /* ───── 남쪽: 큰 둥근 창(노을), 빨랫줄, 바닥 문 ───── */
      south: {
        name: '둥근 창',
        bg: (s) => (F(s).bookDone ? 'bg/south_open.webp' : 'bg/south.webp'),
        objects: [
          { id: 'chair', x: 0, y: 0, w: 0, h: 0, img: '', hit: [50, 300, 450, 500], label: '흔들의자', look: '분홍 뜨개 담요가 걸린 흔들의자. 할머니가 늘 앉던 의자야.' },
          { id: 'yarnS', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1180, 460, 330, 200], label: '뜨개 바구니', look: '털실 뭉치가 가득. 바늘은 없고 뜨개바늘만 있어.' },
          {
            id: 'line', x: 0, y: 0, w: 0, h: 0, img: '', hit: [210, 130, 1170, 100], label: '창가 빨랫줄',
            click: (api) => api.say('둥근 창 앞 빨랫줄이야. 노을 햇볕과 바람이 솔솔 들어와.'),
            use: {
              wetsheet: (api) => { api.take('wetsheet'); api.set('hung'); api.sfx('pick'); api.say('젖은 종이를 빨랫줄에 널었더니… 노을 햇볕과 바람에 금세 바삭하게 말랐어!'); },
              mould: (api) => api.say('빈 틀을 널어서 뭐 해. 종이를 먼저 떠야지.'),
            },
          },
          { id: 'sheet', img: 'props/sheet_dry.webp', x: 640, y: 150, w: 260, h: 200, show: (s) => !!F(s).hung && !F(s).sheetTaken, label: '말린 종이', click: (api, n) => { api.set('sheetTaken'); api.give('paper', n); api.say('도톰하게 마른 새 종이를 걷었어.'); } },
          {
            id: 'hatch', x: 0, y: 0, w: 0, h: 0, img: '', hit: [500, 650, 570, 190], label: '바닥 문',
            click: (api) => {
              if (api.flags.bookDone) { api.sfx('step'); api.win(); return; }
              api.sfx('locked'); api.say('아래층으로 가는 바닥 문이 꼭 닫혀 있어. 고리를 당겨도 꿈쩍 안 해. 책이 완성되면 열린다고 접이가 그랬지.');
            },
          },
        ],
      },

      /* ───── 서쪽: 봄이의 여행 지도, 옛날 사진, 반짇고리 ───── */
      west: {
        name: '여행 지도 벽',
        bg: 'bg/west.webp',
        objects: [
          { id: 'map', x: 0, y: 0, w: 0, h: 0, img: '', hit: [160, 100, 1020, 500], label: '봄이의 여행 지도', click: (api) => { api.note('봄이의 여행 지도', '발자국에서 출발해 점선을 따라가면: 책상 → 구름 → 등대 → 기차 → 집'); api.say('어린 봄이가 그린 여행 지도야. 발자국에서 출발해 점선을 따라가면 책상, 구름, 등대, 기차, 그리고 집. 내가 지나온 길이랑 똑같아!', 5600); } },
          { id: 'photo', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1220, 140, 270, 300], label: '옛날 사진', look: '빛바랜 사진 속 단발머리 아이가 종이학을 들고 웃고 있어. 이 아이가 봄이구나…' },
          { id: 'box', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 620, 420, 260], label: '종이 상자', look: '오래된 편지와 그림이 가득한 상자. 새 종이는 없어.' },
          {
            id: 'tin', img: (s) => (F(s).tinOpen ? 'props/tin_open.webp' : 'props/tin_closed.webp'), x: 1205, y: 330, w: 280, h: 198, label: '반짇고리',
            click: (api, n) => {
              const f = api.flags;
              if (!f.tinOpen) { api.zoom('tin'); return; }
              if (f.needleTaken) { api.say('반짇고리 안에 실타래와 바늘꽂이만 남았어.'); return; }
              api.set('needleTaken'); api.give('needle', n); api.say('빨간 실이 꿰어진 바늘을 챙겼어.');
            },
          },
        ],
      },
    },

    zooms: {
      bookpage: {
        bg: 'zoom/desk_blur.webp',
        note: ['책의 마지막 장', '마지막 장은 너를 위해 비워 둘게. 네가 직접 종이를 만들어 꿰매 넣으렴. — 봄'],
        objects: [
          { id: 'bookBig', img: (s) => (F(s).pageIn ? 'props/book_door.webp' : 'props/book_blank.webp'), x: 200, y: 60, w: 1200, h: 800, cls: (s) => (F(s).bookDone ? 'glow' : ''), hit: [260, 120, 1080, 680], label: '펼친 책',
            click: (api) => api.say(api.flags.bookDone ? '마지막 장의 문이 반짝반짝 빛나.' : '왼쪽에는 내가 지나온 방들 그림. 오른쪽 마지막 장은 찢겨 나갔고, 귀퉁이에 작은 글씨: “마지막 장은 너를 위해 비워 둘게. 네가 직접 종이를 만들어 꿰매 넣으렴. — 봄”', 6400),
            use: { doorpage: (api) => bindBook(api) } },
        ],
      },
      tin: {
        bg: 'zoom/tin.webp',
        note: ['반짇고리 자물쇠', '뚜껑의 네 칸에 그림을 맞춘다. 봄이가 지나간 순서?'],
        widget: tinWidget,
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.bookDone) return { key: 'go', steps: ['책이 완성됐어요! 바닥 문이 열렸어요.', '남쪽 바닥 문이에요.', '바닥 문을 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['접이에게 말을 걸어 봐요.', '북쪽 둥근 창가에 접이가 있어요.', '접이를 누르세요.'] };
      if (!has('doorpage') && !f.folded) {
        if (!has('paper')) {
          if (!f.hung) {
            if (!has('wetsheet')) {
              if (!f.pulp) { if (!has('scraps')) return { key: 'scraps', steps: ['새 종이를 직접 만들어야 해요. 동쪽 벽의 순서 그림을 보세요.', '첫 단계는 종이를 찢는 거예요. 버린 종이가 어디 있을까요?', '동쪽 습작 휴지통에서 종이 조각을 꺼내세요.'] }; return { key: 'pulp', steps: ['종이 조각을 물에 불려요.', '동쪽 작업대의 나무 물통이에요.', '습작 종이를 고른 채 물통을 누르세요.'] }; }
              if (!has('mould')) return { key: 'mould', steps: ['종이죽을 떠낼 도구가 필요해요. 동쪽 벽 높이 그물 달린 틀이 걸려 있어요.', '손이 안 닿아요. 밟고 올라설 만한 게 방에 있지 않나요?', f.stoolMoved ? '동쪽 벽의 종이 뜨는 틀을 누르세요.' : '동쪽 작은 나무 의자를 눌러 끌어다 놓고, 틀을 누르세요.'] };
              return { key: 'lift', steps: ['틀로 종이죽을 떠요.', '동쪽 물통이에요.', '종이 뜨는 틀을 고른 채 물통을 누르세요.'] };
            }
            return { key: 'dry', steps: ['젖은 종이는 말려야 해요.', '남쪽 둥근 창 앞에 빨랫줄이 있어요.', '젖은 종이를 고른 채 남쪽 빨랫줄을 누르세요.'] };
          }
          return { key: 'take', steps: ['종이가 다 말랐어요.', '남쪽 빨랫줄이에요.', '말린 종이를 누르세요.'] };
        }
        return { key: 'fold', steps: ['마지막 장은 특별한 모양이어야 해요.', '종이접기 선수 접이에게 부탁해요.', '새 종이를 고른 채 북쪽 접이를 누르세요.'] };
      }
      if (!has('needle')) {
        if (!f.tinOpen) return { key: 'tin', steps: ['책장을 꿰맬 바늘과 실이 필요해요. 서쪽 반짇고리는 그림 자물쇠로 잠겨 있어요.', '서쪽 벽 봄이의 여행 지도를 보세요. 발자국에서 출발하는 순서예요.', '반짇고리 칸을 책상 → 구름 → 등대 → 기차 순서로 맞추세요.'] };
        return { key: 'needle', steps: ['반짇고리가 열렸어요.', '서쪽 반짇고리예요.', '반짇고리를 눌러 실 꿴 바늘을 챙기세요.'] };
      }
      return { key: 'bind', steps: ['이제 마지막 장을 꿰매요.', '북쪽 펼친 종이 책이에요.', '문 페이지를 고른 채 북쪽 종이 책을 누르세요.'] };
    },

    ending: {
      title: '종이 문 너머, 할머니의 다락방',
      text: ['사다리를 내려가자 고소한 냄새가 났어요. 부엌에서 할머니가 웃으며 손을 흔들었지요. “다녀왔니? 내 책 속 친구들은 잘 있었고?”', '할머니의 앞치마 주머니에서 종이학 하나가 고개를 쏙 내밀었어요. 접이가 날개를 파닥였어요. “봄아, 다녀왔어!”', '봄은 할머니의 이름이었어요. 아홉 살 봄이가 만든 종이 책은, 오랫동안 이날을 기다리고 있었답니다.'],
      next: '2편 완결 · 책장을 덮고 다시 처음부터 놀 수 있어요',
      image: 'assets/ui/finale2.webp',
    },
  });
})();
