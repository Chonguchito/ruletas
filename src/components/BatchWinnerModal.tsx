import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, CheckCircle2, Trophy, X } from 'lucide-react';
import { WheelItem } from '../types/wheel';
import { getContrastTextColor } from '../utils/colors';

export interface BatchSpinResult {
  wheelId: string;
  wheelTitle: string;
  winnerItem: WheelItem;
}

interface BatchWinnerModalProps {
  isOpen: boolean;
  results: BatchSpinResult[];
  onKeepAll: () => void;
  onRemoveAll: () => void;
  onDecideIndividual: (decisions: Record<string, 'keep' | 'remove'>) => void;
  onClose: () => void;
}

export const BatchWinnerModal: React.FC<BatchWinnerModalProps> = ({
  isOpen,
  results,
  onKeepAll,
  onRemoveAll,
  onDecideIndividual,
  onClose,
}) => {
  const [decisions, setDecisions] = React.useState<Record<string, 'keep' | 'remove'>>({});

  useEffect(() => {
    if (isOpen && results.length > 0) {
      // Default all to keep
      const initial: Record<string, 'keep' | 'remove'> = {};
      results.forEach((r) => {
        initial[r.wheelId] = 'keep';
      });
      setDecisions(initial);

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    }
  }, [isOpen, results]);

  if (!isOpen || results.length === 0) return null;

  const toggleDecision = (wheelId: string) => {
    setDecisions((prev) => ({
      ...prev,
      [wheelId]: prev[wheelId] === 'remove' ? 'keep' : 'remove',
    }));
  };

  const handleApply = () => {
    onDecideIndividual(decisions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
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

        <div className="pt-8 pb-3 px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 mb-2 border border-amber-200/60 dark:border-amber-800/60">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ¡Resultados Simultáneos!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Se sortearon {results.length} ruletas en simultáneo
          </p>
        </div>

        {/* Results grid */}
        <div className="px-6 py-3 max-h-[50vh] overflow-y-auto space-y-3">
          {results.map((res) => {
            const textColor = getContrastTextColor(res.winnerItem.color);
            const isRemoving = decisions[res.wheelId] === 'remove';

            return (
              <div
                key={res.wheelId}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex-1 pr-3 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
                    {res.wheelTitle}
                  </span>
                  <div
                    className="inline-block px-3 py-1.5 rounded-lg mt-1 font-bold text-sm sm:text-base truncate max-w-full shadow-xs"
                    style={{ backgroundColor: res.winnerItem.color, color: textColor }}
                  >
                    {res.winnerItem.text}
                  </div>
                </div>

                {/* Keep / Remove Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDecision(res.wheelId)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
                    isRemoving
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  }`}
                >
                  {isRemoving ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Se eliminará</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Se conservará</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onKeepAll}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Mantener todas
            </button>
            <button
              onClick={onRemoveAll}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Eliminar todas
            </button>
          </div>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-xs"
          >
            Confirmar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
