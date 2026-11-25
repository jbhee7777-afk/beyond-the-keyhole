#!/bin/bash
# Canva에서 내보낸 PNG 받아 오기: bash tools/gen/fetch.sh "<url>" out.png
curl -s -m 60 -o "$2" "$1" && python3 -c "from PIL import Image; print('$2', Image.open('$2').size)"
