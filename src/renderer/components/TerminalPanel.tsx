import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

type Session = { id: string; title: string; shell: string; cwd: string };

export default function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const terminal = new Terminal({ cursorBlink: true, convertEol: true, theme: { background: '#020617', foreground: '#e2e8f0' } });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current!);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const create = async () => {
      const session = (await window.electronAPI.createTerminal('', 'bash')) as Session;
      setSessions([session]);
      setActiveSessionId(session.id);
    };

    void create();

    const listener = (payload: { id: string; data: string }) => {
      if (payload.id === activeSessionId) {
        xtermRef.current?.write(payload.data);
      }
    };

    window.electronAPI.onTerminalData(listener);

    terminal.onData((data) => {
      if (activeSessionId) {
        void window.electronAPI.writeTerminal(activeSessionId, data);
      }
    });

    const resize = () => fitAddon.fit();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.electronAPI.offTerminalData(listener);
    };
  }, [activeSessionId]);

  const addTerminal = async () => {
    const session = (await window.electronAPI.createTerminal('', 'bash')) as Session;
    setSessions((prev) => [...prev, session]);
    setActiveSessionId(session.id);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 180, padding: 12 }}>
        <button type="button" onClick={addTerminal}>New terminal</button>
        {sessions.map((session) => (
          <div key={session.id}>
            <button type="button" onClick={() => setActiveSessionId(session.id)}>{session.title}</button>
          </div>
        ))}
      </div>
      <div ref={terminalRef} style={{ flex: 1, padding: 12 }} />
    </div>
  );
}
