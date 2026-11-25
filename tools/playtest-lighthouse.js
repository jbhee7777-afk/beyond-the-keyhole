// 8장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 순서(그림자가 남았을 때·깜깜할 때·뭉툭한 색연필)도 확인한다.
// 사용법: node tools/playtest-desk.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-8')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-lighthouse';

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

  // 1. 까망이
  await view('east'); await clickObj('등대지기 까망이'); await p.waitForTimeout(5400); await shot('03-keeper');
  await clickObj('등대 일지'); await shot('04-log'); await back();
  await clickObj('종이학 접이'); await shot('04b-crane');
  // 손잡이부터 당겨 보기 (잉크 없음)
  await view('north'); await clickObj('등불 손잡이'); await expect(async () => !(await flags()).lampOn, '잉크 없이 등불이 켜짐');
  // 2. 걸레 → 빗물 → 렌즈
  await view('south'); await clickObj('걸레'); for (const c of ['빨강', '파랑', '노랑', '검정']) await clickObj(`${c} 잉크병`); await shot('05-shelf-empty');
  await view('west'); await shot('06a-west-dark'); await sel('rag'); await clickObj('빗물통');
  await view('north'); await sel('wetrag'); await clickObj('등대 렌즈'); await shot('06b-lens-clean');
  // 3. 망원경 → 초록
  await view('west'); await clickObj('망원경'); await clickObj('먼 기차역'); await shot('07-scope'); await back();
  // 틀린 섞기와 틀린 색
  await sel('ink_red'); await sel('ink_yellow'); await expect(async () => !(await p.evaluate(() => window.__game.s.inv.includes('ink_green'))), '빨강+노랑이 초록이 됨');
  await view('north'); await sel('ink_red'); await clickObj('잉크 통'); await expect(async () => !(await flags()).inkIn, '빨강 잉크가 들어감');
  await sel('ink_blue'); await sel('ink_yellow'); await shot('08-green');
  await sel('ink_green'); await clickObj('잉크 통');
  await p.evaluate(() => window.__game.openHint()); await shot('09-hint'); await p.keyboard.press('Escape');
  await clickObj('등불 손잡이'); await p.waitForTimeout(1600); await shot('10-lamp-on');
  // 4. 징검다리
  await view('east'); await shot('11-east-lit'); await view('west'); await shot('12-stones');
  await clickObj('빛나는 징검다리'); await p.waitForTimeout(2200); await shot('13-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
