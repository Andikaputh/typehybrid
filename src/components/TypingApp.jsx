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
  const containerRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  const [lineScrollOffset, setLineScrollOffset] = useState(0);

  const themeConfig = state.themeConfig;
  const isLight = themeConfig.isLight;

  // Auto-Focus
  useEffect(() => {
    if (!state.isFinished && containerRef.current) {
      containerRef.current.focus();
    }
  }, [
    state.testCategory, state.modeType, state.timeLimit, state.wordLimit,
    state.difficulty, state.selectedLessonId, state.selectedSubLessonId, state.isFinished
  ]);

  // Auto-Scroll Multi-Baris Presisi
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
  }, [state.currentWordIdx, state.typedWords]);

  useEffect(() => {
    if (!state.isStarted) {
      setLineScrollOffset(0);
    }
  }, [state.isStarted]);

  return (
    <div className={`min-h-screen py-8 px-4 md:px-12 transition-colors duration-300 font-sans ${themeConfig.bg} ${themeConfig.textMain}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <HeaderNav state={state} inputRef={containerRef} />
        <ConfigBar state={state} inputRef={containerRef} />

        {!state.isFinished ? (
          <div className="flex items-center justify-between gap-8 py-8 min-h-[300px]">
            {/* Left Hand Guide */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <HandGuide side="left" activeFinger={actions.activeFinger} themeConfig={state.themeConfig} />
            </div>

            {/* Core Focused Typing Container */}
            <div
              ref={containerRef}
              tabIndex={0}
              onKeyDown={actions.handleKeyDown}
              onClick={() => containerRef.current && containerRef.current.focus()}
              className={`relative flex-1 cursor-text font-mono text-2xl md:text-3xl leading-none tracking-wider select-none h-[150px] overflow-hidden rounded-2xl px-6 py-0 border shadow-inner transition-colors duration-300 outline-none ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
            >
              <div
                ref={wordsContainerRef}
                style={{ transform: `translateY(-${lineScrollOffset}px)` }}
                className="flex flex-wrap gap-x-4 transition-transform duration-200 ease-out font-mono w-full"
              >
                {state.words.map((targetWord, wIdx) => {
                  const typedWord = state.typedWords[wIdx] || '';
                  const isCurrentWord = wIdx === state.currentWordIdx;
                  const isPassedWord = wIdx < state.currentWordIdx;

                  // Konstruksi array karakter termasuk karakter ekstra
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
                      className="inline-flex relative h-[50px] items-center my-0"
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
                                className="absolute -left-0.5 top-2 bottom-2 w-[3px] animate-pulse rounded-full" 
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

                      {/* Caret di akhir kata jika caret berada setelah huruf terakhir */}
                      {isCurrentWord && typedWord.length >= targetWord.length && (
                        <span className="relative">
                          <span 
                            className="absolute -left-0.5 top-2 bottom-2 w-[3px] animate-pulse rounded-full" 
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
                if (containerRef.current) containerRef.current.focus();
              }}
              className={`p-3 rounded-2xl border transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              style={{ color: themeConfig.primary }}
              title="Acak Ulang Kata (Tekan Tab)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono opacity-50 tracking-wider">
              tekan <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-black/5 border-black/10 text-black/80' : 'bg-white/10 border-white/10 text-white/80'}`}>Tab</kbd> untuk mengacak ulang
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