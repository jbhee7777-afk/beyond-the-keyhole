/* 6장 「거인의 책상」 (다시 만든 판: 이미지 도구 손그림 + 한 단계 어려운 퍼즐)
 * 내가 지우개만큼 작아졌다. 스케치북에 그려진 종이 문이 다음 길.
 * 퍼즐 흐름 (두 갈래가 마지막 문에서 합쳐진다)
 *  갈래 가 (빛과 그림자)
 *   - 그림 문 위의 X는 지워지지 않는다 → 스탠드 불빛이 연필꽂이의 엇갈린 연필 두 자루를 비춰 생긴 그림자
 *   - 스탠드를 끄면 X는 사라지지만 깜깜하다 → 커튼을 열어 햇빛으로 바꾼다
 *   - 커튼 끈은 내가 너무 가벼워 안 당겨진다 → 클립으로 끈과 무거운 지우개를 잇고 책상 끝에서 밀어 떨어뜨린다 (추)
 *  갈래 나 (색연필)
 *   - 책 더미 계단 꼭대기에서 내려다봐야 거대한 낙서가 보인다: 물결 위 종이배 → 웅덩이 화살표 (높이)
 *   - 접이는 "무엇을" 접을지 알아야 접어 준다 → 낙서를 본 뒤에 메모지를 주면 종이배
 *   - 종이배로 물웅덩이를 건너면 필통. 지퍼 구슬 자물쇠 → 북쪽 연필꽂이 스티커 순서(빨강·파랑·노랑) (다른 벽 단서)
 *   - 필통 속 몽당 색연필 세 자루 중 쪽지의 "해님 색"(노랑)을 골라 연필깎이로 깎는다 (추론, 미끼 둘)
 *  합류: 스탠드 끔 + 커튼 열림(햇빛) 상태에서 그림 문에 노란 손잡이를 그리면 진짜 문이 된다
 */
(function () {
  const F = (s) => s.flags;
  const lit = (s) => !F(s).lampOff || !!F(s).curtainOpen;
  const COLORS = ['red', 'blue', 'yellow', 'green'];
  const CNAME = { red: '빨강', blue: '파랑', yellow: '노랑', green: '초록' };
  const ANSWER = ['red', 'blue', 'yellow'];

  function craneTalk(api) {
    const f = api.flags;
    if (!f.craneTalked) {
      f.craneTalked = true;
      api.lock(4600);
      api.say('접이: “안녕, 작은 친구! 나는 종이학 접이야. 이 책상 주인이 나를 접어 줬지.”', 4600, { who: 'crane' });
      api.after(4600, () => api.say('접이: “종이만 주면 뭐든 접어 줄게. 대신 뭘 접을지는 네가 알려 줘야 해. 학? 비행기? 모자?”', 5400, { who: 'crane', note: '접이의 말' }));
      return;
    }
    if (f.boatMade) { api.say('접이: “종이배는 오래 물에 있으면 흐물흐물해져. 얼른 건너!”', 0, { who: 'crane' }); return; }
    if (f.climbed) { api.say('접이: “책 꼭대기에서 뭘 봤어? 그 그림대로 접어 줄게. 종이만 가져와!”', 0, { who: 'crane' }); return; }
    api.say('접이: “뭘 접어야 할지 모르겠으면… 높은 데서 책상을 내려다봐. 이 책상엔 커다란 낙서가 많거든.”', 0, { who: 'crane' });
  }

  // 지퍼 구슬 자물쇠: 구슬을 누를 때마다 색이 바뀐다
  function lockWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.bead-lock');
    if (f.caseOpen) { if (box) box.remove(); return; }
    if (box) return;
    f.beads = f.beads || [3, 3, 3];
    box = document.createElement('div');
    box.className = 'bead-lock';
    f.beads.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'piece bead';
      b.style.cssText = `left:${1296}px;top:${503 + i * 86}px;width:88px;height:88px`;
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`props/bead_${COLORS[v]}.webp`); b.appendChild(im);
      const label = () => b.setAttribute('aria-label', `${i + 1}번째 구슬 (${CNAME[COLORS[f.beads[i]]]})`);
      label();
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        f.beads[i] = (f.beads[i] + 1) % 4; im.src = game.src(`props/bead_${COLORS[f.beads[i]]}.webp`); label();
        api.sfx('click');
        if (f.beads.every((c, k) => COLORS[c] === ANSWER[k])) {
          f.caseOpen = true; game.busy = true;
          setTimeout(() => { game.busy = false; api.sfx('unlock'); api.say('딸깍! 구슬 색을 맞추자 지퍼가 스르륵 풀렸어.'); game.s.zoom = 'pcase'; game.save(); game.render(); }, 450);
        }
        game.save();
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  }

  const crayonIn = (c, x) => ({
    id: 'cr_' + c, img: `items/crayon_${c}.webp`, x, y: 470, w: 220, h: 220, cls: 'item-in', show: (s) => !F(s)['got_' + c], label: `${CNAME[c]} 몽당 색연필`,
    click: (api, n) => { api.set('got_' + c); api.give('crayon_' + c, n); api.say(`${CNAME[c]} 몽당 색연필을 꺼냈어. 심이 뭉툭해.`); },
  });
  const sharpen = (c) => (api, n) => {
    api.take('crayon_' + c); api.give('sharp_' + c, n); api.sfx('scrape'); api.burst('dust', 900, 560, 18);
    api.say(`${CNAME[c]} 색연필을 구멍에 꽂고 손잡이에 대롱대롱 매달려 빙글빙글… 뾰족해졌어!`, 4600);
  };

  Engine.registerRoom({
    id: 'desk',
    chapter: '6장',
    title: '거인의 책상',
    assets: 'assets/rooms/desk/',
    sky: ['assets/rooms/desk/bg/north.webp', 'assets/rooms/desk/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 25, // 2편: 다음 힌트까지 조금 더 오래 생각하게
    isLit: lit,
    dim: { color: '#1c1626', opacity: 0.66 },
    dimFade: 0.4,
    ambient: (s) => (F(s).curtainOpen ? 'garden' : 'workshop'),
    guide: { name: '종이학 접이', img: 'props/crane_idle.webp' },
    intro: '어? 내가 지우개만큼 작아졌어! 여긴 커다란 책상 위야. 연필이 나무 기둥처럼 높아.',
    repair(s, fix) {
      const f = s.flags;
      if (f.boatMade && !f.crossed && !fix.has('boat')) fix.give('boat');
    },

    items: {
      clip: { name: '클립', img: 'items/clip.webp', desc: '내 키만 한 쇠 클립. 무언가를 걸어 연결할 수 있어.' },
      memo: { name: '메모지', img: 'items/memo.webp', desc: '노란 메모지 한 장. 나한테는 이불만큼 커.' },
      boat: { name: '종이배', img: 'items/boat.webp', desc: '접이가 메모지로 접어 준 종이배. 나 하나는 거뜬히 태울 수 있어.' },
      crayon_red: { name: '빨강 몽당 색연필', img: 'items/crayon_red.webp', desc: '심이 뭉툭한 빨강 색연필.' },
      crayon_blue: { name: '파랑 몽당 색연필', img: 'items/crayon_blue.webp', desc: '심이 뭉툭한 파랑 색연필.' },
      crayon_yellow: { name: '노랑 몽당 색연필', img: 'items/crayon_yellow.webp', desc: '심이 뭉툭한 노랑 색연필.' },
      sharp_red: { name: '뾰족한 빨강 색연필', img: 'items/sharp_red.webp', desc: '방금 깎은 빨강 색연필.' },
      sharp_blue: { name: '뾰족한 파랑 색연필', img: 'items/sharp_blue.webp', desc: '방금 깎은 파랑 색연필.' },
      sharp_yellow: { name: '뾰족한 노랑 색연필', img: 'items/sharp_yellow.webp', desc: '방금 깎은 노랑 색연필.' },
    },
    combos: [
      { a: 'memo', b: 'clip', say: '메모지를 클립으로 집어 봤자 배가 되진 않아. 접는 건 접이 특기였지?' },
      ...['red', 'blue', 'yellow'].flatMap((c) => [
        { a: 'crayon_' + c, b: 'clip', say: '클립으로는 색연필을 못 깎아. 진짜 연필깎이가 어딘가 있었는데…' },
        { a: 'crayon_' + c, b: 'memo', say: '메모지에 문을 그려도 너무 작아. 나가야 할 문은 스케치북에 있어.' },
        { a: 'sharp_' + c, b: 'memo', say: '메모지에 그려도 문은 안 열려. 스케치북의 그림 문에 그려야 해.' },
      ]),
    ],

    views: {
      /* ───── 북쪽: 스케치북 그림 문, 연필꽂이, 스탠드 ───── */
      north: {
        name: '스케치북 벽',
        bg: 'bg/north.webp',
        objects: [
          { id: 'sketch', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 60, 800, 640], label: '거대한 스케치북', look: '벽에 기대 세운 스케치북이야. 나한테는 건물만큼 커. 해님이랑 꽃 낙서가 있어.' },
          { id: 'sun', x: 0, y: 0, w: 0, h: 0, img: '', hit: [140, 110, 160, 140], label: '해님 낙서', look: '노란 크레용으로 그린 해님이야. 빛살이 삐죽삐죽.' },
          { id: 'flowers', x: 0, y: 0, w: 0, h: 0, img: '', hit: [130, 550, 170, 140], label: '꽃 낙서', look: '빨강 꽃 하나, 파랑 꽃 하나.' },
          { id: 'note', x: 0, y: 0, w: 0, h: 0, img: '', hit: [690, 555, 195, 125], zoom: 'note', label: '스케치북 구석 쪽지' },
          { id: 'lampglow', img: 'props/lampglow.webp', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: (s) => !F(s).lampOff },
          {
            id: 'door', x: 0, y: 0, w: 0, h: 0, img: '', hit: [345, 180, 300, 470], label: '그림 문',
            click: (api) => {
              const f = api.flags;
              if (f.doorOpen) { api.sfx('step'); api.win(); return; }
              if (f.knobDrawn) { api.set('doorOpen'); api.sfx('door'); api.burst('spark', 495, 400, 30); api.say('그린 손잡이를 잡아 돌리자… 덜컥! 종이 문이 열렸어.', 4600); return; }
              if (!f.lampOff) { api.say('연필로 그린 문이야. 커다란 X가 가로막고 있고, 손잡이도 없어. X는 문질러도 안 지워지네.'); return; }
              if (!f.curtainOpen) { api.say('깜깜해서 문이 잘 안 보여. 그래도 X는 사라진 것 같아!'); return; }
              api.say('X가 사라졌어. 이제 이 문을 끝까지 그려 넣으면 될 텐데.');
            },
            use: Object.assign({
              sharp_yellow: (api) => {
                const f = api.flags;
                if (!f.lampOff) { api.say('X 그림자가 문을 가리고 있어서 손잡이 자리가 안 보여.'); return; }
                if (!f.curtainOpen) { api.say('너무 깜깜해서 어디에 그려야 할지 모르겠어. 빛이 필요해.'); return; }
                api.take('sharp_yellow'); api.set('knobDrawn'); api.sfx('grow');
                api.burst('spark', 600, 430, 34); api.flash('#fff6dc', 600);
                api.say('해님 색으로 손잡이를 동그랗게 칠했더니… 그림 문에 빛이 스르르 번지면서 진짜 문이 됐어!', 5200);
              },
            }, ...['red', 'blue'].map((c) => ({
              ['sharp_' + c]: (api) => {
                if (!api.flags.lampOff || !api.flags.curtainOpen) { api.say('지금은 문이 잘 안 보여서 그릴 수가 없어.'); return; }
                api.sfx('nope'); api.say(`${CNAME[c]} 손잡이를 그렸는데… 선이 종이에 스며들듯 사라져 버렸어. 아무 색이나 되는 게 아닌가 봐.`);
              },
            })), ...['red', 'blue', 'yellow'].map((c) => ({ ['crayon_' + c]: (api) => api.say('심이 뭉툭해서 선이 안 그려져. 뾰족하게 깎아야겠어.') }))),
            wrong: '그걸로는 그림 문을 어쩔 수 없어. 문에는 그려야 하는 게 있잖아?',
          },
          { id: 'xshadow', img: 'props/xshadow.webp', x: 0, y: 0, w: 1600, h: 900, show: (s) => !F(s).lampOff && !F(s).knobDrawn },
          { id: 'knob', img: 'props/knob.webp', x: 560, y: 400, w: 70, h: 70, show: (s) => !!F(s).knobDrawn && !F(s).doorOpen },
          { id: 'doorOpen', img: 'props/door_open.webp', x: 340, y: 172, w: 310, h: 486, show: (s) => !!F(s).doorOpen, hit: [345, 180, 300, 470], label: '열린 문', click: (api) => { api.sfx('step'); api.win(); } },
          {
            id: 'cup', x: 0, y: 0, w: 0, h: 0, img: '', hit: [940, 380, 290, 310], label: '연필꽂이',
            click: (api) => {
              api.note('연필꽂이 스티커', '양철 연필꽂이에 동그란 스티커 세 개: 왼쪽부터 빨강 · 파랑 · 노랑');
              api.say('양철 연필꽂이야. 동그란 스티커가 왼쪽부터 빨강, 파랑, 노랑 순서로 붙어 있어.');
            },
          },
          {
            id: 'pencils', x: 0, y: 0, w: 0, h: 0, img: '', hit: [920, 60, 300, 320], label: '엇갈린 연필',
            click: (api) => {
              api.note('엇갈린 연필', '연필 두 자루가 X자로 엇갈려 있다. 그 뒤에서 스탠드가 스케치북 쪽을 비춘다.');
              api.say(api.flags.lampOff ? '연필이 하늘까지 솟은 기둥 같아. 파랑이랑 노랑이 X자로 엇갈려 있어.' : '연필이 하늘까지 솟은 기둥 같아. 파랑이랑 노랑이 X자로 엇갈려 있고, 그 너머에서 스탠드 불빛이 스케치북 쪽으로 쏟아져.');
            },
          },
          { id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1130, 0, 350, 110], label: '스탠드 갓', look: (s) => (F(s).lampOff ? '스탠드 불이 꺼져 있어.' : '머리 위 스탠드 갓에서 뜨끈한 불빛이 스케치북 쪽으로 쏟아져.') },
          {
            id: 'switch', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1280, 540, 110, 70], label: '스탠드 스위치',
            click: (api) => {
              const f = api.flags;
              f.lampOff = !f.lampOff; api.sfx('click');
              if (f.lampOff && !f.curtainOpen) api.say('폴짝! 스위치 위로 뛰어 꾹 밟았더니 불이 꺼졌어. 문 위의 X도 사라졌는데… 너무 깜깜해!', 5200);
              else if (f.lampOff) api.say('불을 껐어. 햇빛만 남으니 문 위의 X가 사라졌어!', 4600);
              else api.say('다시 불을 켰어. 문 위에 X가 또 생겼어.');
            },
          },
        ],
      },

      /* ───── 동쪽: 쓰러진 유리컵, 물웅덩이, 필통 ───── */
      east: {
        name: '필통 쪽',
        bg: 'bg/east.webp',
        objects: [
          { id: 'glass', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 40, 480, 480], label: '쓰러진 유리컵', look: '유리컵이 쓰러져서 물이 쏟아졌어. 나한테는 유리 터널 같아.' },
          { id: 'brush', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 730, 1320, 170], label: '붓', look: '물감 붓이 통나무처럼 누워 있어. 노로 쓰면 딱이겠다.' },
          {
            id: 'puddle', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 500, 1300, 230], label: '물웅덩이',
            click: (api) => api.say(api.flags.crossed ? '건너편 물가에 종이배를 대 두었어.' : '엎질러진 물이 호수처럼 넓어! 필통은 저 건너편이야. 헤엄치기엔 너무 멀어.'),
            use: {
              boat: (api) => { api.take('boat'); api.set('crossed'); api.sfx('splash'); api.burst('bubble', 850, 640, 24); api.say('종이배를 띄우고 붓털 한 가닥을 노 삼아 영차영차! 필통 앞에 도착했어.', 4600); },
              memo: (api) => api.say('메모지를 그냥 띄우면 금방 젖어서 가라앉을 거야.'),
            },
            wrong: '그걸 물에 던지면 젖기만 할 거야.',
          },
          { id: 'boatParked', img: 'items/boat.webp', x: 860, y: 520, w: 200, h: 200, show: (s) => !!F(s).crossed },
          {
            id: 'case', x: 0, y: 0, w: 0, h: 0, img: '', hit: [920, 130, 680, 450], label: '필통',
            click: (api) => {
              if (!api.flags.crossed) { api.say('커다란 필통이 물웅덩이 건너편에 있어. 어떻게 건너가지?'); return; }
              api.sfx('step'); api.zoom(api.flags.caseOpen ? 'pcase' : 'lock');
            },
          },
        ],
      },

      /* ───── 남쪽: 책 더미 계단, 거대한 연필 자국, 접이 ───── */
      south: {
        name: '책상 끝',
        bg: 'bg/south.webp',
        objects: [
          { id: 'edge', x: 0, y: 0, w: 0, h: 0, img: '', hit: [680, 0, 920, 490], label: '책상 끝 너머', look: '책상 끝 너머로 아득히 먼 방바닥이 보여. 으, 아찔해!' },
          { id: 'writing', x: 0, y: 0, w: 0, h: 0, img: '', hit: [680, 520, 920, 380], label: '거대한 연필 자국', look: '책상 위에 엄청 굵은 연필 자국이 있어. 너무 커서 한 획밖에 안 보여… 높은 데서 내려다보면 뭔지 알 수 있을까?' },
          {
            id: 'books', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 110, 660, 670], label: '책 더미 계단',
            click: (api) => { api.set('climbed'); api.sfx('step'); api.zoom('booktop'); },
          },
          {
            id: 'crane', img: (s) => (F(s).boatMade ? 'props/crane_happy.webp' : 'props/crane_idle.webp'), x: 760, y: 170, w: 540, h: 490, cls: 'bob', hit: [860, 200, 340, 460], label: '종이학 접이',
            click: craneTalk,
            use: {
              memo: (api, n) => {
                if (!api.flags.climbed) { api.say('접이: “메모지네! 그런데 뭘 접어 줄까? 학? 비행기? 모자? 뭐가 필요한지 모르겠어.”', 0, { who: 'crane' }); return; }
                api.take('memo'); api.set('boatMade'); api.give('boat', n); api.sfx('rip');
                api.say('접이: “책상 위에 그려진 그거? 종이배라면 자신 있지! 반으로 착, 모서리를 착착… 짠!”', 5200, { who: 'crane' });
              },
            },
            wrong: '접이: “그건 종이가 아니잖아. 종이를 줘야 접지!”',
          },
        ],
      },

      /* ───── 서쪽: 창문과 커튼, 클립 상자, 메모지, 연필깎이, 지우개 ───── */
      west: {
        name: '창문 쪽',
        bg: (s) => (F(s).curtainOpen ? 'bg/west.webp' : 'bg/west_closed.webp'),
        objects: [
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [240, 0, 1120, 400], label: '커다란 창문', look: (s) => (F(s).curtainOpen ? '커튼이 활짝 열려서 햇빛이 책상 가득 쏟아져.' : '두꺼운 커튼이 창문을 꽁꽁 가리고 있어. 틈으로 햇빛이 조금 새어 나와.') },
          {
            id: 'clipbox', x: 0, y: 0, w: 0, h: 0, img: '', hit: [50, 390, 400, 320], label: '클립 상자',
            click: (api, n) => {
              if (api.has('clip') || api.flags.tied) { api.say('클립은 하나면 충분해.'); return; }
              api.give('clip', n); api.say('클립 하나를 영차 꺼냈어. 내 키만 한 쇠 고리야.');
            },
          },
          {
            id: 'memo', x: 0, y: 0, w: 0, h: 0, img: '', hit: [480, 555, 265, 140], label: '메모지 묶음',
            click: (api, n) => {
              if (api.flags.memoTaken) { api.say('메모지는 한 장이면 충분해.'); return; }
              api.set('memoTaken'); api.give('memo', n); api.say('노란 메모지 한 장을 떼어 냈어. 나한테는 이불만큼 커.');
            },
          },
          {
            id: 'sharpener', x: 0, y: 0, w: 0, h: 0, img: '', hit: [800, 190, 300, 500], label: '연필깎이',
            look: '손잡이를 돌리는 연필깎이야. 손잡이가 내 키보다 훨씬 높아. 매달리면 돌아가려나?',
            use: {
              crayon_red: sharpen('red'), crayon_blue: sharpen('blue'), crayon_yellow: sharpen('yellow'),
              sharp_red: (api) => api.say('이미 충분히 뾰족해.'), sharp_blue: (api) => api.say('이미 충분히 뾰족해.'), sharp_yellow: (api) => api.say('이미 충분히 뾰족해.'),
            },
            wrong: '연필깎이에는 연필 같은 걸 넣어야지.',
          },
          {
            id: 'cord', img: (s) => (F(s).curtainOpen ? 'props/cord_taut.webp' : 'props/cord.webp'), x: 1320, y: -20, w: 200, h: 660, hit: [1340, 150, 136, 250], label: '커튼 끈',
            click: (api) => {
              if (api.flags.curtainOpen) { api.say('커튼 끈이 팽팽하게 당겨져 있어.'); return; }
              api.note('커튼 끈', '매달려 당겨도 내가 너무 가벼워서 안 움직인다.');
              api.say('커튼 끈이야. 매달려 당겨 봤는데 내가 너무 가벼워서 꿈쩍도 안 해.', 4600);
            },
            use: { clip: (api) => api.say('클립만 끈에 걸어선 소용없어. 나 말고 더 무거운 게 당겨 줘야 해.') },
          },
          {
            id: 'eraser', img: (s) => (F(s).tied ? 'props/eraser_tied.webp' : 'props/eraser.webp'), x: 1130, y: 520, w: 260, h: 236, show: (s) => !F(s).curtainOpen, label: '커다란 지우개',
            click: (api) => {
              const f = api.flags;
              if (!f.tied) { api.say('엄청 무거운 지우개가 책상 끝에 아슬아슬하게 놓여 있어. 밀면 떨어질 것 같아. 그냥 떨어뜨리면 아깝지.'); return; }
              api.set('curtainOpen'); api.sfx('dig'); api.flash('#fff3c8', 900); api.burst('dust', 1260, 640, 26);
              api.say('영차! 지우개를 책상 끝으로 밀었더니 쿵— 떨어지면서 커튼 끈을 당겼어. 커튼이 열리고 햇빛이 쏟아져!', 5600);
            },
            use: { clip: (api) => { api.take('clip'); api.set('tied'); api.sfx('clink'); api.say('클립으로 커튼 끈 끝을 지우개에 단단히 걸었어.'); } },
          },
        ],
      },
    },

    zooms: {
      note: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        note: ['스케치북 구석의 쪽지', '그림 문은 끝까지 다 그려야 열린다. 손잡이는 이 그림 속 해님과 같은 색으로. — 봄'],
        text: '<h3>스케치북 구석의 쪽지</h3><p>그림 문은 <em>끝까지 다 그려야</em> 열려요.<br>손잡이 하나 빠져도 안 열린답니다.</p><p>손잡이는 이 그림 속 <em>해님과 같은 색</em>으로.</p><p class="sign">— 봄</p>',
      },
      booktop: {
        bg: 'zoom/booktop.webp',
        note: ['책상 위 거대한 낙서', '책 꼭대기에서 내려다보니: 물결 위 종이배 → 화살표 → 쏟아진 물'],
        objects: [
          { id: 'doodle', x: 0, y: 0, w: 0, h: 0, img: '', hit: [280, 380, 720, 380], label: '종이배 낙서', look: '위에서 보니 알겠어! 물결 위에 떠 있는 종이배 그림이야.' },
          { id: 'arrow', x: 0, y: 0, w: 0, h: 0, img: '', hit: [880, 470, 460, 160], label: '낙서 화살표', look: '종이배에서 쭉 그은 화살표가 쏟아진 물웅덩이를 가리켜.' },
        ],
      },
      lock: {
        bg: 'zoom/lock.webp',
        note: ['필통 자물쇠', '지퍼 손잡이에 구슬 세 개를 끼우는 자물쇠. 맞는 색 순서로 끼워야 열린다.'],
        widget: lockWidget,
        objects: [{ id: 'zip', x: 0, y: 0, w: 0, h: 0, img: '', hit: [60, 300, 1180, 140], label: '지퍼', look: '지퍼가 꽉 잠겨 있어. 손잡이의 구슬 자물쇠를 풀어야 해.' }],
      },
      pcase: {
        bg: 'zoom/pcase.webp',
        objects: [crayonIn('red', 360), crayonIn('blue', 690), crayonIn('yellow', 1020)],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      const anyCrayon = ['red', 'blue', 'yellow'].some((c) => has('crayon_' + c) || has('sharp_' + c));
      if (f.doorOpen) return { key: 'out', steps: ['문이 열렸어요!', '북쪽 그림 문으로 나가요.', '북쪽 문을 누르세요.'] };
      if (f.knobDrawn) return { key: 'open', steps: ['그림 문이 진짜 문이 됐어요.', '손잡이를 잡아 돌려 봐요.', '북쪽 문을 누르세요.'] };
      if (!has('sharp_yellow')) {
        if (!f.caseOpen || (!has('crayon_yellow') && !f.got_yellow)) {
          if (!f.crossed) {
            if (!f.boatMade && !has('boat')) {
              if (!f.climbed) return { key: 'climb', steps: ['남쪽 책상 위의 굵은 연필 자국은 가까이선 알아볼 수 없어요.', '큰 그림은 높은 데서 내려다봐야 보여요. 책이 계단처럼 쌓여 있죠?', '남쪽 책 더미 계단을 눌러 꼭대기에 올라가세요.'] };
              if (!has('memo')) return { key: 'memo', steps: ['낙서는 종이배 그림이었어요. 종이배를 만들 종이가 필요해요.', '서쪽 책상에 노란 메모지 묶음이 있어요.', '서쪽 메모지 묶음을 눌러 한 장 떼어 내세요.'] };
              return { key: 'fold', steps: ['종이를 배 모양으로 접어야 해요.', '종이학 접이는 종이접기 선수예요. 낙서를 보고 왔으니 이제 뭘 접을지 알죠.', '메모지를 고른 채 남쪽 접이를 누르세요.'] };
            }
            return { key: 'sail', steps: ['낙서의 화살표는 쏟아진 물을 가리켰어요.', '동쪽 물웅덩이 건너편에 필통이 있어요.', '종이배를 고른 채 동쪽 물웅덩이를 누르세요.'] };
          }
          if (!f.caseOpen) return { key: 'lock', steps: ['필통 지퍼에 구슬 세 개짜리 자물쇠가 있어요. 색 순서를 어디서 봤을까요?', '책상 위에 동그란 색깔 세 개가 나란히 붙은 물건이 있었어요.', '북쪽 연필꽂이 스티커 순서대로 빨강 → 파랑 → 노랑으로 맞추세요.'] };
          return { key: 'case', steps: ['필통 안에 몽당 색연필이 있어요.', '어떤 색이 필요할지는 아직 몰라도 돼요. 일단 챙겨요.', '필통 속 색연필을 눌러 챙기세요 (노랑이 꼭 필요해요).'] };
        }
        if (!has('crayon_yellow')) return { key: 'case', steps: ['필통 속 색연필을 챙겨요.', '동쪽 필통이에요.', '노랑 몽당 색연필을 챙기세요.'] };
        return { key: 'sharpen', steps: ['손잡이는 어떤 색이어야 할까요? 스케치북 구석 쪽지를 읽어 봐요.', '쪽지: "해님과 같은 색". 스케치북의 해님은 노란색이에요. 그런데 심이 뭉툭하죠?', '노랑 몽당 색연필을 고른 채 서쪽 연필깎이를 누르세요.'] };
      }
      if (!f.curtainOpen) {
        if (!f.tied) {
          if (!has('clip')) return { key: 'clip', steps: ['손잡이를 그리려면 그림자 없는 빛이 필요해요. 서쪽 커튼을 열어 볼까요?', '커튼 끈은 내가 너무 가벼워서 안 당겨져요. 책상 끝 무거운 지우개가 대신 당겨 주면? 이을 고리가 필요해요.', '서쪽 클립 상자에서 클립을 꺼내세요.'] };
          return { key: 'tie', steps: ['클립으로 커튼 끈과 지우개를 이어요.', '지우개는 책상 끝에 아슬아슬하게 있어요.', '클립을 고른 채 서쪽 지우개를 누르세요.'] };
        }
        return { key: 'push', steps: ['지우개를 밀어 떨어뜨려 봐요.', '무거운 지우개가 떨어지면서 커튼 끈을 당겨요.', '서쪽 지우개를 누르세요.'] };
      }
      if (!f.lampOff) return { key: 'shadow', steps: ['문 위의 X는 문질러도 안 지워져요. 그림이 아니라 무엇일까요?', '스탠드 불빛이 연필꽂이의 엇갈린 연필 두 자루를 비춰요. X는 그 그림자예요.', '북쪽 스탠드 스위치를 눌러 불을 끄세요. 햇빛만으로도 충분히 밝아요.'] };
      if (anyCrayon && !has('sharp_yellow')) return { key: 'color', steps: ['손잡이 색이 중요해요.', '쪽지: "해님과 같은 색".', '뾰족한 노랑 색연필로 그리세요.'] };
      return { key: 'draw', steps: ['이제 그림 문을 마저 그려요.', '쪽지: "손잡이까지! 해님과 같은 색으로".', '뾰족한 노랑 색연필을 고른 채 북쪽 그림 문을 누르세요.'] };
    },

    ending: {
      title: '종이 문을 만든 사람',
      text: ['그려 넣은 손잡이를 돌리자 종이 문이 스르르 열렸어요. 접이가 날개를 파닥이며 어깨에 내려앉았지요.', '“스케치북 구석의 이름 봤어? 봄… 이 책을 만든 사람이야. 나를 접어 준 사람이기도 하고.”', '봄이는 누구일까요? 접이와 함께 다음 종이 문을 찾아 떠나요.'],
      next: '다음 이야기 · 7장 구름 세탁소',
    },
  });
})();
