export interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  body: string;
  published_at: string;
  prerelease: boolean;
}

export interface UpdateCheckResult {
  status: "up_to_date" | "update_available" | "no_releases" | "error";
  currentVersion: string;
  latestVersion?: string;
  releaseName?: string;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
  errorMessage?: string;
}

const GITHUB_REPO = "huybach1609/liquid-image";

/**
 * Compare two SemVer strings (e.g. "0.2.0" vs "0.1.0", "v1.0.0" vs "1.0.0").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  // Strip leading 'v' or 'V' and trim whitespace
  const cleanV1 = v1.trim().replace(/^v/i, "");
  const cleanV2 = v2.trim().replace(/^v/i, "");

  // Split off pre-release identifiers (e.g., "1.0.0-beta.1")
  const [core1, pre1] = cleanV1.split("-");
  const [core2, pre2] = cleanV2.split("-");

  const parts1 = core1.split(".").map((n) => parseInt(n, 10) || 0);
  const parts2 = core2.split(".").map((n) => parseInt(n, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  // If core versions are identical, standard SemVer specifies that
  // a version WITH a pre-release tag has lower precedence than one WITHOUT.
  if (pre1 && !pre2) return -1;
  if (!pre1 && pre2) return 1;
  if (pre1 && pre2) {
    if (pre1 > pre2) return 1;
    if (pre1 < pre2) return -1;
  }

  return 0;
}

/**
 * Check GitHub Releases for newer releases.
 * @param currentVersion Current app version (e.g. from package.json)
 * @param repo Optional repo name override ("owner/repo")
 * @param fetchFn Optional fetch implementation for testing
 */
export async function checkForAppUpdate(
  currentVersion: string,
  repo: string = GITHUB_REPO,
  fetchFn: typeof fetch = fetch
): Promise<UpdateCheckResult> {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;

  try {
    const res = await fetchFn(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (res.status === 404) {
      return {
        status: "no_releases",
        currentVersion,
        errorMessage: "No releases found on GitHub.",
      };
    }

    if (res.status === 403) {
      return {
        status: "error",
        currentVersion,
        errorMessage: "GitHub API rate limit exceeded. Please try again later.",
      };
    }

    if (!res.ok) {
      return {
        status: "error",
        currentVersion,
        errorMessage: `GitHub API error (HTTP ${res.status}): ${res.statusText}`,
      };
    }

    const release = (await res.json()) as GitHubRelease;
    const latestVersion = release.tag_name ? release.tag_name.replace(/^v/i, "") : "";

    if (!latestVersion) {
      return {
        status: "error",
        currentVersion,
        errorMessage: "Invalid release data received from GitHub.",
      };
    }

    const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;

    return {
      status: hasUpdate ? "update_available" : "up_to_date",
      currentVersion,
      latestVersion,
      releaseName: release.name || release.tag_name,
      releaseUrl: release.html_url,
      releaseNotes: release.body || "",
      publishedAt: release.published_at,
    };
  } catch (error) {
    return {
      status: "error",
      currentVersion,
      errorMessage:
        error instanceof Error ? error.message : "Failed to connect to update server.",
    };
  }
}
