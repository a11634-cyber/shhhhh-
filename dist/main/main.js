"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fileSystem_1 = require("./ipc/fileSystem");
const terminal_1 = require("./ipc/terminal");
const git_1 = require("./ipc/git");
const ai_1 = require("./ipc/ai");
const debug_1 = require("./ipc/debug");
const extensions_1 = require("./ipc/extensions");
const store_1 = require("./services/store");
const windowManager_1 = require("./services/windowManager");
electron_1.app.commandLine.appendSwitch('disable-gpu');
electron_1.app.whenReady().then(() => {
    const store = (0, store_1.createStore)();
    const mainWindow = (0, windowManager_1.createWindow)(store);
    (0, fileSystem_1.registerFileSystemHandlers)(electron_1.ipcMain, store);
    (0, terminal_1.registerTerminalHandlers)(electron_1.ipcMain, store, mainWindow);
    (0, git_1.registerGitHandlers)(electron_1.ipcMain, store);
    (0, ai_1.registerAIHandlers)(electron_1.ipcMain, store);
    (0, debug_1.registerDebugHandlers)(electron_1.ipcMain, store, mainWindow);
    (0, extensions_1.registerExtensionsHandlers)(electron_1.ipcMain, store);
    electron_1.ipcMain.handle('app:getSettings', () => store.get('settings') ?? {
        theme: 'dark',
        fontSize: 14,
        tabSize: 2,
        terminalShell: process.platform === 'win32' ? 'powershell.exe' : 'bash',
        aiProvider: 'openai',
        aiModel: 'gpt-4o-mini',
        aiTemperature: 0.2,
        aiMaxTokens: 1200
    });
    electron_1.ipcMain.handle('app:saveSettings', (_event, settings) => {
        store.set('settings', settings);
        return true;
    });
    electron_1.ipcMain.handle('fs:openFolder', async () => {
        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        if (result.canceled) {
            return null;
        }
        store.set('workspacePath', result.filePaths[0]);
        return result.filePaths[0];
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            (0, windowManager_1.createWindow)(store);
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
