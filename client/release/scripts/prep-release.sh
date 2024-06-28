#!/bin/bash

# Helper script to prepare a release for the JS SDK.

# Read the build number from version-build to compare with new build number and ensure update has been made.
output_version_file="client/release/version.js"
version_template_file="client/release/templates/version.tpl.js"

# Extracts the current build number for comparison 
current_core_version=$(awk -F "['\"]" '/SDK_CORE_VERSION =/{print $2}' "${output_version_file}" | tr -d '\n')

core_modified="${1}"

# Function to execute upon exit
cleanup() {
    echo "Performing cleanup tasks..."
    # Revert changes to file if any
    git checkout -- "${output_version_file}"
    exit 1   
}

# Set the trap to call the cleanup function on exit
trap cleanup SIGINT

enforce_latest_code() {
    if [[ -n "$(git status --porcelain=v1)" ]]; then
        echo "ERROR: working directory is not clean."
        echo "Please stash your changes and try again."
        exit 1
    fi
}

# Function to validate the version number format x.y.z(-beta.w)
update_and_validate_version() {
    if [ "${core_modified}" = "true" ]; then
        while true; do
            # Prompt the user to input the version number
            read -p "Enter the core version number (format: x.y.z(-beta.w)): " version
            # Validate the version number format
            if [[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]; then        
                if [[ "${current_core_version}" != "${version}" ]]; then
                    # TODO: Check the less than case as well.
                    echo "New version number is: ${version}"
                    break
                else
                    echo "Core version hasn't changed."
                fi        
            else
                echo "Invalid version number format: ${version}"
                echo "Please enter a version number in the 'x.y.z(-beta.w)' format."
            fi
        done
    fi
    while true; do
        # Prompt the user to input the version number
        read -p "Enter the JS SDK client's version number (format: x.y.z(-beta.w)): " version_publish
        
        # Validate the version number format
        if [[ "${version_publish}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]; then        
            if [[ "${current_version}" != "${version_publish}" ]]; then
                # TODO: Check the less than case as well.
                echo "New version number is: ${version_publish}"
                return 0
            else
                echo "Version hasn't changed."
            fi        
        else
            echo "Invalid version number format: ${version_publish}"
            echo "Please enter a version number in the 'x.y.z(-beta.w)' format."
        fi
    done
}

# Function to validate the build number format.
# SEMVER Format: Mmmppbb - 7 Digits 
update_and_validate_build() {
    while true; do
        # Prompt the user to input the build number
        read -p "Enter the build number (format: Mmmppbb): " build

        # Validate the build number format
        if [[ "${build}" =~ ^[0-9]{7}$ ]]; then
            if (( 10#$current_build < 10#$build )); then
                # Write the valid build number to the file
                echo "New build number is: ${build}"
                return 0
            else
                echo "New build version should be higher than current build version."
            fi
        else
            echo "Invalid build number format: ${build}"
            echo "Please enter a build number in the 'Mmmppbb' format."
        fi
    done
}
# Ensure that the current working directory is clean
# enforce_latest_code

# Update and validate the version number
update_and_validate_version

# Update and validate the build number
update_and_validate_build

if [ "${core_modified}" = "true" ]; then
    sed -e "s/{{ build }}/$build/" -e "s/{{ version }}/$version_publish/" -e "s/{{ core_version }}/$version/" "$version_template_file" > "$output_version_file"
else
    sed -e "s/{{ build }}/$build/" -e "s/{{ version }}/$version_publish/" -e "s/{{ core_version }}/$current_core_version/" "$version_template_file" > "$output_version_file"
fi

printf "Press ENTER to edit the CHANGELOG in your default editor...\n"
read -r _ignore
${EDITOR:-nano} "client/release/RELEASE-NOTES"

# Get Current Branch Name
branch="$(git rev-parse --abbrev-ref HEAD)"

# if on main, then stash changes and create RC branch
if [[ "${branch}" = "main" ]]; then
    branch=rc/"${version_publish}"
    git stash
    git fetch origin 
    git checkout -b "${branch}"
    git stash apply
fi

# Add changes and commit/push to branch
git add .
git commit -S -m "Release v${version_publish}"
git push --set-upstream origin "${branch}"

echo "Release has been prepared..
Make sure to double check version/build numbers in their appropriate files and
changelog is correctly filled out.
Once confirmed, run 'npm run release or npm run no-core-release' depending to release the SDK!"

