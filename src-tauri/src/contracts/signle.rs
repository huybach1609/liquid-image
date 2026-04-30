// src-tauri/src/contracts/single.rs
#![allow(dead_code)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn output_format_jpg_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&OutputFormat::Jpg).unwrap();
        assert_eq!(json, r#""jpg""#);
    }

    #[test]
    fn output_format_webp_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&OutputFormat::Webp).unwrap();
        assert_eq!(json, r#""webp""#);
    }

    #[test]
    fn output_format_heic_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&OutputFormat::Heic).unwrap();
        assert_eq!(json, r#""heic""#);
    }

    #[test]
    fn output_format_jpg_should_deserialize_from_snake_case() {
        let format: OutputFormat = serde_json::from_str(r#""jpg""#).unwrap();
        assert!(matches!(format, OutputFormat::Jpg));
    }

    #[test]
    fn output_format_png_should_deserialize_from_snake_case() {
        let format: OutputFormat = serde_json::from_str(r#""png""#).unwrap();
        assert!(matches!(format, OutputFormat::Png));
    }

    #[test]
    fn on_conflict_overwrite_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&OnConflict::Overwrite).unwrap();
        assert_eq!(json, r#""overwrite""#);
    }

    #[test]
    fn on_conflict_skip_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&OnConflict::Skip).unwrap();
        assert_eq!(json, r#""skip""#);
    }

    #[test]
    fn on_conflict_rename_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&OnConflict::Rename).unwrap();
        assert_eq!(json, r#""rename""#);
    }

    #[test]
    fn on_conflict_should_deserialize_from_snake_case() {
        let conflict: OnConflict = serde_json::from_str(r#""rename""#).unwrap();
        assert!(matches!(conflict, OnConflict::Rename));
    }

    #[test]
    fn resize_fit_contain_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&ResizeFit::Contain).unwrap();
        assert_eq!(json, r#""contain""#);
    }

    #[test]
    fn resize_fit_cover_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&ResizeFit::Cover).unwrap();
        assert_eq!(json, r#""cover""#);
    }

    #[test]
    fn resize_fit_fill_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&ResizeFit::Fill).unwrap();
        assert_eq!(json, r#""fill""#);
    }

    #[test]
    fn gravity_center_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&Gravity::Center).unwrap();
        assert_eq!(json, r#""center""#);
    }

    #[test]
    fn gravity_northeast_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&Gravity::Northeast).unwrap();
        assert_eq!(json, r#""northeast""#);
    }

    #[test]
    fn gravity_southwest_should_deserialize_from_snake_case() {
        let gravity: Gravity = serde_json::from_str(r#""southwest""#).unwrap();
        assert!(matches!(gravity, Gravity::Southwest));
    }

    #[test]
    fn mirror_axis_horizontal_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&MirrorAxis::Horizontal).unwrap();
        assert_eq!(json, r#""horizontal""#);
    }

    #[test]
    fn mirror_axis_vertical_should_serialize_to_snake_case() {
        let json = serde_json::to_string(&MirrorAxis::Vertical).unwrap();
        assert_eq!(json, r#""vertical""#);
    }

    #[test]
    fn operation_convert_should_serialize_with_tag_and_fields() {
        let op = Operation::Convert {
            format: OutputFormat::Webp,
            quality: Some(85),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"convert""#));
        assert!(json.contains(r#""format":"webp""#));
        assert!(json.contains(r#""quality":85"#));
    }

    #[test]
    fn operation_convert_with_none_quality_should_serialize() {
        let op = Operation::Convert {
            format: OutputFormat::Png,
            quality: None,
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"convert""#));
        assert!(json.contains(r#""format":"png""#));
    }

    #[test]
    fn operation_crop_should_serialize_with_all_fields() {
        let op = Operation::Crop {
            width: 800,
            height: 600,
            x: Some(10),
            y: Some(20),
            gravity: Some(Gravity::Northwest),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"crop""#));
        assert!(json.contains(r#""width":800"#));
        assert!(json.contains(r#""gravity":"northwest""#));
    }

    #[test]
    fn operation_crop_with_optional_fields_none_should_serialize() {
        let op = Operation::Crop {
            width: 100,
            height: 100,
            x: None,
            y: None,
            gravity: None,
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"crop""#));
    }

    #[test]
    fn operation_mirror_should_serialize_with_axis() {
        let op = Operation::Mirror {
            axis: MirrorAxis::Horizontal,
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"mirror""#));
        assert!(json.contains(r#""axis":"horizontal""#));
    }

    #[test]
    fn operation_blackwhite_with_threshold_should_serialize() {
        let op = Operation::BlackWhite {
            threshold: Some(128),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"black_white""#));
        assert!(json.contains(r#""threshold":128"#));
    }

    #[test]
    fn operation_normalize_color_should_serialize_without_fields() {
        let op = Operation::NormalizeColor;
        let json = serde_json::to_string(&op).unwrap();
        assert_eq!(json, r#"{"type":"normalize_color"}"#);
    }

    #[test]
    fn operation_vignette_should_serialize_with_optional_fields() {
        let op = Operation::Vignette {
            radius: Some(0.5),
            sigma: Some(1.0),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"vignette""#));
        assert!(json.contains(r#""radius":0.5"#));
    }

    #[test]
    fn operation_border_should_serialize_with_color() {
        let op = Operation::Border {
            size: 10,
            color: "#FF0000".to_string(),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"border""#));
        assert!(json.contains(r#""size":10"#));
        assert!(json.contains("\"color\":\"#FF0000\""));
    }

    #[test]
    fn operation_rotate_should_serialize_with_degrees() {
        let op = Operation::Rotate {
            degrees: 45.0,
            background: Some("black".to_string()),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"rotate""#));
        assert!(json.contains(r#""degrees":45"#));
    }

    #[test]
    fn operation_resize_should_serialize_with_fit() {
        let op = Operation::Resize {
            width: Some(1920),
            height: Some(1080),
            fit: Some(ResizeFit::Cover),
            keep_aspect: Some(true),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"resize""#));
        assert!(json.contains(r#""fit":"cover""#));
    }

    #[test]
    fn operation_textlogo_should_serialize_with_all_fields() {
        let op = Operation::TextLogo {
            text: "Hello".to_string(),
            font: Some("Arial".to_string()),
            size: Some(24),
            color: Some("white".to_string()),
            x: Some(100),
            y: Some(200),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"text_logo""#));
        assert!(json.contains(r#""text":"Hello""#));
        assert!(json.contains(r#""font":"Arial""#));
    }

    #[test]
    fn operation_compose_should_serialize_with_overlay() {
        let op = Operation::Compose {
            overlay_path: "/path/to/overlay.png".to_string(),
            gravity: Some(Gravity::Center),
            x: Some(50),
            y: Some(50),
            opacity: Some(0.7),
        };
        let json = serde_json::to_string(&op).unwrap();
        assert!(json.contains(r#""type":"compose""#));
        assert!(json.contains(r#""overlay_path""#));
    }

    #[test]
    fn operation_convert_should_deserialize_from_tagged_json() {
        let json = r#"{"type":"convert","format":"jpg","quality":90}"#;
        let op: Operation = serde_json::from_str(json).unwrap();
        match op {
            Operation::Convert { format, quality } => {
                assert!(matches!(format, OutputFormat::Jpg));
                assert_eq!(quality, Some(90));
            }
            _ => panic!("Expected Convert variant"),
        }
    }

    #[test]
    fn operation_normalize_color_should_deserialize_from_tagged_json() {
        let json = r#"{"type":"normalize_color"}"#;
        let op: Operation = serde_json::from_str(json).unwrap();
        assert!(matches!(op, Operation::NormalizeColor));
    }

    #[test]
    fn run_single_request_should_serialize_with_camel_case_fields() {
        let request = RunSingleRequest {
            request_id: "req-123".to_string(),
            input_path: "/path/to/input.jpg".to_string(),
            output_dir: "/output".to_string(),
            output_name: "output.png".to_string(),
            output_format: Some(OutputFormat::Png),
            on_conflict: OnConflict::Overwrite,
            operations: vec![Operation::NormalizeColor],
            dry_run: Some(false),
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains(r#""requestId":"req-123""#));
        assert!(json.contains(r#""inputPath""#));
        assert!(json.contains(r#""outputDir""#));
        assert!(json.contains(r#""outputName""#));
        assert!(json.contains(r#""outputFormat":"png""#));
        assert!(json.contains(r#""onConflict":"overwrite""#));
    }

    #[test]
    fn run_single_request_should_deserialize_from_camel_case_json() {
        let json = r#"{
            "requestId": "req-456",
            "inputPath": "/input.jpg",
            "outputDir": "/out",
            "outputName": "result.webp",
            "onConflict": "skip",
            "operations": [{"type":"convert","format":"webp","quality":80}]
        }"#;
        let request: RunSingleRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.request_id, "req-456");
        assert_eq!(request.input_path, "/input.jpg");
        assert!(matches!(request.on_conflict, OnConflict::Skip));
        assert_eq!(request.operations.len(), 1);
    }

    #[test]
    fn cli_preview_should_serialize_with_camel_case() {
        let preview = CliPreview {
            command: "magick".to_string(),
            args: vec!["input.jpg".to_string(), "-resize".to_string(), "800x600".to_string()],
            redacted_command: "magick input.jpg -resize 800x600".to_string(),
        };
        let json = serde_json::to_string(&preview).unwrap();
        assert!(json.contains(r#""command":"magick""#));
        assert!(json.contains(r#""redactedCommand""#));
    }

    #[test]
    fn run_single_response_should_serialize_with_camel_case() {
        let response = RunSingleResponse {
            request_id: "req-789".to_string(),
            job_id: "job-001".to_string(),
            output_path: "/output/result.png".to_string(),
            duration_ms: 1500,
            cli_preview: CliPreview {
                command: "magick".to_string(),
                args: vec![],
                redacted_command: "magick".to_string(),
            },
            warnings: vec!["Low resolution".to_string()],
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains(r#""requestId":"req-789""#));
        assert!(json.contains(r#""jobId":"job-001""#));
        assert!(json.contains(r#""durationMs":1500"#));
        assert!(json.contains(r#""cliPreview""#));
        assert!(json.contains(r#""warnings":["Low resolution"]"#));
    }

    #[test]
    fn run_single_response_should_deserialize_from_camel_case_json() {
        let json = r#"{
            "requestId": "req-abc",
            "jobId": "job-xyz",
            "outputPath": "/out.png",
            "durationMs": 2000,
            "cliPreview": {"command": "magick", "args": [], "redactedCommand": "magick"},
            "warnings": []
        }"#;
        let response: RunSingleResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.request_id, "req-abc");
        assert_eq!(response.duration_ms, 2000);
        assert!(response.warnings.is_empty());
    }
}