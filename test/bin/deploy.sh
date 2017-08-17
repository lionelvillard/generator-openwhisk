#!/bin/bash

# Set global variables
source ./vars.global

# Set per-environment variables. Might override global variables
source ./vars.${ENV}

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

echo APIHOST="${APIHOST}" > ${STATE_ROOT}/.wskprops
echo AUTH="${AUTH}" >> ${STATE_ROOT}/.wskprops

WSK_CONFIG_FILE=$STATE_ROOT/.wskprops

. ./openwhisk.sh
