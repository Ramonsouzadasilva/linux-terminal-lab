import React, { useState } from 'react';
import { Mission, OSSettings } from '../types';
import { Award, CheckCircle2, Circle, HelpCircle, BookOpen, ChevronRight, Lock, Sparkles, Compass } from 'lucide-react';

interface AcademyAppProps {
  missions: Mission[];
  activeMission: Mission | null;
  onSelectMission: (id: string) => void;
  settings: OSSettings;
}

export const AcademyApp: React.FC<AcademyAppProps> = ({
  missions,
  activeMission,
  onSelectMission,
  settings
}) => {
  const [showHint, setShowHint] = useState(false);

  // Group missions by level
  const level1Missions = missions.filter(m => m.level === 1);
  const level2Missions = missions.filter(m => m.level === 2);
  const level3Missions = missions.filter(m => m.level === 3);

  const getStyleClasses = () => {
    const isDark = settings.theme !== 'minimal';
    return {
      container: isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800',
      card: isDark ? 'bg-slate-900 border border-slate-800 rounded-xl p-4' : 'bg-slate-50 border border-slate-200 rounded-xl p-4',
      cardActive: isDark ? 'bg-blue-950/20 border-2 border-blue-500 rounded-xl p-5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-blue-50/50 border-2 border-blue-400 rounded-xl p-5',
      roadmapLine: isDark ? 'border-l-2 border-slate-800' : 'border-l-2 border-slate-200',
      roadmapActive: isDark ? 'border-l-2 border-blue-500 animate-pulse' : 'border-l-2 border-blue-400',
      badgeLock: isDark ? 'bg-slate-900/80 text-slate-500 border border-slate-800/40' : 'bg-slate-100 text-slate-400 border border-slate-200'
    };
  };

  const s = getStyleClasses();

  const handleSelect = (id: string) => {
    onSelectMission(id);
    setShowHint(false);
  };

  // Check locking conditions
  const isLevel2Locked = level1Missions.some(m => !m.isCompleted);
  const isLevel3Locked = isLevel2Locked || level2Missions.some(m => !m.isCompleted);

  // Stats
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.isCompleted).length;
  const progressPercent = Math.round((completedMissions / totalMissions) * 100);

  return (
    <div className={`flex-1 flex flex-col md:flex-row h-full overflow-hidden ${s.container}`}>
      
      {/* Left side: ROADMAP TIMELINE */}
      <div className="flex-1 overflow-auto p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-6">
        
        {/* Course Progress header */}
        <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl select-none">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Trilha de Estudos Linux</h2>
              <p className="text-xs opacity-70">{completedMissions} de {totalMissions} missões finalizadas</p>
            </div>
          </div>
          <div className="text-right font-mono font-bold text-lg text-blue-500">
            {progressPercent}%
          </div>
        </div>

        {/* Level 1: Beginner Linux */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">Nível 1</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-400">Fundamentos do Terminal</h3>
          </div>

          <div className={`pl-4 ${s.roadmapLine} space-y-4`}>
            {level1Missions.map(m => (
              <div 
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                  activeMission?.id === m.id 
                    ? 'bg-blue-600/10 border border-blue-500' 
                    : m.isCompleted 
                    ? 'hover:bg-slate-900/35 border border-transparent' 
                    : 'hover:bg-slate-900/20 opacity-85 border border-transparent'
                }`}
              >
                {m.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-bold ${m.isCompleted ? 'line-through opacity-60' : ''}`}>{m.title}</h4>
                  <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level 2: Advanced User */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none">
            <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
              isLevel2Locked 
                ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>Nível 2</span>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLevel2Locked ? 'text-slate-500' : 'text-yellow-400'}`}>
              <span>Permissões e Auditoria de Redes</span>
              {isLevel2Locked && <Lock className="w-3.5 h-3.5" />}
            </h3>
          </div>

          <div className={`pl-4 ${s.roadmapLine} space-y-4`}>
            {isLevel2Locked ? (
              <p className="text-xs text-slate-500 italic select-none">Conclua o Nível 1 para desbloquear estas tarefas avançadas.</p>
            ) : (
              level2Missions.map(m => (
                <div 
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                    activeMission?.id === m.id 
                      ? 'bg-blue-600/10 border border-blue-500' 
                      : m.isCompleted 
                      ? 'hover:bg-slate-900/35 border border-transparent' 
                      : 'hover:bg-slate-900/20 opacity-85 border border-transparent'
                  }`}
                >
                  {m.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`text-sm font-bold ${m.isCompleted ? 'line-through opacity-60' : ''}`}>{m.title}</h4>
                    <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{m.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Level 3: Admin / Cybersecurity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none">
            <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
              isLevel3Locked 
                ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>Nível 3</span>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLevel3Locked ? 'text-slate-500' : 'text-red-400'}`}>
              <span>Administração & Scripts de Segurança</span>
              {isLevel3Locked && <Lock className="w-3.5 h-3.5" />}
            </h3>
          </div>

          <div className={`pl-4 space-y-4`}>
            {isLevel3Locked ? (
              <p className="text-xs text-slate-500 italic select-none">Conclua o Nível 2 para desbloquear a administração de sistemas e segurança.</p>
            ) : (
              level3Missions.map(m => (
                <div 
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                    activeMission?.id === m.id 
                      ? 'bg-blue-600/10 border border-blue-500' 
                      : m.isCompleted 
                      ? 'hover:bg-slate-900/35 border border-transparent' 
                      : 'hover:bg-slate-900/20 opacity-85 border border-transparent'
                  }`}
                >
                  {m.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`text-sm font-bold ${m.isCompleted ? 'line-through opacity-60' : ''}`}>{m.title}</h4>
                    <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{m.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right side: ACTIVE MISSION DETAIL PANEL */}
      <div className="w-full md:w-80 overflow-auto p-4 md:p-6 shrink-0 bg-black/10">
        {activeMission ? (
          <div className={s.cardActive}>
            <div className="flex items-center gap-2 mb-4 select-none">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-85 text-blue-500">Missão Ativa</h3>
            </div>

            <h2 className="font-bold text-lg leading-tight mb-2">{activeMission.title}</h2>
            <p className="text-xs opacity-95 mb-4 leading-relaxed">{activeMission.description}</p>

            <div className="bg-black/30 p-3 rounded-lg mb-4 select-none">
              <h4 className="text-[10px] font-bold uppercase opacity-60 tracking-wide mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Instruções Técnicas</span>
              </h4>
              <p className="text-xs leading-normal">{activeMission.instruction}</p>
            </div>

            <div className="flex items-center justify-between mb-4 select-none">
              <span className="text-xs opacity-60">Recompensa:</span>
              <span className="text-xs font-bold bg-green-500/15 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-mono">
                +{activeMission.xpReward} XP
              </span>
            </div>

            {/* HINT */}
            <div className="mb-6">
              {showHint ? (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs leading-relaxed animate-fade-in select-text">
                  <strong>Dica de Comando:</strong> {activeMission.hint}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="w-full border border-dashed border-white/20 hover:border-white/40 text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-slate-400 hover:text-white cursor-pointer select-none"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Precisa de Ajuda? Ver Dica</span>
                </button>
              )}
            </div>

            {activeMission.isCompleted ? (
              <div className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-xs flex items-center justify-center gap-2 select-none">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tarefa Completada!</span>
              </div>
            ) : (
              <div className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-xs text-center select-none shadow-lg animate-pulse">
                Execute a instrução no terminal para progredir!
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-45 py-10 space-y-3 select-none">
            <Award className="w-12 h-12 text-slate-400 stroke-[1.5]" />
            <div>
              <p className="text-sm font-bold">Nenhuma Missão Ativa</p>
              <p className="text-xs mt-1">Selecione uma das missões da trilha ao lado para começar seu aprendizado.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
