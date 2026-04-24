//! Native application menu (macOS menubar only for this app).

use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::Emitter;

pub fn setup_native_menubar(app: &tauri::AppHandle) -> tauri::Result<()> {
    let open_image = MenuItemBuilder::with_id("file.open_image", "Open Image…")
        .accelerator("CmdOrCtrl+O")
        .build(app)?;

    let file_menu = SubmenuBuilder::new(app, "File").item(&open_image).build()?;

    let menu = MenuBuilder::new(app).item(&file_menu).build()?;

    app.set_menu(menu)?;
    Ok(())
}
