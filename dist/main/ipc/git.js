"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGitHandlers = registerGitHandlers;
const simple_git_1 = __importDefault(require("simple-git"));
function createGitClient(repositoryPath) {
    return (0, simple_git_1.default)({ baseDir: repositoryPath, binary: 'git' });
}
function registerGitHandlers(ipcMain, store) {
    ipcMain.handle('git:status', async (_event, repositoryPath) => {
        const repo = repositoryPath || store.get('workspacePath');
        if (!repo) {
            return { branch: 'main', files: [], ahead: 0, behind: 0 };
        }
        const git = createGitClient(repo);
        const status = await git.status();
        const branch = await git.branch();
        const current = branch.current;
        return {
            branch: current,
            files: status.files,
            ahead: status.ahead,
            behind: status.behind
        };
    });
    ipcMain.handle('git:init', async (_event, repositoryPath) => {
        const git = createGitClient(repositoryPath);
        await git.init();
        return true;
    });
    ipcMain.handle('git:clone', async (_event, url, repositoryPath) => {
        const git = createGitClient(repositoryPath);
        await git.clone(url, repositoryPath);
        return true;
    });
    ipcMain.handle('git:stage', async (_event, repositoryPath, file) => {
        const git = createGitClient(repositoryPath);
        await git.add(file);
        return true;
    });
    ipcMain.handle('git:unstage', async (_event, repositoryPath, file) => {
        const git = createGitClient(repositoryPath);
        await git.reset(['--', file]);
        return true;
    });
    ipcMain.handle('git:commit', async (_event, repositoryPath, message) => {
        const git = createGitClient(repositoryPath);
        await git.commit(message);
        return true;
    });
    ipcMain.handle('git:push', async (_event, repositoryPath) => {
        const git = createGitClient(repositoryPath);
        await git.push();
        return true;
    });
    ipcMain.handle('git:pull', async (_event, repositoryPath) => {
        const git = createGitClient(repositoryPath);
        await git.pull();
        return true;
    });
    ipcMain.handle('git:branches', async (_event, repositoryPath) => {
        const git = createGitClient(repositoryPath);
        const branches = await git.branchLocal();
        return branches.all;
    });
    ipcMain.handle('git:switchBranch', async (_event, repositoryPath, branch) => {
        const git = createGitClient(repositoryPath);
        await git.checkout(branch);
        return true;
    });
    ipcMain.handle('git:createBranch', async (_event, repositoryPath, branch) => {
        const git = createGitClient(repositoryPath);
        await git.checkoutLocalBranch(branch);
        return true;
    });
    ipcMain.handle('git:diff', async (_event, repositoryPath, file) => {
        const git = createGitClient(repositoryPath);
        const diff = await git.diff(['--', file]);
        return diff;
    });
}
