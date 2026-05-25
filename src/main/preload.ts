import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipcChannels';

const terminalListeners = new Set<(payload: { id: string; data: string }) => void>();

ipcRenderer.on('terminal:data', (_event, payload) => {
  terminalListeners.forEach((listener) => listener(payload));
});

const electronAPI = {
  openFolder: () => ipcRenderer.invoke(IPC_CHANNELS.FS_OPEN_FOLDER),
  readDirectory: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIRECTORY, path),
  readFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, path, content),
  createFile: (path: string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FILE, path, content),
  createDirectory: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_DIRECTORY, path),
  rename: (oldPath: string, newPath: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME, oldPath, newPath),
  delete: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE, path),
  copy: (from: string, to: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_COPY, from, to),
  createTerminal: (cwd: string, shell: string) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_CREATE, cwd, shell),
  writeTerminal: (id: string, data: string) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_WRITE, id, data),
  resizeTerminal: (id: string, cols: number, rows: number) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_RESIZE, id, cols, rows),
  killTerminal: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_KILL, id),
  listTerminals: () => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_LIST),
  gitStatus: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_STATUS, path),
  gitInit: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_INIT, path),
  gitClone: (url: string, path: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_CLONE, url, path),
  gitStage: (path: string, file: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_STAGE, path, file),
  gitUnstage: (path: string, file: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_UNSTAGE, path, file),
  gitCommit: (path: string, message: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_COMMIT, path, message),
  gitPush: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_PUSH, path),
  gitPull: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_PULL, path),
  gitBranches: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_BRANCHES, path),
  gitSwitchBranch: (path: string, branch: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_SWITCH_BRANCH, path, branch),
  gitCreateBranch: (path: string, branch: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_BRANCH, path, branch),
  gitDiff: (path: string, file: string) => ipcRenderer.invoke(IPC_CHANNELS.GIT_DIFF, path, file),
  setAIConfig: (config: unknown) => ipcRenderer.invoke(IPC_CHANNELS.AI_SET_CONFIG, config),
  getAIConfig: () => ipcRenderer.invoke(IPC_CHANNELS.AI_GET_CONFIG),
  testAIConnection: (config: unknown) => ipcRenderer.invoke(IPC_CHANNELS.AI_TEST_CONNECTION, config),
  sendAIMessage: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.AI_SEND_MESSAGE, payload),
  loadAISessions: (workspacePath: string) => ipcRenderer.invoke(IPC_CHANNELS.AI_LOAD_SESSIONS, workspacePath),
  saveAISession: (workspacePath: string, session: unknown) => ipcRenderer.invoke(IPC_CHANNELS.AI_SAVE_SESSION, workspacePath, session),
  debugStart: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.DEBUG_START, payload),
  debugStop: () => ipcRenderer.invoke(IPC_CHANNELS.DEBUG_STOP),
  debugGet: () => ipcRenderer.invoke(IPC_CHANNELS.DEBUG_GET),
  listExtensions: () => ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_LIST),
  installExtension: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_INSTALL, id),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_SETTINGS),
  saveSettings: (settings: unknown) => ipcRenderer.invoke(IPC_CHANNELS.APP_SAVE_SETTINGS, settings),
  onTerminalData: (callback: (payload: { id: string; data: string }) => void) => {
    terminalListeners.add(callback);
  },
  offTerminalData: (callback: (payload: { id: string; data: string }) => void) => {
    terminalListeners.delete(callback);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
