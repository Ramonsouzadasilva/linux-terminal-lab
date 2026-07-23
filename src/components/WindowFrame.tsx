import React, { useRef, useState, useEffect } from 'react';
import { WindowInstance, OSTheme } from '../types';
import { Minus, Square, X, Move } from 'lucide-react';

interface WindowFrameProps {
  windowInstance: WindowInstance;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  theme: OSTheme;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowInstance,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  theme,
  children
}) => {
  const { id, title, x, y, width, height, isMaximized, isMinimized, zIndex } = windowInstance;
  const headerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ w: 0, h: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Handle drag mouse/touch events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
        onMove(id, newX, newY);
      } else if (isResizing && !isMaximized) {
        const deltaW = e.clientX - initialPos.x;
        const deltaH = e.clientY - initialPos.y;
        const newW = Math.max(300, initialSize.w + deltaW);
        const newH = Math.max(200, initialSize.h + deltaH);
        onResize(id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, initialPos, initialSize, isMaximized, id, onMove, onResize]);

  if (isMinimized) return null;

  // Theme-specific styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return {
          window: 'bg-black border border-[#00ff00] text-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.3)] font-mono',
          header: 'border-b border-[#00ff00] bg-black text-[#00ff00]',
          btnX: 'hover:bg-[#003300] text-[#00ff00]',
          btnMinMax: 'hover:bg-[#003300] text-[#00ff00]',
          resize: 'bg-[#00ff00]'
        };
      case 'cyberpunk':
        return {
          window: 'bg-[#0f051d]/95 backdrop-blur-md border-2 border-pink-500 text-cyan-300 shadow-[0_0_20px_rgba(236,72,153,0.4)]',
          header: 'bg-pink-600 text-white border-b-2 border-pink-500 font-bold uppercase tracking-wider',
          btnX: 'hover:bg-red-500 text-white',
          btnMinMax: 'hover:bg-pink-700 text-white',
          resize: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
        };
      case 'ubuntu':
        return {
          window: 'bg-[#3c3b37] border border-[#2c2b27] text-[#dfdbd2] shadow-2xl rounded-lg overflow-hidden',
          header: 'bg-gradient-to-r from-[#111111] to-[#3c3b37] text-white py-1 px-3',
          btnX: 'bg-[#e95420] hover:bg-[#ff6a35] text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs',
          btnMinMax: 'bg-[#5e2750] hover:bg-[#7d396d] text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs',
          resize: 'bg-[#e95420]'
        };
      case 'kali':
        return {
          window: 'bg-[#0f172a]/95 backdrop-blur-md border border-cyan-500/30 text-slate-100 shadow-[0_10px_30px_rgba(6,182,212,0.15)] rounded-md',
          header: 'bg-slate-900 border-b border-cyan-500/30 text-cyan-400 font-semibold',
          btnX: 'hover:bg-red-950 hover:text-red-400 text-slate-400',
          btnMinMax: 'hover:bg-slate-800 text-cyan-400',
          resize: 'bg-cyan-500'
        };
      case 'cosmic':
        return {
          window: 'bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 text-slate-100 shadow-[0_10px_35px_rgba(99,102,241,0.25)] rounded-xl overflow-hidden',
          header: 'bg-gradient-to-r from-indigo-950 to-indigo-900 text-indigo-200 border-b border-indigo-500/40',
          btnX: 'hover:bg-red-500/20 hover:text-red-400 text-slate-400',
          btnMinMax: 'hover:bg-indigo-800/40 text-indigo-300',
          resize: 'bg-indigo-500'
        };
      default: // minimal
        return {
          window: 'bg-white border border-slate-200 text-slate-800 shadow-xl rounded-lg overflow-hidden',
          header: 'bg-slate-50 border-b border-slate-200 text-slate-700 font-medium',
          btnX: 'hover:bg-red-50 hover:text-red-600 text-slate-400',
          btnMinMax: 'hover:bg-slate-100 text-slate-600',
          resize: 'bg-slate-400'
        };
    }
  };

  const style = getThemeClasses();

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    onFocus(id);
    if (isMaximized) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(id);
    if (isMaximized) return;
    setIsResizing(true);
    setInitialSize({ w: width, h: height });
    setInitialPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      id={`window-${id}`}
      style={{
        position: 'absolute',
        left: isMaximized ? '0px' : `${x}px`,
        top: isMaximized ? '40px' : `${y}px`, // 40px under the top bar if maximized, or custom
        width: isMaximized ? '100%' : `${width}px`,
        height: isMaximized ? 'calc(100vh - 88px)' : `${height}px`, // Adjust for topbar and taskbar
        zIndex: zIndex
      }}
      onClick={() => onFocus(id)}
      className={`flex flex-col transition-shadow ${style.window} ${isDragging ? 'opacity-90 select-none' : ''}`}
    >
      {/* Title Bar */}
      <div
        ref={headerRef}
        onMouseDown={handleHeaderMouseDown}
        className={`flex items-center justify-between px-3 py-2 cursor-move select-none ${style.header}`}
      >
        <div className="flex items-center space-x-2 text-sm truncate font-medium">
          <span className="opacity-70 flex items-center justify-center p-0.5"><Move className="w-3 h-3" /></span>
          <span className="truncate">{title}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {theme === 'ubuntu' ? (
            // Ubuntu orange/purplish round dots
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                className={style.btnMinMax}
                title="Minimizar"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMaximize(id); }}
                className={style.btnMinMax}
                title="Maximizar"
              >
                <Square className="w-2 h-2" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(id); }}
                className={style.btnX}
                title="Fechar"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </>
          ) : (
            // Standard square action buttons
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                className={`p-1 rounded transition-colors ${style.btnMinMax}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMaximize(id); }}
                className={`p-1 rounded transition-colors ${style.btnMinMax}`}
              >
                <Square className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(id); }}
                className={`p-1 rounded transition-colors ${style.btnX}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* App Body Content */}
      <div className="flex-1 overflow-auto bg-inherit text-inherit relative flex flex-col">
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          ref={resizeRef}
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 select-none"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-50">
            <line x1="6" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" />
            <line x1="6" y1="3" x2="3" y2="6" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      )}
    </div>
  );
};
