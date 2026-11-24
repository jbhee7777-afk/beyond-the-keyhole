// 1장 「햇살이 멈춘 온실」 그래픽 에셋 생성기
// node tools/art/greenhouse.mjs  → assets/rooms/greenhouse/** 에 SVG를 다시 그린다.
import { snailArt, part, S, O } from './chars.mjs';
import { seed, rand, pick, INK, wob, rect, rectPts, ell, ellPts, rot, shape, fill, line, hatch, leaf, vine, svg } from './ink.mjs';

const OUT = new URL('../../assets/rooms/greenhouse/', import.meta.url).pathname;
const C = {
  iron: '#2f4a3a', iron2: '#46664f', glass: '#dcebd8',
  tc: '#c26a42', tc2: '#a95833', tc3: '#d98d5f', brick: '#b65e3b', brick2: '#9e4f31', mortar: '#d9c3a0',
  wood: '#a87447', wood2: '#87582f', wood3: '#c99662', woodD: '#5e3d22',
  brass: '#d4a649', brass2: '#9d7428', brassL: '#f0cf7c',
  leaf: '#6f9a4f', leaf2: '#4f7c3a', leaf3: '#94b866', leafD: '#3d5f2c',
  sun: '#f3bf30', sun2: '#e59d1d', seed: '#5a3518', seed2: '#7a4a22',
  paper: '#f2e7ca', paper2: '#e3d3ab', red: '#c44a39', red2: '#9b3529', cream: '#f7eed6',
  soil: '#5c3d28', soil2: '#47301f', water: '#3f5f68', water2: '#5f8790', silver: '#cfd8d6', silver2: '#8fa3a3', blue: '#5c7fa3',
};
const W = 1600, H = 900;
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };

/* ───────────── 공통 조각 ───────────── */
function pot(x, y, w, h, { color = C.tc, soil = true, rim = true } = {}) {
  // x,y = 화분 윗면 왼쪽. 윗지름 w, 높이 h
  const b = w * 0.16;
  let o = '';
  o += fill(ell(x + w / 2, y + h + 4, w * 0.5, 9), INK, 0.18);
  o += shape(wob([[x + 4, y + 16], [x + w - 4, y + 16], [x + w - b, y + h], [x + b, y + h]], { step: 24 }), color);
  o += hatch(wob([[x + w * 0.62, y + 18], [x + w - 6, y + 18], [x + w - b, y + h - 2], [x + w * 0.66, y + h - 2]]), 0.35);
  if (rim) {
    o += shape(rect(x - 3, y, w + 6, 20), C.tc3);
    o += hatch(rect(x + w * 0.65, y + 2, w * 0.33, 16), 0.3);
  }
  if (soil) o += shape(ell(x + w / 2, y + 3, w / 2 - 4, 6), C.soil, { sw: 1.4 });
  return o;
}
function seedsDisk(r, n = 70, col = C.seed) {
  let o = '';
  for (let k = 1; k < n; k++) {
    const a = k * 2.39996, rr = r * Math.sqrt(k / n);
    o += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${(1.4 + r / 40).toFixed(1)}" fill="${col}"/>`;
  }
  return o;
}
function sunHead(cx, cy, r, { tilt = 0, sq = 1, wilt = false } = {}) {
  const p1 = wilt ? '#c9a23e' : C.sun, p2 = wilt ? '#ab8433' : C.sun2;
  let g = '';
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand(-0.06, 0.06);
    const L = r * rand(0.72, 0.92) * (wilt ? 0.82 : 1);
    g += leaf(Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.48, L, a + (wilt ? 0.35 * Math.cos(a) : 0), i % 2 ? p1 : p2, { w: 0.4, vein: false });
  }
  g += shape(ell(0, 0, r * 0.56, r * 0.56), wilt ? '#4b2f19' : C.seed);
  g += seedsDisk(r * 0.5, 80, wilt ? '#2f1d10' : '#3a2210');
  g += fill(ell(-r * 0.15, -r * 0.18, r * 0.2, r * 0.14), '#fff', wilt ? 0.04 : 0.12);
  return `<g transform="translate(${cx} ${cy}) rotate(${tilt}) scale(1 ${sq})">${g}</g>`;
}
function stem(pts, sw = 9) {
  return line(pts, { sw: sw + 3, color: INK, step: 20 }) + line(pts, { sw, color: C.leaf2, step: 20 });
}
function fern(x, y, size, { lean = 0 } = {}) {
  let o = '';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.33 + lean;
    o += leaf(x, y, size * rand(0.7, 1.05), a, pick([C.leaf, C.leaf2, C.leaf3]), { w: 0.28 });
  }
  return o;
}
function digitPts(d) {
  return {
    2: [[8, 22], [20, 8], [38, 6], [50, 18], [48, 34], [10, 82], [54, 82]],
    3: [[8, 14], [28, 6], [48, 14], [48, 32], [26, 44], [50, 54], [52, 72], [34, 84], [8, 78]],
    5: [[50, 8], [14, 8], [10, 40], [30, 34], [48, 44], [52, 64], [38, 82], [10, 80]],
  }[d];
}
function digits(str, x, y, s, color, sw) {
  let o = '';
  [...str].forEach((d, i) => {
    const pts = digitPts(d).map(([px, py]) => [x + i * 70 * s + px * s, y + py * s]);
    o += line(pts, { sw: sw + 3, color: INK, op: 0.9, step: 14, amp: 0.6 }) + line(pts, { sw, color, step: 14, amp: 0.6 });
  });
  return o;
}
function sparkle(x, y, r, col = '#fff8dc') {
  return line([[x - r, y], [x + r, y]], { sw: 2.4, color: col }) + line([[x, y - r], [x, y + r]], { sw: 2.4, color: col }) +
    line([[x - r * 0.5, y - r * 0.5], [x + r * 0.5, y + r * 0.5]], { sw: 1.4, color: col }) + line([[x + r * 0.5, y - r * 0.5], [x - r * 0.5, y + r * 0.5]], { sw: 1.4, color: col });
}

/* ───────────── 하늘(유리 너머) ───────────── */
function sky(day) {
  seed(day ? 41 : 42);
  const top = day ? '#f8d98e' : '#5f6f86', bot = day ? '#fdf1cc' : '#aab0ad';
  let o = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#sk)"/>`;
  // 멈춘 해: 낮이면 밝게, 아니면 구름 뒤 희미한 원
  o += `<circle cx="1180" cy="${day ? 150 : 330}" r="${day ? 90 : 70}" fill="${day ? '#fff6c8' : '#cfcab8'}" opacity="${day ? 0.95 : 0.55}" filter="url(#blur)"/>`;
  for (let i = 0; i < 9; i++) {
    const cx = rand(0, W), cy = rand(60, 330), rx = rand(90, 200);
    o += fill(ell(cx, cy, rx, rx * 0.32), day ? '#fffaf0' : '#8a93a0', day ? 0.7 : 0.6);
  }
  // 바깥 정원: 먼 언덕 → 뒷줄 나무(흐릿) → 앞줄 나무 → 산울타리
  o += fill(wob([[0, 470], [300, 430], [700, 458], [1100, 418], [1600, 452], [1600, 900], [0, 900]], { step: 80, amp: 6 }), day ? '#c3d69a' : '#7b878c');
  for (let i = 0; i < 24; i++) {
    const cx = i * 70 + rand(-20, 20), r = rand(36, 62);
    o += fill(ell(cx, 478 - r * 0.3, r, r * 0.72), day ? pick(['#a9c47f', '#9ebb76']) : pick(['#6f7c82', '#68757b']), 0.95);
  }
  for (let i = 0; i < 15; i++) {
    const cx = i * 112 + rand(-30, 30), r = rand(52, 82), cy = 500 - r * 0.55;
    o += fill(rect(cx - 5, cy + r * 0.4, 10, r * 0.7), day ? '#6d5536' : '#4c5358');
    o += fill(ell(cx, cy, r, r * 0.78), day ? pick(['#7fa55a', '#6b934c', '#86ad5d']) : pick(['#58666d', '#515f66', '#5f6c72']));
    o += fill(ell(cx - r * 0.42, cy + r * 0.18, r * 0.55, r * 0.45), day ? '#759c50' : '#4e5b61');
    o += fill(ell(cx - r * 0.25, cy - r * 0.3, r * 0.42, r * 0.26), day ? '#a7c97a' : '#6c787e', 0.7);
  }
  o += fill(rect(0, 505, W, 400, { amp: 0 }), day ? '#93b765' : '#626f74');
  for (let x = 0; x < W; x += 46) o += fill(ell(x + rand(-6, 6), 506, 30, 15), day ? '#6f9a4f' : '#56636a');
  put(`bg/sky_${day ? 'day' : 'dusk'}.svg`, W, H, o, { id: day ? 3 : 4 });
}

/* ───────────── 방 껍데기(벽·바닥·천장) ───────────── */
function shell(variant) {
  let o = '';
  // 천장 유리 + 철골
  o += shape(wob([[0, 0], [W, 0], [1460, 70], [140, 70]], { sharp: true }), C.glass, { op: 0.16, sw: 2 });
  for (let i = 0; i <= 10; i++) o += line([[i * 160, -4], [140 + i * 132, 70]], { sw: 6, color: C.iron });
  // 좌우 옆벽 (원근)
  for (const side of [0, 1]) {
    const X = (u) => side ? W - 140 * u : 140 * u;
    const top = (u) => 70 * u, bot = (u) => 900 - 260 * u;
    const at = (u, v) => [X(u), top(u) + (bot(u) - top(u)) * v];
    o += shape(wob([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { sharp: true, amp: 0.5 }), C.glass, { op: 0.14, sw: 2 });
    // 아래쪽 벽돌 허리벽
    o += shape(wob([at(0, 0.78), at(1, 0.78), at(1, 1), at(0, 1)], { sharp: true, amp: 0.6 }), C.brick2);
    o += hatch(wob([at(0, 0.78), at(1, 0.78), at(1, 1), at(0, 1)], { sharp: true }), 0.4, 'hatch2');
    for (const v of [0.84, 0.9, 0.96]) o += line([at(0, v), at(1, v)], { sw: 1.2, color: C.mortar, op: 0.7 });
    for (const v of [0.28, 0.54, 0.78]) o += line([at(0, v), at(1, v)], { sw: 5, color: C.iron });
    for (const u of [0.5, 1]) o += line([at(u, 0), at(u, 0.78)], { sw: u === 1 ? 9 : 5, color: C.iron });
  }
  // 뒷벽 유리창 틀
  o += fill(rect(140, 70, 1320, 450, { amp: 0 }), C.glass, 0.12);
  for (let i = 0; i < 8; i++) {
    const x = 140 + i * 165;
    const arch = ellPts(x + 82.5, 150, 82.5, 55, Math.PI, Math.PI * 2, 16);
    o += line(arch, { sw: 5, color: C.iron, step: 999 });
    o += line([[x + 55, 120], [x + 55, 520]], { sw: 2.4, color: C.iron2 });
    o += line([[x + 110, 120], [x + 110, 520]], { sw: 2.4, color: C.iron2 });
    o += line([[x, 240], [x + 165, 240]], { sw: 2, color: C.iron2 });
    o += line([[x, 430], [x + 165, 430]], { sw: 2, color: C.iron2 });
    // 유리 칸마다 살짝 다른 빛깔 (오래된 손유리 느낌)
    for (let c = 0; c < 3; c++) for (const [y0, y1] of [[100, 240], [240, 330], [330, 430], [430, 512]]) {
      const tint = rand() < 0.12 ? '#f3e6b0' : pick(['#eef6ea', '#d7e8d2', '#e4efe0']);
      o += fill(rect(x + c * 55 + 2, y0 + 2, 51, y1 - y0 - 4, { amp: 0.4 }), tint, rand(0.05, 0.22));
    }
    // 유리 반사: 긴 사선 두 줄
    const ry = rand(250, 380);
    o += line([[x + 14, ry + 70], [x + 92, ry - 20]], { sw: 3, color: '#ffffff', op: 0.38 });
    o += line([[x + 30, ry + 82], [x + 84, ry + 20]], { sw: 1.6, color: '#ffffff', op: 0.3 });
    // 아래쪽 김 서린 물방울
    for (let k = 0; k < 5; k++) { const dx = x + rand(8, 158), dy = rand(470, 510); o += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${rand(1.4, 3).toFixed(1)}" fill="#ffffff" opacity="0.45"/>`; }
    if (rand() < 0.25) { const dx = x + rand(20, 140); o += line([[dx, 440], [dx + 1, 470], [dx, 505]], { sw: 1.4, color: '#ffffff', op: 0.4 }); }
  }
  for (let i = 0; i <= 8; i++) o += line([[140 + i * 165, 70], [140 + i * 165, 520]], { sw: 9, color: C.iron });
  o += line([[140, 330], [1460, 330]], { sw: 6, color: C.iron });
  o += line([[140, 72], [1460, 72]], { sw: 8, color: C.iron });
  // 화단 턱(나무)과 벽돌 허리벽
  o += shape(rect(140, 526, 1320, 114, { amp: 0.4, sharp: true }), C.brick);
  for (let r = 0; r < 5; r++) {
    const y = 532 + r * 22;
    o += line([[142, y + 21], [1458, y + 21]], { sw: 1.4, color: C.mortar, op: 0.8 });
    for (let x = 140 + (r % 2) * 30; x < 1460; x += 60) {
      o += line([[x, y], [x, y + 21]], { sw: 1.2, color: C.mortar, op: 0.8 });
      if (rand() < 0.18) o += fill(rect(x + 3, y + 3, 54, 15, { amp: 0.5 }), pick([C.brick2, '#c76e47']), 0.8);
    }
  }
  o += hatch(rect(140, 600, 1320, 40, { sharp: true }), 0.35);
  o += shape(rect(130, 510, 1340, 18, { sharp: true, amp: 0.6 }), C.wood);
  o += line([[134, 524], [1466, 524]], { sw: 1.2, op: 0.5 });
  // 바닥 테라코타 타일 (원근)
  const rows = [640, 668, 704, 750, 810, 900];
  const N = 12;
  for (let r = 0; r < rows.length - 1; r++) {
    for (let i = 0; i < N; i++) {
      const xAt = (y, k) => { const t = (y - 640) / 260; const xb = 140 + k * 1320 / N, xf = -60 + k * 1720 / N; return xb + (xf - xb) * t; };
      const y0 = rows[r], y1 = rows[r + 1];
      const q = [[xAt(y0, i), y0], [xAt(y0, i + 1), y0], [xAt(y1, i + 1), y1], [xAt(y1, i), y1]];
      o += shape(wob(q, { sharp: true, amp: 0.8, step: 40 }), (r + i) % 2 ? C.tc : pick([C.tc2, C.tc3, C.tc2]), { sw: 1.6 });
      if (rand() < 0.25) o += line([[q[0][0] + 10, q[0][1] + 6], [q[0][0] + 28, q[0][1] + 10]], { sw: 1, op: 0.5 });
    }
  }
  o += hatch(wob([[140, 640], [1460, 640], [1460, 660], [140, 660]], { sharp: true }), 0.5);
  o += hatch(wob([[0, 900], [140, 640], [230, 640], [120, 900]], { sharp: true }), 0.35);
  o += hatch(wob([[1600, 900], [1460, 640], [1370, 640], [1480, 900]], { sharp: true }), 0.35);
  return o;
}
function hanging(xs) {
  let o = '';
  xs.forEach(([x, len, dir]) => { o += vine(x, 66, len, { sway: 26, dir }); });
  return o;
}
function bedPlants(ranges) {
  let o = '';
  ranges.forEach(([a, b]) => {
    for (let x = a; x < b; x += rand(36, 60)) o += fern(x, 512, rand(40, 70), { lean: rand(-0.2, 0.2) });
  });
  return o;
}

function bgNorth() {
  seed(11);
  let o = shell();
  o += bedPlants([[160, 220], [560, 650], [950, 990], [1230, 1440]]);
  // 문틀 오목한 공간
  const arch = [[660, 640], [660, 330], ...ellPts(800, 330, 140, 120, Math.PI, Math.PI * 2, 18).slice(1, -1), [940, 330], [940, 640]];
  o += shape(wob(arch, { step: 40 }), C.woodD, { sw: 3 });
  o += fill(wob([[676, 640], [676, 336], ...ellPts(800, 336, 124, 104, Math.PI, Math.PI * 2, 18).slice(1, -1), [924, 336], [924, 640]]), '#2a211b');
  // 문 위 황동 해 장식
  // 문 위 황동 해 장식: 굽이치는 햇살 16개 + 웃는 얼굴
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8, L = i % 2 ? 50 : 64, sw2 = i % 2 ? 0.12 : 0.15;
    const p0 = [800 + Math.cos(a - sw2) * 28, 186 + Math.sin(a - sw2) * 28], p2 = [800 + Math.cos(a + sw2) * 28, 186 + Math.sin(a + sw2) * 28];
    const mid = [800 + Math.cos(a + 0.08) * (L * 0.62), 186 + Math.sin(a + 0.08) * (L * 0.62)], tip = [800 + Math.cos(a) * L, 186 + Math.sin(a) * L];
    o += part([p0, mid, tip, p2], i % 2 ? C.brass2 : C.brass, { sw: 1.6 });
  }
  o += part(ellPts(800, 186, 32, 32, 0, Math.PI * 2, 14), C.brassL, { heavy: [2, 6], shade: [[800, 186], [840, 186], [840, 230], [790, 230]], shadeCol: 'rgba(120,80,20,0.25)' });
  o += line([[786, 182], [791, 178], [796, 182]], { sw: 2 }) + line([[804, 182], [809, 178], [814, 182]], { sw: 2 }) + line([[790, 196], [800, 202], [810, 196]], { sw: 2 });
  o += `<circle cx="784" cy="194" r="4" fill="#e59a6a" opacity="0.6"/><circle cx="816" cy="194" r="4" fill="#e59a6a" opacity="0.6"/>`;
  o += hanging([[260, 160, 1], [430, 110, -1], [1120, 140, 1], [1380, 190, -1]]);
  put('bg/north.svg', W, H, o, { id: 11 });
}
function bgEast() {
  seed(12);
  let o = shell();
  o += bedPlants([[160, 250], [1350, 1440]]);
  // 작업대 뒤 판자벽
  o += shape(rect(250, 150, 1100, 370, { sharp: true, amp: 0.8 }), C.wood3);
  for (let x = 250; x < 1350; x += 92) o += line([[x, 152], [x, 518]], { sw: 1.6, op: 0.65 });
  for (let x = 250; x < 1350; x += 92) for (let y = 175; y < 510; y += 130) o += `<circle cx="${x + 46 + rand(-30, 30)}" cy="${y + rand(0, 80)}" r="2.2" fill="${INK}" opacity="0.4"/>`;
  o += hatch(rect(250, 150, 1100, 40, { sharp: true }), 0.35);
  o += line([[250, 150], [1350, 150]], { sw: 5, color: C.woodD });
  // 못에 걸린 모종삽: 구멍 뚫린 나무 손잡이 + 쇠고리 + 가운데 등줄기가 선 날
  o += `<circle cx="1220" cy="190" r="3.4" fill="${INK}"/>`;
  o += part([[1211, 186], [1229, 186], [1232, 232], [1226, 250], [1214, 250], [1208, 232]], C.wood3, { heavy: [2, 3], shade: [[1222, 180], [1240, 180], [1240, 254], [1222, 254]], shadeCol: 'rgba(90,50,20,0.22)', hatch: false });
  o += `<circle cx="1220" cy="198" r="4" fill="#3a2618"/>`;
  o += part([[1209, 248], [1231, 248], [1233, 262], [1207, 262]], C.silver2, { sw: 1.6 });
  o += part([[1203, 262], [1237, 262], [1244, 298], [1236, 326], [1220, 348], [1204, 326], [1196, 298]], C.silver, { heavy: [2, 4], shade: [[1220, 258], [1252, 258], [1252, 352], [1220, 352]], shadeCol: 'rgba(40,60,60,0.25)' });
  o += line([[1220, 266], [1220, 338]], { sw: 1.2, op: 0.5 }) + line([[1206, 272], [1212, 300]], { sw: 2, color: '#fff', op: 0.6 });
  // 손목 고리로 걸린 원예 장갑 (손가락이 아래로)
  o += line([[1292, 188], [1286, 200], [1298, 204]], { sw: 1.6 }) + `<circle cx="1292" cy="188" r="3.4" fill="${INK}"/>`;
  o += part([[1268, 202], [1312, 200], [1314, 232], [1268, 234]], '#b9844c', { sw: 2, heavy: [1, 2] });
  for (let x = 1274; x < 1310; x += 7) o += line([[x, 204], [x, 230]], { sw: 1, op: 0.35 });
  o += part([[1270, 232], [1312, 232], [1318, 262], [1322, 298], [1316, 306], [1311, 288], [1308, 314], [1300, 316], [1297, 292], [1293, 320], [1285, 320], [1283, 294], [1278, 312], [1270, 310], [1270, 282], [1258, 272], [1252, 256], [1260, 250], [1270, 258]], '#e0aa63', { heavy: [2, 8], shade: [[1296, 230], [1330, 230], [1330, 330], [1296, 330]], shadeCol: 'rgba(120,70,20,0.22)' });
  o += line([[1292, 252], [1294, 272]], { sw: 1, op: 0.45 }) + line([[1278, 262], [1282, 276]], { sw: 1, op: 0.45 });
  o += `<path d="${S([[1300, 270], [1310, 266], [1312, 280], [1302, 284]], 0.3)}" fill="#8a6a3c" opacity="0.35"/>`;
  o += hanging([[200, 170, 1], [1400, 140, -1], [760, 70, 1]]);
  put('bg/east.svg', W, H, o, { id: 12 });
}
function bgSouth() {
  seed(13);
  let o = shell();
  o += bedPlants([[160, 470], [1130, 1440]]);
  // 둥근 장미창
  o += shape(ell(800, 290, 230, 230), C.iron, { sw: 3, extra: ' fill-opacity="0.95"' });
  o += fill(ell(800, 290, 212, 212), C.glass, 0.25);
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; o += line([[800 + Math.cos(a) * 60, 290 + Math.sin(a) * 60], [800 + Math.cos(a) * 214, 290 + Math.sin(a) * 214]], { sw: 4, color: C.iron }); }
  o += shape(ell(800, 290, 140, 140), 'none', { sw: 4, stroke: C.iron });
  // 온도계
  o += shape(rect(1270, 230, 34, 200, { sharp: true }), C.cream);
  o += shape(ell(1287, 410, 12, 12), C.red);
  o += line([[1287, 398], [1287, 330]], { sw: 5, color: C.red });
  for (let y = 250; y < 400; y += 18) o += line([[1274, y], [1284, y]], { sw: 1.2 });
  o += hanging([[260, 130, 1], [1380, 160, -1]]);
  put('bg/south.svg', W, H, o, { id: 13 });
}
function bgWest() {
  seed(14);
  let o = shell();
  o += bedPlants([[610, 860], [1150, 1200], [1430, 1450]]);
  // 빗물 홈통
  o += shape(rect(402, 0, 36, 400, { sharp: true, amp: 0.8 }), C.silver2);
  o += hatch(rect(420, 0, 18, 400, { sharp: true }), 0.4);
  for (const y of [90, 210, 330]) o += shape(rect(396, y, 48, 12), C.iron);
  o += shape(wob([[402, 396], [438, 396], [446, 430], [394, 430]]), C.silver2);
  // 도구 걸이판
  o += shape(rect(1200, 190, 230, 300, { sharp: true }), C.wood3);
  for (let x = 1220; x < 1420; x += 26) for (let y = 210; y < 480; y += 26) o += `<circle cx="${x}" cy="${y}" r="2.3" fill="${INK}" opacity="0.5"/>`;
  // 갈퀴
  o += line([[1250, 210], [1250, 440]], { sw: 7, color: C.wood2 });
  o += shape(rect(1226, 430, 48, 10), C.silver2);
  for (let k = 0; k < 5; k++) o += line([[1230 + k * 10, 440], [1230 + k * 10, 466]], { sw: 2.4 });
  // 전지가위
  o += shape(wob([[1320, 230], [1336, 230], [1345, 320], [1330, 330]]), C.red);
  o += shape(wob([[1360, 230], [1376, 230], [1360, 330], [1346, 322]]), C.red);
  o += shape(wob([[1330, 320], [1362, 318], [1350, 400], [1344, 400]]), C.silver);
  // 물뿌리개 그림 달력
  o += part([[1294, 396], [1416, 392], [1418, 480], [1296, 484]], C.paper, { heavy: [1, 2], sw: 1.8 });
  o += `<circle cx="1356" cy="398" r="4" fill="${C.red}" stroke="${INK}" stroke-width="1"/>`;
  for (let i = 0; i < 3; i++) {
    const x = 1312 + i * 36;
    o += part([[x, 456], [x + 24, 456], [x + 21, 474], [x + 3, 474]], C.tc, { sw: 1.2 });
    o += line([[x, 456], [x + 24, 456]], { sw: 1.6, color: C.soil });
    if (i === 0) o += `<ellipse cx="${x + 12}" cy="452" rx="4" ry="2.6" fill="${C.seed2}" stroke="${INK}" stroke-width="0.8"/>`;
    if (i >= 1) { o += line([[x + 12, 456], [x + 12, i === 1 ? 440 : 420]], { sw: 1.6, color: C.leaf2 }); o += leaf(x + 12, i === 1 ? 444 : 436, 10, -2.3, C.leaf, { w: 0.5, vein: false }) + leaf(x + 12, i === 1 ? 444 : 436, 10, -0.8, C.leaf, { w: 0.5, vein: false }); }
    if (i === 2) o += sunHead(x + 12, 416, 9, {});
    if (i < 2) o += line([[x + 27, 440], [x + 33, 440]], { sw: 1.2, op: 0.6 }) + line([[x + 30, 437], [x + 33, 440], [x + 30, 443]], { sw: 1.2, op: 0.6 });
  }
  o += hanging([[180, 120, 1], [700, 150, -1], [1100, 110, 1]]);
  put('bg/west.svg', W, H, o, { id: 14 });
}

/* ───────────── 북쪽: 문 쪽 소품 ───────────── */
function door() {
  seed(21);
  const w = 280, h = 420;
  const outline = [[14, h], [14, 120], ...ellPts(140, 120, 126, 106, Math.PI, Math.PI * 2, 18).slice(1, -1), [266, 120], [266, h]];
  let o = shape(wob(outline, { step: 40 }), C.wood, { sw: 3 });
  for (let x = 50; x < 266; x += 36) o += line([[x, 40 + Math.abs(140 - x) * 0.4], [x, h - 2]], { sw: 1.6, op: 0.7 });
  o += hatch(wob([[200, 40], [266, 120], [266, h], [210, h]]), 0.4);
  // 둥근 창
  o += shape(ell(140, 126, 58, 58), C.brass, { sw: 3 });
  o += shape(ell(140, 126, 48, 48), '#3d5257');
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += line([[140, 126], [140 + Math.cos(a) * 48, 126 + Math.sin(a) * 48]], { sw: 3, color: C.brass2 }); }
  o += shape(ell(140, 126, 12, 12), C.brass);
  o += line([[110, 104], [126, 92]], { sw: 2, color: '#fff', op: 0.5 });
  // 철 경첩
  for (const y of [190, 340]) {
    o += shape(wob([[14, y - 9], [140, y - 6], [150, y], [140, y + 6], [14, y + 9]]), C.iron);
    for (const x of [34, 70, 106]) o += `<circle cx="${x}" cy="${y}" r="3" fill="${C.brassL}" stroke="${INK}" stroke-width="1"/>`;
  }
  // 해바라기 자물쇠판
  o += shape(rect(204, 232, 46, 98), C.brass);
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; o += leaf(227 + Math.cos(a) * 6, 266 + Math.sin(a) * 6, 13, a, C.sun2, { w: 0.5, vein: false }); }
  o += shape(ell(227, 266, 7, 7), C.seed);
  o += shape(wob([[224, 264], [230, 264], [232, 282], [222, 282]]), INK, { sw: 1 });
  o += shape(ell(227, 306, 11, 11), 'none', { sw: 3.4, stroke: C.brass2 });
  put('props/door_closed.svg', w, h, o, { id: 21 });

  seed(22);
  let p = '';
  const inner = [[14, h], [14, 120], ...ellPts(140, 120, 126, 106, Math.PI, Math.PI * 2, 18).slice(1, -1), [266, 120], [266, h]];
  p += shape(wob(inner, { step: 40 }), '#fff3c4', { sw: 3 });
  p += fill(wob([[14, 300], [90, 270], [180, 285], [266, 260], [266, h], [14, h]]), '#a9c96f');
  p += fill(wob([[14, 340], [120, 320], [266, 330], [266, h], [14, h]]), '#8db35a');
  p += fill(wob([[120, h], [140, 300], [160, 300], [190, h]]), '#e9d39a');
  for (let i = 0; i < 9; i++) p += sunHead(rand(30, 250), rand(300, 360), rand(9, 14), {});
  p += `<circle cx="160" cy="110" r="70" fill="#fffbe6" opacity="0.9" filter="url(#blur)"/>`;
  // 열린 문짝
  p += shape(wob([[14, 60], [54, 30], [54, h + 10], [14, h]]), C.wood2, { sw: 3 });
  p += hatch(wob([[14, 60], [54, 30], [54, h + 10], [14, h]]), 0.5);
  put('props/door_open.svg', w, h, p, { id: 22 });
}
function note(file, idn, tint = C.paper) {
  seed(idn);
  let o = fill(rect(8, 10, 62, 72), INK, 0.2);
  o += shape(wob([[4, 6], [64, 2], [68, 72], [6, 76]]), tint);
  for (let y = 22; y < 66; y += 9) o += line([[14, y], [14 + rand(30, 44), y + rand(-1, 1)]], { sw: 1.5, op: 0.6 });
  o += shape(ell(36, 8, 6, 6), C.red);
  put(file, 72, 84, o, { id: idn });
}
function sunflowers(up) {
  seed(up ? 31 : 32);
  const w = 380, h = 390;
  let o = fill(ell(190, 384, 180, 10), INK, 0.2);
  const heads = up
    ? [[70, 70, 46, -8], [190, 40, 52, 4], [310, 82, 44, 10]]
    : [[64, 190, 40, 150], [196, 170, 46, 200], [318, 200, 38, 160]];
  heads.forEach(([hx, hy, r, t], i) => {
    const base = [70 + i * 120, 300];
    const top = up ? [hx, hy + r * 0.4] : [hx + (i - 1) * 6, hy - r * 0.5];
    const mid = up ? [base[0] + (hx - base[0]) * 0.5 + 8, (base[1] + hy) / 2] : [base[0] + (i - 1) * 14, 110];
    o += stem([base, mid, top], 8);
    for (const yy of [250, 200]) {
      o += leaf(base[0] + 2, yy, 54, up ? -0.5 : 0.6, C.leaf2, { w: 0.45 });
      o += leaf(base[0] - 2, yy - 24, 50, up ? Math.PI + 0.5 : Math.PI - 0.6, C.leaf, { w: 0.45 });
    }
    o += up ? sunHead(hx, hy, r, { tilt: t }) : sunHead(hx, hy, r, { tilt: t, sq: 0.42, wilt: true });
  });
  // 나무 화단 상자
  o += shape(rect(10, 296, 360, 90, { sharp: true }), C.wood2, { sw: 2.6 });
  o += shape(rect(4, 288, 372, 20, { sharp: true }), C.wood);
  for (let x = 40; x < 370; x += 60) o += line([[x, 310], [x, 384]], { sw: 1.4, op: 0.6 });
  o += hatch(rect(240, 310, 128, 74, { sharp: true }), 0.4);
  put(`props/sunflowers_${up ? 'up' : 'droop'}.svg`, w, 450, o, { id: up ? 31 : 32, vb: '0 -60 380 450' });
}
function bigPot(state) {
  // state: empty | seeded
  seed(41);
  const w = 230, h = 200;
  let o = pot(20, 34, 190, 150, { color: C.tc });
  // 화분 띠 무늬
  o += line([[42, 92], [188, 92]], { sw: 3, color: C.tc2 });
  for (let x = 54; x < 180; x += 22) o += shape(ell(x, 106, 5, 5), C.tc3, { sw: 1.2 });
  if (state === 'seeded') {
    o += shape(ell(115, 34, 26, 8), C.soil2, { sw: 1.4 });
    o += line([[150, 38], [152, -2]], { sw: 3, color: C.wood2 });
    o += shape(rect(134, -14, 40, 22), C.paper, { sw: 1.6 });
    o += `<circle cx="154" cy="-3" r="6" fill="${C.sun}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  if (state === 'wet') {
    o += shape(ell(115, 37, 82, 8), '#3a2618', { sw: 1.4 });
    o += shape(ell(115, 34, 26, 8), '#33210f', { sw: 1.4 });
    o += line([[150, 38], [152, -2]], { sw: 3, color: C.wood2 });
    o += shape(rect(134, -14, 40, 22), C.paper, { sw: 1.6 });
    o += `<circle cx="154" cy="-3" r="6" fill="${C.sun}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  put(`props/bigpot_${state}.svg`, w, h, o, { id: 41, vb: '0 -20 230 220' });
}
function giantFlower(withKey) {
  seed(42);
  const cx = 180, cy = 222, r = 90;
  let o = '';
  o += stem([[180, 560], [172, 460], [188, 350], [180, cy + 40]], 14);
  o += leaf(176, 480, 112, -0.42, C.leaf2, { w: 0.5 });
  o += leaf(182, 430, 104, Math.PI + 0.45, C.leaf, { w: 0.5 });
  o += leaf(184, 360, 88, -0.72, C.leaf, { w: 0.5 });
  o += leaf(180, 320, 78, Math.PI + 0.8, C.leaf2, { w: 0.5 });
  // 꽃 뒤 초록 꽃받침
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.13; o += leaf(cx + Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.4, r * 0.9, a, C.leaf2, { w: 0.3, vein: false }); }
  o += sunHead(cx, cy, r, {});
  if (withKey) {
    o += `<g transform="translate(${cx} ${cy}) rotate(-20) scale(0.78)">${shape(ell(0, -22, 20, 20), C.brass, { sw: 2.6 })}${shape(ell(0, -22, 8, 8), C.seed)}${shape(rect(-5, -4, 10, 52), C.brass, { sw: 2.4 })}${shape(rect(5, 30, 14, 8), C.brass)}${shape(rect(5, 42, 10, 6), C.brass)}</g>`;
    o += sparkle(cx + 40, cy - 40, 13);
  }
  o += pot(85, 560, 190, 150, { color: C.tc });
  put(`props/giantflower${withKey ? '_key' : ''}.svg`, w(), 720, o, { id: 42, vb: '0 0 360 720' });
  function w() { return 360; }
}
function basket(full) {
  seed(51);
  const w = 170, h = 130;
  let o = fill(ell(85, 124, 80, 8), INK, 0.2);
  if (full) {
    o += line([[70, 50], [150, -10]], { sw: 4, color: C.wood3 });
    o += line([[60, 46], [124, -18]], { sw: 4, color: C.wood3 });
    o += `<circle cx="150" cy="-10" r="5" fill="${C.wood2}"/><circle cx="124" cy="-18" r="5" fill="${C.wood2}"/>`;
    o += shape(ell(86, 46, 40, 36), C.red);
    for (let i = 0; i < 6; i++) o += line(ellPts(86, 46, 40 - i * 2, 12 + i * 4, Math.PI * 0.1 + i * 0.3, Math.PI * 0.9 + i * 0.3, 10), { sw: 1.4, color: C.red2 });
    o += line([[118, 66], [150, 90], [140, 118]], { sw: 2.2, color: C.red });
  }
  o += shape(wob([[10, 52], [160, 52], [146, 124], [24, 124]]), '#c49352', { sw: 2.6 });
  for (let r = 0; r < 4; r++) for (let x = 0; x < 7; x++) o += shape(ell(26 + x * 20 + (r % 2) * 10, 66 + r * 16, 9, 6), r % 2 ? '#b07f40' : '#d2a35f', { sw: 1 });
  o += shape(rect(4, 44, 162, 14), '#a77737');
  o += hatch(wob([[110, 58], [158, 58], [146, 122], [114, 122]]), 0.35);
  put(`props/basket${full ? '' : '_empty'}.svg`, w, h, o, { id: 51, vb: '0 -30 170 160' });
}
function snail() {
  seed(61);
  put('props/snail.svg', 130, 106, snailArt(C), { id: 61, displace: 1, vb: '0 -10 130 106' });
}

/* ───────────── 동쪽: 작업대 쪽 소품 ───────────── */
function shelf() {
  seed(71);
  const w = 460, h = 110;
  let o = '';
  for (const x of [40, 400]) o += shape(wob([[x, 74], [x + 20, 74], [x + 20, 82], [x + 4, 108], [x, 108]]), C.woodD);
  o += shape(rect(0, 60, 460, 16, { sharp: true }), C.wood);
  o += hatch(rect(0, 70, 460, 6, { sharp: true }), 0.5);
  // 왼쪽 선인장 화분
  o += pot(40, 22, 70, 40, { color: C.tc3 });
  o += shape(wob([[62, 26], [60, -10], [74, -24], [88, -10], [86, 26]]), C.leaf);
  o += shape(wob([[62, 0], [48, -6], [46, -22], [54, -24], [58, -12]]), C.leaf);
  for (let y = -16; y < 24; y += 8) o += line([[70, y], [74, y - 2]], { sw: 1, op: 0.6 });
  // 오른쪽 작은 꽃 화분
  o += pot(330, 22, 76, 40, { color: C.tc });
  for (let i = 0; i < 5; i++) o += leaf(368, 24, 30, -Math.PI / 2 + (i - 2) * 0.45, C.leaf2, { w: 0.4 });
  for (const [x, y] of [[350, -6], [372, -14], [392, -2]]) o += shape(ell(x, y, 8, 8), '#e98aa0', { sw: 1.4 }) + `<circle cx="${x}" cy="${y}" r="2.6" fill="${C.sun}"/>`;
  put('props/shelf.svg', w, h, o, { id: 71, vb: '0 -40 460 150' });
}
function potMid(tilted) {
  seed(72);
  const body = pot(16, 52, 76, 58, { color: C.tc2 }) + (() => { let f = ''; for (let i = 0; i < 7; i++) f += leaf(54, 56, rand(40, 54), -Math.PI / 2 + (i - 3) * 0.38, pick([C.leaf, C.leaf3]), { w: 0.32 }); return f; })();
  const o = tilted ? `<g transform="rotate(-16 92 112) translate(-6 0)">${body}</g>` : body;
  put(`props/potmid${tilted ? '_tilt' : ''}.svg`, 110, 120, o, { id: 72 });
}
function mirrorGlint() {
  seed(73);
  let o = shape(ell(26, 30, 18, 16), C.brass) + shape(ell(26, 30, 12, 10), '#e9f1f0');
  o += line([[19, 26], [26, 21]], { sw: 2, color: '#fff' });
  o += sparkle(40, 16, 10, '#fffbe8');
  put('props/mirror_glint.svg', 56, 56, o, { id: 73 });
}
function plaque(big) {
  seed(74);
  const w = big ? 1600 : 260, h = big ? 900 : 160;
  const s = big ? 3.2 : 1;
  const ox = big ? 170 : 0, oy = big ? 180 : 0;
  let o = '';
  if (big) {
    o += fill(rect(0, 0, 1600, 900, { amp: 0 }), C.wood3);
    for (let x = 0; x < 1600; x += 180) o += line([[x, 0], [x, 900]], { sw: 3, op: 0.5 });
    o += hatch(rect(0, 0, 1600, 900), 0.12);
  }
  const P = (x, y) => [ox + x * s, oy + y * s];
  o += line([P(60, 4), P(130, -20), P(200, 4)], { sw: 2 * s * 0.7 });
  o += `<circle cx="${P(130, -20)[0]}" cy="${P(130, -20)[1]}" r="${4 * s}" fill="${C.brass}" stroke="${INK}"/>`;
  o += shape(wob(rectPts(...P(0, 0), 260 * s, 150 * s), { sharp: true, amp: 0.8 * s }), C.woodD, { sw: 2.4 * Math.min(s, 1.6) });
  o += shape(wob(rectPts(...P(14, 14), 232 * s, 122 * s), { sharp: true, amp: 0.6 * s }), '#2d4a3b');
  o += hatch(wob(rectPts(...P(14, 14), 232 * s, 122 * s)), 0.18);
  // 거울에 비춰야 읽히는 숫자 352 (좌우가 뒤집혀 있음)
  const dx = ox + 36 * s, dy = oy + 32 * s;
  o += `<g transform="translate(${dx + 190 * s * 0.98} 0) scale(-1 1) translate(${-dx} 0)">${digits('352', dx, dy, s * 0.95, C.cream, 4 * s)}</g>`;
  // 손거울 그림 단서
  const mx = ox + 226 * s, my = oy + 118 * s;
  o += shape(ell(mx, my, 9 * s, 9 * s), 'none', { sw: 1.6 * s, stroke: C.brassL });
  o += line([[mx - 5 * s, my + 7 * s], [mx - 12 * s, my + 16 * s]], { sw: 2 * s, color: C.brassL });
  o += line([[mx - 5 * s, my - 4 * s], [mx - 1 * s, my - 6 * s]], { sw: 1.2 * s, color: C.brassL });
  // 좌우 뒤집기 화살표 ↔
  const ax = ox + 180 * s, ay = oy + 120 * s;
  o += line([[ax - 16 * s, ay], [ax + 16 * s, ay]], { sw: 1.8 * s, color: C.brassL });
  o += line([[ax - 10 * s, ay - 5 * s], [ax - 16 * s, ay], [ax - 10 * s, ay + 5 * s]], { sw: 1.8 * s, color: C.brassL });
  o += line([[ax + 10 * s, ay - 5 * s], [ax + 16 * s, ay], [ax + 10 * s, ay + 5 * s]], { sw: 1.8 * s, color: C.brassL });
  put(big ? 'zoom/plaque.svg' : 'props/plaque.svg', w, h, o, { id: 74, displace: big ? 4 : 2.6, vb: big ? undefined : '0 -30 260 190' });
}
function mirrorReflect() {
  seed(75);
  // 확대 화면에서 들어 올린 손거울: 거울 속에는 바르게 읽힌 352
  const w = 520, h = 720;
  let o = '';
  o += shape(rect(232, 420, 56, 280, { sharp: true }), C.brass2, { sw: 3 });
  o += shape(ell(260, 250, 230, 230), C.brass, { sw: 3.5 });
  for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; o += `<circle cx="${260 + Math.cos(a) * 214}" cy="${250 + Math.sin(a) * 214}" r="5" fill="${C.brassL}" stroke="${INK}" stroke-width="1.2"/>`; }
  o += shape(ell(260, 250, 196, 196), '#dfe9e7', { sw: 3 });
  o += fill(ell(260, 250, 170, 120), '#2d4a3b', 0.9);
  o += digits('352', 120, 196, 1.2, C.cream, 8);
  o += line([[110, 120], [170, 74]], { sw: 6, color: '#fff', op: 0.6 });
  o += line([[100, 160], [140, 128]], { sw: 4, color: '#fff', op: 0.45 });
  put('zoom/mirror_reflect.svg', w, h, o, { id: 75, displace: 3 });
}
function bench() {
  seed(81);
  const w = 1080, h = 310;
  let o = '';
  // 다리
  for (const x of [30, 1020]) { o += shape(rect(x, 140, 34, 168, { sharp: true }), C.wood2); o += hatch(rect(x + 18, 140, 16, 168), 0.4); }
  for (const x of [400, 660]) o += shape(rect(x, 150, 26, 156, { sharp: true }), C.wood2);
  // 아래 선반 + 자루
  o += shape(rect(40, 250, 380, 16, { sharp: true }), C.wood);
  o += shape(wob([[70, 252], [80, 190], [120, 172], [160, 186], [170, 252]]), '#c9a874');
  o += line([[96, 192], [140, 186]], { sw: 2, color: '#8b6b3d' });
  o += shape(wob([[190, 252], [196, 206], [240, 196], [280, 208], [286, 252]]), '#b8975f');
  o += hatch(wob([[230, 210], [280, 210], [286, 252], [232, 252]]), 0.3);
  // 그림자 바닥
  o += fill(rect(20, 296, 1040, 14, { amp: 2 }), INK, 0.18);
  // 상판
  o += shape(rect(0, 120, 1080, 34, { sharp: true }), C.wood, { sw: 2.6 });
  for (let x = 0; x < 1080; x += 135) o += line([[x + 20, 124], [x + 20 + rand(60, 100), 126]], { sw: 1.2, op: 0.45 });
  o += hatch(rect(0, 140, 1080, 14, { sharp: true }), 0.4);
  // 서랍 앞판
  o += shape(rect(450, 156, 200, 60, { sharp: true }), C.wood3, { sw: 2.4 });
  o += shape(ell(550, 186, 12, 10), 'none', { sw: 3.6, stroke: C.brass2 });
  o += shape(rect(536, 166, 28, 10), C.brass);
  // 작업대 위 물건들
  o += pot(70, 82, 60, 40, { color: C.tc3 }) + pot(76, 62, 48, 30, { color: C.tc }) + pot(150, 90, 54, 32, { color: C.tc });
  o += shape(rect(260, 92, 160, 30, { sharp: true }), '#b88752');
  for (let i = 0; i < 4; i++) o += shape(rect(268 + i * 38, 96, 32, 22), C.soil, { sw: 1.2 }) + leaf(284 + i * 38, 100, 18, -Math.PI / 2 - 0.4, C.leaf3, { w: 0.4 }) + leaf(284 + i * 38, 100, 16, -Math.PI / 2 + 0.5, C.leaf, { w: 0.4 });
  o += shape(wob([[720, 72], [770, 72], [778, 122], [712, 122]]), '#c8d9d1', { op: 0.75 });
  o += shape(rect(716, 62, 58, 14), C.brass);
  for (let i = 0; i < 9; i++) o += `<ellipse cx="${728 + rand(0, 38)}" cy="${90 + rand(0, 26)}" rx="4" ry="2.6" fill="${C.seed2}"/>`;
  o += shape(wob([[850, 118], [940, 110], [950, 118], [860, 124]]), C.silver2);
  o += shape(rect(940, 108, 60, 12), C.wood2);
  put('props/bench.svg', w, h, o, { id: 81 });
}
function drawerOpen() {
  seed(82);
  let o = fill(rect(10, 90, 220, 14), INK, 0.25);
  o += shape(wob([[20, 0], [220, 0], [236, 60], [4, 60]], { sharp: true }), '#6b4528');
  o += shape(wob([[4, 60], [236, 60], [236, 100], [4, 100]], { sharp: true }), C.wood3, { sw: 2.4 });
  o += shape(ell(120, 80, 12, 10), 'none', { sw: 3.6, stroke: C.brass2 });
  o += hatch(wob([[20, 0], [220, 0], [236, 60], [4, 60]]), 0.4);
  put('props/drawer_open.svg', 240, 110, o, { id: 82 });
}
function wateringCan(file, full, size = 1) {
  seed(83);
  let o = '';
  o += fill(ell(86, 116, 70, 6), INK, 0.2);
  o += shape(wob([[54, 50], [70, 34], [130, 34], [140, 50], [140, 112], [50, 112]]), '#6f9a7e', { sw: 2.6 });
  o += hatch(wob([[110, 40], [138, 50], [138, 110], [112, 110]]), 0.35);
  o += shape(wob([[54, 74], [20, 40], [8, 30], [14, 22], [26, 30], [60, 62]]), '#6f9a7e');
  o += shape(ell(12, 26, 10, 7), C.brass);
  o += line([[76, 34], [96, 6], [124, 8], [138, 40]], { sw: 7, color: INK }) + line([[76, 34], [96, 6], [124, 8], [138, 40]], { sw: 4, color: '#6f9a7e' });
  o += line([[60, 70], [134, 70]], { sw: 1.4, op: 0.5 });
  if (full) {
    o += shape(ell(95, 38, 30, 4), C.water2, { sw: 1 });
    for (const [x, y] of [[0, 46], [-8, 60], [8, 70]]) o += shape(wob([[x + 4, y], [x + 8, y + 8], [x + 4, y + 12], [x, y + 8]]), '#9fd1e0', { sw: 1.2 });
  }
  put(file, 160, 124, o, { id: 83 });
}
function underShadow() {
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 170" width="1000" height="170"><defs><radialGradient id="g" cx="50%" cy="40%" r="55%"><stop offset="0" stop-color="#0d0a10" stop-opacity="0.88"/><stop offset="0.65" stop-color="#0d0a10" stop-opacity="0.7"/><stop offset="1" stop-color="#0d0a10" stop-opacity="0"/></radialGradient></defs><ellipse cx="500" cy="80" rx="520" ry="100" fill="url(#g)"/></svg>`;
  import('node:fs').then(({ writeFileSync }) => writeFileSync(OUT + 'props/under_shadow.svg', svgStr));
}

/* ───────────── 남쪽: 해님 기계 ───────────── */
function sunMachine(awake) {
  seed(awake ? 91 : 92);
  const w = 540, h = 600;
  const cx = 270, cy = 220;
  let o = '';
  if (awake) o += `<circle cx="${cx}" cy="${cy}" r="250" fill="#fff0a8" opacity="0.75" filter="url(#blur)"/>`;
  // 받침대
  o += fill(ell(270, 590, 170, 12), INK, 0.22);
  o += shape(wob([[130, 590], [410, 590], [380, 540], [160, 540]], { sharp: true }), C.wood2, { sw: 2.6 });
  o += shape(rect(150, 520, 240, 24, { sharp: true }), C.wood);
  o += shape(wob([[244, 520], [296, 520], [286, 360], [254, 360]]), C.brass, { sw: 2.6 });
  o += hatch(wob([[274, 520], [296, 520], [286, 360], [272, 360]]), 0.4);
  for (const y of [400, 470]) o += shape(rect(238, y, 64, 12), C.brass2);
  // 톱니바퀴
  const gear = (gx, gy, r, n, col) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n; const rr = i % 2 ? r : r * 0.8; pts.push([gx + Math.cos(a) * rr, gy + Math.sin(a) * rr]); }
    return shape(wob(pts, { sharp: true, amp: 0.4 }), col) + shape(ell(gx, gy, r * 0.25, r * 0.25), C.brass2);
  };
  o += gear(110, 380, 48, 10, C.brass) + gear(170, 440, 30, 8, C.brassL) + gear(430, 400, 40, 9, C.brass);
  o += line([[150, 380], [244, 420]], { sw: 6, color: C.brass2 }) + line([[392, 400], [296, 430]], { sw: 6, color: C.brass2 });
  // 햇살 꽃잎
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8 + 0.1;
    const L = i % 2 ? 72 : 100;
    const pts = rot([[0, -18], [L, 0], [0, 18]], a, cx + Math.cos(a) * 128, cy + Math.sin(a) * 128);
    o += shape(wob(pts, { step: 999, amp: 1 }), awake ? (i % 2 ? '#ffd65a' : C.sun) : (i % 2 ? '#b99b5a' : '#a78a4c'), { sw: 2.4 });
  }
  o += shape(ell(cx, cy, 140, 140), awake ? C.brassL : '#b89a5a', { sw: 3 });
  o += shape(ell(cx, cy, 116, 116), awake ? '#ffe38a' : '#c9ae73', { sw: 2.4 });
  o += hatch(ell(cx + 40, cy + 40, 80, 70), awake ? 0.12 : 0.3);
  // 얼굴: 눈꺼풀·눈썹·볼록한 볼·입술을 가진 해님
  if (awake) {
    for (const sx of [-1, 1]) {
      const ex = cx + sx * 42, ey = cy - 14;
      o += part([[ex - 15, ey], [ex - 12, ey - 17], [ex, ey - 23], [ex + 13, ey - 16], [ex + 15, ey + 2], [ex + 4, ey + 15], [ex - 9, ey + 12]], '#fffaf0', { sw: 2.2, heavy: [4, 6] });
      o += `<path d="${S([[ex - 7 + sx * 3, ey - 2], [ex - 3 + sx * 3, ey - 10], [ex + 5 + sx * 3, ey - 9], [ex + 7 + sx * 3, ey + 2], [ex + sx * 3, ey + 7]], 0.2)}" fill="${INK}"/>`;
      o += `<circle cx="${ex + 3 + sx * 3}" cy="${ey - 5}" r="3" fill="#fff"/>`;
      o += line([[ex - 16 * sx, ey - 34], [ex - 2 * sx, ey - 40], [ex + 14 * sx, ey - 36]], { sw: 3.4 });
    }
    o += part([[cx - 40, cy + 26], [cx - 20, cy + 32], [cx, cy + 30], [cx + 20, cy + 32], [cx + 40, cy + 26], [cx + 26, cy + 54], [cx, cy + 64], [cx - 26, cy + 54]], '#b84a3a', { sw: 2.4 });
    o += `<path d="${S([[cx - 16, cy + 52], [cx + 16, cy + 52], [cx, cy + 62]], 0.3)}" fill="#e98a7a"/>`;
    for (const sx of [-1, 1]) o += line([[cx + sx * 64, cy + 18], [cx + sx * 72, cy + 26], [cx + sx * 82, cy + 22]].map(([x, y]) => [x, y]), { sw: 2.2, color: '#d86f4e', op: 0.8 }) + line([[cx + sx * 62, cy + 26], [cx + sx * 70, cy + 34], [cx + sx * 80, cy + 30]], { sw: 2.2, color: '#d86f4e', op: 0.8 });
  } else {
    for (const sx of [-1, 1]) {
      const ex = cx + sx * 42, ey = cy - 8;
      o += line([[ex - 20, ey - 6], [ex - 8, ey + 4], [ex + 8, ey + 4], [ex + 20, ey - 6]], { sw: 3.6 });
      for (const k of [-12, -4, 4, 12]) o += line([[ex + k, ey + 4], [ex + k + sx * 2, ey + 11]], { sw: 1.8 });
      o += line([[ex - 18, ey - 26], [ex, ey - 30], [ex + 18, ey - 26]], { sw: 2.2, op: 0.7 });
    }
    o += part([[cx - 10, cy + 40], [cx, cy + 34], [cx + 10, cy + 40], [cx + 8, cy + 52], [cx, cy + 56], [cx - 8, cy + 52]], '#8d5a3a', { sw: 2 });
    for (const sx of [-1, 1]) o += line([[cx + sx * 64, cy + 22], [cx + sx * 74, cy + 30]], { sw: 2.2, color: '#b5745a', op: 0.6 }) + line([[cx + sx * 60, cy + 30], [cx + sx * 70, cy + 38]], { sw: 2.2, color: '#b5745a', op: 0.6 });
    // 주름 잡힌 수면 모자 + 털 방울
    const cap = [[cx - 128, cy - 60], [cx - 92, cy - 112], [cx - 30, cy - 146], [cx + 40, cy - 158], [cx + 110, cy - 140], [cx + 176, cy - 100], [cx + 214, cy - 52], [cx + 206, cy - 34], [cx + 170, cy - 70], [cx + 110, cy - 96], [cx + 50, cy - 92], [cx - 20, cy - 74], [cx - 90, cy - 50]];
    o += part(cap, C.blue, { heavy: [3, 7], shade: [[cx + 40, cy - 170], [cx + 230, cy - 120], [cx + 230, cy - 20], [cx + 60, cy - 90]], shadeCol: 'rgba(20,40,80,0.25)' });
    for (const [a1, a2] of [[[cx - 40, cy - 138], [cx - 20, cy - 80]], [[cx + 30, cy - 152], [cx + 40, cy - 94]], [[cx + 110, cy - 138], [cx + 100, cy - 98]]]) o += line([a1, [(a1[0] + a2[0]) / 2 + 6, (a1[1] + a2[1]) / 2], a2], { sw: 1.4, op: 0.5 });
    for (let k = 0; k < 4; k++) o += line([[cx + 120 + k * 22, cy - 130 + k * 22], [cx + 128 + k * 22, cy - 120 + k * 22]], { sw: 2.2, color: '#e8e2d0', op: 0.9 });
    o += part([[cx - 134, cy - 74], [cx - 60, cy - 60], [cx + 20, cy - 80], [cx + 22, cy - 56], [cx - 58, cy - 36], [cx - 136, cy - 50]], '#efe9da', { sw: 2.2, heavy: [3, 5] });
    for (let x = cx - 126; x < cx + 16; x += 10) o += line([[x, cy - 68 + (x - cx) * -0.05], [x + 2, cy - 48 + (x - cx) * -0.05]], { sw: 1, op: 0.35 });
    const pp = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? 22 : 17; pp.push([cx + 214 + Math.cos(a) * r, cy - 30 + Math.sin(a) * r]); }
    o += part(pp, '#f6f1e4', { sw: 1.8, heavy: [2, 6] });
    // 쿨쿨 콧방울
    o += part([[cx + 18, cy + 44], [cx + 34, cy + 30], [cx + 52, cy + 36], [cx + 54, cy + 54], [cx + 38, cy + 62], [cx + 22, cy + 58]], '#dff0f4', { sw: 1.6 });
    o += `<circle cx="${cx + 32}" cy="${cy + 40}" r="4" fill="#fff" opacity="0.9"/>`;
    o += `<g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"><path d="M${cx + 130} ${cy - 10}h18l-18 18h18"/><path d="M${cx + 160} ${cy - 40}h13l-13 13h13"/></g>`;
  }
  put(`props/sun_${awake ? 'awake' : 'asleep'}.svg`, w, h, o, { id: awake ? 91 : 92, vb: '0 0 540 600' });
}
function signStand() {
  seed(93);
  let o = fill(ell(50, 86, 40, 5), INK, 0.2);
  o += line([[30, 86], [50, 40], [70, 86]], { sw: 3, color: C.woodD });
  o += shape(wob([[6, 8], [94, 4], [96, 58], [4, 62]]), C.paper);
  for (let y = 20; y < 52; y += 9) o += line([[16, y], [16 + rand(50, 66), y]], { sw: 1.4, op: 0.6 });
  o += `<g transform="translate(76 46) scale(0.5)">${shape(ell(0, 0, 14, 14), C.red)}${shape(wob([[-4, -14], [2, -26], [8, -16]]), C.red2)}</g>`;
  put('props/sign_sun.svg', 100, 92, o, { id: 93 });
}
function lightBeams(view) {
  seed(94 + view.length);
  let o = '';
  const xs = view === 'south' ? [380, 660, 980] : [250, 620, 1050, 1300];
  xs.forEach((x, i) => {
    o += `<path d="M${x} -20 L${x + 140} -20 L${x + 520} 900 L${x + 240} 900Z" fill="#ffe9a8" opacity="${0.12 + (i % 2) * 0.06}" filter="url(#blur)"/>`;
  });
  if (view === 'south') o += `<circle cx="810" cy="300" r="330" fill="#fff1b0" opacity="0.45" filter="url(#blur)"/>`;
  // 유리 지붕 틀이 바닥에 드리운 햇빛 조각들
  const X = (x0, y) => 800 + (x0 - 800) * (1 + (y - 640) / 260 * 0.3) + (y - 640) * 0.7;
  for (let i = 0; i < 8; i++) {
    const x0 = 150 + i * 165;
    for (const [y0, y1] of [[668, 738], [750, 816], [828, 900]]) {
      const pts = [[X(x0, y0), y0], [X(x0 + 140, y0), y0], [X(x0 + 140, y1), y1], [X(x0, y1), y1]];
      o += `<path d="M${pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L')}Z" fill="#ffe3a0" opacity="0.3" filter="url(#soft)"/>`;
    }
  }
  // 반짝이는 먼지 자리는 엔진에서 애니메이션
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter><filter id="soft"><feGaussianBlur stdDeviation="4"/></filter></defs>${o}</svg>`;
  import('node:fs').then(({ writeFileSync }) => writeFileSync(OUT + `bg/beams_${view}.svg`, svgStr));
}

/* ───────────── 서쪽: 빗물통·새장 ───────────── */
function barrel() {
  seed(101);
  const w = 290, h = 320;
  let o = fill(ell(145, 312, 130, 10), INK, 0.22);
  o += shape(wob([[30, 50], [260, 50], [276, 180], [256, 306], [34, 306], [14, 180]]), C.wood, { sw: 2.8 });
  for (let x = 54; x < 260; x += 34) o += line([[x, 52], [x + (x - 145) * 0.08, 180], [x, 304]], { sw: 1.6, op: 0.7, step: 60 });
  o += hatch(wob([[200, 52], [260, 50], [276, 180], [256, 306], [206, 306]]), 0.4);
  for (const y of [90, 250]) o += shape(wob([[22, y - 8], [268, y - 8], [270, y + 8], [20, y + 8]], { sharp: true }), C.iron);
  o += shape(ell(145, 50, 116, 24), C.wood2, { sw: 2.8 });
  o += shape(ell(145, 52, 102, 18), C.water);
  o += line([[90, 50], [130, 46]], { sw: 2, color: '#9cc0c8', op: 0.7 });
  o += line([[160, 56], [196, 54]], { sw: 1.6, color: '#9cc0c8', op: 0.6 });
  o += leaf(118, 54, 22, 0.4, C.leaf3, { w: 0.5 });
  put('props/barrel.svg', w, h, o, { id: 101 });
}
function rooster(scale = 1, wound = false) {
  // 양철 수탉: 이음매와 리벳이 보이는 판금 몸통, 판 깃털 꼬리, 볏·볏살, 바퀴 달린 받침
  const tin = '#e9dcb8', tinS = 'rgba(90,80,60,0.22)';
  let o = `<path d="${S([[30, 146], [130, 146], [126, 152], [34, 152]])}" fill="${INK}" opacity="0.2"/>`;
  o += part([[46, 126], [116, 126], [118, 140], [44, 140]], '#8fa3a3', { sw: 1.8, heavy: [1, 2] });
  for (const x of [56, 106]) o += part(ellPts(x, 142, 7, 7, 0, Math.PI * 2, 10), '#5f6f70', { sw: 1.4 }) + `<circle cx="${x}" cy="142" r="2" fill="${C.silver}"/>`;
  o += line([[72, 126], [70, 108], [64, 104]], { sw: 3.4 }) + line([[90, 126], [94, 108], [100, 104]], { sw: 3.4 });
  // 꼬리 깃털 판 (뒤쪽부터)
  const tails = [[C.leafD, -1.45], [C.blue, -1.1], [C.red, -0.75], [C.leaf2, -0.42]];
  tails.forEach(([c, ang]) => {
    const pts = rot([[0, -8], [18, -13], [38, -9], [48, 2], [36, 9], [16, 10], [0, 6]], ang, 102, 80);
    o += part(pts, c, { sw: 1.6, heavy: [2, 4], hw: 2.4 });
    o += line(rot([[6, 0], [40, 0]], ang, 102, 80), { sw: 1, color: '#fff', op: 0.35 });
  });
  // 몸통
  const body = [[38, 60], [56, 70], [82, 74], [108, 76], [122, 92], [114, 110], [92, 118], [62, 116], [42, 104], [34, 82]];
  o += part(body, tin, { heavy: [3, 7], shade: [[70, 100], [130, 90], [130, 124], [60, 124]], shadeCol: tinS, light: [[48, 76], [70, 80], [56, 92], [44, 88]] });
  o += line([[50, 98], [70, 104], [96, 104], [114, 96]], { sw: 1, op: 0.5 });
  // 날개 판
  o += part([[62, 84], [96, 80], [110, 90], [100, 104], [76, 106], [64, 96]], '#d6c49a', { sw: 1.6, heavy: [2, 4], hw: 2.4 });
  for (const t of [0.3, 0.55, 0.8]) o += line([[64 + t * 40, 84], [62 + t * 40, 104]], { sw: 1, op: 0.45 });
  for (const [x, y] of [[48, 70], [112, 86], [60, 112], [90, 114], [80, 78]]) o += `<circle cx="${x}" cy="${y}" r="2.3" fill="${C.silver}" stroke="${INK}" stroke-width="0.8"/>`;
  // 목과 머리
  o += part([[30, 28], [44, 22], [58, 30], [62, 50], [56, 70], [40, 66], [30, 48]], tin, { heavy: [2, 4], sw: 2, shade: [[46, 20], [66, 20], [66, 72], [46, 72]], shadeCol: tinS, hatch: false });
  o += part([[28, 26], [30, 12], [38, 18], [42, 6], [48, 16], [56, 10], [56, 24], [46, 28], [34, 30]], C.red, { sw: 1.6, heavy: [1, 6], hw: 2.4 });
  o += part([[26, 36], [10, 40], [26, 46]], C.sun2, { sw: 1.6 }) + line([[12, 40], [24, 40]], { sw: 0.8 });
  o += part([[30, 46], [34, 60], [40, 48]], C.red, { sw: 1.4 });
  o += `<circle cx="40" cy="34" r="4.5" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="39" cy="34" r="2.2" fill="${INK}"/>`;
  // 등의 태엽 구멍 / 꽂힌 태엽
  if (wound) o += keyShape(98, 50, 0.55, -0.4);
  else o += `<circle cx="98" cy="74" r="4" fill="${INK}"/><circle cx="98" cy="74" r="6.5" fill="none" stroke="${C.silver2}" stroke-width="1.6"/>`;
  return scale === 1 ? o : `<g transform="scale(${scale})">${o}</g>`;
}
function keyShape(x, y, s, a) {
  // 나비 모양 태엽 열쇠
  const g = shape(wob([[0, 0], [-22, -18], [-26, 4], [0, 4]]), C.silver2, { sw: 2 }) + shape(wob([[0, 0], [22, -18], [26, 4], [0, 4]]), C.silver2, { sw: 2 }) +
    shape(rect(-4, 2, 8, 30), C.silver, { sw: 2 }) + shape(ell(0, 0, 6, 6), C.silver);
  return `<g transform="translate(${x} ${y}) rotate(${a * 57.3}) scale(${s})">${g}</g>`;
}
function cage(state) {
  // state: closed | open | empty
  seed(102);
  const w = 240, h = 350;
  let o = '';
  o += line([[120, -20], [120, 40]], { sw: 3, color: C.iron });
  for (let y = -20; y < 40; y += 12) o += shape(ell(120, y, 5, 7), 'none', { sw: 2, stroke: C.iron });
  o += shape(ell(120, 44, 14, 10), C.brass);
  if (state !== 'empty') o += `<g transform="translate(46 168) scale(0.92)">${rooster()}</g>`;
  // 돔 철창
  const L = 26, Rr = 214, top = 60, bot = 310;
  for (let i = 0; i <= 10; i++) {
    const x = L + (Rr - L) * i / 10;
    const peak = top + Math.pow(Math.abs(x - 120) / 94, 2) * 70;
    o += line([[120, top], [x, peak + 10], [x, bot]], { sw: 2.6, color: C.brass2, step: 40, amp: 0.4 });
  }
  o += line(ellPts(120, 140, 96, 20, Math.PI, Math.PI * 2, 14), { sw: 3, color: C.brass2, step: 999 });
  o += shape(rect(16, 300, 208, 26, { sharp: true }), C.brass, { sw: 2.6 });
  o += hatch(rect(130, 302, 92, 22), 0.35);
  // 작은 문
  if (state === 'closed') {
    o += shape(wob([[150, 196], [206, 196], [206, 296], [150, 296]], { sharp: true }), 'none', { sw: 3, stroke: C.brass2 });
    for (let x = 164; x < 206; x += 14) o += line([[x, 196], [x, 296]], { sw: 2, color: C.brass2 });
    o += shape(ell(148, 246, 7, 7), C.brassL);
  } else {
    o += shape(wob([[206, 196], [244, 186], [244, 300], [206, 296]], { sharp: true }), 'none', { sw: 3, stroke: C.brass2 });
    for (let k = 1; k < 3; k++) o += line([[206 + k * 13, 196 - k * 3], [206 + k * 13, 297 + k]], { sw: 2, color: C.brass2 });
  }
  put(`props/cage_${state}.svg`, w, h, o, { id: 102, vb: '0 -24 250 374' });
}

/* ───────────── 확대 화면 ───────────── */
function zoomDrawer(open) {
  seed(open ? 111 : 112);
  let o = '';
  if (!open) {
    o += fill(rect(0, 0, W, H, { amp: 0 }), C.wood);
    for (let y = 0; y < H; y += 32) o += line([[0, y + rand(0, 10)], [W, y + rand(0, 14)]], { sw: 1.2, op: 0.3, step: 120, amp: 3 });
    o += shape(rect(260, 230, 1080, 440, { sharp: true, amp: 1.5 }), C.wood3, { sw: 4 });
    o += hatch(rect(260, 600, 1080, 70), 0.35);
    // 황동 다이얼 자물쇠판
    o += shape(rect(560, 300, 480, 300, { sharp: true, amp: 1 }), C.brass, { sw: 4 });
    o += shape(rect(580, 320, 440, 260, { sharp: true, amp: 1 }), 'none', { sw: 2, stroke: C.brass2 });
    for (let i = 0; i < 3; i++) {
      const x = 610 + i * 140;
      o += shape(rect(x, 360, 100, 160, { sharp: true }), '#2b2119', { sw: 3 });
      o += shape(rect(x + 6, 366, 88, 148, { sharp: true }), C.cream, { sw: 1.6 });
      o += hatch(rect(x + 6, 366, 88, 30), 0.5) + hatch(rect(x + 6, 484, 88, 30), 0.5);
    }
    for (const [x, y] of [[590, 330], [1010, 330], [590, 570], [1010, 570]]) o += `<circle cx="${x}" cy="${y}" r="7" fill="${C.brassL}" stroke="${INK}" stroke-width="2"/>`;
    // 작은 해 그림 (손거울 표식과 이어짐)
    o += shape(ell(800, 552, 12, 12), C.sun2);
  } else {
    o += fill(rect(0, 0, W, H, { amp: 0 }), '#5b3b22');
    o += shape(wob([[180, 120], [1420, 120], [1500, 860], [100, 860]], { sharp: true, amp: 2 }), '#7e5533', { sw: 4 });
    o += shape(wob([[240, 170], [1360, 170], [1420, 800], [180, 800]], { sharp: true, amp: 2 }), '#3f6a54', { sw: 3 });
    for (let i = 0; i < 40; i++) o += line([[rand(260, 1340), rand(200, 780)], [rand(260, 1340), rand(200, 780)]], { sw: 1, color: '#2f5241', op: 0.35, step: 200 });
    o += hatch(wob([[240, 170], [1360, 170], [1340, 240], [260, 240]]), 0.45);
    // 연필, 노끈, 씨앗 몇 알
    o += `<g transform="translate(320 640) rotate(-12)">${shape(rect(0, 0, 300, 22), '#e2b13c')}${shape(wob([[300, 0], [336, 11], [300, 22]]), '#e7cc9c')}</g>`;
    for (let i = 0; i < 6; i++) o += `<ellipse cx="${1100 + rand(0, 160)}" cy="${640 + rand(0, 90)}" rx="9" ry="5" fill="${C.seed2}" stroke="${INK}" stroke-width="1.4" transform="rotate(${rand(0, 180)} 1180 680)"/>`;
  }
  put(`zoom/drawer_${open ? 'open' : 'closed'}.svg`, W, H, o, { id: open ? 111 : 112, displace: 4 });
}
function zoomBarrel() {
  seed(113);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#8f4a2c');
  for (let y = -40; y < H; y += 190) for (let x = -60; x < W; x += 190) o += shape(rect(x + 4, y + 4, 182, 182, { amp: 1.5 }), pick([C.tc, C.tc2, C.tc3, C.tc]), { sw: 2 });
  o += fill(ell(830, 500, 720, 450), INK, 0.35);
  o += shape(ell(800, 470, 680, 420), C.wood2, { sw: 5 });
  for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16; o += line([[800 + Math.cos(a) * 610, 470 + Math.sin(a) * 370], [800 + Math.cos(a) * 678, 470 + Math.sin(a) * 418]], { sw: 2, op: 0.7 }); }
  o += shape(ell(800, 470, 600, 362), C.water, { sw: 4 });
  o += fill(ell(800, 500, 520, 300), '#2f4a52', 0.8);
  for (let i = 0; i < 6; i++) o += line(ellPts(rand(400, 1200), rand(300, 650), rand(60, 140), rand(14, 30), 0, Math.PI * 1.4, 16), { sw: 2, color: '#8fb6bf', op: 0.5, step: 999 });
  o += leaf(560, 360, 90, 0.6, C.leaf3, { w: 0.5 }) + leaf(1080, 640, 76, -2.4, C.leaf, { w: 0.5 });
  o += leaf(1200, 320, 60, 2.2, '#b99a52', { w: 0.5 });
  put('zoom/barrel.svg', W, H, o, { id: 113, displace: 4 });
}
function keyGlint() {
  seed(114);
  let o = `<g opacity="0.75">${keyShape(70, 50, 1.6, 0.8)}</g>`;
  o += fill(ell(70, 60, 60, 30), '#2f4a52', 0.35);
  o += sparkle(96, 30, 16, '#f6fbf6') + sparkle(40, 70, 9, '#f6fbf6');
  put('zoom/key_glint.svg', 140, 110, o, { id: 114 });
}
function zoomPaper() {
  seed(115);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#6d5a43');
  o += hatch(rect(0, 0, W, H), 0.18);
  o += fill(wob([[440, 130], [1180, 116], [1196, 800], [430, 812]]), INK, 0.3);
  o += shape(wob([[420, 110], [1170, 96], [1180, 780], [412, 792]], { step: 60, amp: 3 }), C.paper, { sw: 3 });
  o += hatch(wob([[1000, 100], [1170, 96], [1180, 780], [1040, 786]]), 0.12);
  o += shape(wob([[720, 86], [880, 82], [884, 126], [716, 130]]), '#e8dcae', { op: 0.85, sw: 1.4 });
  for (let i = 0; i < 4; i++) o += `<circle cx="${rand(480, 1120)}" cy="${rand(160, 740)}" r="${rand(10, 26)}" fill="#c9a86b" opacity="0.18"/>`;
  put('zoom/paper.svg', W, H, o, { id: 115, displace: 3 });
}

/* ───────────── 아이템 아이콘 (160x160) ───────────── */
function items() {
  const I = (name, body, id) => put(`items/${name}.svg`, 160, 160, body, { id, displace: 1.8 });
  seed(201);
  I('yarn', shape(ell(78, 86, 50, 46), C.red) + [...Array(7)].map((_, i) => line(ellPts(78, 86, 48 - i * 3, 14 + i * 5, 0.2 + i * 0.35, Math.PI * 0.9 + i * 0.35, 12), { sw: 1.6, color: C.red2, step: 999 })).join('') + line([[120, 110], [146, 132], [130, 150]], { sw: 2.6, color: C.red }) + hatch(ell(96, 104, 30, 26), 0.3), 201);
  seed(202);
  I('mirror', shape(wob([[70, 104], [90, 104], [94, 150], [66, 150]]), C.brass2) + shape(ell(80, 64, 44, 52), C.brass, { sw: 2.6 }) + [...Array(14)].map((_, i) => { const a = i * Math.PI / 7; return `<circle cx="${(80 + Math.cos(a) * 44).toFixed(1)}" cy="${(64 + Math.sin(a) * 52).toFixed(1)}" r="4.5" fill="${C.brassL}" stroke="${INK}" stroke-width="1.2"/>`; }).join('') + shape(ell(80, 64, 34, 42), '#dfeaea') + fill(ell(88, 74, 22, 28), '#b9cccc', 0.7) + line([[58, 54], [76, 32]], { sw: 4, color: '#fff' }) + line([[60, 70], [70, 58]], { sw: 2.4, color: '#fff' }) + shape(ell(80, 10, 8, 7), C.brass), 202);
  seed(203);
  const mag = (dx = 0, dy = 0) => shape(wob([[30 + dx, 40 + dy], [62 + dx, 40 + dy], [62 + dx, 92 + dy], [80 + dx, 110 + dy], [98 + dx, 92 + dy], [98 + dx, 40 + dy], [130 + dx, 40 + dy], [130 + dx, 96 + dy], [80 + dx, 144 + dy], [30 + dx, 96 + dy]], { step: 20 }), C.red, { sw: 2.6 }) + shape(rect(30 + dx, 30 + dy, 32, 20), C.silver) + shape(rect(98 + dx, 30 + dy, 32, 20), C.silver) + hatch(wob([[96 + dx, 96 + dy], [130 + dx, 96 + dy], [80 + dx, 144 + dy], [80 + dx, 112 + dy]]), 0.4);
  I('magnet', mag(), 203);
  seed(204);
  I('seeds', shape(wob([[32, 30], [128, 26], [132, 140], [28, 144]]), C.paper) + sunHead(80, 78, 30, {}) + shape(rect(40, 112, 80, 18), C.leaf2, { sw: 1.4 }) + line([[48, 121], [110, 121]], { sw: 2, color: C.cream }) + line([[32, 30], [80, 44], [128, 26]], { sw: 1.6, op: 0.6 }), 204);
  seed(205);
  I('magnet_line', `<g transform="translate(20 30) scale(0.75)">${mag()}</g>` + line([[38, 50], [50, 10], [100, 6], [140, 30], [146, 70]], { sw: 2.6, color: C.red, step: 20 }) + shape(ell(140, 92, 18, 16), C.red), 205);
  seed(206);
  I('windkey', keyShape(80, 66, 2.2, 0.3), 206);
  seed(207);
  I('rooster', rooster(), 207);
  seed(208);
  I('rooster_wound', rooster(1, true), 208);
  seed(209);
  wateringCan('items/wcan.svg', false);
  wateringCan('items/wcan_full.svg', true);
  seed(210);
  I('key', `<g transform="rotate(-35 80 80)">${shape(ell(80, 40, 26, 26), C.brass, { sw: 2.6 })}${[...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return leaf(80 + Math.cos(a) * 10, 40 + Math.sin(a) * 10, 12, a, C.sun2, { w: 0.5, vein: false }); }).join('')}${shape(ell(80, 40, 8, 8), C.seed)}${shape(rect(74, 64, 12, 80), C.brass, { sw: 2.4 })}${shape(rect(86, 116, 20, 10), C.brass)}${shape(rect(86, 132, 14, 9), C.brass)}</g>` + sparkle(122, 40, 12), 210);
}

/* ───────────── 햇빛 그림자 · 앞쪽 잎사귀 ───────────── */
function castShadows(view) {
  const P = (pts) => `<path d="M${pts.map((p) => p.join(' ')).join('L')}Z"/>`;
  const sh = {
    north: P([[258, 650], [608, 650], [672, 712], [310, 712]]) + P([[1030, 652], [1220, 652], [1290, 700], [1080, 700]]) + P([[1300, 690], [1460, 690], [1500, 716], [1330, 716]]) + P([[940, 236], [970, 250], [970, 640], [940, 640]]),
    east: P([[290, 702], [1340, 702], [1420, 752], [330, 752]]) + P([[262, 552], [1340, 552], [1340, 600], [262, 590]]) + P([[312, 276], [770, 276], [790, 300], [326, 304]]) + P([[896, 210], [1152, 210], [1158, 388], [904, 392]]) + P([[1180, 680], [1180, 680]]),
    south: P([[680, 650], [920, 650], [1010, 708], [740, 708]]) + P([[910, 640], [990, 640], [1020, 664], [930, 664]]),
    west: P([[300, 690], [550, 690], [630, 740], [350, 740]]) + `<ellipse cx="1120" cy="742" rx="110" ry="22"/>` + P([[1214, 196], [1440, 196], [1440, 498], [1214, 498]]),
  }[view];
  let extra = '';
  if (view === 'west') for (let k = 0; k < 9; k++) extra += `<line x1="${1030 + k * 22}" y1="726" x2="${1044 + k * 22}" y2="760" stroke="#3b2414" stroke-width="3" opacity="0.5"/>`;
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter></defs><g fill="#4a2c18" opacity="0.38" filter="url(#b)">${sh}${extra}</g></svg>`;
  import('node:fs').then(({ writeFileSync }) => writeFileSync(OUT + `bg/cast_${view}.svg`, out));
}
function foreground(view) {
  seed(170 + view.length * 3);
  const dark = ['#3d5f2c', '#4a6e34', '#34512a'];
  let o = '';
  // 왼쪽 위·오른쪽 위에서 늘어진 큰 잎 (앞쪽이라 크고 진하게)
  o += vine(70, -20, view === 'east' ? 230 : 300, { sway: 30, leafLen: 54, colors: dark, dir: 1 });
  o += vine(18, -20, 180, { sway: 18, leafLen: 46, colors: dark, dir: -1 });
  if (view !== 'west') o += vine(1470, -20, 160, { sway: 20, leafLen: 50, colors: dark, dir: -1 });
  o += hatch(wob([[0, 0], [150, 0], [120, 260], [0, 330]]), 0.12);
  // 앞쪽 바닥 구석 화분 (북·남)
  if (view === 'north' || view === 'south') {
    const x = view === 'north' ? -40 : 1380;
    o += shape(wob([[x, 800], [x + 170, 800], [x + 150, 920], [x + 20, 920]]), '#a5552f', { sw: 3 });
    o += hatch(wob([[x + 100, 804], [x + 168, 804], [x + 150, 920], [x + 110, 920]]), 0.4);
    o += shape(rect(x - 8, 786, 186, 26), '#bf6a40', { sw: 3 });
    for (let i = 0; i < 11; i++) o += leaf(x + 85, 792, rand(110, 170), -Math.PI / 2 + (i - 5) * 0.27, pick(dark), { w: 0.26 });
  }
  put(`bg/fg_${view}.svg`, W, H, o, { id: 170 + view.length });
}
for (const v of ['north', 'east', 'south', 'west']) { castShadows(v); foreground(v); }

sky(false); sky(true);
bgNorth(); bgEast(); bgSouth(); bgWest();
door(); note('props/note_door.svg', 23); sunflowers(false); sunflowers(true);
bigPot('empty'); bigPot('seeded'); bigPot('wet'); giantFlower(true); giantFlower(false); basket(true); basket(false); snail();
shelf(); potMid(false); potMid(true); mirrorGlint(); plaque(false); plaque(true); mirrorReflect(); bench(); drawerOpen();
wateringCan('props/wcan.svg', false); underShadow();
sunMachine(false); sunMachine(true); signStand();
for (const v of ['north', 'east', 'south', 'west']) lightBeams(v);
barrel(); cage('closed'); cage('open'); cage('empty');
zoomDrawer(false); zoomDrawer(true); zoomBarrel(); keyGlint(); zoomPaper();
items();
console.log('greenhouse assets written, ~' + Math.round(total / 1024) + 'KB');
