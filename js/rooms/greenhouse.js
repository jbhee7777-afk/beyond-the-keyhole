/* 1장 「햇살이 멈춘 온실」
 * 퍼즐 흐름 (자세한 설계는 docs/PUZZLE_DESIGN.md)
 *  1. 선반 가운데 화분을 기울이면 손거울 (관찰)
 *  2. 좌우가 뒤집힌 액자 숫자를 손거울로 비춰 읽기 → 352 (거울)
 *  3. 서랍 다이얼 352 → 말굽자석, 해바라기 씨앗
 *  4. 뜨개 바구니의 실타래 + 자석 = 자석 낚싯줄 (조합)
 *  5. 깊은 빗물통에서 자석으로 태엽 열쇠 낚기 (예상 밖의 쓰임)
 *  6. 새장 속 양철 수탉 + 태엽 열쇠 = 태엽 감은 수탉 (조합)
 *  7. 해님의 알람시계는? 꼬끼오! 수탉으로 해님 깨우기 (넌센스, 환경 변화: 방 전체에 햇빛)
 *  8. 햇빛이 들자 작업대 밑 물뿌리개가 보임 → 빗물 채우기
 *  9. 씨앗 + 물 + 햇빛 → 큰 화분에서 해바라기가 쑥쑥, 꽃 가운데 열쇠 (논리)
 * 10. 해바라기 열쇠로 문 열고 탈출
 */
(function () {
  const F = (s) => s.flags;
  const lit = (s) => !!s.flags.sun;

  // 식물이 자랄 조건이 다 갖춰졌는지 확인하고 자라게 한다
  function tryGrow(api, here) {
    const f = api.flags;
    if (f.seeded && f.watered && f.sun && !f.grown) {
      f.grown = true;
      api.sfx('grow');
      if (here) {
        api.lock(2600);
        api.say('씨앗 + 물 + 햇빛! 싹이 트더니… 쑥쑥쑥!', 4200);
        api.after(30, () => { api.anim('flower', 'grow', 2600); api.burst('spark', 1110, 300, 30); });
      } else {
        api.say('북쪽 어딘가에서 쑥쑥 자라는 소리가 들려!', 4200);
      }
    }
  }

  const dial = (container, api, game) => {
    const f = api.flags;
    let box = container.querySelector('.dials');
    if (f.drawerOpen) { if (box) box.remove(); return; }
    if (box) return;
    f.dial = f.dial || [0, 0, 0];
    box = document.createElement('div');
    box.className = 'dials';
    f.dial.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'dial';
      b.style.left = 616 + i * 140 + 'px';
      b.setAttribute('aria-label', (i + 1) + '번째 숫자 바퀴');
      const num = document.createElement('span');
      num.textContent = v;
      b.appendChild(num);
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        f.dial[i] = (f.dial[i] + 1) % 10;
        num.textContent = f.dial[i];
        b.classList.remove('roll'); void b.offsetWidth; b.classList.add('roll');
        api.sfx('dial');
        if (f.dial.join('') === '352') {
          game.busy = true;
          setTimeout(() => {
            api.sfx('unlock');
            f.drawerOpen = true;
            game.busy = false;
            api.say('찰칵! 서랍이 열렸어.');
            game.save(); game.render();
          }, 450);
        }
        game.save();
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  };

  Engine.registerRoom({
    id: 'greenhouse',
    chapter: '1장',
    title: '햇살이 멈춘 온실',
    assets: 'assets/rooms/greenhouse/',
    sky: ['bg/sky_dusk', 'bg/sky_day'],
    beams: { north: 'bg/beams_north', east: 'bg/beams_east', south: 'bg/beams_south', west: 'bg/beams_west' },
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: lit,
    dim: { color: '#22304f', opacity: 0.5 },
    ambient: (s) => (lit(s) ? 'garden' : 'night'),
    // 연출 도중 끊겼을 때 중간 상태를 마무리
    repair(s, fix) {
      const f = s.flags;
      if (f.roosterUsed && !f.sun) fix.set('sun');
      if (f.seeded && f.watered && f.sun && !f.grown) fix.set('grown');
    },
    guide: { name: '달팽이 정원사 소소', img: 'props/snail' },
    intro: '해님이 잠든 온실에 갇혀 버렸어. 벽마다 무언가 숨어 있을 거야. (화살표로 벽을 돌아볼 수 있어)',

    items: {
      yarn: { name: '빨간 실타래', img: 'items/yarn', desc: '길고 튼튼한 털실이야. 무언가를 묶어 매달 수 있겠어.' },
      mirror: { name: '손거울', img: 'items/mirror', desc: '황동 테두리 손거울. 비친 것은 좌우가 바뀌어 보여.' },
      magnet: { name: '말굽자석', img: 'items/magnet', desc: '쇠붙이를 철컥 끌어당기는 자석이야.' },
      seeds: { name: '해바라기 씨앗', img: 'items/seeds', desc: '「해바라기 씨앗 — 흙에 심고, 물을 주고, 햇볕을 쬐어 주세요.」' },
      magnet_line: { name: '자석 낚싯줄', img: 'items/magnet_line', desc: '털실 끝에 자석을 묶었어. 손이 닿지 않는 곳의 쇠붙이를 낚을 수 있어.' },
      windkey: { name: '태엽 열쇠', img: 'items/windkey', desc: '나비 모양 쇠 열쇠. 태엽 장난감을 감을 때 쓰는 거야.' },
      rooster: { name: '양철 수탉', img: 'items/rooster', desc: '양철로 만든 수탉 인형. 등에 작은 구멍이 하나 있어.' },
      rooster_wound: { name: '태엽 감은 수탉', img: 'items/rooster_wound', desc: '태엽을 끝까지 감았어. 금방이라도 울 것 같아!' },
      wcan: { name: '빈 물뿌리개', img: 'items/wcan', desc: '속이 텅 비어 있어. 물을 채워야 해.' },
      wcan_full: { name: '물 담긴 물뿌리개', img: 'items/wcan_full', desc: '빗물이 찰랑찰랑 가득 들어 있어.' },
      key: { name: '해바라기 열쇠', img: 'items/key', desc: '손잡이가 해바라기 모양인 황동 열쇠. 어디서 본 모양인데…' },
    },
    combos: [
      { a: 'magnet', b: 'yarn', result: 'magnet_line', say: '자석을 털실 끝에 꽁꽁 묶었어. 자석 낚싯줄 완성!' },
      { a: 'windkey', b: 'rooster', result: 'rooster_wound', say: '수탉 등 구멍에 태엽 열쇠를 꽂고 끼릭끼릭 감았어.' },
    ],

    views: {
      /* ───── 북쪽: 출입문 ───── */
      north: {
        name: '문 쪽 벽',
        bg: 'bg/north',
        objects: [
          { id: 'cast', img: 'bg/cast_north', x: 0, y: 0, w: 1600, h: 900, show: lit, cls: 'cast' },
          {
            id: 'sunflowers', img: (s) => (lit(s) ? 'props/sunflowers_up' : 'props/sunflowers_droop'), x: 228, y: 202, w: 380, h: 450,
            hit: [240, 300, 360, 340], label: '해바라기 화단',
            look: (s) => (lit(s) ? '해바라기들이 고개를 번쩍 들었어!' : '해바라기들이 고개를 푹 숙이고 있어. 햇빛을 기다리나 봐.'),
          },
          {
            id: 'door', img: (s) => (F(s).doorOpen ? 'props/door_open' : 'props/door_closed'), x: 660, y: 220, w: 280, h: 420, label: '온실 문',
            click: (api) => {
              if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; }
              api.say('잠겨 있어. 열쇠 구멍 둘레가 해바라기 꽃 모양이야.'); api.sfx('locked');
            },
            use: {
              key: (api) => {
                api.take('key'); api.set('doorOpen'); api.sfx('door');
                api.say('딸깍… 끼이익. 문이 열리고 햇살 냄새가 들어와!');
              },
            },
          },
          { id: 'note_door', img: 'props/note_door', x: 704, y: 380, w: 58, h: 68, show: (s) => !F(s).doorOpen, zoom: 'note_door', label: '문에 꽂힌 쪽지' },
          {
            id: 'pot', img: (s) => (F(s).watered ? 'props/bigpot_wet' : F(s).seeded ? 'props/bigpot_seeded' : 'props/bigpot_empty'),
            x: 1000, y: 440, w: 230, h: 220, show: (s) => !F(s).grown, label: '큰 화분',
            look: (s) => (F(s).seeded ? '씨앗을 심어 두었어. 무럭무럭 자라려면…' : '흙만 가득 담긴 커다란 화분이야. 무언가 심을 수 있겠어.'),
            use: {
              seeds: (api) => { api.take('seeds'); api.set('seeded'); api.sfx('dig'); api.say('흙을 콕콕 파고 해바라기 씨앗을 심었어.'); tryGrow(api, true); },
              wcan_full: (api) => {
                if (!api.flags.seeded) { api.say('아직 아무것도 심지 않았어. 빈 흙에 물만 주면 진흙이 될 거야.'); return; }
                api.swap('wcan_full', 'wcan'); api.set('watered'); api.sfx('water');
                api.say('쪼르르륵. 흙이 촉촉해졌어.');
                tryGrow(api, true);
              },
              wcan: (api) => api.say('물뿌리개가 비어 있어. 먼저 물을 채워야 해.'),
            },
          },
          {
            id: 'flower', img: (s) => (F(s).keyTaken ? 'props/giantflower' : 'props/giantflower_key'), x: 935, y: -66, w: 360, h: 720,
            show: (s) => !!F(s).grown, hit: [1030, 50, 170, 190], origin: '50% 100%', label: '커다란 해바라기',
            click: (api, n) => {
              if (api.flags.keyTaken) { api.say('해님을 꼭 닮은 커다란 해바라기야.'); return; }
              api.set('keyTaken'); api.give('key', n); api.say('꽃 한가운데에서 해바라기 열쇠를 찾았어!');
            },
          },
          {
            id: 'basket', img: (s) => (F(s).yarnTaken ? 'props/basket_empty' : 'props/basket'), x: 1290, y: 540, w: 170, h: 160, label: '뜨개 바구니',
            click: (api, n) => {
              if (api.flags.yarnTaken) { api.say('텅 빈 뜨개 바구니야.'); return; }
              api.set('yarnTaken'); api.give('yarn', n); api.say('빨간 실타래를 챙겼어. 아주 길어!');
            },
          },
          {
            id: 'snail', img: 'props/snail', x: 1250, y: 410, w: 130, h: 106, cls: 'bob', label: '달팽이 정원사',
            click: (api) => { api.sfx('tap'); api.hint(); },
          },
          { id: 'fg', img: 'bg/fg_north', x: 0, y: 0, w: 1600, h: 900, cls: 'fg' },
        ],
      },

      /* ───── 동쪽: 작업대 ───── */
      east: {
        name: '작업대 벽',
        bg: 'bg/east',
        objects: [
          { id: 'cast', img: 'bg/cast_east', x: 0, y: 0, w: 1600, h: 900, show: lit, cls: 'cast' },
          { id: 'shelf', img: 'props/shelf', x: 300, y: 160, w: 460, h: 150, hit: [300, 160, 150, 120], look: (s) => (F(s).potTilted ? '선인장과 분홍 꽃 화분. 가운데 화분은 비스듬히 기울어 있어.' : '선인장과 분홍 꽃 화분. 가운데 화분만 유난히 앞으로 나와 있어.') },
          { id: 'shelf2', hit: [610, 160, 150, 120], x: 0, y: 0, w: 0, h: 0, img: '', look: '분홍 꽃이 시들시들해.' },
          {
            id: 'potmid', img: (s) => (F(s).potTilted ? 'props/potmid_tilt' : 'props/potmid'), x: 470, y: 148, w: 110, h: 120, label: '가운데 화분',
            click: (api) => {
              if (api.flags.potTilted) { api.say('화분이 비스듬히 기울어 있어.'); return; }
              api.set('potTilted'); api.sfx('scrape'); api.say('화분을 살짝 기울였더니… 뒤에서 무언가 반짝!');
            },
          },
          {
            id: 'mirror', img: 'props/mirror_glint', x: 544, y: 196, w: 56, h: 56, show: (s) => F(s).potTilted && !F(s).mirrorTaken, label: '반짝이는 것',
            click: (api, n) => { api.set('mirrorTaken'); api.give('mirror', n); api.say('화분 뒤에 손거울이 숨어 있었어!'); },
          },
          { id: 'plaque', img: 'props/plaque', x: 880, y: 190, w: 260, h: 190, zoom: 'plaque', label: '숫자 액자' },
          { id: 'bench', img: 'props/bench', x: 260, y: 400, w: 1080, h: 310, hit: [260, 470, 440, 90], look: '흙냄새 나는 작업대. 모종판과 씨앗 병이 놓여 있어. 가운데에 서랍이 있어.' },
          { id: 'drawer_open', img: 'props/drawer_open', x: 690, y: 548, w: 240, h: 110, show: (s) => !!F(s).drawerOpen },
          { id: 'drawer', hit: [706, 552, 208, 70], x: 0, y: 0, w: 0, h: 0, img: '', zoom: 'drawer', label: '작업대 서랍' },
          { id: 'shadow', img: 'props/under_shadow', x: 300, y: 552, w: 1000, h: 160, show: (s) => !lit(s), hit: [940, 600, 340, 100], look: '작업대 아래는 너무 깜깜해서 아무것도 안 보여.' },
          {
            id: 'wcan', img: 'props/wcan', x: 1010, y: 584, w: 160, h: 124, show: (s) => lit(s) && !F(s).wcanTaken, label: '물뿌리개',
            click: (api, n) => { api.set('wcanTaken'); api.give('wcan', n); api.say('햇빛 덕분에 작업대 밑에 숨어 있던 물뿌리개가 보였어!'); },
          },
          { id: 'fg', img: 'bg/fg_east', x: 0, y: 0, w: 1600, h: 900, cls: 'fg' },
        ],
      },

      /* ───── 남쪽: 해님 기계 ───── */
      south: {
        name: '해님 기계 벽',
        bg: 'bg/south',
        objects: [
          { id: 'cast', img: 'bg/cast_south', x: 0, y: 0, w: 1600, h: 900, show: lit, cls: 'cast' },
          {
            id: 'sun', img: (s) => (lit(s) ? 'props/sun_awake' : 'props/sun_asleep'), x: 530, y: 60, w: 540, h: 600,
            cls: 'breathe', hit: [600, 80, 400, 380], label: '해님 기계',
            look: (s) => (lit(s) ? '해님: “잘 잤다! 깨워 줘서 고마워!”' : '쿨… 쿨… 해님이 수면 모자를 쓰고 깊이 잠들어 있어.'),
            use: {
              rooster_wound: (api) => {
                api.take('rooster_wound'); api.set('roosterUsed'); api.lock(3200);
                api.sfx('rooster'); api.say('꼬—끼—오——!!', 2400);
                api.after(1500, () => { api.set('sun'); api.sfx('sunrise'); api.flash('#fff3c0', 1400); api.burst('spark', 800, 280, 40); api.anim('sun', 'talk', 1600); api.say('해님이 번쩍 눈을 떴어! 온실 가득 햇살이 쏟아져.', 4800); tryGrow(api, false); });
              },
              rooster: (api) => api.say('양철 수탉이 조용해. 태엽을 감아야 울 것 같아.'),
              mirror: (api) => api.say('거울에 해님 얼굴이 비쳐. 그래도 쿨쿨 자고 있어.'),
            },
            wrong: '해님은 꿈쩍도 안 해. 아주 시끄러운 소리가 필요할 것 같아.',
          },
          { id: 'sign', img: 'props/sign_sun', x: 890, y: 560, w: 100, h: 92, zoom: 'note_sun', label: '해님 안내판' },
          { id: 'fg', img: 'bg/fg_south', x: 0, y: 0, w: 1600, h: 900, cls: 'fg' },
        ],
      },

      /* ───── 서쪽: 빗물통과 새장 ───── */
      west: {
        name: '빗물통 벽',
        bg: 'bg/west',
        objects: [
          { id: 'cast', img: 'bg/cast_west', x: 0, y: 0, w: 1600, h: 900, show: lit, cls: 'cast' },
          {
            id: 'barrel', img: 'props/barrel', x: 270, y: 380, w: 290, h: 320, zoom: 'barrel', label: '빗물통',
            use: {
              wcan: (api) => { api.swap('wcan', 'wcan_full'); api.sfx('water'); api.say('빗물을 가득 채웠어.'); },
              magnet_line: (api) => api.zoom('barrel'),
              magnet: (api) => api.say('자석을 그냥 넣으면 물에 빠져 버릴 거야. 무언가에 매달아야 해.'),
            },
          },
          {
            id: 'cage', img: (s) => (F(s).roosterTaken ? 'props/cage_empty' : F(s).cageOpen ? 'props/cage_open' : 'props/cage_closed'),
            x: 880, y: 66, w: 250, h: 374, cls: 'sway', origin: '48% 2%', label: '새장',
            click: (api, n) => {
              const f = api.flags;
              if (!f.cageOpen) { f.cageOpen = true; api.sfx('creak'); api.say('고리를 풀고 새장 문을 열었어. 안에 양철 수탉이 있어!'); return; }
              if (!f.roosterTaken) { f.roosterTaken = true; api.give('rooster', n); api.say('양철 수탉을 꺼냈어. 등에 작은 구멍이 있네?'); return; }
              api.say('텅 빈 새장이 살랑살랑 흔들려.');
            },
          },
          { id: 'fg', img: 'bg/fg_west', x: 0, y: 0, w: 1600, h: 900, cls: 'fg' },
        ],
      },
    },

    zooms: {
      note_door: {
        bg: 'zoom/paper',
        note: ['문에 꽂힌 쪽지', '해님이 깨어나야 꽃이 자라고 문이 열린다. 문 열쇠는 해님을 꼭 닮은 꽃이 지킨다.'],
        text: '<h3>온실에 온 손님에게</h3><p>이 온실의 해님이 그만 깊이 잠들어 버렸어요.</p><p>해님이 깨지 않으면 꽃도 자라지 않고,<br>이 문도 열리지 않는답니다.</p><p>문 열쇠는 <em>해님을 꼭 닮은 꽃</em>이 지키고 있어요.</p><p class="sign">— 달팽이 정원사 소소</p>',
      },
      note_sun: {
        bg: 'zoom/paper',
        note: ['해님 깨우는 방법', '해님의 알람시계는 누구? 날개가 있지만 멀리 못 날고, 머리에 빨간 왕관을 썼다.'],
        text: '<h3>해님 깨우는 방법</h3><p>우리 해님은 소문난 잠꾸러기예요.</p><p>그래도 매일 아침 <em>이 친구</em>가 노래하면<br>번쩍 눈을 뜬답니다.</p><p class="riddle">수수께끼: 해님의 알람시계는 누구일까요?<br>날개가 있지만 멀리 날지 못하고,<br>머리에 빨간 왕관을 썼어요.</p>',
      },
      plaque: {
        bg: 'zoom/plaque',
        objects: [
          { id: 'reflect', img: 'zoom/mirror_reflect', x: 1040, y: 150, w: 520, h: 720, show: (s) => !!F(s).mirrorUsed, cls: 'rise', look: '거울 속에서는 숫자가 바르게 보여. 3 · 5 · 2!' },
          { id: 'plaqueHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [170, 180, 830, 480], label: '액자',
            look: (s) => (F(s).mirrorUsed ? '거울 속 숫자는 3, 5, 2.' : '숫자가 거울에 비친 것처럼 좌우로 뒤집혀 있어. 구석에 작은 손거울 그림이 있네.'),
            use: { mirror: (api) => { api.set('mirrorUsed'); api.sfx('shine'); api.say('손거울을 비춰 보니… 숫자가 바르게 보여! 3 · 5 · 2', 4000); api.note('거울에 비친 액자 숫자', '거울 속에서는 3 · 5 · 2 로 바르게 읽힌다.'); } },
          },
        ],
      },
      drawer: {
        bg: (s) => (F(s).drawerOpen ? 'zoom/drawer_open' : 'zoom/drawer_closed'),
        widget: dial,
        objects: [
          { id: 'lockHint', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 300, 480, 50], show: (s) => !F(s).drawerOpen, look: '숫자 바퀴 세 개짜리 자물쇠야. 바퀴를 누르면 숫자가 돌아가.' },
          { id: 'magnetIn', img: 'items/magnet', x: 470, y: 300, w: 280, h: 280, show: (s) => F(s).drawerOpen && !F(s).magnetTaken, cls: 'item-in',
            click: (api, n) => { api.set('magnetTaken'); api.give('magnet', n); api.say('말굽자석을 챙겼어.'); } },
          { id: 'seedsIn', img: 'items/seeds', x: 840, y: 280, w: 300, h: 300, show: (s) => F(s).drawerOpen && !F(s).seedsTaken, cls: 'item-in',
            click: (api, n) => { api.set('seedsTaken'); api.give('seeds', n); api.say('해바라기 씨앗 봉투를 챙겼어.'); } },
        ],
      },
      barrel: {
        bg: 'zoom/barrel',
        objects: [
          { id: 'water', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 200, 1000, 560], label: '빗물',
            look: (s) => (F(s).windkeyTaken ? '맑은 빗물이 고여 있어.' : '깊고 차가운 빗물. 바닥에서 무언가 반짝여.'),
            use: { wcan: (api) => { api.swap('wcan', 'wcan_full'); api.sfx('water'); api.say('빗물을 가득 채웠어.'); } },
          },
          {
            id: 'glint', img: 'zoom/key_glint', x: 880, y: 500, w: 210, h: 165, show: (s) => !F(s).windkeyTaken, cls: 'shimmer', label: '물속에서 반짝이는 것',
            look: '깊은 물 바닥에서 쇠붙이가 반짝여. 손을 넣기엔 너무 깊고 차가워.',
            use: {
              magnet_line: (api, n) => {
                api.sfx('splash'); api.lock(1200);
                api.set('windkeyTaken'); api.give('windkey', n);
                api.say('자석 낚싯줄을 스르르 내렸더니… 철컥! 태엽 열쇠가 자석에 붙어 올라왔어.');
                api.after(600, () => api.sfx('clink'));
              },
              magnet: (api) => api.say('자석만 던지면 물속으로 사라질 거야. 줄에 매달아야 해.'),
              wcan: (api) => { api.swap('wcan', 'wcan_full'); api.sfx('water'); api.say('빗물을 가득 채웠어.'); },
            },
          },
        ],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (!f.sun) {
        if (has('rooster_wound')) return { key: 'wake', steps: ['남쪽 벽의 해님이 쿨쿨 자고 있어요. 받침대 안내판을 읽어 보세요.', '해님의 알람시계는 매일 아침 “꼬끼오!” 하고 울어요.', '가방에서 태엽 감은 수탉을 고르고 해님을 누르세요.'] };
        if (!f.drawerOpen) {
          if (!f.mirrorTaken) return { key: 'mirror', steps: ['동쪽 작업대 위 액자의 숫자가 어딘가 이상해요.', '숫자가 좌우로 뒤집혀 있어요. 액자 구석에 작은 손거울 그림이 있지요? 온실 어딘가에 손거울이 있어요.', '동쪽 선반 가운데 화분을 눌러 기울여 보세요. 뒤에 손거울이 있어요.'] };
          if (!f.mirrorUsed) return { key: 'plaque', steps: ['손거울로 무엇을 비춰 볼까요?', '거울은 좌우를 바꿔서 보여 줘요. 뒤집힌 숫자를 비추면?', '가방에서 손거울을 고른 뒤, 동쪽 액자를 확대해서 눌러 보세요.'] };
          return { key: 'dial', steps: ['거울 속 숫자를 어디에 쓸까요? 숫자 바퀴가 달린 곳이 있어요.', '작업대 가운데 서랍에 숫자 바퀴 세 개가 있어요.', '서랍 자물쇠를 3 - 5 - 2 로 맞추세요.'] };
        }
        if (!has('windkey') && !f.windkeyTaken) {
          if (!has('magnet_line')) {
            if (!has('magnet')) return { key: 'drawer', steps: ['열린 서랍 안을 살펴보세요.', '서랍 속 물건을 모두 챙기세요.', '동쪽 서랍을 확대해서 자석과 씨앗을 누르세요.'] };
            return { key: 'fish', steps: ['서쪽 빗물통 바닥에서 쇠붙이가 반짝여요. 손이 닿지 않아요.', '쇠붙이를 끌어당기는 물건을 긴 줄에 매달면 낚시를 할 수 있어요. 북쪽 뜨개 바구니를 살펴보세요.', '자석을 고른 채 실타래를 눌러 합친 뒤, 빗물통 속 반짝이는 것에 쓰세요.'] };
          }
          return { key: 'fish2', steps: ['자석 낚싯줄로 무엇을 낚을까요?', '서쪽 빗물통 안을 들여다보세요.', '빗물통을 확대하고, 자석 낚싯줄을 고른 채 반짝이는 곳을 누르세요.'] };
        }
        if (!has('rooster') && !f.roosterTaken) return { key: 'cage', steps: ['태엽 열쇠는 태엽 장난감을 감는 물건이에요. 장난감은 어디 있을까요?', '서쪽 벽에 매달린 새장 안을 보세요.', '새장을 눌러 문을 열고, 양철 수탉을 꺼내세요.'] };
        return { key: 'wind', steps: ['양철 수탉을 살펴보세요. 등에 무엇이 있나요?', '등의 작은 구멍에 맞는 열쇠가 가방에 있어요.', '태엽 열쇠를 고른 채 가방 속 수탉을 누르세요.'] };
      }
      if (!f.grown) {
        if (!f.seeded) {
          if (!has('seeds')) return { key: 'seeds', steps: ['햇빛이 돌아왔어요! 꽃을 키울 준비를 해요.', '씨앗이 어디 있었지요? 서랍을 다시 보세요.', '동쪽 서랍 안의 해바라기 씨앗을 챙기세요.'] };
          return { key: 'plant', steps: ['쪽지에 “문 열쇠는 해님을 닮은 꽃이 지킨다”고 적혀 있었어요.', '해님을 닮은 꽃은 해바라기! 씨앗을 심을 곳이 있어요.', '북쪽 문 옆 큰 화분에 해바라기 씨앗을 쓰세요.'] };
        }
        if (!has('wcan') && !has('wcan_full')) return { key: 'wcan', steps: ['씨앗이 자라려면 흙, 햇빛 그리고 또 하나가 필요해요.', '물 줄 도구는 어두울 때 보이지 않던 곳에 있어요.', '동쪽 작업대 아래 물뿌리개를 챙기세요.'] };
        if (has('wcan')) return { key: 'fill', steps: ['물뿌리개가 비어 있어요.', '온실에 물이 고인 곳이 있어요.', '빈 물뿌리개를 서쪽 빗물통에 쓰세요.'] };
        return { key: 'water', steps: ['씨앗에게 물을 주세요.', '북쪽 큰 화분이에요.', '물 담긴 물뿌리개를 큰 화분에 쓰세요.'] };
      }
      if (!f.keyTaken) return { key: 'key', steps: ['커다란 해바라기가 피었어요! 꽃을 잘 보세요.', '꽃 한가운데에서 무언가 반짝여요.', '해바라기 꽃 가운데를 누르세요.'] };
      if (!f.doorOpen) return { key: 'door', steps: ['열쇠 손잡이 모양을 어디서 봤지요?', '문 자물쇠가 해바라기 모양이었어요.', '해바라기 열쇠를 고른 채 북쪽 문을 누르세요.'] };
      return { key: 'out', steps: ['문이 열렸어요!', '열린 문으로 나가 보세요.', '북쪽 문을 누르세요.'] };
    },

    ending: {
      title: '햇살이 다시 흐르는 온실',
      text: ['해님이 깨어나자 온실의 시간도 다시 흐르기 시작했어요.', '해바라기들은 모두 해님을 바라보고, 달팽이 정원사 소소는 느릿느릿 손을 흔들었어요.', '문 밖 오솔길 끝에서 작은 태엽 소리가 들려옵니다. 끼릭, 끼릭…'],
      next: '다음 이야기 · 2장 토끼의 장난감 공방',
    },
  });
})();
