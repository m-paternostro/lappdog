#! /bin/sh

dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"

envDir="$dir/../../.env"
source "$envDir/local.env"

if [[ "$1" == http* ]]
then
  url="$1"
elif [[ -n "$1" ]]
then
  url="http://$LAPPDOG_LOCAL_VIEWER_HOST:$1"
else
  url="http://$LAPPDOG_LOCAL_VIEWER_HOST:$LAPPDOG_LOCAL_VIEWER_PORT"
fi

curltest="$dir/../curltest.sh"

"$curltest" \
  'no env' \
  "$url/env"

"$curltest" \
  'any env' \
  "$url/env?name=any"

"$curltest" \
  'NODE_ENV' \
  "$url/env?name=NODE_ENV"

"$curltest" \
  'NODE_ENV and LAPPDOG_API_VERSION' \
  "$url/env?name=NODE_ENV&name=LAPPDOG_API_VERSION"
