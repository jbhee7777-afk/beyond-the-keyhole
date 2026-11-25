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
  // 동행하는 접이: 지금 상황에 맞는 혼잣말 힌트 (2편 내내 함께 다닌다)
  const companion = (lines, place) => ({
    id: 'crane', img: 'assets/rooms/desk/props/crane_idle.webp', ...place, cls: 'bob', label: '종이학 접이',
    click: (api) => { const h = api.game.room.hints(api.game.s); api.say('접이: “' + (lines[h.key] || '같이 찾아보자! 구석구석 눌러 봐.') + '”', 0, { who: 'crane' }); },
    wrong: '접이: “그건 나한테 말고 다른 데 써 봐!”',
  });
  const CRANE_LINES = {
    talk: '저 양한테 말 걸어 볼까? 여기 주인 같아.', crank: '‘양’이 신는 ‘말’이라… 양말! 빨랫줄에 양말이 있던데?', pulley: '저 도르래에 손잡이를 끼우면 이불을 걷을 수 있겠어!',
    grey: '먼지투성이 구름이 빨래 바구니에 있었어.', mag: '꼬리표 글씨가 너무 작아… 돋보기 같은 거 없나?', label: '돋보기로 꼬리표를 들여다보자!',
    in: '먼지 구름을 세탁기에 넣어 보자.', wash: '꼬리표에 그려진 순서대로 세제를 넣는 거야.', soaps: '꼬리표 그림이랑 같은 그림이 붙은 세제가 남쪽 선반에 있었어.', hang: '안내판에 해님을 등지고 서야 무지개가 보인다고 했지?',
    sun: '빗구름만으론 안 돼. 햇빛도 있어야 해!', go: '무지개 다리야! 건너가자!',
  };

  function sheepTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true;
      api.lock(5200);
      api.say('뭉게: “어서 오세요, 구름 세탁소예요! 무지개 다리를 타고 싶다고요? 무지개는 빗구름이랑 햇빛이 함께 있어야 떠요.”', 5200, { who: 'sheep' });
      api.after(5200, () => api.say('뭉게: “그런데 큰일이에요. 빗구름은 먼지투성이, 해님은 이불 구름에 가려졌어요. 도르래 손잡이는… ‘양’이 신는 ‘말’ 속에 넣어 뒀는데, 어디였더라?”', 7000, { who: 'sheep', note: '뭉게의 부탁' }));
      return;
    }
    if (f.rainHung && f.sunOpen) { api.say('뭉게: “와, 무지개 다리예요! 해님을 등지고 보니 정말 예쁘죠?”', 0, { who: 'sheep' }); return; }
    if (api.has('raincloud')) { api.say('뭉게: “깨끗한 빗구름이에요! 해님 반대쪽 빨랫줄에 널어 주세요.”', 0, { who: 'sheep' }); return; }
    api.say('뭉게: “빗구름과 햇빛, 둘 다 있어야 무지개가 떠요. 잃어버린 물건은 바깥 분실물 바구니에 모아 둬요.”', 0, { who: 'sheep' });
  }

  // 세제 넣기: 꼬리표 순서(물방울 → 회오리 → 해)대로 세제 병을 세탁기에 붓는다
  const SOAP_NAME = { drop: '물방울', wind: '회오리', sun: '해님', snow: '눈송이' };
  function pour(kind) {
    return (api) => {
      const f = api.flags;
      if (f.washed) { api.say('빨래는 다 끝났어. 빗구름이 뽀송뽀송해.'); return; }
      if (!f.cloudIn) { api.sfx('nope'); api.say('세탁기가 비어 있어. 빨 구름을 먼저 넣어야 해.'); return; }
      if (!f.labelRead) { api.sfx('nope'); api.say('잠깐, 세제를 아무렇게나 넣으면 안 될 것 같아. 꼬리표에 빠는 법이 있다던데… 글씨가 너무 작아.'); return; }
      if (kind === 'snow') { api.sfx('nope'); api.say('뭉게: “눈송이 세제는 겨울 구름 전용이에요! 넣으면 눈구름이 돼요.”', 0, { who: 'sheep' }); return; }
      f.seq = f.seq || [];
      if (kind !== ORDER[f.seq.length]) {
        api.sfx('nope');
        api.say(f.seq.length ? `지금 ${SOAP_NAME[kind]} 세제를 넣으면 순서가 꼬여. 꼬리표에서 다음 그림이 뭐였지?` : `${SOAP_NAME[kind]} 세제를 먼저 넣으면 안 될 것 같아. 꼬리표의 첫 그림은 뭐였더라?`);
        return;
      }
      api.take('soap_' + kind); f.seq.push(kind); api.sfx('water');
      if (f.seq.length < 3) { api.say(`${SOAP_NAME[kind]} 세제를 쪼르르 부었어.`); return; }
      f.washed = true; f.washing = true; api.give('raincloud');
      api.burst('bubble', 1270, 450, 40);
      api.say('마지막으로 해님 세제까지! 빙글빙글 콸콸… 먼지가 싹 빠지고 촉촉한 빗구름이 됐어!', 4600);
      api.after(2600, () => { f.washing = false; });
    };
  }
  const soapUse = { soap_drop: pour('drop'), soap_wind: pour('wind'), soap_sun: pour('sun'), soap_snow: pour('snow') };
  // 확대 화면 세제 칸: 넣은 세제가 차례로 불이 들어온다

  Engine.registerRoom({
    id: 'laundry',
    chapter: '7장',
    title: '구름 세탁소',
    assets: 'assets/rooms/laundry/',
    sky: ['assets/rooms/laundry/bg/north.webp', 'assets/rooms/laundry/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: sun,
    dim: { color: '#4a5a7a', opacity: 0.38 },
    ambient: (s) => (F(s).rainHung && sun(s) ? 'party' : sun(s) ? 'garden' : 'workshop'),
    guide: { name: '구름 양 뭉게', img: 'props/sheep_happy.webp' },
    intro: '종이 문을 지나니 발밑이 푹신푹신… 구름 위 세탁소야! 빨랫줄마다 구름이 널려 있어.',
    repair(s, fix) {
      const f = s.flags;
      if (f.washing) f.washing = false;
      if (f.washed && !f.rainHung && !fix.has('raincloud')) fix.give('raincloud');
    },

    items: {
      greycloud: { name: '먼지 구름', img: 'items/greycloud.webp', desc: '먼지가 잔뜩 낀 회색 구름. 귀퉁이에 세탁 꼬리표가 달려 있는데 글씨가 너무 작아서 안 보여. 돋보기가 있으면…' },
      raincloud: { name: '빗구름', img: 'items/raincloud.webp', desc: '깨끗하게 빤 빗구름. 손에 들고만 있어도 보슬보슬 비가 내려.' },
      magnifier: { name: '돋보기', img: 'items/magnifier.webp', desc: '작은 글씨도 크게 보이는 돋보기.' },
      crank: { name: '도르래 손잡이', img: 'items/crank.webp', desc: '네모난 끝을 어딘가에 끼워 돌리는 손잡이.' },
      soap_drop: { name: '물방울 세제', img: 'items/soap_drop.webp', desc: '물방울 그림이 붙은 세제. 구름을 촉촉하게 적셔 줘.' },
      soap_wind: { name: '회오리 세제', img: 'items/soap_wind.webp', desc: '회오리 그림이 붙은 세제. 구름을 빙글빙글 헹궈 줘.' },
      soap_sun: { name: '해님 세제', img: 'items/soap_sun.webp', desc: '해 그림이 붙은 세제. 구름을 보송보송 말려 줘.' },
      soap_snow: { name: '눈송이 세제', img: 'items/soap_snow.webp', desc: '눈송이 그림이 붙은 세제. 겨울 구름 전용이래.' },
      mitten: { name: '벙어리장갑', img: 'items/mitten.webp', desc: '분홍 벙어리장갑. 손등에 꽃 자수, 손목에 작게 「봄」이라고 수놓여 있어.', clue: true },
    },
    combos: [
      { a: 'magnifier', b: 'greycloud', say: '돋보기로 꼬리표를 들여다봤어!', after: (api) => { api.set('labelRead'); api.zoom('label'); } },
      { a: 'magnifier', b: 'mitten', say: '손목 자수: 「봄」. 바늘땀이 삐뚤빼뚤, 꼬마가 직접 수놓은 것 같아.' },
      { a: 'raincloud', b: 'magnifier', say: '빗구름 속에 작은 물방울이 반짝반짝. 꼬리표는 빨다가 떨어졌나 봐.' },
    ],

    views: {
      /* ───── 북쪽: 카운터의 뭉게, 커다란 세탁기, 양말 빨랫줄 ───── */
      north: {
        name: '세탁기 벽',
        bg: 'bg/north.webp',
        objects: [
          { id: 'shelf', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 60, 400, 140], label: '구름 수건 선반', look: '빨아서 개어 둔 구름 수건들. 하얀 건 맑음, 노르스름한 건 햇살이래.' },
          { id: 'chart', x: 0, y: 0, w: 0, h: 0, img: '', hit: [550, 50, 500, 160], label: '날씨 그림표', look: '해, 물방울, 회오리, 눈송이. 세탁소에서 만드는 날씨 종류래. 빨래 순서표는 아닌 것 같아.' },
          {
            id: 'sheep', img: (s) => (F(s).rainHung && sun(s) ? 'props/sheep_happy.webp' : 'props/sheep_worried.webp'), x: 130, y: 120, w: 420, h: 380, cls: 'bob', hit: [180, 130, 320, 340], label: '구름 양 뭉게',
            click: sheepTalk,
            use: {
              mitten: (api) => api.say('뭉게: “그 장갑! 아주 오래전에 꼬마 손님 봄이가 두고 간 거예요. 무지개 다리를 건너 등대 쪽으로 갔었죠.”', 6000, { who: 'sheep', note: '봄이의 장갑' }),
              greycloud: (api) => api.say('뭉게: “세탁기에 넣어 주세요! 세제는 꼬리표에 그려진 순서대로요.”', 0, { who: 'sheep' }),
              raincloud: (api) => api.say('뭉게: “안내판 읽어 보셨어요? 빗구름 널 자리가 중요해요!”', 0, { who: 'sheep' }),
            },
            wrong: '뭉게: “그건 빨래가 아니에요~”',
          },
          { id: 'counter', x: 0, y: 0, w: 0, h: 0, img: '', hit: [10, 460, 630, 320], label: '세탁소 카운터', look: '반질반질한 카운터. 작은 종이 놓여 있어.' },
          { id: 'bell', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 405, 90, 70], label: '종', click: (api) => { api.sfx('click'); api.say('땡! 맑은 소리가 구름 사이로 퍼졌어.'); } },
          {
            id: 'machine', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1055, 205, 385, 480], label: '커다란 세탁기',
            click: (api) => {
              const f = api.flags;
              if (f.washed) { api.say('빨래는 다 끝났어. 세탁기가 반짝반짝해.'); return; }
              if (!f.cloudIn) { api.say('커다란 구름 세탁기야. 유리창 안이 텅 비었어. 옆에 세제 넣는 칸이 세 개 있어.'); return; }
              const n = (f.seq || []).length;
              api.say(n ? `세제 칸 ${n}개가 찼어. 남은 칸에 다음 세제를 넣어야 해.` : '먼지 구름이 들어 있어. 이제 세제를 넣을 차례야. 칸이 세 개야.');
            },
            use: {
              greycloud: (api) => { api.take('greycloud'); api.set('cloudIn'); api.sfx('splash'); api.say('먼지 구름을 세탁기에 쏙 넣었어. 세제 칸이 세 개 있어.'); },
              raincloud: (api) => api.say('이미 깨끗해. 또 빨면 쪼그라들 거야.'),
              magnifier: (api) => { if (api.flags.cloudIn && !api.flags.washed) { api.set('labelRead'); api.say('유리창 너머 먼지 구름의 꼬리표를 돋보기로 들여다봤어!'); api.zoom('label'); } else api.say('세탁기 안이 텅 비었어.'); },
              ...soapUse,
            },
          },
          { id: 'drum', img: (s) => (F(s).washing ? 'props/drum_spin.webp' : F(s).cloudIn && !F(s).washed ? 'props/drum_grey.webp' : ''), x: 1150, y: 330, w: 240, h: 240, cls: 'drum' },
          companion(CRANE_LINES, { x: 1020, y: 40, w: 300, h: 273 }),
          ...[['star', 640], ['fish', 770], ['horse', 905]].map(([k, x]) => ({
            id: 'sock_' + k, x: 0, y: 0, w: 0, h: 0, img: '', hit: [x, 260, 110, 210], label: { star: '별무늬 양말', fish: '물고기무늬 양말', horse: '말무늬 양말' }[k],
            click: (api, n) => {
              if (k !== 'horse') { api.say(k === 'star' ? '별무늬 양말 속엔 아무것도 없어.' : '물고기무늬 양말 속엔 아무것도 없어. 비린내만 살짝…?'); return; }
              if (api.flags.crankTaken) { api.say('말무늬 양말이 텅 비었어.'); return; }
              api.set('crankTaken'); api.give('crank', n); api.sfx('pick');
              api.say('‘양’이 신는 ‘말’… 양말! 말 그림 양말 속에서 도르래 손잡이가 나왔어!', 5200);
            },
          })),
          {
            id: 'basket', img: (s) => (F(s).greyTaken ? 'props/basket.webp' : 'props/basket_cloud.webp'), x: 690, y: 560, w: 300, h: 260, label: '빨래 바구니',
            click: (api, n) => {
              if (api.flags.greyTaken) { api.say('빨래 바구니가 텅 비었어.'); return; }
              api.set('greyTaken'); api.give('greycloud', n); api.sfx('pick'); api.say('먼지투성이 회색 구름을 꺼냈어. 콜록! 귀퉁이에 아주 작은 세탁 꼬리표가 달려 있어.');
            },
          },
        ],
      },

      /* ───── 동쪽: 둥근 하늘 창, 이불, 도르래 ───── */
      east: {
        name: '하늘 창 벽',
        bg: (s) => (sun(s) ? 'bg/east_open.webp' : 'bg/east.webp'),
        objects: [
          { id: 'iron', x: 0, y: 0, w: 0, h: 0, img: '', hit: [10, 420, 470, 360], label: '다리미판', look: '구름 다리미에서 김이 몽글몽글. 빗구름을 다리면 다 말라 버릴 거야.' },
          {
            id: 'blanket', x: 0, y: 0, w: 0, h: 0, img: '', hit: [500, 70, 640, 600], label: '이불',
            look: (s) => (sun(s) ? '둥근 창으로 해님이 환하게 웃고 있어.' : '커다란 이불이 빨랫줄에 널려서 둥근 창을 꽁꽁 가렸어. 너무 무거워서 손으로는 못 걷겠어.'),
            use: { raincloud: (api) => api.say(api.flags.sunOpen ? '창 앞 빨랫줄에 널어 봤는데… 해님을 마주 보니 눈이 부셔서 무지개가 하나도 안 보여. 다시 걷었어.' : '여긴 이불이 차지하고 있어.', 5600) },
          },
          {
            id: 'pulley', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1370, 20, 170, 470], label: '도르래',
            click: (api) => api.say(api.flags.sunOpen ? '도르래로 빨랫줄을 감아서 이불을 옆으로 걷었어.' : '빨랫줄을 감는 도르래야. 기둥에 손잡이를 끼우는 네모난 구멍이 비어 있어.'),
            use: {
              crank: (api) => { api.take('crank'); api.set('handleIn'); api.set('sunOpen'); api.sfx('creak'); api.flash('#fff6d0', 900); api.say('손잡이를 끼우고 끼릭끼릭 감았더니 이불이 스르르 옆으로! 해님이 방긋 나왔어.', 5200); },
            },
          },
        ],
      },

      /* ───── 남쪽: 구름 옷, 무지개 그림, 세제 선반 ───── */
      south: {
        name: '안내판 벽',
        bg: 'bg/south.webp',
        objects: [
          { id: 'clothes', x: 0, y: 0, w: 0, h: 0, img: '', hit: [90, 70, 460, 340], label: '구름 옷', look: '구름으로 지은 셔츠들이 빨랫줄에서 팔랑팔랑.' },
          { id: 'clothes2', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1060, 90, 450, 330], label: '구름 옷', look: '노랑, 분홍 구름 셔츠. 입으면 하늘을 걷는 기분이래.' },
          { id: 'poster', x: 0, y: 0, w: 0, h: 0, img: '', hit: [590, 140, 430, 385], zoom: 'poster', label: '무지개 손님 안내판' },
          { id: 'towels', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1020, 585, 430, 160], label: '개어 둔 구름', look: '보송보송하게 개어 둔 구름들. 내일 날씨가 될 거래.' },
          ...[['drop', 140], ['wind', 270], ['sun', 400], ['snow', 530]].map(([k, x]) => ({
            id: 'soapB_' + k, img: `props/soap_${k}.webp`, x, y: 450, w: 110, h: 150, show: (s) => !F(s)['soapT_' + k], label: `${SOAP_NAME[k]} 세제`,
            click: (api, n) => { api.set('soapT_' + k); api.give('soap_' + k, n); api.say(`${SOAP_NAME[k]} 그림이 붙은 세제 병을 챙겼어.`); },
          })),
        ],
      },

      /* ───── 서쪽: 구름 끝 정류장 (해를 등진 쪽), 분실물 바구니 ───── */
      west: {
        name: '구름 끝 정류장',
        bg: (s) => (F(s).rainHung && sun(s) ? 'bg/west_rainbow.webp' : 'bg/west.webp'),
        objects: [
          { id: 'rainHung', img: 'props/rain_hung.webp', x: 640, y: 230, w: 360, h: 260, show: (s) => !!F(s).rainHung && !sun(s) },
          {
            id: 'rainbow', x: 0, y: 0, w: 0, h: 0, img: '', hit: [80, 0, 1440, 260], show: (s) => !!F(s).rainHung && sun(s), label: '무지개 다리',
            click: (api) => { api.sfx('step'); api.win(); },
          },
          { id: 'sign', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1205, 400, 180, 260], label: '정류장 표지판', look: '무지개 그림이 그려진 표지판. 여기가 무지개 다리가 서는 정류장이래.' },
          {
            id: 'line', x: 0, y: 0, w: 0, h: 0, img: '', hit: [480, 200, 700, 160], label: '빨랫줄',
            click: (api) => api.say(api.flags.rainHung ? '빗구름이 보슬보슬 비를 뿌리고 있어.' : '바깥 빨랫줄이야. 등 뒤로 세탁소 둥근 창이 있는 쪽이야.'),
            use: {
              raincloud: (api) => {
                api.take('raincloud'); api.set('rainHung'); api.sfx('splash');
                if (api.flags.sunOpen) { api.burst('spark', 800, 260, 40); api.say('빗구름을 널었더니… 등 뒤의 햇빛이 빗방울에 비쳐 커다란 무지개 다리가 떴어!', 5600); }
                else api.say('빗구름을 널었어. 보슬보슬 비가 내리는데… 햇빛이 없어서 무지개는 안 떠.', 4600);
              },
              greycloud: (api) => api.say('먼지 구름을 널면 먼지비가 내릴 거야. 먼저 빨아야 해.'),
            },
          },
          { id: 'lostEmpty', img: 'props/basket.webp', x: 30, y: 505, w: 460, h: 345, show: (s) => !!F(s).mittenTaken },
          {
            id: 'lost', x: 0, y: 0, w: 0, h: 0, img: '', hit: [60, 550, 400, 270], label: '분실물 바구니',
            click: (api, n) => {
              const f = api.flags;
              if (!f.magTaken) { api.set('magTaken'); api.give('magnifier', n); api.say('분실물 바구니에서 돋보기를 꺼냈어. 작은 글씨도 크게 보여.'); return; }
              if (!f.mittenTaken) { api.set('mittenTaken'); api.give('mitten', n); api.note('봄이의 장갑', '분실물 바구니의 분홍 벙어리장갑. 손목에 「봄」이라고 수놓여 있다.'); api.say('분홍 벙어리장갑… 손목에 「봄」이라고 수놓여 있어! 스케치북의 그 이름이야.', 5200); return; }
              api.say('목도리랑 단추… 나머지는 다른 손님들 물건이야.');
            },
          },
        ],
      },
    },

    zooms: {
      label: {
        bg: 'zoom/label.webp',
        note: ['세탁 꼬리표', '돋보기로 보니: 물방울 → 회오리 → 해 (점 1개, 2개, 3개)'],
        objects: [{ id: 'tag', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 150, 1000, 600], label: '세탁 꼬리표', look: '물방울, 그다음 회오리, 마지막에 해. 화살표와 점이 순서를 알려 줘.' }],
      },
      poster: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['무지개 손님 안내', '무지개는 해님을 등지고 서야 보인다. 빗구름은 해님 반대쪽에.'],
        text: '<h3>무지개 손님 안내</h3><p>무지개 다리는 <em>빗구름</em>과 <em>햇빛</em>이 만나야 떠요.</p><p>그림 속 아이처럼, 무지개는 해님을 <em>등지고</em> 서야 보여요.</p><p class="sign">— 구름 세탁소 주인 뭉게</p>',
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.rainHung && f.sunOpen) return { key: 'go', steps: ['무지개 다리가 떴어요!', '서쪽 구름 끝 정류장이에요.', '무지개 다리를 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['세탁소 주인에게 말을 걸어 봐요.', '북쪽 카운터에 구름 양이 있어요.', '뭉게를 누르세요.'] };
      if (!f.sunOpen) {
        if (!has('crank')) return { key: 'crank', steps: ['해님이 이불 구름에 가려졌어요. 이불을 걷으려면 도르래 손잡이가 필요해요.', '뭉게가 손잡이를 ‘양’이 신는 ‘말’ 속에 넣어 뒀대요. 양 + 말 = ?', '북쪽 빨랫줄의 말무늬 양말을 누르세요.'] };
        return { key: 'pulley', steps: ['도르래 손잡이를 끼울 곳이 있어요.', '동쪽 창 오른쪽 기둥의 네모난 구멍이에요.', '도르래 손잡이를 고른 채 동쪽 도르래 기둥을 누르세요.'] };
      }
      if (!f.rainHung) {
        if (has('raincloud')) return { key: 'hang', steps: ['빗구름을 널어야 무지개가 떠요. 남쪽 안내판을 읽어 보세요.', '무지개는 해님을 등지고 서야 보여요. 해님은 동쪽 창에 있어요.', '빗구름을 고른 채 서쪽 빨랫줄을 누르세요.'] };
        if (!f.greyTaken) return { key: 'grey', steps: ['빗구름이 먼지투성이가 됐대요.', '북쪽 세탁기 옆 빨래 바구니를 보세요.', '빨래 바구니의 회색 구름을 꺼내세요.'] };
        if (!f.labelRead) {
          if (!has('magnifier')) return { key: 'mag', steps: ['먼지 구름의 세탁 꼬리표 글씨가 너무 작아요.', '작은 글씨를 크게 보는 도구가 필요해요. 분실물 바구니에 있을지도?', '서쪽 분실물 바구니를 눌러 돋보기를 꺼내세요.'] };
          return { key: 'label', steps: ['돋보기로 꼬리표를 읽어요.', '돋보기와 먼지 구름을 합쳐 봐요.', f.cloudIn ? '돋보기를 고른 채 북쪽 세탁기를 누르세요.' : '돋보기를 고른 채 가방 속 먼지 구름을 누르세요.'] };
        }
        if (!f.cloudIn) return { key: 'in', steps: ['먼지 구름을 빨아요.', '북쪽 커다란 세탁기예요.', '먼지 구름을 고른 채 세탁기를 누르세요.'] };
        const need = ORDER.filter((k) => !(f.seq || []).includes(k) && !has('soap_' + k));
        if (need.length) return { key: 'soaps', steps: ['꼬리표 그림과 같은 그림이 붙은 세제가 필요해요.', '남쪽 세제 선반에 그림이 붙은 세제 병이 있어요.', '남쪽 선반에서 물방울·회오리·해님 세제를 챙기세요. 눈송이는 필요 없어요.'] };
        return { key: 'wash', steps: ['꼬리표의 순서대로 세제를 넣어요.', '물방울, 그다음 회오리, 마지막에 해님이에요.', '물방울 → 회오리 → 해님 세제를 차례로 고른 채 세탁기를 누르세요.'] };
      }
      return { key: 'sun', steps: ['빗구름은 널었는데 햇빛이 없어요.', '동쪽 창을 가린 이불 구름을 걷어야 해요.', '도르래 손잡이를 동쪽 도르래 기둥에 끼우세요.'] };
    },

    ending: {
      title: '무지개 다리를 건너며',
      text: ['빗구름과 햇빛이 만나 무지개 다리가 놓였어요. 뭉게가 털을 흔들며 손을 흔들어요.', '접이가 장갑 냄새를 킁킁 맡더니 말했어요. “봄은 이 다리를 건너 등대로 갔대. 우리도 가 보자!”', '무지개 끝, 밤바다 위로 커다란 등대 불빛이 빙글빙글 돌고 있어요.'],
      next: '다음 이야기 · 8장 잉크 등대',
    },
  });
})();
