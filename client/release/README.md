## How to Prepare a Release for the JS SDK
Before running this script, the user must make sure that they have the write permissions to the JS SDK repository.

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

