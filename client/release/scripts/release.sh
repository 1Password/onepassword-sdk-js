#!/bin/bash

# Helper script to prepare a JS Release for the SDKs.

# Extract build and version_sdk number from the configuration.ts
build=$(awk -F "['\"]" '/SDK_BUILD_NUMBER =/{print $2}' "client/src/version.ts" | tr -d '\n')
version_sdk=$(awk -F "['\"]" '/SDK_VERSION =/{print $2}' "client/src/version.ts"| tr -d '\n')
version_sdk_core=$(awk -F "['\"]" '/SDK_CORE_VERSION =/{print $2}' "client/src/version.ts" | tr -d '\n')

release_notes=$(< client/release/RELEASE-NOTES)

core_modified="${1}"
RELEASE_CHANNEL="${2}"

# Function to execute upon exit
cleanup() {
    echo "Performing cleanup tasks..."
    # Go to the root of the repo to ensure all files are restored
    cd "$(git rev-parse --show-toplevel)"
    # restores all files
    git checkout -- .
    exit 1   
}

# waits for NPM to publish on internal registry to update package json
wait_for_npm_publish(){
    package_name="${1}"
    updated_npm_version="${2}"

    while true; do
    npm_version=$(npm view "$package_name" version)
    # if package matches npm registry than break out of loop and update package.json
    if [ "$npm_version" == "$updated_npm_version" ]; then
        echo "The package version $npm_version is up to date!"
        break
    else
        # Sleep for another 5 seconds if it still didnt sync
        echo "The $updated_npm_version package version is not yet published to NPM. Waiting..."
        sleep 5
    fi
done
}

# Set the trap to call the cleanup function on exit
trap cleanup SIGINT ERR

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
    cd wasm
    # Update core version number to the latest
    npm version "${version_sdk_core}"
    # Check if all files pertaining to sdk core are included
    npm publish --dry-run --tag "${RELEASE_CHANNEL}"

    read -p "Is everything good? (y/n) " files_are_ok

    case "$files_are_ok" in
        y)
            npm publish --tag "${RELEASE_CHANNEL}"
            npm dist-tag add "@1password/sdk-core@$version_sdk_core" latest
            echo "Publishing and tagging on NPM completed."
            ;;
        n)
            echo "Files are incorrect, Exiting..."
            cleanup
            ;;
        *)
            echo "Invalid input. Please enter 'y' or 'n'."
            cleanup
            ;;
    esac

    cd ..
fi

  cd client
  if [ "$core_modified" = true ]; then
    # Wait for npm to be update to the latest version
    wait_for_npm_publish @1password/sdk-core "${version_sdk_core}"
    # Set the package version regardless if npm published or not
    npm pkg set dependencies.@1password/sdk-core="${version_sdk_core}"
  fi

  # Update sdk version number to the latest
  npm version "${version_sdk}"

  # Check if the latest core is pulled correctly
  npm install 

  # Check if all files pertaining to sdk are included
  RELEASE_CHANNEL="${RELEASE_CHANNEL}" npm run publish-test 
  read -p "Is everything good? (y/n)" files_are_ok

    case "$files_are_ok" in
        y)
            RELEASE_CHANNEL="${RELEASE_CHANNEL}" npm run publish-prod 
            npm dist-tag add @1password/sdk@${version_sdk} latest
            
            # Wait for npm to be update to the latest version
            wait_for_npm_publish @1password/sdk "${version_sdk}"
            # Set the package version regardless if npm published or not
            cd ../examples && npm pkg set dependencies.@1password/sdk="${version_sdk}"

            # Check if the latest SDK client is pulled correctly
            cd ../ && npm install

            echo "Update and installation completed."
            ;;
        n)
            echo "Files are incorrect, Exiting..."
            cleanup
            ;;
        *)
            echo "Invalid input. Please enter 'y' or 'n'."
            cleanup
            ;;
    esac

branch="$(git rev-parse --abbrev-ref HEAD)"
# Add and Commit the package.json's
git commit -am "Update package.json's"

# Create release tag
git tag -a -s  "v${version_sdk}" -m "${version_sdk}"

# Push the commits and tags to the branch
git push --atomic origin "${branch}" "v${version_sdk}"

gh release create "v${version_sdk}" --title "Release ${version_sdk}" --notes "${release_notes}" --repo github.com/1Password/onepassword-sdk-js

