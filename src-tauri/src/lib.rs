use tauri::Emitter;
use tauri::Manager;

#[cfg(all(desktop, target_os = "macos"))]
mod app_menu;

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

#[path = "magick-service.rs"]
mod magick_service;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_decorations(false);

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
            magick_service::convert_image,
            magick_service::check_version,
            magick_service::get_image_metadata,
            magick_service::create_image_proxy,
            magick_service::remove_proxy_file,
            magick_service::generate_preview,
            magick_service::run_single
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
