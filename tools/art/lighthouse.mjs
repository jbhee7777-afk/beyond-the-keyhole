// 8장 「잉크 등대」 그래픽 에셋 생성기
// node tools/art/lighthouse.mjs  → assets/rooms/lighthouse/**
// 분위기: 고요한 밤바다 위 둥근 등대 꼭대기 방. 잉크빛 남색, 놋쇠, 따뜻한 나무. 등불이 켜지면 금빛·초록 빛이 돈다.
import { seed, rand, pick, INK, wob, rect, rectPts, ellPts, fill, line, hatch, svg } from './ink.mjs';
import { part, S, O, penguinArt } from './chars.mjs';
import { barrel, crate, rock, splat } from './props.mjs';

const OUT = new URL('../../assets/rooms/lighthouse/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  night: '#18213a', night2: '#22305a', sea: '#1d3050', sea2: '#2a4470', star: '#fff6d0', moon: '#f4ecc8',
  wall: '#3e4f78', wall2: '#33426a', plank: '#8a6040', plank2: '#6e4a30', plankD: '#4a3020', brass: '#d4a649', brass2: '#9d7428', brassL: '#f0cf7c',
  lamp: '#f2c46b', glass: '#cfe6ee', green: '#6ad08a', green2: '#3a9a5a', red: '#d9574f', blue: '#4a7ad0', yellow: '#f0d040', black: '#262630',
  paper: '#f4ecd8', rope: '#c9a46a',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;

// 밤하늘 + 바다 (창 밖)
function nightSky(x, y, w, h, { sea = true, station = false } = {}) {
  let o = fill(rect(x, y, w, h, { amp: 0 }), C.night);
  for (let i = 0; i < Math.floor(w * h / 9000); i++) o += dot(x + rand(0, w), y + rand(0, h * 0.6), rand(0.8, 2.2), C.star, rand(0.5, 1));
  if (sea) {
    const sy = y + h * 0.62;
    o += fill(rect(x, sy, w, h - (sy - y), { amp: 0 }), C.sea);
    for (let k = 0; k < 14; k++) { const yy = sy + 8 + k * k * 1.6; o += line([[x, yy], [x + w * 0.3, yy + rand(-3, 3)], [x + w * 0.7, yy + rand(-3, 3)], [x + w, yy]], { sw: 1.2 + k * 0.2, color: C.sea2, op: 0.7, step: 999 }); }
    if (station) o += part([[x + w * 0.72, sy - 30], [x + w * 0.86, sy - 30], [x + w * 0.86, sy], [x + w * 0.72, sy]], '#2a3048', { sw: 1.4 }) + dot(x + w * 0.79, sy - 40, 5, C.green) + `<circle cx="${x + w * 0.79}" cy="${sy - 40}" r="14" fill="${C.green}" opacity="0.3"/>`;
  }
  return o;
}
/* ───────────── 둥근 방 껍데기: 휘어진 벽 + 둥근 나무 마루 ───────────── */
function shell({ windows = [] } = {}) {
  let o = fill(rect(-10, -10, W + 20, H + 20, { amp: 0 }), C.wall2);
  // 휘어진 벽 (가운데가 멀고 양옆이 가까운 원통 안쪽)
  o += part([[-10, -10], [W + 10, -10], [W + 10, 700], [1300, 640], [800, 610], [300, 640], [-10, 700]], C.wall, { sw: 2.4 });
  for (const [x, y, w, h, opt] of windows) {
    o += nightSky(x, y, w, h, opt || {});
    o += part(rectPts(x - 12, y - 12, w + 24, h + 24), 'none', { sw: 3 }) + `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" fill="none" stroke="${C.plank}" stroke-width="16"/>`;
    o += line([[x + w / 2, y], [x + w / 2, y + h]], { sw: 8, color: C.plank }) + line([[x, y + h * 0.45], [x + w, y + h * 0.45]], { sw: 8, color: C.plank });
  }
  // 벽 기둥 (원통이라 바깥으로 갈수록 넓게)
  for (const [x, w] of [[40, 70], [420, 40], [1140, 40], [1490, 70]]) o += part([[x, -10], [x + w, -10], [x + w, 640], [x, 660]], C.plank2, { sw: 2, heavy: [1, 2] });
  // 둥근 마루: 바닥 판자가 원을 따라 휜다
  o += part([[-10, 700], [300, 640], [800, 610], [1300, 640], [W + 10, 700], [W + 10, H + 10], [-10, H + 10]], C.plank, { sw: 2.4 });
  for (let k = 1; k < 7; k++) { const t = k / 7; const yC = 610 + t * 300, yE = 700 + t * 260; o += line([[-10, yE], [300, yC + (yE - yC) * 0.4], [800, yC], [1300, yC + (yE - yC) * 0.4], [W + 10, yE]], { sw: 1.4 + t, color: C.plankD, op: 0.6, step: 999 }); }
  for (let k = 0; k < 14; k++) { const a = -0.9 + k * 0.13; o += line([[800 + Math.sin(a) * 500, 612 + Math.abs(Math.sin(a)) * 30], [800 + Math.sin(a) * 1400, 910]], { sw: 1, color: C.plankD, op: 0.4 }); }
  o += hatch(wob([[-10, 700], [300, 640], [800, 610], [1300, 640], [W + 10, 700], [W + 10, 730], [-10, 730]], { sharp: true }), 0.35);
  // 천장 대들보
  o += part([[-10, -10], [W + 10, -10], [W + 10, 40], [-10, 40]], C.plankD, { sw: 2 });
  return o;
}

/* ───────────── 북쪽: 커다란 등불 렌즈, 잉크 통, 스위치 손잡이 ───────────── */
function bgNorth() {
  seed(1811);
  let o = shell({ windows: [[110, 90, 280, 420], [1210, 90, 260, 420]] });
  // 받침대
  o += part([[540, 640], [1060, 640], [1062, 626], [1044, 618], [1044, 572], [1056, 566], [1050, 556], [550, 556], [544, 566], [556, 572], [556, 618], [538, 626]], C.plank2, { sw: 2.6, heavy: [0, 3], shade: [[900, 540], [1080, 540], [1080, 650], [900, 650]], shadeCol: 'rgba(30,15,5,0.3)' });
  for (const x of [600, 700, 800, 900, 1000]) o += part([[x - 34, 584], [x + 34, 584], [x + 34, 610], [x - 34, 610]], C.plank, { sw: 1.4 });
  o += part([[586, 558], [1014, 558], [1018, 546], [1000, 524], [600, 524], [582, 546]], C.brass2, { sw: 2.2, light: [[600, 522], [1000, 522], [1004, 534], [596, 534]] });
  for (let x = 610; x <= 990; x += 38) o += dot(x, 548, 3, C.brassL);
  // 계단형 렌즈 (프레넬): 겹겹 고리
  o += part([[620, 520], [600, 300], [640, 160], [800, 100], [960, 160], [1000, 300], [980, 520]], C.glass, { sw: 3, heavy: [4, 6], shade: [[860, 100], [1000, 100], [1000, 520], [860, 520]], shadeCol: 'rgba(30,50,90,0.25)' });
  for (let k = 0; k < 7; k++) { const y = 160 + k * 52; o += line([[612 + Math.abs(3 - k) * 6, y], [800, y + 8], [988 - Math.abs(3 - k) * 6, y]], { sw: 2.4, color: '#8fb0c0', step: 999 }); o += line([[630, y + 10], [970, y + 18]], { sw: 1, color: '#ffffff', op: 0.5, step: 999 }); }
  o += part([[640, 160], [800, 100], [960, 160], [900, 120], [700, 120]], C.brass, { sw: 2 });
  o += part(ellPts(800, 330, 46, 60, 0, Math.PI * 2, 16), '#7a7060', { sw: 2 });
  // 잉크 통 (빈 유리병, 렌즈와 관으로 이어짐)
  o += part([[430, 640], [540, 640], [536, 470], [512, 440], [460, 440], [434, 470]], C.glass, { sw: 2.4, heavy: [0, 1] });
  o += `<path d="${S([[436, 630], [536, 630], [536, 640], [436, 640]], 0.3)}" fill="${C.black}" opacity="0.5"/>`;
  o += line([[486, 440], [486, 400], [600, 380]], { sw: 10, color: C.brass2, step: 999 }) + line([[486, 440], [486, 400], [600, 380]], { sw: 5, color: C.brass, step: 999 });
  // 스위치 손잡이 (오른쪽)
  o += part([[1090, 640], [1180, 640], [1176, 520], [1094, 520]], C.brass2, { sw: 2.2, heavy: [0, 1] });
  o += line([[1135, 520], [1170, 420]], { sw: 12, color: C.plankD, step: 999 }) + part(ellPts(1172, 412, 18, 18, 0, Math.PI * 2, 12), C.red, { sw: 1.8 });
  // 벽의 놋쇠 기압계
  o += part(ellPts(800, 36, 0, 0, 0, Math.PI * 2, 4), C.brass, { sw: 0 });
  put('bg/north.svg', W, H, o, { id: 1811 });
}
function lensInk() {
  seed(1812);
  let o = '';
  for (const [x, y, r] of [[90, 80, 34], [250, 60, 26], [180, 190, 40], [310, 200, 22], [70, 280, 24], [240, 320, 30], [130, 120, 14], [320, 110, 16], [200, 370, 14]]) o += splat({ cx: x, cy: y, r, col: '#1c1c28', op: 0.88, drips: r > 20 ? 2 : 1 });
  put('props/lens_ink.svg', 380, 420, o, { id: 1812, displace: 1.4 });
}
function reservoirGreen() {
  seed(1813);
  const o = `<path d="${S([[6, 196], [102, 196], [100, 46], [80, 20], [30, 20], [8, 46]], 0.4)}" fill="${C.green}" opacity="0.85"/>` + line([[20, 60], [24, 180]], { sw: 6, color: '#ffffff', op: 0.5 }) + [0, 1, 2, 3].map(() => dot(rand(20, 90), rand(60, 180), rand(3, 6), '#d8ffe0', 0.8)).join('');
  put('props/reservoir_green.svg', 110, 200, o, { id: 1813, displace: 0.8 });
}
function lampGlow() {
  seed(1814);
  let o = '<g filter="url(#blur)">';
  o += `<ellipse cx="800" cy="330" rx="240" ry="260" fill="#fff3b0" opacity="0.55"/><ellipse cx="800" cy="330" rx="420" ry="380" fill="${C.green}" opacity="0.18"/>`;
  o += `<path d="M800 330 L-100 80 L-100 460Z" fill="#fff3c0" opacity="0.18"/><path d="M800 330 L1700 120 L1700 520Z" fill="#fff3c0" opacity="0.18"/>`;
  o += '</g>';
  o += part(ellPts(800, 330, 46, 60, 0, Math.PI * 2, 16), '#fff6c8', { sw: 2 });
  put('bg/lampglow.svg', W, H, o, { id: 1814, displace: 0.5 });
}

/* ───────────── 동쪽: 등대지기 책상과 일지, 바다 창 ───────────── */
function bgEast() {
  seed(1821);
  let o = shell({ windows: [[1060, 90, 360, 440, { station: false }]] });
  // 책상과 일지
  o += part([[120, 520], [700, 510], [710, 560], [126, 572]], C.plank, { sw: 2.6, heavy: [1, 2] });
  for (const x of [150, 660]) o += part([[x, 560], [x + 30, 560], [x + 26, 760], [x + 4, 760]], C.plank2, { sw: 2 });
  o += part([[260, 500], [500, 494], [520, 520], [250, 528]], C.paper, { sw: 2 }) + line([[385, 498], [386, 524]], { sw: 2, op: 0.6 });
  for (let i = 0; i < 5; i++) o += line([[276, 506 + i * 4], [370, 504 + i * 4]], { sw: 1, op: 0.35 }) + line([[400, 504 + i * 4], [500, 502 + i * 4]], { sw: 1, op: 0.35 });
  // 일지 위 작은 초록 그림 (봄이 그린 등대)
  o += part([[440, 504], [450, 480], [460, 504]], C.green, { sw: 1 });
  // 작은 기름 램프 (흐린 빛)
  o += part([[560, 510], [600, 510], [596, 470], [564, 470]], C.glass, { sw: 1.6 }) + dot(580, 488, 8, C.lamp) + `<circle cx="580" cy="488" r="40" fill="${C.lamp}" opacity="0.18" filter="url(#blur)"/>`;
  // 벽의 구명튜브와 밧줄
  o += part(ellPts(800, 220, 90, 90, 0, Math.PI * 2, 22), '#f4ecd8', { sw: 2.6, heavy: [6, 14] }) + part(ellPts(800, 220, 46, 46, 0, Math.PI * 2, 18), C.wall, { sw: 2 });
  for (const a of [0.4, 2, 3.6, 5.2]) o += part([[800 + Math.cos(a) * 52, 220 + Math.sin(a) * 52], [800 + Math.cos(a + 0.3) * 52, 220 + Math.sin(a + 0.3) * 52], [800 + Math.cos(a + 0.3) * 88, 220 + Math.sin(a + 0.3) * 88], [800 + Math.cos(a) * 88, 220 + Math.sin(a) * 88]], C.red, { sw: 1.4 });
  o += part(rectPts(150, 150, 230, 170), C.plank2, { sw: 2.2, heavy: [1, 2] }) + part(rectPts(164, 164, 202, 142), '#bcd4e8', { sw: 1.2 });
  o += `<path d="${S([[180, 270], [350, 270], [330, 296], [200, 296]], 0.4)}" fill="#8a5a3a" stroke="${INK}" stroke-width="1.6"/>` + part([[262, 270], [262, 186], [320, 262]], '#f4ecd8', { sw: 1.4 }) + part([[256, 270], [256, 200], [208, 262]], '#f4ecd8', { sw: 1.4 });
  o += line([[560, 40], [560, 150]], { sw: 2 }) + part([[536, 150], [584, 150], [580, 220], [540, 220]], C.brass, { sw: 1.8, heavy: [1, 2] }) + dot(560, 186, 10, C.lamp, 0.8);
  // 바닥 앞쪽: 밧줄 뭉치, 나무 상자와 유리병 속 배
  for (let r = 70; r > 10; r -= 12) o += `<path d="${O(ellPts(200, 800, r * 1.6, r * 0.6, 0, Math.PI * 2, 18), 0.6)}" fill="none" stroke="${C.rope}" stroke-width="9"/>` + `<path d="${O(ellPts(200, 800, r * 1.6, r * 0.6, 0, Math.PI * 2, 18), 0.6)}" fill="none" stroke="#8a6a3a" stroke-width="1.4"/>`;
  o += crate({ x: 1236, by: 862, w: 200, h: 156, d: 50, col: C.plank, dark: C.plankD });
  o += part([[1280, 700], [1420, 700], [1424, 640], [1400, 620], [1300, 620], [1276, 640]], '#cfe6ee', { sw: 2 }) + `<path d="${S([[1300, 680], [1400, 680], [1390, 692], [1310, 692]], 0.3)}" fill="#8a5a3a"/>` + part([[1350, 680], [1350, 640], [1380, 676]], '#f4ecd8', { sw: 1 });
  put('bg/east.svg', W, H, o, { id: 1821 });
}
function keeper(state) { seed(1822); put(`props/penguin_${state}.svg`, 280, 320, penguinArt(state), { id: 1822, displace: 0.8 }); }

/* ───────────── 남쪽: 나선 계단, 잉크병 선반, 걸레, 바다 지도 ───────────── */
function bgSouth() {
  seed(1831);
  let o = shell({ windows: [] });
  // 나선 계단 구멍과 난간
  o += part(ellPts(800, 720, 260, 90, 0, Math.PI * 2, 30), '#1a1420', { sw: 3 });
  for (let k = 0; k < 6; k++) { const a = Math.PI * 0.1 + k * 0.32; o += part([[800 + Math.cos(a) * 230, 720 + Math.sin(a) * 70], [800 + Math.cos(a + 0.28) * 230, 720 + Math.sin(a + 0.28) * 70], [800 + Math.cos(a + 0.28) * 120, 740 + Math.sin(a + 0.28) * 30], [800 + Math.cos(a) * 120, 740 + Math.sin(a) * 30]], k % 2 ? C.plank : C.plank2, { sw: 1.6 }); }
  o += line(ellPts(800, 640, 280, 60, Math.PI, Math.PI * 2, 30), { sw: 6, color: C.brass2, step: 999 });
  for (let k = 0; k <= 8; k++) { const a = Math.PI + k * Math.PI / 8; o += line([[800 + Math.cos(a) * 280, 640 + Math.sin(a) * 60], [800 + Math.cos(a) * 270, 720 + Math.sin(a) * 40]], { sw: 3, color: C.brass2 }); }
  // 잉크병 선반 (병은 소품)
  o += part([[140, 470], [600, 462], [602, 486], [142, 494]], C.plank, { sw: 2.2 });
  for (const x of [170, 560]) o += part([[x, 486], [x + 18, 486], [x + 6, 530]], C.plank2, { sw: 1.4 });
  o += part([[140, 300], [600, 294], [602, 316], [142, 322]], C.plank, { sw: 2 });
  for (let i = 0; i < 7; i++) {
    const bw = rand(38, 54), bh = rand(64, 80), bx = 156 + i * 62 + rand(-3, 3), tilt = i === 5 ? 10 : 0, col = pick(['#6a4a8a', '#3a5a8a', '#8a5a3a', '#4a7a5a', '#8a3a3a']);
    const b0 = [[bx, 296], [bx + bw, 296], [bx + bw + tilt, 296 - bh + 4], [bx + bw - 6 + tilt, 296 - bh], [bx + 6 + tilt, 296 - bh], [bx + tilt, 296 - bh + 4]];
    o += part(b0, col, { sw: 1.6, heavy: [1, 2], shade: [[bx + bw * 0.7, 200], [bx + bw + 20, 200], [bx + bw + 20, 300], [bx + bw * 0.7, 300]], shadeCol: 'rgba(0,0,0,0.25)' });
    for (const f of [0.18, 0.82]) o += line([[bx + 3 + tilt * (1 - f), 296 - bh * f], [bx + bw - 3 + tilt * (1 - f), 296 - bh * f]], { sw: 3, color: C.brass, op: 0.8 });
    o += part([[bx + bw * 0.25 + tilt * 0.5, 296 - bh * 0.62], [bx + bw * 0.75 + tilt * 0.5, 296 - bh * 0.62], [bx + bw * 0.75 + tilt * 0.4, 296 - bh * 0.42], [bx + bw * 0.25 + tilt * 0.4, 296 - bh * 0.42]], C.paper, { sw: 1 });
  }
  // 걸레 걸이
  o += part([[1150, 300], [1290, 296], [1292, 312], [1152, 316]], C.plank2, { sw: 1.8 }) + dot(1220, 318, 6, C.brass);
  // 바다 지도 (등대 → 징검다리 → 기차역이 점선으로)
  o += part(rectPts(980, 80, 460, 200), C.paper, { sw: 2.4, heavy: [1, 2] });
  o += `<path d="${S([[1000, 220], [1100, 200], [1200, 230], [1300, 200], [1420, 230], [1420, 270], [1000, 270]], 1)}" fill="#bcd4e8"/>`;
  o += part([[1020, 200], [1030, 140], [1040, 200]], C.red, { sw: 1.4 }) + part([[1380, 190], [1420, 190], [1420, 170], [1380, 170]], '#5a5a6a', { sw: 1.2 }) + dot(1400, 160, 5, C.green);
  for (let i = 0; i < 8; i++) o += dot(1060 + i * 40, 214 + Math.sin(i) * 8, 4, '#7a6a5a');
  o += line([[800, 90], [800, 300]], { sw: 10, color: '#5a5a66' }) + line([[740, 140], [860, 140]], { sw: 10, color: '#5a5a66' }) + `<path d="${O([[700, 260], [740, 330], [800, 350], [860, 330], [900, 260]], 0.5)}" fill="none" stroke="#5a5a66" stroke-width="12"/>` + part(ellPts(800, 80, 18, 18, 0, Math.PI * 2, 12), 'none', { sw: 6, stroke: '#5a5a66' });
  o += `<path d="${O([[700, 120], [660, 260], [700, 400], [650, 520]], 1)}" fill="none" stroke="${C.rope}" stroke-width="8"/>`;
  for (const [x, w] of [[60, 200], [1350, 190]]) o += barrel({ cx: x + w / 2, by: 872, w: w - 20, h: 176, col: C.plank2, dark: C.plankD });
  put('bg/south.svg', W, H, o, { id: 1831 });
}
function bottle(col, name) {
  seed(1832);
  let o = `<path d="${S([[8, 124], [82, 124], [80, 132], [12, 132]])}" fill="${INK}" opacity="0.2"/>`;
  o += part([[10, 124], [80, 124], [82, 54], [64, 40], [62, 18], [28, 18], [26, 40], [8, 54]], C.glass, { sw: 2.2, heavy: [0, 1] });
  o += `<path d="${S([[12, 122], [78, 122], [80, 66], [10, 66]], 0.4)}" fill="${col}" opacity="0.92"/>`;
  o += part([[26, 6], [64, 6], [64, 20], [26, 20]], C.plank2, { sw: 1.4 });
  o += part([[20, 80], [70, 80], [70, 108], [20, 108]], C.paper, { sw: 1.2 }) + dot(45, 94, 8, col);
  o += line([[18, 60], [20, 116]], { sw: 4, color: '#ffffff', op: 0.5 });
  put(`props/bottle_${name}.svg`, 90, 136, o, { id: 1832, displace: 0.8 });
}
function rag() {
  seed(1833);
  const o = part([[30, 10], [110, 6], [124, 60], [116, 140], [90, 150], [60, 140], [26, 150], [20, 80]], '#c9c0a8', { sw: 2, heavy: [2, 4], shade: [[80, 6], [124, 6], [124, 150], [80, 150]], shadeCol: 'rgba(60,50,30,0.2)' }) + [0, 1, 2, 3].map((i) => line([[34, 40 + i * 26], [112, 36 + i * 26]], { sw: 1.4, color: '#a89a80' })).join('');
  put('props/rag.svg', 140, 160, o, { id: 1833, displace: 1 });
}

/* ───────────── 서쪽: 발코니, 밤바다와 바위, 빗물통, 망원경 ───────────── */
function bgWest() {
  seed(1841);
  let o = nightSky(-10, -10, W + 20, 700, { station: true });
  // 바다 위 바위들 (어두워서 잘 안 보임)
  seed(1849);
  for (const [x, y, r] of [[560, 556, 44], [700, 528, 36], [840, 504, 30], [960, 484, 24], [1060, 468, 18], [1140, 455, 14]]) o += rock({ cx: x, cy: y, rx: r * 1.6, ry: r * 0.7, col: '#1a2440', light: '#2e3c64', water: '#2a4470', sw: 1.6 });
  seed(1841);
  // 문틀 (양옆 벽) + 발코니 난간
  o += part([[-10, -10], [130, -10], [130, 700], [-10, 700]], C.wall, { sw: 2.4 }) + part([[1470, -10], [1610, -10], [1610, 700], [1470, 700]], C.wall, { sw: 2.4 });
  o += part([[-10, 680], [W + 10, 680], [W + 10, H + 10], [-10, H + 10]], C.plank, { sw: 2.4 });
  for (let x = 0; x < W; x += 80) o += line([[x, 684], [x - 40, 900]], { sw: 1.4, color: C.plankD, op: 0.6 });
  o += line([[130, 600], [1470, 600]], { sw: 10, color: C.brass2 }) + line([[130, 596], [1470, 596]], { sw: 4, color: C.brass });
  for (let x = 160; x < 1460; x += 70) o += line([[x, 600], [x, 682]], { sw: 4, color: C.brass2 });
  // 빗물통
  o += barrel({ cx: 280, by: 712, w: 210, h: 214, col: C.plank2, dark: C.plankD, top: '#2a4470' });
  put('bg/west.svg', W, H, o, { id: 1841 });
}
// 망원경 (세발 받침) — 징검다리 빛보다 앞에 그린다. 400x320, x1080 y420에 둔다
function telescope() {
  seed(1843);
  let o = line([[160, 90], [80, 300]], { sw: 8, color: C.plankD }) + line([[160, 90], [240, 300]], { sw: 8, color: C.plankD }) + line([[160, 90], [164, 310]], { sw: 8, color: C.plankD });
  o += part([[40, 110], [300, 50], [316, 100], [54, 160]], C.brass, { sw: 2.4, heavy: [1, 2] }) + part(ellPts(308, 76, 16, 30, 0, Math.PI * 2, 12), C.brass2, { sw: 2 }) + part(ellPts(46, 136, 12, 22, 0, Math.PI * 2, 10), '#3a3020', { sw: 1.6 });
  o += line([[80, 112], [280, 66]], { sw: 3, color: C.brassL, op: 0.7 });
  put('props/telescope.svg', 400, 320, o, { id: 1843, displace: 1 });
}
// 등불이 비춘 징검다리 (바위가 금빛으로 이어지고 기차역까지 길)
function stonesLit() {
  seed(1842);
  let o = '<g filter="url(#blur)"><path d="M200 640 L1600 360 L1600 470 L200 720Z" fill="#fff3c0" opacity="0.18"/></g>';
  for (const [x, y, r] of [[560, 556, 44], [700, 528, 36], [840, 504, 30], [960, 484, 24], [1060, 468, 18], [1140, 455, 14], [1210, 445, 11], [1268, 437, 9]]) {
    o += `<ellipse cx="${x}" cy="${y + 6}" rx="${r * 2.2}" ry="${r * 0.9}" fill="#fff3b0" opacity="0.35" filter="url(#blur2)"/>`;
    o += rock({ cx: x, cy: y, rx: r * 1.6, ry: r * 0.7, col: '#d8c28a', light: '#fff6d0', moss: r > 25 ? '#7a9a5a' : null, water: '#3a5a8a', sw: r > 20 ? 2.2 : 1.6 });
  }
  put('props/stones_lit.svg', W, H, o, { id: 1842, displace: 1 });
}

/* ───────────── 확대 화면 ───────────── */
function zoomScope() {
  seed(1851);
  let o = fill(rect(-20, -20, W + 40, H + 40, { amp: 0 }), '#0a0e18');
  o += `<defs><clipPath id="sc"><circle cx="800" cy="450" r="380"/></clipPath></defs><g clip-path="url(#sc)">`;
  o += nightSky(400, 60, 800, 780, { sea: true });
  // 멀리 기차역 승강장과 초록 등불, 그림 표지판(초록 불 → 등대)
  o += part([[560, 560], [1060, 560], [1060, 600], [560, 600]], '#3a4058', { sw: 2.4 });
  o += part([[620, 560], [620, 400], [640, 400], [640, 560]], '#5a5a6a', { sw: 1.6 }) + part([[600, 380], [660, 380], [652, 410], [608, 410]], '#2a2a36', { sw: 1.6 });
  o += `<circle cx="630" cy="396" r="40" fill="${C.green}" opacity="0.35" filter="url(#blur)"/>` + dot(630, 396, 14, C.green);
  o += part([[780, 380], [1000, 376], [1004, 520], [784, 524]], C.paper, { sw: 2 });
  o += dot(840, 430, 22, C.green) + `<circle cx="840" cy="430" r="34" fill="none" stroke="${C.green2}" stroke-width="3"/>`;
  o += `<path d="${O([[880, 432], [960, 432]], 0.4)}" stroke="${INK}" stroke-width="5" fill="none"/><path d="M960 418 L986 432 L960 446Z" fill="${INK}"/>`;
  o += part([[964, 470], [972, 440], [980, 470]], C.red, { sw: 1.2 }) + line([[972, 470], [972, 500]], { sw: 3 });
  o += part([[820, 480], [860, 480], [860, 500], [820, 500]], '#5a5a6a', { sw: 1.2 });
  o += '</g>';
  o += `<circle cx="800" cy="450" r="380" fill="none" stroke="${C.brass2}" stroke-width="22"/><circle cx="800" cy="450" r="392" fill="none" stroke="${INK}" stroke-width="3"/>`;
  put('zoom/scope.svg', W, H, o, { id: 1851, displace: 1.8 });
}

/* ───────────── 아이템 ───────────── */
function items() {
  seed(1860);
  const it = (n, b) => put(`items/${n}.svg`, 160, 160, b, { id: 1860, displace: 1 });
  const ink = (col) => part([[40, 140], [120, 140], [122, 70], [104, 54], [102, 30], [58, 30], [56, 54], [38, 70]], C.glass, { sw: 2.4, heavy: [0, 1] }) + `<path d="${S([[42, 138], [118, 138], [120, 82], [40, 82]], 0.4)}" fill="${col}" opacity="0.92"/>` + part([[56, 16], [104, 16], [104, 32], [56, 32]], C.plank2, { sw: 1.6 }) + line([[50, 78], [52, 132]], { sw: 5, color: '#ffffff', op: 0.5 });
  it('ink_red', ink(C.red)); it('ink_blue', ink(C.blue)); it('ink_yellow', ink(C.yellow)); it('ink_black', ink(C.black)); it('ink_green', ink(C.green) + [0, 1, 2].map(() => dot(rand(56, 110), rand(90, 130), 4, '#d8ffe0', 0.9)).join(''));
  it('rag', part([[30, 30], [120, 24], [134, 76], [126, 136], [96, 146], [64, 134], [26, 146], [20, 86]], '#c9c0a8', { sw: 2.2, heavy: [2, 4] }) + [0, 1, 2].map((i) => line([[34, 60 + i * 26], [122, 56 + i * 26]], { sw: 1.4, color: '#a89a80' })).join(''));
  it('wetrag', part([[30, 30], [120, 24], [134, 76], [126, 136], [96, 146], [64, 134], [26, 146], [20, 86]], '#9ab0c0', { sw: 2.2, heavy: [2, 4] }) + [0, 1, 2].map((i) => line([[34, 60 + i * 26], [122, 56 + i * 26]], { sw: 1.4, color: '#7a90a0' })).join('') + [0, 1, 2, 3].map(() => `<path d="${S([[0, -8], [6, 2], [0, 8], [-6, 2]].map(([a, b]) => [rand(40, 120) + a, rand(140, 156) + b]), 0.2)}" fill="#bfe0f4" stroke="${INK}" stroke-width="1"/>`).join(''));
}

/* ───────────── 앞쪽 틀: 잉크 번짐 (위에서 흘러내린 먹물, 모서리 얼룩) ───────────── */
function frame() {
  seed(1870);
  let o = '';
  for (let i = 0; i < 16; i++) { const x = i < 8 ? rand(-10, 260) : rand(1340, 1610), len = rand(30, 140), w = rand(8, 22); o += `<path d="M${x - w} -10 L${x + w} -10 L${x + w * 0.4} ${len} Q${x} ${len + w} ${x - w * 0.4} ${len}Z" fill="#141a2c" opacity="0.92"/>` + dot(x, len + w * 0.9, w * 0.55, '#141a2c', 0.92); }
  o += `<path d="M-10 -10 L${W + 10} -10 L${W + 10} 14 L-10 14Z" fill="#141a2c"/>`;
  for (const [x, y] of [[40, 860], [1560, 870], [120, 900], [1480, 900]]) { const pts = []; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; pts.push([x + Math.cos(a) * (k % 2 ? 30 : 60 + rand(0, 30)), y + Math.sin(a) * (k % 2 ? 24 : 46 + rand(0, 20))]); } o += `<path d="${S(pts, 2)}" fill="#141a2c" opacity="0.9"/>`; }
  put('bg/frame.svg', W, H, o, { id: 1870, displace: 1.6 });
}

bgNorth(); lensInk(); reservoirGreen(); lampGlow();
bgEast(); keeper('worried'); keeper('happy');
bgSouth(); for (const [c, n] of [[C.red, 'red'], [C.blue, 'blue'], [C.yellow, 'yellow'], [C.black, 'black']]) bottle(c, n); rag();
bgWest(); telescope(); stonesLit(); zoomScope(); items(); frame();
console.log('lighthouse assets written, ~' + Math.round(total / 1024) + 'KB');
