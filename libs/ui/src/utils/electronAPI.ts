interface ApiUrls {
  rest: string;
  trpc: string;
  hocuspocus: string;
  websocket: string;
}

interface ElectronAPI {
  getApiUrlsSync: () => ApiUrls;
  selectDirectory: () => Promise<string | null>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  readFile: (filePath: string) => Promise<string | null>;
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
