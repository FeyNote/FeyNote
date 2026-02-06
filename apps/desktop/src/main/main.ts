import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';

declare const process: NodeJS.Process & { resourcesPath: string };

const isDev = process.env.NODE_ENV === 'development';
const WEBUI_URL = process.env.WEBUI_URL;
if (isDev && !WEBUI_URL) throw new Error('WEBUI_URL must be provided');

function getRendererPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'renderer', 'index.html');
  }
  return path.join(app.getAppPath(), 'renderer', 'index.html');
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'FeyNote',
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isDev && WEBUI_URL) {
    mainWindow.loadURL(WEBUI_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(getRendererPath());
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('get-api-urls', (event) => {
  event.returnValue = {
    rest: process.env.FEYNOTE_REST_URL || 'https://app.feynote.com/api',
    trpc: process.env.FEYNOTE_TRPC_URL || 'https://app.feynote.com/api/trpc',
    hocuspocus:
      process.env.FEYNOTE_HOCUSPOCUS_URL || 'wss://hocuspocus.feynote.com',
    websocket:
      process.env.FEYNOTE_WEBSOCKET_URL || 'wss://websocket.feynote.com',
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
