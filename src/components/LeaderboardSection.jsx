import React from 'react';
import { Award, Lock, XOctagon, FilterX } from 'lucide-react';

export function LeaderboardSection({
  leaderboard,
  selectedPlayer,
  onSelectPlayer
}) {
  return (
    <section className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#2A2F3A] pb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 bg-[#D97706]" />
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase tracking-wider text-white">
            01 // STANDINGS
          </h2>
          <span className="hidden sm:inline-block font-mono text-[11px] uppercase px-2 py-0.5 bg-[#1A1D23] border border-[#2A2F3A] text-[#9CA3AF]">
            TAP PLAYER TO HIGHLIGHT PICKS
          </span>
        </div>

        {selectedPlayer && (
          <button
            onClick={() => onSelectPlayer(null)}
            className="flex items-center gap-1 font-mono text-[11px] uppercase px-2.5 py-1 bg-[#1A1D23] hover:bg-[#21252D] text-[#D97706] border border-[#D97706] transition-colors"
          >
            <FilterX className="w-3 h-3" />
            <span>CLEAR [{selectedPlayer.toUpperCase()}]</span>
          </button>
        )}
      </div>

      {/* 2-Column Compact Grid on Mobile, 5-Column on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {leaderboard.map((entry) => {
          const isLeader = entry.rank === 1;
          const isSelected = selectedPlayer === entry.player;

          return (
            <div
              key={entry.player}
              onClick={() => onSelectPlayer(isSelected ? null : entry.player)}
              className={`group relative cursor-pointer transition-colors bg-[#1A1D23] border-2 ${
                isSelected
                  ? 'border-[#D97706] bg-[#21252D]'
                  : isLeader
                  ? 'border-[#D97706]/80 hover:border-[#D97706]'
                  : 'border-[#2A2F3A] hover:border-[#9CA3AF]'
              }`}
            >
              {/* Top Telemetry Bar: Rank + Name + Deficit */}
              <div className="flex items-stretch border-b border-[#2A2F3A]">
                <div
                  className={`px-2 py-1.5 font-mono text-xs sm:text-sm font-bold tabular-nums flex items-center justify-center border-r border-[#2A2F3A] ${
                    isLeader
                      ? 'bg-[#D97706] text-[#121316]'
                      : 'bg-[#121316] text-[#9CA3AF]'
                  }`}
                >
                  {entry.rankFormatted}
                </div>

                <div className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between min-w-0">
                  <div className="truncate">
                    <div className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-white leading-none group-hover:text-[#D97706] transition-colors">
                      {entry.player}
                    </div>
                    <div className="hidden sm:block font-mono text-[10px] text-[#9CA3AF] tabular-nums mt-0.5">
                      {entry.overPicksCount} OVR / {entry.underPicksCount} UND
                    </div>
                  </div>

                  {/* Deficit from 1st Place */}
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div
                      className={`text-[11px] sm:text-xs font-bold ${
                        entry.pointsBack === 0 ? 'text-[#10B981]' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {entry.deficitFormatted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Metric: Projected Score + Spark-Bar */}
              <div className="p-2 sm:p-3 bg-[#121316]/60">
                <div className="flex items-baseline justify-between tabular-nums">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {entry.projectedCorrect}
                    </span>
                    <span className="font-mono text-[11px] text-[#9CA3AF]">/30</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#10B981] tabular-nums">
                    {entry.winAccuracyPct.toFixed(0)}%
                  </span>
                </div>

                {/* Progress Spark-Bar */}
                <div className="w-full h-1 sm:h-1.5 bg-[#2A2F3A] mt-1.5 flex overflow-hidden">
                  {entry.clinchedWins > 0 && (
                    <div
                      style={{ width: `${(entry.clinchedWins / 30) * 100}%` }}
                      className="bg-[#10B981] h-full"
                    />
                  )}
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        ((entry.projectedCorrect - entry.clinchedWins) / 30) * 100
                      )}%`
                    }}
                    className="bg-[#10B981]/75 h-full"
                  />
                </div>
              </div>

              {/* Bottom Telemetry Strip: hidden on tiny screens or ultra-compact */}
              <div className="grid grid-cols-3 divide-x divide-[#2A2F3A] border-t border-[#2A2F3A] font-mono text-[9px] sm:text-[10px] tabular-nums bg-[#1A1D23]">
                <div className="px-1.5 sm:px-2 py-1 flex items-center justify-between">
                  <span className="text-[#9CA3AF]">CLN</span>
                  <span className="font-bold text-[#10B981]">{entry.clinchedWins}</span>
                </div>

                <div className="px-1.5 sm:px-2 py-1 flex items-center justify-between">
                  <span className="text-[#9CA3AF]">ELM</span>
                  <span className="font-bold text-[#EF4444]">{entry.eliminatedPicks}</span>
                </div>

                <div className="px-1.5 sm:px-2 py-1 flex items-center justify-between">
                  <span className="text-[#9CA3AF]">SOLO</span>
                  <span className="font-bold text-[#D97706]">
                    {entry.loneWolfCorrect}/{entry.loneWolfTotal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
