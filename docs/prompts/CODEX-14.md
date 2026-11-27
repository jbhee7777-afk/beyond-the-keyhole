# 14장 그림 일괄 주문 (Codex용)

이 저장소(PAPERDOOR, 2D 포인트 앤 클릭 방탈출 게임) 14장 「그림자 인형극장」에 쓸 그림을 **한 번에 모두** 만들어 `art-incoming/`에 올리는 작업입니다. 코드는 건드리지 않습니다.

## 해야 할 일

1. 아래 표의 그림을 **전부** 이미지 생성 도구(gpt-image 등)로 만든다. 프롬프트는 영어 그대로 쓴다.
2. **화풍 참고 그림**: `assets/rooms/shadow/bg/north.webp` (같은 방의 무대 그림). 배경·확대 그림은 이 그림을 참고 이미지로 넣어 같은 화풍·색감으로 만든다. 필요하면 `assets/rooms/shadow/bg/east.webp`, `south.webp`도 함께 참고.
3. **편집 그림**(14-05)은 먼저 만든 14-04 그림을 입력으로 넣고 '그대로 두고 커튼만 열기' 편집을 한다. 구도·물건 위치가 14-04와 똑같아야 한다.
4. 크기: 배경·확대는 **가로 16:9에 가깝게**(예: 1536x1024 이상). 게임에서 1600x900으로 자르므로 중요한 물건은 위아래 가장자리에서 떨어뜨린다. 캐릭터·소품 시트는 **투명 배경 PNG**(안 되면 아주 흰 단색 배경).
5. 파일명은 표의 이름 **그대로** `art-incoming/`에 PNG로 저장한다 (예: `art-incoming/14-04-west.png`).
6. 그림에 글자·숫자·사람이 들어가면 다시 뽑는다. 결과가 프롬프트와 크게 다르면(물건 빠짐 등) 한 번 더 뽑아 나은 쪽을 쓴다.
7. `art-incoming/`에 추가한 파일만 커밋해서 `main`에 푸시한다(푸시가 안 되면 PR). 다른 파일은 바꾸지 않는다.
8. 이미지 생성 도구를 쓸 수 없는 환경이면 아무것도 커밋하지 말고 그렇다고 알려 준다.

## 그림 목록

### `14-04-west.png` — 배경

```
Same art style as the reference image: detailed hand-drawn storybook illustration, ink line art with slightly wobbly pen strokes, cross-hatching in the shadows, warm watercolor washes on textured paper. Another wall of the same small paper shadow-puppet theater as 14-01 (deep plum red velvet, warm candle amber, cream paper, dark wood): an exit doorway covered by heavy plum velvet curtains that are closed and tied shut with a thick golden rope and tassel, a small brass lamp beside it, a coat stand with a little cape. The curtained doorway is on the right half of the image. Landscape. Keep important objects away from the top and bottom edges. No people, no animals, no text, no letters, no numbers.
```

### `14-05-west-open.png` — 배경

```
[입력 그림: art-incoming/14-04-west.png] Edit this image. Keep everything exactly the same. Change only this: the velvet curtains of the doorway are drawn wide open, the rope hangs loose, and warm golden light pours out from a bright passage beyond. No text.
```

### `14-06-nuul.png` — 캐릭터

```
Character sheet, on a fully transparent background (if transparency is impossible: plain flat pure white background with nothing else): a small gentle shadow-puppet actor named Nuul, a child-sized figure with a round head, pointy little ears and a short fluttering cape, full body, same art style as the reference (ink line, hatching, watercolor). Three poses side by side with big gaps: (1) as a flat solid dark grey-violet shadow silhouette, sad, drooping, only the eye shapes cut out, (2) the same flat shadow silhouette, surprised, arms up, (3) the same character now with a real colorful body (cream face, plum cape, golden buttons), happy, arms wide, smiling. No text.
```

### `14-07-props.png` — 소품

```
Game prop sheet, on a fully transparent background (if transparency is impossible: plain flat pure white background with nothing else), objects far apart and not touching, same art style as the reference: flat cut-paper shadow puppets each on a thin wooden stick: a rabbit, a bare tree branch, a small bird, a little sailboat, a small wolf, a deer with antlers; and one square sheet of transparent red cellophane. No text.
```

### `14-08-script.png` — 확대

```
Same art style as the reference image: detailed hand-drawn storybook illustration, ink line art with slightly wobbly pen strokes, cross-hatching in the shadows, warm watercolor washes on textured paper. Close-up of a single cream paper sheet on a wooden music stand: four simple BLUE ink line drawings in one row from left to right: a sailboat, a flying bird, a deer with antlers, a big wolf howling. The whole sheet is covered with many thick messy RED crayon scribbles over and between the drawings so the drawings are hard to see. Landscape. No text, no letters, no numbers.
```

### `14-09-backstage.png` — 확대

```
Same art style as the reference image: detailed hand-drawn storybook illustration, ink line art with slightly wobbly pen strokes, cross-hatching in the shadows, warm watercolor washes on textured paper. View from backstage of a shadow-puppet theater: a lit candle in a brass holder in the foreground at the bottom center, a straight wooden floor rail with four evenly spaced notches leading straight back from the candle to a large glowing blank white cloth screen in a wooden frame in the background center. Dark plum velvet around. The screen is completely empty. Landscape. No text, no numbers.
```

### `14-10-trunk.png` — 확대

```
Same art style as the reference image: detailed hand-drawn storybook illustration, ink line art with slightly wobbly pen strokes, cross-hatching in the shadows, warm watercolor washes on textured paper. Close-up of the front of an old wooden trunk with iron corners and a large brass lock plate that has four EMPTY round windows in a row, a small brass knob under each window. Landscape. No text, no numbers.
```

## 참고
- 게임 설계: `docs/PART3_DESIGN.md` 14장, 주문 원본: `docs/prompts/ORDER-14.json`
- 올라온 그림은 Claude가 가져가서 자르기·배경 지우기·배치를 한다.
