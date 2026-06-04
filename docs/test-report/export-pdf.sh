#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="${1:-$DIR/plan-formatted.md}"
OUTPUT="${2:-$DIR/plan-v1.0.pdf}"

if [ ! -f "$SOURCE" ]; then
  echo "Error: source file '$SOURCE' not found" >&2
  exit 1
fi

if command -v mise &>/dev/null; then
  RUN="mise exec --"
elif command -v pandoc &>/dev/null; then
  RUN=""
else
  echo "Error: pandoc not found. Install via: mise install pandoc" >&2
  exit 1
fi

echo "Exporting $(basename "$SOURCE") -> $(basename "$OUTPUT") ..."
$RUN pandoc "$SOURCE" -o "$OUTPUT" --pdf-engine=xelatex -V geometry:landscape
echo "Done: $OUTPUT"
