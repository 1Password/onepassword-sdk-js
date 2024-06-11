#!/bin/bash

# Helper script to prepare a release for the Python SDK.

# Read the version number and build number from the respective files
current_version_sdk_number=$(< client/src/version-sdk)
current_version_sdk_core_number=$(< client/src/version-sdk-core)
current_build_number=$(< client/src/version-build)

version_sdk_file="client/src/version-sdk"
version_sdk_core_file="client/src/version-sdk-core"
build_file="client/src/version-build"

core_modified="${1}"

# Function to validate the version number format x.y.z(-beta.w)
validate_and_update_version_number() {
    if [ "${core_modified}" = "true" ]; then
        while true; do
            read -p "Enter the core version number (format: x.y.z(-beta.w)): " version
            # Validate the version number format
            if [[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]; then        
                # Write the valid version number to the file
                echo "${version}" > "${version_sdk_core_file}"
                echo "New version number is: ${version}"
                break
            else
                echo "Invalid core version number format: ${version}"
                echo "Please enter a version number in the 'x.y.z(-beta.w)' format."
            fi    
        done
    fi
    while true; do
            # Prompt the user to input the version number
            read -p "Enter the version number (format: x.y.z(-beta.w)): " version_publish

            # Validate the version number format
            if [[ "${version_publish}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]; then        
                # Write the valid version number to the file
                echo "${version_publish}" > "${version_sdk_file}"
                echo "New version number is: ${version_publish}"
                return 0
            else
                echo "Invalid version number format: ${version_publish}"
                echo "Please enter a version number in the 'x.y.z(-beta.w)' format."
            fi    
        done
}

# Function to validate the build number format.
# SEMVER Format: Mmmppbb - 7 Digits 
update_and_validate_build_number() {
    while true; do
        # Prompt the user to input the build number
        read -p "Enter the build number (format: Mmmppbb): " build

        # Validate the build number format
        if [[ "${build}" =~ ^[0-9]{7}$ ]]; then
            # Write the valid build number to the file
            echo "${build}" > "${build_file}"
            echo "New build number is: ${build}"
            return 0
        else
            echo "Invalid build number format: ${build}"
            echo "Please enter a build number in the 'Mmmppbb' format."
        fi
    done
}

# Update and Validate the version number
validate_and_update_version_number

# Update and Validate the build number
update_and_validate_build_number 

if [[ "$current_build_number" == "$build" ]]; then
    echo "Build version hasn't changed. Stopping." >&2
    exit 1
fi

echo "Enter your changelog for the release (press Ctrl+D when finished):"

# Read changelog input from the user until Ctrl+D is pressed
changelog_content=""
while IFS= read -r line; do
    changelog_content+="${line}"$'\n' # Append each line to the variable with a newline character
done

changelog_file="client/changelogs/"${version_publish}"-"${build}""

# Store the changelog input into a file
{
   echo "Release Notes for: v"${version_publish}""
   echo ""
   echo "${changelog_content}"
   echo "[${build}]"
   echo ""
} >> "${changelog_file}"

echo "Release has been prepared..
Make sure to double check version/build numbers in their appropriate files and
changelog is correctly filled out.
Once confirmed, run make release to release the SDK!"
