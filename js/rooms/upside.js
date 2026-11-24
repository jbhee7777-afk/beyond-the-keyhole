/* 4장 「거꾸로 된 세상」
 * 방 그림은 바르게 선 모습으로 그려져 있고, 뒤집기 전에는 엔진이 방 레이어를 180도 돌려 보여 준다(upside).
 * 그래서 좌표는 "바르게 선 방" 기준이다. 뒤집기 전 화면에서 보이는 자리에 두고 싶으면 U(화면 x, y, w, h)를 쓴다.
 * 퍼즐 흐름
 *  1. 남쪽 액자 숫자는 거꾸로 보여서 618 → 쪽지대로 머릿속에서 뒤집으면 819 (공간지각)
 *  2. 동쪽 벽 금고 819 → 토마토 (논리)
 *  3. 박쥐 뒤죽이는 거꾸로 읽어도 이름이 같은 과일만 먹는다: 사과(과사)·바나나(나나바) X, 토마토 O → 레버 손잡이 (넌센스·논리)
 *  4. 서쪽 레버에 손잡이 → 당기면 방이 180도 돌아 바로 선다 (환경 변화)
 *  5. 소파 쿠션에 끼어 있던 열쇠가 소파 밑으로 → 우산 손잡이를 갈고리처럼 걸어 꺼낸다 (예상 밖의 쓰임)
 *  6. 바로 선 문을 열고 탈출
 */
(function () {
  const F = (s) => s.flags;
  const up = (s) => !s.flags.flipped;
  const landed = (s) => !!s.flags.landed;
  // 뒤집힌 화면에서 보이는 자리(화면 좌표) → 방 좌표
  const U = (x, y, w, h) => ({ x: 1600 - x - w, y: 900 - y - h, w, h });

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
          if (f.sdial.join('') === code) {
            game.busy = true;
            setTimeout(() => { game.busy = false; f[flag] = true; api.sfx('unlock'); onOpen(api, game); game.save(); game.render(); }, 450);
          }
          game.save();
        };
        box.appendChild(b);
      });
      container.appendChild(box);
    };
  }

  const batClick = (api) => {
    const f = api.flags;
    api.sfx('squeak');
    if (f.flipped) { api.say('뒤죽이: “으아, 어지러워… 그래도 이제 문이 제자리에 있어. 잘 가!”'); return; }
    if (f.batFed) { api.say('뒤죽이: “서쪽 레버에 손잡이를 끼우고 힘껏 당겨 봐!”'); return; }
    if (!f.batTalked) {
      f.batTalked = true;
      api.lock(4200);
      api.say('뒤죽이: “안녕! 나는 거꾸로 매달리기 대장 박쥐 뒤죽이야. 이 방이 너무 좋아서 통째로 뒤집어 놨지!”', 4200);
      api.after(4200, () => api.say('뒤죽이: “레버 손잡이가 필요해? 배가 고픈데… 나는 거꾸로 읽어도 이름이 똑같은 과일만 먹어!”', 6000));
      return;
    }
    api.say('뒤죽이: “거꾸로 읽어도 이름이 똑같은 과일을 줘! 그럼 레버 손잡이를 줄게.”');
  };
  const batUse = {
    tomato: (api, n) => { if (api.flags.flipped) return; api.take('tomato'); api.set('batFed'); api.sfx('combine'); api.say('뒤죽이: “토-마-토! 거꾸로 읽어도 토마토! 냠냠, 고마워. 약속한 손잡이야!”', 4000); api.after(1500, () => api.give('handle', n)); },
    apple: (api) => api.say('뒤죽이: “사과를 거꾸로 읽으면 ‘과사’잖아! 이름이 바뀌어서 못 먹어.”'),
    banana: (api) => api.say('뒤죽이: “바나나를 거꾸로 읽으면 ‘나나바’! 이것도 아니야.”'),
  };

  Engine.registerRoom({
    id: 'upside',
    chapter: '4장',
    title: '거꾸로 된 세상',
    assets: 'assets/rooms/upside/',
    sky: ['assets/rooms/upside/bg/north.svg', 'assets/rooms/upside/bg/north.svg'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: () => true,
    upside: up,
    guide: { name: '거꾸로 박쥐 뒤죽이', img: 'props/bat_hang' },
    intro: '계단을 올라왔더니… 방이 통째로 거꾸로야! 천장이 발밑에 있고, 샹들리에가 바닥에서 피어 있어.',

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
        bg: 'bg/north',
        objects: [
          { id: 'picture', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 200, 200, 150], look: (s) => (up(s) ? '풍경화가 거꾸로 걸려 있어. 구름이 땅에 있고 언덕이 하늘에 있어!' : '구름 낀 언덕 그림. 바르게 보니까 예쁘다!') },
          { id: 'chandelier', x: 0, y: 0, w: 0, h: 0, img: '', hit: [610, 60, 180, 170], look: (s) => (up(s) ? '샹들리에가 바닥에서 꽃처럼 피어 있어.' : '천장에 샹들리에가 반짝반짝.') },
          {
            id: 'stand', img: (s) => (F(s).umbTaken ? 'props/stand_empty' : 'props/stand_umb'), x: 1250, y: 430, w: 100, h: 220, label: '우산꽂이',
            click: (api, n) => {
              if (api.flags.umbTaken) { api.say('텅 빈 우산꽂이야.'); return; }
              if (!api.flags.flipped) { api.say('우산이 우산꽂이에 거꾸로 꽉 끼어 있어. 꿈쩍도 안 해.'); api.sfx('nope'); return; }
              api.set('umbTaken'); api.give('umbrella', n); api.say('우산을 쏙 뽑았어. 손잡이가 갈고리처럼 구부러져 있네.');
            },
          },
          {
            id: 'door', img: (s) => (F(s).doorOpen ? 'props/door_open' : 'props/door_closed'), x: 970, y: 240, w: 260, h: 400, label: '빨간 문',
            click: (api) => {
              if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; }
              if (!api.flags.flipped) { api.say('문이 거꾸로 달려 있어! 열어 봤자 바깥 하늘로 떨어질 거야. 방을 먼저 바로 세워야 해.'); api.sfx('nope'); return; }
              api.sfx('locked'); api.say('이제 문이 제자리에 있어. 그런데 잠겨 있어.');
            },
            use: { key: (api) => { if (!api.flags.flipped) { api.say('거꾸로 된 문은 열어도 하늘로 떨어져. 먼저 방을 바로 세우자.'); return; } api.take('key'); api.set('doorOpen'); api.sfx('door'); api.say('딸깍! 문 밖으로 파란 하늘과 언덕이 보여.'); } },
          },
          { id: 'batUp', img: 'props/bat_hang', ...U(1040, 60, 160, 230), cls: 'rot180 bob', show: up, label: '박쥐 뒤죽이', click: batClick, use: batUse, wrong: '뒤죽이: “그건 과일이 아니잖아~”' },
          { id: 'batDown', img: 'props/bat_dizzy', x: 740, y: 196, w: 160, h: 230, cls: 'sway-soft', show: (s) => !up(s), label: '박쥐 뒤죽이', click: batClick, use: batUse },
        ],
      },

      /* ───── 동쪽: 벽 금고와 책장 ───── */
      east: {
        bg: 'bg/east',
        objects: [
          { id: 'books', x: 0, y: 0, w: 0, h: 0, img: '', hit: [190, 170, 300, 470], look: (s) => (up(s) ? '책들이 거꾸로 꽂혀 있는데도 떨어지지 않아. 신기해!' : '책장에 책이 가지런해.') },
          { id: 'cups', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1130, 240, 260, 56], look: (s) => (up(s) ? '찻잔이 선반에 거꾸로 붙어 있는데, 차는 한 방울도 안 쏟아져.' : '찻잔 넷이 나란히.') },
          {
            id: 'safe', img: (s) => (F(s).safeOpen ? 'props/safe_open' : 'props/safe_closed'), x: 670, y: 220, w: 260, h: 240, label: '벽 금고',
            click: (api) => { api.sfx('step'); api.zoom(api.flags.safeOpen ? 'safeIn' : 'safe'); },
          },
        ],
      },

      /* ───── 남쪽: 소파, 숫자 액자, 과일 ───── */
      south: {
        bg: 'bg/south',
        objects: [
          { id: 'frame', img: 'props/frame', x: 690, y: 180, w: 220, h: 160, label: '숫자 액자', click: (api) => { api.set('frameSeen'); api.sfx('step'); api.zoom('frame'); } },
          { id: 'note', img: 'props/note', x: 940, y: 210, w: 60, h: 70, zoom: 'note', label: '쪽지' },
          { id: 'sofa', img: 'props/sofa', x: 490, y: 400, w: 620, h: 290, hit: [540, 410, 520, 150], look: (s) => (up(s) ? '보라색 소파가 천장에 딱 붙어 있어.' : '푹신한 보라색 소파. 밑에 어두운 틈이 있어.') },
          {
            id: 'keySofa', img: 'props/key_sofa', x: 820, y: 520, w: 120, h: 60, show: up, label: '소파 쿠션 속 열쇠',
            look: '소파 쿠션 틈에 열쇠가 끼어 있어. 방이 거꾸로라 쿠션에 꽉 눌려서 안 빠져!',
          },
          {
            id: 'keyUnder', img: 'props/key_under', x: 700, y: 640, w: 120, h: 60, show: (s) => landed(s) && !F(s).keyTaken, label: '소파 밑 열쇠',
            look: '방이 바로 서면서 열쇠가 소파 밑 깊숙이 굴러 들어갔어. 손이 안 닿아!',
            use: { umbrella: (api, n) => { api.set('keyTaken'); api.give('key', n); api.say('우산 손잡이를 갈고리처럼 걸어서 열쇠를 끌어냈어!'); } },
            wrong: '그걸로는 소파 밑까지 안 닿아. 길고 끝이 구부러진 게 있으면 좋을 텐데.',
          },
          { id: 'table', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1090, 530, 260, 60], look: (s) => (up(s) ? '과일 그릇이 탁자에 붙어 있는데, 과일은 다 떨어져 버렸어.' : '빈 과일 그릇이 놓인 낮은 탁자.') },
          { id: 'appleUp', img: 'props/apple', ...U(380, 790, 90, 90), cls: 'rot180', show: (s) => !landed(s) && !F(s).appleTaken, label: '사과', click: (api, n) => { api.set('appleTaken'); api.give('apple', n); api.say('굴러떨어진 사과를 주웠어.'); } },
          { id: 'bananaUp', img: 'props/banana', ...U(480, 800, 90, 90), cls: 'rot180', show: (s) => !landed(s) && !F(s).bananaTaken, label: '바나나', click: (api, n) => { api.set('bananaTaken'); api.give('banana', n); api.say('떨어진 바나나를 주웠어.'); } },
          { id: 'appleDown', img: 'props/apple', x: 1110, y: 640, w: 90, h: 90, show: (s) => landed(s) && !F(s).appleTaken, label: '사과', click: (api, n) => { api.set('appleTaken'); api.give('apple', n); } },
          { id: 'bananaDown', img: 'props/banana', x: 1220, y: 650, w: 90, h: 90, show: (s) => landed(s) && !F(s).bananaTaken, label: '바나나', click: (api, n) => { api.set('bananaTaken'); api.give('banana', n); } },
        ],
      },

      /* ───── 서쪽: 중력 레버와 창문 ───── */
      west: {
        bg: 'bg/west',
        objects: [
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1090, 150, 300, 300], look: (s) => (up(s) ? '창밖 하늘이 발밑에 있어! 구름이 둥둥 떠다녀.' : '창밖에 파란 하늘과 초록 언덕.') },
          { id: 'plant', x: 0, y: 0, w: 0, h: 0, img: '', hit: [220, 420, 120, 220], look: (s) => (up(s) ? '화분이 거꾸로인데 흙이 한 줌도 안 쏟아져.' : '잎이 길쭉한 화분.') },
          {
            id: 'lever', img: (s) => (F(s).flipped ? 'props/lever_down' : F(s).handleOn ? 'props/lever_up' : 'props/lever_nohandle'), x: 690, y: 180, w: 220, h: 360, label: '뒤집기 레버',
            click: (api) => {
              const f = api.flags;
              if (f.flipped) { api.say('레버가 끝까지 내려가 있어. 방이 바로 섰어.'); return; }
              if (!f.handleOn) { api.say('빙글 화살표가 그려진 커다란 레버야. 그런데 손잡이가 빠져 있어.'); return; }
              api.set('flipped'); api.lock(3200); api.sfx('pop');
              api.say('레버를 힘껏 당기자… 방이 빙그르르 돌기 시작해!', 2600);
              api.after(2600, () => { api.set('landed'); api.sfx('dig'); api.say('쿵! 이제 바닥이 바닥에 있어. 쿠션에 끼어 있던 열쇠도 툭 떨어졌어!', 4600); });
            },
            use: { handle: (api) => { api.take('handle'); api.set('handleOn'); api.sfx('click'); api.say('손잡이를 딸깍 끼웠어. 이제 당길 수 있어!'); } },
          },
        ],
      },
    },

    zooms: {
      frame: {
        bg: (s) => (up(s) ? 'zoom/frame_upside' : 'zoom/frame'),
        objects: [{ id: 'frameHit', x: 0, y: 0, w: 0, h: 0, img: '', hit: [380, 180, 660, 480], look: (s) => (up(s) ? '숫자가 6 1 8 로 보여… 그런데 액자의 꽃 그림이 거꾸로야. 액자째 물구나무를 선 거야!' : '바로 보니 8 1 9 였구나!') }],
      },
      note: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        text: '<h3>뒤죽이의 쪽지</h3><p>거꾸로 된 방에서 보이는 숫자는<br><em>물구나무를 선 숫자</em>예요.</p><p>진짜 숫자를 알고 싶으면 머릿속으로 그림을 <em>빙그르르 뒤집어</em> 보세요.<br>6은 9가 되고, 순서도 거꾸로 돼요!</p><p class="sign">— 거꾸로 매달리기 대장 뒤죽이</p>',
      },
      safe: {
        bg: 'zoom/safe',
        widget: dialWidget('819', 'safeOpen', (api, game) => { api.say('철컥! 금고 문이 열렸어.'); game.s.zoom = 'safeIn'; }),
        objects: [{ id: 'safeHint', x: 0, y: 0, w: 0, h: 0, img: '', hit: [560, 300, 480, 50], look: '숫자 바퀴 세 개짜리 금고야. 문에 작은 토마토 그림이 새겨져 있어.' }],
      },
      safeIn: {
        bg: 'zoom/safe_open',
        objects: [{ id: 'tomatoIn', img: 'items/tomato', x: 700, y: 330, w: 200, h: 200, cls: 'item-in', show: (s) => !F(s).tomatoTaken, label: '토마토', click: (api, n) => { api.set('tomatoTaken'); api.give('tomato', n); api.say('「세상에서 제일 소중한 토마토」… 토마토를 챙겼어.'); } }],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (!f.flipped) {
        if (!f.handleOn && !has('handle')) {
          if (!has('tomato') && !f.batFed) {
            if (!f.safeOpen) {
              if (!f.frameSeen) return { key: 'frame', steps: ['남쪽 소파 위 액자에 숫자가 적혀 있어요.', '액자 옆 쪽지를 읽어 보세요. 거꾸로 된 방에서는 숫자도 물구나무를 서요.', '618을 머릿속으로 뒤집으면 819예요. 동쪽 금고를 8-1-9로 맞추세요.'] };
              return { key: 'safe', steps: ['금고 비밀번호는 액자 숫자를 바로 세운 거예요.', '618을 뒤집으면 6은 9가 되고, 순서도 거꾸로 돼요.', '동쪽 금고 숫자 바퀴를 8-1-9로 맞추세요.'] };
            }
            return { key: 'tomato', steps: ['금고가 열렸어요. 안을 보세요.', '동쪽 금고를 눌러 안을 봐요.', '금고 속 토마토를 챙기세요.'] };
          }
          return { key: 'bat', steps: ['북쪽에 매달린 박쥐 뒤죽이가 레버 손잡이를 갖고 있어요. 말을 걸어 보세요.', '뒤죽이는 거꾸로 읽어도 이름이 똑같은 과일만 먹어요. 토마토를 거꾸로 읽으면?', '토마토를 고른 채 박쥐를 누르세요.'] };
        }
        if (!f.handleOn) return { key: 'handle', steps: ['레버 손잡이를 어디에 끼울까요?', '서쪽 벽에 손잡이가 빠진 레버가 있어요.', '손잡이를 고른 채 서쪽 레버를 누르세요.'] };
        return { key: 'pull', steps: ['레버를 당겨 보세요!', '서쪽 레버예요.', '서쪽 레버를 누르세요.'] };
      }
      if (!f.keyTaken) {
        if (!has('umbrella')) return { key: 'umb', steps: ['방이 바로 섰어요! 열쇠가 소파 밑으로 굴러 들어갔어요.', '손이 안 닿으니 길고 끝이 구부러진 물건이 필요해요. 이제 우산꽂이의 우산이 빠질 거예요.', '북쪽 문 옆 우산꽂이에서 우산을 꺼내세요.'] };
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
