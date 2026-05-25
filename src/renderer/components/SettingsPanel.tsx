import { useEffect, useState } from 'react';
import { AppSettings } from '../../shared/types';

type Props = { onClose: () => void };

export default function SettingsPanel({ onClose }: Props) {
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    const load = async () => {
      const settings = (await window.electronAPI.getSettings()) as AppSettings;
      setTheme(settings.theme || 'dark');
      setFontSize(settings.fontSize || 14);
    };
    void load();
  }, []);

  const save = async () => {
    const settings = { theme, fontSize };
    await window.electronAPI.saveSettings(settings);
    onClose();
  };

  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      <label>
        Theme
        <select value={theme} onChange={(e) => setTheme(e.target.value as AppSettings['theme'])}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="high-contrast">High contrast</option>
        </select>
      </label>
      <label>
        Font size
        <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
      </label>
      <button type="button" onClick={save}>Save</button>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  );
}
