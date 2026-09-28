import { expect, it, describe, beforeEach } from "bun:test";
import { useAppStore } from "../app.store";

describe("AppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      mode: "single",
      openImageMenuRequestId: 0,
      isSettingsOpen: false,
    });
  });

  it("should have correct initial state", () => {
    const state = useAppStore.getState();
    expect(state.mode).toBe("single");
    expect(state.isSettingsOpen).toBe(false);
  });

  it("should handle openSettings, closeSettings, and setIsSettingsOpen", () => {
    expect(useAppStore.getState().isSettingsOpen).toBe(false);

    useAppStore.getState().openSettings();
    expect(useAppStore.getState().isSettingsOpen).toBe(true);

    useAppStore.getState().closeSettings();
    expect(useAppStore.getState().isSettingsOpen).toBe(false);

    useAppStore.getState().setIsSettingsOpen(true);
    expect(useAppStore.getState().isSettingsOpen).toBe(true);

    useAppStore.getState().toggleSettings();
    expect(useAppStore.getState().isSettingsOpen).toBe(false);

    useAppStore.getState().toggleSettings();
    expect(useAppStore.getState().isSettingsOpen).toBe(true);
  });

  it("should reset openImageMenuRequestId when switching away from single mode", () => {
    useAppStore.getState().requestOpenImageFromMenu();
    expect(useAppStore.getState().openImageMenuRequestId).toBe(1);

    useAppStore.getState().setMode("batch");
    expect(useAppStore.getState().mode).toBe("batch");
    expect(useAppStore.getState().openImageMenuRequestId).toBe(0);
  });

  it("should handle requestRun, requestDryRun, requestStop, and requestOpenOutputFolder", () => {
    expect(useAppStore.getState().runRequestId).toBe(0);
    expect(useAppStore.getState().dryRunRequestId).toBe(0);
    expect(useAppStore.getState().stopRequestId).toBe(0);
    expect(useAppStore.getState().openOutputFolderRequestId).toBe(0);

    useAppStore.getState().requestRun();
    expect(useAppStore.getState().runRequestId).toBe(1);

    useAppStore.getState().requestDryRun();
    expect(useAppStore.getState().dryRunRequestId).toBe(1);

    useAppStore.getState().requestStop();
    expect(useAppStore.getState().stopRequestId).toBe(1);

    useAppStore.getState().requestOpenOutputFolder();
    expect(useAppStore.getState().openOutputFolderRequestId).toBe(1);

    // Switching mode resets request counters
    useAppStore.getState().setMode("single");
    expect(useAppStore.getState().runRequestId).toBe(0);
    expect(useAppStore.getState().dryRunRequestId).toBe(0);
    expect(useAppStore.getState().stopRequestId).toBe(0);
    expect(useAppStore.getState().openOutputFolderRequestId).toBe(0);
  });
});
