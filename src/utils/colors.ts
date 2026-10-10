// Color palettes for wheels
export const COLOR_PALETTES: Record<string, string[]> = {
  modern: [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
  ],
  pastel: [
    '#93c5fd', // soft blue
    '#86efac', // soft green
    '#fde047', // soft yellow
    '#fca5a5', // soft red
    '#d8b4fe', // soft purple
    '#67e8f9', // soft cyan
    '#f9a8d4', // soft pink
    '#fdba74', // soft orange
  ],
  neon: [
    '#00f0ff',
    '#ff007f',
    '#ffe600',
    '#00ff66',
    '#b026ff',
    '#ff5500',
    '#00ffcc',
    '#ff0055',
  ],
  warm: [
    '#e11d48',
    '#ea580c',
    '#d97706',
    '#ca8a04',
    '#be185d',
    '#c2410c',
    '#b45309',
  ],
  cool: [
    '#0284c7',
    '#0d9488',
    '#2563eb',
    '#4f46e5',
    '#0891b2',
    '#059669',
    '#7c3aed',
  ],
};

/**
 * Returns color from palette by index
 */
export function getPaletteColor(paletteName: string, index: number): string {
  const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.modern;
  return palette[index % palette.length];
}

/**
 * Calculates luminance to determine if text on this color should be dark or light
 */
export function getContrastTextColor(hexColor: string): '#0f172a' | '#ffffff' {
  // Normalize hex
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Relative luminance per ITU-R BT.709
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? '#0f172a' : '#ffffff';
}
