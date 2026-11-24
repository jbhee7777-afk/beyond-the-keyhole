// 4장 「거꾸로 된 세상」 그래픽 에셋 생성기
// node tools/art/upside.mjs  → assets/rooms/upside/**
// 방은 "바르게 선" 모습으로 그린다. 게임에서 뒤집기 전에는 방 레이어 전체를 180도 돌려 보여 준다.
// 분위기: 하늘색 구름 벽지, 레몬 징두리, 체리·크림 바둑판 마루. 기발하고 초현실적이지만 따뜻하게.
import { seed, rand, pick, INK, wob, rect, rectPts, ell, ellPts, rot, shape, fill, line, hatch, leaf, svg } from './ink.mjs';
import { part, S, O, batArt } from './chars.mjs';

const OUT = new URL('../../assets/rooms/upside/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  sky: '#9cc6e4', sky2: '#86b4d6', cloud: '#f7f3ea', lemon: '#f0d64a', lemon2: '#d8b832', cherry: '#d2444f', cherry2: '#a8323c',
  cream: '#f6eedc', ink2: '#5a4a8a', wood: '#b07c4a', wood2: '#8a5a34', woodD: '#5e3d22', brass: '#d4a649', brass2: '#9d7428', brassL: '#f0cf7c',
  mint: '#8fcfb4', leaf: '#6f9a4f', leaf2: '#4f7c3a', grey: '#a8a6b0', green: '#5e9a5a', rose: '#e88a9a',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const cloud = (x, y, s, col = C.cloud, op = 1) => `<path d="${S([[x - 40 * s, y], [x - 34 * s, y - 16 * s], [x - 14 * s, y - 22 * s], [x, y - 34 * s], [x + 22 * s, y - 28 * s], [x + 34 * s, y - 14 * s], [x + 44 * s, y], [x + 30 * s, y + 8 * s], [x - 30 * s, y + 8 * s]], 0.4 * s)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''} stroke="${INK}" stroke-width="${(1.2 * Math.min(1, s)).toFixed(1)}"/>`;

// 숫자 (손글씨 획) — 액자와 금고에 쓴다
function digitPath(d) {
  return {
    0: [[30, 6], [50, 18], [54, 46], [48, 76], [30, 86], [12, 76], [6, 46], [10, 18], [30, 6]],
    1: [[18, 20], [32, 6], [32, 86]],
    6: [[46, 10], [26, 14], [12, 40], [10, 66], [24, 84], [42, 82], [52, 64], [44, 48], [26, 46], [12, 58]],
    8: [[30, 46], [14, 36], [12, 18], [30, 6], [48, 18], [46, 36], [30, 46], [12, 58], [12, 78], [30, 88], [48, 78], [48, 58], [30, 46]],
    9: [[14, 80], [34, 76], [48, 50], [50, 24], [36, 6], [18, 8], [8, 26], [16, 42], [34, 44], [48, 32]],
  }[d];
}
function digits(str, x, y, s, col, sw) {
  let o = '';
  [...str].forEach((d, i) => { const pts = digitPath(d).map(([px, py]) => [x + i * 64 * s + px * s, y + py * s]); o += line(pts, { sw: sw + 3, color: INK, step: 14, amp: 0.5 }) + line(pts, { sw, color: col, step: 14, amp: 0.5 }); });
  return o;
}

/* ───────────── 방 껍데기 (바르게 선 모습) ───────────── */
function shell() {
  let o = '';
  // 천장: 크림색, 몰딩, 가운데 장미 장식
  o += fill(wob([[0, 0], [W, 0], [1460, 70], [140, 70]], { sharp: true }), C.cream);
  o += line([[140, 70], [1460, 70]], { sw: 4 }) + line([[150, 62], [1450, 62]], { sw: 1.4, op: 0.5 });
  o += part(ellPts(800, 34, 70, 22, 0, Math.PI * 2, 18), '#efe2c4', { sw: 1.6 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; o += `<path d="${S([[800, 34], [800 + Math.cos(a - 0.2) * 40, 34 + Math.sin(a - 0.2) * 14], [800 + Math.cos(a) * 60, 34 + Math.sin(a) * 20], [800 + Math.cos(a + 0.2) * 40, 34 + Math.sin(a + 0.2) * 14]], 0.2)}" fill="#e6d4ac" stroke="${INK}" stroke-width="0.8"/>`; }
  // 옆벽
  for (const side of [0, 1]) {
    const X = (u) => side ? W - 140 * u : 140 * u;
    const at = (u, v) => [X(u), 70 * u + (900 - 260 * u - 70 * u) * v];
    o += part([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], C.sky2, { sw: 2 });
    o += part([at(0, 0.66), at(1, 0.66), at(1, 1), at(0, 1)], C.lemon2, { sw: 1.6 });
    o += hatch(wob([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { sharp: true }), 0.22, 'hatch2');
  }
  // 뒷벽: 구름 벽지
  o += part([[140, 70], [1460, 70], [1460, 520], [140, 520]], C.sky, { sw: 2 });
  for (let y = 120; y < 500; y += 92) for (let x = 200 + ((y / 92) % 2) * 90; x < 1440; x += 180) o += cloud(x, y, 0.55, C.cloud, 0.75);
  for (let i = 0; i < 40; i++) o += dot(rand(160, 1440), rand(90, 500), 2, '#fffbe6', 0.7);
  // 레몬 징두리
  o += part([[140, 512], [1460, 512], [1460, 640], [140, 640]], C.lemon, { sw: 2 });
  for (let x = 160; x < 1440; x += 132) o += part(rectPts(x, 530, 112, 92), 'none', { sw: 1.4 });
  o += part([[130, 500], [1470, 500], [1470, 516], [130, 516]], C.wood, { sw: 1.8 });
  // 체리·크림 바둑판 마루
  const rows = [640, 672, 712, 762, 826, 900], N = 12;
  const xAt = (y, k) => { const t = (y - 640) / 260; const xb = 140 + k * 1320 / N, xf = -60 + k * 1720 / N; return xb + (xf - xb) * t; };
  for (let r = 0; r < rows.length - 1; r++) for (let i = 0; i < N; i++) {
    const y0 = rows[r], y1 = rows[r + 1];
    o += part([[xAt(y0, i), y0], [xAt(y0, i + 1), y0], [xAt(y1, i + 1), y1], [xAt(y1, i), y1]], (r + i) % 2 ? C.cherry : C.cream, { sw: 1.4 });
  }
  o += hatch(wob([[140, 640], [1460, 640], [1460, 660], [140, 660]], { sharp: true }), 0.45);
  return o;
}
function chandelier(cx) {
  let o = line([[cx, 60], [cx, 120]], { sw: 3, color: C.brass2 });
  o += part([[cx - 90, 170], [cx + 90, 170], [cx + 70, 196], [cx - 70, 196]], C.brass, { sw: 1.8, heavy: [1, 2] });
  o += part(ellPts(cx, 140, 28, 26, 0, Math.PI * 2, 14), C.brass, { sw: 1.6 });
  for (const dx of [-80, -40, 0, 40, 80]) {
    o += line([[cx, 150], [cx + dx * 0.6, 160], [cx + dx, 168]], { sw: 2.4, color: C.brass2 });
    o += part([[cx + dx - 7, 168], [cx + dx + 7, 168], [cx + dx + 7, 136], [cx + dx - 7, 136]], C.cream, { sw: 1.2 });
    o += `<path d="${S([[cx + dx, 112], [cx + dx + 6, 126], [cx + dx, 136], [cx + dx - 6, 126]], 0.2)}" fill="#ffd77a" stroke="${INK}" stroke-width="0.8"/>`;
  }
  for (let i = 0; i < 9; i++) o += `<path d="${S([[cx - 80 + i * 20, 196], [cx - 74 + i * 20, 212], [cx - 80 + i * 20, 226], [cx - 86 + i * 20, 212]], 0.2)}" fill="#e8f4fa" stroke="${INK}" stroke-width="0.8"/>`;
  return o;
}

/* ───────────── 배경 4면 ───────────── */
function bgNorth() {
  seed(911);
  let o = shell();
  o += chandelier(700);
  // 문 자리
  o += part([[970, 640], [970, 330], [990, 280], [1040, 250], [1100, 242], [1160, 250], [1210, 280], [1230, 330], [1230, 640]], C.woodD, { sw: 3 });
  // 거꾸로 걸린 그림 (방이 바르게 서야 비로소 바르게 보이는 풍경)
  o += part(rectPts(300, 200, 200, 150), C.wood2, { sw: 2.2, heavy: [1, 2] }) + part(rectPts(312, 212, 176, 126), '#bfe0f0', { sw: 1.4 });
  o += part([[312, 300], [380, 260], [440, 290], [488, 270], [488, 338], [312, 338]], C.green, { sw: 1.2 }) + cloud(380, 250, 0.4) + dot(450, 236, 12, C.lemon);
  put('bg/north.svg', W, H, o, { id: 911 });
}
function bgEast() {
  seed(912);
  let o = shell();
  // 책장
  o += part(rectPts(190, 170, 300, 470), C.wood2, { sw: 2.4, heavy: [1, 2] }) + part(rectPts(204, 184, 272, 442), '#6a4528', { sw: 1.4 });
  for (const y of [290, 410, 530, 626]) o += part(rectPts(198, y, 284, 12), C.wood, { sw: 1.4 });
  for (const y of [290, 410, 530]) { let x = 212; while (x < 460) { const w = rand(16, 28), h = rand(64, 96); o += part(rectPts(x, y - h, w, h), pick([C.cherry, C.ink2, C.mint, C.lemon2, '#4a7aa8']), { sw: 1.2 }); x += w + rand(1, 4); } }
  // 찻잔 선반
  o += part(rectPts(1130, 280, 260, 14), C.wood, { sw: 1.6 });
  for (let i = 0; i < 4; i++) { const x = 1150 + i * 60; o += part([[x, 280], [x + 36, 280], [x + 32, 254], [x + 4, 254]], pick([C.rose, C.mint, C.cream]), { sw: 1.4 }) + line(ellPts(x + 40, 266, 8, 8, -1.4, 1.4, 6), { sw: 1.8, step: 999 }); }
  // 화분
  o += part([[1260, 640], [1340, 640], [1330, 580], [1270, 580]], C.cherry, { sw: 1.8 });
  for (let i = 0; i < 7; i++) o += leaf(1300, 580, rand(60, 90), -Math.PI / 2 + (i - 3) * 0.3, pick([C.leaf, C.leaf2]), { w: 0.3 });
  put('bg/east.svg', W, H, o, { id: 912 });
}
function bgSouth() {
  seed(913);
  let o = shell();
  // 낮은 탁자
  o += part([[1090, 560], [1350, 560], [1350, 580], [1090, 580]], C.wood, { sw: 1.8, heavy: [1, 2] });
  for (const x of [1104, 1326]) o += part([[x, 580], [x + 12, 580], [x + 10, 690], [x + 2, 690]], C.wood2, { sw: 1.4 });
  o += part([[1150, 560], [1290, 560], [1270, 534], [1170, 534]], '#e8f4fa', { sw: 1.6 });
  put('bg/south.svg', W, H, o, { id: 913 });
}
function bgWest() {
  seed(914);
  let o = shell();
  // 창문 (바깥 하늘과 구름) — 방이 뒤집히면 하늘도 같이 뒤집힌다
  o += part(rectPts(1090, 150, 300, 300), C.cream, { sw: 2.6, heavy: [1, 2] });
  o += part(rectPts(1106, 166, 268, 268), '#bfe0f0', { sw: 1.4 });
  o += cloud(1180, 240, 0.7) + cloud(1300, 320, 0.55) + dot(1320, 210, 22, C.lemon) + part([[1106, 380], [1200, 350], [1300, 370], [1374, 350], [1374, 434], [1106, 434]], C.green, { sw: 1 });
  o += line([[1240, 166], [1240, 434]], { sw: 6, color: C.cream }) + line([[1106, 300], [1374, 300]], { sw: 6, color: C.cream });
  // 화분과 키 큰 식물
  o += part([[230, 640], [330, 640], [318, 560], [242, 560]], C.lemon2, { sw: 1.8 });
  for (let i = 0; i < 9; i++) o += leaf(280, 560, rand(80, 140), -Math.PI / 2 + (i - 4) * 0.24, pick([C.leaf, C.leaf2]), { w: 0.28 });
  put('bg/west.svg', W, H, o, { id: 914 });
}

/* ───────────── 소품 ───────────── */
function door(open) {
  seed(open ? 921 : 922);
  const w = 260, h = 400;
  const outl = [[10, h], [10, 100], [32, 46], [80, 16], [130, 8], [180, 16], [228, 46], [250, 100], [250, h]];
  let o = '';
  if (open) {
    o += part(outl, '#bfe0f0', { sw: 3 }) + cloud(90, 120, 0.8) + cloud(180, 200, 0.6) + part([[10, 300], [120, 270], [250, 290], [250, h], [10, h]], C.green, { sw: 1.2 });
    o += part([[110, h], [126, 300], [140, 300], [170, h]], '#efdcaa', { sw: 1 }) + `<circle cx="130" cy="110" r="70" fill="#fffbe6" opacity="0.8" filter="url(#blur)"/>`;
    o += part([[10, 60], [44, 34], [44, h + 8], [10, h]], C.cherry2, { sw: 2.4 });
  } else {
    o += part(outl, C.cherry, { heavy: [5, 8], sw: 2.6, shade: [[170, 0], [260, 0], [260, h], [180, h]], shadeCol: 'rgba(80,0,10,0.22)' });
    for (const y of [120, 240]) o += part(rectPts(40, y, 180, 100), 'none', { sw: 1.6 });
    o += part(ellPts(130, 80, 34, 34, 0, Math.PI * 2, 14), '#bfe0f0', { sw: 2 }) + cloud(126, 86, 0.4);
    o += dot(216, 250, 10, C.brass) + part([[206, 280], [226, 280], [222, 300], [210, 300]], C.brass, { sw: 1.2 }) + `<path d="M213 286 L219 286 L217 296 L215 296Z" fill="${INK}"/>`;
  }
  put(`props/door_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: open ? 921 : 922 });
}
function umbrellaStand(full) {
  seed(923);
  let o = '';
  if (full) {
    o += line([[44, 140], [40, 8]], { sw: 4, color: C.woodD }) + line(ellPts(52, 10, 12, 12, Math.PI, Math.PI * 2.1, 8), { sw: 4, color: C.woodD, step: 999 });
    o += part([[30, 150], [40, 40], [50, 30], [62, 40], [70, 150]], C.ink2, { sw: 1.8, heavy: [3, 4] });
    for (const x of [44, 56]) o += line([[x, 46], [x - 2, 146]], { sw: 1, op: 0.5 });
  }
  o += part([[10, 120], [90, 120], [84, 210], [16, 210]], C.lemon, { sw: 2, heavy: [1, 2], shade: [[60, 116], [96, 116], [96, 214], [60, 214]], shadeCol: 'rgba(120,90,0,0.2)', hatch: false });
  for (const y of [140, 190]) o += line([[12, y], [88, y]], { sw: 2, color: C.cherry });
  put(`props/stand_${full ? 'umb' : 'empty'}.svg`, 100, 220, o, { id: 923 });
}
function bat(state) {
  seed(925);
  put(`props/bat_${state}.svg`, 160, 230, batArt(state), { id: 925, displace: 1.2 });
}
function sofa() {
  seed(931);
  const w = 620, h = 290;
  let o = `<path d="${S([[20, 280], [600, 280], [596, 290], [24, 290]])}" fill="${INK}" opacity="0.2"/>`;
  o += part([[60, 150], [70, 40], [130, 14], [310, 6], [490, 14], [550, 40], [560, 150]], C.ink2, { heavy: [4, 6], shade: [[420, 0], [570, 0], [570, 160], [420, 160]], shadeCol: 'rgba(20,10,50,0.22)' });
  for (const x of [190, 310, 430]) o += line([[x, 30], [x, 140]], { sw: 1.4, op: 0.5 });
  for (const [x, y] of [[130, 70], [250, 60], [370, 60], [490, 70]]) o += dot(x, y, 4, '#3e3268');
  o += part([[60, 140], [560, 140], [566, 200], [54, 200]], '#7a6aa8', { sw: 2, heavy: [1, 2] });
  o += line([[310, 144], [310, 198]], { sw: 1.4, op: 0.6 });
  for (const sx of [0, 1]) { const x = sx ? 560 : 10; o += part([[x, 110], [x + 50, 100], [x + 56, 230], [x + 4, 234]], C.ink2, { sw: 2.2, heavy: [1, 2] }); o += line(ellPts(x + 28, 118, 18, 14, Math.PI, Math.PI * 2.4, 10), { sw: 1.6, color: '#3e3268', step: 999 }); }
  o += part([[40, 200], [580, 200], [580, 250], [40, 250]], C.ink2, { sw: 2 });
  for (let x = 50; x < 580; x += 24) o += line([[x, 250], [x + 6, 262], [x + 18, 262], [x + 24, 250]], { sw: 1.2, color: '#3e3268' });
  // 소파 밑 어두운 틈
  o += `<path d="${S([[60, 262], [560, 262], [556, 280], [64, 280]], 0.4)}" fill="#1c1430" opacity="0.85"/>`;
  for (const x of [60, 540]) o += part([[x, 262], [x + 20, 262], [x + 16, 284], [x + 4, 284]], C.woodD, { sw: 1.4 });
  put('props/sofa.svg', w, h, o, { id: 931 });
}
function frame(big) {
  seed(932);
  const s = big ? 3 : 1, ox = big ? 380 : 0, oy = big ? 180 : 0;
  const w = big ? W : 220, h = big ? H : 160;
  let o = '';
  if (big) { o += fill(rect(0, 0, W, H, { amp: 0 }), C.sky); for (let y = 100; y < H; y += 140) for (let x = 120 + ((y / 140) % 2) * 120; x < W; x += 240) o += cloud(x, y, 1.1, C.cloud, 0.7); }
  o += part(rectPts(ox, oy, 220 * s, 160 * s), C.wood2, { sw: 2.4 * Math.min(s, 1.6), heavy: [1, 2] });
  o += part(rectPts(ox + 12 * s, oy + 12 * s, 196 * s, 136 * s), C.cream, { sw: 1.6 * Math.min(s, 1.6) });
  // 바르게 선 세상의 숫자 819 (거꾸로 보면 618)
  o += digits('819', ox + 30 * s, oy + 32 * s, s * 1.0, C.cherry, 4 * Math.min(s, 2.2));
  // 액자 아래쪽에 작은 꽃 그림 (어느 쪽이 아래인지 알려 주는 단서)
  for (let i = 0; i < 3; i++) { const fx = ox + (60 + i * 50) * s, fy = oy + 136 * s; o += line([[fx, fy], [fx, fy - 14 * s]], { sw: 1.4 * Math.min(s, 2), color: C.leaf2 }) + dot(fx, fy - 16 * s, 5 * s, pick([C.rose, C.lemon2, C.mint])); }
  const out = big ? `<g transform="rotate(180 800 450)">${o}</g>` : o;
  put(big ? 'zoom/frame_upside.svg' : 'props/frame.svg', w, h, out, { id: 932, displace: big ? 3 : 1.6 });
  if (big) put('zoom/frame.svg', w, h, o, { id: 932, displace: 3 });
}
function note() {
  seed(933);
  let o = part([[4, 6], [64, 2], [68, 72], [6, 76]], '#fff8e6', { sw: 1.6 });
  for (let y = 20; y < 64; y += 9) o += line([[14, y], [14 + rand(30, 44), y]], { sw: 1.4, op: 0.6 });
  o += dot(36, 8, 5, C.cherry);
  put('props/note.svg', 72, 84, o, { id: 933 });
}
function keyGlint(under) {
  seed(934);
  let o = '';
  if (under) o += `<path d="${S([[0, 30], [120, 26], [120, 50], [0, 52]], 0.6)}" fill="#1c1430" opacity="0.5"/>`;
  o += `<g transform="rotate(${under ? -10 : 20} 60 30)">${part(ellPts(36, 30, 12, 12, 0, Math.PI * 2, 10), C.brass, { sw: 1.6 })}${part([[46, 27], [96, 27], [96, 33], [46, 33]], C.brass, { sw: 1.4 })}${part([[84, 33], [90, 33], [90, 42], [84, 42]], C.brass, { sw: 1 })}</g>`;
  o += line([[30, 8], [30, 20]], { sw: 2, color: '#fff' }) + line([[24, 14], [36, 14]], { sw: 2, color: '#fff' });
  put(`props/key_${under ? 'under' : 'sofa'}.svg`, 120, 60, o, { id: 934, displace: 1 });
}
function fruit(kind, file, size = 160) {
  seed(941);
  const s = size / 160;
  let o = '';
  if (kind === 'apple') o += part([[80, 40], [112, 34], [134, 62], [130, 108], [104, 134], [80, 128], [56, 134], [30, 108], [26, 62], [48, 34]], '#d84a3a', { heavy: [4, 7], shade: [[90, 30], [140, 30], [140, 140], [90, 140]], shadeCol: 'rgba(90,0,0,0.22)', light: [[46, 56], [64, 46], [56, 74], [44, 76]] }) + line([[80, 40], [84, 18]], { sw: 3, color: C.woodD }) + leaf(84, 24, 30, -0.4, C.leaf, { w: 0.5 });
  if (kind === 'banana') o += part([[24, 50], [40, 40], [70, 96], [116, 120], [140, 112], [146, 124], [118, 140], [68, 128], [34, 88]], '#f0d64a', { heavy: [5, 8], shade: [[40, 90], [150, 110], [150, 150], [40, 140]], shadeCol: 'rgba(140,100,0,0.22)', hatch: false }) + part([[18, 46], [30, 36], [40, 42], [28, 54]], '#6a5a2a', { sw: 1.2 }) + line([[44, 60], [80, 108], [124, 128]], { sw: 1.2, op: 0.5 });
  if (kind === 'tomato') o += part([[80, 44], [116, 46], [138, 76], [132, 116], [104, 136], [56, 136], [28, 116], [22, 76], [44, 46]], '#e0442e', { heavy: [3, 6], shade: [[90, 40], [150, 40], [150, 140], [90, 140]], shadeCol: 'rgba(90,0,0,0.22)', light: [[44, 70], [64, 56], [58, 84]] }) + part([[80, 40], [94, 30], [92, 46], [110, 46], [94, 54], [96, 68], [80, 56], [64, 68], [66, 54], [50, 46], [68, 46], [66, 30]], C.leaf2, { sw: 1.4 });
  put(file, size, size, s === 1 ? o : `<g transform="scale(${s})">${o}</g>`, { id: 941, displace: 1.2 });
}
function safe(open) {
  seed(951);
  const w = 260, h = 240;
  let o = part(rectPts(6, 6, 248, 228), C.grey, { sw: 2.6, heavy: [1, 2], shade: [[170, 0], [260, 0], [260, 240], [170, 240]], shadeCol: 'rgba(0,0,0,0.2)' });
  for (const [x, y] of [[20, 20], [240, 20], [20, 220], [240, 220]]) o += dot(x, y, 4, '#6a6870');
  if (open) {
    o += part(rectPts(30, 30, 200, 180), '#2a2830', { sw: 2 });
    o += part([[230, 30], [256, 20], [256, 220], [230, 210]], '#8a8890', { sw: 2 });
  } else {
    o += part(ellPts(130, 120, 86, 86, 0, Math.PI * 2, 24), '#8a8890', { sw: 2.4, heavy: [2, 8] });
    o += part(ellPts(130, 120, 40, 40, 0, Math.PI * 2, 18), C.brass, { sw: 2 });
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; o += line([[130 + Math.cos(a) * 32, 120 + Math.sin(a) * 32], [130 + Math.cos(a) * 40, 120 + Math.sin(a) * 40]], { sw: 1.4 }); }
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 - 0.3; o += line([[130, 120], [130 + Math.cos(a) * 70, 120 + Math.sin(a) * 70]], { sw: 5, color: '#5a5860' }) + dot(130 + Math.cos(a) * 70, 120 + Math.sin(a) * 70, 7, '#5a5860'); }
  }
  put(`props/safe_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: 951 });
}
function lever(state) {
  // nohandle | up | down
  seed(961);
  const w = 220, h = 340;
  let o = part(rectPts(40, 40, 140, 260), C.brass, { sw: 2.4, heavy: [1, 2], shade: [[130, 36], [184, 36], [184, 304], [130, 304]], shadeCol: 'rgba(90,60,10,0.25)' });
  for (const [x, y] of [[54, 54], [166, 54], [54, 286], [166, 286]]) o += dot(x, y, 5, C.brass2);
  o += part(rectPts(98, 70, 24, 200), '#3a2a1e', { sw: 1.6 });
  // 위·아래 화살표 그림 (뒤집기 표시)
  o += line(ellPts(110, 170, 52, 52, -2.6, -0.5, 12), { sw: 4, color: C.cherry, step: 999 }) + line(ellPts(110, 170, 52, 52, 0.55, 2.6, 12), { sw: 4, color: C.cherry, step: 999 });
  o += `<path d="M150 116 L166 128 L146 134Z" fill="${C.cherry}" stroke="${INK}" stroke-width="1"/><path d="M70 224 L54 212 L74 206Z" fill="${C.cherry}" stroke="${INK}" stroke-width="1"/>`;
  if (state !== 'nohandle') {
    const y = state === 'up' ? 90 : 250;
    o += part(ellPts(110, y, 16, 16, 0, Math.PI * 2, 12), '#5a5860', { sw: 1.6 });
    o += part([[104, y], [116, y], [180, y + (state === 'up' ? -40 : 40)], [168, y + (state === 'up' ? -48 : 48)]], '#6a6870', { sw: 1.8 });
    o += part(ellPts(178, y + (state === 'up' ? -48 : 48), 18, 18, 0, Math.PI * 2, 12), C.cherry, { sw: 1.8 }) + dot(172, y + (state === 'up' ? -54 : 42), 4, '#fff', 0.7);
  } else o += dot(110, 90, 8, '#2a2a30');
  put(`props/lever_${state}.svg`, w, h, o, { id: 961, vb: '0 -20 220 360' });
}

/* ───────────── 확대 화면 ───────────── */
function zoomSafe(open) {
  seed(971);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.sky);
  for (let y = 100; y < H; y += 140) for (let x = 120 + ((y / 140) % 2) * 120; x < W; x += 240) o += cloud(x, y, 1.1, C.cloud, 0.6);
  o += part(rectPts(300, 120, 1000, 680), C.grey, { sw: 4, heavy: [1, 2], shade: [[1000, 110], [1310, 110], [1310, 810], [1000, 810]], shadeCol: 'rgba(0,0,0,0.2)' });
  if (open) {
    o += part(rectPts(380, 190, 840, 540), '#2a2830', { sw: 3 }) + part(rectPts(420, 520, 760, 16), '#5a5860', { sw: 1.6 });
    o += hatch(rect(380, 190, 840, 80), 0.4);
  } else {
    o += part(rectPts(560, 300, 480, 300), C.brass, { sw: 4, heavy: [1, 2] });
    for (let i = 0; i < 3; i++) { const x = 610 + i * 140; o += part(rectPts(x, 360, 100, 160), '#2b2119', { sw: 3 }) + part(rectPts(x + 6, 366, 88, 148), C.cream, { sw: 1.6 }) + hatch(rect(x + 6, 366, 88, 30), 0.5) + hatch(rect(x + 6, 484, 88, 30), 0.5); }
    // 금고 문 장식: 작은 토마토 그림
    o += part(ellPts(800, 560, 16, 14, 0, Math.PI * 2, 12), '#e0442e', { sw: 1.4 }) + part([[800, 546], [808, 540], [806, 550], [814, 552], [800, 554], [786, 552], [794, 550], [792, 540]], C.leaf2, { sw: 1 });
  }
  put(`zoom/safe${open ? '_open' : ''}.svg`, W, H, o, { id: 971, displace: 3 });
}

/* ───────────── 아이템 ───────────── */
function items() {
  fruit('tomato', 'items/tomato.svg'); fruit('apple', 'items/apple.svg'); fruit('banana', 'items/banana.svg');
  fruit('apple', 'props/apple.svg', 90); fruit('banana', 'props/banana.svg', 90);
  seed(981);
  put('items/handle.svg', 160, 160, `<g transform="rotate(-30 80 80)">${part([[70, 40], [90, 40], [92, 140], [68, 140]], '#6a6870', { sw: 2, heavy: [1, 2] })}${part(ellPts(80, 36, 22, 22, 0, Math.PI * 2, 12), C.cherry, { sw: 2 })}${part(ellPts(80, 140, 12, 12, 0, Math.PI * 2, 10), '#5a5860', { sw: 1.6 })}${dot(74, 30, 5, '#fff', 0.7)}</g>`, { id: 981, displace: 1.2 });
  seed(982);
  put('items/umbrella.svg', 160, 160, `<g transform="rotate(-35 80 80)">${line([[80, 30], [80, 140]], { sw: 4, color: C.woodD })}${line(ellPts(92, 140, 12, 12, 0, Math.PI, 8), { sw: 4, color: C.woodD, step: 999 })}${part([[66, 120], [76, 28], [80, 20], [86, 28], [96, 120]], C.ink2, { sw: 1.8, heavy: [3, 4] })}${line([[80, 26], [80, 118]], { sw: 1, op: 0.5 })}</g>`, { id: 982, displace: 1.2 });
  seed(983);
  put('items/key.svg', 160, 160, `<g transform="rotate(-35 80 80)">${part(ellPts(80, 44, 24, 24, 0, Math.PI * 2, 14), C.brass, { sw: 2.2 })}${part(ellPts(80, 44, 10, 10, 0, Math.PI * 2, 10), C.cherry, { sw: 1.4 })}${part([[74, 66], [86, 66], [86, 144], [74, 144]], C.brass, { sw: 2 })}${part([[86, 118], [104, 118], [104, 128], [86, 128]], C.brass, { sw: 1.4 })}${part([[86, 134], [98, 134], [98, 142], [86, 142]], C.brass, { sw: 1.2 })}</g>`, { id: 983, displace: 1.2 });
}

bgNorth(); bgEast(); bgSouth(); bgWest();
door(false); door(true); umbrellaStand(true); umbrellaStand(false); bat('hang'); bat('dizzy');
sofa(); frame(false); frame(true); note(); keyGlint(false); keyGlint(true);
safe(false); safe(true); lever('nohandle'); lever('up'); lever('down');
zoomSafe(false); zoomSafe(true);
items();
console.log('upside assets written, ~' + Math.round(total / 1024) + 'KB');
