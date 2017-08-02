#!/usr/bin/env bash

function wskkey {
  local ACCESS_TOKEN=`cat ~/.bluemix/.cf/config.json | jq --raw-output .AccessToken | awk '{print $2}'`
  local REFRESH_TOKEN=`cat ~/.bluemix/.cf/config.json | jq --raw-output .RefreshToken`
  local WSK_CREDENTIALS=`curl -s -X POST -H 'Content-Type: application/json' -d "{\"accessToken\": \"${ACCESS_TOKEN}\", \"refreshToken\": \"${REFRESH_TOKEN}\"}" ${WSK_APIHOST-https://openwhisk.ng.bluemix.net}/bluemix/v2/authenticate`

  local CF_ORG=`cat ~/.bluemix/.cf/config.json | jq --raw-output .OrganizationFields.Name`

  local WSK_NAMESPACE="${CF_ORG}_${BLUEMIX_SPACE}"

  local S=`echo "${WSK_CREDENTIALS}" | jq ".namespaces[] | select(.name | contains(\"${WSK_NAMESPACE}\"))"`

  local UUID=`echo $S | jq --raw-output .uuid`
  local KEY=`echo $S | jq --raw-output .key`

  AUTH="${UUID}:${KEY}"
}

if [ "$BLUEMIX_API_KEY" == "" ]; then
  echo Failed: \$BLUEMIX_API_KEY not defined
  exit 1
fi

if [ "$BLUEMIX_SPACE" == "" ]; then
  echo Failed: \$BLUEMIX_SPACE not defined
  exit 2
fi

echo Check logged in to Bluemix
bx iam accounts

if [ "$?" != 0 ]; then
    bx login -s $BLUEMIX_SPACE
fi

echo Set target space to $BLUEMIX_SPACE
bx iam space $BLUEMIX_SPACE
if [ "$?" != 0 ]; then
  echo Create $BLUEMIX_SPACE space
  bx iam space-create $BLUEMIX_SPACE

  echo Wait 5s for keys to become available
  sleep 5
fi

echo Retrieve OpenWhisk API key
wskkey

APIHOST=https://openwhisk.ng.bluemix.net

