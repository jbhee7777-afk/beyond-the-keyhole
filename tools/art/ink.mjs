// 손그림 느낌 SVG를 만드는 도구 모음.
// 모든 선은 살짝 흔들리고(jitter), 채색은 수채 얼룩 필터(art)로 종이에 칠한 느낌을 낸다.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let s = 1;
export function seed(n) { s = (n * 2654435761) >>> 0 || 1; }
export function rand(a = 0, b = 1) {
  s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
  return a + (b - a) * (s / 4294967296);
}
export const pick = (arr) => arr[Math.floor(rand(0, arr.length))];

export const INK = '#33261c';
const f = (n) => Math.round(n * 10) / 10;

export function subdiv(pts, closed, step) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.ceil(len / step));
    for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

export function smooth(pts, closed) {
  const n = pts.length;
  if (n < 2) return '';
  const P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

// 흔들리는 다각형/곡선 경로
export function wob(pts, { closed = true, amp = 1.4, step = 36, sharp = false } = {}) {
  let p = subdiv(pts, closed, step).map(([x, y]) => [x + rand(-amp, amp), y + rand(-amp, amp)]);
  if (sharp) {
    // 꼭짓점을 살려 직선 위주로 (가구 모서리용)
    return 'M' + p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + (closed ? 'Z' : '');
  }
  return smooth(p, closed);
}
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export const rect = (x, y, w, h, o) => wob(rectPts(x, y, w, h), { step: 30, ...o });
export function ellPts(cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n) {
  n = n || Math.max(14, Math.round((rx + ry) / 7));
  const pts = [];
  const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  for (let i = 0; i < (full ? n : n + 1); i++) {
    const a = a0 + (a1 - a0) * i / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}
export const ell = (cx, cy, rx, ry, o = {}) => wob(ellPts(cx, cy, rx, ry), { step: 999, amp: Math.min(1.6, rx / 18), ...o });

export function rot(pts, ang, ox = 0, oy = 0) {
  const c = Math.cos(ang), sn = Math.sin(ang);
  return pts.map(([x, y]) => [ox + x * c - y * sn, oy + x * sn + y * c]);
}

// 채색 + 잉크 외곽선
export function shape(d, fill, { sw = 2.2, stroke = INK, op = 1, extra = '' } = {}) {
  return `<path d="${d}" fill="${fill}"${op < 1 ? ` fill-opacity="${op}"` : ''} stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
}
export const fill = (d, color, op = 1) => `<path d="${d}" fill="${color}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
export function line(pts, { sw = 2, color = INK, op = 1, amp = 0.8, step = 30 } = {}) {
  return `<path d="${wob(pts, { closed: false, amp, step })}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
}
// 빈티지 삽화식 빗금 그림자
export const hatch = (d, op = 0.45, pat = 'hatch') => `<path d="${d}" fill="url(#${pat})" opacity="${op}"/>`;

export function leaf(x, y, len, ang, color, { w = 0.38, vein = true } = {}) {
  const wd = len * w;
  const pts = rot([[0, 0], [len * 0.25, -wd / 2], [len * 0.7, -wd * 0.38], [len, 0], [len * 0.7, wd * 0.36], [len * 0.25, wd / 2]], ang, x, y);
  let out = shape(wob(pts, { step: 999, amp: len * 0.03 }), color, { sw: 1.6 });
  if (vein) out += line(rot([[len * 0.08, 0], [len * 0.85, 0]], ang, x, y), { sw: 1, op: 0.6 });
  return out;
}

// 아래로 늘어진 덩굴
export function vine(x, y, length, { sway = 30, leafLen = 26, colors = ['#6f9a4f', '#58833f', '#8fb162'], dir = 1 } = {}) {
  const pts = [];
  const n = Math.max(3, Math.round(length / 40));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x + Math.sin(t * 3.1 + x) * sway * t * dir, y + t * length]);
  }
  let out = line(pts, { sw: 2.2, color: '#3d5a2c', step: 20 });
  const sp = subdiv(pts, false, 22);
  sp.forEach(([px, py], i) => {
    if (i < 1) return;
    const side = i % 2 ? 1 : -1;
    const a = Math.PI / 2 + side * rand(0.7, 1.2);
    out += leaf(px, py, leafLen * rand(0.75, 1.15), a, pick(colors), { w: 0.5 });
  });
  return out;
}

export function defs(id = 1, { displace = 2.6, wash = true } = {}) {
  return `<defs>
<filter id="art" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="2" seed="${id}" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="${displace}" xChannelSelector="R" yChannelSelector="G" result="d"/>
${wash ? `<feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves="3" seed="${id + 7}" result="t"/>
<feColorMatrix in="t" type="matrix" values="0.3 0 0 0 0.85  0.3 0 0 0 0.85  0.3 0 0 0 0.85  0 0 0 0 1" result="tw"/>
<feBlend in="d" in2="tw" mode="multiply" result="m"/>
<feComposite in="m" in2="d" operator="in"/>` : ''}
</filter>
<filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5"/></filter>
<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="1.2"/></pattern>
<pattern id="hatch2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-48)"><line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width="1"/></pattern>
<pattern id="hatchw" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><line x1="0" y1="0" x2="0" y2="7" stroke="#fff8e0" stroke-width="1.3"/></pattern>
</defs>`;
}

// 파일 하나 = 에셋 하나. 뷰박스는 무대(1600x900) 좌표 그대로 써서 엔진 배치와 맞춘다.
export function svg(path, w, h, body, { id = 1, displace, raw = '', vb } = {}) {
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || `0 0 ${w} ${h}`}" width="${w}" height="${h}">${defs(id, { displace })}<g filter="url(#art)">${body}</g>${raw}</svg>`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, out);
  return out.length;
}

// 손글씨 숫자: SVG <text>는 기기마다 글꼴이 달라 보이므로 숫자도 선으로 그린다.
// x = 가운데, y = 글자 바닥, h = 글자 높이
const DIGITS = {
  0: [[[0.3, 0], [0.55, 0.1], [0.6, 0.5], [0.55, 0.9], [0.3, 1], [0.05, 0.9], [0, 0.5], [0.05, 0.1], [0.3, 0]]],
  1: [[[0.12, 0.2], [0.32, 0], [0.32, 1]], [[0.12, 1], [0.52, 1]]],
  2: [[[0.04, 0.22], [0.2, 0.02], [0.44, 0.02], [0.58, 0.22], [0.5, 0.48], [0.02, 1], [0.6, 1]]],
  3: [[[0.04, 0.1], [0.3, 0], [0.56, 0.14], [0.52, 0.38], [0.24, 0.48], [0.56, 0.6], [0.58, 0.86], [0.3, 1], [0.02, 0.92]]],
  4: [[[0.44, 1], [0.44, 0], [0, 0.68], [0.62, 0.68]]],
  5: [[[0.56, 0], [0.1, 0], [0.06, 0.44], [0.34, 0.38], [0.58, 0.56], [0.56, 0.88], [0.3, 1], [0.02, 0.92]]],
  6: [[[0.52, 0.06], [0.3, 0], [0.08, 0.2], [0.02, 0.62], [0.12, 0.94], [0.34, 1], [0.56, 0.86], [0.56, 0.6], [0.34, 0.48], [0.1, 0.56]]],
  7: [[[0, 0], [0.6, 0], [0.24, 1]]],
  8: [[[0.3, 0.48], [0.08, 0.36], [0.08, 0.1], [0.3, 0], [0.52, 0.1], [0.52, 0.36], [0.3, 0.48], [0.04, 0.62], [0.04, 0.9], [0.3, 1], [0.56, 0.9], [0.56, 0.62], [0.3, 0.48]]],
  9: [[[0.5, 0.44], [0.28, 0.52], [0.06, 0.4], [0.06, 0.12], [0.3, 0], [0.52, 0.12], [0.54, 0.5], [0.44, 0.86], [0.2, 1], [0.04, 0.94]]],
};
export function digits(str, x, y, h, { color = INK, sw } = {}) {
  const gap = 0.18, w = 0.6;
  const total = String(str).length * (w + gap) - gap;
  let cx = x - (total * h) / 2, out = '';
  for (const ch of String(str)) {
    for (const st of DIGITS[ch] || []) {
      const pts = st.map(([u, v]) => [cx + u * h, y - h + v * h]);
      out += `<path d="${wob(pts, { closed: false, amp: h * 0.012, step: 999 })}" fill="none" stroke="${color}" stroke-width="${(sw || h * 0.12).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    cx += (w + gap) * h;
  }
  return out;
}
