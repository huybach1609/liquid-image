use std::sync::{OnceLock, RwLock};
use tauri::AppHandle;
use tauri_plugin_shell::process::Command;
use tauri_plugin_shell::ShellExt;

#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type", content = "path", rename_all = "lowercase")]
pub enum MagickSource {
    Sidecar,
    System,
    Custom(String),
}

impl std::fmt::Display for MagickSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MagickSource::Sidecar => write!(f, "sidecar"),
            MagickSource::System => write!(f, "system"),
            MagickSource::Custom(path) => write!(f, "custom({})", path),
        }
    }
}

fn global_source() -> &'static RwLock<MagickSource> {
    static SOURCE: OnceLock<RwLock<MagickSource>> = OnceLock::new();
    SOURCE.get_or_init(|| RwLock::new(detect_magick_source()))
}

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
    global_source().read().unwrap().clone()
}

pub fn set_magick_source(source: MagickSource) {
    let mut guard = global_source().write().unwrap();
    *guard = source;
}

pub fn create_magick_command(app: &AppHandle, source: &MagickSource) -> Result<Command, String> {
    match source {
        MagickSource::Sidecar => app
            .shell()
            .sidecar("magick")
            .map_err(|e| format!("sidecar error: {e}")),
        MagickSource::System => Ok(app.shell().command("magick")),
        MagickSource::Custom(path) => Ok(app.shell().command(path)),
    }
}
