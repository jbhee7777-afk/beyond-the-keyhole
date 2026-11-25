// 9장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 순서(그림자가 남았을 때·깜깜할 때·뭉툭한 색연필)도 확인한다.
// 사용법: node tools/playtest-desk.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-9')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-station';

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
  // 1. 잠든 곰곰이, 안내문
  await clickObj('곰 역장 곰곰이'); await clickObj('깨우는 법 안내문'); await shot('03-guide'); await back();
  // 성에 낀 창 (아직 안 보임)
  await view('east'); await clickObj('큰 창'); await clickObj('꽃화분');
  await expect(async () => !(await p.evaluate(() => window.__game.s.inv.includes('flower'))), '추운데 꽃을 땀');
  // 2. 삽 → 눈 더미 → 석탄 → 난로
  await view('west'); await shot('04-west'); await clickObj('눈삽'); await sel('shovel'); await clickObj('눈 더미'); await clickObj('눈 더미'); await shot('05-dug');
  await view('north'); await sel('coal'); await clickObj('무쇠 난로'); await p.waitForTimeout(3400); await shot('06-warm');
  // 3. 꽃 → 곰곰이 → 편지
  await view('east'); await shot('07-east-warm'); await clickObj('꽃화분'); await clickObj('큰 창'); await shot('08-timetable'); await back();
  await view('north'); await sel('flower'); await clickObj('곰 역장 곰곰이'); await p.waitForTimeout(5600); await shot('09-letter'); await back();
  // 4. 선로 3 → 기적 → 기차
  await clickObj('곰 역장 곰곰이'); await expect(async () => !(await flags()).trainHere, '선로가 1인데 기차가 옴');
  await view('east'); await clickObj('종이학 접이'); await shot('09b-crane');
  await view('west'); await clickObj('선로 전환기'); await clickObj('선로 전환기'); await shot('10-lever3');
  await expect(async () => !!(await flags()).trainHere, '선로 3에 맞췄는데 기적이 안 울림');
  await view('north'); await clickObj('곰 역장 곰곰이'); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__game.openHint()); await shot('11-hint'); await p.keyboard.press('Escape');
  await view('south'); await shot('12-train'); await clickObj('별빛 열차'); await p.waitForTimeout(2200); await shot('13-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
