// 튼튼함 검사: 이야기 중간에 창을 닫았다 다시 열기, 가방이 꽉 찼을 때, 휴대폰/태블릿 화면.
// 사용법: node tools/playtest-resilience.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-resilience')) + '/';
const BASE = 'file://' + path.join(__dirname, '..', 'index.html');

// 각 방의 "애니메이션 도중에 창을 닫은" 저장 상태 → 다시 열었을 때 꼭 있어야 하는 것
const CASES = [
  { room: 'greenhouse', flags: { roosterUsed: true }, inv: [], expectFlags: ['sun'] },
  { room: 'greenhouse', flags: { roosterUsed: true, sun: true, seeded: true, watered: true }, inv: [], expectFlags: ['grown'] },
  { room: 'toyshop', flags: { mouseFed: true }, inv: [], expectInv: ['crank'] },
  { room: 'toyshop', flags: { tuneRight: true, crankIn: true, pinsIn: true }, inv: [], expectFlags: ['boxOpen', 'awake'], expectInv: ['carrot'] },
  { room: 'clock13', flags: { pieceGiven: true, ghostOut: true }, inv: [], expectInv: ['piece'] },
  { room: 'clock13', flags: { pieceIn: true }, inv: [], expectFlags: ['struck', 'doorOpen'] },
  { room: 'clock13', flags: { spiderFed: true }, inv: [], expectInv: ['smallkey'] },
  { room: 'upside', flags: { batFed: true }, inv: [], expectInv: ['handle'] },
  { room: 'upside', flags: { batFed: true, handleOn: true, panelOk: true, flipped: true }, inv: [], expectFlags: ['landed'] },
  { room: 'sea', flags: { gotLetter: true }, inv: [], expectInv: ['letter'] },
  { room: 'laundry', flags: { talked: true, cloudIn: true, washed: true, washing: true, seq: ['drop', 'wind', 'sun'] }, inv: [], expectInv: ['raincloud'] },
  { room: 'station', flags: { warm: true, awake: true }, inv: [], expectInv: ['ticket'] },
  { room: 'desk', flags: { craneTalked: true, memoTaken: true, boatMade: true }, inv: [], expectInv: ['boat'] },
  { room: 'sea', flags: { gotLetter: true, letterGiven: true, hatchOpen: true, posted: true }, inv: [], expectFlags: ['whale', 'whaleWrote'] },
  { room: 'bindery', flags: { talked: true, pressed: true, moriDone: true }, inv: [], expectFlags: ['opened'] },
  { room: 'bindery', flags: { talked: true, typeSet: true }, inv: [], expectInv: ['typeset'] },
  { room: 'teahouse', flags: { talked: true, brewed: true }, inv: [], expectInv: ['tea'] },
  { room: 'teahouse', flags: { talked: true, flowed: true }, inv: [], expectFlags: ['doorOpen'] },
  { room: 'observatory', flags: { talked: true, keyTaken: true, keyIn: true, turns: 12, aligned: true }, inv: [], expectFlags: ['aligned'] },
  { room: 'observatory', flags: { talked: true, focused: true, lit: [1, 2, 5, 6, 7, 9, 10], doorOpen: true }, inv: [], expectFlags: ['doorOpen'] },
  { room: 'shadow', flags: { talked: true, redLook: true, trunkOpen: true }, inv: [], expectInv: ['wolf'] },
  { room: 'shadow', flags: { talked: true, performed: true }, inv: [], expectFlags: ['doorOpen'] },
  { room: 'foldhouse', flags: { talked: true, foldin: true, mapFolded: true }, inv: [], expectInv: ['sheet'] },
  { room: 'foldhouse', flags: { talked: true, foldin: true, mapFolded: true, sheetOn: true, doorOpen: true }, inv: [], expectFlags: ['doorOpen'] },
];

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const fails = [];
  const errs = [];
  const page = async (vp) => {
    const p = await b.newPage({ viewport: vp });
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    return p;
  };

  // 1. 중간 저장 → 다시 열기
  const p = await page({ width: 1600, height: 900 });
  await p.goto(BASE);
  for (const c of CASES) {
    await p.evaluate((c) => {
      localStorage.clear();
      localStorage.setItem('btk.tips', JSON.stringify(['move', 'stuck', 'zoom', 'select', 'firstItem', 'combine']));
      localStorage.setItem('btk.save.' + c.room, JSON.stringify({ v: 2, rv: 2, view: 'north', flags: c.flags, inv: c.inv, sel: null, zoom: null, hint: { key: '', level: 0, at: 0 }, notes: [] }));
    }, c);
    await p.goto(BASE + '#play-' + c.room); await p.reload();
    await p.waitForTimeout(900);
    const s = await p.evaluate(() => window.__game && window.__game.s);
    if (!s) { fails.push(`${c.room}: 게임이 열리지 않음`); continue; }
    for (const f of c.expectFlags || []) if (!s.flags[f]) fails.push(`${c.room} ${JSON.stringify(c.flags)}: 다시 열었는데 ${f} 없음`);
    for (const i of c.expectInv || []) if (!s.inv.includes(i)) fails.push(`${c.room} ${JSON.stringify(c.flags)}: 다시 열었는데 가방에 ${i} 없음`);
    // 다시 열어도 같은 아이템이 두 개 생기면 안 된다
    await p.reload(); await p.waitForTimeout(700);
    const s2 = await p.evaluate(() => window.__game.s);
    if (new Set(s2.inv).size !== s2.inv.length) fails.push(`${c.room}: 다시 열 때마다 아이템이 겹침 ${s2.inv}`);
  }

  // 예전 형식(v 없음) 저장은 버리고 처음부터
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('btk.save.sea', JSON.stringify({ view: 'north', flags: { posted: true }, inv: [] })); });
  await p.goto(BASE + '#play-sea'); await p.reload(); await p.waitForTimeout(900);
  if (await p.evaluate(() => window.__game.s.flags.posted)) fails.push('예전 형식 저장을 그대로 씀');

  // 2. 가방이 꽉 찼을 때 (가장 많이 들 수 있는 경우보다 넉넉히 12개)
  await p.evaluate(() => {
    const g = window.__game;
    g.s.inv = ['letter', 'address', 'stamp_mackerel', 'stamp_anchovy', 'stamp_saury', 'hook', 'kelp', 'key', 'letter_addr', 'kelp_hook', 'letter_ready', 'letter'];
    g.s.inv = [...new Set(g.s.inv)].concat(['__a', '__b']).slice(0, 12);
    g.room.items.__a = g.room.items.__b = { name: '시험', img: 'items/key', desc: '' };
    g.render();
  });
  await p.waitForTimeout(400);
  const box = await p.evaluate(() => { const r = [...document.querySelectorAll('.slot')].map((e) => e.getBoundingClientRect()); return { bottom: Math.max(...r.map((x) => x.bottom)), right: Math.max(...r.map((x) => x.right)), n: r.length }; });
  if (box.bottom > 900 || box.right > 1600) fails.push(`가방 칸이 화면 밖으로 나감 ${JSON.stringify(box)}`);
  await p.screenshot({ path: OUT + 'inventory-full.png' });
  await p.close();

  // 3. 작은 화면: 휴대폰 가로/세로, 태블릿
  for (const [name, vp] of [['phone-land', { width: 844, height: 390 }], ['phone-port', { width: 390, height: 844 }], ['tablet', { width: 1024, height: 768 }]]) {
    const q = await page(vp);
    await q.goto(BASE); await q.evaluate(() => localStorage.clear()); await q.reload(); await q.waitForTimeout(800);
    await q.screenshot({ path: OUT + name + '-cover.png' });
    await q.goto(BASE + '#play-greenhouse'); await q.reload(); await q.waitForTimeout(1200);
    await q.screenshot({ path: OUT + name + '-room.png' });
    const over = await q.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    if (over) fails.push(`${name}: 가로로 화면이 넘침`);
    // 화살표 버튼이 손가락으로 누를 만한 크기인지 (최소 32px)
    const nav = await q.evaluate(() => { const r = document.querySelector('.nav-right').getBoundingClientRect(); return Math.min(r.width, r.height); });
    if (name !== 'phone-port' && nav < 32) fails.push(`${name}: 화살표가 너무 작음 ${nav.toFixed(0)}px`);
    await q.close();
  }

  console.log('cases:', CASES.length);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(!fails.length && !errs.length ? 0 : 1);
})();
