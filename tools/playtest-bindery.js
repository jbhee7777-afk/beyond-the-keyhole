// 11장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 순서(빨랫줄 위 풀무, 미끄러운 실, 거꾸로 조판, 차가운 활자, 손잡이 없는 누르개)도 확인한다.
// 사용법: node tools/playtest-bindery.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-11')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-bindery';

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
  const expect = async (cond, msg) => { if (!(await cond())) fails.push(msg); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');

  // 1. 모리
  await view('east'); await clickObj('나방 모리'); await p.waitForTimeout(6000); await shot('03-mori');
  // 책장은 아직 안 열림
  await view('west'); await clickObj('큰 책장'); await expect(async () => !(await flags()).__won, '책 없이 탈출함');

  // 2. 접장 걷기 전에 풀무질 → 막힘
  await view('south'); await clickObj('풀무');
  await view('east'); await sel('bellows'); await clickObj('동쪽 둥근 창'); await expect(async () => !(await flags()).moon, '빨랫줄에 접장이 걸린 채 구름이 날아감');
  await clickObj('빨랫줄의 접장'); await clickObj('두루마리 바구니'); await shot('04-east-empty');

  // 3. 가죽 책 등 → 꿰매기 틀에서 순서 맞추기
  await view('north'); await clickObj('가죽 책'); await shot('05-spine'); await back();
  await sel('sigs'); await clickObj('꿰매기 틀'); await shot('06a-frame');
  for (let pos = 0; pos < 6; pos++) {
    const ranks = await p.evaluate(() => [...document.querySelectorAll('.sig-row .sig')].map((e) => +e.dataset.rank));
    if (!ranks.length) break;
    const j = ranks.indexOf(pos + 1);
    if (j !== pos) { await p.click(`.sig-row .sig >> nth=${j}`); await p.waitForTimeout(250); await p.click(`.sig-row .sig >> nth=${pos}`); await p.waitForTimeout(350); }
  }
  await p.waitForTimeout(900); await shot('06b-collated');
  await expect(async () => (await flags()).collated, '접장 순서를 맞췄는데 틀에 안 걸림');

  // 4. 실: 갈고리 → 빈 고치 → 밀랍
  await view('west'); await clickObj('커다란 빈 고치'); await expect(async () => !(await has('silk')), '갈고리 없이 실을 얻음');
  await sel('hook'); await clickObj('커다란 빈 고치'); await shot('07-silk');
  // 5. 바늘: 고슴도치 (핀은 미끼)
  await view('south'); await clickObj('고슴도치 바늘꽂이'); await clickObj('핀'); await expect(async () => !(await has('needle')), '핀을 바늘로 얻음');
  await clickObj('긴 바늘'); await shot('08-needle'); await back();
  await combine('silk', 'needle'); await expect(async () => !(await has('threaded')), '미끄러운 실이 바늘에 꿰어짐');
  await view('north'); await sel('silk'); await clickObj('밀랍 덩어리'); await combine('waxsilk', 'needle');
  await sel('threaded'); await clickObj('꿰매기 틀'); await shot('09-textblock');
  await expect(async () => await has('textblock'), '꿰맸는데 책 몸통이 없음');

  // 6. 표지: 바구니 → 풀무로 구름 → 비침 무늬
  await clickObj('두루마리 바구니');
  await view('east'); await sel('cover'); await clickObj('동쪽 둥근 창'); await expect(async () => !(await flags()).watermarkSeen, '구름 낀 창에서 무늬가 보임');
  await sel('bellows'); await clickObj('동쪽 둥근 창'); await shot('10-moon');
  await sel('cover'); await clickObj('동쪽 둥근 창'); await shot('11-watermark'); await back();

  // 7. 활자판: 바로 놓으면 거꾸로 찍힘 → 오른쪽부터
  await view('south'); await clickObj('활자 판'); await shot('12a-type');
  for (const t of ['나방', '별', '별', '별']) await clickObj(t + ' 활자');
  await clickObj('시험 찍기'); await shot('12b-proof-wrong');
  await expect(async () => !(await flags()).typeSet, '거꾸로 조판했는데 바로 찍힘');
  await clickObj('모두 빼기');
  for (const t of ['별', '별', '별', '나방']) await clickObj(t + ' 활자');
  await clickObj('시험 찍기'); await p.waitForTimeout(1200); await shot('12c-proof-right');
  await expect(async () => await has('typeset'), '조판한 활자를 못 얻음');

  // 8. 금박 → 차가운 활자(실패) → 난로 → 금박 찍기
  await clickObj('금박 책자'); await combine('goldleaf', 'cover');
  await combine('typeset', 'leafcover'); await expect(async () => !(await has('titlecover')), '차가운 활자로 금박이 붙음');
  await sel('typeset'); await clickObj('작은 난로'); await combine('hottype', 'leafcover'); await shot('13-titlecover');
  await combine('titlecover', 'textblock');
  await expect(async () => await has('book'), '책을 못 만듦');

  // 9. 누르개: 손잡이 없이 → 실패 → 서랍장 밑 손잡이
  await view('north'); await sel('book'); await clickObj('책 누르개'); await expect(async () => !(await flags()).pressed, '손잡이 없이 눌림');
  await view('south'); await clickObj('T자 쇠 손잡이');
  await view('north'); await sel('book'); await clickObj('책 누르개'); await shot('14-pressed');
  await p.evaluate(() => window.__game.openHint()); await shot('15-hint'); await p.keyboard.press('Escape');

  // 10. 모리 → 책장 → 탈출
  await view('east'); await clickObj('나방 모리'); await p.waitForTimeout(5600); await shot('16-mori-happy');
  await view('west'); await shot('17-west-open'); await clickObj('책장 뒤 통로'); await p.waitForTimeout(2400); await shot('18-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
