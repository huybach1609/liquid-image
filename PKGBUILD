# Maintainer: your name <your.email@example.com>
pkgname=liquid-image
pkgver=0.1.0
pkgrel=1
pkgdesc="Liquid Image - Tauri desktop application"
arch=('x86_64')
url="https://github.com/yourusername/liquid-image"
license=('MIT')
groups=()
depends=('webkit2gtk' 'openssl')
makedepends=('nodejs' 'bun' 'rust')
provides=()
conflicts=()
replaces=()
backup=()
options=()
install=
changelog=
source=()
noextract=()
md5sums=()

# Build from source using Tauri
build() {
  cd "$srcdir/liquid-image"
  bun install
  bun run tauri build
}

package() {
  cd "$srcdir/liquid-image"

  # Install binary
  install -Dm755 "src-tauri/target/release/liquid-image" \
    "$pkgdir/usr/bin/liquid-image"

  # Install desktop file
  install -Dm644 "src-tauri/target/release/bundle/deb/liquid-image.desktop" \
    "$pkgdir/usr/share/applications/liquid-image.desktop" 2>/dev/null || true

  # Install icons
  for size in 32 64 128 256 512; do
    install -Dm644 "src-tauri/icons/${size}x${size}.png" \
      "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/liquid-image.png" 2>/dev/null || true
  done

  # Install icon.svg if exists
  install -Dm644 "src-tauri/icons/icon.png" \
    "$pkgdir/usr/share/icons/hicolor/512x512/apps/liquid-image.png" 2>/dev/null || true
}
