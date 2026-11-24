// 학교 크롬북·저가 태블릿용 가벼운 배포본 만들기
// 모든 SVG(종이 얼룩·선 떨림 필터가 들어 있어 그릴 때 무겁다)를 한 번 WebP 그림으로 구워 dist/ 에 담는다.
// 원본 SVG와 생성기(tools/art)는 그대로 두고, dist/ 만 새로 만든다.
// 사용법: npm run build   →  dist/index.html 을 열거나 dist 폴더를 통째로 올리면 된다.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const QUALITY = 0.86;
const SCALE = Number(process.env.RASTER_SCALE || 1); // 2로 주면 선명하지만 두 배 무거움

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

function serve() {
  const types = { '.svg': 'image/svg+xml', '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  const srv = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

(async () => {
  fs.rmSync(DIST, { recursive: true, force: true });
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(base + 'index.html');

  const svgs = walk(path.join(ROOT, 'assets')).filter((f) => f.endsWith('.svg'));
  let before = 0, after = 0;
  for (const f of svgs) {
    const r = rel(f);
    const txt = fs.readFileSync(f, 'utf8');
    const m = txt.match(/<svg[^>]*?\bwidth="([\d.]+)"[^>]*?\bheight="([\d.]+)"/) || txt.match(/viewBox="[\d.\s-]+?\s([\d.]+)\s([\d.]+)"/);
    const w = m ? Math.round(+m[1]) : 1600, h = m ? Math.round(+m[2]) : 900;
    const data = await p.evaluate(async ({ url, w, h, q, sc }) => {
      const img = new Image(); img.src = url; await img.decode();
      const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', q);
    }, { url: base + r, w, h, q: QUALITY, sc: SCALE });
    const out = path.join(DIST, r.replace(/\.svg$/, '.webp'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const buf = Buffer.from(data.split(',')[1], 'base64');
    fs.writeFileSync(out, buf);
    before += txt.length; after += buf.length;
  }
  await b.close(); srv.close();

  // 코드·글꼴·PNG 등은 복사하고, 글 속의 .svg 경로는 .webp 로 바꾼다
  const copy = ['index.html', 'js', 'css', 'assets/fonts'];
  for (const c of copy) {
    const src = path.join(ROOT, c);
    for (const f of fs.statSync(src).isDirectory() ? walk(src) : [src]) {
      const out = path.join(DIST, rel(f));
      fs.mkdirSync(path.dirname(out), { recursive: true });
      if (/\.(js|css|html)$/.test(f)) fs.writeFileSync(out, fs.readFileSync(f, 'utf8').replace(/\.svg\b/g, '.webp'));
      else fs.copyFileSync(f, out);
    }
  }
  for (const f of walk(path.join(ROOT, 'assets')).filter((f) => !f.endsWith('.svg') && !rel(f).startsWith('assets/fonts'))) {
    const out = path.join(DIST, rel(f)); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(f, out);
  }
  console.log(`${svgs.length}개 그림: SVG ${(before / 1048576).toFixed(1)}MB → WebP ${(after / 1048576).toFixed(1)}MB (dist/)`);
})();
