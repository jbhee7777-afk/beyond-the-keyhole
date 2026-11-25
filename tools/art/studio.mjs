// 10장 「봄이의 작업실」 그래픽 에셋 생성기 (2편 마지막 장)
// node tools/art/studio.mjs  → assets/rooms/studio/** , assets/ui/finale2.svg
// 분위기: 해 질 녘 할머니 집 다락방. 어린 봄이가 종이 책을 만들던 작업실. 따뜻한 주황 햇살, 먼지가 반짝.
// 구도: 화면 전체가 "펼친 책 한 쪽" 안에 있다 (앞쪽 틀 = 책장 가장자리와 가운데 접힌 골).
import { seed, rand, pick, INK, wob, rect, rectPts, ellPts, fill, line, hatch, svg } from './ink.mjs';
import { part, S, O, craneArt, sheepArt, penguinArt, bearArt, grandmaArt } from './chars.mjs';
import { barrel, cardbox, wicker, yarn, turned, roundRectPts, blobPts } from './props.mjs';
// 땋은 러그: 고리마다 실 땀 무늬
function braidRug(cx, cy, rings) {
  let o = '';
  rings.forEach(([rx, ry, col], i) => {
    o += `<path d="${S(ellPts(cx, cy, rx, ry, 0, Math.PI * 2, 26), 1.5)}" fill="${col}" stroke="${INK}" stroke-width="${i ? 1.6 : 2.2}"/>`;
    const next = rings[i + 1]; if (!next) return;
    const mx = (rx + next[0]) / 2, my = (ry + next[1]) / 2;
    o += `<path d="${S(ellPts(cx, cy, mx, my, 0, Math.PI * 2, 30), 1)}" fill="none" stroke="#ffffff" stroke-width="${(ry - next[1]) * 0.5}" stroke-dasharray="4 10" opacity="0.25"/>`;
  });
  return o;
}

const OUT = new URL('../../assets/rooms/studio/', import.meta.url).pathname;
const UI = new URL('../../assets/ui/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  wall: '#e8c9a0', wall2: '#d8b48a', beam: '#8a5a34', beam2: '#6e4426', floor: '#a8784e', floor2: '#8a5e3a', floorD: '#5a3a22',
  sun: '#ffd88a', sky: '#f4b880', sky2: '#e8907a', paper: '#f6eedc', paper2: '#e6dcc2', water: '#9fd0e0', wood: '#c08a5a', wood2: '#9a6a40',
  red: '#c4473a', pink: '#e98a9a', blue: '#5a7ab0', green: '#6a9a5a', brass: '#d4a649', brass2: '#9d7428', tin: '#7aa0b8', tin2: '#5a809a',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;

/* ───────────── 다락 껍데기: 기울어진 지붕, 서까래, 판자 마루 ───────────── */
function shell() {
  let o = fill(rect(-10, -10, W + 20, H + 20, { amp: 0 }), C.wall);
  for (let x = 0; x < W; x += 74) o += line([[x, 60], [x + rand(-3, 3), 640]], { sw: 1.4, color: C.wall2, op: 0.7 });
  // 양쪽으로 기운 지붕면
  for (const side of [0, 1]) {
    const M = (pts) => pts.map(([x, y]) => [side ? W - x : x, y]);
    o += part(M([[-10, -10], [420, -10], [200, 260], [-10, 420]]), C.wall2, { sw: 2.2 });
    o += part(M([[400, -10], [440, -10], [210, 270], [180, 256]]), C.beam, { sw: 2, heavy: [1, 2] });
    o += part(M([[160, -10], [196, -10], [-10, 270], [-10, 230]]), C.beam2, { sw: 1.8 });
  }
  o += part([[-10, -10], [W + 10, -10], [W + 10, 40], [-10, 40]], C.beam2, { sw: 2 });
  // 마루
  o += fill(wob([[-10, 640], [W + 10, 640], [W + 10, H + 10], [-10, H + 10]], { sharp: true }), C.floor);
  for (let k = 0; k < 18; k++) { const xb = -60 + k * 100, xf = -500 + k * 160; o += line([[xb, 640], [xf, 910]], { sw: 1.6, color: C.floorD, op: 0.7, step: 999 }); }
  o += part([[-10, 630], [W + 10, 630], [W + 10, 648], [-10, 648]], C.beam, { sw: 1.8 });
  o += hatch(wob([[-10, 648], [W + 10, 648], [W + 10, 672], [-10, 672]], { sharp: true }), 0.35);
  return o;
}
function sunsetSky(x, y, w, h) {
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.sky}"/>`;
  o += `<rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.45}" fill="${C.sky2}" opacity="0.7"/>`;
  o += part(ellPts(x + w * 0.5, y + h * 0.62, 60, 60, 0, Math.PI * 2, 18), '#ffe09a', { sw: 1.6 });
  // 마을 지붕들
  for (let i = 0; i < 8; i++) { const rx = x + i * w / 8, rw = w / 8 - 6, ry = y + h * 0.7 + rand(-10, 10); o += part([[rx, y + h], [rx, ry + 20], [rx + rw / 2, ry - 10], [rx + rw, ry + 20], [rx + rw, y + h]], pick(['#8a5a6a', '#6a5a7a', '#9a6a5a']), { sw: 1.2 }) + dot(rx + rw / 2, ry + 36, 5, '#ffe09a'); }
  return o;
}

/* ───────────── 북쪽: 책 받침대와 펼친 종이 책, 작은 둥근 창(접이) ───────────── */
function bgNorth() {
  seed(2011);
  let o = shell();
  // 작은 둥근 창 (왼쪽) + 창턱
  o += `<defs><clipPath id="wN"><circle cx="300" cy="300" r="120"/></clipPath></defs><g clip-path="url(#wN)">${sunsetSky(170, 170, 260, 260)}</g>`;
  o += `<circle cx="300" cy="300" r="120" fill="none" stroke="${C.beam}" stroke-width="18"/><circle cx="300" cy="300" r="129" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
  o += line([[300, 182], [300, 418]], { sw: 8, color: C.beam }) + line([[182, 300], [418, 300]], { sw: 8, color: C.beam });
  o += part([[160, 420], [440, 420], [450, 446], [150, 446]], C.wood, { sw: 2 });
  // 책 받침대 (나무 독서대)
  // 나무 독서대: 십자 받침 + 깎은 기둥 + 테두리 턱이 있는 비스듬한 판
  o += `<path d="${S([[640, 650], [980, 646], [1000, 664], [660, 668]], 0.5)}" fill="${INK}" opacity="0.2"/>`;
  o += part([[650, 650], [664, 632], [790, 622], [936, 630], [952, 648], [940, 658], [800, 650], [660, 660]], C.wood2, { sw: 2.4, heavy: [4, 6] });
  for (const x of [662, 940]) o += part(ellPts(x, 656, 14, 8, 0, Math.PI * 2, 10), C.beam2, { sw: 1.6 });
  o += turned(800, 528, 630, 42, C.wood, C.wood2);
  o += part([[520, 548], [1080, 548], [1086, 534], [1066, 500], [534, 500], [514, 534]], C.wood, { sw: 2.6, heavy: [0, 2], light: [[540, 504], [1060, 504], [1066, 512], [534, 512]] });
  o += part([[512, 548], [1088, 548], [1090, 560], [510, 560]], C.wood2, { sw: 2 });
  for (const x of [560, 1040]) o += dot(x, 554, 2.4, C.brass2);
  // 벽: 어린 봄이의 키 재기 눈금과 이름표 그림 (글자 대신 꽃 표시)
  for (let i = 0; i < 6; i++) o += line([[1260, 600 - i * 60], [1300, 600 - i * 60]], { sw: 2.4, color: C.red }) + dot(1312, 600 - i * 60, 5, C.pink);
  // 실타래 바구니, 종이 더미
  o += yarn({ cx: 1166, cy: 580, r: 24, col: C.red }) + yarn({ cx: 1212, cy: 576, r: 22, col: C.blue }) + wicker({ cx: 1190, by: 646, wTop: 150, wBot: 112, h: 62 }) + yarn({ cx: 1188, cy: 600, r: 18, col: '#f3cf5a', tail: [[1150, 650], [1110, 660], [1080, 650]] });
  for (let k = 0; k < 5; k++) o += part([[380, 640 - k * 10], [500, 636 - k * 10], [504, 646 - k * 10], [384, 650 - k * 10]], k % 2 ? C.paper : C.paper2, { sw: 1.2 });
  o += braidRug(800, 790, [[380, 70, '#c4704a'], [300, 54, '#e8c070'], [200, 36, '#7aa0b8'], [100, 18, '#e8a0a8']]);
  o += cardbox({ x: 50, by: 872, w: 210, h: 150, col: '#c9a06a', open: false });
  o += cardbox({ x: 80, by: 718, w: 150, h: 96, col: '#d4ac74', open: true });
  for (let k = 0; k < 3; k++) o += part([[100 + k * 30, 650 - k * 6], [150 + k * 30, 640 - k * 6], [156 + k * 30, 676], [104 + k * 30, 680]], k % 2 ? C.paper : C.paper2, { sw: 1.2 });
  put('bg/north.svg', W, H, o, { id: 2011 });
}
// 펼친 종이 책 (600x380): 왼쪽 면엔 지금까지의 그림, 오른쪽 면은 비었거나/문 페이지/완성
function book(state) {
  seed(2012);
  let o = `<path d="${S([[20, 370], [580, 370], [570, 380], [30, 380]])}" fill="${INK}" opacity="0.25"/>`;
  o += part([[20, 40], [300, 70], [300, 360], [24, 340]], C.paper, { sw: 2.4, heavy: [0, 1], shade: [[220, 60], [300, 70], [300, 360], [220, 350]], shadeCol: 'rgba(100,70,40,0.18)' });
  o += part([[300, 70], [580, 40], [576, 340], [300, 360]], C.paper, { sw: 2.4, heavy: [1, 2], shade: [[300, 70], [380, 60], [380, 350], [300, 360]], shadeCol: 'rgba(100,70,40,0.18)' });
  // 왼쪽 면: 작은 그림들 (온실 해님, 토끼, 시계, 박쥐, 문어, 학, 구름, 등대, 기차)
  const minis = [(x, y) => part(ellPts(x, y, 12, 12, 0, Math.PI * 2, 10), '#f3cf5a', { sw: 1 }), (x, y) => part([[x - 6, y + 12], [x - 8, y - 14], [x - 2, y - 2], [x + 2, y - 2], [x + 8, y - 14], [x + 6, y + 12]], '#f5ead8', { sw: 1 }), (x, y) => part(ellPts(x, y, 12, 12, 0, Math.PI * 2, 10), C.paper2, { sw: 1 }) + line([[x, y], [x, y - 8]], { sw: 1.4 }), (x, y) => part([[x - 14, y], [x, y - 8], [x + 14, y], [x, y + 10]], '#6a5a8a', { sw: 1 }), (x, y) => part(ellPts(x, y - 4, 10, 9, 0, Math.PI * 2, 10), '#e98a72', { sw: 1 }) + [0, 1, 2, 3].map((k) => line([[x - 6 + k * 4, y + 4], [x - 8 + k * 5, y + 14]], { sw: 1.4, color: '#e98a72' })).join(''), (x, y) => part([[x - 14, y + 6], [x, y - 10], [x + 14, y + 6]], '#bcd4ea', { sw: 1 }), (x, y) => part(ellPts(x, y, 16, 9, 0, Math.PI * 2, 12), '#fbfaf4', { sw: 1 }), (x, y) => part([[x - 6, y + 14], [x - 4, y - 14], [x + 4, y - 14], [x + 6, y + 14]], '#f4ecd8', { sw: 1 }) + dot(x, y - 16, 4, '#6ad08a'), (x, y) => part([[x - 16, y + 8], [x - 16, y - 6], [x + 16, y - 6], [x + 16, y + 8]], '#3e5a8a', { sw: 1 }) + dot(x - 8, y + 10, 4, C.red) + dot(x + 8, y + 10, 4, C.red)];
  minis.forEach((f, i) => { o += f(70 + (i % 3) * 80, 120 + Math.floor(i / 3) * 80); });
  o += line([[300, 72], [300, 358]], { sw: 2.4, color: C.wood2 });
  if (state === 'blank') {
    // 찢어진 자국 + 작은 글씨 줄(확대하면 읽힌다)
    o += `<path d="${O([[330, 70], [340, 90], [326, 110], [342, 140], [330, 170]], 1)}" fill="none" stroke="${C.wood2}" stroke-width="2" stroke-dasharray="6 6"/>`;
    for (let i = 0; i < 3; i++) o += line([[380, 300 + i * 14], [540 - i * 40, 298 + i * 14]], { sw: 1.4, color: '#8a7a6a', op: 0.6 });
  }
  if (state === 'door' || state === 'done') {
    // 접이가 접어 준 팝업 문 페이지
    o += part([[360, 330], [360, 140], [380, 110], [440, 96], [500, 110], [520, 140], [520, 330]], state === 'done' ? '#7fb4b2' : C.paper2, { sw: 2.4, heavy: [5, 6] });
    o += part([[372, 330], [372, 150], [440, 120], [508, 150], [508, 330]], 'none', { sw: 1.2 });
    o += dot(490, 230, 8, C.red);
    for (let i = 0; i < 6; i++) o += line([[354, 120 + i * 40], [366, 128 + i * 40]], { sw: 2.2, color: state === 'done' ? C.red : C.wood2 });
  }
  if (state === 'done') o += `<g filter="url(#blur)"><ellipse cx="300" cy="210" rx="300" ry="200" fill="#fff3c0" opacity="0.5"/></g>` + [0, 1, 2, 3, 4, 5].map(() => dot(rand(40, 560), rand(40, 340), rand(2, 5), '#fff6d0', 0.9)).join('');
  put(`props/book_${state}.svg`, 600, 380, o, { id: 2012, displace: 1.2 });
}
function crane() { seed(2013); put('props/crane.svg', 220, 200, craneArt('idle'), { id: 2013, displace: 0.8 }); put('props/crane_happy.svg', 220, 200, craneArt('happy'), { id: 2013, displace: 0.8 }); }

/* ───────────── 동쪽: 작업대 (종이 뜨는 물통, 틀, 습작 휴지통) ───────────── */
function bgEast() {
  seed(2021);
  let o = shell();
  // 작업대: 두꺼운 상판 + 앞판 + 깎은 다리 + 가로대
  for (const x of [236, 1196]) o += turned(x, 506, 648, 34, C.wood2, C.beam2);
  o += part([[230, 610], [1200, 604], [1200, 618], [230, 624]], C.wood2, { sw: 1.8 });
  o += part([[176, 470], [1244, 458], [1252, 474], [184, 488]], C.wood, { sw: 2.4, light: [[190, 472], [1230, 460], [1232, 466], [190, 478]] });
  o += part([[184, 488], [1252, 474], [1250, 504], [186, 516]], C.wood2, { sw: 2.4, heavy: [1, 2] }) + line([[200, 500], [1236, 488]], { sw: 1, op: 0.4 });
  for (const x of [600, 860]) o += part(roundRectPts(x, 492, 60, 14, 5), C.brass, { sw: 1.2 });
  // 벽 선반: 붓, 풀통, 끈
  o += part([[260, 200], [700, 194], [702, 214], [262, 220]], C.wood2, { sw: 2 });
  for (let i = 0; i < 5; i++) {
    const x = 282 + i * 80, col = ['#e8c070', '#9ac0e8', '#e8a0a0', '#a8d0a0', '#d0b0e0'][i];
    o += part([[x, 196], [x - 2, 160], [x + 6, 148], [x + 34, 148], [x + 42, 160], [x + 40, 196]], '#e6f0f0', { sw: 1.6, heavy: [3, 5], extra: `<path d="${S([[x, 196], [x, 166], [x + 40, 166], [x + 40, 196]], 0.3)}" fill="${col}" opacity="0.85"/>` });
    o += part(roundRectPts(x + 2, 136, 36, 14, 4), C.wood2, { sw: 1.4 }) + part(roundRectPts(x + 8, 172, 24, 14, 2), C.paper, { sw: 1 }) + line([[x + 6, 158], [x + 6, 190]], { sw: 2.4, color: '#ffffff', op: 0.6 });
    if (i === 2) o += line([[x + 20, 140], [x + 30, 96]], { sw: 5, color: C.wood }) + `<path d="${S([[x + 26, 100], [x + 36, 98], [x + 38, 80], [x + 32, 70], [x + 26, 80]], 0.3)}" fill="#5a3a22"/>`;
  }
  // 틀이 걸렸던 못
  o += dot(870, 150, 6, C.brass2);
  // 벽에 붙은 어린 봄이의 종이 뜨기 순서 그림 (찢은 종이 → 물통 → 틀로 뜨기 → 말리기)
  o += part([[1020, 140], [1360, 134], [1364, 340], [1024, 346]], C.paper, { sw: 2.2, heavy: [1, 2] });
  const steps = [(x, y) => part([[x - 20, y - 14], [x + 4, y - 18], [x + 22, y + 4], [x - 6, y + 16]], C.paper2, { sw: 1.4 }), (x, y) => part([[x - 22, y - 6], [x + 22, y - 6], [x + 18, y + 16], [x - 18, y + 16]], C.wood, { sw: 1.4 }) + line([[x - 18, y - 2], [x + 18, y - 2]], { sw: 3, color: C.water }), (x, y) => part(rectPts(x - 20, y - 16, 40, 32), 'none', { sw: 2.4 }) + line([[x - 16, y], [x + 16, y]], { sw: 1, op: 0.6 }) + line([[x, y - 12], [x, y + 12]], { sw: 1, op: 0.6 }), (x, y) => line([[x - 26, y - 14], [x + 26, y - 14]], { sw: 2 }) + part(rectPts(x - 14, y - 12, 28, 26), C.paper, { sw: 1.4 }) + part(ellPts(x + 22, y - 26, 8, 8, 0, Math.PI * 2, 8), C.sun, { sw: 1 })];
  steps.forEach((f, i) => { const x = 1070 + i * 82, y = 240; o += f(x, y); if (i < 3) o += `<path d="M${x + 30} ${y} L${x + 50} ${y}" stroke="${INK}" stroke-width="2.4"/><path d="M${x + 50} ${y - 6} L${x + 58} ${y} L${x + 50} ${y + 6}Z" fill="${INK}"/>`; });
  for (const [x, y, c] of [[420, 760, '#e8a0a8'], [520, 800, '#9ac0e8'], [360, 830, '#f3cf5a'], [800, 850, '#a8d0a0']]) o += `<path d="${S(ellPts(x, y, 34, 12, 0, Math.PI * 2, 10), 3)}" fill="${c}" opacity="0.8"/>`;
  // 둥근 나무 의자: 벌어진 세 다리 + 가로대 + 두꺼운 둥근 방석
  o += `<path d="${S([[690, 830], [880, 826], [890, 842], [700, 846]], 0.5)}" fill="${INK}" opacity="0.2"/>`;
  for (const [x0, x1] of [[722, 700], [838, 862], [790, 796]]) o += line([[x0, 690], [x1, 832]], { sw: 14, color: INK }) + line([[x0, 690], [x1, 832]], { sw: 10, color: C.wood2 });
  o += `<path d="${O([[712, 776], [780, 788], [850, 776]], 0.3)}" fill="none" stroke="${INK}" stroke-width="9"/><path d="${O([[712, 776], [780, 788], [850, 776]], 0.3)}" fill="none" stroke="${C.wood2}" stroke-width="5"/>`;
  o += part([[700, 680], [700, 694], [740, 708], [820, 708], [860, 694], [860, 680]], C.wood2, { sw: 2 });
  o += part(ellPts(780, 680, 80, 18, 0, Math.PI * 2, 18), C.wood, { sw: 2.2, light: [[720, 674], [790, 666], [790, 672], [730, 680]] });
  o += part([[740, 640], [820, 640], [824, 676], [736, 676]], '#f6eedc', { sw: 1.6 }) + line([[750, 650], [810, 650]], { sw: 1, op: 0.5 });
  put('bg/east.svg', W, H, o, { id: 2021 });
}
function tub(state) {
  seed(2022);
  // 넓고 낮은 나무 물통 (360x200)
  let o = barrel({ cx: 180, by: 172, w: 320, h: 118, col: C.wood2, dark: C.beam2, top: state === 'pulp' ? '#ece6d4' : C.water });
  if (state === 'pulp') for (let i = 0; i < 24; i++) { const x = rand(50, 310), y = 54 + rand(-12, 14); o += part(blobPts(x, y, rand(5, 10), rand(3, 6), { n: 7, k: 0.3 }), pick(['#fffaf0', '#f4ecd8', '#e8dcc0']), { sw: 0.8 }); }
  else o += `<path d="${O([[120, 56], [170, 52], [220, 56]], 0.3)}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/><path d="${O([[200, 64], [240, 62]], 0.3)}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>`;
  put(`props/tub_${state}.svg`, 360, 200, o, { id: 2022, displace: 1.2 });
}
function mould() {
  seed(2023);
  let o = line([[110, 6], [60, 40]], { sw: 2 }) + line([[110, 6], [160, 40]], { sw: 2 });
  o += part(rectPts(20, 40, 180, 140), 'none', { sw: 2.4 }) + `<rect x="20" y="40" width="180" height="140" fill="none" stroke="${C.wood}" stroke-width="12"/>`;
  for (let x = 30; x < 200; x += 10) o += line([[x, 46], [x, 174]], { sw: 0.8, op: 0.5 });
  for (let y = 50; y < 176; y += 10) o += line([[26, y], [194, y]], { sw: 0.8, op: 0.5 });
  put('props/mould.svg', 220, 190, o, { id: 2023, displace: 0.8 });
}
function basket(full) {
  seed(2024);
  let o = '';
  const crumple = (x, y, r, col) => { const p = blobPts(x, y, r, r * 0.85, { n: 11, k: 0.35 }); return part(p, col, { sw: 1.4, shade: [[x - r, y + r * 0.1], [x + r * 1.2, y - r * 0.3], [x + r * 1.2, y + r], [x - r, y + r]], shadeCol: 'rgba(90,70,40,0.2)', hatch: false, extra: `<path d="${O([[x - r * 0.5, y - r * 0.2], [x - r * 0.1, y + r * 0.1], [x + r * 0.3, y - r * 0.3]], 0.3)}${O([[x - r * 0.2, y + r * 0.5], [x + r * 0.1, y + r * 0.1], [x + r * 0.5, y + r * 0.3]], 0.3)}" fill="none" stroke="#8a7a6a" stroke-width="1" opacity="0.7"/>` }); };
  if (full) for (const [x, y, r] of [[60, 52, 26], [150, 50, 24], [104, 38, 28], [80, 74, 22], [132, 72, 22]]) o += crumple(x, y, r, pick([C.paper, C.paper2, '#f0e0c0']));
  o += wicker({ cx: 105, by: 198, wTop: 180, wBot: 130, h: 130 });
  if (full) o += crumple(70, 76, 18, C.paper) + crumple(140, 80, 16, C.paper2);
  put(`props/basket_${full ? 'full' : 'empty'}.svg`, 210, 210, o, { id: 2024, displace: 1 });
}

/* ───────────── 남쪽: 큰 둥근 창 (노을), 빨랫줄, 바닥 문 ───────────── */
function bgSouth() {
  seed(2031);
  let o = shell();
  o += `<defs><clipPath id="wS"><circle cx="800" cy="300" r="250"/></clipPath></defs><g clip-path="url(#wS)">${sunsetSky(540, 40, 520, 520)}</g>`;
  o += `<circle cx="800" cy="300" r="250" fill="none" stroke="${C.beam}" stroke-width="26"/><circle cx="800" cy="300" r="264" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
  o += line([[800, 52], [800, 548]], { sw: 10, color: C.beam }) + line([[552, 300], [1048, 300]], { sw: 10, color: C.beam });
  // 창 앞을 가로지르는 빨랫줄
  o += line([[420, 190], [800, 214], [1180, 190]], { sw: 3, color: C.floorD, step: 999 });
  // 바닥 문 자리 (문짝은 소품)
  o += part([[600, 820], [1000, 820], [970, 690], [630, 690]], C.floorD, { sw: 2.6 });
  // 흔들의자와 뜨개 담요 (할머니 의자)
  // 흔들의자: 둥근 등받이 + 살대 + 팔걸이 + 흔들 다리, 분홍 뜨개 담요가 걸쳐 있다
  const RC = '#9a6a40', RC2 = '#7a4e2c';
  for (const x of [196, 330]) o += line([[x, 420], [x + (x < 250 ? -6 : 6), 640]], { sw: 13, color: INK }) + line([[x, 420], [x + (x < 250 ? -6 : 6), 640]], { sw: 9, color: x < 250 ? RC : RC2 });
  o += part([[188, 430], [196, 396], [230, 378], [296, 378], [330, 396], [338, 430], [326, 436], [262, 424], [200, 436]], RC, { sw: 2.2, heavy: [3, 5] });
  for (const x of [226, 250, 274, 298]) o += line([[x, 428], [x + 2, 560]], { sw: 5, color: RC2 });
  o += part([[176, 560], [350, 556], [362, 576], [170, 582]], RC, { sw: 2.2 });
  o += `<path d="${O([[140, 640], [200, 668], [280, 676], [360, 662], [400, 636]], 0.5)}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="${O([[140, 640], [200, 668], [280, 676], [360, 662], [400, 636]], 0.5)}" fill="none" stroke="${RC}" stroke-width="7" stroke-linecap="round"/>`;
  for (const x of [190, 340]) o += line([[x, 578], [x + (x < 250 ? -4 : 6), 664]], { sw: 10, color: INK }) + line([[x, 578], [x + (x < 250 ? -4 : 6), 664]], { sw: 6, color: RC2 });
  o += `<path d="${O([[168, 500], [200, 480], [356, 480], [372, 504]], 0.4)}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${O([[168, 500], [200, 480], [356, 480], [372, 504]], 0.4)}" fill="none" stroke="${RC}" stroke-width="7" stroke-linecap="round"/>`;
  let knit = ''; for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) { const x = 214 + c * 14, y = 446 + r * 22 + c * 1.5; knit += `M${x} ${y} l5 8 l5 -8`; }
  o += part([[206, 434], [330, 430], [338, 520], [348, 600], [320, 616], [300, 600], [270, 618], [240, 598], [214, 614], [200, 520]], C.pink, { sw: 2, heavy: [2, 4], shade: [[280, 420], [360, 420], [360, 620], [280, 620]], shadeCol: 'rgba(120,30,50,0.2)', hatch: false, extra: `<path d="${knit}" fill="none" stroke="#c86a7a" stroke-width="1.4" opacity="0.7"/>` });
  for (const x of [222, 262, 302, 334]) o += line([[x, 612], [x + 2, 630]], { sw: 2, color: C.pink });
  o += braidRug(1290, 780, [[240, 60, C.pink], [160, 40, '#f6eedc'], [80, 20, '#c4704a']]);
  o += line([[1300, 652], [1420, 560]], { sw: 5, color: INK }) + line([[1300, 652], [1420, 560]], { sw: 3, color: '#c8c8d4' }) + dot(1422, 558, 6, C.red) + line([[1310, 656], [1440, 590]], { sw: 5, color: INK }) + line([[1310, 656], [1440, 590]], { sw: 3, color: '#c8c8d4' }) + dot(1442, 588, 6, C.red);
  for (const [x, y, c] of [[1250, 660, C.red], [1300, 650, C.blue], [1344, 662, '#f3cf5a']]) o += yarn({ cx: x, cy: y, r: 26, col: c });
  o += wicker({ cx: 1290, by: 762, wTop: 190, wBot: 150, h: 92 });
  o += `<path d="${O([[1250, 690], [1210, 740], [1150, 780], [1100, 770]], 0.6)}" fill="none" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`;
  put('bg/south.svg', W, H, o, { id: 2031 });
}
function floorDoor(open) {
  seed(2032);
  // 바닥 문 (440x280, 위로 130 여유): 나무 문틀 + 판자 + 쇠 경첩 + 둥근 고리
  const fr = [[14, 146], [426, 146], [396, 4], [44, 4]];
  let o = part(fr, C.beam2, { sw: 2.6, heavy: [0, 1] });
  const hole = [[32, 136], [408, 136], [382, 16], [58, 16]];
  if (open) {
    o += part(hole, '#3a2414', { sw: 2.2 });
    o += `<g filter="url(#blur)"><ellipse cx="220" cy="90" rx="190" ry="60" fill="#ffe8a0" opacity="0.85"/></g>`;
    o += `<path d="${S([[60, 130], [380, 130], [360, 40], [80, 40]], 0.5)}" fill="#fff4c8" opacity="0.8"/>`;
    // 사다리 꼭대기
    for (const x of [150, 290]) o += line([[x, 20], [x + (x < 200 ? -10 : 10), 140]], { sw: 10, color: INK }) + line([[x, 20], [x + (x < 200 ? -10 : 10), 140]], { sw: 6, color: C.wood });
    for (const y of [56, 104]) o += line([[146, y], [294, y]], { sw: 8, color: INK }) + line([[146, y], [294, y]], { sw: 5, color: C.wood });
    // 세워진 문짝 (뒷면): 판자 + 가로대
    const lid = [[52, 10], [388, 10], [368, -116], [72, -116]];
    let pl = ''; for (let i = 1; i < 5; i++) pl += O([[52 + i * 67, 10], [72 + i * 59, -116]], 0.3);
    o += part(lid, C.wood, { sw: 2.6, heavy: [1, 2], extra: `<path d="${pl}" fill="none" stroke="${C.wood2}" stroke-width="1.8"/>` });
    for (const y of [-90, -20]) o += part([[60 + (y + 116) * 0.15, y], [380 - (y + 116) * 0.15, y], [378 - (y + 116) * 0.15, y + 16], [62 + (y + 116) * 0.15, y + 16]], C.wood2, { sw: 1.6 });
    for (let i = 0; i < 6; i++) o += dot(rand(80, 360), rand(-100, 120), rand(2, 4), '#fff6d0', 0.9);
  } else {
    let pl = ''; for (let i = 1; i < 5; i++) pl += O([[32 + i * 75, 136], [58 + i * 65, 16]], 0.3);
    let grain = ''; for (let i = 0; i < 12; i++) { const x = rand(60, 380), y = rand(30, 128); grain += O([[x, y], [x + rand(14, 30), y + rand(-1, 1)]], 0.2); }
    o += part(hole, C.wood, { sw: 2.4, heavy: [0, 1], light: [[60, 20], [380, 20], [384, 30], [56, 30]], extra: `<path d="${pl}" fill="none" stroke="${C.wood2}" stroke-width="1.8"/><path d="${grain}" fill="none" stroke="${C.wood2}" stroke-width="1" opacity="0.5"/>` });
    // 쇠 경첩 두 개 (위쪽)
    // 판자를 가로지르는 긴 쇠띠 두 줄 (경첩은 위쪽 문틀에 붙어 있다)
    for (const [y, x0, x1] of [[40, 64, 372], [108, 44, 392]]) { o += part([[x0, y - 6], [x1, y - 6], [x1 + 4, y + 6], [x0 - 4, y + 6]], '#5a5a64', { sw: 1.4 }); for (let x = x0 + 18; x < x1; x += 48) o += dot(x, y, 2, '#9a9aa8'); }
    for (const x of [100, 330]) o += part(roundRectPts(x - 16, 2, 32, 12, 4), '#5a5a64', { sw: 1.2 });
    // 앞쪽 가장자리의 놋쇠 고리 손잡이 (오른쪽으로 치우침)
    o += part(roundRectPts(300, 118, 30, 12, 4), '#5a5a64', { sw: 1.4 });
    o += `<path d="${O(ellPts(315, 132, 18, 12, 0, Math.PI, 10), 0.3)}" fill="none" stroke="${INK}" stroke-width="8"/><path d="${O(ellPts(315, 132, 18, 12, 0, Math.PI, 10), 0.3)}" fill="none" stroke="${C.brass}" stroke-width="4.5"/>`;
  }
  put(`props/hatch_${open ? 'open' : 'closed'}.svg`, 440, 280, o, { id: 2032, displace: 1, vb: '0 -130 440 280' });
}
function sheet(dry) {
  seed(2033);
  let o = part([[10, 20], [230, 14], [236, 200], [14, 206]], dry ? C.paper : '#d8e2e4', { sw: 2.2, heavy: [1, 2] });
  if (!dry) for (let i = 0; i < 6; i++) o += `<path d="${S([[0, -6], [5, 2], [0, 7], [-5, 2]].map(([a, b]) => [rand(30, 210) + a, 214 + rand(0, 20) + b]), 0.2)}" fill="#bfe0f4" stroke="${INK}" stroke-width="1"/>`;
  else for (let i = 0; i < 20; i++) o += dot(rand(24, 220), rand(30, 196), 1.4, '#c8b898', 0.7);
  for (const x of [40, 200]) o += part([[x - 6, 4], [x + 6, 4], [x + 5, 34], [x - 5, 34]], C.pink, { sw: 1.4 });
  put(`props/sheet_${dry ? 'dry' : 'wet'}.svg`, 250, 240, o, { id: 2033, displace: 1 });
}

/* ───────────── 서쪽: 봄이의 여행 지도, 반짇고리 ───────────── */
const icon = {
  desk: (x, y, s = 1) => part([[x - 30 * s, y + 24 * s], [x - 30 * s, y - 20 * s], [x + 24 * s, y - 24 * s], [x + 24 * s, y + 20 * s]], C.paper, { sw: 2 }) + line([[x - 22 * s, y + 30 * s], [x + 30 * s, y - 34 * s]], { sw: 8 * s, color: '#f2c14e' }) + line([[x + 26 * s, y - 30 * s], [x + 32 * s, y - 38 * s]], { sw: 4 * s, color: '#4a4a52' }),
  cloud: (x, y, s = 1) => { const p = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; p.push([x + Math.cos(a) * 36 * s * (i % 2 ? 0.86 : 1), y + Math.sin(a) * 22 * s * (i % 2 ? 0.86 : 1)]); } return part(p, '#fbfaf4', { sw: 2 }) + [0, 1, 2].map((k) => line([[x - 14 * s + k * 14 * s, y + 26 * s], [x - 18 * s + k * 14 * s, y + 40 * s]], { sw: 3, color: '#7fb0e0' })).join(''); },
  light: (x, y, s = 1) => part([[x - 14 * s, y + 34 * s], [x - 10 * s, y - 20 * s], [x + 10 * s, y - 20 * s], [x + 14 * s, y + 34 * s]], '#f4ecd8', { sw: 2 }) + line([[x - 12 * s, y + 4 * s], [x + 12 * s, y + 4 * s]], { sw: 6 * s, color: C.red }) + part([[x - 12 * s, y - 20 * s], [x, y - 34 * s], [x + 12 * s, y - 20 * s]], C.red, { sw: 1.6 }) + dot(x, y - 26 * s, 6 * s, '#6ad08a'),
  train: (x, y, s = 1) => part([[x - 34 * s, y + 18 * s], [x - 34 * s, y - 10 * s], [x - 10 * s, y - 10 * s], [x - 10 * s, y - 26 * s], [x + 4 * s, y - 26 * s], [x + 4 * s, y - 10 * s], [x + 34 * s, y - 10 * s], [x + 34 * s, y + 18 * s]], '#3e5a8a', { sw: 2 }) + dot(x - 20 * s, y + 22 * s, 8 * s, C.red) + dot(x + 20 * s, y + 22 * s, 8 * s, C.red) + dot(x - 20 * s, y + 2 * s, 6 * s, '#f6d060'),
  house: (x, y, s = 1) => part([[x - 30 * s, y + 26 * s], [x - 30 * s, y - 4 * s], [x, y - 30 * s], [x + 30 * s, y - 4 * s], [x + 30 * s, y + 26 * s]], '#c4704a', { sw: 2 }) + part(ellPts(x, y + 4 * s, 9 * s, 9 * s, 0, Math.PI * 2, 10), '#f6d060', { sw: 1.4 }),
};
function bgWest() {
  seed(2041);
  let o = shell();
  // 봄이의 여행 지도: 책상 → 구름 → 등대 → 기차 → 집 (점선 길)
  o += part([[240, 110], [900, 96], [910, 470], [246, 482]], C.paper, { sw: 2.6, heavy: [1, 2] });
  for (const [x, y] of [[250, 116], [900, 104], [904, 466], [252, 476]]) o += dot(x, y, 7, C.red);
  const pts = [[330, 380], [470, 220], [610, 360], [740, 200], [840, 360]];
  o += `<path d="${O(pts, 2)}" fill="none" stroke="${C.wood2}" stroke-width="4" stroke-dasharray="12 10"/>`;
  ['desk', 'cloud', 'light', 'train', 'house'].forEach((k, i) => { o += icon[k](pts[i][0], pts[i][1], 0.9); });
  // 출발 화살표와 아이 발자국 (출발점 표시)
  o += `<path d="M270 430 L310 400" stroke="${C.red}" stroke-width="4"/><path d="M300 396 L316 396 L308 410Z" fill="${C.red}"/>`;
  for (let i = 0; i < 4; i++) o += part(ellPts(280 + i * 16, 450 - (i % 2) * 8, 5, 7, 0, Math.PI * 2, 8), C.wood2, { sw: 0.8 });
  // 반짇고리 선반
  o += part([[960, 560], [1300, 552], [1302, 576], [962, 584]], C.wood2, { sw: 2.2 });
  for (const x of [990, 1260]) o += part([[x, 576], [x + 16, 576], [x + 6, 610]], C.wood2, { sw: 1.4 });
  // 옛날 사진 액자 (어린 봄과 접이 — 얼굴 대신 실루엣)
  o += part(rectPts(1000, 160, 220, 260), C.wood2, { sw: 2.4, heavy: [1, 2] }) + part([[1000, 160], [1220, 160], [1206, 174], [1014, 174]], C.wood, { sw: 1 }) + part([[1000, 160], [1014, 174], [1014, 406], [1000, 420]], C.wood, { sw: 1 }) + part(rectPts(1014, 174, 192, 232), '#e8d8b8', { sw: 1.4, extra: `<rect x="1014" y="174" width="192" height="232" fill="#c8a878" opacity="0.25"/>` }) + line([[1110, 160], [1110, 120]], { sw: 1.6 }) + line([[1110, 120], [1060, 160]], { sw: 1.4, op: 0.7 }) + line([[1110, 120], [1160, 160]], { sw: 1.4, op: 0.7 }) + dot(1110, 118, 4, C.brass2);
  o += part([[1080, 406], [1080, 300], [1110, 270], [1140, 300], [1140, 406]], '#b89a78', { sw: 1.4 }) + part(ellPts(1110, 250, 24, 26, 0, Math.PI * 2, 12), '#b89a78', { sw: 1.4 });
  o += part([[1150, 230], [1180, 200], [1196, 226], [1168, 236]], '#bcd4ea', { sw: 1.2 });
  for (let k = 0; k < 4; k++) o += part([[300 + k * 44, 660 - k * 3], [364 + k * 44, 650 - k * 4], [368 + k * 44, 598 - k * 8], [304 + k * 44, 606 - k * 6]], k % 2 ? C.paper : C.paper2, { sw: 1.2 });
  o += cardbox({ x: 250, by: 862, w: 290, h: 190, col: '#c9a06a', open: true });
  o += part([[330, 730], [490, 724], [494, 800], [334, 806]], C.paper, { sw: 1.6 }) + part(blobPts(412, 764, 26, 18, { n: 10, k: 0.2 }), '#bcd4ea', { sw: 1.2 });
  put('bg/west.svg', W, H, o, { id: 2041 });
}
function tin(open) {
  seed(2042);
  // 둥근 모서리 양철 반짇고리 (340x150, 위로 50 여유): 돋을새김 테두리, 꽃 무늬, 잠금 단추
  let o = `<path d="${S([[10, 138], [334, 136], [328, 150], [18, 150]])}" fill="${INK}" opacity="0.2"/>`;
  o += part(roundRectPts(20, 36, 300, 104, 22), C.tin, { sw: 2.6, heavy: [3, 9], shade: [[240, 30], [330, 30], [330, 146], [240, 146]], shadeCol: 'rgba(0,30,50,0.22)', extra: `<path d="${O([[24, 124], [316, 120]], 0.3)}" fill="none" stroke="${C.tin2}" stroke-width="3"/>` });
  if (open) {
    o += part(roundRectPts(28, -46, 298, 84, 20), C.tin2, { sw: 2.2, extra: `<path d="${S(roundRectPts(44, -34, 266, 60, 14), 0.3)}" fill="#d8e6ee" opacity="0.5"/>` });
    o += part(roundRectPts(30, 34, 280, 18, 8), '#3a5a70', { sw: 1.6 });
    o += yarn({ cx: 96, cy: 40, r: 24, col: C.red }) + yarn({ cx: 160, cy: 40, r: 20, col: '#f6d060' });
    o += part(blobPts(240, 38, 30, 16, { n: 10, k: 0.15 }), C.pink, { sw: 1.6 }) + [0, 1, 2, 3].map((k) => line([[218 + k * 14, 26], [222 + k * 14, 50]], { sw: 1, color: '#a8a8b8' })).join('');
  } else {
    o += part(roundRectPts(14, 18, 312, 34, 14), C.tin2, { sw: 2.2, light: [[30, 22], [310, 22], [310, 28], [30, 28]] });
    for (let i = 0; i < 4; i++) o += part(roundRectPts(48 + i * 66, 64, 52, 50, 10), '#e8e2d0', { sw: 1.8, heavy: [3, 6] }) + `<path d="${S(roundRectPts(52 + i * 66, 68, 44, 42, 8), 0.3)}" fill="none" stroke="${C.tin2}" stroke-width="1.2" opacity="0.7"/>`;
    for (const x of [30, 310]) o += dot(x, 90, 4, '#d8e6ee');
    o += part(roundRectPts(156, 40, 28, 22, 6), C.brass, { sw: 1.4 });
  }
  put(`props/tin_${open ? 'open' : 'closed'}.svg`, 340, 150, o, { id: 2042, displace: 1, vb: '0 -50 340 200' });
}
function zoomTin() {
  seed(2043);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), C.wall);
  o += `<path d="${S([[270, 730], [1350, 724], [1370, 760], [290, 766]], 0.6)}" fill="${INK}" opacity="0.2"/>`;
  o += part(roundRectPts(250, 170, 1100, 560, 70), C.tin, { sw: 3, heavy: [3, 9], shade: [[1100, 160], [1360, 160], [1360, 740], [1100, 740]], shadeCol: 'rgba(0,30,50,0.2)', light: [[300, 190], [900, 186], [880, 204], [300, 210]] });
  o += part(roundRectPts(296, 214, 1008, 474, 50), C.tin2, { sw: 2 });
  for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; o += dot(800 + Math.cos(a) * 520, 450 + Math.sin(a) * 255, 4, '#9ab8cc'); }
  for (let i = 0; i < 4; i++) o += part(roundRectPts(350 + i * 230, 340, 200, 200, 26), '#e8e2d0', { sw: 2.4, heavy: [3, 6] }) + `<path d="${S(roundRectPts(360 + i * 230, 350, 180, 180, 20), 0.3)}" fill="none" stroke="${C.tin2}" stroke-width="2" opacity="0.6"/>`;
  // 뚜껑 위 그림: 신발 자국이 1→4 방향으로 (왼쪽부터 차례대로)
  for (let i = 0; i < 4; i++) o += part(ellPts(450 + i * 230, 600, 10, 16, 0, Math.PI * 2, 10), '#3a5a70', { sw: 1 }) + part(ellPts(470 + i * 230, 620, 10, 16, 0, Math.PI * 2, 10), '#3a5a70', { sw: 1 });
  o += `<path d="M380 280 L1230 280" stroke="#e8e2d0" stroke-width="5" stroke-dasharray="16 12"/><path d="M1230 266 L1258 280 L1230 294Z" fill="#e8e2d0"/>`;
  put('zoom/tin.svg', W, H, o, { id: 2043, displace: 2 });
}
function icons() {
  seed(2044);
  for (const k of ['desk', 'cloud', 'light', 'train']) put(`zoom/ic_${k}.svg`, 200, 200, icon[k](100, 100, 1.7), { id: 2044, displace: 1 });
}
function items() {
  seed(2060);
  const it = (n, b) => put(`items/${n}.svg`, 160, 160, b, { id: 2060, displace: 1 });
  it('scraps', [0, 1, 2, 3, 4].map(() => { const x = rand(50, 110), y = rand(50, 110); return part([[x - 30, y + 10], [x - 10, y - 20], [x + 26, y - 14], [x + 32, y + 16], [x + 4, y + 26]], pick([C.paper, C.paper2, '#f0e0c0']), { sw: 1.6 }); }).join(''));
  it('mould', part(rectPts(24, 30, 112, 100), 'none', { sw: 2.4 }) + `<rect x="24" y="30" width="112" height="100" fill="none" stroke="${C.wood}" stroke-width="10"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => line([[34 + i * 13, 36], [34 + i * 13, 124]], { sw: 0.8, op: 0.5 })).join(''));
  it('wetsheet', part(rectPts(24, 30, 112, 100), '#d8e2e4', { sw: 2.2 }) + `<rect x="24" y="30" width="112" height="100" fill="none" stroke="${C.wood}" stroke-width="10"/>` + [0, 1, 2].map(() => `<path d="${S([[0, -6], [5, 2], [0, 7], [-5, 2]].map(([a, b]) => [rand(40, 120) + a, 140 + b]), 0.2)}" fill="#bfe0f4" stroke="${INK}" stroke-width="1"/>`).join(''));
  it('paper', part([[24, 24], [136, 20], [140, 136], [20, 140]], C.paper, { sw: 2.4, heavy: [1, 2] }) + [0, 1, 2, 3, 4].map(() => dot(rand(30, 130), rand(30, 130), 1.4, '#c8b898', 0.7)).join(''));
  it('doorpage', part([[40, 140], [40, 50], [56, 30], [80, 22], [104, 30], [120, 50], [120, 140]], C.paper2, { sw: 2.4, heavy: [5, 6] }) + part([[50, 140], [50, 56], [80, 36], [110, 56], [110, 140]], 'none', { sw: 1.2 }) + dot(102, 90, 6, C.red) + line([[30, 140], [130, 140]], { sw: 2 }));
  it('needle', line([[30, 130], [130, 30]], { sw: 4, color: '#a8b0b8' }) + part(ellPts(124, 36, 6, 10, 0.8, 0.8 + Math.PI * 2, 10), 'none', { sw: 1.6 }) + `<path d="${O([[124, 36], [100, 70], [120, 110], [80, 130], [50, 110]], 1)}" fill="none" stroke="${C.red}" stroke-width="3"/>`);
}

/* ───────────── 앞쪽 틀: 펼친 책 한 쪽 (책장 가장자리, 가운데 골 그늘, 접힌 모서리) ───────────── */
function frame() {
  seed(2070);
  let o = `<path d="M-10 -10 H${W + 10} V${H + 10} H-10Z M26 22 L${W - 20} 18 L${W - 16} ${H - 24} L22 ${H - 20}Z" fill="${C.paper}" fill-rule="evenodd"/>`;
  o += `<path d="M26 22 L${W - 20} 18 L${W - 16} ${H - 24} L22 ${H - 20}Z" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
  for (let i = 1; i < 5; i++) o += `<path d="M${26 - i * 4} ${22 + i * 4} L${22 - i * 4} ${H - 20 + i * 3}" stroke="${C.paper2}" stroke-width="1.4"/>`;
  // 왼쪽 가운데 골 그늘 (책 제본선)
  o += `<g filter="url(#blur)"><rect x="-40" y="0" width="90" height="${H}" fill="#6a4a2a" opacity="0.28"/></g>`;
  // 오른쪽 아래 접힌 모서리
  o += `<path d="M${W - 16} ${H - 120} L${W - 16} ${H - 24} L${W - 112} ${H - 22}Z" fill="${C.paper2}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = 0; i < 18; i++) o += dot(rand(60, W - 60), rand(60, H - 60), rand(1.2, 2.6), '#fff6d0', 0.7);
  put('bg/frame.svg', W, H, o, { id: 2070, displace: 1 });
}
// 2편 마지막 엔딩 그림: 다락방 창가에 모인 2편 친구들
function finale2() {
  seed(2080);
  // 할머니 집 부엌 창가: 가운데 봄 할머니, 둘레에 2편 친구들, 위로 날아오르는 접이
  let o = sunsetSky(0, 0, 1000, 600);
  o += part([[-10, 440], [1010, 430], [1010, 610], [-10, 610]], C.floor, { sw: 2 });
  for (let k = 0; k < 9; k++) o += line([[k * 120, 436], [k * 120 - 60, 610]], { sw: 1.4, color: C.floorD, op: 0.6 });
  // 식탁과 쿠키 접시
  o += part([[340, 470], [660, 466], [664, 492], [336, 496]], C.wood, { sw: 2 }) + part(ellPts(500, 462, 70, 14, 0, Math.PI * 2, 16), '#f6eedc', { sw: 1.6 });
  for (let i = 0; i < 5; i++) o += part(ellPts(452 + i * 24, 456, 11, 7, 0, Math.PI * 2, 10), '#d8a060', { sw: 1.2 });
  o += `<g transform="translate(20 250) scale(0.6)">${bearArt('awake')}</g>`;
  o += `<g transform="translate(220 300) scale(0.5)">${sheepArt('happy')}</g>`;
  o += `<g transform="translate(372 70) scale(0.95)">${grandmaArt()}</g>`;
  o += `<g transform="translate(650 270) scale(0.6)">${penguinArt('happy')}</g>`;
  o += `<g transform="translate(800 60) scale(0.8)">${craneArt('happy')}</g>`;
  o += `<g filter="url(#blur)"><ellipse cx="500" cy="260" rx="460" ry="240" fill="#fff3c0" opacity="0.22"/></g>`;
  for (let i = 0; i < 14; i++) o += dot(rand(40, 960), rand(30, 400), rand(2, 4), '#fff6d0', 0.8);
  svg(UI + 'finale2.svg', 1000, 600, o, { id: 2080, displace: 1.2 });
}

bgNorth(); ['blank', 'door', 'done'].forEach(book); crane();
bgEast(); tub('water'); tub('pulp'); mould(); basket(true); basket(false);
bgSouth(); floorDoor(false); floorDoor(true); sheet(false); sheet(true);
bgWest(); tin(false); tin(true); zoomTin(); icons(); items(); frame(); finale2();
console.log('studio assets written, ~' + Math.round(total / 1024) + 'KB');
