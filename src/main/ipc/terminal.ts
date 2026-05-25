import { IpcMain, BrowserWindow } from 'electron';
import * as pty from 'node-pty';
import os from 'os';

export function registerTerminalHandlers(ipcMain: IpcMain, store: { get: (key: string) => unknown }, mainWindow: BrowserWindow) {
  const sessions = new Map<string, { pty: pty.IPty; shell: string; cwd: string }>();

  ipcMain.handle('terminal:create', async (_event, cwd: string, shell?: string) => {
    const normalizedShell = shell || (process.platform === 'win32' ? 'powershell.exe' : 'bash');
    const terminalCwd = cwd || (store.get('workspacePath') as string) || os.homedir();
    const term = pty.spawn(normalizedShell, [], {
      name: 'xterm-color',
      cols: 120,
      rows: 30,
      cwd: terminalCwd,
      env: process.env as Record<string, string>
    });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessions.set(id, { pty: term, shell: normalizedShell, cwd: terminalCwd });

    term.onData((data) => {
      mainWindow.webContents.send('terminal:data', { id, data });
    });

    return { id, title: `Terminal ${sessions.size}`, shell: normalizedShell, cwd: terminalCwd };
  });

  ipcMain.handle('terminal:write', async (_event, id: string, data: string) => {
    const session = sessions.get(id);
    if (!session) {
      return false;
    }
    session.pty.write(data);
    return true;
  });

  ipcMain.handle('terminal:resize', async (_event, id: string, cols: number, rows: number) => {
    const session = sessions.get(id);
    if (!session) {
      return false;
    }
    session.pty.resize(cols, rows);
    return true;
  });

  ipcMain.handle('terminal:kill', async (_event, id: string) => {
    const session = sessions.get(id);
    if (!session) {
      return false;
    }
    session.pty.kill();
    sessions.delete(id);
    return true;
  });

  ipcMain.handle('terminal:list', async () => {
    return Array.from(sessions.entries()).map(([id, session]) => ({
      id,
      title: `Terminal ${id}`,
      shell: session.shell,
      cwd: session.cwd
    }));
  });
}
