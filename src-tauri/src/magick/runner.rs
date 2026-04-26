use std::sync::OnceLock;
use tauri::AppHandle;
use tauri_plugin_shell::process::Command;
use tauri_plugin_shell::ShellExt;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MagickSource {
    Sidecar,
    System,
}

impl std::fmt::Display for MagickSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MagickSource::Sidecar => write!(f, "sidecar"),
            MagickSource::System => write!(f, "system"),
        }
    }
}

static MAGICK_SOURCE: OnceLock<MagickSource> = OnceLock::new();

pub fn detect_magick_source() -> MagickSource {
    if let Ok(val) = std::env::var("LI_MAGICK_SOURCE") {
        return match val.to_lowercase().as_str() {
            "system" | "path" => MagickSource::System,
            "sidecar" | "bundle" => MagickSource::Sidecar,
            _ => MagickSource::Sidecar,
        };
    }

    // macOS debug builds: prefer system magick (installed via brew)
    // Production builds and other platforms default to bundled sidecar
    if cfg!(debug_assertions) && cfg!(target_os = "macos")
        && std::process::Command::new("magick")
            .arg("-version")
            .output()
            .is_ok()
    {
        return MagickSource::System;
    }

    MagickSource::Sidecar
}

pub fn get_magick_source() -> MagickSource {
    *MAGICK_SOURCE.get_or_init(detect_magick_source)
}

pub fn create_magick_command(app: &AppHandle, source: MagickSource) -> Result<Command, String> {
    match source {
        MagickSource::Sidecar => app
            .shell()
            .sidecar("magick")
            .map_err(|e| format!("sidecar error: {e}")),
        MagickSource::System => Ok(app.shell().command("magick")),
    }
}