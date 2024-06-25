#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ]
then
    echo "Invalid command. Usage: ./deploy-frontend.sh stg|beta|prod v1.0.0"
    exit 1
fi

export RELEASE_ENV="$1"
export RELEASE_TAG="$2"

aws s3 cp --recursive s3://feynote-www/frontend/$RELEASE_TAG/ s3://feynote-www/frontend/$RELEASE_ENV

