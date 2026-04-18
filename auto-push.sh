#!/bin/zsh

cd "$(dirname "$0")" || exit 1

while true
do
  if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "Auto-save $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1
    git push >/dev/null 2>&1
    echo "Auto-push effectué à $(date '+%H:%M:%S')"
  fi
  sleep 60
done