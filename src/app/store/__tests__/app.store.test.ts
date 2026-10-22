import { expect, it, describe, beforeEach, afterEach } from "bun:test";
import { useAppStore } from "../app.store";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { useBatchStore } from "@/features/batch/state/batch.store";

describe("AppStore", () => {
  const cleanupStores = () => {
    useAppStore.setState({
      mode: "single",
      openImageMenuRequestId: 0,
      isSettingsOpen: false,
    });
    useViewerStore.setState({
      currentImagePath: null,
      siblingImages: [],
      currentIndex: 0,
    });
    useSingleStore.setState({
      selectedFile: null,
      functionParams: {},
      functionParamsByFunction: {},
      cropFreeApplyReview: false,
    });
    useBatchStore.setState({
      queue: [],
      selectedFileId: null,
    });
  };

  beforeEach(() => {
    cleanupStores();
  });

  afterEach(() => {
    cleanupStores();
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

  describe("Mode switching image preservation", () => {
    it("should preserve image from viewer to single and reset edit history", async () => {
      const { useViewerStore } = await import("@/features/viewer/state/viewer.store");
      const { useSingleStore } = await import("@/features/single/state/single.store");

      useViewerStore.setState({ currentImagePath: "/photos/mountain.jpg" });
      useSingleStore.setState({
        selectedFile: "/old/file.jpg",
        functionParams: { brightness: 50 },
        functionParamsByFunction: { Contrast: { brightness: 50 } },
        cropFreeApplyReview: true,
      });

      useAppStore.setState({ mode: "viewer" });
      useAppStore.getState().setMode("single");

      expect(useAppStore.getState().mode).toBe("single");
      expect(useSingleStore.getState().selectedFile).toBe("/photos/mountain.jpg");
      // Edits / history must be reset ("không giữ lịch sự edit")
      expect(useSingleStore.getState().functionParams).toEqual({});
      expect(useSingleStore.getState().functionParamsByFunction).toEqual({});
      expect(useSingleStore.getState().cropFreeApplyReview).toBe(false);
      expect(useSingleStore.getState().runState.status).toBe("idle");
    });

    it("should preserve image from single to viewer", async () => {
      const { useViewerStore } = await import("@/features/viewer/state/viewer.store");
      const { useSingleStore } = await import("@/features/single/state/single.store");

      useSingleStore.setState({ selectedFile: "/photos/beach.png" });
      useViewerStore.setState({ currentImagePath: null });

      useAppStore.setState({ mode: "single" });
      useAppStore.getState().setMode("viewer");

      expect(useAppStore.getState().mode).toBe("viewer");
      expect(useViewerStore.getState().currentImagePath).toBe("/photos/beach.png");
    });

    it("should preserve image from single to batch", async () => {
      const { useSingleStore } = await import("@/features/single/state/single.store");
      const { useBatchStore } = await import("@/features/batch/state/batch.store");

      useSingleStore.setState({ selectedFile: "/photos/city.webp" });
      useBatchStore.setState({ queue: [], selectedFileId: null });

      useAppStore.setState({ mode: "single" });
      useAppStore.getState().setMode("batch");

      expect(useAppStore.getState().mode).toBe("batch");
      const batchQueue = useBatchStore.getState().queue;
      expect(batchQueue).toHaveLength(1);
      expect(batchQueue[0].path).toBe("/photos/city.webp");
      expect(useBatchStore.getState().selectedFileId).toBe(batchQueue[0].id);
    });

    it("should preserve image from batch to single and reset edit history", async () => {
      const { useBatchStore } = await import("@/features/batch/state/batch.store");
      const { useSingleStore } = await import("@/features/single/state/single.store");

      const item1 = { id: "item-1", path: "/photos/forest.jpg", fileName: "forest.jpg", status: "queued" as const };
      const item2 = { id: "item-2", path: "/photos/river.jpg", fileName: "river.jpg", status: "queued" as const };
      useBatchStore.setState({
        queue: [item1, item2],
        selectedFileId: "item-2",
      });
      useSingleStore.setState({
        selectedFile: null,
        functionParams: { contrast: 10 },
      });

      useAppStore.setState({ mode: "batch" });
      useAppStore.getState().setMode("single");

      expect(useAppStore.getState().mode).toBe("single");
      expect(useSingleStore.getState().selectedFile).toBe("/photos/river.jpg");
      expect(useSingleStore.getState().functionParams).toEqual({});
    });

    it("should preserve image from batch to viewer", async () => {
      const { useBatchStore } = await import("@/features/batch/state/batch.store");
      const { useViewerStore } = await import("@/features/viewer/state/viewer.store");

      const item = { id: "item-1", path: "/photos/lake.png", fileName: "lake.png", status: "queued" as const };
      useBatchStore.setState({
        queue: [item],
        selectedFileId: "item-1",
      });
      useViewerStore.setState({ currentImagePath: null });

      useAppStore.setState({ mode: "batch" });
      useAppStore.getState().setMode("viewer");

      expect(useAppStore.getState().mode).toBe("viewer");
      expect(useViewerStore.getState().currentImagePath).toBe("/photos/lake.png");
    });
  });
});
