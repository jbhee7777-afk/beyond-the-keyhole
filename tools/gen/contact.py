# 오려 낸 PNG 여러 장을 체크무늬 위에 나란히 붙여 확인용 한 장으로 만든다.
# python3 tools/gen/contact.py out.png a.png b.png ...
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
cell = 260
W = cell * min(6, len(files)); H = cell * ((len(files) + 5) // 6)
sheet = Image.new('RGBA', (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(sheet)
for y in range(0, H, 20):
    for x in range(0, W, 20):
        if (x // 20 + y // 20) % 2: d.rectangle([x, y, x + 19, y + 19], fill=(200, 200, 210, 255))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGBA'); im.thumbnail((cell - 20, cell - 40))
    x, y = (i % 6) * cell, (i // 6) * cell
    sheet.alpha_composite(im, (x + 10, y + 10)); d.text((x + 6, y + cell - 22), f.split('/')[-1][:30], fill=(0, 0, 0, 255))
sheet.convert('RGB').save(out)
