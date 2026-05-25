"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAIHandlers = registerAIHandlers;
function buildPayload(provider, config, messages) {
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
            },
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
            },
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: messages.map((message) => `${message.role}: ${message.content}`).join('\n') }] }]
            })
        };
    }
    return {
        url: `${String(config.baseUrl || 'http://localhost:11434/v1')}/chat/completions`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: String(config.model || 'llama3.2'),
            messages,
            temperature,
            max_tokens: maxTokens
        })
    };
}
async function parseResponse(provider, response) {
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
function registerAIHandlers(ipcMain, store) {
    ipcMain.handle('ai:setConfig', (_event, config) => {
        store.set('aiConfig', config);
        return true;
    });
    ipcMain.handle('ai:getConfig', () => {
        const current = store.get('aiConfig') || {};
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
    ipcMain.handle('ai:testConnection', async (_event, config) => {
        const provider = config.provider || 'openai';
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
    ipcMain.handle('ai:sendMessage', async (_event, payload) => {
        const provider = payload.config.provider || 'openai';
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
        const sessions = (store.get('aiSessions') || {});
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
    ipcMain.handle('ai:loadSessions', async (_event, workspacePath) => {
        const sessions = (store.get('aiSessions') || {});
        return sessions[workspacePath] || { messages: [] };
    });
    ipcMain.handle('ai:saveSession', async (_event, workspacePath, session) => {
        const sessions = (store.get('aiSessions') || {});
        sessions[workspacePath] = session;
        store.set('aiSessions', sessions);
        return true;
    });
}
