'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Layers, Clock, Volume2, VolumeX, Music, Palette, Check, X, SlidersHorizontal } from 'lucide-react';
import { SOUND_PROFILES } from '@/utils/audio';
import { THEME_CONFIGS } from '@/hooks/useTypingEngine';

export default function HeaderNav({ state, inputRef }) {
  const { 
    testCategory, setTestCategory, 
    soundEnabled, setSoundEnabled,
    soundProfile, setSoundProfile, 
    theme, setTheme, themeConfig 
  } = state;

  const [activeSheet, setActiveSheet] = useState(null); // 'sound' | 'theme' | null

  const handleFocusInput = () => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  };

  const isLight = themeConfig.isLight;
  const buttonHoverBg = isLight ? 'hover:bg-black/5' : 'hover:bg-white/5';
  const controlSubText = isLight ? 'text-[#323437]/70' : 'text-white/60';
  const sheetBg = isLight ? 'bg-[#e1e1e1] text-[#323437]' : 'bg-[#1e1e2e] text-[#cdd6f4]';

  return (
    <>
      <header className={`flex items-center justify-between gap-2 pb-3 sm:pb-6 border-b select-none transition-all duration-300 ${isLight ? 'border-black/10' : 'border-white/5'}`}>
        
        {/* Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="p-2 sm:p-2.5 rounded-2xl border shadow-inner transition-colors duration-300"
            style={{ 
              backgroundColor: `${themeConfig.primary}1A`, 
              borderColor: `${themeConfig.primary}33` 
            }}
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300" style={{ color: themeConfig.primary, fill: themeConfig.primary }} />
          </div>
          <div>
            <h1 className={`text-base sm:text-xl font-bold tracking-wider font-mono ${themeConfig.textMain}`}>
              type<span className="transition-colors duration-300" style={{ color: themeConfig.primary }}>hybrid</span>
            </h1>
            <p className={`text-[9px] sm:text-[11px] font-mono opacity-60 tracking-tight hidden sm:block ${themeConfig.textMain}`}>
              Monkeytype Analytics × Curriculum
            </p>
          </div>
        </div>

        {/* Control Bar */}
        <div className={`flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl border shadow-lg text-xs font-mono transition-colors duration-300 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}>
          
          {/* Category Switcher */}
          <div className={`flex p-0.5 sm:p-1 rounded-xl ${isLight ? 'bg-black/5' : 'bg-black/30'}`}>
            <button
              onClick={() => { setTestCategory('curriculum'); handleFocusInput(); }}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap text-[11px] sm:text-xs ${
                testCategory === 'curriculum' 
                  ? 'text-black font-semibold shadow-md' 
                  : `${controlSubText}${buttonHoverBg}`
              }`}
              style={{ backgroundColor: testCategory === 'curriculum' ? themeConfig.primary : 'transparent' }}
            >
              <Layers className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Modul Belajar</span><span className="sm:hidden">Modul</span>
            </button>
            <button
              onClick={() => { setTestCategory('free'); handleFocusInput(); }}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap text-[11px] sm:text-xs ${
                testCategory === 'free' 
                  ? 'text-black font-semibold shadow-md' 
                  : `${controlSubText}${buttonHoverBg}`
              }`}
              style={{ backgroundColor: testCategory === 'free' ? themeConfig.primary : 'transparent' }}
            >
              <Clock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Tes Bebas</span><span className="sm:hidden">Bebas</span>
            </button>
          </div>

          <div className={`h-4 w-[1px] my-auto ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          {/* Sound Trigger */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                if (window.innerWidth < 640) {
                  setActiveSheet('sound');
                } else {
                  setSoundEnabled(!soundEnabled);
                  handleFocusInput();
                }
              }} 
              className={`p-1.5 rounded-xl transition flex items-center gap-1 ${controlSubText} ${buttonHoverBg}`}
              title="Pengaturan Suara"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 transition-colors duration-300" style={{ color: themeConfig.primary }} />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-[11px] font-mono hidden sm:inline">{SOUND_PROFILES[soundProfile]?.name || soundProfile}</span>
            </button>
          </div>

          <div className={`h-4 w-[1px] my-auto ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          {/* Theme Trigger */}
          <button
            onClick={() => setActiveSheet('theme')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border transition ${controlSubText} ${isLight ? 'bg-black/5 hover:bg-black/10 border-black/5' : 'bg-black/30 hover:bg-black/50 border-white/5'}`}
          >
            <Palette className="w-3.5 h-3.5 opacity-70" style={{ color: themeConfig.primary }} />
            <span className="text-[11px] hidden sm:inline">{themeConfig.name}</span>
          </button>

        </div>
      </header>

      {/* MOBILE BOTTOM SHEET / DRAWER OVERLAY */}
      {activeSheet && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setActiveSheet(null)} />
          
          <div className={`relative w-full max-h-[80vh] rounded-t-3xl border-t p-5 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl ${sheetBg} ${isLight ? 'border-black/10' : 'border-white/10'}`}>
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 font-mono font-bold text-sm">
                {activeSheet === 'sound' ? <Music className="w-4 h-4" style={{ color: themeConfig.primary }} /> : <Palette className="w-4 h-4" style={{ color: themeConfig.primary }} />}
                <span>{activeSheet === 'sound' ? 'Pilih Suara Keycap' : 'Pilih Tema Tampilan'}</span>
              </div>
              <button 
                onClick={() => setActiveSheet(null)} 
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Suara */}
            {activeSheet === 'sound' && (
              <div className="space-y-2 font-mono text-xs">
                <button
                  onClick={() => { setSoundEnabled(!soundEnabled); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition ${
                    !soundEnabled ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 font-bold' : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2"><VolumeX className="w-4 h-4" /> Mute Suara Pengetikan</span>
                  {!soundEnabled && <Check className="w-4 h-4 text-rose-500" />}
                </button>

                <div className="pt-2 text-[10px] uppercase font-bold opacity-50 tracking-wider">Variasi Sound Switch:</div>
                {Object.entries(SOUND_PROFILES).map(([key, prof]) => {
                  const isSelected = soundEnabled && soundProfile === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSoundEnabled(true);
                        setSoundProfile(key);
                        setActiveSheet(null);
                        handleFocusInput();
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition ${
                        isSelected ? 'font-bold' : 'border-black/5 dark:border-white/5 opacity-80'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${themeConfig.primary}26` : 'transparent',
                        borderColor: isSelected ? themeConfig.primary : undefined,
                        color: isSelected ? themeConfig.primary : undefined
                      }}
                    >
                      <span className="text-sm">{prof.name}</span>
                      {isSelected && <Check className="w-4 h-4" style={{ color: themeConfig.primary }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Content Tema */}
            {activeSheet === 'theme' && (
              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                {Object.values(THEME_CONFIGS).map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setActiveSheet(null);
                        handleFocusInput();
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition ${
                        isSelected ? 'font-bold' : 'border-black/5 dark:border-white/5 opacity-80'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${t.primary}26` : 'transparent',
                        borderColor: isSelected ? t.primary : undefined,
                        color: isSelected ? t.primary : undefined
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: t.primary }} />
                        <span className="text-sm">{t.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4" style={{ color: t.primary }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}