interface ApiUrls {
  rest: string;
  trpc: string;
  hocuspocus: string;
  websocket: string;
}

interface ElectronAPI {
  getApiUrlsSync: () => ApiUrls;
  onAuthCode: (callback: (code: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export type { ElectronAPI, ApiUrls };

export const getElectronAPI = (): ElectronAPI | undefined => {
  if (
    typeof window !== 'undefined' &&
    'electronAPI' in window &&
    typeof window.electronAPI?.getApiUrlsSync === 'function'
  ) {
    return window.electronAPI;
  }
  return undefined;
};
