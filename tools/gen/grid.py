# 이미지 위에 100px 격자와 좌표를 그려 배치(hit) 좌표를 읽기 쉽게 한다.
# python3 tools/gen/grid.py in.png out.png [W H]
import sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1600, 900)
im = Image.open(src).convert('RGB').resize((W, H))
d = ImageDraw.Draw(im)
for x in range(0, W, 100):
    d.line([(x, 0), (x, H)], fill=(255, 0, 255) if x % 500 == 0 else (0, 255, 255), width=1)
    d.text((x + 2, 2), str(x), fill=(255, 255, 0))
for y in range(0, H, 100):
    d.line([(0, y), (W, y)], fill=(255, 0, 255) if y % 500 == 0 else (0, 255, 255), width=1)
    d.text((2, y + 2), str(y), fill=(255, 255, 0))
im.save(out)
