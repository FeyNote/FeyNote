#!/bin/bash

set -e

PWD=$(dirname "$0")

TAG=$1

if [ -z "$TAG" ]
then
  echo "Invalid command. Usage: ./build-push-frontend-s3.sh v1.0.0"
  exit 1
fi

# We do not want to push .map files to S3 since they expose source code
find www -type f -name "*.map" -delete

[ -f "www/index.html" ] && [ -f "www/service-worker.js" ] || { echo "Both index.html and service-worker.js must exist. Something may have gone wrong during the build step"; exit 1; }

aws s3 sync www s3://feynote-public/frontend/$TAG/ \
  --cache-control "public, max-age=900, must-revalidate"

