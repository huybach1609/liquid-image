// src-tauri/src/contracts/single.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OutputFormat {
    Jpg,
    Png,
    Webp,
    Tiff,
    Bmp,
    Gif,
    Heic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OnConflict {
    Overwrite,
    Skip,
    Rename,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ResizeFit {
    Contain,
    Cover,
    Fill,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Gravity {
    Center,
    North,
    South,
    East,
    West,
    Northeast,
    Northwest,
    Southeast,
    Southwest,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Operation {
    Convert { format: OutputFormat, quality: Option<u8> },
    Crop { width: u32, height: u32, x: Option<i32>, y: Option<i32>, gravity: Option<Gravity> },
    Mirror { axis: MirrorAxis },
    BlackWhite { threshold: Option<u8> },
    Contrast { amount: i32 },
    NormalizeColor,
    Vignette { radius: Option<f32>, sigma: Option<f32> },
    Border { size: u32, color: String },
    Rotate { degrees: f32, background: Option<String> },
    Resize { width: Option<u32>, height: Option<u32>, fit: Option<ResizeFit>, keep_aspect: Option<bool> },
    TextLogo { text: String, font: Option<String>, size: Option<u32>, color: Option<String>, x: Option<i32>, y: Option<i32> },
    Compose { overlay_path: String, gravity: Option<Gravity>, x: Option<i32>, y: Option<i32>, opacity: Option<f32> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MirrorAxis {
    Horizontal,
    Vertical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunSingleRequest {
    pub request_id: String,
    pub input_path: String,
    pub output_dir: String,
    pub output_name: String,
    pub output_format: Option<OutputFormat>,
    pub on_conflict: OnConflict,
    pub operations: Vec<Operation>,
    pub dry_run: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CliPreview {
    pub command: String,
    pub args: Vec<String>,
    pub redacted_command: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunSingleResponse {
    pub request_id: String,
    pub job_id: String,
    pub output_path: String,
    pub duration_ms: u64,
    pub cli_preview: CliPreview,
    pub warnings: Vec<String>,
}