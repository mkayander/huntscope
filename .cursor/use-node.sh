# Activate the project's Node version (pinned in .nvmrc) via nvm and put it first
# on PATH, installing it on first use. Meant to be sourced, not executed.
#
# The Cloud Agent shell force-prepends its own bundled Node (v22) to PATH, which
# also poisons nvm's notion of the "current" node. So we resolve the pinned
# version explicitly with `nvm which <version>` (independent of PATH) and push
# that bin dir to the front, guaranteeing the project runs on the pinned major.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"

  # Resolve .nvmrc relative to this script so sourcing works from any cwd.
  __use_node_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
  __want="$(tr -d '[:space:]' < "$__use_node_dir/../.nvmrc" 2>/dev/null)"
  __want="${__want:-node}"

  nvm install "$__want" >/dev/null 2>&1 || true

  __node_path="$(nvm which "$__want" 2>/dev/null || true)"
  if [ -n "$__node_path" ] && [ -x "$__node_path" ]; then
    export PATH="$(dirname "$__node_path"):$PATH"
  else
    echo "warning: could not resolve Node '$__want' via nvm; using $(command -v node) ($(node -v 2>/dev/null || echo unknown))" >&2
  fi
  unset __use_node_dir __want __node_path
else
  echo "warning: nvm not found at $NVM_DIR; using the default Node on PATH ($(node -v 2>/dev/null || echo unknown))" >&2
fi
