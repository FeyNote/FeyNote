#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo $SCRIPT_DIR

source $SCRIPT_DIR/../../.env

npx tsx --tsconfig $SCRIPT_DIR/../../apps/cli/tsconfig.json $SCRIPT_DIR/../../apps/cli/src/main.ts "$@"
