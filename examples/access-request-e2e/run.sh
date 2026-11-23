#!/usr/bin/env bash
# Builds the SDK from this checkout and runs the access-request E2E scenarios.
#
#   ./run.sh                 # errors + happy (default)
#   ./run.sh errors          # just the error cases, no 1Password interaction
#   ./run.sh happy expire    # any scenarios from e2e.cjs, in order
#
# Prompts once for anything not already set: OP_OAUTH_INTEGRATION_KEY,
# OP_OAUTH_ACCESS_TOKEN, and OP_E2E_WEBSITE (for scenarios that create requests).
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
if [ $# -gt 0 ]; then scenarios=("$@"); else scenarios=(errors happy); fi

echo "==> Building SDK from $(git -C "$repo" rev-parse --abbrev-ref HEAD)"
(cd "$repo/client" && npm run build --silent) || { echo "SDK build failed"; exit 1; }

[ -n "${OP_OAUTH_INTEGRATION_KEY:-}" ] || read -rp "Integration key (ops_…): " OP_OAUTH_INTEGRATION_KEY
[ -n "${OP_OAUTH_ACCESS_TOKEN:-}" ] || { read -rsp "OAuth access token (op_o_u_…): " OP_OAUTH_ACCESS_TOKEN; echo; }
export OP_OAUTH_INTEGRATION_KEY OP_OAUTH_ACCESS_TOKEN

for s in "${scenarios[@]}"; do
  case "$s" in errors | read-reference) ;; *)
    [ -n "${OP_E2E_WEBSITE:-}" ] || read -rp "Login website to request (e.g. https://example.com): " OP_E2E_WEBSITE
    export OP_E2E_WEBSITE
    break ;;
  esac
done

results=()
failed=0
for s in "${scenarios[@]}"; do
  echo
  echo "==================== $s ===================="
  if OP_E2E_SCENARIO="$s" node "$here/e2e.cjs"; then
    results+=("PASS  $s")
  else
    results+=("FAIL  $s")
    failed=1
  fi
done

echo
echo "==================== summary ===================="
printf '%s\n' "${results[@]}"
exit $failed
