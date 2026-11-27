# 15장 그림 일괄 주문 (Codex용)

이 저장소(PAPERDOOR) 3편 마지막 15장 「접히는 집」에 쓸 그림을 **한 번에 모두** 만들어 `art-incoming/`에 올리는 작업입니다. 코드는 건드리지 않습니다.

## 규칙

1. 아래 그림을 **전부** 이미지 생성 도구(gpt-image 등)로 만든다. 프롬프트는 영어 그대로.
2. **화풍 참고 그림**: `assets/rooms/shadow/bg/north.webp`, `assets/rooms/observatory/bg/east.webp` (3편의 다른 방). 같은 손그림 동화책 화풍(잉크 선, 빗금 그늘, 수채 얼룩, 종이 질감)으로.
3. **편집 그림**(15-05)은 먼저 만든 15-04를 입력으로 넣고 문만 열리게 편집한다. 나머지는 15-04와 똑같아야 한다.
4. 크기는 **1600x900**(안 되면 가까운 16:9). 중요한 물건은 위아래 가장자리에서 떨어뜨린다.
5. **빈 칸이 중요하다**: 포스터·지도·종이·문 단추판은 게임이 그 위에 그림 표식과 점선을 직접 그린다. 프롬프트에 "blank"라고 한 곳에는 그림·글자·숫자·기호를 절대 넣지 않는다.
6. 사람·동물·글자·숫자가 들어가면 다시 뽑는다.
7. 파일명 그대로 `art-incoming/`에 PNG로 저장하고, 그 파일만 커밋해서 `main`에 푸시(안 되면 PR). 이미지 생성을 못 하는 환경이면 아무것도 커밋하지 말고 알려 준다.

## 그림 목록

### `15-01-north.png` — 배경 (북쪽)
```
Same art style as the reference images: detailed hand-drawn storybook illustration, ink line art with slightly wobbly pen strokes, cross-hatching in the shadows, warm watercolor washes on textured paper. A NEW ROOM: the inside of a small house made entirely of folded paper, walls and ceiling with crisp origami fold creases, soft dawn light (pale gold and powder blue), cream and warm grey paper. Front view: on the back wall a very long BLANK horizontal paper poster pinned up (about 3.5 times wider than tall), completely empty. Below it a low paper stage platform. A small wooden perch on the left side. Landscape. No people, no animals, no text, no letters, no numbers, no symbols.
```

### `15-02-east.png` — 배경 (동쪽)
```
Same art style as the reference images. Another wall of the same folded-paper house (cream and warm grey paper, origami creases, soft dawn light): a wide wooden table with a large unfolded BLANK old paper map lying flat on it (completely blank cream paper, no drawings), a small empty paper shelf on the far right wall high up, a paper window with dawn light. Landscape. No people, no animals, no text, no letters, no numbers, no symbols.
```

### `15-03-south.png` — 배경 (남쪽)
```
Same art style as the reference images. Another wall of the same folded-paper house: a writing desk with an unlit brass oil lamp (no flame), a small wooden easel on the desk holding one sheet of BLANK paper, paper lanterns hanging unlit, folded paper birds on a string. Landscape. No people, no animals, no text, no letters, no numbers, no symbols.
```

### `15-04-west.png` — 배경 (서쪽, 닫힌 문)
```
Same art style as the reference images. Another wall of the same folded-paper house: a tall door made of thick folded paper with origami creases, closed, on the right half of the image. On the door at chest height a round BLANK brass plate (completely empty, nothing on it). A paper coat hook and a small paper plant on the left. Landscape. No people, no animals, no text, no letters, no numbers, no symbols.
```

### `15-05-west-open.png` — 편집 (입력: 15-04-west.png)
```
Edit this image. Keep everything exactly the same. Change only this: the folded paper door is wide open, unfolding like a paper fan, and warm morning sunlight with a glimpse of a cozy kitchen pours through. No text.
```

### `15-06-poster.png` — 확대 (포스터)
```
Same art style as the reference images. Close-up, straight-on view of one very long BLANK horizontal sheet of cream parchment pinned to a folded-paper wall, filling most of the frame width (about 1400 by 400 pixels inside a 1600 by 900 image), slight paper texture and soft shadows at the pins. The parchment is completely blank. Landscape. No text, no letters, no numbers, no symbols, no drawings on the parchment.
```

### `15-07-map.png` — 확대 (지도)
```
Same art style as the reference images. Top-down view of one large old BLANK paper map lying flat on a wooden table, filling most of the frame (about 1300 by 760 pixels inside 1600 by 900), soft folds and worn corners. The map paper is completely blank cream paper. Landscape. No text, no letters, no numbers, no symbols, no drawings on the paper.
```

### `15-08-sheet.png` — 확대 (앞뒤 종이)
```
Same art style as the reference images. Close-up of a single BLANK sheet of thin cream paper standing on a small wooden easel in the center (about 700 by 700 pixels), an unlit brass oil lamp beside it, dim cozy light. The paper is completely blank. Landscape. No text, no letters, no numbers, no symbols, no drawings on the paper.
```
