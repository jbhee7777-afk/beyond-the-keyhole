// 캐릭터 눈 깜빡임: 원래 그림 위에 잠깐 겹쳐 보이는 "감은 눈꺼풀" 그림
// node tools/art/blink.mjs  (캐릭터 그림을 바꾸면 눈 위치도 같이 맞춘다: chars.mjs의 ex, ey)
// 엔진은 오브젝트에 blink: 'props/xxx_blink' 가 있으면 몇 초마다 한 번 살짝 보여 준다.
import { INK, svg } from './ink.mjs';
import { S, O } from './chars.mjs';

const ROOT = new URL('../../assets/rooms/', import.meta.url).pathname;
// 눈꺼풀: 털/피부색으로 눈을 덮고, 아래쪽으로 휜 속눈썹 선 하나
const lid = (x, y, rx, ry, skin, sw = 2) => {
  const pts = []; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; pts.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
  return `<path d="${S(pts, 0.2)}" fill="${skin}"/>` +
    `<path d="${O([[x - rx * 0.95, y - ry * 0.05], [x, y + ry * 0.45], [x + rx * 0.95, y - ry * 0.05]], 0.1)}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`;
};
const list = [
  // [파일, w, h, viewBox, 눈들]
  ['toyshop/props/mocha_awake_blink.svg', 400, 480, '0 -40 400 480', [[174, 141, 12, 16], [226, 141, 12, 16]], '#f5ead8', 2.4],
  ['toyshop/zoom/mouse_hungry_blink.svg', 300, 320, null, [[126, 115, 13, 16], [174, 115, 13, 16]], '#b3adb1', 2.4],
  ['toyshop/props/mouse_peek_blink.svg', 84, 80, null, [[33, 44, 4.8, 4.8], [51, 44, 4.8, 4.8]], '#b3adb1', 1.2],
  ['greenhouse/props/snail_blink.svg', 130, 106, '0 -10 130 106', [[29, 1, 6.2, 6.2], [57, -4, 6.2, 6.2]], '#eedcbb', 1.4],
  ['upside/props/bat_hang_blink.svg', 160, 230, null, [[64, 166, 10, 11], [96, 166, 10, 11]], '#6a5a8a', 1.6],
  ['sea/props/octopus_work_blink.svg', 420, 440, null, [[166, 172, 18, 22], [234, 172, 18, 22]], '#e98a72', 2.4],
  ['desk/props/crane_idle_blink.svg', 220, 200, null, [[31, 54, 6, 6]], '#d3e3f2', 1.2],
  ['clock13/props/ghost_shy_blink.svg', 360, 380, '0 -10 360 380', [[150, 190, 7, 6], [214, 190, 7, 6]], '#66626a', 0],
  ['clock13/props/ghost_talk_blink.svg', 360, 380, '0 -10 360 380', [[152, 170, 14, 17], [212, 170, 14, 17]], '#66626a', 0],
];
for (const [rel, w, h, vb, eyes, skin, sw] of list) {
  const body = eyes.map(([x, y, rx, ry]) => (sw ? lid(x, y, rx, ry, skin, sw) : `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${skin}"/>` + `<path d="M${x - rx * 0.7} ${y} Q${x} ${y + 4} ${x + rx * 0.7} ${y}" stroke="#ffe9a8" stroke-width="1.6" fill="none" opacity="0.7"/>`)).join('');
  svg(ROOT + rel, w, h, body, { id: 9, displace: 0.6, vb: vb || undefined });
}
console.log('blink lids written:', list.length);
