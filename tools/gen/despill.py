# 초록 배경(크로마키)에서 오린 그림 가장자리의 초록 번짐 지우기: python3 tools/gen/despill.py a.png [b.png ...]
import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f).convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and g > max(r, b) + 12:
                px[x, y] = (r, int(max(r, b) * 0.98 + 2), b, a if g < 200 or r > 120 else int(a * 0.4))
    im.save(f)
print('despilled', len(sys.argv) - 1)
