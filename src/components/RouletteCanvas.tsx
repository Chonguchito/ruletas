import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WheelItem } from '../types/wheel';
import { getContrastTextColor } from '../utils/colors';
import { soundManager } from '../utils/audio';

interface RouletteCanvasProps {
  items: WheelItem[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: WheelItem) => void;
  size?: number; // diameter in px
  disabled?: boolean;
  isDarkMode?: boolean;
}

export const RouletteCanvas: React.FC<RouletteCanvasProps> = ({
  items,
  isSpinning,
  onSpinStart,
  onSpinEnd,
  size = 360,
  disabled = false,
  isDarkMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const lastSectorIndexRef = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);
  const [flapperAngle, setFlapperAngle] = useState<number>(0);

  // Filter only enabled items
  const activeItems = items.filter((item) => item.enabled);

  // Calculate slice angles based on weights
  const totalWeight = activeItems.reduce((acc, item) => acc + (item.weight || 1), 0) || 1;
  const sliceAngles = activeItems.map((item) => ((item.weight || 1) / totalWeight) * 2 * Math.PI);

  // Find slice under top pointer (-Math.PI / 2)
  const getIndexAtAngle = useCallback(
    (rotation: number): number => {
      if (activeItems.length === 0) return -1;
      const twoPi = 2 * Math.PI;
      // Pointer is at the top (-PI/2)
      let localAngle = (-Math.PI / 2 - rotation) % twoPi;
      if (localAngle < 0) localAngle += twoPi;

      let accumulated = 0;
      for (let i = 0; i < sliceAngles.length; i++) {
        accumulated += sliceAngles[i];
        if (localAngle <= accumulated || i === sliceAngles.length - 1) {
          return i;
        }
      }
      return 0;
    },
    [activeItems, sliceAngles]
  );

  // Draw wheel on canvas
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = size;
      const height = size;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = width / 2 - 16; // Margin for border & shadow

      if (activeItems.length === 0) {
        // Empty state
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#f1f5f9';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = isDarkMode ? '#334155' : '#cbd5e1';
        ctx.stroke();

        ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
        ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sin opciones activas', centerX, centerY);
        ctx.restore();
        return;
      }

      // Outer ring shadow
      ctx.save();
      ctx.shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
      ctx.fill();
      ctx.restore();

      // Outer golden/metallic rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = isDarkMode ? '#334155' : '#e2e8f0';
      ctx.stroke();

      // Slices
      let currentArc = angle;
      for (let i = 0; i < activeItems.length; i++) {
        const item = activeItems[i];
        const sliceAngle = sliceAngles[i];
        const nextArc = currentArc + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentArc, nextArc);
        ctx.closePath();

        ctx.fillStyle = item.color;
        ctx.fill();

        // Slice subtle border
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();

        // Draw item label
        ctx.save();
        ctx.translate(centerX, centerY);
        const midAngle = currentArc + sliceAngle / 2;
        ctx.rotate(midAngle);

        const textColor = getContrastTextColor(item.color);
        ctx.fillStyle = textColor;

        // Dynamic font sizing according to slice count & label length
        const baseFontSize = activeItems.length > 20 ? 11 : activeItems.length > 12 ? 12 : 14;
        ctx.font = `600 ${baseFontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Max text length truncate
        let displayText = item.text;
        const maxTextWidth = radius - 45;
        if (ctx.measureText(displayText).width > maxTextWidth) {
          while (displayText.length > 3 && ctx.measureText(displayText + '...').width > maxTextWidth) {
            displayText = displayText.slice(0, -1);
          }
          displayText += '...';
        }

        ctx.fillText(displayText, radius - 16, 0);
        ctx.restore();

        currentArc = nextArc;
      }

      // Center Hub
      const hubRadius = Math.max(34, radius * 0.22);
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDarkMode ? '#334155' : '#f1f5f9';
      ctx.stroke();

      // Hub inner accent
      ctx.beginPath();
      ctx.arc(centerX, centerY, hubRadius - 4, 0, 2 * Math.PI);
      ctx.fillStyle = isDarkMode ? '#020617' : '#0f172a';
      ctx.fill();

      // Hub text: GIRAR
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isSpinning ? '...' : 'GIRAR', centerX, centerY);

      ctx.restore();
    },
    [activeItems, isSpinning, size, sliceAngles, isDarkMode]
  );

  // Redraw when angle or items change
  useEffect(() => {
    drawWheel(angleRef.current);
  }, [drawWheel, items]);

  // Handle spin execution when isSpinning turns true
  useEffect(() => {
    if (!isSpinning) return;
    if (activeItems.length === 0) return;

    // Pick random target rotations (between 5 and 8 full turns + random landing angle)
    const baseRotations = 5 + Math.random() * 3;
    const extraOffset = Math.random() * Math.PI * 2;
    const totalRotationToAdd = baseRotations * Math.PI * 2 + extraOffset;
    const startAngle = angleRef.current;
    const targetAngle = startAngle + totalRotationToAdd;

    // Duration with slight random variance for realistic feel
    const duration = 4000 + Math.random() * 1000;
    const startTime = performance.now();

    // Easing: ease-out quint / quartic for dramatic slow down
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 4);

    let lastTime = startTime;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startAngle + totalRotationToAdd * easedProgress;
      angleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Sound check: did we enter a new sector?
      const currentSector = getIndexAtAngle(currentAngle);
      if (currentSector !== lastSectorIndexRef.current && lastSectorIndexRef.current !== -1) {
        // Speed check for audio pitch
        const dt = (currentTime - lastTime) / 1000;
        const speed = dt > 0 ? 1 / dt : 1;
        soundManager.playTick(Math.min(1.3, 0.8 + speed * 0.05));
        
        // Deflect flapper needle briefly
        setFlapperAngle(-12);
        setTimeout(() => setFlapperAngle(0), 40);
      }
      lastSectorIndexRef.current = currentSector;
      lastTime = currentTime;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished
        const winnerIndex = getIndexAtAngle(targetAngle);
        const winner = activeItems[winnerIndex] || activeItems[0];
        setFlapperAngle(0);
        soundManager.playWinnerChime();
        onSpinEnd(winner);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpinning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHubClick = () => {
    if (disabled || isSpinning || activeItems.length < 2) return;
    onSpinStart();
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Top indicator needle (Flapper) */}
      <div
        className="absolute -top-1.5 z-20 pointer-events-none transition-transform duration-75"
        style={{
          transform: `translateX(0) rotate(${flapperAngle}deg)`,
          transformOrigin: '50% 0%',
        }}
      >
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none" className="drop-shadow-md">
          <path
            d="M14 34L25 10C26.5 6.5 24 2 20 2H8C4 2 1.5 6.5 3 10L14 34Z"
            fill={isDarkMode ? '#0f172a' : '#0f172a'}
            stroke={isDarkMode ? '#38bdf8' : '#ffffff'}
            strokeWidth="2.5"
          />
          <circle cx="14" cy="7" r="3.5" fill={isDarkMode ? '#38bdf8' : '#e2e8f0'} />
        </svg>
      </div>

      {/* Canvas */}
      <div
        onClick={handleHubClick}
        className={`relative ${
          disabled || isSpinning || activeItems.length < 2
            ? 'cursor-default'
            : 'cursor-pointer hover:scale-[1.01] transition-transform duration-200'
        }`}
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-full"
        />
      </div>
    </div>
  );
};
