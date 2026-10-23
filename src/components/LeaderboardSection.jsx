import React from 'react';
import { Award, Lock, XOctagon, FilterX } from 'lucide-react';

export function LeaderboardSection({
  leaderboard,
  selectedPlayer,
  onSelectPlayer
}) {
  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#2A2F3A] pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#D97706]" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                01 // THE PODIUM STANDINGS
              </h2>
              <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-[#1A1D23] border border-[#2A2F3A] text-[#9CA3AF]">
                10 CONTESTANTS • 30-TEAM SLATE
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] font-mono">
              SELECT ANY CONTESTANT CARD TO ISOLATE AND HIGHLIGHT THEIR 30 PICKS ACROSS THE MASTER LEDGER
            </p>
          </div>
        </div>

        {selectedPlayer && (
          <button
            onClick={() => onSelectPlayer(null)}
            className="self-start sm:self-auto flex items-center gap-1.5 font-mono text-xs uppercase px-3 py-1.5 bg-[#1A1D23] hover:bg-[#21252D] text-[#D97706] border border-[#D97706] transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>CLEAR SPOTLIGHT [{selectedPlayer.toUpperCase()}]</span>
          </button>
        )}
      </div>

      {/* Formula 1 / Broadcast Telemetry Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
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
                  className={`px-2.5 py-2 font-mono text-sm font-bold tabular-nums flex items-center justify-center border-r border-[#2A2F3A] ${
                    isLeader
                      ? 'bg-[#D97706] text-[#121316]'
                      : 'bg-[#121316] text-[#9CA3AF]'
                  }`}
                >
                  {entry.rankFormatted}
                </div>

                <div className="flex-1 px-3 py-1.5 flex items-center justify-between min-w-0">
                  <div className="truncate">
                    <div className="font-display text-lg font-bold uppercase tracking-wider text-white leading-none group-hover:text-[#D97706] transition-colors">
                      {entry.player}
                    </div>
                    <div className="font-mono text-[10px] text-[#9CA3AF] tabular-nums mt-0.5">
                      {entry.overPicksCount} OVR / {entry.underPicksCount} UND
                    </div>
                  </div>

                  {/* Deficit from 1st Place */}
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div className="text-[9px] uppercase text-[#9CA3AF] tracking-wider">
                      DEFICIT
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        entry.pointsBack === 0 ? 'text-[#10B981]' : 'text-[#F3F4F6]'
                      }`}
                    >
                      {entry.deficitFormatted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Metric: Projected Score + Spark-Bar */}
              <div className="p-3 bg-[#121316]/60">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                    PROJECTED SCORE
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#10B981] tabular-nums">
                    {entry.winAccuracyPct.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between tabular-nums">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-extrabold text-white tracking-tight">
                      {entry.projectedCorrect}
                    </span>
                    <span className="font-mono text-xs text-[#9CA3AF]">/ 30</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#9CA3AF]">
                    RECORD:{' '}
                    <span className="text-white font-semibold">
                      {entry.projectedCorrect}-{entry.projectedWrong}
                    </span>
                  </div>
                </div>

                {/* Segmented Progress Spark-Bar (30 segments concept / clean bar) */}
                <div className="w-full h-1.5 bg-[#2A2F3A] mt-2 flex overflow-hidden">
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

              {/* Bottom Telemetry Strip: Clinched / Eliminated / Solo 90-10 */}
              <div className="grid grid-cols-3 divide-x divide-[#2A2F3A] border-t border-[#2A2F3A] font-mono text-[10px] tabular-nums bg-[#1A1D23]">
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-[#10B981]" />
                    CLN
                  </span>
                  <span className="font-bold text-[#10B981]">{entry.clinchedWins}</span>
                </div>

                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <XOctagon className="w-2.5 h-2.5 text-[#EF4444]" />
                    ELM
                  </span>
                  <span className="font-bold text-[#EF4444]">{entry.eliminatedPicks}</span>
                </div>

                <div
                  className="px-2 py-1.5 flex items-center justify-between"
                  title="90/10 Contrarian Solo Picks (Correct / Total)"
                >
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <Award className="w-2.5 h-2.5 text-[#D97706]" />
                    SOLO
                  </span>
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
