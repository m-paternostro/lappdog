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

echo "Viewer URL: $url"

page="'$(curl -s "$url")'"
echo "-----"
echo "$page"
echo "-----"

if [ -z "$page " ]
then
  echo "x - blank page"
  exit 1
fi

if [[ "$page" != *"LappDog Viewer"* ]]
then
  echo "x - no title"
  exit 2
fi

if [[ "$page" != *"main.js"* ]]
then
  echo "x - no script"
  exit 3
fi

echo "+ passed"
