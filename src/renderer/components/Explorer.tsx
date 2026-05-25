import { useEffect, useState } from 'react';
import { FileNode } from '../../shared/types';

type Props = {
  onOpenFile: (path: string, content: string, language: string) => void;
};

function FileTree({ node, onOpenFile }: { node: FileNode; onOpenFile: Props['onOpenFile'] }) {
  const [expanded, setExpanded] = useState(true);

  const open = async () => {
    if (node.isDirectory) {
      setExpanded((value) => !value);
      return;
    }
    const content = await window.electronAPI.readFile(node.path);
    const ext = node.path.split('.').pop()?.toLowerCase() || 'plaintext';
    const language = ['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css'].includes(ext) ? ext : 'plaintext';
    onOpenFile(node.path, content, language);
  };

  return (
    <li>
      <button type="button" onClick={open}>
        {node.isDirectory ? (expanded ? '▾ ' : '▸ ') : '• '}
        {node.name}
      </button>
      {node.isDirectory && expanded && node.children && (
        <ul className="file-tree">
          {node.children.map((child) => (
            <FileTree key={child.path} node={child} onOpenFile={onOpenFile} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Explorer({ onOpenFile }: Props) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [workspacePath, setWorkspacePath] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const path = await window.electronAPI.openFolder();
      setWorkspacePath(path || '');
      const result = await window.electronAPI.readDirectory(path || '');
      setFiles(result as FileNode[]);
    };

    void load();
  }, []);

  const refresh = async () => {
    const result = await window.electronAPI.readDirectory(workspacePath || '');
    setFiles(result as FileNode[]);
  };

  return (
    <div className="panel-card">
      <h3>Explorer</h3>
      <p>{workspacePath || 'No folder open'}</p>
      <button type="button" onClick={refresh}>Refresh</button>
      <ul className="file-tree">
        {files.map((node) => (
          <FileTree key={node.path} node={node} onOpenFile={onOpenFile} />
        ))}
      </ul>
    </div>
  );
}
