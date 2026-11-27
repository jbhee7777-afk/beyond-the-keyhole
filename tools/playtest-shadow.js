// 14장 자동 플레이 테스트: 처음부터 탈출까지 실제로 클릭하며 스크린샷을 남긴다.
// 틀린 길(포스터 순서 자물쇠, 순서 틀린 공연, 막 밖으로 넘치는 그림자, 작은 늑대)도 확인한다.
// 사용법: node tools/playtest-shadow.js [스크린샷 폴더]
const { chromium } = require('playwright');
const path = require('path');
const OUT = (process.argv[2] || path.join(__dirname, '..', 'screenshots', 'playtest-14')) + '/';
const URL = 'file://' + path.join(__dirname, '..', 'index.html') + '#play-shadow';

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
  const LOCK = ['boat', 'bird', 'deer', 'wolf', 'rabbit', 'branch'];
  const setLock = async (want) => {
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 6; k++) {
        const d = await p.evaluate((i) => window.__game.s.flags.dials[i], i);
        if (LOCK[d] === want[i]) break;
        await clickObj(`자물쇠 ${i + 1}번 칸`);
      }
    }
  };
  const scene = async (puppet, notch) => { await clickObj(`${puppet} 인형 세우기`); await clickObj(`홈 ${notch}칸`); await clickObj('이 장면 올리기'); await p.waitForTimeout(500); };

  await shot('01-north');
  for (const v of ['east', 'south', 'west']) { await p.click('.nav-right'); await shot('02-' + v); }
  await p.click('.nav-right');

  // 1. 너울
  await view('north'); await clickObj('그림자 너울'); await p.waitForTimeout(14500); await shot('03-nuul');
  await view('west'); await clickObj('벨벳 커튼 출구'); await expect(async () => !(await flags()).__won, '커튼이 처음부터 열림');

  // 2. 셀로판 → 대본
  await view('north'); await clickObj('악보대의 대본'); await shot('04a-script'); await back();
  await view('south'); await clickObj('매표소 아래 문');
  await view('north'); await sel('cellophane'); await clickObj('악보대의 대본'); await shot('04b-script-red'); await back();
  await expect(async () => (await flags()).redLook, '셀로판으로 대본을 못 봄');

  // 3. 인형, 사슴
  await view('east'); for (const n of ['토끼', '나뭇가지', '새', '배']) await clickObj(n + ' 인형');
  await shot('05-rack-empty');
  await combine('rabbit', 'branch'); await expect(async () => await has('deer'), '사슴을 못 만듦');

  // 4. 트렁크: 포스터 순서(틀림) → 대본 순서
  await view('south'); await clickObj('자물쇠 트렁크'); await shot('06a-trunk');
  await setLock(['wolf', 'boat', 'deer', 'bird']); await clickObj('뚜껑 당기기');
  await expect(async () => !(await flags()).trunkOpen, '포스터 순서로 트렁크가 열림');
  await setLock(['boat', 'bird', 'deer', 'wolf']); await shot('06b-trunk-right'); await clickObj('뚜껑 당기기');
  await expect(async () => await has('wolf'), '트렁크에서 늑대를 못 얻음');

  // 5. 공연: 넘침 → 처음부터, 순서 틀림, 작은 늑대, 성공
  await view('north'); await p.click('[aria-label="하얀 막"]', { position: { x: 70, y: 80 } }); await p.waitForTimeout(450); await shot('07a-backstage');
  await scene('배', 1); await expect(async () => (await flags()).scene === 0, '넘치는 그림자로 장면이 넘어감'); await shot('07b-overflow');
  await scene('배', 3); await expect(async () => (await flags()).scene === 1, '배 장면 실패');
  await scene('사슴', 3); await expect(async () => (await flags()).scene === 0, '순서 틀렸는데 계속됨');
  await scene('배', 2); await scene('새', 3); await scene('사슴', 2); await shot('07c-three');
  await scene('늑대', 3); await expect(async () => (await flags()).scene === 0, '작은 늑대로 장면이 넘어감');
  await scene('배', 4); await scene('새', 2); await scene('사슴', 3);
  await clickObj('늑대 인형 세우기'); await clickObj('홈 1칸'); await shot('07d-big-wolf'); await clickObj('이 장면 올리기');
  await p.waitForTimeout(3000);
  await expect(async () => (await flags()).performed, '공연을 못 끝냄');
  await view('north'); await shot('08-nuul-body');
  await p.evaluate(() => window.__game.openHint()); await shot('09-hint'); await p.keyboard.press('Escape');

  // 6. 출구
  await view('west'); await shot('10-west-open'); await clickObj('벨벳 커튼 출구'); await p.waitForTimeout(2400); await shot('11-ending');
  const f = await flags();
  console.log('won:', !!f.__won);
  console.log('fails:', fails.length ? fails : 'none');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(f.__won && !errs.length && !fails.length ? 0 : 1);
})();
