// 3장 「열세 번째 시계」 그래픽 에셋 생성기
// node tools/art/clock13.mjs  → assets/rooms/clock13/**
// 분위기: 밤의 다락방. 밤 남색·빛바랜 자주·녹슨 동·촛불·달빛. 은은하게 오싹하지만 놀래키지 않는다.
import { seed, rand, pick, INK, wob, rect, rectPts, ell, ellPts, rot, shape, fill, line, hatch, leaf, svg } from './ink.mjs';
import { part, S, O, ghostShadowArt, ghostIconArt } from './chars.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../../assets/rooms/clock13/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  night: '#1f2742', night2: '#2c3558', paper: '#5d4a66', paper2: '#4c3c56', motif: '#7d6a88',
  wood: '#6b4f36', wood2: '#54402e', wood3: '#8a6a4a', woodD: '#3a2a1e', beam: '#3b2c24',
  brass: '#c9a24a', brass2: '#8f6d28', brassL: '#e6c977', copper: '#8a6a3c', cream: '#efe3c6', cream2: '#d9c9a2',
  candle: '#f2c46b', flame: '#ffd77a', moon: '#cfe0e6', velvet: '#6c4a6e', velvet2: '#523656', glass: '#2a3a4a',
  leaf: '#6f9a4f', leaf2: '#4f7c3a', red: '#a8402f', grey: '#9a96a0', web: '#d9d6e0',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const raw = (rel, w, h, body) => { mkdirSync(OUT + rel.split('/').slice(0, -1).join('/'), { recursive: true }); writeFileSync(OUT + rel, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;

/* ───────────── 로마 숫자 시계판 ───────────── */
function roman(str, cx, cy, h, col, sw) {
  const wOf = { I: 0.2, V: 0.56, X: 0.56 };
  const gap = 0.1 * h;
  const total = [...str].reduce((a, ch) => a + wOf[ch] * h, 0) + gap * (str.length - 1);
  let x = cx - total / 2, o = '';
  const top = cy - h / 2, bot = cy + h / 2;
  for (const ch of str) {
    const w = wOf[ch] * h;
    if (ch === 'I') o += line([[x + w / 2, top], [x + w / 2, bot]], { sw, color: col, amp: 0.3 });
    if (ch === 'V') o += line([[x, top], [x + w / 2, bot], [x + w, top]], { sw, color: col, amp: 0.3 });
    if (ch === 'X') o += line([[x, top], [x + w, bot]], { sw, color: col, amp: 0.3 }) + line([[x + w, top], [x, bot]], { sw, color: col, amp: 0.3 });
    x += w + gap;
  }
  o += line([[cx - total / 2 - 2, top], [cx + total / 2 + 2, top]], { sw: sw * 0.6, color: col, amp: 0.3 }) + line([[cx - total / 2 - 2, bot], [cx + total / 2 + 2, bot]], { sw: sw * 0.6, color: col, amp: 0.3 });
  return o;
}
function hand(cx, cy, len, ang, kind, col = '#2a1e16') {
  // kind: hour (삽 모양) | min (길고 가는 바늘)
  const w = kind === 'hour' ? len * 0.13 : len * 0.06;
  const pts = kind === 'hour'
    ? [[-w * 0.4, 0], [-w * 0.4, -len * 0.55], [-w, -len * 0.7], [0, -len], [w, -len * 0.7], [w * 0.4, -len * 0.55], [w * 0.4, 0]]
    : [[-w * 0.5, 0], [-w * 0.5, -len * 0.8], [-w * 1.4, -len * 0.84], [0, -len], [w * 1.4, -len * 0.84], [w * 0.5, -len * 0.8], [w * 0.5, 0]];
  const r = rot(pts.map(([x, y]) => [x, y]), ang, cx, cy);
  return `<path d="M${r.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L')}Z" fill="${col}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
}
function clockFace(cx, cy, r, { mirror = false, h = null, m = null, slot = 'empty', glow = false } = {}) {
  let g = '';
  g += part(ellPts(cx, cy, r * 1.08, r * 1.08, 0, Math.PI * 2, 24), C.brass, { heavy: [2, 9], sw: 2.2, shade: [[cx, cy], [cx + r * 1.2, cy - r * 0.4], [cx + r * 1.2, cy + r * 1.2], [cx - r * 0.4, cy + r * 1.2]], shadeCol: 'rgba(90,60,10,0.25)', hatch: false });
  g += part(ellPts(cx, cy, r, r, 0, Math.PI * 2, 24), C.cream, { sw: 1.8, shade: [[cx + r * 0.2, cy], [cx + r * 1.1, cy - r * 0.3], [cx + r * 1.1, cy + r * 1.1], [cx - r * 0.2, cy + r * 1.1]], shadeCol: 'rgba(120,90,50,0.14)', hatch: false });
  g += line(ellPts(cx, cy, r * 0.9, r * 0.9, 0, Math.PI * 2, 30), { sw: 1, op: 0.5, step: 999 }) + line(ellPts(cx, cy, r * 0.62, r * 0.62, 0, Math.PI * 2, 30), { sw: 1, op: 0.4, step: 999 });
  for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30; const l = i % 5 ? 0.03 : 0.07; g += line([[cx + Math.sin(a) * r * 0.9, cy - Math.cos(a) * r * 0.9], [cx + Math.sin(a) * r * (0.9 - l), cy - Math.cos(a) * r * (0.9 - l)]], { sw: i % 5 ? 1 : 2, amp: 0.1 }); }
  const NUM = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  NUM.forEach((n, k) => { const a = k * Math.PI / 6; g += roman(n, cx + Math.sin(a) * r * 0.76, cy - Math.cos(a) * r * 0.76, r * 0.13, INK, Math.max(1.4, r * 0.018)); });
  // 13번째 숫자 자리
  if (slot) {
    const sx = cx, sy = cy - r * 0.42, sw = r * 0.36, sh = r * 0.17;
    if (slot === 'empty') g += part(rectPts(sx - sw / 2, sy - sh / 2, sw, sh), '#2a1e16', { sw: 1.6 }) + line([[sx - sw / 2 + 3, sy - sh / 2 + 3], [sx + sw / 2 - 3, sy - sh / 2 + 3]], { sw: 1, color: '#6b5a4a' });
    else g += part(rectPts(sx - sw / 2, sy - sh / 2, sw, sh), C.brassL, { sw: 1.6, heavy: [1, 2] }) + roman('XIII', sx, sy, sh * 0.6, C.red, Math.max(1.4, r * 0.016));
  }
  if (h !== null) {
    g += hand(cx, cy, r * 0.5, ((h % 12) + m / 60) * Math.PI / 6, 'hour');
    g += hand(cx, cy, r * 0.8, m * Math.PI / 30, 'min');
  }
  g += dot(cx, cy, r * 0.05, C.brass2) + dot(cx, cy, r * 0.02, C.brassL);
  if (glow) g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#cfe0e6" opacity="0.08"/>`;
  return mirror ? `<g transform="translate(${2 * cx} 0) scale(-1 1)">${g}</g>` : g;
}

/* ───────────── 다락방 껍데기 ───────────── */
function shell() {
  let o = '';
  o += fill(rect(0, 0, W, H, { amp: 0 }), '#2c2230');
  // 뒷벽 (박공 모양): 빛바랜 자주 벽지 + 무늬
  const wall = [[140, 640], [140, 300], [520, 110], [1080, 110], [1460, 300], [1460, 640]];
  o += part(wall, C.paper, { sw: 2 });
  for (let y = 150; y < 520; y += 56) for (let x = 170 + ((y / 56) % 2) * 40; x < 1440; x += 80) {
    o += `<path d="${S([[x, y - 12], [x + 8, y], [x, y + 12], [x - 8, y]], 0.3)}" fill="${C.motif}" opacity="0.45"/>` + dot(x, y - 18, 2.2, C.motif, 0.45) + dot(x, y + 18, 2.2, C.motif, 0.45);
  }
  // 벽지 이음매와 얼룩
  for (let x = 240; x < 1440; x += 160) o += line([[x, 120 + Math.max(0, 300 - (x - 140) * 0.5)], [x + 2, 520]], { sw: 1, op: 0.25 });
  for (let i = 0; i < 5; i++) o += `<path d="${S(ellPts(rand(240, 1360), rand(180, 480), rand(30, 60), rand(20, 40), 0, Math.PI * 2, 12), 4)}" fill="#3e2f46" opacity="0.18"/>`;
  // 징두리 나무판
  o += part([[140, 512], [1460, 512], [1460, 640], [140, 640]], C.wood2, { sw: 2 });
  for (let x = 140; x < 1460; x += 60) o += line([[x, 516], [x, 638]], { sw: 1.2, op: 0.5 });
  o += part([[130, 500], [1470, 500], [1470, 516], [130, 516]], C.wood, { sw: 1.8 });
  // 지붕 경사면 (판자결) + 서까래
  for (const side of [0, 1]) {
    const M = (pts) => pts.map(([x, y]) => [side ? W - x : x, y]);
    o += part(M([[0, 0], [560, 0], [520, 110], [140, 300], [0, 420]]), '#3a2c30', { sw: 2 });
    for (let k = 1; k < 7; k++) { const t = k / 7; o += line(M([[560 * t, 0], [0, 420 * t]]), { sw: 1, color: '#2a1f22', op: 0.7 }); }
    o += part(M([[516, 104], [530, 112], [148, 310], [134, 298]]), C.beam, { sw: 2 });
    o += part(M([[300, -4], [318, -4], [70, 380], [52, 380]]), C.beam, { sw: 1.8 });
  }
  o += part([[520, 104], [1080, 104], [1080, 118], [520, 118]], C.beam, { sw: 1.8 });
  // 옆벽
  for (const side of [0, 1]) {
    const M = (pts) => pts.map(([x, y]) => [side ? W - x : x, y]);
    o += part(M([[0, 420], [140, 300], [140, 640], [0, 900]]), C.paper2, { sw: 2 });
    o += part(M([[0, 760], [140, 560], [140, 640], [0, 900]]), C.wood2, { sw: 1.6 });
    o += hatch(wob(M([[0, 420], [140, 300], [140, 640], [0, 900]]), { sharp: true }), 0.35, 'hatch2');
  }
  // 마루
  o += fill(wob([[140, 640], [1460, 640], [1600, 900], [0, 900]], { sharp: true }), C.wood);
  const N = 14;
  const xAt = (y, k) => { const t = (y - 640) / 260; const xb = 140 + k * 1320 / N, xf = -60 + k * 1720 / N; return xb + (xf - xb) * t; };
  for (let k = 0; k < N; k++) {
    o += fill(wob([[xAt(640, k), 640], [xAt(640, k + 1), 640], [xAt(900, k + 1), 900], [xAt(900, k), 900]], { sharp: true, amp: 0.5 }), pick([C.wood, C.wood2, C.wood3, C.wood]), 0.9);
    o += line([[xAt(640, k), 640], [xAt(900, k), 900]], { sw: 1.8, op: 0.75, step: 80 });
    const jy = rand(670, 880); o += line([[xAt(jy, k), jy], [xAt(jy + 2, k + 1), jy + 2]], { sw: 1.4, op: 0.6 });
    o += dot(xAt(700, k) + 8, 700, 1.6, INK, 0.6) + dot(xAt(820, k) + 12, 820, 1.8, INK, 0.6);
  }
  o += hatch(wob([[140, 640], [1460, 640], [1460, 664], [140, 664]], { sharp: true }), 0.5);
  // 구석 거미줄
  for (const side of [0, 1]) {
    const cx = side ? 1460 : 140, cy = 300, dir = side ? -1 : 1;
    for (let k = 0; k < 6; k++) { const a = (side ? Math.PI : 0) + dir * (-0.5 + k * 0.32); o += line([[cx, cy], [cx + Math.cos(a) * 110 * dir * dir, cy + Math.sin(a) * 110]], { sw: 1, color: C.web, op: 0.5 }); }
    for (const r of [30, 56, 84]) { const pts = []; for (let k = 0; k <= 5; k++) { const a = (side ? Math.PI : 0) + dir * (-0.5 + k * 0.32); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r + 6]); } o += line(pts, { sw: 0.9, color: C.web, op: 0.45, step: 999 }); }
  }
  return o;
}

/* ───────────── 배경 4면 ───────────── */
function bgNorth() {
  seed(711);
  let o = shell();
  // 문 자리 오목한 공간
  o += part([[1130, 640], [1130, 360], [1150, 300], [1200, 268], [1260, 256], [1320, 268], [1370, 300], [1390, 360], [1390, 640]], C.woodD, { sw: 3 });
  // 시계탑 그림 액자
  o += part(rectPts(270, 250, 150, 190), C.wood2, { sw: 2.2, heavy: [1, 2] }) + part(rectPts(282, 262, 126, 166), '#2b3150', { sw: 1.4 });
  o += part([[322, 420], [322, 320], [345, 290], [368, 320], [368, 420]], '#1a1d30', { sw: 1.2 }) + dot(345, 340, 14, C.cream, 0.9) + dot(345, 340, 2, INK);
  for (let i = 0; i < 6; i++) o += dot(rand(290, 400), rand(270, 310), 1.4, '#fff', 0.8);
  o += line([[290, 250], [345, 222], [400, 250]], { sw: 1.4 }) + dot(345, 222, 3.4, C.brass);
  // 모자 상자 탑
  for (const [y, w, c] of [[640, 140, '#7a5a7e'], [586, 116, '#a08a5a'], [540, 92, '#6a7a8e']]) {
    o += part([[200 + (140 - w) / 2, y], [200 + (140 + w) / 2, y], [200 + (140 + w) / 2, y - 46], [200 + (140 - w) / 2, y - 46]], c, { sw: 1.8, heavy: [1, 2], shade: [[270, y - 50], [360, y - 50], [360, y], [270, y]], shadeCol: 'rgba(0,0,0,0.2)', hatch: false });
    o += part([[196 + (140 - w) / 2, y - 46], [204 + (140 + w) / 2, y - 46], [204 + (140 + w) / 2, y - 36], [196 + (140 - w) / 2, y - 36]], c, { sw: 1.4 });
    o += line([[200 + (140 - w) / 2 + 8, y - 20], [200 + (140 + w) / 2 - 8, y - 20]], { sw: 1.4, color: C.cream2, op: 0.6 });
  }
  put('bg/north.svg', W, H, o, { id: 711 });
}
function bgEast() {
  seed(712);
  let o = shell();
  // 둥근 창 자리 (창은 소품으로 따로)
  o += part(ellPts(800, 330, 196, 196, 0, Math.PI * 2, 28), C.woodD, { sw: 3 });
  // 왼쪽 책장
  o += part(rectPts(190, 250, 270, 390), C.wood2, { sw: 2.4, heavy: [1, 2] }) + part(rectPts(204, 264, 242, 362), '#2b2028', { sw: 1.4 });
  for (const y of [360, 470, 580]) o += part(rectPts(200, y, 250, 12), C.wood, { sw: 1.4 });
  for (const y of [360, 470, 580]) { let x = 210; while (x < 430) { const w = rand(14, 26), h = rand(60, 88); o += part(rectPts(x, y - h, w, h), pick(['#6c4a6e', '#3e5a6e', '#7a5a3a', '#5a6a4a', '#8a4a3a']), { sw: 1.2 }); o += line([[x + 3, y - h + 10], [x + w - 3, y - h + 10]], { sw: 1, color: C.brassL, op: 0.6 }); x += w + rand(1, 4); if (rand() < 0.12) { o += part([[x, y], [x + 10, y - 70], [x + 30, y - 66], [x + 20, y]], '#4a5a7a', { sw: 1.2 }); x += 34; } } }
  // 촛농 흘린 빈 접시
  o += part([[1280, 600], [1380, 600], [1370, 614], [1290, 614]], C.copper, { sw: 1.6 });
  put('bg/east.svg', W, H, o, { id: 712 });
}
function bgSouth() {
  seed(713);
  let o = shell();
  // 천을 덮어 둔 안락의자 (유령처럼 보이지만 그냥 의자)
  o += part([[1060, 690], [1050, 560], [1066, 440], [1110, 360], [1180, 330], [1260, 334], [1320, 370], [1360, 450], [1380, 560], [1376, 690], [1340, 676], [1300, 694], [1260, 678], [1220, 696], [1180, 680], [1140, 696], [1100, 680]], '#d8d2c8', { heavy: [6, 10], shade: [[1220, 330], [1400, 330], [1400, 700], [1250, 700]], shadeCol: 'rgba(60,50,80,0.22)' });
  for (const [a, b] of [[[1120, 400], [1150, 660]], [[1200, 350], [1210, 520]], [[1300, 380], [1330, 640]], [[1080, 560], [1360, 560]]]) o += line([a, [(a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2], b], { sw: 1.4, op: 0.4 });
  put('bg/south.svg', W, H, o, { id: 713 });
}
function bgWest() {
  seed(714);
  let o = shell();
  // 병이 놓인 선반
  o += part(rectPts(200, 300, 320, 14), C.wood, { sw: 1.6 });
  for (const x of [220, 480]) o += part([[x, 314], [x + 14, 314], [x + 4, 344]], C.wood2, { sw: 1.2 });
  for (let i = 0; i < 6; i++) { const x = 216 + i * 50, h = rand(40, 70), c = pick(['#4a6a5a', '#6a4a5a', '#5a5a7a', '#7a6a3a']); o += part([[x, 300], [x + 32, 300], [x + 30, 300 - h + 12], [x + 22, 300 - h], [x + 10, 300 - h], [x + 2, 300 - h + 12]], c, { sw: 1.4, shade: [[x + 18, 300 - h], [x + 34, 300 - h], [x + 34, 300], [x + 18, 300]], shadeCol: 'rgba(0,0,0,0.25)', hatch: false }); o += part(rectPts(x + 8, 300 - h - 8, 16, 10), C.copper, { sw: 1 }); o += line([[x + 6, 300 - h + 18], [x + 8, 290]], { sw: 2, color: '#fff', op: 0.25 }); }
  // 빛바랜 별자리 지도 (빈 벽 채우기)
  o += part(rectPts(626, 140, 212, 176), C.wood2, { sw: 2, heavy: [1, 2] }) + part(rectPts(638, 152, 188, 152), '#2b3150', { sw: 1.2 });
  const stars = [[664, 190], [700, 172], [742, 204], [786, 182], [808, 236], [760, 262], [700, 280], [668, 250]];
  o += line(stars.slice(0, 5), { sw: 1, color: C.moon, op: 0.6 }) + line(stars.slice(4), { sw: 1, color: C.moon, op: 0.6 });
  for (const [x, y] of stars) o += dot(x, y, 3, C.cream) + dot(x, y, 6, C.cream, 0.2);
  o += `<path d="${S(ellPts(732, 228, 70, 54, 0, Math.PI * 2, 18), 1)}" fill="none" stroke="${C.brass}" stroke-width="1" opacity="0.5"/>`;
  // 못에 걸린 멈춘 회중시계 둘 (모두 다른 시각에 멈춤 → 오싹한 분위기)
  for (const [x, y, h, m] of [[676, 392, 2, 40], [784, 410, 9, 5]]) {
    o += line([[x, y - 52], [x, y - 34]], { sw: 1.4, color: C.copper }) + dot(x, y - 54, 3, C.woodD);
    o += clockFace(x, y, 30, { h, m, slot: null });
  }
  // 오래된 책 더미와 마른 꽃병
  for (const [y, w, c] of [[640, 120, '#5a4a6a'], [618, 104, '#7a5a3a'], [598, 112, '#3e5a6e']]) o += part(rectPts(680 + (120 - w) / 2, y - 20, w, 20), c, { sw: 1.4 }) + line([[684 + (120 - w) / 2, y - 10], [676 + (120 + w) / 2, y - 10]], { sw: 1, color: C.brassL, op: 0.5 });
  o += part([[722, 578], [758, 578], [752, 530], [742, 522], [738, 522], [728, 530]], C.glass, { sw: 1.4 });
  for (const [dx, dy] of [[-18, -60], [0, -74], [16, -56]]) o += line([[740, 524], [740 + dx, 524 + dy]], { sw: 1.4, color: '#6a5a3a' }) + dot(740 + dx, 524 + dy, 5, '#8a6a7a');
  put('bg/west.svg', W, H, o, { id: 714 });
}

/* ───────────── 북쪽 소품 ───────────── */
function grandClock(full) {
  seed(721);
  const w = 320, h = 600;
  let o = `<path d="${S([[20, 592], [300, 592], [296, 600], [24, 600]])}" fill="${INK}" opacity="0.3"/>`;
  // 받침과 발
  for (const x of [40, 258]) o += part([[x, 570], [x + 22, 570], [x + 18, 596], [x + 4, 596]], C.woodD, { sw: 1.6 });
  o += part([[28, 500], [292, 500], [296, 576], [24, 576]], C.wood, { heavy: [1, 2], shade: [[200, 496], [300, 496], [300, 580], [200, 580]], shadeCol: 'rgba(0,0,0,0.22)' });
  o += part(rectPts(62, 516, 196, 44), 'none', { sw: 1.4 });
  // 허리 (유리창 속 시계추 공간)
  o += part([[58, 300], [262, 300], [262, 500], [58, 500]], C.wood2, { heavy: [1, 2], shade: [[200, 296], [270, 296], [270, 504], [200, 504]], shadeCol: 'rgba(0,0,0,0.25)' });
  o += part([[96, 314], [224, 314], [224, 488], [96, 488]], '#1d1820', { sw: 1.8 });
  o += line([[104, 320], [124, 340]], { sw: 2, color: '#fff', op: 0.15 });
  // 머리 (유리 덮개 + 시계판)
  o += part([[30, 300], [290, 300], [290, 70], [30, 70]], C.wood, { heavy: [1, 2], shade: [[220, 66], [300, 66], [300, 304], [220, 304]], shadeCol: 'rgba(0,0,0,0.22)' });
  o += part([[18, 300], [302, 300], [302, 316], [18, 316]], C.woodD, { sw: 1.8 });
  o += clockFace(160, 182, 104, { mirror: true, h: 4, m: 20, slot: full ? 'full' : 'empty' });
  o += `<path d="${S(ellPts(160, 182, 112, 112, 0, Math.PI * 2, 24), 0.3)}" fill="#cfe0e6" opacity="0.08"/>`;
  o += line([[96, 110], [130, 86]], { sw: 3, color: '#fff', op: 0.25 });
  // 왕관 장식과 꼭대기 구슬
  o += part([[20, 74], [60, 40], [110, 22], [160, 12], [210, 22], [260, 40], [300, 74]], C.woodD, { sw: 2, heavy: [2, 4] });
  o += part([[150, 14], [160, -6], [170, 14]], C.brass, { sw: 1.4 }) + dot(160, -10, 6, C.brass);
  for (const x of [30, 290]) o += part([[x - 8, 74], [x + 8, 74], [x + 4, 56], [x - 4, 56]], C.brass, { sw: 1.2 }) + dot(x, 50, 6, C.brass);
  // 문지방에 새긴 작은 13
  o += `<g transform="translate(0 0)">${''}</g>`;
  put(`props/clock${full ? '_full' : ''}.svg`, w, h, o, { id: 721, vb: '0 -20 320 620' });
}
function pendulum() {
  seed(722);
  let o = line([[30, 0], [30, 140]], { sw: 3, color: C.brass2 }) + line([[30, 0], [30, 140]], { sw: 1, color: C.brassL });
  o += part(ellPts(30, 152, 22, 22, 0, Math.PI * 2, 16), C.brass, { sw: 1.8, heavy: [2, 6], shade: [[30, 150], [56, 140], [56, 178], [24, 178]], shadeCol: 'rgba(90,60,10,0.3)', hatch: false });
  o += `<circle cx="24" cy="146" r="5" fill="#fff" opacity="0.5"/>`;
  put('props/pendulum.svg', 60, 180, o, { id: 722, displace: 1 });
}
function door(open) {
  seed(open ? 731 : 732);
  const w = 240, h = 380;
  const outl = [[10, h], [10, 100], [30, 46], [80, 14], [120, 6], [160, 14], [210, 46], [230, 100], [230, h]];
  let o = '';
  if (open) {
    o += part(outl, '#1a2040', { sw: 3 });
    for (let i = 0; i < 26; i++) o += dot(rand(24, 216), rand(24, 220), rand(0.8, 2.2), '#fff', rand(0.5, 1));
    o += dot(170, 70, 24, C.moon) + dot(162, 64, 22, '#1a2040', 0.9);
    o += part([[10, 300], [60, 260], [100, 280], [140, 240], [190, 266], [230, 250], [230, h], [10, h]], '#151a30', { sw: 1 });
    for (let k = 0; k < 6; k++) o += part(rectPts(96 + k * 4, 370 - k * 34, 48 - k * 8, 10), C.wood2, { sw: 1.2 });
    o += line([[90, h], [130, 170]], { sw: 3, color: C.wood2 }) + line([[150, h], [160, 170]], { sw: 3, color: C.wood2 });
    o += `<circle cx="120" cy="120" r="80" fill="#cfe0e6" opacity="0.18" filter="url(#blur)"/>`;
    o += part([[10, 60], [38, 40], [38, h + 8], [10, h]], C.wood2, { sw: 2.4 });
  } else {
    o += part(outl, C.wood, { heavy: [5, 8], sw: 2.6, shade: [[150, 0], [240, 0], [240, h], [160, h]], shadeCol: 'rgba(0,0,0,0.25)' });
    for (let x = 46; x < 230; x += 36) o += line([[x, 24 + Math.abs(120 - x) * 0.3], [x, h - 4]], { sw: 1.4, op: 0.6 });
    for (const y of [120, 300]) { o += part([[10, y - 8], [150, y - 6], [158, y], [150, y + 6], [10, y + 8]], '#2a2a30', { sw: 1.4 }); for (const x of [30, 70, 110]) o += dot(x, y, 3, C.brassL); }
    // 작은 시계판 자물쇠 (바늘이 12시에 멈춰 있음)
    o += clockFace(120, 210, 38, { h: 12, m: 0, slot: null });
    o += dot(196, 230, 8, C.brass);
  }
  put(`props/door_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: open ? 731 : 732 });
}
function spider() {
  seed(735);
  let o = line([[20, 0], [20, 40]], { sw: 1, color: C.web, op: 0.8 });
  o += part(ellPts(20, 50, 9, 10, 0, Math.PI * 2, 12), '#2a2030', { sw: 1.2 });
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) o += line([[20 + sx * 6, 46 + k * 3], [20 + sx * 14, 40 + k * 6], [20 + sx * 18, 48 + k * 6]], { sw: 1.2 });
  o += dot(16, 48, 2.2, '#fff') + dot(24, 48, 2.2, '#fff') + dot(16, 48, 1, INK) + dot(24, 48, 1, INK);
  o += line([[17, 54], [20, 56], [23, 54]], { sw: 0.8, color: '#fff' });
  put('props/spider.svg', 40, 66, o, { id: 735, displace: 0.6 });
}

/* ───────────── 동쪽 소품 ───────────── */
function windowNight() {
  seed(741);
  const r = 180;
  let o = `<defs><radialGradient id="sky" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#3a4a7a"/><stop offset="1" stop-color="#1a2040"/></radialGradient></defs>`;
  o += `<circle cx="190" cy="190" r="${r}" fill="url(#sky)"/>`;
  for (let i = 0; i < 40; i++) { const a = rand(0, Math.PI * 2), d = rand(0, r - 10); o += dot(190 + Math.cos(a) * d, 190 + Math.sin(a) * d * 0.8 - 20, rand(0.8, 2.2), '#fff', rand(0.5, 1)); }
  o += `<circle cx="250" cy="110" r="60" fill="#cfe0e6" opacity="0.35" filter="url(#blur)"/>` + dot(250, 110, 34, C.moon) + dot(240, 102, 6, '#b8cad2', 0.8) + dot(262, 122, 4, '#b8cad2', 0.8);
  // 지붕들과 먼 시계탑
  o += part([[10, 300], [60, 250], [110, 280], [110, 240], [150, 200], [190, 240], [190, 270], [250, 230], [300, 270], [370, 250], [370, 380], [10, 380]], '#141830', { sw: 1 });
  o += dot(150, 230, 10, '#ffd77a', 0.8) + part(rectPts(270, 280, 12, 14), '#ffd77a', { sw: 0.6 });
  o += `<circle cx="190" cy="190" r="${r}" fill="none" stroke="${C.woodD}" stroke-width="16"/>`;
  o += line([[190, 10], [190, 370]], { sw: 8, color: C.woodD }) + line([[10, 190], [370, 190]], { sw: 8, color: C.woodD });
  o += line(ellPts(190, 190, 90, 90, 0, Math.PI * 2, 24), { sw: 6, color: C.woodD, step: 999 });
  o += line([[70, 120], [110, 80]], { sw: 3, color: '#fff', op: 0.25 });
  put('props/window.svg', 380, 380, o, { id: 741 });
}
function curtains(open) {
  seed(742);
  const w = 520, h = 480;
  let o = part([[0, 6], [520, 6], [520, 20], [0, 20]], C.brass2, { sw: 1.6 }) + dot(6, 13, 10, C.brass) + dot(514, 13, 10, C.brass);
  const panel = (x0, x1, gathered) => {
    const pts = gathered ? [[x0, 20], [x1, 20], [x1 - (x1 - x0) * 0.3, 220], [x1 - 6, 460], [x0, 460]] : [[x0, 20], [x1, 20], [x1, 470], [x0, 470]];
    let g = part(pts, C.velvet, { heavy: [1, 2], shade: gathered ? undefined : [[(x0 + x1) / 2, 20], [x1, 20], [x1, 470], [(x0 + x1) / 2, 470]], shadeCol: 'rgba(20,10,30,0.25)' });
    const n = gathered ? 4 : 8;
    for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n; g += line([[x, 24], [gathered ? x - (x - x0) * 0.25 : x + rand(-5, 5), 456]], { sw: 1.4, color: C.velvet2 }); }
    g += part([[x0, 446], [x1, 446], [x1, 470], [x0, 470]].map(([x, y]) => [x, gathered ? y - 10 : y]), C.brass2, { sw: 1 });
    for (let x = x0 + 6; x < x1 - 4; x += 8) g += line([[x, gathered ? 460 : 470], [x + 1, gathered ? 474 : 484]], { sw: 1.4, color: C.brass });
    return g;
  };
  if (open) {
    o += panel(0, 110, true) + panel(520, 410, true);
    for (const x of [70, 450]) o += part([[x - 24, 214], [x + 24, 210], [x + 22, 226], [x - 22, 230]], C.brass, { sw: 1.2 }) + line([[x, 228], [x - 4, 280]], { sw: 2, color: C.brass2 }) + part([[x - 10, 278], [x + 2, 278], [x + 6, 304], [x - 14, 304]], C.brass, { sw: 1 });
  } else {
    o += panel(0, 262, false) + panel(520, 258, false);
  }
  put(`props/curtains_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: 742, vb: '0 0 520 490' });
}
function glowWriting() {
  seed(743);
  let o = `<filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>`;
  let lines = '';
  for (let r = 0; r < 4; r++) { let x = 20 + rand(0, 20); const y = 40 + r * 40; while (x < 270 - r * 30) { const w = rand(14, 30); lines += `<path d="${O([[x, y + rand(-4, 4)], [x + w * 0.3, y - 10], [x + w * 0.6, y + 6], [x + w, y - 4]], 0.6)}" fill="none" stroke="#a8ffd8" stroke-width="3.4" stroke-linecap="round"/>`; x += w + rand(6, 14); } }
  lines += `<path d="${S(ellPts(250, 172, 14, 18, 0, Math.PI * 2, 10), 0.6)}" fill="none" stroke="#a8ffd8" stroke-width="3"/>`;
  o += `<g filter="url(#g)" opacity="0.9">${lines}</g><g opacity="0.95">${lines}</g>`;
  writeFileSync(OUT + 'props/glow.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">${o}</svg>`);
}
function moonBeam() {
  raw('bg/moonbeam_east.svg', W, H, `<defs><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter></defs><path d="M640 200 L960 200 L1200 900 L500 900Z" fill="#cfe0e6" opacity="0.28" filter="url(#b)"/><circle cx="800" cy="330" r="200" fill="#cfe0e6" opacity="0.25" filter="url(#b)"/>`);
}

/* ───────────── 남쪽 소품 ───────────── */
function mirror(moon) {
  seed(751);
  const w = 380, h = 480;
  let o = `<path d="${S([[40, 470], [340, 470], [336, 478], [44, 478]])}" fill="${INK}" opacity="0.25"/>`;
  // 금박 액자: 위쪽 리본 장식, 타원 틀
  o += part(ellPts(190, 250, 170, 220, 0, Math.PI * 2, 30), C.brass, { heavy: [2, 10], sw: 2.4, shade: [[190, 250], [380, 120], [380, 480], [60, 480]], shadeCol: 'rgba(90,60,10,0.3)' });
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; o += dot(190 + Math.cos(a) * 158, 250 + Math.sin(a) * 206, 4, C.brassL); }
  o += part(ellPts(190, 250, 146, 192, 0, Math.PI * 2, 30), moon ? '#3c4a64' : '#161a26', { sw: 2 });
  if (moon) {
    // 거울에 비친 시계 (흐릿하게)
    o += `<g opacity="0.55">${clockFace(190, 220, 70, { h: 4, m: 20, slot: 'empty' })}</g>`;
    o += `<path d="${S(ellPts(190, 250, 146, 192, 0, Math.PI * 2, 30), 0.2)}" fill="#cfe0e6" opacity="0.15"/>`;
  }
  o += line([[100, 140], [160, 80]], { sw: 5, color: '#fff', op: moon ? 0.35 : 0.12 }) + line([[96, 186], [134, 148]], { sw: 3, color: '#fff', op: moon ? 0.3 : 0.1 });
  o += part([[130, 30], [190, 6], [250, 30], [230, 46], [190, 34], [150, 46]], C.brass, { sw: 1.8 });
  o += part([[150, 448], [190, 474], [230, 448], [210, 440], [190, 452], [170, 440]], C.brass, { sw: 1.6 });
  put(`props/mirror_${moon ? 'moon' : 'dark'}.svg`, w, h, o, { id: 751 });
}
function desk() {
  seed(752);
  const w = 400, h = 300;
  let o = `<path d="${S([[10, 292], [390, 292], [386, 300], [14, 300]])}" fill="${INK}" opacity="0.3"/>`;
  for (const x of [24, 350]) o += part([[x, 120], [x + 26, 120], [x + 22, 296], [x + 4, 296]], C.wood2, { sw: 1.8 });
  o += part([[0, 90], [400, 90], [400, 124], [0, 124]], C.wood, { heavy: [1, 2], sw: 2.2 });
  o += part([[60, 126], [340, 126], [340, 186], [60, 186]], C.wood3, { sw: 2, heavy: [1, 2], shade: [[260, 120], [350, 120], [350, 190], [260, 190]], shadeCol: 'rgba(0,0,0,0.2)', hatch: false });
  o += part(ellPts(200, 156, 14, 10, 0, Math.PI * 2, 10), 'none', { sw: 3 }) + part(rectPts(186, 140, 28, 8), C.brass, { sw: 1 });
  // 위: 책 더미, 잉크병과 깃펜, 모래시계
  for (let k = 0; k < 3; k++) o += part(rectPts(30 + k * 4, 84 - k * 18, 110 - k * 10, 18), pick(['#6c4a6e', '#3e5a6e', '#7a5a3a']), { sw: 1.4 });
  o += part([[180, 90], [212, 90], [214, 66], [196, 58], [178, 66]], '#1d2430', { sw: 1.6 }) + part(rectPts(188, 50, 16, 10), C.copper, { sw: 1 });
  o += part([[198, 56], [230, -10], [242, -20], [238, -2], [204, 60]], C.cream, { sw: 1.2 });
  o += part([[280, 90], [330, 90], [330, 82], [280, 82]], C.wood2, { sw: 1.4 }) + part([[280, 26], [330, 26], [330, 34], [280, 34]], C.wood2, { sw: 1.4 });
  o += part([[288, 34], [322, 34], [308, 58], [322, 82], [288, 82], [302, 58]], '#d9e4ea', { sw: 1.4, extra: `<path d="M296 70 L314 70 L322 82 L288 82Z" fill="#d9b86a"/>` });
  put('props/desk.svg', w, h, o, { id: 752, vb: '0 -30 400 330' });
}

/* ───────────── 서쪽 소품 ───────────── */
function trunk(open) {
  seed(761);
  const w = 400, h = 280;
  let o = `<path d="${S([[20, 270], [380, 270], [376, 280], [24, 280]])}" fill="${INK}" opacity="0.3"/>`;
  if (open) {
    o += part([[30, 120], [370, 120], [384, 0], [16, 0]], '#4a2f2a', { sw: 2.4, heavy: [1, 2] });
    o += part([[44, 108], [356, 108], [366, 14], [34, 14]], C.velvet2, { sw: 1.6 });
  }
  o += part([[20, 120], [380, 120], [380, 266], [20, 266]], '#7a4a36', { heavy: [1, 2], shade: [[280, 116], [390, 116], [390, 270], [280, 270]], shadeCol: 'rgba(0,0,0,0.25)' });
  if (!open) o += part([[14, 120], [386, 120], [376, 60], [24, 60]], '#8a5440', { sw: 2.2, heavy: [1, 2], shade: [[300, 56], [390, 56], [390, 124], [300, 124]], shadeCol: 'rgba(0,0,0,0.22)', hatch: false });
  for (const x of [90, 310]) o += part(rectPts(x - 12, open ? 120 : 60, 24, open ? 146 : 206), '#4a3020', { sw: 1.4 });
  for (const [x, y] of [[20, 120], [380, 120], [20, 266], [380, 266]]) o += part([[x - 14, y - 14], [x + 14, y - 14], [x + 14, y + 4], [x - 14, y + 4]].map(([a, b]) => [Math.min(Math.max(a, 8), 392), Math.min(b, 270)]), C.brass, { sw: 1.2 });
  // 시계 자물쇠
  o += clockFace(200, 168, 42, { h: 12, m: 0, slot: null });
  put(`props/trunk_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: 761 });
}
function stand(lit) {
  seed(762);
  const w = 140, h = 400;
  let o = `<path d="${S([[20, 392], [120, 392], [116, 400], [24, 400]])}" fill="${INK}" opacity="0.3"/>`;
  for (const [dx] of [[-46], [46], [0]]) o += line([[70, 340], [70 + dx, 394]], { sw: 5, color: '#2a2a30' });
  o += line([[70, 120], [70, 350]], { sw: 6, color: '#2a2a30' }) + line(ellPts(70, 250, 12, 18, 0, Math.PI * 2, 12), { sw: 3, color: '#2a2a30', step: 999 });
  o += part([[30, 118], [110, 118], [96, 130], [44, 130]], '#3a3a42', { sw: 1.6 });
  if (lit) {
    o += part([[56, 118], [84, 118], [84, 50], [56, 50]], '#efe3c6', { sw: 1.6, heavy: [1, 2] });
    o += part([[56, 60], [60, 76], [62, 64]], '#e6d6b0', { sw: 0.8 });
    o += line([[70, 50], [70, 40]], { sw: 1.6 });
    o += `<circle cx="70" cy="22" r="40" fill="#ffd77a" opacity="0.45" filter="url(#blur)"/>`;
    o += part([[70, 0], [80, 22], [76, 38], [64, 38], [60, 22]], '#ffd77a', { sw: 1.2 }) + part([[70, 14], [74, 28], [70, 36], [66, 28]], '#fff6d8', { sw: 0 });
  }
  put(`props/stand_${lit ? 'lit' : 'empty'}.svg`, w, h, o, { id: 762 });
}
function candleGlow() {
  raw('bg/candleglow_west.svg', W, H, `<defs><radialGradient id="g"><stop offset="0" stop-color="#ffd77a" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb860" stop-opacity="0.35"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient></defs><circle cx="930" cy="330" r="520" fill="url(#g)"/>`);
}
function ghost(state) {
  seed(771);
  put(`props/ghost_${state}.svg`, 360, 380, ghostShadowArt(state), { id: 771, displace: 1.4, vb: '0 -10 360 380' });
}

/* ───────────── 확대 화면 ───────────── */
function zoomClock(full) {
  seed(781);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.wood);
  for (let x = 0; x < W; x += 70) o += line([[x, 0], [x + rand(-6, 6), H]], { sw: 1.4, op: 0.4, step: 120 });
  o += part(rectPts(380, 20, 840, 860), C.wood2, { sw: 3 });
  o += clockFace(800, 450, 360, { mirror: true, h: 4, m: 20, slot: full ? 'full' : 'empty' });
  o += line([[560, 230], [680, 150]], { sw: 8, color: '#fff', op: 0.18 });
  put(`zoom/clock${full ? '_full' : ''}.svg`, W, H, o, { id: 781, displace: 3 });
}
function zoomMirror(moon) {
  seed(782);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.paper2);
  for (let y = 60; y < H; y += 70) for (let x = 40 + ((y / 70) % 2) * 40; x < W; x += 80) o += `<path d="${S([[x, y - 14], [x + 9, y], [x, y + 14], [x - 9, y]], 0.4)}" fill="${C.motif}" opacity="0.35"/>`;
  o += part(ellPts(800, 450, 440, 430, 0, Math.PI * 2, 40), C.brass, { sw: 3, heavy: [3, 14], shade: [[800, 450], [1300, 300], [1300, 900], [500, 900]], shadeCol: 'rgba(90,60,10,0.28)' });
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; o += dot(800 + Math.cos(a) * 410, 450 + Math.sin(a) * 400, 7, C.brassL); }
  o += part(ellPts(800, 450, 380, 370, 0, Math.PI * 2, 40), moon ? '#34425c' : '#12151f', { sw: 3 });
  if (moon) {
    o += clockFace(800, 440, 250, { h: 4, m: 20, slot: 'empty' });
    o += `<path d="${S(ellPts(800, 450, 380, 370, 0, Math.PI * 2, 40), 0.3)}" fill="#cfe0e6" opacity="0.12"/>`;
  }
  o += line([[560, 260], [700, 130]], { sw: 10, color: '#fff', op: moon ? 0.25 : 0.08 }) + line([[540, 340], [620, 260]], { sw: 6, color: '#fff', op: moon ? 0.2 : 0.06 });
  put(`zoom/mirror_${moon ? 'moon' : 'dark'}.svg`, W, H, o, { id: 782, displace: 3 });
}
function zoomGlow() {
  seed(783);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#2e2638');
  for (let y = 60; y < H; y += 70) for (let x = 40 + ((y / 70) % 2) * 40; x < W; x += 80) o += `<path d="${S([[x, y - 14], [x + 9, y], [x, y + 14], [x - 9, y]], 0.4)}" fill="#4a3e58" opacity="0.5"/>`;
  o += `<rect width="${W}" height="${H}" fill="#cfe0e6" opacity="0.06"/>`;
  put('zoom/glowwall.svg', W, H, o, { id: 783, displace: 2 });
}
function zoomTrunkLock() {
  seed(784);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#7a4a36');
  for (let y = 0; y < H; y += 30) o += line([[0, y + rand(0, 8)], [W, y + rand(0, 10)]], { sw: 1.2, op: 0.25, step: 140, amp: 3 });
  for (const x of [200, 1400]) o += part(rectPts(x - 40, 0, 80, H), '#4a3020', { sw: 2 });
  o += part(ellPts(800, 400, 300, 300, 0, Math.PI * 2, 30), C.brass2, { sw: 3 });
  o += clockFace(800, 400, 260, { h: null, m: null, slot: null });
  o += part([[560, 680], [1040, 680], [1040, 800], [560, 800]], C.brass, { sw: 2.4, heavy: [1, 2] });
  o += part(rectPts(780, 700, 40, 60), '#2a1e16', { sw: 1.6 });
  put('zoom/trunk_lock.svg', W, H, o, { id: 784, displace: 3 });
}
function lockParts() {
  seed(785);
  // 시침·분침 (아래 가운데가 회전축). 100x260 / 60x320
  raw('zoom/hand_hour.svg', 60, 150, hand(30, 144, 138, 0, 'hour'));
  raw('zoom/hand_min.svg', 40, 230, hand(20, 224, 218, 0, 'min'));
  // 돌리는 손잡이: 짧은 바늘 / 긴 바늘 그림이 새겨진 황동 손잡이
  for (const [n, len] of [['knob_hour', 34], ['knob_min', 56]]) {
    let o = part(ellPts(75, 75, 64, 64, 0, Math.PI * 2, 20), C.brass, { sw: 2.4, heavy: [2, 8], shade: [[75, 75], [150, 30], [150, 150], [40, 150]], shadeCol: 'rgba(90,60,10,0.3)', hatch: false });
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; o += line([[75 + Math.cos(a) * 58, 75 + Math.sin(a) * 58], [75 + Math.cos(a) * 64, 75 + Math.sin(a) * 64]], { sw: 1.4 }); }
    o += part(ellPts(75, 75, 44, 44, 0, Math.PI * 2, 18), C.brassL, { sw: 1.4 });
    o += hand(75, 92, len, 0, n === 'knob_hour' ? 'hour' : 'min');
    o += line([[110, 30], [128, 44]], { sw: 2, color: '#fff', op: 0.5 });
    put(`zoom/${n}.svg`, 150, 150, o, { id: 786, displace: 1 });
  }
}
function zoomTrunkOpen() {
  seed(787);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#3a2420');
  o += part([[160, 80], [1440, 80], [1500, 860], [100, 860]], '#7a4a36', { sw: 4 });
  o += part([[230, 140], [1370, 140], [1420, 800], [180, 800]], C.velvet2, { sw: 3 });
  for (let i = 0; i < 30; i++) o += line([[rand(260, 1340), rand(180, 760)], [rand(260, 1340), rand(180, 760)]], { sw: 1, color: '#3e2840', op: 0.3, step: 200 });
  o += hatch(wob([[230, 140], [1370, 140], [1360, 220], [240, 220]]), 0.4);
  // 묶인 옛 편지와 레이스 손수건
  o += part([[300, 560], [520, 540], [540, 690], [316, 710]], C.cream2, { sw: 2 }) + line([[300, 620], [536, 600]], { sw: 3, color: C.red }) + line([[410, 548], [430, 700]], { sw: 3, color: C.red });
  o += part([[1100, 600], [1300, 590], [1320, 740], [1090, 750]], '#e9e4ea', { sw: 1.8 });
  for (let x = 1100; x < 1310; x += 14) o += dot(x, 594 + (x - 1100) * -0.05, 4, '#e9e4ea', 0.9);
  put('zoom/trunk_open.svg', W, H, o, { id: 787, displace: 3 });
}
function zoomDrawer() {
  seed(788);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#4a3020');
  o += part([[180, 120], [1420, 120], [1500, 860], [100, 860]], C.wood3, { sw: 4 });
  o += part([[240, 170], [1360, 170], [1420, 800], [180, 800]], '#3a2a2a', { sw: 3 });
  o += hatch(wob([[240, 170], [1360, 170], [1340, 240], [260, 240]]), 0.45);
  // 깃털, 단추, 열쇠 없는 열쇠고리
  o += part([[300, 660], [560, 520], [580, 540], [320, 680]], C.cream, { sw: 1.8 });
  for (let i = 0; i < 12; i++) o += line([[330 + i * 20, 650 - i * 11], [340 + i * 20, 668 - i * 11]], { sw: 1, op: 0.5 });
  for (const [x, y, c] of [[1100, 640, C.brass], [1160, 690, '#6a7a8e'], [1060, 700, C.red]]) o += part(ellPts(x, y, 18, 18, 0, Math.PI * 2, 12), c, { sw: 1.6 }) + dot(x - 5, y, 2.4, INK) + dot(x + 5, y, 2.4, INK);
  o += line(ellPts(1250, 400, 40, 40, 0, Math.PI * 2, 16), { sw: 5, color: C.brass2, step: 999 });
  put('zoom/drawer.svg', W, H, o, { id: 788, displace: 3 });
}

/* ───────────── 아이템 (160x160) ───────────── */
function items() {
  const I = (n, b, id) => put(`items/${n}.svg`, 160, 160, b, { id, displace: 1.4 });
  seed(801);
  I('candle', part([[62, 140], [98, 140], [98, 40], [62, 40]], '#efe3c6', { heavy: [1, 2], shade: [[84, 30], [104, 30], [104, 146], [84, 146]], shadeCol: 'rgba(120,90,40,0.2)', hatch: false }) + part([[62, 52], [66, 74], [70, 56]], '#e3d2a6', { sw: 1 }) + line([[80, 40], [80, 26]], { sw: 2 }) + part([[48, 140], [112, 140], [116, 150], [44, 150]], C.copper, { sw: 1.6 }), 801);
  seed(802);
  I('matches', part([[30, 60], [130, 50], [134, 120], [34, 130]], C.red, { heavy: [1, 2], sw: 2.2 }) + part([[44, 72], [118, 66], [120, 108], [46, 114]], C.cream, { sw: 1.4 }) + part(ellPts(82, 90, 18, 14, 0, Math.PI * 2, 10), '#f2c46b', { sw: 1.2 }) + [0, 1, 2].map((k) => line([[110 + k * 8, 50], [116 + k * 8, 14]], { sw: 3, color: C.cream2 }) + dot(116 + k * 8, 12, 5, C.red)).join(''), 802);
  seed(803);
  I('candle_lit', part([[62, 140], [98, 140], [98, 56], [62, 56]], '#efe3c6', { heavy: [1, 2], sw: 2 }) + part([[48, 140], [112, 140], [116, 150], [44, 150]], C.copper, { sw: 1.6 }) + line([[80, 56], [80, 46]], { sw: 2 }) + `<circle cx="80" cy="30" r="30" fill="#ffd77a" opacity="0.5" filter="url(#blur)"/>` + part([[80, 6], [92, 30], [86, 46], [74, 46], [68, 30]], '#ffd77a', { sw: 1.2 }) + part([[80, 20], [84, 34], [80, 42], [76, 34]], '#fff6d8', { sw: 0 }), 803);
  seed(804);
  I('can', part([[38, 40], [122, 40], [124, 140], [36, 140]], '#9aa4a8', { heavy: [1, 2], shade: [[96, 36], [130, 36], [130, 144], [96, 144]], shadeCol: 'rgba(0,0,0,0.2)', hatch: false }) + part(ellPts(80, 40, 42, 10, 0, Math.PI * 2, 16), '#c2c8cc', { sw: 1.6 }) + part([[38, 66], [122, 66], [122, 120], [38, 120]], '#5a8a4a', { sw: 1.4 }) + leaf(56, 110, 44, -1.0, '#8ac06a', { w: 0.55 }) + leaf(70, 112, 40, -1.6, '#6fa84f', { w: 0.55 }) + leaf(84, 110, 38, -2.1, '#8ac06a', { w: 0.55 }) + part(ellPts(104, 84, 12, 12, 0, Math.PI * 2, 10), C.cream, { sw: 1 }) + line([[100, 86], [104, 80], [108, 86]], { sw: 1.2 }), 804);
  seed(805);
  I('piece', `<g transform="rotate(-8 80 80)">${part([[18, 52], [142, 48], [146, 112], [16, 116]], C.brassL, { heavy: [1, 2], sw: 2.4, shade: [[90, 44], [150, 44], [150, 118], [90, 118]], shadeCol: 'rgba(120,80,20,0.25)', hatch: false })}${roman('XIII', 80, 82, 36, C.red, 4)}${dot(24, 60, 3, C.brass2)}${dot(138, 104, 3, C.brass2)}</g>`, 805);
}

shell; bgNorth(); bgEast(); bgSouth(); bgWest();
grandClock(false); grandClock(true); pendulum(); door(false); door(true); spider();
windowNight(); curtains(false); curtains(true); glowWriting(); moonBeam();
mirror(false); mirror(true); desk();
trunk(false); trunk(true); stand(false); stand(true); candleGlow(); ghost('talk'); ghost('happy'); ghost('shy');
put('props/ghost_icon.svg', 130, 120, ghostIconArt(), { id: 790, displace: 0.8 });
zoomClock(false); zoomClock(true); zoomMirror(false); zoomMirror(true); zoomGlow(); zoomTrunkLock(); lockParts(); zoomTrunkOpen(); zoomDrawer();
function extras() {
  seed(806);
  // 회중시계: 바늘 두 개, 얼굴(문자판)은 있지만 웃지 않음
  put('items/watch.svg', 160, 160, line(ellPts(80, 30, 14, 14, Math.PI, Math.PI * 2.05, 10), { sw: 5, color: C.brass2, step: 999 }) + part(ellPts(80, 92, 58, 58, 0, Math.PI * 2, 22), C.brass, { sw: 2.6, heavy: [2, 8] }) + clockFace(80, 92, 46, { h: 10, m: 10, slot: null }) + part(rectPts(72, 26, 16, 12), C.brass2, { sw: 1.4 }), { id: 806, displace: 1 });
  // 실패와 바늘 (바느질을 할 수 있는 바늘!)
  put('items/spool.svg', 160, 160, part([[44, 40], [116, 40], [112, 54], [48, 54]], C.wood, { sw: 1.8 }) + part([[52, 54], [108, 54], [108, 112], [52, 112]], '#7a4a8a', { sw: 1.8, heavy: [1, 2] }) + [0, 1, 2, 3, 4, 5].map((k) => line([[54, 62 + k * 8], [106, 60 + k * 8]], { sw: 1, color: '#5a3268', op: 0.8 })).join('') + part([[44, 112], [116, 112], [112, 126], [48, 126]], C.wood, { sw: 1.8 }) + line([[118, 20], [96, 108]], { sw: 3, color: C.grey }) + dot(118, 22, 3, '#fff') + line([[106, 70], [128, 50], [118, 24]], { sw: 1.4, color: '#7a4a8a' }), { id: 807, displace: 1 });
  put('items/smallkey.svg', 160, 160, `<g transform="rotate(-35 80 80)">${part(ellPts(80, 46, 18, 18, 0, Math.PI * 2, 12), C.copper, { sw: 2 })}${part(ellPts(80, 46, 7, 7, 0, Math.PI * 2, 8), '#2a1e16', { sw: 1 })}${part([[75, 62], [85, 62], [85, 130], [75, 130]], C.copper, { sw: 1.8 })}${part([[85, 112], [98, 112], [98, 120], [85, 120]], C.copper, { sw: 1.2 })}</g>`, { id: 808, displace: 1 });
  // 작은 열쇠를 거미줄에 매단 거미
  seed(809);
  let o = line([[20, 0], [20, 40]], { sw: 1, color: C.web, op: 0.8 });
  o += part(ellPts(20, 50, 9, 10, 0, Math.PI * 2, 12), '#2a2030', { sw: 1.2 });
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) o += line([[20 + sx * 6, 46 + k * 3], [20 + sx * 14, 40 + k * 6], [20 + sx * 18, 48 + k * 6]], { sw: 1.2 });
  o += dot(16, 48, 2.2, '#fff') + dot(24, 48, 2.2, '#fff') + dot(16, 48, 1, INK) + dot(24, 48, 1, INK) + line([[17, 54], [20, 56], [23, 54]], { sw: 0.8, color: '#fff' });
  o += line([[20, 60], [22, 84]], { sw: 1, color: C.web }) + `<g transform="translate(6 76) scale(0.22)">${part(ellPts(80, 46, 18, 18, 0, Math.PI * 2, 12), C.copper, { sw: 6 })}${part([[75, 62], [85, 62], [85, 130], [75, 130]], C.copper, { sw: 5 })}</g>`;
  put('props/spider_key.svg', 40, 120, o, { id: 809, displace: 0.6 });
  // 잠긴 책상 서랍 자물쇠판
  put('props/drawer_lock.svg', 60, 50, part(rectPts(6, 6, 48, 38), C.copper, { sw: 1.6 }) + part(ellPts(30, 22, 6, 6, 0, Math.PI * 2, 8), '#2a1e16', { sw: 1 }) + part([[27, 26], [33, 26], [32, 36], [28, 36]], '#2a1e16', { sw: 0.8 }), { id: 810, displace: 0.6 });
}
extras();
items();
console.log('clock13 assets written, ~' + Math.round(total / 1024) + 'KB');
