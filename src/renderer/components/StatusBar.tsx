import { EditorTab } from '../../shared/types';

type Props = {
  currentTab: EditorTab | null;
  theme: 'dark' | 'light' | 'high-contrast';
};

export default function StatusBar({ currentTab, theme }: Props) {
  return (
    <div className="status-bar">
      <div>Branch: main • Theme: {theme}</div>
      <div>
        {currentTab ? `${currentTab.path} • ` : ''}
        {currentTab ? 'Ready' : 'No file open'}
      </div>
    </div>
  );
}
