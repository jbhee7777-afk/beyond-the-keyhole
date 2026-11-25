# 투명 PNG를 정해진 크기 캔버스 가운데에 맞춰 넣는다 (게임 아이템 160x160 등).
# python3 tools/gen/fit.py in.png out.png W H [pad=8] [crop=x0,y0,x1,y1 비율]
import sys
from PIL import Image
src, out, W, H = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
pad = int(sys.argv[5]) if len(sys.argv) > 5 else 8
im = Image.open(src).convert('RGBA')
if len(sys.argv) > 6:
    a = [float(v) for v in sys.argv[6].split(',')]; w, h = im.size
    im = im.crop((int(a[0] * w), int(a[1] * h), int(a[2] * w), int(a[3] * h)))
    im = im.crop(im.getbbox())
im.thumbnail((W - 2 * pad, H - 2 * pad), Image.LANCZOS)
c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
c.save(out, optimize=True); print(out, im.size)
