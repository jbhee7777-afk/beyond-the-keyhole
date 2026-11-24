// 5장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 사용법: node tools/playtest-sea.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-5')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-sea';

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
  const clickObj = async (label) => { await p.click(`[aria-label="${label}"]:visible, [data-id="${label}"]:visible >> nth=0`); await p.waitForTimeout(450); };
  const sel = async (item) => { await p.click(`.slot[data-item="${item}"]`); await p.waitForTimeout(200); };
  const view = async (v) => { await p.evaluate((v) => window.__game.api.go(v), v); await p.waitForTimeout(500); };
  const back = async () => { await p.click('.nav-back'); await p.waitForTimeout(400); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');
  // 1. 편지 받기
  await view('north'); await clickObj('문어 우체국장 팔방이'); await p.waitForTimeout(5800); await shot('03-octopus');
  // 2. 소라
  await view('west'); await clickObj('소라 껍데기'); await shot('04-conch'); await back();
  await clickObj('낚싯바늘'); await p.waitForTimeout(400); await clickObj('미역 줄'); await p.waitForTimeout(400);
  await clickObj('우표 서랍'); await shot('05-stamps');
  for (const l of ['멸치 우표', '고등어 우표', '꽁치 우표']) { await clickObj(l); await p.waitForTimeout(500); }
  await back();
  // 3. 등불 → 58번 우편함
  await view('east'); await clickObj('우편함 벽'); await clickObj('58번 우편함'); await p.waitForTimeout(300); await back();
  await clickObj('등불 끈'); await p.waitForTimeout(2600); await shot('06-east-lit');
  await clickObj('우편함 벽'); await shot('07a-boxes'); await clickObj('31번 우편함');
  await clickObj('58번 우편함'); await p.waitForTimeout(600); await shot('07b-box58'); await clickObj('주소 스티커'); await p.waitForTimeout(600); await back();
  // 4. 편지 + 주소 + 우표
  await sel('address'); await sel('letter'); await p.waitForTimeout(300);
  await sel('stamp_anchovy'); await sel('letter_addr'); await shot('08a-wrong-stamp');
  await sel('stamp_mackerel'); await sel('letter_addr'); await p.waitForTimeout(400);
  // 5. 미역 갈고리 → 산호 열쇠
  await sel('hook'); await sel('kelp');
  await view('south'); await shot('09a-south'); await clickObj('산호 바위'); await shot('09b-coral');
  await sel('kelp_hook'); await clickObj('산호 틈 열쇠'); await p.waitForTimeout(700); await back();
  // 6. 우편관 → 고래 → 엘리베이터
  await view('north'); await sel('key'); await clickObj('거품 우편관 뚜껑');
  await p.evaluate(() => window.__game.openHint()); await shot('10-hint'); await p.keyboard.press('Escape');
  await sel('letter_ready'); await clickObj('거품 우편관 뚜껑'); await p.waitForTimeout(3000);
  await view('south'); await shot('11-whale'); await p.waitForTimeout(5200); await shot('11b-fog-mirror');
  await clickObj('김 서린 창의 숫자'); await p.waitForTimeout(300);
  // 엘리베이터 숫자 판: 거울 글씨를 바로 읽은 1-3-8
  await view('north'); await clickObj('수면 엘리베이터'); await shot('12a-elev-panel');
  for (const [i, n] of [[0, 1], [1, 3], [2, 8]]) for (let k = 0; k < n; k++) await clickObj(`${i + 1}번째 엘리베이터 숫자`);
  await p.waitForTimeout(1200); await shot('12-north-open');
  await clickObj('수면 엘리베이터'); await p.waitForTimeout(2200); await shot('13-ending');
  const flags = await p.evaluate(() => window.__game.s.flags);
  console.log('won:', !!flags.__won);
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(flags.__won && !errs.length ? 0 : 1);
})();
