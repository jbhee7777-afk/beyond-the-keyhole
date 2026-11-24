/* 3장 「열세 번째 시계」
 * 퍼즐 흐름 (자세한 설계는 docs/PUZZLE_DESIGN.md)
 *  1. 동쪽 커튼을 열면 달빛 (환경 변화) → 벽에 야광 글씨 "거울 속 시계만 바른 시간을 말해요"
 *  2. 괘종시계는 숫자가 거꾸로 돌고 글자도 뒤집혀 있다 → 남쪽 거울에 비친 시계는 4시 20분 (거울)
 *  3. 서쪽 트렁크의 시계 자물쇠를 4:20에 맞춘다 → 양초, 시금치 통조림 (논리)
 *  4. 남쪽 책상 서랍의 성냥 + 양초 = 켜진 양초 (조합)
 *  5. 서쪽 빈 촛대에 켜진 양초 → 벽에 그림자 유령 똑딱이가 나타난다 (그림자·환경 변화)
 *  6. "시계가 제일 싫어하는 채소는?" → 시금치 통조림을 건넨다 (넌센스: 시(時)+금지)
 *  7. XIII 조각을 괘종시계 빈 자리에 → 13번 종이 울리고 문이 열린다
 */
(function () {
  const F = (s) => s.flags;
  const moon = (s) => !!s.flags.curtainOpen;

  function lockWidget(container, api, game) {
    const f = api.flags;
    if (f.lh === undefined) { f.lh = 12; f.lm = 0; }
    let box = container.querySelector('.clock-lock');
    if (box) box.remove();
    box = document.createElement('div');
    box.className = 'clock-lock';
    const hourAng = ((f.lh % 12) + f.lm / 60) * 30, minAng = f.lm * 6;
    const mk = (src, css, ang, origin) => { const im = document.createElement('img'); im.className = 'hand'; im.src = game.src(src); im.alt = ''; im.style.cssText = css + `;transform-origin:${origin};transform:rotate(${ang}deg)`; box.appendChild(im); };
    mk('zoom/hand_hour', 'left:770px;top:256px;width:60px;height:150px', hourAng, '30px 144px');
    mk('zoom/hand_min', 'left:780px;top:176px;width:40px;height:230px', minAng, '20px 224px');
    const knob = (src, left, label, fn) => {
      const b = document.createElement('button');
      b.className = 'knob'; b.style.left = left + 'px'; b.style.top = '470px';
      b.setAttribute('aria-label', label);
      const im = document.createElement('img'); im.src = game.src(src); im.alt = ''; b.appendChild(im);
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy || f.trunkOpen) return;
        if (game.s.sel) { api.say('그건 자물쇠에 쓸 수 없어.'); game.s.sel = null; game.render(); return; }
        fn(); api.sfx('tick');
        if (f.lh === 4 && f.lm === 20) {
          game.busy = true;
          setTimeout(() => { game.busy = false; f.trunkOpen = true; api.sfx('unlock'); api.say('철컥! 트렁크 뚜껑이 열렸어.'); game.s.zoom = 'trunkIn'; game.save(); game.render(); }, 600);
        }
        game.save(); game.render();
      };
      box.appendChild(b);
    };
    knob('zoom/knob_hour', 330, '짧은 바늘 돌리기', () => { f.lh = (f.lh % 12) + 1; });
    knob('zoom/knob_min', 1120, '긴 바늘 돌리기', () => { f.lm = (f.lm + 5) % 60; });
    container.appendChild(box);
  }

  function strike(api, game) {
    api.take('piece'); api.set('pieceIn');
    api.lock(8200);
    api.sfx('click');
    api.say('XIII 조각을 빈 자리에 딸깍 끼웠어…', 2000);
    for (let i = 0; i < 13; i++) setTimeout(() => window.Sfx && window.Sfx.play('bong'), 1300 + i * 480);
    api.after(1500, () => api.say('뎅… 뎅… 뎅… 괘종시계가 열세 번 울려!', 5000));
    api.after(1300 + 13 * 480 + 600, () => {
      api.set('struck'); api.set('doorOpen');
      game.s.zoom = null; game.s.view = 'north';
      api.sfx('door');
      api.say('똑딱: “고마워! 드디어 13시야. 다락방 문이 열렸어!”', 4200);
    });
  }

  Engine.registerRoom({
    id: 'clock13',
    chapter: '3장',
    title: '열세 번째 시계',
    assets: 'assets/rooms/clock13/',
    sky: ['assets/rooms/clock13/bg/north.svg', 'assets/rooms/clock13/bg/north.svg'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: moon,
    dim: { color: '#141a33', opacity: 0.66 },
    dimLit: { color: '#2c3762', opacity: 0.36 },
    guide: { name: '그림자 유령 똑딱', img: 'props/ghost_icon' },
    intro: '낡은 시계탑 다락방이야. 똑… 딱… 어디선가 누가 소곤거리는 소리가 들려.',

    items: {
      candle: { name: '양초', img: 'items/candle', desc: '하얀 양초. 심지에 불을 붙이면 환해질 거야.' },
      matches: { name: '성냥', img: 'items/matches', desc: '빨간 성냥갑. 한 번 그으면 치익 불이 붙어.' },
      candle_lit: { name: '켜진 양초', img: 'items/candle_lit', desc: '따뜻한 촛불이 일렁여. 그림자가 길게 늘어져.' },
      can: { name: '시금치 통조림', img: 'items/can', desc: '초록 잎이 그려진 통조림. 「시금치」라고 쓰여 있어.' },
      piece: { name: 'XIII 숫자판 조각', img: 'items/piece', desc: '로마 숫자 XIII(13)이 새겨진 황동 조각. 시계에 끼우는 거야.' },
    },
    combos: [
      { a: 'matches', b: 'candle', result: 'candle_lit', say: '성냥을 치익 그어 양초에 불을 붙였어.' },
    ],

    views: {
      /* ───── 북쪽: 괘종시계와 다락방 문 ───── */
      north: {
        bg: 'bg/north',
        objects: [
          { id: 'boxes', x: 0, y: 0, w: 0, h: 0, img: '', hit: [200, 450, 140, 190], look: '오래된 모자 상자들. 먼지가 뽀얗게 쌓여 있어.' },
          { id: 'picture', x: 0, y: 0, w: 0, h: 0, img: '', hit: [270, 222, 150, 220], look: '달밤의 시계탑 그림. 바로 이 다락방이 있는 탑이야.' },
          { id: 'spider', img: 'props/spider', x: 168, y: 300, w: 40, h: 66, cls: 'bob', look: '조그만 거미가 대롱대롱. 인사하듯 다리를 흔들어.' },
          {
            id: 'clock', img: (s) => (F(s).pieceIn ? 'props/clock_full' : 'props/clock'), x: 640, y: 80, w: 320, h: 620, hit: [660, 90, 280, 600], label: '괘종시계',
            click: (api) => { api.sfx('step'); api.zoom('clock'); },
          },
          { id: 'pendStill', img: 'props/pendulum', x: 770, y: 414, w: 60, h: 180, show: (s) => !F(s).struck },
          { id: 'pendSwing', img: 'props/pendulum', x: 770, y: 414, w: 60, h: 180, cls: 'swing', show: (s) => !!F(s).struck },
          {
            id: 'door', img: (s) => (F(s).doorOpen ? 'props/door_open' : 'props/door_closed'), x: 1140, y: 262, w: 240, h: 380, label: '다락방 문',
            click: (api) => {
              if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; }
              api.sfx('locked'); api.say('잠겨 있어. 문에 달린 작은 시계 자물쇠가 12시에 멈춰 있어.');
            },
            wrong: '문에는 열쇠 구멍이 없어. 시계 자물쇠가 저절로 돌아가야 열리나 봐.',
          },
        ],
      },

      /* ───── 동쪽: 둥근 창과 책장 ───── */
      east: {
        bg: 'bg/east',
        objects: [
          { id: 'shelf', x: 0, y: 0, w: 0, h: 0, img: '', hit: [190, 250, 270, 390], look: '낡은 책들이 빼곡해. 제목이 너무 바래서 읽을 수가 없어.' },
          { id: 'window', img: 'props/window', x: 610, y: 140, w: 380, h: 380, show: moon, look: '둥근 달이 떴어. 멀리 지붕들이 보여.' },
          {
            id: 'curtains', img: (s) => (moon(s) ? 'props/curtains_open' : 'props/curtains_closed'), x: 540, y: 100, w: 520, h: 490, hit: [560, 110, 480, 460], label: '커튼',
            click: (api) => {
              if (api.flags.curtainOpen) { api.say('커튼을 활짝 열어 두었어. 달빛이 쏟아져.'); return; }
              api.set('curtainOpen'); api.sfx('curtain');
              api.say('커튼을 걷자 달빛이 다락방 가득 쏟아져… 어? 벽에서 무언가 빛나!', 4200);
            },
          },
          { id: 'beam', img: 'bg/moonbeam_east', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: moon },
          { id: 'glow', img: 'props/glow', x: 1090, y: 240, w: 300, h: 200, show: moon, cls: 'flicker', label: '빛나는 글씨', click: (api) => { api.set('glowRead'); api.sfx('shine'); api.zoom('glow'); } },
          { id: 'dish', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1270, 580, 120, 50], look: '촛농이 굳은 빈 접시. 초는 다 타 버렸어.' },
        ],
      },

      /* ───── 남쪽: 큰 거울과 책상 ───── */
      south: {
        bg: 'bg/south',
        objects: [
          {
            id: 'mirror', img: (s) => (moon(s) ? 'props/mirror_moon' : 'props/mirror_dark'), x: 610, y: 90, w: 380, h: 480, label: '큰 거울',
            click: (api) => { if (api.flags.curtainOpen) api.set('mirrorSeen'); api.sfx('step'); api.zoom('mirror'); },
          },
          { id: 'desk', img: 'props/desk', x: 170, y: 380, w: 400, h: 330, hit: [170, 440, 400, 60], look: '잉크병, 깃펜, 모래시계가 놓인 책상. 가운데에 서랍이 있어.' },
          { id: 'drawer', x: 0, y: 0, w: 0, h: 0, img: '', hit: [230, 530, 280, 66], zoom: 'drawer', label: '책상 서랍' },
          { id: 'chair', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1050, 330, 330, 370], look: '하얀 천을 뒤집어쓴 게… 유령인 줄 알았는데 그냥 안락의자야. 휴.' },
        ],
      },

      /* ───── 서쪽: 트렁크, 촛대, 그림자 벽 ───── */
      west: {
        bg: 'bg/west',
        objects: [
          { id: 'jars', x: 0, y: 0, w: 0, h: 0, img: '', hit: [200, 220, 320, 100], look: '먼지 쌓인 유리병들. 단추, 구슬, 마른 꽃잎이 들어 있어.' },
          { id: 'wall', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1000, 150, 420, 380], show: (s) => !F(s).candlePlaced, label: '어두운 벽',
            click: (api) => { api.sfx('whisper'); api.say('누가 소곤소곤… “너무 깜깜해… 불빛이 있으면 내 그림자라도 보여 줄 텐데.”', 4400); } },
          { id: 'glowC', img: 'bg/candleglow_west', x: 0, y: 0, w: 1600, h: 900, cls: 'glow flicker', show: (s) => !!F(s).candlePlaced },
          {
            id: 'ghost', img: (s) => (F(s).pieceGiven ? 'props/ghost_happy' : F(s).riddleAsked ? 'props/ghost_talk' : 'props/ghost_shy'), x: 1020, y: 150, w: 360, h: 380, cls: 'float',
            show: (s) => !!F(s).candlePlaced, hit: [1060, 150, 290, 370], label: '그림자 유령 똑딱',
            click: (api) => {
              const f = api.flags;
              api.sfx('whisper');
              if (f.struck) { api.say('똑딱: “13시가 되면 나도 그림자 밖으로 산책을 나갈 수 있어. 고마워!”'); return; }
              if (f.pieceGiven) { api.say('똑딱: “그 조각을 괘종시계 빈 자리에 끼워 줘!”'); return; }
              if (!f.riddleAsked) {
                f.riddleAsked = true;
                api.lock(4200);
                api.say('똑딱: “아, 안녕… 나는 수줍음 많은 그림자 똑딱이야. 시계의 13번째 숫자를 내가 갖고 있어.”', 4200);
                api.after(4200, () => api.say('똑딱: “내 수수께끼를 맞히면 줄게! 시계가 제일 싫어하는 채소는 뭘까?”', 6000));
                return;
              }
              api.say('똑딱: “시계가 제일 싫어하는 채소는? 시계(時)가… 먹지 말라고 ‘금지’하는 채소!”', 5000);
            },
            use: {
              can: (api, n) => {
                if (!api.flags.riddleAsked) { api.say('똑딱이가 수줍어서 얼굴을 가리고 있어. 먼저 말을 걸어 보자.'); return; }
                api.take('can'); api.set('pieceGiven'); api.sfx('combine');
                api.say('똑딱: “시(時)금치! 시계가 금지하는 채소! 히히, 정답이야!”', 3600);
                api.after(1600, () => { api.give('piece', n); });
              },
            },
            wrong: '똑딱: “그건 채소가 아니잖아~”',
          },
          {
            id: 'stand', img: (s) => (F(s).candlePlaced ? 'props/stand_lit' : 'props/stand_empty'), x: 860, y: 300, w: 140, h: 400, label: '빈 촛대',
            look: (s) => (F(s).candlePlaced ? '촛불이 일렁이며 벽에 그림자를 만들어.' : '초가 꽂혀 있지 않은 쇠 촛대야.'),
            use: {
              candle_lit: (api) => { api.take('candle_lit'); api.set('candlePlaced'); api.sfx('match'); api.say('촛대에 촛불을 꽂자… 벽에 커다란 그림자가 나타났어!', 4000); },
              candle: (api) => api.say('양초에 불이 안 붙어 있어. 먼저 불을 붙여야 해.'),
            },
          },
          {
            id: 'trunk', img: (s) => (F(s).trunkOpen ? 'props/trunk_open' : 'props/trunk_closed'), x: 220, y: 430, w: 400, h: 280, label: '낡은 트렁크',
            click: (api) => { api.sfx('step'); api.zoom(api.flags.trunkOpen ? 'trunkIn' : 'lock'); },
          },
        ],
      },
    },

    zooms: {
      glow: {
        bg: 'zoom/glowwall', dim: 0.1, dimLit: 0.05, textClass: 'glow',
        text: '<p>거울 속 시계만<br>바른 시간을 말해요</p><p class="sign">— 똑딱</p>',
      },
      mirror: {
        bg: (s) => (moon(s) ? 'zoom/mirror_moon' : 'zoom/mirror_dark'), dimLit: 0.1,
        objects: [{ id: 'mirrorHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [420, 80, 760, 740],
          look: (s) => (moon(s) ? '거울 속 시계는 숫자가 바르게 보여. 짧은 바늘은 IV(4), 긴 바늘도 IV를 가리켜. 긴 바늘이 IV면 20분… 4시 20분이야!' : '너무 어두워서 거울에 아무것도 안 비쳐.') }],
      },
      clock: {
        bg: (s) => (F(s).pieceIn ? 'zoom/clock_full' : 'zoom/clock'), dimLit: 0.1,
        objects: [
          { id: 'faceHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [440, 90, 720, 720], look: '숫자가 거꾸로 돌고, 글자도 거울처럼 뒤집혀 있어. 맨 위 XII 아래에 숫자 조각이 들어갈 빈 자리가 있어.' },
          {
            id: 'slot', x: 0, y: 0, w: 0, h: 0, img: '', hit: [720, 262, 160, 76], show: (s) => !F(s).pieceIn, label: '빈 숫자 자리',
            look: '숫자 조각 하나가 쏙 들어갈 만한 빈자리야.',
            use: { piece: (api) => strike(api, window.__game) },
          },
        ],
      },
      lock: { bg: 'zoom/trunk_lock', widget: lockWidget, dimLit: 0.1,
        objects: [{ id: 'lockHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 680, 480, 120], look: '바늘이 달린 시계 자물쇠야. 양옆 손잡이로 짧은 바늘과 긴 바늘을 돌릴 수 있어.' }] },
      trunkIn: {
        bg: 'zoom/trunk_open', dimLit: 0.1,
        objects: [
          { id: 'letters', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 540, 240, 170], look: '빨간 끈으로 묶인 옛 편지들. 소중한 거니까 그대로 두자.' },
          { id: 'candleIn', img: 'items/candle', x: 600, y: 280, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).candleTaken, label: '양초', click: (api, n) => { api.set('candleTaken'); api.give('candle', n); api.say('양초를 챙겼어.'); } },
          { id: 'canIn', img: 'items/can', x: 870, y: 290, w: 230, h: 230, cls: 'item-in', show: (s) => !F(s).canTaken, label: '시금치 통조림', click: (api, n) => { api.set('canTaken'); api.give('can', n); api.say('시금치 통조림을 챙겼어. 왜 트렁크에 통조림이…?'); } },
        ],
      },
      drawer: {
        bg: 'zoom/drawer', dimLit: 0.1,
        objects: [{ id: 'matchesIn', img: 'items/matches', x: 680, y: 340, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).matchesTaken, label: '성냥', click: (api, n) => { api.set('matchesTaken'); api.give('matches', n); api.say('성냥을 챙겼어.'); } }],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (!f.curtainOpen) return { key: 'curtain', steps: ['다락방이 너무 깜깜해요. 빛이 들어올 곳이 있을까요?', '동쪽 벽 둥근 창이 두꺼운 커튼으로 가려져 있어요.', '동쪽 커튼을 눌러 열어 보세요.'] };
      if (!f.trunkOpen) {
        if (!f.glowRead) return { key: 'glow', steps: ['달빛이 들자 벽 어딘가에 빛나는 글씨가 나타났어요.', '동쪽 창 오른쪽 벽을 보세요.', '빛나는 글씨를 눌러 읽어 보세요.'] };
        if (!f.mirrorSeen) return { key: 'mirror', steps: ['북쪽 괘종시계는 숫자가 거꾸로라 읽기 어려워요.', '빛나는 글씨가 “거울 속 시계”라고 했어요. 남쪽 벽에 큰 거울이 있어요.', '남쪽 거울을 눌러 거울에 비친 시계를 읽어요.'] };
        return { key: 'trunk', steps: ['시간을 맞춰 여는 자물쇠가 있어요.', '서쪽 낡은 트렁크에 시계 자물쇠가 있어요. 거울 속 시계와 같은 시간으로 맞춰요.', '왼쪽 손잡이로 짧은 바늘을 IV(4)에, 오른쪽 손잡이로 긴 바늘을 IV(20분)에 맞추세요. 4시 20분!'] };
      }
      if (!f.candlePlaced) {
        if (!f.candleTaken || !f.canTaken) return { key: 'trunkIn', steps: ['트렁크가 열렸어요. 안을 살펴보세요.', '서쪽 트렁크를 눌러 안을 봐요.', '트렁크 속 양초와 시금치 통조림을 모두 챙기세요.'] };
        if (!has('candle_lit')) {
          if (!f.matchesTaken) return { key: 'matches', steps: ['양초에 불을 붙일 것이 필요해요.', '남쪽 책상 서랍을 열어 보세요.', '서랍 속 성냥을 챙긴 뒤, 성냥을 고른 채 가방 속 양초를 누르세요.'] };
          return { key: 'light', steps: ['양초와 성냥을 합쳐 보세요.', '가방에서 하나를 고르고 다른 하나를 눌러요.', '성냥을 고른 채 가방 속 양초를 누르세요.'] };
        }
        return { key: 'stand', steps: ['서쪽 벽에서 누가 “불빛이 있으면…” 하고 소곤거렸어요.', '서쪽에 초가 없는 빈 촛대가 있어요.', '켜진 양초를 고른 채 서쪽 촛대를 누르세요.'] };
      }
      if (!f.pieceGiven) {
        if (!f.riddleAsked) return { key: 'talk', steps: ['벽에 나타난 그림자는 무섭지 않아요. 수줍음이 많을 뿐이에요.', '그림자에게 말을 걸어 보세요.', '서쪽 벽의 그림자 유령을 누르세요.'] };
        return { key: 'riddle', steps: ['수수께끼: 시계가 제일 싫어하는 채소는?', '시계는 한자로 “시(時)”. 시계가 먹지 말라고 “금지”하는 채소… 시 + 금지 = ?', '시금치 통조림을 고른 채 똑딱이 그림자를 누르세요.'] };
      }
      if (!f.pieceIn) return { key: 'piece', steps: ['XIII 조각을 어디에 끼울까요?', '북쪽 괘종시계 위쪽, XII 아래에 빈 자리가 있어요.', '괘종시계를 눌러 확대하고, XIII 조각을 고른 채 빈 자리를 누르세요.'] };
      return { key: 'out', steps: ['문이 열렸어요!', '북쪽 다락방 문으로 나가 보세요.', '북쪽 문을 누르세요.'] };
    },

    ending: {
      title: '열세 번째 종소리',
      text: ['뎅— 열세 번째 종이 울리자 다락방의 먼지가 반짝이며 춤을 췄어요.', '똑딱이는 처음으로 그림자 밖으로 나와 달빛 아래에서 빙그르르 돌았답니다.', '문 밖 계단을 오르니… 어라? 하늘이 발밑에, 땅이 머리 위에 있어요.'],
      next: '다음 이야기 · 4장 거꾸로 된 세상',
    },
  });
})();
