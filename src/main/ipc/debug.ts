import { IpcMain, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

export function registerDebugHandlers(ipcMain: IpcMain, store: { get: (key: string) => unknown }, mainWindow?: BrowserWindow) {
  const session = {
    id: 'debug-main',
    status: 'idle' as 'idle' | 'running' | 'stopped',
    output: [] as string[],
    breakpoints: [] as string[],
    currentLine: undefined as number | undefined,
    child: null as ReturnType<typeof spawn> | null
  };

  ipcMain.handle('debug:start', async (_event, payload: { filePath: string; args?: string[] }) => {
    if (session.child) {
      session.child.kill();
    }

    session.status = 'running';
    session.output = [`Starting ${payload.filePath}`];
    session.child = spawn(process.platform === 'win32' ? 'node.exe' : 'node', ['--inspect-brk', payload.filePath, ...(payload.args || [])], {
      cwd: (store.get('workspacePath') as string) || process.cwd()
    });

    session.child.stdout?.on('data', (chunk) => {
      const text = chunk.toString();
      session.output.push(text);
      mainWindow?.webContents.send('debug:output', text);
    });

    session.child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      session.output.push(text);
      mainWindow?.webContents.send('debug:output', text);
    });

    session.child.on('exit', () => {
      session.status = 'stopped';
      mainWindow?.webContents.send('debug:stopped', true);
    });

    return session;
  });

  ipcMain.handle('debug:stop', () => {
    session.child?.kill();
    session.status = 'stopped';
    return session;
  });

  ipcMain.handle('debug:get', () => session);
}
