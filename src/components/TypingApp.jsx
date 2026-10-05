'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import HandGuide from './HandGuide';
import VisualKeyboard from './VisualKeyboard';
import ResultView from './ResultView';
import HeaderNav from './HeaderNav';
import ConfigBar from './ConfigBar';
import { RotateCcw } from 'lucide-react';

export default function TypingApp() {
  const { state, actions } = useTypingEngine();
  const inputRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  const [lineScrollOffset, setLineScrollOffset] = useState(0);

  const themeConfig = state.themeConfig;
  const isLight = themeConfig.isLight;

  // Auto-Focus Input
  useEffect(() => {
    if (!state.isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [
    state.testCategory, 
    state.modeType, 
    state.timeLimit, 
    state.wordLimit, 
    state.difficulty, 
    state.selectedLessonId, 
    state.selectedSubLessonId, 
    state.isFinished,
    state.targetText
  ]);

  // Logika Auto-Scroll 3 Baris
  useEffect(() => {
    if (!activeWordRef.current || !wordsContainerRef.current) return;

    const activeEl = activeWordRef.current;
    const LINE_HEIGHT = 50;
    const wordTop = activeEl.offsetTop;
    const currentLine = Math.floor(wordTop / LINE_HEIGHT);

    if (currentLine >= 1) {
      setLineScrollOffset((currentLine - 1) * LINE_HEIGHT);
    } else {
      setLineScrollOffset(0);
    }
  }, [state.input]);

  useEffect(() => {
    setLineScrollOffset(0);
  }, [state.targetText]);

  return (
    <div className={`min-h-screen py-8 px-4 md:px-12 transition-colors duration-300 font-sans ${themeConfig.bg} ${themeConfig.textMain}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <HeaderNav state={state} inputRef={inputRef} />
        <ConfigBar state={state} inputRef={inputRef} />

        {!state.isFinished ? (
          <div className="flex items-center justify-between gap-8 py-8 min-h-[300px]">
            {/* Left Hand Guide */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <HandGuide side="left" activeFinger={actions.activeFinger} themeConfig={state.themeConfig} />
            </div>

            {/* Core Focused Typing Container */}
            <div
              onClick={() => inputRef.current && inputRef.current.focus()}
              className={`relative flex-1 cursor-text font-mono text-2xl md:text-3xl leading-none tracking-wider select-none h-[150px] overflow-hidden rounded-2xl px-6 py-0 border shadow-inner transition-colors duration-300 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
            >
              <div
                ref={wordsContainerRef}
                style={{ transform: `translateY(-${lineScrollOffset}px)` }}
                className="flex flex-wrap gap-x-4 transition-transform duration-200 ease-out font-mono w-full"
              >
                {state.targetText.split(' ').map((word, wIdx) => {
                  const previousCharsCount = state.targetText.split(' ').slice(0, wIdx).join(' ').length + (wIdx > 0 ? 1 : 0);
                  const isCurrentWord = state.input.length >= previousCharsCount && state.input.length <= previousCharsCount + word.length;

                  return (
                    <span
                      key={wIdx}
                      ref={isCurrentWord ? activeWordRef : null}
                      className="inline-flex relative h-[50px] items-center my-0"
                    >
                      {word.split('').map((char, cIdx) => {
                        const charIndex = previousCharsCount + cIdx;
                        let charStyle = isLight ? 'opacity-35' : 'opacity-25';

                        if (charIndex < state.input.length) {
                          charStyle = state.input[charIndex] === char 
                            ? 'opacity-100 font-medium' 
                            : 'text-rose-500 bg-rose-500/10 rounded px-0.5';
                        }

                        const isCaret = charIndex === state.input.length;

                        return (
                          <span key={cIdx} className={`relative ${charStyle}`}>
                            {isCaret && (
                              <span 
                                className="absolute -left-0.5 top-2 bottom-2 w-[3px] animate-pulse rounded-full" 
                                style={{
                                  backgroundColor: themeConfig.primary,
                                  boxShadow: `0 0 8px ${themeConfig.primary}`
                                }}
                              />
                            )}
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </div>

              {/* Hidden Native Input */}
              <input
                ref={inputRef}
                type="text"
                value={state.input}
                onChange={actions.handleInputChange}
                onKeyDown={actions.handleKeyDown}
                className="absolute inset-0 opacity-0 cursor-default"
                autoFocus
              />
            </div>

            {/* Right Hand Guide */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <HandGuide side="right" activeFinger={actions.activeFinger} themeConfig={state.themeConfig} />
            </div>
          </div>
        ) : (
          <ResultView state={state} onReset={actions.resetTest} />
        )}

        {!state.isFinished && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                actions.resetTest();
                if (inputRef.current) inputRef.current.focus();
              }}
              className={`p-3 rounded-2xl border transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              style={{ color: themeConfig.primary }}
              title="Acak Ulang Kata (Tekan Tab)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono opacity-50 tracking-wider">
              tekan <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-black/5 border-black/10 text-black/80' : 'bg-white/10 border-white/10 text-white/80'}`}>Tab</kbd> atau <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-black/5 border-black/10 text-black/80' : 'bg-white/10 border-white/10 text-white/80'}`}>Tab + Enter</kbd> untuk mengacak ulang
            </span>
          </div>
        )}

        <VisualKeyboard 
          getNextChar={actions.getNextChar} 
          charErrors={state.charErrors} 
          themeConfig={state.themeConfig} 
        />

      </div>
    </div>
  );
}