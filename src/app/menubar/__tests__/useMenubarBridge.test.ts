import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { dispatchMenuAction } from "../useMenubarBridge";
import { MENU_IDS } from "../menuIds";
import { useAppStore } from "@/app/store/app.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { useViewerStore } from "@/features/viewer/state/viewer.store";

describe("useMenubarBridge - dispatchMenuAction", () => {
  beforeEach(() => {
    useAppStore.setState({
      mode: "single",
      isSettingsOpen: false,
      runRequestId: 0,
      dryRunRequestId: 0,
      stopRequestId: 0,
      openOutputFolderRequestId: 0,
      openImageMenuRequestId: 0,
    });
    useSettingsStore.setState({
      showCliPreview: true,
      showMetadata: true,
    });
    useSingleStore.setState({
      selectedFile: "/test/path.png",
      previewZoom: 100,
      isManualPreview: false,
    });
    useViewerStore.setState({
      currentImagePath: "/test/viewer.png",
      zoomLevel: 1.0,
    });
  });

  afterEach(() => {
    useViewerStore.setState({
      currentImagePath: null,
      zoomLevel: 1.0,
      rotation: 0,
      siblingImages: [],
      currentIndex: 0,
    });
    useSingleStore.setState({
      selectedFile: null,
      previewZoom: 100,
    });
  });

  it("should switch modes correctly", async () => {
    await dispatchMenuAction(MENU_IDS.MODE_BATCH);
    expect(useAppStore.getState().mode).toBe("batch");

    await dispatchMenuAction(MENU_IDS.MODE_VIEWER);
    expect(useAppStore.getState().mode).toBe("viewer");

    await dispatchMenuAction(MENU_IDS.MODE_SINGLE);
    expect(useAppStore.getState().mode).toBe("single");
  });

  it("should open settings dialog", async () => {
    expect(useAppStore.getState().isSettingsOpen).toBe(false);
    await dispatchMenuAction(MENU_IDS.APP_SETTINGS);
    expect(useAppStore.getState().isSettingsOpen).toBe(true);
  });

  it("should trigger run, dry run, and stop requests", async () => {
    await dispatchMenuAction(MENU_IDS.RUN_START);
    expect(useAppStore.getState().runRequestId).toBe(1);

    await dispatchMenuAction(MENU_IDS.RUN_DRY_RUN);
    expect(useAppStore.getState().dryRunRequestId).toBe(1);

    await dispatchMenuAction(MENU_IDS.RUN_STOP);
    expect(useAppStore.getState().stopRequestId).toBe(1);
  });

  it("should toggle CLI preview and metadata settings", async () => {
    expect(useSettingsStore.getState().showCliPreview).toBe(true);
    await dispatchMenuAction(MENU_IDS.VIEW_TOGGLE_CLI_PREVIEW);
    expect(useSettingsStore.getState().showCliPreview).toBe(false);

    expect(useSettingsStore.getState().showMetadata).toBe(true);
    await dispatchMenuAction(MENU_IDS.VIEW_TOGGLE_METADATA);
    expect(useSettingsStore.getState().showMetadata).toBe(false);
  });

  it("should handle zoom in, zoom out, and reset in single mode", async () => {
    useAppStore.setState({ mode: "single" });
    useSingleStore.setState({ previewZoom: 100 });

    await dispatchMenuAction(MENU_IDS.VIEW_ZOOM_IN);
    expect(useSingleStore.getState().previewZoom).toBe(125);

    await dispatchMenuAction(MENU_IDS.VIEW_ZOOM_OUT);
    expect(useSingleStore.getState().previewZoom).toBe(100);

    await dispatchMenuAction(MENU_IDS.VIEW_ZOOM_RESET);
    expect(useSingleStore.getState().previewZoom).toBe(100);
  });

  it("should handle close file action", async () => {
    useAppStore.setState({ mode: "single" });
    expect(useSingleStore.getState().selectedFile).toBe("/test/path.png");

    await dispatchMenuAction(MENU_IDS.FILE_CLOSE_FILE);
    expect(useSingleStore.getState().selectedFile).toBeNull();
  });
});
