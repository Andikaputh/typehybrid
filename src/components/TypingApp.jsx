'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import VisualKeyboard from './VisualKeyboard';
import ResultView from './ResultView';
import HeaderNav from './HeaderNav';
import ConfigBar from './ConfigBar';
import { RotateCcw } from 'lucide-react';

export default function TypingApp() {
  const { state, actions } = useTypingEngine();
  const containerRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  const [lineScrollOffset, setLineScrollOffset] = useState(0);

  const themeConfig = state.themeConfig;
  const isLight = themeConfig.isLight;

  // Handler untuk memfokuskan keyboard HP saat area diketik/diklik
  const triggerMobileKeyboard = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Auto-Focus
  useEffect(() => {
    if (!state.isFinished) {
      triggerMobileKeyboard();
    }
  }, [
    state.testCategory, state.modeType, state.timeLimit, state.wordLimit,
    state.difficulty, state.selectedLessonId, state.selectedSubLessonId, state.isFinished
  ]);

  // Auto-Scroll Multi-Baris Presisi
  useEffect(() => {
    if (!activeWordRef.current || !wordsContainerRef.current) return;

    const activeEl = activeWordRef.current;
    const LINE_HEIGHT = 44;
    const wordTop = activeEl.offsetTop;
    const currentLine = Math.floor(wordTop / LINE_HEIGHT);

    if (currentLine >= 1) {
      setLineScrollOffset((currentLine - 1) * LINE_HEIGHT);
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
    <div className={`min-h-screen py-3 sm:py-8 px-3 sm:px-8 md:px-12 transition-colors duration-300 font-sans ${themeConfig.bg} ${themeConfig.textMain}`}>
      
      {/* Hidden Input khusus untuk memicu Virtual Keyboard HP saat ditekan */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -z-50 w-0 h-0 pointer-events-none"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-6">
        
        {/* Header & Config Bar */}
        <HeaderNav state={state} inputRef={containerRef} />
        <ConfigBar state={state} inputRef={containerRef} />

        {!state.isFinished ? (
          <div className="flex items-center justify-center py-2 sm:py-6">
            {/* Core Focused Typing Container */}
            <div
              ref={containerRef}
              tabIndex={0}
              onKeyDown={actions.handleKeyDown}
              onClick={triggerMobileKeyboard}
              onTouchStart={triggerMobileKeyboard}
              className={`relative w-full cursor-text font-mono text-lg sm:text-2xl md:text-3xl leading-none tracking-wider select-none h-[132px] overflow-hidden rounded-2xl px-3 sm:px-6 py-0 border shadow-inner transition-colors duration-300 outline-none ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
            >
              <div
                ref={wordsContainerRef}
                style={{ transform: `translateY(-${lineScrollOffset}px)` }}
                className="flex flex-wrap gap-x-2.5 sm:gap-x-4 transition-transform duration-200 ease-out font-mono w-full"
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
                      className="inline-flex relative h-[44px] items-center my-0"
                    >
                      {charList.map((item, cIdx) => {
                        let charStyle = isLight ? 'opacity-35' : 'opacity-25';

                        if (item.status === 'correct') {
                          charStyle = 'opacity-100 font-medium text-emerald-400';
                        } else if (item.status === 'incorrect') {
                          charStyle = 'text-rose-500 bg-rose-500/10 rounded px-0.5';
                        } else if (item.status === 'extra') {
                          charStyle = 'text-rose-700 bg-rose-950/40 rounded px-0.5 font-bold';
                        } else if (item.status === 'missed') {
                          charStyle = 'text-amber-500/60 underline decoration-rose-500 decoration-2';
                        }

                        return (
                          <span key={cIdx} className={`relative ${charStyle}`}>
                            {item.isCaret && (
                              <span 
                                className="absolute -left-0.5 top-1.5 bottom-1.5 w-[3px] animate-pulse rounded-full" 
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
                            className="absolute -left-0.5 top-1.5 bottom-1.5 w-[3px] animate-pulse rounded-full" 
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
                triggerMobileKeyboard();
              }}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              style={{ color: themeConfig.primary }}
              title="Acak Ulang Kata (Tekan Tab)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono opacity-50 tracking-wider hidden sm:inline">
              tekan <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-black/5 border-black/10 text-black/80' : 'bg-white/10 border-white/10 text-white/80'}`}>Tab</kbd> untuk mengacak ulang
            </span>
          </div>
        )}

        {/* Visual Keyboard disembunyikan di HP */}
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