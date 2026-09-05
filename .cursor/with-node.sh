#!/usr/bin/env bash
# Run a command using the project's pinned Node version (see .nvmrc).
# Usage: bash .cursor/with-node.sh <command> [args...]
set -euo pipefail

cd "$(dirname "$0")/.."
# shellcheck disable=SC1091
source .cursor/use-node.sh

exec "$@"
