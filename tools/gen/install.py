# 원본 PNG를 게임용 WebP로 넣는다 (투명 유지). 크기를 주면 그 크기로 맞춘다.
# python3 tools/gen/install.py in.png assets/rooms/desk/bg/north.webp [W H] [q=86]
import sys, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src)
im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
if len(sys.argv) > 4: im = im.resize((int(sys.argv[3]), int(sys.argv[4])), Image.LANCZOS)
q = int(sys.argv[5]) if len(sys.argv) > 5 else 86
os.makedirs(os.path.dirname(out), exist_ok=True)
im.save(out, 'WEBP', quality=q, method=6)
print(out, im.size, os.path.getsize(out) // 1024, 'KB')
