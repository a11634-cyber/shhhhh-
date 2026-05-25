import { IpcMain } from 'electron';
import simpleGit, { SimpleGit } from 'simple-git';

function createGitClient(repositoryPath: string): SimpleGit {
  return simpleGit({ baseDir: repositoryPath, binary: 'git' });
}

export function registerGitHandlers(ipcMain: IpcMain, store: { get: (key: string) => unknown }) {
  ipcMain.handle('git:status', async (_event, repositoryPath?: string) => {
    const repo = repositoryPath || (store.get('workspacePath') as string | undefined);
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

  ipcMain.handle('git:init', async (_event, repositoryPath: string) => {
    const git = createGitClient(repositoryPath);
    await git.init();
    return true;
  });

  ipcMain.handle('git:clone', async (_event, url: string, repositoryPath: string) => {
    const git = createGitClient(repositoryPath);
    await git.clone(url, repositoryPath);
    return true;
  });

  ipcMain.handle('git:stage', async (_event, repositoryPath: string, file: string) => {
    const git = createGitClient(repositoryPath);
    await git.add(file);
    return true;
  });

  ipcMain.handle('git:unstage', async (_event, repositoryPath: string, file: string) => {
    const git = createGitClient(repositoryPath);
    await git.reset(['--', file]);
    return true;
  });

  ipcMain.handle('git:commit', async (_event, repositoryPath: string, message: string) => {
    const git = createGitClient(repositoryPath);
    await git.commit(message);
    return true;
  });

  ipcMain.handle('git:push', async (_event, repositoryPath: string) => {
    const git = createGitClient(repositoryPath);
    await git.push();
    return true;
  });

  ipcMain.handle('git:pull', async (_event, repositoryPath: string) => {
    const git = createGitClient(repositoryPath);
    await git.pull();
    return true;
  });

  ipcMain.handle('git:branches', async (_event, repositoryPath: string) => {
    const git = createGitClient(repositoryPath);
    const branches = await git.branchLocal();
    return branches.all;
  });

  ipcMain.handle('git:switchBranch', async (_event, repositoryPath: string, branch: string) => {
    const git = createGitClient(repositoryPath);
    await git.checkout(branch);
    return true;
  });

  ipcMain.handle('git:createBranch', async (_event, repositoryPath: string, branch: string) => {
    const git = createGitClient(repositoryPath);
    await git.checkoutLocalBranch(branch);
    return true;
  });

  ipcMain.handle('git:diff', async (_event, repositoryPath: string, file: string) => {
    const git = createGitClient(repositoryPath);
    const diff = await git.diff(['--', file]);
    return diff;
  });
}
