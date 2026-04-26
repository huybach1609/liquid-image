use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tokio_util::sync::CancellationToken;
use std::sync::Mutex;

#[cfg(all(desktop, target_os = "macos"))]
mod app_menu;

mod magick;

pub struct AppState {
    pub batch_cancel_token: Mutex<Option<CancellationToken>>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// `true` when the host uses a native system menubar (macOS). Windows/Linux use in-window web menubar.
#[tauri::command]
fn menubar_uses_native() -> bool {
    cfg!(target_os = "macos")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            batch_cancel_token: Mutex::new(None),
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        // .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Load saved settings to initialize MagickSource
            if let Ok(store) = app.store("settings.json") {
                if let Some(val) = store.get("settings-storage") {
                    if let Some(path) = val.get("state").and_then(|s| s.get("magickBinaryPath")).and_then(|p| p.as_str()) {
                        if !path.is_empty() {
                            println!("[magick] initializing with custom path: {path}");
                            magick::runner::set_magick_source(magick::runner::MagickSource::Custom(path.to_string()));
                        }
                    }
                }
            }

            let source = magick::runner::get_magick_source();
            println!("[magick] using source: {source}");

            if let Some(window) = app.get_webview_window("main") {
                // Ensure window is visible and focused regardless of saved state
                let _ = window.set_decorations(false);
                // let _ = window.show();
                // let _ = window.set_focus();

                // For Linux/Wayland, setting the icon explicitly helps in dev mode.
                #[cfg(desktop)]
                {
                    let icon_bytes = include_bytes!("../icons/32x32.png");
                    if let Ok(image) = image::load_from_memory(icon_bytes) {
                        let rgba = image.to_rgba8();
                        let (width, height) = rgba.dimensions();
                        let icon = tauri::image::Image::new_owned(rgba.into_raw(), width, height);
                        let _ = window.set_icon(icon);
                    }
                }
            }

            #[cfg(all(desktop, target_os = "macos"))]
            {
                let _ = app_menu::setup_native_menubar(&app.handle());
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .on_menu_event(|app, event| {
            if event.id() == "file.open_image" {
                let _ = app.emit(
                    "app:menu-action",
                    serde_json::json!({ "id": "file.open_image" }),
                );
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            menubar_uses_native,
            magick::service::convert_image,
            magick::service::check_version,
            magick::service::get_image_metadata,
            magick::service::create_image_proxy,
            magick::service::remove_proxy_file,
            magick::service::generate_preview,
            magick::service::run_single,
            magick::service::run_batch,
            magick::service::run_batch_dry_run,
            magick::service::cancel_batch,
            magick::service::check_magick_path,
            magick::service::get_current_magick_source,
            magick::service::update_magick_source
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
