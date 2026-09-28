import { beforeEach, describe, expect, it } from "bun:test";
import { useRecentFilesStore } from "../recentFiles.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";

describe("RecentFilesStore", () => {
  beforeEach(() => {
    useRecentFilesStore.setState({ recentFiles: [] });
    useSettingsStore.setState({ recentFilesLimit: 10 });
  });

  it("should have initial empty state", () => {
    expect(useRecentFilesStore.getState().recentFiles).toEqual([]);
  });

  it("should add a file to recent files", () => {
    useRecentFilesStore.getState().addRecentFile("/path/to/image1.jpg");
    expect(useRecentFilesStore.getState().recentFiles).toEqual(["/path/to/image1.jpg"]);
  });

  it("should place newest file at the front", () => {
    useRecentFilesStore.getState().addRecentFile("/path/to/first.jpg");
    useRecentFilesStore.getState().addRecentFile("/path/to/second.png");
    expect(useRecentFilesStore.getState().recentFiles).toEqual([
      "/path/to/second.png",
      "/path/to/first.jpg",
    ]);
  });

  it("should deduplicate and move re-added file to the front", () => {
    useRecentFilesStore.getState().addRecentFile("/path/to/imageA.jpg");
    useRecentFilesStore.getState().addRecentFile("/path/to/imageB.jpg");
    useRecentFilesStore.getState().addRecentFile("/path/to/imageC.jpg");
    expect(useRecentFilesStore.getState().recentFiles).toEqual([
      "/path/to/imageC.jpg",
      "/path/to/imageB.jpg",
      "/path/to/imageA.jpg",
    ]);

    useRecentFilesStore.getState().addRecentFile("/path/to/imageA.jpg");
    expect(useRecentFilesStore.getState().recentFiles).toEqual([
      "/path/to/imageA.jpg",
      "/path/to/imageC.jpg",
      "/path/to/imageB.jpg",
    ]);
  });

  it("should respect recentFilesLimit from settings store", () => {
    useSettingsStore.setState({ recentFilesLimit: 3 });

    useRecentFilesStore.getState().addRecentFile("/file1.png");
    useRecentFilesStore.getState().addRecentFile("/file2.png");
    useRecentFilesStore.getState().addRecentFile("/file3.png");
    useRecentFilesStore.getState().addRecentFile("/file4.png");

    const files = useRecentFilesStore.getState().recentFiles;
    expect(files.length).toBe(3);
    expect(files).toEqual(["/file4.png", "/file3.png", "/file2.png"]);
  });

  it("should ignore empty or whitespace-only paths", () => {
    useRecentFilesStore.getState().addRecentFile("");
    useRecentFilesStore.getState().addRecentFile("   ");
    expect(useRecentFilesStore.getState().recentFiles).toEqual([]);
  });

  it("should remove specific file", () => {
    useRecentFilesStore.getState().addRecentFile("/file1.png");
    useRecentFilesStore.getState().addRecentFile("/file2.png");
    useRecentFilesStore.getState().removeRecentFile("/file1.png");

    expect(useRecentFilesStore.getState().recentFiles).toEqual(["/file2.png"]);
  });

  it("should clear all recent files", () => {
    useRecentFilesStore.getState().addRecentFile("/file1.png");
    useRecentFilesStore.getState().addRecentFile("/file2.png");
    useRecentFilesStore.getState().clearRecentFiles();

    expect(useRecentFilesStore.getState().recentFiles).toEqual([]);
  });
});
