#!/usr/bin/env bash
# Publica una versión: bump, commit, tag, push y actualización del paquete AUR.
#   ./scripts/publish.sh v1.2.0              # release completa
#   ./scripts/publish.sh v1.2.0 --aur-only   # solo re-sube el PKGBUILD (release ya existe)
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

pkg=epoch-app-bin
aur_dir="${AUR_DIR:-$(dirname "$repo_root")/aur-packages/$pkg}"
ver=""
aur_only=false

for arg in "$@"; do
  case "$arg" in
    --aur-only) aur_only=true ;;
    v[0-9]*) ver="${arg#v}" ;;
    *) echo "uso: $0 vX.Y.Z [--aur-only]"; exit 1 ;;
  esac
done

if [ -z "$ver" ]; then
  read -rp "versión (X.Y.Z): " ver
  ver="${ver#v}"
fi
[[ "$ver" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "versión no válida: $ver"; exit 1; }
tag="v$ver"

if ! $aur_only; then
  [ -z "$(git status --porcelain)" ] || { echo "hay cambios sin commitear"; exit 1; }

  sed -i -E "s/^version = \"[^\"]+\"/version = \"$ver\"/" app/src-tauri/Cargo.toml
  jq --indent 2 --arg v "$ver" '.version = $v' app/package.json > app/package.json.tmp && mv app/package.json.tmp app/package.json
  jq --indent 2 --arg v "$ver" '.version = $v' app/src-tauri/tauri.conf.json > app/src-tauri/tauri.conf.json.tmp && mv app/src-tauri/tauri.conf.json.tmp app/src-tauri/tauri.conf.json
  cargo metadata --manifest-path app/src-tauri/Cargo.toml --format-version 1 > /dev/null
  git add app/package.json app/src-tauri/Cargo.toml app/src-tauri/Cargo.lock app/src-tauri/tauri.conf.json
  git diff --cached --quiet || git commit -m "release $tag"
  git tag "$tag" && git push origin HEAD "$tag"
fi

# --- AUR ---
# El .deb lo genera el CI al empujar el tag, así que hay que esperar a que aparezca.
asset="epoch_${ver}_amd64.deb"
asset_url="https://github.com/PC0staS/epoch/releases/download/$tag/$asset"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

echo "esperando $asset en el release $tag..."
for i in $(seq 1 60); do
  if curl -fsSL -o "$tmp/$asset" "$asset_url"; then break; fi
  [ "$i" -eq 60 ] && { echo "no aparece $asset tras 10 min (¿falló el CI?)"; exit 1; }
  sleep 10
done

sha=$(sha256sum "$tmp/$asset" | cut -d' ' -f1)

if [ ! -d "$aur_dir/.git" ]; then
  mkdir -p "$aur_dir"
  git -C "$aur_dir" init -q
  git -C "$aur_dir" remote add origin "ssh://aur@aur.archlinux.org/$pkg.git"
fi

sed -e "s/__VER__/$ver/" -e "s/__SHA__/$sha/" packaging/aur/PKGBUILD > "$aur_dir/PKGBUILD"
(cd "$aur_dir" && makepkg --printsrcinfo > .SRCINFO)
git -C "$aur_dir" add PKGBUILD .SRCINFO
git -C "$aur_dir" commit -q -m "upgpkg: $pkg $ver-1" || echo "PKGBUILD sin cambios"
GIT_SSH_COMMAND="ssh -i $HOME/.ssh/aur" git -C "$aur_dir" push -u origin HEAD:master

echo "publicado $pkg $ver-1"
