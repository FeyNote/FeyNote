#!/bin/bash

set -e

if [ -z "$1" ]
then
  echo "Invalid command. Usage: ./build-push-api-dockerhub.sh v1.0.0"
  exit 1
fi

docker build -f Dockerfile.production --build-arg APP_VERSION=$1 -t feynote/feynote:api-latest .

# Only push to latest tag if tag is a versioned tag
if [[ $1 == v* ]]
then
  docker push feynote/feynote:api-latest
fi

docker image tag feynote/feynote:api-latest feynote/feynote:api-$1
docker push feynote/feynote:api-$1

# Cleanup
docker rmi feynote/feynote:api-$1
docker rmi feynote/feynote:api-latest

