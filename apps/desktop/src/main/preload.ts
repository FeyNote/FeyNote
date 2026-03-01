import { contextBridge, ipcRenderer } from 'electron';

const apiUrls = ipcRenderer.sendSync('get-api-urls');

const electronAPI = {
  getApiUrlsSync: () => apiUrls,
  onAuthCode: (callback: (code: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, code: string) =>
      callback(code);
    ipcRenderer.on('auth-code', listener);
    return () => {
      ipcRenderer.removeListener('auth-code', listener);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
