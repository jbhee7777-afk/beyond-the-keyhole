// 방마다 다른 "카메라와 공간감"을 주는 앞쪽 틀 (퍼즐 좌표는 그대로, 화면 가장자리만 바꾼다)
// node tools/art/frames.mjs
//  2장 공방      → 커다란 인형의 집을 앞에서 들여다보는 단면 (지붕 처마, 기둥, 바닥 판)
//  3장 다락방    → 바닥에 앉아 올려다보는 시점: 코앞의 굵은 서까래와 들보, 늘어진 거미줄
//  4장 거꾸로 방 → 하늘에 둥둥 뜬 볼록한 방: 모서리 밖으로 하늘과 구름
//  5장 우체국    → 둥근 잠수 돔 안: 리벳 박힌 쇠 테두리 너머로 방이 보인다
import { seed, rand, pick, INK, wob, line, svg, ellPts, smooth } from './ink.mjs';
import { part, S } from './chars.mjs';

const W = 1600, H = 900;
const ROOT = new URL('../../assets/rooms/', import.meta.url).pathname;
const P = (pts) => 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L') + 'Z';
const dot = (x, y, r, c, op = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const OUTER = [[-10, -10], [W + 10, -10], [W + 10, H + 10], [-10, H + 10]];

/* ── 2장: 인형의 집 단면 ── */
function dollhouse() {
  seed(1201);
  const C = { wood: '#c98a5a', wood2: '#a86e45', cream: '#f4e6c8', pink: '#e9a3a8', teal: '#6fb0a8', teal2: '#4f8f88', roof: '#d9705f', roof2: '#b4524a' };
  let o = '';
  // 바닥 판 (방 앞쪽 끝이 잘린 단면)
  o += part([[0, 868], [W, 868], [W, 910], [0, 910]], C.wood2, { sw: 2.4, heavy: [0, 1] });
  o += part([[0, 858], [W, 858], [W, 872], [0, 872]], C.cream, { sw: 1.6 });
  for (let x = 40; x < W; x += 120) o += line([[x, 874], [x + 2, 906]], { sw: 1.2, op: 0.5 });
  // 양쪽 기둥 (사탕 줄무늬 칠)
  for (const side of [0, 1]) {
    const X = (x) => (side ? W - x : x);
    o += part([[X(-6), 60], [X(40), 60], [X(40), 870], [X(-6), 870]], C.cream, { sw: 2.4, heavy: side ? [3, 0] : [1, 2] });
    for (let y = 80; y < 860; y += 46) o += `<path d="${P([[X(0), y], [X(40), y - 26], [X(40), y - 12], [X(0), y + 14]])}" fill="${C.pink}" opacity="0.85"/>`;
    o += line([[X(40), 62], [X(40), 868]], { sw: 2.4 });
    // 경첩 (인형의 집 앞판이 열린 자리)
    for (const y of [220, 640]) o += part([[X(40), y], [X(58), y], [X(58), y + 50], [X(40), y + 50]], '#c9a24a', { sw: 1.4 }) + dot(X(49), y + 12, 2.2, INK) + dot(X(49), y + 38, 2.2, INK);
  }
  // 지붕 처마: 비늘 기와 + 물결 장식판
  o += part([[-10, -10], [W + 10, -10], [W + 10, 52], [-10, 52]], C.roof, { sw: 2.4 });
  for (let row = 0; row < 3; row++) for (let x = -20 + (row % 2) * 30; x < W + 40; x += 60) {
    const y = 4 + row * 16;
    o += `<path d="M${x - 28} ${y} Q${x - 28} ${y + 18} ${x} ${y + 20} Q${x + 28} ${y + 18} ${x + 28} ${y}" fill="${row % 2 ? C.roof2 : C.roof}" stroke="${INK}" stroke-width="1.3"/>`;
  }
  o += part([[-10, 50], [W + 10, 50], [W + 10, 66], [-10, 66]], C.teal, { sw: 2 });
  let sc = '';
  for (let x = 0; x < W; x += 40) sc += `<path d="M${x} 66 Q${x + 20} 94 ${x + 40} 66Z" fill="${C.cream}" stroke="${INK}" stroke-width="1.5"/>` + dot(x + 20, 76, 3, C.pink);
  o += sc;
  // 기와 위 작은 굴뚝과 깃발 (가운데는 나침반 자리라 비운다)
  o += part([[230, 50], [230, 6], [280, 6], [280, 50]], C.wood2, { sw: 1.8 }) + part([[222, 6], [288, 6], [288, -10], [222, -10]], C.wood, { sw: 1.6 });
  return o;
}

/* ── 3장: 올려다본 다락 서까래 ── */
function rafters() {
  seed(1301);
  const C = { b1: '#2e2119', b2: '#3d2c21', b3: '#4c382a', web: '#d9d6e0', iron: '#5a5560' };
  let o = '';
  const beam = (pts, col, grain = 6) => {
    let g = part(pts, col, { sw: 2.6, heavy: [1, 2], shade: [pts[2], pts[3], pts[0], pts[1]], shadeCol: 'rgba(0,0,0,0.35)' });
    const [a, b, c, d] = pts;
    for (let k = 1; k < grain; k++) { const t = k / grain; const p = [a[0] + (d[0] - a[0]) * t, a[1] + (d[1] - a[1]) * t], q = [b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t]; g += line([p, [(p[0] + q[0]) / 2 + rand(-6, 6), (p[1] + q[1]) / 2 + rand(-4, 4)], q], { sw: 1, color: '#1a120c', op: 0.55 }); }
    return g;
  };
  // 코앞의 굵은 대각선 서까래 (양쪽), 가로 들보
  o += beam([[-40, 300], [330, -40], [420, -40], [-40, 400]], C.b2);
  o += beam([[W + 40, 300], [W - 330, -40], [W - 420, -40], [W + 40, 400]], C.b2);
  o += beam([[-20, -20], [W + 20, -20], [W + 20, 40], [-20, 40]], C.b1, 3);
  // 들보를 잇는 쇠 띠와 못
  for (const x of [250, 1350]) o += part([[x - 30, 36], [x + 30, 36], [x + 30, 54], [x - 30, 54]], C.iron, { sw: 1.4 }) + dot(x - 18, 45, 3, '#2a2428') + dot(x + 18, 45, 3, '#2a2428');
  // 아래 모서리: 코앞 바닥 들보 끝 (어둡고 흐릿)
  o += `<g filter="url(#blur2)">` + part([[-20, 840], [260, 900], [-20, 910]], C.b1, { sw: 0 }) + part([[W + 20, 840], [W - 260, 900], [W + 20, 910]], C.b1, { sw: 0 }) + '</g>';
  // 들보에서 늘어진 거미줄 가닥과 작은 거미줄 부채
  for (const [x, len] of [[150, 130], [560, 70], [1060, 90], [1470, 150]]) {
    o += `<path d="M${x} 40 Q${x + 14} ${40 + len / 2} ${x + 4} ${40 + len}" stroke="${C.web}" stroke-width="1.2" fill="none" opacity="0.55"/>`;
    o += dot(x + 4, 40 + len, 2.4, C.web, 0.5);
  }
  for (const side of [0, 1]) {
    const cx = side ? W - 372 : 372, cy = 40, dir = side ? 1 : -1;
    for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + dir * (0.2 + k * 0.28); o += line([[cx, cy], [cx + Math.cos(a) * 90, cy + Math.sin(a) * 90]], { sw: 0.9, color: C.web, op: 0.45 }); }
    for (const r of [30, 60]) { const pts = []; for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + dir * (0.2 + k * 0.28); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } o += line(pts, { sw: 0.8, color: C.web, op: 0.4, step: 999 }); }
  }
  return o;
}

/* ── 4장: 하늘에 뜬 볼록한 방 ── */
function skybox() {
  seed(1401);
  const C = { sky: '#9cc6e4', sky2: '#b9d8ee', cloud: '#f7f3ea', rim: '#f3e2c4', rim2: '#d9b98e' };
  const edge = [];
  const top = (x) => { const u = (x - 800) / 800; return 64 - 52 * (1 - u * u); };
  const side = (y) => { const v = (y - 450) / 450; return 58 - 44 * (1 - v * v); };
  for (let x = 0; x <= W; x += 40) edge.push([x * 0.94 + 48, top(x)]);
  for (let y = 0; y <= H; y += 40) edge.push([W - side(y), y * 0.88 + 54]);
  for (let x = W; x >= 0; x -= 40) edge.push([x * 0.94 + 48, H - top(x)]);
  for (let y = H; y >= 0; y -= 40) edge.push([side(y), y * 0.88 + 54]);
  const hole = smooth(edge, true);
  let o = `<path d="${P(OUTER)} ${hole}" fill="${C.sky}" fill-rule="evenodd"/>`;
  // 하늘 쪽 구름과 거꾸로 나는 새 (모서리에만)
  const cloud = (x, y, s) => `<path d="${S([[x - 40 * s, y], [x - 34 * s, y - 16 * s], [x - 14 * s, y - 22 * s], [x, y - 34 * s], [x + 22 * s, y - 28 * s], [x + 34 * s, y - 14 * s], [x + 44 * s, y], [x + 30 * s, y + 8 * s], [x - 30 * s, y + 8 * s]], 0.4 * s)}" fill="${C.cloud}" stroke="${INK}" stroke-width="1.2"/>`;
  o += `<clipPath id="out"><path d="${P(OUTER)} ${hole}" clip-rule="evenodd"/></clipPath><g clip-path="url(#out)">`;
  for (const [x, y, s] of [[40, 30, 0.9], [150, 10, 0.6], [1530, 36, 0.9], [1440, 8, 0.55], [50, 880, 0.8], [1550, 870, 0.9], [8, 460, 0.5], [1594, 420, 0.5]]) o += cloud(x, y, s);
  for (const [x, y] of [[96, 70], [1500, 86]]) o += `<path d="M${x - 12} ${y} Q${x - 6} ${y + 8} ${x} ${y} Q${x + 6} ${y + 8} ${x + 12} ${y}" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
  o += '</g>';
  // 방 단면 테두리 (회벽 두께)
  o += `<path d="${hole}" fill="none" stroke="${C.rim2}" stroke-width="16"/>`;
  o += `<path d="${hole}" fill="none" stroke="${C.rim}" stroke-width="9"/>`;
  o += `<path d="${hole}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  return o;
}

/* ── 5장: 둥근 잠수 돔 창 ── */
function dome() {
  seed(1501);
  const C = { iron: '#1d3440', iron2: '#284858', brass: '#c9a24a', brass2: '#8f6d28', rivet: '#e6c977' };
  const ring = (rx, ry) => ellPts(800, 450, rx, ry, 0, Math.PI * 2, 96);
  const hole = (rx, ry) => P(ring(rx, ry));
  let o = `<path d="${P(OUTER)} ${hole(838, 548)}" fill="${C.iron}" fill-rule="evenodd"/>`;
  // 쇠판 이음매와 빗금 그늘
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; const p = [800 + Math.cos(a) * 860, 450 + Math.sin(a) * 570], q = [800 + Math.cos(a) * 1300, 450 + Math.sin(a) * 900]; o += line([p, q], { sw: 1.6, color: '#0e1e26', op: 0.8 }); }
  o += `<path d="${P(OUTER)} ${hole(900, 600)}" fill="url(#hatch2)" fill-rule="evenodd" opacity="0.35"/>`;
  // 황동 테두리 두 겹 + 리벳
  o += `<path d="${hole(852, 560)} ${hole(830, 540)}" fill="${C.brass}" fill-rule="evenodd" stroke="${INK}" stroke-width="2"/>`;
  o += `<path d="${hole(868, 574)} ${hole(852, 560)}" fill="${C.brass2}" fill-rule="evenodd" stroke="${INK}" stroke-width="1.6"/>`;
  for (let k = 0; k < 44; k++) { const a = k * Math.PI * 2 / 44; o += dot(800 + Math.cos(a) * 860, 450 + Math.sin(a) * 567, 4, C.rivet) + `<circle cx="${(800 + Math.cos(a) * 860).toFixed(1)}" cy="${(450 + Math.sin(a) * 567).toFixed(1)}" r="4" fill="none" stroke="${INK}" stroke-width="1"/>`; }
  // 유리 반사 (돔 안쪽 위 가장자리를 따라 흐린 빛)
  o += `<path d="M180 260 Q420 40 820 22" stroke="#e8f6ff" stroke-width="10" fill="none" opacity="0.18" stroke-linecap="round"/>`;
  o += `<path d="M1380 700 Q1300 820 1160 870" stroke="#e8f6ff" stroke-width="6" fill="none" opacity="0.12" stroke-linecap="round"/>`;
  // 쇠판 위 작은 계기판 (모서리 장식)
  for (const [x, y] of [[70, 830]]) o += `<circle cx="${x}" cy="${y}" r="34" fill="#efe3c6" stroke="${INK}" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="38" fill="none" stroke="${C.brass}" stroke-width="5"/>` + line([[x, y], [x + 18, y - 14]], { sw: 2.4, color: '#a8402f' }) + dot(x, y, 3, INK);
  return o;
}

const out = [
  ['toyshop/bg/frame.svg', dollhouse, 1201],
  ['clock13/bg/frame.svg', rafters, 1301],
  ['upside/bg/frame.svg', skybox, 1401],
  ['sea/bg/frame.svg', dome, 1501],
];
for (const [rel, fn, id] of out) svg(ROOT + rel, W, H, fn(), { id, displace: 2 });
console.log('frames written');
