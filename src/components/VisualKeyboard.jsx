'use client';

import { KEYBOARD_LAYOUT } from '@/constants/keyboard';
import { Keyboard } from 'lucide-react';

export default function VisualKeyboard({ getNextChar, charErrors, themeConfig }) {
  const nextChar = getNextChar();
  const primaryColor = themeConfig?.primary || '#e2b714';
  const isLight = themeConfig?.isLight || false;

  // Kelas adaptif berdasarkan tema (light / dark)
  const containerBg = isLight 
    ? 'bg-black/5 border-black/10 text-[#323437]' 
    : 'bg-black/20 border-white/5 text-white/80';
    
  const defaultKeyStyle = isLight 
    ? 'bg-black/10 text-[#323437] border-black/10' 
    : 'bg-white/5 text-white/60 border-white/5';

  return (
    <div className={`${containerBg} p-4 rounded-2xl border space-y-3 max-w-3xl mx-auto transition-colors duration-300`}>
      <div className="flex justify-between items-center text-xs opacity-70 px-2 font-mono">
        <span className="flex items-center gap-1.5">
          <Keyboard className="w-4 h-4" /> Visual Keyboard Guide
        </span>
        <span>
          Tombol Berikutnya: <b className="font-mono font-bold" style={{ color: primaryColor }}>[{nextChar === ' ' ? 'SPACE' : nextChar}]</b>
        </span>
      </div>

      <div className="space-y-1 select-none">
        {KEYBOARD_LAYOUT.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key, kIdx) => {
              const cleanKey = key.replace(/-L|-R/, '');
              const lowerKey = cleanKey.toLowerCase();
              const isNext = lowerKey === nextChar || (cleanKey === 'Space' && nextChar === ' ');
              const errCount = charErrors[lowerKey] || 0;

              let keyStyle = defaultKeyStyle;
              let customInlineStyle = {};

              if (isNext) {
                keyStyle = 'text-black font-bold scale-105 shadow-md';
                customInlineStyle = {
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}50`,
                };
              } else if (errCount > 2) {
                keyStyle = isLight 
                  ? 'bg-rose-200 text-rose-800 border-rose-300' 
                  : 'bg-rose-950 text-rose-300 border-rose-800';
              }

              return (
                <div
                  key={`${rIdx}-${kIdx}`}
                  style={customInlineStyle}
                  className={`flex items-center justify-center rounded-md border text-[10px] font-mono transition-all ${keyStyle} ${
                    cleanKey === 'Space' ? 'w-40 md:w-52 h-7 md:h-8' :
                    cleanKey === 'Backspace' || cleanKey === 'Enter' || cleanKey === 'Shift' || cleanKey === 'Caps' ? 'w-10 md:w-12 h-7 md:h-8' :
                    'w-6 md:w-8 h-7 md:h-8'
                  }`}
                >
                  {cleanKey}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}