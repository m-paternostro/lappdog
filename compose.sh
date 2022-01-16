#! /bin/sh

dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"

envDir="$dir/.env"
set -a
source "$envDir/local.env"
source "$envDir/dev.env"
source "$envDir/db.env"
source "$envDir/container.env"
set +a

mkdir "$dir/go/bin" 2>/dev/null
mkdir "$dir/viewer/bin" 2>/dev/null

composeCommand=$(if [ -x "$(command -v docker-compose)" ]; then echo 'docker-compose'; else echo 'podman-compose'; fi)
COMPOSE_PROFILES=datadog "$composeCommand" --file "$dir/compose.yaml" "$@"
