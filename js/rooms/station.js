/* 9장 「겨울잠 기차역」 (2편 네 번째 장)
 * 눈 쌓인 작은 기차역. 곰 역장 곰곰이가 겨울잠에 빠져 있고, 품에는 오래전 봄이가 맡긴 편지가 있다.
 * 퍼즐 흐름
 *  1. 벽의 안내문: 겨울잠 곰은 "봄이 왔다"고 느껴야 깬다 → ① 따뜻하게 ② 꽃 냄새
 *  2. 서쪽 삽 → 눈 더미를 파면 석탄 → 북쪽 난로 (환경 변화: 방이 따뜻해진다)
 *  3. 따뜻해지면 동쪽 창의 성에가 녹고(시간표가 보임), 창가 꽃봉오리가 핀다 → 꽃
 *  4. 꽃을 곰곰이 코끝에 → "봄이 왔나…? 봄…? 아, 봄이!" (넌센스: 계절 봄 = 이름 봄) → 편지를 읽고 기차표를 준다
 *  5. 기차표의 도착지 그림(지붕과 둥근 창 = 다락방) ↔ 창밖 시간표에서 다락방은 3번 선로 (관찰)
 *     서쪽 선로 전환기를 3에 맞추고 곰곰이에게 말하면 기적 → 기차 → 기차표를 들고 탑승
 */
(function () {
  const F = (s) => s.flags;
  const warm = (s) => !!F(s).warm;
  const pos = (s) => F(s).lever || 1;
  // 동행하는 접이: 지금 상황에 맞는 혼잣말 힌트 (2편 내내 함께 다닌다)
  const companion = (lines, place) => ({
    id: 'crane', img: 'assets/rooms/desk/props/crane_idle.webp', ...place, cls: 'bob', label: '종이학 접이',
    click: (api) => { const h = api.game.room.hints(api.game.s); api.say('접이: “' + (lines[h.key] || '같이 찾아보자! 구석구석 눌러 봐.') + '”', 0, { who: 'crane' }); },
    wrong: '접이: “그건 나한테 말고 다른 데 써 봐!”',
  });
  const CRANE_LINES = {
    shovel: '곰 역장님을 깨우려면 방을 따뜻하게 해야 한대. 난로 연료가 어디 있을까?', dig: '눈 더미를 삽으로 파 보자!', coal: '석탄이다! 꺼내 가자.', stove: '난로에 석탄을 넣자.',
    flower: '따뜻해졌으니 창가 꽃이 피었을지도!', wake: '꽃 냄새로 봄이 온 걸 알려 주자.', lever: '다락방은 몇 번 선로일까? 기차표 그림이랑 창밖 시간표를 비교해 봐.',
    whistle: '곰곰이 아저씨가 기적을 불어 줄 거야.', thaw: '전환기가 꽁꽁 얼었어. 단단한 걸로 톡톡 깨 볼까? 삽 같은 거!', board: '기차다! 다락방으로 가자!',
  };

  function bearClick(api) {
    const f = api.flags;
    if (!f.awake) {
      api.sfx('whisper');
      api.say('드르렁… 쿨쿨… 곰 역장님이 깊은 겨울잠에 빠졌어. 품에 편지를 꼭 안고 있어. 벽에 무슨 안내문이 있던데…');
      return;
    }
    if (f.trainHere) { api.say('곰곰이: “기차표 꼭 챙기고요! 봄이한테 안부 전해 줘요.”', 0, { who: 'bear' }); return; }
    if (pos(api.game.s) !== 3) { api.say('곰곰이: “다락방행 기차는 몇 번 선로더라… 창밖 시간표를 보고 바깥 선로 전환기를 맞춰 줄래요? 그럼 기적을 불게요!”', 6000, { who: 'bear', note: '곰곰이의 부탁' }); return; }
    api.set('trainHere'); api.sfx('rooster'); api.burst('dust', 800, 300, 20);
    api.say('곰곰이: “삐익—! 다락방행 별빛 열차, 3번 선로로 들어옵니다! 승강장으로 가 보세요.”', 5600, { who: 'bear' });
  }

  Engine.registerRoom({
    id: 'station',
    chapter: '9장',
    title: '겨울잠 기차역',
    assets: 'assets/rooms/station/',
    sky: ['assets/rooms/station/bg/north.webp', 'assets/rooms/station/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 25, // 2편: 다음 힌트까지 조금 더 오래 생각하게
    isLit: warm,
    dim: { color: '#3a5080', opacity: 0.12 },
    ambient: (s) => (warm(s) ? 'workshop' : 'night'),
    guide: { name: '곰 역장 곰곰이', img: 'props/bear_awake.webp' },
    intro: '징검다리 끝은 눈 쌓인 작은 기차역이었어. 으슬으슬 추워… 역장실에서 커다란 코 고는 소리가 들려.',
    repair(s, fix) {
      const f = s.flags;
      if (f.awake && !f.boarded && !fix.has('ticket')) fix.give('ticket');
    },

    items: {
      shovel: { name: '눈삽', img: 'items/shovel.webp', desc: '눈을 푹푹 퍼내는 삽.' },
      coal: { name: '석탄', img: 'items/coal.webp', desc: '새까만 석탄 덩어리. 난로에 넣으면 활활 탈 거야.' },
      flower: { name: '봄꽃', img: 'items/flower.webp', desc: '따뜻해지자 활짝 핀 분홍 꽃. 달콤한 봄 냄새가 나.' },
      ticket: { name: '기차표', img: 'items/ticket.webp', desc: '별빛 열차 기차표. 도착지 칸에 지붕과 둥근 창문 그림 — 다락방이야!' },
    },
    combos: [
      { a: 'coal', b: 'flower', say: '꽃에 석탄 가루가 묻으면 안 돼!' },
      { a: 'shovel', b: 'coal', say: '석탄은 삽으로 퍼서 난로에 넣으면 돼. 이미 가방에 있으니 난로로 가자.' },
    ],

    views: {
      /* ───── 북쪽: 역장실 (난로, 곰곰이, 깨우는 법 안내문) ───── */
      north: {
        name: '역장실',
        bg: (s) => (warm(s) ? 'bg/north_warm.webp' : 'bg/north.webp'),
        objects: [
          {
            id: 'stove', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 200, 340, 580], label: '무쇠 난로',
            click: (api) => api.say(api.flags.warm ? '난로가 활활 타서 방이 포근해.' : '차가운 무쇠 난로야. 석탄이 하나도 없어.'),
            use: { coal: (api) => { api.take('coal'); api.set('warm'); api.sfx('match'); api.flash('#ffd8a0', 1200); api.say('석탄을 넣었더니 화르르! 난로가 타오르면서 방이 금세 따뜻해졌어.', 5000); } },
          },
          { id: 'windowN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [390, 20, 370, 430], label: '작은 창', look: '창밖에 눈이 펑펑. 승강장 불빛이 희미하게 보여.' },
          { id: 'clockN', x: 0, y: 0, w: 0, h: 0, img: '', hit: [880, 0, 190, 250], label: '벽시계', look: '벽시계가 째깍째깍. 다락방행 별빛 열차는 밤에만 다닌대.' },
          { id: 'guide', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1195, 115, 200, 265], zoom: 'guide', label: '깨우는 법 안내문' },
          { id: 'table', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1290, 500, 186, 280], label: '협탁', look: (s) => (warm(s) ? '책 두 권과 랜턴. 난로 불이 랜턴 유리에 비쳐.' : '책 두 권과 꺼진 랜턴. 서랍은 텅 비었어.') },
          {
            id: 'bear', img: (s) => (F(s).awake ? 'props/bear_awake.webp' : 'props/bear_sleep.webp'), x: 600, y: 300, w: 560, h: 520, cls: 'breathe', hit: [680, 320, 420, 270], label: '곰 역장 곰곰이',
            click: bearClick,
            use: {
              flower: (api) => {
                const f = api.flags;
                if (f.awake) { api.say('곰곰이: “고마워요, 꽃은 창가에 다시 둘게요.”', 0, { who: 'bear' }); return; }
                if (!f.warm) { api.say('곰곰이가 코를 킁킁… 하지만 너무 추운지 다시 몸을 웅크리고 쿨쿨.'); return; }
                api.take('flower'); api.set('awake'); api.give('ticket'); api.lock(5200); api.sfx('pick');
                api.say('곰곰이: “음냐… 따뜻하고… 꽃 냄새… 봄이 왔나…? 봄…? 아! 봄이!”', 5200, { who: 'bear' });
                api.after(5200, () => { api.game.s.zoom = 'letter'; api.say('곰곰이가 품속 편지를 펼쳐 보여 주고, 기차표 한 장을 건네줬어.', 4600); });
              },
              coal: (api) => api.say('곰곰이 대신 난로에 넣어야지!'),
              shovel: (api) => api.say('삽으로 깨우면 깜짝 놀랄 거야. 안내문에 큰 소리 금지라고 했어.'),
            },
            wrong: '쿨쿨… 그걸로는 안 깨.',
          },
          { id: 'letterOnBear', x: 0, y: 0, w: 0, h: 0, img: '', hit: [760, 590, 260, 110], show: (s) => !!F(s).awake, zoom: 'letter', label: '봄이의 편지' },
        ],
      },

      /* ───── 동쪽: 성에 낀 창 (시간표), 창가 꽃화분, 외투 ───── */
      east: {
        name: '창가',
        bg: (s) => (warm(s) ? 'bg/east_clear.webp' : 'bg/east.webp'),
        objects: [
          {
            id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [330, 0, 700, 680], label: '큰 창',
            click: (api) => { if (!api.flags.warm) { api.say('창에 성에가 꽁꽁 껴서 바깥이 하나도 안 보여. 창 너머에 큰 판자 같은 게 서 있는데…'); return; } api.zoom('timetable'); },
          },
          {
            id: 'flower', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1040, 460, 140, 210], label: '꽃화분',
            click: (api, n) => {
              const f = api.flags;
              if (f.flowerTaken) { api.say('화분에 꽃이 아직 몇 송이 남아 있어.'); return; }
              if (!f.warm) { api.say('꽃봉오리가 추위에 꽁꽁 오므리고 있어.'); return; }
              api.set('flowerTaken'); api.give('flower', n); api.say('따뜻해지니 꽃이 활짝 피었어! 한 송이 똑. 달콤한 봄 냄새.');
            },
          },
          companion(CRANE_LINES, { x: 1180, y: 520, w: 220, h: 200 }),
          { id: 'coat', x: 0, y: 0, w: 0, h: 0, img: '', hit: [60, 130, 270, 590], label: '역장 외투', look: '두툼한 역장 외투와 모자. 주머니에 사탕 껍질만 있어.' },
        ],
      },

      /* ───── 남쪽: 눈 내린 승강장 ───── */
      south: {
        name: '승강장',
        bg: (s) => (F(s).trainHere ? 'bg/south_train.webp' : 'bg/south.webp'),
        objects: [
          { id: 'snowman', x: 0, y: 0, w: 0, h: 0, img: '', hit: [190, 330, 190, 250], label: '눈사람', look: '누가 만든 눈사람이야. 털모자에 빨간 목도리까지.' },
          { id: 'bench', x: 0, y: 0, w: 0, h: 0, img: '', hit: [410, 280, 390, 220], label: '벤치', look: '눈이 소복이 쌓인 벤치. 앉으면 엉덩이가 꽁꽁 얼겠어.' },
          { id: 'suitcase', x: 0, y: 0, w: 0, h: 0, img: '', hit: [840, 430, 200, 150], label: '여행 가방', look: '누군가 두고 간 가죽 가방. 꼬리표에 집 그림이 그려져 있어. 다락방으로 가는 손님 건가 봐.' },
          { id: 'postbox', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1100, 300, 130, 280], label: '빨간 우체통', look: '눈 모자를 쓴 빨간 우체통. 편지는 곰 역장님이 꼭 직접 전한대.' },
          { id: 'signal', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1300, 140, 100, 440], label: '신호등', look: (s) => (F(s).trainHere ? '신호등이 초록으로 바뀌었어.' : '신호등이 빨간불이야. 기차가 아직 안 와.') },
          {
            id: 'train', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 520, 1500, 330], show: (s) => !!F(s).trainHere, label: '별빛 열차',
            click: (api) => {
              if (!api.has('ticket')) { api.say('기차표가 있어야 탈 수 있어.'); return; }
              api.take('ticket'); api.set('boarded'); api.sfx('step'); api.win();
            },
            use: { ticket: (api) => { api.take('ticket'); api.set('boarded'); api.sfx('step'); api.win(); } },
          },
          { id: 'track', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 700, 1600, 200], show: (s) => !F(s).trainHere, label: '선로', look: '눈 덮인 선로가 멀리까지 이어져. 기차는 아직 안 왔어.' },
        ],
      },

      /* ───── 서쪽: 역 밖 (눈 더미, 삽, 선로 전환기) ───── */
      west: {
        name: '역 밖',
        bg: (s) => (F(s).dug ? 'bg/west_dug.webp' : F(s).shovelTaken ? 'bg/west_noshovel.webp' : 'bg/west.webp'),
        objects: [
          { id: 'leverThawed', img: 'props/lever_thawed.webp', x: 625, y: 340, w: 270, h: 355, show: (s) => !!F(s).thawed && !F(s).dug },
          { id: 'leverThawedDug', img: 'props/lever_thawed.webp', x: 605, y: 334, w: 270, h: 355, show: (s) => !!F(s).thawed && !!F(s).dug },
          {
            id: 'pile', x: 0, y: 0, w: 0, h: 0, img: '', hit: [20, 330, 380, 470], label: '눈 더미',
            click: (api, n) => {
              const f = api.flags;
              if (!f.dug) { api.say('눈이 산더미처럼 쌓였어. 그 속에 뭔가 까만 게 보이는데… 손으로 파기엔 너무 차가워.'); return; }
              if (f.coalTaken) { api.say('석탄 통이 비었어.'); return; }
              api.set('coalTaken'); api.give('coal', n); api.say('눈 속 석탄 통에서 석탄을 한 줌 꺼냈어.');
            },
            use: { shovel: (api) => { if (api.flags.dug) { api.say('이미 다 팠어.'); return; } api.set('dug'); api.sfx('dig'); api.burst('dust', 220, 600, 26); api.say('삽으로 푹푹 퍼냈더니 눈 속에서 석탄 통이 나왔어!'); } },
          },
          { id: 'sled', x: 0, y: 0, w: 0, h: 0, img: '', hit: [200, 650, 430, 200], label: '나무 썰매', look: '눈썰매야. 타고 싶지만 지금은 바빠!' },
          { id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [380, 10, 140, 540], label: '가로등', look: '가로등 불빛이 눈송이를 노랗게 비춰.' },
          { id: 'shovel', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1310, 500, 166, 220], show: (s) => !F(s).shovelTaken, label: '눈삽', click: (api, n) => { api.set('shovelTaken'); api.give('shovel', n); api.say('문 옆에 기대 둔 눈삽을 챙겼어.'); } },
          { id: 'plate', img: (s) => `props/plate_${pos(s)}.webp`, x: 640, y: 278, w: 120, h: 72 },
          {
            id: 'lever', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 250, 300, 420], label: '선로 전환기',
            click: (api) => {
              const f = api.flags;
              if (!f.thawed) { api.sfx('locked'); api.say('끙… 손잡이가 꽁꽁 얼어붙어서 꿈쩍도 안 해. 얼음을 깨뜨릴 단단한 게 있으면…'); return; }
              f.lever = (pos(api.game.s) % 3) + 1; api.sfx('creak');
              if (f.lever === 3 && f.awake && !f.trainHere) { f.trainHere = true; api.sfx('rooster'); api.say('철컥, 3번! 역장실 쪽에서 “삐익—!” 기적 소리가 울려. 다락방행 별빛 열차가 승강장으로 들어온다!', 5600); return; }
              api.say(`선로 전환기를 ${f.lever}번으로 철컥 돌렸어. 위 번호판도 ${f.lever}번이 됐어.`);
            },
            use: {
              shovel: (api) => { if (api.flags.thawed) { api.say('얼음은 이미 깼어.'); return; } api.set('thawed'); api.sfx('dig'); api.burst('dust', 750, 520, 20); api.say('삽 손잡이로 톡톡톡! 손잡이에 붙은 얼음이 쩍 갈라져 떨어졌어. 이제 움직이겠다.', 5000); },
              coal: (api) => api.say('석탄으로 문질러도 얼음은 안 녹아. 단단한 걸로 깨 봐야겠어.'),
            },
          },
          { id: 'door', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1190, 210, 120, 450], label: '역 문', look: '역장실로 들어가는 문이야.' },
        ],
      },
    },

    zooms: {
      guide: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['겨울잠 곰 깨우는 법', '봄이 왔다고 느끼게: ① 따뜻하게(난로) ② 코끝에 꽃 냄새. 큰 소리 금지.'],
        text: '<h3>겨울잠 곰 깨우는 법</h3><p>겨울잠 자는 곰은 <em>봄이 왔다</em>고 느껴야 깨요.</p><p>① 방을 <em>따뜻하게</em> (불꽃 그림)<br>② 코끝에 <em>꽃 냄새</em> (꽃 그림)</p><p>큰 소리로 깨우면 깜짝 놀라서 기차 시간을 다 잊어버린대요.</p>',
      },
      timetable: {
        bg: 'zoom/timetable.webp',
        note: ['기차 시간표', '선로 번호는 안 적혀 있다. 위에서부터: 물결(바다) · 산 · 지붕과 둥근 창(다락방)'],
        objects: [{ id: 'board', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 200, 700, 520], label: '시간표 판', look: '번호는 하나도 없고 그림만 세 줄. 위에서부터 물결, 산, 지붕과 둥근 창. 줄마다 점선이 쭉 이어져 있어.' }],
      },
      letter: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['봄이의 편지', '봄이가 아홉 살 때 곰 역장님께. 할머니가 되면 손주가 이 책을 펼칠 거예요. 다락방행 기차를 태워 주세요. 제가 기다릴게요.'],
        text: '<h3>곰 역장님께</h3><p>저는 봄이에요. 아홉 살이에요. 제가 만든 이 종이 책은 너무 커서 혼자서는 다 지킬 수 없어요.</p><p>언젠가 제가 <em>할머니</em>가 되면, 우리 <em>손주</em>가 이 책을 펼칠 거예요. 그 아이가 여기까지 오면 <em>다락방행 기차</em>를 태워 주세요.</p><p>제가 기다릴게요.</p><p class="sign">— 봄</p>',
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.trainHere) return { key: 'board', steps: ['기차가 왔어요!', '남쪽 승강장이에요. 기차표를 챙겼나요?', '남쪽 별빛 열차를 누르세요.'] };
      if (!f.awake) {
        if (!f.warm) {
          if (!has('coal')) {
            if (!f.dug) { if (!has('shovel')) return { key: 'shovel', steps: ['곰 역장님을 깨우려면 먼저 방을 따뜻하게 해야 해요. 벽의 안내문을 읽어 보세요.', '난로에 넣을 석탄이 필요해요. 바깥 눈 더미 속에 까만 게 보여요.', '서쪽 역 벽에 기대 둔 눈삽을 챙기세요.'] }; return { key: 'dig', steps: ['눈 더미를 파 봐요.', '서쪽 눈 더미예요.', '눈삽을 고른 채 서쪽 눈 더미를 누르세요.'] }; }
            return { key: 'coal', steps: ['눈 속에서 석탄 통이 나왔어요.', '석탄을 꺼내요.', '서쪽 눈 더미의 석탄 통을 누르세요.'] };
          }
          return { key: 'stove', steps: ['난로를 피워요.', '북쪽 무쇠 난로예요.', '석탄을 고른 채 북쪽 난로를 누르세요.'] };
        }
        if (!has('flower')) return { key: 'flower', steps: ['방이 따뜻해졌어요. 이제 꽃 냄새가 필요해요.', '동쪽 창가 화분을 보세요. 따뜻해지면 꽃이 펴요.', '동쪽 꽃화분에서 꽃을 따세요.'] };
        return { key: 'wake', steps: ['꽃 냄새로 봄이 온 걸 알려 줘요.', '곰 역장님 코끝에 꽃을 대요.', '봄꽃을 고른 채 북쪽 곰곰이를 누르세요.'] };
      }
      if (!f.thawed) return { key: 'thaw', steps: ['다락방행 기차를 부르려면 바깥 선로 전환기를 돌려야 해요. 그런데 꽁꽁 얼었어요.', '단단한 걸로 얼음을 톡톡 깨면 돼요. 가방에 뭐가 있죠?', '눈삽을 고른 채 서쪽 선로 전환기를 누르세요.'] };
      if (pos(s) !== 3) return { key: 'lever', steps: ['다락방행 기차는 몇 번 선로일까요? 기차표의 도착지 그림을 보세요.', '동쪽 창밖 시간표엔 번호가 없어요. 그림이 위에서부터 몇 번째 줄에 있는지 세어 봐요.', '서쪽 선로 전환기를 눌러 3번에 맞추세요.'] };
      return { key: 'whistle', steps: ['곰 역장님께 기적을 불어 달라고 해요.', '선로를 3번에 맞췄어요.', '북쪽 곰곰이를 누르세요.'] };
    },

    ending: {
      title: '할머니가 된 봄',
      text: ['별빛 열차가 칙칙폭폭 눈밭을 달려요. 창밖으로 책장 같은 언덕이 한 장씩 넘어가요.', '접이가 편지를 다시 읽었어요. “봄이는… 네 할머니였구나. 이 책은 처음부터 너를 기다리고 있었던 거야.”', '열차가 멈춘 곳은 낯익은 지붕 아래, 둥근 창이 있는 다락방이에요.'],
      next: '다음 이야기 · 10장 봄이의 작업실',
    },
  });
})();
