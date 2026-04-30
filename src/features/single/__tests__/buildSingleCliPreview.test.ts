import { expect, it, describe } from "bun:test";
import { buildSingleCliPreview } from "../buildSingleCliPreview";

describe("buildSingleCliPreview", () => {
  it("should build a simple Convert command to PNG", () => {
    const result = buildSingleCliPreview({
      selectedFile: "input.jpg",
      selectedFunction: "Convert",
      functionParams: {
        outputFormat: "PNG",
        outputName: "output",
        outputDir: "./out",
        quality: 90,
        stripMetadata: true
      }
    });
    
    // magick "input.jpg" -quality 90 -define png:compression-level=9 -strip "./out/output.png"
    expect(result).toBe('magick "input.jpg" -quality 90 -define png:compression-level=9 -strip "./out/output.png"');
  });

  it("should build a Convert command to WebP", () => {
    const result = buildSingleCliPreview({
      selectedFile: "photo.png",
      selectedFunction: "Convert",
      functionParams: {
        outputFormat: "WebP",
        outputName: "photo_out",
        outputDir: "/tmp",
        webpMethod: 4
      }
    });
    
    // magick "photo.png" -define webp:method=4 "/tmp/photo_out.webp"
    expect(result).toBe('magick "photo.png" -define webp:method=4 "/tmp/photo_out.webp"');
  });

  it("should handle spaces in filenames by quoting", () => {
    const result = buildSingleCliPreview({
      selectedFile: "my photo.jpg",
      selectedFunction: "Convert",
      functionParams: {
        outputFormat: "png",
        outputName: "my output",
        outputDir: "./my out"
      }
    });
    
    expect(result).toBe('magick "my photo.jpg" -quality 85 -define png:compression-level=9 "./my out/my output.png"');
  });

  it("should handle JPEG/JPG extension mapping", () => {
    const result = buildSingleCliPreview({
      selectedFile: "input.png",
      selectedFunction: "Convert",
      functionParams: {
        outputFormat: "JPEG",
        outputName: "out",
        outputDir: "."
      }
    });
    
    expect(result).toContain("./out.jpg");
  });
});
