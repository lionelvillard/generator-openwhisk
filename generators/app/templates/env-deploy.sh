#!/bin/bash

# Set global variables
source ../.global.wskprops

# Set per-environment variables. Might override global variables
source ../.${ENV}.wskprops

if [ "$BLUEMIX_SPACE" != "" ]; then
  . ./bx-auth.sh
fi

if [ "$AUTH" == "" ]; then
  echo Failed: AUTH null ot not set
  exit 1
fi

if [ "$APIHOST" == "" ]; then
  echo Failed: APIHOST null ot not set
  exit 2
fi

echo APIHOST="${APIHOST}" > ../.wskprops
echo AUTH="${AUTH}" >> ../.wskprops

WSK_CONFIG_FILE=../.wskprops

. ./openwhisk.sh
