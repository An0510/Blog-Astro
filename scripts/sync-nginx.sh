#!/bin/bash
# Copy the Actions-built site branch into the Nginx root. Does not install or build.
set -euo pipefail

repo=/opt/Blog-Astro
dest=/var/www/an2333.com
state_dir=/var/lib/an2333-deploy
stamp="$state_dir/sha"

export GIT_TERMINAL_PROMPT=0

mkdir -p "$state_dir"
exec 9>"$state_dir/lock"
flock -n 9 || exit 0

cd "$repo"

remote_sha=$(git ls-remote origin refs/heads/site | awk 'NR==1 { print $1 }')
if [[ -z "${remote_sha}" ]]; then
	exit 0
fi
if [[ -f "$stamp" && "$(cat "$stamp")" == "$remote_sha" ]]; then
	exit 0
fi

git fetch --quiet origin "+refs/heads/site:refs/remotes/origin/site"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git archive origin/site | tar -C "$tmp" -xf -
if [[ ! -f "$tmp/index.html" ]]; then
	echo "site branch has no index.html; leaving ${dest} unchanged" >&2
	exit 1
fi

rsync -a --delete "$tmp"/ "$dest"/
printf '%s\n' "$(git rev-parse origin/site)" > "$stamp"
