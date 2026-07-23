import React, { useState, useEffect } from 'react';
import { VirtualFile, OSSettings } from '../types';
import { findNodeByPath, modifyNodeChildren } from '../utils/fsHelper';
import { Save, FileText, CheckCircle } from 'lucide-react';

interface TextEditorAppProps {
  fs: VirtualFile;
  onUpdateFS: (newFS: VirtualFile) => void;
  filePath: string; // The absolute path of the file we are editing
  onCloseEditor?: () => void;
  currentUser: string;
  settings: OSSettings;
}

export const TextEditorApp: React.FC<TextEditorAppProps> = ({
  fs,
  onUpdateFS,
  filePath,
  onCloseEditor,
  currentUser,
  settings
}) => {
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Load file content on path change
  useEffect(() => {
    if (!filePath) return;
    const fileNode = findNodeByPath(fs, filePath);
    if (fileNode && fileNode.type === 'file') {
      const text = fileNode.content || '';
      setContent(text);
      setIsSaved(true);
    }
  }, [filePath, fs]);

  // Track lines and chars
  useEffect(() => {
    setLineCount(content === '' ? 0 : content.split('\n').length);
    setCharCount(content.length);
  }, [content]);

  const handleSave = () => {
    if (!filePath) return;

    const parentPath = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

    const existingFile = findNodeByPath(fs, filePath);

    const updatedFile: VirtualFile = {
      name: fileName,
      type: 'file',
      permissions: existingFile?.permissions || 644,
      owner: existingFile?.owner || currentUser,
      group: existingFile?.group || (currentUser === 'root' ? 'root' : 'hacker'),
      size: content.length,
      updatedAt: new Date().toISOString(),
      content: content
    };

    const updatedFS = modifyNodeChildren(fs, parentPath, 'add', updatedFile);
    onUpdateFS(updatedFS);
    setIsSaved(true);

    // Audio cue
    if (settings.soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  const getStyleClasses = () => {
    const isDark = settings.theme !== 'minimal';
    return {
      bar: isDark ? 'bg-slate-900 border-b border-slate-800 text-slate-300' : 'bg-slate-50 border-b border-slate-200 text-slate-700',
      editor: isDark ? 'bg-slate-950 text-slate-100 font-mono' : 'bg-white text-slate-800 font-sans border border-slate-200',
      status: isDark ? 'bg-slate-900 border-t border-slate-800 text-slate-400' : 'bg-slate-50 border-t border-slate-200 text-slate-500',
      input: isDark ? 'bg-slate-950 text-slate-100 focus:ring-0 border-none' : 'bg-white text-slate-800 focus:ring-0 border-none'
    };
  };

  const s = getStyleClasses();
  const fileName = filePath ? filePath.substring(filePath.lastIndexOf('/') + 1) : 'Sem título';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2 shrink-0 ${s.bar}`}>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold truncate max-w-[200px]">{fileName}</span>
          {!isSaved && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 font-bold px-1.5 py-0.5 rounded-full select-none">
              Modificado
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsSaved(false);
        }}
        className={`flex-1 p-4 resize-none outline-none border-none text-sm leading-relaxed ${s.editor}`}
        spellCheck="false"
        placeholder="Escreva algo ou insira comandos Linux..."
      />

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-4 py-1.5 text-[10px] shrink-0 font-medium ${s.status}`}>
        <div className="flex items-center gap-3">
          <span>Linhas: <strong className="font-semibold">{lineCount}</strong></span>
          <span>Caracteres: <strong className="font-semibold">{charCount}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          {isSaved ? (
            <span className="text-green-500 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>Salvo no disco virtual</span>
            </span>
          ) : (
            <span className="text-yellow-500 font-semibold">Alterações pendentes...</span>
          )}
        </div>
      </div>
    </div>
  );
};
