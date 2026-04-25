import { useState, useEffect } from 'react';
import { getName, getVersion, getTauriVersion } from '@tauri-apps/api/app';

export interface AppInfo {
  name: string;
  version: string;
  tauriVersion: string;
}

export function useAppInfo() {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    name: 'liquid-image',
    version: '0.1.0',
    tauriVersion: '...'
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchAppInfo = async () => {
      try {
        const [name, version, tauriVersion] = await Promise.all([
          getName(),
          getVersion(),
          getTauriVersion()
        ]);
        
        if (isMounted) {
          setAppInfo({ name, version, tauriVersion });
        }
      } catch (error) {
        console.error('Failed to fetch app info:', error);
      }
    };

    fetchAppInfo();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return appInfo;
}
