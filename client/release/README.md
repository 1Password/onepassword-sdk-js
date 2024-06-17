## How to Prepare a Release for the JS SDK
Before running this script, the user must make sure that they have the write permissions to the JS SDK repository.

Step 1. Make any changes to the SDK as required on a feature branch or main branch.
NOTE: If ran on a main branch, a release branch will be created.

Step 2. Go to the root of the repo if the SDK core has been updated than run
```
npm run prep-release
```
but if it hasn't changed than run 
```
npm run prep-release-no-core
```
Follow the scripts instructions and the release has now been prepped.

Step 3. Ensure that the correct files have been updated - i.e. version/build files, changelog has been added to this folder and has the correct file name and content. Suggest doing a `git diff` to see the changes.

Step 4. Ensure your GITHUB_TOKEN environment variable is set as this will allow you to create the tags/release and push it.

Step 5. If everything looks good and if SDK Core has been updated, at the root of the repo, run:
```
npm run release
```
if not than run:
```
npm run no-core-release
```
Step 6. Congratulations, you have released the newest JS SDK!