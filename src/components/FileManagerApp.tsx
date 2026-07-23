import React, { useState } from 'react';
import { VirtualFile, OSSettings } from '../types';
import { 
  findNodeByPath, 
  modifyNodeChildren, 
  resolveAbsolutePath, 
  formatPermissions 
} from '../utils/fsHelper';
import { 
  Folder, 
  File, 
  ArrowLeft, 
  Home, 
  Plus, 
  FolderPlus, 
  Trash2, 
  ChevronRight, 
  User, 
  Calendar, 
  Info,
  ExternalLink
} from 'lucide-react';

interface FileManagerAppProps {
  fs: VirtualFile;
  onUpdateFS: (newFS: VirtualFile) => void;
  currentDir: string;
  onUpdateDir: (newDir: string) => void;
  currentUser: string;
  onOpenFileInEditor: (path: string) => void;
  settings: OSSettings;
}

export const FileManagerApp: React.FC<FileManagerAppProps> = ({
  fs,
  onUpdateFS,
  currentDir,
  onUpdateDir,
  currentUser,
  onOpenFileInEditor,
  settings
}) => {
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  // Get active node
  const activeNode = findNodeByPath(fs, currentDir);
  const items = activeNode && activeNode.type === 'dir' ? activeNode.children || [] : [];

  // Sort: folders first, then files
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'dir' ? -1 : 1;
  });

  const handleNavigate = (path: string) => {
    const resolved = resolveAbsolutePath(currentDir, path);
    onUpdateDir(resolved);
    setSelectedItemName(null);
  };

  const handleGoUp = () => {
    if (currentDir === '/') return;
    const idx = currentDir.lastIndexOf('/');
    const parentPath = currentDir.substring(0, idx) || '/';
    handleNavigate(parentPath);
  };

  const handleCreateFolder = () => {
    if (!newItemName.trim()) return;
    const name = newItemName.trim();

    if (items.some(item => item.name === name)) {
      alert('Uma pasta ou arquivo com este nome já existe.');
      return;
    }

    const newFolder: VirtualFile = {
      name,
      type: 'dir',
      permissions: 755,
      owner: currentUser,
      group: currentUser === 'root' ? 'root' : 'hacker',
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: []
    };

    const updatedFS = modifyNodeChildren(fs, currentDir, 'add', newFolder);
    onUpdateFS(updatedFS);
    setNewItemName('');
    setShowNewFolderModal(false);
  };

  const handleCreateFile = () => {
    if (!newItemName.trim()) return;
    const name = newItemName.trim();

    if (items.some(item => item.name === name)) {
      alert('Uma pasta ou arquivo com este nome já existe.');
      return;
    }

    const newFile: VirtualFile = {
      name,
      type: 'file',
      permissions: 644,
      owner: currentUser,
      group: currentUser === 'root' ? 'root' : 'hacker',
      size: 0,
      updatedAt: new Date().toISOString(),
      content: ''
    };

    const updatedFS = modifyNodeChildren(fs, currentDir, 'add', newFile);
    onUpdateFS(updatedFS);
    setNewItemName('');
    setShowNewFileModal(false);
  };

  const handleDeleteItem = (name: string) => {
    if (currentDir === '/' && (name === 'etc' || name === 'bin' || name === 'home' || name === 'var')) {
      alert('Não é possível remover diretórios vitais do sistema operacional!');
      return;
    }
    const updatedFS = modifyNodeChildren(fs, currentDir, 'remove', name);
    onUpdateFS(updatedFS);
    setSelectedItemName(null);
  };

  const getBreadcrumbs = () => {
    const parts = currentDir.split('/').filter(p => p !== '');
    return (
      <div className="flex items-center space-x-1.5 text-xs font-semibold select-none">
        <button 
          onClick={() => handleNavigate('/')}
          className="hover:text-blue-500 hover:underline flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          <Home className="w-3.5 h-3.5" />
          <span>raiz</span>
        </button>
        {parts.map((part, idx) => {
          const path = '/' + parts.slice(0, idx + 1).join('/');
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              <button
                onClick={() => handleNavigate(path)}
                className="hover:text-blue-500 hover:underline truncate max-w-[120px]"
              >
                {part}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const getStyleClasses = () => {
    const isDark = settings.theme !== 'minimal';
    return {
      bar: isDark ? 'bg-slate-900 border-b border-slate-800 text-slate-300' : 'bg-slate-50 border-b border-slate-200 text-slate-700',
      content: isDark ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800',
      panel: isDark ? 'bg-slate-900/60 border-l border-slate-800 text-slate-300' : 'bg-slate-50 border-l border-slate-200 text-slate-700',
      btn: isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700',
      itemHover: isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50',
      itemSelected: isDark ? 'bg-blue-950/40 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600',
      modal: isDark ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
    };
  };

  const s = getStyleClasses();
  const selectedNode = items.find(i => i.name === selectedItemName);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${s.content}`}>
      
      {/* Action and Navigation Toolbar */}
      <div className={`flex items-center justify-between px-3 py-2 shrink-0 ${s.bar}`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleGoUp}
            disabled={currentDir === '/'}
            className={`p-1.5 rounded transition-colors disabled:opacity-30 ${s.btn}`}
            title="Ir para o diretório pai"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="h-5 w-px bg-current opacity-20" />
          
          {getBreadcrumbs()}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-semibold ${s.btn}`}
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden md:inline">Nova Pasta</span>
          </button>
          <button
            onClick={() => setShowNewFileModal(true)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-semibold ${s.btn}`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Novo Arquivo</span>
          </button>
          {selectedItemName && (
            <button
              onClick={() => handleDeleteItem(selectedItemName)}
              className="p-1.5 rounded hover:bg-red-500/15 text-red-500 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          )}
        </div>
      </div>

      {/* Main File Explorer Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Grid List of items */}
        <div className="flex-1 overflow-auto p-4 select-none">
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40 py-10 space-y-2">
              <Folder className="w-12 h-12 stroke-[1.5]" />
              <p className="text-sm">Esta pasta está vazia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {sortedItems.map(item => {
                const isSelected = selectedItemName === item.name;
                const isFolder = item.type === 'dir';

                return (
                  <div
                    key={item.name}
                    onClick={() => setSelectedItemName(item.name)}
                    onDoubleClick={() => {
                      if (isFolder) {
                        handleNavigate(item.name);
                      } else {
                        onOpenFileInEditor(`${currentDir}/${item.name}`.replace(/\/+/g, '/'));
                      }
                    }}
                    className={`flex flex-col items-center text-center p-3 rounded-lg border border-transparent cursor-pointer transition-all ${
                      isSelected ? s.itemSelected + ' border-current' : s.itemHover
                    }`}
                  >
                    {isFolder ? (
                      <Folder className={`w-12 h-12 ${isSelected ? 'text-blue-500' : 'text-blue-400 opacity-90'} fill-current mb-2 shrink-0`} />
                    ) : (
                      <File className={`w-12 h-12 ${isSelected ? 'text-green-500' : 'text-green-400 opacity-90'} mb-2 shrink-0`} />
                    )}
                    <span className="text-xs font-semibold truncate w-full px-1 select-none">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        {selectedNode && (
          <div className={`w-64 border-l overflow-auto p-4 flex flex-col shrink-0 select-none ${s.panel}`}>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 opacity-70" />
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-80">Propriedades</h4>
            </div>

            <div className="flex flex-col items-center text-center mb-6 border-b border-white/5 pb-4">
              {selectedNode.type === 'dir' ? (
                <Folder className="w-16 h-16 text-blue-500 mb-2 fill-current opacity-80" />
              ) : (
                <File className="w-16 h-16 text-green-500 mb-2 opacity-80" />
              )}
              <h3 className="font-bold text-sm truncate max-w-full px-2">{selectedNode.name}</h3>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full mt-1.5 opacity-60 font-mono">
                {selectedNode.type === 'dir' ? 'Diretório' : 'Arquivo de Texto'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="opacity-60 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Dono:</span>
                <span className="font-semibold">{selectedNode.owner}:{selectedNode.group}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Permissões:</span>
                <span className="font-mono text-[11px] font-bold">{formatPermissions(selectedNode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Tamanho:</span>
                <span className="font-semibold">
                  {selectedNode.type === 'dir' ? `${selectedNode.children?.length || 0} itens` : `${selectedNode.size} bytes`}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="opacity-60 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Modificado em:</span>
                <span className="text-[10px] font-semibold">{new Date(selectedNode.updatedAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {selectedNode.type === 'file' && (
              <button
                onClick={() => onOpenFileInEditor(`${currentDir}/${selectedNode.name}`.replace(/\/+/g, '/'))}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir no Editor</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE MODALS */}
      {showNewFolderModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 select-none animate-fade-in">
          <div className={`p-4 rounded-lg w-full max-w-sm ${s.modal}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-blue-500" />
              <span>Criar Nova Pasta</span>
            </h3>
            <input
              type="text"
              placeholder="Digite o nome da pasta..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full text-sm bg-black/10 border border-white/10 rounded px-3 py-2 mb-4 outline-none focus:border-blue-500 font-sans"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => { setShowNewFolderModal(false); setNewItemName(''); }}
                className="px-3 py-1.5 rounded hover:bg-white/5 opacity-65 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded transition-colors"
              >
                Criar Pasta
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 select-none animate-fade-in">
          <div className={`p-4 rounded-lg w-full max-w-sm ${s.modal}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-green-500" />
              <span>Criar Novo Arquivo</span>
            </h3>
            <input
              type="text"
              placeholder="Ex: relatorio.txt, index.html..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full text-sm bg-black/10 border border-white/10 rounded px-3 py-2 mb-4 outline-none focus:border-green-500 font-sans"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => { setShowNewFileModal(false); setNewItemName(''); }}
                className="px-3 py-1.5 rounded hover:bg-white/5 opacity-65 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFile}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-1.5 rounded transition-colors"
              >
                Criar Arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
