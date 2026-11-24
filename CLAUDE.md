# 작업 안내 (Claude Code용)

초등학생 대상 퍼즐 난이도, 스팀 인디 수준 그래픽의 2D 포인트 앤 클릭 방탈출 게임.
기준 문서: `docs/ART_DIRECTION.md`, `docs/PUZZLE_DESIGN.md`. 바꾸기 전에 꼭 읽는다.

## 원칙

- 여러 개의 평범한 방보다 하나의 완성도 높은 방. 새 방은 1장과 같은 완성도에 도달한 뒤에만 다음으로.
- 정상 작동하는 게임 로직은 최대한 유지하고, 디자인은 개선한다.
- 이모지를 그래픽으로 쓰지 않는다. CSS 사각형/원만으로 가구를 표현하지 않는다.
- 클릭 가능한 물건에 테두리나 정답 표시를 넣지 않는다 (커서 모양만 바뀜).
- 퍼즐은 정답을 알면 "아하!" 하고 납득되어야 한다. 무작위 클릭, 억지 추측 금지.
- 잔혹한 장면, 갑작스러운 공포 연출, 유혈 금지. 오싹함은 분위기로만.
- 화면 글은 초등학생이 읽기 쉬운 반말 독백(주인공) / 존댓말(쪽지·힌트)로.

## 구조

- 빌드 없음. `index.html`을 file://로 열어도 동작해야 하므로 ES 모듈을 쓰지 않는다 (일반 `<script>`).
- 무대는 1600x900 좌표. 모든 배치(x, y, w, h)와 hit 영역도 이 좌표.
- `js/engine.js`: 범용 엔진. 방 고유 로직을 넣지 말 것.
- `js/rooms/<id>.js`: `Engine.registerRoom({...})` 한 번으로 방 하나. 1장 파일이 가장 좋은 예시.
  - `views[벽].objects[]`: `{ id, img, x, y, w, h, show(s), hit:[x,y,w,h], click(api,node), use:{아이템:(api,node)=>}, look, zoom, wrong, cls, label }`
  - 배열 순서 = 그려지는 순서(뒤 → 앞). 클릭 영역도 이 순서로 겹친다. 큰 투명 이미지에는 `hit`을 꼭 준다.
  - `zooms`: 확대 화면. `bg`, `objects`, `text`(HTML), `widget`(다이얼 같은 특수 UI).
  - `combos`: 아이템 조합. `hints(s)`: 현재 진행 상황에 맞는 `{ key, steps:[3개] }`.
  - `isLit(s)`: 방 조명 상태 (어둠 ↔ 햇빛 같은 환경 변화).
- 진행 상태는 `localStorage` 키 `btk.save.<방id>`.
- 새 방을 추가하면 `index.html`에 스크립트 한 줄, `js/main.js`의 CHAPTERS는 이미 다섯 장이 있다.

## 그래픽

- 지금 에셋은 `tools/art/*.mjs`가 만든 SVG. 손그림 흔들림(`wob`), 수채 얼룩 + 선 떨림 필터(`#art`), 빗금 그림자(`hatch`)를 쓴다.
- 이미지 생성 도구로 만든 PNG로 바꿀 때는 같은 파일명·같은 크기로 넣고, 방 데이터의 이름에 `.png`를 붙이면 된다 (`img: 'props/door_closed.png'`). 엔진은 확장자가 없으면 `.svg`로 본다.
- 에셋 목록과 생성 프롬프트: `docs/ASSET_LIST.md`.

## 확인

- 바꾼 뒤에는 `npm run playtest`로 1장·2장을 끝까지 자동 플레이해서 둘 다 `won: true`, `errors: none`을 확인한다.
- 새 방을 만들면 `tools/playtest-<방>.js`도 같이 만든다 (2장 파일이 예시).
- 방 고유의 특수 UI(다이얼, 그림자 조각, 오르골 핀)는 엔진이 아니라 방 파일의 `widget` 함수로 만든다.
- 방마다 어둠 색은 `dim: { color, opacity }`로 정한다.
- 그림을 바꿨다면 `screenshots/playtest/`의 스크린샷을 직접 본다.
