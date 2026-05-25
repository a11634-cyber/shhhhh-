"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDebugHandlers = registerDebugHandlers;
const child_process_1 = require("child_process");
function registerDebugHandlers(ipcMain, store, mainWindow) {
    const session = {
        id: 'debug-main',
        status: 'idle',
        output: [],
        breakpoints: [],
        currentLine: undefined,
        child: null
    };
    ipcMain.handle('debug:start', async (_event, payload) => {
        if (session.child) {
            session.child.kill();
        }
        session.status = 'running';
        session.output = [`Starting ${payload.filePath}`];
        session.child = (0, child_process_1.spawn)(process.platform === 'win32' ? 'node.exe' : 'node', ['--inspect-brk', payload.filePath, ...(payload.args || [])], {
            cwd: store.get('workspacePath') || process.cwd()
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
