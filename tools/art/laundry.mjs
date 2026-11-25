// 7장 「구름 세탁소」 그래픽 에셋 생성기
// node tools/art/laundry.mjs  → assets/rooms/laundry/**
// 분위기: 구름 위에 떠 있는 세탁소. 하늘색 줄무늬 벽, 구름 카펫, 빨랫줄에 널린 구름들. 처음엔 해가 가려져 흐릿하다.
import { seed, rand, pick, INK, wob, rect, rectPts, ellPts, fill, line, hatch, svg } from './ink.mjs';
import { part, S, O, sheepArt } from './chars.mjs';

const OUT = new URL('../../assets/rooms/laundry/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  wall: '#cfe4f0', wall2: '#b9d6e8', stripe: '#e8f3f8', trim: '#f4ecd8', wood: '#d8b48a', wood2: '#b88f62', woodD: '#7a5a3a',
  cloud: '#fbfaf4', cloud2: '#e4e8f2', cloudS: 'rgba(110,120,170,0.22)', grey: '#9a9eab', grey2: '#7c8090', rain: '#5f7fae', rain2: '#4a6894',
  sky: '#9fd0ee', sky2: '#c8e6f6', sun: '#ffd866', sun2: '#f0b840', mint: '#9fd8c8', mint2: '#6fb0a0', pink: '#f2b8c0', brass: '#d4a649', brass2: '#9d7428',
  machine: '#f4f1ea', machine2: '#d8d2c4', red: '#d9574f',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
// 손으로 찍은 점을 이은 뭉게구름 윤곽
function cloudPts(cx, cy, rx, ry, n = 14, k = 0.14) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const b = i % 2 ? 1 - k : 1 + k * 0.3; p.push([cx + Math.cos(a) * rx * b, cy + Math.sin(a) * ry * b]); } return p; }
const cloud = (cx, cy, rx, ry, col = C.cloud, o = {}) => part(cloudPts(cx, cy, rx, ry, o.n || 14), col, { sw: o.sw || 2, heavy: o.heavy || [3, 6], shade: [[cx - rx, cy + ry * 0.2], [cx + rx, cy + ry * 0.2], [cx + rx, cy + ry * 1.2], [cx - rx, cy + ry * 1.2]], shadeCol: C.cloudS, hatch: false, light: [[cx - rx * 0.6, cy - ry * 0.3], [cx - rx * 0.2, cy - ry * 0.7], [cx, cy - ry * 0.3]] });

function cloudFloor(y0, y1) {
  let o = '';
  for (let row = 0; row < 7; row++) {
    const t = row / 6, y = y0 + 8 + t * t * (y1 - y0 - 10), r = 30 + t * 110;
    for (let x = -60 + (row % 2) * r * 0.9; x < W + 120; x += r * 1.7) {
      const cx = x + rand(-10, 10), cy = y + rand(-6, 6);
      o += `<path d="${S(cloudPts(cx, cy + r * 0.18, r, r * 0.42, 12, 0.1), 0.6)}" fill="#c8d0e2" opacity="0.6"/>`;
      o += `<path d="${S(cloudPts(cx, cy, r, r * 0.42, 12, 0.1), 0.6)}" fill="${pick(['#ffffff', '#f6f7fb', '#eef1f8'])}" stroke="${INK}" stroke-width="${(0.8 + t * 1.4).toFixed(1)}" stroke-opacity="${(0.18 + t * 0.25).toFixed(2)}"/>`;
      o += `<path d="${O([[cx - r * 0.5, cy - r * 0.12], [cx - r * 0.1, cy - r * 0.3], [cx + r * 0.3, cy - r * 0.22]], 0.4)}" fill="none" stroke="#ffffff" stroke-width="${(2 + t * 4).toFixed(1)}" opacity="0.9"/>`;
    }
  }
  return o;
}
/* ───────────── 세탁소 껍데기: 줄무늬 벽 + 구름 카펫 바닥 ───────────── */
function shell({ floor = true } = {}) {
  let o = fill(rect(-10, -10, W + 20, 640, { amp: 0 }), C.wall);
  for (let x = 0; x < W; x += 80) o += `<rect x="${x}" y="-10" width="34" height="650" fill="${C.stripe}" opacity="0.7"/>`;
  for (let i = 0; i < 6; i++) o += `<path d="${S(ellPts(rand(100, 1500), rand(60, 560), rand(40, 80), rand(20, 40), 0, Math.PI * 2, 10), 3)}" fill="${C.wall2}" opacity="0.25"/>`;
  // 위쪽 몰딩, 걸레받이
  o += part([[-10, 0], [W + 10, 0], [W + 10, 34], [-10, 34]], C.trim, { sw: 2 });
  o += part([[-10, 600], [W + 10, 600], [W + 10, 640], [-10, 640]], C.trim, { sw: 2.2 });
  for (let x = 20; x < W; x += 60) o += line([[x, 606], [x + 30, 606]], { sw: 1, op: 0.3 });
  if (floor) {
    // 구름 카펫: 겹겹이 쌓인 솜뭉치 (뒤 → 앞, 앞일수록 크고 또렷)
    o += fill(wob([[-10, 636], [W + 10, 636], [W + 10, H + 10], [-10, H + 10]], { sharp: true }), '#dfe5f0');
    o += cloudFloor(640, H);
    o += hatch(wob([[-10, 636], [W + 10, 636], [W + 10, 660], [-10, 660]], { sharp: true }), 0.25);
  }
  return o;
}
// 빨랫줄과 빨래집게
function clothesline(x1, x2, y, sag = 18) { return line([[x1, y], [(x1 + x2) / 2, y + sag], [x2, y]], { sw: 3, color: C.woodD, step: 999 }); }
const peg = (x, y, col = C.mint) => part([[x - 6, y - 14], [x + 6, y - 14], [x + 5, y + 16], [x - 5, y + 16]], col, { sw: 1.4 }) + line([[x - 6, y], [x + 6, y]], { sw: 1, color: C.brass2 });

/* ───────────── 북쪽: 카운터와 뭉게, 커다란 세탁기, 빨래 바구니 ───────────── */
function bgNorth() {
  seed(1711);
  let o = shell();
  // 선반: 개어 둔 구름 수건들 (색이 조금씩 다름 = 날씨)
  o += part([[80, 150], [700, 144], [702, 166], [82, 172]], C.wood, { sw: 2 });
  for (const x of [120, 640]) o += part([[x, 166], [x + 16, 166], [x + 4, 210]], C.wood2, { sw: 1.4 });
  for (let i = 0; i < 6; i++) { const x = 110 + i * 96, c = ['#fbfaf4', '#e8eef8', '#c8d8ec', '#fff1c8', '#e0e4ec', '#f6e0ea'][i]; for (let k = 0; k < 3; k++) o += part([[x, 146 - k * 26], [x + 80, 144 - k * 26], [x + 84, 122 - k * 26], [x + 2, 124 - k * 26]], c, { sw: 1.4 }); }
  // 날씨 표 (그림만): 해·비·바람·눈
  o += part(rectPts(760, 70, 300, 120), C.trim, { sw: 2 });
  const icons = [(x, y) => part(ellPts(x, y, 14, 14, 0, Math.PI * 2, 10), C.sun, { sw: 1.4 }), (x, y) => `<path d="${S([[x, y - 16], [x + 10, y + 2], [x, y + 12], [x - 10, y + 2]], 0.3)}" fill="#7fb0e0" stroke="${INK}" stroke-width="1.4"/>`, (x, y) => `<path d="${O([[x - 14, y], [x + 6, y - 4], [x + 10, y - 12], [x + 2, y - 14]], 0.3)}" fill="none" stroke="#6a8ab0" stroke-width="3"/>`, (x, y) => [0, 1, 2].map((k) => line([[x + Math.cos(k * 1.05) * 14, y + Math.sin(k * 1.05) * 14], [x - Math.cos(k * 1.05) * 14, y - Math.sin(k * 1.05) * 14]], { sw: 2.4, color: '#8ab8e0' })).join('')];
  icons.forEach((f, i) => { o += f(800 + i * 72, 130); });
  // 위쪽 빨랫줄: 작은 구름 양말·손수건이 대롱대롱
  o += clothesline(60, 1540, 250, 22);
  for (const [x, w, h, c] of [[760, 60, 90, '#fbfaf4'], [880, 90, 60, '#fff1c8'], [1010, 60, 96, '#e8eef8'], [1140, 110, 70, '#f6e0ea'], [1300, 60, 90, '#fbfaf4'], [1420, 80, 64, '#cfe4f6']]) {
    o += part([[x, 258], [x + w, 260], [x + w - 4, 258 + h], [x + w * 0.5, 258 + h + 12], [x + 4, 258 + h]], c, { sw: 1.8, heavy: [1, 2] });
    o += peg(x + 10, 262) + peg(x + w - 10, 262);
  }
  // 구름 무게를 다는 저울 (오른쪽 벽)
  o += part([[1380, 360], [1520, 356], [1524, 380], [1382, 384]], C.brass, { sw: 1.8 }) + line([[1450, 384], [1452, 520]], { sw: 6, color: C.brass2 }) + part(ellPts(1452, 420, 34, 34, 0, Math.PI * 2, 14), '#fffaf0', { sw: 1.8 }) + line([[1452, 420], [1470, 400]], { sw: 2.4, color: C.red });
  put('bg/north.svg', W, H, o + '', { id: 1711 });
}
function counter() {
  seed(1712);
  let o = part([[0, 30], [520, 24], [530, 230], [6, 236]], C.wood, { sw: 2.6, heavy: [1, 2], shade: [[400, 24], [530, 24], [530, 236], [400, 236]], shadeCol: 'rgba(80,50,20,0.22)' });
  o += part([[-10, 0], [540, -4], [544, 36], [-6, 40]], C.wood2, { sw: 2.4 });
  for (const x of [40, 200, 360]) o += part(rectPts(x, 70, 130, 130), 'none', { sw: 1.6 });
  // 카운터 위: 작은 종, 구름 비누 상자
  o += part([[380, 0], [420, -46], [460, 0]], C.brass, { sw: 1.6 }) + dot(420, -50, 6, C.brass2);
  o += part(rectPts(60, -40, 120, 40), C.pink, { sw: 1.6 }) + `<path d="${S(cloudPts(120, -20, 30, 12, 10), 0.3)}" fill="${C.cloud}" stroke="${INK}" stroke-width="1"/>`;
  put('props/counter.svg', 560, 240, o, { id: 1712, displace: 1.2, vb: '-10 -60 560 300' });
}
function machineBody() {
  seed(1713);
  // 500x520: 앞문(둥근 유리)이 있는 커다란 드럼 세탁기, 위에 단추판
  let o = `<path d="${S([[10, 506], [490, 506], [480, 518], [20, 518]])}" fill="${INK}" opacity="0.2"/>`;
  o += part([[20, 40], [480, 34], [488, 500], [14, 506]], C.machine, { sw: 2.8, heavy: [1, 2], shade: [[380, 34], [488, 34], [488, 506], [380, 506]], shadeCol: 'rgba(80,80,100,0.18)' });
  o += part([[20, 40], [480, 34], [482, 120], [18, 126]], C.machine2, { sw: 2 });
  // 단추판 그림 (작게)
  for (let i = 0; i < 4; i++) o += part(ellPts(220 + i * 62, 82, 20, 20, 0, Math.PI * 2, 12), ['#cfe4f6', '#dcecf0', '#fff1c8', '#e8f2fa'][i], { sw: 1.6 });
  o += part(ellPts(90, 82, 34, 34, 0, Math.PI * 2, 16), '#e0dccf', { sw: 2 }) + line([[90, 82], [110, 62]], { sw: 3 });
  // 둥근 문 테두리
  o += part(ellPts(250, 310, 160, 160, 0, Math.PI * 2, 28), '#c9c4b6', { sw: 3, heavy: [6, 16] });
  o += part(ellPts(250, 310, 132, 132, 0, Math.PI * 2, 26), '#5a6478', { sw: 2.4 });
  o += part([[400, 290], [430, 286], [432, 336], [402, 340]], '#b8b2a2', { sw: 1.8 });
  put('props/machine.svg', 500, 520, o, { id: 1713, displace: 1.4 });
}
// 세탁기 둥근 유리 안 (빈/회색 구름/빙글빙글 빗구름)
function drum(state) {
  seed(1714);
  let o = `<defs><clipPath id="dr"><circle cx="132" cy="132" r="128"/></clipPath></defs><g clip-path="url(#dr)">`;
  o += `<rect width="264" height="264" fill="#46506a"/>`;
  for (let k = 0; k < 6; k++) o += line([[132, 132], [132 + Math.cos(k) * 160, 132 + Math.sin(k) * 160]], { sw: 1.4, color: '#5a6680', op: 0.6 });
  if (state === 'grey') o += part(cloudPts(132, 170, 90, 60, 14), C.grey, { sw: 2, heavy: [2, 6] }) + [0, 1, 2, 3, 4].map(() => dot(rand(70, 200), rand(130, 210), rand(2, 4), C.grey2)).join('');
  if (state === 'spin') { o += `<g>${part(cloudPts(132, 132, 96, 80, 16), C.rain, { sw: 2 })}</g>`; for (let i = 0; i < 14; i++) o += dot(rand(30, 230), rand(30, 230), rand(4, 10), '#e6f4fa', 0.85); }
  o += '</g>';
  o += `<circle cx="132" cy="132" r="128" fill="#dff1fa" opacity="0.18" stroke="${INK}" stroke-width="2.4"/>`;
  o += line([[60, 70], [100, 40]], { sw: 8, color: '#ffffff', op: 0.5 });
  put(`props/drum_${state}.svg`, 264, 264, o, { id: 1714, displace: 1 });
}
function basket(withCloud) {
  seed(1715);
  let o = `<path d="${S([[10, 196], [220, 196], [210, 206], [20, 206]])}" fill="${INK}" opacity="0.18"/>`;
  if (withCloud) o += part(cloudPts(116, 70, 92, 56, 14), C.grey, { sw: 2.2, heavy: [2, 6], shade: [[30, 80], [210, 80], [210, 140], [30, 140]], shadeCol: 'rgba(60,60,80,0.25)' }) + [0, 1, 2, 3, 4, 5].map(() => dot(rand(50, 180), rand(40, 110), rand(2, 5), C.grey2)).join('');
  o += part([[10, 90], [222, 86], [204, 200], [26, 204]], '#d9b878', { sw: 2.4, heavy: [1, 2] });
  for (let y = 104; y < 200; y += 16) o += line([[16, y], [216, y - 2]], { sw: 1.4, color: '#a8864a' });
  for (let x = 30; x < 212; x += 20) o += line([[x, 90], [x + 2, 200]], { sw: 1, color: '#a8864a', op: 0.6 });
  put(`props/basket${withCloud ? '_cloud' : ''}.svg`, 232, 210, o, { id: 1715, displace: 1.2 });
}

/* ───────────── 동쪽: 둥근 하늘 창, 이불 구름, 도르래 ───────────── */
function bgEast() {
  seed(1721);
  let o = shell();
  // 커다란 둥근 창: 바깥 하늘과 해 (이불 구름이 가린다)
  o += part(ellPts(800, 330, 330, 290, 0, Math.PI * 2, 30), C.trim, { sw: 3, heavy: [4, 14] });
  o += `<defs><clipPath id="win"><ellipse cx="800" cy="330" rx="300" ry="262"/></clipPath></defs><g clip-path="url(#win)"><rect x="480" y="60" width="640" height="540" fill="${C.sky}"/>`;
  for (let i = 0; i < 6; i++) o += `<path d="${S(cloudPts(rand(520, 1080), rand(380, 560), rand(60, 110), rand(24, 40), 12), 1)}" fill="${C.sky2}"/>`;
  o += part(ellPts(800, 300, 80, 80, 0, Math.PI * 2, 18), C.sun, { sw: 2.4, heavy: [4, 10] });
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; o += line([[800 + Math.cos(a) * 98, 300 + Math.sin(a) * 98], [800 + Math.cos(a) * 130, 300 + Math.sin(a) * 130]], { sw: 5, color: C.sun2 }); }
  o += strokeFace(800, 300);
  o += '</g>';
  o += line([[800, 40], [800, 620]], { sw: 14, color: C.trim }) + line([[500, 330], [1100, 330]], { sw: 14, color: C.trim });
  // 빨랫줄 (창 앞을 가로지름) + 오른쪽 도르래 기둥
  o += clothesline(180, 1360, 70, 10);
  o += part([[1330, 40], [1360, 40], [1366, 620], [1336, 620]], C.wood2, { sw: 2.2, heavy: [1, 2] });
  o += part(ellPts(1348, 70, 34, 34, 0, Math.PI * 2, 16), C.brass, { sw: 2.2 }) + part(ellPts(1348, 70, 10, 10, 0, Math.PI * 2, 10), C.brass2, { sw: 1.4 });
  // 손잡이 꽂는 구멍 (네모 홈)
  o += part(ellPts(1348, 380, 40, 40, 0, Math.PI * 2, 16), C.brass, { sw: 2.2, heavy: [3, 8] }) + part(rectPts(1338, 370, 20, 20), '#3a2a1a', { sw: 1.4 });
  o += line([[1348, 104], [1348, 340]], { sw: 3, color: C.woodD });
  // 왼쪽: 다리미판과 구름 김
  o += part([[100, 540], [420, 520], [440, 540], [120, 560]], C.mint, { sw: 2.2 }) + line([[160, 556], [200, 640]], { sw: 5, color: C.woodD }) + line([[380, 540], [340, 640]], { sw: 5, color: C.woodD });
  o += part([[260, 516], [360, 516], [372, 540], [250, 540]], '#d8d4ca', { sw: 1.8 }) + part([[290, 516], [300, 496], [330, 496], [340, 516]], C.red, { sw: 1.4 });
  for (let i = 0; i < 3; i++) o += `<path d="${S(cloudPts(300 + i * 30, 470 - i * 30, 18 + i * 6, 10 + i * 4, 10), 0.5)}" fill="${C.cloud}" opacity="0.8" stroke="${INK}" stroke-width="1" stroke-opacity="0.4"/>`;
  put('bg/east.svg', W, H, o, { id: 1721 });
}
function strokeFace(x, y) {
  // 해님 얼굴 (잠깐 졸린 듯 눈을 감은)
  return `<path d="${O([[x - 34, y - 6], [x - 22, y + 2], [x - 10, y - 6]], 0.2)}" fill="none" stroke="${INK}" stroke-width="3"/><path d="${O([[x + 10, y - 6], [x + 22, y + 2], [x + 34, y - 6]], 0.2)}" fill="none" stroke="${INK}" stroke-width="3"/><path d="${O([[x - 16, y + 26], [x, y + 36], [x + 16, y + 26]], 0.2)}" fill="none" stroke="${INK}" stroke-width="3"/>`;
}
// 창을 가린 커다란 이불 구름 (빨랫줄에 널림) / 한쪽으로 걷힌 모습
function blanket(open) {
  seed(1722);
  let o = '';
  if (!open) {
    const pts = [[0, 20], [140, 10], [300, 24], [460, 8], [640, 22], [800, 12], [880, 30], [886, 300], [870, 520], [760, 560], [600, 540], [440, 570], [280, 548], [120, 566], [10, 530], [-6, 300]];
    o += part(pts, C.cloud2, { sw: 2.6, heavy: [7, 12], shade: [[0, 360], [880, 360], [880, 580], [0, 580]], shadeCol: C.cloudS, hatch: false });
    for (let k = 0; k < 30; k++) { const x = rand(40, 840), y = rand(60, 520); o += `<path d="${O([[x - 12, y], [x - 4, y - 8], [x + 6, y - 6], [x + 10, y + 2]], 0.2)}" fill="none" stroke="#a8b0c8" stroke-width="1.4" opacity="0.6"/>`; }
    for (const x of [60, 300, 560, 820]) o += peg(x, 24);
  } else {
    const pts = [[700, 20], [820, 12], [884, 30], [886, 300], [870, 540], [790, 560], [720, 520], [690, 300]];
    o += part(pts, C.cloud2, { sw: 2.6, heavy: [2, 5], shade: [[690, 360], [880, 360], [880, 580], [690, 580]], shadeCol: C.cloudS, hatch: false });
    for (let k = 0; k < 8; k++) o += line([[700 + k * 22, 40], [710 + k * 22, 520]], { sw: 1.4, color: '#a8b0c8', op: 0.6 });
    for (const x of [720, 820]) o += peg(x, 24);
  }
  put(`props/blanket${open ? '_open' : ''}.svg`, 900, 600, o, { id: 1722, displace: 1.6, vb: '-10 0 900 600' });
}
function pulleyHandle() {
  seed(1723);
  let o = part([[40, 50], [60, 50], [62, 70], [38, 70]], C.brass2, { sw: 1.4 });
  o += line([[50, 60], [120, 60]], { sw: 10, color: C.brass2, step: 999 }) + line([[50, 60], [120, 60]], { sw: 5, color: C.brass, step: 999 });
  o += part([[112, 40], [132, 40], [136, 110], [114, 112]], C.red, { sw: 1.8, heavy: [1, 2] });
  put('props/handle_in.svg', 160, 130, o, { id: 1723, displace: 0.8 });
}
// 햇빛 (창에서 방 안으로 쏟아지는 빛)
function sunbeams(dir) {
  seed(1724);
  let o = '<g filter="url(#blur)">';
  if (dir === 'east') { o += `<ellipse cx="800" cy="330" rx="360" ry="320" fill="#fff6c8" opacity="0.35"/>`; for (let i = 0; i < 5; i++) o += `<path d="M${640 + i * 80} 340 L${560 + i * 120} 900 L${640 + i * 120} 900Z" fill="#fff3c0" opacity="0.25"/>`; }
  else for (let i = 0; i < 5; i++) { const x = -100 + i * 140; o += `<path d="M${x} 0 L${x + 120} 0 L${x + 700} 900 L${x + 520} 900Z" fill="#fff3c0" opacity="0.2"/>`; }
  o += '</g>';
  for (let i = 0; i < 24; i++) o += dot(rand(200, 1400), rand(60, 860), rand(1.2, 3), '#fffbe6', 0.8);
  put(`bg/sun_${dir}.svg`, W, H, o, { id: 1724, displace: 0.5 });
}

/* ───────────── 남쪽: 세탁소 안쪽 (널어 둔 구름 옷, 무지개 손님 안내판) ───────────── */
function bgSouth() {
  seed(1731);
  let o = shell();
  o += clothesline(60, 1540, 120, 26);
  // 널린 구름 옷들 (셔츠, 양말, 원피스 모양의 구름)
  const items = [[180, '#fbfaf4'], [420, '#e8eef8'], [1180, '#fff1c8'], [1420, '#f6e0ea']];
  for (const [x, c] of items) {
    o += part([[x - 70, 140], [x - 30, 126], [x + 30, 126], [x + 70, 140], [x + 90, 200], [x + 50, 210], [x + 50, 330], [x - 50, 330], [x - 50, 210], [x - 90, 200]], c, { sw: 2.2, heavy: [4, 7], shade: [[x + 10, 130], [x + 90, 130], [x + 90, 340], [x + 10, 340]], shadeCol: C.cloudS, hatch: false });
    for (let k = 0; k < 6; k++) o += `<path d="${O([[x - 40 + k * 14, 240], [x - 34 + k * 14, 232], [x - 26 + k * 14, 238]], 0.2)}" fill="none" stroke="#a8b0c8" stroke-width="1.2"/>`;
    o += peg(x - 30, 134) + peg(x + 30, 134);
  }
  // 무지개 손님 안내판 (그림: 해님을 등지고 선 사람, 앞에 무지개)
  o += part([[620, 200], [980, 192], [986, 470], [626, 476]], C.trim, { sw: 2.6, heavy: [1, 2] });
  o += part([[640, 218], [966, 212], [970, 456], [644, 460]], '#fffaf0', { sw: 1.6 });
  o += part(ellPts(920, 270, 26, 26, 0, Math.PI * 2, 12), C.sun, { sw: 1.6 });
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += line([[920 + Math.cos(a) * 32, 270 + Math.sin(a) * 32], [920 + Math.cos(a) * 42, 270 + Math.sin(a) * 42]], { sw: 2.4, color: C.sun2 }); }
  ['#e86a6a', '#f0b050', '#f0e070', '#7ac08a', '#6aa0e0', '#9a7ad0'].forEach((c, i) => { o += `<path d="${O(ellPts(730, 420, 90 - i * 9, 120 - i * 10, Math.PI, Math.PI * 2, 16), 0.3)}" fill="none" stroke="${c}" stroke-width="8"/>`; });
  // 사람 뒷모습 (해를 등지고 무지개를 본다)
  o += part([[826, 440], [826, 380], [840, 360], [860, 360], [874, 380], [874, 440]], '#7a8ab0', { sw: 1.6 }) + part(ellPts(850, 344, 14, 14, 0, Math.PI * 2, 10), '#5a4a3a', { sw: 1.4 });
  o += `<path d="M880 300 L866 330" stroke="${INK}" stroke-width="2.4"/><path d="M866 330 l2 -12 l8 8z" fill="${INK}"/>`;
  // 아래: 세제통들과 구름 빨래 바구니 더미
  for (let i = 0; i < 4; i++) o += part([[120 + i * 90, 600], [190 + i * 90, 600], [186 + i * 90, 500], [124 + i * 90, 500]], [C.mint, C.pink, '#cfe4f6', '#fff1c8'][i], { sw: 1.8, heavy: [2, 3] });
  o += cloud(1300, 560, 160, 60) + cloud(1240, 520, 90, 40, '#f1f2f6');
  put('bg/south.svg', W, H, o, { id: 1731 });
}

/* ───────────── 서쪽: 구름 끝 정류장 (바깥), 빨랫줄, 분실물 바구니 ───────────── */
function bgWest() {
  seed(1741);
  // 열린 벽 너머 하늘 (해를 등진 쪽)
  let o = fill(rect(-10, -10, W + 20, H + 20, { amp: 0 }), C.sky);
  for (let i = 0; i < 9; i++) o += `<path d="${S(cloudPts(rand(0, 1600), rand(380, 620), rand(80, 160), rand(30, 50), 12), 1)}" fill="${C.sky2}"/>`;
  // 문틀 (세탁소 벽이 양쪽에만)
  o += part([[-10, -10], [180, -10], [180, 660], [-10, 660]], C.wall, { sw: 2.4 }) + part([[1420, -10], [1610, -10], [1610, 660], [1420, 660]], C.wall, { sw: 2.4 });
  for (const x of [180, 1420]) o += part([[x - 20, -10], [x + 20, -10], [x + 20, 660], [x - 20, 660]], C.trim, { sw: 2 });
  // 구름 끝 마루 (바깥 발판)
  o += fill(wob([[-10, 640], [W + 10, 640], [W + 10, H + 10], [-10, H + 10]], { sharp: true }), C.cloud2);
  o += cloudFloor(644, H);
  // 빨랫줄 기둥 두 개 + 줄
  for (const x of [420, 1180]) o += part([[x - 14, 240], [x + 14, 240], [x + 16, 690], [x - 16, 690]], C.wood2, { sw: 2.2, heavy: [1, 2] }) + part([[x - 40, 236], [x + 40, 236], [x + 40, 250], [x - 40, 250]], C.wood, { sw: 1.6 });
  o += clothesline(420, 1180, 250, 30);
  // 정류장 표지판 (무지개 그림)
  o += line([[1300, 300], [1302, 680]], { sw: 10, color: C.woodD });
  o += part([[1230, 230], [1380, 226], [1384, 330], [1234, 334]], C.trim, { sw: 2.2 });
  ['#e86a6a', '#f0b050', '#7ac08a', '#6aa0e0'].forEach((c, i) => { o += `<path d="${O(ellPts(1308, 318, 54 - i * 10, 60 - i * 10, Math.PI, Math.PI * 2, 12), 0.3)}" fill="none" stroke="${c}" stroke-width="6"/>`; });
  // 분실물 바구니 (왼쪽 앞)
  o += part([[230, 560], [520, 552], [500, 720], [250, 728]], '#c9a06a', { sw: 2.6, heavy: [1, 2] });
  for (let y = 576; y < 720; y += 18) o += line([[236, y], [512, y - 4]], { sw: 1.4, color: '#9a7440' });
  o += part(cloudPts(300, 548, 50, 22, 10), '#e8eef8', { sw: 1.6 }) + part([[380, 520], [460, 512], [470, 556], [390, 560]], '#c46a5a', { sw: 1.6 }) + part([[420, 520], [436, 470], [452, 520]], C.brass, { sw: 1.4 });
  o += part([[250, 600], [340, 598], [342, 640], [252, 642]], C.trim, { sw: 1.4 }) + line([[264, 616], [326, 614]], { sw: 2, op: 0.5 }) + line([[264, 628], [310, 627]], { sw: 2, op: 0.5 });
  put('bg/west.svg', W, H, o, { id: 1741 });
}
// 빨랫줄에 널린 빗구름 (아래로 빗줄기)
function rainHung() {
  seed(1742);
  let o = '';
  for (let i = 0; i < 22; i++) { const x = rand(60, 520); o += line([[x, 180], [x - 10, 300 + rand(0, 60)]], { sw: 2.4, color: '#7fb0e0', op: 0.75 }); }
  const rc = []; const bumps = [[60, 150, 70], [140, 90, 80], [250, 60, 90], [360, 76, 84], [460, 110, 74], [520, 160, 54]];
  for (let i = 0; i <= 40; i++) { const t = i / 40; const x = 40 + t * 500; let y = 180; for (const [bx, by, br] of bumps) { const d = Math.abs(x - bx); if (d < br) y = Math.min(y, by + 40 - Math.sqrt(br * br - d * d) * 0.9); } rc.push([x, y]); }
  rc.push([540, 200], [300, 214], [40, 200]);
  o += part(rc, C.rain, { sw: 2.6, heavy: [10, 30], shade: [[40, 150], [540, 150], [540, 220], [40, 220]], shadeCol: 'rgba(20,30,70,0.3)', light: [[120, 100], [220, 50], [300, 60], [200, 100]] });
  for (const x of [160, 420]) o += peg(x, 40, C.pink);
  put('props/rain_hung.svg', 580, 380, o, { id: 1742, displace: 1.4 });
}
function rainbow() {
  seed(1743);
  let o = `<defs><linearGradient id="fadeR" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#fff"/><stop offset="0.95" stop-color="#000"/></linearGradient><mask id="mR"><rect width="1400" height="660" fill="url(#fadeR)"/></mask></defs><g opacity="0.92" mask="url(#mR)">`;
  ['#e86a6a', '#f0a050', '#f0e070', '#7ac08a', '#6aa0e0', '#9a7ad0'].forEach((c, i) => { o += `<path d="${O(ellPts(700, 640, 620 - i * 34, 520 - i * 34, Math.PI, Math.PI * 2, 40), 1)}" fill="none" stroke="${c}" stroke-width="32"/>`; });
  o += `<path d="${O(ellPts(700, 640, 640, 540, Math.PI, Math.PI * 2, 40), 1)}" fill="none" stroke="${INK}" stroke-width="2"/><path d="${O(ellPts(700, 640, 434, 334, Math.PI, Math.PI * 2, 40), 1)}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  o += '</g><g filter="url(#blur)">';
  for (let i = 0; i < 6; i++) o += dot(rand(100, 1300), rand(80, 600), rand(6, 12), '#ffffff', 0.6);
  o += '</g>';
  put('props/rainbow.svg', 1400, 660, o, { id: 1743, displace: 1.2 });
}
function sheep(state) { seed(1750); put(`props/sheep_${state}.svg`, 300, 300, sheepArt(state), { id: 1750, displace: 0.8 }); }

/* ───────────── 확대 화면 ───────────── */
function zoomLost() {
  seed(1761);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), '#c9a06a');
  for (let y = 0; y < H; y += 36) o += line([[-20, y], [1620, y + rand(-4, 4)]], { sw: 3, color: '#9a7440', op: 0.7 });
  for (let x = 0; x < W; x += 48) o += line([[x, -20], [x + rand(-6, 6), 920]], { sw: 1.4, color: '#9a7440', op: 0.4 });
  o += part([[80, 80], [1520, 70], [1530, 830], [70, 840]], '#7a5a34', { sw: 3 });
  o += part([[120, 120], [1480, 110], [1490, 790], [110, 800]], '#e8dcc0', { sw: 2 });
  // 잡동사니: 우산, 손수건, 단추, 모자
  o += part([[180, 640], [420, 600], [440, 660], [200, 700]], '#c46a5a', { sw: 2 }) + part([[1200, 640], [1420, 620], [1430, 720], [1210, 740]], '#9fd8c8', { sw: 2 });
  for (let i = 0; i < 6; i++) o += part(ellPts(rand(200, 1400), rand(200, 760), 16, 16, 0, Math.PI * 2, 10), pick([C.brass, C.pink, '#cfe4f6']), { sw: 1.6 });
  put('zoom/lost.svg', W, H, o, { id: 1761, displace: 2.4 });
}
function zoomMachine() {
  seed(1762);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), C.wall);
  o += part([[180, 80], [1420, 70], [1430, 860], [170, 870]], C.machine, { sw: 3, heavy: [1, 2], shade: [[1200, 70], [1430, 70], [1430, 870], [1200, 870]], shadeCol: 'rgba(80,80,100,0.15)' });
  // 둥근 문 (왼쪽) — 안쪽은 소품(drum)으로
  o += part(ellPts(520, 470, 300, 300, 0, Math.PI * 2, 32), '#c9c4b6', { sw: 3.4, heavy: [6, 18] });
  o += part(ellPts(520, 470, 266, 266, 0, Math.PI * 2, 30), '#5a6478', { sw: 2.6 });
  // 단추판 (오른쪽): 네 단추 자리 + 위 "누른 순서" 불빛 세 칸
  o += part([[900, 160], [1340, 156], [1346, 800], [906, 806]], C.machine2, { sw: 2.6 });
  for (let i = 0; i < 3; i++) o += part(ellPts(1000 + i * 120, 220, 22, 22, 0, Math.PI * 2, 12), '#e8e4d8', { sw: 1.8 });
  put('zoom/machine.svg', W, H, o, { id: 1762, displace: 2.4 });
}
// 세탁기 단추 (물방울, 회오리, 해, 눈송이) — 160x160, 켜진 모습
function machineButton(kind, lit) {
  seed(1763);
  let o = part(ellPts(80, 80, 72, 72, 0, Math.PI * 2, 20), lit ? '#fff3c4' : '#f4f1ea', { sw: 3, heavy: [2, 8] });
  if (lit) o += `<circle cx="80" cy="80" r="76" fill="#ffe9a8" opacity="0.5" filter="url(#blur)"/>`;
  if (kind === 'drop') o += `<path d="${S([[80, 26], [112, 84], [102, 118], [80, 128], [58, 118], [48, 84]], 0.4)}" fill="#7fb0e0" stroke="${INK}" stroke-width="2.2"/>` + line([[66, 90], [70, 108]], { sw: 4, color: '#ffffff', op: 0.7 });
  if (kind === 'wind') o += `<path d="${O([[30, 80], [96, 76], [118, 58], [104, 40], [86, 50]], 0.4)}" fill="none" stroke="#5a7ab0" stroke-width="7" stroke-linecap="round"/><path d="${O([[40, 104], [110, 102], [124, 118], [112, 132]], 0.4)}" fill="none" stroke="#5a7ab0" stroke-width="6" stroke-linecap="round"/>`;
  if (kind === 'sun') { o += part(ellPts(80, 80, 26, 26, 0, Math.PI * 2, 12), C.sun, { sw: 2 }); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; o += line([[80 + Math.cos(a) * 34, 80 + Math.sin(a) * 34], [80 + Math.cos(a) * 48, 80 + Math.sin(a) * 48]], { sw: 4, color: C.sun2 }); } }
  if (kind === 'snow') for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; o += line([[80 + Math.cos(a) * 44, 80 + Math.sin(a) * 44], [80 - Math.cos(a) * 44, 80 - Math.sin(a) * 44]], { sw: 5, color: '#8ab8e0' }); }
  put(`zoom/btn_${kind}${lit ? '_on' : ''}.svg`, 160, 160, o, { id: 1763, displace: 1 });
}
// 회색 구름의 세탁 꼬리표: 돋보기로 보면 세 그림이 순서대로 (물방울 → 회오리 → 해)
function zoomLabel(clear) {
  seed(1764);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), C.grey);
  for (let i = 0; i < 40; i++) o += `<path d="${S(cloudPts(rand(0, 1600), rand(0, 900), rand(60, 140), rand(30, 70), 10), 2)}" fill="${pick([C.grey, C.grey2, '#a8acb8'])}" opacity="0.6"/>`;
  o += part([[440, 160], [1160, 150], [1180, 760], [430, 770]], '#fffaf0', { sw: 3, heavy: [1, 2] });
  o += part(ellPts(800, 210, 18, 18, 0, Math.PI * 2, 10), C.grey, { sw: 2 });
  if (clear) {
    const ic = { drop: (x, y) => `<path d="${S([[x, y - 70], [x + 44, y + 6], [x + 30, y + 54], [x, y + 66], [x - 30, y + 54], [x - 44, y + 6]], 0.5)}" fill="#7fb0e0" stroke="${INK}" stroke-width="3"/>`, wind: (x, y) => `<path d="${O([[x - 60, y], [x + 30, y - 6], [x + 58, y - 30], [x + 40, y - 54], [x + 16, y - 40]], 0.5)}" fill="none" stroke="#5a7ab0" stroke-width="10" stroke-linecap="round"/><path d="${O([[x - 50, y + 34], [x + 44, y + 30], [x + 62, y + 52]], 0.5)}" fill="none" stroke="#5a7ab0" stroke-width="9" stroke-linecap="round"/>`, sun: (x, y) => part(ellPts(x, y, 36, 36, 0, Math.PI * 2, 14), C.sun, { sw: 2.6 }) + [...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return line([[x + Math.cos(a) * 46, y + Math.sin(a) * 46], [x + Math.cos(a) * 64, y + Math.sin(a) * 64]], { sw: 5, color: C.sun2 }); }).join('') };
    ['drop', 'wind', 'sun'].forEach((k, i) => { const x = 560 + i * 240, y = 460; o += ic[k](x, y); if (i < 2) o += `<path d="${O([[x + 80, y], [x + 150, y]], 0.4)}" stroke="${INK}" stroke-width="5" fill="none"/><path d="M${x + 150} ${y - 14} L${x + 174} ${y} L${x + 150} ${y + 14}Z" fill="${INK}"/>`; o += `<g>${[...Array(i + 1)].map((_, d) => dot(x - 12 * i + d * 24, y + 120, 8, INK)).join('')}</g>`; });
  } else {
    o += '<g filter="url(#blur)">';
    for (let i = 0; i < 3; i++) o += `<ellipse cx="${560 + i * 240}" cy="460" rx="40" ry="44" fill="${['#7fb0e0', '#5a7ab0', C.sun][i]}" opacity="0.5"/>`;
    o += '</g>';
    for (let i = 0; i < 9; i++) o += line([[500 + i * 70, 330], [520 + i * 70, 336]], { sw: 2, op: 0.4 });
  }
  put(`zoom/label${clear ? '_clear' : ''}.svg`, W, H, o, { id: 1764, displace: 2 });
}

/* ───────────── 아이템 ───────────── */
function items() {
  seed(1770);
  const it = (n, b) => put(`items/${n}.svg`, 160, 160, b, { id: 1770, displace: 1 });
  it('magnifier', part(ellPts(66, 64, 44, 44, 0, Math.PI * 2, 18), '#dff1fa', { sw: 3, heavy: [2, 8], light: [[40, 50], [56, 36], [48, 62]] }) + `<circle cx="66" cy="64" r="44" fill="none" stroke="${C.brass}" stroke-width="9"/>` + line([[98, 96], [140, 138]], { sw: 16, color: C.woodD, step: 999 }) + line([[98, 96], [140, 138]], { sw: 10, color: C.wood2, step: 999 }));
  it('crank', line([[30, 120], [90, 60]], { sw: 14, color: C.brass2, step: 999 }) + line([[30, 120], [90, 60]], { sw: 8, color: C.brass, step: 999 }) + part([[80, 30], [104, 30], [110, 80], [84, 82]], C.red, { sw: 2, heavy: [1, 2] }) + part(rectPts(20, 112, 24, 24), '#5a4a3a', { sw: 1.6 }));
  // 봄이의 벙어리장갑: 손등에 꽃 자수 (글자 대신)
  it('mitten', part([[44, 140], [40, 70], [52, 30], [84, 20], [110, 36], [114, 80], [126, 64], [140, 74], [124, 110], [112, 140]], '#e98a8a', { sw: 2.4, heavy: [5, 9], shade: [[90, 20], [140, 20], [140, 140], [90, 140]], shadeCol: 'rgba(120,30,30,0.2)' }) + part([[40, 124], [114, 124], [114, 146], [42, 146]], '#f4ecd8', { sw: 1.8 }) + [0, 1, 2, 3, 4].map((i) => part(ellPts(78 + Math.cos(i * 1.256) * 10, 76 + Math.sin(i * 1.256) * 10, 7, 7, 0, Math.PI * 2, 8), '#fff6c8', { sw: 1 })).join('') + dot(78, 76, 4, C.sun2));
  it('greycloud', part(cloudPts(80, 80, 66, 44, 14), C.grey, { sw: 2.4, heavy: [2, 6], shade: [[14, 90], [146, 90], [146, 130], [14, 130]], shadeCol: 'rgba(60,60,80,0.25)' }) + part([[110, 100], [138, 96], [140, 124], [112, 126]], '#fffaf0', { sw: 1.4 }) + [0, 1, 2, 3].map(() => dot(rand(40, 110), rand(60, 100), rand(2, 4), C.grey2)).join(''));
  it('raincloud', [0, 1, 2, 3, 4, 5].map((i) => line([[40 + i * 16, 110], [34 + i * 16, 146]], { sw: 3, color: '#7fb0e0' })).join('') + part(cloudPts(80, 72, 66, 42, 14), C.rain, { sw: 2.4, heavy: [2, 6], light: [[40, 60], [70, 44], [60, 70]] }));
}

/* ───────────── 앞쪽 틀: 구름 속 (가장자리마다 흐린 뭉게구름) ───────────── */
function frame() {
  seed(1780);
  let o = '<g filter="url(#blur)">';
  for (const [x, y, rx, ry] of [[-40, 900, 260, 120], [200, 930, 220, 80], [1640, 900, 260, 120], [1400, 940, 220, 80], [-60, 40, 200, 110], [1660, 30, 200, 110], [-40, 460, 90, 200], [1650, 480, 80, 180]]) o += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#ffffff" opacity="0.85"/>`;
  o += '</g>';
  put('bg/frame.svg', W, H, o, { id: 1780, displace: 1 });
}

bgNorth(); counter(); machineBody(); drum('empty'); drum('grey'); drum('spin'); basket(true); basket(false);
bgEast(); blanket(false); blanket(true); pulleyHandle(); sunbeams('east'); sunbeams('west');
bgSouth(); bgWest(); rainHung(); rainbow(); sheep('worried'); sheep('happy');
zoomLost(); zoomMachine(); ['drop', 'wind', 'sun', 'snow'].forEach((k) => { machineButton(k, false); machineButton(k, true); }); zoomLabel(false); zoomLabel(true);
items(); frame();
console.log('laundry assets written, ~' + Math.round(total / 1024) + 'KB');
