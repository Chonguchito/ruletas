import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Copy,
  Shuffle,
  History,
  ListPlus,
  MoreVertical,
  Check,
  Edit2,
  Layers,
  Palette,
} from 'lucide-react';
import { Wheel, WheelItem } from '../types/wheel';
import { RouletteCanvas } from './RouletteCanvas';
import { COLOR_PALETTES, getPaletteColor } from '../utils/colors';

interface WheelCardProps {
  wheel: Wheel;
  totalWheelsCount: number;
  onUpdateWheel: (updated: Wheel) => void;
  onDuplicateWheel: (wheel: Wheel) => void;
  onDeleteWheel: (wheelId: string) => void;
  onSpinStart: (wheelId: string) => void;
  onSpinEnd: (wheelId: string, winner: WheelItem) => void;
  isAnySpinning: boolean;
  isDarkMode?: boolean;
}

export const WheelCard: React.FC<WheelCardProps> = ({
  wheel,
  totalWheelsCount,
  onUpdateWheel,
  onDuplicateWheel,
  onDeleteWheel,
  onSpinStart,
  onSpinEnd,
  isAnySpinning,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'bulk' | 'history'>('items');
  const [newItemText, setNewItemText] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(wheel.title);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const wheelItems = wheel?.items || [];
  const activeItemsCount = wheelItems.filter((i) => i && i.enabled).length;

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    const nextIndex = wheel.items.length;
    const newItem: WheelItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      text: trimmed,
      color: getPaletteColor(wheel.theme || 'modern', nextIndex),
      weight: 1,
      enabled: true,
    };

    onUpdateWheel({
      ...wheel,
      items: [...wheel.items, newItem],
    });
    setNewItemText('');
  };

  const handleToggleItem = (itemId: string) => {
    onUpdateWheel({
      ...wheel,
      items: wheel.items.map((it) =>
        it.id === itemId ? { ...it, enabled: !it.enabled } : it
      ),
    });
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdateWheel({
      ...wheel,
      items: wheel.items.filter((it) => it.id !== itemId),
    });
  };

  const handleUpdateItemText = (itemId: string, text: string) => {
    onUpdateWheel({
      ...wheel,
      items: wheel.items.map((it) => (it.id === itemId ? { ...it, text } : it)),
    });
  };

  const handleUpdateItemColor = (itemId: string, color: string) => {
    onUpdateWheel({
      ...wheel,
      items: wheel.items.map((it) => (it.id === itemId ? { ...it, color } : it)),
    });
  };

  const handleShuffleItems = () => {
    const shuffled = [...wheel.items].sort(() => Math.random() - 0.5);
    onUpdateWheel({
      ...wheel,
      items: shuffled,
    });
  };

  const handleRecolorAll = () => {
    const paletteKey = wheel.theme || 'modern';
    onUpdateWheel({
      ...wheel,
      items: wheel.items.map((it, idx) => ({
        ...it,
        color: getPaletteColor(paletteKey, idx),
      })),
    });
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const paletteKey = wheel.theme || 'modern';
    const newItems: WheelItem[] = lines.map((text, idx) => ({
      id: 'item_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4),
      text,
      color: getPaletteColor(paletteKey, idx),
      weight: 1,
      enabled: true,
    }));

    onUpdateWheel({
      ...wheel,
      items: newItems,
    });
    setBulkText('');
    setActiveTab('items');
  };

  const handleSaveTitle = () => {
    const trimmed = tempTitle.trim() || 'Ruleta sin título';
    onUpdateWheel({
      ...wheel,
      title: trimmed,
    });
    setIsEditingTitle(false);
  };

  const handleClearHistory = () => {
    onUpdateWheel({
      ...wheel,
      winnerHistory: [],
    });
  };

  const handleChangeTheme = (themeName: string) => {
    onUpdateWheel({
      ...wheel,
      theme: themeName,
      items: wheel.items.map((it, idx) => ({
        ...it,
        color: getPaletteColor(themeName, idx),
      })),
    });
    setShowOptionsMenu(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="w-full text-base font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-md"
                title="Guardar título"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 group cursor-pointer min-w-0"
              onClick={() => {
                setTempTitle(wheel.title);
                setIsEditingTitle(true);
              }}
              title="Click para cambiar nombre"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {wheel.title}
              </h3>
              <Edit2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
            {activeItemsCount} {activeItemsCount === 1 ? 'opción' : 'opciones'}
          </span>
        </div>

        {/* Header menu actions */}
        <div className="relative flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDuplicateWheel(wheel)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplicar ruleta"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Opciones de ruleta"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {showOptionsMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1.5 z-30"
              onMouseLeave={() => setShowOptionsMenu(false)}
            >
              <div className="px-3 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Paleta de Color
              </div>
              <div className="grid grid-cols-3 gap-1 px-3 py-1 mb-1">
                {Object.keys(COLOR_PALETTES).map((pal) => (
                  <button
                    key={pal}
                    type="button"
                    onClick={() => handleChangeTheme(pal)}
                    className={`text-[11px] capitalize py-1 px-1.5 rounded-md border text-center font-medium ${
                      (wheel.theme || 'modern') === pal
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pal}
                  </button>
                ))}
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                type="button"
                onClick={() => {
                  handleShuffleItems();
                  setShowOptionsMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                Mezclar orden
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRecolorAll();
                  setShowOptionsMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                Reasignar colores
              </button>

              {totalWheelsCount > 1 && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteWheel(wheel.id);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Eliminar ruleta
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Wheel Canvas Area */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50/30 dark:bg-slate-950/40">
        <div className="my-2">
          <RouletteCanvas
            items={wheel.items}
            isSpinning={wheel.isSpinning}
            onSpinStart={() => onSpinStart(wheel.id)}
            onSpinEnd={(winner) => onSpinEnd(wheel.id, winner)}
            size={280}
            disabled={wheel.isSpinning || activeItemsCount < 2}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Spin trigger button */}
        <button
          type="button"
          onClick={() => onSpinStart(wheel.id)}
          disabled={wheel.isSpinning || activeItemsCount < 2}
          className={`mt-4 w-full max-w-xs py-2.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm ${
            wheel.isSpinning
              ? 'bg-amber-500 text-white cursor-wait animate-pulse'
              : activeItemsCount < 2
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-98 shadow-slate-900/10'
          }`}
        >
          <Play className={`w-4 h-4 fill-current ${wheel.isSpinning ? 'animate-spin' : ''}`} />
          <span>{wheel.isSpinning ? 'Girando ruleta...' : 'Girar esta ruleta'}</span>
        </button>

        {activeItemsCount < 2 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
            Agrega al menos 2 opciones activas para girar
          </p>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="px-5 border-t border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'items'
              ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Opciones ({wheel.items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'bulk'
              ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListPlus className="w-3.5 h-3.5" />
          <span>Pegar lista</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historial ({wheel.winnerHistory?.length || 0})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* TAB 1: ITEMS LIST */}
        {activeTab === 'items' && (
          <div className="flex flex-col flex-1 space-y-3">
            {/* Quick add form */}
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva opción (ej. Nombre, Premio)..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!newItemText.trim()}
                className="px-3 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </form>

            {/* List items */}
            <div className="flex-1 max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {wheel.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No hay opciones. Añade una arriba o pega una lista.
                </div>
              ) : (
                wheel.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                      item.enabled
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                        : 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200/40 dark:border-slate-800/40 opacity-60'
                    }`}
                  >
                    {/* Checkbox enabled */}
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-3.5 h-3.5 rounded-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title={item.enabled ? 'Deshabilitar de ruleta' : 'Habilitar en ruleta'}
                    />

                    {/* Color Swatch */}
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => handleUpdateItemColor(item.id, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        title="Cambiar color del sector"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>

                    {/* Editable Text */}
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                      className="flex-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-400 rounded-xs px-1 text-slate-800 dark:text-slate-200 truncate"
                    />

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BULK IMPORT */}
        {activeTab === 'bulk' && (
          <div className="flex flex-col flex-1 space-y-2.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pega varias opciones separadas por saltos de línea o comas. Reemplazará la lista actual de esta ruleta.
            </p>
            <textarea
              rows={5}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Ejemplo:&#10;Premio 1&#10;Premio 2&#10;Premio 3"
              className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-40 transition-colors"
              >
                Cargar en esta ruleta
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="flex flex-col flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Últimos sorteos de esta ruleta</span>
              {wheel.winnerHistory && wheel.winnerHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
                >
                  Vaciar historial
                </button>
              )}
            </div>

            <div className="flex-1 max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {!wheel.winnerHistory || wheel.winnerHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  Aún no se ha realizado ningún giro en esta ruleta.
                </div>
              ) : (
                wheel.winnerHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate mr-2">
                      {item.text}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
