'use client';

import React, { useState } from 'react';
import { Clock, Type, Sparkles, BookOpen, Layers, ChevronDown, Check, X } from 'lucide-react';
import { TYPING_STUDY_CURRICULUM } from '@/data/curriculumData';

export default function ConfigBar({ state, inputRef }) {
  const {
    testCategory, selectedLessonId, setSelectedLessonId,
    selectedSubLessonId, setSelectedSubLessonId,
    modeType, setModeType, timeLimit, setTimeLimit,
    wordLimit, setWordLimit, difficulty, setDifficulty,
    activeLesson, wpm, accuracy, elapsedSeconds, isStarted, themeConfig
  } = state;

  const [activeSheet, setActiveSheet] = useState(false);

  const activeSubLesson = activeLesson?.subLessons?.find(s => s.id === selectedSubLessonId) || activeLesson?.subLessons?.[0];
  const isLight = themeConfig.isLight;

  const handleFocusInput = () => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  };

  const buttonBg = isLight ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-black/30 border-white/10 hover:bg-black/50';
  const controlSubText = isLight ? 'text-[#323437]/70' : 'text-white/50';
  const activeOptionBg = isLight ? 'bg-black/10' : 'bg-white/10';
  const sheetBg = isLight ? 'bg-[#e1e1e1] text-[#323437]' : 'bg-[#1e1e2e] text-[#cdd6f4]';

  return (
    <>
      <div className={`flex flex-col gap-2.5 text-xs font-mono transition-all duration-300 ${isStarted ? 'opacity-0 sm:opacity-20 pointer-events-none sm:pointer-events-auto' : 'opacity-100'}`}>
        
        {testCategory === 'curriculum' ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Mobile Curriculum Trigger Button */}
            <button
              onClick={() => setActiveSheet(true)}
              className={`w-full sm:hidden flex items-center justify-between p-2.5 rounded-2xl border font-bold ${buttonBg}`}
              style={{ color: themeConfig.primary, borderColor: `${themeConfig.primary}40` }}
            >
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">{activeLesson.title} — {activeSubLesson?.title}</span>
              </div>
              <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
            </button>

            {/* Desktop Curriculum Selector */}
            <div className={`hidden sm:flex items-center gap-3 ${themeConfig.cardBg} p-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl`}>
              <div className="flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl border" style={{ color: themeConfig.primary, borderColor: `${themeConfig.primary}40` }}>
                <BookOpen className="w-4 h-4" />
                <span>{activeLesson.title}</span>
              </div>
              <div className={`h-4 w-[1px] ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
              <div className="flex items-center gap-2 font-medium opacity-80">
                <Layers className="w-4 h-4 opacity-50" />
                <span>{activeSubLesson?.title}</span>
              </div>
            </div>

            {/* Live HUD Counters */}
            <div className={`flex items-center gap-4 sm:gap-6 font-mono text-xs sm:text-sm tracking-wider ${themeConfig.cardBg} px-3 sm:px-4 py-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl w-full sm:w-auto justify-around sm:justify-end transition-colors duration-300`}>
              <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
              <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
              <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{elapsedSeconds}s</b></span>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            {/* BARIS 1: Mode Switcher + Opsi Waktu / Kata (Disatukan dalam 1 Baris Ringkas) */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className={`flex items-center justify-between w-full sm:w-auto ${themeConfig.cardBg} p-1.5 rounded-2xl border ${themeConfig.cardBorder} shadow-lg`}>
                
                {/* Switcher Mode (Time vs Words) */}
                <div className={`flex p-0.5 rounded-xl border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
                  <button
                    onClick={() => { setModeType('time'); handleFocusInput(); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] sm:text-xs ${
                      modeType === 'time' ? 'text-black font-bold shadow-sm' : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                    }`}
                    style={{ backgroundColor: modeType === 'time' ? themeConfig.primary : 'transparent' }}
                  >
                    <Clock className="w-3.5 h-3.5" /> time
                  </button>
                  <button
                    onClick={() => { setModeType('words'); handleFocusInput(); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] sm:text-xs ${
                      modeType === 'words' ? 'text-black font-bold shadow-sm' : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                    }`}
                    style={{ backgroundColor: modeType === 'words' ? themeConfig.primary : 'transparent' }}
                  >
                    <Type className="w-3.5 h-3.5" /> words
                  </button>
                </div>

                <div className={`h-4 w-[1px] mx-1 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

                {/* Angka Opsi (Waktu atau Kata) */}
                {modeType === 'time' ? (
                  <div className="flex gap-1">
                    {[15, 30, 60].map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTimeLimit(t); handleFocusInput(); }}
                        className={`px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] sm:text-xs ${
                          timeLimit === t ? `font-bold ${activeOptionBg}` : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
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
                        className={`px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] sm:text-xs ${
                          wordLimit === w ? `font-bold ${activeOptionBg}` : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                        }`}
                        style={{ color: wordLimit === w ? themeConfig.primary : undefined }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}

              </div>

              {/* Desktop Live HUD Counters (Sembunyi di Mobile Baris 1, Pindah ke Baris 2) */}
              <div className={`hidden sm:flex items-center gap-6 font-mono text-sm tracking-wider ${themeConfig.cardBg} px-4 py-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl transition-colors duration-300`}>
                <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
                <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
                <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{modeType === 'time' ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}</b></span>
              </div>
            </div>

            {/* BARIS 2: Difficulty Level Switcher + Mobile HUD */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className={`flex items-center gap-1 p-1 rounded-2xl border w-full sm:w-auto justify-between sm:justify-start ${themeConfig.cardBg} ${themeConfig.cardBorder} shadow-md`}>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 ml-2 mr-1 opacity-70" style={{ color: themeConfig.primary }} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider mr-1 ${controlSubText}`}>Difficulty:</span>
                </div>
                <div className="flex items-center gap-1">
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => { setDifficulty(lvl); handleFocusInput(); }}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-all duration-200 text-[11px] sm:text-xs ${
                        difficulty === lvl ? `font-bold ${activeOptionBg}` : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                      }`}
                      style={{ color: difficulty === lvl ? themeConfig.primary : undefined }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Live HUD Counters */}
              <div className={`flex sm:hidden items-center justify-around font-mono text-xs tracking-wider ${themeConfig.cardBg} px-3 py-1.5 rounded-2xl border ${themeConfig.cardBorder} shadow-md w-full transition-colors duration-300`}>
                <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
                <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
                <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{modeType === 'time' ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}</b></span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM SHEET CURRICULUM MOBILE */}
      {activeSheet && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setActiveSheet(false)} />
          
          <div className={`relative w-full max-h-[85vh] rounded-t-3xl border-t p-5 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl ${sheetBg} ${isLight ? 'border-black/10' : 'border-white/10'}`}>
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 font-mono font-bold text-sm">
                <BookOpen className="w-4 h-4" style={{ color: themeConfig.primary }} />
                <span>Pilih Kurikulum Belajar</span>
              </div>
              <button onClick={() => setActiveSheet(false)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {TYPING_STUDY_CURRICULUM.map((lesson) => {
                const isSelectedLesson = lesson.id === selectedLessonId;
                return (
                  <div key={lesson.id} className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setSelectedSubLessonId(lesson.subLessons[0].id);
                      }}
                      className="w-full flex items-center justify-between p-3.5 text-left font-bold"
                      style={{
                        backgroundColor: isSelectedLesson ? `${themeConfig.primary}26` : 'transparent',
                        color: isSelectedLesson ? themeConfig.primary : undefined
                      }}
                    >
                      <span>{lesson.title}</span>
                      {isSelectedLesson && <Check className="w-4 h-4 shrink-0" style={{ color: themeConfig.primary }} />}
                    </button>

                    {isSelectedLesson && (
                      <div className="p-2 space-y-1 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
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
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                                isSelectedSub ? 'bg-black/10 dark:bg-white/15 font-bold' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ color: isSelectedSub ? themeConfig.primary : undefined }}
                            >
                              <span>{sub.title}</span>
                              {isSelectedSub && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />}
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