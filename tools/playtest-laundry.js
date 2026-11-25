// 7장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 순서(그림자가 남았을 때·깜깜할 때·뭉툭한 색연필)도 확인한다.
// 사용법: node tools/playtest-desk.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-7')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-laundry';

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
  // 1. 뭉게
  await clickObj('구름 양 뭉게'); await p.waitForTimeout(5400); await shot('03-sheep');
  // 2. 분실물 바구니: 돋보기, 도르래 손잡이, 벙어리장갑
  await view('west'); await clickObj('분실물 바구니'); await shot('04-lost');
  await clickObj('돋보기'); await clickObj('벙어리장갑'); await back();
  // 양 + 말 = 양말: 말무늬 양말 속 도르래 손잡이
  await view('north'); await clickObj('별무늬 양말'); await expect(async () => !(await p.evaluate(() => window.__game.s.inv.includes('crank'))), '별무늬 양말에서 손잡이가 나옴');
  await clickObj('말무늬 양말'); await shot('04b-sock');
  // 세제 병
  await view('south'); for (const k of ['물방울', '회오리', '해님', '눈송이']) await clickObj(`${k} 세제`); await shot('04c-soaps');
  // 무지개 안내판
  await view('south'); await clickObj('무지개 손님 안내판'); await shot('05-poster'); await back();
  // 3. 도르래 → 햇빛
  await view('east'); await shot('06a-east-dark'); await sel('crank'); await clickObj('도르래 손잡이 구멍'); await p.waitForTimeout(3200); await shot('06b-sun');
  // 4. 먼지 구름 → 돋보기로 꼬리표
  await view('north'); await clickObj('빨래 바구니');
  await sel('magnifier'); await sel('greycloud'); await shot('07-label'); await back();
  // 5. 세탁기: 틀린 순서 → 다시 → 물방울·회오리·해
  await sel('greycloud'); await clickObj('커다란 세탁기'); await shot('08a-machine');
  await sel('soap_wind'); await clickObj('세제 넣는 칸'); await expect(async () => !((await flags()).seq || []).length, '틀린 세제가 먼저 들어감');
  await sel('soap_snow'); await clickObj('세제 넣는 칸');
  for (const k of ['soap_drop', 'soap_wind', 'soap_sun']) { await sel(k); await clickObj('세제 넣는 칸'); }
  await shot('08b-washing'); await p.waitForTimeout(2800); await back();
  await sel('mitten'); await clickObj('구름 양 뭉게'); await p.waitForTimeout(600);
  // 6. 서쪽 빨랫줄에 빗구름 → 무지개
  // 해를 마주 보는 동쪽 줄에 널면 무지개가 안 뜬다
  await view('east'); await sel('raincloud'); await clickObj('이불 구름'); await shot('08c-east-wrong');
  await expect(async () => !(await flags()).rainHung, '동쪽에 널었는데 걸림');
  await view('north'); await clickObj('종이학 접이'); await shot('08d-crane');
  await view('west'); await sel('raincloud'); await clickObj('빨랫줄'); await shot('09-rainbow');
  await p.evaluate(() => window.__game.openHint()); await shot('10-hint'); await p.keyboard.press('Escape');
  await view('north'); await shot('11-north-happy'); await view('west');
  await clickObj('무지개 다리'); await p.waitForTimeout(2200); await shot('12-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
