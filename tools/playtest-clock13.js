// 3장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 사용법: node tools/playtest-clock13.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-3')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-clock13';

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
  const clickObj = async (label) => { await p.click(`[aria-label="${label}"]:visible, [data-id="${label}"]:visible >> nth=0`, { force: true }); await p.waitForTimeout(450); };
  const sel = async (item) => { await p.click(`.slot[data-item="${item}"]`); await p.waitForTimeout(200); };
  const view = async (v) => { await p.evaluate((v) => window.__game.api.go(v), v); await p.waitForTimeout(500); };
  const back = async () => { await p.click('.nav-back'); await p.waitForTimeout(400); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');
  // 1. 커튼 → 달빛, 야광 글씨
  await view('east'); await clickObj('커튼'); await p.waitForTimeout(3200); await shot('03-east-moon');
  await clickObj('빛나는 글씨'); await shot('04-glow'); await back();
  // 2. 시계와 거울
  await view('north'); await clickObj('괘종시계'); await shot('05-clock'); await back();
  await view('south'); await shot('06a-south-moon'); await clickObj('큰 거울'); await shot('06b-mirror'); await back();
  // 3. 트렁크 시계 자물쇠: 짧은 바늘만 4시로 (12 → 4, 네 번)
  await view('west'); await clickObj('양초'); await p.waitForTimeout(400);
  await clickObj('낡은 트렁크'); await shot('07a-lock');
  for (let i = 0; i < 4; i++) await clickObj('짧은 바늘 돌리기');
  await p.waitForTimeout(900); await shot('07b-trunk-open');
  await clickObj('회중시계'); await p.waitForTimeout(400); await clickObj('바늘 꽂힌 실패'); await p.waitForTimeout(400); await back();
  // 4. 거미에게 실 → 작은 열쇠 → 책상 서랍 → 성냥
  await view('north'); await sel('spool'); await clickObj('작은 거미'); await p.waitForTimeout(900); await shot('07c-spider');
  await view('south'); await sel('smallkey'); await clickObj('책상 서랍'); await p.waitForTimeout(600); await clickObj('성냥'); await p.waitForTimeout(500); await back();
  await sel('matches'); await sel('candle');
  // 5. 촛대 → 그림자 유령
  await view('west'); await clickObj('어두운 벽'); await sel('candle_lit'); await clickObj('빈 촛대'); await p.waitForTimeout(1200); await shot('08a-ghost-shy');
  // 6. 수수께끼: 바늘 두 개, 얼굴 → 시계
  await clickObj('그림자 유령 똑딱'); await p.waitForTimeout(4600); await shot('08b-ghost-riddle');
  await sel('watch'); await clickObj('그림자 유령 똑딱'); await p.waitForTimeout(2400); await shot('08c-ghost-happy');
  await p.evaluate(() => window.__game.openHint()); await shot('09-hint'); await p.keyboard.press('Escape');
  // 7. 13 조각 → 13번 종
  await view('north'); await clickObj('괘종시계'); await sel('piece'); await clickObj('빈 숫자 자리');
  await p.waitForTimeout(2600); await shot('10a-striking');
  await p.waitForTimeout(7000); await shot('10b-north-open');
  await clickObj('다락방 문'); await p.waitForTimeout(2200); await shot('11-ending');
  const flags = await p.evaluate(() => window.__game.s.flags);
  console.log('won:', !!flags.__won);
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(flags.__won && !errs.length ? 0 : 1);
})();
