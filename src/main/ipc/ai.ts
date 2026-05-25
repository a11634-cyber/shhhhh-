import { IpcMain, IpcMainInvokeEvent } from 'electron';
import { AIProvider } from '../../shared/types';

type AIRequest = {
  url: string;
  method: string;
  headers: HeadersInit;
  body: string;
};

type AIMsg = { role: string; content: string; createdAt?: string };

type AISessionRecord = { messages: AIMsg[] };

function buildPayload(provider: AIProvider, config: Record<string, unknown>, messages: AIMsg[]): AIRequest {
  const temperature = Number(config.temperature ?? 0.2);
  const maxTokens = Number(config.maxTokens ?? 800);

  if (provider === 'openai' || provider === 'custom' || provider === 'azure') {
    const baseUrl = String(config.baseUrl || 'https://api.openai.com/v1');
    const model = String(config.model || 'gpt-4o-mini');
    const endpoint = provider === 'azure'
      ? `${baseUrl}/openai/deployments/${model}/chat/completions?api-version=2024-02-01`
      : `${baseUrl}/chat/completions`;

    return {
      url: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${String(config.apiKey || '')}`
      } as HeadersInit,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    };
  }

  if (provider === 'anthropic') {
    return {
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': String(config.apiKey || ''),
        'anthropic-version': '2023-06-01'
      } as HeadersInit,
      body: JSON.stringify({
        model: String(config.model || 'claude-3-5-sonnet-20240620'),
        max_tokens: maxTokens,
        temperature,
        messages
      })
    };
  }

  if (provider === 'gemini') {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${String(config.model || 'gemini-1.5-pro')}:generateContent?key=${encodeURIComponent(String(config.apiKey || ''))}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' } as HeadersInit,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: messages.map((message) => `${message.role}: ${message.content}`).join('\n') }] }]
      })
    };
  }

  return {
    url: `${String(config.baseUrl || 'http://localhost:11434/v1')}/chat/completions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' } as HeadersInit,
    body: JSON.stringify({
      model: String(config.model || 'llama3.2'),
      messages,
      temperature,
      max_tokens: maxTokens
    })
  };
}

async function parseResponse(provider: AIProvider, response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || 'AI request failed');
  }

  if (provider === 'anthropic') {
    return data.content?.[0]?.text || 'No response';
  }

  if (provider === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  }

  return data.choices?.[0]?.message?.content || 'No response';
}

export function registerAIHandlers(ipcMain: IpcMain, store: { get: (key: string) => unknown; set: (key: string, value: unknown) => void }) {
  ipcMain.handle('ai:setConfig', (_event: IpcMainInvokeEvent, config: Record<string, unknown>) => {
    store.set('aiConfig', config);
    return true;
  });

  ipcMain.handle('ai:getConfig', () => {
    const current = (store.get('aiConfig') as Record<string, unknown>) || {};
    return {
      provider: current.provider || 'openai',
      apiKey: current.apiKey || '',
      model: current.model || 'gpt-4o-mini',
      baseUrl: current.baseUrl || 'https://api.openai.com/v1',
      temperature: Number(current.temperature ?? 0.2),
      maxTokens: Number(current.maxTokens ?? 800),
      includeActiveFile: Boolean(current.includeActiveFile),
      includeSelectedCode: Boolean(current.includeSelectedCode),
      includeOpenTabs: Boolean(current.includeOpenTabs)
    };
  });

  ipcMain.handle('ai:testConnection', async (_event: IpcMainInvokeEvent, config: Record<string, unknown>) => {
    const provider = (config.provider as AIProvider) || 'openai';
    const payload = buildPayload(provider, config, [{ role: 'user', content: 'Say hello in one short sentence.' }]);
    const response = await fetch(payload.url, {
      method: payload.method,
      headers: payload.headers,
      body: payload.body
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return true;
  });

  ipcMain.handle('ai:sendMessage', async (_event: IpcMainInvokeEvent, payload: { workspacePath: string; config: Record<string, unknown>; messages: AIMsg[]; context?: string }) => {
    const provider = (payload.config.provider as AIProvider) || 'openai';
    const contextualMessages = payload.context
      ? [...payload.messages.slice(0, -1), { role: 'user', content: `${payload.messages[payload.messages.length - 1]?.content || ''}\n\nContext:\n${payload.context}` }]
      : payload.messages;

    const request = buildPayload(provider, payload.config, contextualMessages);
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    const text = await parseResponse(provider, response);

    const sessions = ((store.get('aiSessions') as Record<string, unknown>) || {}) as Record<string, AISessionRecord>;
    const sessionKey = payload.workspacePath || 'global';
    const session = sessions[sessionKey] || { messages: [] };
    const nextMessages = [
      ...session.messages,
      ...payload.messages,
      { role: 'assistant', content: text, createdAt: new Date().toISOString() }
    ];
    sessions[sessionKey] = { messages: nextMessages };
    store.set('aiSessions', sessions);

    return text;
  });

  ipcMain.handle('ai:loadSessions', async (_event: IpcMainInvokeEvent, workspacePath: string) => {
    const sessions = ((store.get('aiSessions') as Record<string, unknown>) || {}) as Record<string, AISessionRecord>;
    return sessions[workspacePath] || { messages: [] };
  });

  ipcMain.handle('ai:saveSession', async (_event: IpcMainInvokeEvent, workspacePath: string, session: AISessionRecord) => {
    const sessions = ((store.get('aiSessions') as Record<string, unknown>) || {}) as Record<string, AISessionRecord>;
    sessions[workspacePath] = session;
    store.set('aiSessions', sessions);
    return true;
  });
}
