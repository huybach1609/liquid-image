use tauri::{command, AppHandle};
use tauri_plugin_shell::ShellExt;

pub const ABOUT_LINE: &str =
    "Powered by ImageMagick 7.1.2-19 (Q16-HDRI, x86_64)";

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MagickVersionInfo {
    version_name: String,
    about_line: String,
}

fn parse_magick_version(raw: &str) -> MagickVersionInfo {
    let version_line = raw
        .lines()
        .find(|line| line.trim_start().starts_with("Version:"))
        .unwrap_or_default()
        .trim();

    let version_payload = version_line
        .strip_prefix("Version:")
        .unwrap_or(version_line)
        .trim();

    let mut parts = version_payload.split_whitespace();
    let product = parts.next().unwrap_or("ImageMagick");
    let semver = parts.next().unwrap_or("unknown");
    let flavor = parts.next().unwrap_or("Q16-HDRI");
    let arch = parts.next().unwrap_or("x86_64");

    let version_name = format!("{product} {semver}");
    let about_line = format!("{version_name} ({flavor}, {arch})");

    MagickVersionInfo {
        version_name,
        about_line,
    }
}

#[command]
pub async fn convert_image(app: AppHandle, path: String) -> Result<String, String> {
    let output = app.shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg("-convert")
        .arg(path)
        .output()
        .await
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
#[command]
pub async fn check_version(app: AppHandle) -> Result<MagickVersionInfo, String> {
    let output = app.shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg("-version")
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let raw = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(parse_magick_version(&raw))
}
