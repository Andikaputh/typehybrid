'use client';

import React from 'react';
import Image from 'next/image';

const FINGER_POSITIONS = {
  R1: { top: '57%', left: '95%' },
  R2: { top: '34%', left: '90%' },
  R3: { top: '20%', left: '76%' },
  R4: { top: '19%', left: '56%' },
  R5: { top: '51%', left: '5%' },
};

const LEFT_TO_RIGHT_MAP = {
  L1: 'R1',
  L2: 'R2',
  L3: 'R3',
  L4: 'R4',
  L5: 'R5',
};

export default function HandGuide({ side, activeFinger, themeConfig }) {
  const isRight = side === 'right';
  const primaryColor = themeConfig?.primary || '#e2b714';
  const isLight = themeConfig?.isLight || false;

  const currentActiveKey = isRight 
    ? activeFinger 
    : LEFT_TO_RIGHT_MAP[activeFinger];

  // Styling kontainer & gambar sesuai mode light/dark
  const containerBg = isLight 
    ? 'bg-black/5 border-black/10 text-[#323437]' 
    : 'bg-black/20 border-white/5 text-white/80';

  const imageFilter = isLight 
    ? 'opacity-60' 
    : 'opacity-80 invert brightness-200';

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border w-32 md:w-36 shadow-lg select-none transition-colors duration-300 ${containerBg}`}>
      <span className="text-[11px] font-mono opacity-70 mb-2 font-semibold">
        {isRight ? 'Tangan Kanan' : 'Tangan Kiri'}
      </span>

      <div className={`relative w-28 h-36 md:w-32 md:h-40 ${!isRight ? 'scale-x-[-1]' : ''}`}>
        <Image
          src="/hand-guide.png"
          alt={isRight ? 'Tangan Kanan' : 'Tangan Kiri'}
          fill
          sizes="(max-width: 768px) 112px, 128px"
          className={`object-contain transition-all duration-300 ${imageFilter}`}
          priority
        />

        {Object.entries(FINGER_POSITIONS).map(([fingerId, pos]) => {
          const isActive = currentActiveKey === fingerId;

          return (
            <div
              key={fingerId}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div
                className={`rounded-full transition-all duration-150 ${
                  isActive
                    ? 'w-5 h-5 border-2 border-white scale-125 animate-pulse'
                    : isLight 
                      ? 'w-2.5 h-2.5 bg-black/20 border border-black/30' 
                      : 'w-2.5 h-2.5 bg-white/10 border border-white/20'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: primaryColor,
                        boxShadow: `0 0 12px ${primaryColor}`,
                      }
                    : undefined
                }
              />
            </div>
          );
        })}

      </div>
    </div>
  );
}