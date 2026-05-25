import { useEffect, useState } from 'react';

export default function DebugPanel() {
  const [output, setOutput] = useState<string[]>(['Debug output will appear here.']);
  const [scriptPath, setScriptPath] = useState('app.js');

  useEffect(() => {
    const handler = (_event: unknown, text: string) => {
      setOutput((prev) => [...prev, text]);
    };

    window.addEventListener('debug:output', handler as EventListener);
    return () => window.removeEventListener('debug:output', handler as EventListener);
  }, []);

  const startDebug = async () => {
    const result = await window.electronAPI.debugStart({ filePath: scriptPath });
    setOutput((prev) => [...prev, JSON.stringify(result)]);
  };

  const stopDebug = async () => {
    await window.electronAPI.debugStop();
    setOutput((prev) => [...prev, 'Stopped']);
  };

  return (
    <div className="panel-card">
      <h3>Run and Debug</h3>
      <input value={scriptPath} onChange={(e) => setScriptPath(e.target.value)} placeholder="Node script" />
      <button type="button" onClick={startDebug}>Start</button>
      <button type="button" onClick={stopDebug}>Stop</button>
      <ul>
        {output.map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
