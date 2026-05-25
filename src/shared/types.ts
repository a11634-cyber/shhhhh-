export type FileNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
};

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'azure' | 'ollama' | 'custom';

export type AISettings = {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  includeActiveFile: boolean;
  includeSelectedCode: boolean;
  includeOpenTabs: boolean;
};

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  createdAt: string;
};

export type AISession = {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
};

export type TerminalSession = {
  id: string;
  title: string;
  shell: string;
  cwd: string;
};

export type DebugSession = {
  id: string;
  status: 'idle' | 'running' | 'stopped';
  output: string[];
  breakpoints: string[];
  currentLine?: number;
};

export type EditorTab = {
  id: string;
  path: string;
  name: string;
  content: string;
  saved: boolean;
  language: string;
};

export type AppSettings = {
  theme: 'dark' | 'light' | 'high-contrast';
  fontSize: number;
  tabSize: number;
  terminalShell: string;
  aiProvider: AIProvider;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
};
