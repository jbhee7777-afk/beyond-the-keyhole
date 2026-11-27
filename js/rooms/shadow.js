/* 14장 「그림자 인형극장」 (3편 넷째 장 · 어른 난이도) — 되찾을 것: 그림자
 * 몸을 잃고 그림자만 남은 배우 너울. 공연을 끝까지 올려야 몸이 돌아온다.
 *  1 빨간 셀로판(남 매표소 아래 문) → 북 악보대 대본에 대면 빨간 낙서가 사라지고 파란 그림만 남는다
 *    (빨간 필터는 빨간빛만 통과: 빨간 낙서는 종이처럼 밝아지고 파란 선은 어둡게 남음) → 공연 순서: 배·새·사슴·늑대
 *    남쪽 포스터 네 컷(늑대·배·사슴·새)은 순서가 다른 미끼
 *  2 동 인형 걸이: 토끼·나뭇가지·새·배. 토끼 + 나뭇가지를 겹치면 그림자가 뿔 달린 사슴이 된다
 *  3 남 트렁크 그림 자물쇠(6가지 그림 × 4칸) = 대본 순서 → 늑대 인형
 *  4 북 막 뒤(무대 뒤): 촛불과 막 사이 홈 네 칸. 촛불에 가까울수록 그림자가 크다(배율 = 막까지 거리 / 촛불까지 거리)
 *    늑대 인형은 가장 작아서 촛불 바로 앞(1칸)에 세워야 막을 가득 채운다. 다른 인형은 1칸이면 막 밖으로 넘친다
 *    한 장면이라도 틀리면 공연이 처음부터 다시 (마구 눌러서 맞히는 걸 막음)
 *  5 네 장면을 다 올리면 너울이 몸을 되찾고 서쪽 커튼이 열린다
 */
(function () {
  const F = (s) => s.flags;
  const ORDER = ['boat', 'bird', 'deer', 'wolf'];
  const PNAME = { boat: '배', bird: '새', deer: '사슴', wolf: '늑대', rabbit: '토끼', branch: '나뭇가지' };
  const PUPPETS = ['boat', 'bird', 'deer', 'wolf', 'rabbit', 'branch'];
  const SIZE = { boat: 120, bird: 100, deer: 130, wolf: 62, rabbit: 110, branch: 125 }; // 인형 크기 (그림자 1배일 때 막 위 높이)
  const NOTCH = 4; // 촛불~막 사이 다섯 칸 중 인형을 세우는 홈 1~4칸 (1 = 촛불 바로 앞)
  const mag = (n) => (NOTCH + 1) / n; // 배율 = 촛불~막 거리 / 촛불~인형 거리
  const SCREEN = { x: 520, y: 150, w: 570, h: 315 }; // zoom/backstage 막
  const LOCK = ['boat', 'bird', 'deer', 'wolf', 'rabbit', 'branch'];
  const has = (s, i) => s.inv.includes(i);

  /* ── 트렁크 그림 자물쇠 ── */
  function trunkWidget(container, api, game) {
    const f = api.flags;
    let box = container.querySelector('.trunk-lock');
    if (f.trunkOpen) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.className = 'trunk-lock'; container.appendChild(box); }
    box.innerHTML = '';
    f.dials = f.dials || [4, 4, 4, 4];
    [480, 695, 910, 1120].forEach((cx, i) => {
      const b = document.createElement('button'); b.className = 'piece dial-win';
      b.style.cssText = `left:${cx - 80}px;top:${350}px;width:160px;height:160px`;
      b.setAttribute('aria-label', `자물쇠 ${i + 1}번 칸`);
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`items/${LOCK[f.dials[i]]}.webp`); b.appendChild(im);
      b.onclick = (e) => { e.stopPropagation(); if (game.busy) return; f.dials[i] = (f.dials[i] + 1) % LOCK.length; api.sfx('dial'); game.save(); trunkWidget(container, api, game); };
      box.appendChild(b);
    });
    const go = document.createElement('button'); go.className = 'plain-btn trunk-open'; go.textContent = '뚜껑 당기기'; go.setAttribute('aria-label', '뚜껑 당기기');
    go.style.cssText = 'left:1240px;top:640px;width:220px;height:70px';
    go.onclick = (e) => {
      e.stopPropagation(); if (game.busy) return;
      if (f.dials.every((d, i) => LOCK[d] === ORDER[i])) {
        f.trunkOpen = true; game.save(); api.sfx('unlock'); api.give('wolf');
        api.say('딸깍! 트렁크 뚜껑이 열렸어. 안에 작은 늑대 인형이 누워 있었어.', 4200);
        game.s.zoom = null; game.save(); game.render();
      } else { api.sfx('locked'); api.say('덜컥. 안 열려.'); }
    };
    box.appendChild(go);
  }

  /* ── 막 뒤: 인형을 고르고 홈에 세워 그림자를 막에 비춘다 ── */
  function stageWidget(container, api, game) {
    const f = api.flags, s = game.s;
    let box = container.querySelector('.puppet-stage');
    if (f.performed) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.className = 'puppet-stage'; container.appendChild(box); }
    box.innerHTML = '';
    f.scene = f.scene || 0;
    f.notch = f.notch || 3;
    const owned = PUPPETS.filter((p) => has(s, p));
    if (f.puppet && !owned.includes(f.puppet)) f.puppet = null;
    // 막 위 그림자
    const scr = document.createElement('div'); scr.className = 'stage-screen';
    scr.style.cssText = `left:${SCREEN.x}px;top:${SCREEN.y}px;width:${SCREEN.w}px;height:${SCREEN.h}px`;
    if (f.puppet) {
      const h = SIZE[f.puppet] * mag(f.notch);
      const sh = document.createElement('img'); sh.className = 'stage-shadow'; sh.alt = ''; sh.src = game.src(`props/puppet_${f.puppet}.webp`);
      sh.style.cssText = `width:${h}px;height:${h}px;left:${SCREEN.w / 2 - h / 2}px;top:${SCREEN.h / 2 - h / 2}px;filter:brightness(0) blur(${Math.max(1, 6 - f.notch)}px);opacity:.82`;
      scr.appendChild(sh);
    }
    box.appendChild(scr);
    // 홈 네 칸 (가까운 1칸이 촛불 쪽, 화면 아래)
    for (let n = 1; n <= NOTCH; n++) {
      const y = 640 - (n - 1) * 40, w = 86 - (n - 1) * 10;
      const b = document.createElement('button'); b.className = 'stage-notch' + (f.notch === n ? ' on' : '');
      b.style.cssText = `left:${800 - w / 2}px;top:${y - 16}px;width:${w}px;height:32px`;
      b.setAttribute('aria-label', `홈 ${n}칸`);
      b.onclick = (e) => { e.stopPropagation(); if (game.busy) return; f.notch = n; api.sfx('tap'); game.save(); stageWidget(container, api, game); };
      box.appendChild(b);
      if (f.puppet && f.notch === n) {
        const pim = document.createElement('img'); pim.className = 'stage-puppet'; pim.alt = ''; pim.src = game.src(`props/puppet_${f.puppet}.webp`);
        const ps = 150 - (n - 1) * 22; pim.style.cssText = `left:${800 - ps / 2}px;top:${y - ps + 6}px;width:${ps}px;height:${ps}px`;
        box.appendChild(pim);
      }
    }
    // 가진 인형
    owned.forEach((p, k) => {
      const b = document.createElement('button'); b.className = 'piece stage-pick' + (f.puppet === p ? ' on' : '');
      b.style.cssText = `left:${100 + (k % 2) * 130}px;top:${200 + Math.floor(k / 2) * 140}px;width:120px;height:120px`;
      b.setAttribute('aria-label', `${PNAME[p]} 인형 세우기`);
      const im = document.createElement('img'); im.alt = ''; im.src = game.src(`items/${p}.webp`); b.appendChild(im);
      b.onclick = (e) => { e.stopPropagation(); if (game.busy) return; f.puppet = p; api.sfx('pick'); game.save(); stageWidget(container, api, game); };
      box.appendChild(b);
    });
    const play = document.createElement('button'); play.className = 'plain-btn stage-play'; play.textContent = '이 장면 올리기'; play.setAttribute('aria-label', '이 장면 올리기');
    play.style.cssText = 'left:1220px;top:600px;width:280px;height:76px';
    play.onclick = (e) => {
      e.stopPropagation(); if (game.busy) return;
      if (!f.puppet) { api.say('막 뒤에 아무 인형도 안 세웠어.'); return; }
      const h = SIZE[f.puppet] * mag(f.notch), want = ORDER[f.scene];
      const fail = (msg) => { f.scene = 0; game.save(); api.sfx('nope'); api.say(msg + ' 객석이 술렁… 공연이 처음으로 돌아갔어.', 4800); stageWidget(container, api, game); };
      if (h > SCREEN.h + 10) return fail('그림자가 막 밖으로 넘쳐 버렸어.');
      if (f.puppet !== want) return fail(`${PNAME[f.puppet]} 그림자가 나오자 너울이 고개를 갸웃했어.`);
      if (want === 'wolf' && h < SCREEN.h - 40) return fail('작은 늑대 그림자에 객석에서 키득키득 웃음이 터졌어.');
      f.scene += 1; game.save(); api.sfx('shine');
      if (f.scene < ORDER.length) { api.say(`${PNAME[want]} 장면. 객석에서 짝짝짝! 막 위 너울의 그림자가 한 뼘 또렷해졌어.`, 3600); stageWidget(container, api, game); return; }
      f.performed = true; f.doorOpen = true; game.busy = true; game.save();
      api.say('크게 일어선 늑대 그림자가 막을 가득 채우자… 우레 같은 박수! 막 위의 그림자가 스르르 내려와 너울이 되었어!', 6200);
      game.after(2200, () => { game.busy = false; api.flash('#fff4d8', 900); game.s.zoom = null; game.save(); game.render(); });
    };
    box.appendChild(play);
    const lv = document.createElement('div'); lv.className = 'stage-scene'; lv.textContent = '●'.repeat(f.scene) + '○'.repeat(ORDER.length - f.scene); box.appendChild(lv);
  }

  function nuulTalk(api) {
    const f = api.flags;
    if (!f.talked) {
      f.talked = true; api.lock(5600);
      api.say('너울: “어… 보여요? 저는 이 극장 배우 너울이에요. 공연 도중에 몸이 그림자에서 떨어져 나갔어요.”', 5600, { who: 'nuul' });
      api.after(5600, () => api.say('너울: “공연을 대본대로 끝까지 올리면 돌아갈 수 있대요. 그런데 대본이 엉망이 됐어요.”', 6000, { who: 'nuul', note: '너울의 부탁' }));
      return;
    }
    if (f.performed) { api.say('너울: “돌아왔어요! 다음 쪽은… 마지막 쪽이에요. 모두가 기다려요.”', 0, { who: 'nuul' }); return; }
    if (f.scene) { api.say('너울: “계속해요… 객석이 숨죽이고 있어요.”', 0, { who: 'nuul' }); return; }
    api.say('너울: “막 뒤로 가면 촛불이 있어요. 거기서 인형을 비추면 제가 연기할게요.”', 0, { who: 'nuul' });
  }

  Engine.registerRoom({
    id: 'shadow',
    chapter: '14장',
    title: '그림자 인형극장',
    assets: 'assets/rooms/shadow/',
    sky: ['assets/rooms/shadow/bg/north.webp', 'assets/rooms/shadow/bg/north.webp'],
    order: ['north', 'east', 'south', 'west'],
    start: 'north',
    hintWait: 40,
    isLit: () => true,
    ambient: (s) => (F(s).doorOpen ? 'party' : 'night'),
    guide: { name: '그림자 너울', img: 'assets/rooms/shadow/props/nuul_sad.webp' },
    intro: '별길 끝에 작은 극장이 있어. 하얀 막 위에… 주인 없는 그림자 하나가 혼자 서 있어.',

    repair(s, fix) {
      const f = s.flags;
      if (f.trunkOpen && !s.inv.includes('wolf')) fix.give('wolf');
      if (f.performed && !f.doorOpen) f.doorOpen = true;
    },

    items: {
      cellophane: { name: '빨간 셀로판', img: 'items/cellophane.webp', desc: '빨갛고 투명한 셀로판 한 장. 대고 보면 세상이 온통 빨개.' },
      rabbit: { name: '토끼 인형', img: 'items/rabbit.webp', desc: '막대 끝에 붙은 종이 토끼.' },
      branch: { name: '나뭇가지 인형', img: 'items/branch.webp', desc: '막대 끝에 붙은 앙상한 종이 나뭇가지.' },
      bird: { name: '새 인형', img: 'items/bird.webp', desc: '막대 끝에 붙은 종이 새.' },
      boat: { name: '배 인형', img: 'items/boat.webp', desc: '막대 끝에 붙은 종이 돛단배.' },
      deer: { name: '사슴 인형', img: 'items/deer.webp', desc: '토끼 머리에 나뭇가지를 겹쳐 묶었어. 그림자로 보면 뿔 달린 사슴.' },
      wolf: { name: '늑대 인형', img: 'items/wolf.webp', desc: '손바닥보다 작은 종이 늑대.' },
    },
    combos: [
      { a: 'rabbit', b: 'branch', result: 'deer', say: '토끼 머리 위로 나뭇가지를 겹쳐 묶었어. 촛불에 비춰 보니… 뿔 달린 사슴 그림자!' },
      { a: 'cellophane', b: 'rabbit', say: '셀로판 너머 토끼가 빨갛게 보일 뿐이야.' },
      { a: 'bird', b: 'branch', say: '새를 나뭇가지에 앉혀 봤어. 예쁘긴 한데 그게 다야.' },
    ],

    views: {
      /* ───── 북쪽: 무대와 막, 악보대 대본, 너울의 그림자 ───── */
      north: {
        name: '무대',
        bg: 'bg/north.webp',
        objects: [
          {
            id: 'screen', x: 0, y: 0, w: 0, h: 0, img: '', hit: [540, 210, 620, 370], label: '하얀 막',
            click: (api) => {
              if (api.flags.performed) { api.say('막이 환해. 공연은 끝났어.'); return; }
              if (!PUPPETS.some((p) => api.has(p))) { api.say('막 뒤로 촛불 빛이 비쳐. 비출 인형이 아직 없어.'); return; }
              api.zoom('stage');
            },
          },
          {
            id: 'nuul', img: (s) => `props/${F(s).scene ? 'nuul_surprised' : 'nuul_sad'}.webp`, show: (s) => !F(s).performed,
            x: 680, y: 190, w: 300, h: 347, cls: 'shadow-actor', hit: [740, 230, 180, 300], label: '그림자 너울',
            click: nuulTalk,
            wrong: '너울: “음… 그건 공연에 안 나와요.”',
          },
          {
            id: 'nuul_body', img: 'props/nuul_happy.webp', show: (s) => !!F(s).performed,
            x: 650, y: 300, w: 300, h: 347, cls: 'bob', hit: [700, 320, 200, 320], label: '너울',
            click: nuulTalk,
          },
          {
            id: 'stand', x: 0, y: 0, w: 0, h: 0, img: '', hit: [215, 440, 200, 150], label: '악보대의 대본',
            click: (api) => api.zoom('script'),
            use: { cellophane: (api) => { api.set('redLook'); api.zoom('script'); } },
          },
          { id: 'benches', x: 0, y: 0, w: 0, h: 0, img: '', hit: [170, 740, 1270, 140], label: '객석 의자', look: '나무 의자 두 개. 아무도 앉아 있지 않아.' },
        ],
      },

      /* ───── 동쪽: 무대 뒤 작업대, 인형 걸이 ───── */
      east: {
        name: '인형 걸이',
        bg: 'bg/east.webp',
        objects: [
          ...[['rabbit', 372, 148], ['branch', 598, 167], ['bird', 808, 177], ['boat', 980, 170]].map(([p, x, w]) => ({
            id: 'empty_' + p, img: `props/rack_empty_${p}.webp`, x, y: 238, w, h: 364, show: (s) => !!F(s)['took_' + p],
          })),
          ...[['rabbit', [380, 250, 125, 340]], ['branch', [605, 240, 140, 350]], ['bird', [815, 280, 165, 310]], ['boat', [985, 250, 160, 340]]].map(([p, hit]) => ({
            id: 'rack_' + p, x: 0, y: 0, w: 0, h: 0, img: '', hit, label: `${PNAME[p]} 인형`, show: (s) => !F(s)['took_' + p],
            click: (api, n) => { api.set('took_' + p); api.give(p, n); api.sfx('pick'); api.say(`${PNAME[p]} 인형을 걸이에서 내렸어.`); },
          })),
          { id: 'bench', x: 0, y: 0, w: 0, h: 0, img: '', hit: [360, 600, 1000, 110], label: '작업대', look: '가위, 풀단지, 오려 낸 종이 조각들.' },
          { id: 'peg', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1190, 180, 70, 60], label: '빈 못', look: '못 하나가 비어 있어.' },
        ],
      },

      /* ───── 남쪽: 매표소, 공연 포스터 네 컷, 트렁크 ───── */
      south: {
        name: '매표소',
        bg: 'bg/south.webp',
        objects: [
          { id: 'boothOpen', img: 'props/booth_open.webp', x: 225, y: 565, w: 215, h: 180, show: (s) => !!F(s).celloTaken },
          { id: 'trunkOpen', img: 'props/trunk_open.webp', x: 1050, y: 490, w: 445, h: 325, show: (s) => !!F(s).trunkOpen },
          { id: 'bell', x: 0, y: 0, w: 0, h: 0, img: '', hit: [295, 470, 85, 85], label: '매표소 종', click: (api) => { api.sfx('clink'); api.say('땡— 아무도 안 나와.'); } },
          {
            id: 'booth', x: 0, y: 0, w: 0, h: 0, img: '', hit: [240, 575, 185, 155], label: '매표소 아래 문',
            click: (api, n) => {
              if (api.flags.celloTaken) { api.say('표 뭉치만 남았어.'); return; }
              api.set('celloTaken'); api.give('cellophane', n); api.sfx('creak'); api.say('작은 문 안에 표 뭉치와 빨간 셀로판 한 장.');
            },
          },
          ...[['늑대', 492], ['배', 688], ['사슴', 884], ['새', 1078]].map(([n, x], i) => ({
            id: 'poster' + i, x: 0, y: 0, w: 0, h: 0, img: '', hit: [x, 218, 186, 317], label: `포스터 ${n} 그림`, look: `공연 포스터의 ${n} 그림.`,
          })),
          {
            id: 'trunk', x: 0, y: 0, w: 0, h: 0, img: '', hit: [1075, 600, 405, 200], label: '자물쇠 트렁크',
            click: (api) => (api.flags.trunkOpen ? api.say('트렁크는 비었어.') : api.zoom('trunk')),
          },
        ],
      },

      /* ───── 서쪽: 벨벳 커튼 출구 ───── */
      west: {
        name: '커튼 출구',
        bg: (s) => (F(s).doorOpen ? 'bg/west_open.webp' : 'bg/west.webp'),
        objects: [
          { id: 'coat', x: 0, y: 0, w: 0, h: 0, img: '', hit: [380, 280, 210, 510], label: '망토 걸이', look: '자줏빛 작은 망토. 너울의 것일까.' },
          { id: 'lamp', x: 0, y: 0, w: 0, h: 0, img: '', hit: [750, 280, 110, 125], label: '벽등', look: '따뜻한 놋쇠 벽등.' },
          {
            id: 'curtain', x: 0, y: 0, w: 0, h: 0, img: '', hit: [905, 190, 365, 560], label: '벨벳 커튼 출구',
            click: (api) => {
              if (api.flags.doorOpen) { api.sfx('step'); api.win(); return; }
              api.sfx('locked'); api.say('금색 줄이 단단히 묶여 있어. 아무리 당겨도 안 풀려.');
            },
          },
        ],
      },
    },

    zooms: {
      script: {
        bg: (s) => (F(s).redLook ? 'zoom/script_red.webp' : 'zoom/script.webp'),
        note: ['악보대의 대본', '파란 그림 위로 빨간 크레용 낙서가 잔뜩.'],
      },
      trunk: { bg: 'zoom/trunk.webp', note: ['트렁크 자물쇠', '그림 창 네 칸. 누르면 그림이 바뀐다.'], widget: trunkWidget },
      stage: { bg: 'zoom/backstage.webp', widget: stageWidget },
    },

    hints(s) {
      const f = s.flags, h = (i) => s.inv.includes(i);
      if (f.doorOpen) return { key: 'go', steps: ['너울이 몸을 되찾았어요!', '서쪽 커튼이 열렸어요.', '서쪽 벨벳 커튼 출구를 누르세요.'] };
      if (!f.talked) return { key: 'talk', steps: ['막 위에 누가 있어요.', '북쪽 하얀 막의 그림자예요.', '북쪽 그림자 너울을 누르세요.'] };
      if (!f.redLook) {
        if (!h('cellophane')) return { key: 'cello', steps: ['대본이 낙서투성이예요. 낙서만 안 보이게 할 방법이 있을까요?', '남쪽 매표소를 살펴봐요.', '남쪽 매표소 아래 작은 문을 열어 빨간 셀로판을 가져오세요.'] };
        return { key: 'red', steps: ['빨간 셀로판을 대고 보면 빨간색은 종이와 똑같이 보여요.', '빨간 낙서는 사라지고 파란 그림만 남겠죠.', '빨간 셀로판을 고른 채 북쪽 악보대의 대본을 누르세요.'] };
      }
      if (!f.trunkOpen) return { key: 'trunk', steps: ['대본의 파란 그림 네 개가 공연 순서예요. 남쪽 포스터와는 순서가 달라요.', '남쪽 트렁크 자물쇠도 그림 네 칸이에요.', '트렁크 자물쇠를 배·새·사슴·늑대로 맞추고 뚜껑을 당기세요.'] };
      if (!h('deer') && !f.performed && f.scene < 3) {
        if (!(h('rabbit') && h('branch'))) return { key: 'puppets', steps: ['인형이 더 있어요.', '동쪽 인형 걸이예요.', '동쪽 걸이의 인형을 모두 내리세요.'] };
        return { key: 'deer', steps: ['대본엔 사슴이 나오는데 사슴 인형이 없어요.', '그림자는 모양만 보여요. 두 인형을 겹치면?', '토끼 인형과 나뭇가지 인형을 합치세요.'] };
      }
      return { key: 'stage', steps: ['북쪽 막 뒤에서 대본 순서대로 공연해요. 한 장면이라도 틀리면 처음부터예요.', '촛불에 가까울수록 그림자가 커져요. 늑대 장면은 막을 가득 채워야 해요. 너무 크면 막 밖으로 넘쳐요.', '배·새·사슴은 2칸 이상, 늑대는 1칸(촛불 바로 앞)에 세워 차례로 올리세요.'] };
    },

    ending: {
      title: '돌아온 그림자',
      text: ['커튼이 열리고 금빛 통로가 이어졌어요. 너울이 망토를 펄럭이며 빙글 돌았지요.', '“제 몸이에요! 그림자도 발밑에 꼭 붙어 있어요!”', '통로 끝에서 종이가 접히는 소리가 들렸어요. 마지막 쪽, 접히는 집이 기다리고 있었어요.'],
      next: '3편 · 15장 「접히는 집」은 만드는 중이에요',
      image: 'assets/rooms/shadow/bg/west_open.webp',
    },
  });
})();
