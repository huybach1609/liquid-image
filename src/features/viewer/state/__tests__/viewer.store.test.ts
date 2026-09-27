import { describe, expect, it } from "bun:test";
import { useViewerStore } from "../viewer.store";

describe("useViewerStore", () => {
  it("should have correct initial state", () => {
    const state = useViewerStore.getState();
    expect(state.currentImagePath).toBeNull();
    expect(state.siblingImages).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.zoomLevel).toBe(1.0);
    expect(state.rotation).toBe(0);
    expect(state.isHudVisible).toBe(true);
  });

  it("should navigate next and prev correctly", () => {
    useViewerStore.setState({
      siblingImages: ["/img1.jpg", "/img2.jpg", "/img3.jpg"],
      currentIndex: 0,
      currentImagePath: "/img1.jpg",
    });

    // Next
    useViewerStore.getState().nextImage();
    expect(useViewerStore.getState().currentIndex).toBe(1);
    expect(useViewerStore.getState().currentImagePath).toBe("/img2.jpg");

    // Next to last
    useViewerStore.getState().nextImage();
    expect(useViewerStore.getState().currentIndex).toBe(2);
    expect(useViewerStore.getState().currentImagePath).toBe("/img3.jpg");

    // Next wraps around to 0
    useViewerStore.getState().nextImage();
    expect(useViewerStore.getState().currentIndex).toBe(0);
    expect(useViewerStore.getState().currentImagePath).toBe("/img1.jpg");

    // Prev wraps around to last
    useViewerStore.getState().prevImage();
    expect(useViewerStore.getState().currentIndex).toBe(2);
    expect(useViewerStore.getState().currentImagePath).toBe("/img3.jpg");
  });

  it("should handle zoom in and zoom out boundaries", () => {
    useViewerStore.getState().resetView();
    expect(useViewerStore.getState().zoomLevel).toBe(1.0);

    useViewerStore.getState().zoomIn();
    expect(useViewerStore.getState().zoomLevel).toBe(1.25);

    useViewerStore.getState().zoomOut();
    expect(useViewerStore.getState().zoomLevel).toBe(1.0);

    useViewerStore.getState().setZoom(9.0);
    expect(useViewerStore.getState().zoomLevel).toBe(8.0); // clamped at MAX_ZOOM

    useViewerStore.getState().setZoom(0.01);
    expect(useViewerStore.getState().zoomLevel).toBe(0.1); // clamped at MIN_ZOOM
  });

  it("should handle rotateCW and rotateCCW", () => {
    useViewerStore.getState().resetView();
    expect(useViewerStore.getState().rotation).toBe(0);

    useViewerStore.getState().rotateCW();
    expect(useViewerStore.getState().rotation).toBe(90);

    useViewerStore.getState().rotateCW();
    expect(useViewerStore.getState().rotation).toBe(180);

    useViewerStore.getState().rotateCCW();
    expect(useViewerStore.getState().rotation).toBe(90);

    useViewerStore.getState().rotateCCW();
    expect(useViewerStore.getState().rotation).toBe(0);

    // Negative wrap around
    useViewerStore.getState().rotateCCW();
    expect(useViewerStore.getState().rotation).toBe(270);
  });

  it("should handle zoomAtPoint and setActualSize correctly", () => {
    useViewerStore.getState().resetView();
    expect(useViewerStore.getState().zoomLevel).toBe(1.0);
    expect(useViewerStore.getState().panOffset).toEqual({ x: 0, y: 0 });

    const mockRect = {
      left: 0,
      top: 0,
      width: 1000,
      height: 800,
      right: 1000,
      bottom: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect;

    // Zoom in at point (600, 450)
    useViewerStore.getState().zoomAtPoint(1, 600, 450, mockRect);
    expect(useViewerStore.getState().zoomLevel).toBeGreaterThan(1.0);
    // Pan offset should be adjusted
    expect(useViewerStore.getState().panOffset.x).not.toBe(0);

    // setActualSize resets zoom and pan
    useViewerStore.getState().setActualSize();
    expect(useViewerStore.getState().zoomLevel).toBe(1.0);
    expect(useViewerStore.getState().panOffset).toEqual({ x: 0, y: 0 });
  });

  it("should track image dimensions and proxyUrl", () => {
    useViewerStore.getState().setImageDimensions({ width: 1920, height: 1080 });
    expect(useViewerStore.getState().imageDimensions).toEqual({ width: 1920, height: 1080 });

    useViewerStore.getState().setProxyUrl("blob:test");
    expect(useViewerStore.getState().proxyUrl).toBe("blob:test");

    useViewerStore.getState().resetView();
  });

  it("should handle bgMode and cycleBgMode correctly", () => {
    useViewerStore.setState({ bgMode: "theme" });
    expect(useViewerStore.getState().bgMode).toBe("theme");

    useViewerStore.getState().cycleBgMode();
    expect(useViewerStore.getState().bgMode).toBe("dark");

    useViewerStore.getState().cycleBgMode();
    expect(useViewerStore.getState().bgMode).toBe("checker");

    useViewerStore.getState().cycleBgMode();
    expect(useViewerStore.getState().bgMode).toBe("theme");

    useViewerStore.getState().setBgMode("dark");
    expect(useViewerStore.getState().bgMode).toBe("dark");
  });
});

