use tauri::{command, AppHandle, Emitter};
use tauri_plugin_shell::process::CommandEvent;

use super::runner::{create_magick_command, get_magick_source};

const PREVIEW_MAX_EDGE: u32 = 1600;

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
    let source = get_magick_source();
    let output = create_magick_command(&app, source)?
        .arg("-convert")
        .arg(path)
        .output()
        .await
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[command]
pub async fn check_version(app: AppHandle) -> Result<MagickVersionInfo, String> {
    let source = get_magick_source();
    let output = create_magick_command(&app, source)?
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
pub async fn get_image_metadata(
    app: tauri::AppHandle,
    path: String,
) -> Result<ImageMetadata, String> {
    use std::fs;

    let source = get_magick_source();
    let output = create_magick_command(&app, source)?
        .arg("identify")
        .arg("-format")
        .arg("%m|%w|%h")
        .arg(&path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        eprintln!("[get_image_metadata] failed to identify: {}", path);
        if !stderr.is_empty() {
            eprintln!("[get_image_metadata] stderr: {}", stderr);
            return Err(stderr);
        }
        return Err("Failed to inspect image metadata".into());
    }

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

    if input_path.trim().is_empty() {
        return Err("Input path is required".into());
    }

    let preview_root = std::env::temp_dir().join("liquid-image-preview");
    fs::create_dir_all(&preview_root).map_err(|e| e.to_string())?;

    let id = format!(
        "{}_{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_micros())
            .unwrap_or(0),
        std::process::id()
    );
    let proxy_path = preview_root.join(format!("proxy_{id}.webp"));

    let source = get_magick_source();
    let mut command = create_magick_command(&app, source)?;

    let lower_input = input_path.to_ascii_lowercase();
    if lower_input.ends_with(".jpg") || lower_input.ends_with(".jpeg") {
        let jpeg_hint = format!("jpeg:size={PREVIEW_MAX_EDGE}x{PREVIEW_MAX_EDGE}");
        command = command.arg("-define").arg(jpeg_hint);
    }

    command = command
        .arg(&input_path)
        .arg("-auto-orient")
        .arg("-thumbnail")
        .arg(format!("{PREVIEW_MAX_EDGE}x{PREVIEW_MAX_EDGE}>"))
        .arg("-depth")
        .arg("8")
        .arg("-strip")
        .arg("-quality")
        .arg("90")
        .arg(&proxy_path);

    let output = command.output().await.map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        eprintln!("[create_image_proxy] failed: {}", input_path);
        if !stderr.is_empty() {
            eprintln!("[create_image_proxy] stderr: {}", stderr);
            return Err(stderr);
        }
        return Err("Failed to create proxy".into());
    }

    Ok(proxy_path.to_string_lossy().to_string())
}

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
    #[allow(dead_code)]
    options_json: Option<String>,
    args: Option<Vec<String>>,
    #[serde(default)]
    from_proxy: bool,
    #[serde(default)]
    original_width: Option<u32>,
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
    let source = get_magick_source();
    let output = create_magick_command(app, source)?
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
    request: GeneratePreviewRequest,
) -> Result<GeneratePreviewResponse, String> {
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    use std::time::Instant;

    const PREVIEW_QUALITY: u32 = 70;
    const WEBP_METHOD_FAST: u32 = 1;

    let total_started = Instant::now();

    let source = get_magick_source();
    let mut preview_cli_args: Vec<String> = Vec::new();
    let mut command = create_magick_command(&app, source)?;

    let from_proxy = request.from_proxy;

    if !from_proxy {
        let lower_input = request.input_path.to_ascii_lowercase();
        if lower_input.ends_with(".jpg") || lower_input.ends_with(".jpeg") {
            let jpeg_hint = format!("jpeg:size={PREVIEW_MAX_EDGE}x{PREVIEW_MAX_EDGE}");
            preview_cli_args.extend(["-define".into(), jpeg_hint.clone()]);
            command = command.arg("-define").arg(jpeg_hint);
        }

        preview_cli_args.push(request.input_path.clone());
        command = command.arg(&request.input_path);
        preview_cli_args.extend([
            "-auto-orient".into(),
            "-thumbnail".into(),
            format!("{PREVIEW_MAX_EDGE}x{PREVIEW_MAX_EDGE}>"),
        ]);
        command = command
            .arg("-auto-orient")
            .arg("-thumbnail")
            .arg(format!("{PREVIEW_MAX_EDGE}x{PREVIEW_MAX_EDGE}>"));
    } else {
        preview_cli_args.push(request.input_path.clone());
        command = command.arg(&request.input_path);
    }

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
        .arg("-depth")
        .arg("8")
        .arg("-strip")
        .arg("-quality")
        .arg(PREVIEW_QUALITY.to_string())
        .arg("-define")
        .arg(format!("webp:method={WEBP_METHOD_FAST}"))
        .arg("webp:-");

    let render_started = Instant::now();

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
        return Err(if stderr.is_empty() {
            "Failed to generate preview".into()
        } else {
            stderr
        });
    }

    let b64_image = STANDARD.encode(&preview_stdout);
    let data_uri = format!("data:image/webp;base64,{}", b64_image);

    let total_ms = total_started.elapsed().as_millis();

    println!(
        "[preview-in-memory] op={} render={}ms total={}ms source={}",
        request.operation, render_ms, total_ms, source
    );
    println!(
        "[preview-in-memory] cmd: magick {}",
        preview_cli_args.join(" ")
    );

    Ok(GeneratePreviewResponse {
        preview_data_uri: data_uri,
        total_ms: total_ms.min(u128::from(u32::MAX)) as u32,
        render_ms: render_ms.min(u128::from(u32::MAX)) as u32,
    })
}

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
    if request.input_path.trim().is_empty() {
        return Err("Input path is required".into());
    }
    if request.output_path.trim().is_empty() {
        return Err("Output path is required".into());
    }

    run_single_internal(&app, &request.input_path, &request.output_path, &request.args).await
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchItem {
    pub input_path: String,
    pub output_path: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunBatchRequest {
    pub items: Vec<BatchItem>,
    pub args: Vec<String>,
    pub workers: u32,
    pub stop_on_error: bool,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BatchProgressEvent {
    pub index: usize,
    pub status: String,
    pub message: Option<String>,
    pub output_path: Option<String>,
}

#[tauri::command]
pub async fn cancel_batch(state: tauri::State<'_, crate::AppState>) -> Result<(), String> {
    let mut token_lock = state.batch_cancel_token.lock().map_err(|e| e.to_string())?;
    if let Some(token) = token_lock.take() {
        token.cancel();
    }
    Ok(())
}

#[tauri::command]
pub async fn run_batch(
    app: tauri::AppHandle,
    state: tauri::State<'_, crate::AppState>,
    request: RunBatchRequest,
) -> Result<(), String> {
    use std::sync::Arc;
    use tokio::sync::Semaphore;
    use tokio_util::sync::CancellationToken;

    let token = CancellationToken::new();
    {
        let mut token_lock = state.batch_cancel_token.lock().map_err(|e| e.to_string())?;
        *token_lock = Some(token.clone());
    }

    let workers = request.workers.clamp(1, 32);
    let semaphore = Arc::new(Semaphore::new(workers as usize));
    let args = Arc::new(request.args);
    let items = request.items;
    let stop_on_error = request.stop_on_error;

    let mut handles = Vec::new();

    for (index, item) in items.into_iter().enumerate() {
        if token.is_cancelled() {
            break;
        }

        let permit = semaphore.clone().acquire_owned().await.map_err(|e| e.to_string())?;
        let app_h = app.clone();
        let args_h = args.clone();
        let token_h = token.clone();

        let handle = tokio::spawn(async move {
            let _permit = permit;
            if token_h.is_cancelled() {
                return None;
            }

            let res = run_single_internal(&app_h, &item.input_path, &item.output_path, &args_h).await;

            let event = match res {
                Ok(resp) => BatchProgressEvent {
                    index,
                    status: "success".into(),
                    message: None,
                    output_path: Some(resp.output_path),
                },
                Err(e) => BatchProgressEvent {
                    index,
                    status: "error".into(),
                    message: Some(e),
                    output_path: None,
                },
            };

            let _ = app_h.emit("batch-progress", event.clone());
            Some(event)
        });

        handles.push(handle);
    }

    for handle in handles {
        if let Ok(Some(event)) = handle.await {
            if stop_on_error && event.status == "error" {
                let mut token_lock = state.batch_cancel_token.lock().map_err(|e| e.to_string())?;
                if let Some(token) = token_lock.take() {
                    token.cancel();
                }
            }
        }
    }

    let mut token_lock = state.batch_cancel_token.lock().map_err(|e| e.to_string())?;
    *token_lock = None;

    Ok(())
}

#[tauri::command]
pub async fn run_batch_dry_run(
    app: tauri::AppHandle,
    request: RunBatchRequest,
) -> Result<(), String> {
    use std::sync::Arc;
    use tokio::sync::Semaphore;

    let workers = request.workers.clamp(1, 32);
    let semaphore = Arc::new(Semaphore::new(workers as usize));
    let args = Arc::new(request.args);
    let items = request.items;

    let mut handles = Vec::new();

    for (index, item) in items.into_iter().enumerate() {
        let permit = semaphore
            .clone()
            .acquire_owned()
            .await
            .map_err(|e| e.to_string())?;
        let app_h = app.clone();
        let args_h = args.clone();

        let handle = tokio::spawn(async move {
            let _permit = permit;

            let res = dry_run_single_internal(&app_h, &item.input_path, &args_h).await;

            let event = match res {
                Ok(_) => BatchProgressEvent {
                    index,
                    status: "success".into(),
                    message: None,
                    output_path: None,
                },
                Err(e) => BatchProgressEvent {
                    index,
                    status: "error".into(),
                    message: Some(e),
                    output_path: None,
                },
            };

            let _ = app_h.emit("batch-dry-run-progress", event.clone());
            event
        });

        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.await;
    }

    Ok(())
}

async fn dry_run_single_internal(
    app: &tauri::AppHandle,
    input_path: &str,
    args: &[String],
) -> Result<(), String> {
    let source = get_magick_source();
    let mut command = create_magick_command(app, source)?.arg(input_path);

    for arg in args {
        command = command.arg(arg);
    }

    let run_output = command
        .arg("info:")
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !run_output.status.success() {
        let stderr = String::from_utf8_lossy(&run_output.stderr)
            .trim()
            .to_string();
        if !stderr.is_empty() {
            return Err(stderr);
        }
        return Err("Dry run failed".into());
    }

    Ok(())
}

async fn run_single_internal(
    app: &tauri::AppHandle,
    input_path: &str,
    output_path: &str,
    args: &[String],
) -> Result<RunSingleResponse, String> {
    use std::fs;
    use std::path::Path;

    let output_parent = Path::new(output_path)
        .parent()
        .ok_or_else(|| "Invalid output path".to_string())?;
    fs::create_dir_all(output_parent).map_err(|e| e.to_string())?;

    let source = get_magick_source();
    let mut command = create_magick_command(app, source)?.arg(input_path);

    for arg in args {
        command = command.arg(arg);
    }

    let run_cli_display = std::iter::once(format_cli_token_for_log(input_path))
        .chain(args.iter().map(|a| format_cli_token_for_log(a.as_str())))
        .chain(std::iter::once(format_cli_token_for_log(output_path)))
        .collect::<Vec<_>>()
        .join(" ");
    println!("[magick] {}", run_cli_display);

    let run_output = command
        .arg(output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !run_output.status.success() {
        let stderr = String::from_utf8_lossy(&run_output.stderr)
            .trim()
            .to_string();
        eprintln!("[magick] failed: {}", run_cli_display);
        if !stderr.is_empty() {
            eprintln!("[magick] stderr: {}", stderr);
            return Err(stderr);
        }
        return Err("ImageMagick failed to run command".into());
    }

    let identify_output = create_magick_command(app, source)?
        .arg("identify")
        .arg("-format")
        .arg("%w|%h")
        .arg(output_path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !identify_output.status.success() {
        let stderr = String::from_utf8_lossy(&identify_output.stderr)
            .trim()
            .to_string();
        return Err(if stderr.is_empty() {
            "Failed to inspect output image".into()
        } else {
            stderr
        });
    }

    let raw_dims = String::from_utf8_lossy(&identify_output.stdout)
        .trim()
        .to_string();
    let parts: Vec<&str> = raw_dims.split('|').collect();
    if parts.len() != 2 {
        return Err("Failed to parse output dimensions".into());
    }

    Ok(RunSingleResponse {
        output_path: output_path.to_string(),
        width: parts[0].parse::<u32>().map_err(|e| e.to_string())?,
        height: parts[1].parse::<u32>().map_err(|e| e.to_string())?,
    })
}