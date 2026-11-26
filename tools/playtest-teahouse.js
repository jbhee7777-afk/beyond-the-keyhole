// 12장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 길(새 높이 그대로 붓기, 끓는 물만, 호수에 샘물)도 확인한다.
// 사용법: node tools/playtest-teahouse.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-12')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-teahouse';

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
  const setGlasses = async (want) => {
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 5; k++) {
        const lv = await p.evaluate((i) => +document.querySelectorAll('.glass-row .glass')[i].dataset.level, i);
        if (lv === want[i]) break;
        await p.click(`.glass-row .glass >> nth=${i}`); await p.waitForTimeout(120);
      }
    }
  };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');

  // 1. 달래
  await view('south'); await clickObj('수달 달래'); await p.waitForTimeout(6400); await shot('03-dalle');
  await view('west'); await clickObj('둥근 문'); await expect(async () => !(await flags()).__won, '문이 처음부터 열림');

  // 2. 국자로 찬물 → 주전자 → 김 서린 창
  await view('east'); await clickObj('물항아리');
  await view('north'); await sel('ladle'); await clickObj('화로 위 구리 주전자'); await p.waitForTimeout(800); await shot('04-fog');
  await expect(async () => (await flags()).fogged, '김이 서리지 않음');

  // 3. 물잔 실로폰: 새 높이 그대로(틀림) → 뒤집어서(맞음)
  await view('east'); await clickObj('물잔 네 개'); await shot('05a-glasses');
  await setGlasses([3, 2, 4, 1]); await clickObj('두드려 보기'); await p.waitForTimeout(2400);
  await expect(async () => !(await flags()).cabinetOpen, '새 높이 그대로 부었는데 찻장이 열림');
  await setGlasses([2, 3, 1, 4]); await shot('05b-glasses-right'); await clickObj('두드려 보기'); await p.waitForTimeout(2600);
  await expect(async () => (await flags()).cabinetOpen, '찻장이 안 열림');
  await shot('06-cabinet-open');

  // 4. 찻잎 통 라벨, 계량 도구, 찬물
  await clickObj('유리문 찻장'); await shot('07-tinlabel'); await back();
  await clickObj('유리문 찻장'); await clickObj('물항아리');

  // 5. 차 우리기: 끓는 물만(틀림) → 3:1(맞음)
  await view('north'); await clickObj('찻주전자 쟁반'); await shot('08a-brew');
  await clickObj('작은 잔 (1잔)'); for (let i = 0; i < 4; i++) await clickObj('화로의 끓는 물');
  await expect(async () => !(await flags()).brewed, '끓는 물만으로 차가 됨'); await shot('08b-too-hot');
  await clickObj('찻주전자 비우기');
  await clickObj('큰 계량 주전자 (3잔)'); await clickObj('화로의 끓는 물');
  await clickObj('작은 잔 (1잔)'); await clickObj('국자의 찬물'); await p.waitForTimeout(1300); await shot('08c-brewed');
  await expect(async () => await has('tea'), '차를 못 우림');

  // 6. 달래에게 차 → 찻잎 점
  await view('south'); await sel('tea'); await clickObj('수달 달래'); await p.waitForTimeout(2400); await shot('09-leaves'); await back();

  // 7. 물고기 서랍
  await view('west'); await clickObj('새 서랍'); await expect(async () => !(await has('spring')), '새 서랍에서 샘물이 나옴');
  await clickObj('물고기 서랍'); await shot('10-spring');

  // 8. 지도: 호수(틀림) → 산(맞음)
  await view('south'); await sel('spring'); await clickObj('지도의 호수'); await expect(async () => !(await flags()).flowed, '호수에 떨어뜨렸는데 물이 흐름');
  await p.evaluate(() => window.__game.openHint()); await shot('11-hint'); await p.keyboard.press('Escape');
  await sel('spring'); await clickObj('지도의 산'); await p.waitForTimeout(800); await shot('12-flow');

  // 9. 둥근 문
  await view('west'); await shot('13-west-open'); await clickObj('둥근 문'); await p.waitForTimeout(2400); await shot('14-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
