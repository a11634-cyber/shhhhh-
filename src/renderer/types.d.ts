declare global {
  interface Window {
    electronAPI: {
      openFolder: () => Promise<string | null>;
      readDirectory: (path: string) => Promise<unknown>;
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<boolean>;
      createFile: (path: string, content: string) => Promise<boolean>;
      createDirectory: (path: string) => Promise<boolean>;
      rename: (oldPath: string, newPath: string) => Promise<boolean>;
      delete: (path: string) => Promise<boolean>;
      copy: (from: string, to: string) => Promise<boolean>;
      createTerminal: (cwd: string, shell: string) => Promise<unknown>;
      writeTerminal: (id: string, data: string) => Promise<boolean>;
      resizeTerminal: (id: string, cols: number, rows: number) => Promise<boolean>;
      killTerminal: (id: string) => Promise<boolean>;
      listTerminals: () => Promise<unknown>;
      gitStatus: (path: string) => Promise<unknown>;
      gitInit: (path: string) => Promise<boolean>;
      gitClone: (url: string, path: string) => Promise<boolean>;
      gitStage: (path: string, file: string) => Promise<boolean>;
      gitUnstage: (path: string, file: string) => Promise<boolean>;
      gitCommit: (path: string, message: string) => Promise<boolean>;
      gitPush: (path: string) => Promise<boolean>;
      gitPull: (path: string) => Promise<boolean>;
      gitBranches: (path: string) => Promise<unknown>;
      gitSwitchBranch: (path: string, branch: string) => Promise<boolean>;
      gitCreateBranch: (path: string, branch: string) => Promise<boolean>;
      gitDiff: (path: string, file: string) => Promise<string>;
      setAIConfig: (config: unknown) => Promise<boolean>;
      getAIConfig: () => Promise<unknown>;
      testAIConnection: (config: unknown) => Promise<boolean>;
      sendAIMessage: (payload: unknown) => Promise<string>;
      loadAISessions: (workspacePath: string) => Promise<unknown>;
      saveAISession: (workspacePath: string, session: unknown) => Promise<boolean>;
      debugStart: (payload: unknown) => Promise<unknown>;
      debugStop: () => Promise<unknown>;
      debugGet: () => Promise<unknown>;
      listExtensions: () => Promise<unknown>;
      installExtension: (id: string) => Promise<boolean>;
      getSettings: () => Promise<unknown>;
      saveSettings: (settings: unknown) => Promise<boolean>;
      onTerminalData: (callback: (payload: { id: string; data: string }) => void) => void;
      offTerminalData: (callback: (payload: { id: string; data: string }) => void) => void;
    };
  }
}

export {};
