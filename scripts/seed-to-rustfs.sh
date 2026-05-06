#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
VIDEOS_DIR="$REPO_ROOT/tmp/seed-videos"

declare -A video_map=(
  ['Bài Tập NMLT Cơ Bản - Phần 2 [-0uP6HZec1g].mp4']='video-lessons/00000000-0000-0000-0000-000000000001'
  ['Bài Tập Trừu Tượng Hóa Dữ Liệu - Chủ Đề Ngày [6hZLhDn__RE].mp4']='video-lessons/00000000-0000-0000-0000-000000000002'
  ['Bài học 01 - Ôn Tập - Phần 01 [ZNss-kQ5bJU].mp4']='video-lessons/00000000-0000-0000-0000-000000000003'
  ['Bài học 01 - Ôn Tập - Phần 02 [JHE-UtK6crM].mp4']='video-lessons/00000000-0000-0000-0000-000000000004'
  ['Bài học 01 - Ôn Tập - Phần 03 - Hướng dẫn giải Bài tập 01 [yTU2UJ-WKtE].mp4']='video-lessons/00000000-0000-0000-0000-000000000005'
  ['Bài học 01 - Ôn Tập - Phần 04 - Hướng dẫn giải Bài tập 02 [bfU59tS-aqg].mp4']='video-lessons/00000000-0000-0000-0000-000000000006'
  ['LĐTT Bài 001 [WLM-2zfwPjY].mp4']='video-lessons/00000000-0000-0000-0000-000000000007'
  ['LĐTT Bài 003 [Vmjq8kLBuE8].mp4']='video-lessons/00000000-0000-0000-0000-000000000008'
  ['LĐTT Bài 004 [aNZRcShiFLs].mp4']='video-lessons/00000000-0000-0000-0000-000000000009'
  ['LĐTT Lý thuyết Lưu đồ Thuật toán [HwifdLUvn0I].mp4']='video-lessons/00000000-0000-0000-0000-000000000010'
  ['Mảng Một Chiều (Phần 1) [GGiQHDyUa8I].mp4']='video-lessons/00000000-0000-0000-0000-000000000011'
)

rc alias set \
  --insecure \
  egolia \
  http://rustfs.egolia.localhost \
  "${RUSTFS_ACCESS_KEY:-egoliauit}" \
  "${RUSTFS_SECRET_KEY:-egoliauit}"

for filename in "${!video_map[@]}"; do
  remote_path="${video_map[$filename]}"
  local_file="${VIDEOS_DIR}/${filename}"

  if [[ -f "$local_file" ]]; then
    echo "Uploading: $filename -> $remote_path"

    rc cp \
      --content-type 'video/mp4' \
      "$local_file" \
      "egolia/course/$remote_path"
  else
    echo "Warning: Local file not found: $local_file"
  fi
done
