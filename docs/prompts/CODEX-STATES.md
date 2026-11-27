# 열린 상태 그림 일괄 주문 (Codex용)

게임에서 서랍·문·뚜껑을 열거나 물건을 꺼냈을 때 **화면에도 열린 모습이 보이도록**, 이미 있는 배경 그림을 고친 그림 5장을 만든다. 코드는 건드리지 않는다.

## 규칙

1. 각 항목의 **입력 그림**을 이미지 편집(gpt-image edit 등)에 넣고, 프롬프트대로 **그 부분만** 바꾼다. 나머지 화면(구도·물건 위치·색·빛)은 입력 그림과 최대한 똑같아야 한다. Claude가 바뀐 부분만 오려서 원래 그림 위에 덮는다.
2. 출력 크기는 입력과 같은 **1600x900**(안 되면 가장 가까운 16:9).
3. 파일명 그대로 `art-incoming/`에 PNG로 저장한다.
4. 바뀌어야 할 곳이 안 바뀌었거나 다른 곳이 크게 달라졌으면 다시 뽑는다.
5. `art-incoming/`에 추가한 파일만 커밋해서 `main`에 푸시(안 되면 PR). 이미지 편집을 못 하는 환경이면 아무것도 커밋하지 말고 알려 준다.

## 그림 목록

### `state-12-west-fish.png`
입력: `assets/rooms/teahouse/bg/west.webp`
```
Edit this image. Keep everything exactly the same. Change only this: the top-left drawer of the wooden drawer cabinet (the one with the fish picture, first row, far left) is pulled half out toward the viewer, showing its empty dark wooden inside. All other drawers stay closed. Same art style. No text.
```

### `state-12-east-taken.png`
입력: `assets/rooms/teahouse/bg/east_open.webp`
```
Edit this image. Keep everything exactly the same. Change only this: on the third shelf of the open glass cabinet, the copper pitcher and the small round tea tin are gone, leaving that part of the shelf empty. Everything else on the shelves stays. Same art style. No text.
```

### `state-13-east.png`
입력: `assets/rooms/observatory/bg/east.webp`
```
Edit this image. Keep everything exactly the same. Change only these two things: (1) under the row of moon pictures, the third small drawer from the left (below the half moon whose right half is lit) is pulled half out toward the viewer, empty and dark inside; all other drawers stay closed. (2) the round glass lens of the brass magnifier on the desk is removed, so its brass ring is empty and you can see the wall through it. Same art style. No text.
```

### `state-13-south.png`
입력: `assets/rooms/observatory/bg/south.webp`
```
Edit this image. Keep everything exactly the same. Change only this: the small drawer in the base of the brass orrery (under the rings, with a round knob) is pulled half out toward the viewer, empty and dark inside. Same art style. No text.
```

### `state-14-south.png`
입력: `assets/rooms/shadow/bg/south.webp`
```
Edit this image. Keep everything exactly the same. Change only these two things: (1) the small wooden door under the ticket booth counter (with the round knob) is swung open, showing a dark little cupboard with a small stack of paper tickets inside. (2) the lid of the wooden trunk on the right is opened upward, showing an empty dark inside. The four poster panels, the bell and everything else stay exactly the same. Same art style. No text.
```
