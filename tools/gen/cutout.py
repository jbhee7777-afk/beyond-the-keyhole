# 단색 배경(흰색·초록 등) 위에 그린 소품을 투명 PNG로 오려 낸다.
# 가장자리에서 시작해 배경색과 비슷한 픽셀을 채워 나가며(flood fill) 지우고, 가장자리를 살짝 부드럽게 한다.
# python3 tools/gen/cutout.py in.png out.png [tol=40]           → 한 장
# python3 tools/gen/cutout.py in.png outdir/ [tol] --split       → 떨어져 있는 덩어리마다 따로 (item_0.png …)
import sys, os
from collections import deque
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
tol = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else 40
split = '--split' in sys.argv
im = Image.open(src).convert('RGBA'); W, H = im.size; px = im.load()
corners = [px[0, 0], px[W - 1, 0], px[0, H - 1], px[W - 1, H - 1]]
bg = tuple(sorted(c[i] for c in corners)[1] for i in range(3))
close = lambda c: abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) <= tol
mask = Image.new('L', (W, H), 255); m = mask.load()
q = deque([(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)])
seen = set(q)
while q:
    x, y = q.popleft()
    if not close(px[x, y]): continue
    m[x, y] = 0
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen:
            seen.add((nx, ny)); q.append((nx, ny))
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
im.putalpha(mask)
if not split:
    im.crop(im.getbbox()).save(out); print('saved', out, im.getbbox()); sys.exit()
os.makedirs(out, exist_ok=True)
# 덩어리 나누기: 작게 줄인 마스크에서 연결된 영역을 찾는다
small = mask.resize((W // 4, H // 4)); s = small.load(); w, h = small.size
lab = {}; boxes = []
for yy in range(h):
    for xx in range(w):
        if s[xx, yy] > 128 and (xx, yy) not in lab:
            k = len(boxes); q = deque([(xx, yy)]); lab[(xx, yy)] = k; bx = [xx, yy, xx, yy]; n = 0
            while q:
                a, b = q.popleft(); n += 1
                bx = [min(bx[0], a), min(bx[1], b), max(bx[2], a), max(bx[3], b)]
                for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                    if 0 <= c < w and 0 <= d < h and s[c, d] > 128 and (c, d) not in lab:
                        lab[(c, d)] = k; q.append((c, d))
            boxes.append((n, bx))
boxes = [b for n, b in boxes if n > 60]
boxes.sort(key=lambda b: (b[1] // (h // 3), b[0]))
for i, b in enumerate(boxes):
    box = (max(0, b[0] * 4 - 6), max(0, b[1] * 4 - 6), min(W, b[2] * 4 + 10), min(H, b[3] * 4 + 10))
    im.crop(box).save(os.path.join(out, f'item_{i}.png')); print(i, box)
