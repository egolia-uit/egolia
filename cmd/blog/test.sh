#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

production=false

while [[ $# -gt 0 ]]; do
  case "$1" in
  --production)
    production=true
    shift
    ;;
  *)
    echo "Unknown option: $1" >&2
    exit 1
    ;;
  esac
done

cd "${WORKSPACE_ROOT}"

gotestsum \
  --jsonfile \
  ./coverage/blog/gotestsum.json \
  -- \
  -coverprofile=./coverage/blog/coverage.out \
  -covermode=atomic \
  ./cmd/blog/... \
  ./internal/blog/...

if [ "$production" = true ]; then
  go-ctrf-json-reporter \
    -appName 'blog' \
    -output './coverage/blog/ctrf.json' \
    <./coverage/blog/gotestsum.json || true
fi
