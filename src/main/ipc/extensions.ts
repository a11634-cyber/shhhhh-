import { IpcMain } from 'electron';

export function registerExtensionsHandlers(ipcMain: IpcMain, store: { get: (key: string) => unknown; set: (key: string, value: unknown) => void }) {
  ipcMain.handle('extensions:list', () => [
    {
      id: 'builtin.theme.dark',
      name: 'Dark Theme',
      version: '1.0.0',
      enabled: true,
      description: 'Built-in theme support.'
    },
    {
      id: 'builtin.languages.base',
      name: 'Base Language Support',
      version: '1.0.0',
      enabled: true,
      description: 'JSON, CSS, HTML, and TypeScript syntax support.'
    }
  ]);

  ipcMain.handle('extensions:install', async (_event, extensionId: string) => {
    const installed = ((store.get('extensions') as string[] | undefined) ?? []);
    store.set('extensions', [...installed, extensionId]);
    return true;
  });
}
