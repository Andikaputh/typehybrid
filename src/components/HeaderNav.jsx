'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Layers, Clock, Volume2, VolumeX, Music, Palette, ChevronDown, Check } from 'lucide-react';
import { SOUND_PROFILES } from '@/utils/audio';
import { THEME_CONFIGS } from '@/hooks/useTypingEngine';

export default function HeaderNav({ state, inputRef }) {
  const { 
    testCategory, setTestCategory, 
    soundEnabled, setSoundEnabled,
    soundProfile, setSoundProfile, 
    theme, setTheme, themeConfig 
  } = state;

  const [openSound, setOpenSound] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);

  const soundRef = useRef(null);
  const themeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (soundRef.current && !soundRef.current.contains(e.target)) setOpenSound(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setOpenTheme(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocusInput = () => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  };

  const isLight = themeConfig.isLight;
  const buttonHoverBg = isLight ? 'hover:bg-black/5' : 'hover:bg-white/5';
  const controlSubText = isLight ? 'text-[#323437]/70' : 'text-white/60';
  const dropdownBg = isLight ? 'bg-[#e1e1e1] border-black/10' : 'bg-[#18191a] border-white/15';

  return (
    <header className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b select-none ${isLight ? 'border-black/10' : 'border-white/5'}`}>
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div 
          className="p-2.5 rounded-2xl border shadow-inner transition-colors duration-300"
          style={{ 
            backgroundColor: `${themeConfig.primary}1A`, 
            borderColor: `${themeConfig.primary}33` 
          }}
        >
          <Zap className="w-6 h-6 transition-colors duration-300" style={{ color: themeConfig.primary, fill: themeConfig.primary }} />
        </div>
        <div>
          <h1 className={`text-xl font-bold tracking-wider font-mono ${themeConfig.textMain}`}>
            type<span className="transition-colors duration-300" style={{ color: themeConfig.primary }}>hybrid</span>
          </h1>
          <p className={`text-[11px] font-mono opacity-60 tracking-tight ${themeConfig.textMain}`}>
            Monkeytype Analytics × Typing Study Curriculum
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className={`flex items-center gap-2 backdrop-blur-md p-1.5 rounded-2xl border shadow-lg text-xs font-mono transition-colors duration-300 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}>
        {/* Category Switcher */}
        <div className={`flex p-1 rounded-xl ${isLight ? 'bg-black/5' : 'bg-black/30'}`}>
          <button
            onClick={() => { setTestCategory('curriculum'); handleFocusInput(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
              testCategory === 'curriculum' 
                ? 'text-black font-semibold shadow-md' 
                : `${controlSubText}${buttonHoverBg}`
            }`}
            style={{ backgroundColor: testCategory === 'curriculum' ? themeConfig.primary : 'transparent' }}
          >
            <Layers className="w-3.5 h-3.5" /> Modul Belajar
          </button>
          <button
            onClick={() => { setTestCategory('free'); handleFocusInput(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
              testCategory === 'free' 
                ? 'text-black font-semibold shadow-md' 
                : `${controlSubText}${buttonHoverBg}`
            }`}
            style={{ backgroundColor: testCategory === 'free' ? themeConfig.primary : 'transparent' }}
          >
            <Clock className="w-3.5 h-3.5" /> Tes Bebas
          </button>
        </div>

        <div className={`h-4 w-[1px] my-auto ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

        {/* Sound Profile Switcher */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => { setSoundEnabled(!soundEnabled); handleFocusInput(); }} 
            className={`p-1.5 rounded-xl transition ${controlSubText} ${buttonHoverBg}`}
            title={soundEnabled ? "Matikan Suara" : "Nyalakan Suara"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 transition-colors duration-300" style={{ color: themeConfig.primary }} />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {soundEnabled && (
            <div className="relative" ref={soundRef}>
              <button
                onClick={() => { setOpenSound(!openSound); setOpenTheme(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition ${controlSubText} ${isLight ? 'bg-black/5 hover:bg-black/10 border-black/5' : 'bg-black/30 hover:bg-black/50 border-white/5'}`}
              >
                <Music className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />
                <span className="text-[11px]">{SOUND_PROFILES[soundProfile]?.name || soundProfile}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openSound ? 'rotate-180' : 'opacity-40'}`} style={{ color: openSound ? themeConfig.primary : undefined }} />
              </button>

              {openSound && (
                <div className={`absolute right-0 mt-2 w-44 border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[9999] py-1.5 divide-y animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownBg} ${isLight ? 'divide-black/5' : 'divide-white/5'}`}>
                  {Object.entries(SOUND_PROFILES).map(([key, prof]) => {
                    const isSelected = soundProfile === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSoundProfile(key);
                          setOpenSound(false);
                          handleFocusInput();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-[11px] transition-colors ${
                          isSelected ? 'font-bold' : `${controlSubText}${buttonHoverBg}`
                        }`}
                        style={{
                          backgroundColor: isSelected ? `${themeConfig.primary}26` : 'transparent',
                          color: isSelected ? themeConfig.primary : undefined
                        }}
                      >
                        <span>{prof.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`h-4 w-[1px] my-auto ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

        {/* Dynamic Theme Picker Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => { setOpenTheme(!openTheme); setOpenSound(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition ${controlSubText} ${isLight ? 'bg-black/5 hover:bg-black/10 border-black/5' : 'bg-black/30 hover:bg-black/50 border-white/5'}`}
          >
            <Palette className="w-3.5 h-3.5 opacity-60" />
            <span className="text-[11px]">{themeConfig.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openTheme ? 'rotate-180' : 'opacity-40'}`} style={{ color: openTheme ? themeConfig.primary : undefined }} />
          </button>

          {openTheme && (
            <div className={`absolute right-0 mt-2 w-44 border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[9999] py-1.5 divide-y animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownBg} ${isLight ? 'divide-black/5' : 'divide-white/5'}`}>
              {Object.values(THEME_CONFIGS).map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setOpenTheme(false);
                      handleFocusInput();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-[11px] transition-colors ${
                      isSelected ? 'font-bold' : `${controlSubText}${buttonHoverBg}`
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${t.primary}26` : 'transparent',
                      color: isSelected ? t.primary : undefined
                    }}
                  >
                    <span>{t.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" style={{ color: t.primary }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}