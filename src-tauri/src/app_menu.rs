//! Native application menu (macOS menubar only for this app).

use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

pub fn setup_native_menubar(app: &tauri::AppHandle) -> tauri::Result<()> {
    // 1. App Submenu (macOS specific)
    let app_submenu = SubmenuBuilder::new(app, "Liquid Image")
        .about(None)
        .separator()
        .item(
            &MenuItemBuilder::with_id("app.settings", "Settings…")
                .accelerator("CmdOrCtrl+,")
                .build(app)?,
        )
        .separator()
        .services(None)
        .separator()
        .hide(None)
        .hide_others(None)
        .show_all(None)
        .separator()
        .quit(None)
        .build()?;

    // 2. File Submenu
    let file_submenu = SubmenuBuilder::new(app, "File")
        .item(
            &MenuItemBuilder::with_id("file.open_image", "Open Image…")
                .accelerator("CmdOrCtrl+O")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("file.open_folder", "Open Folder…")
                .accelerator("CmdOrCtrl+Shift+O")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("file.close_file", "Close File")
                .accelerator("CmdOrCtrl+W")
                .build(app)?,
        )
        .build()?;

    // 3. Edit Submenu (Native macOS text editing)
    let edit_submenu = SubmenuBuilder::new(app, "Edit")
        .undo(None)
        .redo(None)
        .separator()
        .cut(None)
        .copy(None)
        .paste(None)
        .select_all(None)
        .build()?;

    // 4. Mode Submenu
    let mode_submenu = SubmenuBuilder::new(app, "Mode")
        .item(
            &MenuItemBuilder::with_id("mode.single", "Single File")
                .accelerator("CmdOrCtrl+1")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("mode.batch", "Batch")
                .accelerator("CmdOrCtrl+2")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("mode.viewer", "Quick Viewer")
                .accelerator("CmdOrCtrl+3")
                .build(app)?,
        )
        .build()?;

    // 5. Run Submenu
    let run_submenu = SubmenuBuilder::new(app, "Run")
        .item(
            &MenuItemBuilder::with_id("run.start", "Run")
                .accelerator("CmdOrCtrl+R")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("run.dry_run", "Dry Run (First File)")
                .accelerator("CmdOrCtrl+Shift+R")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("run.stop", "Stop")
                .accelerator("CmdOrCtrl+.")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("run.toggle_preview", "Show Live Preview")
                .accelerator("CmdOrCtrl+P")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("run.copy_cli", "Copy CLI Command")
                .accelerator("CmdOrCtrl+Shift+C")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("run.open_output_folder", "Open Output Folder")
                .accelerator("CmdOrCtrl+Shift+F")
                .build(app)?,
        )
        .build()?;

    // 6. Presets Submenu
    let presets_submenu = SubmenuBuilder::new(app, "Presets")
        .item(
            &MenuItemBuilder::with_id("presets.save", "Save Preset…")
                .accelerator("CmdOrCtrl+S")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("presets.load", "Load Preset…")
                .accelerator("CmdOrCtrl+L")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("presets.quick_web", "Web Optimise (WEBP q80)")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("presets.quick_thumb", "Thumbnail 200px")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("presets.quick_bw", "B&W Film")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("presets.quick_watermark", "Watermark Logo")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("presets.manage", "Manage Presets…")
                .build(app)?,
        )
        .build()?;

    // 7. View Submenu
    let view_submenu = SubmenuBuilder::new(app, "View")
        .item(
            &MenuItemBuilder::with_id("view.toggle_cli_preview", "Show CLI Preview")
                .accelerator("CmdOrCtrl+`")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("view.toggle_metadata", "Show Metadata Bar")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("view.zoom_in", "Zoom In")
                .accelerator("CmdOrCtrl+Plus")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("view.zoom_out", "Zoom Out")
                .accelerator("CmdOrCtrl+-")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("view.zoom_reset", "Fit to Window")
                .accelerator("CmdOrCtrl+0")
                .build(app)?,
        )
        .build()?;

    // 8. Window Submenu (macOS standard)
    let window_submenu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .maximize()
        .separator()
        .fullscreen()
        .close_window()
        .build()?;

    let menu = MenuBuilder::new(app)
        .item(&app_submenu)
        .item(&file_submenu)
        .item(&edit_submenu)
        .item(&mode_submenu)
        .item(&run_submenu)
        .item(&presets_submenu)
        .item(&view_submenu)
        .item(&window_submenu)
        .build()?;

    app.set_menu(menu)?;
    Ok(())
}
