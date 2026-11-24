// 공통 UI 에셋: 화살표, 인벤토리 꼬리표, 아이콘, 커서
// node tools/art/ui.mjs
import { seed, rand, INK, wob, rect, ell, ellPts, shape, fill, line, hatch, svg } from './ink.mjs';
import { writeFileSync } from 'node:fs';

const OUT = new URL('../../assets/ui/', import.meta.url).pathname;
const paper = '#efe2c2', paper2 = '#dcc9a0', brass = '#d4a649', red = '#b6463a';

seed(301);
// 잉크 붓 화살표 (오른쪽 방향, 왼쪽은 CSS로 뒤집음)
svg(OUT + 'arrow.svg', 120, 120,
  fill(wob([[22, 62], [70, 60], [70, 38], [104, 62], [70, 88], [70, 66], [22, 68]]), INK, 0.35) +
  shape(wob([[18, 56], [66, 54], [64, 30], [100, 58], [64, 84], [66, 62], [18, 64]], { step: 16 }), paper, { sw: 3.4 }) +
  line([[26, 59], [60, 58]], { sw: 1.4, op: 0.5 }), { id: 301 });

seed(302);
// 인벤토리 꼬리표 (끈 구멍 달린 종이 꼬리표)
svg(OUT + 'tag.svg', 120, 120,
  fill(wob([[16, 18], [108, 16], [110, 112], [14, 110]]), INK, 0.3) +
  shape(wob([[10, 10], [104, 8], [106, 104], [8, 106]], { step: 22 }), paper, { sw: 2.6 }) +
  hatch(wob([[70, 10], [104, 8], [106, 104], [74, 106]]), 0.12) +
  shape(ell(57, 20, 5, 5), '#3b2e22', { sw: 1.4 }), { id: 302 });
seed(303);
svg(OUT + 'tag_sel.svg', 120, 120,
  fill(wob([[16, 18], [108, 16], [110, 112], [14, 110]]), INK, 0.35) +
  shape(wob([[10, 10], [104, 8], [106, 104], [8, 106]], { step: 22 }), '#f7e8b8', { sw: 2.6 }) +
  shape(ell(57, 20, 5, 5), '#3b2e22', { sw: 1.4 }) +
  line(ellPts(57, 60, 46, 44, -1.4, 4.6, 22), { sw: 3.2, color: red, step: 999, amp: 1.5 }), { id: 303 });

seed(304);
// 힌트: 달팽이 껍데기
const sp = []; for (let i = 0; i < 40; i++) { const a = i * 0.42, r = 34 - i * 0.78; sp.push([60 + Math.cos(a) * r, 60 + Math.sin(a) * r]); }
svg(OUT + 'hint.svg', 120, 120, shape(ell(60, 60, 38, 36), '#8aa35e', { sw: 3 }) + line(sp, { sw: 2.6, color: '#3d5f2c', step: 999 }) + hatch(ell(72, 72, 24, 20), 0.3), { id: 304 });
seed(305);
// 메뉴: 덮인 책
svg(OUT + 'book.svg', 120, 120,
  shape(wob([[24, 26], [92, 20], [98, 96], [28, 102]]), '#7d3b2f', { sw: 3 }) +
  shape(wob([[28, 96], [98, 90], [100, 100], [30, 106]]), paper, { sw: 2 }) +
  shape(ell(62, 58, 14, 14), brass, { sw: 2 }) + line([[38, 30], [40, 96]], { sw: 2, op: 0.5 }), { id: 305 });
seed(306);
const horn = shape(wob([[26, 48], [44, 48], [70, 26], [70, 94], [44, 72], [26, 72]], { sharp: true }), paper, { sw: 3 });
svg(OUT + 'sound_on.svg', 120, 120, horn + line(ellPts(70, 60, 18, 18, -0.9, 0.9, 6), { sw: 3, step: 999 }) + line(ellPts(70, 60, 32, 32, -0.9, 0.9, 8), { sw: 3, step: 999 }), { id: 306 });
svg(OUT + 'sound_off.svg', 120, 120, horn + line([[82, 46], [104, 74]], { sw: 3.4, color: red }) + line([[104, 46], [82, 74]], { sw: 3.4, color: red }), { id: 306 });
seed(307);
// 돌아가기(아래 화살표) — arrow를 회전해서 쓰므로 별도 파일 없음
// 인장(문장): 표지 장식
const petals = [...Array(16)].map((_, i) => { const a = i * Math.PI / 8; return shape(wob([[60 + Math.cos(a) * 30, 60 + Math.sin(a) * 30], [60 + Math.cos(a + 0.18) * 52, 60 + Math.sin(a + 0.18) * 52], [60 + Math.cos(a) * 58, 60 + Math.sin(a) * 58], [60 + Math.cos(a - 0.18) * 52, 60 + Math.sin(a - 0.18) * 52]], { step: 999, amp: 0.6 }), i % 2 ? '#e59d1d' : '#f3bf30', { sw: 1.6 }); }).join('');
svg(OUT + 'seal.svg', 120, 120, petals + shape(ell(60, 60, 30, 30), '#5a3518', { sw: 2 }) + shape(ell(60, 56, 9, 9), '#1d140c', { sw: 1 }) + shape(wob([[56, 58], [64, 58], [67, 76], [53, 76]]), '#1d140c', { sw: 1 }), { id: 307 });

// 커서: 잉크 손가락 (필터 없이 깔끔하게)
const hand = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M10 2.5c1.6 0 2.4 1 2.4 2.6v8.2l1.2-.3c.2-1.3 1-2 2.2-2s2 .7 2.2 1.8c.5-.8 1.2-1.1 2.1-1.1 1.2 0 2 .8 2.2 2 .5-.5 1.1-.7 1.8-.7 1.3 0 2.2 1 2.2 2.6v5.2c0 4.6-3 8.2-7.8 8.2h-2.1c-2.6 0-4.4-1-5.9-3.1L6.2 20c-.9-1.3-.7-2.6.3-3.3 1-.7 2.3-.4 3.1.6l-1.9-.1V5.1C7.7 3.5 8.5 2.5 10 2.5z" fill="#f5ead0" stroke="#2a1f16" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
writeFileSync(OUT + 'cursor_hand.svg', hand);
console.log('ui assets written');
