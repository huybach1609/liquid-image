import { describe, expect, it } from "bun:test";
import { compareSemver, checkForAppUpdate, GitHubRelease } from "../updateChecker";

describe("compareSemver", () => {
  it("should return 1 when v1 > v2", () => {
    expect(compareSemver("0.2.0", "0.1.0")).toBe(1);
    expect(compareSemver("1.0.0", "0.9.9")).toBe(1);
    expect(compareSemver("0.1.1", "0.1.0")).toBe(1);
  });

  it("should return -1 when v1 < v2", () => {
    expect(compareSemver("0.1.0", "0.2.0")).toBe(-1);
    expect(compareSemver("0.1.0", "0.1.1")).toBe(-1);
    expect(compareSemver("0.9.9", "1.0.0")).toBe(-1);
  });

  it("should return 0 when v1 === v2", () => {
    expect(compareSemver("0.1.0", "0.1.0")).toBe(0);
    expect(compareSemver("1.0.0", "1.0.0")).toBe(0);
  });

  it("should handle 'v' or 'V' prefixes and whitespace correctly", () => {
    expect(compareSemver("v0.2.0", "0.1.0")).toBe(1);
    expect(compareSemver("V1.0.0", "v1.0.0")).toBe(0);
    expect(compareSemver(" 0.1.0 ", "0.1.0")).toBe(0);
  });

  it("should handle pre-release tags according to SemVer rules", () => {
    // 0.2.0 is higher than 0.2.0-beta.1
    expect(compareSemver("0.2.0", "0.2.0-beta.1")).toBe(1);
    // 0.2.0-beta.1 is lower than 0.2.0
    expect(compareSemver("0.2.0-beta.1", "0.2.0")).toBe(-1);
    // beta.2 is higher than beta.1
    expect(compareSemver("0.2.0-beta.2", "0.2.0-beta.1")).toBe(1);
  });
});

describe("checkForAppUpdate", () => {
  const mockRelease: GitHubRelease = {
    tag_name: "v0.2.0",
    name: "Liquid Image v0.2.0",
    html_url: "https://github.com/huybach1609/liquid-image/releases/tag/v0.2.0",
    body: "### What's new\n- Fast image processing\n- New dark theme",
    published_at: "2026-09-27T10:00:00Z",
    prerelease: false,
  };

  it("should return 'update_available' when GitHub release has higher version", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify(mockRelease), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const result = await checkForAppUpdate("0.1.0", "huybach1609/liquid-image", mockFetch as any);

    expect(result.status).toBe("update_available");
    expect(result.currentVersion).toBe("0.1.0");
    expect(result.latestVersion).toBe("0.2.0");
    expect(result.releaseName).toBe("Liquid Image v0.2.0");
    expect(result.releaseUrl).toBe(mockRelease.html_url);
    expect(result.releaseNotes).toBe(mockRelease.body);
    expect(result.publishedAt).toBe(mockRelease.published_at);
  });

  it("should return 'up_to_date' when local version is equal or newer", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify(mockRelease), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    // Same version
    const resEqual = await checkForAppUpdate("0.2.0", "huybach1609/liquid-image", mockFetch as any);
    expect(resEqual.status).toBe("up_to_date");
    expect(resEqual.latestVersion).toBe("0.2.0");

    // Newer local version
    const resNewer = await checkForAppUpdate("0.3.0", "huybach1609/liquid-image", mockFetch as any);
    expect(resNewer.status).toBe("up_to_date");
  });

  it("should return 'no_releases' when GitHub returns 404", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

    const result = await checkForAppUpdate("0.1.0", "huybach1609/liquid-image", mockFetch as any);

    expect(result.status).toBe("no_releases");
    expect(result.errorMessage).toBe("No releases found on GitHub.");
  });

  it("should return 'error' when GitHub returns 403 rate limit", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

    const result = await checkForAppUpdate("0.1.0", "huybach1609/liquid-image", mockFetch as any);

    expect(result.status).toBe("error");
    expect(result.errorMessage).toContain("rate limit exceeded");
  });

  it("should return 'error' when network fails", async () => {
    const mockFetch = async () => {
      throw new Error("Network request failed");
    };

    const result = await checkForAppUpdate("0.1.0", "huybach1609/liquid-image", mockFetch as any);

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBe("Network request failed");
  });
});
