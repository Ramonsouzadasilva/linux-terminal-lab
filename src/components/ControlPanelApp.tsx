import React, { useState } from 'react';
import { OSSettings, OSTheme, Achievement, UserProfile } from '../types';
import { 
  Sliders, 
  User, 
  Award, 
  Volume2, 
  VolumeX, 
  Type, 
  Monitor, 
  Calendar, 
  Cpu, 
  Compass, 
  Hash, 
  Edit3,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ControlPanelAppProps {
  settings: OSSettings;
  onUpdateSettings: (newSettings: OSSettings) => void;
  achievements: Achievement[];
  userProfile: UserProfile;
  onUpdateUsername: (name: string) => void;
}

export const ControlPanelApp: React.FC<ControlPanelAppProps> = ({
  settings,
  onUpdateSettings,
  achievements,
  userProfile,
  onUpdateUsername
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'achievements'>('profile');
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.username);

  const themes: Array<{ id: OSTheme; name: string; desc: string; colors: string }> = [
    { id: 'kali', name: 'Kali Linux Dark', desc: 'Preto e azul ciano cibernético de segurança', colors: 'from-slate-900 via-slate-950 to-cyan-500' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Roxo néon vibrante e luzes rosa choque', colors: 'from-purple-950 via-fuchsia-950 to-pink-500' },
    { id: 'ubuntu', name: 'Ubuntu Clássico', desc: 'Beringela e laranja clássico da Canonical', colors: 'from-purple-900 via-[#3c3b37] to-[#e95420]' },
    { id: 'matrix', name: 'Código Matrix', desc: 'Fundo preto puro com chuva de pixels verde terminal', colors: 'from-black via-slate-950 to-[#00ff00]' },
    { id: 'cosmic', name: 'Espacial Cosmic', desc: 'Estrelas cintilantes e nebulosas azul profundo', colors: 'from-slate-950 via-indigo-950 to-indigo-500' },
    { id: 'minimal', name: 'Clínico Minimal', desc: 'Paleta cinza-clara, de alta legibilidade profissional', colors: 'from-slate-50 via-slate-200 to-slate-400' }
  ];

  const handleThemeChange = (theme: OSTheme) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleSoundToggle = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleFontSizeChange = (size: number) => {
    onUpdateSettings({ ...settings, terminalFontSize: size });
  };

  const handleSaveUsername = () => {
    if (tempName.trim()) {
      onUpdateUsername(tempName.trim());
      setEditName(false);
    }
  };

  const getStyleClasses = () => {
    const isDark = settings.theme !== 'minimal';
    return {
      container: isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800',
      tabBar: isDark ? 'bg-slate-900/60 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-200',
      tabActive: isDark ? 'text-blue-400 border-blue-500 font-bold bg-black/20' : 'text-blue-600 border-blue-500 font-semibold bg-white',
      tabInactive: isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
      card: isDark ? 'bg-slate-900/60 border border-slate-800 rounded-xl p-4' : 'bg-slate-50 border border-slate-200 rounded-xl p-4',
      divider: isDark ? 'border-slate-800' : 'border-slate-200',
      input: isDark ? 'bg-slate-950 text-slate-100 border border-slate-800 rounded' : 'bg-white text-slate-800 border border-slate-200 rounded'
    };
  };

  const s = getStyleClasses();

  // XP level calculations
  const currentXP = userProfile.xp;
  const levelValue = Math.floor(currentXP / 1000) + 1;
  const xpInLevel = currentXP % 1000;
  const xpNeededForNext = 1000;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpNeededForNext) * 100));

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${s.container}`}>
      {/* Category Tabs */}
      <div className={`flex items-center px-4 shrink-0 border-b ${s.tabBar}`}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile' ? s.tabActive : s.tabInactive + ' border-transparent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>Perfil & Estatísticas</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'theme' ? s.tabActive : s.tabInactive + ' border-transparent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            <span>Personalização</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'achievements' ? s.tabActive : s.tabInactive + ' border-transparent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Conquistas ({achievements.filter(a => a.isUnlocked).length})</span>
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        
        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Left side: Avatar and name */}
            <div className={s.card}>
              <div className="flex flex-col items-center text-center pb-4 border-b border-white/5 mb-4">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-3">
                  {userProfile.username.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex items-center gap-2">
                  {editName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className={`text-sm px-2 py-1 outline-none ${s.input}`}
                        maxLength={15}
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveUsername}
                        className="bg-blue-600 text-white font-bold text-xs py-1 px-3 rounded cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-bold text-lg">{userProfile.username}</h2>
                      <button 
                        onClick={() => { setTempName(userProfile.username); setEditName(true); }}
                        className="p-1 rounded hover:bg-white/10 opacity-60 hover:opacity-100"
                        title="Editar nome"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1 select-none">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{userProfile.levelName}</span>
                </span>
              </div>

              {/* XP level slider */}
              <div className="space-y-2 select-none">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Nível Acadêmico {levelValue}</span>
                  <span className="opacity-70">{xpInLevel} / {xpNeededForNext} XP</span>
                </div>
                <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${xpPercent}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-500" />
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">Conclua missões de terminal para ganhar mais XP de Sysadmin!</p>
              </div>
            </div>

            {/* Right side: Stats */}
            <div className={s.card}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-80 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Métricas de Aprendizado</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/10 rounded-lg text-center">
                  <span className="text-[10px] opacity-60 uppercase font-bold block mb-1">XP Total</span>
                  <strong className="font-mono text-xl text-blue-400 font-black">{userProfile.xp}</strong>
                </div>
                <div className="p-3 bg-black/10 rounded-lg text-center">
                  <span className="text-[10px] opacity-60 uppercase font-bold block mb-1">Membro Desde</span>
                  <strong className="font-mono text-xs font-bold block truncate mt-1">
                    {new Date(userProfile.createdAt).toLocaleDateString('pt-BR')}
                  </strong>
                </div>
                <div className="p-3 bg-black/10 rounded-lg text-center">
                  <span className="text-[10px] opacity-60 uppercase font-bold block mb-1">Comandos</span>
                  <strong className="font-mono text-xl text-yellow-500 font-black">{userProfile.commandsExecuted}</strong>
                </div>
                <div className="p-3 bg-black/10 rounded-lg text-center">
                  <span className="text-[10px] opacity-60 uppercase font-bold block mb-1">Missões</span>
                  <strong className="font-mono text-xl text-green-500 font-black">
                    {userProfile.missionsCompleted.length} / 8
                  </strong>
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-4 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Plataforma Linux Sandbox de Segurança</span>
                <span>Porta 3000 Ingress</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMIZATION */}
        {activeTab === 'theme' && (
          <div className="space-y-6 animate-fade-in">
            {/* Theme Select */}
            <div className={s.card}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-80 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Escolha o Tema Visual do Desktop</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map(t => {
                  const isSelected = settings.theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-600/5' 
                          : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      {/* Color Dot swatch representation */}
                      <div className={`w-8 h-8 rounded bg-gradient-to-tr ${t.colors} shrink-0 shadow-inner`} />
                      <div>
                        <h4 className="font-bold text-xs">{t.name}</h4>
                        <p className="text-[10px] opacity-70 mt-0.5 leading-tight">{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sound */}
              <div className={s.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide">Efeitos Sonoros do Teclado</h4>
                    <p className="text-[10px] opacity-70 mt-0.5">Sons de digitação e bips de conclusão de conquistas</p>
                  </div>
                  <button
                    onClick={handleSoundToggle}
                    className={`p-2 rounded-lg transition-all border cursor-pointer ${
                      settings.soundEnabled 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* FontSize */}
              <div className={s.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide">Tamanho da Fonte do Terminal</h4>
                    <p className="text-[10px] opacity-70 mt-0.5">Defina a legibilidade da fonte monospace do bash</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {[12, 14, 16].map(sz => (
                      <button
                        key={sz}
                        onClick={() => handleFontSizeChange(sz)}
                        className={`w-8 h-8 rounded text-xs font-bold transition-all border cursor-pointer ${
                          settings.terminalFontSize === sz
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
            {achievements.map(a => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border flex gap-3.5 transition-all select-none ${
                  a.isUnlocked
                    ? 'bg-green-600/5 border-green-500/30'
                    : 'bg-white/5 border-white/5 opacity-55'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  a.isUnlocked 
                    ? 'bg-green-600/10 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.2)]' 
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <span>{a.title}</span>
                    {a.isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                  </h4>
                  <p className="text-[10px] opacity-70 mt-1 leading-normal">{a.description}</p>
                  {a.isUnlocked && a.unlockedAt && (
                    <span className="text-[8px] font-mono opacity-50 block mt-2">
                      Conquistado: {new Date(a.unlockedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
