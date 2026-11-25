/* 10장 「봄이의 작업실」 (2편 마지막 장)
 * 별빛 열차가 멈춘 곳은 할머니 집 다락방. 어린 봄이가 이 종이 책을 만들던 작업실이다. 책의 마지막 장이 비어 있다.
 * 퍼즐 흐름 (두 갈래가 책에서 합쳐진다)
 *  갈래 가: 종이 뜨기 — 휴지통 습작 종이 → 물통(종이죽) → 벽의 종이 뜨는 틀로 뜨기 → 창가 빨랫줄에 말리기 → 접이가 문 페이지로 접기
 *          (벽에 붙은 봄이의 순서 그림: 찢기 → 물통 → 뜨기 → 말리기)
 *  갈래 나: 반짇고리 그림 자물쇠 — 서쪽 벽 봄이의 여행 지도 순서(책상 → 구름 → 등대 → 기차)대로 칸을 맞추면 바늘과 실 (2편 여정 되짚기)
 *  합류: 책에 문 페이지를 대고 바늘과 실로 꿰매면 책이 완성 → 바닥 문이 열리고 아래층에서 할머니 목소리
 */
(function () {
  const F = (s) => s.flags;
  const ICONS = ['desk', 'cloud', 'light', 'train'];
  const NAMES = { desk: '책상', cloud: '구름', light: '등대', train: '기차' };

  function tinWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.tin-lock');
    if (f.tinOpen) { if (box) box.remove(); return; }
    if (box) return;
    f.slots = f.slots || [2, 0, 3, 1];
    box = document.createElement('div');
    box.className = 'tin-lock';
    f.slots.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'piece tin-slot';
      b.style.cssText = `left:${350 + i * 230}px;top:340px;width:200px;height:200px`;
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`zoom/ic_${ICONS[v]}`); b.appendChild(im);
      const label = () => b.setAttribute('aria-label', `${i + 1}번째 칸 (${NAMES[ICONS[f.slots[i]]]})`);
      label();
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        f.slots[i] = (f.slots[i] + 1) % 4; im.src = game.src(`zoom/ic_${ICONS[f.slots[i]]}`); label();
        api.sfx('click');
        if (f.slots.every((s, k) => s === k)) {
          f.tinOpen = true; game.busy = true;
          setTimeout(() => { game.busy = false; api.sfx('unlock'); api.say('딸깍! 봄이가 지나간 순서대로 맞추자 반짇고리가 열렸어.'); game.s.zoom = null; game.save(); game.render(); }, 450);
        }
        game.save();
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  }

  function craneTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true;
      api.lock(5400);
      api.say('접이: “여기가… 봄이의 작업실이야! 이 책이 태어난 곳. 그런데 봐, 마지막 장이 비어 있어.”', 5400, { who: 'crane' });
      api.after(5400, () => api.say('접이: “새 종이를 떠서 마지막 장을 만들고, 꿰매 넣으면 책이 완성될 거야. 그럼 집으로 가는 문도 열리겠지!”', 6200, { who: 'crane', note: '접이의 말' }));
      return;
    }
    if (f.bookDone) { api.say('접이: “우리가 해냈어! 아래층에 누가 기다리고 있는 것 같아.”', 0, { who: 'crane' }); return; }
    api.say('접이: “종이만 가져오면 마지막 장을 멋진 문으로 접어 줄게!”', 0, { who: 'crane' });
  }

  Engine.registerRoom({
    id: 'studio',
    chapter: '10장',
    title: '봄이의 작업실',
    assets: 'assets/rooms/studio/',
    sky: ['assets/rooms/studio/bg/north.svg', 'assets/rooms/studio/bg/north.svg'],
    frame: 'bg/frame',
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: () => true,
    ambient: (s) => (F(s).bookDone ? 'party' : 'garden'),
    guide: { name: '종이학 접이', img: 'props/crane' },
    intro: '별빛 열차에서 내리니… 해 질 녘 다락방이야. 어? 여기, 처음 그 책을 찾았던 할머니 집 다락방이잖아!',

    items: {
      scraps: { name: '습작 종이', img: 'items/scraps', desc: '봄이가 연습하다 버린 종이 조각들. 해님, 토끼, 시계… 낯익은 그림이 있어.' },
      mould: { name: '종이 뜨는 틀', img: 'items/mould', desc: '촘촘한 그물이 달린 나무 틀. 종이죽을 떠서 새 종이를 만들어.' },
      wetsheet: { name: '젖은 종이', img: 'items/wetsheet', desc: '틀로 막 떠낸 젖은 종이. 말려야 쓸 수 있어.' },
      paper: { name: '새 종이', img: 'items/paper', desc: '직접 떠서 말린 도톰한 새 종이.' },
      doorpage: { name: '문 페이지', img: 'items/doorpage', desc: '접이가 접어 준 문 모양 페이지. 펼치면 문이 톡 일어서.' },
      needle: { name: '실 꿴 바늘', img: 'items/needle', desc: '빨간 실을 꿴 바늘. 책장을 꿰맬 수 있어.' },
    },
    combos: [
      { a: 'scraps', b: 'mould', say: '종이 조각을 틀에 올려 봤자 종이가 되진 않아. 먼저 물에 불려야 해.' },
      { a: 'needle', b: 'paper', say: '그냥 종이를 꿰매면 평범한 쪽이 될 거야. 마지막 장은 특별해야지! 접이가 접어 준다고 했어.' },
    ],

    views: {
      /* ───── 북쪽: 펼친 종이 책, 창가의 접이 ───── */
      north: {
        name: '책 받침대',
        bg: 'bg/north',
        objects: [
          { id: 'height', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1240, 280, 100, 340], label: '키 재기 눈금', look: '벽에 빨간 키 재기 눈금이 있어. 꽃 표시마다 봄이가 한 살씩 자랐나 봐.' },
          { id: 'roundWin', x: 0, y: 0, w: 0, h: 0, img: '', hit: [180, 180, 240, 60], label: '둥근 창', look: '둥근 창 너머로 노을 진 마을 지붕들이 보여.' },
          {
            id: 'book', img: (s) => (F(s).bookDone ? 'props/book_done' : F(s).pageIn ? 'props/book_door' : 'props/book_blank'), x: 500, y: 180, w: 600, h: 380, label: '종이 책',
            click: (api) => { if (api.flags.bookDone) { api.say('책이 완성됐어. 마지막 장의 문이 반짝반짝.'); return; } api.zoom('bookpage'); },
            use: {
              doorpage: (api) => {
                if (!api.has('needle')) { api.say('문 페이지를 대 봤는데 자꾸 빠져. 바늘과 실로 꿰매야 해.'); return; }
                api.take('doorpage'); api.take('needle'); api.set('pageIn'); api.set('bookDone');
                api.sfx('grow'); api.flash('#fff3c0', 1200); api.burst('spark', 800, 360, 50);
                api.say('마지막 장을 한 땀 한 땀 꿰매자 책이 환하게 빛났어! 그때 바닥 문이 덜컥 열리고… “얘야, 다락방에 있니? 간식 먹으렴~”', 7000);
              },
              needle: (api) => api.say('꿰맬 마지막 장이 아직 없어.'),
              paper: (api) => api.say('그냥 종이보다… 마지막 장은 특별해야지. 접이가 접어 준다고 했어.'),
            },
          },
          { id: 'crane', img: (s) => (F(s).bookDone ? 'props/crane_happy' : 'props/crane'), x: 160, y: 200, w: 290, h: 264, cls: 'bob', blink: (s) => (F(s).bookDone ? null : 'props/crane_blink'), label: '종이학 접이',
            click: craneTalk,
            use: {
              paper: (api, n) => { api.take('paper'); api.set('folded'); api.give('doorpage', n); api.sfx('rip'); api.say('접이: “마지막 장은 이거야! 착, 착, 착… 펼치면 문이 톡 일어서는 문 페이지 완성!”', 5600, { who: 'crane' }); },
              wetsheet: (api) => api.say('접이: “젖은 종이는 접으면 찢어져. 먼저 바싹 말려 줘!”', 0, { who: 'crane' }),
              scraps: (api) => api.say('접이: “조각 종이로는 큰 문을 못 접어. 새 종이를 떠 와!”', 0, { who: 'crane' }),
            },
            wrong: '접이: “그건 종이가 아니잖아~”',
          },
        ],
      },

      /* ───── 동쪽: 작업대 (물통, 종이 뜨는 틀, 습작 휴지통, 순서 그림) ───── */
      east: {
        name: '종이 작업대',
        bg: 'bg/east',
        objects: [
          { id: 'steps', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1020, 134, 346, 212], label: '종이 뜨기 순서 그림', look: '봄이가 그린 순서 그림: 종이를 찢어서 → 물통에 넣고 → 틀로 뜬 다음 → 햇볕에 말린다.' },
          {
            id: 'tub', img: (s) => (F(s).pulp ? 'props/tub_pulp' : 'props/tub_water'), x: 300, y: 330, w: 360, h: 200, label: '물통',
            click: (api) => api.say(api.flags.pulp ? '찢은 종이가 물에 풀려서 하얀 종이죽이 됐어.' : '맑은 물이 담긴 나무 물통이야.'),
            use: {
              scraps: (api) => { api.take('scraps'); api.set('pulp'); api.sfx('splash'); api.say('종이 조각을 물에 넣고 휘휘 저었더니 뽀얀 종이죽이 됐어.'); },
              mould: (api, n) => {
                if (!api.flags.pulp) { api.say('맑은 물만 떠져. 찢은 종이를 넣어 종이죽을 만들어야 해.'); return; }
                api.take('mould'); api.give('wetsheet', n); api.sfx('water'); api.say('틀을 쑥 넣었다가 살살 들어 올리자, 그물 위에 얇은 종이가 떠졌어!');
              },
            },
          },
          { id: 'mould', img: 'props/mould', x: 760, y: 140, w: 220, h: 190, show: (s) => !F(s).mouldTaken, label: '종이 뜨는 틀', click: (api, n) => { api.set('mouldTaken'); api.give('mould', n); api.say('벽에 걸린 종이 뜨는 틀을 내렸어.'); } },
          {
            id: 'basket', img: (s) => (F(s).scrapsTaken ? 'props/basket_empty' : 'props/basket_full'), x: 1060, y: 560, w: 210, h: 210, label: '습작 휴지통',
            click: (api, n) => {
              if (api.flags.scrapsTaken) { api.say('휴지통이 비었어.'); return; }
              api.set('scrapsTaken'); api.give('scraps', n);
              api.say('구겨진 습작 종이들… 해님 기계, 토끼, 13시 시계, 거꾸로 방… 다 내가 지나온 방들이야! 봄이가 연습한 그림이었구나.', 6000);
            },
          },
        ],
      },

      /* ───── 남쪽: 큰 둥근 창(노을), 빨랫줄, 바닥 문 ───── */
      south: {
        name: '둥근 창',
        bg: 'bg/south',
        objects: [
          { id: 'chair', x: 0, y: 0, w: 0, h: 0, img: '', hit: [160, 400, 220, 280], label: '흔들의자', look: '분홍 뜨개 담요가 걸린 흔들의자. 할머니가 늘 앉던 의자야.' },
          {
            id: 'line', x: 0, y: 0, w: 0, h: 0, img: '', hit: [420, 170, 760, 70], label: '창가 빨랫줄',
            click: (api) => api.say('창가 빨랫줄이야. 노을 햇볕과 바람이 솔솔 들어와.'),
            use: { wetsheet: (api) => { api.take('wetsheet'); api.set('hung'); api.sfx('pick'); api.say('젖은 종이를 빨랫줄에 널었더니… 노을 햇볕과 바람에 금세 바삭하게 말랐어!'); } },
          },
          { id: 'sheet', img: 'props/sheet_dry', x: 680, y: 180, w: 250, h: 240, show: (s) => !!F(s).hung && !F(s).sheetTaken, label: '말린 종이', click: (api, n) => { api.set('sheetTaken'); api.give('paper', n); api.say('도톰하게 마른 새 종이를 걷었어.'); } },
          {
            id: 'hatch', img: (s) => (F(s).bookDone ? 'props/hatch_open' : 'props/hatch_closed'), x: 580, y: 560, w: 440, h: 280, hit: [600, 640, 400, 190], label: '바닥 문',
            click: (api) => {
              if (api.flags.bookDone) { api.sfx('step'); api.win(); return; }
              api.sfx('locked'); api.say('아래층으로 가는 바닥 문이 꼭 닫혀 있어. 책이 완성되면 집으로 가는 문이 열린다고 접이가 그랬지.');
            },
          },
        ],
      },

      /* ───── 서쪽: 봄이의 여행 지도, 옛날 사진, 반짇고리 ───── */
      west: {
        name: '여행 지도 벽',
        bg: 'bg/west',
        objects: [
          { id: 'map', x: 0, y: 0, w: 0, h: 0, img: '', hit: [240, 96, 670, 386], label: '봄이의 여행 지도', click: (api) => { api.note('봄이의 여행 지도', '출발(발자국) → 책상 → 구름 → 등대 → 기차 → 집'); api.say('어린 봄이가 그린 여행 지도야. 발자국에서 출발해서 책상 → 구름 → 등대 → 기차 → 집. 내가 지나온 길이랑 똑같아!', 5600); } },
          { id: 'photo', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1000, 160, 220, 260], label: '옛날 사진', look: '빛바랜 사진 속 단발머리 아이가 종이학을 들고 웃고 있어. 이 아이가 봄이구나…' },
          {
            id: 'tin', img: (s) => (F(s).tinOpen ? 'props/tin_open' : 'props/tin_closed'), x: 960, y: 400, w: 340, h: 200, hit: [970, 430, 320, 150], label: '반짇고리',
            click: (api, n) => {
              const f = api.flags;
              if (!f.tinOpen) { api.zoom('tin'); return; }
              if (f.needleTaken) { api.say('반짇고리 안에 실타래만 남았어.'); return; }
              api.set('needleTaken'); api.give('needle', n); api.say('빨간 실이 꿰어진 바늘을 챙겼어.');
            },
          },
        ],
      },
    },

    zooms: {
      bookpage: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['책의 마지막 장', '마지막 장은 너를 위해 비워 둘게. 네가 직접 만들어서 꿰매 넣으렴. — 봄'],
        text: '<h3>마지막 장</h3><p>(찢긴 자국 옆에 작은 글씨)</p><p>마지막 장은 <em>너를 위해</em> 비워 둘게.<br>네가 직접 <em>종이를 만들어</em>, <em>꿰매</em> 넣으렴.<br>그러면 집으로 가는 문이 열릴 거야.</p><p class="sign">— 봄</p>',
      },
      tin: {
        bg: 'zoom/tin',
        note: ['반짇고리 자물쇠', '네 칸에 그림을 맞춘다. 발자국이 왼쪽에서 오른쪽으로: 봄이가 지나간 순서?'],
        widget: tinWidget,
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.bookDone) return { key: 'go', steps: ['책이 완성됐어요! 바닥 문이 열렸어요.', '남쪽 바닥 문이에요.', '바닥 문을 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['접이에게 말을 걸어 봐요.', '북쪽 둥근 창가에 접이가 있어요.', '접이를 누르세요.'] };
      if (!has('doorpage') && !f.folded) {
        if (!has('paper')) {
          if (!f.hung) {
            if (!has('wetsheet')) {
              if (!f.pulp) { if (!has('scraps')) return { key: 'scraps', steps: ['새 종이를 직접 만들어야 해요. 동쪽 벽의 순서 그림을 보세요.', '첫 단계는 종이를 찢는 거예요. 버린 종이가 어디 있을까요?', '동쪽 습작 휴지통에서 종이 조각을 꺼내세요.'] }; return { key: 'pulp', steps: ['종이 조각을 물에 불려요.', '동쪽 작업대의 나무 물통이에요.', '습작 종이를 고른 채 물통을 누르세요.'] }; }
              if (!has('mould')) return { key: 'mould', steps: ['종이죽을 떠낼 도구가 필요해요.', '동쪽 벽에 그물 달린 틀이 걸려 있어요.', '벽의 종이 뜨는 틀을 챙기세요.'] };
              return { key: 'lift', steps: ['틀로 종이죽을 떠요.', '동쪽 물통이에요.', '종이 뜨는 틀을 고른 채 물통을 누르세요.'] };
            }
            return { key: 'dry', steps: ['젖은 종이는 말려야 해요.', '남쪽 둥근 창 앞에 빨랫줄이 있어요.', '젖은 종이를 고른 채 남쪽 빨랫줄을 누르세요.'] };
          }
          return { key: 'take', steps: ['종이가 다 말랐어요.', '남쪽 빨랫줄이에요.', '말린 종이를 누르세요.'] };
        }
        return { key: 'fold', steps: ['마지막 장은 특별한 모양이어야 해요.', '종이접기 선수 접이에게 부탁해요.', '새 종이를 고른 채 북쪽 접이를 누르세요.'] };
      }
      if (!has('needle')) {
        if (!f.tinOpen) return { key: 'tin', steps: ['책장을 꿰맬 바늘과 실이 필요해요. 서쪽 반짇고리는 그림 자물쇠로 잠겨 있어요.', '서쪽 벽 봄이의 여행 지도를 보세요. 발자국에서 출발하는 순서예요.', '반짇고리 칸을 책상 → 구름 → 등대 → 기차 순서로 맞추세요.'] };
        return { key: 'needle', steps: ['반짇고리가 열렸어요.', '서쪽 반짇고리예요.', '반짇고리를 눌러 실 꿴 바늘을 챙기세요.'] };
      }
      return { key: 'bind', steps: ['이제 마지막 장을 꿰매요.', '북쪽 펼친 종이 책이에요.', '문 페이지를 고른 채 북쪽 종이 책을 누르세요.'] };
    },

    ending: {
      title: '종이 문 너머, 할머니의 다락방',
      text: ['사다리를 내려가자 고소한 냄새가 났어요. 부엌에서 할머니가 웃으며 손을 흔들었지요. “다녀왔니? 내 책 속 친구들은 잘 있었고?”', '할머니의 앞치마 주머니에서 종이학 하나가 고개를 쏙 내밀었어요. 접이가 날개를 파닥였어요. “봄아, 다녀왔어!”', '봄은 할머니의 이름이었어요. 아홉 살 봄이가 만든 종이 책은, 오랫동안 이날을 기다리고 있었답니다.'],
      next: '2편 완결 · 책장을 덮고 다시 처음부터 놀 수 있어요',
      image: 'assets/ui/finale2.svg',
    },
  });
})();
