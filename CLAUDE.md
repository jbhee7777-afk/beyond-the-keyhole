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
- 캐릭터는 `tools/art/chars.mjs`에 모은다. 원·타원 조합 금지: 손으로 찍은 점을 이은 한 줄 윤곽(`part`), 그늘 쪽 굵은 선(`heavy`), 형태를 따라가는 그늘(`shade`), 털 뭉치(`tufts`), 눈꺼풀·눈썹·주둥이까지 그린다. 감정 표현은 눈썹 방향으로 확인한다 (슬픔 = 안쪽 끝이 올라감).

## 확인

- 바꾼 뒤에는 `npm run playtest`로 1~5장을 끝까지 자동 플레이해서 모두 `won: true`, `errors: none`, 튼튼함 검사 `fails: none`을 확인한다.
- 새 방을 만들면 `tools/playtest-<방>.js`도 같이 만든다 (2장 파일이 예시).
- 방 고유의 특수 UI(다이얼, 그림자 조각, 오르골 핀)는 엔진이 아니라 방 파일의 `widget` 함수로 만든다.
- 4장처럼 방 전체를 뒤집으려면 `upside(s)`가 true일 때 방 레이어가 180도 돈다. 좌표는 바르게 선 방 기준으로 쓰고, 뒤집힌 화면 자리에 둘 물건은 `U()`와 `cls: 'rot180'`을 쓴다.
- 조합 실패 안내는 `combos`에 `result` 없이 `say`만 쓴다 (5장 우표).
- 방마다 어둠 색은 `dim: { color, opacity }`로 정한다. 밝아진 뒤에도 밤빛을 남기려면 `dimLit`을 쓴다 (3장 달빛).
- 그림을 바꿨다면 `screenshots/playtest/`의 스크린샷을 직접 본다.
- 연출(`api.after`) 도중 창을 닫아도 끝낼 수 있어야 한다: 아이템·플래그는 연출 **전에** 바로 주고, 끊긴 연출의 마무리는 방의 `repair(s, fix)`에 쓴다. 새 연출을 만들면 `tools/playtest-resilience.js`의 CASES에도 한 줄 넣는다.
- 저장 형식(플래그 이름 등)을 크게 바꾸면 `engine.js`의 `SAVE_VERSION`을 올린다 (예전 저장은 그 장만 새로 시작).
- 엔진 도우미: `api.say(글, ms, { who: '말하는 캐릭터 id', note: '수첩 제목' })`, `api.note(제목, 글)`, `api.burst('confetti'|'spark'|'bubble'|'dust', x, y, 개수)`, `api.flash(색, ms)`, `api.anim(id, 클래스, ms)`, `api.hint()`, `api.game`(위젯에서만). 확대 화면 `note: [제목, 글]`은 처음 열 때 수첩에 적힌다. 방에는 `name`(벽 이름, 나침반에 표시), `ambient(s)`(분위기 소리: garden·night·workshop·party·attic·upside·sea)를 준다.
- 방 파일에서 `window.__game`을 직접 부르지 않는다.
- 방의 `frame: 'bg/frame'`은 모든 벽 맨 앞에 깔리는 방 고유의 틀(구도)이다 (`tools/art/frames.mjs`). 틀은 누르는 곳을 가리지 않는다. 화면 가장자리 80px 안쪽에는 중요한 물건을 두지 않는다.
- 캐릭터 오브젝트에 `blink: 'props/xxx_blink'`(또는 함수)를 주면 몇 초마다 눈을 깜빡인다. 눈꺼풀 그림은 `tools/art/blink.mjs`에서 캐릭터 눈 위치에 맞춰 만든다.
- 그림 속 숫자는 `<text>` 대신 `digits()`(ink.mjs)로 그린다 (기기마다 글꼴이 달라지지 않게).
- 배포용 가벼운 판: `npm run build` → `dist/` (SVG를 WebP로 구움). 글꼴은 `assets/fonts/` 내장.
