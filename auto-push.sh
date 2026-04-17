#!/bin/bash

while true
do
  git add .
  git commit -m "auto save $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null
  git push
  sleep 60
done