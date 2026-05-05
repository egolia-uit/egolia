#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
ARCHIVE_FILE="$REPO_ROOT/tmp/seed-videos-archive.txt"
DOWNLOAD_DIR="$REPO_ROOT/tmp/seed-videos"

video_list=(
  # https://www.youtube.com/playlist?list=PLjzaUXKQiFUQLytVOdvOy9GEA3GeLjWWk
  'https://youtu.be/HwifdLUvn0I?si=EVTD9F6crz17God4'
  'https://youtu.be/WLM-2zfwPjY?si=SohA5X240g_o8140'
  'https://youtu.be/Vmjq8kLBuE8?si=IjamDCaWZTKYiOUN'
  'https://youtu.be/aNZRcShiFLs?si=SQwSMi76mFfYoXak'

  # https://www.youtube.com/playlist?list=PLjzaUXKQiFUTUjmu0Z8Sp2-gf0hzIxXbZ
  'https://youtu.be/ZNss-kQ5bJU?si=zw9UjwTwQfvbc_TV'
  'https://youtu.be/JHE-UtK6crM?si=bCiru3bA-0JJaykV'
  'https://youtu.be/yTU2UJ-WKtE?si=EtXwpTk2EheL1dxU'
  'https://youtu.be/bfU59tS-aqg?si=Ux7Y09FtPjufeDp7'

  # https://www.youtube.com/playlist?list=PLcv5mhuY3gB4XoG3l_37hriN6lNv81Hus
  'https://youtu.be/6hZLhDn__RE?si=mbgd_T-8jBlVMJMi'
  'https://youtu.be/GGiQHDyUa8I?si=NvhsqHMnsd3GHi6t'
  'https://youtu.be/-0uP6HZec1g?si=cQ6--twdkduyj2vz'
)

mkdir -p "$REPO_ROOT/tmp"
mkdir -p "$DOWNLOAD_DIR"

printf "%s\n" "${video_list[@]}" | yt-dlp \
  -f 'worstvideo[height<=480]+worstaudio/worst' \
  --concurrent-fragments 4 \
  --download-archive "$ARCHIVE_FILE" \
  --paths "$DOWNLOAD_DIR" \
  -a -
