
prep-release-no-core:
	client/release/scripts/prep-release.sh false

prep-release:
	client/release/scripts/prep-release.sh true

no_core_release:
	client/release/scripts/release.sh false

core_release:
	client/release/scripts/release.sh true
