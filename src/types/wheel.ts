export interface WheelItem {
  id: string;
  text: string;
  color: string;
  weight: number; // default 1
  enabled: boolean; // default true
}

export interface WinnerRecord {
  id: string;
  itemId: string;
  text: string;
  timestamp: number;
}

export interface Wheel {
  id: string;
  title: string;
  items: WheelItem[];
  currentAngle: number; // in radians
  isSpinning: boolean;
  winnerHistory: WinnerRecord[];
  theme: string;
}

export interface SpinResult {
  wheelId: string;
  wheelTitle: string;
  winnerItem: WheelItem;
}

export interface WheelTemplate {
  id: string;
  title: string;
  description: string;
  items: string[];
}
