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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn display_sidecar_should_return_sidecar() {
        let source = MagickSource::Sidecar;
        assert_eq!(format!("{}", source), "sidecar");
    }

    #[test]
    fn display_system_should_return_system() {
        let source = MagickSource::System;
        assert_eq!(format!("{}", source), "system");
    }

    #[test]
    fn display_custom_should_return_custom_with_path() {
        let source = MagickSource::Custom("/usr/local/bin/magick".to_string());
        assert_eq!(format!("{}", source), "custom(/usr/local/bin/magick)");
    }

    #[test]
    fn serialize_sidecar_should_produce_tagged_json() {
        let source = MagickSource::Sidecar;
        let json = serde_json::to_string(&source).unwrap();
        assert_eq!(json, r#"{"type":"sidecar"}"#);
    }

    #[test]
    fn serialize_system_should_produce_tagged_json() {
        let source = MagickSource::System;
        let json = serde_json::to_string(&source).unwrap();
        assert_eq!(json, r#"{"type":"system"}"#);
    }

    #[test]
    fn serialize_custom_should_produce_tagged_json_with_path() {
        let source = MagickSource::Custom("/opt/bin/magick".to_string());
        let json = serde_json::to_string(&source).unwrap();
        assert_eq!(json, r#"{"type":"custom","path":"/opt/bin/magick"}"#);
    }

    #[test]
    fn deserialize_sidecar_json_should_return_sidecar_variant() {
        let json = r#"{"type":"sidecar"}"#;
        let source: MagickSource = serde_json::from_str(json).unwrap();
        assert_eq!(source, MagickSource::Sidecar);
    }

    #[test]
    fn deserialize_system_json_should_return_system_variant() {
        let json = r#"{"type":"system"}"#;
        let source: MagickSource = serde_json::from_str(json).unwrap();
        assert_eq!(source, MagickSource::System);
    }

    #[test]
    fn deserialize_custom_json_should_return_custom_variant() {
        let json = r#"{"type":"custom","path":"/usr/bin/magick"}"#;
        let source: MagickSource = serde_json::from_str(json).unwrap();
        assert_eq!(source, MagickSource::Custom("/usr/bin/magick".to_string()));
    }

    #[test]
    fn detect_magick_source_with_env_system_should_return_system() {
        temp_env::with_var("LI_MAGICK_SOURCE", Some("system"), || {
            let source = detect_magick_source();
            assert_eq!(source, MagickSource::System);
        });
    }

    #[test]
    fn detect_magick_source_with_env_path_should_return_system() {
        temp_env::with_var("LI_MAGICK_SOURCE", Some("path"), || {
            let source = detect_magick_source();
            assert_eq!(source, MagickSource::System);
        });
    }

    #[test]
    fn detect_magick_source_with_env_sidecar_should_return_sidecar() {
        temp_env::with_var("LI_MAGICK_SOURCE", Some("sidecar"), || {
            let source = detect_magick_source();
            assert_eq!(source, MagickSource::Sidecar);
        });
    }

    #[test]
    fn detect_magick_source_with_env_bundle_should_return_sidecar() {
        temp_env::with_var("LI_MAGICK_SOURCE", Some("bundle"), || {
            let source = detect_magick_source();
            assert_eq!(source, MagickSource::Sidecar);
        });
    }

    #[test]
    fn detect_magick_source_with_env_unknown_should_return_sidecar() {
        temp_env::with_var("LI_MAGICK_SOURCE", Some("invalid"), || {
            let source = detect_magick_source();
            assert_eq!(source, MagickSource::Sidecar);
        });
    }

    #[test]
    fn detect_magick_source_with_env_case_insensitive_should_return_system() {
        temp_env::with_var("LI_MAGICK_SOURCE", Some("SYSTEM"), || {
            let source = detect_magick_source();
            assert_eq!(source, MagickSource::System);
        });
    }

    #[test]
    fn get_and_set_magick_source_should_roundtrip() {
        let original = get_magick_source();
        set_magick_source(MagickSource::Custom("/test/path".to_string()));
        assert_eq!(get_magick_source(), MagickSource::Custom("/test/path".to_string()));
        set_magick_source(original);
    }
}
