"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipcChannels_1 = require("../shared/ipcChannels");
const terminalListeners = new Set();
electron_1.ipcRenderer.on('terminal:data', (_event, payload) => {
    terminalListeners.forEach((listener) => listener(payload));
});
const electronAPI = {
    openFolder: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_OPEN_FOLDER),
    readDirectory: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_READ_DIRECTORY, path),
    readFile: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_READ_FILE, path),
    writeFile: (path, content) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_WRITE_FILE, path, content),
    createFile: (path, content) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_CREATE_FILE, path, content),
    createDirectory: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_CREATE_DIRECTORY, path),
    rename: (oldPath, newPath) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_RENAME, oldPath, newPath),
    delete: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_DELETE, path),
    copy: (from, to) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.FS_COPY, from, to),
    createTerminal: (cwd, shell) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.TERMINAL_CREATE, cwd, shell),
    writeTerminal: (id, data) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.TERMINAL_WRITE, id, data),
    resizeTerminal: (id, cols, rows) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.TERMINAL_RESIZE, id, cols, rows),
    killTerminal: (id) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.TERMINAL_KILL, id),
    listTerminals: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.TERMINAL_LIST),
    gitStatus: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_STATUS, path),
    gitInit: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_INIT, path),
    gitClone: (url, path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_CLONE, url, path),
    gitStage: (path, file) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_STAGE, path, file),
    gitUnstage: (path, file) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_UNSTAGE, path, file),
    gitCommit: (path, message) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_COMMIT, path, message),
    gitPush: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_PUSH, path),
    gitPull: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_PULL, path),
    gitBranches: (path) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_BRANCHES, path),
    gitSwitchBranch: (path, branch) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_SWITCH_BRANCH, path, branch),
    gitCreateBranch: (path, branch) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_CREATE_BRANCH, path, branch),
    gitDiff: (path, file) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.GIT_DIFF, path, file),
    setAIConfig: (config) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.AI_SET_CONFIG, config),
    getAIConfig: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.AI_GET_CONFIG),
    testAIConnection: (config) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.AI_TEST_CONNECTION, config),
    sendAIMessage: (payload) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.AI_SEND_MESSAGE, payload),
    loadAISessions: (workspacePath) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.AI_LOAD_SESSIONS, workspacePath),
    saveAISession: (workspacePath, session) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.AI_SAVE_SESSION, workspacePath, session),
    debugStart: (payload) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.DEBUG_START, payload),
    debugStop: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.DEBUG_STOP),
    debugGet: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.DEBUG_GET),
    listExtensions: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.EXTENSIONS_LIST),
    installExtension: (id) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.EXTENSIONS_INSTALL, id),
    getSettings: () => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.APP_GET_SETTINGS),
    saveSettings: (settings) => electron_1.ipcRenderer.invoke(ipcChannels_1.IPC_CHANNELS.APP_SAVE_SETTINGS, settings),
    onTerminalData: (callback) => {
        terminalListeners.add(callback);
    },
    offTerminalData: (callback) => {
        terminalListeners.delete(callback);
    }
};
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
