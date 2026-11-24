// 2장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 사용법: node tools/playtest-toyshop.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-2')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-toyshop';

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

  // 1~2. 작업등 → 그림자 인형극
  await view('east'); await clickObj('빨간 작업등'); await shot('03-east-lamp');
  await clickObj('그림자 인형극 무대'); await shot('04a-theater');
  const rot = await p.evaluate(() => window.__game.s.flags.rot.slice());
  const labels = ['몸 조각', '머리 조각', '귀 조각'];
  for (let i = 0; i < 3; i++) for (let k = 0; k < (4 - rot[i]) % 4; k++) await clickObj(labels[i]);
  await shot('04b-theater-solved');
  await clickObj('고무줄'); await p.waitForTimeout(700); await back();
  // 3. 치즈 병
  await view('south'); await sel('rubberband'); await clickObj('치즈 병'); await p.waitForTimeout(700);
  // 4. 생쥐
  await view('east'); await clickObj('쥐구멍'); await shot('05a-mouse');
  await sel('cheese'); await clickObj('생쥐 찍찍이'); await p.waitForTimeout(1400); await shot('05b-mouse-fed'); await back();
  // 5. 시침핀, 실뜯개
  await view('west'); await clickObj('토마토 바늘꽂이'); await p.waitForTimeout(700);
  await clickObj('파란 반짇고리 통'); await shot('06-tin'); await clickObj('실뜯개'); await p.waitForTimeout(700); await back();
  await clickObj('자수 액자'); await shot('07-score'); await back();
  // 6. 깜짝 상자
  await view('north'); await clickObj('깜짝 상자');
  await sel('crank'); await clickObj('손잡이 구멍');
  await clickObj('태엽 손잡이 돌리기'); await p.waitForTimeout(2600); await shot('08a-jbox-wrong');
  await sel('pins'); await clickObj('오르골 원통');
  const PAT = [2, 1, 0, 1, 2, 0], R = ['위', '가운데', '아래'];
  for (let c = 1; c < 6; c++) await clickObj(`${c + 1}번째 줄 ${R[PAT[c]]} 칸`);
  await shot('08b-jbox-pins');
  await clickObj('태엽 손잡이 돌리기'); await p.waitForTimeout(2400); await shot('09a-pop');
  await p.waitForTimeout(9000); await shot('09b-awake');
  await sel('ripper'); await sel('carrot'); await p.waitForTimeout(500);
  await view('south'); await shot('10-south-awake');
  await view('north');
  await p.evaluate(() => window.__game.openHint()); await shot('11-hint'); await p.keyboard.press('Escape');
  await sel('key'); await clickObj('공방 문'); await shot('12-door-open');
  await clickObj('공방 문'); await p.waitForTimeout(2200); await shot('13-ending');
  const flags = await p.evaluate(() => window.__game.s.flags);
  console.log('won:', !!flags.__won);
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(flags.__won && !errs.length ? 0 : 1);
})();
