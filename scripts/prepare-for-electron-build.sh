#!/bin/sh

export VITE_APP_VERSION=$CIRCLE_TAG
export NODE_OPTIONS=--max-old-space-size=8192
npx nx build frontend
mkdir -p apps/desktop/renderer
cp -r dist/apps/frontend/* apps/desktop/renderer/
VERSION="${CIRCLE_TAG#v}"
sed -i "s/\"version\": \".*\"/\"version\": \"${VERSION}\"/" apps/desktop/package.json
sed -i 's/"name": "@feynote\/desktop"/"name": "feynote-desktop"/' apps/desktop/package.json

