// 2장 「토끼의 장난감 공방」 그래픽 에셋 생성기
// node tools/art/toyshop.mjs  → assets/rooms/toyshop/** 에 SVG를 다시 그린다.
// 분위기: 딸기우유·버터·민트, 원목. 귀엽고 아기자기하지만 유아용 그림체는 피한다.
import { seed, rand, pick, INK, wob, rect, rectPts, ell, ellPts, rot, shape, fill, line, hatch, leaf, svg } from './ink.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { mochaArt, mouseArt, mousePeekArt, part, S, O, tufts } from './chars.mjs';

const OUT = new URL('../../assets/rooms/toyshop/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  pink: '#efc4bd', pink2: '#e2aaa3', pinkD: '#c98a86', rose: '#d98c95', rose2: '#b9707c',
  butter: '#f4d98b', butter2: '#e3bf62', mint: '#9fcfb9', mint2: '#7db59c', mintD: '#5a8f78',
  wood: '#c9965f', wood2: '#b07c47', wood3: '#ddb07a', woodD: '#7a5236',
  red: '#c4473a', red2: '#9e3429', cream: '#f6ecd8', cream2: '#e9dcc0', fur: '#f4e8d6', fur2: '#e2d0b6',
  orange: '#e8873a', orange2: '#c96a22', leaf: '#6f9a4f', leaf2: '#4f7c3a',
  brass: '#d4a649', brass2: '#9d7428', brassL: '#f0cf7c', grey: '#a7a3a6', grey2: '#7f7a80', blue: '#8fb3d9', blue2: '#6b8fb8', lilac: '#b9a3d6',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const raw = (rel, w, h, body) => { mkdirSync(OUT + rel.split('/').slice(0, -1).join('/'), { recursive: true }); writeFileSync(OUT + rel, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;

/* ───────────── 토끼 그림자 조각 (조각·그림자·액자가 모두 같은 모양을 쓴다) ───────────── */
// 각 조각의 회전 0도 모양. 상자 크기: 몸 220x170, 머리 150x130, 귀 100x150
function bodyD() {
  return wob([...ellPts(120, 92, 96, 68, 0, Math.PI * 2, 26)], { step: 999, amp: 0.8 }) + wob(ellPts(26, 78, 24, 24, 0, Math.PI * 2, 12), { step: 999, amp: 0.6 }) + wob(ellPts(150, 156, 52, 13, 0, Math.PI * 2, 14), { step: 999, amp: 0.6 });
}
function headD() {
  // 바깥 머리 + 코 + (evenodd로 뚫린) 눈
  return wob(ellPts(68, 70, 56, 54, 0, Math.PI * 2, 22), { step: 999, amp: 0.7 }) + wob(ellPts(122, 84, 18, 16, 0, Math.PI * 2, 10), { step: 999, amp: 0.5 });
}
const eyeD = () => wob(ellPts(90, 56, 8, 8, 0, Math.PI * 2, 8), { step: 999, amp: 0.3 });
function earsD() {
  const e1 = rot(ellPts(0, 0, 19, 70, 0, Math.PI * 2, 18), -0.14, 36, 76);
  const e2 = rot(ellPts(0, 0, 19, 68, 0, Math.PI * 2, 18), 0.16, 66, 80);
  return wob(e1, { step: 999, amp: 0.6 }) + wob(e2, { step: 999, amp: 0.6 }) + wob(ellPts(52, 140, 34, 11, 0, Math.PI * 2, 12), { step: 999, amp: 0.5 });
}
// 조각 상대 위치 (그림자 화면에서도 같은 배치)
export const SIL = { body: [0, 140, 220, 170], head: [164, 66, 150, 130], ears: [200, -60, 100, 150] };
function silhouette(ox, oy, s, col, op = 1) {
  const g = (k, d, extra = '') => { const [x, y] = SIL[k]; return `<g transform="translate(${ox + x * s} ${oy + y * s}) scale(${s})"><path d="${d}" fill="${col}" fill-rule="evenodd"${extra}/></g>`; };
  return `<g opacity="${op}">${g('body', bodyD())}${g('head', headD() + eyeD())}${g('ears', earsD())}</g>`;
}
function woodPiece(file, w, h, d, idn) {
  seed(idn);
  let o = `<path d="${d}" fill="${C.wood3}" fill-rule="evenodd" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
  o += `<clipPath id="cp"><path d="${d}" fill-rule="evenodd"/></clipPath><g clip-path="url(#cp)">`;
  for (let y = 6; y < h; y += 11) o += line([[0, y + rand(-2, 2)], [w, y + rand(-3, 3)]], { sw: 1, color: C.wood2, op: 0.7, step: 40, amp: 1.6 });
  o += `<rect x="${w * 0.55}" y="0" width="${w}" height="${h}" fill="url(#hatch)" opacity="0.25"/></g>`;
  put(`zoom/${file}.svg`, w, h, o, { id: idn, displace: 1.6 });
}

/* ───────────── 공방 껍데기 ───────────── */
function shell({ wall = C.pink, wall2 = C.pink2 } = {}) {
  let o = '';
  // 천장 판자와 들보
  o += shape(wob([[0, 0], [W, 0], [1460, 70], [140, 70]], { sharp: true }), C.woodD, { sw: 2 });
  for (let i = 0; i <= 12; i++) o += line([[i * 133, 0], [140 + i * 110, 70]], { sw: 1.6, color: '#5e3d25', op: 0.8 });
  o += shape(rect(140, 62, 1320, 14, { sharp: true }), C.wood2);
  // 옆벽
  for (const side of [0, 1]) {
    const X = (u) => side ? W - 140 * u : 140 * u;
    const at = (u, v) => [X(u), 70 * u + (900 - 260 * u - 70 * u) * v];
    o += shape(wob([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { sharp: true, amp: 0.5 }), wall2, { sw: 2 });
    for (let k = 1; k < 5; k++) o += line([at(k / 5, 0), at(k / 5, 0.62)], { sw: 1.2, color: C.pinkD, op: 0.5 });
    o += shape(wob([at(0, 0.62), at(1, 0.62), at(1, 1), at(0, 1)], { sharp: true, amp: 0.5 }), C.mint2);
    o += line([at(0, 0.62), at(1, 0.62)], { sw: 6, color: C.wood2 });
    o += hatch(wob([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { sharp: true }), 0.25, 'hatch2');
  }
  // 뒷벽: 세로 줄무늬 벽지 + 작은 점 무늬
  o += shape(rect(140, 70, 1320, 450, { sharp: true, amp: 0.4 }), wall, { sw: 2 });
  for (let x = 160; x < 1460; x += 44) o += fill(rect(x, 72, 14, 446, { amp: 0.3 }), wall2, 0.55);
  for (let y = 100; y < 510; y += 46) for (let x = 182 + ((y / 46) % 2) * 22; x < 1450; x += 44) o += dot(x, y, 2.4, C.cream, 0.8);
  // 민트 징두리 판벽
  o += shape(rect(140, 512, 1320, 128, { sharp: true, amp: 0.4 }), C.mint);
  for (let x = 160; x < 1440; x += 132) o += shape(rect(x, 530, 112, 92, { sharp: true, amp: 0.6 }), 'none', { sw: 1.6, stroke: C.mintD });
  o += shape(rect(130, 500, 1340, 18, { sharp: true, amp: 0.5 }), C.wood);
  o += shape(rect(140, 626, 1320, 14, { sharp: true }), C.wood2);
  // 나무 마루 (원근)
  o += fill(wob([[140, 640], [1460, 640], [1600, 900], [0, 900]], { sharp: true }), C.wood);
  const N = 16;
  const xAt = (y, k) => { const t = (y - 640) / 260; const xb = 140 + k * 1320 / N, xf = -60 + k * 1720 / N; return xb + (xf - xb) * t; };
  for (let k = 0; k < N; k++) {
    o += fill(wob([[xAt(640, k), 640], [xAt(640, k + 1), 640], [xAt(900, k + 1), 900], [xAt(900, k), 900]], { sharp: true, amp: 0.5 }), pick([C.wood, C.wood2, C.wood3, C.wood]), 0.9);
    o += line([[xAt(640, k), 640], [xAt(900, k), 900]], { sw: 1.8, op: 0.75, step: 80 });
    const jy = rand(660, 880);
    o += line([[xAt(jy, k), jy], [xAt(jy + 2, k + 1), jy + 2]], { sw: 1.4, op: 0.6 });
  }
  o += hatch(wob([[140, 640], [1460, 640], [1460, 662], [140, 662]], { sharp: true }), 0.45);
  return o;
}
function bunting(x0, x1, y, sag) {
  let o = '';
  const pts = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI) * sag]); }
  o += line(pts, { sw: 2, step: 999 });
  const cols = [C.rose, C.butter, C.mint, C.blue, C.cream];
  for (let i = 1; i < 20; i += 1.4) {
    const t = i / 20, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * sag;
    const c = cols[Math.floor(i) % cols.length];
    o += shape(wob([[x - 20, yy], [x + 20, yy + 1], [x, yy + 44]], { step: 999, amp: 0.8 }), c, { sw: 1.8 });
    if (c === C.cream) o += dot(x, yy + 14, 3, C.rose);
  }
  return o;
}
function frame(x, y, w, h, inner, col = C.wood2) {
  return shape(rect(x, y, w, h, { sharp: true }), col, { sw: 2.4 }) + shape(rect(x + 10, y + 10, w - 20, h - 20, { sharp: true }), C.cream) + inner + hatch(rect(x + w - 14, y, 14, h), 0.3);
}
function rug(cx, cy, rx, ry) {
  let o = fill(ell(cx + 10, cy + 8, rx, ry), INK, 0.18);
  const cols = [C.rose, C.cream, C.mint, C.butter, C.rose2];
  for (let i = 0; i < 5; i++) o += shape(ell(cx, cy, rx - i * rx / 5.2, ry - i * ry / 5.2), cols[i], { sw: 1.4 });
  return o;
}

/* ───────────── 장난감·소품 조각 ───────────── */
function block(x, y, s, col, mark) {
  let o = shape(rect(x, y, s, s, { sharp: true }), col, { sw: 2 });
  o += shape(wob([[x, y], [x + s * 0.2, y - s * 0.2], [x + s * 1.2, y - s * 0.2], [x + s, y]], { sharp: true }), col, { sw: 1.8 });
  o += shape(wob([[x + s, y], [x + s * 1.2, y - s * 0.2], [x + s * 1.2, y + s * 0.8], [x + s, y + s]], { sharp: true }), col, { sw: 1.8 }) + hatch(wob([[x + s, y], [x + s * 1.2, y - s * 0.2], [x + s * 1.2, y + s * 0.8], [x + s, y + s]]), 0.45);
  if (mark === 'star') o += shape(wob(starPts(x + s / 2, y + s / 2, s * 0.3, s * 0.13), { sharp: true, amp: 0.3 }), C.cream, { sw: 1.2 });
  if (mark === 'dot') o += shape(ell(x + s / 2, y + s / 2, s * 0.2, s * 0.2), C.cream, { sw: 1.2 });
  if (mark === 'heart') o += shape(heartPts(x + s / 2, y + s / 2 + 2, s * 0.22), C.cream, { sw: 1.2 });
  return o;
}
function starPts(cx, cy, r1, r2, n = 5) { const p = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n; const r = i % 2 ? r2 : r1; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
function heartPts(cx, cy, r) { const p = []; for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2; p.push([cx + r * 16 * Math.pow(Math.sin(t), 3) / 16, cy - r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16]); } return wob(p, { step: 999, amp: 0.3 }); }
function train(x, y, s = 1) {
  let o = '';
  const car = (cx, col, w) => shape(rect(cx, y - 34 * s, w * s, 30 * s, { sharp: true }), col, { sw: 1.8 }) + shape(ell(cx + 10 * s, y, 8 * s, 8 * s), INK, { sw: 1 }) + shape(ell(cx + (w - 10) * s, y, 8 * s, 8 * s), INK, { sw: 1 });
  o += car(x, C.red, 56) + shape(rect(x + 30 * s, y - 60 * s, 22 * s, 28 * s, { sharp: true }), C.red, { sw: 1.8 }) + shape(rect(x + 6 * s, y - 52 * s, 10 * s, 20 * s, { sharp: true }), INK, { sw: 1 });
  o += car(x + 62 * s, C.blue, 46) + car(x + 114 * s, C.butter, 46);
  o += line([[x + 56 * s, y - 14 * s], [x + 62 * s, y - 14 * s]], { sw: 2 }) + line([[x + 108 * s, y - 14 * s], [x + 114 * s, y - 14 * s]], { sw: 2 });
  return o;
}
function doll(x, y, col) {
  // 나무 인형: 종 모양 드레스(주름), 흰 깃, 팔, 머리카락과 앞머리, 얼굴
  let o = part([[x - 21, y], [x - 17, y - 26], [x - 11, y - 44], [x + 11, y - 44], [x + 17, y - 26], [x + 21, y]], col, { heavy: [3, 5], sw: 1.6, hw: 2.4, shade: [[x + 4, y - 50], [x + 26, y - 50], [x + 26, y + 2], [x + 6, y + 2]], shadeCol: 'rgba(40,30,40,0.2)', hatch: false });
  o += line([[x - 8, y - 30], [x - 10, y - 2]], { sw: 1, op: 0.45 }) + line([[x + 6, y - 30], [x + 8, y - 2]], { sw: 1, op: 0.45 });
  o += part([[x - 12, y - 46], [x, y - 40], [x + 12, y - 46], [x + 8, y - 50], [x - 8, y - 50]], C.cream, { sw: 1.2 });
  o += part([[x - 14, y - 40], [x - 20, y - 22], [x - 16, y - 20], [x - 10, y - 34]], col, { sw: 1.2 }) + part([[x + 14, y - 40], [x + 20, y - 22], [x + 16, y - 20], [x + 10, y - 34]], col, { sw: 1.2 });
  o += part([[x, y - 82], [x + 14, y - 76], [x + 17, y - 62], [x + 10, y - 51], [x, y - 49], [x - 10, y - 51], [x - 17, y - 62], [x - 14, y - 76]], '#f3dcc4', { heavy: [2, 4], sw: 1.4, hw: 2.2 });
  o += part([[x - 17, y - 64], [x - 16, y - 78], [x - 4, y - 86], [x + 10, y - 84], [x + 18, y - 72], [x + 17, y - 62], [x + 10, y - 72], [x + 2, y - 70], [x - 6, y - 74], [x - 10, y - 68]], C.woodD, { sw: 1.4 });
  o += dot(x - 6, y - 62, 1.8, INK) + dot(x + 6, y - 62, 1.8, INK) + dot(x - 10, y - 57, 2.6, C.rose, 0.6) + dot(x + 10, y - 57, 2.6, C.rose, 0.6);
  o += line([[x - 3, y - 56], [x, y - 54], [x + 3, y - 56]], { sw: 1 });
  return o;
}
function bear(x, y, col = '#c99a6a') {
  // 앉아 있는 곰 인형 (리본, 발바닥, 주둥이)
  const lt = '#e6c49a';
  let o = '';
  o += part([[x - 26, y - 6], [x - 36, y - 2], [x - 34, y + 2], [x - 14, y + 2], [x - 10, y - 8]], col, { sw: 1.4 }) + part([[x + 26, y - 6], [x + 36, y - 2], [x + 34, y + 2], [x + 14, y + 2], [x + 10, y - 8]], col, { sw: 1.4 });
  o += dot(x - 30, y - 1, 3.4, lt) + dot(x + 30, y - 1, 3.4, lt);
  o += part([[x, y - 44], [x + 18, y - 38], [x + 24, y - 18], [x + 18, y], [x, y + 3], [x - 18, y], [x - 24, y - 18], [x - 18, y - 38]], col, { heavy: [1, 3], sw: 1.6, hw: 2.4, shade: [[x + 6, y - 46], [x + 30, y - 46], [x + 30, y + 6], [x + 6, y + 6]], shadeCol: 'rgba(80,40,10,0.2)', hatch: false });
  o += part([[x - 9, y - 30], [x + 9, y - 30], [x + 11, y - 8], [x - 11, y - 8]], lt, { sw: 1 });
  for (const sx of [-1, 1]) o += part([[x + sx * 18, y - 36], [x + sx * 28, y - 26], [x + sx * 26, y - 18], [x + sx * 16, y - 26]], col, { sw: 1.4 });
  const hy = y - 62;
  for (const sx of [-1, 1]) o += part([[x + sx * 10, hy - 14], [x + sx * 16, hy - 22], [x + sx * 25, hy - 19], [x + sx * 24, hy - 9], [x + sx * 16, hy - 8]], col, { sw: 1.4 }) + dot(x + sx * 19, hy - 15, 3, lt);
  o += part([[x, hy - 20], [x + 16, hy - 14], [x + 21, hy], [x + 14, hy + 14], [x, hy + 18], [x - 14, hy + 14], [x - 21, hy], [x - 16, hy - 14]], col, { heavy: [1, 3], sw: 1.6, hw: 2.4 });
  o += part([[x - 8, hy + 2], [x + 8, hy + 2], [x + 10, hy + 12], [x, hy + 16], [x - 10, hy + 12]], lt, { sw: 1.1 });
  o += part([[x - 4, hy + 3], [x + 4, hy + 3], [x, hy + 8]], INK, { sw: 0.8 }) + dot(x - 8, hy - 3, 2.2, INK) + dot(x + 8, hy - 3, 2.2, INK);
  o += part([[x - 14, y - 46], [x - 2, y - 42], [x - 12, y - 36]], C.red, { sw: 1.2 }) + part([[x + 14, y - 46], [x + 2, y - 42], [x + 12, y - 36]], C.red, { sw: 1.2 }) + dot(x, y - 42, 3, C.red2);
  return o;
}
function book(x, y, w, h, col) { return shape(rect(x, y - h, w, h, { sharp: true }), col, { sw: 1.6 }) + line([[x + 3, y - h + 8], [x + w - 3, y - h + 8]], { sw: 1, op: 0.5 }); }
function shelfUnit(x, y, w, h, shelves) {
  let o = fill(rect(x + 10, y + 10, w, h, { amp: 2 }), INK, 0.18);
  o += shape(rect(x, y, w, h, { sharp: true }), C.wood2, { sw: 2.6 });
  o += shape(rect(x + 14, y + 14, w - 28, h - 28, { sharp: true }), '#9a6a3c');
  o += hatch(rect(x + 14, y + 14, w - 28, h - 28), 0.3);
  shelves.forEach((sy) => { o += shape(rect(x + 8, sy, w - 16, 14, { sharp: true }), C.wood3, { sw: 1.8 }); });
  return o;
}
function carrot(x, y, len, ang, { plush = false } = {}) {
  const p = rot([[0, -len * 0.16], [len, 0], [0, len * 0.16], [-len * 0.06, 0]], ang, x, y);
  let o = shape(wob(p, { step: 18, amp: 0.8 }), plush ? '#f0a160' : C.orange, { sw: 2 });
  for (let i = 1; i < 4; i++) { const t = i / 4.2; o += line(rot([[len * t, -len * 0.12 * (1 - t)], [len * t + 4, len * 0.04]], ang, x, y), { sw: 1.3, color: C.orange2 }); }
  for (let i = 0; i < 3; i++) o += leaf(...rot([[-len * 0.04, 0]], ang, x, y)[0], len * 0.42, ang + Math.PI + (i - 1) * 0.42, i === 1 ? C.leaf : C.leaf2, { w: 0.34 });
  if (plush) { o += line(rot([[len * 0.15, -len * 0.05], [len * 0.7, -len * 0.02]], ang, x, y), { sw: 1.2, color: C.orange2 }); for (let i = 0; i < 7; i++) o += line(rot([[len * (0.18 + i * 0.075), -len * 0.075], [len * (0.18 + i * 0.075), -len * 0.025]], ang, x, y), { sw: 1.2 }); }
  return o;
}

/* ───────────── 배경 ───────────── */
function outside(day) {
  seed(day ? 501 : 502);
  const top = day ? '#bfe0f0' : '#8a7aa6', bot = day ? '#f8f0d8' : '#e4b6a6';
  let o = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sk)"/>`;
  for (let i = 0; i < 7; i++) o += fill(ell(rand(0, W), rand(80, 260), rand(80, 150), rand(26, 40)), day ? '#ffffff' : '#c7a6be', 0.75);
  o += fill(wob([[0, 380], [400, 330], [900, 370], [1300, 320], [1600, 360], [1600, 900], [0, 900]], { step: 80, amp: 6 }), day ? '#a9cf86' : '#8a8a8f');
  for (let i = 0; i < 18; i++) { const x = i * 95 + rand(-20, 20); o += fill(ell(x, 370, rand(40, 60), rand(34, 50)), day ? pick(['#8fbf6a', '#7eb05c']) : pick(['#6f727c', '#77727f'])); }
  put(`bg/outside_${day ? 'day' : 'dim'}.svg`, W, H, o, { id: day ? 501 : 502 });
}
function bgNorth() {
  seed(511);
  let o = shell();
  o += bunting(170, 1430, 92, 70);
  // 모카 옆모습 그림 (그림자 퍼즐 단서)
  o += frame(770, 220, 140, 160, silhouette(794, 268, 0.25, '#6b4a3a') + fill(ell(840, 362, 36, 5), C.pinkD, 0.6), C.wood2);
  o += line([[790, 220], [840, 196], [890, 220]], { sw: 1.6 }) + dot(840, 196, 4, C.brass);
  // 문 자리 오목한 공간
  o += shape(wob([[930, 640], [930, 320], ...ellPts(1080, 320, 150, 118, Math.PI, Math.PI * 2, 18).slice(1, -1), [1230, 320], [1230, 640]], { step: 40 }), C.woodD, { sw: 3 });
  // 문 옆 옷걸이: 깎은 나무 기둥, 세발 받침, 위쪽 고리
  const X = 1330;
  for (const [dx, dy] of [[-44, 648], [44, 648], [6, 656]]) o += part([[X - 6, 604], [X + 6, 604], [X + dx + (dx > 0 ? 6 : dx < 0 ? -2 : 4), dy - 4], [X + dx, dy + 2], [X + dx + (dx > 0 ? -8 : 8), dy - 2]], C.wood2, { sw: 1.8 });
  o += part([[X - 6, 214], [X + 6, 214], [X + 7, 612], [X - 7, 612]], C.wood2, { heavy: [1, 2], shade: [[X + 1, 200], [X + 12, 200], [X + 12, 620], [X + 1, 620]], shadeCol: 'rgba(60,30,10,0.3)', hatch: false });
  for (const y of [300, 440, 590]) o += part([[X - 11, y - 6], [X + 11, y - 6], [X + 13, y], [X + 11, y + 6], [X - 11, y + 6], [X - 13, y]], C.wood, { sw: 1.6 });
  o += part([[X - 10, 200], [X, 186], [X + 10, 200], [X + 8, 214], [X - 8, 214]], C.wood, { sw: 1.8 });
  for (const sx of [-1, 1]) o += line([[X, 222], [X + sx * 26, 226], [X + sx * 34, 214], [X + sx * 28, 206]], { sw: 3.4, color: C.brass2 });
  // 왼쪽 고리: 고리에 걸쳐 두 갈래로 늘어진 줄무늬 목도리 (끝에 술)
  for (const [x0, len, tilt] of [[1290, 170, -6], [1308, 150, 4]]) {
    const band = [[x0, 228], [x0 + 16, 226], [x0 + 18 + tilt, 228 + len], [x0 + 2 + tilt, 230 + len]];
    o += part(band, C.blue, { heavy: [1, 2], sw: 1.8 });
    for (let y = 246; y < 222 + len; y += 24) { const t = (y - 228) / len; o += part([[x0 + tilt * t, y], [x0 + 16 + tilt * t, y - 1], [x0 + 17 + tilt * t, y + 8], [x0 + 1 + tilt * t, y + 9]], C.cream, { sw: 0.8 }); }
    for (let k = 0; k < 5; k++) o += line([[x0 + 3 + tilt + k * 3.4, 230 + len], [x0 + 3 + tilt + k * 3.4 + 1, 244 + len]], { sw: 1.4, color: C.blue2 });
  }
  o += part([[1286, 218], [1324, 216], [1328, 232], [1284, 234]], C.blue, { sw: 1.8, heavy: [1, 2] });
  // 기둥 꼭대기에 얹힌 밀짚모자
  o += part([[1290, 202], [1306, 192], [1330, 188], [1356, 192], [1372, 202], [1356, 210], [1330, 212], [1304, 210]], '#e6c57a', { heavy: [3, 6], shade: [[1330, 196], [1380, 196], [1380, 216], [1330, 216]], shadeCol: 'rgba(150,100,30,0.25)', hatch: false });
  o += part([[1310, 196], [1314, 172], [1330, 164], [1346, 172], [1350, 196]], '#e6c57a', { sw: 1.8 });
  o += part([[1311, 186], [1349, 186], [1350, 195], [1310, 195]], C.mint, { sw: 1.3 });
  for (let x = 1296; x < 1368; x += 7) o += line([[x, 202], [x + 3, 208]], { sw: 0.8, color: '#a8843a', op: 0.7 });
  // 오른쪽 고리: 노란 카디건 (어깨에서 늘어진 몸판, 소매, 단추, 고무단)
  const cg = [[1350, 214], [1372, 214], [1390, 226], [1404, 266], [1414, 340], [1404, 346], [1394, 290], [1394, 380], [1346, 384], [1346, 290], [1336, 346], [1326, 340], [1336, 266], [1340, 226]];
  o += part(cg, C.butter, { heavy: [3, 7], shade: [[1380, 210], [1420, 210], [1420, 390], [1370, 390]], shadeCol: 'rgba(150,110,20,0.22)' });
  o += line([[1361, 220], [1366, 240], [1370, 384]], { sw: 1.6 });
  for (const y of [258, 290, 322, 354]) o += `<circle cx="${1374}" cy="${y}" r="3.6" fill="${C.cream}" stroke="${INK}" stroke-width="1"/>`;
  o += part([[1346, 366], [1394, 366], [1394, 384], [1346, 384]], C.butter2, { sw: 1.2 });
  for (let x = 1350; x < 1394; x += 5) o += line([[x, 368], [x, 382]], { sw: 0.8, op: 0.45 });
  o += part([[1350, 312], [1362, 312], [1362, 328], [1350, 328]], C.butter2, { sw: 1.2 });
  o += rug(700, 770, 360, 74);
  put('bg/north.svg', W, H, o, { id: 511 });
}
function bgEast() {
  seed(512);
  let o = shell();
  // 공구 걸이판
  o += shape(rect(940, 150, 380, 270, { sharp: true }), C.wood3, { sw: 2.4 });
  for (let x = 960; x < 1310; x += 24) for (let y = 168; y < 410; y += 24) o += dot(x, y, 2.2, INK, 0.45);
  o += line([[990, 180], [990, 330]], { sw: 7, color: C.wood2 }) + shape(rect(970, 170, 40, 22), C.grey2);
  o += shape(wob([[1040, 180], [1060, 180], [1062, 340], [1038, 340]]), C.grey) + shape(rect(1036, 330, 28, 50), C.red);
  for (let k = 0; k < 4; k++) o += line([[1100 + k * 22, 190], [1100 + k * 22, 300]], { sw: 5, color: [C.rose, C.butter, C.mint, C.blue][k] }) + shape(ell(1100 + k * 22, 304, 6, 9), C.woodD, { sw: 1 });
  o += shape(rect(1200, 190, 90, 18, { sharp: true }), C.butter) + shape(rect(1200, 230, 90, 18, { sharp: true }), C.mint);
  for (let x = 1206; x < 1290; x += 8) o += line([[x, 190], [x, 198]], { sw: 1 });
  // 쥐구멍 (징두리 판벽 아래)
  o += shape(wob([[1250, 640], [1250, 600], ...ellPts(1300, 600, 50, 40, Math.PI, Math.PI * 2, 12).slice(1, -1), [1350, 600], [1350, 640]], { step: 30 }), '#3a2618', { sw: 2.4 });
  o += line([[1255, 640], [1345, 640]], { sw: 3, color: C.wood2 });
  // 실패 바구니
  o += shape(wob([[1380, 690], [1460, 690], [1450, 740], [1390, 740]]), '#c49352');
  for (let i = 0; i < 4; i++) o += shape(ell(1394 + i * 18, 684, 9, 9), [C.rose, C.mint, C.butter, C.blue][i], { sw: 1.4 });
  put('bg/east.svg', W, H, o, { id: 512 });
}
function bgSouth() {
  seed(513);
  let o = shell();
  // 창문 (유리는 투명: 바깥 그림이 비친다)
  o += shape(rect(600, 120, 400, 360, { sharp: true }), 'none', { sw: 14, stroke: C.cream });
  o += shape(rect(600, 120, 400, 360, { sharp: true }), 'none', { sw: 3 });
  o += line([[800, 120], [800, 480]], { sw: 8, color: C.cream }) + line([[600, 300], [1000, 300]], { sw: 8, color: C.cream });
  o += line([[620, 190], [660, 150]], { sw: 3, color: '#fff', op: 0.6 }) + line([[820, 360], [860, 320]], { sw: 3, color: '#fff', op: 0.5 });
  o += shape(rect(580, 476, 440, 22, { sharp: true }), C.cream);
  // 창가 화분
  o += shape(wob([[640, 476], [690, 476], [684, 440], [646, 440]]), C.rose) + leaf(665, 440, 40, -1.9, C.leaf, { w: 0.5 }) + leaf(665, 440, 36, -1.2, C.leaf2, { w: 0.5 });
  o += shape(wob([[910, 476], [960, 476], [954, 444], [916, 444]]), C.butter) + dot(935, 420, 12, C.rose) + dot(935, 420, 4, C.butter2);
  o += line([[935, 444], [935, 430]], { sw: 2, color: C.leaf2 });
  // 왼쪽 장난감 선반
  o += shelfUnit(170, 120, 380, 510, [250, 390, 520]);
  o += train(200, 248, 1) + block(400, 210, 36, C.rose, 'star') + block(444, 214, 32, C.mint, 'dot') + block(420, 176, 30, C.butter, 'heart');
  o += doll(230, 388, C.blue) + bear(300, 386, '#b48a5e') + book(360, 388, 20, 80, C.mint2) + book(382, 388, 22, 70, C.red) + book(406, 388, 18, 86, C.butter2) + book(426, 388, 24, 64, C.lilac);
  o += shape(ell(260, 494, 30, 30), C.red) + line(ellPts(260, 494, 30, 12, 0, Math.PI, 10), { sw: 1.6, color: C.cream, step: 999 });
  o += block(320, 482, 36, C.blue, 'star') + block(366, 482, 36, C.rose, 'dot') + block(342, 446, 36, C.mint, 'heart');
  // 오른쪽 선반 (병은 따로 그린다)
  o += shelfUnit(1050, 120, 380, 510, [250, 390, 520]);
  o += doll(1100, 248, C.mint) + book(1140, 248, 22, 76, C.rose) + book(1164, 248, 20, 90, C.blue2) + book(1186, 248, 24, 70, C.butter2);
  o += bear(1320, 246, '#c99a6a');
  o += train(1080, 520, 0.9) + block(1290, 482, 36, C.butter, 'star') + block(1340, 482, 36, C.rose, 'heart');
  o += shape(ell(1110, 388, 14, 14), C.blue) + shape(ell(1140, 388, 14, 14), C.rose) + shape(ell(1170, 388, 14, 14), C.butter);
  o += rug(800, 790, 300, 60);
  put('bg/south.svg', W, H, o, { id: 513 });
}
function bgWest() {
  seed(514);
  let o = shell();
  // 실패 선반
  o += shape(rect(180, 180, 260, 16, { sharp: true }), C.wood3) + shape(rect(180, 300, 260, 16, { sharp: true }), C.wood3);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
    const x = 196 + i * 35, y = r ? 300 : 180, col = pick([C.rose, C.mint, C.butter, C.blue, C.red, C.lilac, C.cream]);
    o += shape(rect(x, y - 50, 26, 8), C.wood3, { sw: 1.2 }) + shape(rect(x + 3, y - 42, 20, 34), col, { sw: 1.4 }) + shape(rect(x, y - 8, 26, 8), C.wood3, { sw: 1.2 });
    for (let k = 0; k < 4; k++) o += line([[x + 4, y - 38 + k * 8], [x + 22, y - 36 + k * 8]], { sw: 0.8, op: 0.5 });
  }
  // 줄자 늘어뜨림
  o += line([[180, 200], [200, 300], [190, 420], [210, 480]], { sw: 10, color: C.butter }) + line([[180, 200], [200, 300], [190, 420], [210, 480]], { sw: 1.2, op: 0.6 });
  put('bg/west.svg', W, H, o, { id: 514 });
}

/* ───────────── 북쪽 소품 ───────────── */
function mocha(awake) {
  seed(awake ? 521 : 522);
  put(`props/mocha_${awake ? 'awake' : 'sleep'}.svg`, 400, 480, mochaArt(awake, C), { id: awake ? 521 : 522, displace: 1.6, vb: '0 -40 400 480' });
}
function sideTable() {
  seed(523);
  let o = fill(ell(100, 206, 80, 8), INK, 0.2);
  o += shape(rect(90, 40, 20, 160, { sharp: true }), C.wood2) + shape(wob([[50, 200], [150, 200], [130, 186], [70, 186]]), C.wood2);
  o += shape(ell(100, 36, 96, 22), C.wood3, { sw: 2.4 }) + shape(wob([[4, 36], [196, 36], [196, 50], [4, 50]], { sharp: true }), C.wood2);
  o += fill(ell(100, 34, 80, 16), C.cream, 0.9);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; o += dot(100 + Math.cos(a) * 80, 34 + Math.sin(a) * 16, 3, C.rose); }
  put('props/table.svg', 200, 212, o, { id: 523 });
}
function jbox(state) {
  // closed | open
  seed(524);
  const w = 160, h = 260;
  let o = fill(ell(84, 254, 64, 7), INK, 0.25);
  if (state === 'open') {
    // 굵은 스프링
    const sp = []; for (let i = 0; i <= 10; i++) sp.push([80 + (i % 2 ? 16 : -16), 146 - i * 7]);
    o += line(sp, { sw: 6, color: INK, step: 999 }) + line(sp, { sw: 3.4, color: C.grey, step: 999 });
    // 주름 깃
    const ruff = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; ruff.push([80 + Math.cos(a) * (i % 2 ? 46 : 38), 62 + Math.sin(a) * (i % 2 ? -14 : -8) + 14]); }
    o += part([[34, 76], ...ruff.slice(1, -1), [126, 76], [104, 88], [56, 88]], C.rose, { sw: 1.8 });
    o += part([[44, 70], [80, 78], [116, 70], [104, 80], [56, 80]], C.cream, { sw: 1.2 });
    // 토끼 인형 머리와 귀
    o += part([[66, -2], [60, -40], [64, -58], [72, -58], [76, -36], [78, 0]], C.cream, { sw: 1.8 }) + `<path d="${S([[67, -6], [64, -38], [68, -50], [72, -36], [73, -6]], 0.2)}" fill="#f2b3b5"/>`;
    o += part([[84, -2], [92, -38], [104, -52], [110, -46], [100, -26], [94, 0]], C.cream, { sw: 1.8 }) + `<path d="${S([[88, -6], [96, -32], [104, -44], [97, -24], [92, -4]], 0.2)}" fill="#f2b3b5"/>`;
    o += part([[80, -6], [104, 2], [114, 24], [108, 50], [94, 64], [80, 68], [66, 64], [52, 50], [46, 24], [56, 2]], C.cream, { heavy: [2, 5], shade: [[90, 20], [120, 20], [120, 70], [80, 70]], shadeCol: 'rgba(120,90,60,0.2)', hatch: false });
    o += `<path d="${S([[66, 26], [72, 20], [76, 28], [70, 34]], 0.2)}" fill="${INK}"/><path d="${S([[86, 26], [92, 20], [96, 28], [90, 34]], 0.2)}" fill="${INK}"/>`;
    o += dot(73, 24, 1.6, '#fff') + dot(93, 24, 1.6, '#fff');
    o += `<path d="${S([[74, 42], [86, 42], [84, 52], [80, 55], [76, 52]], 0.2)}" fill="#b84a4a" stroke="${INK}" stroke-width="1.4"/>` + dot(80, 38, 3, '#e17f87');
    o += dot(60, 40, 5, '#f0a0a4', 0.6) + dot(100, 40, 5, '#f0a0a4', 0.6);
    // 고깔모자
    o += part([[62, -4], [86, -64], [102, 0]], C.butter, { heavy: [1, 2], sw: 1.8 });
    o += line([[70, -24], [92, -20]], { sw: 3, color: C.rose }) + line([[76, -42], [90, -40]], { sw: 3, color: C.mint });
    o += `<path d="${S([[80, -66], [86, -74], [94, -68], [90, -60], [82, -60]], 0.3)}" fill="${C.rose}" stroke="${INK}" stroke-width="1.2"/>`;
    for (let i = 0; i < 22; i++) o += `<rect x="${rand(0, 150).toFixed(0)}" y="${rand(-70, 110).toFixed(0)}" width="7" height="4" fill="${pick([C.rose, C.butter, C.mint, C.blue])}" transform="rotate(${rand(0, 180).toFixed(0)} 80 40)"/>`;
    // 젖혀진 뚜껑
    o += shape(wob([[24, 150], [136, 150], [150, 120], [38, 116]], { sharp: true }), C.mint2, { sw: 2 });
  } else {
    o += shape(wob([[24, 150], [136, 150], [146, 136], [34, 136]], { sharp: true }), C.mint2, { sw: 2 });
  }
  o += shape(rect(24, 150, 112, 100, { sharp: true }), C.mint, { sw: 2.4 });
  o += shape(wob([[136, 150], [146, 136], [146, 236], [136, 250]], { sharp: true }), C.mint2, { sw: 2 }) + hatch(wob([[136, 150], [146, 136], [146, 236], [136, 250]]), 0.4);
  for (let i = 0; i < 9; i++) o += dot(36 + (i % 3) * 38, 166 + Math.floor(i / 3) * 30, 5, C.cream);
  o += shape(wob(starPts(80, 200, 22, 10), { sharp: true, amp: 0.4 }), C.butter, { sw: 1.8 });
  o += shape(ell(141, 196, 5, 6), '#3a2618', { sw: 1.2 });
  put(`props/jbox_${state}.svg`, w, 340, o, { id: 524, vb: '0 -80 160 340' });
}
function crankSmall() {
  seed(525);
  const o = line([[4, 30], [22, 30], [22, 6]], { sw: 4, color: C.brass2 }) + shape(ell(22, 6, 6, 6), C.rose, { sw: 1.4 }) + shape(ell(4, 30, 4, 4), C.brass, { sw: 1 });
  put('props/crank_small.svg', 40, 40, o, { id: 525 });
}
function door(open) {
  seed(open ? 531 : 532);
  const w = 300, h = 420;
  const outl = [[10, h], [10, 118], ...ellPts(150, 118, 140, 108, Math.PI, Math.PI * 2, 18).slice(1, -1), [290, 118], [290, h]];
  let o = '';
  if (open) {
    o += shape(wob(outl, { step: 40 }), '#fff3d6', { sw: 3 });
    o += fill(wob([[10, 280], [120, 250], [290, 270], [290, h], [10, h]]), '#b5d98f') + fill(wob([[110, h], [140, 290], [170, 290], [200, h]]), '#efdcaa');
    for (let i = 0; i < 8; i++) o += dot(rand(30, 270), rand(300, 380), 6, pick([C.rose, C.butter, '#fff']));
    o += `<circle cx="160" cy="130" r="80" fill="#fffbe6" opacity="0.9" filter="url(#blur)"/>`;
    o += shape(wob([[10, 60], [50, 32], [50, h + 10], [10, h]]), C.mint2, { sw: 3 }) + hatch(wob([[10, 60], [50, 32], [50, h + 10], [10, h]]), 0.4);
  } else {
    o += shape(wob(outl, { step: 40 }), C.mint, { sw: 3 });
    o += shape(rect(40, 190, 90, 90, { sharp: true }), 'none', { sw: 2, stroke: C.mintD }) + shape(rect(170, 190, 90, 90, { sharp: true }), 'none', { sw: 2, stroke: C.mintD });
    o += shape(rect(40, 300, 90, 100, { sharp: true }), 'none', { sw: 2, stroke: C.mintD }) + shape(rect(170, 300, 90, 100, { sharp: true }), 'none', { sw: 2, stroke: C.mintD });
    o += shape(ell(150, 110, 46, 46), C.cream, { sw: 2.6 }) + shape(ell(150, 110, 38, 38), C.blue2) + line([[150, 72], [150, 148]], { sw: 3, color: C.cream }) + line([[112, 110], [188, 110]], { sw: 3, color: C.cream });
    o += hatch(wob([[220, 40], [290, 118], [290, h], [230, h]]), 0.3);
    // 당근 모양 자물쇠판
    o += carrot(244, 280, 70, Math.PI / 2);
    o += shape(wob([[241, 300], [247, 300], [249, 318], [239, 318]]), INK, { sw: 1 }) + dot(244, 298, 4, INK);
    o += shape(ell(206, 300, 10, 10), C.brass);
  }
  put(`props/door_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: open ? 531 : 532 });
}
function note() {
  seed(533);
  let o = fill(rect(8, 10, 62, 72), INK, 0.2);
  o += shape(wob([[4, 6], [64, 2], [68, 72], [6, 76]]), C.cream);
  for (let y = 22; y < 60; y += 9) o += line([[14, y], [14 + rand(30, 44), y]], { sw: 1.5, op: 0.6 });
  o += shape(heartPts(52, 64, 6), C.rose, { sw: 1 }) + shape(ell(36, 8, 6, 6), C.butter2);
  put('props/note.svg', 72, 84, o, { id: 533 });
}
function portraitHit() { /* 액자는 배경에 그려져 있다 */ }

/* ───────────── 동쪽 소품 ───────────── */
function bench() {
  seed(541);
  const w = 900, h = 270;
  let o = fill(rect(20, 258, 870, 12, { amp: 2 }), INK, 0.2);
  for (const x of [26, 840]) o += shape(rect(x, 70, 34, 196, { sharp: true }), C.wood2) + hatch(rect(x + 18, 70, 16, 196), 0.4);
  o += shape(rect(60, 200, 780, 14, { sharp: true }), C.wood);
  o += shape(rect(0, 60, 900, 36, { sharp: true }), C.wood3, { sw: 2.6 });
  for (let x = 0; x < 900; x += 120) o += line([[x + 20, 66], [x + 20 + rand(50, 90), 68]], { sw: 1.2, op: 0.45 });
  o += hatch(rect(0, 84, 900, 12, { sharp: true }), 0.4);
  // 아래 선반의 상자와 나무토막
  o += shape(rect(90, 150, 120, 50, { sharp: true }), C.butter, { sw: 2 }) + shape(rect(140, 160, 20, 10), C.wood2);
  for (let i = 0; i < 5; i++) o += shape(rect(260 + i * 34, 168, 28, 32, { sharp: true }), pick([C.wood3, C.wood, C.rose, C.mint]), { sw: 1.6 });
  // 위: 붓통, 페인트 병, 깎던 나무 토끼
  o += shape(rect(700, 10, 40, 52, { sharp: true }), C.blue, { sw: 2 });
  for (let k = 0; k < 4; k++) o += line([[708 + k * 8, 10], [704 + k * 10, -30]], { sw: 3, color: C.woodD }) + dot(704 + k * 10, -32, 3.4, [C.rose, C.butter, C.mint, C.red][k]);
  for (let k = 0; k < 3; k++) o += shape(rect(770 + k * 34, 34, 28, 28, { sharp: true }), [C.rose, C.mint, C.butter][k], { sw: 1.8 }) + shape(rect(770 + k * 34, 28, 28, 8), C.grey);
  o += shape(ell(620, 40, 26, 20), C.wood3) + shape(ell(608, 22, 14, 12), C.wood3) + shape(ell(602, 4, 4, 14), C.wood3, { sw: 1.4 });
  for (let i = 0; i < 6; i++) o += line([[640 + rand(0, 40), 58], [660 + rand(0, 40), 52]], { sw: 1.4, color: C.wood2 });
  put('props/bench.svg', w, h, o, { id: 541, vb: '0 -40 900 310' });
}
function lamp(on) {
  seed(542);
  const w = 220, h = 300;
  let o = fill(ell(60, 292, 52, 7), INK, 0.2);
  o += shape(ell(60, 282, 50, 12), C.red, { sw: 2.2 }) + shape(rect(52, 220, 16, 62, { sharp: true }), C.red2);
  o += line([[60, 226], [30, 120], [120, 60]], { sw: 9, color: C.red }) + line([[60, 226], [30, 120], [120, 60]], { sw: 2, op: 0.4 });
  o += shape(ell(30, 120, 9, 9), C.brass) + shape(ell(120, 60, 8, 8), C.brass);
  // 갓 (오른쪽 아래를 비춤)
  const shade = rot([[-20, -26], [30, -20], [74, 40], [-24, 40]], 0.6, 140, 70);
  o += shape(wob(shade, { sharp: true, amp: 0.6 }), C.red, { sw: 2.6 }) + hatch(wob(shade), 0.35);
  if (on) o += dot(170, 128, 16, '#fff6c8') + `<circle cx="170" cy="128" r="34" fill="#fff0a0" opacity="0.8" filter="url(#blur)"/>`;
  else o += dot(170, 128, 12, '#d9d2b8');
  o += line([[60, 282], [10, 296]], { sw: 2.2 });
  put(`props/lamp_${on ? 'on' : 'off'}.svg`, w, h, o, { id: 542 });
}
function lampGlow() {
  raw('bg/lampglow_east.svg', W, H, `<defs><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter><radialGradient id="g"><stop offset="0" stop-color="#fff0b0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffcf80" stop-opacity="0"/></radialGradient></defs><path d="M380 360 L920 200 L960 560 L380 420Z" fill="#ffe9a8" opacity="0.45" filter="url(#b)"/><circle cx="700" cy="380" r="300" fill="url(#g)" opacity="0.7"/>`);
}
function theater(state) {
  // dark | lit | done
  seed(543);
  const w = 380, h = 300;
  let o = fill(rect(14, 280, 360, 14, { amp: 2 }), INK, 0.2);
  o += shape(rect(10, 40, 360, 250, { sharp: true }), C.wood2, { sw: 2.6 });
  o += shape(wob([[0, 44], [60, 0], [320, 0], [380, 44]], { sharp: true }), C.wood3, { sw: 2.4 });
  for (let i = 0; i < 7; i++) o += dot(90 + i * 34, 22, 6, [C.rose, C.butter, C.mint][i % 3]);
  // 종이 화면
  const scr = state === 'dark' ? '#d9ccb4' : '#fff1c9';
  o += shape(rect(70, 70, 240, 160, { sharp: true }), scr, { sw: 2 });
  if (state === 'lit') {
    o += `<g opacity="0.75">${[[110, 160, 30, 40, 0.8], [190, 120, 22, 34, -0.6], [250, 170, 40, 22, 0.3]].map(([x, y, a, b, r]) => `<path d="${wob(rot(ellPts(0, 0, a, b, 0, Math.PI * 2, 12), r, x, y), { step: 999 })}" fill="#4a3a33"/>`).join('')}</g>`;
  }
  if (state === 'done') o += silhouette(118, 128, 0.29, '#4a3a33', 0.85);
  if (state !== 'dark') o += `<rect x="70" y="70" width="240" height="160" fill="#fff6d0" opacity="0.25"/>`;
  // 빨간 커튼
  o += shape(wob([[40, 56], [90, 56], [82, 150], [94, 238], [40, 238]]), C.red, { sw: 2.2 }) + shape(wob([[340, 56], [290, 56], [298, 150], [286, 238], [340, 238]]), C.red, { sw: 2.2 });
  for (const x of [56, 70, 310, 324]) o += line([[x, 60], [x + 2, 234]], { sw: 1.2, color: C.red2 });
  o += shape(wob([[30, 50], [350, 50], [350, 72], [300, 86], [190, 74], [80, 86], [30, 72]]), C.red2, { sw: 2.2 });
  // 받침 서랍
  o += shape(rect(140, 246, 100, 34, { sharp: true }), C.wood3, { sw: 2 }) + shape(ell(190, 263, 6, 6), C.brass);
  put(`props/theater_${state}.svg`, w, h, o, { id: 543 });
}
function mouseFig(state) {
  seed(551);
  if (state === 'peek') { put('props/mouse_peek.svg', 84, 80, mousePeekArt(C), { id: 551, displace: 1 }); return; }
  put(`zoom/mouse_${state}.svg`, 300, 320, mouseArt(state, C), { id: 551, displace: 1.6 });
}

/* ───────────── 남쪽 소품 ───────────── */
function curtains(open) {
  seed(561);
  const w = 520, h = 420;
  let o = shape(rect(10, 4, 500, 12, { sharp: true }), C.wood2) + dot(10, 10, 9, C.brass) + dot(510, 10, 9, C.brass);
  const panel = (x0, x1, gathered) => {
    const pts = gathered ? [[x0, 16], [x1, 16], [x1 - (x1 - x0) * 0.35, 200], [x1 - 8, 380], [x0, 380]] : [[x0, 16], [x1, 16], [x1, 380], [x0, 380]];
    let g = shape(wob(pts, { step: 30 }), C.rose, { sw: 2.4 });
    const n = gathered ? 4 : 7;
    for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n; g += line([[x, 20], [gathered ? x - (x - x0) * 0.3 : x + rand(-4, 4), 376]], { sw: 1.4, color: C.rose2 }); }
    for (let y = 60; y < 370; y += 60) for (let x = x0 + 18; x < x1 - 10; x += 40) g += shape(heartPts(x, y, 6), C.cream, { sw: 0.8 });
    return g;
  };
  if (open) {
    o += panel(10, 110, true) + panel(510, 410, true);
    o += shape(rect(70, 190, 46, 12), C.butter2) + shape(rect(404, 190, 46, 12), C.butter2);
  } else {
    o += panel(10, 262, false) + panel(510, 258, false) + hatch(wob([[380, 16], [510, 16], [510, 380], [380, 380]]), 0.25);
  }
  put(`props/curtains_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: 561 });
}
function jar(open) {
  seed(562);
  const w = 120, h = 140;
  let o = fill(ell(60, 134, 46, 6), INK, 0.2);
  o += shape(wob([[18, 40], [102, 40], [108, 70], [104, 130], [16, 130], [12, 70]]), '#e6f0ee', { sw: 2.4, op: 0.85 });
  if (!open) {
    o += shape(wob([[30, 120], [92, 116], [84, 70]]), C.butter, { sw: 2 }) + dot(60, 104, 6, C.butter2) + dot(76, 96, 4, C.butter2);
    o += shape(rect(14, 20, 92, 26, { sharp: true }), C.mint, { sw: 2.4 });
    for (let x = 20; x < 106; x += 8) o += line([[x, 22], [x, 44]], { sw: 1, color: C.mintD });
  } else {
    o += shape(wob([[90, 18], [124, 30], [116, 50], [84, 38]], { sharp: true }), C.mint, { sw: 2 });
  }
  o += line([[26, 60], [24, 110]], { sw: 3, color: '#fff', op: 0.7 });
  o += shape(rect(34, 76, 52, 24, { sharp: true }), C.cream, { sw: 1.4 }) + shape(wob([[44, 94], [62, 82], [76, 94]]), C.butter, { sw: 1 });
  put(`props/jar_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: 562 });
}
function rockingHorse() {
  seed(563);
  const body = '#f3e7d2', mane = C.rose;
  let o = `<path d="${S([[20, 210], [240, 210], [236, 218], [24, 218]])}" fill="${INK}" opacity="0.2"/>`;
  // 흔들 받침 (초승달 나무)
  o += part([[6, 168], [40, 188], [130, 202], [220, 188], [254, 168], [258, 176], [222, 198], [130, 214], [38, 198], [2, 176]], C.wood2, { heavy: [6, 9], sw: 2 });
  // 다리 넷 (뒤쪽 다리는 어둡게)
  for (const [x0, x1, c] of [[88, 76, '#d8c9ae'], [174, 186, '#d8c9ae'], [104, 96, body], [160, 170, body]]) o += part([[x0 - 7, 124], [x0 + 7, 124], [x1 + 6, 192], [x1 - 6, 194]], c, { sw: 1.6 });
  // 꼬리 (털실)
  for (let k = 0; k < 6; k++) o += line([[66, 102], [44 - k * 3, 112 + k * 4], [36 - k * 2, 140 + k * 3]], { sw: 3, color: k % 2 ? mane : C.rose2 });
  // 몸통 (점박이)
  const bd = [[66, 96], [104, 82], [170, 82], [198, 92], [206, 116], [192, 132], [150, 136], [98, 134], [70, 126], [60, 110]];
  o += part(bd, body, { heavy: [4, 7], shade: [[60, 118], [210, 118], [210, 140], [60, 140]], shadeCol: 'rgba(120,90,60,0.2)' });
  for (const [x, y, r] of [[92, 108, 5], [120, 98, 4], [150, 112, 5], [176, 100, 3.6], [108, 122, 3]]) o += `<path d="${S([[x - r, y], [x, y - r], [x + r, y], [x, y + r * 0.8]], 0.2)}" fill="${C.pinkD}" opacity="0.5"/>`;
  // 안장 + 담요 + 등자
  o += part([[108, 80], [160, 80], [166, 108], [104, 108]], C.mint, { sw: 1.6 });
  for (let x = 106; x < 166; x += 10) o += `<path d="${S([[x, 106], [x + 10, 106], [x + 5, 114]], 0.2)}" fill="${C.mint}" stroke="${INK}" stroke-width="1"/>`;
  o += part([[116, 70], [152, 70], [156, 84], [112, 84]], C.rose, { sw: 1.6 }) + line([[134, 84], [134, 124]], { sw: 1.4 }) + part([[128, 124], [140, 124], [138, 132], [130, 132]], C.brass, { sw: 1 });
  // 목과 머리
  const hd = [[176, 92], [184, 64], [196, 38], [214, 20], [236, 18], [252, 32], [254, 46], [244, 52], [230, 50], [218, 62], [210, 98]];
  o += part(hd, body, { heavy: [4, 7], shade: [[230, 30], [260, 30], [260, 60], [226, 60]], shadeCol: 'rgba(120,90,60,0.2)' });
  o += part([[206, 22], [210, 4], [220, 18]], body, { sw: 1.4 });
  o += line([[224, 32], [229, 30], [233, 33]], { sw: 1.6 }) + line([[226, 34], [225, 38]], { sw: 1 }) + line([[230, 34], [231, 38]], { sw: 1 });
  o += dot(248, 40, 2, INK) + dot(236, 44, 3.4, C.rose, 0.6);
  o += line([[214, 26], [248, 46]], { sw: 2.4, color: C.red }) + line([[220, 48], [236, 22]], { sw: 2.4, color: C.red });
  o += part([[196, 30], [208, 26], [212, 32], [200, 36]], C.red, { sw: 1 });
  // 털실 갈기
  for (let i = 0; i < 8; i++) { const x = 196 - i * 4, y = 24 + i * 9; o += `<path d="${S([[x, y], [x - 9, y + 2], [x - 11, y + 9], [x - 3, y + 8]], 0.4)}" fill="${i % 2 ? mane : C.rose2}" stroke="${INK}" stroke-width="1"/>`; }
  put('props/horse.svg', 260, 220, o, { id: 563, displace: 1.4 });
}

/* ───────────── 서쪽 소품 ───────────── */
function sewingTable() {
  seed(571);
  const w = 700, h = 400;
  let o = fill(rect(20, 388, 660, 12, { amp: 2 }), INK, 0.2);
  const iron = '#3f3a40';
  for (const x of [56, 620]) {
    for (const sx of [-1, 1]) o += line([[x + sx * 14, 212], [x + sx * 30, 270], [x + sx * 20, 330], [x + sx * 30, 384]], { sw: 6, color: iron, step: 999 });
    o += line(ellPts(x, 300, 14, 18, 0, Math.PI * 2, 12), { sw: 4, color: iron, step: 999 }) + line([[x - 18, 252], [x + 18, 252]], { sw: 4, color: iron });
    o += part([[x - 40, 382], [x + 40, 382], [x + 44, 392], [x - 44, 392]], iron, { sw: 1.6 });
  }
  // 큰 바퀴와 벨트
  o += line(ellPts(130, 300, 54, 54, 0, Math.PI * 2, 24), { sw: 6, color: iron, step: 999 });
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; o += line([[130, 300], [130 + Math.cos(a) * 52, 300 + Math.sin(a) * 52]], { sw: 2.6, color: iron }); }
  o += `<circle cx="130" cy="300" r="7" fill="${C.brass}" stroke="${INK}" stroke-width="1.4"/>`;
  o += line([[160, 255], [178, 120]], { sw: 1.6, color: C.woodD }) + line([[100, 256], [146, 118]], { sw: 1.6, color: C.woodD });
  // 격자 발판
  o += part([[230, 336], [470, 336], [480, 372], [220, 372]], iron, { sw: 1.6 });
  for (let x = 240; x < 470; x += 16) o += line([[x, 340], [x + 10, 368]], { sw: 1.6, color: '#6d6670' }) + line([[x + 10, 340], [x, 368]], { sw: 1.6, color: '#6d6670' });
  o += line([[350, 372], [620, 300]], { sw: 3, color: iron });
  o += shape(rect(0, 180, 700, 34, { sharp: true }), C.wood3, { sw: 2.6 }) + hatch(rect(0, 202, 700, 12), 0.4);
  // 재봉틀
  o += shape(wob([[130, 180], [130, 60], [170, 30], [400, 30], [420, 60], [420, 110], [250, 110], [250, 180]]), C.mint, { sw: 2.6 });
  o += hatch(wob([[380, 34], [420, 60], [420, 110], [380, 110]]), 0.35);
  o += shape(rect(110, 168, 340, 16, { sharp: true }), C.mintD);
  o += shape(rect(380, 110, 26, 50, { sharp: true }), C.mintD) + line([[393, 160], [393, 178]], { sw: 2 });
  o += shape(ell(140, 90, 30, 30), C.grey) + shape(ell(140, 90, 10, 10), C.grey2);
  for (let i = 0; i < 6; i++) o += dot(200 + i * 30, 60, 4, C.brassL);
  o += shape(rect(226, 8, 26, 26, { sharp: true }), C.red) + line([[239, 8], [239, 30]], { sw: 1, op: 0.5 });
  o += line([[239, 30], [300, 60], [393, 130]], { sw: 1.4, color: C.red });
  // 반쯤 바느질한 천
  o += shape(wob([[300, 180], [500, 172], [560, 180], [520, 210], [300, 210]]), C.butter, { sw: 1.8 });
  for (let x = 320; x < 500; x += 14) o += line([[x, 186], [x + 7, 186]], { sw: 1.4, color: C.red });
  put('props/sewing.svg', w, h, o, { id: 571 });
}
function pincushion(full) {
  seed(572);
  let o = fill(ell(50, 76, 40, 5), INK, 0.2);
  o += shape(rect(26, 54, 48, 20, { sharp: true }), C.wood2);
  if (full) for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.36; o += line([[50 + Math.cos(a) * 20, 40 + Math.sin(a) * 16], [50 + Math.cos(a) * 44, 40 + Math.sin(a) * 36]], { sw: 1.6, color: C.grey2 }) + dot(50 + Math.cos(a) * 44, 40 + Math.sin(a) * 36, 4, [C.rose, C.butter, C.blue, C.mint, C.red, C.lilac][i]); }
  o += shape(ell(50, 44, 36, 26), C.red, { sw: 2.2 });
  for (let i = 0; i < 5; i++) o += line([[50, 18], [24 + i * 13, 68]], { sw: 1.2, color: C.red2, step: 999 });
  o += shape(wob([[42, 18], [50, 6], [58, 18]]), C.leaf, { sw: 1.4 });
  put(`props/pincushion${full ? '' : '_empty'}.svg`, 100, 84, o, { id: 572, vb: '0 -10 100 94' });
}
function tin() {
  seed(573);
  let o = fill(ell(60, 50, 54, 8), INK, 0.2);
  o += shape(wob([[8, 20], [112, 20], [112, 48], [8, 48]], { sharp: true }), C.blue, { sw: 2.2 }) + shape(ell(60, 20, 52, 10), C.blue2, { sw: 2 });
  for (let i = 0; i < 6; i++) o += dot(18 + i * 17, 34, 3, C.cream);
  o += shape(ell(60, 18, 30, 5), C.cream, { sw: 1 });
  put('props/tin.svg', 120, 60, o, { id: 573 });
}
function scoreArt(big) {
  seed(574);
  const w = big ? W : 480, h = big ? H : 230;
  const s = big ? 2.2 : 0.62, ox = big ? 260 : 10, oy = big ? 190 : 10;
  const P = (x, y) => [ox + x * s, oy + y * s];
  let o = '';
  if (big) { o += fill(rect(0, 0, W, H, { amp: 0 }), C.pink); for (let x = 0; x < W; x += 44) o += fill(rect(x, 0, 14, H, { amp: 0 }), C.pink2, 0.5); }
  o += shape(wob(rectPts(...P(0, 0), 490 * s, 330 * s), { sharp: true, amp: s }), C.wood2, { sw: 2.6 * Math.min(s, 1.4) });
  o += shape(wob(rectPts(...P(16, 16), 458 * s, 298 * s), { sharp: true, amp: s }), C.cream, { sw: 1.6 });
  for (let x = 24; x < 470; x += 9) for (let y = 24; y < 306; y += 9) o += big ? `<rect x="${(ox + x * s).toFixed(0)}" y="${(oy + y * s).toFixed(0)}" width="2" height="2" fill="${C.cream2}"/>` : '';
  // 악보 줄 3개 (위·가운데·아래)
  const rows = [80, 150, 220];
  rows.forEach((y) => { o += line([P(60, y), P(460, y)], { sw: 2 * Math.min(s, 1.4), color: C.mintD, op: 0.7, step: 60 * s }); });
  // 높은음자리표 비슷한 소용돌이
  const sw = []; for (let i = 0; i < 30; i++) { const a = i * 0.45, r = 26 - i * 0.7; sw.push(P(34 + Math.cos(a) * r * 0.6, 150 + Math.sin(a) * r * 1.6)); }
  o += line(sw, { sw: 2.4 * Math.min(s, 1.4), color: C.rose2, step: 999 });
  // 십자수 별 6개 = 원통에 꽂을 핀 자리. 아래에서 위로 [아래, 가운데, 위, 가운데, 아래, 위]
  const PATTERN = [2, 1, 0, 1, 2, 0];
  PATTERN.forEach((r, i) => {
    const [cx, cy] = P(110 + i * 64, rows[r]);
    o += shape(wob(starPts(cx, cy, 16 * s, 7 * s), { sharp: true, amp: 0.3 * s }), C.red, { sw: 1.4 * Math.min(s, 1.4) });
    o += line([[cx - 5 * s, cy - 5 * s], [cx + 5 * s, cy + 5 * s]], { sw: 1 * s, color: C.red2 }) + line([[cx + 5 * s, cy - 5 * s], [cx - 5 * s, cy + 5 * s]], { sw: 1 * s, color: C.red2 });
  });
  // 귀퉁이 자수: 작은 토끼와 케이크
  o += `<g transform="translate(${P(420, 262)[0]} ${P(420, 262)[1]}) scale(${s * 0.16})">${silhouette(0, 0, 1, C.rose2)}</g>`;
  const [kx, ky] = P(40, 262);
  o += shape(rect(kx, ky, 40 * s, 24 * s, { sharp: true }), C.butter, { sw: 1.2 * Math.min(s, 1.4) }) + line([[kx + 20 * s, ky], [kx + 20 * s, ky - 12 * s]], { sw: 2 * s, color: C.rose }) + dot(kx + 20 * s, ky - 14 * s, 3 * s, C.orange);
  if (!big) o += line([[90 * s + ox, oy], [245 * s + ox, -60 * s + oy], [400 * s + ox, oy]], { sw: 1.6 });
  put(big ? 'zoom/score.svg' : 'props/score.svg', w, h, o, { id: 574, displace: big ? 3 : 1.6, vb: big ? undefined : '0 -40 480 270' });
}
function dressForm() {
  seed(575);
  let o = `<path d="${S([[40, 452], [180, 452], [176, 460], [44, 460]])}" fill="${INK}" opacity="0.2"/>`;
  // 받침: 기둥과 세발
  o += part([[106, 296], [114, 296], [115, 440], [105, 440]], C.woodD, { sw: 1.6 });
  for (const [dx, dy] of [[-56, 452], [56, 452], [0, 458]]) o += part([[106, 432], [114, 432], [110 + dx + (dx > 0 ? 4 : dx < 0 ? -4 : 4), dy - 4], [110 + dx, dy + 2], [110 + dx + (dx > 0 ? -6 : 6), dy - 2]], C.woodD, { sw: 1.4 });
  // 몸통 (어깨 · 가슴 · 허리 · 엉덩이)
  const torso = [[90, 38], [130, 38], [152, 52], [170, 82], [164, 130], [148, 176], [156, 230], [168, 286], [160, 300], [60, 300], [52, 286], [64, 230], [72, 176], [56, 130], [50, 82], [68, 52]];
  o += part(torso, C.cream2, { heavy: [3, 8], shade: [[120, 30], [180, 30], [180, 310], [128, 310], [150, 170]], shadeCol: 'rgba(110,80,50,0.2)' });
  o += line([[110, 44], [110, 300]], { sw: 1, op: 0.35 });
  // 반쯤 꿰맨 보라 조끼 (왼쪽 판만, 시침핀으로 고정)
  const vest = [[70, 54], [96, 60], [104, 120], [106, 290], [62, 290], [68, 232], [76, 178], [60, 132], [54, 86]];
  o += part(vest, C.lilac, { heavy: [5, 7], shade: [[60, 140], [80, 140], [80, 296], [60, 296]], shadeCol: 'rgba(60,40,90,0.2)', hatch: false });
  for (const y of [150, 190, 230, 270]) o += `<circle cx="98" cy="${y}" r="4" fill="${C.cream}" stroke="${INK}" stroke-width="1.2"/>`;
  for (let y = 70; y < 286; y += 14) o += line([[103, y], [106, y + 7]], { sw: 1.2, color: C.red, op: 0.8 });
  o += part([[68, 210], [92, 208], [92, 226], [68, 228]], '#a690c6', { sw: 1.2 });
  for (const [x, y] of [[132, 80], [140, 130], [136, 200]]) o += line([[x, y], [x + 14, y - 10]], { sw: 1.4, color: C.grey2 }) + dot(x + 15, y - 11, 3.6, pick([C.rose, C.butter, C.blue]));
  // 목 손잡이
  o += part([[96, 22], [124, 22], [130, 38], [90, 38]], C.woodD, { sw: 1.6 }) + part([[104, 8], [116, 8], [118, 22], [102, 22]], C.wood2, { sw: 1.4 });
  // 목에 건 줄자
  o += part([[78, 40], [92, 36], [110, 62], [128, 36], [142, 40], [116, 80], [124, 170], [114, 172], [106, 84], [96, 168], [86, 166], [98, 76]], C.butter, { sw: 1.4 });
  for (let y = 90; y < 166; y += 8) o += line([[100, y], [104, y]], { sw: 0.9 }) + line([[118, y], [122, y]], { sw: 0.9 });
  put('props/dressform.svg', 220, 460, o, { id: 575, displace: 1.4 });
}

/* ───────────── 확대 화면 ───────────── */
function zoomTheater(drawerOpen) {
  seed(581);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.pink2);
  for (let x = 0; x < W; x += 44) o += fill(rect(x, 0, 14, H, { amp: 0 }), C.pinkD, 0.25);
  // 무대 틀
  o += shape(rect(300, 0, 1000, 900, { sharp: true, amp: 1.5 }), C.wood2, { sw: 4 });
  o += shape(rect(450, 50, 700, 500, { sharp: true, amp: 1 }), '#e3d4b6', { sw: 3 });
  o += hatch(rect(450, 50, 700, 40), 0.3);
  // 커튼
  o += shape(wob([[320, 20], [470, 20], [440, 300], [470, 560], [320, 560]], { step: 50 }), C.red, { sw: 3 }) + shape(wob([[1280, 20], [1130, 20], [1160, 300], [1130, 560], [1280, 560]], { step: 50 }), C.red, { sw: 3 });
  for (const x of [360, 400, 1200, 1240]) o += line([[x, 30], [x + 4, 550]], { sw: 2, color: C.red2 });
  // 앞 받침대 (조각을 꽂는 곳)
  o += shape(rect(380, 600, 840, 60, { sharp: true }), C.wood3, { sw: 3 }) + hatch(rect(380, 640, 840, 20), 0.4);
  for (const x of [560, 800, 1040]) o += shape(ell(x, 612, 16, 6), C.woodD, { sw: 1.6 }) + line([[x, 612], [x, 560]], { sw: 5, color: C.woodD });
  // 오늘의 그림자 카드
  o += shape(wob([[150, 120], [290, 110], [296, 290], [144, 296]]), C.cream, { sw: 2.4 });
  o += `<g opacity="0.55">${silhouette(168, 196, 0.32, 'none')}</g>`;
  o += silhouette(170, 196, 0.32, '#8a6a5a', 0.5);
  o += shape(ell(220, 112, 8, 8), C.red);
  // 받침 서랍
  if (drawerOpen) {
    o += shape(wob([[680, 690], [920, 690], [960, 800], [640, 800]], { sharp: true }), '#6b4528', { sw: 3 });
    o += shape(rect(640, 800, 320, 70, { sharp: true }), C.wood3, { sw: 3 }) + shape(ell(800, 835, 12, 12), C.brass);
  } else {
    o += shape(rect(680, 700, 240, 80, { sharp: true }), C.wood3, { sw: 3 }) + shape(ell(800, 740, 12, 12), C.brass);
  }
  put(`zoom/theater${drawerOpen ? '_open' : ''}.svg`, W, H, o, { id: 581, displace: 3 });
}
function zoomMousehole() {
  seed(582);
  let o = fill(rect(0, 0, W, 620, { amp: 0 }), C.mint);
  for (let x = 40; x < W; x += 300) o += shape(rect(x, 60, 240, 480, { sharp: true, amp: 1.5 }), 'none', { sw: 3, stroke: C.mintD });
  o += fill(rect(0, 620, W, 280, { amp: 0 }), C.wood) + shape(rect(0, 600, W, 40, { sharp: true }), C.wood2, { sw: 3 });
  for (let x = 0; x < W; x += 160) o += line([[x, 640], [x - 60, 900]], { sw: 2, op: 0.6 });
  // 쥐구멍 안 아늑한 집
  const arch = [[520, 620], [520, 380], ...ellPts(800, 380, 280, 220, Math.PI, Math.PI * 2, 20).slice(1, -1), [1080, 380], [1080, 620]];
  o += shape(wob(arch, { step: 40 }), '#4a3020', { sw: 4 });
  o += `<circle cx="1000" cy="420" r="90" fill="#ffcf80" opacity="0.35" filter="url(#blur)"/>`;
  o += shape(rect(990, 450, 20, 50), C.cream) + dot(1000, 440, 8, '#ffd36b');
  o += shape(rect(560, 520, 160, 70, { sharp: true }), C.red, { sw: 2.4 }) + shape(rect(570, 500, 140, 30, { sharp: true }), C.cream, { sw: 2 });
  o += shape(wob([[960, 560], [1020, 560], [1016, 600], [964, 600]]), C.grey, { sw: 2 });
  o += line([[640, 300], [700, 280], [760, 300]], { sw: 2, color: C.butter }) + dot(700, 294, 6, C.rose);
  put('zoom/mousehole.svg', W, H, o, { id: 582, displace: 3 });
}
function zoomJbox() {
  seed(583);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.cream2);
  for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; o += dot(800 + Math.cos(a) * 760, 460 + Math.sin(a) * 420, 10, C.rose, 0.6); }
  // 상자 앞면 (덮개를 열어 원통이 보인다)
  o += shape(rect(330, 170, 820, 640, { sharp: true, amp: 1.5 }), C.mint, { sw: 4 });
  o += shape(wob([[1150, 170], [1230, 110], [1230, 750], [1150, 810]], { sharp: true }), C.mint2, { sw: 3.5 }) + hatch(wob([[1150, 170], [1230, 110], [1230, 750], [1150, 810]]), 0.35);
  o += shape(wob([[330, 170], [410, 110], [1230, 110], [1150, 170]], { sharp: true }), C.mint2, { sw: 3 });
  for (let i = 0; i < 8; i++) o += dot(380 + i * 100, 210, 9, C.cream) + dot(380 + i * 100, 770, 9, C.cream);
  o += shape(rect(450, 270, 600, 420, { sharp: true }), '#4a3020', { sw: 3 });
  // 오르골 원통과 빗살
  o += shape(rect(480, 300, 560, 360, { sharp: true, amp: 1 }), C.brass, { sw: 3 });
  for (let y = 310; y < 650; y += 14) o += line([[486, y], [1034, y]], { sw: 1, color: C.brass2, op: 0.5, step: 120 });
  o += hatch(rect(480, 560, 560, 100), 0.25);
  for (let i = 0; i < 6; i++) o += line([[548 + i * 85, 290], [548 + i * 85, 670]], { sw: 1.2, color: C.brass2, op: 0.6 });
  [360, 480, 600].forEach((y) => { o += line([[480, y], [1040, y]], { sw: 1.6, color: C.brass2, op: 0.8 }); });
  // 위쪽 빗살 (comb)
  for (let i = 0; i < 6; i++) o += shape(rect(530 + i * 85, 254, 36, 44, { sharp: true }), C.grey, { sw: 1.6 });
  // 손잡이 구멍
  o += shape(ell(1190, 460, 16, 20), '#3a2618', { sw: 2.4 });
  o += shape(wob(starPts(1190, 300, 36, 16), { sharp: true }), C.butter, { sw: 2 });
  put('zoom/jbox.svg', W, H, o, { id: 583, displace: 3 });
}
function pinHead() {
  seed(584);
  const o = line([[30, 30], [30, 64]], { sw: 3, color: C.grey2 }) + shape(ell(30, 24, 16, 16), C.red, { sw: 2 }) + dot(25, 19, 4, '#fff', 0.7);
  put('zoom/pin.svg', 60, 70, o, { id: 584, displace: 1 });
}
function crankBig() {
  seed(585);
  const o = line([[20, 100], [130, 100], [130, 30]], { sw: 16, color: C.brass2 }) + line([[20, 100], [130, 100], [130, 30]], { sw: 3, op: 0.3 }) + shape(ell(130, 26, 22, 26), C.rose, { sw: 2.4 }) + shape(ell(20, 100, 16, 16), C.brass, { sw: 2 });
  put('zoom/crank.svg', 170, 140, o, { id: 585, displace: 1.6 });
}
function zoomTin() {
  seed(586);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.wood3);
  for (let y = 0; y < H; y += 40) o += line([[0, y + rand(0, 10)], [W, y + rand(0, 14)]], { sw: 1.2, op: 0.3, step: 120, amp: 3 });
  o += fill(ell(820, 470, 520, 360), INK, 0.3);
  o += shape(ell(800, 450, 520, 360), C.blue, { sw: 4 }) + shape(ell(800, 450, 480, 324), '#f3e6d0', { sw: 3 });
  // 실패, 단추, 골무, 줄자
  const sp = [[520, 330, C.rose], [640, 260, C.mint], [600, 560, C.butter], [1020, 300, C.lilac], [1080, 520, C.red]];
  sp.forEach(([x, y, c]) => { o += shape(ell(x, y, 56, 56), C.wood3, { sw: 2.4 }) + shape(ell(x, y, 44, 44), c, { sw: 1.6 }); for (let k = 0; k < 5; k++) o += line(ellPts(x, y, 40 - k * 6, 40 - k * 6, 0.3, 2.5, 8), { sw: 1, op: 0.4, step: 999 }); o += shape(ell(x, y, 12, 12), C.wood2); });
  for (let i = 0; i < 9; i++) { const x = rand(720, 960), y = rand(560, 700), r = rand(14, 22); o += shape(ell(x, y, r, r), pick([C.rose, C.butter, C.mint, C.blue, C.cream]), { sw: 1.8 }) + dot(x - 4, y, 2.4, INK) + dot(x + 4, y, 2.4, INK); }
  o += shape(wob([[870, 180], [930, 180], [940, 270], [860, 270]]), C.grey, { sw: 2.4 });
  for (let y = 196; y < 262; y += 12) for (let x = 872; x < 932; x += 12) o += dot(x, y, 2, C.grey2);
  o += line(ellPts(760, 440, 70, 40, 0, Math.PI * 1.7, 16), { sw: 14, color: C.butter, step: 999 });
  put('zoom/tin.svg', W, H, o, { id: 586, displace: 3 });
}

/* ───────────── 아이템 (160x160) ───────────── */
function items() {
  const I = (n, b, id) => put(`items/${n}.svg`, 160, 160, b, { id, displace: 1.6 });
  seed(601);
  I('rubberband', [0, 1, 2].map((k) => line(ellPts(80 + k * 4, 84 - k * 6, 52 - k * 6, 36 - k * 4, 0, Math.PI * 2, 24), { sw: 6, color: [C.rose, C.butter2, C.mint2][k], step: 999 }) + line(ellPts(80 + k * 4, 84 - k * 6, 52 - k * 6, 36 - k * 4, 0, Math.PI * 2, 24), { sw: 1.2, step: 999, op: 0.6 })).join(''), 601);
  seed(602);
  I('cheese', shape(wob([[20, 120], [140, 96], [120, 40]]), C.butter, { sw: 2.6 }) + shape(wob([[20, 120], [140, 96], [140, 124], [20, 140]]), C.butter2, { sw: 2.4 }) + dot(80, 96, 9, C.butter2) + dot(108, 78, 6, C.butter2) + dot(56, 124, 5, '#c99a3a') + hatch(wob([[90, 104], [140, 96], [140, 124], [90, 130]]), 0.3), 602);
  seed(603);
  I('crank', `<g transform="translate(-6 10)">${line([[20, 100], [130, 100], [130, 30]], { sw: 14, color: C.brass2 })}${shape(ell(130, 26, 20, 24), C.rose, { sw: 2.2 })}${shape(ell(20, 100, 14, 14), C.brass, { sw: 2 })}</g>`, 603);
  seed(604);
  I('pins', shape(wob([[30, 120], [130, 120], [124, 140], [36, 140]]), C.wood2) + [...Array(6)].map((_, i) => line([[40 + i * 16, 118], [46 + i * 14, 50]], { sw: 2.4, color: C.grey2 }) + shape(ell(46 + i * 14, 46, 9, 9), [C.rose, C.butter, C.blue, C.mint, C.red, C.lilac][i], { sw: 1.4 })).join(''), 604);
  seed(605);
  I('ripper', `<g transform="rotate(-40 80 80)">${shape(rect(66, 74, 28, 70, { sharp: true }), C.rose, { sw: 2.2 })}${line([[80, 74], [80, 26]], { sw: 4, color: C.grey2 })}${line([[80, 26], [70, 12]], { sw: 3, color: C.grey2 })}${dot(84, 36, 4, C.red)}</g>`, 605);
  seed(606);
  I('carrot', carrot(26, 92, 120, -0.35, { plush: true }), 606);
  seed(607);
  I('key', `<g transform="rotate(-35 80 80)">${carrot(80, 24, 56, Math.PI / 2)}${shape(rect(74, 76, 12, 68, { sharp: true }), C.brass, { sw: 2.2 })}${shape(rect(86, 120, 20, 10), C.brass)}${shape(rect(86, 136, 14, 8), C.brass)}</g>`, 607);
}

function windowView() {
  seed(564);
  let o = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f0"/><stop offset="1" stop-color="#fbf2d8"/></linearGradient></defs><rect x="0" y="0" width="400" height="360" fill="url(#sk)"/>`;
  o += fill(ell(90, 70, 70, 22), '#ffffff', 0.85) + fill(ell(300, 110, 60, 18), '#ffffff', 0.8);
  o += `<circle cx="330" cy="50" r="30" fill="#fff6c8" opacity="0.9"/>`;
  o += fill(wob([[0, 230], [120, 200], [260, 225], [400, 195], [400, 360], [0, 360]], { step: 40, amp: 3 }), '#a9cf86');
  for (let i = 0; i < 7; i++) o += fill(ell(i * 64 + rand(-10, 10), 222, rand(26, 38), rand(24, 32)), pick(['#8fbf6a', '#7eb05c']));
  o += fill(wob([[0, 290], [400, 280], [400, 360], [0, 360]], { step: 50, amp: 3 }), '#c3df9c');
  for (let i = 0; i < 12; i++) o += dot(rand(10, 390), rand(295, 350), 5, pick([C.rose, C.butter, '#ffffff', C.lilac]));
  o += shape(rect(0, 0, 400, 360, { sharp: true }), 'none', { sw: 14, stroke: C.cream });
  o += line([[200, 0], [200, 360]], { sw: 8, color: C.cream }) + line([[0, 180], [400, 180]], { sw: 8, color: C.cream });
  o += line([[20, 70], [60, 30]], { sw: 3, color: '#fff', op: 0.6 }) + line([[220, 240], [260, 200]], { sw: 3, color: '#fff', op: 0.5 });
  put('props/window_day.svg', 400, 360, o, { id: 564 });
}
windowView();
outside(false); outside(true);
bgNorth(); bgEast(); bgSouth(); bgWest();
mocha(false); mocha(true); sideTable(); jbox('closed'); jbox('open'); crankSmall(); door(false); door(true); note();
bench(); lamp(false); lamp(true); lampGlow(); theater('dark'); theater('lit'); theater('done'); mouseFig('peek'); mouseFig('hungry'); mouseFig('happy');
curtains(false); curtains(true); jar(false); jar(true); rockingHorse();
sewingTable(); pincushion(true); pincushion(false); tin(); scoreArt(false); scoreArt(true); dressForm();
zoomTheater(false); zoomTheater(true); zoomMousehole(); zoomJbox(); pinHead(); crankBig(); zoomTin();
woodPiece('piece_body', 220, 170, bodyD(), 591); woodPiece('piece_head', 150, 130, headD() + eyeD(), 592); woodPiece('piece_ears', 100, 150, earsD(), 593);
items();
console.log('toyshop assets written, ~' + Math.round(total / 1024) + 'KB');
