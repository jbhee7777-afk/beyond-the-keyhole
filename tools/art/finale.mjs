// 마지막 엔딩 그림: 다섯 장의 친구들이 언덕에 모여 인사한다
// node tools/art/finale.mjs → assets/ui/finale.svg
import { seed, rand, INK, ell, ellPts, rect, fill, line, svg, leaf } from './ink.mjs';
import { part, S, snailArt, mouseArt, mochaArt, ghostIconArt, batArt, octopusArt } from './chars.mjs';

const OUT = new URL('../../assets/ui/', import.meta.url).pathname;
const C = { mint: '#9fcfb9', mint2: '#7db59c', rose: '#d98c95', rose2: '#b9707c', brass2: '#9d7428', orange2: '#c96a22', leaf: '#6f9a4f', leaf2: '#4f7c3a' };
seed(1201);
const w = 880, h = 420;
let o = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f0"/><stop offset="1" stop-color="#fbf0d0"/></linearGradient></defs>`;
o += `<rect width="${w}" height="${h}" rx="6" fill="url(#sk)"/>`;
// 해님 (웃는 얼굴)
for (let i = 0; i < 14; i++) { const a = i * Math.PI / 7; o += line([[120 + Math.cos(a) * 54, 90 + Math.sin(a) * 54], [120 + Math.cos(a) * 76, 90 + Math.sin(a) * 76]], { sw: 5, color: '#f0b92b' }); }
o += part(ellPts(120, 90, 46, 46, 0, Math.PI * 2, 16), '#ffd85a', { sw: 2.4 });
o += line([[100, 84], [106, 78], [112, 84]], { sw: 2.4 }) + line([[128, 84], [134, 78], [140, 84]], { sw: 2.4 }) + line([[106, 104], [120, 112], [134, 104]], { sw: 2.4 });
for (const [x, y, r] of [[360, 70, 40], [600, 50, 50], [760, 90, 34]]) o += fill(ell(x, y, r * 1.6, r * 0.5), '#ffffff', 0.85);
// 바다(오른쪽)와 언덕
o += part([[560, 300], [880, 280], [880, 420], [560, 420]], '#5fa3a8', { sw: 1.6 });
o += part([[0, 300], [180, 250], [380, 270], [600, 300], [640, 420], [0, 420]], '#a9cf86', { sw: 2 });
o += part([[0, 350], [260, 330], [520, 350], [600, 420], [0, 420]], '#8fbf6a', { sw: 1.6 });
// 나무와 박쥐
o += line([[470, 300], [470, 150]], { sw: 14, color: '#7a5236' }) + line([[470, 190], [540, 170]], { sw: 8, color: '#7a5236' });
o += part(ellPts(470, 130, 70, 50, 0, Math.PI * 2, 16), '#7eb05c', { sw: 2 });
o += `<g transform="translate(508 172) scale(0.42)">${batArt('hang')}</g>`;
// 소풍 담요
o += part([[150, 370], [430, 360], [450, 410], [130, 414]], '#f4d98b', { sw: 2 });
for (let x = 160; x < 440; x += 30) o += line([[x, 364], [x - 10, 412]], { sw: 2, color: '#e3bf62' });
// 친구들
o += `<g transform="translate(150 230) scale(0.42)">${mochaArt(true, { rose: C.rose, rose2: C.rose2, mint: C.mint, mint2: C.mint2, brass2: C.brass2, orange2: C.orange2, leaf: C.leaf, leaf2: C.leaf2, woodD: '#7a5236' })}</g>`;
o += `<g transform="translate(330 300) scale(0.34)">${mouseArt('happy', { butter: '#f4d98b', butter2: '#e3bf62', brass2: C.brass2, rose: C.rose })}</g>`;
o += `<g transform="translate(40 330) scale(0.8)">${snailArt({ red: '#c4473a' })}</g>`;
o += `<g transform="translate(370 120) scale(0.9)">${ghostIconArt()}</g>`;
o += `<g transform="translate(640 230) scale(0.4)">${octopusArt('happy')}</g>`;
for (let i = 0; i < 6; i++) o += `<circle cx="${(600 + rand(0, 260)).toFixed(0)}" cy="${(260 + rand(0, 60)).toFixed(0)}" r="${rand(4, 8).toFixed(1)}" fill="#dff4f4" fill-opacity="0.4" stroke="#fff" stroke-width="1.2"/>`;
svg(OUT + 'finale.svg', w, h, o, { id: 1201, displace: 1.2 });
console.log('finale written');
