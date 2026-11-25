// 6장 「거인의 책상」 그래픽 에셋 생성기
// node tools/art/desk.mjs  → assets/rooms/desk/**
// 분위기: 내가 지우개만큼 작아진 오후의 책상. 원목 결이 바닥처럼 넓고, 연필은 기둥, 엎질러진 물은 바다.
// 멀리 있는 방은 초점이 나간 듯 흐리게(접사 렌즈), 가까운 책상 위 물건은 또렷하게.
import { digits, seed, rand, pick, INK, wob, rect, rectPts, ellPts, shape, fill, line, hatch, svg } from './ink.mjs';
import { part, S, O, craneArt } from './chars.mjs';
import { roundRectPts, blobPts } from './props.mjs';

const OUT = new URL('../../assets/rooms/desk/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  wood: '#c58f5a', wood2: '#a8743f', wood3: '#d9a874', woodD: '#7a4e2a', grain: '#8a5a30',
  wall: '#d9cdb2', wall2: '#c8b994', sky: '#bcdcec', leaf: '#8fb47a',
  pencil: '#f2c14e', pencil2: '#d9a52e', lead: '#4a4a52', wood0: '#e8c79a',
  eraser: '#f2a7a0', eraser2: '#d98a84', sleeve: '#5b7fb0', sleeve2: '#45679a',
  paper: '#f4ecd8', paper2: '#e6dcc2', memo: '#f6e27a', memo2: '#e3c95a',
  clip: '#b8c0c8', clip2: '#8a949e', tin: '#7aa0a8', tin2: '#5a8088',
  glass: '#d8eef2', water: '#9fd0e0', water2: '#7ab8cc',
  red: '#d9473f', red2: '#b0352f', brass: '#d4a649', brass2: '#9d7428', lamp: '#3f6f6a', lamp2: '#2e5450',
  curtain: '#c9706a', curtain2: '#a85650', fabric: '#6e8f6a', fabric2: '#55735a', crayon: '#d9473f',
  graphite: '#6a6a74',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const blurG = (body, id = 'blur') => `<g filter="url(#${id})">${body}</g>`;

/* ───────────── 책상 바닥 (원목 결이 아주 넓게 보이는 원근) ───────────── */
function deskTop(y0, { knot = true } = {}) {
  let o = fill(wob([[0, y0], [W, y0], [W, H], [0, H]], { sharp: true, amp: 0.4 }), C.wood);
  // 판자 이음매 (멀수록 촘촘)
  const rows = []; let y = y0; let step = 18;
  while (y < H) { rows.push(y); y += step; step *= 1.45; }
  rows.forEach((ry, i) => { if (i) o += line([[0, ry], [W * 0.3, ry + rand(-3, 3)], [W * 0.7, ry + rand(-3, 3)], [W, ry]], { sw: 1.6 + i * 0.4, op: 0.55, color: C.woodD, step: 120 }); });
  // 나뭇결: 길게 흐르는 물결선 (가까울수록 굵고 크게)
  for (let k = 0; k < 26; k++) {
    const gy = y0 + Math.pow(rand(), 1.6) * (H - y0);
    const t = (gy - y0) / (H - y0);
    const amp = 2 + t * 14, len = 300 + t * 900, x0 = rand(-200, W);
    const pts = []; for (let i = 0; i <= 8; i++) pts.push([x0 + (i / 8) * len, gy + Math.sin(i * 0.9 + k) * amp]);
    o += line(pts, { sw: 0.8 + t * 2.2, color: C.grain, op: 0.35 + t * 0.2, step: 999 });
  }
  if (knot) { const kx = rand(300, 1300), ky = y0 + (H - y0) * 0.62; for (let r = 1; r < 6; r++) o += `<path d="${S(ellPts(kx, ky, 18 * r, 6 * r, 0, Math.PI * 2, 14), 1)}" fill="none" stroke="${C.grain}" stroke-width="${1 + r * 0.3}" opacity="0.45"/>`; }
  // 칠이 닳은 밝은 결
  for (let k = 0; k < 8; k++) { const gy = rand(y0 + 20, H); o += `<path d="${O([[rand(0, 800), gy], [rand(800, 1600), gy + rand(-6, 6)]], 2)}" stroke="${C.wood3}" stroke-width="${rand(4, 10).toFixed(1)}" opacity="0.25" fill="none"/>`; }
  o += hatch(wob([[0, y0], [W, y0], [W, y0 + 26], [0, y0 + 26]], { sharp: true }), 0.35);
  return o;
}
// 흐릿한 먼 벽 (초점이 나간 거대한 방)
function blurWall(y1, { window = false, shelf = false } = {}) {
  let o = fill(rect(-20, -20, W + 40, y1 + 40, { amp: 0 }), C.wall);
  let b = '';
  for (let x = -40; x < W + 80; x += 120) b += `<rect x="${x}" y="-20" width="46" height="${y1 + 40}" fill="${C.wall2}" opacity="0.55"/>`;
  for (let y = 40; y < y1; y += 140) for (let x = 20 + ((y / 140) % 2) * 60; x < W; x += 120) b += `<circle cx="${x}" cy="${y}" r="14" fill="#e9dfc6" opacity="0.8"/>`;
  if (window) b += `<rect x="1080" y="40" width="420" height="${y1 - 120}" fill="${C.sky}"/><rect x="1080" y="40" width="420" height="${y1 - 120}" fill="none" stroke="#f4ecd8" stroke-width="26"/><rect x="1280" y="40" width="20" height="${y1 - 120}" fill="#f4ecd8"/><ellipse cx="1200" cy="${y1 - 120}" rx="160" ry="60" fill="${C.leaf}" opacity="0.8"/>`;
  if (shelf) { b += `<rect x="120" y="60" width="520" height="${y1 - 80}" fill="#8a6040"/>`; for (let i = 0; i < 18; i++) b += `<rect x="${140 + i * 27}" y="${100 + (i % 3) * 8}" width="22" height="${120 - (i % 3) * 8}" fill="${pick(['#b85a4a', '#5a7fa0', '#d9b54a', '#6a9a6a', '#9a6aa0'])}"/>`; b += `<rect x="120" y="230" width="520" height="14" fill="#6a4428"/>`; for (let i = 0; i < 16; i++) b += `<rect x="${150 + i * 29}" y="${260 + (i % 2) * 10}" width="24" height="${110 - (i % 2) * 10}" fill="${pick(['#c47a4a', '#4a6a8a', '#e0c070', '#7aa07a'])}"/>`; }
  o += blurG(b);
  // 흐린 빛 번짐
  o += `<g filter="url(#blur)"><ellipse cx="${window ? 1280 : 800}" cy="${y1 * 0.4}" rx="420" ry="200" fill="#fff6dc" opacity="0.35"/></g>`;
  return o;
}

/* ───────────── 연필 (육각, 깎인 끝, 흑연) ───────────── */
function pencil(x1, y1, x2, y2, w, { col = C.pencil, tipAt = 2 } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1), n = [Math.cos(a + Math.PI / 2) * w / 2, Math.sin(a + Math.PI / 2) * w / 2];
  const len = Math.hypot(x2 - x1, y2 - y1), u = [(x2 - x1) / len, (y2 - y1) / len];
  const tipLen = w * 1.6, bx = x2 - u[0] * tipLen, by = y2 - u[1] * tipLen;
  let o = part([[x1 + n[0], y1 + n[1]], [bx + n[0], by + n[1]], [bx - n[0], by - n[1]], [x1 - n[0], y1 - n[1]]], col, { sw: 1.8, shade: [[x1, y1], [bx, by], [bx + n[0] * 1.2, by + n[1] * 1.2], [x1 + n[0] * 1.2, y1 + n[1] * 1.2]], shadeCol: 'rgba(120,70,0,0.25)', hatch: false });
  o += line([[x1 + n[0] * 0.3, y1 + n[1] * 0.3], [bx + n[0] * 0.3, by + n[1] * 0.3]], { sw: 1, op: 0.5 });
  o += part([[bx + n[0], by + n[1]], [x2 - u[0] * w * 0.5 + n[0] * 0.3, y2 - u[1] * w * 0.5 + n[1] * 0.3], [x2 - u[0] * w * 0.5 - n[0] * 0.3, y2 - u[1] * w * 0.5 - n[1] * 0.3], [bx - n[0], by - n[1]]], C.wood0, { sw: 1.6 });
  o += part([[x2 - u[0] * w * 0.5 + n[0] * 0.3, y2 - u[1] * w * 0.5 + n[1] * 0.3], [x2, y2], [x2 - u[0] * w * 0.5 - n[0] * 0.3, y2 - u[1] * w * 0.5 - n[1] * 0.3]], C.lead, { sw: 1.4 });
  return o;
}

/* ───────────── 북쪽: 스케치북, 연필꽂이, 스탠드 ───────────── */
function bgNorth() {
  seed(1611);
  let o = blurWall(600);
  // 코르크 게시판 (멀리, 흐리게)
  o += blurG(`<rect x="60" y="40" width="300" height="240" fill="#b98a5a"/><rect x="100" y="70" width="110" height="90" fill="#f4ecd8"/><rect x="230" y="100" width="90" height="120" fill="#cfe0f0"/>`, 'blur');
  o += deskTop(600);
  // 스케치북 (벽에 기대 세운 거대한 종이: 위쪽은 화면 밖까지)
  o += `<path d="${S([[290, 650], [1070, 642], [1078, 630], [298, 636]])}" fill="${INK}" opacity="0.25"/>`;
  o += part([[290, -60], [1066, -70], [1074, 636], [296, 646]], C.paper2, { sw: 2.6, heavy: [1, 2], shade: [[920, -70], [1074, -70], [1074, 640], [960, 640]], shadeCol: 'rgba(120,90,50,0.14)' });
  o += part([[306, -50], [1056, -58], [1060, 626], [310, 632]], C.paper, { sw: 1.6 });
  for (let y = 10; y < 620; y += 40) o += line([[320, y], [1046, y - 7]], { sw: 0.7, color: '#c9b998', op: 0.35, step: 999 });
  o += part(ellPts(400, 90, 34, 34, 0, Math.PI * 2, 12), '#f3cf5a', { sw: 1.6 });
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += line([[400 + Math.cos(a) * 44, 90 + Math.sin(a) * 44], [400 + Math.cos(a) * 60, 90 + Math.sin(a) * 60]], { sw: 2.6, color: '#d9a52e' }); }
  for (const [x, y, c] of [[380, 560, '#e98a9a'], [450, 580, '#9ac0e8']]) { for (let i = 0; i < 5; i++) { const a = i * Math.PI * 0.4; o += part(ellPts(x + Math.cos(a) * 13, y + Math.sin(a) * 13, 10, 10, 0, Math.PI * 2, 8), c, { sw: 1.2 }); } o += line([[x, y + 14], [x + 2, y + 56]], { sw: 2.6, color: '#6f9a4f' }); }
  o += part([[884, 520], [1036, 512], [1040, 608], [888, 614]], '#fff8e4', { sw: 1.4 });
  for (let i = 0; i < 4; i++) o += line([[900, 538 + i * 17], [1020 - (i === 3 ? 60 : 0), 535 + i * 17]], { sw: 1.6, color: C.graphite, op: 0.7, amp: 1.2, step: 12 });
  o += `<path d="${S([[524, 620], [524, 280], [566, 214], [690, 190], [814, 214], [856, 280], [856, 620]], 0.6)}" fill="#efe5cc" opacity="0.6"/>`;
  // 연필꽂이 — 연필들이 화면 위로 솟아 있다. 두 자루가 X자로 엇갈림
  o += pencil(1120, 260, 1070, -80, 44, { col: '#7ab0d8' }) + pencil(1270, 260, 1300, -60, 44, { col: '#9ad08a' });
  o += pencil(1130, 260, 1290, -40, 46) + pencil(1270, 260, 1110, -50, 46, { col: '#e98a9a' });
  // 양철 연필꽂이: 둥근 바닥, 몸을 감싸는 골, 말린 입구 테, 번쩍이는 반사광
  let ribs = '';
  for (const y of [250, 300, 540, 600]) ribs += O(ellPts(1195, y, 104, 18, 0, Math.PI, 14), 0.3);
  o += part([[1090, 220], [1092, 400], [1096, 640], [1140, 662], [1195, 668], [1250, 662], [1294, 640], [1298, 400], [1300, 220]], C.tin, { sw: 2.6, heavy: [5, 8], shade: [[1236, 200], [1310, 200], [1310, 680], [1236, 680]], shadeCol: 'rgba(0,40,50,0.28)', extra: `<path d="${ribs}" fill="none" stroke="#3a5a64" stroke-width="2" opacity="0.6"/><path d="${O([[1118, 236], [1116, 400], [1120, 630]], 0.3)}" fill="none" stroke="#ffffff" stroke-width="14" opacity="0.35" stroke-linecap="round"/><path d="${O([[1140, 240], [1140, 620]], 0.3)}" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.4" stroke-linecap="round"/>` });
  o += part(ellPts(1195, 220, 105, 20, 0, Math.PI * 2, 22), '#3a4a50', { sw: 2.2 });
  o += `<path d="${O(ellPts(1195, 222, 106, 21, 0, Math.PI, 16), 0.3)}" fill="none" stroke="${INK}" stroke-width="10"/><path d="${O(ellPts(1195, 222, 106, 21, 0, Math.PI, 16), 0.3)}" fill="none" stroke="#a8c8d0" stroke-width="6"/>`;
  o += part([[1096, 368], [1196, 378], [1298, 368], [1296, 500], [1196, 510], [1098, 500]], '#f0dfb4', { sw: 1.8 });
  for (const [x, y, c] of [[1140, 420, '#e98a9a'], [1190, 446, '#7ab0d8'], [1246, 416, '#f3cf5a']]) o += part(ellPts(x, y, 17, 17, 0, Math.PI * 2, 10), c, { sw: 1.4 });
  // 스탠드: 오른쪽 끝 받침(잘림), 화면 위로 솟은 팔, 머리 위의 갓
  o += part(ellPts(1520, 690, 170, 40, 0, Math.PI * 2, 24), C.lamp2, { sw: 2.6, heavy: [6, 14] });
  o += part([[1350, 690], [1350, 650], [1690, 650], [1690, 690]], C.lamp, { sw: 2.2 });
  o += part(ellPts(1520, 650, 160, 34, 0, Math.PI * 2, 24), C.lamp, { sw: 2.2 });
  o += part([[1400, 640], [1446, 640], [1446, 662], [1400, 662]], '#e6dcc2', { sw: 1.8 });
  o += line([[1520, 640], [1580, 260], [1640, 100]], { sw: 26, color: C.lamp2, step: 999 }) + line([[1520, 640], [1580, 260], [1640, 100]], { sw: 16, color: C.lamp, step: 999 });
  o += part(ellPts(1580, 260, 26, 26, 0, Math.PI * 2, 12), C.brass, { sw: 1.8 });
  o += part([[1660, -40], [1560, -40], [1340, 40], [1350, 170], [1460, 166], [1640, 60]], C.lamp, { sw: 2.6, heavy: [3, 4], shade: [[1350, 60], [1470, 40], [1470, 170], [1350, 170]], shadeCol: 'rgba(0,30,30,0.3)' });
  o += part(ellPts(1405, 168, 60, 16, 0, Math.PI * 2, 16), '#2a3a38', { sw: 2.2 });
  put('bg/north.svg', W, H, o, { id: 1611 });
}
// 스탠드 불빛: 전구 + 빛 원뿔 + 책상 위 빛 웅덩이
function lampGlow() {
  seed(1612);
  let o = `<g filter="url(#blur)"><path d="M1350 170 L300 520 L520 660 L1462 176 Z" fill="#fff3c0" opacity="0.3"/><ellipse cx="720" cy="660" rx="460" ry="60" fill="#fff0b0" opacity="0.4"/></g>`;
  o += part(ellPts(1405, 170, 40, 12, 0, Math.PI * 2, 12), '#fff6c8', { sw: 1.4 });
  o += `<g filter="url(#blur)"><ellipse cx="1405" cy="176" rx="90" ry="34" fill="#fff3b0" opacity="0.9"/></g>`;
  put('bg/lampglow.svg', W, H, o, { id: 1612, displace: 1 });
}
// X 그림자: 엇갈린 연필 두 자루의 흐린 그림자가 그림 문 위에 떨어진다
function xShadow() {
  seed(1613);
  const bar = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1), n = [Math.cos(a + Math.PI / 2) * 22, Math.sin(a + Math.PI / 2) * 22]; return `<path d="M${x1 + n[0]} ${y1 + n[1]} L${x2 + n[0] * 1.4} ${y2 + n[1] * 1.4} L${x2 - n[0] * 1.4} ${y2 - n[1] * 1.4} L${x1 - n[0]} ${y1 - n[1]}Z" fill="#3a2e3a"/>`; };
  const o = `<g filter="url(#blur2)" opacity="0.6">${bar(30, 40, 260, 330)}${bar(250, 30, 20, 320)}</g>`;
  put('props/xshadow.svg', 280, 360, o, { id: 1613, displace: 1 });
}
// 그림 문 세 가지 상태 (280x360, 스케치북 위 x560 y230에 얹는다)
const doorPts = [[8, 360], [8, 80], [40, 24], [140, 4], [240, 24], [272, 80], [272, 360]];
function doorDrawn() {
  seed(1614);
  let o = `<path d="${O(doorPts, 2)}" fill="none" stroke="${C.graphite}" stroke-width="3.4" stroke-linecap="round"/>` + `<path d="${O(doorPts.map(([x, y]) => [x + 3, y + 2]), 2)}" fill="none" stroke="${C.graphite}" stroke-width="1.4" opacity="0.6"/>`;
  for (const [x, y, w, h] of [[40, 90, 200, 110], [40, 220, 200, 120]]) o += `<path d="${O([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], 1.6)}" fill="none" stroke="${C.graphite}" stroke-width="2" opacity="0.8"/>`;
  for (let i = 0; i < 16; i++) { const x = 250 + rand(-6, 6), y = 100 + i * 15; o += line([[x, y], [x + 14, y - 10]], { sw: 1.2, color: C.graphite, op: 0.6 }); }
  o += line([[12, 356], [268, 356]], { sw: 2, color: C.graphite, op: 0.7, amp: 1.4 });
  put('props/door_drawn.svg', 280, 360, o, { id: 1614, displace: 1.2 });
}
function doorKnob(open) {
  seed(1615);
  let o = '';
  if (open) {
    o += part(doorPts, '#fff4cc', { sw: 2.4 });
    o += `<g filter="url(#blur)"><ellipse cx="140" cy="220" rx="110" ry="150" fill="#fffbe6" opacity="0.9"/></g>`;
    for (let i = 0; i < 7; i++) o += line([[140, 200], [140 + Math.cos(i * 0.9) * 120, 200 + Math.sin(i * 0.9) * 150]], { sw: 2, color: '#f3cf5a', op: 0.5 });
    // 안쪽으로 열린 문짝 (좁게 보이는 옆면)
    o += part([[8, 360], [8, 80], [40, 24], [70, 30], [70, 340]], '#6aa0a0', { sw: 2.2, heavy: [2, 4], shade: [[8, 80], [70, 30], [70, 340], [8, 360]], shadeCol: 'rgba(0,40,40,0.25)' });
  } else {
    o += part(doorPts, '#6aa0a0', { sw: 2.6, heavy: [4, 6], shade: [[200, 20], [280, 70], [280, 360], [200, 360]], shadeCol: 'rgba(0,40,40,0.25)' });
    for (const [x, y, w, h] of [[40, 90, 200, 110], [40, 220, 200, 120]]) o += part(rectPts(x, y, w, h), '#7fb4b2', { sw: 1.8 });
    for (let i = 0; i < 30; i++) o += line([[rand(20, 260), rand(40, 350)], [rand(20, 260), rand(40, 350)]], { sw: 1, color: '#4a8484', op: 0.18 });
  }
  // 색연필로 그린 손잡이 (빨강, 거친 결)
  if (!open) { o += part(ellPts(238, 230, 18, 18, 0, Math.PI * 2, 12), C.crayon, { sw: 2.2, heavy: [2, 6] }); for (let i = 0; i < 8; i++) o += line([[226 + i * 3, 218], [222 + i * 3, 242]], { sw: 1.2, color: C.red2, op: 0.5 }); o += dot(232, 224, 4, '#ffd0c8'); }
  put(`props/door_${open ? 'open' : 'knob'}.svg`, 280, 360, o, { id: 1615, displace: 1.4 });
}

/* ───────────── 동쪽: 쓰러진 물컵, 물웅덩이, 필통 ───────────── */
function bgEast() {
  seed(1621);
  let o = blurWall(560, { shelf: true });
  o += deskTop(560);
  // 쓰러진 유리컵 — 나에게는 유리 터널 (바닥 쪽은 화면 밖 왼쪽)
  o += `<path d="${S([[-40, 676], [780, 668], [780, 684], [-40, 692]])}" fill="${INK}" opacity="0.18"/>`;
  o += `<path d="${S([[-60, 260], [730, 236], [744, 664], [-60, 680]], 0.6)}" fill="${C.glass}" opacity="0.5" stroke="${INK}" stroke-width="2.6"/>`;
  o += `<path d="${S(ellPts(736, 450, 62, 214, 0, Math.PI * 2, 26), 0.6)}" fill="#e6f6fa" opacity="0.55" stroke="${INK}" stroke-width="3"/>`;
  o += `<path d="${S([[-60, 600], [736, 590], [744, 664], [-60, 680]], 0.4)}" fill="${C.water}" opacity="0.7"/>`;
  o += line([[0, 290], [680, 272]], { sw: 14, color: '#ffffff', op: 0.6 }) + line([[40, 340], [420, 330]], { sw: 5, color: '#ffffff', op: 0.5 });
  for (let i = 0; i < 6; i++) o += dot(rand(60, 700), rand(560, 640), rand(4, 9), '#e6f6fa', 0.8);
  // 붓 (물웅덩이 옆, 나에게는 통나무만 한 크기)
  o += line([[-40, 830], [520, 880]], { sw: 44, color: '#b0563a', step: 999 }) + line([[-40, 830], [520, 880]], { sw: 32, color: '#d07050', step: 999 });
  o += part([[510, 852], [620, 862], [616, 904], [506, 900]], C.clip, { sw: 1.8 });
  // 필통 — 오른쪽 화면 밖까지 이어지는 커다란 천 언덕, 지퍼가 열려 있다
  o += `<path d="${S([[1040, 676], [1640, 668], [1640, 684], [1040, 690]])}" fill="${INK}" opacity="0.22"/>`;
  o += part([[1050, 420], [1110, 330], [1660, 320], [1660, 676], [1056, 680]], C.fabric, { sw: 2.8, heavy: [1, 2], shade: [[1460, 320], [1660, 320], [1660, 680], [1460, 680]], shadeCol: 'rgba(0,30,10,0.25)' });
  o += part([[1110, 352], [1660, 344], [1660, 404], [1118, 412]], '#2e3a2e', { sw: 2.2 });
  for (let x = 1120; x < 1650; x += 18) o += line([[x, 344], [x + 8, 352]], { sw: 2.6, color: C.clip2 }) + line([[x, 412], [x + 8, 404]], { sw: 2.6, color: C.clip2 });
  for (let i = 0; i < 70; i++) o += dot(rand(1070, 1640), rand(430, 660), rand(1.2, 3), C.fabric2, 0.6);
  for (let k = 0; k < 4; k++) o += line([[1070, 470 + k * 50], [1640, 462 + k * 50]], { sw: 1.4, color: C.fabric2, op: 0.5, amp: 3 });
  o += pencil(1180, 380, 1150, 160, 38, { col: '#6aa06a' }) + pencil(1460, 380, 1510, 180, 38, { col: '#e0b040' }) + pencil(1560, 380, 1600, 150, 38, { col: '#7ab0d8' });
  put('bg/east.svg', W, H, o, { id: 1621 });
}
function puddle(withBoat) {
  seed(1622);
  const pts = [[30, 60], [160, 20], [360, 34], [520, 12], [690, 46], [740, 120], [700, 200], [520, 238], [300, 226], [120, 210], [20, 150]];
  let o = `<path d="${S(pts, 3)}" fill="${C.water}" opacity="0.72" stroke="${C.water2}" stroke-width="2.4"/>`;
  o += `<path d="${S(pts.map(([x, y]) => [x * 0.86 + 50, y * 0.8 + 20]), 3)}" fill="${C.water2}" opacity="0.3"/>`;
  for (let i = 0; i < 9; i++) { const x = rand(80, 660), y = rand(50, 190); o += `<path d="${O([[x, y], [x + 30, y - 4], [x + 60, y]], 1)}" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.7"/>`; }
  o += line([[120, 70], [300, 54]], { sw: 6, color: '#ffffff', op: 0.5 });
  // 물에 비친 필통 그림자
  o += `<path d="${S([[560, 60], [700, 60], [690, 120], [570, 120]], 1)}" fill="${C.fabric2}" opacity="0.25"/>`;
  if (withBoat) {
    // 건너편 물가에 대 둔 종이배 (메모지 노랑)
    o += `<path d="${S([[580, 120], [700, 120], [680, 150], [600, 150]], 0.4)}" fill="${C.memo}" stroke="${INK}" stroke-width="2"/>` + `<path d="${S([[610, 120], [640, 72], [670, 120]], 0.3)}" fill="${C.memo2}" stroke="${INK}" stroke-width="1.8"/>`;
    o += line([[640, 120], [640, 80]], { sw: 1, op: 0.5 });
  }
  put(`props/puddle${withBoat ? '_boat' : ''}.svg`, 760, 250, o, { id: 1622, displace: 1.6 });
}
function crayonPeek() {
  seed(1623);
  put('props/crayon_peek.svg', 90, 220, pencil(44, 218, 46, 120, 40, { col: C.crayon }), { id: 1623, displace: 1 });
}

/* ───────────── 남쪽: 책상 끝, 책 더미 계단, 거대한 연필 글씨 ───────────── */
function bgSouth() {
  seed(1631);
  // 책상 끝 너머: 아득히 먼 방바닥 (흐림)
  let o = fill(rect(-20, -20, W + 40, 700, { amp: 0 }), '#cdbfa0');
  o += blurG(`<rect x="-20" y="380" width="1640" height="320" fill="#a8845a"/><ellipse cx="820" cy="560" rx="620" ry="110" fill="#c46a5a"/><ellipse cx="820" cy="560" rx="480" ry="80" fill="#e0b070"/><ellipse cx="820" cy="560" rx="320" ry="50" fill="#5a8aa0"/><rect x="200" y="200" width="160" height="200" fill="#9a7a5a"/><rect x="1300" y="140" width="220" height="260" fill="#7a9aa0"/><rect x="420" y="470" width="80" height="80" fill="#e05a4a"/><rect x="520" y="500" width="70" height="70" fill="#f0c050"/>`);
  o += `<g filter="url(#blur)"><rect x="-20" y="-20" width="1640" height="200" fill="#e8dcc0" opacity="0.6"/></g>`;
  // 책상 윗면 (가까운 쪽) + 앞 모서리 두께
  o += deskTop(640, { knot: false });
  o += part([[-10, 640], [W + 10, 640], [W + 10, 664], [-10, 664]], C.wood2, { sw: 2.4 });
  o += hatch(wob([[-10, 640], [W + 10, 640], [W + 10, 664], [-10, 664]], { sharp: true }), 0.5);
  // 아찔한 느낌: 책상 끝에 걸린 지우개 가루
  for (let i = 0; i < 14; i++) { const x = rand(600, 1560), y = rand(690, 880); o += `<path d="${S(ellPts(x, y, rand(6, 14), rand(4, 8), 0, Math.PI * 2, 8), 1)}" fill="${C.eraser}" stroke="${INK}" stroke-width="1.2"/>`; }
  // 거대한 연필 글씨 (가까이선 한 획 한 획만 보인다)
  for (const st of [[[620, 900], [700, 700], [900, 680], [1000, 760]], [[1080, 690], [1140, 900]], [[1260, 700], [1300, 790], [1500, 820], [1620, 760]]]) {
    o += `<path d="${O(st, 4)}" fill="none" stroke="${C.graphite}" stroke-width="44" stroke-linecap="round" opacity="0.5"/>`;
    o += `<path d="${O(st.map(([x, y]) => [x + 8, y + 6]), 4)}" fill="none" stroke="#8a8a94" stroke-width="8" stroke-linecap="round" opacity="0.4"/>`;
    for (let i = 0; i < 20; i++) { const p = st[Math.floor(rand(0, st.length))]; o += dot(p[0] + rand(-40, 40), p[1] + rand(-20, 20), rand(1, 3), C.lead, 0.5); }
  }
  // 책 더미 계단 (크기가 다른 책 넷이 비스듬히 쌓여 계단이 됐다)
  const books = [[60, 840, 560, 120, '#5a7fb0'], [80, 720, 460, 100, '#c4704a'], [96, 620, 380, 90, '#7aa07a'], [110, 530, 290, 80, '#d9b54a']];
  for (const [x, y, w, h, c] of books) {
    o += part([[x, y], [x + w, y - 10], [x + w + 14, y - 10 + h], [x + 10, y + h]], c, { sw: 2.4, heavy: [1, 2], shade: [[x + w - 60, y - 10], [x + w + 14, y - 10], [x + w + 14, y + h], [x + w - 60, y + h]], shadeCol: 'rgba(0,0,0,0.2)' });
    o += part([[x + w, y - 10], [x + w + 14, y - 10 + h], [x + w + 22, y + h - 14], [x + w + 8, y - 22]], C.paper, { sw: 1.6 });
    for (let k = 1; k < 5; k++) o += line([[x + w + 2 + k * 3, y - 14 + k], [x + w + 14 + k * 2, y + h - 12]], { sw: 0.8, op: 0.5 });
    o += line([[x + 20, y + 30], [x + w - 30, y + 22]], { sw: 2.4, color: C.brass, op: 0.8 });
  }
  put('bg/south.svg', W, H, o, { id: 1631 });
}
function crane(state) {
  seed(1632);
  put(`props/crane_${state}.svg`, 220, 200, craneArt(state), { id: 1632, displace: 0.8 });
}

/* ───────────── 서쪽: 창문과 커튼, 클립 상자, 메모지, 연필깎이, 지우개 ───────────── */
function bgWest(open) {
  seed(1641);
  let o = blurWall(560);
  // 창문 — 거대한 창이 화면 위로 잘린다 (커튼은 소품)
  o += part(rectPts(280, -40, 1260, 600), '#f4ecd8', { sw: 2.6 });
  o += part(rectPts(316, -20, 1188, 556), C.sky, { sw: 2 });
  o += blurG(`<ellipse cx="700" cy="460" rx="420" ry="150" fill="${C.leaf}"/><ellipse cx="1200" cy="480" rx="380" ry="130" fill="#6f9a5f"/><circle cx="1240" cy="120" r="80" fill="#fff6c8"/>`);
  o += line([[910, -20], [910, 536]], { sw: 24, color: '#f4ecd8' }) + line([[316, 250], [1504, 250]], { sw: 24, color: '#f4ecd8' });
  o += part([[250, 556], [1570, 556], [1580, 586], [240, 586]], '#efe2c4', { sw: 2.2 });
  o += curtainPanels(open);
  o += deskTop(586);
  // 클립 상자 (뚜껑 열린 양철 상자)
  // 뚜껑을 뒤로 젖힌 양철 클립 상자: 둥근 모서리, 두께, 말린 테두리
  o += part(roundRectPts(110, 348, 300, 96, 18), '#5a8a96', { sw: 2.2, extra: `<path d="${S(roundRectPts(128, 362, 264, 70, 12), 0.3)}" fill="#7aaab4" opacity="0.6"/>` });
  o += part([[100, 470], [124, 434], [404, 426], [430, 462]], '#3a4a50', { sw: 2.2 });
  o += part([[100, 478], [100, 640], [112, 664], [140, 668], [400, 660], [426, 654], [436, 630], [430, 470], [404, 462], [126, 470]], C.tin, { sw: 2.6, heavy: [4, 7], shade: [[350, 450], [450, 450], [450, 680], [350, 680]], shadeCol: 'rgba(0,40,50,0.25)', extra: `<path d="${O([[124, 486], [122, 640]], 0.3)}" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.3" stroke-linecap="round"/>` });
  o += `<path d="${O([[100, 474], [266, 466], [432, 464]], 0.3)}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${O([[100, 474], [266, 466], [432, 464]], 0.3)}" fill="none" stroke="#a8c8d0" stroke-width="5" stroke-linecap="round"/>`;
  for (let i = 0; i < 10; i++) { const x = 140 + i * 26, y = 430 + rand(-8, 8); o += `<path d="${O([[x, y + 26], [x, y - 14], [x + 16, y - 14], [x + 16, y + 18], [x + 6, y + 18], [x + 6, y - 2]], 0.3)}" fill="none" stroke="${C.clip2}" stroke-width="4"/>`; }
  o += part([[110, 560], [426, 554], [426, 610], [110, 616]], '#e6dcc2', { sw: 1.6 });
  // 메모지 묶음 (노란 정사각 더미)
  for (let k = 0; k < 7; k++) o += part([[460, 690 - k * 8], [730, 684 - k * 8], [736, 702 - k * 8], [466, 708 - k * 8]], k === 6 ? C.memo : C.memo2, { sw: 1.6 });
  o += part([[460, 634], [730, 628], [736, 646], [466, 652]], C.memo, { sw: 2 });
  // 연필깎이 (책상에 고정하는 손잡이식, 손잡이가 내 키보다 높다)
  // 손잡이식 연필깎이: 둥근 지붕의 몸통, 금속 앞판과 구멍 고리, 투명한 부스러기 서랍, 책상 고정 나사
  o += `<path d="${S([[770, 690], [1090, 680], [1110, 700], [790, 708]], 0.5)}" fill="${INK}" opacity="0.25"/>`;
  o += part([[780, 680], [776, 440], [790, 396], [840, 372], [1000, 366], [1046, 380], [1064, 420], [1072, 676]], '#c94a40', { sw: 2.8, heavy: [5, 7], shade: [[990, 350], [1090, 350], [1090, 690], [990, 690]], shadeCol: 'rgba(80,0,0,0.28)', light: [[800, 404], [860, 380], [880, 392], [806, 430]] });
  o += part([[786, 560], [1068, 552], [1070, 660], [790, 668]], '#e8eef0', { sw: 2, extra: `<path d="${S([[800, 640], [840, 610], [880, 630], [930, 604], [990, 626], [1050, 610], [1060, 656], [796, 662]], 0.5)}" fill="#d8a070" opacity="0.85"/><path d="${O([[804, 574], [1040, 568]], 0.3)}" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.6"/>` });
  o += part(roundRectPts(904, 596, 50, 18, 6), '#a8b0b8', { sw: 1.4 });
  o += part(blobPts(850, 492, 64, 64, { n: 16, k: 0.02 }), '#b8c0c8', { sw: 2.2, heavy: [2, 7], light: [[800, 460], [840, 436], [846, 446], [810, 470]] });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; o += line([[850 + Math.cos(a) * 50, 492 + Math.sin(a) * 50], [850 + Math.cos(a) * 60, 492 + Math.sin(a) * 60]], { sw: 2, color: '#6a7078' }); }
  o += part(ellPts(850, 492, 38, 38, 0, Math.PI * 2, 16), '#3a2a2a', { sw: 2.2 });
  o += part(ellPts(850, 492, 16, 16, 0, Math.PI * 2, 12), '#1a1414', { sw: 1.6 });
  for (const x of [800, 1050]) o += part(roundRectPts(x - 20, 674, 40, 16, 6), '#6a6a74', { sw: 1.6 });
  o += part([[1060, 460], [1124, 460], [1128, 488], [1060, 492]], C.clip, { sw: 2 });
  o += line([[1124, 474], [1150, 300], [1210, 284]], { sw: 14, color: C.clip2, step: 999 }) + line([[1124, 474], [1150, 300], [1210, 284]], { sw: 7, color: C.clip, step: 999 });
  o += part([[1196, 240], [1236, 240], [1240, 330], [1198, 332]], '#5a3a2a', { sw: 2 });
  // 깎인 연필 부스러기 (꽃잎처럼 말린 나무 껍질, 가장자리에 색 띠)
  for (const [x, y, c] of [[760, 702, '#e98a9a'], [1090, 698, '#7ab0d8'], [1130, 712, '#f3cf5a']]) { o += part([[x - 22, y], [x - 12, y - 14], [x + 8, y - 16], [x + 22, y - 4], [x + 10, y + 6], [x - 8, y + 6]], '#e8c49a', { sw: 1.4 }) + `<path d="${O([[x - 20, y + 1], [x - 6, y + 6], [x + 10, y + 5], [x + 21, y - 3]], 0.3)}" fill="none" stroke="${c}" stroke-width="3"/>` + `<path d="${O([[x - 8, y - 8], [x + 2, y - 2], [x + 10, y - 8]], 0.3)}" fill="none" stroke="#b08a5a" stroke-width="1"/>`; }
  put(`bg/west${open ? '_open' : ''}.svg`, W, H, o, { id: 1641 });
}
function curtainPanels(open) {
  let o = '';
  const panel = (x0, x1, flip) => {
    const pts = [[x0, -10], [x1, -10], [x1 + (flip ? -10 : 10), 580], [x0, 586]];
    let g = part(pts, C.curtain, { sw: 2.4, heavy: flip ? [3, 0] : [1, 2], shade: [[x0, 20], [x0 + (x1 - x0) * 0.3, 20], [x0 + (x1 - x0) * 0.3, 566], [x0, 566]], shadeCol: 'rgba(80,10,10,0.2)' });
    const n = Math.max(3, Math.round(Math.abs(x1 - x0) / 60));
    for (let k = 1; k < n; k++) { const x = x0 + (x1 - x0) * k / n; g += line([[x, 26], [x + rand(-6, 6), 300], [x + rand(-8, 8), 556]], { sw: 1.4, color: C.curtain2, op: 0.7 }); }
    for (let x = Math.min(x0, x1) + 10; x < Math.max(x0, x1); x += 40) g += dot(x, 30, 5, C.brass2);
    return g;
  };
  if (open) { o += panel(240, 420, false) + panel(1600, 1420, true); for (const x of [330, 1510]) o += line([[x - 90, 300], [x + 90, 310]], { sw: 10, color: C.brass }); }
  else o += panel(240, 914, false) + panel(1600, 906, true);
  return o;
}
// 커튼 끈: 느슨히 늘어짐 / 지우개에 묶여 책상 아래로 팽팽히
function cord(taut) {
  seed(1643);
  // 240x720, 화면 위(커튼 봉)에서 내려온다. 팽팽할 때는 책상 오른쪽 끝 너머로 당겨진다
  let o = '';
  const rope = (pts) => line(pts, { sw: 7, color: C.brass2, step: 999 }) + line(pts, { sw: 3.4, color: C.brass, step: 999 });
  if (taut) o += rope([[40, 0], [70, 470], [240, 600]]);
  else {
    o += rope([[40, 0], [46, 300], [40, 600]]);
    o += part([[20, 600], [60, 600], [68, 664], [12, 664]], C.brass, { sw: 1.8, heavy: [1, 2] });
    for (let x = 18; x < 66; x += 6) o += line([[x, 664], [x + 1, 690]], { sw: 2, color: C.brass2 });
  }
  put(`props/cord${taut ? '_taut' : ''}.svg`, 240, 720, o, { id: 1643, displace: 1 });
}
// 지우개 (책상 끝에 아슬아슬) / 클립으로 끈을 건 지우개
function eraser(tied) {
  seed(1644);
  let o = `<path d="${S([[10, 164], [220, 160], [220, 172], [10, 176]])}" fill="${INK}" opacity="0.22"/>`;
  o += part([[10, 60], [200, 50], [214, 160], [16, 168]], C.eraser, { sw: 2.6, heavy: [1, 2], shade: [[150, 50], [214, 50], [214, 170], [150, 170]], shadeCol: 'rgba(120,40,40,0.2)' });
  o += part([[10, 60], [40, 40], [226, 32], [200, 50]], '#f8c0b8', { sw: 2 });
  o += part([[200, 50], [226, 32], [236, 140], [214, 160]], C.eraser2, { sw: 2 });
  // 종이 띠 (파랑) — 글자 대신 무늬
  o += part([[70, 56], [150, 52], [158, 164], [74, 168]], C.sleeve, { sw: 2 });
  o += part([[150, 52], [172, 40], [180, 150], [158, 164]], C.sleeve2, { sw: 1.6 });
  for (let i = 0; i < 3; i++) o += line([[86, 90 + i * 22], [140, 88 + i * 22]], { sw: 3, color: '#dfe8f4', op: 0.8 });
  // 지운 자국 (거무스름하게 닳은 모서리)
  o += `<path d="${S([[10, 150], [40, 150], [30, 168], [12, 168]], 0.4)}" fill="#8a6a6a" opacity="0.35"/>`;
  if (tied) {
    o += `<path d="${O([[200, 100], [222, 96], [226, 112], [206, 116], [206, 104], [220, 102]], 0.2)}" fill="none" stroke="${C.clip2}" stroke-width="4"/>`;
    o += line([[222, 100], [236, 20], [250, 0]], { sw: 5, color: C.brass2, step: 999 });
  }
  put(`props/eraser${tied ? '_tied' : ''}.svg`, 260, 180, o, { id: 1644, displace: 1.2 });
}
// 햇빛: 창에서 책상으로 비스듬히 떨어지는 빛줄기
function sunbeams() {
  seed(1645);
  let o = `<g filter="url(#blur)">`;
  for (let i = 0; i < 5; i++) { const x = 470 + i * 170; o += `<path d="M${x} 60 L${x + 110} 60 L${x + 380} 900 L${x + 190} 900Z" fill="#fff3c8" opacity="0.22"/>`; }
  o += '</g>';
  for (let i = 0; i < 26; i++) o += dot(rand(400, 1500), rand(80, 820), rand(1.2, 3), '#fffbe6', 0.8);
  put('bg/sunbeams.svg', W, H, o, { id: 1645, displace: 0.5 });
}

/* ───────────── 확대 화면 ───────────── */
// 책 더미 꼭대기에서 내려다본 책상 (거대한 글씨는 HTML 글자로 얹는다)
function zoomBookTop() {
  seed(1651);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), C.wood);
  for (let k = 0; k < 40; k++) { const y = rand(0, H); o += line([[-20, y], [400, y + rand(-8, 8)], [900, y + rand(-8, 8)], [1620, y]], { sw: rand(1, 3), color: C.grain, op: 0.35, step: 999 }); }
  for (let y = 120; y < H; y += 190) o += line([[-20, y], [1620, y]], { sw: 2.4, color: C.woodD, op: 0.4 });
  // 위에서 본 물건들 (작게): 쓰러진 컵과 물웅덩이(오른쪽 위), 필통, 스케치북 모서리
  o += `<path d="${S([[1180, 80], [1480, 60], [1500, 130], [1200, 150]], 1)}" fill="${C.glass}" opacity="0.6" stroke="${INK}" stroke-width="2"/>`;
  o += `<path d="${S([[1150, 160], [1300, 150], [1420, 200], [1380, 300], [1220, 310], [1120, 240]], 3)}" fill="${C.water}" opacity="0.75" stroke="${C.water2}" stroke-width="2"/>`;
  o += part([[1420, 320], [1580, 316], [1584, 420], [1424, 424]], C.fabric, { sw: 2 });
  o += part([[-10, 760], [380, 750], [390, 910], [-10, 910]], C.paper, { sw: 2 });
  // 거대한 연필 글씨 자국 (가운데, 글자는 HTML로 얹음) 아래 깔린 흑연 번짐
  o += `<g filter="url(#blur2)"><path d="M300 300 Q800 260 1100 330" stroke="${C.graphite}" stroke-width="80" opacity="0.08" fill="none"/></g>`;
  // 낙서 화살표: 글씨에서 물웅덩이로
  o += `<path d="${O([[1000, 520], [1080, 440], [1150, 330]], 3)}" fill="none" stroke="${C.graphite}" stroke-width="14" stroke-linecap="round" opacity="0.6"/>` + `<path d="M1120 340 L1162 300 L1176 360Z" fill="${C.graphite}" opacity="0.6"/>`;
  // 책 더미 꼭대기 모서리 (내가 서 있는 곳, 아래쪽 가장자리)
  o += part([[-10, 830], [700, 820], [720, 910], [-10, 910]], '#d9b54a', { sw: 2.4 });
  put('zoom/booktop.svg', W, H, o, { id: 1651, displace: 2 });
}
// 필통 안: 크레파스·연필 끝·지우개 가루 사이에 몽당 색연필
function zoomPencilCase() {
  seed(1652);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), '#2e3a2e');
  for (let i = 0; i < 300; i++) o += dot(rand(0, W), rand(0, H), rand(1, 2.4), '#3e4e3e', 0.8);
  o += part([[80, 120], [1520, 100], [1540, 820], [60, 840]], C.fabric2, { sw: 3 });
  o += part([[120, 160], [1480, 140], [1500, 780], [100, 800]], '#3a4a3a', { sw: 2 });
  o += pencil(160, 300, 760, 260, 70, { col: '#6aa06a' }) + pencil(200, 520, 900, 560, 70, { col: '#e0b040' }) + pencil(1460, 260, 980, 330, 70, { col: '#7ab0d8' });
  for (let i = 0; i < 16; i++) { const x = rand(200, 1400), y = rand(600, 760); o += `<path d="${S(ellPts(x, y, rand(10, 22), rand(6, 12), 0, Math.PI * 2, 8), 1)}" fill="${C.eraser}" stroke="${INK}" stroke-width="1.4"/>`; }
  put('zoom/pcase.svg', W, H, o, { id: 1652, displace: 2.4 });
}

/* ───────────── 아이템 (160x160) ───────────── */
function items() {
  seed(1660);
  const it = (name, body) => put(`items/${name}.svg`, 160, 160, body, { id: 1660, displace: 1 });
  it('clip', `<path d="${O([[50, 140], [50, 30], [100, 30], [100, 120], [70, 120], [70, 50], [86, 50], [86, 104]], 0.3)}" fill="none" stroke="${C.clip2}" stroke-width="9" stroke-linejoin="round"/>` + `<path d="${O([[50, 140], [50, 30], [100, 30], [100, 120], [70, 120], [70, 50], [86, 50], [86, 104]], 0.3)}" fill="none" stroke="#e6ecf0" stroke-width="3" stroke-linejoin="round"/>`);
  it('memo', part([[24, 36], [136, 28], [140, 132], [28, 140]], C.memo, { sw: 2.4, heavy: [1, 2], shade: [[100, 28], [140, 28], [140, 140], [100, 140]], shadeCol: 'rgba(150,120,0,0.18)' }) + part([[24, 36], [136, 28], [136, 44], [24, 52]], C.memo2, { sw: 1.4 }));
  it('boat', `<path d="${S([[14, 96], [146, 96], [124, 132], [36, 132]], 0.4)}" fill="${C.memo}" stroke="${INK}" stroke-width="2.6"/>` + `<path d="${S([[44, 96], [80, 22], [116, 96]], 0.3)}" fill="${C.memo2}" stroke="${INK}" stroke-width="2.4"/>` + line([[80, 26], [80, 96]], { sw: 1.4, op: 0.5 }) + line([[30, 104], [130, 104]], { sw: 1.2, op: 0.4 }));
  // 몽당 색연필: 뭉툭 / 뾰족
  const crayon = (sharp) => {
    let g = part([[40, 130], [40, 70], [96, 70], [96, 130]], C.crayon, { sw: 2.4, heavy: [2, 3], shade: [[76, 70], [96, 70], [96, 130], [76, 130]], shadeCol: 'rgba(80,0,0,0.25)' });
    g += part([[40, 118], [96, 118], [96, 128], [40, 128]], '#f0e0c0', { sw: 1.2 });
    if (sharp) g += part([[40, 70], [68, 14], [96, 70]], C.wood0, { sw: 2 }) + part([[58, 34], [68, 14], [78, 34]], C.crayon, { sw: 1.6 });
    else g += part([[40, 70], [54, 52], [82, 50], [96, 70]], C.wood0, { sw: 2 }) + part([[54, 54], [68, 46], [82, 52], [68, 60]], C.red2, { sw: 1.6 });
    return g;
  };
  it('crayon', crayon(false));
  it('crayon_sharp', crayon(true));
}

/* ───────────── 앞쪽 틀: 접사 렌즈 (초점이 나간 거대한 연필밥·연필 끝·지우개 가루) ───────────── */
function frame() {
  seed(1670);
  let o = '<g filter="url(#blur)">';
  // 왼쪽 위: 화면 안으로 들어온 거대한 연필 끝
  o += `<path d="M-40 150 L130 -40 L190 -40 L-40 230Z" fill="${C.pencil}"/><path d="M130 -40 L190 -40 L230 -90 L200 -120Z" fill="${C.wood0}"/>`;
  // 왼쪽 아래: 꼬불꼬불 연필밥 (나무색 띠 + 노란 칠 가장자리)
  o += `<path d="M-40 820 C40 740 170 760 190 840 C200 900 120 930 60 900" stroke="${C.wood0}" stroke-width="64" fill="none"/><path d="M-40 790 C40 712 196 730 222 830" stroke="${C.pencil}" stroke-width="16" fill="none"/>`;
  // 오른쪽 아래: 지우개 가루 덩어리
  o += `<ellipse cx="1560" cy="860" rx="110" ry="60" fill="${C.eraser}"/><ellipse cx="1440" cy="900" rx="70" ry="40" fill="${C.eraser2}"/>`;
  // 오른쪽 위: 떠다니는 먼지
  for (let i = 0; i < 6; i++) o += `<circle cx="${1460 + rand(0, 140)}" cy="${rand(10, 140)}" r="${rand(6, 14).toFixed(1)}" fill="#fff8e0" opacity="0.6"/>`;
  o += '</g>';
  put('bg/frame.svg', W, H, o, { id: 1670, displace: 1 });
}

bgNorth(); lampGlow(); xShadow(); doorDrawn(); doorKnob(false); doorKnob(true);
bgEast(); puddle(false); puddle(true); crayonPeek();
bgSouth(); crane('idle'); crane('happy');
bgWest(false); bgWest(true); cord(false); cord(true); eraser(false); eraser(true); sunbeams();
zoomBookTop(); zoomPencilCase(); items(); frame();
console.log('desk assets written, ~' + Math.round(total / 1024) + 'KB');
