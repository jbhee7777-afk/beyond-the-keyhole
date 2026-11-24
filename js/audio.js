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
      // 꼬-끼-오-- 를 흉내 낸 톤 세 개
      tone(700, 0, 0.18, { type: 'sawtooth', vol: 0.06, glide: 200 });
      tone(900, 0.22, 0.18, { type: 'sawtooth', vol: 0.06, glide: 250 });
      tone(1100, 0.46, 0.9, { type: 'sawtooth', vol: 0.06, glide: -500 });
    },
    sunrise: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.16, 1.4, { vol: 0.08, attack: 0.2 })); },
    grow: () => { for (let i = 0; i < 12; i++) tone(300 + i * 70, i * 0.16, 0.25, { type: 'triangle', vol: 0.06 }); },
    win: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.14, 0.5, { type: 'triangle', vol: 0.12 })); },
  };
  window.Sfx = {
    get muted() { return muted; },
    play(n) { if (muted || !S[n]) return; try { S[n](); } catch (e) { /* 소리 실패는 무시 */ } },
    toggle() { muted = !muted; try { localStorage.setItem('btk.muted', muted ? '1' : '0'); } catch (e) { /* noop */ } if (!muted) S.tap(); },
  };
})();
