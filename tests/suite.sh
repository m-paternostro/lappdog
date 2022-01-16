#! /bin/sh

DIR="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"

printf '\n============= DB Local (begin)\n\n'
"$DIR/db/local.sh"
printf '\n============= DB Local (end)\n\n'

printf 'Press any key to continue...' && read

printf '\n============= Node (begin)\n\n'
"$DIR/implementations/curl/node.sh"
printf '\n============= Node (end)\n\n'

printf 'Press any key to continue...' && read

printf '\n============= Go (begin)\n\n'
"$DIR/implementations/curl/go.sh"
printf '\n============= Go (end)\n\n'

printf 'Press any key to continue...' && read

printf '\n============= Viewer (begin)\n\n'
"$DIR/viewer/fetch.sh"
"$DIR/viewer/env.sh"
printf '\n============= Viewer (end)\n\n'

printf '\nDone!\n'
