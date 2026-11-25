# 여러 자세(평소/기쁨 등)를 같은 크기 캔버스에 바닥 가운데 기준으로 맞춰, 바꿔 끼워도 위치가 튀지 않게 한다.
# python3 tools/gen/pose.py W H out_dir name1=in1.png name2=in2.png ...
import sys, os
from PIL import Image
W, H, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
items = [a.split('=') for a in sys.argv[4:]]
ims = {n: Image.open(p).convert('RGBA') for n, p in items}
mw = max(i.width for i in ims.values()); mh = max(i.height for i in ims.values())
k = min((W - 10) / mw, (H - 10) / mh)
os.makedirs(out, exist_ok=True)
for n, im in ims.items():
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.alpha_composite(im, ((W - im.width) // 2, H - im.height - 4))
    c.save(os.path.join(out, n + '.png'), optimize=True); print(n, im.size)
