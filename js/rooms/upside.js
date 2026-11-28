/* 4장 「거꾸로 된 세상」
 * 방 그림은 바르게 선 모습으로 그려져 있고, 뒤집기 전에는 엔진이 방 레이어를 180도 돌려 보여 준다(upside).
 * 그래서 좌표는 "바르게 선 방" 기준이다. 뒤집힌 화면에서 보이는 자리에 두고 싶으면 U(화면 x, y, w, h)를 쓴다.
 * 퍼즐 흐름
 *  갈래 A: 남쪽 액자 숫자는 거꾸로 보여서 618 → 액자를 돌려 보면 819 (공간지각) → 동쪽 금고 → 토마토
 *          → 박쥐 뒤죽이는 거꾸로 읽어도 이름이 같은 과일만 먹는다 (넌센스·논리) → 레버 손잡이
 *  갈래 B: 레버 단추판 "바르게 선 그림처럼 위에서부터" → 북쪽 풍경화를 머릿속으로 뒤집으면 해 → 구름 → 언덕 (공간지각)
 *  합류: 손잡이를 끼우고 잠금이 풀린 레버를 당기면 방이 180도 돌아 바로 선다 (환경 변화)
 *  마무리: 쿠션 속에 있던 열쇠가 소파 밑으로 → 우산 손잡이를 갈고리처럼 걸어 꺼낸다 (예상 밖의 쓰임) → 문
 */
(function () {
  const F = (s) => s.flags;
  const up = (s) => !s.flags.flipped;
  const landed = (s) => !!s.flags.landed;
  // 뒤집힌 화면에서 보이는 자리(화면 좌표) → 방 좌표
  const U = (x, y, w, h) => ({ x: 1600 - x - w, y: 900 - y - h, w, h });
  const ORDER = ['sun', 'cloud', 'hill'];

  function dialWidget(code, flag, onOpen) {
    return (container, api, game) => {
      const f = api.flags;
      let box = container.querySelector('.dials');
      if (f[flag]) { if (box) box.remove(); return; }
      if (box) return;
      f.sdial = f.sdial || [0, 0, 0];
      box = document.createElement('div');
      box.className = 'dials';
      f.sdial.forEach((v, i) => {
        const b = document.createElement('button');
        b.className = 'dial';
        b.style.left = 616 + i * 140 + 'px';
        b.setAttribute('aria-label', (i + 1) + '번째 숫자 바퀴');
        const num = document.createElement('span'); num.textContent = v; b.appendChild(num);
        b.onclick = (e) => {
          e.stopPropagation();
          if (game.busy) return;
          f.sdial[i] = (f.sdial[i] + 1) % 10; num.textContent = f.sdial[i];
          b.classList.remove('roll'); void b.offsetWidth; b.classList.add('roll');
          api.sfx('dial');
        // 단계적 반응: 그 바퀴가 맞는 숫자면 작게 딸깍 + 놋쇠 빛 (아이가 하나씩 확인하며 생각할 수 있게)
        b.classList.toggle('right', f.sdial[i] === +code[i]); if (f.sdial[i] === +code[i]) api.sfx('tick');
          if (f.sdial.join('') === code) {
            f[flag] = true;
            game.busy = true;
            setTimeout(() => { game.busy = false; api.sfx('unlock'); onOpen(api, game); game.save(); game.render(); }, 450);
          }
          game.save();
        };
        box.appendChild(b);
      });
      container.appendChild(box);
    };
  }

  // 액자 확대: "빙글 돌려 보기" 단추로 직접 돌려 본다
  function frameWidget(container, api, game) {
    if (container.querySelector('.turn-btn')) return;
    const b = document.createElement('button');
    b.className = 'plain-btn turn-btn';
    b.textContent = '액자 빙글 돌려 보기';
    b.onclick = (e) => {
      e.stopPropagation();
      api.flags.frameTurned = !api.flags.frameTurned;
      api.sfx('scrape');
      const bg = container.querySelector('.obj-bg');
      if (bg) { bg.classList.remove('spin-in'); void bg.offsetWidth; bg.classList.add('spin-in'); }
      game.save(); game.render();
    };
    container.appendChild(b);
  }

  const batClick = (api) => {
    const f = api.flags;
    api.sfx('squeak');
    if (f.flipped) { api.say('뒤죽이: “으아, 어지러워… 그래도 이제 문이 제자리에 있어. 잘 가!”', 0, { who: 'batDown' }); return; }
    if (f.batFed) { api.say('뒤죽이: “레버에 손잡이를 끼우고, 단추판도 잊지 마!”', 0, { who: 'batUp' }); return; }
    if (!f.batTalked) {
      f.batTalked = true;
      api.lock(4200);
      api.say('뒤죽이: “안녕! 나는 거꾸로 매달리기 대장 박쥐 뒤죽이야. 이 방이 너무 좋아서 통째로 뒤집어 놨지!”', 4200, { who: 'batUp' });
      api.after(4200, () => api.say('뒤죽이: “레버 손잡이가 필요해? 배가 고픈데… 나는 거꾸로 읽어도 이름이 똑같은 과일만 먹어!”', 6000, { who: 'batUp', note: '뒤죽이의 부탁' }));
      return;
    }
    api.say('뒤죽이: “거꾸로 읽어도 이름이 똑같은 과일을 줘! 그럼 레버 손잡이를 줄게.”', 0, { who: 'batUp' });
  };
  const batUse = {
    tomato: (api, n) => {
      if (api.flags.flipped) return;
      api.take('tomato'); api.set('batFed'); api.give('handle', n); api.sfx('combine');
      const extra = api.has('apple') || api.has('banana');
      api.take('apple'); api.take('banana');
      api.say('뒤죽이: “토-마-토! 거꾸로 읽어도 토마토! 냠냠, 약속한 손잡이야!”' + (extra ? ' (남은 사과와 바나나는 뒤죽이 간식으로 주었어.)' : ''), 5000, { who: 'batUp' });
    },
    apple: (api) => api.say('뒤죽이: “사과를 거꾸로 읽으면 ‘과사’잖아! 이름이 바뀌어서 못 먹어.”', 0, { who: 'batUp' }),
    banana: (api) => api.say('뒤죽이: “바나나를 거꾸로 읽으면 ‘나나바’! 이것도 아니야.”', 0, { who: 'batUp' }),
  };

  function pullLever(api) {
    const f = api.flags;
    if (f.flipped) { api.say('레버가 끝까지 내려가 있어. 방이 바로 섰어.'); return; }
    if (!f.handleOn) { api.say('빙글 화살표가 그려진 커다란 레버야. 그런데 손잡이가 빠져 있어.'); return; }
    if (!f.panelOk) { api.sfx('locked'); api.say('손잡이가 꿈쩍도 안 해. 레버 위 단추판을 순서대로 눌러 잠금을 풀어야 하나 봐.'); return; }
    api.game.s.zoom = null; api.game.s.view = 'west';
    api.set('flipped'); api.lock(3200); api.sfx('pop');
    api.say('레버를 힘껏 당기자… 방이 빙그르르 돌기 시작해!', 2600);
    api.after(2600, () => { api.set('landed'); api.sfx('dig'); api.burst('dust', 800, 700, 30); api.say('쿵! 이제 바닥이 바닥에 있어. 소파 쪽에서 무언가 짤랑 떨어지는 소리가 났어!', 4600); });
  }

  function panelPress(kind) {
    return (api) => {
      const f = api.flags;
      if (f.panelOk) { api.say('단추판 잠금은 이미 풀렸어.'); return; }
      f.seq = f.seq || [];
      const next = ORDER[f.seq.length];
      if (kind === next) {
        f.seq.push(kind); api.sfx('click');
        if (f.seq.length === 3) { f.panelOk = true; api.sfx('unlock'); api.burst('spark', 800, 720, 24); api.say('딸깍딸깍딸깍! 레버 잠금이 풀렸어.'); }
      } else {
        f.seq = []; api.sfx('nope');
        api.say('삐— 단추 불이 모두 꺼졌어. 순서가 틀렸나 봐.');
      }
    };
  }

  Engine.registerRoom({
    id: 'upside',
    chapter: '4장',
    title: '거꾸로 된 세상',
    assets: 'assets/rooms/upside/',
    sky: ['assets/rooms/upside/bg/north.webp', 'assets/rooms/upside/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    frame: 'bg/frame',
    start: 'north',
    isLit: () => true,
    upside: up,
    ambient: () => 'upside',
    guide: { name: '거꾸로 박쥐 뒤죽이', img: 'props/bat_hang' },
    intro: '계단을 올라왔더니… 방이 통째로 거꾸로야! 천장이 발밑에 있고, 샹들리에가 바닥에서 피어 있어.',
    repair(s, fix) {
      const f = s.flags;
      if (f.batFed && !f.handleOn && !fix.has('handle')) fix.give('handle');
      if (f.flipped && !f.landed) fix.set('landed');
    },

    items: {
      tomato: { name: '토마토', img: 'items/tomato', desc: '금고에 고이 모셔 둔 빨간 토마토. 「세상에서 제일 소중한 토마토」라는 쪽지가 붙어 있었어.' },
      apple: { name: '사과', img: 'items/apple', desc: '빨갛고 동그란 사과.' },
      banana: { name: '바나나', img: 'items/banana', desc: '노랗게 잘 익은 바나나.' },
      handle: { name: '레버 손잡이', img: 'items/handle', desc: '끝에 빨간 공이 달린 쇠 손잡이. 어딘가에 끼우는 거야.' },
      umbrella: { name: '우산', img: 'items/umbrella', desc: '보라색 우산. 손잡이가 갈고리처럼 구부러져 있어.' },
      key: { name: '문 열쇠', img: 'items/key', desc: '빨간 보석이 박힌 황동 열쇠.' },
    },
    combos: [
      { a: 'umbrella', b: 'apple', say: '우산으로 사과를 찔러 볼 필요는 없을 것 같아.' },
    ],

    views: {
      /* ───── 북쪽: 문, 우산꽂이, 샹들리에, 박쥐 ───── */
      north: {
        name: '빨간 문 벽',
        bg: 'bg/north',
        objects: [
          { id: 'picture', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 200, 200, 150], label: '풍경화', look: (s) => (up(s) ? '해, 구름, 언덕이 그려진 풍경화가 거꾸로 걸려 있어. 지금은 언덕이 맨 위, 해가 맨 아래야.' : '바르게 보니 위에서부터 해, 구름, 언덕이야. 예쁘다!') },
          { id: 'chandelier', x: 0, y: 0, w: 0, h: 0, img: '', hit: [610, 60, 180, 170], label: '샹들리에', look: (s) => (up(s) ? '샹들리에가 바닥에서 꽃처럼 피어 있어.' : '천장에 샹들리에가 반짝반짝.') },
          {
            id: 'stand', img: (s) => (F(s).umbTaken ? 'props/stand_empty' : 'props/stand_umb'), x: 1250, y: 430, w: 100, h: 220, label: '우산꽂이',
            click: (api, n) => {
              if (api.flags.umbTaken) { api.say('텅 빈 우산꽂이야.'); return; }
              api.set('umbTaken'); api.give('umbrella', n); api.say('우산을 쏙 뽑았어. 손잡이가 갈고리처럼 구부러져 있네.');
            },
          },
          {
            id: 'door', img: (s) => (F(s).doorOpen ? 'props/door_open' : 'props/door_closed'), x: 970, y: 240, w: 260, h: 400, label: '빨간 문',
            click: (api) => {
              if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; }
              if (!api.flags.flipped) { api.say('잠겨 있어. 게다가 문이 거꾸로 달려서, 열면 바깥 하늘로 떨어질 거야! 방을 먼저 바로 세워야 해.'); api.sfx('nope'); return; }
              api.sfx('locked'); api.say('이제 문이 제자리에 있어. 그런데 잠겨 있어.');
            },
            use: { key: (api) => { if (!api.flags.flipped) { api.say('거꾸로 된 문은 열어도 하늘로 떨어져. 먼저 방을 바로 세우자.'); return; } api.take('key'); api.set('doorOpen'); api.sfx('door'); api.burst('spark', 1100, 400, 24); api.say('딸깍! 문 밖으로 파란 하늘과 언덕이 보여.'); } },
          },
          { id: 'batUp', img: (s) => (F(s).batFed ? 'props/bat_happy' : 'props/bat_hang'), ...U(1040, 60, 160, 230), cls: 'rot180 bob', blink: (s) => (F(s).batFed ? null : 'props/bat_hang_blink'), show: up, label: '박쥐 뒤죽이', click: batClick, use: batUse, wrong: '뒤죽이: “그건 과일이 아니잖아~”' },
          { id: 'batDown', img: 'props/bat_dizzy', x: 740, y: 196, w: 160, h: 230, cls: 'sway-soft', show: (s) => !up(s), label: '박쥐 뒤죽이', click: batClick, use: batUse },
        ],
      },

      /* ───── 동쪽: 벽 금고와 책장 ───── */
      east: {
        name: '금고 벽',
        bg: 'bg/east',
        objects: [
          { id: 'books', x: 0, y: 0, w: 0, h: 0, img: '', hit: [190, 170, 300, 470], label: '책장', look: (s) => (up(s) ? '책들이 거꾸로 꽂혀 있는데도 떨어지지 않아. 신기해!' : '책장에 책이 가지런해.') },
          { id: 'cups', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1130, 240, 260, 56], label: '찻잔 선반', look: (s) => (up(s) ? '찻잔이 선반에 거꾸로 붙어 있는데, 차는 한 방울도 안 쏟아져.' : '찻잔 넷이 나란히.') },
          { id: 'clock', x: 0, y: 0, w: 0, h: 0, img: '', hit: [946, 96, 108, 108], label: '벽시계', look: (s) => (up(s) ? '벽시계도 거꾸로라 6시가 맨 위에 있어.' : '벽시계가 째깍째깍.') },
          { id: 'portrait', x: 0, y: 0, w: 0, h: 0, img: '', hit: [570, 120, 150, 180], label: '박쥐 초상화', look: '뒤죽이 할머니 초상화래. 역시 거꾸로 매달려 있어.' },
          {
            id: 'safe', img: (s) => (F(s).safeOpen ? 'props/safe_open' : 'props/safe_closed'), x: 670, y: 220, w: 260, h: 240, label: '벽 금고',
            click: (api) => { api.sfx('step'); api.zoom(api.flags.safeOpen ? 'safeIn' : 'safe'); },
          },
        ],
      },

      /* ───── 남쪽: 소파, 숫자 액자, 과일 ───── */
      south: {
        name: '소파 벽',
        bg: 'bg/south',
        objects: [
          { id: 'frame', img: 'props/frame', x: 690, y: 180, w: 220, h: 160, label: '숫자 액자', click: (api) => { api.set('frameSeen'); api.sfx('step'); api.zoom('frame'); } },
          { id: 'note', img: 'props/note', x: 940, y: 210, w: 60, h: 70, zoom: 'note', label: '쪽지' },
          { id: 'sofa', img: 'props/sofa', x: 490, y: 400, w: 620, h: 290, hit: [540, 410, 520, 150], label: '보라색 소파', look: (s) => (up(s) ? '보라색 소파가 천장에 딱 붙어 있어. 쿠션 속에서 짤랑짤랑 소리가 나.' : '푹신한 보라색 소파. 밑에 어두운 틈이 있어.') },
          {
            id: 'keyUnder', img: 'props/key_under', x: 700, y: 640, w: 120, h: 60, show: (s) => landed(s) && !F(s).keyTaken, label: '소파 밑 열쇠',
            look: '방이 바로 서면서 쿠션 속 열쇠가 빠져 소파 밑 깊숙이 굴러 들어갔어. 손이 안 닿아!',
            use: { umbrella: (api, n) => { api.set('keyTaken'); api.give('key', n); api.say('우산 손잡이를 갈고리처럼 걸어서 열쇠를 끌어냈어!'); } },
            wrong: '그걸로는 소파 밑까지 안 닿아. 길고 끝이 구부러진 게 있으면 좋을 텐데.',
          },
          { id: 'table', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1090, 530, 260, 60], label: '낮은 탁자', look: (s) => (up(s) ? '과일 그릇이 탁자에 붙어 있는데, 과일은 다 떨어져 버렸어.' : '빈 과일 그릇이 놓인 낮은 탁자.') },
          { id: 'appleUp', img: 'props/apple', ...U(380, 790, 90, 90), cls: 'rot180', show: (s) => !landed(s) && !F(s).appleTaken && !F(s).batFed, label: '사과', click: (api, n) => { api.set('appleTaken'); api.give('apple', n); api.say('굴러떨어진 사과를 주웠어.'); } },
          { id: 'bananaUp', img: 'props/banana', ...U(480, 800, 90, 90), cls: 'rot180', show: (s) => !landed(s) && !F(s).bananaTaken && !F(s).batFed, label: '바나나', click: (api, n) => { api.set('bananaTaken'); api.give('banana', n); api.say('떨어진 바나나를 주웠어.'); } },
        ],
      },

      /* ───── 서쪽: 중력 레버와 창문 ───── */
      west: {
        name: '레버 벽',
        bg: 'bg/west',
        objects: [
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1090, 150, 300, 300], label: '창문', look: (s) => (up(s) ? '창밖 하늘이 발밑에 있어! 구름이 둥둥 떠다녀.' : '창밖에 파란 하늘과 초록 언덕.') },
          { id: 'plant', x: 0, y: 0, w: 0, h: 0, img: '', hit: [220, 420, 120, 220], label: '화분', look: (s) => (up(s) ? '화분이 거꾸로인데 흙이 한 줌도 안 쏟아져.' : '잎이 길쭉한 화분.') },
          { id: 'hats', x: 0, y: 0, w: 0, h: 0, img: '', hit: [480, 150, 300, 110], label: '모자 걸이', look: '빨강, 보라, 노랑 모자가 걸려 있어.' },
          {
            id: 'lever', img: (s) => (F(s).flipped ? 'props/lever_down' : F(s).handleOn ? 'props/lever_up' : 'props/lever_nohandle'), x: 690, y: 180, w: 220, h: 360, label: '뒤집기 레버',
            click: (api) => { if (api.flags.flipped) { api.say('레버가 끝까지 내려가 있어. 방이 바로 섰어.'); return; } api.sfx('step'); api.zoom('lever'); },
            use: { handle: (api) => { api.take('handle'); api.set('handleOn'); api.sfx('click'); api.say('손잡이를 딸깍 끼웠어.'); } },
          },
        ],
      },
    },

    zooms: {
      frame: {
        bg: (s) => ((up(s) !== !!F(s).frameTurned) ? 'zoom/frame_upside' : 'zoom/frame'),
        widget: frameWidget,
        objects: [{ id: 'frameHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [380, 180, 660, 480], label: '액자 숫자', look: (s) => ((up(s) !== !!F(s).frameTurned) ? '숫자가 6 1 8 로 보여… 그런데 액자의 꽃 그림이 거꾸로야. 액자째 물구나무를 선 거야!' : '꽃이 아래에 있게 바로 보니 8 1 9 야!') }],
      },
      note: {
        bg: 'assets/rooms/greenhouse/zoom/paper.webp',
        note: ['뒤죽이의 쪽지', '거꾸로 된 방의 숫자는 물구나무를 선 숫자. 뒤집어 보면 6은 9가 되고 순서도 거꾸로 된다.'],
        text: '<h3>뒤죽이의 쪽지</h3><p>거꾸로 된 방에서 보이는 숫자는<br><em>물구나무를 선 숫자</em>예요.</p><p>진짜 숫자를 알고 싶으면 그림을 <em>빙그르르 뒤집어</em> 보세요.<br>6은 9가 되고, 순서도 거꾸로 돼요!</p><p class="sign">— 거꾸로 매달리기 대장 뒤죽이</p>',
      },
      safe: {
        bg: 'zoom/safe',
        widget: dialWidget('819', 'safeOpen', (api, game) => { api.say('철컥! 금고 문이 열렸어.'); game.s.zoom = 'safeIn'; }),
        objects: [{ id: 'safeHint', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 300, 480, 50], label: '금고 숫자 바퀴', look: '숫자 바퀴 세 개짜리 금고야. 문에 작은 토마토 그림이 새겨져 있어.' }],
      },
      safeIn: {
        bg: 'zoom/safe_open',
        objects: [{ id: 'tomatoIn', img: 'items/tomato', x: 700, y: 330, w: 200, h: 200, cls: 'item-in', show: (s) => !F(s).tomatoTaken, label: '토마토', click: (api, n) => { api.set('tomatoTaken'); api.give('tomato', n); api.say('「세상에서 제일 소중한 토마토」… 토마토를 챙겼어.'); } }],
      },
      lever: {
        bg: 'zoom/lever',
        note: ['레버 단추판', '판에 액자 그림과 아래 화살표: 바르게 선 그림처럼 위에서부터 차례로 누른다.'],
        objects: [
          { id: 'plate', x: 0, y: 0, w: 0, h: 0, img: '', hit: [460, 100, 680, 120], label: '단추판 그림 문장', look: '액자 그림과 아래로 가는 화살표, 그리고 1·2·3이 새겨져 있어. 바르게 선 그림 속 것들을 위에서부터 차례로 누르라는 뜻 같아.' },
          { id: 'bHill', img: (s) => ((F(s).seq || []).includes('hill') ? 'zoom/btn_hill_on' : 'zoom/btn_hill'), x: 474, y: 634, w: 172, h: 172, label: '언덕 단추', click: panelPress('hill') },
          { id: 'bSun', img: (s) => ((F(s).seq || []).includes('sun') ? 'zoom/btn_sun_on' : 'zoom/btn_sun'), x: 714, y: 634, w: 172, h: 172, label: '해 단추', click: panelPress('sun') },
          { id: 'bCloud', img: (s) => ((F(s).seq || []).includes('cloud') ? 'zoom/btn_cloud_on' : 'zoom/btn_cloud'), x: 954, y: 634, w: 172, h: 172, label: '구름 단추', click: panelPress('cloud') },
          {
            id: 'leverIn', img: (s) => (F(s).handleOn ? 'items/handle' : ''), x: 720, y: 250, w: 160, h: 160, hit: [740, 250, 120, 350], label: '레버 손잡이 당기기',
            click: (api) => pullLever(api),
            use: { handle: (api) => { api.take('handle'); api.set('handleOn'); api.sfx('click'); api.say('손잡이를 딸깍 끼웠어.'); } },
          },
        ],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (!f.flipped) {
        if (!f.handleOn && !has('handle')) {
          if (!has('tomato') && !f.batFed) {
            if (!f.safeOpen) {
              if (!f.frameSeen) return { key: 'frame', steps: ['남쪽 소파 위 액자에 숫자가 적혀 있어요.', '액자 옆 쪽지를 읽어 보세요. 거꾸로 된 방에서는 숫자도 물구나무를 서요.', '액자를 확대해서 “빙글 돌려 보기”를 누르면 819가 보여요. 동쪽 금고를 8-1-9로 맞추세요.'] };
              return { key: 'safe', steps: ['금고 비밀번호는 액자 숫자를 바로 세운 거예요.', '액자 확대 화면의 “빙글 돌려 보기” 단추를 눌러 보세요.', '동쪽 금고 숫자 바퀴를 8-1-9로 맞추세요.'] };
            }
            return { key: 'tomato', steps: ['금고가 열렸어요. 안을 보세요.', '동쪽 금고를 눌러 안을 봐요.', '금고 속 토마토를 챙기세요.'] };
          }
          return { key: 'bat', steps: ['북쪽에 매달린 박쥐 뒤죽이가 레버 손잡이를 갖고 있어요. 말을 걸어 보세요.', '뒤죽이는 거꾸로 읽어도 이름이 똑같은 과일만 먹어요. 토마토를 거꾸로 읽으면?', '토마토를 고른 채 박쥐를 누르세요.'] };
        }
        if (!f.handleOn) return { key: 'handle', steps: ['레버 손잡이를 어디에 끼울까요?', '서쪽 벽에 손잡이가 빠진 레버가 있어요.', '손잡이를 고른 채 서쪽 레버를 누르세요.'] };
        if (!f.panelOk) return { key: 'panel', steps: ['레버가 잠겨 있어요. 레버 확대 화면의 단추판을 보세요.', '“바르게 선 그림처럼 위에서부터”예요. 북쪽 풍경화는 지금 거꾸로 걸려 있어요. 머릿속으로 뒤집으면 맨 위에 뭐가 있을까요?', '해 → 구름 → 언덕 순서로 누르세요.'] };
        return { key: 'pull', steps: ['레버를 당겨 보세요!', '서쪽 레버 확대 화면의 손잡이예요.', '레버 손잡이를 누르세요.'] };
      }
      if (!f.keyTaken) {
        if (!has('umbrella')) return { key: 'umb', steps: ['방이 바로 섰어요! 열쇠가 소파 밑으로 굴러 들어갔어요.', '손이 안 닿으니 길고 끝이 구부러진 물건이 필요해요.', '북쪽 문 옆 우산꽂이에서 우산을 꺼내세요.'] };
        return { key: 'hook', steps: ['우산 손잡이는 갈고리처럼 구부러져 있어요.', '소파 밑 열쇠를 걸어 당겨요.', '우산을 고른 채 남쪽 소파 밑 열쇠를 누르세요.'] };
      }
      if (!f.doorOpen) return { key: 'door', steps: ['이제 문이 제자리에 있어요.', '북쪽 빨간 문이에요.', '열쇠를 고른 채 북쪽 문을 누르세요.'] };
      return { key: 'out', steps: ['문이 열렸어요!', '북쪽 문으로 나가 보세요.', '북쪽 문을 누르세요.'] };
    },

    ending: {
      title: '바르게 선 세상',
      text: ['방이 바로 서자 찻잔이 달그락, 책들이 휴— 하고 숨을 쉬었어요.', '뒤죽이는 어지러워하면서도 날개를 흔들어 배웅해 주었지요.', '문 밖 언덕 너머로 파도 소리가 들려요. 바닷속 어딘가에서 편지 한 통이 당신을 기다리고 있어요.'],
      next: '다음 이야기 · 5장 바닷속 우체국',
    },
  });
})();
