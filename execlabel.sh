#! /bin/sh

dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P)"
containerCommand=$(if [ -x "$(command -v docker)" ]; then echo 'docker'; else echo 'podman'; fi)

colorEscape=$(printf '\033')
color="${colorEscape}[32m"
colorNone="${colorEscape}[0m"

container=$1
if [ -z "$container" ]
then
  echo "Usage: $0 ${color}container${colorNone} [label]"
  echo "Listing running containers..."
  "$containerCommand" ps --format {{.Names}}
  exit 1
fi
shift 1

commandLabel=$1
if [ -n "$commandLabel" ]
then
  shift 1
fi

result=$("$containerCommand" ps -f name="$container$" --format {{.Image}}==={{.Ports}})
containerImage=${result%===*}
containerPorts=${result#*===}

if [ -z "$containerImage" ]
then
  echo "Unable for find the image for container '$container'."
  exit 1
fi

if [ "$commandLabel" = "" ]
then
echo "Listing labels..."
"$containerCommand" inspect -f "{{ range \$k, \$v := .Config.Labels -}}
${color}{{ \$k }}${colorNone}={{ \$v }}
{{ end -}}" "$containerImage"
exit
fi

command=$("$containerCommand" inspect -f "{{index .Config.Labels \"$commandLabel\"}}" "$containerImage")
if [ -z "$command" ]
then
  echo "Unable for find the command '$commandLabel' for container '$container'."
  echo "List all labels running this script with any arguments after the container:"
  echo "${color}$0 $container${colorNone}"
  exit 1
fi

containerPorts=$(echo "$containerPorts" | sed -E "s/:(.+)->/:${color}\1${colorNone} -> /g")
echo "Starting $commandLabel"
echo "  Container: $container"
echo "  Command  : $command $*"
echo "  Ports    : $containerPorts"
echo "..."
"$containerCommand" exec -ti "$container" $command "$@"
