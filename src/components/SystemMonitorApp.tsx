import React, { useState, useEffect } from 'react';
import { OSSettings, SystemProcess } from '../types';
import { ShieldAlert, Trash2, Cpu, HardDrive, Circle, CheckCircle } from 'lucide-react';

interface SystemMonitorAppProps {
  onCompleteMission: (id: string) => void;
  onAddXP: (xp: number) => void;
  settings: OSSettings;
}

export const SystemMonitorApp: React.FC<SystemMonitorAppProps> = ({
  onCompleteMission,
  onAddXP,
  settings
}) => {
  // Mock CPU, RAM, and Disk
  const [cpu, setCpu] = useState(24);
  const [ram, setRam] = useState(38);
  const [disk, setDisk] = useState(31);
  const [isMinerKilled, setIsMinerKilled] = useState(false);
  const [cpuHistory, setCpuHistory] = useState<number[]>([20, 25, 30, 22, 28, 24, 32, 28, 25, 24]);

  const [processes, setProcesses] = useState<SystemProcess[]>([
    { pid: 1, name: 'init', cpu: 0.1, mem: 0.2, status: 'running', user: 'root' },
    { pid: 200, name: 'systemd', cpu: 0.4, mem: 1.5, status: 'running', user: 'root' },
    { pid: 450, name: 'bash', cpu: 1.2, mem: 2.1, status: 'running', user: 'hacker' },
    { pid: 999, name: 'cryptominer', cpu: 78.4, mem: 15.2, status: 'running', user: 'hacker' },
    { pid: 1205, name: 'gnome-shell', cpu: 4.8, mem: 8.4, status: 'running', user: 'hacker' },
    { pid: 1342, name: 'nginx', cpu: 0.2, mem: 1.1, status: 'sleeping', user: 'www-data' }
  ]);

  // Update CPU & RAM periodically with random noise
  useEffect(() => {
    const interval = setInterval(() => {
      let baseCpu = isMinerKilled ? 12 : 75; // Miner consumes 60%+ CPU!
      const nextCpu = Math.max(5, Math.min(99, Math.floor(baseCpu + Math.random() * 10 - 5)));
      setCpu(nextCpu);

      let baseRam = isMinerKilled ? 22 : 38;
      const nextRam = Math.max(10, Math.min(95, Math.floor(baseRam + Math.random() * 4 - 2)));
      setRam(nextRam);

      setCpuHistory(prev => [...prev.slice(1), nextCpu]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isMinerKilled]);

  const handleKillProcess = (pid: number) => {
    if (pid === 999) {
      setIsMinerKilled(true);
      setProcesses(processes.filter(p => p.pid !== 999));
      onCompleteMission('m8');
      onAddXP(500);
      
      // Audio cue
      if (settings.soundEnabled) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.frequency.setValueAtTime(400, audioCtx.currentTime);
          osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } catch (e) {}
      }
    } else {
      setProcesses(processes.filter(p => p.pid !== pid));
    }
  };

  const getStyleClasses = () => {
    const isDark = settings.theme !== 'minimal';
    return {
      container: isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800',
      card: isDark ? 'bg-slate-900/60 border border-slate-800 rounded-lg p-4' : 'bg-slate-50 border border-slate-200 rounded-lg p-4',
      badge: isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200',
      badgeOk: isDark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-600 border border-green-200',
      tableHeader: isDark ? 'bg-slate-900 border-b border-slate-800 text-slate-400 font-bold' : 'bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold',
      tableRow: isDark ? 'border-b border-slate-900 hover:bg-slate-900/40' : 'border-b border-slate-100 hover:bg-slate-50'
    };
  };

  const s = getStyleClasses();

  return (
    <div className={`flex-1 flex flex-col h-full overflow-auto p-4 space-y-4 ${s.container}`}>
      {/* Alert Header if Miner is active */}
      {!isMinerKilled ? (
        <div className={`flex items-center justify-between p-3 rounded-lg ${s.badge}`}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Alerta de Sobrecarga</h3>
              <p className="text-xs opacity-80">Rogue Miner detectado consumindo CPU. ID do processo suspeito: <strong>999 (cryptominer)</strong>.</p>
            </div>
          </div>
          <button 
            onClick={() => handleKillProcess(999)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-xs transition-colors cursor-pointer"
          >
            Matar Processo
          </button>
        </div>
      ) : (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${s.badgeOk}`}>
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">Sistema Monitorado - Normalizado</h3>
            <p className="text-xs opacity-80">Rogue miner removido com sucesso. Processadores virtuais operando com segurança cibernética.</p>
          </div>
        </div>
      )}

      {/* Grid of hardware metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU */}
        <div className={s.card}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Processador (CPU)</span>
            </h3>
            <span className="font-mono text-sm font-bold">{cpu}%</span>
          </div>
          {/* Custom SVG Line Chart */}
          <div className="h-16 flex items-end justify-between bg-black/20 p-2 rounded gap-0.5 select-none">
            {cpuHistory.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${val}%` }}
                className={`w-full transition-all duration-300 rounded-t ${
                  val > 70 ? 'bg-red-500' : val > 40 ? 'bg-yellow-500' : 'bg-cyan-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* RAM */}
        <div className={s.card}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Circle className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Memória (RAM)</span>
            </h3>
            <span className="font-mono text-sm font-bold">{ram}%</span>
          </div>
          <div className="h-16 flex items-center justify-center">
            {/* Horizontal progress bar */}
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                style={{ width: `${ram}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  ram > 75 ? 'bg-red-500' : ram > 50 ? 'bg-yellow-500' : 'bg-indigo-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* virtual Disk */}
        <div className={s.card}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Disco Virtual (SSD)</span>
            </h3>
            <span className="font-mono text-sm font-bold">{disk}%</span>
          </div>
          <div className="h-16 flex items-center justify-center">
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                style={{ width: `${disk}%` }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Processes Table list */}
      <div className="flex-1 flex flex-col overflow-hidden border border-white/5 rounded-lg">
        <div className={`px-4 py-2 text-xs uppercase tracking-wider font-bold ${s.tableHeader}`}>
          Tabela de Processos Ativos
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b border-white/5 opacity-70 ${s.tableHeader}`}>
                <th className="p-3">PID</th>
                <th className="p-3">Processo</th>
                <th className="p-3 text-right">CPU</th>
                <th className="p-3 text-right">RAM</th>
                <th className="p-3">Usuário</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.pid} className={s.tableRow}>
                  <td className="p-3 font-mono font-semibold">{p.pid}</td>
                  <td className="p-3 font-mono font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.pid === 999 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                    {p.name}
                  </td>
                  <td className={`p-3 text-right font-mono font-bold ${p.pid === 999 ? 'text-red-400' : ''}`}>
                    {p.pid === 999 && !isMinerKilled ? cpu : p.cpu}%
                  </td>
                  <td className={`p-3 text-right font-mono ${p.pid === 999 ? 'text-red-400 font-bold' : ''}`}>
                    {p.pid === 999 && !isMinerKilled ? ram / 2 : p.mem}%
                  </td>
                  <td className="p-3 opacity-80">{p.user}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleKillProcess(p.pid)}
                      className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Finalizar Processo (SIGKILL)"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
