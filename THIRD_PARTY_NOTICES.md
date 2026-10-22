# Third-Party Notices

Liquid Image is licensed under the [MIT License](LICENSE). It redistributes the
third-party software listed below, which remains under its own license.

---

## ImageMagick

- **Website:** https://imagemagick.org
- **Source:** https://github.com/ImageMagick/ImageMagick
- **Bundled version:** ImageMagick 7.1.2-19 Q16-HDRI
- **Bundled as:** `magick` sidecar executable (Windows and Linux builds)
- **Copyright:** © 1999 ImageMagick Studio LLC
- **License:** ImageMagick License, see [licenses/ImageMagick-LICENSE.txt](licenses/ImageMagick-LICENSE.txt)

Liquid Image uses ImageMagick as an unmodified, separate executable. ImageMagick
is a trademark of ImageMagick Studio LLC. Liquid Image is an independent project
and is not affiliated with or endorsed by ImageMagick Studio LLC.

The bundled ImageMagick build includes delegate libraries (for example libjpeg,
libpng, libwebp, libheif, libtiff, OpenJPEG, FreeType, fontconfig, LittleCMS,
OpenEXR, zlib, bzip2 and liblzma). Each delegate is distributed under its own
license; see the respective upstream projects for details.

---

## Not bundled

The following tools are **not** distributed with Liquid Image. Users may install
them separately, and they are governed by their own licenses:

- **Ghostscript** (AGPL-3.0), optional, for PDF / EPS / AI support.
- **System ImageMagick** installed via Homebrew, winget or a Linux package manager.

---

## Open-source dependencies

Liquid Image is built with open-source Rust crates and npm packages, including
[Tauri](https://tauri.app) (MIT / Apache-2.0) and [React](https://react.dev) (MIT).
Their licenses are listed in their respective packages (`src-tauri/Cargo.lock`,
`bun.lock`).
