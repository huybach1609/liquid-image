use tauri::{command, AppHandle};
use tauri_plugin_shell::process::CommandEvent;
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

#[tauri::command]
pub async fn create_image_proxy(
    app: tauri::AppHandle,
    input_path: String,
) -> Result<String, String> {
    use std::fs;

    const PREVIEW_TARGET: u32 = 1600;

    if input_path.trim().is_empty() {
        return Err("Input path is required".into());
    }

    let preview_root = std::env::temp_dir().join("liquid-image-preview");
    fs::create_dir_all(&preview_root).map_err(|e| e.to_string())?;

    // Unique name so the frontend `proxyPath` changes every load — fixed `base_proxy.webp`
    // kept the same string and blocked `usePreviewPipeline` from re-running.
    let id = format!(
        "{}_{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_micros())
            .unwrap_or(0),
        std::process::id()
    );
    let proxy_path = preview_root.join(format!("proxy_{id}.webp"));

    let mut command = app.shell().sidecar("magick").map_err(|e| e.to_string())?;

    let lower_input = input_path.to_ascii_lowercase();
    if lower_input.ends_with(".jpg") || lower_input.ends_with(".jpeg") {
        let jpeg_hint = format!("jpeg:size={PREVIEW_TARGET}x{PREVIEW_TARGET}");
        command = command.arg("-define").arg(jpeg_hint);
    }

    command = command
        .arg(&input_path)
        .arg("-auto-orient")
        .arg("-thumbnail")
        .arg(format!("{PREVIEW_TARGET}x{PREVIEW_TARGET}>"))
        .arg("-depth")
        .arg("8")
        .arg("-strip")
        .arg("-quality")
        .arg("90")
        .arg(&proxy_path);

    let output = command.output().await.map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if stderr.is_empty() {
            "Failed to create proxy".into()
        } else {
            stderr
        });
    }

    Ok(proxy_path.to_string_lossy().into_owned())
}

/// Remove a preview proxy file created under `%TEMP%/liquid-image-preview/proxy_*.webp`.
#[tauri::command]
pub fn remove_proxy_file(path: String) -> Result<(), String> {
    use std::fs;
    use std::path::PathBuf;

    if path.trim().is_empty() {
        return Ok(());
    }

    let preview_root = std::env::temp_dir().join("liquid-image-preview");
    fs::create_dir_all(&preview_root).map_err(|e| e.to_string())?;
    let root_canon = fs::canonicalize(&preview_root).map_err(|e| e.to_string())?;

    let p = PathBuf::from(path.trim());
    let parent = p.parent().ok_or_else(|| "Invalid proxy path".to_string())?;
    let parent_canon = fs::canonicalize(parent).map_err(|_| "Invalid proxy path".to_string())?;
    if parent_canon != root_canon {
        return Err("Invalid proxy path".into());
    }

    let name = p
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid proxy path".to_string())?;
    if !name.starts_with("proxy_") || !name.ends_with(".webp") {
        return Err("Invalid proxy path".into());
    }

    let _ = fs::remove_file(&p);
    Ok(())
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePreviewRequest {
    input_path: String,
    operation: String,
    options_json: Option<String>,
    args: Option<Vec<String>>,
    /// When true, `input_path` is already a downsampled WebP proxy — skip JPEG decode hints and resize pass.
    #[serde(default)]
    from_proxy: bool,
    /// Full-resolution image width (px). With `from_proxy`, used to rescale `-shave` from UI/original space into proxy space.
    #[serde(default)]
    original_width: Option<u32>,
    /// Full-resolution image height (px). Same as `original_width` for `-shave` rescaling.
    #[serde(default)]
    original_height: Option<u32>,
}

fn args_slice_contains_shave(args: &[String]) -> bool {
    args.windows(2).any(|w| w[0] == "-shave")
}

fn parse_shave_geometry(token: &str) -> Option<(u32, u32)> {
    let (a, b) = token.split_once('x')?;
    let h = a.parse().ok()?;
    let v = b.parse().ok()?;
    Some((h, v))
}

/// UI `-shave` values are in **original/full** pixels. Preview runs on the proxy — scale down:
/// `final_h = round(ui_h * proxy_w / orig_w)`, `final_v = round(ui_v * proxy_h / orig_h)`.
fn rescale_shave_tokens_for_proxy_preview(
    args: &mut [String],
    proxy_w: u32,
    proxy_h: u32,
    orig_w: u32,
    orig_h: u32,
) {
    if orig_w == 0 || orig_h == 0 || proxy_w == 0 || proxy_h == 0 {
        return;
    }
    let scale_x = proxy_w as f64 / orig_w as f64;
    let scale_y = proxy_h as f64 / orig_h as f64;
    let mut i = 0usize;
    while i + 1 < args.len() {
        if args[i] == "-shave" {
            if let Some((ui_h, ui_v)) = parse_shave_geometry(&args[i + 1]) {
                let nh = ((ui_h as f64) * scale_x).round().max(0.0) as u32;
                let nv = ((ui_v as f64) * scale_y).round().max(0.0) as u32;
                args[i + 1] = format!("{nh}x{nv}");
            }
            i += 2;
            continue;
        }
        i += 1;
    }
}

async fn identify_image_wh(app: &tauri::AppHandle, path: &str) -> Result<(u32, u32), String> {
    let output = app
        .shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?
        .arg("identify")
        .arg("-format")
        .arg("%w|%h")
        .arg(path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if stderr.is_empty() {
            "identify failed".into()
        } else {
            stderr
        });
    }

    let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let parts: Vec<&str> = raw.split('|').collect();
    if parts.len() != 2 {
        return Err("Failed to parse dimensions".into());
    }
    Ok((
        parts[0].parse::<u32>().map_err(|e| e.to_string())?,
        parts[1].parse::<u32>().map_err(|e| e.to_string())?,
    ))
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePreviewResponse {
    /// WebP bytes as a `data:image/webp;base64,...` URI for direct `<img src>`.
    preview_data_uri: String,
    total_ms: u32,
    render_ms: u32,
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
    request: GeneratePreviewRequest, // Cần cập nhật lại struct Response bên dưới
) -> Result<GeneratePreviewResponse, String> {
    use std::time::Instant;
    use base64::{engine::general_purpose::STANDARD, Engine as _};

    const PREVIEW_TARGET: u32 = 1600;
    const PREVIEW_QUALITY: u32 = 70;
    const WEBP_METHOD_FAST: u32 = 1;

    let total_started = Instant::now();

    // Khởi tạo tiến trình magick (mirror args vào `preview_cli_args` để log đúng lệnh đã chạy)
    let mut preview_cli_args: Vec<String> = Vec::new();
    let mut command = app
        .shell()
        .sidecar("magick")
        .map_err(|e| e.to_string())?;

    let from_proxy = request.from_proxy;

    // 1. JPEG decode hint + resize/orientation — skipped when reading an existing proxy WebP
    if !from_proxy {
        let lower_input = request.input_path.to_ascii_lowercase();
        if lower_input.ends_with(".jpg") || lower_input.ends_with(".jpeg") {
            let jpeg_hint = format!("jpeg:size={PREVIEW_TARGET}x{PREVIEW_TARGET}");
            preview_cli_args.extend(["-define".into(), jpeg_hint.clone()]);
            command = command.arg("-define").arg(jpeg_hint);
        }

        preview_cli_args.push(request.input_path.clone());
        command = command.arg(&request.input_path);
        preview_cli_args.extend([
            "-auto-orient".into(),
            "-thumbnail".into(),
            format!("{PREVIEW_TARGET}x{PREVIEW_TARGET}>"),
        ]);
        command = command
            .arg("-auto-orient")
            .arg("-thumbnail")
            .arg(format!("{PREVIEW_TARGET}x{PREVIEW_TARGET}>"));
    } else {
        preview_cli_args.push(request.input_path.clone());
        command = command.arg(&request.input_path);
    }

    // 2. Effect argv from frontend (optionally rescale `-shave` for proxy preview — UI is full-res px)
    let mut effect_args: Vec<String> = request.args.clone().unwrap_or_default();
    if from_proxy && args_slice_contains_shave(&effect_args) {
        if let (Some(orig_w), Some(orig_h)) = (request.original_width, request.original_height) {
            match identify_image_wh(&app, &request.input_path).await {
                Ok((proxy_w, proxy_h)) => {
                    rescale_shave_tokens_for_proxy_preview(
                        &mut effect_args,
                        proxy_w,
                        proxy_h,
                        orig_w,
                        orig_h,
                    );
                }
                Err(e) => eprintln!("[preview] proxy identify for -shave rescale: {e}"),
            }
        }
    }

    for arg in &effect_args {
        preview_cli_args.push(arg.clone());
        command = command.arg(arg);
    }

    // 3. Ép xuất thẳng ra STDOUT thay vì ghi file
    preview_cli_args.extend([
        "-depth".into(),
        "8".into(),
        "-strip".into(),
        "-quality".into(),
        PREVIEW_QUALITY.to_string(),
        "-define".into(),
        format!("webp:method={WEBP_METHOD_FAST}"),
        "webp:-".into(),
    ]);
    command = command
        .arg("-depth").arg("8")
        .arg("-strip")
        .arg("-quality").arg(PREVIEW_QUALITY.to_string())
        .arg("-define").arg(format!("webp:method={WEBP_METHOD_FAST}"))
        // Dấu "-" ở cuối định dạng webp báo cho magick xuất ra stdout
        .arg("webp:-");

    let render_started = Instant::now();

    // `tauri_plugin_shell::Command::output()` reads stdout in *line* mode by default and also
    // appends `\n` between chunks — that corrupts binary WebP from `magick ... webp:-`.
    // Raw spawn + concat preserves bytes exactly.
    let (mut rx, _child) = command
        .set_raw_out(true)
        .spawn()
        .map_err(|e| e.to_string())?;
    let mut preview_stdout: Vec<u8> = Vec::new();
    let mut preview_stderr: Vec<u8> = Vec::new();
    let mut exit_code: Option<i32> = None;
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Terminated(payload) => exit_code = payload.code,
            CommandEvent::Stdout(chunk) => preview_stdout.extend(chunk),
            CommandEvent::Stderr(chunk) => preview_stderr.extend(chunk),
            CommandEvent::Error(e) => return Err(e),
            _ => {}
        }
    }
    let render_ms = render_started.elapsed().as_millis();

    if exit_code != Some(0) {
        let stderr = String::from_utf8_lossy(&preview_stderr).trim().to_string();
        eprintln!(
            "[preview-in-memory] cmd (failed): magick {}",
            preview_cli_args.join(" ")
        );
        return Err(if stderr.is_empty() { "Failed to generate preview".into() } else { stderr });
    }

    // 4. Encode mảng byte thành Base64 Data URI
    // Chuỗi này có thể được dùng trực tiếp trong thẻ <img src="..."> ở React
    let b64_image = STANDARD.encode(&preview_stdout);
    let data_uri = format!("data:image/webp;base64,{}", b64_image);

    let total_ms = total_started.elapsed().as_millis();
    
    println!(
        "[preview-in-memory] op={} render={}ms total={}ms",
        request.operation, render_ms, total_ms
    );
    println!(
        "[preview-in-memory] cmd: magick {}",
        preview_cli_args.join(" ")
    );


    // Trả về thẳng cho React
    Ok(GeneratePreviewResponse {
        preview_data_uri: data_uri,
        total_ms: total_ms.min(u128::from(u32::MAX)) as u32,
        render_ms: render_ms.min(u128::from(u32::MAX)) as u32,
    })
}

/// Renders one argv token for debug logs (quotes when needed, like a POSIX shell).
fn format_cli_token_for_log(s: &str) -> String {
    if s.is_empty() || s.chars().any(char::is_whitespace) {
        let escaped = s.replace('\\', "\\\\").replace('"', "\\\"");
        format!("\"{escaped}\"")
    } else {
        s.to_owned()
    }
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

    let run_cli_display = std::iter::once(format_cli_token_for_log(&request.input_path))
        .chain(
            request
                .args
                .iter()
                .map(|a| format_cli_token_for_log(a.as_str())),
        )
        .chain(std::iter::once(format_cli_token_for_log(
            &request.output_path,
        )))
        .collect::<Vec<_>>()
        .join(" ");
    println!("[run_single] magick {}", run_cli_display);

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