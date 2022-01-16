#! /bin/sh

dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"

envDir="$dir/../../../.env"
source "$envDir/local.env"

if [[ "$1" == http* ]]
then
  url="$1"
elif [[ -n "$1" ]]
then
  url="http://$LAPPDOG_LOCAL_GO_HOST:$1"
else
  url="http://$LAPPDOG_LOCAL_GO_HOST:$LAPPDOG_LOCAL_GO_PORT"
fi

"$dir/run.sh" "$url"
