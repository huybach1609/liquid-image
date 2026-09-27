import { create } from "zustand";
import { getSiblingImages, type SiblingImagesResult } from "@/shared/tauri/commands";

export type ViewerStoreState = {
  currentImagePath: string | null;
  siblingImages: string[];
  currentIndex: number;
  isLoadingSiblings: boolean;
  zoomLevel: number;
  rotation: number; // in degrees (0, 90, 180, 270)
  isHudVisible: boolean;
  panOffset: { x: number; y: number };

  imageDimensions: { width: number; height: number } | null;
  proxyUrl: string | null;

  // Actions
  openImage: (path: string) => Promise<void>;
  setCurrentImagePath: (path: string) => void;
  nextImage: () => void;
  prevImage: () => void;
  setIndex: (index: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  zoomAtPoint: (delta: number, clientX: number, clientY: number, containerRect: DOMRect) => void;
  setActualSize: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  resetView: () => void;
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setHudVisible: (visible: boolean) => void;
  setImageDimensions: (dims: { width: number; height: number } | null) => void;
  setProxyUrl: (url: string | null) => void;
};

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8.0;

export const useViewerStore = create<ViewerStoreState>((set, get) => ({
  currentImagePath: null,
  siblingImages: [],
  currentIndex: 0,
  isLoadingSiblings: false,
  zoomLevel: 1.0,
  rotation: 0,
  isHudVisible: true,
  panOffset: { x: 0, y: 0 },

  imageDimensions: null,
  proxyUrl: null,

  openImage: async (path: string) => {
    // Immediate UI feedback with current target file
    set({
      currentImagePath: path,
      zoomLevel: 1.0,
      rotation: 0,
      panOffset: { x: 0, y: 0 },
      imageDimensions: null,
      proxyUrl: null,
      isLoadingSiblings: true,
    });

    try {
      const result: SiblingImagesResult = await getSiblingImages(path);
      // Guard against race condition if user opened another image while fetching
      if (get().currentImagePath === path) {
        set({
          siblingImages: result.files,
          currentIndex: result.currentIndex,
          isLoadingSiblings: false,
        });
      }
    } catch (e) {
      console.error("[viewer.store] Failed to load sibling images", e);
      if (get().currentImagePath === path) {
        set({
          siblingImages: [path],
          currentIndex: 0,
          isLoadingSiblings: false,
        });
      }
    }
  },

  setCurrentImagePath: (path: string) => {
    const { siblingImages } = get();
    const idx = siblingImages.indexOf(path);
    set({
      currentImagePath: path,
      currentIndex: idx >= 0 ? idx : 0,
      zoomLevel: 1.0,
      rotation: 0,
      panOffset: { x: 0, y: 0 },
      imageDimensions: null,
      proxyUrl: null,
    });
  },

  nextImage: () => {
    const { siblingImages, currentIndex } = get();
    if (siblingImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % siblingImages.length;
    set({
      currentIndex: nextIdx,
      currentImagePath: siblingImages[nextIdx],
      zoomLevel: 1.0,
      rotation: 0,
      panOffset: { x: 0, y: 0 },
      imageDimensions: null,
      proxyUrl: null,
    });
  },

  prevImage: () => {
    const { siblingImages, currentIndex } = get();
    if (siblingImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + siblingImages.length) % siblingImages.length;
    set({
      currentIndex: prevIdx,
      currentImagePath: siblingImages[prevIdx],
      zoomLevel: 1.0,
      rotation: 0,
      panOffset: { x: 0, y: 0 },
      imageDimensions: null,
      proxyUrl: null,
    });
  },

  setIndex: (index: number) => {
    const { siblingImages } = get();
    if (index >= 0 && index < siblingImages.length) {
      set({
        currentIndex: index,
        currentImagePath: siblingImages[index],
        zoomLevel: 1.0,
        rotation: 0,
        panOffset: { x: 0, y: 0 },
        imageDimensions: null,
        proxyUrl: null,
      });
    }
  },

  zoomIn: () => {
    set((s) => ({
      zoomLevel: Math.min(MAX_ZOOM, parseFloat((s.zoomLevel + ZOOM_STEP).toFixed(2))),
    }));
  },

  zoomOut: () => {
    set((s) => {
      const next = Math.max(MIN_ZOOM, parseFloat((s.zoomLevel - ZOOM_STEP).toFixed(2)));
      return {
        zoomLevel: next,
        panOffset: next <= 1.0 ? { x: 0, y: 0 } : s.panOffset,
      };
    });
  },

  setZoom: (zoomLevel: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel));
    set((s) => ({
      zoomLevel: next,
      panOffset: next <= 1.0 ? { x: 0, y: 0 } : s.panOffset,
    }));
  },

  zoomAtPoint: (delta: number, clientX: number, clientY: number, containerRect: DOMRect) => {
    const s = get();
    const factor = delta > 0 ? 1.15 : 1 / 1.15;
    let nextZoom = parseFloat((s.zoomLevel * factor).toFixed(2));
    nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));

    // Snap to 1.0 if close enough when zooming out
    if (delta < 0 && Math.abs(nextZoom - 1.0) < 0.08) {
      nextZoom = 1.0;
    }

    if (nextZoom === s.zoomLevel) return;

    if (nextZoom <= 1.0) {
      set({ zoomLevel: nextZoom, panOffset: { x: 0, y: 0 } });
      return;
    }

    // Anchor calculation so the mouse cursor stays on the exact image pixel
    const cx = clientX - containerRect.left - containerRect.width / 2;
    const cy = clientY - containerRect.top - containerRect.height / 2;
    const scaleRatio = nextZoom / s.zoomLevel;
    const newOffsetX = cx - scaleRatio * (cx - s.panOffset.x);
    const newOffsetY = cy - scaleRatio * (cy - s.panOffset.y);

    set({
      zoomLevel: nextZoom,
      panOffset: { x: newOffsetX, y: newOffsetY },
    });
  },

  setActualSize: () => {
    set({
      zoomLevel: 1.0,
      panOffset: { x: 0, y: 0 },
    });
  },

  rotateCW: () => {
    set((s) => ({
      rotation: (s.rotation + 90) % 360,
    }));
  },

  rotateCCW: () => {
    set((s) => ({
      rotation: (s.rotation - 90 + 360) % 360,
    }));
  },

  resetView: () => {
    set({
      zoomLevel: 1.0,
      rotation: 0,
      panOffset: { x: 0, y: 0 },
    });
  },

  setPanOffset: (offset) => {
    set((s) => ({
      panOffset: typeof offset === "function" ? offset(s.panOffset) : offset,
    }));
  },

  setHudVisible: (isHudVisible: boolean) => {
    set({ isHudVisible });
  },

  setImageDimensions: (imageDimensions) => {
    set({ imageDimensions });
  },

  setProxyUrl: (proxyUrl) => {
    set({ proxyUrl });
  },
}));
