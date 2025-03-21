#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ]
then
    echo "Invalid command. Usage: ./deploy-docs.sh stg|beta|prod v1.0.0"
    exit 1
fi

export RELEASE_ENV="$1"
export RELEASE_TAG="$2"

aws s3 cp --recursive s3://feynote-public/docs/$RELEASE_TAG/ s3://feynote-public/docs/$RELEASE_ENV

