#! /bin/sh

name="$1"
url="$2"
shift 2

format='
---------------------------------------------
status code :  %{http_code}
---------------------------------------------
time_namelookup   :  %{time_namelookup} s
time_connect      :  %{time_connect} s
time_appconnect   :  %{time_appconnect} s
time_pretransfer  :  %{time_pretransfer} s
time_redirect     :  %{time_redirect} s
time_starttransfer:  %{time_starttransfer} s
-------------------
time_total        :  %{time_total} s
download speed    :  %{speed_download} B/s
'


echo
echo '============================================='
echo "Test: $name"
echo "URL : $url"
echo '---------------------------------------------'
curl -w "$format" "$url" "$@"
echo '============================================='
