// 누르는 곳이 화면 단추(이동 화살표·가방 칸·위 도구 막대 등)에 가려지지 않았는지 모든 장·벽·확대 화면을 검사한다.
// 사용법: node tools/check-overlap.js [방 id...]
const { chromium } = require('playwright');
const path = require('path');
const BASE = 'file://' + path.join(__dirname, '..', 'index.html');
const ALL = ['greenhouse', 'toyshop', 'clock13', 'upside', 'sea', 'desk', 'laundry', 'lighthouse', 'station', 'studio', 'bindery', 'teahouse', 'observatory', 'shadow', 'foldhouse'];
const rooms = process.argv.slice(2).length ? process.argv.slice(2) : ALL;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  let bad = 0;
  for (const id of rooms) {
    await p.goto(BASE);
    await p.evaluate((id) => { localStorage.clear(); localStorage.setItem('btk.tips', JSON.stringify(['move', 'stuck', 'zoom', 'select', 'firstItem', 'combine', 'note', 'hint'])); }, id);
    await p.goto(BASE + '#play-' + id); await p.reload(); await p.waitForTimeout(1200);
    const info = await p.evaluate(() => { const g = window.__game; return { views: Object.keys(g.room.views), zooms: Object.keys(g.room.zooms || {}), items: Object.keys(g.room.items || {}) }; });
    // 가방을 채워 가방 칸이 다 보이게
    await p.evaluate((items) => { const g = window.__game; g.s.inv = items.slice(0, 8); g.render(); }, info.items);
    const check = async (where) => p.evaluate((where) => {
      const out = [];
      const isUI = (el) => el && !!el.closest('.nav-left, .nav-right, .nav-back, .slot, .inv, .bar, .topbar, .hud, .tools, .compass, .tip, .menu');
      const targets = [...document.querySelectorAll('.hit, button')].filter((e) => !isUI(e) && !e.closest('.ending, .hint-card, .notes, .modal')).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && getComputedStyle(e).visibility !== 'hidden'; });
      for (const t of targets) {
        const r = t.getBoundingClientRect(); let n = 0, ui = 0, cover = '';
        for (let i = 1; i <= 5; i++) for (let j = 1; j <= 5; j++) {
          const x = r.left + (r.width * i) / 6, y = r.top + (r.height * j) / 6;
          if (x < 0 || y < 0 || x > 1600 || y > 900) continue;
          n++;
          const el = document.elementFromPoint(x, y);
          if (el && el !== t && !t.contains(el) && isUI(el)) { ui++; cover = (el.closest('.nav-left, .nav-right, .nav-back, .slot, .inv, .bar, .topbar, .hud, .tools, .compass, .tip, .menu') || el).className; }
        }
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2, ce = document.elementFromPoint(cx, cy);
        const centerUI = ce && ce !== t && !t.contains(ce) && isUI(ce);
        if (centerUI || (n && ui / n >= 0.1)) out.push(`${where} · ${t.getAttribute('aria-label') || t.textContent.trim() || t.className} → ${Math.round((ui / n) * 100)}% 가림 (${String(cover).split(' ')[0]})`);
      }
      return out;
    }, where);
    const report = [];
    for (const v of info.views) {
      await p.evaluate((v) => { const g = window.__game; g.s.zoom = null; g.s.view = v; g.render(); }, v); await p.waitForTimeout(500);
      report.push(...(await check(v)));
    }
    for (const z of info.zooms) {
      await p.evaluate((z) => { const g = window.__game; g.s.zoom = z; g.render(); }, z); await p.waitForTimeout(500);
      report.push(...(await check('확대:' + z)));
    }
    if (report.length) { bad += report.length; console.log(`[${id}]`); report.forEach((r) => console.log('  ' + r)); }
  }
  console.log(bad ? `가려진 곳 ${bad}개` : '가려진 곳 없음');
  await b.close();
})();
