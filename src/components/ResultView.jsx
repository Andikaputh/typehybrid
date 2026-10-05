'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Image as ImageIcon, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from 'recharts';
import { toBlob } from 'html-to-image';

const CustomTooltip = ({ active, payload, label, primaryColor }) => {
  if (active && payload && payload.length) {
    const errorData = payload.find(p => p.dataKey === 'errors');
    return (
      <div className="bg-[#18191a] border border-white/15 p-2.5 rounded-lg font-mono text-xs shadow-2xl space-y-1">
        <div className="text-white/40 border-b border-white/10 pb-1 mb-1 font-bold">Detik ke-{label}s</div>
        <div className="font-bold" style={{ color: primaryColor }}>WPM: {payload[0]?.value}</div>
        <div className="opacity-70" style={{ color: primaryColor }}>Raw: {payload[1]?.value}</div>
        {errorData && errorData.value !== null && errorData.value !== undefined && (
          <div className="text-rose-400 font-bold flex items-center gap-1 mt-1">
            <span>✖ {errorData.value} Kesalahan pada detik ini</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const RedCrossDot = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || payload?.errors === null || payload?.errors === undefined) return null;
  return (
    <g transform={`translate(${cx - 5},${cy - 5})`}>
      <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#ca4754" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
};

export default function ResultView({ state, onReset }) {
  const { 
    wpm, accuracy, chartData, testCategory, activeLesson, 
    modeType, timeLimit, wordLimit, completedWordsCount, 
    correctKeystrokes, totalKeystrokes, elapsedSeconds, themeConfig
  } = state;

  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const resultCardRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeChartData = chartData && chartData.length >= 2 
    ? chartData 
    : [
        { time: 0, wpm: 0, raw: 0, errors: null },
        { time: Math.max(1, elapsedSeconds), wpm: wpm, raw: wpm, errors: null }
      ];

  const copyResultCardToClipboard = async () => {
    if (!resultCardRef.current) return;
    try {
      const blob = await toBlob(resultCardRef.current, {
        cacheBust: true,
        fontEmbedCSS: '', 
        filter: (node) => {
          if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
            return false;
          }
          return true;
        },
      });

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (err) {
      console.error('Gagal menyalin gambar:', err);
      alert('Tidak dapat menyalin kartu hasil ke clipboard karena proteksi CORS browser.');
    }
  };

  return (
    <div className="py-6 space-y-6 animate-fade-in">
      {/* Dynamic Theme Card Container */}
      <div 
        ref={resultCardRef}
        className={`${themeConfig.cardBg} p-8 rounded-3xl border ${themeConfig.cardBorder} space-y-6 shadow-2xl transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Big Display WPM & ACC */}
          <div className="space-y-4 shrink-0 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
            <div>
              <div className="text-xs opacity-50 uppercase tracking-widest font-mono">wpm</div>
              <div className="text-6xl md:text-7xl font-black font-mono leading-none transition-colors duration-300" style={{ color: themeConfig.primary }}>
                {wpm}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-50 uppercase tracking-widest font-mono">acc</div>
              <div className={`text-5xl md:text-6xl font-black font-mono leading-none ${themeConfig.textMain}`}>
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Area Grafik */}
          <div className="flex-1 w-full h-[230px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={safeChartData} 
                  margin={{ top: 15, right: 0, left: -10, bottom: 0 }}
                  className="font-mono"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  
                  <YAxis 
                    yAxisId="left"
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11} 
                    tickLine={false} 
                    domain={[0, 'auto']} 
                  >
                    <Label 
                      value="Words per Minute" 
                      angle={-90} 
                      position="insideLeft" 
                      offset={12}
                      style={{ textAnchor: 'middle', fill: 'rgba(255,255,255,0.35)', fontSize: '11px', fontFamily: 'monospace' }} 
                    />
                  </YAxis>

                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11} 
                    tickLine={false} 
                    domain={[0, 'auto']}
                    allowDecimals={false}
                  >
                    <Label 
                      value="Errors" 
                      angle={90} 
                      position="insideRight" 
                      offset={12}
                      style={{ textAnchor: 'middle', fill: 'rgba(255,255,255,0.35)', fontSize: '11px', fontFamily: 'monospace' }} 
                    />
                  </YAxis>

                  <Tooltip content={<CustomTooltip primaryColor={themeConfig.primary} />} />
                  
                  {/* Garis WPM Utama Mengikuti Warna Tema Active */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="wpm" 
                    stroke={themeConfig.primary} 
                    strokeWidth={3} 
                    dot={{ fill: themeConfig.primary, r: 3, strokeWidth: 0 }} 
                    activeDot={{ r: 5, fill: '#ffffff' }} 
                    isAnimationActive={false}
                  />
                  
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="raw" 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={false} 
                    isAnimationActive={false}
                  />

                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="errors" 
                    stroke="transparent" 
                    dot={<RedCrossDot />} 
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs opacity-40 font-mono">
                Memuat Grafik...
              </div>
            )}
          </div>

        </div>

        {/* Info Statistik Tambahan */}
        <div className="flex flex-wrap justify-between items-center pt-4 border-t border-white/10 text-xs font-mono opacity-80 gap-4">
          <div>
            <span className="opacity-50 block">test type</span>
            <span className="font-bold" style={{ color: themeConfig.primary }}>
              {testCategory === 'curriculum' ? activeLesson.title : `${modeType} ${modeType === 'time' ? `${timeLimit}s` : `${wordLimit} words`}`}
            </span>
          </div>
          <div>
            <span className="opacity-50 block">kata berhasil</span>
            <span className="font-bold">{completedWordsCount} Kata</span>
          </div>
          <div>
            <span className="opacity-50 block">karakter benar / salah</span>
            <span className="font-bold">{correctKeystrokes} / <span className="text-rose-400">{totalKeystrokes - correctKeystrokes}</span></span>
          </div>
          <div>
            <span className="opacity-50 block">total durasi</span>
            <span className="font-bold">{elapsedSeconds}s</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 text-black font-bold rounded-xl transition shadow-lg hover:brightness-110 active:scale-95"
          style={{ backgroundColor: themeConfig.primary }}
        >
          <RotateCcw className="w-5 h-5" /> Latihan Lagi
        </button>

        <button
          onClick={copyResultCardToClipboard}
          className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition"
          title="Copy Kartu Gambar ke Clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">Tersalin ke Clipboard!</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" style={{ color: themeConfig.primary }} />
              <span>Copy Gambar Hasil</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}