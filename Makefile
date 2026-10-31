.DEFAULT_GOAL := help

.PHONY: help deps dev build install check fmt clippy publish clean

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

deps: ## Instala las dependencias de frontend y Rust
	cd app && bun install
	cargo fetch --manifest-path core/Cargo.toml
	cargo fetch --manifest-path app/src-tauri/Cargo.toml

dev: ## Arranca la app en modo desarrollo
	cd app && bun run tauri dev

build: ## Compila el bundle de producción
	cd app && bun run tauri build

install: ## Compila y la instala en ~/.local (sin sudo)
	cd app && bun run tauri build --no-bundle
	install -Dm755 app/src-tauri/target/release/epoch $(HOME)/.local/bin/epoch
	install -Dm644 app/src-tauri/icons/128x128@2x.png $(HOME)/.local/share/icons/hicolor/256x256/apps/epoch.png
	install -d $(HOME)/.local/share/applications
	printf '%s\n' \
		'[Desktop Entry]' \
		'Type=Application' \
		'Name=Epoch' \
		'Comment=Archivo personal de la web' \
		'Exec=$(HOME)/.local/bin/epoch' \
		'Icon=epoch' \
		'Categories=Utility;' \
		'Terminal=false' > $(HOME)/.local/share/applications/epoch.desktop
	-update-desktop-database $(HOME)/.local/share/applications

check: ## Typecheck del frontend y cargo check de los dos crates
	cd app && bunx tsc --noEmit
	cargo check --manifest-path core/Cargo.toml
	cargo check --manifest-path app/src-tauri/Cargo.toml

fmt: ## Formatea el código Rust
	cargo fmt --manifest-path core/Cargo.toml
	cargo fmt --manifest-path app/src-tauri/Cargo.toml

clippy: ## Linter de Rust
	cargo clippy --manifest-path core/Cargo.toml -- -D warnings
	cargo clippy --manifest-path app/src-tauri/Cargo.toml -- -D warnings

publish: ## Sube la versión, commitea, etiqueta y lanza el release (tag=vX.Y.Z)
	@tag="$(tag)"; \
	if [ -z "$$tag" ]; then read -p "tag: " tag; fi; \
	case "$$tag" in \
		v[0-9]*) ;; \
		*) echo "el tag debe empezar por v y un número (p. ej. v1.0.0)"; exit 1 ;; \
	esac; \
	[ -z "$$(git status --porcelain)" ] || { echo "hay cambios sin commitear"; exit 1; }; \
	ver=$${tag#v}; \
	sed -i -E "s/^version = \"[^\"]+\"/version = \"$$ver\"/" app/src-tauri/Cargo.toml; \
	jq --indent 2 --arg v "$$ver" '.version = $$v' app/package.json > app/package.json.tmp && mv app/package.json.tmp app/package.json; \
	jq --indent 2 --arg v "$$ver" '.version = $$v' app/src-tauri/tauri.conf.json > app/src-tauri/tauri.conf.json.tmp && mv app/src-tauri/tauri.conf.json.tmp app/src-tauri/tauri.conf.json; \
	cargo metadata --manifest-path app/src-tauri/Cargo.toml --format-version 1 > /dev/null; \
	git add app/package.json app/src-tauri/Cargo.toml app/src-tauri/Cargo.lock app/src-tauri/tauri.conf.json; \
	git diff --cached --quiet || git commit -m "release $$tag"; \
	git tag "$$tag" && git push origin HEAD "$$tag"

clean: ## Borra artefactos de build
	rm -rf app/dist core/target app/src-tauri/target
