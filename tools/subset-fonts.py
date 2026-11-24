"""글꼴 내장: 학교망에서 Google Fonts가 막혀도 책 느낌 글꼴이 나오게 한다.
원본 TTF(OFL): https://github.com/google/fonts/tree/main/ofl/gowunbatang , ofl/songmyung
사용법: pip install fonttools brotli
        python3 tools/subset-fonts.py <원본 TTF 폴더>
자주 쓰는 한글 2350자 + 게임에 나온 모든 글자만 남겨 assets/fonts/*.woff2 로 저장한다.
"""
import sys, glob, os
from fontTools import subset

src = sys.argv[1]
root = os.path.join(os.path.dirname(__file__), '..')
chars = set(chr(c) for c in range(0x20, 0x7f))
chars |= set('·…—–“”‘’「」『』《》〈〉←→↑↓★☆♪♥※○●□■△▽~！？、。')
for hi in range(0xB0, 0xC9):           # KS X 1001 완성형 한글 2350자
    for lo in range(0xA1, 0xFF):
        try: chars.add(bytes([hi, lo]).decode('euc-kr'))
        except UnicodeDecodeError: pass
for f in glob.glob(os.path.join(root, 'js', '**', '*.js'), recursive=True) + [os.path.join(root, 'index.html')]:
    chars |= set(open(f, encoding='utf-8').read())
text = ''.join(sorted(c for c in chars if c.isprintable()))
out = os.path.join(root, 'assets', 'fonts'); os.makedirs(out, exist_ok=True)
for name in ['GowunBatang-Regular', 'GowunBatang-Bold', 'SongMyung-Regular']:
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']
    f = subset.load_font(os.path.join(src, name + '.ttf'), opts)
    s = subset.Subsetter(opts); s.populate(text=text); s.subset(f)
    dst = os.path.join(out, name + '.woff2'); subset.save_font(f, dst, opts)
    print(dst, os.path.getsize(dst) // 1024, 'KB')
