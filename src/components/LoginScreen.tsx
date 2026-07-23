import React, { useState } from 'react';
import { Terminal, Shield, Lock, Eye, EyeOff, UserPlus, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('hacker');
  const [password, setPassword] = useState('linux');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (isRegistering) {
      // Save custom registered credentials in LocalStorage
      localStorage.setItem(`user_${username.trim()}`, password.trim());
      setErrorMsg('');
      setIsRegistering(false);
      alert(`Usuário "${username.trim()}" cadastrado com sucesso! Agora faça login.`);
      return;
    }

    // Validation
    const defaultUser = 'hacker';
    const defaultPass = 'linux';

    const storedPass = localStorage.getItem(`user_${username.trim()}`);

    if (username.trim() === defaultUser && password.trim() === defaultPass) {
      onLoginSuccess(username.trim());
    } else if (storedPass && storedPass === password.trim()) {
      onLoginSuccess(username.trim());
    } else {
      setErrorMsg('Credenciais inválidas! Use hacker / linux ou registre uma nova conta.');
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
      
      {/* Background glowing rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      
      {/* Login Box */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 relative z-10 text-slate-100 flex flex-col space-y-6">
        
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-sans uppercase tracking-wider text-slate-100">Linux Security Lab</h1>
          <p className="text-xs text-cyan-400 mt-1 font-semibold">Simulador Operacional de Aprendizado</p>
        </div>

        {/* Credentials reminder */}
        {!isRegistering && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center text-xs">
            <span className="opacity-60 block">Acesso Inicial Padrão:</span>
            <div className="font-mono mt-1 font-bold text-cyan-400">
              Usuário: <span className="text-slate-100 bg-white/5 px-1.5 py-0.5 rounded mr-2">hacker</span> 
              Senha: <span className="text-slate-100 bg-white/5 px-1.5 py-0.5 rounded">linux</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Nome de Usuário</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Terminal className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Ex: hacker_dev"
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 transition-colors font-sans"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Senha de Segurança</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira sua senha"
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg py-2 pl-9 pr-10 text-sm outline-none focus:border-cyan-500 transition-colors font-sans"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold text-center select-text">
              {errorMsg}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            {isRegistering ? 'Cadastrar Hacker' : 'Fazer Login'}
          </button>
        </form>

        {/* Register switcher link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
              if (!isRegistering) {
                setUsername('');
                setPassword('');
              } else {
                setUsername('hacker');
                setPassword('linux');
              }
            }}
            className="text-xs text-cyan-400 hover:underline flex items-center justify-center gap-1.5 mx-auto select-none"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isRegistering ? 'Já tenho usuário, ir para login' : 'Cadastrar novo usuário no disco local'}</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] opacity-40 select-none">
          Linux virtual sandbox powered by React 19 • Local Storage Persisted
        </div>
      </div>
    </div>
  );
};
