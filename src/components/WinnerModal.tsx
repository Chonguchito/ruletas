import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, CheckCircle2, X, Trophy } from 'lucide-react';
import { WheelItem } from '../types/wheel';
import { getContrastTextColor } from '../utils/colors';

interface WinnerModalProps {
  isOpen: boolean;
  wheelTitle: string;
  winnerItem: WheelItem | null;
  onKeep: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  wheelTitle,
  winnerItem,
  onKeep,
  onRemove,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen && winnerItem) {
      // Fire celebratory confetti explosion
      const end = Date.now() + 800;
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.65 },
          colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.65 },
          colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, winnerItem]);

  if (!isOpen || !winnerItem) return null;

  const textColor = getContrastTextColor(winnerItem.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header content */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 mb-3 border border-amber-200/60 dark:border-amber-800/60">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Resultado de {wheelTitle}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            ¡Tenemos un Ganador!
          </h2>
        </div>

        {/* Winner Highlight Card */}
        <div className="px-6 py-3">
          <div
            className="p-6 rounded-xl text-center shadow-inner transition-transform"
            style={{ backgroundColor: winnerItem.color }}
          >
            <span
              className="text-2xl sm:text-3xl font-black tracking-tight break-words block drop-shadow-xs"
              style={{ color: textColor }}
            >
              {winnerItem.text}
            </span>
          </div>
        </div>

        {/* Prompt question */}
        <div className="px-6 pt-2 pb-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            ¿Qué deseas hacer con esta opción para los próximos giros?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRemove}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-colors shadow-xs active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Eliminar de la lista</span>
          </button>
          <button
            onClick={onKeep}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-xs active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mantener opción</span>
          </button>
        </div>
      </div>
    </div>
  );
};
