# Epoch

Archivo personal de la web: guarda una copia del HTML de una página para volver a
verla tal como estaba, aunque el original cambie o desaparezca.

Epoch abre la URL en tu navegador (Chromium) y guarda lo que hay en ese momento.
No es una captura de pantalla ni un archivador completo de assets: solo el HTML,
con sus URLs relativas convertidas en absolutas.

## Requisitos

- Un navegador **Chromium-based**: Chrome, Chromium, Edge o Brave. Firefox y Safari
  no sirven (no hablan CDP).
- Linux (glibc >= 2.35) o macOS o Windows, según el instalador.

## Instalación

Arch Linux (AUR):

```sh
paru -S epoch-app-bin   # o yay -S epoch-app-bin
```

O descarga el paquete de la última [release](../../releases/latest):

- **AppImage** — cualquier distro, sin instalar nada:
  ```sh
  chmod +x Epoch_*.AppImage
  ./Epoch_*.AppImage
  ```
- **.deb** — Debian, Ubuntu, Mint: `sudo dpkg -i Epoch_*.deb`
- **.rpm** — Fedora, openSUSE
- **.dmg / .app** — macOS (Apple Silicon e Intel)
- **.msi / .exe** — Windows 10/11

O compílalo tú e instálalo en `~/.local` (sin `sudo`):

```sh
make deps
make install
```

## Uso

- **Home**: pega una URL y pulsa *Guardar*.
- **History**: lista de capturas y vista de calendario (un evento por captura).
- **Snapshot**: el HTML guardado, en un iframe aislado.

## Limitaciones conocidas

- **Las animaciones y los clics que dependen de JavaScript no funcionan** en el
  visor. Se guarda el DOM en un instante, no la aplicación web. Las animaciones
  hechas solo con CSS sí se ven.
- El snapshot **depende del servidor original** para imágenes y estilos: las URLs
  se absolutizan, no se descargan. Si el sitio cae, verás la página sin assets.
- El visor ejecuta el contenido en un iframe con `sandbox`. Hay una casilla para
  darle acceso al origen (necesario en algunas webs), pero eso permite que ese
  HTML llame a los comandos de la app: úsala solo con sitios de confianza.

## Desarrollo

```sh
make deps     # dependencias de frontend (bun) y Rust
make dev      # tauri dev, con recarga en caliente
make check    # tsc + cargo check de los dos crates
make build    # bundle de producción (AppImage, deb, rpm...)
make publish tag=v1.0.0   # sube versión, commitea, etiqueta y lanza el release
```

Estructura:

```
core/   epoch-core — la lógica en Rust puro: base de datos, migraciones y captura.
        No sabe nada de Tauri.
app/    la aplicación de escritorio: src-tauri (Rust + Tauri) y src (React + Vite).
```

La base de datos vive fuera del repo, en `~/.epoch/epoch.sqlite`.

## Licencia

MIT
