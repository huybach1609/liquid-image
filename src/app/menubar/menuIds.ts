/** Stable ids shared with Rust native menu (`MenuItemBuilder::with_id`). */
export const MENU_IDS = {
  // App
  APP_SETTINGS: "app.settings",

  // File
  FILE_OPEN_IMAGE: "file.open_image",
  FILE_OPEN_FOLDER: "file.open_folder",
  FILE_CLOSE_FILE: "file.close_file",

  // Mode
  MODE_SINGLE: "mode.single",
  MODE_BATCH: "mode.batch",
  MODE_VIEWER: "mode.viewer",

  // Run
  RUN_START: "run.start",
  RUN_DRY_RUN: "run.dry_run",
  RUN_STOP: "run.stop",
  RUN_TOGGLE_PREVIEW: "run.toggle_preview",
  RUN_COPY_CLI: "run.copy_cli",
  RUN_OPEN_OUTPUT_FOLDER: "run.open_output_folder",

  // Presets
  PRESETS_SAVE: "presets.save",
  PRESETS_LOAD: "presets.load",
  PRESETS_QUICK_WEB: "presets.quick_web",
  PRESETS_QUICK_THUMB: "presets.quick_thumb",
  PRESETS_QUICK_BW: "presets.quick_bw",
  PRESETS_QUICK_WATERMARK: "presets.quick_watermark",
  PRESETS_MANAGE: "presets.manage",

  // View
  VIEW_TOGGLE_CLI_PREVIEW: "view.toggle_cli_preview",
  VIEW_TOGGLE_METADATA: "view.toggle_metadata",
  VIEW_ZOOM_IN: "view.zoom_in",
  VIEW_ZOOM_OUT: "view.zoom_out",
  VIEW_ZOOM_RESET: "view.zoom_reset",
} as const;

export type MenuActionId = (typeof MENU_IDS)[keyof typeof MENU_IDS];
