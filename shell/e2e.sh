aws s3 cp register/ s3://$S3_BUCKET_URL/js/$CIRCLE_SHA1 --recursive
aws s3api put-object-tagging --bucket $S3_BUCKET_URL --key js/$CIRCLE_SHA1/index.js --tagging TagSet=[{Key=library,Value=$CIRCLE_REPOSITORY_URL}]
curl -X POST -d "repositoryURL=$CIRCLE_REPOSITORY_URL" -d "currentBranch=$CIRCLE_BRANCH" -d "currentBuildNumber=$CIRCLE_BUILD_NUM" -d "previousBuildNumber=$CIRCLE_PREVIOUS_BUILD_NUM" -d "sha1=$CIRCLE_SHA1" -d "pullRequest=$CI_PULL_REQUEST" $E2E_TRIGGER