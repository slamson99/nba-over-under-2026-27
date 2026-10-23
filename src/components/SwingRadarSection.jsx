import React from 'react';
import { Crosshair, Activity, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { CONTESTANTS } from '../data/nbaData';

export function SwingRadarSection({ enrichedTeams, onQuickFilter }) {
  // Deadlock Teams (5-5 split)
  const deadlockTeams = enrichedTeams.filter((t) => t.is5050);
  // 6-4 Split Teams
  const sixtyFortyTeams = enrichedTeams.filter((t) => t.maxSplitPct === 60);

  // Volatile Pace Teams: abs(Projected Wins - Line) <= 1.5
  const volatileTeams = [...enrichedTeams]
    .filter((t) => t.isVolatilePace)
    .sort((a, b) => Math.abs(a.paceDiff) - Math.abs(b.paceDiff));

  // Unanimous & 90/10 Contrarian Island Picks
  const consensusAndSoloTeams = enrichedTeams.filter(
    (t) => t.isUnanimous || t.isNearUnanimous
  );

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#2A2F3A] pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#1D428A]" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                02 // HIGH-STAKES & SWING RADAR
              </h2>
              <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-[#1A1D23] border border-[#2A2F3A] text-[#D97706]">
                LEVERAGE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] font-mono">
              ISOLATING 5-5 DEADLOCK SPLITS, VOLATILE PACE MARGINS (ABS DELTA &lt;= 1.5), AND 90-10 CONTRARIAN OUTLIERS
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Technical Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Panel 1: 5-5 Deadlock Teams */}
        <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] flex flex-col justify-between">
          <div>
            <div className="px-3.5 py-2.5 bg-[#121316] border-b border-[#2A2F3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#D97706]" />
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

            <div className="p-3 space-y-2.5">
              {deadlockTeams.map((team) => {
                const overGroup = CONTESTANTS.filter((p) => team.picks[p] === 'Over');
                const underGroup = CONTESTANTS.filter((p) => team.picks[p] === 'Under');
                const isOverPace = team.projectedWins > team.line;
                const deltaStr =
                  team.paceDiff > 0 ? `+${team.paceDiff.toFixed(1)}` : team.paceDiff.toFixed(1);

                return (
                  <div
                    key={team.team}
                    className="bg-[#121316] border border-[#2A2F3A] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-6 h-6"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-bold uppercase tracking-wide text-white">
                              {team.abbr}
                            </span>
                            <span className="text-xs text-[#9CA3AF] font-medium">
                              {team.team}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-[#9CA3AF] tabular-nums">
                            REC: <strong className="text-white">{team.wins}-{team.losses}</strong> | LINE:{' '}
                            <strong className="text-white">{team.line.toFixed(1)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums">
                        <div
                          className={`text-xs font-bold px-1.5 py-0.5 border ${
                            isOverPace
                              ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                              : 'bg-[#7F1D1D] text-[#EF4444] border-[#DC2626]'
                          }`}
                        >
                          PROJ {team.projectedWins.toFixed(1)} ({deltaStr})
                        </div>
                      </div>
                    </div>

                    {/* 5 vs 5 Player Breakdown */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A2F3A] font-mono text-[10px]">
                      <div
                        className={`p-2 border ${
                          isOverPace
                            ? 'bg-[#064E3B]/40 border-[#059669]'
                            : 'bg-[#1A1D23] border-[#2A2F3A]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[#10B981] mb-1">
                          <span>OVR CAMP [5]</span>
                          {isOverPace && <span className="text-[9px] uppercase">AHEAD</span>}
                        </div>
                        <div className="text-[#F3F4F6] leading-relaxed">
                          {overGroup.join(', ')}
                        </div>
                      </div>

                      <div
                        className={`p-2 border ${
                          !isOverPace
                            ? 'bg-[#7F1D1D]/40 border-[#DC2626]'
                            : 'bg-[#1A1D23] border-[#2A2F3A]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[#EF4444] mb-1">
                          <span>UND CAMP [5]</span>
                          {!isOverPace && <span className="text-[9px] uppercase">AHEAD</span>}
                        </div>
                        <div className="text-[#F3F4F6] leading-relaxed">
                          {underGroup.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 6-4 Split Summary */}
              <div className="bg-[#121316] border border-[#2A2F3A] px-3 py-2 flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#9CA3AF]">6-4 SWING SPLITS ({sixtyFortyTeams.length}):</span>
                <span className="text-white font-semibold">
                  {sixtyFortyTeams.map((t) => t.abbr).join(' · ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Volatile Pace Teams (abs(Projected Wins - Line) <= 1.5) */}
        <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] flex flex-col justify-between">
          <div>
            <div className="px-3.5 py-2.5 bg-[#121316] border-b border-[#2A2F3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#10B981]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  VOLATILE PACE MARGINS (DELTA &lt;= 1.5)
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums">
                {volatileTeams.length} TEAMS
              </span>
            </div>

            <div className="p-3">
              <div className="max-h-[290px] overflow-y-auto divide-y divide-[#2A2F3A] border border-[#2A2F3A] bg-[#121316]">
                {volatileTeams.map((team) => {
                  const isOver = team.projectedWins > team.line;
                  const deltaStr =
                    team.paceDiff > 0
                      ? `+${team.paceDiff.toFixed(1)}`
                      : team.paceDiff.toFixed(1);

                  return (
                    <div
                      key={team.team}
                      className="px-3 py-2 flex items-center justify-between gap-2 hover:bg-[#1A1D23] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-white">
                              {team.abbr}
                            </span>
                            <span className="text-xs text-[#9CA3AF] truncate">
                              {team.team}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-[#9CA3AF] tabular-nums">
                            SPLIT: {team.overCount} OVR / {team.underCount} UND
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-xs">
                        <div className="text-right">
                          <div className="text-[10px] text-[#9CA3AF]">
                            LINE <strong className="text-white">{team.line.toFixed(1)}</strong>
                          </div>
                          <div className="text-white font-bold">
                            PROJ {team.projectedWins.toFixed(1)}
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold border min-w-[44px] text-center ${
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
        <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] flex flex-col justify-between">
          <div>
            <div className="px-3.5 py-2.5 bg-[#121316] border-b border-[#2A2F3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#9CA3AF]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  CONSENSUS (10-0) & SOLO OUTLIERS (9-1)
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

            <div className="p-3">
              <div className="max-h-[290px] overflow-y-auto divide-y divide-[#2A2F3A] border border-[#2A2F3A] bg-[#121316]">
                {consensusAndSoloTeams.map((team) => {
                  const consensusSide = team.overPct >= 90 ? 'Over' : 'Under';
                  const consensusAhead = team.currentPaceOutcome === consensusSide;

                  return (
                    <div
                      key={team.team}
                      className="px-3 py-2 flex items-center justify-between gap-2 hover:bg-[#1A1D23] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-white">
                              {team.abbr}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#1A1D23] border border-[#2A2F3A] text-[#F3F4F6]">
                              {team.isUnanimous
                                ? `10-0 ${consensusSide === 'Over' ? 'OVR' : 'UND'}`
                                : `9-1 ${consensusSide === 'Over' ? 'OVR' : 'UND'}`}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-[#9CA3AF] truncate mt-0.5">
                            {team.isUnanimous ? (
                              'FULL FIELD CONSENSUS'
                            ) : (
                              <span>
                                OUTLIER:{' '}
                                <strong className="text-[#D97706]">
                                  {team.loneWolf.toUpperCase()} ({team.picks[team.loneWolf] === 'Over' ? 'OVR' : 'UND'})
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums shrink-0">
                        <div className="text-xs font-bold text-white">
                          {team.projectedWins.toFixed(1)} <span className="text-[#9CA3AF]">/ {team.line.toFixed(1)}</span>
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            consensusAhead ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {team.isUnanimous
                            ? consensusAhead
                              ? 'FIELD ON PACE'
                              : 'FIELD TRAILING'
                            : consensusAhead
                            ? 'MAJORITY AHEAD'
                            : `${team.loneWolf.toUpperCase()} AHEAD`}
                        </div>
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
