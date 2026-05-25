import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { DiffEditor } from '@monaco-editor/react';
import { EditorTab } from '../../shared/types';

type Props = {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onChange: (id: string, content: string) => void;
  onSave: (id: string) => void;
  theme: 'dark' | 'light' | 'high-contrast';
};

export default function EditorArea({ tabs, activeTabId, onSelect, onClose, onChange, onSave, theme }: Props) {
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? null, [tabs, activeTabId]);
  const [showDiff, setShowDiff] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    setOriginalContent(activeTab?.content || '');
  }, [activeTab?.path]);

  return (
    <div className="editor-area">
      <div className="editor-tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}>
            <button type="button" onClick={() => onSelect(tab.id)}>{tab.name}</button>
            <button type="button" onClick={() => onClose(tab.id)}>×</button>
          </div>
        ))}
      </div>
      {activeTab ? (
        <div>
          <div className="editor-tabs">
            <button type="button" onClick={() => setShowDiff(false)}>Editor</button>
            <button type="button" onClick={() => setShowDiff(true)}>Diff</button>
            <button type="button" onClick={() => onSave(activeTab.id)}>Save</button>
          </div>
          {showDiff ? (
            <DiffEditor
              height="75vh"
              original={originalContent}
              modified={activeTab.content}
              language={activeTab.language}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            />
          ) : (
            <Editor
              height="75vh"
              language={activeTab.language}
              value={activeTab.content}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              options={{ minimap: { enabled: true }, wordWrap: 'on', fontSize: 14, tabSize: 2 }}
              onChange={(value) => onChange(activeTab.id, value || '')}
            />
          )}
        </div>
      ) : (
        <div className="panel-card">Open a file to start editing.</div>
      )}
    </div>
  );
}
