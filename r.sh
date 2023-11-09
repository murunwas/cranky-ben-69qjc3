clear
NAME=$1
[[ -z "$NAME" ]] && NAME="src/index.js"
clear && deno run --allow-all  $NAME