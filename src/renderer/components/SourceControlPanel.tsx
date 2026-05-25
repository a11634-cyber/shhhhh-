import { useEffect, useState } from 'react';

export default function SourceControlPanel() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const workspace = (await window.electronAPI.openFolder()) || '';
      const result = await window.electronAPI.gitStatus(workspace);
      setStatus(JSON.stringify(result));
      setBranch(result.branch || 'main');
    };
    void load();
  }, []);

  const onCommit = async () => {
    const workspace = (await window.electronAPI.openFolder()) || '';
    await window.electronAPI.gitCommit(workspace, commitMessage);
    setStatus(`Committed: ${commitMessage}`);
  };

  return (
    <div className="panel-card">
      <h3>Source Control</h3>
      <p>{branch}</p>
      <p>{status}</p>
      <input value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} placeholder="Commit message" />
      <button type="button" onClick={onCommit}>Commit</button>
    </div>
  );
}
