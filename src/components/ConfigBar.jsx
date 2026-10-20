'use client';

import React, { useState } from 'react';
import { Clock, Type, Sparkles, BookOpen, Layers, ChevronDown, Check, X } from 'lucide-react';
import { TYPING_STUDY_CURRICULUM } from '@/data/curriculumData';

export default function ConfigBar({ state, inputRef, isStarted }) {
  const {
    testCategory, selectedLessonId, setSelectedLessonId,
    selectedSubLessonId, setSelectedSubLessonId,
    modeType, setModeType, timeLimit, setTimeLimit,
    wordLimit, setWordLimit, difficulty, setDifficulty,
    activeLesson, wpm, accuracy, elapsedSeconds, themeConfig
  } = state;

  const [activeSheet, setActiveSheet] = useState(false);

  const activeSubLesson = activeLesson?.subLessons?.find(s => s.id === selectedSubLessonId) || activeLesson?.subLessons?.[0];
  const isLight = themeConfig.isLight;

  const handleFocusInput = () => {
    if (typeof window === 'undefined') return;
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const buttonBg = isLight ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-black/30 border-white/10 hover:bg-black/50';
  const controlSubText = isLight ? 'text-[#282a2e]/70' : 'text-white/60';
  const activeOptionBg = isLight ? 'bg-black/10' : 'bg-white/10';
  const sheetBg = isLight ? 'bg-[#d1d0c5] text-[#282a2e]' : 'bg-[#1e1e2e] text-[#cdd6f4]';

  return (
    <>
      <div 
        className={`flex flex-col gap-2 text-xs font-mono transition-all duration-300 ${
          isStarted 
            ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none md:max-h-none md:opacity-20 md:hover:opacity-100 md:pointer-events-auto md:overflow-visible' 
            : 'opacity-100'
        }`}
      >
        {testCategory === 'curriculum' ? (
          <div className="w-full">
            {/* Desktop Curriculum Selector (Lapang & Horizontal) */}
            <div className="hidden md:flex items-center justify-between gap-4 w-full">
              <div className={`flex items-center gap-3 ${themeConfig.cardBg} p-2 rounded-2xl border ${themeConfig.cardBorder} shadow-lg`}>
                <div 
                  className="flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl border" 
                  style={{ color: themeConfig.primary, borderColor: `${themeConfig.primary}40`, backgroundColor: `${themeConfig.primary}1A` }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{activeLesson.title}</span>
                </div>
                <div className={`h-4 w-[1px] ${isLight ? 'bg-black/15' : 'bg-white/10'}`} />
                <div className="flex items-center gap-2 font-medium opacity-85 px-1">
                  <Layers className="w-4 h-4 opacity-50" />
                  <span>{activeSubLesson?.title}</span>
                </div>
              </div>

              {/* Desktop Live HUD */}
              <div className={`flex items-center gap-6 font-mono text-sm tracking-wider ${themeConfig.cardBg} px-4 py-2 rounded-2xl border ${themeConfig.cardBorder} shadow-lg transition-colors duration-300`}>
                <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
                <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
                <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{elapsedSeconds}s</b></span>
              </div>
            </div>

            {/* Mobile Curriculum 2-Baris (No Side Scroll) */}
            <div className="flex md:hidden flex-col gap-2 w-full">
              {/* Baris 1: Trigger Bottom Sheet Kurikulum */}
              <button
                onClick={() => setActiveSheet(true)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl border font-bold text-xs ${buttonBg}`}
                style={{ color: themeConfig.primary, borderColor: `${themeConfig.primary}40` }}
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="truncate">{activeLesson.title} — {activeSubLesson?.title}</span>
                </div>
                <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
              </button>

              {/* Baris 2: Live HUD Counters Mobile */}
              <div className={`flex items-center justify-around font-mono text-xs tracking-wider ${themeConfig.cardBg} px-3 py-1.5 rounded-2xl border ${themeConfig.cardBorder} shadow-md w-full`}>
                <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
                <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
                <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{elapsedSeconds}s</b></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* DESKTOP FREE MODE (Satu Baris Horizontal Lapang) */}
            <div className="hidden md:flex items-center justify-between gap-3 w-full">
              <div className={`flex items-center gap-2 ${themeConfig.cardBg} p-1.5 rounded-2xl border ${themeConfig.cardBorder} shadow-lg`}>
                
                {/* Switcher Mode (Time vs Words) */}
                <div className={`flex p-0.5 rounded-xl border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
                  <button
                    onClick={() => { setModeType('time'); handleFocusInput(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                      modeType === 'time' ? 'text-black font-bold shadow-sm' : `${controlSubText} hover:opacity-100`
                    }`}
                    style={{ backgroundColor: modeType === 'time' ? themeConfig.primary : 'transparent' }}
                  >
                    <Clock className="w-3.5 h-3.5" /> time
                  </button>
                  <button
                    onClick={() => { setModeType('words'); handleFocusInput(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                      modeType === 'words' ? 'text-black font-bold shadow-sm' : `${controlSubText} hover:opacity-100`
                    }`}
                    style={{ backgroundColor: modeType === 'words' ? themeConfig.primary : 'transparent' }}
                  >
                    <Type className="w-3.5 h-3.5" /> words
                  </button>
                </div>

                <div className={`h-4 w-[1px] mx-1 ${isLight ? 'bg-black/15' : 'bg-white/10'}`} />

                {/* Angka Opsi (Waktu atau Kata) */}
                {modeType === 'time' ? (
                  <div className="flex gap-1">
                    {[15, 30, 60].map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTimeLimit(t); handleFocusInput(); }}
                        className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                          timeLimit === t ? `font-bold ${activeOptionBg}` : `${controlSubText} hover:opacity-100`
                        }`}
                        style={{ color: timeLimit === t ? themeConfig.primary : undefined }}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {[10, 25, 50].map((w) => (
                      <button
                        key={w}
                        onClick={() => { setWordLimit(w); handleFocusInput(); }}
                        className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                          wordLimit === w ? `font-bold ${activeOptionBg}` : `${controlSubText} hover:opacity-100`
                        }`}
                        style={{ color: wordLimit === w ? themeConfig.primary : undefined }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`h-4 w-[1px] mx-1 ${isLight ? 'bg-black/15' : 'bg-white/10'}`} />

                {/* Switcher Difficulty */}
                <div className="flex items-center gap-1 pl-1">
                  <Sparkles className="w-3.5 h-3.5 opacity-70" style={{ color: themeConfig.primary }} />
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => { setDifficulty(lvl); handleFocusInput(); }}
                      className={`px-2.5 py-1.5 rounded-lg capitalize transition-all duration-200 text-xs ${
                        difficulty === lvl ? `font-bold ${activeOptionBg}` : `${controlSubText} hover:opacity-100`
                      }`}
                      style={{ color: difficulty === lvl ? themeConfig.primary : undefined }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

              </div>

              {/* Desktop Live HUD Counters */}
              <div className={`flex items-center gap-6 font-mono text-sm tracking-wider ${themeConfig.cardBg} px-4 py-2 rounded-2xl border ${themeConfig.cardBorder} shadow-lg transition-colors duration-300`}>
                <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
                <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
                <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{modeType === 'time' ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}</b></span>
              </div>
            </div>

            {/* MOBILE FREE MODE: 2-Baris Rapi (Tanpa Horizontal Scroll) */}
            <div className="flex md:hidden flex-col gap-2 w-full">
              {/* Baris 1: Mode Switcher + Opsi Angka */}
              <div className={`flex items-center justify-between w-full ${themeConfig.cardBg} p-1 rounded-2xl border ${themeConfig.cardBorder} shadow-md`}>
                <div className={`flex p-0.5 rounded-xl border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
                  <button
                    onClick={() => { setModeType('time'); handleFocusInput(); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] ${
                      modeType === 'time' ? 'text-black font-bold shadow-sm' : `${controlSubText}`
                    }`}
                    style={{ backgroundColor: modeType === 'time' ? themeConfig.primary : 'transparent' }}
                  >
                    <Clock className="w-3 h-3" /> time
                  </button>
                  <button
                    onClick={() => { setModeType('words'); handleFocusInput(); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] ${
                      modeType === 'words' ? 'text-black font-bold shadow-sm' : `${controlSubText}`
                    }`}
                    style={{ backgroundColor: modeType === 'words' ? themeConfig.primary : 'transparent' }}
                  >
                    <Type className="w-3 h-3" /> words
                  </button>
                </div>

                <div className={`h-3.5 w-[1px] mx-1 ${isLight ? 'bg-black/15' : 'bg-white/10'}`} />

                {modeType === 'time' ? (
                  <div className="flex gap-1 pr-1">
                    {[15, 30, 60].map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTimeLimit(t); handleFocusInput(); }}
                        className={`px-2 py-1 rounded-lg transition-all duration-200 text-[11px] ${
                          timeLimit === t ? `font-bold ${activeOptionBg}` : `${controlSubText}`
                        }`}
                        style={{ color: timeLimit === t ? themeConfig.primary : undefined }}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-1 pr-1">
                    {[10, 25, 50].map((w) => (
                      <button
                        key={w}
                        onClick={() => { setWordLimit(w); handleFocusInput(); }}
                        className={`px-2 py-1 rounded-lg transition-all duration-200 text-[11px] ${
                          wordLimit === w ? `font-bold ${activeOptionBg}` : `${controlSubText}`
                        }`}
                        style={{ color: wordLimit === w ? themeConfig.primary : undefined }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Baris 2: Difficulty Switcher + Mobile HUD */}
              <div className="flex items-center justify-between gap-2 w-full">
                {/* Difficulty Switcher */}
                <div className={`flex items-center gap-1 p-1 rounded-2xl border ${themeConfig.cardBg} ${themeConfig.cardBorder} shadow-sm shrink-0`}>
                  {['easy', 'med', 'hard'].map((lvl) => {
                    const fullLvl = lvl === 'med' ? 'medium' : lvl;
                    const isSelected = difficulty === fullLvl;
                    return (
                      <button
                        key={fullLvl}
                        onClick={() => { setDifficulty(fullLvl); handleFocusInput(); }}
                        className={`px-2 py-1 rounded-lg capitalize transition-all duration-200 text-[11px] ${
                          isSelected ? `font-bold ${activeOptionBg}` : `${controlSubText}`
                        }`}
                        style={{ color: isSelected ? themeConfig.primary : undefined }}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Live HUD Counters */}
                <div className={`flex items-center justify-around font-mono text-[11px] tracking-wider ${themeConfig.cardBg} px-2.5 py-1 rounded-2xl border ${themeConfig.cardBorder} shadow-sm flex-1`}>
                  <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
                  <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
                  <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{modeType === 'time' ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}</b></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SHEET CURRICULUM MOBILE (Thumb-Friendly Ergonomics) */}
      {activeSheet && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => { setActiveSheet(false); handleFocusInput(); }} />
          
          <div 
            className={`relative w-full max-h-[85vh] rounded-t-3xl border-t p-5 pb-8 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl max-w-lg mx-auto ${sheetBg} ${
              isLight ? 'border-black/15' : 'border-white/15'
            }`}
          >
            {/* Thumb Drag Handle Bar */}
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-1 ${isLight ? 'bg-black/20' : 'bg-white/20'}`} />

            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-black/10' : 'border-white/10'}`}>
              <div className="flex items-center gap-2.5 font-mono font-bold text-sm">
                <BookOpen className="w-5 h-5" style={{ color: themeConfig.primary }} />
                <span>Pilih Kurikulum Belajar</span>
              </div>
              <button 
                onClick={() => { setActiveSheet(false); handleFocusInput(); }} 
                className={`p-2 rounded-full transition ${isLight ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {TYPING_STUDY_CURRICULUM.map((lesson) => {
                const isSelectedLesson = lesson.id === selectedLessonId;
                return (
                  <div key={lesson.id} className={`border rounded-2xl overflow-hidden ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                    <button
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setSelectedSubLessonId(lesson.subLessons[0].id);
                      }}
                      className="w-full flex items-center justify-between p-3.5 text-left font-bold min-h-[48px] active:scale-[0.99] transition"
                      style={{
                        backgroundColor: isSelectedLesson ? `${themeConfig.primary}26` : 'transparent',
                        color: isSelectedLesson ? themeConfig.primary : undefined
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 shrink-0 opacity-70" />
                        <span>{lesson.title}</span>
                      </div>
                      {isSelectedLesson && <Check className="w-4 h-4 shrink-0" style={{ color: themeConfig.primary }} />}
                    </button>

                    {isSelectedLesson && (
                      <div className={`p-2 space-y-1.5 border-t ${isLight ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'}`}>
                        {lesson.subLessons.map((sub) => {
                          const isSelectedSub = sub.id === selectedSubLessonId;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setSelectedSubLessonId(sub.id);
                                setActiveSheet(false);
                                handleFocusInput();
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition min-h-[44px] active:scale-[0.98] ${
                                isSelectedSub 
                                  ? `${isLight ? 'bg-black/10' : 'bg-white/15'} font-bold` 
                                  : 'opacity-75 hover:opacity-100'
                              }`}
                              style={{ color: isSelectedSub ? themeConfig.primary : undefined }}
                            >
                              <span>{sub.title}</span>
                              {isSelectedSub && <Check className="w-4 h-4 shrink-0" style={{ color: themeConfig.primary }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
