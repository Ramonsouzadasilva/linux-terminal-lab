export type FileType = 'file' | 'dir';

export interface VirtualFile {
  name: string;
  type: FileType;
  content?: string;
  children?: VirtualFile[];
  permissions: number; // e.g., 755 (octal-like number representation)
  owner: string;
  group: string;
  size: number;
  updatedAt: string;
}

export interface WindowInstance {
  id: string;
  title: string;
  appId: string; // 'terminal' | 'files' | 'editor' | 'monitor' | 'academy' | 'dashboard' | 'settings'
  isOpen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Mission {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  description: string;
  instruction: string;
  hint: string;
  xpReward: number;
  isCompleted: boolean;
  validationCheck: (fs: VirtualFile, currentDir: string, lastCommand: string, lastArgs: string[], output: string) => boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  username: string;
  levelName: string; // e.g., "Iniciante Linux", "Administrador"
  xp: number;
  commandsExecuted: number;
  missionsCompleted: string[]; // missionIds
  achievementsUnlocked: string[]; // achievementIds
  timeSpentSeconds: number;
  createdAt: string;
}

export type OSTheme = 'kali' | 'cyberpunk' | 'ubuntu' | 'matrix' | 'minimal' | 'cosmic';

export interface OSSettings {
  theme: OSTheme;
  terminalFontSize: number;
  terminalFontFamily: string;
  soundEnabled: boolean;
  wallpaper: string;
}

export interface SystemProcess {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  status: 'running' | 'sleeping' | 'stopped';
  user: string;
}
