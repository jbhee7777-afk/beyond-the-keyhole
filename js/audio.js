/* 효과음: 파일 없이 Web Audio로 합성한다. 진짜 녹음 파일로 바꾸고 싶으면
 * assets/audio/ 에 넣고 play()에서 new Audio(...)를 쓰도록 바꾸면 된다. */
(function () {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('btk.muted') === '1'; } catch (e) { /* noop */ }
  const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };

  function tone(freq, t0, dur, { type = 'sine', vol = 0.18, glide = 0, attack = 0.01 } = {}) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + glide), c.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  function noise(t0, dur, { vol = 0.12, freq = 1200, q = 0.8, type = 'bandpass' } = {}) {
    const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = freq; fl.Q.value = q;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(fl).connect(g).connect(c.destination);
    src.start(c.currentTime + t0);
  }
  const S = {
    tap: () => tone(660, 0, 0.08, { type: 'triangle', vol: 0.08 }),
    step: () => noise(0, 0.18, { vol: 0.08, freq: 700 }),
    pick: () => { tone(784, 0, 0.12, { type: 'triangle' }); tone(1175, 0.08, 0.2, { type: 'triangle' }); },
    combine: () => { [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.2, { type: 'triangle', vol: 0.14 })); },
    nope: () => tone(220, 0, 0.18, { type: 'sine', vol: 0.12, glide: -60 }),
    locked: () => { noise(0, 0.06, { vol: 0.2, freq: 2500 }); noise(0.1, 0.06, { vol: 0.16, freq: 2200 }); },
    dial: () => noise(0, 0.04, { vol: 0.2, freq: 3200, q: 4 }),
    unlock: () => { noise(0, 0.05, { vol: 0.25, freq: 2600 }); tone(880, 0.06, 0.25, { type: 'triangle' }); },
    door: () => { noise(0, 0.9, { vol: 0.12, freq: 400, q: 3 }); tone(180, 0, 0.9, { type: 'sawtooth', vol: 0.03, glide: 60 }); },
    scrape: () => noise(0, 0.3, { vol: 0.12, freq: 900, q: 2 }),
    shine: () => { [1319, 1568, 1976, 2637].forEach((f, i) => tone(f, i * 0.06, 0.4, { vol: 0.07 })); },
    creak: () => tone(300, 0, 0.5, { type: 'sawtooth', vol: 0.04, glide: 180 }),
    splash: () => noise(0, 0.5, { vol: 0.2, freq: 900, q: 0.5, type: 'lowpass' }),
    clink: () => { tone(2093, 0, 0.3, { vol: 0.1 }); tone(2637, 0.04, 0.3, { vol: 0.07 }); },
    water: () => { for (let i = 0; i < 10; i++) tone(600 + Math.random() * 900, i * 0.06, 0.08, { vol: 0.05, glide: 300 }); },
    dig: () => { noise(0, 0.12, { vol: 0.14, freq: 500 }); noise(0.18, 0.12, { vol: 0.14, freq: 450 }); },
    rooster: () => {
      // 꼬-끼-오-오-- : 짧게 두 번 올리고, 길게 떨며 내려간다
      const crow = (f, t0, d, g) => { tone(f, t0, d, { type: 'sawtooth', vol: 0.05, glide: g, attack: 0.03 }); tone(f * 1.5, t0, d, { type: 'square', vol: 0.015, glide: g * 1.5, attack: 0.03 }); };
      crow(620, 0, 0.16, 260); crow(820, 0.2, 0.16, 300);
      crow(1040, 0.42, 0.42, 120); crow(1160, 0.84, 0.7, -560);
    },
    sunrise: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.16, 1.4, { vol: 0.08, attack: 0.2 })); },
    grow: () => { for (let i = 0; i < 12; i++) tone(300 + i * 70, i * 0.16, 0.25, { type: 'triangle', vol: 0.06 }); },
    win: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.14, 0.5, { type: 'triangle', vol: 0.12 })); },
  };
  // 오르골 음: freqs 배열을 차례로 (null은 쉼표)
  function notes(freqs, gap = 0.28) {
    freqs.forEach((f, i) => { if (f) { tone(f, i * gap, 0.9, { type: 'triangle', vol: 0.12 }); tone(f * 2, i * gap, 0.4, { vol: 0.03 }); } });
  }
  S.squeak = () => { tone(1800, 0, 0.08, { vol: 0.08, glide: 600 }); tone(2200, 0.1, 0.08, { vol: 0.07, glide: 500 }); };
  S.pop = () => { noise(0, 0.15, { vol: 0.3, freq: 1500 }); tone(300, 0, 0.3, { type: 'square', vol: 0.06, glide: 600 }); };
  S.click = () => noise(0, 0.05, { vol: 0.25, freq: 2000, q: 2 });
  S.rip = () => { for (let i = 0; i < 6; i++) noise(i * 0.06, 0.04, { vol: 0.15, freq: 3000, q: 3 }); };
  let bongN = 0;
  S.bong = () => {
    // 매번 아주 조금씩 다른 높이와 울림
    const base = [196, 185, 208, 175][bongN++ % 4];
    tone(base, 0, 2.4, { type: 'triangle', vol: 0.16 }); tone(base * 2.01, 0, 1.4, { vol: 0.05 });
    tone(base * 2.99, 0, 0.9, { vol: 0.03 }); tone(base * 0.5, 0.02, 2.8, { vol: 0.05 });
    noise(0, 0.08, { vol: 0.08, freq: 1800, q: 2 });
  };
  // 생일 축하 노래 (도도레도파미 / 도도레도솔파)
  S.birthday = () => {
    const C = 523, D = 587, E = 659, F = 698;
    const song = [[392, .3], [392, .15], [440, .45], [392, .45], [C, .45], [494, .9],
      [392, .3], [392, .15], [440, .45], [392, .45], [D, .45], [C, .9],
      [392, .3], [392, .15], [784, .45], [E, .45], [C, .45], [494, .45], [440, .9],
      [F, .3], [F, .15], [E, .45], [C, .45], [D, .45], [C, 1.2]];
    let t0 = 0.05;
    song.forEach(([f, d]) => { tone(f, t0, Math.max(0.35, d * 1.4), { type: 'triangle', vol: 0.11 }); tone(f * 2, t0, 0.3, { vol: 0.025 }); t0 += d * 0.85; });
  };

  /* 방 분위기 소리: 아주 작게, 드문드문 울리는 음 + 바탕 소리.
   * 사용자가 화면을 한 번 누르기 전에는 소리를 만들지 않는다 (브라우저 자동재생 규칙). */
  const MOODS = {
    garden: { scale: [523, 587, 659, 784, 880, 1047], gap: 2.4, type: 'sine', vol: 0.025, chirp: true },
    night: { scale: [262, 311, 392, 466, 523], gap: 3.4, type: 'sine', vol: 0.022 },
    workshop: { scale: [392, 440, 494, 587, 659], gap: 2.2, type: 'triangle', vol: 0.02, tick: true },
    party: { scale: [523, 659, 784, 1047, 1319], gap: 1.4, type: 'triangle', vol: 0.025 },
    attic: { scale: [220, 233, 294, 330, 349], gap: 3.8, type: 'sine', vol: 0.02, tick: true, wind: true },
    upside: { scale: [349, 440, 523, 622, 698, 880], gap: 2.0, type: 'triangle', vol: 0.022, wobble: true },
    sea: { scale: [262, 330, 392, 494, 587, 659], gap: 3.0, type: 'sine', vol: 0.024, bubbles: true, wind: true },
  };
  let mood = null, moodTimer = null, armed = false, beat = 0;
  const startGesture = () => { armed = true; if (mood && !moodTimer) startMood(); };
  ['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, startGesture, { once: true, capture: true }));
  function moodTick() {
    const m = MOODS[mood]; if (!m || muted || document.hidden) return;
    beat++;
    const f = m.scale[Math.floor(Math.random() * m.scale.length)];
    tone(f, 0, m.gap * 0.9, { type: m.type, vol: m.vol, attack: 0.4, glide: m.wobble ? (Math.random() < 0.5 ? -f * 0.04 : f * 0.04) : 0 });
    if (Math.random() < 0.35) tone(f * 1.5, 0.3, m.gap * 0.7, { type: 'sine', vol: m.vol * 0.5, attack: 0.5 });
    if (m.tick && beat % 2 === 0) noise(0, 0.03, { vol: 0.03, freq: 4000, q: 6 });
    if (m.chirp && Math.random() < 0.25) { tone(2400, 0.1, 0.07, { vol: 0.02, glide: 700 }); tone(2600, 0.22, 0.07, { vol: 0.018, glide: 600 }); }
    if (m.bubbles && Math.random() < 0.45) for (let i = 0; i < 3; i++) tone(500 + Math.random() * 600, 0.2 + i * 0.12, 0.08, { vol: 0.015, glide: 400 });
    if (m.wind && beat % 3 === 0) noise(0, m.gap * 1.2, { vol: 0.012, freq: 500, q: 0.4, type: 'lowpass' });
  }
  function startMood() {
    clearInterval(moodTimer); moodTimer = null;
    if (!mood || !armed || !MOODS[mood]) return;
    moodTimer = setInterval(() => { try { moodTick(); } catch (e) { /* noop */ } }, MOODS[mood].gap * 1000);
  }
  S.whisper = () => { noise(0, 0.9, { vol: 0.05, freq: 2400, q: 1.5 }); noise(0.5, 0.7, { vol: 0.04, freq: 2000, q: 1.5 }); };
  S.curtain = () => noise(0, 0.6, { vol: 0.1, freq: 1200, q: 0.7 });
  S.match = () => { noise(0, 0.15, { vol: 0.25, freq: 3500, q: 1 }); noise(0.15, 0.6, { vol: 0.06, freq: 500, q: 0.5, type: 'lowpass' }); };
  S.tick = () => noise(0, 0.03, { vol: 0.15, freq: 4000, q: 6 });
  S.jar = () => { noise(0, 0.25, { vol: 0.12, freq: 600, q: 4 }); tone(900, 0.25, 0.15, { type: 'triangle', vol: 0.08 }); };
  window.Sfx = {
    notes(f, gap) { if (!muted) try { notes(f, gap); } catch (e) { /* noop */ } },
    get muted() { return muted; },
    play(n) { if (muted || !S[n]) return; try { S[n](); } catch (e) { /* 소리 실패는 무시 */ } },
    birthday() { if (!muted) try { S.birthday(); } catch (e) { /* noop */ } },
    ambient(name) { if (name === mood) return; mood = name || null; startMood(); },
    toggle() { muted = !muted; try { localStorage.setItem('btk.muted', muted ? '1' : '0'); } catch (e) { /* noop */ } if (!muted) S.tap(); },
  };
})();
