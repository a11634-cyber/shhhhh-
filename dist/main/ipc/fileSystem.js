"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFileSystemHandlers = registerFileSystemHandlers;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function readDirRecursive(dirPath) {
    const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
    const nodes = [];
    for (const entry of entries) {
        const fullPath = path_1.default.join(dirPath, entry.name);
        const isDirectory = entry.isDirectory();
        if (isDirectory) {
            nodes.push({
                name: entry.name,
                path: fullPath,
                isDirectory: true,
                children: await readDirRecursive(fullPath)
            });
        }
        else {
            nodes.push({
                name: entry.name,
                path: fullPath,
                isDirectory: false
            });
        }
    }
    return nodes;
}
function registerFileSystemHandlers(ipcMain, store) {
    ipcMain.handle('fs:readDirectory', async (_event, requestedPath) => {
        const workspacePath = typeof requestedPath === 'string' ? requestedPath : store.get('workspacePath');
        if (!workspacePath) {
            return [];
        }
        return readDirRecursive(workspacePath);
    });
    ipcMain.handle('fs:readFile', async (_event, filePath) => {
        return promises_1.default.readFile(filePath, 'utf-8');
    });
    ipcMain.handle('fs:writeFile', async (_event, filePath, content) => {
        await promises_1.default.writeFile(filePath, content, 'utf-8');
        return true;
    });
    ipcMain.handle('fs:createFile', async (_event, filePath, content) => {
        await promises_1.default.mkdir(path_1.default.dirname(filePath), { recursive: true });
        await promises_1.default.writeFile(filePath, content, 'utf-8');
        return true;
    });
    ipcMain.handle('fs:createDirectory', async (_event, dirPath) => {
        await promises_1.default.mkdir(dirPath, { recursive: true });
        return true;
    });
    ipcMain.handle('fs:rename', async (_event, oldPath, newPath) => {
        await promises_1.default.rename(oldPath, newPath);
        return true;
    });
    ipcMain.handle('fs:delete', async (_event, targetPath) => {
        const stat = await promises_1.default.stat(targetPath).catch(() => null);
        if (!stat) {
            return false;
        }
        if (stat.isDirectory()) {
            await promises_1.default.rm(targetPath, { recursive: true, force: true });
        }
        else {
            await promises_1.default.unlink(targetPath);
        }
        return true;
    });
    ipcMain.handle('fs:copy', async (_event, sourcePath, destinationPath) => {
        const stat = await promises_1.default.stat(sourcePath);
        if (stat.isDirectory()) {
            await promises_1.default.cp(sourcePath, destinationPath, { recursive: true });
        }
        else {
            await promises_1.default.copyFile(sourcePath, destinationPath);
        }
        return true;
    });
}
