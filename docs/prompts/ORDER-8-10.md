# 그림 주문서: 8장 · 9장 · 10장 (ChatGPT로 뽑기)

ChatGPT에서 그림을 뽑아 저장소에 올려 주면, 오려 내기·크기 맞춤·배치·퍼즐 연결은 Claude가 해요.

---

## 0. 시작 전에 (딱 한 번)

1. ChatGPT에서 **새 대화**를 열어요. 장마다 대화 하나를 쓰면 화풍이 잘 유지돼요.
2. 아래 **기준 그림**을 첫 메시지에 첨부하고, 이 문장을 붙여 넣어요.

   > This image is the art style reference for a whole game. Every image I ask for in this chat must match this style exactly: detailed hand-drawn storybook illustration, ink line art with slightly wobbly pen strokes, cross-hatching in the shadows, warm watercolor washes on textured paper, high-quality indie adventure game art. Never put any text, letters or numbers in the images. Reply "OK" and wait for my requests.

   | 장 | 첨부할 기준 그림 |
   |---|---|
   | 8장 | `docs/prompts/ref/8-north.jpg` (이미 만든 8장 북쪽 벽) |
   | 9장 · 10장 | `docs/prompts/ref/style-6-north.jpg` |

3. 아래 주문을 **한 번에 하나씩** 붙여 넣어요.

### 크기
- **배경·확대 화면:** "가로(landscape)"로 뽑아요. ChatGPT는 1536×1024로 나오는데, Claude가 위아래를 조금 잘라 16:9로 맞춰요. 그래서 주문문에 "중요한 물건은 위아래 가장자리에서 떨어뜨려"를 넣어 뒀어요.
- **캐릭터·소품·아이템:** "투명 배경(transparent background) PNG"로 뽑아요. 투명이 안 되면 단색 초록 배경도 괜찮아요.

### 같은 구도로 바꾸기 (★ 표시)
이미 뽑은 그림을 다시 첨부하고, 주문문을 그대로 붙여 넣어요. 물건 위치가 그대로여야 해서 중요해요. 위치가 많이 달라지면 한 번 더 뽑아 주세요.

### 올리는 곳
- GitHub 저장소 `jbhee7777-afk/paperdoor`의 `art-incoming/` 폴더에 웹으로 끌어다 놓기 → **Commit changes**
- 파일명은 각 주문의 **파일명** 그대로 해 주세요 (예: `8-02-east.png`).
- 마음에 안 드는 그림은 다시 뽑아도 돼요. 같은 이름으로 올리면 덮어써요.
- 다 올리면 저한테 "8장 올렸어"라고 말해 주세요.

---

## 8장 잉크 등대 (밤 바다 위 등대 꼭대기)

색: 짙은 남색 밤, 놋쇠, 따뜻한 나무. 등불이 켜지면 초록빛.

### 8-01-north-lit.png ★ (첨부: `ref/8-north.jpg`)
```
Edit this image. Keep everything exactly the same: same lantern room, same lens, pedestal, glass reservoir jar, lever, windows, floor, same composition and camera. Change only this: the lighthouse lamp is now ON. The big Fresnel lens is perfectly clean and glows from inside with bright emerald-green light, green light rays spread across the dark room, the tall glass reservoir jar on the left is filled with glowing green ink, and the lever handle is pulled down. Landscape. No text.
```

### 8-02-east.png
```
Same lighthouse lantern room at night, a different wall, landscape, front view. Keep important objects away from the top and bottom edges. Left half: the lighthouse keeper's wooden desk with an open logbook, a quill pen in an inkwell and a small dim oil lamp glowing softly. Center of the wall: a red-and-white life ring hanging on a hook. Right side: a tall window looking out at a dark starry sea. Leave an empty space on the floor in the middle-right in front of the window where a character will stand. Coil of rope on the floor at the far left, a ship in a bottle on a small crate at the far right. Curved plank floor. No people, no animals, no text.
```

### 8-03-south.png
```
Same lighthouse lantern room at night, another wall, landscape, front view. Keep important objects away from the top and bottom edges. Left: a wooden wall shelf with old books on the top board, and a second lower board that is EMPTY (nothing on it). Next to it a single wooden peg hook on the wall with nothing hanging on it. Upper right: a pinned paper sea chart showing a tiny lighthouse on the left, a curving line of small rocks across the water, and a tiny train station on the right. Under the chart, an old iron anchor leaning on the wall. Center floor: the round opening of a spiral staircase going down with a brass railing. Two small wooden barrels at the far left and far right. No people, no animals, no text.
```

### 8-04-west.png
```
The outside balcony of the lighthouse at night, landscape, front view. Keep important objects away from the top and bottom edges. A brass railing runs across the middle. Beyond it a wide dark starry sea. A dim row of dark rocks in the water leads far away to the right toward a tiny train station on the horizon with one tiny green light. Left foreground: a wooden rain barrel full of rainwater. Right foreground: a brass telescope on a wooden tripod pointing toward the far station. Wooden balcony floor. Dark, quiet night. No people, no animals, no text.
```

### 8-05-west-lit.png ★ (첨부: 방금 뽑은 `8-04-west.png`)
```
Edit this image. Keep everything exactly the same: same balcony, railing, rain barrel, telescope, horizon, station, same composition. Change only this: a wide beam of emerald-green light from the lighthouse now sweeps across the sea from behind the viewer, and the row of rocks in the water glows warm gold, clearly forming a stepping-stone path all the way to the station. No text.
```

### 8-06-scope.png (확대 화면)
```
View through a brass telescope at night, landscape: a big round circular view in the center surrounded by a dark brass ring, the rest of the frame black. Inside the circle: a small snowy train station platform across the sea, a lamp post with a glowing green lamp, and a wooden sign board with a simple picture: a green circle, an arrow, and a little lighthouse. No text, no letters, no numbers.
```

### 8-07-penguin.png (캐릭터, 투명 배경)
```
Character sheet, transparent background: a cute lighthouse keeper penguin named Kkamangi wearing a blue knitted hat, round glasses and a red scarf, full body, standing. Two poses side by side with a big gap: left pose worried (eyebrows raised at the inner ends, small frown, flippers together), right pose happy (eyes smiling, beak open, flippers raised). Same art style as the reference. No text.
```

### 8-08-props.png (소품, 투명 배경)
```
Game prop sheet, transparent background, objects spaced far apart and not touching: four small glass ink bottles with cork stoppers and blank paper labels, filled with red, blue, yellow and black ink; a fifth identical bottle filled with glowing green ink; a dry grey cloth rag; the same rag soaking wet and darker with drips. Same art style as the reference. No text.
```

### 8-09-inkblots.png (렌즈에 튄 먹물, 투명 배경)
```
Transparent background: about ten separate black ink splatter blots of different sizes, each with small droplets around it and one or two drips running downward, wet glossy ink, hand-drawn. Spaced apart, not touching. No text.
```

---

## 9장 겨울잠 기차역 (눈 덮인 작은 시골 역)

색: 푸르스름한 겨울, 난로가 켜지면 주황빛.

### 9-01-north.png
```
Inside a small cozy wooden railway stationmaster's office in winter, landscape, front view, cold bluish light. Keep important objects away from the top and bottom edges. Left: a black cast-iron wood stove with a stovepipe going up, cold and unlit, with an empty firebox behind a little grate door. Center: a big worn blue wingback armchair (empty) on a round braided rug. Upper center: a round wall clock. Right: a paper notice pinned to the wall with two simple pictures (an orange flame and a pink flower) and a few unreadable lines. Wooden plank walls and floor. No people, no animals, no text, no numbers.
```

### 9-02-north-warm.png ★ (첨부: `9-01-north.png`)
```
Edit this image. Keep everything exactly the same. Change only this: the wood stove is now lit with a cheerful fire glowing behind the grate, warm orange light fills the room and the cold blue tint is gone. No text.
```

### 9-03-east.png
```
The same stationmaster's office, another wall, landscape, front view. Keep important objects away from the top and bottom edges. A large wooden-framed window fills the center, its glass completely covered with thick white frost patterns so you can barely see outside. On the windowsill: a clay flower pot with a small closed flower bud on a green stem. Left wall: a blue stationmaster's coat hanging on a peg. Wooden walls and floor. No people, no animals, no text.
```

### 9-04-east-clear.png ★ (첨부: `9-03-east.png`)
```
Edit this image. Keep everything exactly the same (window frame, sill, coat, walls, same composition). Change only this: the frost on the window has melted away, and through the clear glass we see a snowy station outside with a dark wooden timetable board on posts. The board shows three rows of simple pictures, each followed by a dotted line: wavy blue sea waves, a green mountain, a little red house roof with a round yellow window. Do NOT draw any numbers. The flower in the pot has bloomed into a pink flower. Warm light. No text, no letters, no numbers.
```

### 9-05-south.png
```
A snowy little countryside railway platform at night-blue dusk, landscape, front view. Keep important objects away from the top and bottom edges. A snow-covered wooden platform runs across with a yellow safety line; below it, railway tracks with wooden sleepers in the snow cross the whole frame. Wooden roof posts on the left and right with a snowy eave at the top edge, and a brass lantern on the left post. On the platform: a small snowman on the left, a wooden bench, a brown leather suitcase with straps, and a round red post box. A railway signal light on a pole near the right showing red. Snowy hills with a few pine trees behind. No people, no animals, no text.
```

### 9-06-south-train.png ★ (첨부: `9-05-south.png`)
```
Edit this image. Keep everything exactly the same (platform, posts, snowman, bench, suitcase, post box, hills). Change only this: a charming small steam train has arrived and stands on the tracks across the frame: a dark blue steam locomotive on the left with a round front door decorated with a golden star, red spoked wheels and white steam puffing from its chimney, pulling one purple passenger carriage with warmly glowing curtained windows. The signal light now shows green. No text.
```

### 9-07-west.png
```
Outside a small wooden railway station in deep snow, landscape, front view. Keep important objects away from the top and bottom edges. Right side: the station's wooden wall with a closed wooden door, and a snow shovel leaning against the wall beside the door. Left side: a big heap of snow. Center: a railway track switch lever on a small iron base, with an empty square sign frame above it on a short post. A lamp post with a glowing lamp. A wooden sled in the foreground. Snowy fields behind. No people, no animals, no text, no numbers.
```

### 9-08-west-dug.png ★ (첨부: `9-07-west.png`)
```
Edit this image. Keep everything exactly the same. Change only this: the big snow heap on the left has been dug open, revealing a small black metal coal bucket full of lumps of coal half-buried in the snow. The shovel is no longer leaning by the door. No text.
```

### 9-09-bear.png (캐릭터, 투명 배경)
```
Character sheet, transparent background: a big gentle brown bear stationmaster wearing a navy blue station cap with a small gold star and a navy uniform coat, seen from the front sitting down (as if in an armchair), holding a small envelope. Two poses side by side with a big gap: left pose fast asleep (eyes closed, peaceful, head tilted), right pose awake and smiling (eyes open and kind). No text.
```

### 9-10-props.png (소품·아이템, 투명 배경)
```
Game prop sheet, transparent background, objects spaced far apart and not touching: a metal snow shovel with a wooden handle; a few lumps of black coal; a pink flower with a green stem (no pot); a cream train ticket with a little red-roof house picture on it; a railway switch lever handle with a red ball knob; three small dark blue wooden number plates that are completely blank. No text, no numbers.
```

---

## 10장 봄이의 작업실 (해 질 녘 할머니 집 다락방)

색: 따뜻한 주황 노을, 종이색, 나무색.

### 10-01-north.png
```
A cozy attic workshop at sunset where a child once made a paper book, landscape, front view, warm orange light. Keep important objects away from the top and bottom edges. Slanted roof beams at the top corners. Left: a small round window showing a sunset over village rooftops, with a wooden sill. Center: a wooden book stand on a turned post holding a large OPEN handmade paper book with the left page covered in tiny drawings and the right page blank. Right wall: small red height-mark lines painted on the wall. Floor: a braided round rug, a yarn basket, cardboard boxes and a stack of paper at the far left. No people, no animals, no text.
```

### 10-02-east.png
```
The same sunset attic workshop, another wall, landscape, front view. Keep important objects away from the top and bottom edges. A long wooden workbench across the wall; on it a wide low wooden tub full of water. On the wall above: a shelf with small glue jars and brushes, an empty nail, and a pinned paper chart with four simple step pictures connected by arrows (torn paper scraps, a tub of water, a mesh frame, a sheet drying under the sun). On the floor: a wicker wastebasket full of crumpled paper scraps, and a round wooden stool. Colorful paint spots on the floor. No people, no animals, no text.
```

### 10-03-south.png
```
The same sunset attic workshop, another wall, landscape, front view. Keep important objects away from the top and bottom edges. A big round window in the center showing a glowing sunset and village rooftops, with an empty clothesline strung across in front of it. Left: a wooden rocking chair with a pink knitted blanket draped over it. Center floor: a closed wooden trapdoor in the floor with iron straps and a small ring handle. Right: a knitting basket with balls of yarn and knitting needles on a round rug. No people, no animals, no text.
```

### 10-04-south-open.png ★ (첨부: `10-03-south.png`)
```
Edit this image. Keep everything exactly the same. Change only this: the floor trapdoor now stands wide open, a wooden ladder top is visible, and warm golden light glows up from the room below. No text.
```

### 10-05-west.png
```
The same sunset attic workshop, another wall, landscape, front view. Keep important objects away from the top and bottom edges. A large hand-drawn travel map pinned to the wall with red pins: a dotted path starting from small footprints and going through five little pictures in this order: a desk with a pencil, a rain cloud, a lighthouse, a blue steam train, a little red-roof house. Right: an old framed photo of a smiling child with short hair holding a paper crane (soft, faded). Below the photo: an empty small wooden wall shelf. Floor: an open cardboard box with papers. No people (except in the faded photo), no text, no numbers.
```

### 10-06-props.png (소품·아이템, 투명 배경)
```
Game prop sheet, transparent background, objects spaced far apart and not touching: a light blue round-cornered tin sewing box, closed; the same tin box open with yarn and a pincushion inside; a wooden paper-making mould (a frame with fine mesh); a wet sheet of new paper in the mould; a dry sheet of handmade paper with fiber specks; a paper cut into a little arched door shape that pops up; a needle threaded with red thread; a handful of torn paper scraps. No text.
```

### 10-07-book.png (펼친 책, 투명 배경)
```
Transparent background: a large open handmade paper book seen from the front, slightly tilted. Left page full of tiny drawings (a sun, a rabbit, a clock, a bat, an octopus, a paper crane, a cloud, a lighthouse, a train). Right page blank with a torn edge where a page is missing. Same art style. No text.
```

### 10-08-book-door.png ★ (첨부: `10-07-book.png`)
```
Edit this image. Keep the book exactly the same. Change only this: on the blank right page there is now a pop-up paper door shaped like an arch, stitched along its edge with red thread, softly glowing with warm light. No text.
```

### 10-09-tin-icons.png (자물쇠 그림 칸, 투명 배경)
```
Transparent background: four separate small square cream paper tiles with rounded corners, spaced apart, each with one simple picture: a desk with a yellow pencil; a white rain cloud with blue rain; a red-and-white lighthouse with a green light on top; a little blue steam train. No text.
```

### 10-10-finale.png (마지막 엔딩 그림)
```
Warm ending illustration, landscape: a cozy kitchen by a sunset window. In the center a kind grandmother with grey hair in a bun, round glasses and a knitted cardigan, smiling, a paper crane peeking out of her apron pocket. Around her, happy friends: a big brown bear in a navy stationmaster cap, a fluffy cloud-wool sheep in a blue apron, a penguin in a blue knitted hat and red scarf, and an origami paper crane flying above. A plate of cookies on the table. Same art style. No text.
```

---

## 진행 표

| 파일 | 다 했나요? |
|---|---|
| 8-01 ~ 8-09 | |
| 9-01 ~ 9-10 | |
| 10-01 ~ 10-10 | |

Canva 쪽 자동 생성도 같이 돌아가니, 먼저 도착하는 그림으로 쓸게요.
