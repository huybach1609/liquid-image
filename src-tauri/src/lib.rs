use tauri::menu::{AboutMetadata, MenuBuilder, SubmenuBuilder};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[path = "magick-service.rs"]
mod magick_service;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let about = AboutMetadata {
                comments: Some(magick_service::ABOUT_LINE.to_string()),
                ..Default::default()
            };

            let help_menu = SubmenuBuilder::new(app, "Help")
                .about(Some(about))
                .build()?;

            let menu = MenuBuilder::new(app).item(&help_menu).build()?;
            app.set_menu(menu)?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            magick_service::convert_image,
            magick_service::check_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
