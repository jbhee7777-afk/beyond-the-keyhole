#!/usr/bin/env bash
# GitHub Pages에 올릴 가벼운 판을 만들어 gh-pages 브랜치로 보낸다.
# 사용법: npm run pages
# 처음 한 번만: GitHub 저장소 Settings → Pages → Source "Deploy from a branch" → Branch: gh-pages / (root)
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/build-raster.js
cp docs/release/paperdoor-overview.jpg dist/paperdoor-overview.jpg
touch dist/.nojekyll
REMOTE=$(git remote get-url origin)
MSG="Pages: $(git log -1 --format='%h %s')"
TMP=$(mktemp -d)
cp -r dist/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name || echo paperdoor)" -c user.email="$(git -C "$OLDPWD" config user.email || echo paperdoor@users.noreply.github.com)" commit -q -m "$MSG"
git push -q -f "$REMOTE" gh-pages
echo "gh-pages 브랜치에 올렸어요."
