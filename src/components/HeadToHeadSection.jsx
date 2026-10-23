import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Check, X as XIcon } from 'lucide-react';
import { CONTESTANTS } from '../data/nbaData';
import { TeamLogo } from './TeamLogo';

export function HeadToHeadSection({ enrichedTeams, leaderboard }) {
  const [playerA, setPlayerA] = useState('Bronson');
  const [playerB, setPlayerB] = useState('Samson');
  const [showMode, setShowMode] = useState('DIFFERENTIALS'); // 'DIFFERENTIALS' | 'ALL'

  const statsMap = useMemo(() => {
    const map = {};
    leaderboard.forEach((p) => {
      map[p.player] = p;
    });
    return map;
  }, [leaderboard]);

  const comparison = useMemo(() => {
    const differentialTeams = [];
    const sharedTeams = [];
    let aDiffAdvantage = 0;
    let bDiffAdvantage = 0;

    enrichedTeams.forEach((team) => {
      const pickA = team.picks[playerA];
      const pickB = team.picks[playerB];
      const statusA = team.playerStatuses[playerA];
      const statusB = team.playerStatuses[playerB];

      if (pickA !== pickB) {
        if (statusA.isProjectedCorrect) aDiffAdvantage++;
        if (statusB.isProjectedCorrect) bDiffAdvantage++;
        differentialTeams.push({
          ...team,
          pickA,
          pickB,
          statusA,
          statusB
        });
      } else {
        sharedTeams.push({
          ...team,
          pickA,
          pickB,
          statusA,
          statusB
        });
      }
    });

    return {
      differentialTeams,
      sharedTeams,
      aDiffAdvantage,
      bDiffAdvantage,
      similarityPct: Math.round((sharedTeams.length / 30) * 100)
    };
  }, [enrichedTeams, playerA, playerB]);

  const displayedTeams =
    showMode === 'DIFFERENTIALS'
      ? comparison.differentialTeams
      : enrichedTeams.map((team) => ({
          ...team,
          pickA: team.picks[playerA],
          pickB: team.picks[playerB],
          statusA: team.playerStatuses[playerA],
          statusB: team.playerStatuses[playerB]
        }));

  const statsA = statsMap[playerA];
  const statsB = statsMap[playerB];

  return (
    <section className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#2A2F3A] pb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 bg-[#1D428A]" />
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase tracking-wider text-white">
            04 // HEAD-TO-HEAD
          </h2>
          <span className="font-mono text-[10px] sm:text-[11px] uppercase px-2 py-0.5 bg-[#1A1D23] border border-[#2A2F3A] text-[#D97706] tabular-nums">
            {comparison.differentialTeams.length} DIFFS
          </span>
        </div>

        {/* Toggle Divergent vs All 30 */}
        <div className="flex items-center bg-[#1A1D23] border border-[#2A2F3A] font-mono text-[10px] sm:text-[11px]">
          <button
            onClick={() => setShowMode('DIFFERENTIALS')}
            className={`px-2.5 py-1 font-bold uppercase transition-colors ${
              showMode === 'DIFFERENTIALS'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            DIFFS ({comparison.differentialTeams.length})
          </button>
          <button
            onClick={() => setShowMode('ALL')}
            className={`px-2.5 py-1 font-bold uppercase border-l border-[#2A2F3A] transition-colors ${
              showMode === 'ALL'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            ALL 30
          </button>
        </div>
      </div>

      {/* Matchup Control Deck — Compact 2-Column on Mobile */}
      <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-11 gap-2.5 sm:gap-4 items-center">
          {/* Player A Selector Panel */}
          <div className="col-span-1 md:col-span-4 bg-[#121316] border border-[#2A2F3A] p-2.5 sm:p-3.5">
            <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase text-[#9CA3AF] mb-1.5">
              <span>PLAYER 1</span>
              {statsA && (
                <span className="text-white font-bold tabular-nums">
                  #{statsA.rankFormatted} ({statsA.projectedCorrect}/30)
                </span>
              )}
            </div>
            <select
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="w-full bg-[#1A1D23] border border-[#2A2F3A] focus:border-[#D97706] px-2.5 py-1.5 font-display text-base sm:text-lg font-bold uppercase tracking-wider text-white focus:outline-none"
            >
              {CONTESTANTS.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between border-t border-[#2A2F3A] mt-2 pt-1.5 font-mono text-[10px] tabular-nums">
              <span className="text-[#9CA3AF]">H2H LEAD:</span>
              <span className="font-bold text-[#10B981]">
                {comparison.aDiffAdvantage} / {comparison.differentialTeams.length}
              </span>
            </div>
          </div>

          {/* Center Telemetry Summary */}
          <div className="col-span-2 md:col-span-3 order-3 md:order-none flex flex-col items-center justify-center text-center font-mono pt-1 md:pt-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPlayerA(playerB);
                  setPlayerB(playerA);
                }}
                className="px-2.5 py-1 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] text-[10px] font-bold uppercase text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3 text-[#D97706]" />
                <span>SWAP</span>
              </button>
              <span className="text-[10px] uppercase text-[#9CA3AF] tabular-nums">
                OVERLAP: <strong className="text-white">{comparison.similarityPct}%</strong>
              </span>
            </div>

            {comparison.differentialTeams.length > 0 && (
              <div className="w-full max-w-[240px] mt-2">
                <div className="w-full h-1.5 bg-[#121316] border border-[#2A2F3A] flex overflow-hidden">
                  <div
                    style={{
                      width: `${
                        (comparison.aDiffAdvantage / comparison.differentialTeams.length) * 100
                      }%`
                    }}
                    className="bg-[#1D428A] h-full"
                  />
                  <div
                    style={{
                      width: `${
                        (comparison.bDiffAdvantage / comparison.differentialTeams.length) * 100
                      }%`
                    }}
                    className="bg-[#D97706] h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Player B Selector Panel */}
          <div className="col-span-1 md:col-span-4 bg-[#121316] border border-[#2A2F3A] p-2.5 sm:p-3.5">
            <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase text-[#9CA3AF] mb-1.5">
              <span>PLAYER 2</span>
              {statsB && (
                <span className="text-white font-bold tabular-nums">
                  #{statsB.rankFormatted} ({statsB.projectedCorrect}/30)
                </span>
              )}
            </div>
            <select
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="w-full bg-[#1A1D23] border border-[#2A2F3A] focus:border-[#D97706] px-2.5 py-1.5 font-display text-base sm:text-lg font-bold uppercase tracking-wider text-white focus:outline-none"
            >
              {CONTESTANTS.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between border-t border-[#2A2F3A] mt-2 pt-1.5 font-mono text-[10px] tabular-nums">
              <span className="text-[#9CA3AF]">H2H LEAD:</span>
              <span className="font-bold text-[#10B981]">
                {comparison.bDiffAdvantage} / {comparison.differentialTeams.length}
              </span>
            </div>
          </div>
        </div>

        {/* Differential Matrix Cards */}
        <div className="border-t-2 border-[#2A2F3A] pt-3">
          {playerA === playerB ? (
            <div className="py-6 text-center font-mono text-xs uppercase text-[#9CA3AF]">
              SELECT TWO DIFFERENT CONTESTANTS ABOVE
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {displayedTeams.map((team) => {
                const isDiff = team.pickA !== team.pickB;
                const aCorrect = team.statusA.isProjectedCorrect;
                const bCorrect = team.statusB.isProjectedCorrect;
                const deltaStr =
                  team.paceDiff > 0
                    ? `+${team.paceDiff.toFixed(1)}`
                    : team.paceDiff.toFixed(1);

                return (
                  <div
                    key={team.team}
                    className={`bg-[#121316] border p-2.5 font-mono tabular-nums ${
                      isDiff
                        ? 'border-[#2A2F3A] hover:border-[#9CA3AF]'
                        : 'border-[#2A2F3A]/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-[#2A2F3A]">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <span className="font-bold text-xs text-[#D97706]">{team.abbr}</span>
                        <span className="hidden sm:inline font-sans text-xs font-semibold text-white truncate">
                          {team.team}
                        </span>
                      </div>

                      <div className="text-right text-[11px] shrink-0">
                        <span className="text-[#9CA3AF]">L:</span>
                        <strong className="text-white ml-0.5">{team.line.toFixed(1)}</strong>
                        <span className="mx-1 text-[#2A2F3A]">|</span>
                        <strong
                          className={
                            team.projectedWins > team.line
                              ? 'text-[#10B981]'
                              : 'text-[#EF4444]'
                          }
                        >
                          {team.projectedWins.toFixed(1)} ({deltaStr})
                        </strong>
                      </div>
                    </div>

                    {/* Side-by-side Pick Cells */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div
                        className={`px-2 py-1 border flex items-center justify-between ${
                          aCorrect
                            ? 'bg-[#064E3B]/35 border-[#059669]'
                            : 'bg-[#7F1D1D]/30 border-[#DC2626]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#9CA3AF] uppercase">
                            {playerA}:
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              team.pickA === 'Over' ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {team.statusA.code}
                          </span>
                        </div>
                        {aCorrect ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : (
                          <XIcon className="w-3.5 h-3.5 text-[#EF4444]" />
                        )}
                      </div>

                      <div
                        className={`px-2 py-1 border flex items-center justify-between ${
                          bCorrect
                            ? 'bg-[#064E3B]/35 border-[#059669]'
                            : 'bg-[#7F1D1D]/30 border-[#DC2626]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#9CA3AF] uppercase">
                            {playerB}:
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              team.pickB === 'Over' ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {team.statusB.code}
                          </span>
                        </div>
                        {bCorrect ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : (
                          <XIcon className="w-3.5 h-3.5 text-[#EF4444]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
