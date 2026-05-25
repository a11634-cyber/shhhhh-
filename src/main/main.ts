import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { registerFileSystemHandlers } from './ipc/fileSystem';
import { registerTerminalHandlers } from './ipc/terminal';
import { registerGitHandlers } from './ipc/git';
import { registerAIHandlers } from './ipc/ai';
import { registerDebugHandlers } from './ipc/debug';
import { registerExtensionsHandlers } from './ipc/extensions';
import { createStore } from './services/store';
import { createWindow } from './services/windowManager';

app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(() => {
  const store = createStore();
  const mainWindow = createWindow(store);

  registerFileSystemHandlers(ipcMain, store);
  registerTerminalHandlers(ipcMain, store, mainWindow);
  registerGitHandlers(ipcMain, store);
  registerAIHandlers(ipcMain, store);
  registerDebugHandlers(ipcMain, store, mainWindow);
  registerExtensionsHandlers(ipcMain, store);

  ipcMain.handle('app:getSettings', () => store.get('settings') ?? {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    terminalShell: process.platform === 'win32' ? 'powershell.exe' : 'bash',
    aiProvider: 'openai',
    aiModel: 'gpt-4o-mini',
    aiTemperature: 0.2,
    aiMaxTokens: 1200
  });

  ipcMain.handle('app:saveSettings', (_event, settings) => {
    store.set('settings', settings);
    return true;
  });

  ipcMain.handle('fs:openFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (result.canceled) {
      return null;
    }
    store.set('workspacePath', result.filePaths[0]);
    return result.filePaths[0];
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(store);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
