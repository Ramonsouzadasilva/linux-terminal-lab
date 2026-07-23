import { useState, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { LoginScreen } from './components/LoginScreen';
import { AnimatedBackground } from './components/AnimatedBackground';
import { WindowFrame } from './components/WindowFrame';
import { TerminalApp } from './components/TerminalApp';
import { FileManagerApp } from './components/FileManagerApp';
import { TextEditorApp } from './components/TextEditorApp';
import { SystemMonitorApp } from './components/SystemMonitorApp';
import { AcademyApp } from './components/AcademyApp';
import { ControlPanelApp } from './components/ControlPanelApp';

import { VirtualFile, WindowInstance, Mission, Achievement, UserProfile, OSSettings } from './types';
import { INITIAL_FS } from './utils/fsHelper';
import { INITIAL_MISSIONS, INITIAL_ACHIEVEMENTS } from './utils/missions';

import { 
  Terminal as TermIcon, 
  Folder as FolderIcon, 
  FileText as FileIcon, 
  Activity as ActivityIcon, 
  Compass as CompassIcon, 
  Settings as GearIcon, 
  Power, 
  RotateCcw, 
  LogOut, 
  Clock, 
  Layers, 
  Wifi, 
  User as UserIcon, 
  ShieldCheck, 
  Award,
  Menu,
  Sparkles
} from 'lucide-react';

export default function App() {
  // State 1: Startup States
  const [isBooting, setIsBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isShutdown, setIsShutdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // State 2: System Settings
  const [settings, setSettings] = useState<OSSettings>({
    theme: 'kali',
    terminalFontSize: 14,
    terminalFontFamily: 'JetBrains Mono',
    soundEnabled: true,
    wallpaper: 'kali'
  });

  // State 3: User Profiles & Stats
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'hacker',
    levelName: 'Iniciante Linux',
    xp: 0,
    commandsExecuted: 0,
    missionsCompleted: [],
    achievementsUnlocked: [],
    timeSpentSeconds: 0,
    createdAt: new Date().toISOString()
  });

  // State 4: Virtual File System Tree
  const [fs, setFS] = useState<VirtualFile>(INITIAL_FS);

  // State 5: Active Missions & Achievements arrays
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [activeMissionId, setActiveMissionId] = useState<string | null>('m1');

  // State 6: Window Manager instances
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  
  // State 7: Active File path in Graphical Editor
  const [activeEditorFile, setActiveEditorFile] = useState<string>('/home/hacker/documentos/manual.txt');

  // State 8: Active directory for navigation synchronization
  const [currentDir, setCurrentDir] = useState<string>('/home/hacker');

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedFS = localStorage.getItem('linux_fs_v3');
      const savedProfile = localStorage.getItem('linux_profile_v3');
      const savedSettings = localStorage.getItem('linux_settings_v3');

      if (savedFS) {
        setFS(JSON.parse(savedFS));
      }
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(parsedProfile);
        
        // Sync missions completed state
        const updatedMissions = INITIAL_MISSIONS.map(m => ({
          ...m,
          isCompleted: parsedProfile.missionsCompleted.includes(m.id)
        }));
        setMissions(updatedMissions);

        // Sync achievements unlocked state
        const updatedAchievements = INITIAL_ACHIEVEMENTS.map(a => ({
          ...a,
          isUnlocked: parsedProfile.achievementsUnlocked.includes(a.id),
          unlockedAt: parsedProfile.achievementsUnlocked.includes(a.id) ? new Date().toISOString() : undefined
        }));
        setAchievements(updatedAchievements);

        // Set active mission to first incomplete
        const firstIncomplete = updatedMissions.find(m => !m.isCompleted);
        if (firstIncomplete) {
          setActiveMissionId(firstIncomplete.id);
        } else {
          setActiveMissionId(null);
        }
      }
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, []);

  // Save states to local storage on modification
  const saveFSState = (newFS: VirtualFile) => {
    setFS(newFS);
    localStorage.setItem('linux_fs_v3', JSON.stringify(newFS));
  };

  const saveProfileState = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('linux_profile_v3', JSON.stringify(newProfile));
  };

  const saveSettingsState = (newSettings: OSSettings) => {
    setSettings(newSettings);
    localStorage.setItem('linux_settings_v3', JSON.stringify(newSettings));
  };

  // Clock Update Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Study time counter effect
  useEffect(() => {
    if (!isLoggedIn || isShutdown) return;
    const tracker = setInterval(() => {
      setUserProfile(prev => {
        const nextTime = prev.timeSpentSeconds + 1;
        const updated = { ...prev, timeSpentSeconds: nextTime };
        localStorage.setItem('linux_profile_v3', JSON.stringify(updated));
        return updated;
      });
    }, 1000);
    return () => clearInterval(tracker);
  }, [isLoggedIn, isShutdown]);

  // Global Keyboard Shortcut: CTRL + ALT + T for Terminal
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleLaunchApp('terminal');
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [windows]);

  // Handle User Login
  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    
    // Auto-unlock first login achievement
    const alreadyUnlocked = userProfile.achievementsUnlocked.includes('ach_boot');
    let nextAchievements = [...userProfile.achievementsUnlocked];
    
    if (!alreadyUnlocked) {
      nextAchievements.push('ach_boot');
      
      const updatedAchievements = achievements.map(a => {
        if (a.id === 'ach_boot') {
          return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      });
      setAchievements(updatedAchievements);
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      username: username,
      achievementsUnlocked: nextAchievements,
      xp: userProfile.xp + (alreadyUnlocked ? 0 : 50)
    };
    saveProfileState(updatedProfile);
    
    // Open welcome dashboard or academy app by default!
    setTimeout(() => {
      handleLaunchApp('academy');
    }, 400);
  };

  // Launch or Focus application
  const handleLaunchApp = (appId: string) => {
    setStartMenuOpen(false);

    // If window already open, minimize toggling or focus
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      if (existing.isMinimized) {
        // Unminimize
        handleFocusWindow(existing.id);
        setWindows(windows.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      } else {
        // Focus
        handleFocusWindow(existing.id);
      }
      return;
    }

    // Allocate coordinates
    const offset = windows.length * 30;
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    const appTitles: Record<string, string> = {
      terminal: 'Terminal Bash Shell',
      files: 'Gerenciador de Arquivos',
      editor: 'Editor de Texto Gráfico',
      monitor: 'Monitor de Sistema Linux',
      academy: 'Central de Aprendizado (Academy)',
      settings: 'Painel de Controle'
    };

    const newWindow: WindowInstance = {
      id: `win-${Date.now()}`,
      title: appTitles[appId] || 'Aplicativo',
      appId,
      isOpen: true,
      isMaximized: false,
      isMinimized: false,
      zIndex: nextZ,
      x: 60 + (offset % 180),
      y: 60 + (offset % 120),
      width: appId === 'terminal' || appId === 'academy' ? 750 : 640,
      height: appId === 'terminal' ? 440 : appId === 'academy' ? 480 : 400
    };

    setWindows([...windows, newWindow]);
  };

  // Focus Window (Z-Index elevation)
  const handleFocusWindow = (id: string) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w));
  };

  // Drag Window Move
  const handleMoveWindow = (id: string, x: number, y: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, x, y } : w));
  };

  // Resize Window Dimensions
  const handleResizeWindow = (id: string, width: number, height: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, width, height } : w));
  };

  // Minimize Window
  const handleMinimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  // Maximize Window
  const handleMaximizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  // Close Window instance
  const handleCloseWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  // Complete a Mission
  const handleCompleteMission = (missionId: string) => {
    if (userProfile.missionsCompleted.includes(missionId)) return;

    const nextMissionsCompleted = [...userProfile.missionsCompleted, missionId];
    
    // Update active missions state
    const nextMissions = missions.map(m => m.id === missionId ? { ...m, isCompleted: true } : m);
    setMissions(nextMissions);

    // Calculate level rank string based on completed count
    const completedCount = nextMissionsCompleted.length;
    let rankString = 'Iniciante Linux';
    if (completedCount >= 6) {
      rankString = 'Administrador Linux';
    } else if (completedCount >= 3) {
      rankString = 'Usuário Avançado';
    }

    // Unlocking Mestre do Sysadmin achievement if all 8 are done
    let nextAchievements = [...userProfile.achievementsUnlocked];
    if (completedCount === 8 && !nextAchievements.includes('ach_admin')) {
      nextAchievements.push('ach_admin');
      setAchievements(achievements.map(a => a.id === 'ach_admin' ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a));
    }

    const xpReward = missions.find(m => m.id === missionId)?.xpReward || 100;

    const updatedProfile: UserProfile = {
      ...userProfile,
      missionsCompleted: nextMissionsCompleted,
      levelName: rankString,
      xp: userProfile.xp + xpReward,
      achievementsUnlocked: nextAchievements,
      commandsExecuted: userProfile.commandsExecuted + 1
    };
    saveProfileState(updatedProfile);

    // Load next incomplete mission
    const nextIncomplete = nextMissions.find(m => !m.isCompleted);
    if (nextIncomplete) {
      setActiveMissionId(nextIncomplete.id);
    } else {
      setActiveMissionId(null);
    }
  };

  // Unlock individual achievements
  const handleUnlockAchievement = (achId: string) => {
    if (userProfile.achievementsUnlocked.includes(achId)) return;

    const nextAchievements = [...userProfile.achievementsUnlocked, achId];
    const updatedProfile: UserProfile = {
      ...userProfile,
      achievementsUnlocked: nextAchievements,
      xp: userProfile.xp + 50
    };
    saveProfileState(updatedProfile);

    setAchievements(achievements.map(a => {
      if (a.id === achId) {
        return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
      }
      return a;
    }));
  };

  // Change Profile Username
  const handleUpdateUsername = (newName: string) => {
    const updated = { ...userProfile, username: newName };
    saveProfileState(updated);
  };

  // Factory reset (clear state)
  const handleFactoryReset = () => {
    if (confirm('Tem certeza que deseja apagar todo o progresso do simulador? Isso restaurará o disco virtual e apagará o XP acumulado.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Launch text editor app on file click
  const handleOpenFileInEditor = (path: string) => {
    setActiveEditorFile(path);
    handleLaunchApp('editor');
  };

  // Select a mission from Trilha
  const handleSelectMission = (id: string) => {
    setActiveMissionId(id);
    // Auto-spawn academy if closed
    handleLaunchApp('academy');
  };

  // Active mission node
  const activeMissionNode = missions.find(m => m.id === activeMissionId) || null;

  // Custom visual theme styling variables
  const getThemeVars = () => {
    switch (settings.theme) {
      case 'matrix':
        return {
          taskbar: 'bg-black border-t border-[#00ff00] text-[#00ff00]',
          taskbarBtnActive: 'bg-[#002200] border border-[#00ff00] text-[#00ff00]',
          startBtn: 'bg-black text-[#00ff00] border border-[#00ff00] hover:bg-[#002200]',
          menu: 'bg-black border border-[#00ff00] text-[#00ff00]'
        };
      case 'cyberpunk':
        return {
          taskbar: 'bg-[#090312]/90 border-t border-pink-500 text-cyan-300 shadow-[0_-5px_15px_rgba(236,72,153,0.3)]',
          taskbarBtnActive: 'bg-pink-600/20 border border-pink-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.6)]',
          startBtn: 'bg-pink-600 hover:bg-pink-500 text-white font-black',
          menu: 'bg-[#0e041b]/95 border-2 border-pink-500 text-cyan-300 shadow-2xl'
        };
      case 'ubuntu':
        return {
          taskbar: 'bg-[#111111]/95 text-[#dfdbd2] border-t border-black',
          taskbarBtnActive: 'bg-[#e95420]/30 border-t-2 border-[#e95420] text-white',
          startBtn: 'bg-[#e95420] hover:bg-[#ff6c38] text-white font-bold',
          menu: 'bg-[#2c001e] text-white border border-[#111111] rounded-r-lg'
        };
      case 'cosmic':
        return {
          taskbar: 'bg-slate-950/85 backdrop-blur-md border-t border-indigo-500/30 text-indigo-200',
          taskbarBtnActive: 'bg-indigo-600/20 border border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]',
          startBtn: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold',
          menu: 'bg-slate-950/95 backdrop-blur-lg border border-indigo-500/30 text-indigo-100 rounded-lg shadow-2xl'
        };
      case 'kali':
        return {
          taskbar: 'bg-[#090d16]/95 border-t border-cyan-500/30 text-slate-100',
          taskbarBtnActive: 'bg-cyan-950/30 border-b-2 border-cyan-400 text-cyan-300 font-semibold',
          startBtn: 'bg-slate-900 border border-cyan-500/30 hover:bg-slate-800 text-cyan-400 font-bold',
          menu: 'bg-[#0f172a] border border-cyan-500/30 text-slate-100'
        };
      default: // minimal
        return {
          taskbar: 'bg-white border-t border-slate-200 text-slate-700 shadow-lg',
          taskbarBtnActive: 'bg-slate-100 border border-slate-300 text-slate-900',
          startBtn: 'bg-slate-900 hover:bg-slate-800 text-white font-semibold',
          menu: 'bg-white text-slate-800 border border-slate-200 rounded-lg shadow-2xl'
        };
    }
  };

  const t = getThemeVars();

  // If Shutdown lock screen
  if (isShutdown) {
    return (
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center p-6 select-none font-mono text-[#00ff00]">
        <Power className="w-16 h-16 text-red-500 animate-pulse mb-4" />
        <h1 className="text-xl font-bold uppercase tracking-wider mb-2">Computador Desligado</h1>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
          Você desligou o sistema de simulação do laboratório virtual Linux. Todos os dados permanecem salvos em seu cache local.
        </p>
        <button
          onClick={() => { setIsShutdown(false); setIsBooting(true); }}
          className="bg-[#003300] hover:bg-[#005500] border border-[#00ff00] text-[#00ff00] font-bold py-2 px-6 rounded cursor-pointer transition-colors text-xs uppercase tracking-widest"
        >
          Ligar Sistema (Boot)
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col font-sans select-none">
      
      {/* 1. KERNEL BOOT SEQUENCE SCREEN */}
      {isBooting && (
        <BootScreen onBootComplete={() => setIsBooting(false)} />
      )}

      {/* 2. OPERATING SYSTEM LOGIN MANAGER SCREEN */}
      {!isBooting && !isLoggedIn && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {/* 3. CORE LINUX DESKTOP ENVIRONMENT */}
      {!isBooting && isLoggedIn && (
        <>
          {/* Animated Canvas Background */}
          <AnimatedBackground theme={settings.theme} />

          {/* TOP BAR NOTIFICATION & QUICK STATUS TRILHA */}
          <div className="h-10 bg-slate-950/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 text-xs select-none relative z-40">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1 opacity-70 font-mono">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span>linux-lab: online</span>
              </span>

              {activeMissionNode && (
                <div 
                  onClick={() => handleLaunchApp('academy')}
                  className="hidden md:flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 px-2.5 py-0.5 rounded-full cursor-pointer transition-all animate-pulse"
                >
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>Tarefa Atual: <strong>{activeMissionNode.title}</strong></span>
                </div>
              )}
            </div>

            {/* Quick Metrics & Clock */}
            <div className="flex items-center space-x-4 font-mono">
              <div className="hidden lg:flex items-center gap-1 text-[10px] bg-slate-900/60 border border-white/5 px-2 py-0.5 rounded">
                <UserIcon className="w-3 h-3 opacity-60" />
                <span className="opacity-60">Logado:</span>
                <strong className="text-green-400">{userProfile.username}</strong>
                <span className="opacity-40">|</span>
                <span className="text-blue-400 font-bold">{userProfile.levelName}</span>
              </div>

              <div className="flex items-center space-x-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* DESKTOP SPACE (WORKSPACE GRID) */}
          <div className="flex-1 relative z-10 p-4 overflow-hidden" onClick={() => setStartMenuOpen(false)}>
            
            {/* Draggable/Selectable Icons Grid Column on Left */}
            <div className="flex flex-col gap-5 items-start max-h-[80%] w-24">
              
              {/* Icon 1: Academy */}
              <div
                onDoubleClick={() => handleLaunchApp('academy')}
                className="flex flex-col items-center text-center group cursor-pointer w-20 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Double click to open"
              >
                <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-1.5 shadow-lg group-hover:scale-105 transition-transform">
                  <CompassIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Academy (Estudo)
                </span>
              </div>

              {/* Icon 2: Terminal */}
              <div
                onDoubleClick={() => handleLaunchApp('terminal')}
                className="flex flex-col items-center text-center group cursor-pointer w-20 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Double click to open"
              >
                <div className="w-11 h-11 bg-slate-900/90 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 mb-1.5 shadow-lg group-hover:scale-105 transition-transform">
                  <TermIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Terminal (CLI)
                </span>
              </div>

              {/* Icon 3: File Manager */}
              <div
                onDoubleClick={() => handleLaunchApp('files')}
                className="flex flex-col items-center text-center group cursor-pointer w-20 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Double click to open"
              >
                <div className="w-11 h-11 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white mb-1.5 shadow-lg group-hover:scale-105 transition-transform">
                  <FolderIcon className="w-6 h-6 text-white fill-current" />
                </div>
                <span className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Meus Arquivos
                </span>
              </div>

              {/* Icon 4: System Monitor */}
              <div
                onDoubleClick={() => handleLaunchApp('monitor')}
                className="flex flex-col items-center text-center group cursor-pointer w-20 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Double click to open"
              >
                <div className="w-11 h-11 bg-gradient-to-tr from-rose-600 to-pink-600 rounded-xl flex items-center justify-center text-white mb-1.5 shadow-lg group-hover:scale-105 transition-transform">
                  <ActivityIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Monitor Sistema
                </span>
              </div>

              {/* Icon 5: Control Panel */}
              <div
                onDoubleClick={() => handleLaunchApp('settings')}
                className="flex flex-col items-center text-center group cursor-pointer w-20 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Double click to open"
              >
                <div className="w-11 h-11 bg-slate-800/90 rounded-xl flex items-center justify-center text-slate-300 mb-1.5 shadow-lg group-hover:scale-105 transition-transform">
                  <GearIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Configurações
                </span>
              </div>

            </div>

            {/* FLOATING WINDOWS RENDERER */}
            {windows.map(win => (
              <WindowFrame
                key={win.id}
                windowInstance={win}
                onClose={handleCloseWindow}
                onMinimize={handleMinimizeWindow}
                onMaximize={handleMaximizeWindow}
                onFocus={handleFocusWindow}
                onMove={handleMoveWindow}
                onResize={handleResizeWindow}
                theme={settings.theme}
              >
                {win.appId === 'terminal' && (
                  <TerminalApp
                    fs={fs}
                    onUpdateFS={saveFSState}
                    currentDir={currentDir}
                    onUpdateDir={setCurrentDir}
                    currentUser={userProfile.username}
                    activeMission={activeMissionNode}
                    allMissions={missions}
                    unlockedAchievements={userProfile.achievementsUnlocked}
                    onAddXP={(xp) => saveProfileState({ ...userProfile, xp: userProfile.xp + xp })}
                    onUnlockAchievement={handleUnlockAchievement}
                    onCompleteMission={handleCompleteMission}
                    onOpenFileInEditor={handleOpenFileInEditor}
                    settings={settings}
                    onClose={() => handleCloseWindow(win.id)}
                  />
                )}
                {win.appId === 'files' && (
                  <FileManagerApp
                    fs={fs}
                    onUpdateFS={saveFSState}
                    currentDir={currentDir}
                    onUpdateDir={setCurrentDir}
                    currentUser={userProfile.username}
                    onOpenFileInEditor={handleOpenFileInEditor}
                    settings={settings}
                  />
                )}
                {win.appId === 'editor' && (
                  <TextEditorApp
                    fs={fs}
                    onUpdateFS={saveFSState}
                    filePath={activeEditorFile}
                    currentUser={userProfile.username}
                    settings={settings}
                  />
                )}
                {win.appId === 'monitor' && (
                  <SystemMonitorApp
                    onCompleteMission={handleCompleteMission}
                    onAddXP={(xp) => saveProfileState({ ...userProfile, xp: userProfile.xp + xp })}
                    settings={settings}
                  />
                )}
                {win.appId === 'academy' && (
                  <AcademyApp
                    missions={missions}
                    activeMission={activeMissionNode}
                    onSelectMission={handleSelectMission}
                    settings={settings}
                  />
                )}
                {win.appId === 'settings' && (
                  <ControlPanelApp
                    settings={settings}
                    onUpdateSettings={saveSettingsState}
                    achievements={achievements}
                    userProfile={userProfile}
                    onUpdateUsername={handleUpdateUsername}
                  />
                )}
              </WindowFrame>
            ))}
          </div>

          {/* BOTTOM TASKBAR */}
          <div className={`h-12 border-t flex items-center justify-between px-3 relative z-50 select-none ${t.taskbar}`}>
            <div className="flex items-center space-x-1.5 h-full">
              
              {/* Start Menu trigger Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setStartMenuOpen(!startMenuOpen); }}
                className={`h-9 px-3.5 rounded flex items-center gap-1.5 text-xs font-bold transition-all shadow cursor-pointer ${t.startBtn}`}
              >
                <Menu className="w-4 h-4 shrink-0" />
                <span>Menu Iniciar</span>
              </button>

              <div className="h-6 w-px bg-current opacity-20 hidden md:block" />

              {/* Running apps indicators on taskbar */}
              <div className="hidden md:flex items-center space-x-1 h-full py-1">
                {windows.map(win => {
                  const isActive = !win.isMinimized;
                  return (
                    <button
                      key={win.id}
                      onClick={() => {
                        if (win.isMinimized) {
                          handleFocusWindow(win.id);
                        } else {
                          handleMinimizeWindow(win.id);
                        }
                      }}
                      className={`h-full px-3.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive ? t.taskbarBtnActive : 'opacity-50 hover:opacity-80 hover:bg-white/5'
                      }`}
                    >
                      {win.appId === 'terminal' && <TermIcon className="w-3.5 h-3.5" />}
                      {win.appId === 'files' && <FolderIcon className="w-3.5 h-3.5" />}
                      {win.appId === 'editor' && <FileIcon className="w-3.5 h-3.5" />}
                      {win.appId === 'monitor' && <ActivityIcon className="w-3.5 h-3.5" />}
                      {win.appId === 'academy' && <CompassIcon className="w-3.5 h-3.5 animate-spin-slow" />}
                      {win.appId === 'settings' && <GearIcon className="w-3.5 h-3.5" />}
                      <span className="truncate max-w-[100px]">{win.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tray (right side of taskbar) */}
            <div className="flex items-center space-x-3 text-xs opacity-80">
              <span className="hidden sm:flex items-center gap-1 font-semibold text-[10px] tracking-wide">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>SANDBOX PORT 3000</span>
              </span>
              <button 
                onClick={() => setStartMenuOpen(true)}
                className="p-1 rounded hover:bg-white/10 transition-colors shrink-0"
              >
                <Power className="w-4 h-4 text-red-500 hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* START MENU OVERLAY DRAWER */}
          {startMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-13 left-3 w-72 rounded-xl p-4 shadow-2xl z-50 flex flex-col space-y-4 animate-fade-in ${t.menu}`}
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  {userProfile.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold truncate max-w-[160px]">{userProfile.username}</h4>
                  <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{userProfile.levelName}</span>
                </div>
              </div>

              {/* App launcher items */}
              <div className="space-y-1">
                <button
                  onClick={() => handleLaunchApp('academy')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <CompassIcon className="w-4 h-4 text-blue-500" />
                  <span>Central de Aprendizado (Academy)</span>
                </button>
                <button
                  onClick={() => handleLaunchApp('terminal')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <TermIcon className="w-4 h-4 text-green-500" />
                  <span>Terminal Bash (CLI)</span>
                </button>
                <button
                  onClick={() => handleLaunchApp('files')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FolderIcon className="w-4 h-4 text-cyan-500" />
                  <span>Gerenciador de Arquivos</span>
                </button>
                <button
                  onClick={() => handleLaunchApp('editor')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileIcon className="w-4 h-4 text-amber-500" />
                  <span>Editor de Texto Gráfico</span>
                </button>
                <button
                  onClick={() => handleLaunchApp('monitor')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ActivityIcon className="w-4 h-4 text-rose-500" />
                  <span>Monitor de Sistema</span>
                </button>
                <button
                  onClick={() => handleLaunchApp('settings')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <GearIcon className="w-4 h-4 text-slate-400" />
                  <span>Painel de Controle</span>
                </button>
              </div>

              {/* Utility buttons */}
              <div className="border-t border-white/5 pt-3 space-y-1">
                <button
                  onClick={() => { setIsBooting(true); setStartMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 hover:text-yellow-400 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar Linux Lab</span>
                </button>
                <button
                  onClick={() => { setIsLoggedIn(false); setStartMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 hover:text-orange-400 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Fazer Log Out</span>
                </button>
                <button
                  onClick={() => { setIsShutdown(true); setStartMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 hover:text-red-400 text-left text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Power className="w-4 h-4 text-red-500" />
                  <span>Desligar Computador</span>
                </button>
                <button
                  onClick={handleFactoryReset}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-red-500 hover:bg-red-500/10 text-left text-[10px] font-bold transition-colors cursor-pointer mt-2"
                >
                  <span>[ RESTAURAR DE FÁBRICA ]</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
