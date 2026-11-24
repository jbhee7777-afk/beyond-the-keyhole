// 5장 「바닷속 우체국」 그래픽 에셋 생성기
// node tools/art/sea.mjs  → assets/rooms/sea/**
// 분위기: 심해 청록·물빛·산호·진주·해파리 보라. 신비롭고 몽환적으로.
import { seed, rand, pick, INK, wob, rect, rectPts, ell, ellPts, rot, shape, fill, line, hatch, leaf, svg } from './ink.mjs';
import { part, S, O, octopusArt } from './chars.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../../assets/rooms/sea/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  deep: '#1d4d5a', deep2: '#163c48', water: '#5fa3a8', water2: '#7fc0c0', coral: '#e98a72', coral2: '#c96a54', pearl: '#efe8dc', pearl2: '#d8cfbe',
  jelly: '#b59ad6', jelly2: '#8a6ab8', sand: '#d9c49a', sand2: '#c2a878', wood: '#8a6a4a', wood2: '#6b4f36', brass: '#d4a649', brass2: '#9d7428', brassL: '#f0cf7c',
  kelp: '#4f8a5a', kelp2: '#3a6a44', blue: '#2e5a7a', red: '#c44a3a', star: '#f0a050', fish: '#f0d070', silver: '#c8d4d8', silver2: '#8fa3a8', ink2: '#3a3050',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const raw = (rel, w, h, body) => { mkdirSync(OUT + rel.split('/').slice(0, -1).join('/'), { recursive: true }); writeFileSync(OUT + rel, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const bubble = (x, y, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#dff4f4" fill-opacity="0.25" stroke="#dff4f4" stroke-width="1.4" stroke-opacity="0.7"/><circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.25).toFixed(1)}" fill="#fff" opacity="0.8"/>`;

// 불가사리 (팔 다섯 개를 또렷하게)
function starfish(cx, cy, r, ang = 0, col = C.star) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = ang - Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.42 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  let o = part(pts, col, { sw: 1.8, heavy: [2, 5] });
  for (let i = 0; i < 5; i++) { const a = ang - Math.PI / 2 + i * Math.PI * 2 / 5; for (let k = 1; k < 4; k++) o += dot(cx + Math.cos(a) * r * k * 0.22, cy + Math.sin(a) * r * k * 0.22, Math.max(1.2, r * 0.05), '#fff3d8', 0.9); }
  return o;
}
function fishShape(x, y, s, col, flip = false) {
  const pts = [[0, 0], [14, -10], [34, -8], [44, 0], [34, 8], [14, 10]].map(([px, py]) => [x + (flip ? -px : px) * s, y + py * s]);
  let o = part(pts, col, { sw: 1.2 });
  o += part([[x + (flip ? -42 : 42) * s, y], [x + (flip ? -54 : 54) * s, y - 8 * s], [x + (flip ? -54 : 54) * s, y + 8 * s]], col, { sw: 1.1 });
  o += dot(x + (flip ? -10 : 10) * s, y - 2 * s, 1.8 * s, INK);
  return o;
}
function jellyfish(cx, cy, r, glow) {
  let o = '';
  if (glow) o += `<circle cx="${cx}" cy="${cy + r * 0.4}" r="${r * 2.4}" fill="#d6c4ff" opacity="0.4" filter="url(#blur)"/>`;
  for (let k = 0; k < 5; k++) { const x = cx - r * 0.6 + k * r * 0.3; o += line([[x, cy + r * 0.3], [x + Math.sin(k) * 6, cy + r * 1.2], [x - Math.sin(k) * 6, cy + r * 2]], { sw: 2, color: glow ? '#e8dcff' : C.jelly2, op: 0.8, step: 999 }); }
  o += part([[cx - r, cy + r * 0.3], [cx - r * 0.9, cy - r * 0.4], [cx - r * 0.4, cy - r * 0.85], [cx + r * 0.4, cy - r * 0.85], [cx + r * 0.9, cy - r * 0.4], [cx + r, cy + r * 0.3], [cx + r * 0.6, cy + r * 0.4], [cx + r * 0.2, cy + r * 0.3], [cx - r * 0.2, cy + r * 0.4], [cx - r * 0.6, cy + r * 0.3]], glow ? '#e2d4ff' : C.jelly, { sw: 1.8, light: [[cx - r * 0.6, cy - r * 0.3], [cx - r * 0.2, cy - r * 0.7], [cx - r * 0.3, cy - r * 0.2]] });
  o += dot(cx - r * 0.25, cy - r * 0.15, r * 0.08, INK) + dot(cx + r * 0.25, cy - r * 0.15, r * 0.08, INK);
  return o;
}

/* ───────────── 우체국 껍데기 ───────────── */
function shell() {
  let o = '';
  o += part([[0, 0], [W, 0], [1460, 70], [140, 70]], C.deep2, { sw: 2 });
  for (let i = 0; i < 6; i++) o += part(ellPts(260 + i * 216, 34, 28, 14, 0, Math.PI * 2, 12), '#e9f6f2', { sw: 1.4 }) + `<circle cx="${260 + i * 216}" cy="34" r="40" fill="#bfe8e8" opacity="0.25" filter="url(#blur)"/>`;
  for (const side of [0, 1]) {
    const X = (u) => side ? W - 140 * u : 140 * u;
    const at = (u, v) => [X(u), 70 * u + (900 - 260 * u - 70 * u) * v];
    o += part([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], C.deep, { sw: 2 });
    o += part([at(0, 0.66), at(1, 0.66), at(1, 1), at(0, 1)], C.wood2, { sw: 1.6 });
    o += hatch(wob([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { sharp: true }), 0.25, 'hatch2');
  }
  // 뒷벽: 청록 판자 + 조개 무늬 띠
  o += part([[140, 70], [1460, 70], [1460, 520], [140, 520]], '#2e6a74', { sw: 2 });
  for (let x = 140; x < 1460; x += 66) o += line([[x, 72], [x + rand(-2, 2), 518]], { sw: 1.2, op: 0.35 });
  for (let x = 170; x < 1450; x += 90) { o += part([[x, 116], [x + 14, 96], [x + 28, 116], [x + 14, 124]], C.pearl2, { sw: 1 }); for (let k = -2; k <= 2; k++) o += line([[x + 14, 122], [x + 14 + k * 5, 100]], { sw: 0.6, op: 0.5 }); }
  o += part([[140, 512], [1460, 512], [1460, 640], [140, 640]], C.wood, { sw: 2 });
  for (let x = 160; x < 1440; x += 132) o += part(rectPts(x, 530, 112, 92), 'none', { sw: 1.4 });
  o += part([[130, 500], [1470, 500], [1470, 516], [130, 516]], C.brass2, { sw: 1.8 });
  // 모래빛 마루 타일
  const rows = [640, 672, 712, 762, 826, 900], N = 12;
  const xAt = (y, k) => { const t = (y - 640) / 260; const xb = 140 + k * 1320 / N, xf = -60 + k * 1720 / N; return xb + (xf - xb) * t; };
  for (let r = 0; r < rows.length - 1; r++) for (let i = 0; i < N; i++) { const y0 = rows[r], y1 = rows[r + 1]; o += part([[xAt(y0, i), y0], [xAt(y0, i + 1), y0], [xAt(y1, i + 1), y1], [xAt(y1, i), y1]], (r + i) % 2 ? C.sand : C.sand2, { sw: 1.3 }); }
  o += hatch(wob([[140, 640], [1460, 640], [1460, 660], [140, 660]], { sharp: true }), 0.45);
  for (let i = 0; i < 14; i++) o += bubble(rand(160, 1440), rand(90, 480), rand(4, 10));
  return o;
}

/* ───────────── 배경 ───────────── */
function bgNorth() {
  seed(1011);
  let o = shell();
  // 거품 우편관 (바닥에서 천장까지 유리관)
  o += part([[1100, 70], [1200, 70], [1200, 640], [1100, 640]], '#9fd6d6', { sw: 2.4 }) + `<rect x="1100" y="70" width="100" height="570" fill="#dff4f4" opacity="0.15"/>`;
  for (const y of [120, 300, 600]) o += part(rectPts(1090, y, 120, 18), C.brass, { sw: 1.4 });
  for (let i = 0; i < 7; i++) o += bubble(1150 + rand(-30, 30), rand(100, 600), rand(4, 9));
  o += line([[1118, 90], [1118, 620]], { sw: 3, color: '#fff', op: 0.3 });
  // 엘리베이터 자리
  o += part([[1250, 640], [1250, 240], [1440, 240], [1440, 640]], '#123038', { sw: 3 });
  o += part(rectPts(1300, 180, 90, 40), C.brass, { sw: 1.6 }) + line([[1345, 210], [1345, 190]], { sw: 3 }) + `<path d="M1335 196 L1345 186 L1355 196Z" fill="${INK}"/>`;
  // 창구 뒤 선반의 소포들
  for (let i = 0; i < 6; i++) { const x = 220 + i * 70, h = rand(40, 70); o += part(rectPts(x, 300 - h, 60, h), pick([C.pearl, C.sand, '#e8c8a0']), { sw: 1.4 }) + line([[x + 30, 300 - h], [x + 30, 300]], { sw: 2, color: C.red }); }
  o += part(rectPts(200, 300, 460, 14), C.wood, { sw: 1.4 });
  put('bg/north.svg', W, H, o, { id: 1011 });
}
function bgEast() {
  seed(1012);
  let o = shell();
  // 우편함 벽 (번호는 확대 화면에서 본다)
  o += part(rectPts(320, 150, 960, 400), C.wood2, { sw: 2.6, heavy: [1, 2] });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const x = 340 + c * 156, y = 170 + r * 124; o += part(rectPts(x, y, 140, 108), C.wood, { sw: 1.6 }) + part(ellPts(x + 120, y + 56, 6, 6, 0, Math.PI * 2, 8), C.brass, { sw: 1 }) + part(rectPts(x + 40, y + 12, 60, 20), C.brass2, { sw: 1 }); }
  // 해파리 등불 끈
  o += line([[1360, 70], [1360, 420]], { sw: 2.4, color: C.pearl2 }) + part(ellPts(1360, 432, 12, 16, 0, Math.PI * 2, 10), C.coral, { sw: 1.6 });
  put('bg/east.svg', W, H, o, { id: 1012 });
}
function bgSouth() {
  seed(1013);
  let o = shell();
  // 큰 둥근 창의 테 (창 안은 소품)
  o += part(ellPts(800, 300, 250, 220, 0, Math.PI * 2, 30), C.brass, { sw: 3, heavy: [2, 10] });
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; o += dot(800 + Math.cos(a) * 236, 300 + Math.sin(a) * 207, 6, C.brassL); }
  put('bg/south.svg', W, H, o, { id: 1013 });
}
function bgWest() {
  seed(1014);
  let o = shell();
  // 조개 선반
  o += part(rectPts(200, 400, 380, 14), C.wood, { sw: 1.6 });
  for (const x of [220, 540]) o += part([[x, 414], [x + 14, 414], [x + 4, 444]], C.wood2, { sw: 1.2 });
  o += part([[230, 400], [250, 370], [280, 362], [300, 380], [290, 400]], C.pearl, { sw: 1.4 });
  for (let k = 0; k < 4; k++) o += line([[262, 398], [250 + k * 12, 370]], { sw: 0.8, op: 0.6 });
  o += part([[460, 400], [470, 376], [500, 370], [520, 386], [512, 400]], '#f0c8b8', { sw: 1.4 });
  // 갈고리 걸이 판
  o += part(rectPts(680, 200, 160, 120), C.wood, { sw: 1.8 }) + dot(700, 220, 3, C.brass) + dot(820, 220, 3, C.brass);
  put('bg/west.svg', W, H, o, { id: 1014 });
}
function caustics() {
  let o = `<defs><filter id="b"><feGaussianBlur stdDeviation="6"/></filter></defs><g filter="url(#b)" opacity="0.35" fill="none" stroke="#dff8ff" stroke-width="6">`;
  seed(1015);
  for (let i = 0; i < 30; i++) { const x = rand(-100, W), y = rand(0, H); o += `<path d="${O([[x, y], [x + 60, y + rand(-20, 20)], [x + 120, y + rand(-30, 30)], [x + 160, y + rand(-20, 20)]], 4)}"/>`; }
  o += '</g>';
  raw('bg/caustics.svg', W, H, o);
}

/* ───────────── 북쪽 소품 ───────────── */
function counter() {
  seed(1021);
  const w = 640, h = 260;
  let o = `<path d="${S([[10, 250], [630, 250], [626, 260], [14, 260]])}" fill="${INK}" opacity="0.25"/>`;
  o += part([[0, 30], [640, 30], [640, 60], [0, 60]], C.wood, { sw: 2.4, heavy: [1, 2] });
  o += part([[20, 60], [620, 60], [620, 250], [20, 250]], C.wood2, { sw: 2.4, heavy: [1, 2], shade: [[460, 56], [624, 56], [624, 254], [460, 254]], shadeCol: 'rgba(0,0,0,0.22)' });
  for (const x of [40, 220, 400]) o += part(rectPts(x, 80, 160, 150), 'none', { sw: 1.4 });
  // 봉투 문장
  o += part(rectPts(270, 120, 100, 66), C.pearl, { sw: 1.6 }) + line([[270, 120], [320, 160], [370, 120]], { sw: 1.4 }) + dot(320, 162, 6, C.red);
  o += line([[0, 34], [640, 34]], { sw: 2, color: C.brassL, op: 0.6 });
  put('props/counter.svg', w, h, o, { id: 1021 });
}
function octopus(state) {
  seed(1022);
  put(`props/octopus_${state}.svg`, 420, 440, octopusArt(state), { id: 1022, displace: 1.2 });
}
function tubeHatch(open) {
  seed(1023);
  let o = part(rectPts(4, 4, 132, 112), C.brass, { sw: 2.2, heavy: [1, 2] });
  if (open) o += part(rectPts(18, 18, 104, 84), '#123038', { sw: 1.8 }) + part([[120, 18], [150, 10], [150, 110], [120, 102]], C.brass2, { sw: 1.8 });
  else { o += part(rectPts(18, 18, 104, 84), '#9fd6d6', { sw: 1.6 }) + part(ellPts(70, 60, 16, 16, 0, Math.PI * 2, 10), C.coral, { sw: 1.4 }) + `<path d="M66 54 L74 54 L72 70 L68 70Z" fill="${INK}"/>`; }
  put(`props/hatch_${open ? 'open' : 'closed'}.svg`, 156, 120, o, { id: 1023 });
}
function elevator(open) {
  seed(1024);
  const w = 200, h = 410;
  let o = '';
  if (open) {
    o += part(rectPts(6, 6, 188, 398), '#bfe8f0', { sw: 2 });
    o += `<circle cx="100" cy="80" r="80" fill="#fffbe6" opacity="0.7" filter="url(#blur)"/>`;
    for (let i = 0; i < 10; i++) o += bubble(rand(20, 180), rand(40, 380), rand(5, 12));
    o += line([[60, 0], [60, 410]], { sw: 2, color: C.brass2 }) + line([[140, 0], [140, 410]], { sw: 2, color: C.brass2 });
    o += part(rectPts(6, 6, 18, 398), C.brass, { sw: 1.6 }) + part(rectPts(176, 6, 18, 398), C.brass, { sw: 1.6 });
  } else {
    o += part(rectPts(6, 6, 188, 398), '#1a3a44', { sw: 2.4 });
    for (let x = 20; x < 190; x += 22) o += line([[x, 8], [x, 402]], { sw: 3, color: C.brass });
    for (const y of [60, 200, 340]) o += line([[8, y], [192, y]], { sw: 3, color: C.brass });
    for (let i = 0; i < 9; i++) { const x = 14 + i * 20; o += line([[x, 60], [x + 20, 200]], { sw: 1.4, color: C.brass2, op: 0.8 }) + line([[x + 20, 60], [x, 200]], { sw: 1.4, color: C.brass2, op: 0.8 }); }
  }
  put(`props/elevator_${open ? 'open' : 'closed'}.svg`, w, h, o, { id: 1024 });
}

/* ───────────── 동쪽 소품 ───────────── */
function jellyLamp(glow) {
  seed(1031);
  let o = line([[70, 0], [70, 40]], { sw: 2, color: C.brass2 });
  o += part([[30, 40], [110, 40], [124, 80], [120, 200], [100, 220], [40, 220], [20, 200], [16, 80]], glow ? '#e6f6ff' : '#2a4a58', { sw: 2, heavy: [2, 4] });
  o += `<rect x="24" y="50" width="92" height="162" rx="20" fill="#ffffff" opacity="${glow ? 0.15 : 0.06}"/>`;
  o += jellyfish(70, 120, 30, glow);
  o += part(rectPts(26, 30, 88, 16), C.brass, { sw: 1.4 });
  put(`props/jelly_${glow ? 'on' : 'off'}.svg`, 140, 230, o, { id: 1031 });
}
function jellyGlowLayer() {
  raw('bg/jellyglow_east.svg', W, H, `<defs><radialGradient id="g"><stop offset="0" stop-color="#e2d4ff" stop-opacity="0.8"/><stop offset="1" stop-color="#b59ad6" stop-opacity="0"/></radialGradient></defs><circle cx="230" cy="260" r="420" fill="url(#g)"/><circle cx="1440" cy="230" r="380" fill="url(#g)"/>`);
}
function zoomBoxes(lit) {
  seed(1032);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#2e6a74');
  o += part(rectPts(120, 70, 1360, 760), C.wood2, { sw: 3.5, heavy: [1, 2] });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const x = 150 + c * 222, y = 100 + r * 244;
    o += part(rectPts(x, y, 200, 220), C.wood, { sw: 2.2, shade: [[x + 150, y], [x + 204, y], [x + 204, y + 224], [x + 150, y + 224]], shadeCol: 'rgba(0,0,0,0.2)', hatch: false });
    o += part(rectPts(x + 40, y + 24, 120, 56), C.brassL, { sw: 1.6 }) + part(ellPts(x + 170, y + 120, 10, 10, 0, Math.PI * 2, 10), C.brass, { sw: 1.4 });
    o += part(rectPts(x + 40, y + 150, 120, 16), '#3a2a1e', { sw: 1.2 });
  }
  if (!lit) o += `<rect width="${W}" height="${H}" fill="#06141c" opacity="0.75"/>`;
  put(`zoom/boxes${lit ? '' : '_dark'}.svg`, W, H, o, { id: 1032, displace: 2.4 });
}
function zoomBoxOpen() {
  seed(1033);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#2e6a74');
  o += part(rectPts(380, 120, 840, 660), C.wood, { sw: 3.5, heavy: [1, 2] }) + part(rectPts(440, 180, 720, 540), '#3a2a1e', { sw: 2.4 });
  o += part([[1160, 180], [1260, 140], [1260, 760], [1160, 720]], C.wood2, { sw: 2.4 });
  o += part(rectPts(540, 200, 120, 48), C.brassL, { sw: 1.6 }) + `<text x="600" y="236" font-family="serif" font-size="34" text-anchor="middle" fill="${INK}">58</text>`;
  put('zoom/box_open.svg', W, H, o, { id: 1033, displace: 2.4 });
}

/* ───────────── 남쪽 소품 ───────────── */
function windowSea(whale) {
  seed(1041);
  const w = 480, h = 420;
  let o = `<defs><radialGradient id="sea" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#7fc0c8"/><stop offset="1" stop-color="#1d4d5a"/></radialGradient><clipPath id="win"><ellipse cx="240" cy="210" rx="228" ry="200"/></clipPath></defs>`;
  let g = `<rect width="${w}" height="${h}" fill="url(#sea)"/>`;
  for (let i = 0; i < 6; i++) g += `<path d="${O([[rand(0, 480), 0], [rand(0, 480), 420]], 4)}" stroke="#dff8ff" stroke-width="14" opacity="0.12" fill="none"/>`;
  g += part([[0, 360], [80, 330], [160, 350], [260, 320], [360, 345], [480, 320], [480, 420], [0, 420]], C.sand2, { sw: 1.2 });
  for (let i = 0; i < 5; i++) { const x = 40 + i * 100; g += line([[x, 360], [x + rand(-10, 10), 280], [x + rand(-14, 14), 220]], { sw: 6, color: C.kelp, step: 999 }); }
  if (whale) {
    // 창 가득 다가온 다정한 고래
    g += part([[-40, 120], [80, 60], [260, 50], [420, 80], [520, 140], [520, 330], [400, 360], [200, 360], [40, 330], [-40, 260]], '#5a7fa8', { heavy: [3, 6], sw: 2.4, shade: [[-40, 240], [520, 240], [520, 380], [-40, 380]], shadeCol: 'rgba(20,30,60,0.25)' });
    g += part([[40, 250], [200, 290], [380, 290], [500, 250], [520, 330], [400, 360], [200, 360], [40, 330]], '#e6ecf0', { sw: 1.8 });
    for (let k = 0; k < 7; k++) g += line([[100 + k * 50, 280], [96 + k * 50, 350]], { sw: 1.2, op: 0.4 });
    g += `<path d="${S([[300, 160], [318, 146], [336, 160], [318, 178]], 0.2)}" fill="${INK}"/>` + dot(324, 154, 4, '#fff');
    g += line([[290, 140], [318, 128], [344, 138]], { sw: 2.4 });
    g += line([[180, 250], [260, 272], [340, 256]], { sw: 3 }) + dot(370, 220, 14, '#f0a0a4', 0.5);
    for (let i = 0; i < 5; i++) g += bubble(120 + i * 30, 60 - i * 10, 6 + i);
  } else {
    g += fishShape(90, 130, 1.4, C.fish) + fishShape(170, 170, 1.1, '#f0b0a0') + fishShape(360, 110, 1.2, '#a0d0f0', true) + fishShape(300, 220, 0.9, C.fish, true);
    for (let i = 0; i < 6; i++) g += bubble(rand(40, 440), rand(40, 300), rand(4, 9));
  }
  o += `<g clip-path="url(#win)">${g}</g>`;
  // 유리에 붙은 불가사리 (팔 다섯 개)
  o += starfish(360, 300, 42, 0.2);
  o += `<ellipse cx="240" cy="210" rx="228" ry="200" fill="none" stroke="${INK}" stroke-width="3"/>`;
  o += line([[110, 110], [170, 60]], { sw: 6, color: '#fff', op: 0.3 });
  put(`props/window_${whale ? 'whale' : 'sea'}.svg`, w, h, o, { id: 1041, displace: 1.6 });
}
function coral(withKey) {
  seed(1042);
  const w = 340, h = 300;
  let o = `<path d="${S([[20, 290], [320, 290], [316, 300], [24, 300]])}" fill="${INK}" opacity="0.25"/>`;
  o += part([[30, 290], [40, 220], [70, 200], [120, 210], [150, 190], [200, 200], [250, 180], [300, 210], [314, 290]], '#b8a68a', { sw: 2, heavy: [6, 8] });
  // 가지 산호
  const branch = (x, y, len, a, col) => { let s = ''; const pts = [[x, y]]; let cx = x, cy = y, ang = a; for (let k = 0; k < 4; k++) { cx += Math.cos(ang) * len / 4; cy += Math.sin(ang) * len / 4; ang += rand(-0.3, 0.3); pts.push([cx, cy]); } s += line(pts, { sw: 14, color: INK, step: 999 }) + line(pts, { sw: 10, color: col, step: 999 }); s += line([pts[2], [pts[2][0] + 30, pts[2][1] - 30]], { sw: 12, color: INK }) + line([pts[2], [pts[2][0] + 30, pts[2][1] - 30]], { sw: 8, color: col }); return s; };
  o += branch(80, 210, 150, -1.8, C.coral) + branch(200, 196, 170, -1.4, C.coral2) + branch(270, 200, 120, -1.2, '#f0a0b0');
  // 바위 틈 (열쇠가 끼어 있음)
  o += `<path d="${S([[130, 250], [190, 240], [220, 262], [160, 272]], 0.6)}" fill="#1a1a20"/>`;
  if (withKey) o += part(ellPts(170, 256, 7, 7, 0, Math.PI * 2, 8), C.brass, { sw: 1.2 }) + part([[176, 254], [204, 254], [204, 259], [176, 259]], C.brass, { sw: 1 }) + line([[160, 236], [160, 248]], { sw: 2, color: '#fff' }) + line([[154, 242], [166, 242]], { sw: 2, color: '#fff' });
  for (let i = 0; i < 4; i++) o += starfish(rand(40, 300), rand(250, 280), 10, rand(0, 1), pick([C.star, '#e8b0c0']));
  put(`props/coral${withKey ? '_key' : ''}.svg`, w, h, o, { id: 1042 });
}
function fishShadow() {
  // 바닥에 비친 물고기 떼 그림자: 화살표 모양으로 산호 쪽을 가리킨다
  let o = `<filter id="b"><feGaussianBlur stdDeviation="3"/></filter><g filter="url(#b)" fill="#0a2028" opacity="0.5">`;
  const pts = [[0, 60], [40, 50], [80, 40], [120, 30], [160, 20], [200, 10], [240, 0], [190, 40], [170, 70], [150, 100], [210, 60], [240, 0]];
  const arrow = [[20, 60], [60, 56], [100, 52], [140, 48], [180, 44], [220, 40], [260, 36], [224, 14], [236, 22], [230, 60], [240, 70]];
  for (const [x, y] of arrow) o += `<path d="M${x} ${y} l14 -7 l16 2 l8 5 l-8 5 l-16 2 z M${x - 6} ${y} l-10 -6 l0 12 z"/>`;
  o += '</g>';
  raw('props/fishshadow.svg', 300, 90, o);
}

/* ───────────── 서쪽 소품 ───────────── */
function conch() {
  seed(1051);
  let o = part([[20, 80], [40, 40], [80, 20], [120, 26], [140, 50], [130, 80], [100, 100], [60, 104]], '#f0d0c0', { sw: 2, heavy: [3, 6], shade: [[80, 60], [150, 40], [150, 110], [60, 110]], shadeCol: 'rgba(140,70,50,0.2)' });
  o += part([[100, 58], [126, 48], [132, 70], [112, 84], [96, 76]], '#f6a8a0', { sw: 1.4 });
  for (let k = 0; k < 4; k++) o += line([[40 + k * 18, 46 - k * 4], [50 + k * 20, 96 - k * 2]], { sw: 1.2, op: 0.5 });
  for (let k = 0; k < 5; k++) o += part([[30 + k * 18, 44 - k * 5], [36 + k * 18, 30 - k * 5], [42 + k * 18, 42 - k * 5]], '#f0d0c0', { sw: 1 });
  put('props/conch.svg', 160, 120, o, { id: 1051 });
}
function hookOnBoard(has) {
  seed(1052);
  let o = '';
  if (has) o += line([[40, 10], [40, 70], [30, 86], [18, 80], [20, 66]], { sw: 4, color: C.silver2 }) + line([[20, 66], [26, 60]], { sw: 3, color: C.silver2 }) + part(ellPts(40, 10, 6, 6, 0, Math.PI * 2, 8), C.silver, { sw: 1.2 });
  o += dot(40, 4, 3, C.brass);
  put(`props/hook${has ? '' : '_none'}.svg`, 80, 100, o, { id: 1052 });
}
function kelpRope(has) {
  seed(1053);
  let o = '';
  if (has) { const pts = []; for (let i = 0; i <= 14; i++) pts.push([40 + Math.sin(i * 0.8) * 10, i * 30]); o += line(pts, { sw: 12, color: INK, step: 999 }) + line(pts, { sw: 8, color: C.kelp, step: 999 }); for (let i = 1; i < 14; i += 2) o += leaf(pts[i][0], pts[i][1], 34, i % 4 === 1 ? 0.5 : Math.PI - 0.5, pick([C.kelp, C.kelp2]), { w: 0.4 }); }
  put(`props/kelp${has ? '' : '_none'}.svg`, 90, 430, o, { id: 1053 });
}
function stampDesk() {
  seed(1054);
  const w = 360, h = 300;
  let o = `<path d="${S([[10, 290], [350, 290], [346, 300], [14, 300]])}" fill="${INK}" opacity="0.25"/>`;
  for (const x of [20, 320]) o += part([[x, 110], [x + 20, 110], [x + 16, 296], [x + 4, 296]], C.wood2, { sw: 1.6 });
  o += part(rectPts(0, 80, 360, 34), C.wood, { sw: 2.2, heavy: [1, 2] });
  o += part(rectPts(60, 116, 240, 70), C.wood2, { sw: 2, heavy: [1, 2] }) + part(rectPts(160, 140, 40, 12), C.brass, { sw: 1.2 });
  // 도장과 잉크판
  o += part(rectPts(40, 56, 80, 26), C.ink2, { sw: 1.6 }) + part([[220, 80], [250, 80], [246, 40], [224, 40]], C.wood, { sw: 1.4 }) + part(ellPts(235, 34, 14, 10, 0, Math.PI * 2, 10), C.red, { sw: 1.4 });
  o += part([[280, 78], [330, 72], [334, 80], [282, 84]], C.pearl, { sw: 1.2 });
  put('props/stampdesk.svg', w, h, o, { id: 1054 });
}
function zoomStamps() {
  seed(1055);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), C.wood2);
  o += part(rectPts(200, 120, 1200, 660), '#4a3020', { sw: 3 });
  o += part(rectPts(240, 160, 1120, 580), '#2e5a5a', { sw: 2 });
  for (let i = 0; i < 20; i++) o += line([[rand(260, 1340), rand(180, 720)], [rand(260, 1340), rand(180, 720)]], { sw: 1, color: '#244a4a', op: 0.4, step: 200 });
  put('zoom/stamps.svg', W, H, o, { id: 1055, displace: 2.4 });
}
function zoomCoral() {
  seed(1056);
  let o = fill(rect(0, 0, W, H, { amp: 0 }), '#2e6a74');
  o += part([[100, 900], [200, 400], [500, 300], [900, 340], [1300, 280], [1500, 500], [1560, 900]], '#b8a68a', { sw: 3, heavy: [2, 4] });
  o += `<path d="${S([[540, 560], [900, 520], [1080, 600], [720, 660]], 2)}" fill="#141418"/>`;
  for (let i = 0; i < 6; i++) o += starfish(rand(200, 1400), rand(720, 860), rand(20, 34), rand(0, 1), pick([C.star, '#e8b0c0']));
  put('zoom/coral.svg', W, H, o, { id: 1056, displace: 3 });
}

/* ───────────── 아이템 (160x160) ───────────── */
function stamp(name, fishCol, fishSize) {
  let o = part(rectPts(24, 20, 112, 120), C.pearl, { sw: 1.8, heavy: [1, 2] });
  for (let i = 0; i < 9; i++) { o += dot(24 + i * 14, 20, 4, '#5a7a80'); o += dot(24 + i * 14, 140, 4, '#5a7a80'); }
  for (let i = 0; i < 9; i++) { o += dot(24, 20 + i * 15, 4, '#5a7a80'); o += dot(136, 20 + i * 15, 4, '#5a7a80'); }
  o += part(rectPts(36, 32, 88, 96), '#9fd6d6', { sw: 1.2 });
  o += fishShape(54, 80, fishSize, fishCol);
  o += line([[40, 118], [120, 118]], { sw: 1, op: 0.4 });
  put(`items/${name}.svg`, 160, 160, o, { id: 1060, displace: 1 });
}
function items() {
  seed(1061);
  const env = (extra = '') => part([[16, 46], [144, 40], [148, 124], [14, 128]], '#e8f4f4', { sw: 2, heavy: [1, 2] }) + line([[16, 46], [80, 92], [144, 40]], { sw: 1.6 }) + `<circle cx="80" cy="84" r="70" fill="#dff4f4" opacity="0.18"/>` + bubble(30, 30, 10) + bubble(136, 140, 8) + extra;
  put('items/letter.svg', 160, 160, env(), { id: 1061, displace: 1 });
  put('items/letter_addr.svg', 160, 160, env(part(rectPts(40, 96, 70, 22), '#fff6d0', { sw: 1.2 }) + line([[46, 104], [100, 104]], { sw: 1.2, op: 0.6 }) + line([[46, 111], [86, 111]], { sw: 1.2, op: 0.6 })), { id: 1061, displace: 1 });
  put('items/letter_ready.svg', 160, 160, env(part(rectPts(40, 96, 70, 22), '#fff6d0', { sw: 1.2 }) + line([[46, 104], [100, 104]], { sw: 1.2, op: 0.6 }) + part(rectPts(112, 52, 28, 32), '#9fd6d6', { sw: 1.2 }) + fishShape(116, 68, 0.4, '#5a7fa8')), { id: 1061, displace: 1 });
  seed(1062);
  // 주소 스티커: 학교 건물 그림 + 58 (SVG 이미지 안에서는 웹 글꼴을 못 쓰므로 한글 대신 그림)
  put('items/address.svg', 160, 160, part([[16, 40], [144, 34], [148, 122], [14, 128]], '#fff6d0', { sw: 2, heavy: [1, 2] }) + part([[34, 100], [34, 70], [62, 52], [90, 70], [90, 100]], '#e8c8a0', { sw: 1.4 }) + part([[30, 72], [62, 48], [94, 72]], C.red, { sw: 1.2 }) + part(rectPts(54, 82, 16, 18), C.wood2, { sw: 1 }) + part(ellPts(62, 66, 6, 6, 0, Math.PI * 2, 8), '#fff', { sw: 1 }) + line([[62, 48], [62, 36]], { sw: 1.4 }) + part([[62, 36], [76, 40], [62, 44]], C.red, { sw: 0.8 }) + `<text x="118" y="96" font-family="Georgia, serif" font-size="30" font-weight="bold" text-anchor="middle" fill="${C.red}">58</text>`, { id: 1062, displace: 0.6 });
  stamp('stamp_mackerel', '#5a7fa8', 1.3);
  stamp('stamp_anchovy', '#b8c8d0', 0.7);
  stamp('stamp_saury', '#7a8aa8', 1.5);
  seed(1063);
  put('items/hook.svg', 160, 160, `<g transform="rotate(-20 80 80)">${line([[80, 20], [80, 110], [64, 134], [44, 126], [46, 104]], { sw: 6, color: C.silver2 })}${line([[46, 104], [54, 96]], { sw: 4, color: C.silver2 })}${part(ellPts(80, 20, 9, 9, 0, Math.PI * 2, 10), C.silver, { sw: 1.4 })}</g>`, { id: 1063, displace: 1 });
  const kp = []; for (let i = 0; i <= 8; i++) kp.push([30 + i * 13, 40 + Math.sin(i * 0.9) * 24 + i * 6]);
  put('items/kelp.svg', 160, 160, line(kp, { sw: 12, color: INK, step: 999 }) + line(kp, { sw: 8, color: C.kelp, step: 999 }) + [1, 3, 5, 7].map((i) => leaf(kp[i][0], kp[i][1], 26, i % 4 === 1 ? -1 : 2, C.kelp2, { w: 0.4 })).join(''), { id: 1063, displace: 1 });
  put('items/kelp_hook.svg', 160, 160, line(kp, { sw: 12, color: INK, step: 999 }) + line(kp, { sw: 8, color: C.kelp, step: 999 }) + `<g transform="translate(78 54) scale(0.55)">${line([[80, 20], [80, 110], [64, 134], [44, 126], [46, 104]], { sw: 8, color: C.silver2 })}</g>`, { id: 1063, displace: 1 });
  put('items/key.svg', 160, 160, `<g transform="rotate(-35 80 80)">${part(ellPts(80, 44, 24, 24, 0, Math.PI * 2, 14), C.brass, { sw: 2.2 })}${starfish(80, 44, 14, 0, C.coral)}${part([[74, 66], [86, 66], [86, 144], [74, 144]], C.brass, { sw: 2 })}${part([[86, 118], [104, 118], [104, 128], [86, 128]], C.brass, { sw: 1.4 })}${part([[86, 134], [98, 134], [98, 142], [86, 142]], C.brass, { sw: 1.2 })}</g>`, { id: 1064, displace: 1 });
}

bgNorth(); bgEast(); bgSouth(); bgWest(); caustics();
counter(); octopus('work'); octopus('happy'); tubeHatch(false); tubeHatch(true); elevator(false); elevator(true);
jellyLamp(false); jellyLamp(true); jellyGlowLayer(); zoomBoxes(false); zoomBoxes(true); zoomBoxOpen();
windowSea(false); windowSea(true); coral(true); coral(false); fishShadow();
conch(); hookOnBoard(true); hookOnBoard(false); kelpRope(true); kelpRope(false); stampDesk(); zoomStamps(); zoomCoral();
items();
put('props/octo_icon.svg', 140, 140, `<g transform="scale(0.32) translate(10 20)">${octopusArt('happy')}</g>`, { id: 1070, displace: 0.6 });
console.log('sea assets written, ~' + Math.round(total / 1024) + 'KB');
