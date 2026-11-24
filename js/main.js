/* 표지(책 표지) 화면, 장 선택, 설정
 * 이야기 틀: 다락방에서 찾은 낡은 종이 책 「PAPERDOOR」 속 작은 종이 문으로 빨려 들어간 주인공(나)이
 * 다섯 방에서 "이야기 열쇠"를 하나씩 모아야 집으로 돌아올 수 있다. */
(function () {
  const app = document.getElementById('app');
  const CHAPTERS = [
    { id: 'greenhouse', n: '1장', title: '햇살이 멈춘 온실', mood: '밝고 따뜻한' },
    { id: 'toyshop', n: '2장', title: '토끼의 장난감 공방', mood: '귀엽고 아기자기한' },
    { id: 'clock13', n: '3장', title: '열세 번째 시계', mood: '은은하게 오싹한' },
    { id: 'upside', n: '4장', title: '거꾸로 된 세상', mood: '기발하고 엉뚱한' },
    { id: 'sea', n: '5장', title: '바닷속 우체국', mood: '신비롭고 몽환적인' },
  ];
  const cleared = (id) => { try { return !!localStorage.getItem('btk.cleared.' + id); } catch (e) { return false; } };
  // 앞 장을 탈출해야 다음 장이 열린다 (설정에서 모두 열 수 있음)
  const unlocked = (i) => Engine.settings.unlockAll || i === 0 || cleared(CHAPTERS[i - 1].id);
  let game = null;
  let fitFn = null;

  function stageShell(cls) {
    app.innerHTML = '';
    const frame = document.createElement('div'); frame.className = 'frame'; app.appendChild(frame);
    const st = document.createElement('div'); st.className = 'stage ' + cls; frame.appendChild(st);
    fitFn = () => { const r = app.getBoundingClientRect(); st.style.transform = `translate(-50%, -50%) scale(${Math.min(r.width / 1600, r.height / 900)})`; };
    window.onresize = fitFn; fitFn();
    return st;
  }

  function cover() {
    if (game) { game.destroy(); game = null; window.__game = null; }
    const st = stageShell('cover');
    const keys = CHAPTERS.map((c) => `<img src="assets/ui/${cleared(c.id) ? 'storykey' : 'storykey_empty'}.svg" alt="${c.n} ${cleared(c.id) ? '열쇠 얻음' : '아직'}">`).join('');
    st.innerHTML = `
      <img class="layer cover-sky" src="assets/rooms/greenhouse/bg/sky_day.svg" alt="">
      <img class="layer cover-room" src="assets/rooms/greenhouse/bg/north.svg" alt="">
      <img class="cover-prop" style="left:228px;top:202px;width:380px;height:450px" src="assets/rooms/greenhouse/props/sunflowers_up.svg" alt="">
      <img class="cover-prop" style="left:660px;top:220px;width:280px;height:420px" src="assets/rooms/greenhouse/props/door_closed.svg" alt="">
      <div class="layer cover-shade"></div>
      <div class="layer grain"></div>
      <div class="book">
        <img class="book-seal" src="assets/ui/seal.svg" alt="">
        <p class="book-kicker">종이 책 속 다섯 개의 방</p>
        <h1>PAPERDOOR</h1>
        <p class="book-sub">페이퍼도어 · 다섯 개의 문</p>
        <p class="book-lede">다락방에서 찾은 낡은 종이 책을 펼쳤더니, 책장 사이 작은 종이 문이 덜컥 열렸어요! 다섯 방에서 <b>이야기 열쇠</b>를 모두 모아야 집으로 돌아갈 수 있어요.</p>
        <div class="key-row" aria-label="모은 이야기 열쇠">${keys}</div>
        <ol class="chapters"></ol>
      </div>
      <div class="cover-tools"><button class="tool tool-gear" aria-label="설정" title="설정"></button></div>`;
    const ol = st.querySelector('.chapters');
    CHAPTERS.forEach((c, i) => {
      const ready = !!Engine.rooms[c.id] && unlocked(i);
      const done = cleared(c.id);
      const saved = Engine.store.get('btk.save.' + c.id);
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = 'chapter' + (ready ? '' : ' locked');
      b.disabled = !ready;
      const state = !ready ? `${CHAPTERS[i - 1].n}을 탈출하면 열려요` : done ? '탈출 완료 · 다시 하기' : saved && saved.v === Engine.SAVE_VERSION ? '이어서 하기' : c.mood + ' 방';
      b.innerHTML = `<span class="ch-n">${c.n}</span><span class="ch-t">${c.title}</span><span class="ch-m">${state}</span>`;
      if (ready) b.onclick = () => { window.Sfx && window.Sfx.play('step'); start(c.id, done && saved && saved.flags && saved.flags.__won); };
      li.appendChild(b); ol.appendChild(li);
    });
    st.querySelector('.tool-gear').onclick = () => settings(st);
  }

  function settings(st) {
    const box = document.createElement('div');
    box.className = 'overlay';
    const S = Engine.settings;
    box.innerHTML = `<div class="settings-card">
      <h2>설정</h2>
      <label><input type="checkbox" id="opt-big" ${S.bigText ? 'checked' : ''}> 글씨를 크게</label>
      <label><input type="checkbox" id="opt-slow" ${S.slowText ? 'checked' : ''}> 대사를 천천히 (오래 보여 주기)</label>
      <label><input type="checkbox" id="opt-sound" ${window.Sfx && !window.Sfx.muted ? 'checked' : ''}> 소리 켜기</label>
      <label><input type="checkbox" id="opt-all" ${S.unlockAll ? 'checked' : ''}> 모든 장 열기 (보호자용)</label>
      <label><input type="checkbox" id="opt-tips"> 조작 안내를 처음부터 다시 보기</label>
      <div class="hint-row"><button class="plain-btn ghost" id="opt-reset">모든 진행 지우기</button><button class="plain-btn" id="opt-close">닫기</button></div>
    </div>`;
    st.appendChild(box);
    const q = (id) => box.querySelector(id);
    q('#opt-close').onclick = () => {
      S.bigText = q('#opt-big').checked; S.slowText = q('#opt-slow').checked; S.unlockAll = q('#opt-all').checked;
      if (window.Sfx && window.Sfx.muted === q('#opt-sound').checked) window.Sfx.toggle();
      if (q('#opt-tips').checked) Engine.resetTips();
      Engine.saveSettings(); box.remove(); cover();
    };
    let armed = false;
    q('#opt-reset').onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = '정말 지울까요? 한 번 더 누르세요'; return; }
      CHAPTERS.forEach((c) => { Engine.store.del('btk.save.' + c.id); Engine.store.del('btk.cleared.' + c.id); });
      Engine.resetTips(); box.remove(); cover();
    };
  }

  function start(id, fresh) {
    window.onresize = null;
    if (fresh) Engine.store.del('btk.save.' + id);
    const i = CHAPTERS.findIndex((c) => c.id === id);
    const next = CHAPTERS[i + 1];
    game = new Engine.Game(app, Engine.rooms[id], {
      onExit: cover,
      onRestart: () => start(id, true),
      onNext: next && Engine.rooms[next.id] ? () => { if (game) game.destroy(); start(next.id, cleared(next.id)); } : null,
      fresh,
    });
    window.__game = game;
  }

  // 휴대폰 세로 화면이면 가로로 돌려 달라고 안내
  (function rotateHint() {
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    if (!small) return;
    const h = document.createElement('div');
    h.className = 'rotate-hint';
    h.innerHTML = '<div><div class="phone"></div><p>휴대폰을 가로로 돌려 주세요.<br>그림이 훨씬 크게 보여요!</p><button>그래도 이대로 할래요</button></div>';
    h.querySelector('button').onclick = () => h.remove();
    document.body.appendChild(h);
  })();

  // 개발용: index.html#play-greenhouse 로 바로 시작
  const m = location.hash.match(/^#play-(\w+)$/);
  if (m && Engine.rooms[m[1]]) start(m[1]); else cover();
})();
