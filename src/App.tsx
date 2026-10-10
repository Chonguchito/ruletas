/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wheel, WheelItem, WheelTemplate, WinnerRecord } from './types/wheel';
import { Header } from './components/Header';
import { WheelCard } from './components/WheelCard';
import { WinnerModal } from './components/WinnerModal';
import { BatchWinnerModal, BatchSpinResult } from './components/BatchWinnerModal';
import { TemplateModal } from './components/TemplateModal';
import { soundManager } from './utils/audio';
import { getPaletteColor } from './utils/colors';
import { MULTI_WHEEL_PRESETS } from './utils/templates';
import { Plus, Sparkles, RotateCcw, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'multi_wheel_studio_state_v1';

// Initial default wheels showcasing multi-wheel capability right away
const INITIAL_WHEELS: Wheel[] = [
  {
    id: 'wheel_participants',
    title: 'Participantes',
    items: [
      { id: 'p_1', text: 'Ana', color: '#3b82f6', weight: 1, enabled: true },
      { id: 'p_2', text: 'Carlos', color: '#10b981', weight: 1, enabled: true },
      { id: 'p_3', text: 'Lucía', color: '#f59e0b', weight: 1, enabled: true },
      { id: 'p_4', text: 'Mateo', color: '#ef4444', weight: 1, enabled: true },
      { id: 'p_5', text: 'Valentina', color: '#8b5cf6', weight: 1, enabled: true },
      { id: 'p_6', text: 'Santiago', color: '#06b6d4', weight: 1, enabled: true },
      { id: 'p_7', text: 'Sofía', color: '#ec4899', weight: 1, enabled: true },
      { id: 'p_8', text: 'Martín', color: '#14b8a6', weight: 1, enabled: true },
    ],
    currentAngle: 0,
    isSpinning: false,
    winnerHistory: [],
    theme: 'modern',
  },
  {
    id: 'wheel_prizes',
    title: 'Premios y Tareas',
    items: [
      { id: 'pr_1', text: 'Premio Mayor', color: '#f59e0b', weight: 1, enabled: true },
      { id: 'pr_2', text: 'Descuento 20%', color: '#3b82f6', weight: 1, enabled: true },
      { id: 'pr_3', text: 'Café de cortesía', color: '#10b981', weight: 1, enabled: true },
      { id: 'pr_4', text: 'Premio Sorpresa', color: '#8b5cf6', weight: 1, enabled: true },
      { id: 'pr_5', text: 'Sigue participando', color: '#ef4444', weight: 1, enabled: true },
      { id: 'pr_6', text: 'Stickers del evento', color: '#ec4899', weight: 1, enabled: true },
    ],
    currentAngle: 0,
    isSpinning: false,
    winnerHistory: [],
    theme: 'modern',
  },
];

export default function App() {
  const [wheels, setWheels] = useState<Wheel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reset spinning status on load and validate items structure
          return parsed.map((w: any, idx: number) => ({
            id: w?.id || `wheel_${idx}_${Date.now()}`,
            title: w?.title || `Ruleta ${idx + 1}`,
            items: Array.isArray(w?.items)
              ? w.items.map((it: any, itemIdx: number) => ({
                  id: it?.id || `item_${itemIdx}`,
                  text: it?.text ?? `Opción ${itemIdx + 1}`,
                  color: it?.color ?? '#3b82f6',
                  weight: typeof it?.weight === 'number' ? it.weight : 1,
                  enabled: it?.enabled !== false,
                }))
              : [],
            currentAngle: typeof w?.currentAngle === 'number' ? w.currentAngle : 0,
            isSpinning: false,
            winnerHistory: Array.isArray(w?.winnerHistory) ? w.winnerHistory : [],
            theme: w?.theme || 'modern',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_WHEELS;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('multi_wheel_theme_dark');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Winner modal states
  const [singleWinner, setSingleWinner] = useState<{
    wheelId: string;
    wheelTitle: string;
    winnerItem: WheelItem;
  } | null>(null);

  const [batchResults, setBatchResults] = useState<BatchSpinResult[]>([]);
  const [isBatchSpinning, setIsBatchSpinning] = useState<boolean>(false);
  const pendingBatchResultsRef = useRef<Map<string, BatchSpinResult>>(new Map());
  const expectedBatchCountRef = useRef<number>(0);

  // Sync dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('multi_wheel_theme_dark', 'true');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('multi_wheel_theme_dark', 'false');
      } catch {}
    }
  }, [isDarkMode]);

  // Persist wheels changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wheels));
    } catch {
      // Ignore quota errors
    }
  }, [wheels]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleMute = () => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
  };

  // Add new wheel
  const handleAddWheel = useCallback(() => {
    const newIndex = wheels.length + 1;
    const newWheel: Wheel = {
      id: 'wheel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: `Ruleta ${newIndex}`,
      items: [
        { id: 'i1', text: 'Opción 1', color: getPaletteColor('modern', 0), weight: 1, enabled: true },
        { id: 'i2', text: 'Opción 2', color: getPaletteColor('modern', 1), weight: 1, enabled: true },
        { id: 'i3', text: 'Opción 3', color: getPaletteColor('modern', 2), weight: 1, enabled: true },
        { id: 'i4', text: 'Opción 4', color: getPaletteColor('modern', 3), weight: 1, enabled: true },
      ],
      currentAngle: 0,
      isSpinning: false,
      winnerHistory: [],
      theme: 'modern',
    };
    setWheels((prev) => [...prev, newWheel]);
  }, [wheels.length]);

  // Duplicate wheel
  const handleDuplicateWheel = (wheel: Wheel) => {
    const duplicated: Wheel = {
      ...wheel,
      id: 'wheel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: `${wheel.title} (Copia)`,
      isSpinning: false,
      winnerHistory: [],
      items: wheel.items.map((it) => ({
        ...it,
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      })),
    };
    setWheels((prev) => [...prev, duplicated]);
  };

  // Delete wheel
  const handleDeleteWheel = (wheelId: string) => {
    if (wheels.length <= 1) return;
    setWheels((prev) => prev.filter((w) => w.id !== wheelId));
  };

  // Update a single wheel
  const handleUpdateWheel = (updated: Wheel) => {
    setWheels((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  // Spin a single wheel
  const handleSpinSingle = (wheelId: string) => {
    setWheels((prev) =>
      prev.map((w) => (w.id === wheelId ? { ...w, isSpinning: true } : w))
    );
  };

  // Spin all wheels simultaneously
  const handleSpinAll = () => {
    // Only spin wheels that have at least 2 enabled items
    const spinnableWheels = wheels.filter(
      (w) => w.items.filter((it) => it.enabled).length >= 2
    );

    if (spinnableWheels.length === 0) return;

    if (spinnableWheels.length === 1) {
      handleSpinSingle(spinnableWheels[0].id);
      return;
    }

    setIsBatchSpinning(true);
    expectedBatchCountRef.current = spinnableWheels.length;
    pendingBatchResultsRef.current.clear();

    setWheels((prev) =>
      prev.map((w) => {
        const canSpin = w.items.filter((it) => it.enabled).length >= 2;
        return canSpin ? { ...w, isSpinning: true } : w;
      })
    );
  };

  // When a wheel finishes spinning
  const handleSpinEnd = (wheelId: string, winner: WheelItem) => {
    const wheel = wheels.find((w) => w.id === wheelId);
    const wheelTitle = wheel?.title || 'Ruleta';

    // Record winner in history
    const winnerRecord: WinnerRecord = {
      id: 'win_' + Date.now(),
      itemId: winner.id,
      text: winner.text,
      timestamp: Date.now(),
    };

    setWheels((prev) =>
      prev.map((w) =>
        w.id === wheelId
          ? {
              ...w,
              isSpinning: false,
              winnerHistory: [winnerRecord, ...(w.winnerHistory || [])],
            }
          : w
      )
    );

    if (isBatchSpinning) {
      pendingBatchResultsRef.current.set(wheelId, {
        wheelId,
        wheelTitle,
        winnerItem: winner,
      });

      if (pendingBatchResultsRef.current.size >= expectedBatchCountRef.current) {
        // All batch wheels finished!
        const allResults = Array.from(pendingBatchResultsRef.current.values());
        setIsBatchSpinning(false);
        setBatchResults(allResults);
      }
    } else {
      // Single wheel finished
      setSingleWinner({
        wheelId,
        wheelTitle,
        winnerItem: winner,
      });
    }
  };

  // Keep single winner
  const handleKeepSingleWinner = () => {
    setSingleWinner(null);
  };

  // Remove single winner from list
  const handleRemoveSingleWinner = () => {
    if (!singleWinner) return;
    const { wheelId, winnerItem } = singleWinner;

    setWheels((prev) =>
      prev.map((w) =>
        w.id === wheelId
          ? {
              ...w,
              items: w.items.filter((it) => it.id !== winnerItem.id),
            }
          : w
      )
    );
    setSingleWinner(null);
  };

  // Batch actions
  const handleKeepAllBatch = () => {
    setBatchResults([]);
  };

  const handleRemoveAllBatch = () => {
    if (batchResults.length === 0) return;
    const removalsByWheel: Record<string, string> = {};
    batchResults.forEach((r) => {
      removalsByWheel[r.wheelId] = r.winnerItem.id;
    });

    setWheels((prev) =>
      prev.map((w) => {
        const itemToRemove = removalsByWheel[w.id];
        if (itemToRemove) {
          return {
            ...w,
            items: w.items.filter((it) => it.id !== itemToRemove),
          };
        }
        return w;
      })
    );
    setBatchResults([]);
  };

  const handleDecideIndividualBatch = (decisions: Record<string, 'keep' | 'remove'>) => {
    setWheels((prev) =>
      prev.map((w) => {
        const decision = decisions[w.id];
        if (decision === 'remove') {
          const matchResult = batchResults.find((r) => r.wheelId === w.id);
          if (matchResult) {
            return {
              ...w,
              items: w.items.filter((it) => it.id !== matchResult.winnerItem.id),
            };
          }
        }
        return w;
      })
    );
    setBatchResults([]);
  };

  // Template loaders
  const handleLoadSingleTemplate = (template: WheelTemplate, asNew: boolean) => {
    const paletteKey = 'modern';
    const newItems: WheelItem[] = template.items.map((text, idx) => ({
      id: 'item_' + Date.now() + '_' + idx,
      text,
      color: getPaletteColor(paletteKey, idx),
      weight: 1,
      enabled: true,
    }));

    if (asNew) {
      const newWheel: Wheel = {
        id: 'wheel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: template.title,
        items: newItems,
        currentAngle: 0,
        isSpinning: false,
        winnerHistory: [],
        theme: paletteKey,
      };
      setWheels((prev) => [...prev, newWheel]);
    } else {
      // Replace first wheel
      setWheels((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          title: template.title,
          items: newItems,
          winnerHistory: [],
        };
        return updated;
      });
    }
  };

  const handleLoadMultiBundle = (bundle: (typeof MULTI_WHEEL_PRESETS)[0]) => {
    const newWheels: Wheel[] = bundle.wheels.map((w, wIdx) => {
      const paletteKey = wIdx % 2 === 0 ? 'modern' : 'warm';
      return {
        id: 'wheel_' + Date.now() + '_' + wIdx,
        title: w.title,
        items: w.items.map((text, idx) => ({
          id: 'item_' + Date.now() + '_' + wIdx + '_' + idx,
          text,
          color: getPaletteColor(paletteKey, idx),
          weight: 1,
          enabled: true,
        })),
        currentAngle: 0,
        isSpinning: false,
        winnerHistory: [],
        theme: paletteKey,
      };
    });

    setWheels(newWheels);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Deseas reiniciar todas las ruletas a los valores iniciales?')) {
      setWheels(INITIAL_WHEELS);
    }
  };

  const spinningCount = wheels.filter((w) => w.isSpinning).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors">
      {/* Top Bar Header */}
      <Header
        wheelCount={wheels.length}
        spinningCount={spinningCount}
        onSpinAll={handleSpinAll}
        onAddWheel={handleAddWheel}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Sub-header instruction banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tablero de Ruletas Múltiples
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Puedes girar cada ruleta por separado o usar el botón superior para girar todas a la vez.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleAddWheel}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Ruleta</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              title="Restaurar ruletas de ejemplo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Wheels Grid */}
        <div
          className={`grid gap-6 flex-1 items-start ${
            wheels.length === 1
              ? 'grid-cols-1 max-w-xl mx-auto w-full'
              : wheels.length === 2
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          }`}
        >
          {wheels.map((wheel) => (
            <WheelCard
              key={wheel.id}
              wheel={wheel}
              totalWheelsCount={wheels.length}
              onUpdateWheel={handleUpdateWheel}
              onDuplicateWheel={handleDuplicateWheel}
              onDeleteWheel={handleDeleteWheel}
              onSpinStart={handleSpinSingle}
              onSpinEnd={handleSpinEnd}
              isAnySpinning={spinningCount > 0}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <p>
          RuletaStudio · Sorteos aleatorios multi-lista interactivos con sonido y física en tiempo real
        </p>
      </footer>

      {/* Winner Modals */}
      <WinnerModal
        isOpen={!!singleWinner}
        wheelTitle={singleWinner?.wheelTitle || ''}
        winnerItem={singleWinner?.winnerItem || null}
        onKeep={handleKeepSingleWinner}
        onRemove={handleRemoveSingleWinner}
        onClose={() => setSingleWinner(null)}
      />

      <BatchWinnerModal
        isOpen={batchResults.length > 0}
        results={batchResults}
        onKeepAll={handleKeepAllBatch}
        onRemoveAll={handleRemoveAllBatch}
        onDecideIndividual={handleDecideIndividualBatch}
        onClose={() => setBatchResults([])}
      />

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onLoadSingleTemplate={handleLoadSingleTemplate}
        onLoadMultiBundle={handleLoadMultiBundle}
      />
    </div>
  );
}
