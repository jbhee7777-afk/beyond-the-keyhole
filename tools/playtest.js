// 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 단계마다 스크린샷을 남긴다.
// 사용법: node tools/playtest.js [스크린샷 폴더]   (Playwright 필요: npm i -D playwright)
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL);
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + '00-cover.png' });
  await p.click('.chapter');
  await p.waitForTimeout(1500);
  const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: OUT + n + '.png' }); };
  const clickObj = async (label) => { await p.click(`[aria-label="${label}"]`, { force: true }); await p.waitForTimeout(450); };
  const sel = async (item) => { await p.click(`.slot[data-item="${item}"]`); await p.waitForTimeout(200); };
  const view = async (v) => { await p.evaluate((v) => window.__game.api.go(v), v); await p.waitForTimeout(500); };

  await shot('01-north-dark');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v + '-dark'); }
  await p.click('.nav-right');
  await clickObj('뜨개 바구니');
  await view('east'); await clickObj('가운데 화분'); await clickObj('반짝이는 것');
  await clickObj('숫자 액자'); await shot('03a-plaque');
  await sel('mirror'); await clickObj('액자'); await shot('03b-plaque-mirror');
  await p.click('.nav-back');
  await clickObj('작업대 서랍'); await shot('04-drawer');
  const dials = await p.$$('.dial');
  for (const [i, n] of [[0, 3], [1, 5], [2, 2]]) for (let k = 0; k < n; k++) { await dials[i].click(); await p.waitForTimeout(60); }
  await p.waitForTimeout(800); await shot('05-drawer-open');
  await clickObj('magnetIn'); await p.waitForTimeout(500);
  await clickObj('seedsIn'); await p.waitForTimeout(500);
  await p.click('.nav-back');
  await sel('magnet'); await sel('yarn');
  await view('west'); await clickObj('빗물통'); await shot('06a-barrel');
  await sel('magnet_line'); await clickObj('물속에서 반짝이는 것'); await p.waitForTimeout(1600); await shot('06b-barrel-fished');
  await p.click('.nav-back'); await p.waitForTimeout(300);
  await clickObj('새장'); await clickObj('새장'); await shot('07-west-cage');
  await sel('windkey'); await sel('rooster');
  await view('south'); await sel('rooster_wound'); await clickObj('해님 기계'); await p.waitForTimeout(4500); await shot('08-south-lit');
  await clickObj('해님 안내판'); await shot('08b-note'); await p.click('.nav-back');
  await view('north'); await sel('seeds'); await clickObj('큰 화분'); await shot('09-north-lit');
  await view('east'); await shot('10-east-lit'); await clickObj('물뿌리개'); await p.waitForTimeout(800);
  await view('west'); await shot('11-west-lit'); await sel('wcan'); await clickObj('빗물통');
  await view('north'); await sel('wcan_full'); await clickObj('큰 화분'); await p.waitForTimeout(3200); await shot('12-grown');
  await clickObj('커다란 해바라기'); await p.waitForTimeout(900);
  await p.evaluate(() => window.__game.openHint()); await shot('13-hint'); await p.keyboard.press('Escape');
  await sel('key'); await clickObj('온실 문'); await shot('14-door-open');
  await clickObj('온실 문'); await p.waitForTimeout(2200); await shot('15-ending');
  const flags = await p.evaluate(() => window.__game.s.flags);
  console.log('won:', !!flags.__won);
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(flags.__won && !errs.length ? 0 : 1);
})();
