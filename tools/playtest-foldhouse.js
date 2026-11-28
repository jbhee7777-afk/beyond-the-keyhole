// 15장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 길(가운데 선 접기, 미끼 지도 선, 뒷면을 그대로 붙인 열쇠)도 확인한다.
// 사용법: node tools/playtest-foldhouse.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-15')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-foldhouse';

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
  const has = (i) => p.evaluate((i) => window.__game.s.inv.includes(i), i);
  const expect = async (cond, msg) => { if (!(await cond())) fails.push(msg); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');

  // 1. 접이
  await view('north'); await clickObj('종이학 접이'); await p.waitForTimeout(12000); await shot('03-crane');

  // 2. 포스터: 가운데 선(틀림) → ¼·¾
  await clickObj('긴 포스터'); await shot('04a-poster');
  await clickObj('접는 선 3'); await clickObj('접는 선 5'); await clickObj('두 선으로 접기');
  await expect(async () => !(await flags()).foldin, '틀린 선으로 접었는데 포스터가 풀림'); await shot('04b-poster-wrong');
  await clickObj('펴기'); await clickObj('접는 선 2'); await clickObj('접는 선 4'); await clickObj('두 선으로 접기');
  await expect(async () => (await flags()).foldin, '¼·¾로 접었는데 안 풀림'); await shot('04c-poster-right'); await back();

  // 3. 지도: 미끼(2번) → 구겨짐 → 1번
  await view('east'); await clickObj('높은 선반'); await clickObj('탁자 위 지도'); await shot('05a-map');
  await clickObj('접는 선 2로 접기'); await expect(async () => !(await has('sheet')), '미끼 선으로 종이를 얻음'); await shot('05b-map-wrong');
  await clickObj('접는 선 1로 접기'); await expect(async () => !(await has('sheet')), '구겨졌는데 바로 접힘');
  await p.evaluate(() => { window.__game.s.flags.mapJam = 0; }); // 15초 기다리는 대신
  await clickObj('접는 선 1로 접기'); await p.waitForTimeout(600); await shot('05c-map-right');
  await expect(async () => await has('sheet'), '수직이등분선으로 접었는데 종이를 못 얻음'); await back();

  // 4. 앞뒤 종이
  await view('south'); await clickObj('놋쇠 등잔'); await sel('sheet'); await clickObj('작은 이젤'); await shot('06a-sheet-front');
  await clickObj('종이 뒤집기'); await shot('06b-sheet-back'); await back();
  await p.evaluate(() => window.__game.openHint()); await shot('07-hint'); await p.keyboard.press('Escape');

  // 5. 문: 뒷면 그대로(틀림) → 온전한 열쇠
  await view('west'); await clickObj('종이 문'); await shot('08a-door');
  await clickObj('그림 판 1'); await expect(async () => !(await flags()).doorOpen, '틀린 열쇠로 문이 열림');
  await p.evaluate(() => { window.__game.s.flags.doorJam = 0; });
  await clickObj('그림 판 3'); await p.waitForTimeout(2200);
  await expect(async () => (await flags()).doorOpen, '온전한 열쇠인데 안 열림');
  await view('north'); await shot('09-friends');
  await view('west'); await shot('10-west-open'); await clickObj('종이 문'); await p.waitForTimeout(2400); await shot('11-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
