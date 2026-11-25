/* 8장 「잉크 등대」 (2편 세 번째 장)
 * 무지개 끝, 밤바다 위 등대 꼭대기. 등불이 꺼져 바다 건너 기차역까지 가는 징검다리가 안 보인다.
 * 퍼즐 흐름 (두 갈래가 등불 손잡이에서 합쳐진다)
 *  갈래 가: 렌즈에 먹물이 튀었다 → 남쪽 걸레 + 서쪽 빗물통 = 젖은 걸레 → 렌즈 닦기 (조합)
 *  갈래 나: 서쪽 망원경으로 기차역을 보면 초록 등불과 그림 표지판 "초록 불 → 등대" (관찰)
 *          남쪽 잉크병 넷(빨강·파랑·노랑·검정) 중 파랑 + 노랑 = 초록 잉크 (색 섞기) → 잉크 통
 *  합류: 등불 손잡이 → 초록 등불이 돌며 바다 위 징검다리가 금빛으로 드러난다 (환경 변화) → 건너기
 *  이야기: 등대 일지 "꼬마 손님 봄이가 초록 잉크로 등대를 그려 주고, 겨울잠 자는 곰 역장님께 편지를 전하러 기차역으로 갔다"
 */
(function () {
  const F = (s) => s.flags;
  const lamp = (s) => !!F(s).lampOn;
  const NAMES = { ink_red: '빨강', ink_blue: '파랑', ink_yellow: '노랑', ink_black: '검정' };
  // 동행하는 접이: 지금 상황에 맞는 혼잣말 힌트 (2편 내내 함께 다닌다)
  const companion = (lines, place) => ({
    id: 'crane', img: 'assets/rooms/desk/props/crane_idle.svg', ...place, cls: 'bob', blink: 'assets/rooms/desk/props/crane_idle_blink.svg', label: '종이학 접이',
    click: (api) => { const h = api.game.room.hints(api.game.s); api.say('접이: “' + (lines[h.key] || '같이 찾아보자! 구석구석 눌러 봐.') + '”', 0, { who: 'crane' }); },
    wrong: '접이: “그건 나한테 말고 다른 데 써 봐!”',
  });
  const CRANE_LINES = {
    talk: '등대지기 아저씨한테 물어보자.', rag: '렌즈를 닦을 천이 있어야 해.', wet: '마른 천으론 먹물이 번지기만 할 거야. 물이 있으면…', wipe: '젖은 걸레로 렌즈를 닦자!',
    scope: '기차역에서 무슨 색을 원하는지 망원경으로 보자.', mix: '초록 잉크가 없네. 물감처럼 두 색을 섞으면 어때?', yellow: '등잔 밑이 어둡다… 등대 등불 바로 밑을 볼까?', mix2: '파랑이랑 노랑을 섞으면…!',
    pour: '초록 잉크를 렌즈 옆 잉크 통에!', switch: '이제 불을 켜 보자!', go: '징검다리가 보여! 봄이도 이 돌을 밟았겠지?',
  };

  function keeperTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true;
      api.lock(5200);
      api.say('까망이: “어이쿠, 손님이네! 이 등대 불이 꺼져서 밤배도 기차도 길을 잃었어. 빛 잉크는 다 떨어졌고, 렌즈엔 먹물이 튀었지 뭐야.”', 5200, { who: 'keeper' });
      api.after(5200, () => api.say('까망이: “바다 건너 기차역에서 무슨 색 불을 보내 달라고 했는데… 눈이 침침해서 망원경을 못 보겠어. 대신 봐 줄래?”', 6200, { who: 'keeper', note: '까망이의 부탁' }));
      api.after(11400, () => api.say('까망이: “아, 그리고 노랑 잉크는 어디 뒀더라… ‘등잔 밑이 어둡다’더니, 가까이 둔 걸 꼭 못 찾는다니까!”', 6000, { who: 'keeper', note: '까망이의 노랑 잉크' }));
      api.lock(11400);
      return;
    }
    if (f.lampOn) { api.say('까망이: “고마워! 저 징검다리를 건너면 기차역이야. 곰 역장님은 겨울잠 중일 테니 살살 깨워.”', 0, { who: 'keeper' }); return; }
    if (!f.scopeSeen) { api.say('까망이: “발코니 망원경으로 기차역을 봐 줘. 무슨 색 불을 원하는지 알려 줄 거야.”', 0, { who: 'keeper' }); return; }
    api.say('까망이: “빛 잉크는 원하는 색을 섞어서 렌즈 옆 잉크 통에 부으면 돼. 렌즈도 닦아야 하고!”', 0, { who: 'keeper' });
  }
  const wrongInk = (api, item) => {
    if (!api.flags.scopeSeen) { api.say('어떤 색 불빛을 켜야 할까? 바다 건너편을 먼저 살펴보자.'); return; }
    api.say(`기차역에서는 초록 불을 보내 달라고 했어. ${NAMES[item]} 잉크로는 안 돼.`);
  };

  Engine.registerRoom({
    id: 'lighthouse',
    chapter: '8장',
    title: '잉크 등대',
    assets: 'assets/rooms/lighthouse/',
    sky: ['assets/rooms/lighthouse/bg/north.svg', 'assets/rooms/lighthouse/bg/north.svg'],
    frame: 'bg/frame',
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: lamp,
    dim: { color: '#0c1430', opacity: 0.45 },
    dimLit: { color: '#123a30', opacity: 0.12 },
    dimFade: 1.2,
    ambient: (s) => (lamp(s) ? 'sea' : 'night'),
    guide: { name: '등대지기 까망이', img: 'props/penguin_happy' },
    intro: '무지개 다리 끝은 밤바다 위 등대 꼭대기였어. 큰 등불이 꺼져서 바다가 깜깜해.',

    items: {
      rag: { name: '마른 걸레', img: 'items/rag', desc: '낡은 천 걸레. 바싹 말라서 먹물이 잘 안 닦일 것 같아.' },
      wetrag: { name: '젖은 걸레', img: 'items/wetrag', desc: '빗물에 적신 걸레. 먹물도 쓱쓱 닦이겠어.' },
      ink_red: { name: '빨강 잉크', img: 'items/ink_red', desc: '빨간 빛 잉크.' },
      ink_blue: { name: '파랑 잉크', img: 'items/ink_blue', desc: '파란 빛 잉크.' },
      ink_yellow: { name: '노랑 잉크', img: 'items/ink_yellow', desc: '노란 빛 잉크.' },
      ink_black: { name: '검정 잉크', img: 'items/ink_black', desc: '새까만 먹물. 빛이 하나도 안 나.' },
      ink_green: { name: '초록 잉크', img: 'items/ink_green', desc: '파랑과 노랑을 섞은 초록 빛 잉크. 병 속에서 반딧불처럼 반짝여.' },
    },
    combos: [
      { a: 'ink_blue', b: 'ink_yellow', result: 'ink_green', say: '파랑에 노랑을 섞으니… 초록! 병 속에서 초록빛이 반짝반짝.' },
      { a: 'ink_red', b: 'ink_yellow', say: '빨강과 노랑을 섞으면 주황이 될 거야. 기차역에서 원한 색이 아니야.' },
      { a: 'ink_red', b: 'ink_blue', say: '빨강과 파랑을 섞으면 보라가 될 거야. 원하는 색이 아니야.' },
      { a: 'ink_black', b: 'ink_blue', say: '검정을 섞으면 새까매져서 빛이 안 날 거야.' },
      { a: 'ink_black', b: 'ink_yellow', say: '검정을 섞으면 새까매져서 빛이 안 날 거야.' },
      { a: 'ink_black', b: 'ink_red', say: '검정을 섞으면 새까매져서 빛이 안 날 거야.' },
      { a: 'rag', b: 'ink_black', say: '걸레에 먹물을 묻히면 렌즈가 더 까매질 거야!' },
    ],

    views: {
      /* ───── 북쪽: 커다란 등불 렌즈, 잉크 통, 등불 손잡이 ───── */
      north: {
        name: '등불 방',
        bg: 'bg/north',
        objects: [
          { id: 'lampglow', img: 'bg/lampglow', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: lamp },
          { id: 'windowsN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [110, 90, 280, 420], label: '창문', look: '창밖은 별이 총총한 밤바다야.' },
          {
            id: 'lens', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 100, 400, 440], label: '등대 렌즈',
            click: (api) => api.say(api.flags.lensClean ? '렌즈가 맑게 반짝여. 계단처럼 겹친 유리가 빛을 멀리 보내 줘.' : '커다란 유리 렌즈에 먹물이 잔뜩 튀었어. 이대로는 불을 켜도 빛이 못 빠져나갈 거야.'),
            use: {
              wetrag: (api) => { api.take('wetrag'); api.set('lensClean'); api.sfx('scrape'); api.burst('spark', 800, 320, 24); api.say('젖은 걸레로 쓱쓱 닦았더니 먹물이 싹 지워졌어! 렌즈가 반짝반짝.'); },
              rag: (api) => api.say('마른 걸레로 문질러도 먹물이 번지기만 해. 물에 적시면 잘 닦일 텐데.'),
            },
          },
          { id: 'yellowUnder', img: 'props/bottle_yellow', x: 996, y: 552, w: 62, h: 94, cls: 'under', show: (s) => !F(s).took_yellow, label: '받침대 밑 잉크병',
            click: (api, n) => { api.set('took_yellow'); api.give('ink_yellow', n); api.say('등불 받침대 바로 밑 그늘에 노랑 잉크가! 정말 ‘등잔 밑이 어둡다’네.', 5000); } },
          { id: 'lensInk', img: 'props/lens_ink', x: 610, y: 110, w: 380, h: 420, show: (s) => !F(s).lensClean },
          {
            id: 'reservoir', x: 0, y: 0, w: 0, h: 0, img: '', hit: [420, 430, 130, 220], label: '잉크 통',
            click: (api) => api.say(api.flags.inkIn ? '잉크 통에 초록 잉크가 찰랑찰랑.' : '렌즈로 이어진 유리 잉크 통이야. 텅 비었어. 여기에 빛 잉크를 붓나 봐.'),
            use: {
              ink_green: (api) => { api.take('ink_green'); api.set('inkIn'); api.sfx('water'); api.say('초록 잉크를 잉크 통에 꼴꼴꼴 부었어.'); },
              ink_red: (api) => wrongInk(api, 'ink_red'), ink_blue: (api) => wrongInk(api, 'ink_blue'), ink_yellow: (api) => wrongInk(api, 'ink_yellow'),
              ink_black: (api) => api.say('먹물을 부으면 빛 대신 어둠이 나올 거야!'),
            },
          },
          { id: 'resGreen', img: 'props/reservoir_green', x: 431, y: 440, w: 110, h: 200, show: (s) => !!F(s).inkIn },
          {
            id: 'switch', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1080, 390, 130, 260], label: '등불 손잡이',
            click: (api) => {
              const f = api.flags;
              if (f.lampOn) { api.say('등불이 빙글빙글 돌고 있어.'); return; }
              if (!f.inkIn) { api.sfx('locked'); api.say('철컥… 잉크 통이 비어서 불이 안 붙어.'); return; }
              if (!f.lensClean) { api.sfx('nope'); api.say('불은 붙었는데 렌즈에 튄 먹물 때문에 빛이 하나도 못 빠져나가. 렌즈를 닦아야 해.'); return; }
              api.set('lampOn'); api.sfx('sunrise'); api.flash('#d8ffe0', 1000); api.burst('spark', 800, 330, 40);
              api.say('철컥! 초록 등불이 환하게 켜지고 빙글빙글 돌기 시작했어! 바다 쪽에서 무언가 반짝여.', 5200);
            },
          },
        ],
      },

      /* ───── 동쪽: 등대지기 까망이, 책상과 일지 ───── */
      east: {
        name: '등대지기 책상',
        bg: 'bg/east',
        objects: [
          { id: 'log', x: 0, y: 0, w: 0, h: 0, img: '', hit: [240, 470, 290, 70], zoom: 'log', label: '등대 일지' },
          { id: 'oil', x: 0, y: 0, w: 0, h: 0, img: '', hit: [550, 450, 70, 70], label: '작은 기름 램프', look: '작은 램프 하나로 버티는 중이야. 이걸로는 바다 건너까지 빛이 안 닿아.' },
          { id: 'buoy', x: 0, y: 0, w: 0, h: 0, img: '', hit: [700, 120, 200, 200], label: '구명 튜브', look: '빨강·하양 구명 튜브. 등대지기의 필수품!' },
          { id: 'windowE', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1060, 90, 360, 440], label: '바다 창', look: (s) => (lamp(s) ? '초록 불빛이 바다를 쓸며 지나가.' : '깜깜한 바다… 파도 소리만 들려.') },
          companion(CRANE_LINES, { x: 1230, y: 400, w: 176, h: 160 }),
          {
            id: 'keeper', img: (s) => (lamp(s) ? 'props/penguin_happy' : 'props/penguin_worried'), x: 640, y: 250, w: 400, h: 457, cls: 'bob', blink: (s) => (lamp(s) ? null : 'props/penguin_worried_blink'), hit: [720, 270, 250, 430], label: '등대지기 까망이',
            click: keeperTalk,
            use: {
              ink_green: (api) => api.say('까망이: “바로 그 색이야! 렌즈 옆 잉크 통에 부어 줘.”', 0, { who: 'keeper' }),
              ink_red: (api) => api.say('까망이: “기차역이 원한 색은 망원경으로 확인해 봐.”', 0, { who: 'keeper' }),
              wetrag: (api) => api.say('까망이: “나 말고 렌즈를 닦아 줘~ 하하.”', 0, { who: 'keeper' }),
            },
            wrong: '까망이: “그건 등대에 필요 없을 것 같은데?”',
          },
        ],
      },

      /* ───── 남쪽: 잉크병 선반, 걸레, 바다 지도, 나선 계단 ───── */
      south: {
        name: '잉크 선반 벽',
        bg: 'bg/south',
        objects: [
          { id: 'map', x: 0, y: 0, w: 0, h: 0, img: '', hit: [980, 80, 460, 200], label: '바다 지도', look: '등대에서 기차역까지 바위가 점점이 이어져 있어. 밤에는 등불이 비춰야 보이는 징검다리래.' },
          { id: 'stairs', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 620, 480, 200], label: '나선 계단', look: '빙글빙글 아래로 내려가는 계단. 아래는 깜깜한 바다뿐이래.' },
          ...[['red', 190], ['blue', 300], ['black', 410]].map(([c, x]) => ({
            id: 'b_' + c, img: `props/bottle_${c}`, x, y: 330, w: 90, h: 136, show: (s) => !F(s)['took_' + c], label: `${NAMES['ink_' + c]} 잉크병`,
            click: (api, n) => { api.set('took_' + c); api.give('ink_' + c, n); api.say(`${NAMES['ink_' + c]} 잉크병을 챙겼어.`); },
          })),
          { id: 'rag', img: 'props/rag', x: 1150, y: 310, w: 140, h: 160, show: (s) => !F(s).ragTaken, label: '걸레', click: (api, n) => { api.set('ragTaken'); api.give('rag', n); api.say('걸이에 걸린 걸레를 챙겼어. 바싹 말랐네.'); } },
        ],
      },

      /* ───── 서쪽: 발코니, 밤바다, 빗물통, 망원경 ───── */
      west: {
        name: '바다 발코니',
        bg: 'bg/west',
        objects: [
          { id: 'sea', x: 0, y: 0, w: 0, h: 0, img: '', hit: [140, 60, 900, 340], label: '밤바다', look: (s) => (lamp(s) ? '등불이 바다를 비추자 바위들이 금빛으로 줄줄이! 기차역까지 이어진 징검다리야.' : '깜깜한 바다… 바위가 있는 것 같은데 잘 안 보여. 저 멀리 아주 작은 초록 불빛이 하나.') },
          {
            id: 'barrel', x: 0, y: 0, w: 0, h: 0, img: '', hit: [160, 480, 240, 250], label: '빗물통',
            click: (api) => api.say('빗물이 가득 찬 나무통이야.'),
            use: { rag: (api, n) => { api.take('rag'); api.give('wetrag', n); api.sfx('splash'); api.say('걸레를 빗물에 푹 적셨어.'); } },
          },
          { id: 'stones', img: 'props/stones_lit', x: 0, y: 0, w: 1600, h: 900, hit: [460, 420, 840, 170], show: lamp, label: '빛나는 징검다리', click: (api) => { api.sfx('step'); api.win(); } },
          { id: 'scope', img: 'props/telescope', x: 1080, y: 420, w: 400, h: 320, hit: [1110, 460, 300, 130], zoom: 'scope', label: '망원경' },
        ],
      },
    },

    zooms: {
      scope: {
        bg: 'zoom/scope',
        note: ['망원경으로 본 기차역', '기차역 승강장에 초록 등불. 그림 표지판: 초록 불 → 등대. "초록 불을 보내 줘!"'],
        objects: [{ id: 'station', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 360, 460, 250], label: '먼 기차역', click: (api) => { api.set('scopeSeen'); api.say('기차역 승강장에 초록 등불이 켜져 있어. 표지판 그림은 초록 불 → 등대. “초록 불을 보내 줘!”라는 뜻이야.', 5600); } }],
      },
      log: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['등대 일지', '꼬마 손님 봄이가 초록 잉크로 등대를 그려 주고, 곰 역장님께 편지를 전하러 기차역으로 갔다.'],
        text: '<h3>등대 일지</h3><p><b>3월 2일, 맑음.</b> 무지개 다리로 꼬마 손님이 왔다. 이름은 <em>봄</em>. 초록 잉크로 등대 그림을 그려 주었다.</p><p><b>3월 3일.</b> 봄이는 징검다리를 건너 기차역으로 갔다. “겨울잠 자는 곰 역장님께 편지를 전해야 해요!”</p><p><b>약속.</b> 기차역과 등대는 서로 <em>같은 색 불빛</em>을 보내면 징검다리를 비춘다.</p><p class="sign">— 등대지기 까망이</p>',
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.lampOn) return { key: 'go', steps: ['징검다리가 나타났어요!', '서쪽 발코니에서 바다를 보세요.', '빛나는 징검다리를 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['등대지기에게 말을 걸어 봐요.', '동쪽 책상 옆 펭귄이에요.', '까망이를 누르세요.'] };
      if (!f.lensClean) {
        if (!has('rag') && !has('wetrag')) return { key: 'rag', steps: ['렌즈에 튄 먹물을 닦아야 해요.', '닦을 천이 필요해요. 남쪽 벽을 보세요.', '남쪽 걸이의 걸레를 챙기세요.'] };
        if (has('rag')) return { key: 'wet', steps: ['마른 걸레로는 먹물이 번지기만 해요.', '물에 적시면 잘 닦여요. 발코니에 빗물이 고여 있어요.', '걸레를 고른 채 서쪽 빗물통을 누르세요.'] };
        return { key: 'wipe', steps: ['젖은 걸레로 렌즈를 닦아요.', '북쪽 커다란 유리 렌즈예요.', '젖은 걸레를 고른 채 북쪽 렌즈를 누르세요.'] };
      }
      if (!f.inkIn) {
        if (!f.scopeSeen) return { key: 'scope', steps: ['무슨 색 불을 켜야 할까요? 기차역에서 알려 줬대요.', '서쪽 발코니에 망원경이 있어요.', '망원경을 확대해서 기차역을 누르세요.'] };
        if (!has('ink_green')) {
          if (!has('ink_blue')) return { key: 'mix', steps: ['기차역은 초록 불을 원해요. 그런데 선반에 초록 잉크는 없어요.', '물감처럼 색을 섞어 볼까요? 초록은 파랑과 노랑을 섞으면 돼요.', '남쪽 선반에서 파랑 잉크를 챙기세요.'] };
          if (!has('ink_yellow')) return { key: 'yellow', steps: ['노랑 잉크가 선반에 없어요. 까망이가 뭐라고 했죠?', '“등잔 밑이 어둡다” — 가까이 있는 건 오히려 못 찾는다는 말이에요. 등대의 등잔(등불) 밑을 보세요.', '북쪽 등불 받침대 바로 밑 그늘에서 노랑 잉크를 챙기세요.'] };
          return { key: 'mix2', steps: ['두 잉크를 섞어요.', '파랑 + 노랑 = 초록!', '파랑 잉크를 고른 채 가방 속 노랑 잉크를 누르세요.'] };
        }
        return { key: 'pour', steps: ['초록 잉크를 등불에 넣어요.', '북쪽 렌즈 옆 유리 잉크 통이에요.', '초록 잉크를 고른 채 북쪽 잉크 통을 누르세요.'] };
      }
      return { key: 'switch', steps: ['이제 등불을 켜요!', '북쪽 오른쪽의 빨간 손잡이예요.', '등불 손잡이를 누르세요.'] };
    },

    ending: {
      title: '초록 불빛의 징검다리',
      text: ['초록 등불이 바다를 비추자 바위들이 금빛으로 떠올랐어요. 콩콩콩, 징검다리를 건너요.', '접이가 속삭였어요. “봄이도 이 돌을 밟고 건넜겠지? 곰 역장님께 편지를 전하러.”', '바다 건너 작은 기차역. 눈이 소복이 쌓였고, 역장실에서 커다란 코 고는 소리가 들려요.'],
      next: '다음 이야기 · 9장 겨울잠 기차역',
    },
  });
})();
