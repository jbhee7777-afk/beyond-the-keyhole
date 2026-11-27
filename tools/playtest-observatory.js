// 13장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 길(왼쪽 반달 서랍, 11바퀴, 렌즈 하나만 끼운 망원경, 틀린 별 단추)도 확인한다.
// 사용법: node tools/playtest-observatory.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-13')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-observatory';

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
  const combine = async (a, c) => { await sel(a); await sel(c); await p.waitForTimeout(300); };
  const view = async (v) => { await p.evaluate((v) => window.__game.api.go(v), v); await p.waitForTimeout(500); };
  const back = async () => { await p.click('.nav-back'); await p.waitForTimeout(400); };
  const flags = () => p.evaluate(() => window.__game.s.flags);
  const has = (i) => p.evaluate((i) => window.__game.s.inv.includes(i), i);
  const zoom = () => p.evaluate(() => window.__game.s.zoom);
  const expect = async (cond, msg) => { if (!(await cond())) fails.push(msg); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');

  // 1. 휘
  await view('north'); await clickObj('부엉이 휘'); await p.waitForTimeout(12400); await shot('03-whi');

  // 2. 달 서랍: 왼쪽 반달(틀림) → 오른쪽 반달
  await view('east'); await clickObj('왼쪽이 빛나는 반달 서랍'); await expect(async () => !(await has('key')), '왼쪽 반달 서랍에서 열쇠가 나옴');
  await clickObj('오른쪽이 빛나는 반달 서랍'); await expect(async () => !(await has('key')), '틀린 서랍 뒤 잠겼는데 바로 열림'); await shot('04a-jammed');
  await p.evaluate(() => { window.__game.s.flags.calJam = 0; }); // 20초 기다리는 대신
  await clickObj('오른쪽이 빛나는 반달 서랍'); await expect(async () => await has('key'), '오른쪽 반달 서랍에 열쇠가 없음'); await shot('04-key');

  // 3. 행성 모형: 열쇠 없이 → 열쇠 → 11바퀴(틀림) → 12바퀴
  await view('south'); await clickObj('태엽 행성 모형'); await expect(async () => !(await zoom()), '열쇠 없이 행성 모형이 열림');
  await sel('key'); await clickObj('태엽 행성 모형'); await shot('05a-orrery');
  const setTurns = async (n) => { // +10·+1 버튼으로 n바퀴 맞추기
    await p.evaluate(() => { window.__game.s.flags.turnsSet = 1; window.__game.render(); }); await p.waitForTimeout(200);
    for (let k = 0; k < Math.floor((n - 1) / 10); k++) await p.click('[aria-label="감을 바퀴 수 +10"]');
    for (let k = 0; k < (n - 1) % 10; k++) await p.click('[aria-label="감을 바퀴 수 +1"]');
    await p.waitForTimeout(200);
  };
  await setTurns(11); await shot('05b-orrery-set11'); await p.click('[aria-label="태엽 풀기"]'); await p.waitForTimeout(4600);
  await expect(async () => !(await flags()).aligned, '11바퀴에 정렬됨'); await shot('05b-orrery-11');
  await p.waitForTimeout(1200);
  await setTurns(12); await p.click('[aria-label="태엽 풀기"]'); await p.waitForTimeout(3800); await shot('05c-aligned');
  await expect(async () => (await flags()).aligned, '12바퀴에 정렬 안 됨');
  if (await zoom()) await back();
  await clickObj('태엽 행성 모형'); await expect(async () => await has('lensbig'), '큰 렌즈를 못 얻음');

  // 4. 작은 렌즈, 겹쳐 보기(실패 안내)
  await view('east'); await clickObj('책상 돋보기'); await combine('lensbig', 'lenssmall');

  // 5. 초점 재기
  await sel('lensbig'); await clickObj('책상 등잔'); await shot('06a-focus-big');
  for (let i = 0; i < 7; i++) await clickObj('렌즈 높이 (자 눈금) +1');
  await shot('06b-focus-big-9'); await expect(async () => (await flags()).focal_big, '큰 렌즈 초점(9칸)을 못 찾음'); await back();
  await sel('lenssmall'); await clickObj('책상 등잔');
  for (let i = 0; i < 5; i++) await clickObj('렌즈 높이 (자 눈금) −1');
  await shot('06c-focus-small-3'); await expect(async () => (await flags()).focal_small, '작은 렌즈 초점(3칸)을 못 찾음'); await back();

  // 6. 망원경: 렌즈 하나만 → 둘 → 통 길이 5칸
  await view('north'); await sel('lensbig'); await clickObj('큰 망원경'); await clickObj('큰 망원경');
  await expect(async () => !(await zoom()), '렌즈 하나로 망원경이 열림');
  await sel('lenssmall'); await clickObj('큰 망원경'); await clickObj('큰 망원경'); await shot('07a-scope-blur');
  for (let i = 0; i < 5; i++) await clickObj('통 길이 (칸) +1');
  await clickObj('들여다보기'); await expect(async () => !(await flags()).focused, '통 11칸인데 또렷함'); await p.waitForTimeout(3200);
  await clickObj('통 길이 (칸) +1'); await clickObj('들여다보기');
  await shot('07b-scope-sharp'); await expect(async () => (await flags()).focused, '통 12칸인데 또렷하지 않음'); await back();
  await p.evaluate(() => window.__game.openHint()); await shot('08-hint'); await p.keyboard.press('Escape');

  // 7. 남색 문: 틀린 단추 → 모두 끄기 → 별자리 일곱 개
  await view('west'); await clickObj('남색 문'); await shot('09a-door');
  await clickObj('별 단추 1'); await clickObj('모두 끄기');
  for (const n of [2, 3, 6, 7, 8, 10]) await clickObj('별 단추 ' + n);
  await expect(async () => !(await flags()).doorOpen, '여섯 개만 켰는데 문이 열림'); await shot('09b-six');
  await clickObj('별 단추 11'); await p.waitForTimeout(1800);
  await expect(async () => (await flags()).doorOpen, '별자리대로 켰는데 문이 안 열림');
  await view('west'); await shot('10-west-open');
  await view('north'); await shot('11-whi-happy');
  await view('west'); await clickObj('남색 문'); await p.waitForTimeout(2400); await shot('12-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
