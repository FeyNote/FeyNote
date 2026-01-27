#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

$SCRIPT_DIR/../dev.sh exec backend npx tsx --tsconfig /app/apps/cli/tsconfig.json /app/apps/cli/src/main.ts "$@"
