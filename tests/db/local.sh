#! /bin/sh

dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"
containerCommand=$(if [ -x "$(command -v docker)" ]; then echo 'docker'; else echo 'podman'; fi)

envDir="$dir/../../.env"
source "$envDir/db.common.env"
source "$envDir/local.env"

container=$("$containerCommand" ps -qf publish="$LAPPDOG_LOCAL_DB_PORT")
statements=$(sed -E "s/(john|mary)/\1$(date '+%Y%m%d-%H%M%S')/g" "$dir/ledger.sql")
"$containerCommand" exec \
  -ti \
  "$container" \
    mysql \
      --user="$LAPPDOG_DB_USER" \
      --password="$LAPPDOG_DB_PASSWORD" \
      --database=ledger \
      --execute="$statements"
