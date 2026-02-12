import { contextBridge, ipcRenderer } from 'electron';

const apiUrls = ipcRenderer.sendSync('get-api-urls');

const electronAPI = {
  getApiUrlsSync: () => apiUrls,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
