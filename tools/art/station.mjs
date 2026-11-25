// 9장 「겨울잠 기차역」 그래픽 에셋 생성기
// node tools/art/station.mjs  → assets/rooms/station/**
// 분위기: 눈 쌓인 작은 시골 기차역. 처음엔 푸르스름하게 춥고, 난로를 피우면 주황빛으로 포근해진다.
import { digits, seed, rand, pick, INK, wob, rect, rectPts, ellPts, fill, line, hatch, svg } from './ink.mjs';
import { part, S, O, bearArt } from './chars.mjs';

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
const snowLump = (cx, cy, rx, ry) => part(lumpPts(cx, cy, rx, ry), C.snow, { sw: 2, heavy: [2, 5], shade: [[cx - rx, cy + ry * 0.1], [cx + rx, cy + ry * 0.1], [cx + rx, cy + ry * 1.2], [cx - rx, cy + ry * 1.2]], shadeCol: C.snowS, hatch: false });

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
  o += part([[150, 700], [370, 700], [380, 420], [140, 420]], C.iron, { sw: 2.8, heavy: [1, 2], shade: [[300, 420], [380, 420], [380, 700], [300, 700]], shadeCol: 'rgba(0,0,0,0.3)' });
  o += part([[130, 420], [390, 420], [384, 392], [136, 392]], C.iron2, { sw: 2.2 });
  o += part([[200, 470], [320, 470], [320, 600], [200, 600]], '#1a1a20', { sw: 2.4 });
  for (let x = 214; x < 320; x += 18) o += line([[x, 476], [x, 594]], { sw: 3, color: C.iron });
  o += part([[236, 392], [284, 392], [284, -10], [236, -10]], C.iron, { sw: 2.2, heavy: [1, 2] });
  for (const y of [120, 260]) o += part([[228, y], [292, y], [292, y + 14], [228, y + 14]], C.iron2, { sw: 1.4 });
  for (const x of [160, 360]) o += part([[x - 10, 700], [x + 10, 700], [x + 6, 730], [x - 6, 730]], C.iron2, { sw: 1.4 });
  // 안락의자 (곰곰이는 소품)
  o += part([[540, 700], [520, 430], [560, 330], [800, 300], [1040, 330], [1080, 430], [1060, 700]], '#6a8aa8', { sw: 2.8, heavy: [4, 6], shade: [[900, 300], [1080, 300], [1080, 700], [900, 700]], shadeCol: 'rgba(0,20,50,0.22)' });
  o += part([[500, 520], [600, 500], [610, 720], [510, 730]], '#7a9ab8', { sw: 2.2 }) + part([[1000, 500], [1100, 520], [1090, 730], [990, 720]], '#7a9ab8', { sw: 2.2 });
  for (const x of [560, 1040]) o += part([[x - 10, 720], [x + 10, 720], [x + 8, 760], [x - 8, 760]], C.woodD, { sw: 1.6 });
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
  for (let i = 0; i < 6; i++) { const x = 214 + i * 18; o += `<path d="${S([[x - 8, 598], [x + 8, 598], [x + 4, 540 - rand(0, 30)], [x, 520 - rand(0, 30)], [x - 4, 540 - rand(0, 30)]], 0.4)}" fill="${i % 2 ? C.fire : C.fire2}"/>`; }
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
  o += part([[880, 650], [1060, 650], [1056, 560], [884, 560]], '#8a4a3a', { sw: 2.2, heavy: [1, 2] }) + part([[940, 560], [1000, 560], [996, 540], [944, 540]], 'none', { sw: 3 }) + line([[884, 600], [1056, 600]], { sw: 3, color: C.brass });
  o += part([[1120, 650], [1200, 650], [1196, 520], [1124, 520]], C.red, { sw: 2.2, heavy: [1, 2] }) + part(ellPts(1160, 520, 40, 18, Math.PI, Math.PI * 2, 12).concat([[1200, 520], [1120, 520]]), C.red, { sw: 2 }) + part([[1136, 560], [1184, 560], [1184, 570], [1136, 570]], '#2a2a32', { sw: 1.2 });
  o += `<path d="${S([[1118, 512], [1202, 512], [1196, 500], [1124, 500]], 0.4)}" fill="${C.snow}"/>`;
  put('bg/south.svg', W, H, o, { id: 1931 });
}
function train() {
  seed(1932);
  // 1300x420: 증기 기관차 + 객차 한 칸, 별 모양 등
  let o = `<path d="${S([[20, 410], [1280, 410], [1270, 420], [30, 420]])}" fill="${INK}" opacity="0.25"/>`;
  o += part([[40, 380], [520, 380], [520, 160], [380, 150], [380, 60], [300, 60], [300, 150], [60, 160]], C.blue, { sw: 2.8, heavy: [5, 7], shade: [[420, 150], [520, 150], [520, 380], [420, 380]], shadeCol: 'rgba(0,0,30,0.3)' });
  o += part([[300, 60], [380, 60], [390, 30], [290, 30]], C.iron, { sw: 2 });
  o += part(ellPts(150, 270, 90, 90, 0, Math.PI * 2, 20), C.iron2, { sw: 2.4 });
  const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; st.push([150 + Math.cos(a) * (i % 2 ? 22 : 48), 270 + Math.sin(a) * (i % 2 ? 22 : 48)]); }
  o += part(st, '#f6d060', { sw: 2 }) + `<circle cx="150" cy="270" r="70" fill="#fff3b0" opacity="0.3" filter="url(#blur)"/>`;
  o += part([[400, 180], [500, 180], [500, 260], [400, 260]], '#f6d060', { sw: 2 });
  for (const x of [120, 280, 440]) o += part(ellPts(x, 380, 46, 46, 0, Math.PI * 2, 16), C.red, { sw: 2.2 }) + dot(x, 380, 10, C.iron);
  o += line([[120, 380], [440, 380]], { sw: 8, color: C.iron });
  // 객차
  o += part([[560, 380], [1260, 380], [1250, 110], [570, 110]], '#7a4a8a', { sw: 2.8, heavy: [1, 2] });
  o += part([[560, 120], [1260, 120], [1240, 90], [580, 90]], C.iron, { sw: 2 });
  for (let i = 0; i < 4; i++) o += part(rectPts(610 + i * 150, 160, 110, 100), '#fff3b0', { sw: 2 }) + line([[665 + i * 150, 160], [665 + i * 150, 260]], { sw: 3, color: '#7a4a8a' });
  o += part([[1150, 150], [1220, 150], [1220, 370], [1150, 370]], '#5a3a6a', { sw: 2 }) + dot(1162, 270, 5, C.brass);
  for (const x of [660, 1160]) o += part(ellPts(x, 390, 34, 34, 0, Math.PI * 2, 14), C.iron2, { sw: 2 });
  // 연기 (김)
  for (let i = 0; i < 4; i++) o += snowLump(340 - i * 50, 10 - i * 40, 40 + i * 10, 26 + i * 6);
  put('props/train.svg', 1300, 420, o, { id: 1932, displace: 1.4, vb: '0 -180 1300 600' });
}

/* ───────────── 서쪽: 역 밖 (눈 더미, 삽, 선로 전환기) ───────────── */
function bgWest() {
  seed(1941);
  let o = snowScape(-10, -10, W + 20, H + 20, {});
  // 역 건물 벽 (오른쪽) + 문
  o += part([[1180, -10], [1610, -10], [1610, 700], [1180, 700]], C.wall, { sw: 2.4 });
  for (let x = 1190; x < 1600; x += 50) o += line([[x, -10], [x, 700]], { sw: 1.4, color: C.wall2 });
  o += part([[1240, 260], [1420, 260], [1420, 700], [1240, 700]], C.woodD, { sw: 2.4 }) + dot(1400, 480, 8, C.brass);
  o += `<path d="${S([[1180, 0], [1610, 0], [1610, 40], [1180, 40]], 0.5)}" fill="${C.snow}"/>`;
  // 눈 덮인 땅
  o += fill(wob([[-10, 620], [1180, 620], [1180, 910], [-10, 910]], { sharp: true }), C.snow2);
  for (let i = 0; i < 12; i++) o += snowLump(rand(0, 1160), rand(700, 880), rand(40, 100), rand(14, 26));
  // 선로 전환기 받침 (손잡이와 번호판은 소품)
  o += part([[900, 700], [1080, 700], [1070, 640], [910, 640]], C.iron, { sw: 2.2, heavy: [0, 1] });
  o += line([[980, 640], [960, 900]], { sw: 10, color: '#5a5a66' }) + line([[1000, 640], [1060, 900]], { sw: 10, color: '#5a5a66' });
  o += line([[780, 260], [784, 700]], { sw: 10, color: C.iron }) + part([[752, 220], [812, 220], [804, 270], [760, 270]], C.iron2, { sw: 2 }) + dot(782, 246, 12, '#fff3b0') + `<circle cx="782" cy="246" r="40" fill="#fff3b0" opacity="0.25" filter="url(#blur)"/>`;
  o += part([[100, 820], [330, 812], [340, 790], [110, 798]], C.wood, { sw: 2.2 }) + `<path d="${O([[80, 840], [120, 846], [350, 836], [370, 816]], 0.6)}" fill="none" stroke="${C.red}" stroke-width="6"/>` + line([[130, 800], [132, 842]], { sw: 4, color: C.red }) + line([[320, 792], [322, 836]], { sw: 4, color: C.red });
  for (let i = 0; i < 9; i++) o += part(ellPts(560 + i * 70, 860 - i * 22 + (i % 2) * 12, 12, 7, 0, Math.PI * 2, 8), '#c8d0e0', { sw: 0.8 });
  put('bg/west.svg', W, H, o, { id: 1941 });
}
function snowPile(dug) {
  seed(1942);
  let o = '';
  if (!dug) { o += snowLump(240, 170, 230, 120) + snowLump(150, 110, 120, 70) + snowLump(330, 120, 110, 60); }
  else {
    o += snowLump(90, 200, 90, 50) + snowLump(400, 190, 80, 50);
    o += part([[170, 230], [320, 230], [310, 120], [180, 120]], C.iron, { sw: 2.2, heavy: [1, 2] }) + line([[180, 130], [310, 130]], { sw: 4, color: '#5a5a66' });
    for (let i = 0; i < 8; i++) o += part(lumpPts(200 + (i % 4) * 30, 112 - Math.floor(i / 4) * 16, 16, 12, 8, 0.2), C.coal, { sw: 1.2 });
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
  let o = part([[60, 250], [160, 250], [160, 330], [60, 330]], C.iron2, { sw: 2.2 });
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
  it('coal', [0, 1, 2, 3, 4].map((i) => part(lumpPts(50 + (i % 3) * 30, 100 - Math.floor(i / 3) * 26, 22, 18, 8, 0.2), C.coal, { sw: 1.8, heavy: [1, 3] })).join('') + [0, 1, 2].map(() => dot(rand(40, 120), rand(70, 120), 2, '#6a6a70')).join(''));
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
