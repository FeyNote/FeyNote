import { contextBridge, ipcRenderer } from 'electron';

const apiUrls = ipcRenderer.sendSync('get-api-urls');

const electronAPI = {
  getApiUrlsSync: () => apiUrls,
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('fs-write-file', filePath, content),
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('fs-rename-file', oldPath, newPath),
  readFile: (filePath: string) => ipcRenderer.invoke('fs-read-file', filePath),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
