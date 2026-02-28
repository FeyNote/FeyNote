import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  net,
  protocol,
  shell,
} from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { pathToFileURL } from 'url';

declare const process: NodeJS.Process & { resourcesPath: string };

const isDev = process.env.NODE_ENV === 'development';
const WEBUI_URL = process.env.WEBUI_URL;
if (isDev && !WEBUI_URL) throw new Error('WEBUI_URL must be provided');

const RENDERER_HOST = 'desktop-vhost.feynote.com';

function getRendererDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'renderer');
  }
  return path.join(app.getAppPath(), 'renderer');
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
    titleBarStyle: 'default',
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'icons', 'feynote.png')
      : path.join(__dirname, '../../icons/feynote.png'),
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
    mainWindow.loadURL(`https://${RENDERER_HOST}/`);
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

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle(
  'fs-write-file',
  async (_event, filePath: string, content: string) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  },
);

ipcMain.handle(
  'fs-rename-file',
  async (_event, oldPath: string, newPath: string) => {
    try {
      await fs.rename(oldPath, newPath);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
  },
);

ipcMain.handle('fs-read-file', async (_event, filePath: string) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
});

app.whenReady().then(() => {
  const rendererDir = getRendererDir();

  protocol.handle('https', (req) => {
    const url = new URL(req.url);

    if (url.host !== RENDERER_HOST) {
      return net.fetch(req, { bypassCustomProtocolHandlers: true });
    }

    const filePath =
      url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const resolved = path.resolve(rendererDir, filePath);
    const relative = path.relative(rendererDir, resolved);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return new Response('Not Found', { status: 404 });
    }

    return net.fetch(pathToFileURL(resolved).toString());
  });

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
