# 색만 바꾼 변형 만들기 (노랑 색연필 → 빨강/파랑): python3 tools/gen/hue.py in.png out.png deg
import sys, colorsys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA'); px = im.load(); sh = float(sys.argv[3]) / 360
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a == 0: continue
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s > 0.35 and 0.06 < h < 0.2:
            h = (h + sh) % 1; r, g, b = (int(c * 255) for c in colorsys.hsv_to_rgb(h, s, v))
        px[x, y] = (r, g, b, a)
im.save(sys.argv[2])
