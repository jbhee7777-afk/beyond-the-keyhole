// 10장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 순서(그림자가 남았을 때·깜깜할 때·뭉툭한 색연필)도 확인한다.
// 사용법: node tools/playtest-desk.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-10')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-studio';

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  const fails = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL);
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForTimeout(1500);
  const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: OUT + n + '.png' }); };
  const clickObj = async (label) => { await p.click(`[aria-label="${label}"]:visible, [data-id="${label}"]:visible >> nth=0`); await p.waitForTimeout(450); };
  const sel = async (item) => { await p.click(`.slot[data-item="${item}"]`); await p.waitForTimeout(200); };
  const view = async (v) => { await p.evaluate((v) => window.__game.api.go(v), v); await p.waitForTimeout(500); };
  const back = async () => { await p.click('.nav-back'); await p.waitForTimeout(400); };
  const flags = () => p.evaluate(() => window.__game.s.flags);
  const expect = async (cond, msg) => { if (!(await cond())) fails.push(msg); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }

  await p.click('.nav-right');
  // 1. 접이, 책의 마지막 장
  await clickObj('종이학 접이'); await p.waitForTimeout(5600); await shot('03-crane');
  await clickObj('종이 책'); await shot('04-bookpage'); await back();
  // 바닥 문은 아직 닫힘
  await view('south'); await clickObj('바닥 문'); await expect(async () => !(await flags()).__won, '책 없이 탈출함');
  // 2. 종이 뜨기: 휴지통 → 물통 → 틀 → 빨랫줄 → 걷기 → 접이
  await view('east'); await clickObj('종이 뜨기 순서 그림'); await clickObj('습작 휴지통'); await shot('05-east');
  await clickObj('종이 뜨는 틀'); await expect(async () => !(await p.evaluate(() => window.__game.s.inv.includes('mould'))), '의자 없이 틀을 내림');
  await clickObj('나무 의자'); await p.screenshot({ path: OUT + '05b-stool-moved.png' }); await clickObj('종이 뜨는 틀'); await sel('mould'); await clickObj('물통');
  await expect(async () => !(await p.evaluate(() => window.__game.s.inv.includes('wetsheet'))), '맑은 물로 종이가 떠짐');
  await sel('scraps'); await clickObj('물통'); await sel('mould'); await clickObj('물통'); await shot('06-wetsheet');
  await view('south'); await sel('wetsheet'); await clickObj('창가 빨랫줄'); await shot('07-dry'); await clickObj('말린 종이');
  await view('north'); await sel('paper'); await clickObj('종이학 접이'); await shot('08-doorpage');
  // 바늘 없이 꿰매 보기
  await sel('doorpage'); await clickObj('종이 책'); await expect(async () => !(await flags()).bookDone, '바늘 없이 책이 완성됨');
  // 3. 여행 지도 → 반짇고리 그림 자물쇠
  await view('west'); await clickObj('봄이의 여행 지도'); await shot('09-map'); await clickObj('반짇고리'); await shot('10a-tin');
  const want = ['책상', '구름', '등대', '기차'];
  for (let i = 0; i < 4; i++) { for (let k = 0; k < 5; k++) { const lab = await p.evaluate((i) => document.querySelectorAll('.tin-slot')[i]?.getAttribute('aria-label') || '', i); if (lab.includes(want[i])) break; await p.click(`.tin-slot >> nth=${i}`); await p.waitForTimeout(250); } }
  await p.waitForTimeout(900); await shot('10b-tin-open'); await clickObj('반짇고리');
  await p.evaluate(() => window.__game.openHint()); await shot('11-hint'); await p.keyboard.press('Escape');
  // 4. 책 완성 → 바닥 문
  await view('north'); await sel('doorpage'); await clickObj('종이 책'); await p.waitForTimeout(1500); await shot('12-book-done');
  await view('south'); await shot('13-hatch-open'); await clickObj('바닥 문'); await p.waitForTimeout(2400); await shot('14-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
