#!/usr/bin/env bash
# Publishes the package in the current directory with npm trusted publishing, mirroring
# client/release/scripts/release.sh: `npm publish --tag <channel>`, then for stable also
# point `latest` at the new version.
#
# Skips the publish if the version is already on npm (for example, released with the
# local script, or a re-run after a partial failure), so the workflow is safe to re-run.
#
# Usage: npm-publish-if-new.sh <package-name> <version>
# Env:   CHANNEL (beta|stable), DRY_RUN (true|false)
set -euo pipefail

pkg="$1"
version="$2"
: "${CHANNEL:?CHANNEL must be set}"
: "${DRY_RUN:?DRY_RUN must be set}"

actual=$(node -p 'require("./package.json").name + "@" + require("./package.json").version')
if [ "$actual" != "$pkg@$version" ]; then
  echo "::error::expected to publish $pkg@$version but package.json here is $actual"
  exit 1
fi

if [ -n "$(npm view "$pkg@$version" version 2>/dev/null || true)" ]; then
  echo "::notice::$pkg@$version is already on npm, skipping publish"
else
  if [ "$DRY_RUN" = "true" ]; then
    npm publish --tag "$CHANNEL" --dry-run
  else
    # No token: npm exchanges the job's OIDC token for a short-lived publish token
    # and adds a provenance attestation automatically.
    npm publish --tag "$CHANNEL"
  fi
fi

if [ "$CHANNEL" = "stable" ]; then
  if [ "$DRY_RUN" = "true" ]; then
    echo "[dry run] would run: npm dist-tag add $pkg@$version latest"
  else
    # Needs "Allow npm dist-tag" on the package's trusted publisher.
    npm dist-tag add "$pkg@$version" latest
  fi
fi
