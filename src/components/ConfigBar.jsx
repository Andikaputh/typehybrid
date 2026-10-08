'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Type, Sparkles, ChevronDown, Check, BookOpen, Layers, X } from 'lucide-react';
import { TYPING_STUDY_CURRICULUM } from '@/data/curriculumData';

export default function ConfigBar({ state, inputRef }) {
  const {
    testCategory, selectedLessonId, setSelectedLessonId,
    selectedSubLessonId, setSelectedSubLessonId,
    modeType, setModeType, timeLimit, setTimeLimit,
    wordLimit, setWordLimit, difficulty, setDifficulty,
    activeLesson, wpm, accuracy, elapsedSeconds, isStarted, themeConfig
  } = state;

  const [activeSheet, setActiveSheet] = useState(null); // 'curriculum' | null
  const [openLesson, setOpenLesson] = useState(false);

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
      <div className={`flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-3 transition-all duration-300 ${isStarted ? 'opacity-0 sm:opacity-20 pointer-events-none sm:pointer-events-auto' : 'opacity-100'}`}>
        {testCategory === 'curriculum' ? (
          <div className="w-full sm:w-auto">
            {/* Mobile Curriculum Trigger Button */}
            <button
              onClick={() => setActiveSheet('curriculum')}
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
          </div>
        ) : (
          <div className={`flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar ${themeConfig.cardBg} p-1.5 sm:p-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl transition-colors duration-300 w-full sm:w-auto`}>
            {/* Mode Switcher */}
            <div className={`flex p-1 rounded-xl shrink-0 border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
              <button
                onClick={() => { setModeType('time'); handleFocusInput(); }}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg transition-all duration-200 ${
                  modeType === 'time' ? 'text-black font-bold shadow-sm' : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                }`}
                style={{ backgroundColor: modeType === 'time' ? themeConfig.primary : 'transparent' }}
              >
                <Clock className="w-3.5 h-3.5" /> time
              </button>
              <button
                onClick={() => { setModeType('words'); handleFocusInput(); }}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg transition-all duration-200 ${
                  modeType === 'words' ? 'text-black font-bold shadow-sm' : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                }`}
                style={{ backgroundColor: modeType === 'words' ? themeConfig.primary : 'transparent' }}
              >
                <Type className="w-3.5 h-3.5" /> words
              </button>
            </div>

            <div className={`h-4 w-[1px] shrink-0 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

            {/* Difficulty Switcher */}
            <div className={`flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl shrink-0 border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
              <Sparkles className="w-3 h-3 ml-1 mr-0.5 opacity-70" style={{ color: themeConfig.primary }} />
              {['easy', 'medium', 'hard'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setDifficulty(lvl); handleFocusInput(); }}
                  className={`px-2 py-1 rounded-lg capitalize transition-all duration-200 ${
                    difficulty === lvl ? `font-bold ${activeOptionBg}` : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                  }`}
                  style={{ color: difficulty === lvl ? themeConfig.primary : undefined }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className={`h-4 w-[1px] shrink-0 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

            {/* Time / Word Limit */}
            {modeType === 'time' ? (
              <div className="flex gap-0.5 shrink-0">
                {[15, 30, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTimeLimit(t); handleFocusInput(); }}
                    className={`px-2 py-1 rounded-lg transition-all duration-200 ${
                      timeLimit === t ? `font-bold ${activeOptionBg}` : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                    }`}
                    style={{ color: timeLimit === t ? themeConfig.primary : undefined }}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-0.5 shrink-0">
                {[10, 25, 50].map((w) => (
                  <button
                    key={w}
                    onClick={() => { setWordLimit(w); handleFocusInput(); }}
                    className={`px-2 py-1 rounded-lg transition-all duration-200 ${
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
        )}

        {/* Live HUD Counters */}
        <div className={`flex items-center gap-4 sm:gap-6 font-mono text-xs sm:text-sm tracking-wider ${themeConfig.cardBg} px-3 sm:px-4 py-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl w-full sm:w-auto justify-around sm:justify-end transition-colors duration-300`}>
          <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
          <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
          <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{modeType === 'time' && testCategory === 'free' ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}</b></span>
        </div>
      </div>

      {/* BOTTOM SHEET CURRICULUM UNTUK MOBILE */}
      {activeSheet === 'curriculum' && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setActiveSheet(null)} />
          
          <div className={`relative w-full max-h-[85vh] rounded-t-3xl border-t p-5 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl ${sheetBg} ${isLight ? 'border-black/10' : 'border-white/10'}`}>
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 font-mono font-bold text-sm">
                <BookOpen className="w-4 h-4" style={{ color: themeConfig.primary }} />
                <span>Pilih Kurikulum Belajar</span>
              </div>
              <button onClick={() => setActiveSheet(null)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition">
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
                                setActiveSheet(null);
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