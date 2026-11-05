## How to Prepare a Release for the JS SDK
Before running this script, the user must make sure that they have the write permissions to the JS SDK repository.

There are two supported ways to publish the packages (`@1password/sdk-core` and `@1password/sdk`) to npm:

- **Option A: local release script with an npm token** (Steps 4-6 below). This is the original process.
- **Option B: GitHub Actions with npm trusted publishing** ([below](#option-b-publish-with-npm-trusted-publishing)). The "Publish to npm (trusted publishing)" workflow publishes over OIDC, so no npm token is involved.

Both stay set up so that either one can be used as a backup if the other fails. Steps 1-3 are the same for both.

Step 1. Make any changes to the SDK as required on a feature branch or main branch.
NOTE: If ran on a main branch, a release branch will be created.

Step 2. Go to the root of the repo if the SDK core has been updated then run
```
npm run prep-release
```
but if it hasn't changed then run 
```
npm run prep-release-no-core
```
Follow the scripts instructions and the release has now been prepped.

Step 3. Ensure that the correct files have been updated - i.e. version/build files, release-notes have been updated. Suggest doing a `git diff` to see the changes.
The prep script updates:
- `client/src/version.ts` (version, build number, and core version)
- `client/release/RELEASE-NOTES`
- the `version` in `client/package.json`, and in `wasm/package.json` if the SDK core has been updated
- the `@1password/sdk-core` dependency in `client/package.json` and the `@1password/sdk` dependency in `examples/package.json`

### Option A: Publish with the local release script (npm token)

Step 4. Ensure your `GITHUB_TOKEN` and `NPM_TOKEN` environment variables are set as this will allow you to create the tags/release and push it.

Step 5. If everything looks good and if SDK Core has been updated, at the root of the repo, run (for beta releases):
```
npm run release
```
if not then run:
```
npm run release-no-core
```

Note: If performing a stable release, the commands should be (for production releases):
```
npm run release-stable
```
or
```
npm run release-no-core-stable
```

Step 6. Congratulations, you have released the newest JS SDK!

### Option B: Publish with npm trusted publishing

The [`publish-npm.yml`](../../.github/workflows/publish-npm.yml) workflow publishes the same packages from GitHub Actions. It authenticates to npm with the job's OIDC token, so no `NPM_TOKEN` is needed, and npm adds a provenance attestation to each published version.

After a real publish, the workflow also creates the `v<version>` tag and the GitHub release. It doesn't bump versions or commit; those come from the release PR in Steps 1-3.

Step 4. Merge the release PR from Steps 1-3. Merge into `main` for a stable release, or into the beta release branch for a beta release. The beta release branch must be `beta` or named `release/...` (for example `release/0.5.0-beta`), because the environment only allows `main`, `beta`, and `release/*`.

Run the workflow after merging, not from the release PR's own branch (`rc/...` or `sdk-core/...`). Option A runs `release.sh` on that branch before merging, but those branches aren't reviewed yet. `sdk-core/...` branches are also pushed automatically by the SDK core publish workflow. The environment doesn't allow either. The workflow publishes the versions that are in the `package.json` files on the branch it runs from, and fails if they don't match `client/src/version.ts`.

Step 5. In GitHub, go to **Actions** → **Publish to npm (trusted publishing)** → **Run workflow**, select the branch from Step 4, and set the inputs:

| Input | Value |
|---|---|
| Release channel | `beta` or `stable` |
| Also publish @1password/sdk-core | Checked if the SDK core has been updated (same as `npm run release` vs `npm run release-no-core`) |
| Dry run | Leave checked for the first run. It runs `npm publish --dry-run`, so nothing is published. |

Check the dry run's output, then run the workflow again with **Dry run** unchecked to publish.

For stable releases, the workflow also points the `latest` dist-tag at the new versions, as the release script does.

Step 6. Check the GitHub release. After the publish, the workflow's "GitHub release" job creates the tag `v<version>` on the commit it published, then creates the release "Release <version>" from `client/release/RELEASE-NOTES`. Beta versions are marked as pre-releases.

The tag is a lightweight tag created by `github-actions[bot]`, so unlike Option A's tags it isn't signed itself. It points at the release PR's merge commit, which GitHub signs when the PR is merged in the web UI, so the release shows as Verified.

### Switching between the two options

- The workflow skips any package version that's already on npm, so it's safe to re-run. It can also finish a release that Option A published only part of. For example, if the script published `@1password/sdk-core` but failed before `@1password/sdk`, run the workflow with the same versions.
- npm doesn't allow publishing the same version twice, so the release script fails on a version that's already published. If the workflow published `@1password/sdk-core` but not `@1password/sdk`, finish with `npm run release-no-core` (or `npm run release-no-core-stable`).
- Only one of the two should tag the release and create the GitHub release.
  - If Option A already created them, the workflow's release job sees the existing release and skips.
  - The workflow only creates the tag after both packages publish, so once it exists there's nothing left for the Option A release script to do for that version. npm would reject the already-published versions.
  - If tag `v<version>` already exists on a different commit than the one the workflow published, the release job fails rather than reuse it.

### Maintaining the trusted publishing setup

- Both npm packages (`@1password/sdk-core` and `@1password/sdk`) have a trusted publisher on npmjs.com for the `1Password/onepassword-sdk-js` repository, the `publish-npm.yml` workflow, and the `onepassword-sdk-js` GitHub environment. Renaming the workflow file or the environment breaks publishing until the trusted publishers are updated to match.
- The `onepassword-sdk-js` environment's protection rules are what stop an unreviewed branch from publishing. npm's trusted publisher doesn't check the branch, and anyone with write access can run the workflow from any branch. That run uses the branch's own copy of the workflow file, so a branch check inside the workflow wouldn't help. The environment needs these rules (Settings → Environments, repo admin only):
  - **Deployment branches and tags:** "Selected branches and tags", limited to `main`, `beta`, and `release/*`. These are the branches releases are merged into. Don't add `rc/*` or `sdk-core/*`: those are the unreviewed release PR branches, and `sdk-core/*` is pushed automatically.
  - **Required reviewers:** the `1Password/open-source` team, with "Prevent self-review" on, so a second person approves each publish.

  Set these up before adding the trusted publishers on npmjs.com, and keep them in place. Every run, including a dry run, then waits for a reviewer's approval.
- The environment protects the npm publish, not the tag and release. A branch's edited copy of the workflow could skip the release job's checks and create them. That's no more than anyone with write access can already do by hand.
- Stable releases need "Allow npm dist-tag" enabled on both trusted publishers, so the workflow can point `latest` at the new version. "npm publish" must be enabled too. "npm stage publish" is always on.
- A new trusted publisher shows "Pending validation" until its first real publish, and it expires if nothing is published within 2 days. A dry run doesn't count. If it expires, delete it and create it again.
- The `repository` field in `client/package.json` and `wasm/package.json` must keep pointing at this repository. npm checks it against the workflow's repository when it attaches provenance.
- Option A still relies on `NPM_TOKEN` and the repo's `.npmrc`. Keep both in place (the workflow removes `.npmrc` only inside its own job). Don't set the packages to disallow token publishing on npmjs.com, as that would break Option A.
