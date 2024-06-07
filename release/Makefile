export SDK_NAME=js
export REPO_NAME=onepassword-sdk-${SDK_NAME}

export SDK_VERSION = v$(shell cat .version)
export SDK_BUILD_NUMBER = "$(shell cat .version-build)"
export SDK_BUILD_FILE := $(CURDIR)/.version-build

prep-js:
	release-scripts/js-release.sh

.PHONY:version_swap

version_swap:
	cd version_swap/src && cargo run -r main.rs

sdk-release-js:
	release-scripts/sdk-release.sh