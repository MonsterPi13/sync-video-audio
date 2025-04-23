#!/bin/bash

mkdir -p public/videos

echo "Downloading video clips..."

rm -f public/videos/*.mp4

curl -L "https://cdn.pixabay.com/vimeo/429887189/black-ink-35536.mp4?width=640&hash=d1e4b692fe6bfcf07e5c54b2ebe9c1e467aa6834" -o public/videos/clip1.mp4
curl -L "https://cdn.pixabay.com/vimeo/328214995/earth-23378.mp4?width=640&hash=52ee52b7a6ae7a5a64c215e3eddb54fa863f5802" -o public/videos/clip2.mp4
curl -L "https://cdn.pixabay.com/vimeo/356800112/clouds-26213.mp4?width=640&hash=f97c124cfc0a59faad0caa16805663382e2e0f03" -o public/videos/clip3.mp4
curl -L "https://cdn.pixabay.com/vimeo/190163566/sparkler-4847.mp4?width=640&hash=6abc4d8ac0eb9361f5c7ebf9f125aa43b572d8f5" -o public/videos/clip4.mp4

curl -L "https://cdn.pixabay.com/vimeo/143249738/butterfly-1185.mp4?width=640&hash=8a8bc5f7d15b6daded56d0ce2f407c8a77ec3efd" -o public/videos/fallback1.mp4
curl -L "https://cdn.pixabay.com/vimeo/439237261/coffee-36800.mp4?width=640&hash=c67b0f6a0b5e45e0e01293889d4d148f764e307f" -o public/videos/fallback2.mp4
curl -L "https://cdn.pixabay.com/vimeo/257906456/rain-18431.mp4?width=640&hash=bab64444cd28300c4e4065dd5122cf11c68c1ec8" -o public/videos/fallback3.mp4
curl -L "https://cdn.pixabay.com/vimeo/206893748/sea-7448.mp4?width=640&hash=46e5ee6cc6ebc5a072b19b50b1bd644d55f68cc9" -o public/videos/fallback4.mp4

echo "Checking file sizes to confirm proper downloads:"
ls -lh public/videos/

echo "All videos downloaded successfully!"
echo "Video clips are now in public/videos/ directory" 