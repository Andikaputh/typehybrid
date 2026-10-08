'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Image as ImageIcon, Check } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from 'recharts';
import { toBlob } from 'html-to-image';

const CustomTooltip = ({ active, payload, label, primaryColor, isLight }) => {
  if (active && payload && payload.length) {
    const errorData = payload.find(p => p.dataKey === 'errors');
    return (
      <div className={`${isLight ? 'bg-[#d1d0c5] border-black/20 text-[#323437]' : 'bg-[#18191a] border-white/15 text-white'} p-2.5 rounded-lg font-mono text-xs shadow-2xl space-y-1`}>
        <div className={`${isLight ? 'text-black/50 border-black/10' : 'text-white/40 border-white/10'} border-b pb-1 mb-1 font-bold`}>Detik ke-{label}s</div>
        <div className="font-bold" style={{ color: primaryColor }}>WPM: {payload[0]?.value}</div>
        <div className="opacity-70" style={{ color: primaryColor }}>Raw: {payload[1]?.value}</div>
        {errorData && errorData.value !== null && errorData.value !== undefined && (
          <div className="text-rose-500 font-bold flex items-center gap-1 mt-1">
            <span>✖ {errorData.value} Kesalahan pada detik ini</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const BurstTooltip = ({ active, payload, primaryColor, isLight }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`${isLight ? 'bg-[#d1d0c5] border-black/20 text-[#323437]' : 'bg-[#18191a] border-white/15 text-white'} p-2.5 rounded-lg font-mono text-xs shadow-2xl space-y-1`}>
        <div className={`${isLight ? 'text-black/50 border-black/10' : 'text-white/40 border-white/10'} border-b pb-1 font-bold`}>Kata: "{data.word}"</div>
        <div className="font-bold" style={{ color: primaryColor }}>Burst Speed: {data.burst} WPM</div>
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
    wpm, rawWpm, accuracy, consistency, burstWpm, wordBursts, chartData, testCategory, activeLesson, 
    modeType, timeLimit, wordLimit, completedWordsCount, 
    charStats, elapsedSeconds, themeConfig
  } = state;

  const [activeTab, setActiveTab] = useState('wpm');
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const resultCardRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLight = themeConfig.isLight;

  // Warna-warna UI adaptif tema
  const strokeColor = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
  const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
  const subTextColor = isLight ? 'text-black/60' : 'text-white/50';
  const labelColor = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)';
  const dividerColor = isLight ? 'border-black/10' : 'border-white/10';

  const safeChartData = chartData && chartData.length >= 2 
    ? chartData 
    : [
        { time: 0, wpm: 0, raw: 0, errors: null },
        { time: Math.max(1, elapsedSeconds), wpm: wpm, raw: rawWpm, errors: null }
      ];

  const copyResultCardToClipboard = async () => {
    if (!resultCardRef.current) return;
    try {
      const blob = await toBlob(resultCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        fontEmbedCSS: '', 
        filter: (node) => node.tagName !== 'LINK' || node.rel !== 'stylesheet',
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
      alert('Tidak dapat menyalin kartu hasil ke clipboard.');
    }
  };

  const [correct, incorrect, extra, missed] = charStats || [0, 0, 0, 0];

  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div 
        ref={resultCardRef}
        className={`${themeConfig.cardBg} p-4 sm:p-8 rounded-3xl border ${themeConfig.cardBorder} space-y-6 shadow-2xl transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* Main Displays: WPM, ACC, RAW, CONSISTENCY, BURST */}
          <div className={`grid grid-cols-2 md:grid-cols-1 gap-4 sm:gap-5 shrink-0 border-b md:border-b-0 md:border-r ${dividerColor} pb-5 md:pb-0 md:pr-8 w-full md:w-auto`}>
            <div>
              <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold ${subTextColor}`}>wpm</div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-black font-mono leading-none transition-colors duration-300" style={{ color: themeConfig.primary }}>
                {wpm}
              </div>
            </div>

            <div>
              <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold ${subTextColor}`}>acc</div>
              <div className={`text-3xl sm:text-4xl md:text-5xl font-black font-mono leading-none ${themeConfig.textMain}`}>
                {accuracy}%
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-1 gap-2 sm:gap-4 col-span-2 md:col-span-1">
              <div>
                <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold ${subTextColor}`}>raw</div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold font-mono leading-none ${themeConfig.textMain}`}>
                  {rawWpm}
                </div>
              </div>

              <div>
                <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold ${subTextColor}`}>consistency</div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold font-mono leading-none ${themeConfig.textMain}`}>
                  {consistency}%
                </div>
              </div>

              <div>
                <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold ${subTextColor}`}>
                  burst
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono leading-none transition-colors duration-300" style={{ color: themeConfig.primary }}>
                  {burstWpm}
                </div>
              </div>
            </div>
          </div>

          {/* Area Grafik Analytics */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 sm:gap-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} p-1 rounded-xl border text-[11px] sm:text-xs font-mono`}>
                <button
                  onClick={() => setActiveTab('wpm')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'wpm' 
                      ? `${isLight ? 'bg-black/15 text-black' : 'bg-white/15 text-white'} font-bold` 
                      : `${subTextColor} hover:opacity-100`
                  }`}
                >
                  WPM & Raw
                </button>
                <button
                  onClick={() => setActiveTab('burst')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all font-bold ${
                    activeTab === 'burst' 
                      ? 'shadow-sm' 
                      : `${subTextColor} hover:opacity-100`
                  }`}
                  style={{
                    backgroundColor: activeTab === 'burst' ? `${themeConfig.primary}33` : 'transparent',
                    color: activeTab === 'burst' ? themeConfig.primary : undefined
                  }}
                >
                  Burst per Kata
                </button>
              </div>
            </div>

            <div className="w-full h-[200px] sm:h-[240px]">
              {isMounted ? (
                activeTab === 'wpm' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={safeChartData} 
                      margin={{ top: 15, right: 0, left: -15, bottom: 0 }}
                      className="font-mono"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      
                      <XAxis 
                        dataKey="time" 
                        stroke={strokeColor} 
                        fontSize={10} 
                        tickLine={false} 
                      />
                      
                      <YAxis 
                        yAxisId="left"
                        stroke={strokeColor} 
                        fontSize={10} 
                        tickLine={false} 
                        domain={[0, 'auto']} 
                      >
                        <Label 
                          value="WPM" 
                          angle={-90} 
                          position="insideLeft" 
                          offset={10}
                          style={{ textAnchor: 'middle', fill: labelColor, fontSize: '10px', fontFamily: 'monospace' }} 
                        />
                      </YAxis>

                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        stroke={strokeColor} 
                        fontSize={10} 
                        tickLine={false} 
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      >
                        <Label 
                          value="Errors" 
                          angle={90} 
                          position="insideRight" 
                          offset={10}
                          style={{ textAnchor: 'middle', fill: labelColor, fontSize: '10px', fontFamily: 'monospace' }} 
                        />
                      </YAxis>

                      <Tooltip content={<CustomTooltip primaryColor={themeConfig.primary} isLight={isLight} />} />
                      
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="wpm" 
                        stroke={themeConfig.primary} 
                        strokeWidth={3} 
                        dot={{ fill: themeConfig.primary, r: 3, strokeWidth: 0 }} 
                        activeDot={{ r: 5, fill: themeConfig.primary }} 
                        isAnimationActive={false}
                      />
                      
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="raw" 
                        stroke={strokeColor} 
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={wordBursts.length > 0 ? wordBursts : [{ word: '-', burst: 0 }]}
                      margin={{ top: 15, right: 0, left: -15, bottom: 0 }}
                      className="font-mono"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="word" stroke={strokeColor} fontSize={10} tickLine={false} />
                      <YAxis stroke={strokeColor} fontSize={10} tickLine={false} domain={[0, 'auto']} />
                      <Tooltip content={<BurstTooltip primaryColor={themeConfig.primary} isLight={isLight} />} />
                      <Bar dataKey="burst" fill={themeConfig.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className={`flex items-center justify-center h-full text-xs font-mono ${subTextColor}`}>
                  Memuat Grafik...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Extended Stats Bar */}
        <div className={`grid grid-cols-2 sm:flex sm:flex-wrap justify-between items-center pt-4 border-t ${dividerColor} text-xs font-mono gap-3 sm:gap-4`}>
          <div>
            <span className={`block uppercase font-bold text-[9px] sm:text-[10px] ${subTextColor}`}>test type</span>
            <span className="font-bold truncate block" style={{ color: themeConfig.primary }}>
              {testCategory === 'curriculum' ? activeLesson.title : `${modeType} ${modeType === 'time' ? `${timeLimit}s` : `${wordLimit} words`}`}
            </span>
          </div>
          <div>
            <span className={`block uppercase font-bold text-[9px] sm:text-[10px] ${subTextColor}`}>characters (c/i/e/m)</span>
            <span className="font-bold">
              <span style={{ color: themeConfig.primary }}>{correct}</span> / <span className="text-rose-500">{incorrect}</span> / <span className="text-rose-600">{extra}</span> / <span className="text-amber-600">{missed}</span>
            </span>
          </div>
          <div>
            <span className={`block uppercase font-bold text-[9px] sm:text-[10px] ${subTextColor}`}>completed words</span>
            <span className={`font-bold ${themeConfig.textMain}`}>{completedWordsCount} Kata</span>
          </div>
          <div>
            <span className={`block uppercase font-bold text-[9px] sm:text-[10px] ${subTextColor}`}>time</span>
            <span className={`font-bold ${themeConfig.textMain}`}>{elapsedSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-2">
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-black font-bold rounded-xl transition shadow-lg hover:brightness-110 active:scale-95 text-sm"
          style={{ backgroundColor: themeConfig.primary }}
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Latihan Lagi
        </button>

        <button
          onClick={copyResultCardToClipboard}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 ${isLight ? 'bg-black/10 hover:bg-black/15 text-black border-black/10' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'} font-semibold rounded-xl border transition text-sm`}
          title="Copy Kartu Gambar ke Clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              <span className="text-emerald-500">Tersalin ke Clipboard!</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.primary }} />
              <span>Copy Gambar Hasil</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}