import { BrowserWindow, Menu } from 'electron';
import path from 'path';

export function createWindow(store: { get: (key: string) => unknown }) {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    void mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    const rendererPath = path.resolve(process.cwd(), 'dist', 'renderer', 'index.html');
    void mainWindow.loadFile(rendererPath);
  }

  const workspacePath = store.get('workspacePath');
  if (typeof workspacePath === 'string') {
    void mainWindow.webContents.send('workspace:changed', workspacePath);
  }

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  Menu.setApplicationMenu(null);
  return mainWindow;
}
