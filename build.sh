#!/bin/bash

# --- Build ---
build() {
  echo "Static site — no build step needed."
}

# --- Start ---
start() {
  python3 -m http.server "${PORT:-8080}"
}

case "$1" in
  build)  build ;;
  start)  start ;;
  *)      build && start ;;
esac
