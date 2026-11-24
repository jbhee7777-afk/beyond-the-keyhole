/* 5장 「바닷속 우체국」 (마지막 장)
 * 퍼즐 흐름
 *  1. 문어 우체국장 팔방이가 주소가 지워진 거품 편지를 맡긴다
 *  2. 서쪽 소라 껍데기 속 목소리: "우편함 번호는 불가사리 팔 개수, 그다음 문어 다리 개수" (관찰: 세기)
 *  3. 동쪽 해파리 등불 끈을 당기면 우편함 번호가 보인다 (환경 변화)
 *  4. 남쪽 창의 불가사리(5) + 팔방이 다리(8) → 58번 우편함 → 주소 스티커 "바다 고등학교" (논리)
 *  5. 편지 + 주소 스티커, 그리고 "고등"학교니까 고등어 우표 (조합·넌센스)
 *  6. 바닥의 물고기 떼 그림자가 산호 틈을 가리킨다 → 낚싯바늘 + 미역 줄 = 미역 갈고리 → 산호 틈의 열쇠 (그림자·조합)
 *  7. 열쇠로 거품 우편관을 열고 편지를 보내면 고래가 와서 편지를 가져간다
 *  8. 팔방이가 엘리베이터 번호를 잊었다! 고래가 창 바깥에서 김 서린 유리에 써 준 숫자는 안에서 보면 거울처럼 뒤집혀 있다 → 1-3-8 (1장 거울 글씨의 응용, 졸업 시험)
 */
(function () {
  const F = (s) => s.flags;
  const lamps = (s) => !!s.flags.lampsOn;
  const NUMS = [12, 25, 31, 47, 53, 58, 64, 72, 85, 36, 91, 28, 44, 67, 15, 83, 79, 96];

  function boxesWidget(container, api, game) {
    let box = container.querySelector('.boxes');
    if (box) box.remove();
    box = document.createElement('div');
    box.className = 'boxes' + (api.flags.lampsOn ? ' lit' : '');
    NUMS.forEach((n, i) => {
      const r = Math.floor(i / 6), c = i % 6;
      const b = document.createElement('button');
      b.className = 'mailbox';
      b.style.cssText = `left:${150 + c * 222}px;top:${100 + r * 244}px`;
      b.setAttribute('aria-label', `${n}번 우편함`);
      const t = document.createElement('span'); t.textContent = n; b.appendChild(t);
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        if (game.s.sel) { api.say('우편함에 넣을 건 아직 없어.'); game.s.sel = null; game.render(); return; }
        if (!api.flags.lampsOn) { api.say('너무 어두워서 번호가 하나도 안 보여.'); api.sfx('nope'); return; }
        if (n === 58) { api.sfx('unlock'); api.set('box58'); game.s.zoom = 'box58'; game.save(); game.render(); return; }
        api.sfx('locked'); api.say(`${n}번 우편함은 잠겨 있어. 다른 집 우편함이야.`);
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  }

  // 엘리베이터 숫자 판 (바퀴 세 개, 1-3-8)
  function elevWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.dials');
    if (f.elevatorOpen) { if (box) box.remove(); return; }
    if (box) return;
    f.edial = f.edial || [0, 0, 0];
    box = document.createElement('div'); box.className = 'dials';
    f.edial.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'dial'; b.style.left = 616 + i * 140 + 'px';
      b.setAttribute('aria-label', (i + 1) + '번째 엘리베이터 숫자');
      const num = document.createElement('span'); num.textContent = v; b.appendChild(num);
      b.onclick = (e) => {
        e.stopPropagation();
        if (game.busy) return;
        f.edial[i] = (f.edial[i] + 1) % 10; num.textContent = f.edial[i];
        b.classList.remove('roll'); void b.offsetWidth; b.classList.add('roll');
        api.sfx('dial');
        // 단계적 반응: 그 바퀴가 맞는 숫자면 작게 딸깍 + 놋쇠 빛 (아이가 하나씩 확인하며 생각할 수 있게)
        b.classList.toggle('right', f.edial[i] === +'138'[i]); if (f.edial[i] === +'138'[i]) api.sfx('tick');
        if (f.edial.join('') === '138') {
          f.elevatorOpen = true; game.busy = true;
          setTimeout(() => {
            game.busy = false; game.s.zoom = null; api.sfx('door'); api.burst('bubble', 1340, 420, 40);
            api.say('팔방이: “1-3-8! 맞아요! 거울처럼 뒤집힌 글씨를 바로 읽었군요. 엘리베이터가 열렸어요!”', 5200, { who: 'octo' });
            game.save(); game.render();
          }, 450);
        } else if (f.edial.join('') === '831') api.say('8-3-1로 읽었는데… 꿈쩍도 안 해. 고래는 바깥에서 썼다고 했지?');
        game.save();
      };
      box.appendChild(b);
    });
    container.appendChild(box);
  }

  function postLetter(api, game) {
    api.take('letter_ready'); api.set('posted');
    api.lock(8400); api.sfx('splash'); api.burst('bubble', 1150, 420, 30);
    api.say('쉬이익— 편지가 거품을 타고 유리관 위로 쏙 올라갔어!', 3000);
    api.after(2600, () => { api.set('whale'); api.sfx('sunrise'); api.burst('bubble', 800, 300, 24); api.say('우우웅— 남쪽 창밖에서 커다란 고래 노랫소리가 들려!', 3200); });
    api.after(5600, () => {
      api.set('whaleWrote'); api.sfx('whisper');
      api.say('팔방이: “고래 택배가 편지를 받아 갔어요! 그런데 이를 어쩌죠… 엘리베이터 번호를 잊어버렸어요. 고래가 남쪽 창에 뭔가 써 주고 갔대요!”', 6400, { who: 'octo', note: '엘리베이터 번호' });
    });
  }

  Engine.registerRoom({
    id: 'sea',
    chapter: '5장',
    title: '바닷속 우체국',
    assets: 'assets/rooms/sea/',
    sky: ['assets/rooms/sea/bg/north.svg', 'assets/rooms/sea/bg/north.svg'],
    order: ['north', 'east', 'south', 'west'],
    frame: 'bg/frame',
    start: 'north',
    isLit: lamps,
    dim: { color: '#0a2230', opacity: 0.42 },
    ambient: () => 'sea',
    repair(s, fix) {
      const f = s.flags;
      if (f.gotLetter && !f.letterGiven) { f.letterGiven = true; if (!f.posted && !fix.has('letter_addr') && !fix.has('letter_ready')) fix.give('letter'); }
      if (f.posted) { fix.set('whale'); fix.set('whaleWrote'); }
    },
    dimLit: { color: '#123a48', opacity: 0.2 },
    guide: { name: '문어 우체국장 팔방이', img: 'props/octo_icon' },
    intro: '보글보글… 바닷속 우체국이야. 창구에서 문어 우체국장이 손짓하고 있어.',

    items: {
      letter: { name: '거품 편지', img: 'items/letter', desc: '거품 속에 담긴 편지. 받는 사람 주소가 물에 번져서 지워졌어.' },
      letter_addr: { name: '주소 붙은 편지', img: 'items/letter_addr', desc: '「바다 고등학교 58번」 주소 스티커를 붙였어. 우표가 아직 없어.' },
      letter_ready: { name: '보낼 수 있는 편지', img: 'items/letter_ready', desc: '주소도 우표도 붙였어. 이제 거품 우편관에 넣기만 하면 돼!' },
      address: { name: '주소 스티커', img: 'items/address', desc: '학교 그림과 58이 적힌 스티커. 「바다 고등학교 58번」이라고 쓰여 있어.' },
      stamp_mackerel: { name: '고등어 우표', img: 'items/stamp_mackerel', desc: '등이 푸른 고등어가 그려진 우표.' },
      stamp_anchovy: { name: '멸치 우표', img: 'items/stamp_anchovy', desc: '작은 은빛 멸치가 그려진 우표.' },
      stamp_saury: { name: '꽁치 우표', img: 'items/stamp_saury', desc: '길쭉한 꽁치가 그려진 우표.' },
      hook: { name: '낚싯바늘', img: 'items/hook', desc: '끝이 구부러진 쇠 낚싯바늘. 이것만으로는 짧아.' },
      kelp: { name: '미역 줄', img: 'items/kelp', desc: '질기고 기다란 미역 줄. 무언가를 매달 수 있겠어.' },
      kelp_hook: { name: '미역 갈고리', img: 'items/kelp_hook', desc: '미역 줄 끝에 낚싯바늘을 묶었어. 좁고 깊은 틈에도 쏙 들어가.' },
      key: { name: '불가사리 열쇠', img: 'items/key', desc: '손잡이에 불가사리가 새겨진 열쇠.' },
    },
    combos: [
      { a: 'address', b: 'letter', result: 'letter_addr', say: '편지에 주소 스티커를 착! 「바다 고등학교 58번」.' },
      { a: 'stamp_mackerel', b: 'letter_addr', result: 'letter_ready', say: '고등어 우표 착! 고등어는 “고등”학교에 딱이지! 남은 우표는 서랍에 도로 넣었어.', after: (api) => { api.take('stamp_anchovy'); api.take('stamp_saury'); api.flags.st1 = api.flags.st3 = false; } },
      { a: 'stamp_anchovy', b: 'letter_addr', say: '멸치 우표는 학교 이름이랑 안 어울려. 받는 곳이 어디였지?' },
      { a: 'stamp_saury', b: 'letter_addr', say: '꽁치 우표는 학교 이름이랑 안 어울려. 받는 곳이 어디였지?' },
      { a: 'stamp_mackerel', b: 'letter', say: '우표보다 주소가 먼저야. 어디로 보내는지 모르잖아.' },
      { a: 'stamp_anchovy', b: 'letter', say: '우표보다 주소가 먼저야.' },
      { a: 'stamp_saury', b: 'letter', say: '우표보다 주소가 먼저야.' },
      { a: 'hook', b: 'kelp', result: 'kelp_hook', say: '낚싯바늘을 미역 줄 끝에 꽁꽁 묶었어. 미역 갈고리 완성!' },
    ],

    views: {
      /* ───── 북쪽: 창구, 문어 우체국장, 거품 우편관, 엘리베이터 ───── */
      north: {
        name: '우체국 창구',
        bg: 'bg/north',
        objects: [
          { id: 'parcels', x: 0, y: 0, w: 0, h: 0, img: '', hit: [200, 220, 460, 96], look: '빨간 끈으로 묶은 소포들. 바다 곳곳으로 갈 거래.' },
          { id: 'counter', img: 'props/counter', x: 300, y: 420, w: 640, h: 260, hit: [300, 600, 640, 80], look: '반질반질한 우체국 창구. 봉투 문장이 새겨져 있어.' },
          {
            id: 'octo', img: (s) => (F(s).elevatorOpen ? 'props/octopus_happy' : 'props/octopus_work'), x: 410, y: 160, w: 420, h: 440, cls: 'bob', blink: (s) => (F(s).elevatorOpen ? null : 'props/octopus_work_blink'), hit: [440, 180, 360, 410], label: '문어 우체국장 팔방이',
            click: (api, n) => {
              const f = api.flags, has = (i) => api.s.inv.includes(i);
              api.sfx('whisper');
              if (!f.gotLetter) {
                f.gotLetter = true; f.letterGiven = true; api.give('letter', n); api.lock(5200);
                api.say('팔방이: “어서 와요! 나는 우체국장 팔방이. 이 거품 편지 좀 봐요, 주소가 물에 번져서 지워졌지 뭐예요.”', 5200, { who: 'octo' });
                api.after(5200, () => api.say('팔방이: “받는 사람 목소리는 서쪽 소라 껍데기에 담겨 있대요. 배달해 주면 수면 엘리베이터를 열어 줄게요!”', 6000, { who: 'octo', note: '팔방이의 부탁' }));
                return;
              }
              if (f.elevatorOpen) { api.say('팔방이: “고마워요! 엘리베이터를 타면 바다 위로 올라갈 수 있어요.”'); return; }
              if (f.whaleWrote) { api.say('팔방이: “고래는 창 바깥에서 글씨를 썼을 거예요. 안에서 보면 어떻게 보일까요?”', 0, { who: 'octo' }); return; }
              if (f.posted) { api.say('팔방이: “고래 택배를 기다리는 중이에요.”'); return; }
              if (has('letter_ready')) { api.say('팔방이: “주소도 우표도 완벽해요! 거품 우편관에 넣어 주세요.”'); return; }
              if (has('letter_addr')) { api.say('팔방이: “바다 고등학교로 가는 편지군요! 그 학교는 학교 이름과 어울리는 물고기 우표만 받아요.”', 5000); return; }
              api.say('팔방이: “받는 사람 목소리는 서쪽 소라 껍데기에 담겨 있대요. 우편함 번호를 알려 줄 거예요.”');
            },
            use: { letter_ready: (api) => api.say('팔방이: “그 편지는 거품 우편관에 넣어 주세요!”') },
            wrong: '팔방이: “그건 내 거 아니에요~”',
          },
          {
            id: 'hatch', img: (s) => (F(s).hatchOpen ? 'props/hatch_open' : 'props/hatch_closed'), x: 1072, y: 380, w: 156, h: 120, label: '거품 우편관 뚜껑',
            click: (api) => {
              const f = api.flags;
              if (f.posted) { api.say('편지는 이미 거품을 타고 떠났어.'); return; }
              api.say(f.hatchOpen ? '뚜껑이 열려 있어. 보낼 편지를 넣으면 돼.' : '거품 우편관 뚜껑이 잠겨 있어. 불가사리 모양 열쇠 구멍이 있어.');
            },
            use: {
              key: (api) => { if (api.flags.hatchOpen) return; api.take('key'); api.set('hatchOpen'); api.sfx('unlock'); api.say('딸깍! 우편관 뚜껑이 열렸어.'); },
              letter_ready: (api) => { if (!api.flags.hatchOpen) { api.say('먼저 뚜껑을 열어야 해. 잠겨 있어.'); return; } postLetter(api); },
              letter: (api) => api.say('주소가 없는 편지는 어디로 갈지 몰라. 주소부터 붙이자.'),
              letter_addr: (api) => api.say('우표가 없으면 거품이 편지를 안 실어 줘. 우표도 붙이자.'),
            },
          },
          {
            id: 'elevator', img: (s) => (F(s).elevatorOpen ? 'props/elevator_open' : 'props/elevator_closed'), x: 1245, y: 232, w: 200, h: 410, label: '수면 엘리베이터',
            click: (api) => {
              if (api.flags.elevatorOpen) { api.sfx('step'); api.win(); return; }
              if (api.flags.whaleWrote) { api.sfx('step'); api.zoom('elevPanel'); return; }
              api.sfx('locked'); api.say('수면으로 올라가는 엘리베이터야. 철창문이 굳게 닫혀 있어. 옆에 숫자 판이 있어.');
            },
          },
          { id: 'caustic', img: 'bg/caustics', x: 0, y: 0, w: 1600, h: 900, cls: 'caustic' },
        ],
      },

      /* ───── 동쪽: 우편함 벽과 해파리 등불 ───── */
      east: {
        name: '우편함 벽',
        bg: 'bg/east',
        objects: [
          { id: 'boxes', x: 0, y: 0, w: 0, h: 0, img: '', hit: [320, 150, 960, 400], zoom: 'boxes', label: '우편함 벽' },
          { id: 'jellyL', img: (s) => (lamps(s) ? 'props/jelly_on' : 'props/jelly_off'), x: 150, y: 90, w: 140, h: 230, cls: 'bob', look: (s) => (lamps(s) ? '해파리가 보랏빛으로 은은하게 빛나.' : '병 속 해파리가 잠들어 있어.') },
          { id: 'jellyR', img: (s) => (lamps(s) ? 'props/jelly_on' : 'props/jelly_off'), x: 1290, y: 90, w: 140, h: 230, cls: 'bob', look: (s) => (lamps(s) ? '해파리가 보랏빛으로 은은하게 빛나.' : '병 속 해파리가 잠들어 있어.') },
          {
            id: 'cord', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1330, 330, 60, 130], label: '등불 끈',
            click: (api) => { if (api.flags.lampsOn) { api.say('해파리 등불이 환하게 켜져 있어.'); return; } api.set('lampsOn'); api.sfx('shine'); api.burst('spark', 1360, 300, 20); api.say('끈을 톡 당기자 해파리들이 깨어나 보랏빛으로 빛나! 우편함 번호가 보여.', 4200); },
          },
          { id: 'glowJ', img: 'bg/jellyglow_east', x: 0, y: 0, w: 1600, h: 900, cls: 'glow', show: lamps },
          { id: 'caustic', img: 'bg/caustics', x: 0, y: 0, w: 1600, h: 900, cls: 'caustic' },
        ],
      },

      /* ───── 남쪽: 큰 둥근 창, 산호, 물고기 그림자 ───── */
      south: {
        name: '둥근 창 벽',
        bg: 'bg/south',
        objects: [
          {
            id: 'window', img: (s) => (F(s).whale ? 'props/window_whale' : 'props/window_sea'), x: 560, y: 90, w: 480, h: 420, label: '둥근 창',
            look: (s) => (F(s).whale ? '커다란 고래가 창밖에서 눈을 찡긋했어!' : '물고기들이 헤엄쳐. 유리창에 주황색 불가사리가 딱 붙어 있어.'),
          },
          {
            id: 'fog', img: 'props/window_fog', x: 560, y: 90, w: 480, h: 420, show: (s) => !!F(s).whaleWrote && !F(s).elevatorOpen, label: '김 서린 창의 숫자',
            click: (api) => { api.note('고래가 쓴 숫자', '김 서린 창에 숫자 세 개. 고래는 창 바깥에서 썼다 → 안에서는 거울처럼 뒤집혀 보인다.'); api.say('고래가 김 서린 유리에 숫자를 써 놓았어. 그런데 글씨가 거울에 비친 것처럼 뒤집혀 있어… 고래는 창 바깥에서 썼잖아!', 6000); },
          },
          { id: 'shadow', img: 'props/fishshadow', x: 760, y: 700, w: 300, h: 90, cls: 'drift', look: '물고기 떼 그림자가 바닥에서 화살표 모양으로 헤엄쳐. 산호 쪽을 가리키는 것 같아.' },
          { id: 'coral', img: (s) => (F(s).keyTaken ? 'props/coral' : 'props/coral_key'), x: 1100, y: 400, w: 340, h: 300, zoom: 'coral', label: '산호 바위' },
          { id: 'caustic', img: 'bg/caustics', x: 0, y: 0, w: 1600, h: 900, cls: 'caustic' },
        ],
      },

      /* ───── 서쪽: 소라 선반, 낚싯바늘, 미역 줄, 우표 책상 ───── */
      west: {
        name: '우표 책상 벽',
        bg: 'bg/west',
        objects: [
          { id: 'conch', img: 'props/conch', x: 330, y: 290, w: 160, h: 120, label: '소라 껍데기', click: (api) => { api.set('conchHeard'); api.sfx('whisper'); api.zoom('conch'); } },
          { id: 'hook', img: (s) => (F(s).hookTaken ? 'props/hook_none' : 'props/hook'), x: 720, y: 210, w: 80, h: 100, label: '낚싯바늘', click: (api, n) => { if (api.flags.hookTaken) return; api.set('hookTaken'); api.give('hook', n); api.say('걸이판의 낚싯바늘을 챙겼어.'); } },
          { id: 'kelp', img: (s) => (F(s).kelpTaken ? 'props/kelp_none' : 'props/kelp'), x: 900, y: 70, w: 90, h: 430, label: '미역 줄', click: (api, n) => { if (api.flags.kelpTaken) return; api.set('kelpTaken'); api.give('kelp', n); api.say('천장에서 늘어진 미역 줄을 끊어 챙겼어. 아주 질겨!'); } },
          { id: 'desk', img: 'props/stampdesk', x: 1080, y: 400, w: 360, h: 300, hit: [1080, 440, 360, 70], look: '도장과 잉크판이 있는 우표 책상. 서랍이 있어.' },
          { id: 'drawer', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1140, 514, 240, 72], zoom: 'stamps', label: '우표 서랍' },
          { id: 'caustic', img: 'bg/caustics', x: 0, y: 0, w: 1600, h: 900, cls: 'caustic' },
        ],
      },
    },

    zooms: {
      elevPanel: {
        bg: 'zoom/elev_panel',
        note: ['엘리베이터 숫자 판', '숫자 바퀴 세 개. 위에 수면 그림, 아래에 고래 꼬리 문장.'],
        widget: elevWidget,
        objects: [{ id: 'elevSign', x: 0, y: 0, w: 0, h: 0, img: '', hit: [600, 170, 400, 120], label: '수면 그림', look: '해가 뜬 바다 위 그림이야. 아래 고래 꼬리 문장을 보니, 고래가 번호를 알려 준대.' }],
      },
      conch: {
        bg: 'assets/rooms/greenhouse/zoom/paper.svg',
        text: '<h3>소라 속 작은 목소리</h3><p>(귀를 대 보니 보글보글 목소리가 들려요)</p><p>“나는 바다 고등학교 우편함지기예요.<br>우리 우편함 번호는 두 자리예요.<br>앞자리에 <em>불가사리 팔 개수</em>,<br>뒷자리에 <em>문어 다리 개수</em>를 나란히 써요.<br>더하면 안 돼요!”</p>',
        note: ['소라 속 목소리', '우편함 번호 = 앞자리 불가사리 팔 개수, 뒷자리 문어 다리 개수 (나란히 쓰기, 더하지 않기)'],
      },
      boxes: { bg: (s) => (lamps(s) ? 'zoom/boxes' : 'zoom/boxes_dark'), widget: boxesWidget, dimLit: 0.05 },
      box58: {
        bg: 'zoom/box_open',
        objects: [{ id: 'addrIn', img: 'items/address', x: 700, y: 330, w: 220, h: 220, cls: 'item-in', show: (s) => !F(s).addressTaken, label: '주소 스티커', click: (api, n) => { api.set('addressTaken'); api.give('address', n); api.say('주소 스티커를 찾았어. 「바다 고등학교 58번」!'); } }],
      },
      stamps: {
        bg: 'zoom/stamps',
        objects: [
          { id: 'st1', img: 'items/stamp_anchovy', x: 360, y: 320, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).st1, label: '멸치 우표', click: (api, n) => { api.set('st1'); api.give('stamp_anchovy', n); } },
          { id: 'st2', img: 'items/stamp_mackerel', x: 680, y: 320, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).st2, label: '고등어 우표', click: (api, n) => { api.set('st2'); api.give('stamp_mackerel', n); } },
          { id: 'st3', img: 'items/stamp_saury', x: 1000, y: 320, w: 240, h: 240, cls: 'item-in', show: (s) => !F(s).st3, label: '꽁치 우표', click: (api, n) => { api.set('st3'); api.give('stamp_saury', n); } },
        ],
      },
      coral: {
        bg: 'zoom/coral',
        objects: [{
          id: 'keyCrack', img: 'items/key', x: 760, y: 520, w: 130, h: 130, cls: 'shimmer', show: (s) => !F(s).keyTaken, hit: [600, 500, 460, 160], label: '산호 틈 열쇠',
          look: '산호 바위 틈 깊숙이 열쇠가 끼어 있어. 틈이 좁아서 손가락이 안 들어가.',
          use: {
            kelp_hook: (api, n) => { api.set('keyTaken'); api.give('key', n); api.say('미역 갈고리를 틈에 쏙 넣어 열쇠를 걸어 올렸어!'); },
            hook: (api) => api.say('낚싯바늘만으로는 짧아서 안 닿아. 긴 줄에 매달아야 해.'),
            kelp: (api) => api.say('미역 줄만으로는 걸 데가 없어. 끝에 갈고리가 있어야 해.'),
          },
        }],
      },
    },

    hints(s) {
      const f = s.flags, has = (i) => s.inv.includes(i);
      if (!f.gotLetter) return { key: 'start', steps: ['우체국장이 무언가 부탁하려나 봐요.', '북쪽 창구의 문어에게 말을 걸어요.', '문어 우체국장 팔방이를 누르세요.'] };
      if (!f.posted) {
        if (has('letter')) {
          if (!f.addressTaken) {
            if (!f.conchHeard) return { key: 'conch', steps: ['받는 사람 목소리가 소라 껍데기에 담겨 있대요.', '서쪽 선반에 소라 껍데기가 있어요.', '서쪽 소라 껍데기를 눌러 귀에 대 보세요.'] };
            if (!f.lampsOn) return { key: 'lamps', steps: ['우편함 번호를 봐야 하는데 동쪽 벽이 너무 어두워요.', '해파리 등불을 켜는 끈이 있어요.', '동쪽 벽 오른쪽 끝의 끈을 당기세요.'] };
            return { key: 'count', steps: ['우편함 번호는 불가사리 팔 개수, 그다음 문어 다리 개수예요.', '남쪽 창문의 불가사리 팔을 세고, 북쪽 팔방이의 다리를 세어 보세요.', '불가사리 팔 5개, 문어 다리 8개 → 동쪽 58번 우편함을 여세요.'] };
          }
          return { key: 'addr', steps: ['주소 스티커를 편지에 붙여요.', '가방에서 하나를 고르고 다른 하나를 눌러요.', '주소 스티커를 고른 채 가방 속 거품 편지를 누르세요.'] };
        }
        if (has('letter_addr')) {
          if (!has('stamp_mackerel') && !f.st2) return { key: 'stamps', steps: ['편지에 우표도 붙여야 해요.', '서쪽 우표 책상에 서랍이 있어요.', '서쪽 우표 서랍을 열고 우표를 챙기세요.'] };
          return { key: 'stamp', steps: ['받는 곳은 바다 “고등”학교예요. 어울리는 물고기 우표는?', '학교 이름 “고등” + 물고기 = 고등…?', '고등어 우표를 고른 채 가방 속 편지를 누르세요.'] };
        }
        if (!f.hatchOpen) {
          if (!has('key') && !f.keyTaken) {
            if (!has('kelp_hook')) return { key: 'hook', steps: ['거품 우편관 뚜껑이 잠겨 있어요. 열쇠는 어디 있을까요?', '남쪽 바닥의 물고기 그림자가 화살표처럼 산호를 가리켜요. 산호 틈의 열쇠는 손가락이 안 들어가요.', '서쪽의 낚싯바늘과 미역 줄을 챙겨 합치세요.'] };
            return { key: 'fish', steps: ['미역 갈고리로 좁은 틈의 열쇠를 꺼낼 수 있어요.', '남쪽 산호 바위를 확대해요.', '미역 갈고리를 고른 채 산호 틈 열쇠를 누르세요.'] };
          }
          return { key: 'hatch', steps: ['열쇠로 거품 우편관 뚜껑을 열어요.', '북쪽 유리관의 황동 뚜껑이에요.', '불가사리 열쇠를 고른 채 우편관 뚜껑을 누르세요.'] };
        }
        return { key: 'post', steps: ['이제 편지를 보낼 수 있어요!', '북쪽 거품 우편관이에요.', '보낼 수 있는 편지를 고른 채 우편관 뚜껑을 누르세요.'] };
      }
      if (!f.whaleWrote) return { key: 'wait', steps: ['편지가 떠났어요. 잠깐 기다려요.', '고래가 오고 있어요.', '조금만 기다리세요.'] };
      if (!f.elevatorOpen) return { key: 'mirror', steps: ['고래가 남쪽 창에 엘리베이터 번호를 써 주고 갔어요.', '고래는 창 바깥에서 썼어요. 안에서 보면 1장의 거울 글씨처럼 좌우가 뒤집혀 보여요. 오른쪽부터, 글자를 뒤집어서 읽어 보세요.', '안에서는 8 Ɛ 1처럼 보이지만 바로 읽으면 1-3-8이에요. 북쪽 엘리베이터 숫자 판을 1-3-8로 맞추세요.'] };
      return { key: 'out', steps: ['엘리베이터가 열렸어요!', '북쪽 오른쪽 엘리베이터예요.', '수면 엘리베이터를 누르세요.'] };
    },

    ending: {
      title: '다섯 개의 문을 모두 지나서',
      text: ['고래가 편지를 싣고 바다 위로 헤엄쳐 갔어요. 엘리베이터가 보글보글 거품을 타고 올라가요.', '수면 위로 나오자 햇살이 반짝— 저 멀리 온실 지붕이 보여요. 해님이 손을 흔들고, 모카와 찍찍이, 똑딱이와 뒤죽이, 팔방이가 모두 인사를 해요.', '종이 문 너머의 다섯 방을 모두 탈출했어요. 정말 멋졌어요!'],
      next: '모든 이야기 끝 · 책장을 덮고 다시 처음부터 놀 수 있어요',
      image: 'assets/ui/finale.svg',
    },
  });
})();
