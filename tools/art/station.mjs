// 9장 「겨울잠 기차역」 그래픽 에셋 생성기
// node tools/art/station.mjs  → assets/rooms/station/**
// 분위기: 눈 쌓인 작은 시골 기차역. 처음엔 푸르스름하게 춥고, 난로를 피우면 주황빛으로 포근해진다.
import { digits, seed, rand, pick, INK, wob, rect, rectPts, ellPts, fill, line, hatch, svg } from './ink.mjs';
import { part, S, O, bearArt } from './chars.mjs';
import { suitcase, mound, blobPts, roundRectPts, barrel } from './props.mjs';

const OUT = new URL('../../assets/rooms/station/', import.meta.url).pathname;
const W = 1600, H = 900;
const C = {
  wood: '#a8784e', wood2: '#8a5e3a', woodD: '#5a3a22', wall: '#c99a6a', wall2: '#b4855a', floor: '#8a6040',
  snow: '#f6f8fc', snow2: '#dfe6f2', snowS: 'rgba(100,120,170,0.22)', sky: '#b8c8e0', sky2: '#9fb4d4', iron: '#3a3a44', iron2: '#2a2a32',
  fire: '#f2a040', fire2: '#f6d060', red: '#c4473a', green: '#5a8a5a', blue: '#3e5a8a', brass: '#d4a649', brass2: '#9d7428', paper: '#f4ecd8', coal: '#2a2628',
};
let total = 0;
const put = (rel, w, h, body, o) => { total += svg(OUT + rel, w, h, body, o); };
const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
function lumpPts(cx, cy, rx, ry, n = 18, k = 0.06) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx * (i % 2 ? 1 - k : 1), cy + Math.sin(a) * ry * (i % 2 ? 1 - k : 1)]); } return p; }
const snowLump = (cx, cy, rx, ry) => part(blobPts(cx, cy, rx, ry, { n: 16, k: 0.16, flat: 0.55 }), C.snow, { sw: 2, heavy: [2, 5], shade: [[cx - rx, cy + ry * 0.1], [cx + rx, cy + ry * 0.1], [cx + rx, cy + ry * 1.2], [cx - rx, cy + ry * 1.2]], shadeCol: C.snowS, hatch: false });

/* ───────────── 역장실 껍데기 (나무 벽, 마루) ───────────── */
function office() {
  let o = fill(rect(-10, -10, W + 20, 660, { amp: 0 }), C.wall);
  for (let x = 0; x < W; x += 66) o += line([[x, -10], [x + rand(-2, 2), 650]], { sw: 1.6, color: C.wall2, op: 0.8 });
  for (let i = 0; i < 30; i++) o += line([[rand(0, W), rand(0, 640)], [rand(0, W), rand(0, 640)]], { sw: 0.6, color: C.wall2, op: 0.25, step: 999 });
  o += part([[-10, 0], [W + 10, 0], [W + 10, 40], [-10, 40]], C.woodD, { sw: 2 });
  o += part([[-10, 610], [W + 10, 610], [W + 10, 650], [-10, 650]], C.woodD, { sw: 2 });
  o += fill(wob([[-10, 646], [W + 10, 646], [W + 10, H + 10], [-10, H + 10]], { sharp: true }), C.floor);
  for (let k = 0; k < 16; k++) { const xb = -60 + k * 110, xf = -400 + k * 160; o += line([[xb, 646], [xf, 910]], { sw: 1.6, color: C.woodD, op: 0.7, step: 999 }); }
  for (const y of [690, 750, 830]) o += line([[-10, y], [W + 10, y]], { sw: 1, color: C.woodD, op: 0.35 });
  o += hatch(wob([[-10, 646], [W + 10, 646], [W + 10, 672], [-10, 672]], { sharp: true }), 0.4);
  // 둥근 털실 깔개
  o += `<path d="${S(ellPts(800, 790, 420, 70, 0, Math.PI * 2, 24), 2)}" fill="${C.red}" stroke="${INK}" stroke-width="2.2"/>` + `<path d="${S(ellPts(800, 790, 330, 52, 0, Math.PI * 2, 22), 2)}" fill="${C.paper}" stroke="${INK}" stroke-width="1.6"/>` + `<path d="${S(ellPts(800, 790, 220, 34, 0, Math.PI * 2, 20), 2)}" fill="${C.green}" stroke="${INK}" stroke-width="1.6"/>`;
  return o;
}
// 바깥 눈 풍경 (창 밖 / 승강장)
function snowScape(x, y, w, h, { board = false, track = false } = {}) {
  let o = fill(rect(x, y, w, h, { amp: 0 }), C.sky);
  for (let k = 0; k < 3; k++) { const yy = y + h * (0.42 + k * 0.08); const pts = [[x, yy + 40]]; for (let i = 0; i <= 8; i++) pts.push([x + i * w / 8, yy - rand(10, 60) + k * 10]); pts.push([x + w, yy + 40], [x + w, y + h], [x, y + h]); o += `<path d="${S(pts, 2)}" fill="${['#dfe6f2', '#e8eef8', '#f2f5fa'][k]}" stroke="${INK}" stroke-width="${1 + k * 0.4}" stroke-opacity="0.4"/>`; }
  for (let i = 0; i < 10; i++) { const tx = x + rand(20, w - 20), ty = y + h * rand(0.42, 0.6); o += `<path d="M${tx} ${ty - 50} L${tx + 18} ${ty} L${tx - 18} ${ty}Z" fill="#5a7a6a" stroke="${INK}" stroke-width="1.2"/><path d="M${tx} ${ty - 50} L${tx + 8} ${ty - 30} L${tx - 8} ${ty - 30}Z" fill="${C.snow}"/>`; }
  if (board) {
    // 시간표 판: 그림(물결=바다, 산, 지붕과 둥근 창=다락방) → 선로 번호
    const bx = x + w * 0.22, by = y + h * 0.16, bw = w * 0.56, bh = h * 0.5;
    o += part(rectPts(bx, by, bw, bh), '#2a3a5a', { sw: 3, heavy: [1, 2] }) + part(rectPts(bx + 10, by + 10, bw - 20, bh - 20), '#3a4c70', { sw: 1.4 });
    const rows = [['sea', 1], ['mountain', 2], ['attic', 3]];
    rows.forEach(([k, n], i) => {
      const ry = by + 50 + i * (bh - 70) / 3, ix = bx + 70;
      if (k === 'sea') o += [0, 1].map((j) => `<path d="${O([[ix - 34, ry - 6 + j * 14], [ix - 18, ry - 14 + j * 14], [ix, ry - 6 + j * 14], [ix + 18, ry - 14 + j * 14], [ix + 34, ry - 6 + j * 14]], 0.3)}" fill="none" stroke="#9fd0ee" stroke-width="5"/>`).join('');
      if (k === 'mountain') o += `<path d="${S([[ix - 38, ry + 14], [ix - 12, ry - 22], [ix + 4, ry - 4], [ix + 16, ry - 16], [ix + 38, ry + 14]], 0.4)}" fill="#8ab08a" stroke="#f4ecd8" stroke-width="2.4"/>`;
      if (k === 'attic') o += `<path d="${S([[ix - 38, ry + 18], [ix - 38, ry - 4], [ix, ry - 30], [ix + 38, ry - 4], [ix + 38, ry + 18]], 0.4)}" fill="#c4704a" stroke="#f4ecd8" stroke-width="2.4"/><circle cx="${ix}" cy="${ry + 2}" r="9" fill="#f6d060" stroke="#f4ecd8" stroke-width="2"/>`;
      o += `<path d="${O([[ix + 60, ry], [bx + bw - 150, ry]], 0.3)}" fill="none" stroke="#f4ecd8" stroke-width="3" stroke-dasharray="10 10"/>`;
      o += digits(n, bx + bw - 90, ry + 24, 48, { color: '#f6d060', sw: 6 });
    });
  }
  if (track) {
    const ty = y + h * 0.78;
    o += fill(rect(x, ty - 30, w, h - (ty - 30 - y), { amp: 0 }), C.snow2);
    for (const off of [0, 60]) o += line([[x, ty + off], [x + w, ty + off]], { sw: 7, color: '#5a5a66', step: 999 }) + line([[x, ty + off - 3], [x + w, ty + off - 3]], { sw: 2, color: '#a8a8b8', step: 999 });
    for (let i = 0; i < w / 60; i++) o += part([[x + i * 60 + 10, ty - 6], [x + i * 60 + 40, ty - 6], [x + i * 60 + 44, ty + 72], [x + i * 60 + 6, ty + 72]], C.woodD, { sw: 1 });
    for (const off of [0, 60]) o += line([[x, ty + off], [x + w, ty + off]], { sw: 6, color: '#5a5a66', step: 999 });
  }
  return o;
}

/* ───────────── 북쪽: 역장실 (난로, 곰곰이의 안락의자, 깨우는 법 안내문) ───────────── */
function bgNorth() {
  seed(1911);
  let o = office();
  // 무쇠 난로와 연통
  o += `<path d="${S([[130, 716], [420, 712], [440, 736], [150, 740]], 0.6)}" fill="${INK}" opacity="0.25"/>`;
  o += part([[150, 690], [146, 640], [140, 560], [144, 470], [150, 430], [370, 430], [376, 470], [380, 560], [374, 640], [370, 690]], C.iron, { sw: 2.8, heavy: [5, 8], shade: [[300, 420], [390, 420], [390, 700], [300, 700]], shadeCol: 'rgba(0,0,0,0.32)', light: [[158, 440], [176, 440], [172, 680], [156, 680]] });
  o += part([[136, 690], [384, 690], [388, 706], [132, 706]], C.iron2, { sw: 2 });
  o += part([[128, 432], [134, 412], [170, 396], [350, 396], [386, 412], [392, 432]], C.iron2, { sw: 2.4, heavy: [3, 5] }) + part(roundRectPts(226, 380, 68, 20, 8), C.iron, { sw: 1.8 });
  for (const y of [446, 676]) for (let x = 160; x <= 360; x += 25) o += dot(x, y, 2.2, '#8a8a98');
  o += part(roundRectPts(220, 630, 80, 22, 6), C.brass, { sw: 1.4 }) + line([[236, 641], [284, 641]], { sw: 1.4, op: 0.6 });
  o += part(roundRectPts(188, 458, 144, 154, 14), C.iron2, { sw: 2.2 }) + dot(338, 520, 6, C.brass) + dot(338, 552, 6, C.brass);
  o += part([[200, 470], [320, 470], [320, 600], [200, 600]], '#1a1a20', { sw: 2.4 });
  for (let x = 214; x < 320; x += 18) o += line([[x, 476], [x, 594]], { sw: 3, color: C.iron });
  o += part([[236, 392], [284, 392], [284, -10], [236, -10]], C.iron, { sw: 2.2, heavy: [1, 2] });
  for (const y of [120, 260]) o += part([[228, y], [292, y], [292, y + 14], [228, y + 14]], C.iron2, { sw: 1.4 });
  for (const [x, d] of [[160, -1], [360, 1]]) o += part([[x - 12, 704], [x + 12, 704], [x + 10 + d * 4, 724], [x + d * 14, 734], [x + d * 6, 736], [x - 8 + d * 4, 724]], C.iron2, { sw: 1.4 });
  // 안락의자 (곰곰이는 소품)
  // 날개 달린 안락의자: 둥근 등받이 + 단추 누빔, 동그랗게 말린 팔걸이, 방석, 주름 치마, 나무 다리
  const CH = '#6a8aa8', CH2 = '#56769a', CHL = '#8aa8c4';
  let tuft = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5 - (r === 0 ? 1 : 0); c++) { const x = 640 + c * 80 + (r === 0 ? 40 : 0) + (r % 2 ? 40 : 0) - (r === 2 ? 40 : 0), y = 380 + r * 70; tuft += `<circle cx="${x}" cy="${y}" r="5" fill="${CH2}" stroke="${INK}" stroke-width="1.2"/>` + `<path d="${O([[x - 22, y - 16], [x, y], [x + 22, y - 16]], 0.3)}" fill="none" stroke="${CH2}" stroke-width="1.6"/><path d="${O([[x - 22, y + 16], [x, y], [x + 22, y + 16]], 0.3)}" fill="none" stroke="${CH2}" stroke-width="1.6"/>`; }
  o += part([[560, 640], [548, 420], [562, 352], [610, 316], [700, 298], [800, 292], [900, 298], [990, 316], [1038, 352], [1052, 420], [1040, 640]], CH, { sw: 2.8, heavy: [6, 10], shade: [[900, 280], [1060, 280], [1060, 660], [900, 660]], shadeCol: 'rgba(0,20,50,0.24)', light: [[600, 330], [760, 300], [760, 316], [600, 350]], extra: tuft });
  // 날개 (등받이 양옆)
  o += part([[560, 560], [520, 470], [512, 400], [540, 360], [574, 372], [584, 470]], CHL, { sw: 2.2 }) + part([[1040, 560], [1080, 470], [1088, 400], [1060, 360], [1026, 372], [1016, 470]], CH2, { sw: 2.2, heavy: [1, 3] });
  // 방석 + 주름 치마
  o += part([[580, 640], [600, 610], [800, 600], [1000, 610], [1020, 640], [1000, 668], [800, 676], [600, 668]], CHL, { sw: 2.4 });
  let pleat = ''; for (let x = 560; x <= 1040; x += 30) pleat += O([[x, 676], [x + 4, 722]], 0.3);
  o += part([[548, 670], [1052, 670], [1060, 724], [540, 724]], CH, { sw: 2.4, heavy: [1, 2], extra: `<path d="${pleat}" fill="none" stroke="${CH2}" stroke-width="1.6"/>` });
  // 말린 팔걸이 (앞쪽 둥근 소용돌이)
  for (const [x, dir, col] of [[520, 1, CHL], [1080, -1, CH2]]) {
    o += part([[x, 726], [x - dir * 6, 560], [x + dir * 4, 520], [x + dir * 50, 508], [x + dir * 96, 520], [x + dir * 104, 560], [x + dir * 98, 726]], col, { sw: 2.4, heavy: dir > 0 ? [5, 6] : [0, 1] });
    o += part(ellPts(x + dir * 50, 532, 36, 26, 0, Math.PI * 2, 14), dir > 0 ? CH : CH2, { sw: 1.8 }) + `<path d="${O([[x + dir * 30, 532], [x + dir * 44, 520], [x + dir * 62, 530], [x + dir * 52, 544], [x + dir * 42, 534]], 0.3)}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  }
  for (const x of [556, 1044]) o += part([[x - 12, 722], [x + 12, 722], [x + 8, 758], [x + 2, 764], [x - 6, 758]], C.woodD, { sw: 1.6 });
  // 깨우는 법 안내문 (확대하면 읽힌다)
  o += part([[1120, 150], [1400, 142], [1406, 400], [1126, 408]], C.paper, { sw: 2.4, heavy: [1, 2] }) + dot(1262, 160, 7, C.red);
  o += part(ellPts(1190, 230, 26, 22, 0, Math.PI * 2, 12), C.fire, { sw: 1.4 });
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 0.4; o += part(ellPts(1300 + Math.cos(a) * 12, 230 + Math.sin(a) * 12, 10, 10, 0, Math.PI * 2, 8), '#f0a0b8', { sw: 1 }); }
  for (let i = 0; i < 4; i++) o += line([[1150, 300 + i * 22], [1380, 298 + i * 22]], { sw: 1.6, op: 0.4 });
  // 벽 시계와 모자걸이
  o += part(ellPts(800, 140, 60, 60, 0, Math.PI * 2, 18), C.paper, { sw: 2.4, heavy: [4, 10] }) + line([[800, 140], [800, 104]], { sw: 3 }) + line([[800, 140], [826, 152]], { sw: 3 });
  o += line([[1460, 220], [1500, 214]], { sw: 6, color: C.woodD });
  put('bg/north.svg', W, H, o, { id: 1911 });
}
function stoveFire() {
  seed(1912);
  let o = '<g filter="url(#blur)">';
  o += `<ellipse cx="260" cy="540" rx="320" ry="260" fill="${C.fire}" opacity="0.35"/><ellipse cx="800" cy="500" rx="900" ry="500" fill="#ffd8a0" opacity="0.12"/>`;
  o += '</g>';
  o += part([[204, 600], [316, 600], [316, 474], [204, 474]], '#3a1a10', { sw: 0 });
  const tongue = (x, w, top, lean) => S([[x - w, 598], [x - w * 1.2, 570], [x - w * 0.4 + lean * 0.3, 548], [x - w * 0.6 + lean * 0.6, top + 30], [x + lean, top], [x + w * 0.4 + lean * 0.5, top + 26], [x + w * 0.9, 552], [x + w * 1.2, 576], [x + w, 598]], 0.3);
  o += `<path d="${S([[206, 598], [316, 598], [314, 560], [260, 540], [208, 560]], 0.3)}" fill="#c43a1a" opacity="0.9"/>`;
  for (const [x, w, top, lean] of [[226, 16, 512, -6], [260, 20, 486, 8], [296, 16, 506, 10]]) o += `<path d="${tongue(x, w, top, lean)}" fill="${C.fire}"/>` + `<path d="${tongue(x, w * 0.5, top + 34, lean * 0.6)}" fill="${C.fire2}"/>`;
  for (let i = 0; i < 6; i++) o += dot(rand(214, 310), rand(480, 530), rand(1.5, 3), C.fire2, 0.9);
  for (let x = 214; x < 320; x += 18) o += line([[x, 476], [x, 594]], { sw: 3, color: C.iron });
  put('bg/fire.svg', W, H, o, { id: 1912, displace: 0.8 });
}
function bear(state) { seed(1913); put(`props/bear_${state}.svg`, 360, 340, bearArt(state), { id: 1913, displace: 0.8 }); }
function zzz() {
  seed(1914);
  const o = [[20, 90, 26], [60, 54, 34], [110, 14, 44]].map(([x, y, s]) => `<path d="${O([[x, y], [x + s, y], [x, y + s], [x + s, y + s]], 0.6)}" fill="none" stroke="#f4ecd8" stroke-width="${(s / 7).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  put('props/zzz.svg', 170, 130, o, { id: 1914, displace: 0.6 });
}

/* ───────────── 동쪽: 성에 낀 큰 창 (바깥 시간표), 창가 꽃화분 ───────────── */
function bgEast() {
  seed(1921);
  let o = office();
  o += snowScape(300, 80, 1000, 480, { board: true });
  o += `<rect x="290" y="70" width="1020" height="500" fill="none" stroke="${C.woodD}" stroke-width="22"/>` + line([[800, 80], [800, 560]], { sw: 14, color: C.woodD }) + line([[300, 320], [1300, 320]], { sw: 12, color: C.woodD });
  o += part([[270, 560], [1330, 560], [1340, 594], [260, 594]], C.wood, { sw: 2.4, heavy: [1, 2] });
  // 왼쪽 벽: 역장 외투와 손전등
  o += line([[110, 170], [160, 164]], { sw: 6, color: C.woodD });
  o += part([[100, 180], [170, 176], [210, 420], [60, 424]], C.blue, { sw: 2.2, heavy: [1, 2] }) + [0, 1, 2].map((i) => dot(136, 230 + i * 50, 5, C.brass)).join('');
  put('bg/east.svg', W, H, o, { id: 1921 });
}
function frost() {
  seed(1922);
  let o = `<rect x="0" y="0" width="1000" height="480" fill="#eef4fb" opacity="0.93"/>`;
  for (let i = 0; i < 26; i++) { const x = rand(0, 1000), y = rand(0, 480), r = rand(14, 40); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; o += line([[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { sw: 1.4, color: '#c8d8ec', op: 0.9 }); o += line([[x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5], [x + Math.cos(a + 0.5) * r * 0.75, y + Math.sin(a + 0.5) * r * 0.75]], { sw: 1, color: '#c8d8ec', op: 0.8 }); } }
  put('props/frost.svg', 1000, 480, o, { id: 1922, displace: 1 });
}
function flower(state) {
  seed(1923);
  let o = part([[30, 150], [130, 150], [120, 220], [40, 220]], '#c4704a', { sw: 2.2, heavy: [1, 2] }) + part([[24, 140], [136, 140], [136, 156], [24, 156]], '#d8845a', { sw: 1.8 });
  if (state !== 'empty') o += line([[80, 140], [82, 60]], { sw: 4, color: '#5a8a4a' }) + part([[82, 110], [120, 90], [110, 116]], '#6aa05a', { sw: 1.4 }) + part([[80, 120], [44, 96], [52, 124]], '#6aa05a', { sw: 1.4 });
  if (state === 'bud') o += part([[70, 62], [82, 26], [94, 62], [82, 74]], '#e8a0b8', { sw: 1.8 }) + line([[82, 30], [82, 70]], { sw: 1, op: 0.5 });
  if (state === 'bloom') { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; o += part([[82, 50], [82 + Math.cos(a - 0.4) * 30, 50 + Math.sin(a - 0.4) * 30], [82 + Math.cos(a) * 42, 50 + Math.sin(a) * 42], [82 + Math.cos(a + 0.4) * 30, 50 + Math.sin(a + 0.4) * 30]], '#f0a0b8', { sw: 1.6 }); } o += part(ellPts(82, 50, 12, 12, 0, Math.PI * 2, 10), '#f6d060', { sw: 1.4 }); }
  put(`props/flower_${state}.svg`, 160, 230, o, { id: 1923, displace: 1 });
}

/* ───────────── 남쪽: 눈 내린 승강장과 선로 (기차는 소품) ───────────── */
function bgSouth() {
  seed(1931);
  let o = snowScape(-10, -10, W + 20, H + 20, { track: true });
  // 승강장 지붕 기둥과 처마, 등
  o += part([[-10, -10], [W + 10, -10], [W + 10, 70], [-10, 90]], C.wood2, { sw: 2.4 });
  for (let x = 0; x < W; x += 50) o += `<path d="${S([[x, 70], [x + 25, 96], [x + 50, 70]], 0.4)}" fill="${C.snow}" stroke="${INK}" stroke-width="1.4"/>`;
  for (const x of [120, 1440]) o += part([[x - 16, 80], [x + 16, 80], [x + 16, 680], [x - 16, 680]], C.wood, { sw: 2.2, heavy: [1, 2] });
  o += part([[100, 200], [140, 200], [146, 250], [94, 250]], C.brass, { sw: 1.8 }) + dot(120, 226, 10, '#fff3b0');
  // 승강장 바닥 (눈 쌓인 판자) + 노란 선
  o += part([[-10, 640], [W + 10, 640], [W + 10, 700], [-10, 700]], '#d8ccb4', { sw: 2 }) + line([[-10, 650], [W + 10, 650]], { sw: 6, color: '#e8c040' });
  // 선로 끝 신호등 (빨강)
  o += line([[1300, 340], [1300, 640]], { sw: 8, color: C.iron }) + part([[1280, 300], [1320, 300], [1320, 360], [1280, 360]], C.iron2, { sw: 1.8 }) + dot(1300, 316, 9, C.red) + dot(1300, 344, 9, '#3a4a3a');
  // 눈사람 하나
  o += snowLump(240, 600, 60, 50) + snowLump(240, 520, 42, 38) + dot(228, 512, 4, INK) + dot(252, 512, 4, INK) + `<path d="M240 522 L268 528 L240 532Z" fill="${C.fire}"/>`;
  o += part([[420, 600], [760, 596], [762, 616], [422, 620]], C.wood, { sw: 2 }) + part([[430, 560], [750, 556], [752, 572], [432, 576]], C.wood, { sw: 1.8 });
  for (const x of [440, 740]) o += line([[x, 620], [x - 4, 650]], { sw: 6, color: C.iron });
  o += `<path d="${S([[420, 556], [760, 552], [756, 540], [424, 544]], 0.4)}" fill="${C.snow}"/>`;
  o += suitcase({ x: 880, by: 648, w: 180, h: 92, col: '#8a4a3a', strap: C.woodD, brass: C.brass });
  o += `<path d="${S([[884, 556], [1056, 556], [1052, 546], [890, 546]], 0.4)}" fill="${C.snow}"/>`;
  // 둥근 우체통: 받침 + 볼록한 기둥 + 모자 같은 지붕, 투입구, 작은 문과 명판
  o += part([[1114, 652], [1206, 652], [1202, 636], [1118, 636]], '#2a2a32', { sw: 1.8 });
  o += part([[1124, 638], [1120, 580], [1124, 532], [1196, 532], [1200, 580], [1196, 638]], C.red, { sw: 2.4, heavy: [3, 5], shade: [[1174, 520], [1210, 520], [1210, 640], [1174, 640]], shadeCol: 'rgba(60,0,0,0.3)', light: [[1130, 540], [1142, 540], [1140, 630], [1130, 630]] });
  o += part([[1112, 534], [1120, 516], [1140, 500], [1160, 496], [1180, 500], [1200, 516], [1208, 534]], '#a83a30', { sw: 2.4, heavy: [3, 6] }) + part(ellPts(1160, 494, 10, 6, 0, Math.PI * 2, 10), '#a83a30', { sw: 1.6 });
  o += part(roundRectPts(1134, 552, 52, 12, 5), '#2a2a32', { sw: 1.4 }) + part(roundRectPts(1140, 586, 40, 40, 4), '#b83e34', { sw: 1.4 }) + part(roundRectPts(1146, 594, 28, 12, 2), C.paper, { sw: 1 }) + dot(1176, 608, 2.6, C.brass);
  o += `<path d="${S([[1114, 520], [1140, 500], [1160, 494], [1182, 500], [1206, 520], [1186, 514], [1160, 506], [1134, 514]], 0.4)}" fill="${C.snow}" stroke="${INK}" stroke-width="1" stroke-opacity="0.5"/>`;
  put('bg/south.svg', W, H, o, { id: 1931 });
}
function wheel(cx, cy, r, col, spokes = 10) {
  let o = part(ellPts(cx, cy, r, r, 0, Math.PI * 2, 20), col, { sw: 2.4, heavy: [2, 8], shade: [[cx - r, cy + r * 0.2], [cx + r, cy - r * 0.2], [cx + r, cy + r], [cx - r, cy + r]], shadeCol: 'rgba(40,0,0,0.25)' });
  o += `<path d="${S(ellPts(cx, cy, r * 0.8, r * 0.8, 0, Math.PI * 2, 18), 0.3)}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  for (let i = 0; i < spokes; i++) { const a = i / spokes * Math.PI * 2; o += line([[cx + Math.cos(a) * r * 0.2, cy + Math.sin(a) * r * 0.2], [cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78]], { sw: Math.max(2, r * 0.07), color: INK, op: 0.75 }); }
  o += part(ellPts(cx, cy, r * 0.24, r * 0.24, 0, Math.PI * 2, 10), '#c8c8d0', { sw: 1.6 }) + dot(cx, cy, r * 0.08, INK);
  return o;
}
function train() {
  seed(1932);
  // 1300x420 (위로 연기 180): 증기 기관차 + 객차 한 칸. 기관차 앞의 둥근 문에 별 모양 등
  let o = `<path d="${S([[10, 404], [1290, 404], [1280, 424], [20, 424]])}" fill="${INK}" opacity="0.25"/>`;
  // 연기 (굴뚝에서 뒤쪽으로 흘러감)
  for (let i = 0; i < 5; i++) o += part(blobPts(222 + i * 70, 40 - i * 44, 34 + i * 12, 24 + i * 8, { n: 14, k: 0.3 }), i < 2 ? '#f6f8fc' : '#e8eef8', { sw: 1.8, shade: [[100, 46 - i * 44], [700, 46 - i * 44], [700, 120 - i * 40], [100, 120 - i * 40]], shadeCol: 'rgba(100,120,170,0.25)', hatch: false });
  // 발판 아래 실린더
  o += part(roundRectPts(96, 316, 120, 60, 18), C.iron, { sw: 2.2 }) + line([[110, 346], [200, 346]], { sw: 2, color: '#6a6a78' });
  // 보일러 (굵은 원통) + 쇠띠와 리벳
  let bands = '';
  for (const x of [200, 270, 340]) bands += `<path d="${O([[x, 172], [x + 6, 250], [x, 328]], 0.3)}" fill="none" stroke="${C.iron2}" stroke-width="7"/>` + [190, 230, 270, 310].map((y) => dot(x + (y === 230 || y === 270 ? 5 : 2), y, 2.2, '#c8c8d0')).join('');
  o += part([[130, 170], [420, 166], [430, 250], [420, 332], [130, 330]], C.blue, { sw: 2.8, heavy: [1, 3], shade: [[110, 280], [440, 276], [440, 340], [110, 340]], shadeCol: 'rgba(0,0,30,0.32)', light: [[140, 182], [410, 178], [410, 198], [140, 202]], extra: bands });
  // 굴뚝 (윗부분이 나팔처럼 벌어짐)
  o += part([[196, 170], [244, 170], [240, 110], [266, 74], [262, 58], [178, 58], [174, 74], [200, 110]], C.iron2, { sw: 2.4, heavy: [1, 3] }) + part(ellPts(220, 60, 44, 9, 0, Math.PI * 2, 14), '#1a1a20', { sw: 1.8 }) + line([[202, 126], [204, 164]], { sw: 3, color: '#6a6a78', op: 0.8 });
  // 놋쇠 돔 + 종
  o += part([[290, 170], [292, 140], [312, 122], [338, 122], [358, 140], [360, 170]], C.brass, { sw: 2.2, heavy: [3, 5], light: [[296, 150], [316, 128], [326, 128], [306, 152]] });
  // 기관실 (둥근 지붕이 앞뒤로 튀어나옴, 위가 둥근 창)
  o += part([[400, 380], [540, 380], [540, 126], [400, 126]], C.blue, { sw: 2.8, heavy: [1, 2], shade: [[500, 120], [560, 120], [560, 390], [500, 390]], shadeCol: 'rgba(0,0,30,0.3)' });
  o += part([[380, 128], [392, 108], [470, 92], [548, 108], [560, 128], [548, 136], [392, 136]], C.iron2, { sw: 2.4 });
  o += part([[424, 260], [424, 186], [446, 160], [494, 160], [516, 186], [516, 260]], '#f6d060', { sw: 2.4, extra: `<path d="${S([[424, 182], [516, 182], [516, 196], [424, 200]], 0.3)}" fill="#fff8d8" opacity="0.6"/>` }) + line([[470, 160], [470, 260]], { sw: 4, color: C.blue });
  o += `<path d="${O([[414, 290], [526, 290], [526, 360], [414, 360], [414, 290]], 0.4)}" fill="none" stroke="${C.brass}" stroke-width="3"/>`;
  // 발판 (빨간 테두리)
  o += part([[40, 332], [552, 332], [552, 352], [40, 352]], C.iron2, { sw: 2 }) + line([[44, 348], [548, 348]], { sw: 3, color: C.red });
  // 앞쪽 둥근 문 (연기 상자 문): 테두리 리벳 + 별 등 + 손잡이
  o += part(ellPts(130, 250, 92, 92, 0, Math.PI * 2, 22), C.iron2, { sw: 2.6, heavy: [2, 8] });
  o += part(ellPts(130, 250, 76, 76, 0, Math.PI * 2, 20), C.iron, { sw: 1.8, light: [[70, 200], [140, 172], [150, 186], [80, 214]] });
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; o += dot(130 + Math.cos(a) * 84, 250 + Math.sin(a) * 84, 2.6, '#c8c8d0'); }
  const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; st.push([130 + Math.cos(a) * (i % 2 ? 20 : 46), 246 + Math.sin(a) * (i % 2 ? 20 : 46)]); }
  o += `<circle cx="130" cy="246" r="74" fill="#fff3b0" opacity="0.3" filter="url(#blur)"/>` + part(st, '#f6d060', { sw: 2.2, light: [[118, 226], [130, 204], [134, 232]] });
  o += line([[176, 288], [196, 296]], { sw: 5, color: C.brass });
  // 배장기 (앞쪽 눈 치우개)
  o += part([[52, 352], [140, 352], [150, 404], [18, 404]], C.red, { sw: 2.4, heavy: [2, 3] });
  for (const k of [0.2, 0.4, 0.6, 0.8]) o += line([[52 + 88 * k, 354], [18 + 132 * k, 402]], { sw: 2.4, op: 0.7 });
  // 바퀴 + 연결봉
  for (const x of [190, 310, 440]) o += wheel(x, 370, 46, C.red);
  o += line([[190, 386], [440, 386]], { sw: 10, color: INK }) + line([[190, 386], [440, 386]], { sw: 6, color: '#c8c8d0' }) + [190, 310, 440].map((x) => dot(x, 386, 6, C.brass)).join('');
  o += line([[150, 346], [190, 386]], { sw: 6, color: '#9a9aa8' });
  // 연결 고리
  o += line([[540, 340], [580, 340]], { sw: 8, color: C.iron2 }) + part(ellPts(560, 340, 10, 7, 0, Math.PI * 2, 10), C.iron, { sw: 1.4 });
  // 객차: 둥근 모서리 몸통, 금빛 줄무늬, 위가 둥근 창 + 커튼, 둥근 지붕과 환기창
  const cx0 = 570, cx1 = 1260;
  o += part([[cx0 + 10, 110], [cx1 - 10, 110], [cx1, 130], [cx1, 360], [cx1 - 10, 372], [cx0 + 10, 372], [cx0, 360], [cx0, 130]], '#7a4a8a', { sw: 2.8, heavy: [2, 4], shade: [[cx0 - 6, 300], [cx1 + 6, 300], [cx1 + 6, 380], [cx0 - 6, 380]], shadeCol: 'rgba(30,0,40,0.3)' });
  o += line([[cx0 + 6, 290], [cx1 - 6, 290]], { sw: 3, color: C.brass }) + line([[cx0 + 6, 146], [cx1 - 6, 146]], { sw: 2, color: C.brass, op: 0.8 });
  for (let i = 0; i < 6; i++) o += `<path d="${S(roundRectPts(cx0 + 20 + i * 92, 306, 72, 50, 8), 0.3)}" fill="none" stroke="#5a3a6a" stroke-width="2"/>`;
  o += part([[cx0 - 14, 116], [cx0 + 20, 82], [(cx0 + cx1) / 2, 66], [cx1 - 20, 82], [cx1 + 14, 116], [cx1 + 4, 124], [cx0 - 4, 124]], C.iron, { sw: 2.6, heavy: [0, 2], light: [[cx0 + 30, 86], [(cx0 + cx1) / 2, 72], [cx1 - 30, 86], [(cx0 + cx1) / 2, 80]] });
  for (const x of [700, 860, 1020, 1160]) o += part(roundRectPts(x, 58, 40, 18, 6), C.iron2, { sw: 1.6 });
  for (let i = 0; i < 4; i++) {
    const wx = 610 + i * 136, ww = 104;
    o += part([[wx, 270], [wx, 186], [wx + 10, 166], [wx + ww / 2, 158], [wx + ww - 10, 166], [wx + ww, 186], [wx + ww, 270]], '#fff3b0', { sw: 2.4, extra: `<path d="${S([[wx, 160], [wx + ww * 0.3, 160], [wx + ww * 0.22, 210], [wx + 6, 268], [wx, 268]], 0.3)}" fill="${C.red}" opacity="0.85"/><path d="${S([[wx + ww, 160], [wx + ww * 0.7, 160], [wx + ww * 0.78, 210], [wx + ww - 6, 268], [wx + ww, 268]], 0.3)}" fill="${C.red}" opacity="0.85"/>` });
    o += line([[wx - 4, 272], [wx + ww + 4, 272]], { sw: 5, color: C.brass2 });
  }
  // 문 (위쪽 작은 창, 손잡이, 발판)
  o += part([[1170, 372], [1170, 170], [1180, 156], [1230, 156], [1240, 170], [1240, 372]], '#5a3a6a', { sw: 2.4 }) + part(roundRectPts(1184, 180, 42, 50, 10), '#fff3b0', { sw: 1.8 }) + dot(1182, 280, 5, C.brass);
  o += part([[1160, 372], [1250, 372], [1246, 390], [1164, 390]], C.iron2, { sw: 1.6 });
  // 대차 (작은 바퀴 둘씩)
  for (const bx of [700, 1060]) { o += part(roundRectPts(bx - 80, 366, 160, 26, 8), C.iron2, { sw: 2 }); for (const dx of [-46, 46]) o += wheel(bx + dx, 392, 30, C.iron, 8); }
  put('props/train.svg', 1300, 420, o, { id: 1932, displace: 1.4, vb: '0 -180 1300 600' });
}

/* ───────────── 서쪽: 역 밖 (눈 더미, 삽, 선로 전환기) ───────────── */
function bgWest() {
  seed(1941);
  let o = snowScape(-10, -10, W + 20, H + 20, {});
  // 역 건물 벽 (오른쪽) + 문
  o += part([[1180, -10], [1610, -10], [1610, 700], [1180, 700]], C.wall, { sw: 2.4 });
  for (let x = 1190; x < 1600; x += 50) o += line([[x, -10], [x, 700]], { sw: 1.4, color: C.wall2 });
  o += part([[1226, 704], [1226, 250], [1434, 250], [1434, 704]], C.wood2, { sw: 2.4 }) + part(roundRectPts(1240, 266, 180, 438, 8), C.woodD, { sw: 2.4, heavy: [3, 8], light: [[1246, 276], [1262, 276], [1262, 690], [1246, 690]] });
  for (const [px, py, ph] of [[1258, 300, 160], [1338, 300, 160], [1258, 490, 180], [1338, 490, 180]]) o += `<path d="${S(roundRectPts(px, py, 64, ph, 6), 0.3)}" fill="none" stroke="${INK}" stroke-width="1.6" opacity="0.6"/>`;
  o += part(ellPts(1400, 480, 10, 10, 0, Math.PI * 2, 10), C.brass, { sw: 1.6 }) + part(roundRectPts(1392, 498, 16, 26, 4), C.brass2, { sw: 1.2 });
  o += `<path d="${S([[1180, 0], [1610, 0], [1610, 40], [1180, 40]], 0.5)}" fill="${C.snow}"/>`;
  // 눈 덮인 땅
  o += fill(wob([[-10, 620], [1180, 620], [1180, 910], [-10, 910]], { sharp: true }), C.snow2);
  for (let i = 0; i < 10; i++) { const w = rand(90, 220); o += mound({ cx: rand(0, 1160), by: rand(720, 890), w, h: w * rand(0.14, 0.22), bumps: 2, sparkle: false }); }
  // 선로 전환기 받침 (손잡이와 번호판은 소품)
  o += part([[896, 704], [1084, 704], [1086, 690], [1070, 682], [1064, 650], [1050, 638], [930, 638], [916, 650], [910, 682], [894, 690]], C.iron, { sw: 2.2, heavy: [0, 3], light: [[930, 642], [1050, 642], [1056, 652], [924, 652]] });
  for (const x of [920, 1060]) o += dot(x, 694, 3, '#8a8a98');
  o += line([[980, 640], [960, 900]], { sw: 10, color: '#5a5a66' }) + line([[1000, 640], [1060, 900]], { sw: 10, color: '#5a5a66' });
  o += line([[780, 260], [784, 700]], { sw: 10, color: C.iron }) + part([[752, 220], [812, 220], [804, 270], [760, 270]], C.iron2, { sw: 2 }) + dot(782, 246, 12, '#fff3b0') + `<circle cx="782" cy="246" r="40" fill="#fff3b0" opacity="0.25" filter="url(#blur)"/>`;
  // 나무 썰매: 앞이 둥글게 말린 빨간 날 두 줄 + 판자 세 장 + 끈
  for (const [dy, op] of [[-10, 0.7], [0, 1]]) o += `<path d="${O([[90, 842 + dy], [130, 848 + dy], [330, 840 + dy], [362, 828 + dy], [372, 808 + dy], [360, 796 + dy], [348, 806 + dy]], 0.5)}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" opacity="${op}"/><path d="${O([[90, 842 + dy], [130, 848 + dy], [330, 840 + dy], [362, 828 + dy], [372, 808 + dy], [360, 796 + dy], [348, 806 + dy]], 0.5)}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round" opacity="${op}"/>`;
  for (const x of [140, 220, 300]) o += line([[x, 810], [x + 2, 844]], { sw: 5, color: '#a83a30' });
  for (const [y, x0, x1] of [[796, 104, 336], [808, 100, 340], [820, 96, 344]]) o += part([[x0, y], [x1, y - 4], [x1 + 2, y + 8], [x0 + 2, y + 12]], y === 808 ? C.wood2 : C.wood, { sw: 1.6 });
  o += `<path d="${O([[344, 800], [380, 780], [420, 800], [440, 840]], 0.6)}" fill="none" stroke="${C.rope || '#c9a46a'}" stroke-width="3"/>`;
  o += `<path d="${S([[110, 794], [200, 788], [320, 790], [300, 784], [180, 782]], 0.5)}" fill="${C.snow}"/>`;
  for (let i = 0; i < 9; i++) o += part(ellPts(560 + i * 70, 860 - i * 22 + (i % 2) * 12, 12, 7, 0, Math.PI * 2, 8), '#c8d0e0', { sw: 0.8 });
  put('bg/west.svg', W, H, o, { id: 1941 });
}
function snowPile(dug) {
  seed(1942);
  let o = '';
  if (!dug) { o += mound({ cx: 240, by: 282, w: 420, h: 230, bumps: 4 }); }
  else {
    o += mound({ cx: 96, by: 260, w: 180, h: 110, bumps: 2 }) + mound({ cx: 396, by: 256, w: 170, h: 100, bumps: 2 });
    o += barrel({ cx: 245, by: 236, w: 150, h: 112, col: '#4a4a56', dark: '#2a2a32', hoopCol: '#6a6a78', top: C.coal });
    o += `<path d="${O([[176, 140], [200, 86], [290, 86], [314, 140]], 0.4)}" fill="none" stroke="${INK}" stroke-width="5"/>`;
    for (let i = 0; i < 9; i++) o += part(blobPts(196 + (i % 4) * 32 + (i > 3 ? 14 : 0), 122 - Math.floor(i / 4) * 14, 17, 12, { n: 9, k: 0.25 }), i % 3 ? C.coal : '#3a3438', { sw: 1.2, light: [[190 + (i % 4) * 32, 112 - Math.floor(i / 4) * 14], [204 + (i % 4) * 32, 110 - Math.floor(i / 4) * 14], [200 + (i % 4) * 32, 116 - Math.floor(i / 4) * 14]] });
  }
  put(`props/snow_${dug ? 'dug' : 'pile'}.svg`, 480, 300, o, { id: 1942, displace: 1.2 });
}
function shovel() {
  seed(1943);
  const o = line([[60, 20], [64, 300]], { sw: 12, color: C.woodD, step: 999 }) + line([[60, 20], [64, 300]], { sw: 7, color: C.wood, step: 999 }) + part([[40, 10], [84, 10], [80, 30], [44, 30]], C.woodD, { sw: 1.6 }) + part([[20, 300], [108, 296], [100, 390], [64, 410], [28, 392]], '#9aa4b0', { sw: 2.4, heavy: [1, 2] });
  put('props/shovel.svg', 130, 420, o, { id: 1943, displace: 1 });
}
function lever(n) {
  seed(1944);
  // 220x340: 손잡이 각도 + 번호판(손글씨 숫자)
  const ang = { 1: -0.5, 2: 0, 3: 0.5 }[n];
  let o = part([[50, 334], [170, 334], [166, 318], [152, 312], [150, 262], [134, 248], [86, 248], [70, 262], [68, 312], [54, 318]], C.iron2, { sw: 2.2, heavy: [0, 2], light: [[86, 252], [134, 252], [140, 262], [80, 262]] }) + [80, 140].map((x) => dot(x, 322, 3, '#8a8a98')).join('') + part(roundRectPts(90, 280, 40, 8, 3), '#1a1a20', { sw: 1 });
  o += part(rectPts(70, 20, 80, 80), '#2a3a5a', { sw: 2.4 }) + digits(n, 110, 86, 50, { color: '#f6d060', sw: 7 });
  const tip = [110 + Math.sin(ang) * 150, 260 - Math.cos(ang) * 150];
  o += line([[110, 260], tip], { sw: 14, color: C.iron, step: 999 }) + part(ellPts(tip[0], tip[1], 20, 20, 0, Math.PI * 2, 12), C.red, { sw: 2 });
  for (const k of [1, 2, 3]) { const a = { 1: -0.5, 2: 0, 3: 0.5 }[k]; o += dot(110 + Math.sin(a) * 110, 260 - Math.cos(a) * 110, 5, '#e8e8f0'); }
  put(`props/lever_${n}.svg`, 220, 340, o, { id: 1944, displace: 1 });
}

/* ───────────── 확대 화면 · 아이템 · 틀 ───────────── */
function zoomTimetable() {
  seed(1951);
  const o = snowScape(-10, -10, W + 20, H + 20, { board: true });
  put('zoom/timetable.svg', W, H, o, { id: 1951, displace: 2 });
}
function items() {
  seed(1960);
  const it = (n, b) => put(`items/${n}.svg`, 160, 160, b, { id: 1960, displace: 1 });
  it('shovel', line([[40, 20], [96, 100]], { sw: 10, color: C.woodD, step: 999 }) + part([[80, 90], [128, 80], [140, 130], [104, 148]], '#9aa4b0', { sw: 2.2 }));
  it('coal', [0, 1, 2, 3, 4].map((i) => part(blobPts(50 + (i % 3) * 30, 100 - Math.floor(i / 3) * 26, 22, 17, { n: 9, k: 0.25 }), i % 2 ? C.coal : '#3a3438', { sw: 1.8, heavy: [1, 3], light: [[40 + (i % 3) * 30, 92 - Math.floor(i / 3) * 26], [58 + (i % 3) * 30, 88 - Math.floor(i / 3) * 26], [52 + (i % 3) * 30, 96 - Math.floor(i / 3) * 26]] })).join('') + [0, 1, 2].map(() => dot(rand(40, 120), rand(70, 120), 2, '#6a6a70')).join(''));
  it('flower', line([[80, 150], [82, 70]], { sw: 4, color: '#5a8a4a' }) + part([[82, 120], [118, 100], [108, 126]], '#6aa05a', { sw: 1.4 }) + [0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return part([[82, 56], [82 + Math.cos(a - 0.4) * 30, 56 + Math.sin(a - 0.4) * 30], [82 + Math.cos(a) * 42, 56 + Math.sin(a) * 42], [82 + Math.cos(a + 0.4) * 30, 56 + Math.sin(a + 0.4) * 30]], '#f0a0b8', { sw: 1.6 }); }).join('') + part(ellPts(82, 56, 12, 12, 0, Math.PI * 2, 10), '#f6d060', { sw: 1.4 }));
  // 기차표: 도착지 칸에 지붕과 둥근 창 그림 (다락방)
  it('ticket', part([[14, 44], [146, 36], [150, 120], [18, 128]], '#f6e2a0', { sw: 2.4, heavy: [1, 2] }) + line([[100, 40], [104, 124]], { sw: 1.6, op: 0.5 }) + `<path d="${S([[30, 106], [30, 84], [58, 62], [86, 84], [86, 106]], 0.3)}" fill="#c4704a" stroke="${INK}" stroke-width="1.8"/><circle cx="58" cy="90" r="7" fill="#f6d060" stroke="${INK}" stroke-width="1.4"/>` + dot(124, 80, 8, 'none') + `<circle cx="124" cy="80" r="9" fill="none" stroke="${C.red}" stroke-width="2.4"/>`);
}
function frame() {
  seed(1970);
  let o = '';
  for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]]) {
    o += `<path d="M${cx} ${cy} L${cx + sx * 170} ${cy} Q${cx + sx * 70} ${cy + sy * 40} ${cx} ${cy + sy * 130}Z" fill="#eef4fb" opacity="0.7"/>`;
    for (let i = 0; i < 5; i++) { const x = cx + sx * rand(10, 140), y = cy + sy * rand(10, 100), r = rand(10, 24); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; o += line([[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { sw: 1.4, color: '#c8d8ec' }); } }
  }
  for (let i = 0; i < 40; i++) o += dot(rand(0, W), rand(0, H), rand(1.5, 3.5), '#ffffff', 0.8);
  put('bg/frame.svg', W, H, o, { id: 1970, displace: 1 });
}

bgNorth(); stoveFire(); bear('sleep'); bear('awake'); zzz();
bgEast(); frost(); flower('bud'); flower('bloom'); flower('empty');
bgSouth(); train(); bgWest(); snowPile(false); snowPile(true); shovel(); [1, 2, 3].forEach(lever);
zoomTimetable(); items(); frame();
console.log('station assets written, ~' + Math.round(total / 1024) + 'KB');
