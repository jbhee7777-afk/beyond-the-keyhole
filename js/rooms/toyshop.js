/* 2장 「토끼의 장난감 공방」
 * 퍼즐 흐름 (자세한 설계는 docs/PUZZLE_DESIGN.md)
 *  1. 작업등을 켠다 (환경 변화: 인형극 화면에 빛)
 *  2. 나무 조각 셋을 돌려 토끼 그림자를 만든다 → 무대 서랍에서 고무줄 (공간지각·그림자)
 *  3. 미끄러운 병뚜껑에 고무줄을 감아 연다 → 치즈 (예상 밖의 쓰임, 실제 생활 요령)
 *  4. 쥐구멍의 생쥐 찍찍이에게 치즈 → 태엽 손잡이 (관찰: 등 뒤에 숨긴 손잡이)
 *  5. 깜짝 상자에 태엽 손잡이를 끼운다, 바늘꽂이의 시침핀을 원통에 쓴다 (도구)
 *  6. 수놓은 악보의 별 높이대로 원통에 핀을 꽂는다 (관찰·논리)
 *  7. 생일 노래 → 깜짝 상자 펑! → 모카가 깨어난다 (환경 변화: 커튼이 열리고 방이 환해짐)
 *  8. "문 열쇠? 당근이지!" → 당근 인형 + 실뜯개 = 당근 열쇠 (넌센스·조합)
 *  9. 당근 자물쇠 문을 열고 탈출
 */
(function () {
  const F = (s) => s.flags;
  const awake = (s) => !!s.flags.awake;
  const PATTERN = [2, 1, 0, 1, 2, 0]; // 0=위 1=가운데 2=아래 (서쪽 악보 자수와 같다)
  const NOTE = [784, 659, 523];
  const SOLVE_ROT = [0, 0, 0];

  // 그림자 조각: [이름, 이미지, 받침 위치 x, 너비, 높이, 그림자 배치(SIL 기준 x, y)]
  const PIECES = [
    { id: 'body', img: 'zoom/piece_body', peg: 560, w: 220, h: 170, sx: 0, sy: 140 },
    { id: 'head', img: 'zoom/piece_head', peg: 800, w: 150, h: 130, sx: 164, sy: 66 },
    { id: 'ears', img: 'zoom/piece_ears', peg: 1040, w: 100, h: 150, sx: 200, sy: -60 },
  ];
  const SH = { ox: 620, oy: 140, s: 1.15 };

  function shadowWidget(container, api, game) {
    const f = api.flags;
    f.rot = f.rot || [2, 1, 3];
    let box = container.querySelector('.shadow-play');
    if (box) box.remove();
    box = document.createElement('div');
    box.className = 'shadow-play';
    const screen = document.createElement('div');
    screen.className = 'shadow-screen' + (f.lampOn ? ' on' : '');
    box.appendChild(screen);
    PIECES.forEach((p, i) => {
      // 그림자
      if (f.lampOn) {
        const sh = document.createElement('img');
        sh.className = 'shadow-of' + (f.rot[i] === SOLVE_ROT[i] ? ' fit' : ''); // 맞는 방향이면 그림자가 또렷해진다 (단계적 보상)
        sh.src = game.src(p.img); sh.alt = '';
        sh.style.cssText = `left:${SH.ox + p.sx * SH.s - 450}px;top:${SH.oy + p.sy * SH.s - 50}px;width:${p.w * SH.s}px;height:${p.h * SH.s}px;transform:rotate(${f.rot[i] * 90}deg)`;
        screen.appendChild(sh);
      }
      // 나무 조각 (누르면 90도씩 돈다)
      const b = document.createElement('button');
      b.className = 'piece';
      b.setAttribute('aria-label', ['몸 조각', '머리 조각', '귀 조각'][i]);
      b.style.cssText = `left:${p.peg - p.w / 2}px;top:${600 - p.h - 6}px;width:${p.w}px;height:${p.h}px`;
      const im = document.createElement('img');
      im.src = game.src(p.img); im.alt = '';
      im.style.transform = `rotate(${f.rot[i] * 90}deg)`;
      b.appendChild(im);
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        if (f.shadowSolved) { api.say('토끼 그림자가 완성됐어!'); return; }
        f.rot[i] = (f.rot[i] + 1) % 4;
        api.sfx(f.lampOn && f.rot[i] === SOLVE_ROT[i] ? 'clink' : 'click');
        if (!f.lampOn && !f.toldDark) { f.toldDark = true; api.say('조각이 빙글 돌아갔어. 그런데 너무 어두워서 그림자가 안 보여.'); }
        if (f.lampOn && f.rot.every((r, k) => r === SOLVE_ROT[k])) {
          f.shadowSolved = true;
          api.sfx('combine');
          api.say('토끼 그림자 완성! 무대 아래 작은 서랍이 톡 열렸어.');
        }
        game.save(); game.render();
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  }

  function musicWidget(container, api, game) {
    const f = api.flags;
    f.pins = f.pins || [2, null, null, null, null, null];
    let box = container.querySelector('.music-box');
    if (box) box.remove();
    if (f.boxOpen) return;
    box = document.createElement('div');
    box.className = 'music-box';
    for (let c = 0; c < 6; c++) for (let r = 0; r < 3; r++) {
      const b = document.createElement('button');
      b.className = 'pin-cell';
      b.setAttribute('aria-label', `${c + 1}번째 줄 ${['위', '가운데', '아래'][r]} 칸`);
      b.style.cssText = `left:${548 + c * 85 - 40}px;top:${360 + r * 120 - 56}px`;
      if (f.pins[c] === r) {
        const im = document.createElement('img');
        im.src = game.src('zoom/pin'); im.alt = '';
        b.appendChild(im);
      }
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        if (game.s.sel === 'pins') { usePins(api); game.save(); game.render(); return; }
        if (game.s.sel) { api.say('그건 원통에 꽂을 수 없어.'); game.s.sel = null; game.render(); return; }
        if (!f.pinsReady) { api.say('꽂을 핀이 없어. 핀이 잔뜩 꽂힌 물건이 공방 어딘가에 있었는데…'); api.sfx('nope'); return; }
        f.pins[c] = f.pins[c] === r ? null : r;
        api.sfx('click');
        if (window.Sfx && f.pins[c] !== null) window.Sfx.notes([NOTE[r]]);
        game.save(); game.render();
      };
      box.appendChild(b);
    }
    container.appendChild(box);
  }
  function usePins(api) {
    api.take('pins'); api.set('pinsReady');
    api.sfx('pick');
    api.say('시침핀을 한 움큼 꺼냈어. 이제 원통 칸을 눌러 핀을 꽂을 수 있어.');
  }
  function crankTurn(api, game) {
    const f = api.flags;
    const seq = f.pins.map((r) => (r === null ? null : NOTE[r]));
    api.lock(2200);
    window.Sfx && window.Sfx.notes(seq);
    const right = f.pins.every((r, i) => r === PATTERN[i]);
    const count = f.pins.filter((r) => r !== null).length;
    if (!right) {
      api.after(1900, () => api.say(count <= 1 ? '띵… 한 음만 울리고 멈췄어. 원통에 핀이 거의 없어.' : '띵, 띵… 어딘가 이상한 노래야. 상자도 안 열려.'));
      return;
    }
    f.tuneRight = true; // 정답은 바로 기록 (끊겨도 repair가 마무리)
    api.after(1900, () => {
      f.boxOpen = true; f.awake = true; game.s.zoom = null; game.s.view = 'north';
      api.sfx('pop'); window.Sfx && window.Sfx.birthday && window.Sfx.birthday();
      api.anim('jbox', 'pop-up', 900);
      api.after(80, () => { api.burst('confetti', 690, 330, 70); api.flash('#fff4e0', 700); });
      api.lock(7600);
      api.say('펑! 깜짝 상자에서 토끼 인형이 튀어나왔어!', 2600);
      api.after(2600, () => { api.say('모카: “하아암… 이건 내 생일 노래잖아! 깨워 줘서 고마워!”', 3400, { who: 'mocha' }); });
      api.after(6000, () => api.say('모카: “문 열쇠가 어디 있냐고? 그건… 당근이지! 히히.”', 4400, { who: 'mocha', note: '모카의 대답' }));
      api.after(9800, () => { if (!f.carrotGiven) { f.carrotGiven = true; api.give('carrot'); } api.say('모카가 꼭 안고 있던 당근 인형을 건네줬어.', 3600); });
    });
  }

  Engine.registerRoom({
    id: 'toyshop',
    chapter: '2장',
    title: '토끼의 장난감 공방',
    assets: 'assets/rooms/toyshop/',
    sky: ['bg/outside_dim', 'bg/outside_day'],
    order: ['north', 'east', 'south', 'west'],
    frame: 'bg/frame',
    start: 'north',
    isLit: awake,
    ambient: (s) => (awake(s) ? 'party' : 'workshop'),
    repair(s, fix) {
      const f = s.flags;
      if (f.mouseFed && !f.crankAttached && !fix.has('crank')) fix.give('crank');
      if (f.tuneRight && !f.boxOpen) { fix.set('boxOpen'); fix.set('awake'); }
      if (f.awake && !f.carrotGiven) { fix.set('carrotGiven'); if (!fix.has('key') && !f.doorOpen) fix.give('carrot'); }
    },
    dim: { color: '#5b4470', opacity: 0.4 },
    guide: { name: '생쥐 찍찍이', img: 'props/mouse_peek' },
    intro: '모카의 장난감 공방에 놀러 왔는데, 모카가 낮잠을 자는 사이 문이 잠겨 버렸어.',

    items: {
      rubberband: { name: '고무줄', img: 'items/rubberband', desc: '인형극 줄을 묶던 알록달록 고무줄. 잘 늘어나고 착 감겨.' },
      cheese: { name: '치즈 조각', img: 'items/cheese', desc: '구멍이 송송 난 노란 치즈. 고소한 냄새가 나.' },
      crank: { name: '태엽 손잡이', img: 'items/crank', desc: '분홍 손잡이가 달린 작은 쇠 손잡이. 장난감 옆구리 구멍에 꽂아 돌리는 거야.' },
      pins: { name: '시침핀', img: 'items/pins', desc: '머리가 동글동글한 시침핀 한 묶음.' },
      ripper: { name: '실뜯개', img: 'items/ripper', desc: '바느질한 실을 톡톡 뜯을 때 쓰는 도구. 끝이 뾰족하니 조심!' },
      carrot: { name: '당근 인형', img: 'items/carrot', desc: '폭신한 당근 인형. 등에 바느질 자국이 있고, 안에 뭔가 딱딱한 게 만져져.', clue: true },
      key: { name: '당근 열쇠', img: 'items/key', desc: '손잡이가 당근 모양인 열쇠. 어디서 본 모양인데…' },
    },
    combos: [
      { a: 'ripper', b: 'carrot', result: 'key', say: '실뜯개로 바느질 자국을 톡톡 뜯었더니, 당근 속에서 열쇠가 나왔어! (모카: “이따 다시 꿰매면 돼~”)' },
    ],

    views: {
      /* ───── 북쪽: 모카의 의자와 문 ───── */
      north: {
        name: '모카의 의자 벽',
        bg: 'bg/north',
        objects: [
          { id: 'portrait', x: 0, y: 0, w: 0, h: 0, img: '', hit: [770, 220, 140, 160], label: '모카 그림', look: '모카의 옆모습 그림. 귀는 쫑긋 위로, 코는 오른쪽, 동그란 꼬리는 왼쪽!' },
          {
            id: 'mocha', img: (s) => (awake(s) ? 'props/mocha_awake' : 'props/mocha_sleep'), x: 170, y: 220, w: 400, h: 480, cls: 'breathe', blink: (s) => (awake(s) ? 'props/mocha_awake_blink' : null),
            hit: [210, 300, 330, 300], label: '모카',
            look: (s) => (awake(s) ? (s.inv.includes('carrot') ? '모카: “당근 인형을 잘 살펴봐. 등에 바느질 자국이 있지?”' : '모카: “공방에서 재미있게 놀았니?”') : '새근새근… 모카가 당근 인형을 꼭 안고 낮잠을 자. 흔들어도 안 깨.'),
          },
          { id: 'table', img: 'props/table', x: 590, y: 488, w: 200, h: 212 },
          {
            id: 'jbox', img: (s) => (F(s).boxOpen ? 'props/jbox_open' : 'props/jbox_closed'), x: 610, y: 204, w: 160, h: 340, hit: [620, 340, 150, 200], label: '깜짝 상자',
            click: (api) => { if (api.flags.boxOpen) { api.say('스프링 위에서 토끼 인형이 흔들흔들.'); return; } api.sfx('step'); api.zoom('jbox'); },
          },
          { id: 'crankS', img: 'props/crank_small', x: 748, y: 452, w: 40, h: 40, show: (s) => !!F(s).crankAttached && !F(s).boxOpen },
          {
            id: 'door', img: (s) => (F(s).doorOpen ? 'props/door_open' : 'props/door_closed'), x: 930, y: 220, w: 300, h: 420, label: '공방 문',
            click: (api) => {
              if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; }
              api.say('잠겨 있어. 자물쇠가 당근 모양이야.'); api.sfx('locked');
            },
            use: { key: (api) => { api.take('key'); api.set('doorOpen'); api.sfx('door'); api.say('딸깍! 문이 열렸어. 바깥에서 꽃향기가 들어와.'); } },
          },
          { id: 'note', img: 'props/note', x: 986, y: 330, w: 60, h: 70, show: (s) => !F(s).doorOpen, zoom: 'note', label: '문에 붙은 쪽지' },
        ],
      },

      /* ───── 동쪽: 작업대와 그림자 인형극 ───── */
      east: {
        name: '작업대 벽',
        bg: 'bg/east',
        objects: [
          { id: 'bench', img: 'props/bench', x: 190, y: 390, w: 900, h: 310, hit: [880, 470, 210, 60], look: '나무를 깎고 색칠하는 작업대. 깎다 만 나무 토끼가 있어.' },
          {
            id: 'theater', img: (s) => (F(s).shadowSolved ? 'props/theater_done' : F(s).lampOn ? 'props/theater_lit' : 'props/theater_dark'), x: 470, y: 205, w: 380, h: 300,
            zoom: 'theater', label: '그림자 인형극 무대',
          },
          {
            id: 'lamp', img: (s) => (F(s).lampOn ? 'props/lamp_on' : 'props/lamp_off'), x: 210, y: 205, w: 220, h: 300, hit: [220, 240, 200, 260], label: '빨간 작업등',
            click: (api) => { api.flags.lampOn = !api.flags.lampOn; api.sfx('click'); api.say(api.flags.lampOn ? '딸깍! 작업등이 인형극 무대를 환하게 비춰.' : '작업등을 껐어.'); },
          },
          { id: 'glow', img: 'bg/lampglow_east', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: (s) => !!F(s).lampOn },
          { id: 'mousePeek', img: 'props/mouse_peek', x: 1258, y: 566, w: 84, h: 80, show: (s) => !F(s).mouseFed, cls: 'bob', blink: 'props/mouse_peek_blink' },
          { id: 'mousehole', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1240, 550, 120, 95], zoom: 'mousehole', label: '쥐구멍' },
        ],
      },

      /* ───── 남쪽: 창문과 장난감 선반 ───── */
      south: {
        name: '장난감 선반 벽',
        bg: 'bg/south',
        objects: [
          { id: 'window', img: 'props/window_day', x: 600, y: 120, w: 400, h: 360, show: awake, look: '창밖에 꽃밭과 언덕이 보여.' },
          { id: 'curtains', img: (s) => (awake(s) ? 'props/curtains_open' : 'props/curtains_closed'), x: 540, y: 92, w: 520, h: 420, hit: [560, 110, 480, 360], look: (s) => (awake(s) ? '커튼이 활짝 열려서 햇살이 들어와.' : '낮잠 시간이라 커튼이 꼭 닫혀 있어.') },
          { id: 'shelfL', x: 0, y: 0, w: 0, h: 0, img: '', hit: [170, 120, 380, 510], look: '기차, 블록, 인형… 모카가 만든 장난감이 가득해.' },
          { id: 'shelfR', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1050, 120, 180, 510], look: '책이랑 공, 작은 기차가 있어. 선반 가운데에 유리병이 보여.' },
          {
            id: 'jar', img: (s) => (F(s).cheeseTaken ? 'props/jar_open' : 'props/jar_closed'), x: 1244, y: 252, w: 120, h: 140, label: '치즈 병',
            click: (api) => api.say(api.flags.cheeseTaken ? '텅 빈 유리병이야.' : '치즈가 든 유리병. 뚜껑이 꽉 닫혀 있고, 손이 미끄러워서 안 돌아가!'),
            use: {
              rubberband: (api, n) => { api.take('rubberband'); api.set('cheeseTaken'); api.sfx('jar'); api.give('cheese', n); api.say('뚜껑에 고무줄을 감으니까 손이 안 미끄러져! 끼릭, 뚜껑이 열렸어.'); },
            },
          },
          { id: 'horse', img: 'props/horse', x: 680, y: 520, w: 260, h: 220, cls: 'rock', origin: '50% 95%', look: '흔들 목마. 살짝 밀면 끄덕끄덕 흔들려.' },
        ],
      },

      /* ───── 서쪽: 재봉틀과 자수 악보 ───── */
      west: {
        name: '재봉틀 벽',
        bg: 'bg/west',
        objects: [
          { id: 'score', img: 'props/score', x: 650, y: 110, w: 480, h: 270, hit: [656, 156, 316, 214], zoom: 'score', label: '자수 액자' },
          { id: 'sewing', img: 'props/sewing', x: 450, y: 300, w: 700, h: 400, hit: [560, 320, 360, 160], look: '민트색 재봉틀. 만들다 만 노란 조끼가 걸려 있어.' },
          {
            id: 'pincushion', img: (s) => (F(s).pinsTaken ? 'props/pincushion_empty' : 'props/pincushion'), x: 470, y: 396, w: 100, h: 94, label: '토마토 바늘꽂이',
            click: (api, n) => { if (api.flags.pinsTaken) { api.say('핀은 이미 챙겼어.'); return; } api.set('pinsTaken'); api.give('pins', n); api.say('토마토 바늘꽂이에서 시침핀을 챙겼어.'); },
          },
          { id: 'tin', img: 'props/tin', x: 1020, y: 430, w: 120, h: 60, zoom: 'tin', label: '파란 반짇고리 통' },
          { id: 'dress', img: 'props/dressform', x: 1200, y: 240, w: 220, h: 460, look: '보라 조끼를 입은 마네킹. 줄자를 목에 걸고 있어.' },
        ],
      },
    },

    zooms: {
      note: {
        bg: 'assets/rooms/greenhouse/zoom/paper.webp',
        note: ['문에 붙은 쪽지', '모카는 낮잠 중. 깨우지 마세요… 단, 생일 노래는 예외! 생일 노래가 들리면 벌떡 일어난다.'],
        text: '<h3>낮잠 중</h3><p>모카는 지금 꿀 같은 낮잠 중이에요.<br>깨우지 마세요!</p><p>…단, <em>생일 노래</em>는 예외예요.<br>생일 노래가 들리면 벌떡 일어날 거예요.</p><p class="sign">— 모카</p>',
      },
      theater: {
        bg: (s) => (F(s).shadowSolved ? 'zoom/theater_open' : 'zoom/theater'),
        dim: 0.2,
        widget: shadowWidget,
        objects: [
          { id: 'card', x: 0, y: 0, w: 0, h: 0, img: '', hit: [144, 110, 156, 190], look: '“오늘의 그림자 손님: 모카” 토끼 모양 그림이 그려진 카드야.' },
          { id: 'screenHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [470, 60, 660, 340], look: (s) => (F(s).lampOn ? '종이 화면에 조각들의 그림자가 비쳐. 조각을 누르면 돌아가.' : '어두워서 화면에 아무것도 안 비쳐. 불빛이 필요해.') },
          { id: 'drawerHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [680, 700, 240, 80], show: (s) => !F(s).shadowSolved, look: '잠긴 작은 서랍. 그림자 손님이 오면 열린대.' },
          {
            id: 'bandIn', img: 'items/rubberband', x: 730, y: 660, w: 140, h: 140, show: (s) => F(s).shadowSolved && !F(s).bandTaken, cls: 'item-in', label: '고무줄',
            click: (api, n) => { api.set('bandTaken'); api.give('rubberband', n); api.say('서랍 속 고무줄을 챙겼어.'); },
          },
        ],
      },
      mousehole: {
        bg: 'zoom/mousehole',
        dim: 0.25,
        objects: [
          {
            id: 'mouse', img: (s) => (F(s).mouseFed ? 'zoom/mouse_happy' : 'zoom/mouse_hungry'), x: 650, y: 330, w: 300, h: 320, cls: 'bob', blink: (s) => (F(s).mouseFed ? null : 'zoom/mouse_hungry_blink'), label: '생쥐 찍찍이',
            click: (api) => { api.sfx('squeak'); api.say(api.flags.mouseFed ? '찍찍이: “냠냠… 세상에서 제일 맛있는 치즈예요!”' : '찍찍이: “찍찍! 배가 너무 고파요… 고소한 냄새 나는 거 없나요?”'); },
            use: {
              cheese: (api, n) => {
                api.take('cheese'); api.set('mouseFed'); api.sfx('squeak');
                api.say('찍찍이: “치즈다! 고마워요! 이거 아까 주운 건데, 가져가세요.”');
                api.give('crank', n);
              },
            },
            wrong: '찍찍이: “그건 못 먹어요…”',
          },
        ],
      },
      jbox: {
        bg: 'zoom/jbox',
        dim: 0.2,
        widget: musicWidget,
        objects: [
          {
            id: 'cylinder', x: 0, y: 0, w: 0, h: 0, img: '', hit: [470, 240, 580, 440], label: '오르골 원통',
            look: '깜짝 상자 속 오르골 원통. 칸마다 핀을 꽂는 구멍이 있는데, 핀이 하나뿐이야.',
            use: { pins: (api) => usePins(api) },
          },
          {
            id: 'hole', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1160, 420, 70, 90], show: (s) => !F(s).crankAttached, label: '손잡이 구멍',
            look: '상자 옆구리에 작은 구멍이 있어. 손잡이를 꽂아 돌리는 곳이야.',
            use: { crank: (api) => { api.take('crank'); api.set('crankAttached'); api.sfx('click'); api.say('태엽 손잡이를 딸깍 끼웠어. 이제 돌릴 수 있어!'); } },
          },
          {
            id: 'crankBig', img: 'zoom/crank', x: 1176, y: 360, w: 170, h: 140, show: (s) => !!F(s).crankAttached, label: '태엽 손잡이 돌리기',
            click: (api, n) => crankTurn(api, api.game),
          },
        ],
      },
      score: {
        bg: 'zoom/score',
        note: ['모카의 자수 악보', '줄 세 개 위에 빨간 별 여섯 개. 별의 높낮이가 생일 노래의 음이다.'],
        objects: [{ id: 'scoreHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [260, 190, 1080, 730], look: '모카가 수놓은 생일 노래 악보. 줄 세 개 위에 빨간 별 여섯 개가 높았다 낮았다 해.' }],
      },
      tin: {
        bg: 'zoom/tin',
        objects: [
          { id: 'tinHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 100, 1000, 700], look: '실패, 단추, 골무, 줄자… 바느질 도구가 가득해.' },
          {
            id: 'ripperIn', img: 'items/ripper', x: 940, y: 360, w: 220, h: 220, show: (s) => !F(s).ripperTaken, cls: 'item-in', label: '실뜯개',
            click: (api, n) => { api.set('ripperTaken'); api.give('ripper', n); api.say('실뜯개를 챙겼어. 바느질 실을 뜯는 도구야.'); },
          },
        ],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (!f.awake) {
        if (!f.mouseFed) {
          if (!f.cheeseTaken) {
            if (!f.bandTaken) {
              if (!f.shadowSolved) {
                if (!f.lampOn) return { key: 'lamp', steps: ['동쪽 작업대에 작은 그림자 인형극 무대가 있어요. 그림자를 만들려면 무엇이 필요할까요?', '그림자는 빛이 있어야 생겨요. 작업대 위 빨간 작업등을 보세요.', '빨간 작업등을 눌러 켠 뒤, 인형극 무대를 누르세요.'] };
                return { key: 'shadow', steps: ['인형극 무대의 나무 조각 셋을 누르면 빙글 돌아가요. 화면의 그림자도 같이 돌아요.', '카드와 북쪽 벽의 모카 그림처럼 토끼 그림자를 만들어요. 귀는 위로, 코는 오른쪽, 꼬리는 왼쪽!', '귀 조각은 귀가 위로, 머리 조각은 코가 오른쪽으로, 몸 조각은 발이 아래로 오게 돌리세요.'] };
              }
              return { key: 'band', steps: ['인형극 무대 아래 서랍이 열렸어요.', '서랍 안을 보세요.', '인형극 무대를 확대해서 서랍 속 고무줄을 누르세요.'] };
            }
            return { key: 'jar', steps: ['남쪽 선반의 유리병에 치즈가 있어요. 그런데 뚜껑이 미끄러워 안 열려요.', '병뚜껑이 미끄러울 때 고무줄을 감으면 손에 착 붙어요. 실제로도 쓰는 요령이에요!', '가방에서 고무줄을 고른 채 유리병을 누르세요.'] };
          }
          return { key: 'mouse', steps: ['치즈를 아주 좋아하는 친구가 공방에 살고 있어요.', '동쪽 벽 아래 쥐구멍을 보세요. 생쥐가 등 뒤에 뭔가 숨기고 있어요.', '쥐구멍을 눌러 확대하고, 치즈를 고른 채 생쥐를 누르세요.'] };
        }
        if (!f.crankAttached) return { key: 'crank', steps: ['태엽 손잡이는 어디에 끼울까요? 옆구리에 구멍이 난 장난감이 있어요.', '북쪽 탁자 위 깜짝 상자를 보세요.', '깜짝 상자를 확대하고, 태엽 손잡이를 고른 채 오른쪽 구멍을 누르세요.'] };
        if (!f.pinsReady) {
          if (!has('pins')) return { key: 'pins', steps: ['손잡이를 돌려 보면 노래가 금방 끊겨요. 오르골 원통에 핀이 하나뿐이에요.', '핀이 잔뜩 꽂힌 물건이 서쪽 재봉틀 옆에 있어요.', '서쪽 토마토 바늘꽂이를 눌러 시침핀을 챙기세요.'] };
          return { key: 'pins2', steps: ['시침핀을 어디에 쓸까요?', '깜짝 상자 속 오르골 원통이에요.', '깜짝 상자를 확대하고, 시침핀을 고른 채 원통을 누르세요.'] };
        }
        return { key: 'melody', steps: ['어느 칸에 핀을 꽂을까요? 공방 어딘가에 생일 노래 악보가 있어요.', '서쪽 벽에 모카가 수놓은 악보가 있어요. 빨간 별의 높이를 원통 칸에 그대로 옮겨요.', '왼쪽부터 아래 · 가운데 · 위 · 가운데 · 아래 · 위 칸에 핀을 꽂고 손잡이를 누르세요.'] };
      }
      if (!has('key') && !f.doorOpen) {
        if (!has('carrot')) return { key: 'wait', steps: ['모카가 무언가 건네주려고 해요.', '잠깐 기다려 보세요.', '모카를 눌러 보세요.'] };
        if (!has('ripper')) return { key: 'rip', steps: ['모카가 “당근이지!”라고 했어요. 당근 인형을 살펴보세요. (가방에서 두 번 누르기)', '등에 바느질 자국이 있어요. 바느질 실을 뜯는 도구가 필요해요.', '서쪽 재봉틀 옆 파란 반짇고리 통에서 실뜯개를 챙기세요.'] };
        return { key: 'rip2', steps: ['당근 인형 속에 뭔가 딱딱한 게 있어요.', '실뜯개로 바느질 자국을 뜯어요.', '가방에서 실뜯개를 고른 채 당근 인형을 누르세요.'] };
      }
      if (!f.doorOpen) return { key: 'door', steps: ['열쇠 손잡이 모양을 어디서 봤지요?', '문 자물쇠가 당근 모양이었어요.', '당근 열쇠를 고른 채 북쪽 문을 누르세요.'] };
      return { key: 'out', steps: ['문이 열렸어요!', '열린 문으로 나가 보세요.', '북쪽 문을 누르세요.'] };
    },

    ending: {
      title: '모카의 생일 파티',
      text: ['깜짝 상자의 노래가 끝나자 공방 가득 색종이가 흩날렸어요.', '모카는 당근 인형을 다시 꿰매며 웃었고, 찍찍이는 치즈를 하나 더 얻었답니다.', '문 밖 골목 끝, 커다란 시계탑에서 똑… 딱… 열세 번 종이 울립니다.'],
      next: '다음 이야기 · 3장 열세 번째 시계',
    },
  });
})();
