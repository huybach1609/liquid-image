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

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageMetadata {
    path: String,
    format: String,
    width: u32,
    height: u32,
    file_size_bytes: u64,
}

#[tauri::command]
pub async fn get_image_metadata(app: tauri::AppHandle, path: String) -> Result<ImageMetadata, String> {
    use std::fs;
    // identify -format "%m|%w|%h"
    let output = app.shell()
        .sidecar("magick").map_err(|e| e.to_string())?
        .arg("identify")
        .arg("-format")
        .arg("%m|%w|%h")
        .arg(&path)
        .output()
        .await
        .map_err(|e| e.to_string())?;
    let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let parts: Vec<&str> = raw.split('|').collect();
    if parts.len() != 3 {
        return Err("Failed to parse image metadata".into());
    }
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    Ok(ImageMetadata {
        path,
        format: parts[0].to_string(),
        width: parts[1].parse::<u32>().map_err(|e| e.to_string())?,
        height: parts[2].parse::<u32>().map_err(|e| e.to_string())?,
        file_size_bytes: meta.len(),
    })
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePreviewRequest {
    input_path: String,
    operation: String,
    options_json: Option<String>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePreviewResponse {
    preview_path: String,
    width: u32,
    height: u32,
}

#[tauri::command]
pub async fn generate_preview(
    app: tauri::AppHandle,
    request: GeneratePreviewRequest,
) -> Result<GeneratePreviewResponse, String> {
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    let preview_root = std::env::temp_dir().join("liquid-image-preview");
    fs::create_dir_all(&preview_root).map_err(|e| e.to_string())?;

    let epoch_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();

    let operation_slug = request
        .operation
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric() || *ch == '_' || *ch == '-')
        .collect::<String>();
    let operation_segment = if operation_slug.is_empty() {
        "preview".to_string()
    } else {
        operation_slug
    };
    let options_suffix = request
        .options_json
        .as_ref()
        .map(|s| s.len().to_string())
        .unwrap_or_else(|| "0".to_string());

    let output_path: PathBuf = preview_root.join(format!(
        "preview-{}-{}-{}.jpg",
        operation_segment, options_suffix, epoch_ms
    ));

    app.shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg(&request.input_path)
        .arg("-auto-orient")
        .arg("-resize")
        .arg("1600x1600>")
        .arg("-quality")
        .arg("88")
        .arg(&output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let identify_output = app
        .shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg("identify")
        .arg("-format")
        .arg("%w|%h")
        .arg(&output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let raw_dims = String::from_utf8_lossy(&identify_output.stdout)
        .trim()
        .to_string();
    let parts: Vec<&str> = raw_dims.split('|').collect();
    if parts.len() != 2 {
        return Err("Failed to parse preview dimensions".into());
    }

    Ok(GeneratePreviewResponse {
        preview_path: output_path.to_string_lossy().to_string(),
        width: parts[0].parse::<u32>().map_err(|e| e.to_string())?,
        height: parts[1].parse::<u32>().map_err(|e| e.to_string())?,
    })
}