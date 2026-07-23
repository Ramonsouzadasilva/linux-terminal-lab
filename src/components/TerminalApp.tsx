import React, { useState, useRef, useEffect } from 'react';
import { VirtualFile, Mission, Achievement, OSSettings } from '../types';
import { executeCommand, CommandResult } from '../utils/terminalExecutor';
import { findNodeByPath, updateNodeAtPath, modifyNodeChildren } from '../utils/fsHelper';
import { Play, Plus, Trash2, X, Terminal, HelpCircle, AlertTriangle, Monitor, Save } from 'lucide-react';

interface TerminalAppProps {
  fs: VirtualFile;
  onUpdateFS: (newFS: VirtualFile) => void;
  currentDir: string;
  onUpdateDir: (newDir: string) => void;
  currentUser: string;
  activeMission: Mission | null;
  allMissions: Mission[];
  unlockedAchievements: string[];
  onAddXP: (xp: number) => void;
  onUnlockAchievement: (id: string) => void;
  onCompleteMission: (id: string) => void;
  onOpenFileInEditor?: (path: string) => void;
  settings: OSSettings;
  onClose?: () => void;
}

interface TerminalTab {
  id: string;
  title: string;
  dir: string;
  history: string[]; // input lines
  output: Array<{ text: string; type: 'input' | 'output' | 'error' | 'success' }>;
  commandHistoryIndex: number;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  fs,
  onUpdateFS,
  currentDir,
  onUpdateDir,
  currentUser,
  activeMission,
  allMissions,
  unlockedAchievements,
  onAddXP,
  onUnlockAchievement,
  onCompleteMission,
  onOpenFileInEditor,
  settings,
  onClose
}) => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'bash #1',
      dir: currentDir,
      history: [],
      output: [
        { text: 'Bem-vindo ao Simulador Linux Interativo [Laboratório Hacker v1.4.0]', type: 'success' },
        { text: 'Digite "help" para listar os comandos suportados e ver as opções de estudo.', type: 'output' },
        { text: 'Senha do comando "sudo": linux', type: 'output' },
        { text: 'DICA: Abra o app "Academy" para ver suas tarefas atuais e progresso!', type: 'output' },
        { text: '', type: 'output' }
      ],
      commandHistoryIndex: -1
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputVal, setInputVal] = useState('');
  
  // Nano Editor states
  const [nanoFile, setNanoFile] = useState<string | null>(null);
  const [nanoContent, setNanoContent] = useState('');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Auto scroll to bottom when output updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab.output, nanoFile]);

  // Sync active tab directory with main currentDir
  useEffect(() => {
    onUpdateDir(activeTab.dir);
  }, [activeTabId, activeTab.dir, onUpdateDir]);

  // Keep focus on terminal input
  const focusInput = () => {
    if (!nanoFile) {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [activeTabId, nanoFile]);

  // Key clicks audio emulation
  const playClickSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime); // Quick high pitch
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // AudioContext blocker safe
    }
  };

  const playBeepSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Safe
    }
  };

  const handleCreateTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      title: `bash #${tabs.length + 1}`,
      dir: currentDir,
      history: [],
      output: [
        { text: `Terminal bash iniciado em ${new Date().toLocaleTimeString()}`, type: 'output' },
        { text: 'Digite "help" para ajuda.', type: 'output' }
      ],
      commandHistoryIndex: -1
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) return; // Must keep at least one tab
    const filtered = tabs.filter(t => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[0].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    playClickSound();

    if (e.key === 'Enter') {
      const command = inputVal.trim();
      
      if (command === 'exit') {
        if (tabs.length > 1) {
          handleCloseTab(activeTabId);
        } else {
          if (onClose) {
            onClose();
          }
        }
        setInputVal('');
        return;
      }

      if (!command) {
        // Just print empty prompt line
        updateTabState(activeTabId, {
          output: [...activeTab.output, { text: `${currentUser}@linuxlab:${getShortDir(activeTab.dir)}$ `, type: 'input' }]
        });
        setInputVal('');
        return;
      }

      // Execute command
      const cmdRes: CommandResult = executeCommand(
        command,
        activeTab.dir,
        fs,
        currentUser,
        activeMission,
        allMissions,
        unlockedAchievements
      );

      // Save command history
      const newHistory = [...activeTab.history, command];

      let newOutput = [
        ...activeTab.output,
        { text: `${currentUser}@linuxlab:${getShortDir(activeTab.dir)}$ ${command}`, type: 'input' as const }
      ];

      if (cmdRes.clearScreen) {
        newOutput = [];
      } else if (cmdRes.output) {
        const isError = cmdRes.output.includes('não encontrado') || cmdRes.output.includes('Permissão negada') || cmdRes.output.includes('invalido') || cmdRes.output.includes('erro');
        newOutput.push({
          text: cmdRes.output,
          type: isError ? 'error' : 'output'
        });
      }

      // If command open Nano editor
      if (cmdRes.showNano) {
        const resolvedPath = cmdRes.showNano;
        const existingNode = findNodeByPath(fs, resolvedPath);
        setNanoFile(resolvedPath);
        setNanoContent(existingNode && existingNode.type === 'file' ? (existingNode.content || '') : '');
      }

      // If achievements unlocked
      if (cmdRes.unlockedAchievementId) {
        onUnlockAchievement(cmdRes.unlockedAchievementId);
        onAddXP(50);
        newOutput.push({
          text: `🏆 CONQUISTA DESBLOQUEADA: ${cmdRes.unlockedAchievementId === 'ach_folder' ? 'Organizador de Arquivos' : cmdRes.unlockedAchievementId === 'ach_write' ? 'Escritor de Códigos' : cmdRes.unlockedAchievementId === 'ach_security' ? 'Analista Blue Team' : 'Automatizador Linux'}! (+50 XP)`,
          type: 'success'
        });
        playBeepSound();
      }

      // If mission solved
      if (cmdRes.completedMissionId) {
        onCompleteMission(cmdRes.completedMissionId);
        onAddXP(cmdRes.xpEarned);
        newOutput.push({
          text: `🎉 PARABÉNS! Missão concluída: "${allMissions.find(m => m.id === cmdRes.completedMissionId)?.title}". Ganhou +${cmdRes.xpEarned} XP!`,
          type: 'success'
        });
        playBeepSound();
      }

      onUpdateFS(cmdRes.updatedFS);
      
      updateTabState(activeTabId, {
        dir: cmdRes.updatedDir,
        history: newHistory,
        output: newOutput,
        commandHistoryIndex: -1
      });

      setInputVal('');
    }

    // Auto complete with TAB
    if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    }

    // History traversal (Arrow UP/DOWN)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = activeTab.commandHistoryIndex + 1;
      if (nextIdx < activeTab.history.length) {
        const historyCmd = activeTab.history[activeTab.history.length - 1 - nextIdx];
        setInputVal(historyCmd);
        updateTabState(activeTabId, { commandHistoryIndex: nextIdx });
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = activeTab.commandHistoryIndex - 1;
      if (nextIdx >= 0) {
        const historyCmd = activeTab.history[activeTab.history.length - 1 - nextIdx];
        setInputVal(historyCmd);
        updateTabState(activeTabId, { commandHistoryIndex: nextIdx });
      } else {
        setInputVal('');
        updateTabState(activeTabId, { commandHistoryIndex: -1 });
      }
    }
  };

  const handleAutocomplete = () => {
    const tokens = inputVal.trim().split(' ');
    const lastToken = tokens[tokens.length - 1] || '';
    
    if (tokens.length === 1) {
      // Autocomplete commands
      const commands = [
        'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'nano', 'echo', 
        'grep', 'find', 'chmod', 'chown', 'sudo', 'neofetch', 'ps', 'kill', 'clear', 'help'
      ];
      const match = commands.find(c => c.startsWith(lastToken));
      if (match) {
        setInputVal(match + ' ');
      }
    } else {
      // Autocomplete folder/files in current directory
      const currentNode = findNodeByPath(fs, activeTab.dir);
      if (currentNode && currentNode.type === 'dir' && currentNode.children) {
        const matches = currentNode.children.filter(child => child.name.startsWith(lastToken));
        if (matches.length === 1) {
          const completed = matches[0].name;
          tokens[tokens.length - 1] = completed;
          setInputVal(tokens.join(' ') + (matches[0].type === 'dir' ? '/' : ' '));
        } else if (matches.length > 1) {
          // Print potential options
          const optionsStr = matches.map(m => m.name).join('    ');
          updateTabState(activeTabId, {
            output: [
              ...activeTab.output,
              { text: `${currentUser}@linuxlab:${getShortDir(activeTab.dir)}$ ${inputVal}`, type: 'input' },
              { text: optionsStr, type: 'output' }
            ]
          });
        }
      }
    }
  };

  const updateTabState = (tabId: string, partial: Partial<TerminalTab>) => {
    setTabs(tabs.map(t => {
      if (t.id === tabId) {
        return { ...t, ...partial };
      }
      return t;
    }));
  };

  const getShortDir = (path: string) => {
    if (path === '/home/hacker') return '~';
    return path;
  };

  // NANO EDITOR OPERATORS
  const handleSaveNano = () => {
    if (!nanoFile) return;
    
    const parentPath = nanoFile.substring(0, nanoFile.lastIndexOf('/')) || '/';
    const fileName = nanoFile.substring(nanoFile.lastIndexOf('/') + 1);

    const existingFile = findNodeByPath(fs, nanoFile);

    const updatedFile: VirtualFile = {
      name: fileName,
      type: 'file',
      permissions: existingFile?.permissions || 644,
      owner: existingFile?.owner || currentUser,
      group: existingFile?.group || (currentUser === 'root' ? 'root' : 'hacker'),
      size: nanoContent.length,
      updatedAt: new Date().toISOString(),
      content: nanoContent
    };

    const newFS = modifyNodeChildren(fs, parentPath, 'add', updatedFile);
    onUpdateFS(newFS);
    
    // Add success line to terminal output
    const outputLines = [
      ...activeTab.output,
      { text: `[nano] Arquivo "${fileName}" gravado com sucesso. (${nanoContent.length} bytes)`, type: 'success' as const }
    ];

    // Trigger writing achievements / mission check
    let xpEarned = 0;
    let completedMissionId = '';
    
    if (activeMission && activeMission.id === 'm3' && fileName === 'index.html' && nanoContent.trim().length > 0) {
      // Trigger mission completed check dynamically (though cat index.html is also needed, let's keep validation aligned)
    }

    updateTabState(activeTabId, {
      output: outputLines
    });

    setNanoFile(null);
    playBeepSound();
  };

  const getTerminalColors = () => {
    switch (settings.theme) {
      case 'matrix':
        return 'bg-black text-[#00ff00] font-mono';
      case 'cyberpunk':
        return 'bg-slate-950 text-cyan-400 font-mono';
      case 'ubuntu':
        return 'bg-[#300a24] text-[#dfdbd2] font-mono';
      case 'kali':
        return 'bg-[#0b0f19] text-green-400 font-mono';
      case 'cosmic':
        return 'bg-slate-950 text-indigo-300 font-mono';
      default: // minimal
        return 'bg-slate-50 text-slate-800 font-mono border border-slate-200';
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${getTerminalColors()}`} onClick={focusInput}>
      
      {/* Tab bar header */}
      {!nanoFile && (
        <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-2 py-1 select-none">
          <div className="flex items-center space-x-1">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-t text-xs cursor-pointer border-t-2 transition-colors ${
                  activeTabId === tab.id
                    ? 'bg-black/80 text-white border-green-500 font-semibold'
                    : 'text-white/40 border-transparent hover:text-white/70 hover:bg-black/20'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 opacity-60" />
                <span>{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={handleCreateTab}
              className="p-1 rounded text-white/40 hover:text-white/80 hover:bg-white/5"
              title="Nova Aba"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-white/30 px-2 hidden sm:block">
            Pressione <kbd className="bg-white/5 px-1 rounded">TAB</kbd> para completar comandos
          </div>
        </div>
      )}

      {/* Terminal Scrolling Canvas */}
      {!nanoFile ? (
        <div className="flex-1 overflow-auto p-3 text-sm select-text space-y-1">
          {activeTab.output.map((line, idx) => {
            if (line.type === 'input') {
              return (
                <div key={idx} className="font-semibold text-slate-300">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'error') {
              return (
                <div key={idx} className="text-red-400 whitespace-pre-wrap font-medium">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'success') {
              return (
                <div key={idx} className="text-green-400 font-bold border-l-2 border-green-500 pl-2 my-1 whitespace-pre-wrap">
                  {line.text}
                </div>
              );
            }
            return (
              <div key={idx} className="opacity-90 whitespace-pre-wrap">
                {line.text}
              </div>
            );
          })}

          {/* Current typing line */}
          <div className="flex items-center">
            <span className="font-semibold text-green-400 mr-2 shrink-0 select-none">
              {currentUser}@linuxlab:{getShortDir(activeTab.dir)}$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-inherit font-mono shadow-none max-w-full"
              autoComplete="off"
              autoFocus
              spellCheck="false"
            />
          </div>
          <div ref={terminalEndRef} />
        </div>
      ) : (
        /* NANO TEXT EDITOR SIMULATOR OVERLAY */
        <div className="flex-1 flex flex-col bg-slate-950 text-white font-mono h-full">
          {/* Header */}
          <div className="bg-slate-100 text-slate-900 text-xs py-0.5 px-3 flex justify-between select-none">
            <span>GNU nano 5.4</span>
            <span className="font-bold truncate">{nanoFile}</span>
            <span>Modificado</span>
          </div>

          {/* Editor Space */}
          <textarea
            value={nanoContent}
            onChange={(e) => setNanoContent(e.target.value)}
            className="flex-1 bg-slate-950 text-slate-100 p-3 outline-none border-none font-mono text-sm resize-none"
            spellCheck="false"
            placeholder="Comece a programar seu script Bash ou arquivo HTML aqui..."
          />

          {/* Action Ribbon Helper */}
          <div className="bg-slate-900/90 border-t border-white/5 p-2 select-none">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                Dica: Digite e edite o arquivo, em seguida clique em "Gravar" para salvar no disco virtual!
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNano}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Gravar (Salvar)
                </button>
                <button
                  onClick={() => {
                    setNanoFile(null);
                    playClickSound();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-3 rounded text-xs transition-colors"
                >
                  Sair sem salvar
                </button>
              </div>
            </div>
            {/* Legend grids */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[10px] text-slate-400 font-semibold bg-black/40 p-1.5 rounded">
              <div><span className="text-white bg-slate-700 px-0.5 rounded">^G</span> Obter Ajuda</div>
              <div><span className="text-white bg-green-700 px-0.5 rounded">^O</span> Gravar Out (Salvar)</div>
              <div><span className="text-white bg-slate-700 px-0.5 rounded">^R</span> Ler Arquivo</div>
              <div><span className="text-white bg-slate-700 px-0.5 rounded">^W</span> Onde Está</div>
              <div><span className="text-white bg-slate-700 px-0.5 rounded">^K</span> Recortar Tx</div>
              <div><span className="text-white bg-red-700 px-0.5 rounded">^X</span> Sair Editor</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
