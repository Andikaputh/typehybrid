'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { RotateCcw, Image as ImageIcon, Check } from 'lucide-react';
import { toBlob } from 'html-to-image';

const ResultChart = dynamic(() => import('./ResultChart'), {
  ssr: false,
  loading: () => <div className="h-[230px]" />,
});

export default function ResultView({ state, onReset }) {
  const {
    wpm, rawWpm, accuracy, consistency, burstWpm, wordBursts, chartData,
    testCategory, activeLesson, modeType, timeLimit, wordLimit,
    charStats, elapsedSeconds, themeConfig,
  } = state;

  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const resultCardRef = useRef(null);

  const isLight = themeConfig.isLight;
  const subText = isLight ? 'text-black/50' : 'text-white/40';
  const divider = isLight ? 'border-black/10' : 'border-white/10';
  const [correct, incorrect, extra, missed] = charStats || [0, 0, 0, 0];

  const testType = testCategory === 'curriculum'
    ? activeLesson.title
    : modeType === 'time'
      ? `time ${timeLimit}s`
      : `words ${wordLimit}`;

  const showWpm = Math.round(wpm);
  const showRaw = Math.round(rawWpm);
  const showAccuracy = accuracy === 100 ? 100 : Math.round(accuracy);
  const showConsistency = Math.round(consistency);

  const copyResultCardToClipboard = async () => {
    if (!resultCardRef.current || isCopying) return;
    setIsCopying(true);
    try {
      const blob = await toBlob(resultCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        fontEmbedCSS: '',
        filter: (node) => node.tagName !== 'LINK' || node.rel !== 'stylesheet',
      });

      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (err) {
      console.error('Gagal menyalin gambar:', err);
      alert('Tidak dapat menyalin kartu hasil ke clipboard.');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="py-4 sm:py-8 animate-fade-in">
      <div
        ref={resultCardRef}
        className={`${themeConfig.bg} px-1 sm:px-4 py-2 space-y-6`}
      >
        {/* Test type */}
        <div className={`flex items-center justify-end text-[11px] font-mono ${subText}`}>
          <span className="truncate max-w-[70%] text-right" style={{ color: themeConfig.primary }}>
            {testType}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
          {/* Main stats: WPM + ACC */}
          <div className="flex md:flex-col items-end md:items-start justify-between md:justify-start gap-4 md:gap-5 shrink-0 md:w-[190px]">
            <div>
              <div className={`text-lg font-mono leading-none ${subText}`}>wpm</div>
              <div
                className="text-[3.6rem] sm:text-[4.5rem] font-mono leading-[0.95] transition-colors duration-300"
                style={{ color: themeConfig.primary }}
              >
                {showWpm}
              </div>
            </div>

            <div>
              <div className={`text-lg font-mono leading-none ${subText}`}>acc</div>
              <div className={`text-[2.75rem] sm:text-[3.4rem] font-mono leading-[0.95] ${themeConfig.textMain}`}>
                {showAccuracy}%
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-w-0 min-h-[230px]">
            <ResultChart
              chartData={chartData}
              wordBursts={wordBursts}
              themeConfig={themeConfig}
            />
          </div>
        </div>

        {/* Secondary stats */}
        <div className={`flex flex-wrap items-start gap-x-8 gap-y-4 pt-4 border-t ${divider} font-mono`}>
          <div>
            <div className={`text-[11px] ${subText}`}>raw</div>
            <div className={`text-xl leading-tight ${themeConfig.textMain}`}>{showRaw}</div>
          </div>

          <div>
            <div className={`text-[11px] ${subText}`}>characters</div>
            <div className="text-xl leading-tight">
              <span style={{ color: themeConfig.primary }}>{correct}</span>
              <span className={isLight ? 'text-black/35' : 'text-white/30'}>/</span>
              <span className="text-[#ca4754]">{incorrect}</span>
              <span className={isLight ? 'text-black/35' : 'text-white/30'}>/</span>
              <span className="text-[#ca4754]/70">{extra}</span>
              <span className={isLight ? 'text-black/35' : 'text-white/30'}>/</span>
              <span className="text-[#7e2a33] dark:text-[#ca4754]/60">{missed}</span>
            </div>
          </div>

          <div>
            <div className={`text-[11px] ${subText}`}>consistency</div>
            <div className={`text-xl leading-tight ${themeConfig.textMain}`}>{showConsistency}%</div>
          </div>

          <div>
            <div className={`text-[11px] ${subText}`}>time</div>
            <div className={`text-xl leading-tight ${themeConfig.textMain}`}>{elapsedSeconds}s</div>
          </div>

          <div>
            <div className={`text-[11px] ${subText}`}>burst</div>
            <div className="text-xl leading-tight" style={{ color: themeConfig.primary }}>{burstWpm}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center items-center gap-3 pt-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 text-black font-bold rounded-xl transition shadow-lg hover:brightness-110 active:scale-95 font-mono"
          style={{ backgroundColor: themeConfig.primary }}
        >
          <RotateCcw className="w-4 h-4" /> Latihan Lagi
        </button>

        <button
          onClick={copyResultCardToClipboard}
          disabled={isCopying}
          className={`flex items-center gap-2 px-5 py-3 ${
            isLight
              ? 'bg-black/5 hover:bg-black/10 text-black border-black/10'
              : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
          } font-semibold rounded-xl border transition disabled:opacity-50 font-mono`}
          title="Copy kartu hasil ke clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Tersalin!</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" style={{ color: themeConfig.primary }} />
              <span>Copy Gambar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
