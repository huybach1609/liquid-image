/** Stable ids shared with Rust native menu (`MenuItemBuilder::with_id`). */
export const MENU_IDS = {
  FILE_OPEN_IMAGE: "file.open_image",
} as const;

export type MenuActionId = (typeof MENU_IDS)[keyof typeof MENU_IDS];
