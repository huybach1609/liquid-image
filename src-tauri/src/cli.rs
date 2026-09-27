use clap::Parser;
use std::path::{Path, PathBuf};
use tauri_plugin_notification::NotificationExt;

#[derive(Parser, Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[command(
    name = "liquid-image",
    author,
    version,
    about = "Liquid Image - Desktop Image Processor",
    ignore_errors = true
)]
pub struct CliArgs {
    /// Files or directories to process or open
    #[arg(value_name = "FILES")]
    pub files: Vec<String>,

    /// Convert input files directly to specified format (e.g. webp, png, jpeg, avif)
    #[arg(short = 'c', long = "convert-to")]
    pub convert_to: Option<String>,

    /// Custom output directory for converted images
    #[arg(short = 'o', long = "output")]
    pub output: Option<String>,

    /// Force opening in GUI mode
    #[arg(long = "open")]
    pub open: bool,

    /// Open in Quick Viewer mode (lightweight, minimal viewer)
    #[arg(long = "view")]
    pub view: bool,

    /// Force opening in full Studio / Converter Editor mode
    #[arg(long = "studio")]
    pub studio: bool,

    /// Run in headless mode without showing the GUI
    #[arg(long = "headless")]
    pub headless: bool,
}

impl CliArgs {
    pub fn parse_from_args(args: impl IntoIterator<Item = String>) -> Self {
        match Self::try_parse_from(args) {
            Ok(cli) => cli,
            Err(_) => Self::default(),
        }
    }

    pub fn is_headless_convert(&self) -> bool {
        self.convert_to.is_some() && !self.open && !self.view && !self.studio && !self.files.is_empty()
    }

    /// Determines if the launch intent is Quick Viewer mode.
    /// Returns true if --view is explicitly passed, or if exactly 1 file is passed without --studio or --convert-to.
    pub fn is_viewer_mode(&self) -> bool {
        if self.studio || self.is_headless_convert() {
            return false;
        }
        if self.view {
            return true;
        }
        // If opened with a single file without explicit studio flag, default to viewer mode
        self.files.len() == 1
    }
}

/// Helper to compute destination path for a given input file and target format
pub fn compute_output_path(input_path: &str, format: &str, custom_output_dir: Option<&str>) -> PathBuf {
    let input = Path::new(input_path);
    let stem = input.file_stem().and_then(|s| s.to_str()).unwrap_or("image");
    let ext = format.trim_start_matches('.').to_lowercase();

    let target_dir = if let Some(dir) = custom_output_dir {
        PathBuf::from(dir)
    } else if let Some(parent) = input.parent() {
        parent.to_path_buf()
    } else {
        PathBuf::from(".")
    };

    let mut dest = target_dir.join(format!("{stem}.{ext}"));

    // If destination is identical to input (same directory & same extension), append _converted
    if let (Some(orig_ext), Some(input_canon), Ok(dest_canon)) = (
        input.extension().and_then(|e| e.to_str()),
        input.canonicalize().ok(),
        dest.canonicalize(),
    ) {
        if orig_ext.eq_ignore_ascii_case(&ext) && input_canon == dest_canon {
            dest = target_dir.join(format!("{stem}_converted.{ext}"));
        }
    }

    dest
}

/// Execute headless conversion directly in background
pub async fn execute_headless_convert(
    app: tauri::AppHandle,
    args: CliArgs,
) -> Result<(usize, usize), String> {
    let format = match &args.convert_to {
        Some(fmt) => fmt.clone(),
        None => return Err("No target format specified".into()),
    };

    let total = args.files.len();
    if total == 0 {
        return Ok((0, 0));
    }

    let mut success_count = 0usize;
    let mut fail_count = 0usize;

    for file in &args.files {
        let output_path = compute_output_path(file, &format, args.output.as_deref());
        let output_str = output_path.to_string_lossy().to_string();

        let magick_args: Vec<String> = Vec::new();
        match crate::magick::service::run_single_internal(
            &app,
            file,
            &output_str,
            &magick_args,
        )
        .await
        {
            Ok(_) => success_count += 1,
            Err(e) => {
                eprintln!("[cli-convert] Failed converting {file} -> {output_str}: {e}");
                fail_count += 1;
            }
        }
    }

    // Send OS desktop notification
    let title = "Liquid Image";
    let body = if fail_count == 0 {
        format!("Successfully converted {success_count} image(s) to {}", format.to_uppercase())
    } else {
        format!(
            "Converted {success_count}/{total} images to {}. ({fail_count} failed)",
            format.to_uppercase()
        )
    };

    let _ = app
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show();

    Ok((success_count, fail_count))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_convert_args() {
        let args = vec![
            "liquid-image".to_string(),
            "--headless".to_string(),
            "--convert-to".to_string(),
            "webp".to_string(),
            "photo1.png".to_string(),
            "photo2.jpg".to_string(),
        ];
        let parsed = CliArgs::parse_from_args(args);
        assert_eq!(parsed.convert_to, Some("webp".to_string()));
        assert!(parsed.headless);
        assert_eq!(parsed.files, vec!["photo1.png", "photo2.jpg"]);
        assert!(parsed.is_headless_convert());
    }

    #[test]
    fn test_parse_open_args() {
        let args = vec![
            "liquid-image".to_string(),
            "--open".to_string(),
            "photo.png".to_string(),
        ];
        let parsed = CliArgs::parse_from_args(args);
        assert!(parsed.open);
        assert_eq!(parsed.files, vec!["photo.png"]);
        assert!(!parsed.is_headless_convert());
    }

    #[test]
    fn test_parse_viewer_and_studio_args() {
        // Single file without studio flag should default to viewer mode
        let single_file = vec!["liquid-image".to_string(), "photo.png".to_string()];
        let parsed_single = CliArgs::parse_from_args(single_file);
        assert!(parsed_single.is_viewer_mode());

        // Single file with --studio flag should NOT be viewer mode
        let studio_arg = vec![
            "liquid-image".to_string(),
            "--studio".to_string(),
            "photo.png".to_string(),
        ];
        let parsed_studio = CliArgs::parse_from_args(studio_arg);
        assert!(!parsed_studio.is_viewer_mode());

        // Multiple files without --view flag should NOT be viewer mode
        let multi_files = vec![
            "liquid-image".to_string(),
            "photo1.png".to_string(),
            "photo2.png".to_string(),
        ];
        let parsed_multi = CliArgs::parse_from_args(multi_files);
        assert!(!parsed_multi.is_viewer_mode());

        // Explicit --view flag should be viewer mode
        let explicit_view = vec![
            "liquid-image".to_string(),
            "--view".to_string(),
            "photo.png".to_string(),
        ];
        let parsed_view = CliArgs::parse_from_args(explicit_view);
        assert!(parsed_view.is_viewer_mode());
    }

    #[test]
    fn test_compute_output_path() {
        let path = compute_output_path("/home/user/images/photo.png", "webp", None);
        assert_eq!(path, PathBuf::from("/home/user/images/photo.webp"));

        let path_custom = compute_output_path("/home/user/images/photo.png", "jpg", Some("/tmp/output"));
        assert_eq!(path_custom, PathBuf::from("/tmp/output/photo.jpg"));
    }
}
