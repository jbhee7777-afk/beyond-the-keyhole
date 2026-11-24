# 에셋 목록과 이미지 생성 프롬프트

지금 들어 있는 그림은 모두 `tools/art/*.mjs`가 코드로 그린 SVG입니다. 손그림 질감 필터를 써서 완성 화면으로 쓸 수 있는 수준이지만, 이미지 생성 도구(Midjourney, DALL·E, Firefly, Canva 등)로 더 섬세한 그림을 만들면 아래 표대로 **같은 파일명, 같은 크기**로 바꿔 넣으면 됩니다.

바꾸는 방법: `assets/rooms/greenhouse/props/door_closed.png`를 넣고, `js/rooms/greenhouse.js`에서 `'props/door_closed'`를 `'props/door_closed.png'`로 고칩니다.

## 공통 스타일 프롬프트 (모든 프롬프트 앞에 붙이기)

```
hand-drawn storybook illustration, vintage children's book engraving meets watercolor,
brown ink outlines with slight wobble, flat watercolor washes with paper bleed,
cross-hatched shadows, subtle paper grain, gentle surreal whimsy, warm and calm,
not cute-chibi, not 3D, not vector-flat, no text, no letters, no watermark
```

투명 배경이 필요한 에셋은 끝에 `isolated on transparent background, full object visible, no floor shadow cut off`를 붙이고, 생성 후 배경 제거 도구로 정리합니다.

배경(bg)은 **사람 눈높이 정면 시점**, 뒷벽 + 좁은 좌우 벽 + 원근 바닥 구도를 꼭 지킵니다:
`frontal one-point perspective view of a room interior, back wall facing the viewer, narrow side walls, tiled floor receding to center, 16:9`

## 1장 햇살이 멈춘 온실

우선순위 A = 화면에서 가장 크게 보이고 인상을 좌우하는 것.

### 배경 (불투명, 1600x900 · 고해상도로 3200x1800 권장)

| 파일 | 우선 | 설명 / 프롬프트 |
|---|---|---|
| bg/sky_dusk.svg | B | 유리 너머 바깥 하늘(저녁, 멈춘 해). `misty blue-grey dusk sky over a garden, pale sun hidden behind still clouds, soft tree silhouettes on the horizon` |
| bg/sky_day.svg | B | 같은 구도의 맑은 아침. `warm golden morning sky over a garden, bright soft sun, cream clouds, green trees on the horizon` |
| bg/north.svg | A | 북쪽 벽. 가운데 아치형 문 자리(어두운 오목한 공간), 문 위 황동 해 장식, 아래 벽돌 허리벽과 나무 화단 턱, 천장에서 늘어진 덩굴. **유리 부분은 투명**으로 두어야 하늘이 비친다. `Victorian iron-and-glass greenhouse interior, arched dark-green iron frames, terracotta floor tiles, low brick wall with wooden planter ledge, hanging ivy, an empty arched doorway recess in the center` |
| bg/east.svg | A | 동쪽 벽. 작업대 뒤 판자벽, 걸린 모종삽·장갑. `same greenhouse, wooden plank backboard behind a potting area, a trowel and gardening glove hanging on nails` |
| bg/south.svg | A | 남쪽 벽. 둥근 장미창, 온도계. `same greenhouse, a large round rose window of iron spokes in the center, a wall thermometer` |
| bg/west.svg | A | 서쪽 벽. 빗물 홈통, 구멍 뚫린 도구 걸이판(갈퀴, 전지가위, 작은 달력). `same greenhouse, a metal rain pipe coming down from the roof, a pegboard with a rake and red pruning shears` |
| bg/beams_*.svg | C | 햇빛 줄기 (화면 혼합으로 덧씌움). 이미지 생성보다 지금 SVG 유지 권장 |

### 소품 (투명 PNG)

| 파일 | 크기 | 우선 | 프롬프트 요지 |
|---|---|---|---|
| props/door_closed | 280x420 | A | 아치형 나무 문, 해살 무늬 둥근 창, 철 경첩, 해바라기 모양 황동 자물쇠판 |
| props/door_open | 280x420 | A | 열린 문틀 너머 햇살 가득한 해바라기 들판과 오솔길, 문짝은 왼쪽으로 열림 |
| props/note_door | 72x84 | C | 빨간 압정으로 꽂은 손글씨 쪽지 (글자는 읽히지 않게 줄만) |
| props/sunflowers_droop | 380x390 | A | 긴 나무 화단 상자에 해바라기 세 송이, 꽃이 시들어 고개를 푹 숙임, 색이 바램 |
| props/sunflowers_up | 380x390 | A | 같은 구도, 세 송이가 고개를 들고 정면을 봄, 선명한 노랑 |
| props/bigpot_empty / _seeded / _wet | 230x220 | B | 띠 무늬 큰 테라코타 화분 (흙만 / 씨앗 심은 흙무더기와 이름표 / 젖은 흙) |
| props/giantflower_key / giantflower | 360x720 | A | 큰 화분에서 자라난 거대한 해바라기, 꽃 가운데 황동 열쇠가 박혀 반짝임 / 열쇠 없음 |
| props/basket / basket_empty | 170x160 | B | 버들 뜨개 바구니, 빨간 털실 뭉치와 대바늘 / 빈 바구니 |
| props/snail | 130x106 | A | **안내 캐릭터** 달팽이 정원사 '소소': 크림색 몸, 초록 소용돌이 껍데기, 빨간 띠 밀짚모자, 점 눈, 볼터치 |
| props/shelf | 460x150 | B | 벽 선반, 왼쪽 선인장 화분, 오른쪽 분홍 꽃 화분 (가운데는 비어 있음) |
| props/potmid / potmid_tilt | 110x120 | B | 고사리 화분 / 같은 화분이 왼쪽으로 기울어짐 |
| props/mirror_glint | 56x56 | C | 화분 뒤에서 반짝이는 작은 황동 손거울 |
| props/plaque | 260x190 | A | 나무 액자 속 초록 칠판, 크림색으로 **좌우 반전된 숫자 352**, 구석에 손거울 그림과 ↔ 표시. ※ 숫자는 정확해야 하므로 생성 후 직접 덧그리기 권장 |
| props/bench | 1080x310 | A | 긴 원예 작업대, 가운데 서랍(황동 고리), 위에 화분 더미·모종판·씨앗 병·모종삽, 아래 선반에 마대 자루. 오른쪽 아래는 비워 둠(물뿌리개 자리) |
| props/drawer_open | 240x110 | C | 앞으로 빠진 서랍 |
| props/under_shadow | 1000x170 | C | 작업대 밑 짙은 그림자 (SVG 유지 권장) |
| props/wcan | 160x124 | B | 초록 양철 물뿌리개 |
| props/sun_asleep | 540x600 | A | **핵심 장치** 해님 기계: 황동 해 얼굴 원반 + 햇살 꽃잎 16개, 톱니바퀴, 나무 받침대 기둥. 눈 감고 입 오므림, 파란 수면 모자, 'zz' |
| props/sun_awake | 540x600 | A | 같은 기계, 눈을 동그랗게 뜨고 웃음, 햇살 꽃잎이 밝게 빛남, 모자 없음, 둘레에 따뜻한 빛 |
| props/sign_sun | 100x92 | C | 받침대 앞 작은 안내판 (글자는 줄만) |
| props/barrel | 290x320 | A | 철 테 두른 나무 빗물통, 위에 어두운 물과 떠 있는 잎 |
| props/cage_closed / cage_open / cage_empty | 250x374 | A | 사슬에 매달린 황동 돔 새장, 안에 양철 수탉 장난감 / 문 열림 / 비어 있음 |

### 확대 화면 (불투명 1600x900, 일부 투명)

| 파일 | 설명 |
|---|---|
| zoom/plaque | 판자벽에 걸린 액자 확대. 좌우 반전 숫자 352 |
| zoom/mirror_reflect (투명 520x720) | 들어 올린 손거울, 거울 속 숫자는 바르게 352 |
| zoom/drawer_closed | 서랍 앞판 확대, 가운데 숫자 창 3개 달린 황동 다이얼 자물쇠판 (숫자는 게임이 글자로 그림, 창은 비워 둘 것) |
| zoom/drawer_open | 위에서 본 서랍 속, 초록 펠트 바닥, 연필과 씨앗 몇 알 |
| zoom/barrel | 위에서 내려다본 빗물통 물 표면 |
| zoom/key_glint (투명 140x110) | 물속 바닥에서 반짝이는 나비 모양 태엽 열쇠 |
| zoom/paper | 낡은 종이 한 장 (글자는 게임이 올림, 비워 둘 것) |

### 아이템 (투명 160x160, 같은 조명 방향·같은 선 굵기로 세트 제작)

| 파일 | 이름 |
|---|---|
| items/yarn | 빨간 실타래 |
| items/mirror | 황동 테 손거울 (돋보기와 헷갈리지 않게 타원형 + 장식 테) |
| items/magnet | 빨간 말굽자석, 은색 끝 |
| items/seeds | 해바라기 그림 종이 씨앗 봉투 |
| items/magnet_line | 털실 끝에 묶인 자석 |
| items/windkey | 나비 모양 쇠 태엽 열쇠 |
| items/rooster / rooster_wound | 양철 수탉 장난감 / 등에 태엽 열쇠가 꽂힌 모습 |
| items/wcan / wcan_full | 빈 물뿌리개 / 물방울 떨어지는 물뿌리개 |
| items/key | 손잡이가 해바라기 모양인 황동 열쇠 |

### UI (assets/ui, 투명)

arrow(120), tag / tag_sel(120, 종이 꼬리표), hint(달팽이 껍데기), book(메뉴), sound_on / sound_off, seal(해바라기 열쇠구멍 인장), cursor_hand(32).

## 2~5장 핵심 에셋 (설계 단계)

| 장 | 배경 4면 | 핵심 소품·캐릭터 |
|---|---|---|
| 2 토끼의 장난감 공방 | 작업대 벽, 재봉틀 벽, 선반 벽, 문 벽 | 토끼 장인 모카(잠든/깬), 작업등, 그림자 조각 3종, 태엽 쥐, 쥐구멍, 오르골, 저울과 인형 셋, 깜짝 상자 |
| 3 열세 번째 시계 | 괘종시계 벽, 거울 벽, 창(커튼) 벽, 문 벽 | 13시 괘종시계, 큰 거울, 촛대, 화분 셋, 그림자 유령 똑딱(숨음/나옴), 야광 글씨 |
| 4 거꾸로 된 세상 | 거꾸로 방 4면 + 회전 후 4면 | 천장에 붙은 가구, 우산, 거꾸로 화분, 레버, 모래시계, 토마토 |
| 5 바닷속 우체국 | 창구 벽, 우편함 벽, 산호 창 벽, 문 벽 | 문어 우체국장, 해파리 등불 2, 소라 껍데기, 거품 편지, 물고기 떼 그림자, 고래 |
