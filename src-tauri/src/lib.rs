use std::sync::Mutex;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tokio_util::sync::CancellationToken;

#[cfg(all(desktop, target_os = "macos"))]
mod app_menu;

pub mod cli;
pub mod desktop_integration;
mod contracts;
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
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("[single-instance] launched with args: {:?}", args);
            let cli_args = cli::CliArgs::parse_from_args(args);
            let handle = app.clone();
            if cli_args.is_headless_convert() {
                tauri::async_runtime::spawn(async move {
                    let _ = cli::execute_headless_convert(handle, cli_args).await;
                });
            } else {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    if !cli_args.files.is_empty() {
                        let is_viewer = cli_args.is_viewer_mode();
                        let _ = window.emit(
                            "app:open-files",
                            serde_json::json!({
                                "files": cli_args.files,
                                "mode": if is_viewer { "viewer" } else { "studio" }
                            }),
                        );
                    }
                }
            }
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        // .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let initial_cli = cli::CliArgs::parse_from_args(std::env::args());

            // Load saved settings to initialize MagickSource
            if let Ok(store) = app.store("settings.json") {
                if let Some(val) = store.get("settings-storage") {
                    if let Some(path) = val
                        .get("state")
                        .and_then(|s| s.get("magickBinaryPath"))
                        .and_then(|p| p.as_str())
                    {
                        if !path.is_empty() {
                            println!("[magick] initializing with custom path: {path}");
                            magick::runner::set_magick_source(
                                magick::runner::MagickSource::Custom(path.to_string()),
                            );
                        }
                    }
                }
            }

            let source = magick::runner::get_magick_source();
            println!("[magick] using source: {source}");

            if initial_cli.is_headless_convert() {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let _ = cli::execute_headless_convert(handle.clone(), initial_cli).await;
                    handle.exit(0);
                });
                return Ok(());
            }

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

            if !initial_cli.files.is_empty() {
                let files = initial_cli.files.clone();
                let is_viewer = initial_cli.is_viewer_mode();
                let handle_clone = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(800)).await;
                    let _ = handle_clone.emit(
                        "app:open-files",
                        serde_json::json!({
                            "files": files,
                            "mode": if is_viewer { "viewer" } else { "studio" }
                        }),
                    );
                });
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
            let id = event.id().as_ref();
            let _ = app.emit(
                "app:menu-action",
                serde_json::json!({ "id": id }),
            );
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            menubar_uses_native,
            desktop_integration::check_context_menu_status,
            desktop_integration::register_context_menu,
            desktop_integration::unregister_context_menu,
            desktop_integration::check_dolphin_integration_status,
            desktop_integration::register_dolphin_servicemenu,
            desktop_integration::unregister_dolphin_servicemenu,
            magick::service::convert_image,
            magick::service::check_version,
            magick::service::get_image_metadata,
            magick::service::get_sibling_images,
            magick::service::create_image_proxy,
            magick::service::remove_proxy_file,
            magick::service::generate_preview,
            magick::service::run_single,
            magick::service::run_batch,
            magick::service::run_batch_dry_run,
            magick::service::cancel_batch,
            magick::service::list_magick_formats,
            magick::service::check_magick_path,
            magick::service::get_current_magick_source,
            magick::service::update_magick_source
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greet_should_return_formatted_hello_message() {
        let result = greet("World".to_string());
        assert_eq!(result, "Hello, World! You've been greeted from Rust!");
    }

    #[test]
    fn greet_should_handle_empty_name() {
        let result = greet("".to_string());
        assert_eq!(result, "Hello, ! You've been greeted from Rust!");
    }

    #[test]
    fn greet_should_handle_special_characters() {
        let result = greet("Rust 🦀".to_string());
        assert_eq!(result, "Hello, Rust 🦀! You've been greeted from Rust!");
    }

    #[test]
    fn menubar_uses_native_should_return_true_on_macos() {
        #[cfg(target_os = "macos")]
        assert!(menubar_uses_native());

        #[cfg(not(target_os = "macos"))]
        assert!(!menubar_uses_native());
    }

    #[test]
    fn app_state_should_initialize_with_none_token() {
        let state = AppState {
            batch_cancel_token: Mutex::new(None),
        };
        let token = state.batch_cancel_token.lock().unwrap();
        assert!(token.is_none());
    }

    #[test]
    fn app_state_should_store_and_retrieve_cancel_token() {
        let state = AppState {
            batch_cancel_token: Mutex::new(None),
        };
        let token = CancellationToken::new();
        {
            let mut guard = state.batch_cancel_token.lock().unwrap();
            *guard = Some(token.clone());
        }
        let guard = state.batch_cancel_token.lock().unwrap();
        assert!(guard.is_some());
    }
}
