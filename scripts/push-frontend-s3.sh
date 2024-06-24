#!/bin/bash

set -e

PWD=$(dirname "$0")

TAG=$1

if [ -z "$TAG" ]
then
  echo "Invalid command. Usage: ./build-push-frontend-s3.sh v1.0.0"
  exit 1
fi

# mkdir -p www-revhashed
#
# find www/ -regextype egrep -regex '.+\-[a-zA-Z0-9]{8}\..+' -exec mv -t www-revhashed/ -- {} +

# Time sensitive assets only
aws s3 sync www s3://feynote-www/frontend/$TAG/ \
  # --exclude "*" \
  # --include "index.html" \
  # --include "service-worker.js" \
  --acl public-read \
  --cache-control "public, max-age=3600, must-revalidate"

# General, non-revhashed frontend files - semi time sensitive
# aws s3 sync www s3://feynote-www/frontend/$TAG/ \
#   --exclude "index.html" \
#   --exclude "service-worker.js" \
#   --acl public-read \
#   --cache-control "public, max-age=604800, must-revalidate"

# Revhashed files (previously copied to www-revhashed) - persist long-term
# aws s3 sync www-revhashed s3://feynote-www/frontend/$TAG/ \
#   --acl public-read \
#   --cache-control "public, max-age=2592000, immutable"

