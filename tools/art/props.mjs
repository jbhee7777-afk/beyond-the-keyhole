// 자주 쓰는 소품을 "도형"이 아니라 손으로 그린 물건처럼 만드는 도구.
// 사다리꼴·직사각형·타원 하나로 끝내지 않고, 부풀어 오른 옆면, 두께(윗면·옆면), 판자 이음, 못, 흠집, 얼룩을 함께 그린다.
import { rand, INK, ellPts, line } from './ink.mjs';
import { part, S, O } from './chars.mjs';

const dot = (x, y, r, c, op = 1) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${(+r).toFixed(1)}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// 모서리가 둥근 사각형 윤곽 (변 가운데 점도 찍어 곧은 변이 부풀지 않게)
export function roundRectPts(x, y, w, h, r) {
  const p = [];
  const k = r > 24 ? 4 : 2;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= k; i++) { const a = a0 + i * Math.PI / 2 / k; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  // 곧은 변은 몇 칸으로 나눠 찍는다 (부드럽게 이어도 변이 휘지 않게)
  const edge = (x0, y0, x1, y1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 120)); for (let i = 1; i <= n; i++) p.push([x0 + (x1 - x0) * i / (n + 1), y0 + (y1 - y0) * i / (n + 1)]); };
  corner(x + w - r, y + r, -Math.PI / 2); edge(x + w, y + r, x + w, y + h - r);
  corner(x + w - r, y + h - r, 0); edge(x + w - r, y + h, x + r, y + h);
  corner(x + r, y + h - r, Math.PI / 2); edge(x, y + h - r, x, y + r);
  corner(x + r, y + r, Math.PI); edge(x + r, y, x + w - r, y);
  return p;
}

// 매끄럽게 출렁이는 반지름 (사인 몇 개를 더해 자연스러운 덩어리)
function blobPts(cx, cy, rx, ry, { n = 18, k = 0.22, flat = 0 } = {}) {
  const ph = [rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)];
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const m = 1 + k * (0.55 * Math.sin(a * 2 + ph[0]) + 0.3 * Math.sin(a * 3 + ph[1]) + 0.15 * Math.sin(a * 5 + ph[2]));
    let y = cy + Math.sin(a) * ry * m;
    if (flat && y > cy + ry * flat) y = cy + ry * flat + (y - cy - ry * flat) * 0.25;
    p.push([cx + Math.cos(a) * rx * m, y]);
  }
  return p;
}

/* 나무통: 배가 볼록한 옆면, 휘는 널빤지 선, 몸을 감싸는 쇠테, 둥근 윗면 */
export function barrel({ cx, by, w, h, col = '#8a5a36', dark = '#5a3a22', hoopCol = '#4a4a54', top = null, lid = true }) {
  const ry = w * 0.13, b = w * 0.07, ty = by - h, L = cx - w / 2, R = cx + w / 2;
  const half = (t) => w / 2 + b * Math.sin(Math.PI * t); // 높이 비율 t에서 옆 반폭
  const side = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6; side.push([cx - half(t), ty + h * t]); }
  const bottom = ellPts(cx, by, w / 2, ry, Math.PI, 0, 10).slice(1, -1);
  const right = []; for (let i = 6; i >= 0; i--) { const t = i / 6; right.push([cx + half(t), ty + h * t]); }
  const topFront = ellPts(cx, ty, w / 2, ry, 0, Math.PI, 10).slice(1, -1);
  const body = [...side, ...bottom, ...right, ...topFront];
  // 그늘: 오른쪽 1/3, 아래쪽
  const shade = [[cx + w * 0.12, ty - 10], [R + b + 10, ty - 10], [R + b + 10, by + ry + 10], [cx + w * 0.12, by + ry + 10]];
  let staves = '';
  for (let i = 1; i < 7; i++) {
    const u = -1 + i * 2 / 7, f = Math.sqrt(1 - u * u) * ry;
    staves += O([0, 0.5, 1].map((t) => [cx + u * half(t), ty + h * t + f]), 0.3);
  }
  let o = `<path d="${S([[L - 6, by + ry * 0.6], [R + 12, by + ry * 0.4], [R + 30, by + ry * 1.4], [L + 10, by + ry * 1.8]], 0.5)}" fill="${INK}" opacity="0.18"/>`;
  o += part(body, col, { sw: 2.4, heavy: [12, 21], shade, shadeCol: 'rgba(40,20,10,0.28)', extra: `<path d="${staves}" fill="none" stroke="${dark}" stroke-width="1.6" opacity="0.7"/>` + `<path d="${O([[L + w * 0.14, ty + h * 0.15], [L + w * 0.1, ty + h * 0.5], [L + w * 0.14, ty + h * 0.85]], 0.4)}" fill="none" stroke="#fff4dc" stroke-width="${w * 0.05}" opacity="0.22" stroke-linecap="round"/>` });
  // 쇠테 두 줄: 몸통 앞쪽 곡선을 따라
  for (const t of [0.17, 0.83]) {
    const yy = ty + h * t, hw = half(t);
    const band = []; for (let i = 0; i <= 10; i++) { const u = -1 + i / 5; band.push([cx + u * hw, yy + Math.sqrt(1 - u * u) * ry]); }
    o += `<path d="${O(band, 0.3)}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>` + `<path d="${O(band, 0.3)}" fill="none" stroke="${hoopCol}" stroke-width="6.5" stroke-linecap="round"/>`;
    for (const u of [-0.6, 0, 0.6]) o += dot(cx + u * hw, yy + Math.sqrt(1 - u * u) * ry, 1.8, '#c8c8d0');
  }
  // 윗면
  o += part(ellPts(cx, ty, w / 2 + 1, ry + 1, 0, Math.PI * 2, 18), dark, { sw: 2.2 });
  if (top) o += part(ellPts(cx, ty + 1, w / 2 - 8, ry - 3.5, 0, Math.PI * 2, 16), top, { sw: 1.4 }) + line([[cx - w * 0.22, ty - ry * 0.2], [cx + w * 0.05, ty - ry * 0.35]], { sw: 2, color: '#ffffff', op: 0.45 });
  else if (lid) {
    o += part(ellPts(cx, ty + 1, w / 2 - 6, ry - 3, 0, Math.PI * 2, 16), col, { sw: 1.4 });
    for (const u of [-0.35, 0.05, 0.4]) o += line([[cx + u * w * 0.5, ty - ry * 0.75 * Math.sqrt(1 - u * u)], [cx + u * w * 0.5, ty + ry * 0.75 * Math.sqrt(1 - u * u)]], { sw: 1.2, color: dark, op: 0.8 });
  }
  return o;
}

/* 나무 상자: 앞면 + 윗면 + 옆면(두께), 테두리 각목, 대각 버팀목, 못 */
export function crate({ x, by, w, h, d = 0, col = '#a8784e', dark = '#5a3a22', open = false, nails = true, brace = true }) {
  d = d || w * 0.22;
  const dx = d * 0.75, dy = -d * 0.55, ty = by - h, X2 = x + w;
  let o = `<path d="${S([[x - 4, by + 2], [X2 + dx + 6, by + dy + 4], [X2 + dx + 30, by + dy + 18], [x + 26, by + 16]], 0.5)}" fill="${INK}" opacity="0.18"/>`;
  // 옆면
  o += part([[X2, ty], [X2 + dx, ty + dy], [X2 + dx, by + dy], [X2, by]], col, { sw: 2.2, shade: [[X2 - 4, ty + dy - 4], [X2 + dx + 4, ty + dy - 4], [X2 + dx + 4, by + 4], [X2 - 4, by + 4]], shadeCol: 'rgba(40,20,10,0.32)' });
  // 윗면 (열린 상자는 안쪽이 어둡다)
  o += part([[x, ty], [x + dx, ty + dy], [X2 + dx, ty + dy], [X2, ty]], open ? '#3a2416' : col, { sw: 2, light: open ? null : [[x, ty + dy - 4], [X2 + dx, ty + dy - 4], [X2 + dx, ty + 4], [x, ty + 4]] });
  // 앞면 판자
  let planks = '';
  const n = Math.max(2, Math.round(h / 38));
  for (let i = 1; i < n; i++) planks += O([[x, ty + h * i / n + rand(-1, 1)], [X2, ty + h * i / n + rand(-1, 1)]], 0.3);
  let grain = '';
  for (let i = 0; i < Math.round(w * h / 1800); i++) { const gx = x + rand(14, w - 30), gy = ty + rand(8, h - 8); grain += O([[gx, gy], [gx + rand(10, 26), gy + rand(-1, 1)]], 0.2); }
  o += part([[x, ty], [X2, ty], [X2, by], [x, by]], col, { sw: 2.4, heavy: [1, 2], extra: `<path d="${planks}" fill="none" stroke="${dark}" stroke-width="1.6" opacity="0.8"/><path d="${grain}" fill="none" stroke="${dark}" stroke-width="1" opacity="0.4"/>` });
  // 테두리 각목 + 대각 버팀목
  const fw = Math.min(14, w * 0.09);
  const frameCol = mixHex(col, dark, 0.25);
  o += part([[x, ty], [x + fw, ty], [x + fw, by], [x, by]], frameCol, { sw: 1.6 }) + part([[X2 - fw, ty], [X2, ty], [X2, by], [X2 - fw, by]], frameCol, { sw: 1.6 });
  o += part([[x + fw, ty], [X2 - fw, ty], [X2 - fw, ty + fw], [x + fw, ty + fw]], frameCol, { sw: 1.4 }) + part([[x + fw, by - fw], [X2 - fw, by - fw], [X2 - fw, by], [x + fw, by]], frameCol, { sw: 1.4 });
  const a = [x + fw, by - fw], c = [X2 - fw, ty + fw], nrm = fw * 0.5;
  if (brace) o += part([[a[0], a[1] - nrm * 1.6], [c[0] - nrm * 1.6, c[1]], c, [c[0], c[1] + nrm * 1.6], [a[0] + nrm * 1.6, a[1]], a], frameCol, { sw: 1.4 });
  if (nails) for (const [nx, ny] of [[x + fw / 2, ty + fw / 2], [X2 - fw / 2, ty + fw / 2], [x + fw / 2, by - fw / 2], [X2 - fw / 2, by - fw / 2]]) o += dot(nx, ny, 2, '#2a2a30');
  return o;
}
function mixHex(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/* 바위: 울퉁불퉁한 윤곽, 빛 받는 윗면, 갈라진 틈, 이끼, 바닥에 닿는 물결 */
export function rock({ cx, cy, rx, ry, col = '#8a8478', light = '#c8c0a8', moss = null, water = null, sw = 2.2 }) {
  const pts = blobPts(cx, cy, rx, ry, { n: 11, k: 0.28, flat: 0.45 });
  let o = '';
  if (water) o += `<path d="${S(ellPts(cx, cy + ry * 0.55, rx * 1.25, ry * 0.42, 0, Math.PI * 2, 14), 0.6)}" fill="${water}" opacity="0.5"/>`;
  const top = [[cx - rx * 0.8, cy - ry * 0.15], [cx - rx * 0.35, cy - ry * 0.85], [cx + rx * 0.3, cy - ry * 0.9], [cx + rx * 0.75, cy - ry * 0.3], [cx + rx * 0.1, cy - ry * 0.05]];
  let cracks = O([[cx + rx * rand(-0.2, 0.2), cy - ry * 0.7], [cx + rx * rand(-0.05, 0.15), cy - ry * 0.25], [cx + rx * rand(0.1, 0.3), cy + ry * 0.2]], 0.3);
  cracks += O([[cx - rx * 0.6, cy + ry * 0.05], [cx - rx * 0.4, cy + ry * 0.25]], 0.3);
  o += part(pts, col, { sw, heavy: [2, 6], shade: [[cx - rx * 1.2, cy + ry * 0.1], [cx + rx * 1.3, cy - ry * 0.4], [cx + rx * 1.3, cy + ry * 1.3], [cx - rx * 1.2, cy + ry * 1.3]], shadeCol: 'rgba(20,20,40,0.3)', extra: `<path d="${S(top, 0.4)}" fill="${light}" opacity="0.55"/><path d="${cracks}" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.7" stroke-linecap="round"/>` });
  if (moss) for (let i = 0; i < 4; i++) { const mx = cx + rx * rand(-0.6, 0.5), my = cy - ry * rand(0.55, 0.8); o += `<path d="${S(blobPts(mx, my, rx * 0.16, ry * 0.12, { n: 8, k: 0.4 }), 0.3)}" fill="${moss}" stroke="${INK}" stroke-width="0.8" stroke-opacity="0.5"/>`; }
  if (water) o += `<path d="${O([[cx - rx * 1.1, cy + ry * 0.62], [cx - rx * 0.4, cy + ry * 0.78], [cx + rx * 0.5, cy + ry * 0.74], [cx + rx * 1.15, cy + ry * 0.58]], 0.5)}" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.45" stroke-linecap="round"/>`;
  return o;
}

/* 잉크 얼룩: 출렁이는 덩어리 + 튀긴 방울 + 흘러내린 자국 + 젖은 반짝임 */
export function splat({ cx, cy, r, col = '#262630', op = 0.9, drips = 2 }) {
  let o = `<path d="${S(blobPts(cx, cy, r, r * 0.9, { n: 20, k: 0.35 }), 0.4)}" fill="${col}" opacity="${op}"/>`;
  for (let i = 0; i < 2; i++) { const a = rand(0, 6.28); o += `<path d="${S(blobPts(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.6, r * 0.45, r * 0.38, { n: 12, k: 0.3 }), 0.3)}" fill="${col}" opacity="${op}"/>`; }
  for (let i = 0; i < 5; i++) { const a = rand(0, 6.28), dd = r * rand(1.3, 2.1), rr = r * rand(0.06, 0.16); o += `<path d="${S(blobPts(cx + Math.cos(a) * dd, cy + Math.sin(a) * dd, rr, rr, { n: 8, k: 0.3 }), 0.2)}" fill="${col}" opacity="${op}"/>`; }
  for (let i = 0; i < drips; i++) {
    const x0 = cx + r * rand(-0.5, 0.5), y0 = cy + r * 0.5, len = r * rand(0.9, 2.2), ww = r * rand(0.09, 0.16);
    o += `<path d="${S([[x0 - ww * 1.4, y0], [x0 - ww * 0.8, y0 + len * 0.5], [x0 - ww, y0 + len], [x0, y0 + len + ww * 1.3], [x0 + ww, y0 + len], [x0 + ww * 0.7, y0 + len * 0.5], [x0 + ww * 1.4, y0]], 0.2)}" fill="${col}" opacity="${op}"/>`;
  }
  o += `<path d="${O([[cx - r * 0.45, cy - r * 0.35], [cx - r * 0.15, cy - r * 0.55]], 0.2)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(2, r * 0.1).toFixed(1)}" stroke-linecap="round" opacity="0.3"/>`;
  return o;
}

/* 눈 더미: 울퉁불퉁 둥근 꼭대기, 바닥은 평평하게 땅에 붙고, 아래쪽은 푸른 그늘 + 반짝이 */
export function mound({ cx, by, w, h, col = '#f6f8fc', shadow = 'rgba(100,120,170,0.25)', bumps = 3, sparkle = true }) {
  // 둥근 눈 뭉치 몇 개가 겹친 꼭대기 (반원들의 위쪽 윤곽)
  const lumps = [];
  for (let i = 0; i < bumps; i++) { const u = bumps === 1 ? 0 : -0.5 + i / (bumps - 1); lumps.push([cx + u * w * 0.45 + rand(-w, w) * 0.04, w * rand(0.3, 0.4), h * (1 - Math.abs(u) * 0.5) * rand(0.9, 1)]); }
  const n = 22, top = [];
  for (let i = 0; i <= n; i++) {
    const x = cx - w / 2 + w * i / n;
    let yy = h * 0.06;
    for (const [lc, lr, lh] of lumps) { const q = (x - lc) / lr; if (Math.abs(q) < 1) yy = Math.max(yy, lh * Math.sqrt(1 - q * q)); }
    const env = Math.pow(Math.sin(Math.PI * i / n), 0.85);
    top.push([x, by - Math.min(yy, h * 1.05) * env]);
  }
  const base = [[cx + w / 2 + w * 0.04, by + 2], [cx + w * 0.2, by + h * 0.06], [cx - w * 0.25, by + h * 0.05], [cx - w / 2 - w * 0.04, by + 2]];
  const pts = [...top.slice(1, -1), ...base];
  let o = `<path d="${S([[cx - w * 0.5, by - 2], [cx + w * 0.62, by - 4], [cx + w * 0.55, by + h * 0.14], [cx - w * 0.4, by + h * 0.12]], 0.6)}" fill="${shadow}"/>`;
  o += part(pts, col, { sw: 1.8, shade: [[cx - w * 0.6, by - h * 0.18], [cx - w * 0.1, by - h * 0.3], [cx + w * 0.3, by - h * 0.5], [cx + w * 0.6, by - h * 0.7], [cx + w * 0.6, by + h], [cx - w * 0.6, by + h]], shadeCol: shadow, hatch: false, extra: `<path d="${O(top.slice(3, n - 2).map(([x, y]) => [x - 3, y + h * 0.07]), 0.3)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(3, h * 0.08).toFixed(1)}" opacity="0.8" stroke-linecap="round"/>` });
  if (sparkle) for (let i = 0; i < Math.max(2, Math.round(w / 60)); i++) { const sx = cx + w * rand(-0.35, 0.35), sy = by - h * rand(0.25, 0.7); o += line([[sx - 4, sy], [sx + 4, sy]], { sw: 1.2, color: '#ffffff' }) + line([[sx, sy - 4], [sx, sy + 4]], { sw: 1.2, color: '#ffffff' }); }
  return o;
}

/* 여행 가방: 둥근 모서리, 뚜껑 이음선, 가죽 끈과 버클, 놋쇠 모서리 덮개, 손잡이, 스티커 */
export function suitcase({ x, by, w, h, col = '#8a4a3a', strap = '#5a3a22', brass = '#d4a649', sticker = '#f4ecd8' }) {
  const y = by - h, r = Math.min(w, h) * 0.14;
  let o = `<path d="${S([[x, by - 2], [x + w + 14, by - 2], [x + w + 24, by + 10], [x + 10, by + 10]], 0.5)}" fill="${INK}" opacity="0.2"/>`;
  // 손잡이
  o += `<path d="${O([[x + w * 0.4, y + 2], [x + w * 0.42, y - h * 0.16], [x + w * 0.58, y - h * 0.16], [x + w * 0.6, y + 2]], 0.4)}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>` + `<path d="${O([[x + w * 0.4, y + 2], [x + w * 0.42, y - h * 0.16], [x + w * 0.58, y - h * 0.16], [x + w * 0.6, y + 2]], 0.4)}" fill="none" stroke="${strap}" stroke-width="5" stroke-linecap="round"/>`;
  o += part(roundRectPts(x, y, w, h, r), col, { sw: 2.4, heavy: [3, 9], shade: [[x + w * 0.7, y - 4], [x + w + 4, y - 4], [x + w + 4, by + 4], [x + w * 0.7, by + 4]], shadeCol: 'rgba(40,10,0,0.25)', light: [[x + 6, y + 6], [x + w * 0.6, y + 6], [x + w * 0.5, y + h * 0.18], [x + 6, y + h * 0.2]] });
  o += line([[x + 4, y + h * 0.3], [x + w - 4, y + h * 0.3]], { sw: 2, op: 0.6 });
  // 스티커 (끈 밑)
  o += part(roundRectPts(x + w * 0.08, y + h * 0.45, w * 0.24, h * 0.36, 6), sticker, { sw: 1.4 }) + `<path d="${S([[x + w * 0.2, y + h * 0.52], [x + w * 0.24, y + h * 0.66], [x + w * 0.16, y + h * 0.66]], 0.3)}" fill="#5a8a5a"/>`;
  o += `<path d="${S(blobPts(x + w * 0.74, y + h * 0.62, w * 0.08, w * 0.08, { n: 10, k: 0.1 }), 0.3)}" fill="#f6d060" stroke="${INK}" stroke-width="1.2"/>`;
  for (const fx of [0.36, 0.64]) {
    const sx = x + w * fx;
    o += part([[sx - 7, y - 1], [sx + 7, y - 1], [sx + 7, by + 1], [sx - 7, by + 1]], strap, { sw: 1.4 });
    o += part(roundRectPts(sx - 10, y + h * 0.22, 20, 16, 3), brass, { sw: 1.4 }) + line([[sx, y + h * 0.24], [sx, y + h * 0.36]], { sw: 1.4 });
  }
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, by, 1, -1], [x + w, by, -1, -1]]) {
    const k = Math.min(w, h) * 0.2;
    o += part([[cx, cy + sy * k], [cx, cy + sy * r * 0.4], [cx + sx * r * 0.3, cy + sy * r * 0.3], [cx + sx * r * 0.4, cy], [cx + sx * k, cy], [cx + sx * k * 0.6, cy + sy * 6], [cx + sx * 6, cy + sy * k * 0.6]], brass, { sw: 1.2 });
  }
  return o;
}

/* 종이 상자: 판지 두께, 벌어진 날개, 테이프, 찍힌 화살표, 구겨진 모서리 */
export function cardbox({ x, by, w, h, col = '#c89a62', dark = '#8a6438', open = true, tape = '#e8d8a8' }) {
  const d = w * 0.24, dx = d * 0.7, dy = -d * 0.5, ty = by - h, X2 = x + w;
  let o = `<path d="${S([[x - 4, by + 2], [X2 + dx + 6, by + dy + 4], [X2 + dx + 26, by + dy + 16], [x + 22, by + 14]], 0.5)}" fill="${INK}" opacity="0.18"/>`;
  if (open) {
    // 뒤쪽 날개 두 개 (뒤로 젖혀짐)
    o += part([[x + dx, ty + dy], [X2 + dx, ty + dy], [X2 + dx + 6, ty + dy - h * 0.32], [x + dx + 10, ty + dy - h * 0.36]], mixHex(col, '#ffffff', 0.12), { sw: 1.8 });
  }
  o += part([[X2, ty], [X2 + dx, ty + dy], [X2 + dx, by + dy], [X2, by]], col, { sw: 2, shade: [[X2 - 4, ty + dy - 4], [X2 + dx + 4, ty + dy - 4], [X2 + dx + 4, by + 4], [X2 - 4, by + 4]], shadeCol: 'rgba(60,30,10,0.3)' });
  o += part([[x, ty], [x + dx, ty + dy], [X2 + dx, ty + dy], [X2, ty]], open ? '#4a3420' : col, { sw: 1.8 });
  // 앞면 + 구김 + 화살표 도장
  o += part([[x, ty], [X2, ty], [X2, by], [x, by]], col, { sw: 2.4, heavy: [1, 2], extra: `<path d="${O([[x + w * 0.62, ty + 4], [x + w * 0.66, ty + h * 0.35]], 0.3)}" fill="none" stroke="${dark}" stroke-width="1.2" opacity="0.6"/>` });
  const ax = x + w * 0.78, ay = ty + h * 0.62, s = Math.min(w, h) * 0.12;
  for (const off of [-s * 0.6, s * 0.6]) o += `<path d="${O([[ax + off, ay + s], [ax + off, ay - s * 0.4]], 0.2)}" fill="none" stroke="${dark}" stroke-width="2.4" opacity="0.7"/><path d="${O([[ax + off - s * 0.4, ay], [ax + off, ay - s * 0.6], [ax + off + s * 0.4, ay]], 0.2)}" fill="none" stroke="${dark}" stroke-width="2.4" opacity="0.7"/>`;
  if (open) {
    // 앞쪽 날개 (앞으로 처짐) + 옆 날개
    o += part([[x, ty], [X2, ty], [X2 - w * 0.04, ty + h * 0.2], [x + w * 0.03, ty + h * 0.22]], mixHex(col, '#ffffff', 0.08), { sw: 1.8, shade: [[x - 4, ty + h * 0.12], [X2 + 4, ty + h * 0.12], [X2 + 4, ty + h * 0.3], [x - 4, ty + h * 0.3]], shadeCol: 'rgba(60,30,10,0.2)' });
    o += part([[X2, ty], [X2 + dx, ty + dy], [X2 + dx + d * 0.5, ty + dy - h * 0.1], [X2 + d * 0.5, ty - h * 0.12]], mixHex(col, dark, 0.15), { sw: 1.6 });
  } else {
    o += part([[x + w * 0.42, ty], [x + w * 0.58, ty], [x + w * 0.58, ty + h * 0.3], [x + w * 0.42, ty + h * 0.3]], tape, { sw: 1.2 });
  }
  return o;
}

export { blobPts, mixHex, mix };

/* 엮은 바구니: 위가 넓은 몸통, 말린 테두리, 엇갈려 엮은 무늬 */
export function wicker({ cx, by, wTop, wBot, h, col = '#c9a06a', dark = '#8a6438', rim = true, inner = '#5a3a22' }) {
  const ty = by - h, ry = wTop * 0.12;
  const body = [[cx - wTop / 2, ty], [cx - (wTop + wBot) / 4 - 4, ty + h * 0.55], [cx - wBot / 2, by], [cx - wBot * 0.25, by + ry * 0.5], [cx + wBot * 0.25, by + ry * 0.5], [cx + wBot / 2, by], [cx + (wTop + wBot) / 4 + 4, ty + h * 0.55], [cx + wTop / 2, ty]];
  let weave = '';
  const rows = Math.max(3, Math.round(h / 14));
  for (let r = 0; r < rows; r++) {
    const t = (r + 0.5) / rows, y = ty + h * t, hw = (wTop / 2) * (1 - t) + (wBot / 2) * t + 3, n = Math.round(hw / 11);
    for (let i = -n; i < n; i++) { const x0 = cx + i * hw / n, x1 = cx + (i + 1) * hw / n, off = ((i + r) % 2) * 3; weave += `M${x0.toFixed(1)} ${(y + off).toFixed(1)} Q${((x0 + x1) / 2).toFixed(1)} ${(y + off - 5).toFixed(1)} ${x1.toFixed(1)} ${(y + off).toFixed(1)}`; }
  }
  let o = `<path d="${S([[cx - wBot / 2 - 6, by], [cx + wBot / 2 + 20, by - 2], [cx + wBot / 2 + 30, by + 12], [cx - wBot / 2, by + 12]], 0.5)}" fill="${INK}" opacity="0.18"/>`;
  o += part(ellPts(cx, ty, wTop / 2, ry, 0, Math.PI * 2, 16), inner, { sw: 2 });
  o += part(body, col, { sw: 2.4, heavy: [4, 7], shade: [[cx + wTop * 0.15, ty - 10], [cx + wTop, ty - 10], [cx + wTop, by + 20], [cx + wTop * 0.15, by + 20]], shadeCol: 'rgba(60,30,10,0.25)', extra: `<path d="${weave}" fill="none" stroke="${dark}" stroke-width="1.6" opacity="0.85"/>` });
  if (rim) { const rp = ellPts(cx, ty, wTop / 2 + 2, ry + 1, 0, Math.PI, 12); o += `<path d="${O(rp, 0.3)}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${O(rp, 0.3)}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/><path d="${O(rp, 0.3)}" fill="none" stroke="${dark}" stroke-width="7" stroke-dasharray="3 7" stroke-linecap="round" opacity="0.8"/>`; }
  return o;
}

/* 털실 뭉치: 감긴 실 결 + 풀린 실 한 가닥 */
export function yarn({ cx, cy, r, col, tail = null }) {
  let wind = '';
  for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; wind += O(ellPts(cx, cy, r * 0.92, r * (0.35 + i * 0.12), a, a + 2.4, 8).map(([x, y]) => { const dx = x - cx, dy = y - cy, ca = Math.cos(a * 0.6), sa = Math.sin(a * 0.6); return [cx + dx * ca - dy * sa, cy + dx * sa + dy * ca]; }), 0.2); }
  let o = part(blobPts(cx, cy, r, r * 0.95, { n: 14, k: 0.06 }), col, { sw: 1.8, heavy: [2, 6], shade: [[cx - r * 1.2, cy + r * 0.1], [cx + r * 1.2, cy - r * 0.3], [cx + r * 1.2, cy + r * 1.2], [cx - r * 1.2, cy + r * 1.2]], shadeCol: 'rgba(40,10,0,0.25)', hatch: false, extra: `<path d="${wind}" fill="none" stroke="${INK}" stroke-width="1.1" opacity="0.45"/>` });
  if (tail) o += `<path d="${O([[cx + r * 0.6, cy + r * 0.7], ...tail], 0.5)}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
  return o;
}

/* 나무 의자 다리처럼 깎은 기둥 (선반 깎기 모양: 볼록·잘록) */
export function turned(x, y0, y1, w, col, dark) {
  const L = y1 - y0, p = (t, k) => [x + k * w / 2, y0 + L * t];
  const side = (k) => [p(0, k * 0.9), p(0.08, k * 1.15), p(0.16, k * 0.6), p(0.4, k * 0.75), p(0.55, k * 1.2), p(0.7, k * 0.7), p(0.9, k * 0.85), p(1, k * 1.1)];
  const L1 = side(-1), R1 = side(1).reverse();
  return part([...L1, ...R1], col, { sw: 1.8, heavy: [8, 15], shade: [[x + w * 0.1, y0 - 2], [x + w, y0 - 2], [x + w, y1 + 2], [x + w * 0.1, y1 + 2]], shadeCol: 'rgba(40,20,5,0.3)', hatch: false });
}
