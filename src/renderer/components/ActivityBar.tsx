type Props = {
  active: 'explorer' | 'search' | 'source' | 'debug' | 'extensions' | 'ai';
  onSelect: (panel: Props['active']) => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
};

const items: Array<{ key: Props['active']; label: string }> = [
  { key: 'explorer', label: 'Explorer' },
  { key: 'search', label: 'Search' },
  { key: 'source', label: 'Git' },
  { key: 'debug', label: 'Debug' },
  { key: 'extensions', label: 'Extensions' },
  { key: 'ai', label: 'AI' }
];

export default function ActivityBar({ active, onSelect, onOpenSettings, onOpenCommandPalette }: Props) {
  return (
    <div className="activity-bar">
      <div className="activity-icons">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`activity-icon ${active === item.key ? 'active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="activity-icons">
        <button type="button" className="activity-icon" onClick={onOpenCommandPalette}>⌘</button>
        <button type="button" className="activity-icon" onClick={onOpenSettings}>⚙</button>
      </div>
    </div>
  );
}
