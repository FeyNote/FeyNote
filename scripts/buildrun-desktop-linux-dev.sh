#!/bin/sh

# You can use this via something similar to:
# CIRCLE_TAG=v0.0.0 WEBUI_URL=https://80--main--feynote--julianpoyourow.coder.tartarus.cloud/ FEYNOTE_REST_URL=https://80--main--feynote--julianpoyourow.coder.tartarus.cloud/api/ FEYNOTE_TRPC_URL=https://80--main--feynote--julianpoyourow.coder.tartarus.cloud/api/trpc FEYNOTE_HOCUSPOCUS_URL=wss://80--main--feynote--julianpoyourow.coder.tartarus.cloud/hocuspocus/ FEYNOTE_WEBSOCKET_URL=wss://80--main--feynote--julianpoyourow.coder.tartarus.cloud/websocket/ .coder.tartarus.cloud/api/auth/desktop-google ./scripts/build-desktop-linux-dev.sh

set -e

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

$SCRIPTPATH/prepare-for-electron-build.sh

cd apps/desktop

npx electron-forge make --targets @electron-forge/maker-deb

VERSION="${CIRCLE_TAG#v}"
sudo apt install ./out/make/deb/x64/feynote-desktop_${VERSION}_amd64.deb

feynote-desktop
