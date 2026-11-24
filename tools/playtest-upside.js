// 4장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 사용법: node tools/playtest-upside.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-4')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-upside';

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
  const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: OUT + n + '.png' }); };
  // 방이 돌아가 있으므로 force 클릭 대신 실제 화면 위치를 누른다 (돌아간 좌표 확인용)
  const clickObj = async (label) => { await p.click(`[aria-label="${label}"] >> nth=0`); await p.waitForTimeout(450); };
  const sel = async (item) => { await p.click(`.slot[data-item="${item}"]`); await p.waitForTimeout(200); };
  const view = async (v) => { await p.evaluate((v) => window.__game.api.go(v), v); await p.waitForTimeout(500); };
  const back = async () => { await p.click('.nav-back'); await p.waitForTimeout(400); };
  const visible = async (label) => p.locator(`[aria-label="${label}"]:visible`).first();

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');
  // 1. 액자와 쪽지
  await view('south'); await clickObj('숫자 액자'); await shot('03-frame'); await back();
  await clickObj('쪽지'); await back();
  await (await visible('사과')).click(); await p.waitForTimeout(500);
  // 2. 금고 819
  await view('east'); await clickObj('벽 금고'); await shot('04a-safe');
  for (const [i, n] of [[0, 8], [1, 1], [2, 9]]) for (let k = 0; k < n; k++) { await clickObj(`${i + 1}번째 숫자 바퀴`); }
  await p.waitForTimeout(800); await clickObj('토마토'); await p.waitForTimeout(500); await back();
  // 3. 박쥐
  await view('north'); await (await visible('박쥐 뒤죽이')).click(); await p.waitForTimeout(4600); await shot('05a-bat');
  await sel('apple'); await (await visible('박쥐 뒤죽이')).click(); await p.waitForTimeout(500); await shot('05b-bat-apple');
  await sel('tomato'); await (await visible('박쥐 뒤죽이')).click(); await p.waitForTimeout(2200);
  // 4. 레버
  await view('west'); await sel('handle'); await clickObj('뒤집기 레버'); await shot('06a-lever');
  await clickObj('뒤집기 레버'); await p.waitForTimeout(1200); await shot('06b-flipping'); await p.waitForTimeout(2400); await shot('06c-flipped');
  // 5. 우산 → 소파 밑 열쇠
  await view('north'); await shot('07-north-upright'); await clickObj('우산꽂이'); await p.waitForTimeout(600);
  await view('south'); await shot('08-south-upright'); await sel('umbrella'); await (await visible('소파 밑 열쇠')).click(); await p.waitForTimeout(700);
  await p.evaluate(() => window.__game.openHint()); await shot('09-hint'); await p.keyboard.press('Escape');
  // 6. 문
  await view('north'); await sel('key'); await clickObj('빨간 문'); await shot('10-door-open');
  await clickObj('빨간 문'); await p.waitForTimeout(2200); await shot('11-ending');
  const flags = await p.evaluate(() => window.__game.s.flags);
  console.log('won:', !!flags.__won);
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(flags.__won && !errs.length ? 0 : 1);
})();
