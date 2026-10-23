import React, { useState } from 'react';
import { Crosshair, Activity, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { CONTESTANTS } from '../data/nbaData';

export function SwingRadarSection({ enrichedTeams, onQuickFilter }) {
  const [mobileTab, setMobileTab] = useState('DEADLOCK'); // 'DEADLOCK' | 'VOLATILE' | 'CONSENSUS'

  const deadlockTeams = enrichedTeams.filter((t) => t.is5050);
  const sixtyFortyTeams = enrichedTeams.filter((t) => t.maxSplitPct === 60);

  const volatileTeams = [...enrichedTeams]
    .filter((t) => t.isVolatilePace)
    .sort((a, b) => Math.abs(a.paceDiff) - Math.abs(b.paceDiff));

  const consensusAndSoloTeams = enrichedTeams.filter(
    (t) => t.isUnanimous || t.isNearUnanimous
  );

  return (
    <section className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#2A2F3A] pb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 bg-[#1D428A]" />
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase tracking-wider text-white">
            02 // SWING RADAR
          </h2>
        </div>

        {/* Mobile Tab Switcher so mobile users don't scroll past 3 tall boxes */}
        <div className="flex lg:hidden bg-[#1A1D23] border border-[#2A2F3A] font-mono text-[10px]">
          <button
            onClick={() => setMobileTab('DEADLOCK')}
            className={`px-2 py-1 font-bold uppercase ${
              mobileTab === 'DEADLOCK'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF]'
            }`}
          >
            5-5 ({deadlockTeams.length})
          </button>
          <button
            onClick={() => setMobileTab('VOLATILE')}
            className={`px-2 py-1 font-bold uppercase border-l border-[#2A2F3A] ${
              mobileTab === 'VOLATILE'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF]'
            }`}
          >
            PACE ({volatileTeams.length})
          </button>
          <button
            onClick={() => setMobileTab('CONSENSUS')}
            className={`px-2 py-1 font-bold uppercase border-l border-[#2A2F3A] ${
              mobileTab === 'CONSENSUS'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF]'
            }`}
          >
            90-100% ({consensusAndSoloTeams.length})
          </button>
        </div>
      </div>

      {/* 3-Column Technical Telemetry Grid (Tabbed on Mobile, 3-Col on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Panel 1: 5-5 Deadlock Teams */}
        <div
          className={`${
            mobileTab === 'DEADLOCK' ? 'block' : 'hidden lg:flex'
          } bg-[#1A1D23] border-2 border-[#2A2F3A] flex-col justify-between`}
        >
          <div>
            <div className="px-3 py-2 bg-[#121316] border-b border-[#2A2F3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-[#D97706]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  DEADLOCK SPLITS (5 OVR / 5 UND)
                </h3>
              </div>
              <button
                onClick={() => onQuickFilter('CONTESTED')}
                className="font-mono text-[10px] uppercase text-[#D97706] hover:underline flex items-center gap-0.5"
              >
                <span>FILTER</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-2.5 space-y-2">
              {deadlockTeams.map((team) => {
                const overGroup = CONTESTANTS.filter((p) => team.picks[p] === 'Over');
                const underGroup = CONTESTANTS.filter((p) => team.picks[p] === 'Under');
                const isOverPace = team.projectedWins > team.line;
                const deltaStr =
                  team.paceDiff > 0 ? `+${team.paceDiff.toFixed(1)}` : team.paceDiff.toFixed(1);

                return (
                  <div
                    key={team.team}
                    className="bg-[#121316] border border-[#2A2F3A] p-2.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <span className="font-display text-base font-bold uppercase tracking-wide text-white">
                          {team.abbr}
                        </span>
                        <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums">
                          {team.wins}-{team.losses} | LINE {team.line.toFixed(1)}
                        </span>
                      </div>

                      <div className="text-right font-mono tabular-nums">
                        <div
                          className={`text-[11px] font-bold px-1.5 py-0.5 border ${
                            isOverPace
                              ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                              : 'bg-[#7F1D1D] text-[#EF4444] border-[#DC2626]'
                          }`}
                        >
                          {team.projectedWins.toFixed(1)} ({deltaStr})
                        </div>
                      </div>
                    </div>

                    {/* 5 vs 5 Player Breakdown */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#2A2F3A] font-mono text-[10px]">
                      <div
                        className={`p-1.5 border ${
                          isOverPace
                            ? 'bg-[#064E3B]/40 border-[#059669]'
                            : 'bg-[#1A1D23] border-[#2A2F3A]'
                        }`}
                      >
                        <div className="font-bold text-[#10B981] mb-0.5">OVR [5]</div>
                        <div className="text-[#F3F4F6] truncate" title={overGroup.join(', ')}>
                          {overGroup.join(', ')}
                        </div>
                      </div>

                      <div
                        className={`p-1.5 border ${
                          !isOverPace
                            ? 'bg-[#7F1D1D]/40 border-[#DC2626]'
                            : 'bg-[#1A1D23] border-[#2A2F3A]'
                        }`}
                      >
                        <div className="font-bold text-[#EF4444] mb-0.5">UND [5]</div>
                        <div className="text-[#F3F4F6] truncate" title={underGroup.join(', ')}>
                          {underGroup.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 6-4 Split Summary */}
              <div className="bg-[#121316] border border-[#2A2F3A] px-2.5 py-1.5 flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#9CA3AF]">6-4 SPLITS ({sixtyFortyTeams.length}):</span>
                <span className="text-white font-semibold truncate ml-2">
                  {sixtyFortyTeams.map((t) => t.abbr).join(' · ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Volatile Pace Teams */}
        <div
          className={`${
            mobileTab === 'VOLATILE' ? 'block' : 'hidden lg:flex'
          } bg-[#1A1D23] border-2 border-[#2A2F3A] flex-col justify-between`}
        >
          <div>
            <div className="px-3 py-2 bg-[#121316] border-b border-[#2A2F3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  VOLATILE PACE (DELTA &lt;= 1.5)
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums">
                {volatileTeams.length} TEAMS
              </span>
            </div>

            <div className="p-2.5">
              <div className="max-h-[220px] sm:max-h-[260px] overflow-y-auto divide-y divide-[#2A2F3A] border border-[#2A2F3A] bg-[#121316]">
                {volatileTeams.map((team) => {
                  const isOver = team.projectedWins > team.line;
                  const deltaStr =
                    team.paceDiff > 0
                      ? `+${team.paceDiff.toFixed(1)}`
                      : team.paceDiff.toFixed(1);

                  return (
                    <div
                      key={team.team}
                      className="px-2.5 py-1.5 flex items-center justify-between gap-2 hover:bg-[#1A1D23] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <span className="font-mono text-xs font-bold text-white">
                          {team.abbr}
                        </span>
                        <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums">
                          {team.overCount}O/{team.underCount}U
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-xs">
                        <span className="text-[11px] text-[#9CA3AF]">
                          {team.projectedWins.toFixed(1)} vs <strong className="text-white">{team.line.toFixed(1)}</strong>
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold border min-w-[42px] text-center ${
                            isOver
                              ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                              : 'bg-[#7F1D1D] text-[#EF4444] border-[#DC2626]'
                          }`}
                        >
                          {deltaStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Unanimous Consensus (10-0) & Lone Wolf (9-1) */}
        <div
          className={`${
            mobileTab === 'CONSENSUS' ? 'block' : 'hidden lg:flex'
          } bg-[#1A1D23] border-2 border-[#2A2F3A] flex-col justify-between`}
        >
          <div>
            <div className="px-3 py-2 bg-[#121316] border-b border-[#2A2F3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  CONSENSUS (10-0) & OUTLIERS (9-1)
                </h3>
              </div>
              <button
                onClick={() => onQuickFilter('UNANIMOUS')}
                className="font-mono text-[10px] uppercase text-[#D97706] hover:underline flex items-center gap-0.5"
              >
                <span>FILTER</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-2.5">
              <div className="max-h-[220px] sm:max-h-[260px] overflow-y-auto divide-y divide-[#2A2F3A] border border-[#2A2F3A] bg-[#121316]">
                {consensusAndSoloTeams.map((team) => {
                  const consensusSide = team.overPct >= 90 ? 'Over' : 'Under';
                  const consensusAhead = team.currentPaceOutcome === consensusSide;

                  return (
                    <div
                      key={team.team}
                      className="px-2.5 py-1.5 flex items-center justify-between gap-2 hover:bg-[#1A1D23] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <span className="font-mono text-xs font-bold text-white">
                          {team.abbr}
                        </span>
                        <span className="font-mono text-[10px] px-1 py-0.2 bg-[#1A1D23] border border-[#2A2F3A] text-[#F3F4F6]">
                          {team.isUnanimous
                            ? `10-0 ${consensusSide === 'Over' ? 'OVR' : 'UND'}`
                            : `SOLO: ${team.loneWolf.toUpperCase()}`}
                        </span>
                      </div>

                      <div className="text-right font-mono tabular-nums shrink-0 text-[11px]">
                        <span
                          className={`font-bold ${
                            consensusAhead ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {team.projectedWins.toFixed(1)} / {team.line.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
