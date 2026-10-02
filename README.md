# Liquid Image

A modern, high-performance desktop batch image processor and converter powered by **ImageMagick** and **Tauri v2**.

---

## Installation & Setup

### Windows

Liquid Image comes with ImageMagick **pre-bundled** on Windows. **No additional installation or setup is required for most users.**

1. Download the latest Windows installer (`.exe` or `.msi`) from [Releases](https://github.com/huybach1609/liquid-image/releases).
2. Run the installer and launch **Liquid Image**.
3. *(Optional)* If prompted by Windows for missing runtime components on clean Windows installations, install the [Microsoft Visual C++ 2015–2022 Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe).

#### Using System ImageMagick on Windows (Optional)
If you wish to use an external or newer version of ImageMagick (e.g., with Ghostscript support for PDF/EPS files):
- Install via Windows Package Manager:
  ```powershell
  winget install ImageMagick.ImageMagick
  ```
- Or download the installer from [imagemagick.org](https://imagemagick.org/script/download.php#windows) and ensure you check **"Add application directory to your system path"**.
- In Liquid Image, go to **Settings > ImageMagick** and select or browse to your custom binary path.

---

### macOS

On macOS, Liquid Image uses your system's ImageMagick installation via [Homebrew](https://brew.sh/).

#### Step 1: Install ImageMagick
Open Terminal and run:
```bash
brew install imagemagick
```

*(Optional: If you need support for PDF, AI, or EPS documents, also install Ghostscript)*:
```bash
brew install ghostscript
```

#### Step 2: Install Liquid Image
1. Download `liquid-image.dmg` from [Releases](https://github.com/huybach1609/liquid-image/releases).
2. Open the DMG file and drag **Liquid Image** into your **Applications** folder.
3. Launch the application. Liquid Image will automatically detect your Homebrew installation (`/opt/homebrew/bin/magick` on Apple Silicon or `/usr/local/bin/magick` on Intel Macs).

> **Troubleshooting on macOS:**
> If ImageMagick is not detected automatically, navigate to **Settings > ImageMagick**, click **Browse** (press `Cmd + Shift + G` in the file picker dialog) and specify `/opt/homebrew/bin/magick` (Apple Silicon) or `/usr/local/bin/magick` (Intel).

---

### Linux

#### Arch Linux / Arch-based distributions (CachyOS, Manjaro, EndeavourOS)

You can install `liquid-image` using `makepkg` without needing the AUR. Choose one of the two options below:

##### Option 1: Fast installation from pre-compiled binary (`liquid-image-bin`, Recommended)
Installs in seconds. No need to install `rust`, `cargo`, or `bun`.

```bash
git clone https://github.com/huybach1609/liquid-image.git
cd liquid-image/packaging/liquid-image-bin
makepkg -si
```

##### Option 2: Compile from source (`liquid-image`)
Builds and compiles the source code locally on your machine. Requires `rust`, `cargo`, and `bun` installed.

```bash
git clone https://github.com/huybach1609/liquid-image.git
cd liquid-image/packaging/liquid-image
makepkg -si
```

##### Updating
To update to a newer release in the future:

```bash
git pull
# Run makepkg -sif in your preferred directory (packaging/liquid-image-bin or packaging/liquid-image)
makepkg -sif
```

##### Uninstalling
Since both packages register with `pacman`, remove them anytime with:

```bash
sudo pacman -R liquid-image
```

---

#### Other Linux Distributions

##### Step 1: Install ImageMagick
Liquid Image includes a Linux sidecar binary, but you can also use your system package manager for optimal performance and format support:

- **Ubuntu / Debian:**
  ```bash
  sudo apt update && sudo apt install -y imagemagick
  ```
- **Fedora:**
  ```bash
  sudo dnf install -y ImageMagick
  ```

##### Step 2: Install Liquid Image
Download the `.deb`, `.AppImage`, or package from [Releases](https://github.com/huybach1609/liquid-image/releases).


---

## Configuring ImageMagick in App

Liquid Image provides built-in configuration under **Settings > ImageMagick**:

- **Bundled / Sidecar:** Uses the executable packaged directly within Liquid Image (default on Windows).
- **Custom / System:** Enter or browse to a specific ImageMagick binary path. Click **Test** to verify that the version string and capabilities are recognized before saving.

---

## Development

### Prerequisites

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/) (stable toolchain)
- Platform-specific Tauri dependencies: [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Running Locally

```bash
# Install dependencies
bun install

# Start Vite frontend and Tauri desktop window
bun run tauri dev
```

### Building for Production

```bash
bun run tauri build
```
