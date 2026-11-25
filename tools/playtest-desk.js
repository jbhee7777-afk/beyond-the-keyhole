// 6장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 순서(그림자가 남았을 때·깜깜할 때·뭉툭한 색연필)도 확인한다.
// 사용법: node tools/playtest-desk.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-6')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-desk';

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

  // 1. 그림 문, 쪽지, 엇갈린 연필
  await clickObj('그림 문'); await shot('03a-door-x');
  await clickObj('스케치북 구석 쪽지'); await shot('03b-note'); await back();
  await clickObj('연필꽂이');
  // 2. 책 더미 계단 → 내려다보면 글씨가 읽힌다
  await view('south'); await clickObj('거대한 연필 자국'); await clickObj('책 더미 계단'); await shot('04-booktop'); await back();
  await clickObj('종이학 접이'); await p.waitForTimeout(4800); await shot('05a-crane');
  // 3. 메모지 → 접이가 종이배
  await view('west'); await clickObj('메모지 묶음'); await clickObj('클립 상자');
  await view('south'); await sel('memo'); await clickObj('종이학 접이'); await shot('05b-boat');
  // 4. 물웅덩이 건너기 → 필통 → 몽당 색연필
  await view('east'); await clickObj('필통'); await sel('boat'); await clickObj('물웅덩이'); await shot('06a-crossed');
  await clickObj('필통'); await shot('06b-pcase'); await clickObj('몽당 색연필'); await back();
  // 뭉툭한 색연필로 그려 보기 (안 됨)
  await view('north'); await sel('crayon'); await clickObj('그림 문');
  await expect(async () => !(await flags()).knobDrawn, '뭉툭한 색연필로 손잡이가 그려짐');
  // 5. 연필깎이
  await view('west'); await sel('crayon'); await clickObj('연필깎이'); await shot('07-sharpened');
  // 그림자가 있을 때 그려 보기 (안 됨)
  await view('north'); await sel('crayon_sharp'); await clickObj('그림 문');
  await expect(async () => !(await flags()).knobDrawn, '그림자가 있는데 손잡이가 그려짐');
  // 불을 끄면 깜깜해서 못 그림
  await clickObj('스탠드 스위치'); await shot('08-dark');
  await sel('crayon_sharp'); await clickObj('그림 문');
  await expect(async () => !(await flags()).knobDrawn, '깜깜한데 손잡이가 그려짐');
  await clickObj('스탠드 스위치');
  // 6. 커튼: 끈은 너무 가벼움 → 클립으로 지우개와 연결 → 밀기
  await view('west'); await clickObj('커튼 끈'); await clickObj('커다란 지우개');
  await expect(async () => !(await flags()).curtainOpen, '묶지 않은 지우개로 커튼이 열림');
  await sel('clip'); await clickObj('커다란 지우개'); await shot('09a-tied');
  await clickObj('커다란 지우개'); await shot('09b-sunlight');
  // 7. 스탠드 끄기 → 햇빛만 → 손잡이 그리기 → 문
  await view('north'); await shot('10a-north-sun-and-lamp'); await clickObj('스탠드 스위치'); await shot('10b-shadow-gone');
  await p.evaluate(() => window.__game.openHint()); await shot('11-hint'); await p.keyboard.press('Escape');
  await sel('crayon_sharp'); await clickObj('그림 문'); await shot('12a-knob');
  await clickObj('그림 문'); await shot('12b-door-open');
  await clickObj('그림 문'); await p.waitForTimeout(2200); await shot('13-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
