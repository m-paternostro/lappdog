#! /bin/sh

name="$1"
url="$2"
shift 2

colorEscape=$(printf '\033')
colorCode="${colorEscape}[33m"
colorTitle="${colorEscape}[35m"
colorNone="${colorEscape}[0m"

format="
---------------------------------------------
status code :  ${colorCode}%{http_code}${colorNone}
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
"

echo
echo '============================================='
echo "${colorTitle}Test:${colorNone} $name"
echo "${colorTitle}URL :${colorNone} $url"
echo '---------------------------------------------'
curl -w "$format" "$url" "$@"
echo '============================================='
