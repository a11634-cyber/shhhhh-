import { useEffect, useState } from 'react';

type Extension = { id: string; name: string; version: string; enabled: boolean; description: string };

export default function ExtensionsPanel() {
  const [extensions, setExtensions] = useState<Extension[]>([]);

  useEffect(() => {
    const load = async () => {
      const list = (await window.electronAPI.listExtensions()) as Extension[];
      setExtensions(list);
    };
    void load();
  }, []);

  return (
    <div className="panel-card">
      <h3>Extensions</h3>
      <button type="button" onClick={() => window.electronAPI.installExtension('builtin.theme.dark')}>Install Demo</button>
      <ul>
        {extensions.map((extension) => (
          <li key={extension.id}>
            <strong>{extension.name}</strong> {extension.version}
            <div>{extension.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
