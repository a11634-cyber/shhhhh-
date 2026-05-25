You are an expert software architect and senior full-stack developer specialized in building complex desktop applications with Electron and TypeScript. Your task is to design and fully implement a production-ready code editor inspired by Visual Studio Code, named "CodeL Editor". The application must include every major feature found in VS Code, plus a deeply integrated AI sidebar that lets users connect any AI provider using their own API key.

You must output a complete, working project. Follow the plan precisely, produce every file with complete code, and ensure the application can be installed and launched with `npm install && npm start`.

---

## 1. Project Overview

Build a cross-platform desktop code editor using Electron, with the following core characteristics:

- **Main UI layout**: Activity Bar (leftmost icons), Side Bar (explorer, search, source control, debug, extensions, AI chat), Panel (terminal, output, problems), Editor area (tabs, split views), Status Bar.
- **All major VS Code panels** fully functional: File Explorer, Search, Source Control (Git), Run and Debug, Extensions, and an additional **AI Assistant** panel.
- **AI Assistant Panel**: user can choose an AI provider (OpenAI, Anthropic, Google Gemini, Azure OpenAI, local models via Ollama/LM Studio, etc.), input their API key (stored securely in the app's local storage, never hardcoded), select the model, adjust parameters (temperature, max tokens). The chat interface must support context awareness (selected code, open files) and allow the AI to suggest edits, explain code, generate code, refactor, etc.
- **Terminal** fully integrated (using xterm.js), supporting multiple shell sessions.
- **Source Control** with Git integration: stage/unstage, commit, push/pull, branch management, diff view (using Monaco editor diff editor).
- **Run and Debug**: support for launch configurations (like VS Code's launch.json), breakpoints, call stack, variables, watch expressions, debug toolbar, using the Debug Adapter Protocol (DAP) for Node.js and other runtimes.
- **Extensions**: a marketplace (simulated or connected to an open-source registry), ability to install/uninstall extensions, extension activation, contributions to commands, themes, languages.
- **Customizable themes**: built‑in dark, light, and high‑contrast themes; ability to load VS Code-compatible themes.
- **Settings**: UI settings editor and JSON-based settings sync.
- **Keyboard shortcuts** editor.
- **Icon**: the user will supply an icon file; the application must use it as the app icon (main window, tray, installer). The prompt will include a placeholder where the user describes the icon path, but for the generated code, assume the icon will be provided at `assets/icon.png` and implement icon assignment accordingly.

---

## 2. Technology Stack

- **Framework**: Electron (latest stable)
- **Language**: TypeScript (strict mode)
- **Editor Core**: Monaco Editor (the same editor that powers VS Code)
- **Terminal**: xterm.js + node-pty
- **Git Integration**: isomorphic-git (or simple-git) for Git operations; diff view via Monaco's diff editor
- **Debugging**: DAP client implementation (e.g., `@vscode/debugadapter`, or a custom lightweight adapter), child process management
- **AI Integration**: API calls to OpenAI, Anthropic, Google, etc., using fetch/axios; secure storage of API keys via `electron-store` with encryption
- **Extensions**: sandboxed extension host (can use Node.js `vm` or isolated process with IPC), extension manifest format similar to VS Code
- **Build Tooling**: Webpack or Vite for bundling the renderer, `electron-builder` for packaging
- **UI**: React (with hooks, functional components) for the renderer; CSS/styled-components for theming
- **State Management**: Redux Toolkit or Zustand for shared state (files, git, debug, ai)
- **Package Manager**: npm or yarn

---

## 3. Architecture and File Structure

The project must follow a clean, modular architecture. The file structure should be:

```
codel-editor/
├── package.json
├── tsconfig.json
├── webpack.config.ts (or vite config)
├── electron-builder.yml
├── assets/
│   └── icon.png          // User-provided icon (place holder)
├── src/
│   ├── main/             // Electron main process
│   │   ├── main.ts
│   │   ├── ipc/
│   │   │   ├── fileSystem.ts
│   │   │   ├── terminal.ts
│   │   │   ├── git.ts
│   │   │   ├── debug.ts
│   │   │   ├── extensions.ts
│   │   │   └── ai.ts
│   │   ├── services/
│   │   │   ├── windowManager.ts
│   │   │   ├── updater.ts
│   │   │   └── store.ts
│   │   └── preload.ts
│   ├── renderer/         // React renderer process
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ActivityBar/
│   │   │   ├── SideBar/
│   │   │   │   ├── Explorer.tsx
│   │   │   │   ├── Search.tsx
│   │   │   │   ├── SourceControl.tsx
│   │   │   │   ├── DebugPanel.tsx
│   │   │   │   ├── Extensions.tsx
│   │   │   │   └── AiAssistant.tsx
│   │   │   ├── Editor/
│   │   │   ├── Panel/
│   │   │   │   ├── Terminal.tsx
│   │   │   │   └── Problems.tsx
│   │   │   ├── StatusBar/
│   │   │   └── Settings/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── services/     // Frontend service calls to IPC
│   │   ├── styles/
│   │   └── themes/
│   ├── shared/           // Types and constants used by both processes
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── ipcChannels.ts
│   └── extensions/       // Built‑in and user extensions folder
│       ├── builtin/
│       └── user/

```
---

## 4. Detailed Feature Specifications

### 4.1 Activity Bar & Sidebar

- Activity bar on the far left with icons for: Explorer (files), Search, Source Control, Run and Debug, Extensions, AI Assistant (distinct icon).
- Clicking an icon opens the corresponding sidebar. The sidebar content is replaced entirely (no overlap).
- Sidebar can be resized by dragging the splitter.

### 4.2 File Explorer

- Shows workspace folder tree (user opens a folder via File > Open Folder, dialog provided by Electron).
- Create, rename, delete, copy, paste files/folders with native confirm dialogs.
- Right‑click context menu mirroring VS Code options.
- File icons based on extension (use a built‑in icon set or a simple mapping).
- Clicking a file opens it in the editor.

### 4.3 Editor (Monaco)

- Tabbed multi‑file editing with close, reorder, and split view (vertical/horizontal).
- Monaco editor with syntax highlighting, IntelliSense (basic built‑in for JavaScript/TypeScript; extension model can add more).
- Diff editor for Git changes.
- Minimap, bracket matching, word wrap, indentation guides, etc.
- Editor settings (font size, tab size, theme) applied globally and per‑language.

### 4.4 Terminal Panel

- Integrated terminal panel that can be toggled from the panel area (below editor) or moved to the side.
- Uses xterm.js and node-pty to spawn a real shell (bash, PowerShell, cmd depending on OS).
- Multiple terminal tabs; create new terminals, kill terminals.
- ANSI color support, copy/paste, scrollback buffer.

### 4.5 Source Control (Git)

- Initialize a repository, clone, open existing repo.
- Show changed files list (modified, added, deleted, untracked) with staging/unstaging via checkbox or button.
- Commit with message input.
- Branch creation and switching.
- Push/pull to/from remote (with simple authentication flow for HTTPS).
- Diff view for unstaged and staged changes using Monaco diff editor.
- Show current branch in the status bar.

### 4.6 Run and Debug

- Debug sidebar shows: run configuration dropdown, start/stop/restart buttons, breakpoints list, call stack, variables, watch expressions.
- Configuration file (`.codex/launch.json` in workspace) with support for Node.js (launch/attach) initially; architecture open to extensions adding more debug adapters.
- DAP communication with debug adapter via socket or stdin/stdout.
- Breakpoints in editor (gutter click to toggle), red filled circle.
- Step over, step into, step out, continue, pause commands.
- Debug console output.

### 4.7 Extensions

- Extensions are JavaScript/TypeScript modules loaded in a sandboxed Node.js worker with a defined API (subset of VS Code's API: window, commands, languages, workspace, etc.).
- Extensions declare contributions in `package.json`: activation events, commands, languages, themes, debuggers, etc.
- Extensions sidebar lists installed extensions with enable/disable/uninstall.
- "Marketplace" panel that lists available extensions (can be a static curated list or fetch from a local JSON file; in the future, could connect to Open VSX).
- User can install an extension from a `.vsix` file or from the marketplace with a click.
- Built‑in extensions: theme support, language basics for JSON, CSS, HTML.

### 4.8 AI Assistant Sidebar (Crucial)

- When the user clicks the AI icon in the activity bar, the AI sidebar appears.
- **Provider Configuration** (settings gear icon):
  - Dropdown to select provider: "OpenAI", "Anthropic", "Google Gemini", "Azure OpenAI", "Ollama (Local)", "Custom (OpenAI-compatible)".
  - For each provider, the user enters the API key (stored encrypted in `electron-store` with a secure key).
  - For cloud providers, show a model selector (e.g., GPT-4o, GPT-4, Claude 3.5 Sonnet, Gemini 1.5 Pro, etc.). For local, allow entering a base URL (default `http://localhost:11434/v1` for Ollama) and model name.
  - Additional parameters: temperature (slider), max tokens (number input).
  - A "Test Connection" button sends a simple request.
  - Configuration is saved per provider and can be switched easily.
- **Chat Interface**:
  - Message history (scrollable), user input box at the bottom.
  - User can attach context: "Include active file", "Include selected code", "Include open tabs" toggles.
  - Messages from AI can include code blocks with syntax highlighting.
  - Each AI response has action buttons: "Insert at cursor", "Replace selection", "Create new file with content", "Copy".
  - Option to start a new chat session; history is preserved per workspace.
- **AI Capabilities**:
  - General question answering.
  - Code generation from natural language.
  - Code explanation (highlight code, ask "Explain this").
  - Refactoring suggestions.
  - Generating unit tests.
  - Debugging help (analyze error logs).

### 4.9 Search

- Sidebar search with find in files, replace in files, regex support, case sensitivity, whole word.
- Results shown in a tree (file path → line matches). Click to open.

### 4.10 Settings

- UI settings editor (split view: list of settings, details on the right) similar to VS Code's settings UI.
- Settings stored in `settings.json` inside workspace or global user folder.
- Commonly changed settings: theme, font size, tab size, AI default provider, terminal shell path, etc.

### 4.11 Status Bar

- Left: current git branch, errors/warnings count.
- Right: cursor line/column, indentation settings, language mode, feedback (AI processing indicator).

### 4.12 Commands & Keyboard Shortcuts

- Command Palette (Ctrl+Shift+P) with list of all commands, searchable.
- Default keybindings similar to VS Code; customizable via a keybindings editor (JSON).

---

## 5. Implementation Plan (Step-by-Step)

You must follow this sequence to generate the code. After completing each step, output the file paths and a brief summary. Do not skip any step.

1. **Project Scaffolding**
   - Create `package.json`, `tsconfig.json`, build config, `electron-builder.yml`.
   - Set up Electron main process entry point (`src/main/main.ts`), create browser window with preload script.
   - Set up React renderer with basic `App.tsx` showing a placeholder layout.

2. **Activity Bar and Sidebar Shell**
   - Implement the activity bar (static icons). Clicking an icon sets active sidebar panel.
   - Create sidebar container with resizable split panes. Each panel is a placeholder that renders the correct component.

3. **File Explorer**
   - Implement IPC for reading directories, file operations.
   - Build the Explorer component with tree view. Open file in editor on click.

4. **Editor Integration**
   - Integrate Monaco editor (using `@monaco-editor/react` or raw loader) in the editor area.
   - Implement tab management: open files, switch tabs, close tabs.
   - Diff editor integration.

5. **Terminal Panel**
   - Add panel area with tabs (Terminal, Output, Problems). Terminal tab uses xterm.js.
   - Main process spawns shells via node-pty, communication over IPC with multiplexing for multiple terminals.

6. **Source Control (Git)**
   - Use isomorphic-git for core git operations. Implement status, diff, stage, commit, branch, push/pull.
   - Build UI components for source control sidebar and diff view.

7. **Run and Debug**
   - Create debug adapter client for Node.js (using child process and DAP). Support launch.json.
   - Build debug sidebar UI: variables tree, call stack, breakpoints.
   - Integrate debug toolbar in editor.

8. **Extensions System**
   - Design extension API (subset of VS Code API). Create extension host process.
   - Extension loader, activation events, contribution points.
   - Extensions sidebar UI with marketplace simulation.

9. **AI Assistant Sidebar**
   - Implement provider configuration UI and secure API key storage.
   - Build chat component with context toggles and message actions.
   - Implement IPC handlers for AI requests: calls to selected provider's API, stream response handling.
   - Integrate AI code insert/replace actions with editor.

10. **Search, Settings, Keyboard Shortcuts, Command Palette**
    - Build search sidebar with find-in-files logic.
    - Settings UI and JSON editor.
    - Command palette and keybindings registration.

11. **Theming and Icon**
    - Define theme structure, load VS Code themes.
    - Apply app icon: in `electron-builder.yml`, set icon path to `assets/icon.png`; in main process, set the window icon.

12. **Packaging and Distribution**
    - Configure electron-builder for Windows, macOS, Linux. Icon usage must be correct.

---

## 6. Code Generation Instructions

- **Output every file** with its full path and complete code. Do not use placeholders like `// ... rest of the code`; generate the entire file.
- Use TypeScript strictly, with all types defined.
- Follow best practices: error handling, async/await, clean separation of concerns.
- Ensure all IPC channels are typed and listed in `shared/ipcChannels.ts`.
- The AI should focus on making the application functional for the core workflows: open a folder, edit files, use terminal, commit with git, run a Node.js script in debug mode, install an extension, and chat with AI (using a mock API key that the user will later replace).
- For the AI providers, implement actual fetch calls using the official API endpoints. For example, for OpenAI, POST to `https://api.openai.com/v1/chat/completions` with the API key. Handle streaming with `text/event-stream`.
- The icon file must be referenced in build configuration and set as the app’s icon. Assume `assets/icon.png` exists. In the code that sets the window icon, use `path.join(__dirname, '../assets/icon.png')` for the main window.

---

## 7. Deliverables

Your final response must contain:

1. A complete, ready‑to‑run project with every file listed in the architecture.
2. All source code, configuration, and assets.
3. No summarization – output the entire codebase.

Now, start building the **CodeL Editor**.