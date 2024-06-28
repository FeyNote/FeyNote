#!/bin/bash

set -e

PWD=$(dirname "$0")

TAG=$1

if [ -z "$TAG" ]
then
  echo "Invalid command. Usage: ./build-push-frontend-s3.sh v1.0.0"
  exit 1
fi

aws s3 sync www s3://feynote-public/frontend/$TAG/ \
  --cache-control "public, max-age=3600, must-revalidate"

