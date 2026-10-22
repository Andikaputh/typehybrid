'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const ChartTooltip = ({ active, payload, label, primaryColor, isLight }) => {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload ?? {};
  const isBurst = point.word !== undefined;

  return (
    <div
      className={`${
        isLight
          ? 'bg-[#d1d0c5] border-black/20 text-[#323437]'
          : 'bg-[#18191a] border-white/15 text-white'
      } p-2.5 rounded-lg font-mono text-xs shadow-2xl space-y-1`}
    >
      <div className={`${isLight ? 'text-black/50 border-black/10' : 'text-white/40 border-white/10'} border-b pb-1 mb-1 font-bold`}>
        {isBurst ? `Kata: ${point.word}` : `Detik ke-${label}`}
      </div>
      {isBurst ? (
        <div className="font-bold" style={{ color: primaryColor }}>
          Burst: {point.burst} WPM
        </div>
      ) : (
        <>
          <div className="font-bold" style={{ color: primaryColor }}>
            wpm: {point.wpm}
          </div>
          <div className={isLight ? 'text-black/55' : 'text-white/55'}>raw: {point.raw}</div>
          {point.errors ? (
            <div className="text-[#ca4754] font-bold">✕ {point.errors} kesalahan</div>
          ) : null}
        </>
      )}
    </div>
  );
};

const ErrorMark = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || payload?.errors === null || payload?.errors === undefined) return null;

  return (
    <g transform={`translate(${cx - 4},${cy - 4})`}>
      <path d="M 0 0 L 8 8 M 8 0 L 0 8" stroke="#ca4754" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
};

export default function ResultChart({ chartData, wordBursts, themeConfig }) {
  const [activeTab, setActiveTab] = useState('wpm');
  const isLight = themeConfig.isLight;

  const strokeColor = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)';
  const gridColor = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.06)';

  const safeData = chartData && chartData.length >= 2 ? chartData : [];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-[11px] font-mono ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} p-1 rounded-lg border`}>
          <button
            onClick={() => setActiveTab('wpm')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'wpm'
                ? `${isLight ? 'bg-black/10 text-black' : 'bg-white/10 text-white'} font-bold`
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            wpm / raw
          </button>
          <button
            onClick={() => setActiveTab('burst')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'burst'
                ? `${isLight ? 'bg-black/10 text-black' : 'bg-white/10 text-white'} font-bold`
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            burst
          </button>
        </div>

        {activeTab === 'wpm' ? (
          <div className="flex items-center gap-4 text-[10px] font-mono opacity-70">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-[2px] rounded-full" style={{ backgroundColor: themeConfig.primary }} />
              wpm
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-[2px] rounded-full" style={{ backgroundColor: strokeColor }} />
              raw
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#ca4754' }} />
              error
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono opacity-70">burst per kata (wpm)</span>
        )}
      </div>

      <div className="w-full flex-1 min-h-[190px]">
        {safeData.length === 0 ? (
          <div className={`flex items-center justify-center h-full text-xs font-mono ${isLight ? 'text-black/50' : 'text-white/40'}`}>
            Data grafik belum tersedia
          </div>
        ) : activeTab === 'wpm' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="time"
                stroke={strokeColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke={strokeColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={strokeColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: strokeColor, strokeDasharray: '3 3' }}
                content={<ChartTooltip primaryColor={themeConfig.primary} isLight={isLight} />}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="raw"
                stroke={strokeColor}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wpm"
                stroke={themeConfig.primary}
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 3.5, fill: themeConfig.primary, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errors"
                stroke="transparent"
                dot={<ErrorMark />}
                activeDot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wordBursts.length > 0 ? wordBursts : [{ word: '-', burst: 0 }]}
              margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="word"
                stroke={strokeColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={strokeColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip
                cursor={{ fill: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
                content={<ChartTooltip primaryColor={themeConfig.primary} isLight={isLight} />}
              />
              <Bar dataKey="burst" fill={themeConfig.primary} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
