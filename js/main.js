/* 표지(책 표지) 화면과 장 선택 */
(function () {
  const app = document.getElementById('app');
  const CHAPTERS = [
    { id: 'greenhouse', n: '1장', title: '햇살이 멈춘 온실', mood: '밝고 따뜻한' },
    { id: 'toyshop', n: '2장', title: '토끼의 장난감 공방', mood: '귀엽고 아기자기한' },
    { id: 'clock13', n: '3장', title: '열세 번째 시계', mood: '은은하게 오싹한' },
    { id: 'upside', n: '4장', title: '거꾸로 된 세상', mood: '기발하고 엉뚱한' },
    { id: 'seapost', n: '5장', title: '바닷속 우체국', mood: '신비롭고 몽환적인' },
  ];
  let game = null;

  function cover() {
    if (game) { game.destroy(); game = null; window.__game = null; }
    app.innerHTML = '';
    const frame = document.createElement('div'); frame.className = 'frame'; app.appendChild(frame);
    const st = document.createElement('div'); st.className = 'stage cover'; frame.appendChild(st);
    st.innerHTML = `
      <img class="layer cover-sky" src="assets/rooms/greenhouse/bg/sky_day.svg" alt="">
      <img class="layer cover-room" src="assets/rooms/greenhouse/bg/north.svg" alt="">
      <img class="cover-prop" style="left:228px;top:262px;width:380px;height:390px" src="assets/rooms/greenhouse/props/sunflowers_up.svg" alt="">
      <img class="cover-prop" style="left:660px;top:220px;width:280px;height:420px" src="assets/rooms/greenhouse/props/door_closed.svg" alt="">
      <div class="layer cover-shade"></div>
      <div class="layer grain"></div>
      <div class="book">
        <img class="book-seal" src="assets/ui/seal.svg" alt="">
        <p class="book-kicker">다섯 개의 방, 다섯 개의 문</p>
        <h1>열쇠 구멍 너머</h1>
        <p class="book-lede">눈으로 찾고, 손으로 합치고, 엉뚱하게 생각해야 열리는 문들이 있어요.</p>
        <ol class="chapters"></ol>
      </div>`;
    const ol = st.querySelector('.chapters');
    CHAPTERS.forEach((c) => {
      const ready = !!Engine.rooms[c.id];
      let cleared = false; try { cleared = !!localStorage.getItem('btk.cleared.' + c.id); } catch (e) { /* noop */ }
      const saved = Engine.store.get('btk.save.' + c.id);
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = 'chapter' + (ready ? '' : ' locked');
      b.disabled = !ready;
      b.innerHTML = `<span class="ch-n">${c.n}</span><span class="ch-t">${c.title}</span><span class="ch-m">${ready ? (cleared ? '탈출 완료 · 다시 하기' : saved ? '이어서 하기' : c.mood + ' 방') : '준비 중'}</span>`;
      if (ready) b.onclick = () => { window.Sfx && window.Sfx.play('step'); start(c.id, cleared && saved && saved.flags && saved.flags.__won); };
      li.appendChild(b); ol.appendChild(li);
    });
    const fit = () => { const r = app.getBoundingClientRect(); st.style.transform = `translate(-50%, -50%) scale(${Math.min(r.width / 1600, r.height / 900)})`; };
    window.onresize = fit; fit();
  }

  function start(id, fresh) {
    window.onresize = null;
    if (fresh) Engine.store.del('btk.save.' + id);
    game = new Engine.Game(app, Engine.rooms[id], { onExit: cover, onRestart: () => start(id, true), fresh });
    window.__game = game;
  }

  // 개발용: index.html#play-greenhouse 로 바로 시작
  const m = location.hash.match(/^#play-(\w+)$/);
  if (m && Engine.rooms[m[1]]) start(m[1]); else cover();
})();
