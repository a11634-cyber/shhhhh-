import { useState } from 'react';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>(['Search results will appear here.']);

  const onSearch = () => {
    setResults([`Matches for "${query}" in current workspace`, 'src/renderer/App.tsx:1', 'src/main/ipc/ai.ts:1']);
  };

  return (
    <div className="panel-card">
      <h3>Search</h3>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find in files" />
      <button type="button" onClick={onSearch}>Search</button>
      <ul>
        {results.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
