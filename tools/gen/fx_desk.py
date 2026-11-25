# 6장 빛·그림자 효과 (그림이 아닌 "빛"이라 코드로 만든다): X 그림자, 스탠드 불빛, 커튼 닫힘 그늘, 크레용 손잡이 낙서
from PIL import Image, ImageDraw, ImageFilter
import random, math
A = 'assets/rooms/desk/props/'
random.seed(6)
# X 그림자: 엇갈린 연필 두 자루의 그림자. 문(345,180,300,470) 위에 비스듬히, 가장자리 흐림
W, H = 1600, 900
im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for (x0, y0, x1, y1) in [(330, 170, 660, 650), (650, 175, 330, 655)]:
    d.line([(x0, y0), (x1, y1)], fill=(40, 26, 30, 150), width=46)
im = im.filter(ImageFilter.GaussianBlur(9)); im.save(A + 'xshadow.webp', 'WEBP', quality=90)
# 스탠드 불빛: 오른쪽 위 갓에서 스케치북 쪽으로 퍼지는 따뜻한 빛
g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = g.load()
for y in range(0, H, 2):
    for x in range(0, W, 2):
        dx, dy = (x - 1300) / 1100, (y - 30) / 800
        r = math.hypot(dx, dy); a = max(0, 1 - r) ** 1.6 * 95
        for (u, v) in ((x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)):
            if u < W and v < H: px[u, v] = (255, 214, 140, int(a))
g.save(A + 'lampglow.webp', 'WEBP', quality=85)
# 커튼을 닫았을 때 책상 위 햇빛을 가리는 그늘
s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(s)
for y in range(H):
    a = int(40 + 110 * min(1, max(0, (y - 420) / 300)))
    d.line([(0, y), (W, y)], fill=(30, 20, 30, a))
s.save(A + 'shade.webp', 'WEBP', quality=85)
# 크레용 손잡이: 노란 크레용으로 빙글빙글 칠한 동그라미 (실제로 크레용 낙서처럼 결이 있는 선 여러 겹)
k = Image.new('RGBA', (140, 140), (0, 0, 0, 0)); d = ImageDraw.Draw(k)
for i in range(16):
    r = 34 + random.uniform(-6, 6); cx, cy = 70 + random.uniform(-3, 3), 70 + random.uniform(-3, 3)
    pts = [(cx + math.cos(t / 20 * 6.283 + i) * r * random.uniform(0.92, 1.05), cy + math.sin(t / 20 * 6.283 + i) * r * random.uniform(0.92, 1.05)) for t in range(21)]
    d.line(pts, fill=(226, 172, 40, 190), width=5, joint='curve')
for i in range(30):
    a = random.uniform(0, 6.28); r = random.uniform(0, 26)
    d.ellipse([70 + math.cos(a) * r - 6, 70 + math.sin(a) * r - 6, 70 + math.cos(a) * r + 6, 70 + math.sin(a) * r + 6], fill=(240, 196, 60, 150))
k = k.filter(ImageFilter.GaussianBlur(0.6)); k.save(A + 'knob.webp', 'WEBP', quality=90)
print('fx ok')
