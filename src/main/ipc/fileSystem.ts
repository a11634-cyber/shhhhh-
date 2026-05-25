import { IpcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { FileNode } from '../../shared/types';

async function readDirRecursive(dirPath: string): Promise<FileNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const isDirectory = entry.isDirectory();
    if (isDirectory) {
      nodes.push({
        name: entry.name,
        path: fullPath,
        isDirectory: true,
        children: await readDirRecursive(fullPath)
      });
    } else {
      nodes.push({
        name: entry.name,
        path: fullPath,
        isDirectory: false
      });
    }
  }
  return nodes;
}

export function registerFileSystemHandlers(ipcMain: IpcMain, store: { get: (key: string) => unknown; set: (key: string, value: unknown) => void }) {
  ipcMain.handle('fs:readDirectory', async (_event, requestedPath?: string) => {
    const workspacePath = typeof requestedPath === 'string' ? requestedPath : (store.get('workspacePath') as string | undefined);
    if (!workspacePath) {
      return [];
    }
    return readDirRecursive(workspacePath);
  });

  ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
    return fs.readFile(filePath, 'utf-8');
  });

  ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  });

  ipcMain.handle('fs:createFile', async (_event, filePath: string, content: string) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  });

  ipcMain.handle('fs:createDirectory', async (_event, dirPath: string) => {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  });

  ipcMain.handle('fs:rename', async (_event, oldPath: string, newPath: string) => {
    await fs.rename(oldPath, newPath);
    return true;
  });

  ipcMain.handle('fs:delete', async (_event, targetPath: string) => {
    const stat = await fs.stat(targetPath).catch(() => null);
    if (!stat) {
      return false;
    }
    if (stat.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return true;
  });

  ipcMain.handle('fs:copy', async (_event, sourcePath: string, destinationPath: string) => {
    const stat = await fs.stat(sourcePath);
    if (stat.isDirectory()) {
      await fs.cp(sourcePath, destinationPath, { recursive: true });
    } else {
      await fs.copyFile(sourcePath, destinationPath);
    }
    return true;
  });
}
