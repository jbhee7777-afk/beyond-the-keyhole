/* 6장 「거인의 책상」
 * 내가 지우개만큼 작아졌다. 스케치북에 그려진 종이 문이 다음 길.
 * 퍼즐 흐름 (두 갈래가 마지막 문에서 합쳐진다)
 *  갈래 가: 그림 문의 X는 지워지지 않는다 → 스탠드 불빛이 연필꽂이의 엇갈린 연필 두 자루를 비춰 생긴 그림자 (그림자)
 *          스탠드를 끄면 X는 사라지지만 깜깜하다 (환경 변화)
 *          커튼 끈은 내가 너무 가벼워 안 당겨진다 → 클립으로 끈과 무거운 지우개를 연결해 책상 끝으로 밀면 커튼이 열린다 (예상 밖의 쓰임: 추)
 *  갈래 나: 책 더미 계단 꼭대기에서 내려다봐야 거대한 연필 글씨가 읽힌다 "물을 건너려면 종이배!" (공간지각: 높이)
 *          메모지 한 장을 종이학 접이에게 → 종이배 (캐릭터 조합)
 *          종이배로 엎질러진 물웅덩이를 건너 필통 → 몽당 색연필 → 연필깎이 손잡이에 매달려 깎기 (크기)
 *  합류: 햇빛만 있을 때(스탠드 끔 + 커튼 열림) 그림 문에 손잡이를 그리면 진짜 문이 된다
 */
(function () {
  const F = (s) => s.flags;
  const lit = (s) => !F(s).lampOff || !!F(s).curtainOpen;

  function craneTalk(api) {
    const f = api.flags;
    if (!f.craneTalked) {
      f.craneTalked = true;
      api.lock(4600);
      api.say('접이: “안녕, 작은 친구! 나는 종이학 접이야. 이 책상 주인이 나를 접어 줬지.”', 4600, { who: 'crane' });
      api.after(4600, () => api.say('접이: “종이만 가져오면 뭐든 접어 줄게. 학, 배, 비행기… 접는 건 내 특기야!”', 5200, { who: 'crane', note: '접이의 말' }));
      return;
    }
    if (f.boatMade) { api.say('접이: “종이배는 오래 물에 있으면 흐물흐물해져. 얼른 건너!”', 0, { who: 'crane' }); return; }
    api.say('접이: “종이만 가져오면 뭐든 접어 줄게!”', 0, { who: 'crane' });
  }

  Engine.registerRoom({
    id: 'desk',
    chapter: '6장',
    title: '거인의 책상',
    assets: 'assets/rooms/desk/',
    sky: ['assets/rooms/desk/bg/north.svg', 'assets/rooms/desk/bg/north.svg'],
    frame: 'bg/frame',
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    isLit: lit,
    dim: { color: '#2a2440', opacity: 0.6 },
    dimFade: 0.4,
    ambient: (s) => (F(s).curtainOpen ? 'garden' : 'workshop'),
    guide: { name: '종이학 접이', img: 'props/crane_idle' },
    intro: '어? 내가 지우개만큼 작아졌어! 여긴 커다란 책상 위야. 연필이 나무 기둥처럼 높아.',
    repair(s, fix) {
      const f = s.flags;
      if (f.boatMade && !f.crossed && !fix.has('boat')) fix.give('boat');
    },

    items: {
      clip: { name: '클립', img: 'items/clip', desc: '내 키만 한 쇠 클립. 무언가를 걸어 연결할 수 있어.' },
      memo: { name: '메모지', img: 'items/memo', desc: '노란 메모지 한 장. 나한테는 이불만큼 커.' },
      boat: { name: '종이배', img: 'items/boat', desc: '접이가 메모지로 접어 준 종이배. 나 하나는 거뜬히 태울 수 있어.' },
      crayon: { name: '몽당 색연필', img: 'items/crayon', desc: '빨간 몽당 색연필. 심이 뭉툭해서 선이 잘 안 그려져.' },
      crayon_sharp: { name: '뾰족한 색연필', img: 'items/crayon_sharp', desc: '방금 깎은 빨간 색연필. 무엇이든 또렷하게 그릴 수 있어.' },
    },
    combos: [
      { a: 'crayon', b: 'clip', say: '클립으로는 색연필을 못 깎아. 진짜 연필깎이가 어딘가 있었는데…' },
      { a: 'crayon', b: 'memo', say: '메모지에 문을 그려도 너무 작아. 나가야 할 문은 스케치북에 있어.' },
      { a: 'crayon_sharp', b: 'memo', say: '메모지에 그림을 그려도 문은 안 열려. 스케치북의 그림 문에 그려야 해.' },
      { a: 'memo', b: 'clip', say: '메모지를 클립으로 집어 봤자 배가 되진 않아. 접는 건 접이 특기였지?' },
    ],

    views: {
      /* ───── 북쪽: 스케치북 그림 문, 연필꽂이, 스탠드 ───── */
      north: {
        name: '스케치북 벽',
        bg: 'bg/north',
        objects: [
          { id: 'sketch', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 20, 220, 600], label: '거대한 스케치북', look: '벽에 기대 세운 스케치북이야. 나한테는 건물만큼 커. 해님이랑 꽃 낙서가 있어.' },
          { id: 'note', x: 0, y: 0, w: 0, h: 0, img: '', hit: [880, 508, 164, 110], zoom: 'note', label: '스케치북 구석 쪽지' },
          { id: 'lampglow', img: 'bg/lampglow', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: (s) => !F(s).lampOff },
          {
            id: 'door', img: (s) => (F(s).doorOpen ? 'props/door_open' : F(s).knobDrawn ? 'props/door_knob' : 'props/door_drawn'), x: 524, y: 190, w: 332, h: 430, label: '그림 문',
            click: (api) => {
              const f = api.flags;
              if (f.doorOpen) { api.sfx('step'); api.win(); return; }
              if (f.knobDrawn) { api.set('doorOpen'); api.sfx('door'); api.burst('spark', 690, 400, 30); api.say('그린 손잡이를 잡아 돌리자… 덜컥! 종이 문이 열렸어. 저 너머에서 다락방 냄새가 나.', 5000); return; }
              if (!f.lampOff) { api.say('스케치북에 그린 문이야. 커다란 X로 막혀 있고 손잡이도 없어. 그런데 X 가장자리가 흐릿해… 연필로 그은 선 같지 않아.', 0); api.note('그림 문의 X', '지우개로 안 지워질 것 같다. 가장자리가 흐릿하다.'); return; }
              if (!f.curtainOpen) { api.say('깜깜해서 문이 잘 안 보여. 그래도 X는 사라진 것 같아!'); return; }
              api.say('X가 사라졌어! 연필 그림자였구나. 이제 손잡이만 그리면 될 텐데.');
            },
            use: {
              crayon_sharp: (api, n) => {
                const f = api.flags;
                if (!f.lampOff) { api.say('X 그림자가 문을 가리고 있어서 손잡이 자리가 안 보여. 그림자부터 없애야 해.'); return; }
                if (!f.curtainOpen) { api.say('너무 깜깜해서 어디에 그려야 할지 모르겠어. 빛이 필요해.'); return; }
                api.take('crayon_sharp'); api.set('knobDrawn'); api.sfx('grow');
                api.burst('spark', 760, 420, 34); api.flash('#fff6dc', 600);
                api.say('손잡이를 동그랗게 그렸더니… 그림 문에 색이 스르르 번지면서 진짜 문이 됐어!', 5200);
              },
              crayon: (api) => api.say('심이 뭉툭해서 선이 안 그려져. 뾰족하게 깎아야겠어.'),
            },
            wrong: '그걸로는 그림 문을 어쩔 수 없어. 문에는 그려야 하는 게 있잖아?',
          },
          { id: 'xshadow', img: 'props/xshadow', x: 524, y: 190, w: 332, h: 430, show: (s) => !F(s).lampOff && !F(s).knobDrawn },
          {
            id: 'cup', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1090, 0, 220, 650], label: '연필꽂이',
            click: (api) => {
              api.note('엇갈린 연필', '연필꽂이에 연필 두 자루가 X자로 엇갈려 있다. 그 뒤에서 스탠드가 스케치북 쪽을 비춘다.');
              api.say(api.flags.lampOff ? '연필이 하늘까지 솟은 기둥 같아. 두 자루가 X자로 엇갈려 있어.' : '연필이 하늘까지 솟은 기둥 같아. 두 자루가 X자로 엇갈려 있고, 그 뒤에서 스탠드가 스케치북 쪽을 환하게 비추고 있어.');
            },
          },
          { id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1330, 0, 270, 200], label: '스탠드 갓', look: (s) => (F(s).lampOff ? '스탠드 불이 꺼져 있어.' : '머리 위의 스탠드 갓에서 뜨끈한 불빛이 스케치북 쪽으로 쏟아져.') },
          {
            id: 'switch', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1370, 610, 110, 70], label: '스탠드 스위치',
            click: (api) => {
              const f = api.flags;
              f.lampOff = !f.lampOff; api.sfx('click');
              if (f.lampOff && !f.curtainOpen) api.say('폴짝! 스위치 위로 뛰어 꾹 밟았더니 불이 꺼졌어. 문 위의 X도 사라졌는데… 너무 깜깜해!', 5200);
              else if (f.lampOff) api.say('불을 껐어. 햇빛만 남으니 문 위의 X 그림자가 사라졌어!', 4600);
              else api.say('다시 불을 켰어. 문 위에 X 그림자가 또 생겼어.');
            },
          },
        ],
      },

      /* ───── 동쪽: 쓰러진 유리컵, 물웅덩이, 필통 ───── */
      east: {
        name: '필통 쪽',
        bg: 'bg/east',
        objects: [
          { id: 'glass', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 236, 450, 440], label: '쓰러진 유리컵', look: '유리컵이 쓰러져서 물이 쏟아졌어. 나한테는 유리 터널 같아.' },
          { id: 'brush', x: 0, y: 0, w: 0, h: 0, img: '', hit: [0, 800, 640, 100], label: '붓', look: '물감 붓이 통나무처럼 누워 있어. 노로 쓰면 딱이겠다.' },
          {
            id: 'puddle', img: (s) => (F(s).crossed ? 'props/puddle_boat' : 'props/puddle'), x: 470, y: 610, w: 760, h: 250, label: '물웅덩이',
            click: (api) => api.say(api.flags.crossed ? '건너편 물가에 종이배를 대 두었어.' : '엎질러진 물이 바다처럼 넓어! 헤엄쳐 건너기엔 너무 멀어.'),
            use: {
              boat: (api) => { api.take('boat'); api.set('crossed'); api.sfx('splash'); api.burst('bubble', 850, 720, 24); api.say('종이배를 띄우고 붓을 노 삼아 영차영차! 필통 앞에 도착했어.', 4600); },
              memo: (api) => api.say('메모지를 그냥 띄우면 금방 젖어서 가라앉을 거야. 배 모양이면 좋을 텐데.'),
            },
            wrong: '그걸 물에 던지면 젖기만 할 거야.',
          },
          {
            id: 'case', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1060, 300, 540, 380], label: '필통',
            click: (api) => { if (!api.flags.crossed) { api.say('필통이 물웅덩이 건너편에 있어. 어떻게 건너가지?'); return; } api.sfx('step'); api.zoom('pcase'); },
          },
          { id: 'crayonPeek', img: 'props/crayon_peek', x: 1290, y: 170, w: 90, h: 220, show: (s) => !F(s).crayonTaken },
        ],
      },

      /* ───── 남쪽: 책상 끝, 책 더미 계단, 거대한 연필 글씨, 접이 ───── */
      south: {
        name: '책상 끝',
        bg: 'bg/south',
        objects: [
          { id: 'edge', x: 0, y: 0, w: 0, h: 0, img: '', hit: [640, 200, 900, 420], label: '책상 끝 너머', look: '책상 끝 너머로 아득히 먼 방바닥이 보여. 으, 아찔해! 가까이 가지 말자.' },
          { id: 'writing', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 680, 1000, 220], label: '거대한 연필 자국', look: '책상 위에 엄청 굵은 연필 자국이 있어. 너무 커서 한 획밖에 안 보여… 높은 데서 내려다보면 읽힐지도?' },
          {
            id: 'books', x: 0, y: 0, w: 0, h: 0, img: '', hit: [40, 560, 560, 340], label: '책 더미 계단',
            click: (api) => { api.set('climbed'); api.sfx('step'); api.zoom('booktop'); },
          },
          {
            id: 'crane', img: (s) => (F(s).boatMade ? 'props/crane_happy' : 'props/crane_idle'), x: 90, y: 240, w: 330, h: 300, cls: 'bob', blink: 'props/crane_idle_blink', label: '종이학 접이',
            click: craneTalk,
            use: {
              memo: (api, n) => {
                api.take('memo'); api.set('boatMade'); api.give('boat', n); api.sfx('rip');
                api.say('접이: “종이배라면 자신 있지! 반으로 착, 모서리를 착착… 짠, 완성!”', 5200, { who: 'crane' });
              },
              crayon: (api) => api.say('접이: “나한테 그림 그리면 간지러워~ 히히.”', 0, { who: 'crane' }),
              crayon_sharp: (api) => api.say('접이: “나한테 그림 그리면 간지러워~ 히히.”', 0, { who: 'crane' }),
            },
            wrong: '접이: “그건 종이가 아니잖아. 종이를 줘야 접지!”',
          },
        ],
      },

      /* ───── 서쪽: 창문과 커튼, 클립 상자, 메모지, 연필깎이, 지우개 ───── */
      west: {
        name: '창문 쪽',
        bg: (s) => (F(s).curtainOpen ? 'bg/west_open' : 'bg/west'),
        objects: [
          { id: 'sun', img: 'bg/sunbeams', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: (s) => !!F(s).curtainOpen },
          { id: 'window', x: 0, y: 0, w: 0, h: 0, img: '', hit: [300, 20, 1100, 330], label: '커다란 창문', look: (s) => (F(s).curtainOpen ? '커튼이 활짝 열려서 햇빛이 책상 가득 쏟아져.' : '두꺼운 커튼이 창문을 꽁꽁 가리고 있어. 틈으로 햇빛이 조금 새어 나와.') },
          {
            id: 'clipbox', x: 0, y: 0, w: 0, h: 0, img: '', hit: [100, 420, 340, 250], label: '클립 상자',
            click: (api, n) => {
              if (api.has('clip') || api.flags.tied) { api.say('클립은 하나면 충분해.'); return; }
              api.give('clip', n); api.say('클립 하나를 영차 꺼냈어. 내 키만 한 쇠 고리야.');
            },
          },
          {
            id: 'memo', x: 0, y: 0, w: 0, h: 0, img: '', hit: [456, 620, 290, 96], label: '메모지 묶음',
            click: (api, n) => {
              if (api.flags.memoTaken) { api.say('메모지는 한 장이면 충분해.'); return; }
              api.set('memoTaken'); api.give('memo', n); api.say('노란 메모지 한 장을 떼어 냈어. 나한테는 이불만큼 커.');
            },
          },
          {
            id: 'sharpener', x: 0, y: 0, w: 0, h: 0, img: '', hit: [770, 230, 280, 460], label: '연필깎이',
            look: '손잡이를 돌리는 연필깎이야. 손잡이가 내 키보다 훨씬 높아.',
            use: {
              crayon: (api, n) => { api.take('crayon'); api.give('crayon_sharp', n); api.sfx('scrape'); api.burst('dust', 850, 560, 18); api.say('색연필을 구멍에 꽂고, 손잡이에 대롱대롱 매달려 빙글빙글… 뾰족해졌어!', 5000); },
              crayon_sharp: (api) => api.say('이미 충분히 뾰족해.'),
            },
            wrong: '연필깎이에는 연필 같은 걸 넣어야지.',
          },
          {
            id: 'cord', img: (s) => (F(s).curtainOpen ? 'props/cord_taut' : 'props/cord'), x: 1300, y: -40, w: 240, h: 720, hit: [1310, 300, 100, 380], label: '커튼 끈',
            click: (api) => {
              if (api.flags.curtainOpen) { api.say('커튼 끈이 팽팽하게 당겨져 있어.'); return; }
              api.note('커튼 끈', '매달려 당겨도 내가 너무 가벼워서 안 움직인다. 무거운 것이 대신 당겨 주면?');
              api.say('커튼 끈이야. 매달려 당겨 봤는데 내가 너무 가벼워서 꿈쩍도 안 해. 무거운 게 대신 당겨 주면 좋을 텐데.', 5200);
            },
            use: { clip: (api) => api.say('클립만 끈에 걸어선 소용없어. 끈을 당겨 줄 무거운 것과 이어야 해.') },
          },
          {
            id: 'eraser', img: (s) => (F(s).tied ? 'props/eraser_tied' : 'props/eraser'), x: 1040, y: 450, w: 320, h: 222, show: (s) => !F(s).curtainOpen, label: '커다란 지우개',
            click: (api) => {
              const f = api.flags;
              if (!f.tied) { api.say('엄청 무거운 지우개가 책상 끝에 아슬아슬하게 놓여 있어. 밀면 떨어질 것 같아… 그냥 떨어뜨리면 아깝지.'); return; }
              api.set('curtainOpen'); api.sfx('dig'); api.flash('#fff3c8', 900); api.burst('dust', 1200, 560, 26);
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
        note: ['스케치북 구석의 쪽지', '그림 문은 끝까지 다 그려야 열린다. 손잡이까지! — 봄'],
        text: '<h3>스케치북 구석의 쪽지</h3><p>그림 문은 <em>끝까지 다 그려야</em> 열려요.<br>문고리 하나 빠져도 안 열린답니다.</p><p><em>손잡이까지!</em></p><p class="sign">— 봄</p>',
      },
      booktop: {
        bg: 'zoom/booktop',
        note: ['책상 위 거대한 글씨', '책 더미 꼭대기에서 내려다보니 읽힌다: 물을 건너려면 종이배!'],
        textClass: 'giant-writing',
        text: '<p>물을 건너려면<br>종이배!</p>',
        objects: [{ id: 'arrow', x: 0, y: 0, w: 0, h: 0, img: '', hit: [980, 280, 220, 260], label: '낙서 화살표', look: '글씨에서 쭉 그은 화살표가 쏟아진 물웅덩이를 가리켜.' }],
      },
      pcase: {
        bg: 'zoom/pcase',
        objects: [{
          id: 'crayonIn', img: 'items/crayon', x: 640, y: 300, w: 320, h: 320, cls: 'item-in', show: (s) => !F(s).crayonTaken, label: '몽당 색연필',
          click: (api, n) => { api.set('crayonTaken'); api.give('crayon', n); api.say('빨간 몽당 색연필을 꺼냈어. 그런데 심이 뭉툭해.'); },
        }],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (f.doorOpen) return { key: 'out', steps: ['문이 열렸어요!', '북쪽 그림 문으로 나가요.', '북쪽 문을 누르세요.'] };
      if (f.knobDrawn) return { key: 'open', steps: ['그림 문이 진짜 문이 됐어요.', '손잡이를 잡아 돌려 봐요.', '북쪽 문을 누르세요.'] };
      if (!has('crayon_sharp')) {
        if (!f.crayonTaken) {
          if (!f.crossed) {
            if (!f.boatMade && !has('boat')) {
              if (!f.climbed) return { key: 'climb', steps: ['남쪽 책상 위에 아주 굵은 연필 자국이 있어요. 가까이선 읽을 수 없어요.', '큰 글씨는 멀리서, 높은 데서 봐야 보여요. 책이 계단처럼 쌓여 있어요.', '남쪽 책 더미 계단을 눌러 꼭대기에 올라가세요.'] };
              if (!has('memo')) return { key: 'memo', steps: ['종이배를 만들려면 종이가 필요해요.', '서쪽에 노란 메모지 묶음이 있어요.', '서쪽 메모지 묶음을 눌러 한 장 떼어 내세요.'] };
              return { key: 'fold', steps: ['종이를 배 모양으로 접어야 해요.', '종이학 접이는 종이접기 선수예요.', '메모지를 고른 채 남쪽 접이를 누르세요.'] };
            }
            return { key: 'sail', steps: ['동쪽 물웅덩이 건너편에 필통이 있어요.', '종이배를 띄워 건너요.', '종이배를 고른 채 동쪽 물웅덩이를 누르세요.'] };
          }
          return { key: 'case', steps: ['필통 안을 들여다봐요.', '동쪽 필통을 누르세요.', '필통 속 빨간 몽당 색연필을 챙기세요.'] };
        }
        return { key: 'sharpen', steps: ['색연필 심이 뭉툭해요.', '서쪽에 손잡이를 돌리는 연필깎이가 있어요. 나는 작으니 손잡이에 매달려야겠죠?', '몽당 색연필을 고른 채 서쪽 연필깎이를 누르세요.'] };
      }
      if (!f.curtainOpen) {
        if (!f.tied) {
          if (!has('clip')) return { key: 'clip', steps: ['손잡이를 그리려면 그림자 없는 빛이 필요해요. 서쪽 커튼을 열어 볼까요?', '커튼 끈은 내가 너무 가벼워서 안 당겨져요. 책상 끝 무거운 지우개가 대신 당겨 주면? 이을 고리가 필요해요.', '서쪽 클립 상자에서 클립을 꺼내세요.'] };
          return { key: 'tie', steps: ['클립으로 커튼 끈과 지우개를 이어요.', '지우개는 책상 끝에 아슬아슬하게 있어요.', '클립을 고른 채 서쪽 지우개를 누르세요.'] };
        }
        return { key: 'push', steps: ['지우개를 밀어 떨어뜨려 봐요.', '무거운 지우개가 떨어지면서 커튼 끈을 당겨요.', '서쪽 지우개를 누르세요.'] };
      }
      if (!f.lampOff) return { key: 'shadow', steps: ['문 위의 X는 지우개로도 안 지워져요. 가장자리가 흐릿하죠?', '스탠드 불빛이 연필꽂이의 엇갈린 연필 두 자루를 비춰요. X는 그 그림자예요.', '북쪽 스탠드 스위치를 눌러 불을 끄세요. 햇빛만으로도 충분히 밝아요.'] };
      return { key: 'draw', steps: ['이제 그림 문을 마저 그려요.', '스케치북 구석 쪽지: "손잡이까지!"', '뾰족한 색연필을 고른 채 북쪽 그림 문을 누르세요.'] };
    },

    ending: {
      title: '종이 문을 만든 사람',
      text: ['그려 넣은 손잡이를 돌리자 종이 문이 스르르 열렸어요. 접이가 날개를 파닥이며 어깨에 내려앉았지요.', '“스케치북 구석의 이름 봤어? 봄… 이 책을 만든 사람이야. 나를 접어 준 사람이기도 하고.”', '봄이는 누구일까요? 접이와 함께 다음 종이 문을 찾아 떠나요.'],
      next: '다음 이야기 · 준비 중이에요',
    },
  });
})();
