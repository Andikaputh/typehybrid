'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Type, Sparkles, ChevronDown, Check, BookOpen, Layers } from 'lucide-react';
import { TYPING_STUDY_CURRICULUM } from '@/data/curriculumData';

export default function ConfigBar({ state, inputRef }) {
  const {
    testCategory, selectedLessonId, setSelectedLessonId,
    selectedSubLessonId, setSelectedSubLessonId,
    modeType, setModeType, timeLimit, setTimeLimit,
    wordLimit, setWordLimit, difficulty, setDifficulty,
    activeLesson, wpm, accuracy, elapsedSeconds, isStarted, themeConfig
  } = state;

  const [openLesson, setOpenLesson] = useState(false);
  const [openSubLesson, setOpenSubLesson] = useState(false);

  const lessonRef = useRef(null);
  const subLessonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (lessonRef.current && !lessonRef.current.contains(e.target)) setOpenLesson(false);
      if (subLessonRef.current && !subLessonRef.current.contains(e.target)) setOpenSubLesson(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocusInput = () => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  };

  const activeSubLesson = activeLesson?.subLessons?.find(s => s.id === selectedSubLessonId) || activeLesson?.subLessons?.[0];
  const isLight = themeConfig.isLight;
  
  const buttonBg = isLight ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-black/30 border-white/10 hover:bg-black/50';
  const controlSubText = isLight ? 'text-[#323437]/70' : 'text-white/50';
  const activeOptionBg = isLight ? 'bg-black/10' : 'bg-white/10';
  const dropdownBg = isLight ? 'bg-[#e1e1e1] border-black/10' : 'bg-[#18191a] border-white/20';

  return (
    <div className={`flex flex-wrap justify-between items-center text-xs font-mono gap-4 transition-all duration-300 ${isStarted ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
      {testCategory === 'curriculum' ? (
        <div className={`flex flex-wrap items-center gap-3 ${themeConfig.cardBg} p-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl transition-colors duration-300`}>
          
          {/* Custom Dropdown: Pelajaran Utama */}
          <div className="relative" ref={lessonRef}>
            <button
              onClick={() => {
                setOpenLesson(!openLesson);
                setOpenSubLesson(false);
              }}
              className={`flex items-center gap-2 font-bold px-3.5 py-2 rounded-xl border transition-all duration-200 ${buttonBg}`}
              style={{
                color: themeConfig.primary,
                borderColor: `${themeConfig.primary}40`
              }}
            >
              <BookOpen className="w-4 h-4" style={{ color: themeConfig.primary }} />
              <span>{activeLesson.title}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openLesson ? 'rotate-180' : 'opacity-40'}`} style={{ color: openLesson ? themeConfig.primary : undefined }} />
            </button>

            {openLesson && (
              <div className={`absolute left-0 mt-2 w-80 border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[9999] py-2 max-h-80 overflow-y-auto divide-y animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownBg} ${isLight ? 'divide-black/5' : 'divide-white/5'}`}>
                {TYPING_STUDY_CURRICULUM.map((lesson) => {
                  const isSelected = lesson.id === selectedLessonId;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setSelectedSubLessonId(lesson.subLessons[0].id);
                        setOpenLesson(false);
                        handleFocusInput();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors ${
                        isSelected ? 'font-bold' : `${controlSubText}${isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${themeConfig.primary}26` : 'transparent',
                        color: isSelected ? themeConfig.primary : undefined,
                        borderLeft: isSelected ? `2px solid ${themeConfig.primary}` : 'none'
                      }}
                    >
                      <span className="truncate pr-2 font-mono">{lesson.title}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" style={{ color: themeConfig.primary }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`h-4 w-[1px] ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          {/* Custom Dropdown: Sub-Pelajaran */}
          <div className="relative" ref={subLessonRef}>
            <button
              onClick={() => {
                setOpenSubLesson(!openSubLesson);
                setOpenLesson(false);
              }}
              className={`flex items-center gap-2 font-medium px-3.5 py-2 rounded-xl border transition-all duration-200 ${themeConfig.textMain} ${buttonBg}`}
            >
              <Layers className="w-4 h-4 opacity-50" />
              <span>{activeSubLesson?.title || 'Pilih Sub-Pelajaran'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubLesson ? 'rotate-180' : 'opacity-40'}`} />
            </button>

            {openSubLesson && (
              <div className={`absolute left-0 mt-2 w-80 border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[9999] py-2 max-h-80 overflow-y-auto divide-y animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownBg} ${isLight ? 'divide-black/5' : 'divide-white/5'}`}>
                {activeLesson?.subLessons?.map((sub) => {
                  const isSelected = sub.id === selectedSubLessonId;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubLessonId(sub.id);
                        setOpenSubLesson(false);
                        handleFocusInput();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors ${
                        isSelected ? 'font-bold' : `${controlSubText}${isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${themeConfig.primary}26` : 'transparent',
                        color: isSelected ? themeConfig.primary : undefined,
                        borderLeft: isSelected ? `2px solid ${themeConfig.primary}` : 'none'
                      }}
                    >
                      <span className="truncate pr-2 font-mono">{sub.title}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" style={{ color: themeConfig.primary }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className={`flex flex-wrap items-center gap-3 ${themeConfig.cardBg} p-2 rounded-2xl border ${themeConfig.cardBorder} shadow-xl transition-colors duration-300`}>
          {/* Mode Switcher */}
          <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
            <button
              onClick={() => { setModeType('time'); handleFocusInput(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                modeType === 'time' ? 'text-black font-bold shadow-sm' : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
              }`}
              style={{ backgroundColor: modeType === 'time' ? themeConfig.primary : 'transparent' }}
            >
              <Clock className="w-3.5 h-3.5" /> time
            </button>
            <button
              onClick={() => { setModeType('words'); handleFocusInput(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                modeType === 'words' ? 'text-black font-bold shadow-sm' : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
              }`}
              style={{ backgroundColor: modeType === 'words' ? themeConfig.primary : 'transparent' }}
            >
              <Type className="w-3.5 h-3.5" /> words
            </button>
          </div>

          <div className={`h-4 w-[1px] ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          {/* Difficulty Level Switcher */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'}`}>
            <Sparkles className="w-3 h-3 ml-1.5 mr-0.5 opacity-70" style={{ color: themeConfig.primary }} />
            {['easy', 'medium', 'hard'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setDifficulty(lvl); handleFocusInput(); }}
                className={`px-2.5 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                  difficulty === lvl ? `font-bold ${activeOptionBg}` : `${controlSubText}${isLight ? 'hover:text-black' : 'hover:text-white'}`
                }`}
                style={{ color: difficulty === lvl ? themeConfig.primary : undefined }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className={`h-4 w-[1px] ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          {/* Time/Word Options */}
          {modeType === 'time' ? (
            <div className="flex gap-1">
              {[15, 30, 60].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTimeLimit(t); handleFocusInput(); }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
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
                  className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
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
      <div className={`flex items-center gap-6 font-mono text-sm tracking-wider ${themeConfig.cardBg} px-4 py-2.5 rounded-2xl border ${themeConfig.cardBorder} shadow-xl ml-auto transition-colors duration-300`}>
        <span>wpm: <b className="font-bold" style={{ color: themeConfig.primary }}>{wpm}</b></span>
        <span>acc: <b className="font-bold" style={{ color: themeConfig.primary }}>{accuracy}%</b></span>
        <span>time: <b className="font-bold" style={{ color: themeConfig.primary }}>{modeType === 'time' && testCategory === 'free' ? `${Math.max(0, timeLimit - elapsedSeconds)}s` : `${elapsedSeconds}s`}</b></span>
      </div>
    </div>
  );
}