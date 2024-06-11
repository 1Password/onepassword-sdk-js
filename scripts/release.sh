#!/bin/bash

# Helper script to prepare a Js Release for the SDKs.

version_sdk=$(< client/src/version-sdk)
version_sdk_core=$(< client/src/version-sdk-core)
build=$(< client/src/version-build)

set -e
core_modified="${1}"

# Check if Github CLI is installed
if ! command -v gh &> /dev/null; then
	echo "gh is not installed";\
	exit 1;\
fi

if [ "$core_modified" = "true" ]; then
    cd wasm/
    npm version "${version_sdk_core}"
    npm publish --dry-run --tag beta

    read -p "Is everything good? (y/n)" files_are_ok
    if [ "$files_are_ok" == "y" ]; then
        # npm publish --tag beta
        npm dist-tag add "@1password/sdk-core@$version_sdk_core" latest --dry-run
    elif [ "$files_are_ok" == "n" ]; then
        echo "Please fix the bugs and restart the script"
        exit 0
    else
        echo "Invalid input. Please enter 'y' or 'n'."
        exit 1
    fi
fi
  cd ../client
  if [ "$CORE_MODIFIED" = true ]; then
    npm install @1password/sdk-core --save
  fi
  npm version "${version_number}"
  
  npm install --dry-run
  npm run publish-test --dry-run
  #npm run publish-beta
  npm dist-tag add @1password/sdk@${version_sdk}latest --dry-run
  cd ../examples 
  npm install @1password/sdk --save
  cd ../ && npm install --dry-run

git tag -a -s  "v${version_sdk}" -m "${version_sdk}"

# Get Current Branch Name
branch="$(git rev-parse --abbrev-ref HEAD)"

# if on main, then stash changes and create RC branch
if [[ "${branch}" = "main" ]]; then
    git stash
    git fetch origin
    git checkout -b rc/"${version_sdk}"
    git stash pop
fi

# Add changes and commit/push to branch
git add .
git commit -m "Release for ${version_sdk}"
git push origin ${branch}

# Ensure GITHUB_TOKEN env var is set
if [ -z "${GITHUB_TOKEN}" ]; then
  echo "GITHUB_TOKEN environment variable is not set."
  exit 1
fi

gh release create "${version}" --title "Release ${version_sdk}" --notes "${changelog}" --repo github.com/MOmarMiraj/onepassword-sdk-js
