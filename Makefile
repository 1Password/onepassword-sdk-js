
prep-release-no-core:
	scripts/prep-release.sh false

prep-release:
	scripts/prep-release.sh true

no_core_release:
	scripts/release.sh false

core_release:
	scripts/release.sh true
