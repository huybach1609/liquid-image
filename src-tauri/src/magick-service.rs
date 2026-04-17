use tauri::{command, AppHandle};
use tauri_plugin_shell::ShellExt;

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
    args: Option<Vec<String>>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePreviewResponse {
    preview_path: String,
    width: u32,
    height: u32,
    total_ms: u128,
    render_ms: u128,
    identify_ms: u128,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunSingleRequest {
    input_path: String,
    output_path: String,
    args: Vec<String>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunSingleResponse {
    output_path: String,
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
    use std::time::{Instant, SystemTime, UNIX_EPOCH};

    const PREVIEW_TARGET: u32 = 1600;
    const PREVIEW_QUALITY: u32 = 70;
    const WEBP_METHOD_FAST: u32 = 1;

    let total_started = Instant::now();
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
    let mut preview_cli_args: Vec<String> =
        vec!["-limit".into(), "thread".into(), "1".into()];

    let mut command = app
        .shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg("-limit")
        .arg("thread")
        .arg("1");

    // Hint JPEG decoder to avoid decoding full-resolution pixels for preview.
    let lower_input = request.input_path.to_ascii_lowercase();
    if lower_input.ends_with(".jpg") || lower_input.ends_with(".jpeg") {
        let hinted = PREVIEW_TARGET.saturating_mul(2);
        let jpeg_hint = format!("jpeg:size={}x{}", hinted, hinted);
        preview_cli_args.push("-define".into());
        preview_cli_args.push(jpeg_hint.clone());
        command = command.arg("-define").arg(jpeg_hint);
    }

    preview_cli_args.push(request.input_path.clone());
    command = command.arg(&request.input_path);

    for arg in request.args.as_deref().unwrap_or(&[]) {
        preview_cli_args.push(arg.clone());
        command = command.arg(arg);
    }
    preview_cli_args.extend_from_slice(&[
        "-auto-orient".into(),
        "-thumbnail".into(),
        format!("{PREVIEW_TARGET}x{PREVIEW_TARGET}>"),
        "-depth".into(),
        "8".into(),
        "-strip".into(),
        "-quality".into(),
        PREVIEW_QUALITY.to_string(),
        "-define".into(),
        format!("webp:method={WEBP_METHOD_FAST}"),
        output_path.to_string_lossy().to_string(),
    ]);

    let render_started = Instant::now();
    let preview_output = command
        .arg("-auto-orient")
        .arg("-thumbnail")
        .arg(format!("{PREVIEW_TARGET}x{PREVIEW_TARGET}>"))
        .arg("-depth")
        .arg("8")
        .arg("-strip")
        .arg("-quality")
        .arg(PREVIEW_QUALITY.to_string())
        .arg("-define")
        .arg(format!("webp:method={WEBP_METHOD_FAST}"))
        .arg(&output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;
    let render_ms = render_started.elapsed().as_millis();

    if !preview_output.status.success() {
        let stderr = String::from_utf8_lossy(&preview_output.stderr)
            .trim()
            .to_string();
        if stderr.is_empty() {
            return Err("Failed to generate preview".into());
        }
        return Err(stderr);
    }

    let identify_started = Instant::now();
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
    let identify_ms = identify_started.elapsed().as_millis();

    if !identify_output.status.success() {
        let stderr = String::from_utf8_lossy(&identify_output.stderr)
            .trim()
            .to_string();
        if stderr.is_empty() {
            return Err("Failed to inspect preview output".into());
        }
        return Err(stderr);
    }

    let raw_dims = String::from_utf8_lossy(&identify_output.stdout)
        .trim()
        .to_string();
    let parts: Vec<&str> = raw_dims.split('|').collect();
    if parts.len() != 2 {
        return Err("Failed to parse preview dimensions".into());
    }

    let total_ms = total_started.elapsed().as_millis();
    println!(
        "[preview] op={} render={}ms identify={}ms total={}ms",
        request.operation, render_ms, identify_ms, total_ms
    );
    println!("[preview] magick {}", preview_cli_args.join(" "));

    Ok(GeneratePreviewResponse {
        preview_path: output_path.to_string_lossy().to_string(),
        width: parts[0].parse::<u32>().map_err(|e| e.to_string())?,
        height: parts[1].parse::<u32>().map_err(|e| e.to_string())?,
        total_ms,
        render_ms,
        identify_ms,
    })
}

#[tauri::command]
pub async fn run_single(
    app: tauri::AppHandle,
    request: RunSingleRequest,
) -> Result<RunSingleResponse, String> {
    use std::fs;
    use std::path::Path;

    if request.input_path.trim().is_empty() {
        return Err("Input path is required".into());
    }
    if request.output_path.trim().is_empty() {
        return Err("Output path is required".into());
    }

    let output_parent = Path::new(&request.output_path)
        .parent()
        .ok_or_else(|| "Invalid output path".to_string())?;
    fs::create_dir_all(output_parent).map_err(|e| e.to_string())?;

    let mut command = app
        .shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg(&request.input_path);

    for arg in &request.args {
        command = command.arg(arg);
    }

    let run_output = command
        .arg(&request.output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !run_output.status.success() {
        let stderr = String::from_utf8_lossy(&run_output.stderr).trim().to_string();
        if stderr.is_empty() {
            return Err("ImageMagick failed to run command".into());
        }
        return Err(stderr);
    }

    let identify_output = app
        .shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg("identify")
        .arg("-format")
        .arg("%w|%h")
        .arg(&request.output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !identify_output.status.success() {
        let stderr = String::from_utf8_lossy(&identify_output.stderr)
            .trim()
            .to_string();
        if stderr.is_empty() {
            return Err("Failed to inspect output image".into());
        }
        return Err(stderr);
    }

    let raw_dims = String::from_utf8_lossy(&identify_output.stdout)
        .trim()
        .to_string();
    let parts: Vec<&str> = raw_dims.split('|').collect();
    if parts.len() != 2 {
        return Err("Failed to parse output dimensions".into());
    }

    Ok(RunSingleResponse {
        output_path: request.output_path,
        width: parts[0].parse::<u32>().map_err(|e| e.to_string())?,
        height: parts[1].parse::<u32>().map_err(|e| e.to_string())?,
    })
}