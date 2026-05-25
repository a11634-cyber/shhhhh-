type Props = { onClose: () => void };

export default function CommandPalette({ onClose }: Props) {
  return (
    <div className="command-palette">
      <h3>Command Palette</h3>
      <input placeholder="Type command" />
      <button type="button" onClick={onClose}>Close</button>
      <ul>
        <li>Open Folder</li>
        <li>Toggle Terminal</li>
        <li>AI Chat</li>
      </ul>
    </div>
  );
}
