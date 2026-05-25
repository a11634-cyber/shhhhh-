"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTerminalHandlers = registerTerminalHandlers;
const pty = __importStar(require("node-pty"));
const os_1 = __importDefault(require("os"));
function registerTerminalHandlers(ipcMain, store, mainWindow) {
    const sessions = new Map();
    ipcMain.handle('terminal:create', async (_event, cwd, shell) => {
        const normalizedShell = shell || (process.platform === 'win32' ? 'powershell.exe' : 'bash');
        const terminalCwd = cwd || store.get('workspacePath') || os_1.default.homedir();
        const term = pty.spawn(normalizedShell, [], {
            name: 'xterm-color',
            cols: 120,
            rows: 30,
            cwd: terminalCwd,
            env: process.env
        });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        sessions.set(id, { pty: term, shell: normalizedShell, cwd: terminalCwd });
        term.onData((data) => {
            mainWindow.webContents.send('terminal:data', { id, data });
        });
        return { id, title: `Terminal ${sessions.size}`, shell: normalizedShell, cwd: terminalCwd };
    });
    ipcMain.handle('terminal:write', async (_event, id, data) => {
        const session = sessions.get(id);
        if (!session) {
            return false;
        }
        session.pty.write(data);
        return true;
    });
    ipcMain.handle('terminal:resize', async (_event, id, cols, rows) => {
        const session = sessions.get(id);
        if (!session) {
            return false;
        }
        session.pty.resize(cols, rows);
        return true;
    });
    ipcMain.handle('terminal:kill', async (_event, id) => {
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
