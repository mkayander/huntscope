# Activate the project's Node version (pinned in .nvmrc) via nvm and put it first
# on PATH, installing it on first use. Meant to be sourced, not executed.
#
# The Cloud Agent shell force-prepends its own bundled Node to PATH, so we always
# push the nvm-selected Node bin to the front to guarantee the project runs on the
# pinned major version regardless of the surrounding environment.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  nvm install >/dev/null 2>&1 || true
  nvm use >/dev/null 2>&1 || true
  __node_bin="$(dirname "$(nvm which current 2>/dev/null)" 2>/dev/null || true)"
  if [ -n "${__node_bin:-}" ] && [ -x "$__node_bin/node" ]; then
    export PATH="$__node_bin:$PATH"
  fi
  unset __node_bin
else
  echo "warning: nvm not found at $NVM_DIR; using the default Node on PATH ($(node -v 2>/dev/null || echo unknown))" >&2
fi
