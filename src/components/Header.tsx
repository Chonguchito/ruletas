import React from 'react';
import { Play, Plus, Volume2, VolumeX, Maximize2, Minimize2, Sparkles, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  wheelCount: number;
  spinningCount: number;
  onSpinAll: () => void;
  onAddWheel: () => void;
  onOpenTemplates: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wheelCount,
  spinningCount,
  onSpinAll,
  onAddWheel,
  onOpenTemplates,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const isAnySpinning = spinningCount > 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Zone (Single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
            Ruleta<span className="text-blue-600 dark:text-blue-400">Studio</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 font-medium">
            Multi-Lista
          </span>
        </div>

        {/* Zone 2: Clean Actions / Tools navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Explorar plantillas de ruletas"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Plantillas</span>
          </button>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="hidden sm:inline-flex p-2 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            aria-label="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Add Wheel Button */}
          <button
            type="button"
            onClick={onAddWheel}
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 active:scale-98 whitespace-nowrap"
            title="Añadir otra ruleta a la pantalla"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Nueva Ruleta</span>
          </button>

          {/* Master Spin All Wheels Button */}
          <button
            type="button"
            onClick={onSpinAll}
            disabled={isAnySpinning || wheelCount === 0}
            className={`px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-98 whitespace-nowrap ${
              isAnySpinning
                ? 'bg-amber-500 cursor-wait animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
            title="Girar todas las ruletas activas al mismo tiempo"
          >
            <Play className={`w-4 h-4 fill-current ${isAnySpinning ? 'animate-spin' : ''}`} />
            <span>
              {isAnySpinning
                ? 'Girando...'
                : wheelCount > 1
                ? `Girar todas (${wheelCount})`
                : 'Girar ruleta'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
