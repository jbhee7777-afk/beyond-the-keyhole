/* 7장 「구름 세탁소」 (2편 두 번째 장)
 * 구름 위 세탁소. 이곳에서 빨아 말린 구름이 날씨가 된다. 주인은 털이 구름인 양 뭉게.
 * 목표: 다음 장으로 가는 무지개 다리. 무지개는 빗구름과 햇빛이 함께 있어야 뜬다.
 * 퍼즐 흐름 (두 갈래가 서쪽 빨랫줄에서 합쳐진다)
 *  갈래 가: 분실물 바구니의 도르래 손잡이 → 동쪽 도르래 → 창을 가린 이불 구름이 걷히고 햇빛 (환경 변화)
 *  갈래 나: 빨래 바구니의 회색 먼지 구름 → 세탁 꼬리표는 글씨가 너무 작다 → 분실물 바구니의 돋보기로 보면
 *          물방울 → 회오리 → 해 (관찰·도구) → 세탁기에 넣고 그 순서로 단추 (논리) → 빗구름
 *  합류: 남쪽 안내판 "무지개는 해님을 등지고 서야 보여요" → 해(동쪽)를 등진 서쪽 빨랫줄에 빗구름을 널면 무지개 다리
 *  이야기: 분실물 바구니에 "봄"이 수놓인 벙어리장갑 → 뭉게 "오래전 꼬마 손님 봄이가 두고 간 거예요. 등대 쪽으로 갔죠."
 */
(function () {
  const F = (s) => s.flags;
  const sun = (s) => !!F(s).sunOpen;
  const ORDER = ['drop', 'wind', 'sun'];

  function sheepTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true;
      api.lock(5200);
      api.say('뭉게: “어서 오세요, 구름 세탁소예요! 무지개 다리를 타고 싶다고요? 무지개는 빗구름이랑 햇빛이 함께 있어야 떠요.”', 5200, { who: 'sheep' });
      api.after(5200, () => api.say('뭉게: “그런데 큰일이에요. 빗구름은 먼지투성이가 됐고, 해님은 빨아 널은 이불 구름에 가려졌어요. 도르래 손잡이도 잃어버렸고요…”', 6400, { who: 'sheep', note: '뭉게의 부탁' }));
      return;
    }
    if (f.rainHung && f.sunOpen) { api.say('뭉게: “와, 무지개 다리예요! 해님을 등지고 보니 정말 예쁘죠?”', 0, { who: 'sheep' }); return; }
    if (api.has('raincloud')) { api.say('뭉게: “깨끗한 빗구름이에요! 해님 반대쪽 빨랫줄에 널어 주세요.”', 0, { who: 'sheep' }); return; }
    api.say('뭉게: “빗구름과 햇빛, 둘 다 있어야 무지개가 떠요. 잃어버린 물건은 바깥 분실물 바구니에 모아 둬요.”', 0, { who: 'sheep' });
  }

  function press(kind) {
    return (api) => {
      const f = api.flags;
      if (f.washed) { api.say('빨래는 다 끝났어. 빗구름이 뽀송뽀송해.'); return; }
      if (!f.cloudIn) { api.sfx('nope'); api.say('세탁기가 비어 있어. 빨 구름을 먼저 넣어야 해.'); return; }
      f.seq = f.seq || [];
      if (kind === ORDER[f.seq.length]) {
        f.seq.push(kind); api.sfx('click');
        if (f.seq.length === 3) {
          f.washed = true; f.washing = true; api.give('raincloud');
          api.sfx('water'); api.burst('bubble', 520, 470, 40);
          api.say('철컥, 빙글빙글 콸콸… 먼지가 싹 빠지고 촉촉한 빗구름이 됐어!', 4600);
          api.after(2600, () => { f.washing = false; });
        }
      } else {
        f.seq = []; api.sfx('nope');
        api.say(kind === 'snow' ? '삐— 눈송이 코스는 겨울 구름 전용이래. 처음부터 다시!' : '삐— 구름이 엉망으로 뭉쳤다가 풀렸어. 순서가 틀렸나 봐. 처음부터 다시!');
      }
    };
  }
  const btn = (kind, label, x, y) => ({
    id: 'b_' + kind, img: (s) => ((F(s).seq || []).includes(kind) && !F(s).washed ? `zoom/btn_${kind}_on` : `zoom/btn_${kind}`), x, y, w: 150, h: 150, label, click: press(kind),
  });

  Engine.registerRoom({
    id: 'laundry',
    chapter: '7장',
    title: '구름 세탁소',
    assets: 'assets/rooms/laundry/',
    sky: ['assets/rooms/laundry/bg/north.svg', 'assets/rooms/laundry/bg/north.svg'],
    frame: 'bg/frame',
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: sun,
    dim: { color: '#4a5a7a', opacity: 0.38 },
    ambient: (s) => (F(s).rainHung && sun(s) ? 'party' : sun(s) ? 'garden' : 'workshop'),
    guide: { name: '구름 양 뭉게', img: 'props/sheep_happy' },
    intro: '종이 문을 지나니 발밑이 푹신푹신… 구름 위 세탁소야! 빨랫줄마다 구름이 널려 있어.',
    repair(s, fix) {
      const f = s.flags;
      if (f.washing) f.washing = false;
      if (f.washed && !f.rainHung && !fix.has('raincloud')) fix.give('raincloud');
    },

    items: {
      greycloud: { name: '먼지 구름', img: 'items/greycloud', desc: '먼지가 잔뜩 낀 회색 구름. 귀퉁이에 세탁 꼬리표가 달려 있는데 글씨가 너무 작아서 안 보여. 돋보기가 있으면…' },
      raincloud: { name: '빗구름', img: 'items/raincloud', desc: '깨끗하게 빤 빗구름. 손에 들고만 있어도 보슬보슬 비가 내려.' },
      magnifier: { name: '돋보기', img: 'items/magnifier', desc: '작은 글씨도 크게 보이는 돋보기.' },
      crank: { name: '도르래 손잡이', img: 'items/crank', desc: '네모난 끝을 어딘가에 끼워 돌리는 손잡이.' },
      mitten: { name: '벙어리장갑', img: 'items/mitten', desc: '분홍 벙어리장갑. 손등에 꽃 자수, 손목에 작게 「봄」이라고 수놓여 있어.', clue: true },
    },
    combos: [
      { a: 'magnifier', b: 'greycloud', say: '돋보기로 꼬리표를 들여다봤어!', after: (api) => { api.set('labelRead'); api.zoom('label'); } },
      { a: 'magnifier', b: 'mitten', say: '손목 자수: 「봄」. 바늘땀이 삐뚤빼뚤, 꼬마가 직접 수놓은 것 같아.' },
      { a: 'raincloud', b: 'magnifier', say: '빗구름 속에 작은 물방울이 반짝반짝. 꼬리표는 빨다가 떨어졌나 봐.' },
    ],

    views: {
      /* ───── 북쪽: 카운터의 뭉게, 커다란 세탁기, 빨래 바구니 ───── */
      north: {
        name: '세탁기 벽',
        bg: 'bg/north',
        objects: [
          { id: 'shelf', x: 0, y: 0, w: 0, h: 0, img: '', hit: [60, 60, 640, 120], label: '구름 수건 선반', look: '빨아서 개어 둔 구름 수건들. 하얀 건 맑음, 노르스름한 건 햇살, 파르스름한 건 소나기래.' },
          { id: 'chart', x: 0, y: 0, w: 0, h: 0, img: '', hit: [740, 60, 330, 140], label: '날씨 그림표', look: '해, 물방울, 회오리, 눈송이 그림이 있어. 구름을 어떻게 빠느냐에 따라 날씨가 달라진대.' },
          { id: 'sheep', img: (s) => (F(s).rainHung && sun(s) ? 'props/sheep_happy' : 'props/sheep_worried'), x: 200, y: 190, w: 380, h: 380, cls: 'bob', blink: (s) => (F(s).rainHung && sun(s) ? null : 'props/sheep_worried_blink'), hit: [250, 200, 290, 280], label: '구름 양 뭉게',
            click: sheepTalk,
            use: {
              mitten: (api) => api.say('뭉게: “그 장갑! 아주 오래전에 꼬마 손님 봄이가 두고 간 거예요. 무지개 다리를 건너 등대 쪽으로 갔었죠.”', 6000, { who: 'sheep', note: '봄이의 장갑' }),
              greycloud: (api) => api.say('뭉게: “세탁기에 넣어 주세요! 꼬리표에 적힌 순서대로 단추를 눌러야 해요.”', 0, { who: 'sheep' }),
              raincloud: (api) => api.say('뭉게: “해님 반대쪽 빨랫줄에 널어야 무지개가 보여요!”', 0, { who: 'sheep' }),
            },
            wrong: '뭉게: “그건 빨래가 아니에요~”',
          },
          { id: 'counter', img: 'props/counter', x: 120, y: 470, w: 560, h: 300, hit: [120, 520, 560, 230], label: '세탁소 카운터', look: '반질반질한 카운터. 작은 종과 구름 비누 상자가 있어.' },
          {
            id: 'machine', img: 'props/machine', x: 800, y: 200, w: 500, h: 520, label: '커다란 세탁기',
            click: (api) => { api.sfx('step'); api.zoom('machine'); },
            use: {
              greycloud: (api) => { api.take('greycloud'); api.set('cloudIn'); api.sfx('splash'); api.say('먼지 구름을 세탁기에 쏙 넣었어.'); api.zoom('machine'); },
              raincloud: (api) => api.say('이미 깨끗해. 또 빨면 쪼그라들 거야.'),
            },
          },
          { id: 'drum', img: (s) => (F(s).washing ? 'props/drum_spin' : F(s).cloudIn && !F(s).washed ? 'props/drum_grey' : 'props/drum_empty'), x: 918, y: 378, w: 264, h: 264, cls: 'drum' },
          {
            id: 'basket', img: (s) => (F(s).greyTaken ? 'props/basket' : 'props/basket_cloud'), x: 1230, y: 560, w: 232, h: 210, label: '빨래 바구니',
            click: (api, n) => {
              if (api.flags.greyTaken) { api.say('빨래 바구니가 텅 비었어.'); return; }
              api.set('greyTaken'); api.give('greycloud', n); api.sfx('pick'); api.say('먼지투성이 회색 구름을 꺼냈어. 콜록! 귀퉁이에 세탁 꼬리표가 있네.');
            },
          },
        ],
      },

      /* ───── 동쪽: 둥근 하늘 창, 이불 구름, 도르래 ───── */
      east: {
        name: '하늘 창 벽',
        bg: 'bg/east',
        objects: [
          { id: 'sunE', img: 'bg/sun_east', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: sun },
          { id: 'iron', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 450, 360, 200], label: '다리미판', look: '구름 다리미에서 김이 몽글몽글 피어올라.' },
          {
            id: 'blanket', img: (s) => (sun(s) ? 'props/blanket_open' : 'props/blanket'), x: 350, y: 40, w: 900, h: 600, hit: [360, 60, 880, 560], label: '이불 구름',
            look: (s) => (sun(s) ? '둥근 창으로 해님이 환하게 웃고 있어.' : '커다란 이불 구름이 빨랫줄에 널려서 둥근 창을 꽁꽁 가렸어. 너무 무거워서 손으로는 못 걷겠어.'),
          },
          {
            id: 'pulley', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1290, 320, 120, 130], label: '도르래 손잡이 구멍',
            click: (api) => api.say(api.flags.sunOpen ? '도르래로 빨랫줄을 감아서 이불 구름을 옆으로 걷었어.' : '빨랫줄을 감는 도르래야. 손잡이를 끼우는 네모난 구멍이 비어 있어.'),
            use: {
              crank: (api) => { api.take('crank'); api.set('handleIn'); api.set('sunOpen'); api.sfx('creak'); api.flash('#fff6d0', 900); api.say('손잡이를 끼우고 끼릭끼릭 감았더니 이불 구름이 스르르 옆으로! 해님이 방긋 나왔어.', 5200); },
            },
          },
          { id: 'handleIn', img: 'props/handle_in', x: 1300, y: 320, w: 160, h: 130, show: (s) => !!F(s).handleIn },
        ],
      },

      /* ───── 남쪽: 세탁소 안쪽, 무지개 손님 안내판 ───── */
      south: {
        name: '안내판 벽',
        bg: 'bg/south',
        objects: [
          { id: 'clothes', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 110, 460, 240], label: '구름 옷', look: '구름으로 지은 셔츠들이 빨랫줄에서 팔랑팔랑. 입으면 하늘을 걷는 기분이래.' },
          { id: 'poster', x: 0, y: 0, w: 0, h: 0, img: '', hit: [620, 190, 370, 290], zoom: 'poster', label: '무지개 손님 안내판' },
          { id: 'soap', x: 0, y: 0, w: 0, h: 0, img: '', hit: [110, 490, 380, 120], label: '세제 통', look: '구름 세제가 색깔별로 있어. 박하 향이 나.' },
        ],
      },

      /* ───── 서쪽: 구름 끝 정류장 (해를 등진 쪽), 분실물 바구니 ───── */
      west: {
        name: '구름 끝 정류장',
        bg: 'bg/west',
        objects: [
          { id: 'sunW', img: 'bg/sun_west', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: sun },
          {
            id: 'rainbow', img: 'props/rainbow', x: 100, y: 40, w: 1400, h: 660, hit: [180, 60, 1240, 200], show: (s) => !!F(s).rainHung && sun(s), label: '무지개 다리',
            click: (api) => { api.sfx('step'); api.win(); },
          },
          { id: 'sign', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1226, 222, 166, 116], label: '정류장 표지판', look: '무지개 그림이 그려진 표지판. 여기가 무지개 다리가 서는 정류장이래.' },
          {
            id: 'line', x: 0, y: 0, w: 0, h: 0, img: '', hit: [440, 220, 720, 110], label: '빨랫줄',
            click: (api) => api.say(api.flags.rainHung ? '빗구름이 보슬보슬 비를 뿌리고 있어.' : '바깥 빨랫줄이야. 등 뒤 세탁소 창 너머에 해님이 있는 쪽이야.'),
            use: {
              raincloud: (api) => {
                api.take('raincloud'); api.set('rainHung'); api.sfx('splash');
                if (api.flags.sunOpen) { api.burst('spark', 800, 260, 40); api.say('빗구름을 널었더니… 등 뒤의 햇빛이 빗방울에 비쳐 커다란 무지개 다리가 떴어!', 5600); }
                else api.say('빗구름을 널었어. 보슬보슬 비가 내리는데… 햇빛이 없어서 무지개는 안 떠.', 4600);
              },
              greycloud: (api) => api.say('먼지 구름을 널면 먼지비가 내릴 거야. 먼저 빨아야 해.'),
            },
          },
          { id: 'rainHung', img: 'props/rain_hung', x: 510, y: 220, w: 580, h: 380, show: (s) => !!F(s).rainHung },
          { id: 'lost', x: 0, y: 0, w: 0, h: 0, img: '', hit: [230, 460, 300, 270], zoom: 'lost', label: '분실물 바구니' },
        ],
      },
    },

    zooms: {
      lost: {
        bg: 'zoom/lost',
        note: ['분실물 바구니', '손님들이 두고 간 물건. 돋보기, 도르래 손잡이, 벙어리장갑…'],
        objects: [
          { id: 'magIn', img: 'items/magnifier', x: 360, y: 300, w: 260, h: 260, cls: 'item-in', show: (s) => !F(s).magTaken, label: '돋보기', click: (api, n) => { api.set('magTaken'); api.give('magnifier', n); api.say('돋보기를 챙겼어. 작은 글씨도 크게 보여.'); } },
          { id: 'crankIn', img: 'items/crank', x: 680, y: 320, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).crankTaken, label: '도르래 손잡이', click: (api, n) => { api.set('crankTaken'); api.give('crank', n); api.say('네모난 끝이 달린 손잡이야. 뭉게가 잃어버렸다던 그거 아닐까?'); } },
          { id: 'mittenIn', img: 'items/mitten', x: 980, y: 300, w: 260, h: 260, cls: 'item-in', show: (s) => !F(s).mittenTaken, label: '벙어리장갑', click: (api, n) => { api.set('mittenTaken'); api.give('mitten', n); api.note('봄이의 장갑', '분실물 바구니의 분홍 벙어리장갑. 손목에 「봄」이라고 수놓여 있다.'); api.say('분홍 벙어리장갑… 손목에 「봄」이라고 수놓여 있어! 스케치북의 그 이름이야.', 5200); } },
        ],
      },
      machine: {
        bg: 'zoom/machine',
        note: ['세탁기 단추', '물방울, 회오리, 해, 눈송이 단추. 순서대로 눌러야 빨래가 된다.'],
        objects: [
          { id: 'drumBig', img: (s) => (F(s).washing ? 'props/drum_spin' : F(s).cloudIn && !F(s).washed ? 'props/drum_grey' : 'props/drum_empty'), x: 254, y: 204, w: 532, h: 532, cls: 'drum',
            look: (s) => (F(s).washed ? '세탁기 안이 깨끗해.' : F(s).cloudIn ? '먼지 구름이 들어 있어. 이제 단추를 순서대로!' : '텅 빈 세탁통이야.'),
            use: { greycloud: (api) => { api.take('greycloud'); api.set('cloudIn'); api.sfx('splash'); api.say('먼지 구름을 세탁기에 쏙 넣었어.'); } },
          },
          btn('drop', '물방울 단추', 950, 330),
          btn('wind', '회오리 단추', 1150, 330),
          btn('sun', '해 단추', 950, 540),
          btn('snow', '눈송이 단추', 1150, 540),
        ],
      },
      label: {
        bg: (s) => (F(s).labelRead ? 'zoom/label_clear' : 'zoom/label'),
        note: ['세탁 꼬리표', '돋보기로 보니: 물방울 → 회오리 → 해 (점 1개, 2개, 3개)'],
        objects: [{ id: 'tag', x: 0, y: 0, w: 0, h: 0, img: '', hit: [430, 150, 750, 620], label: '세탁 꼬리표', look: '물방울, 그다음 회오리, 마지막에 해. 화살표가 순서를 알려 줘.' }],
      },
      poster: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['무지개 손님 안내', '무지개는 해님을 등지고 서야 보인다. 빗구름은 해님 반대쪽에.'],
        text: '<h3>무지개 손님 안내</h3><p>무지개 다리는 <em>빗구름</em>과 <em>햇빛</em>이 만나야 떠요.</p><p>무지개는 해님을 <em>등지고</em> 서야 보여요.<br>빗구름은 해님 반대쪽 빨랫줄에 널어 주세요.</p><p class="sign">— 구름 세탁소 주인 뭉게</p>',
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.rainHung && f.sunOpen) return { key: 'go', steps: ['무지개 다리가 떴어요!', '서쪽 구름 끝 정류장이에요.', '무지개 다리를 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['세탁소 주인에게 말을 걸어 봐요.', '북쪽 카운터에 구름 양이 있어요.', '뭉게를 누르세요.'] };
      if (!f.sunOpen) {
        if (!has('crank')) return { key: 'crank', steps: ['해님이 이불 구름에 가려졌어요. 이불을 걷으려면 도르래를 돌려야 해요.', '뭉게가 도르래 손잡이를 잃어버렸대요. 잃어버린 물건은 어디에 모아 둘까요?', '서쪽 분실물 바구니에서 도르래 손잡이를 꺼내세요.'] };
        return { key: 'pulley', steps: ['도르래 손잡이를 끼울 곳이 있어요.', '동쪽 창 오른쪽 기둥의 네모난 구멍이에요.', '도르래 손잡이를 고른 채 동쪽 도르래 구멍을 누르세요.'] };
      }
      if (!f.rainHung) {
        if (has('raincloud')) return { key: 'hang', steps: ['빗구름을 널어야 무지개가 떠요. 남쪽 안내판을 읽어 보세요.', '무지개는 해님을 등지고 서야 보여요. 해님은 동쪽 창에 있어요.', '빗구름을 고른 채 서쪽 빨랫줄을 누르세요.'] };
        if (!f.greyTaken) return { key: 'grey', steps: ['빗구름이 먼지투성이가 됐대요.', '북쪽 세탁기 옆 빨래 바구니를 보세요.', '빨래 바구니의 회색 구름을 꺼내세요.'] };
        if (!f.labelRead && !f.cloudIn) {
          if (!has('magnifier')) return { key: 'mag', steps: ['먼지 구름의 세탁 꼬리표 글씨가 너무 작아요.', '작은 글씨를 크게 보는 도구가 필요해요. 분실물 바구니에 있을지도?', '서쪽 분실물 바구니에서 돋보기를 꺼내세요.'] };
          return { key: 'label', steps: ['돋보기로 꼬리표를 읽어요.', '가방에서 돋보기와 먼지 구름을 합쳐 봐요.', '돋보기를 고른 채 가방 속 먼지 구름을 누르세요.'] };
        }
        if (!f.cloudIn) return { key: 'in', steps: ['먼지 구름을 빨아요.', '북쪽 커다란 세탁기예요.', '먼지 구름을 고른 채 세탁기를 누르세요.'] };
        return { key: 'wash', steps: ['꼬리표의 순서대로 단추를 눌러요.', '물방울, 그다음 회오리, 마지막에 해예요.', '세탁기를 확대해서 물방울 → 회오리 → 해 단추를 차례로 누르세요.'] };
      }
      return { key: 'sun', steps: ['빗구름은 널었는데 햇빛이 없어요.', '동쪽 창을 가린 이불 구름을 걷어야 해요.', '도르래 손잡이를 동쪽 도르래 구멍에 끼우세요.'] };
    },

    ending: {
      title: '무지개 다리를 건너며',
      text: ['빗구름과 햇빛이 만나 무지개 다리가 놓였어요. 뭉게가 털을 흔들며 손을 흔들어요.', '접이가 장갑 냄새를 킁킁 맡더니 말했어요. “봄은 이 다리를 건너 등대로 갔대. 우리도 가 보자!”', '무지개 끝, 밤바다 위로 커다란 등대 불빛이 빙글빙글 돌고 있어요.'],
      next: '다음 이야기 · 8장 잉크 등대',
    },
  });
})();
