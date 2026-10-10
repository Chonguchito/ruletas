import React from 'react';
import { X, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { PRESET_TEMPLATES, MULTI_WHEEL_PRESETS } from '../utils/templates';
import { WheelTemplate } from '../types/wheel';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSingleTemplate: (template: WheelTemplate, asNew: boolean) => void;
  onLoadMultiBundle: (bundle: (typeof MULTI_WHEEL_PRESETS)[0]) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onLoadSingleTemplate,
  onLoadMultiBundle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Plantillas y Paquetes de Ruletas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Carga listas preparadas o sets temáticos de múltiples ruletas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Multi-Wheel Bundles */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Combinaciones de Múltiples Ruletas Simultáneas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MULTI_WHEEL_PRESETS.map((bundle) => (
                <div
                  key={bundle.id}
                  className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{bundle.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Incluye {bundle.wheels.length} ruletas:{' '}
                      {bundle.wheels.map((w) => w.title).join(' + ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadMultiBundle(bundle);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Cargar este conjunto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Individual wheel templates */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Ruletas Individuales Populares
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tmpl.title}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {tmpl.items.length} ítems
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tmpl.description}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
                      Ejemplos: {tmpl.items.slice(0, 4).join(', ')}...
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadSingleTemplate(tmpl, false);
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors text-center"
                      title="Reemplazar la ruleta seleccionada"
                    >
                      Usar en actual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadSingleTemplate(tmpl, true);
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors text-center flex items-center justify-center gap-1"
                      title="Añadir como nueva ruleta"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nueva ruleta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
