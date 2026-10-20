'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import VisualKeyboard from './VisualKeyboard';
import ResultView from './ResultView';
import HeaderNav from './HeaderNav';
import ConfigBar from './ConfigBar';
import { RotateCcw } from 'lucide-react';

export default function TypingApp() {
  const { state, actions } = useTypingEngine();
  const containerRef = useRef(null);
  const mobileInputRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  const [lineScrollOffset, setLineScrollOffset] = useState(0);

  const themeConfig = state.themeConfig;
  const isLight = themeConfig.isLight;

  // Fokuskan area pengetikan yang sesuai: containerRef di Desktop, mobileInputRef di Mobile
  const focusTypingArea = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) {
      if (containerRef.current) {
        containerRef.current.focus();
      }
    } else {
      if (mobileInputRef.current) {
        mobileInputRef.current.focus();
      }
    }
  }, []);

  // Auto-Focus saat inisialisasi atau saat konfigurasi tes berubah
  useEffect(() => {
    if (!state.isFinished) {
      focusTypingArea();
    }
  }, [
    state.testCategory, state.modeType, state.timeLimit, state.wordLimit,
    state.difficulty, state.selectedLessonId, state.selectedSubLessonId, state.isFinished,
    focusTypingArea
  ]);

  // Global keydown listener untuk desktop: Tab reset & auto refocus
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Tombol Tab untuk reset instan
      if (e.key === 'Tab') {
        e.preventDefault();
        actions.resetTest();
        focusTypingArea();
        return;
      }

      // Di desktop, arahkan fokus ke container pengetikan jika user mengetik saat tidak berada di elemen input lain
      if (typeof window !== 'undefined' && window.innerWidth >= 768 && !state.isFinished) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'button' && activeTag !== 'select') {
          if (document.activeElement !== containerRef.current) {
            containerRef.current?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [actions, state.isFinished, focusTypingArea]);

  // Auto-Scroll Multi-Baris Presisi Adaptif
  useEffect(() => {
    if (!activeWordRef.current || !wordsContainerRef.current) return;

    const activeEl = activeWordRef.current;
    const lineHeight = activeEl.offsetHeight || 44;
    const wordTop = activeEl.offsetTop;
    const currentLine = Math.floor(wordTop / lineHeight);

    if (currentLine >= 1) {
      setLineScrollOffset((currentLine - 1) * lineHeight);
    } else {
      setLineScrollOffset(0);
    }
  }, [state.currentWordIdx, state.typedWords]);

  useEffect(() => {
    if (!state.isStarted) {
      setLineScrollOffset(0);
    }
  }, [state.isStarted]);

  return (
    <div className={`min-h-screen pt-2 sm:pt-6 pb-6 px-3 sm:px-8 md:px-12 transition-colors duration-300 font-sans ${themeConfig.bg} ${themeConfig.textMain}`}>
      <div className="max-w-5xl mx-auto space-y-2 sm:space-y-6">
        
        {/* Header Navigation (Focus Mode: meredup/sembunyi di mobile saat mengetik) */}
        <HeaderNav state={state} inputRef={containerRef} isStarted={state.isStarted} />

        {/* Config Bar (Focus Mode: meredup/sembunyi di mobile saat mengetik) */}
        <ConfigBar state={state} inputRef={containerRef} isStarted={state.isStarted} />

        {!state.isFinished ? (
          <div className="flex items-center justify-center pt-1 pb-1 sm:py-6">
            {/* Core Focused Typing Container (Desktop & Mobile Wrapper) */}
            <div
              ref={containerRef}
              tabIndex={0}
              onKeyDown={actions.handleKeyDown}
              onClick={focusTypingArea}
              className={`relative w-full cursor-text font-mono text-base sm:text-2xl md:text-3xl leading-none tracking-wider select-none h-[116px] sm:h-[132px] overflow-hidden rounded-2xl px-3 sm:px-6 py-0 border shadow-inner transition-colors duration-300 outline-none ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
            >
              {/* Hidden Input khusus Mobile: Menangkap Virtual Keyboard HP & Sinkronisasi Real-Time */}
              <input
                ref={mobileInputRef}
                type="text"
                value={state.typedWords[state.currentWordIdx] || ''}
                onChange={(e) => actions.handleSyncInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && (!e.target.value || e.target.value.length === 0)) {
                    actions.handleBackspace();
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    actions.resetTest();
                    focusTypingArea();
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-default md:pointer-events-none md:z-[-1]"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="next"
                inputMode="text"
              />

              <div
                ref={wordsContainerRef}
                style={{ transform: `translateY(-${lineScrollOffset}px)` }}
                className="flex flex-wrap gap-x-2 sm:gap-x-4 transition-transform duration-200 ease-out font-mono w-full"
              >
                {state.words.map((targetWord, wIdx) => {
                  const typedWord = state.typedWords[wIdx] || '';
                  const isCurrentWord = wIdx === state.currentWordIdx;
                  const isPassedWord = wIdx < state.currentWordIdx;

                  const maxLen = Math.max(targetWord.length, typedWord.length);
                  const charList = [];

                  for (let cIdx = 0; cIdx < maxLen; cIdx++) {
                    const targetChar = targetWord[cIdx];
                    const typedChar = typedWord[cIdx];

                    let status = 'pending';
                    if (cIdx < typedWord.length) {
                      if (cIdx < targetWord.length) {
                        status = typedChar === targetChar ? 'correct' : 'incorrect';
                      } else {
                        status = 'extra';
                      }
                    } else if (isPassedWord && cIdx < targetWord.length) {
                      status = 'missed';
                    }

                    charList.push({
                      char: targetChar || typedChar,
                      status,
                      isCaret: isCurrentWord && cIdx === typedWord.length
                    });
                  }

                  return (
                    <span
                      key={wIdx}
                      ref={isCurrentWord ? activeWordRef : null}
                      className="inline-flex relative h-[38px] sm:h-[44px] items-center my-0"
                    >
                      {charList.map((item, cIdx) => {
                        let charStyle = isLight ? 'text-[#282a2e]/45' : 'text-white/30';

                        if (item.status === 'correct') {
                          charStyle = isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400 font-medium';
                        } else if (item.status === 'incorrect') {
                          charStyle = 'text-rose-600 bg-rose-500/15 rounded px-0.5 font-medium';
                        } else if (item.status === 'extra') {
                          charStyle = 'text-rose-700 bg-rose-950/40 rounded px-0.5 font-bold';
                        } else if (item.status === 'missed') {
                          charStyle = isLight ? 'text-amber-800 underline decoration-rose-500 decoration-2' : 'text-amber-500/70 underline decoration-rose-500 decoration-2';
                        }

                        return (
                          <span key={cIdx} className={`relative ${charStyle}`}>
                            {item.isCaret && (
                              <span 
                                className="absolute -left-0.5 top-1 bottom-1 sm:top-1.5 sm:bottom-1.5 w-[2.5px] sm:w-[3px] animate-pulse rounded-full" 
                                style={{
                                  backgroundColor: themeConfig.primary,
                                  boxShadow: `0 0 8px ${themeConfig.primary}`
                                }}
                              />
                            )}
                            {item.char}
                          </span>
                        );
                      })}

                      {isCurrentWord && typedWord.length >= targetWord.length && (
                        <span className="relative">
                          <span 
                            className="absolute -left-0.5 top-1 bottom-1 sm:top-1.5 sm:bottom-1.5 w-[2.5px] sm:w-[3px] animate-pulse rounded-full" 
                            style={{
                              backgroundColor: themeConfig.primary,
                              boxShadow: `0 0 8px ${themeConfig.primary}`
                            }}
                          />
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <ResultView state={state} onReset={actions.resetTest} />
        )}

        {!state.isFinished && (
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <button
              onClick={() => {
                actions.resetTest();
                focusTypingArea();
              }}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              style={{ color: themeConfig.primary }}
              title="Acak Ulang Kata (Tekan Tab)"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-[10px] font-mono opacity-60 tracking-wider hidden sm:inline">
              tekan <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-black/5 border-black/10 text-black/80' : 'bg-white/10 border-white/10 text-white/80'}`}>Tab</kbd> untuk mengacak ulang
            </span>
          </div>
        )}

        {/* Visual Keyboard otomatis tersembunyi di HP (hidden md:block) */}
        <div className="hidden md:block">
          <VisualKeyboard 
            getNextChar={actions.getNextChar} 
            charErrors={state.charErrors} 
            themeConfig={state.themeConfig} 
          />
        </div>

      </div>
    </div>
  );
}
