#!/bin/bash

set -e

PWD=$(dirname "$0")

TAG=$1

if [ -z "$TAG" ]
then
  echo "Invalid command. Usage: ./push-docs-s3.sh v1.0.0"
  exit 1
fi

[ -f "apps/docs/dist/index.html" ] || { echo "index.html must exist. Something may have gone wrong during the build step"; exit 1; }

aws s3 sync apps/docs/dist s3://feynote-public/docs/$TAG/ \
  --cache-control "public, max-age=3600, must-revalidate"

