#!/bin/bash

# Helper script to prepare a JS Release for the SDKs.

set -e

version_sdk_core=$(< client/release/version-sdk-core)

# Extract build and version_sdk number from the configuration.ts
build=$(awk -F "['\"]" '/SDK_BUILD_NUMBER =/{print $2}' "client/release/version.js" | tr -d '\n')
version_sdk=$(awk -F "['\"]" '/SDK_VERSION =/{print $2}' "client/release/version.js"| tr -d '\n')

changelog=$(< client/release/changelogs/"${version_sdk}"-"${build}")

core_modified="${1}"

# Check if Github CLI is installed
if ! command -v gh &> /dev/null; then
	echo "gh is not installed";\
	exit 1;\
fi

# Ensure GITHUB_TOKEN env var is set
if [ -z "${GITHUB_TOKEN}" ]; then
  echo "GITHUB_TOKEN environment variable is not set."
  exit 1
fi

if [ "$core_modified" = "true" ]; then
    cd wasm/
    # Update core version number to the latest
    npm version "${version_sdk_core}"
    # Check if all files pertaining to sdk core are included
    npm publish --dry-run --tag beta

    read -p "Is everything good? (y/n)" files_are_ok
    if [ "$files_are_ok" == "y" ]; then
        # Publish and add latest tag to core
        npm publish --tag beta
        npm dist-tag add "@1password/sdk-core@$version_sdk_core" latest 
    elif [ "$files_are_ok" == "n" ]; then
        echo "Files are incorrect, Exiting..."
        exit 0
    else
        echo "Invalid input. Please enter 'y' or 'n'."
        exit 1
    fi
    cd ..
fi

  cd client
  if [ "$core_modified" = true ]; then
    # Update @1password/sdk-core dependancy to the latest
    npm install @1password/sdk-core --save
  fi

  # Update sdk version number to the latest
  npm version "${version_sdk}"

  # Check if the latest core is pulled correctly
  npm install 

  # Check if all files pertaining to sdk are included
  npm run publish-test --dry-run
  
  read -p "Is everything good? (y/n)" files_are_ok

  if [ "$files_are_ok" == "y" ]; then
    # Publish and add latest tag
    npm run publish-beta
    npm dist-tag add @1password/sdk@${version_sdk} latest 
    
    # Update dependancy in examples to run off the latest sdk
    cd ../examples 
    npm install @1password/sdk --save

    # Check if the latest SDK client is pulled correctly
    cd ../ && npm install
  
  elif [ "$files_are_ok" == "n" ]; then
        echo "Files are incorrect, Exiting..."
        exit 0
  else
        echo "Invalid input. Please enter 'y' or 'n'."
        exit 1
  fi

# Create release tag
git tag -a -s  "v${version_sdk}" -m "${version_sdk}"

# Push the tag to the branch
git push origin tag "v${version_sdk}"

gh release create "v${version_sdk}" --title "Release ${version_sdk}" --notes "${changelog}" --repo github.com/MOmarMiraj/onepassword-sdk-js

