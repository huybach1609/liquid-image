import { useEffect, useState } from "react";

import { checkVersion } from "@/shared/tauri/commands";
import { normalizeTauriError } from "@/shared/tauri/errors";
import type { MagickVersionInfo } from "@/shared/types/common";

type UseMagickVersionState = {
  versionInfo: MagickVersionInfo | null;
  versionError: string | null;
  isLoading: boolean;
};

export function useMagickVersion(): UseMagickVersionState {
  const [versionInfo, setVersionInfo] = useState<MagickVersionInfo | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadVersion() {
      try {
        const info = await checkVersion();
        if (isMounted) {
          setVersionInfo(info);
          setVersionError(null);
        }
      } catch (error) {
        if (isMounted) {
          setVersionError(normalizeTauriError(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  return { versionInfo, versionError, isLoading };
}
