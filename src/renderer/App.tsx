import { useEffect, useMemo, useState } from 'react';
import ActivityBar from './components/ActivityBar';
import Explorer from './components/Explorer';
import SearchPanel from './components/SearchPanel';
import SourceControlPanel from './components/SourceControlPanel';
import DebugPanel from './components/DebugPanel';
import ExtensionsPanel from './components/ExtensionsPanel';
import AiAssistantPanel from './components/AiAssistantPanel';
import EditorArea from './components/EditorArea';
import TerminalPanel from './components/TerminalPanel';
import StatusBar from './components/StatusBar';
import CommandPalette from './components/CommandPalette';
import SettingsPanel from './components/SettingsPanel';
import { useAppStore } from './stores/appStore';
import { AppSettings, EditorTab } from '../shared/types';

export default function App() {
  const store = useAppStore();
  const [activePanel, setActivePanel] = useState<'explorer' | 'search' | 'source' | 'debug' | 'extensions' | 'ai'>('explorer');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(280);
  const [showTerminal, setShowTerminal] = useState(true);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = (await window.electronAPI.getSettings()) as AppSettings;
      store.setTheme(settings.theme || 'dark');
      store.setFontSize(settings.fontSize || 14);
      store.setTabSize(settings.tabSize || 2);
      store.setSettings(settings);
    };

    void loadSettings();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', store.theme);
    document.documentElement.style.fontSize = `${store.fontSize}px`;
  }, [store.theme, store.fontSize]);

  const currentTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? null, [tabs, activeTabId]);

  const openFile = async (path: string, content: string, language: string) => {
    const existing = tabs.find((tab) => tab.path === path);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const newTab: EditorTab = {
      id: `${Date.now()}`,
      path,
      name: path.split(/[\\/]/).pop() || path,
      content,
      saved: true,
      language
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTabId === id) {
      const remaining = tabs.find((tab) => tab.id !== id);
      setActiveTabId(remaining?.id || null);
    }
  };

  const updateTabContent = (id: string, content: string) => {
    setTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, content, saved: false } : tab)));
  };

  const saveTab = async (id: string) => {
    const tab = tabs.find((entry) => entry.id === id);
    if (!tab) {
      return;
    }
    await window.electronAPI.writeFile(tab.path, tab.content);
    setTabs((prev) => prev.map((entry) => (entry.id === id ? { ...entry, saved: true } : entry)));
  };

  return (
    <div className="app-shell">
      <ActivityBar active={activePanel} onSelect={setActivePanel} onOpenSettings={() => setSettingsOpen(true)} onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
      <div className="content-shell">
        <div className="sidebar-shell">
          {activePanel === 'explorer' && <Explorer onOpenFile={openFile} />}
          {activePanel === 'search' && <SearchPanel />}
          {activePanel === 'source' && <SourceControlPanel />}
          {activePanel === 'debug' && <DebugPanel />}
          {activePanel === 'extensions' && <ExtensionsPanel />}
          {activePanel === 'ai' && <AiAssistantPanel currentTab={currentTab} />}
        </div>
        <div className="main-area">
          <EditorArea
            tabs={tabs}
            activeTabId={activeTabId}
            onSelect={setActiveTabId}
            onClose={closeTab}
            onChange={updateTabContent}
            onSave={saveTab}
            theme={store.theme}
          />
          {showTerminal && (
            <div className="terminal-frame" style={{ height: `${terminalHeight}px` }}>
              <div className="terminal-toolbar">
                <span>Panel</span>
                <button onClick={() => setShowTerminal(false)}>Hide</button>
              </div>
              <TerminalPanel />
            </div>
          )}
        </div>
      </div>
      <StatusBar currentTab={currentTab} theme={store.theme} />
      {commandPaletteOpen && <CommandPalette onClose={() => setCommandPaletteOpen(false)} />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
