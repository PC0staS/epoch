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

publish: ## Sube la versión, commitea, etiqueta, lanza el release y actualiza AUR (tag=vX.Y.Z)
	@./scripts/publish.sh $(tag)

clean: ## Borra artefactos de build
	rm -rf app/dist core/target app/src-tauri/target
