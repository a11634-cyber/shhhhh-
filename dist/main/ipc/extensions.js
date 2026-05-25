"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerExtensionsHandlers = registerExtensionsHandlers;
function registerExtensionsHandlers(ipcMain, store) {
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
    ipcMain.handle('extensions:install', async (_event, extensionId) => {
        const installed = (store.get('extensions') ?? []);
        store.set('extensions', [...installed, extensionId]);
        return true;
    });
}
