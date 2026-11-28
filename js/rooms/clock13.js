/* 3장 「열세 번째 시계」
 * 퍼즐 흐름 (자세한 설계는 docs/PUZZLE_DESIGN.md)
 *  1. 동쪽 커튼을 열면 달빛 (환경 변화) → 벽에 야광 글씨 "거울 속 시계만 바른 시간을 말해요"
 *  2. 괘종시계는 숫자가 거꾸로 돌고 글자도 뒤집혀 짧은 바늘이 VI처럼 보인다 → 남쪽 거울 속에서는 IV(4) (거울)
 *  3. 서쪽 트렁크의 시계 자물쇠 짧은 바늘을 IV에 → 회중시계, 바늘 꽂힌 실패 (논리)
 *  갈래 A: 실을 다 써 버린 거미에게 실패를 주면 작은 서랍 열쇠 → 책상 서랍의 성냥 (예상 밖의 쓰임)
 *  갈래 B: 양초는 처음부터 촛대 옆 선반에 있다
 *  4. 성냥 + 양초 = 켜진 양초 (조합) → 서쪽 빈 촛대 → 벽에 그림자 유령 똑딱이 (그림자·환경 변화)
 *  5. "바늘이 두 개인데 바느질을 못 하고, 얼굴이 있는데 웃지 못하는 것은?" → 회중시계를 건넨다 (넌센스)
 *  6. XIII 조각을 괘종시계 빈 자리에 → 13번 종이 울리고 문이 열린다
 */
(function () {
  const F = (s) => s.flags;
  const moon = (s) => !!s.flags.curtainOpen;

  function lockWidget(container, api, game) {
    const f = api.flags;
    if (f.lh === undefined) f.lh = 12;
    let box = container.querySelector('.clock-lock');
    if (box) box.remove();
    box = document.createElement('div');
    box.className = 'clock-lock';
    const mk = (src, css, ang, origin) => { const im = document.createElement('img'); im.className = 'hand'; im.src = game.src(src); im.alt = ''; im.style.cssText = css + `;transform-origin:${origin};transform:rotate(${ang}deg)`; box.appendChild(im); };
    mk('zoom/hand_min', 'left:780px;top:176px;width:40px;height:230px', 0, '20px 224px');
    mk('zoom/hand_hour', 'left:770px;top:256px;width:60px;height:150px', (f.lh % 12) * 30, '30px 144px');
    const b = document.createElement('button');
    b.className = 'knob'; b.style.left = '1120px'; b.style.top = '470px';
    b.setAttribute('aria-label', '짧은 바늘 돌리기');
    const im = document.createElement('img'); im.src = game.src('zoom/knob_hour'); im.alt = ''; b.appendChild(im);
    b.onclick = (e) => {
      e.stopPropagation();
      if (game.busy || f.trunkOpen) return;
      if (game.s.sel) { api.say('그건 자물쇠에 쓸 수 없어.'); game.s.sel = null; game.render(); return; }
      f.lh = (f.lh % 12) + 1; api.sfx('tick');
      if (f.lh === 4) {
        f.trunkOpen = true; // 정답은 바로 기록
        game.busy = true;
        setTimeout(() => { game.busy = false; api.sfx('unlock'); api.say('철컥! 트렁크 뚜껑이 열렸어.'); game.s.zoom = 'trunkIn'; game.save(); game.render(); }, 600);
      }
      game.save(); game.render();
    };
    box.appendChild(b);
    container.appendChild(box);
  }

  function strike(api, game) {
    api.take('piece'); api.set('pieceIn');
    api.lock(8200);
    api.sfx('click');
    api.say('XIII 조각을 빈 자리에 딸깍 끼웠어…', 2000);
    for (let i = 0; i < 13; i++) {
      api.after(1300 + i * 480, () => { window.Sfx && window.Sfx.play('bong'); api.flash(i === 12 ? '#ffe9a8' : '#cfe0e6', 420); if (i % 3 === 0) api.burst('dust', 800, 450, 14); });
    }
    api.after(1500, () => api.say('뎅… 뎅… 뎅… 괘종시계가 열세 번 울려!', 5000));
    api.after(1300 + 13 * 480 + 600, () => {
      api.set('struck'); api.set('doorOpen');
      game.s.zoom = null; game.s.view = 'north';
      api.sfx('door');
      api.burst('spark', 1260, 420, 30);
      api.say('똑딱: “고마워! 드디어 13시야. 다락방 문이 열렸어!”', 4200);
    });
  }

  Engine.registerRoom({
    id: 'clock13',
    chapter: '3장',
    title: '열세 번째 시계',
    assets: 'assets/rooms/clock13/',
    sky: ['assets/rooms/clock13/bg/north.webp', 'assets/rooms/clock13/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    frame: 'bg/frame',
    start: 'north',
    isLit: moon,
    dim: { color: '#141a33', opacity: 0.5 },
    dimLit: { color: '#2c3762', opacity: 0.28 },
    ambient: () => 'attic',
    guide: { name: '그림자 유령 똑딱', img: 'props/ghost_icon' },
    intro: '낡은 시계탑 다락방이야. 똑… 딱… 어디선가 누가 소곤거리는 소리가 들려.',
    repair(s, fix) {
      const f = s.flags;
      if (f.pieceGiven && !f.pieceIn && !fix.has('piece')) fix.give('piece');
      if (f.pieceIn && !f.struck) { fix.set('struck'); fix.set('doorOpen'); }
      if (f.spiderFed && !f.drawerOpen && !fix.has('smallkey')) fix.give('smallkey');
    },

    items: {
      candle: { name: '양초', img: 'items/candle', desc: '하얀 양초. 심지에 불을 붙이면 환해질 거야.' },
      matches: { name: '성냥', img: 'items/matches', desc: '빨간 성냥갑. 한 번 그으면 치익 불이 붙어.' },
      candle_lit: { name: '켜진 양초', img: 'items/candle_lit', desc: '따뜻한 촛불이 일렁여. 그림자가 길게 늘어져.' },
      watch: { name: '회중시계', img: 'items/watch', desc: '뚜껑 달린 작은 시계. 짧은 바늘과 긴 바늘이 있고, 동그란 얼굴(문자판)이 있어.' },
      spool: { name: '바늘 꽂힌 실패', img: 'items/spool', desc: '보라색 실이 감긴 실패. 바늘이 꽂혀 있어서 바느질을 할 수 있어.' },
      smallkey: { name: '작은 서랍 열쇠', img: 'items/smallkey', desc: '거미가 매달고 있던 구리 열쇠. 책상 서랍 크기야.' },
      piece: { name: 'XIII 숫자판 조각', img: 'items/piece', desc: '로마 숫자 XIII(13)이 새겨진 황동 조각. 시계에 끼우는 거야.' },
    },
    combos: [
      { a: 'matches', b: 'candle', result: 'candle_lit', say: '성냥을 치익 그어 양초에 불을 붙였어.' },
      { a: 'spool', b: 'candle', say: '실로 양초를 묶어 봤자 불은 안 붙어.' },
    ],

    views: {
      /* ───── 북쪽: 괘종시계와 다락방 문 ───── */
      north: {
        name: '괘종시계 벽',
        bg: 'bg/north',
        objects: [
          { id: 'boxes', x: 0, y: 0, w: 0, h: 0, img: '', hit: [200, 450, 140, 190], label: '모자 상자', look: '오래된 모자 상자들. 먼지가 뽀얗게 쌓여 있어.' },
          { id: 'picture', x: 0, y: 0, w: 0, h: 0, img: '', hit: [270, 222, 150, 220], label: '시계탑 그림', look: '달밤의 시계탑 그림. 바로 이 다락방이 있는 탑이야.' },
          {
            id: 'spider', img: 'props/spider_key', x: 168, y: 300, w: 40, h: 120, cls: 'bob', label: '작은 거미', show: (s) => !F(s).spiderFed,
            hit: [140, 290, 100, 140],
            click: (api) => {
              if (api.flags.spiderFed) { api.say('거미가 새 실로 거미줄을 짜고 있어. 신났나 봐.'); return; }
              api.say('작은 거미가 거미줄 끝에 작은 열쇠를 대롱대롱 매달고 있어. 거미: “실이 다 떨어져서 거미줄을 못 짜겠어…”', 5200, { note: '실이 떨어진 거미' });
            },
            use: {
              spool: (api, n) => { api.take('spool'); api.set('spiderFed'); api.give('smallkey', n); api.sfx('combine'); api.say('거미: “와, 실이다! 고마워. 이 열쇠는 너 가져!” 작은 서랍 열쇠를 받았어.', 4400); },
              candle: (api) => api.say('거미가 촛불이 무섭대. 다른 걸 주자.'),
            },
            wrong: '거미가 고개를 갸웃해. 그건 거미줄 재료가 아닌가 봐.',
          },
          { id: 'spiderHappy', img: 'props/spider', x: 168, y: 300, w: 40, h: 66, cls: 'bob', show: (s) => !!F(s).spiderFed, label: '작은 거미', look: '거미가 새 실로 거미줄을 짜고 있어. 신났나 봐.' },
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
              api.sfx('locked'); api.say('잠겨 있어. 문에 달린 작은 시계 자물쇠가 12시에 멈춰 있어. 괘종시계가 움직여야 열릴 것 같아.');
            },
            wrong: '문에는 열쇠 구멍이 없어. 시계 자물쇠가 저절로 돌아가야 열리나 봐.',
          },
        ],
      },

      /* ───── 동쪽: 둥근 창과 책장 ───── */
      east: {
        name: '둥근 창 벽',
        bg: 'bg/east',
        objects: [
          { id: 'shelf', x: 0, y: 0, w: 0, h: 0, img: '', hit: [190, 250, 270, 390], label: '책장', look: '낡은 책들이 빼곡해. 제목이 너무 바래서 읽을 수가 없어.' },
          { id: 'window', img: 'props/window', x: 610, y: 140, w: 380, h: 380, show: moon, look: '둥근 달이 떴어. 멀리 지붕들이 보여.' },
          {
            id: 'curtains', img: (s) => (moon(s) ? 'props/curtains_open' : 'props/curtains_closed'), x: 540, y: 100, w: 520, h: 490, hit: [560, 110, 480, 460], label: '커튼',
            click: (api) => {
              if (api.flags.curtainOpen) { api.say('커튼을 활짝 열어 두었어. 달빛이 쏟아져.'); return; }
              api.set('curtainOpen'); api.sfx('curtain'); api.flash('#cfe0e6', 1200);
              api.say('커튼을 걷자 달빛이 다락방 가득 쏟아져… 어? 벽에서 무언가 빛나!', 4200);
            },
          },
          { id: 'beam', img: 'bg/moonbeam_east', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: moon },
          { id: 'glow', img: 'props/glow', x: 1090, y: 240, w: 300, h: 200, show: moon, cls: 'flicker', label: '빛나는 글씨', click: (api) => { api.set('glowRead'); api.sfx('shine'); api.zoom('glow'); } },
          { id: 'dish', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1270, 580, 120, 50], label: '빈 촛대 접시', look: '촛농이 굳은 빈 접시. 초는 다 타 버렸어.' },
        ],
      },

      /* ───── 남쪽: 큰 거울과 책상 ───── */
      south: {
        name: '거울 벽',
        bg: 'bg/south',
        objects: [
          {
            id: 'mirror', img: (s) => (moon(s) ? 'props/mirror_moon' : 'props/mirror_dark'), x: 610, y: 90, w: 380, h: 480, label: '큰 거울',
            click: (api) => { if (api.flags.curtainOpen) api.set('mirrorSeen'); api.sfx('step'); api.zoom('mirror'); },
          },
          { id: 'desk', img: 'props/desk', x: 170, y: 380, w: 400, h: 330, hit: [170, 440, 400, 60], label: '책상', look: '잉크병, 깃펜, 모래시계가 놓인 책상. 가운데에 서랍이 있어.' },
          { id: 'dlock', img: 'props/drawer_lock', x: 340, y: 540, w: 60, h: 50, show: (s) => !F(s).drawerOpen },
          {
            id: 'drawer', x: 0, y: 0, w: 0, h: 0, img: '', hit: [230, 530, 280, 66], label: '책상 서랍',
            click: (api) => { if (!api.flags.drawerOpen) { api.sfx('locked'); api.say('서랍이 잠겨 있어. 아주 작은 열쇠 구멍이 있어.'); return; } api.sfx('step'); api.zoom('drawer'); },
            use: { smallkey: (api) => { api.take('smallkey'); api.set('drawerOpen'); api.sfx('unlock'); api.say('딸깍! 작은 열쇠로 서랍이 열렸어.'); api.zoom('drawer'); } },
          },
          { id: 'chair', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1050, 330, 330, 370], label: '천을 덮은 의자', look: '하얀 천을 뒤집어쓴 게… 유령인 줄 알았는데 그냥 안락의자야. 휴.' },
        ],
      },

      /* ───── 서쪽: 트렁크, 촛대, 그림자 벽 ───── */
      west: {
        name: '트렁크 벽',
        bg: 'bg/west',
        objects: [
          { id: 'jars', x: 0, y: 0, w: 0, h: 0, img: '', hit: [200, 220, 320, 100], label: '유리병 선반', look: '먼지 쌓인 유리병들. 단추, 구슬, 마른 꽃잎이 들어 있어.' },
          { id: 'candleShelf', img: 'items/candle', x: 520, y: 236, w: 70, h: 70, show: (s) => !F(s).candleTaken, label: '양초', click: (api, n) => { api.set('candleTaken'); api.give('candle', n); api.say('선반 끝에 있던 양초를 챙겼어.'); } },
          { id: 'wall', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1000, 150, 420, 380], show: (s) => !F(s).candlePlaced, label: '어두운 벽',
            click: (api) => { api.sfx('whisper'); api.say('누가 소곤소곤… “너무 깜깜해… 불빛이 있으면 내 그림자라도 보여 줄 텐데.”', 4400, { note: '어두운 벽의 소곤거림' }); } },
          { id: 'glowC', img: 'bg/candleglow_west', x: 0, y: 0, w: 1600, h: 900, cls: 'glow flicker', show: (s) => !!F(s).candlePlaced },
          {
            id: 'ghost', img: (s) => (F(s).pieceGiven ? 'props/ghost_happy' : F(s).riddleAsked ? 'props/ghost_talk' : 'props/ghost_shy'), x: 1020, y: 150, w: 360, h: 380, cls: 'float', blink: (s) => (F(s).pieceGiven ? null : F(s).riddleAsked ? 'props/ghost_talk_blink' : 'props/ghost_shy_blink'),
            show: (s) => !!F(s).candlePlaced, hit: [1060, 150, 290, 370], label: '그림자 유령 똑딱',
            click: (api) => {
              const f = api.flags;
              api.sfx('whisper');
              if (f.struck) { api.say('똑딱: “13시가 되면 나도 그림자 밖으로 산책을 나갈 수 있어. 고마워!”', 0, { who: 'ghost' }); return; }
              if (f.pieceGiven) { api.say('똑딱: “그 조각을 괘종시계 빈 자리에 끼워 줘!”', 0, { who: 'ghost' }); return; }
              if (!f.riddleAsked) {
                f.riddleAsked = true;
                api.lock(4200);
                api.say('똑딱: “아, 안녕… 나는 수줍음 많은 그림자 똑딱이야. 시계의 13번째 숫자를 내가 갖고 있어.”', 4200, { who: 'ghost' });
                api.after(4200, () => api.say('똑딱: “수수께끼! 바늘이 두 개인데 바느질은 못 하고, 얼굴이 있는데 웃지 못하는 건 뭘까? 그걸 가져다줘!”', 7000, { who: 'ghost', note: '똑딱이의 수수께끼' }));
                return;
              }
              api.say('똑딱: “바늘이 두 개인데 바느질은 못 하고, 얼굴이 있는데 웃지 못하는 것! 그걸 가져다줘.”', 6000, { who: 'ghost' });
            },
            use: {
              watch: (api, n) => {
                if (!api.flags.riddleAsked) { api.say('똑딱이가 수줍어서 얼굴을 가리고 있어. 먼저 말을 걸어 보자.'); return; }
                api.take('watch'); api.set('pieceGiven'); api.give('piece', n); api.sfx('combine');
                api.say('똑딱: “맞아, 시계! 바늘은 있어도 바느질은 못 하고, 얼굴은 있어도 웃지 못하지. 히히, 정답 선물이야!”', 5200, { who: 'ghost' });
              },
              spool: (api) => api.say('똑딱: “땡~ 그 바늘로는 바느질을 할 수 있잖아!”', 0, { who: 'ghost' }),
              candle_lit: (api) => api.say('똑딱: “으앗, 너무 가까워! 촛불은 촛대에 꽂아 줘.”', 0, { who: 'ghost' }),
            },
            wrong: '똑딱: “음… 그건 아니야. 바늘이 두 개, 얼굴이 하나!”',
          },
          {
            id: 'stand', img: (s) => (F(s).candlePlaced ? 'props/stand_lit' : 'props/stand_empty'), x: 860, y: 300, w: 140, h: 400, label: '빈 촛대',
            look: (s) => (F(s).candlePlaced ? '촛불이 일렁이며 벽에 그림자를 만들어.' : '초가 꽂혀 있지 않은 쇠 촛대야.'),
            use: {
              candle_lit: (api) => { api.take('candle_lit'); api.set('candlePlaced'); api.sfx('match'); api.burst('spark', 930, 300, 16); api.say('촛대에 촛불을 꽂자… 벽에 커다란 그림자가 나타났어!', 4000); },
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
        note: ['빛나는 글씨', '거울 속 시계만 바른 시간을 말해요. — 똑딱'],
        text: '<p>거울 속 시계만<br>바른 시간을 말해요</p><p class="sign">— 똑딱</p>',
      },
      mirror: {
        bg: (s) => (moon(s) ? 'zoom/mirror_moon' : 'zoom/mirror_dark'), dimLit: 0.1,
        note: (s) => (moon(s) ? ['거울 속 시계', '거울에 비친 시계의 짧은 바늘은 IV(4)를 가리킨다.'] : null),
        objects: [{ id: 'mirrorHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [420, 80, 760, 740], label: '거울',
          look: (s) => (moon(s) ? '거울 속 시계는 숫자가 바르게 보여. 짧은 바늘이 IV를 가리켜. IV는 4야!' : '너무 어두워서 거울에 아무것도 안 비쳐.') }],
      },
      clock: {
        bg: (s) => (F(s).pieceIn ? 'zoom/clock_full' : 'zoom/clock'), dimLit: 0.1,
        objects: [
          { id: 'faceHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [440, 90, 720, 720], label: '시계판', look: '숫자가 거꾸로 돌고 글자도 거울처럼 뒤집혀 있어. 짧은 바늘 쪽 숫자가 VI처럼 보이는데… 믿어도 될까? 맨 위 XII 아래에 숫자 조각 빈 자리가 있어.' },
          {
            id: 'slot', x: 0, y: 0, w: 0, h: 0, img: '', hit: [720, 262, 160, 76], show: (s) => !F(s).pieceIn, label: '빈 숫자 자리',
            look: '숫자 조각 하나가 쏙 들어갈 만한 빈자리야.',
            use: { piece: (api) => strike(api, api.game) },
          },
        ],
      },
      lock: { bg: 'zoom/trunk_lock', widget: lockWidget, dimLit: 0.1,
        objects: [{ id: 'lockHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 680, 480, 120], label: '시계 자물쇠', look: '짧은 바늘만 움직이는 시계 자물쇠야. 오른쪽 손잡이를 누를 때마다 짧은 바늘이 한 칸씩 돌아가.' }] },
      trunkIn: {
        bg: 'zoom/trunk_open', dimLit: 0.1,
        objects: [
          { id: 'letters', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 540, 240, 170], label: '옛 편지', look: '빨간 끈으로 묶인 옛 편지들. 소중한 거니까 그대로 두자.' },
          { id: 'watchIn', img: 'items/watch', x: 600, y: 280, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).watchTaken, label: '회중시계', click: (api, n) => { api.set('watchTaken'); api.give('watch', n); api.say('회중시계를 챙겼어. 똑딱똑딱 아직 가고 있어.'); } },
          { id: 'spoolIn', img: 'items/spool', x: 880, y: 290, w: 220, h: 220, cls: 'item-in', show: (s) => !F(s).spoolTaken, label: '바늘 꽂힌 실패', click: (api, n) => { api.set('spoolTaken'); api.give('spool', n); api.say('바늘이 꽂힌 실패를 챙겼어.'); } },
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
        if (!f.mirrorSeen) return { key: 'mirror', steps: ['북쪽 괘종시계는 글자가 뒤집혀서 읽기 어려워요.', '빛나는 글씨가 “거울 속 시계”라고 했어요. 남쪽 벽에 큰 거울이 있어요.', '남쪽 거울을 눌러 거울에 비친 시계의 짧은 바늘을 보세요.'] };
        return { key: 'trunk', steps: ['시간을 맞춰 여는 자물쇠가 있어요.', '서쪽 낡은 트렁크의 시계 자물쇠예요. 거울 속 시계와 같은 곳으로 짧은 바늘을 돌려요.', '오른쪽 손잡이를 눌러 짧은 바늘을 IV(4)에 맞추세요.'] };
      }
      if (!f.candlePlaced) {
        if (!f.watchTaken || !f.spoolTaken) return { key: 'trunkIn', steps: ['트렁크가 열렸어요. 안을 살펴보세요.', '서쪽 트렁크를 눌러 안을 봐요.', '트렁크 속 회중시계와 실패를 모두 챙기세요.'] };
        if (!has('candle') && !has('candle_lit') && !f.candleTaken) return { key: 'candle', steps: ['불빛이 필요해요. 양초가 어디 있을까요?', '서쪽 선반 끝을 보세요.', '서쪽 유리병 선반 오른쪽 끝의 양초를 챙기세요.'] };
        if (!has('candle_lit')) {
          if (!f.matchesTaken) {
            if (!f.drawerOpen) {
              if (!f.spiderFed) return { key: 'spider', steps: ['양초에 불을 붙일 성냥은 남쪽 책상 서랍에 있어요. 그런데 서랍이 잠겨 있어요.', '북쪽 구석의 작은 거미가 열쇠를 매달고 있어요. 거미는 실이 다 떨어졌대요.', '바늘 꽂힌 실패를 고른 채 북쪽 거미를 누르세요.'] };
              return { key: 'drawer', steps: ['작은 서랍 열쇠가 생겼어요.', '남쪽 책상 서랍이에요.', '작은 서랍 열쇠를 고른 채 남쪽 책상 서랍을 누르세요.'] };
            }
            return { key: 'matches', steps: ['서랍이 열렸어요.', '서랍 안을 보세요.', '남쪽 책상 서랍 속 성냥을 챙기세요.'] };
          }
          return { key: 'light', steps: ['양초와 성냥을 합쳐 보세요.', '가방에서 하나를 고르고 다른 하나를 눌러요.', '성냥을 고른 채 가방 속 양초를 누르세요.'] };
        }
        return { key: 'stand', steps: ['서쪽 벽에서 누가 “불빛이 있으면…” 하고 소곤거렸어요.', '서쪽에 초가 없는 빈 촛대가 있어요.', '켜진 양초를 고른 채 서쪽 촛대를 누르세요.'] };
      }
      if (!f.pieceGiven) {
        if (!f.riddleAsked) return { key: 'talk', steps: ['벽에 나타난 그림자는 무섭지 않아요. 수줍음이 많을 뿐이에요.', '그림자에게 말을 걸어 보세요.', '서쪽 벽의 그림자 유령을 누르세요.'] };
        return { key: 'riddle', steps: ['바늘이 두 개인데 바느질은 못 하고, 얼굴이 있는데 웃지 못하는 것은?', '이 방에 아주 많은 물건이에요. 째깍째깍… 가방 속에도 하나 있어요.', '회중시계를 고른 채 똑딱이 그림자를 누르세요.'] };
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
