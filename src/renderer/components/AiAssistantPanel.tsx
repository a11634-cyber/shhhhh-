import { useEffect, useMemo, useState } from 'react';
import { EditorTab } from '../../shared/types';

type Message = { role: 'user' | 'assistant'; content: string };

type Props = {
  currentTab: EditorTab | null;
};

export default function AiAssistantPanel({ currentTab }: Props) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(800);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Olá! Escolha um provedor e comece a conversar.' }]);
  const [input, setInput] = useState('');
  const [workspacePath, setWorkspacePath] = useState('');

  useEffect(() => {
    const load = async () => {
      const config = await window.electronAPI.getAIConfig();
      setProvider(config.provider || 'openai');
      setApiKey(config.apiKey || '');
      setModel(config.model || 'gpt-4o-mini');
      setTemperature(Number(config.temperature || 0.2));
      setMaxTokens(Number(config.maxTokens || 800));
      const path = (await window.electronAPI.openFolder()) || '';
      setWorkspacePath(path);
      const session = await window.electronAPI.loadAISessions(path);
      if (session?.messages?.length) {
        setMessages(session.messages.map((message: { role: string; content: string }) => ({ role: message.role as 'assistant' | 'user', content: message.content })));
      }
    };

    void load();
  }, []);

  const context = useMemo(() => {
    const parts = [] as string[];
    if (currentTab) {
      parts.push(`Active file: ${currentTab.path}`);
      parts.push(currentTab.content.slice(0, 1000));
    }
    return parts.join('\n\n');
  }, [currentTab]);

  const save = async (nextMessages: Message[]) => {
    await window.electronAPI.saveAISession(workspacePath, { messages: nextMessages });
  };

  const send = async () => {
    const userMessage = { role: 'user' as const, content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');

    const config = { provider, apiKey, model, temperature, maxTokens, includeActiveFile: Boolean(currentTab), includeSelectedCode: true, includeOpenTabs: true };
    await window.electronAPI.setAIConfig(config);
    const reply = await window.electronAPI.sendAIMessage({
      workspacePath,
      config,
      messages: nextMessages,
      context
    });

    const assistantMessage = { role: 'assistant' as const, content: String(reply) };
    const updated = [...nextMessages, assistantMessage];
    setMessages(updated);
    await save(updated);
  };

  return (
    <div className="panel-card">
      <h3>AI Assistant</h3>
      <div className="ai-input-row">
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
          <option value="azure">Azure OpenAI</option>
          <option value="ollama">Ollama</option>
          <option value="custom">Custom</option>
        </select>
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" />
      </div>
      <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API key" />
      <label>
        Temperature
        <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
      </label>
      <label>
        Max tokens
        <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
      </label>
      <div>
        {messages.map((message, index) => (
          <div className="ai-message" key={`${message.role}-${index}`}>
            <strong>{message.role}</strong>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      <div className="ai-input-row">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI anything" rows={4} />
      </div>
      <button type="button" onClick={send}>Send</button>
    </div>
  );
}
