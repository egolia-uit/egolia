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
  ./coverage/billing/gotestsum.json \
  -- \
  -coverprofile=./coverage/billing/coverage.out \
  -covermode=atomic \
  ./cmd/billing/... \
  ./internal/billing/...

if [ "$production" = true ]; then
  go-ctrf-json-reporter \
    -appName 'billing' \
    -output './coverage/billing/ctrf.json' \
    <./coverage/billing/gotestsum.json || true
fi
