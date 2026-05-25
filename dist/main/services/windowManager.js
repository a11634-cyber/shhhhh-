"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindow = createWindow;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
function createWindow(store) {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path_1.default.join(__dirname, '../../assets/icon.png'),
        webPreferences: {
            preload: path_1.default.join(__dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
        void mainWindow.loadURL('http://127.0.0.1:5173');
    }
    else {
        const rendererPath = path_1.default.resolve(process.cwd(), 'dist', 'renderer', 'index.html');
        void mainWindow.loadFile(rendererPath);
    }
    const workspacePath = store.get('workspacePath');
    if (typeof workspacePath === 'string') {
        void mainWindow.webContents.send('workspace:changed', workspacePath);
    }
    mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    electron_1.Menu.setApplicationMenu(null);
    return mainWindow;
}
