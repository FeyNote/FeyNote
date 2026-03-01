import { app, BrowserWindow, ipcMain, net, protocol, shell } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import { startUpdateChecker } from './updateChecker';

if (require('electron-squirrel-startup')) app.quit();

declare const process: NodeJS.Process & { resourcesPath: string };

const isDev = process.env.NODE_ENV === 'development';
const WEBUI_URL = process.env.WEBUI_URL;
if (isDev && !WEBUI_URL) throw new Error('WEBUI_URL must be provided');

const RENDERER_HOST = 'desktop-vhost.feynote.com';
const PROTOCOL_SCHEME = 'feynote';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_SCHEME, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_SCHEME);
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

function getRendererDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'renderer');
  }
  return path.join(app.getAppPath(), 'renderer');
}

function handleProtocolUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `${PROTOCOL_SCHEME}:`) return;
    if (parsed.hostname !== 'auth') return;

    const code = parsed.searchParams.get('code');
    if (!code) return;

    mainWindow?.webContents.send('auth-code', code);
    mainWindow?.focus();
  } catch {
    // Ignore malformed URLs
  }
}

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

app.on('second-instance', (_event, argv) => {
  const protocolUrl = argv.find((arg) =>
    arg.startsWith(`${PROTOCOL_SCHEME}://`),
  );
  if (protocolUrl) {
    handleProtocolUrl(protocolUrl);
  }
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
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

  if (app.isPackaged) {
    startUpdateChecker(() => mainWindow);
  }

  const protocolArg = process.argv.find((arg) =>
    arg.startsWith(`${PROTOCOL_SCHEME}://`),
  );
  if (protocolArg) {
    handleProtocolUrl(protocolArg);
  }

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

app.setAppUserModelId('com.feynote.desktop');
