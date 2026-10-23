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
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#2A2F3A] pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#1D428A]" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                04 // HEAD-TO-HEAD DIFFERENTIAL MATRIX
              </h2>
              <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-[#1A1D23] border border-[#2A2F3A] text-[#D97706] tabular-nums">
                {comparison.differentialTeams.length} DIVERGENT PICKS
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] font-mono">
              SELECT ANY TWO CONTESTANTS TO ISOLATE THE EXACT FRANCHISES WHERE THEIR PICKS OPPOSE
            </p>
          </div>
        </div>

        {/* Toggle Divergent vs All 30 */}
        <div className="flex items-center bg-[#1A1D23] border-2 border-[#2A2F3A] self-start sm:self-auto font-mono text-[11px]">
          <button
            onClick={() => setShowMode('DIFFERENTIALS')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors ${
              showMode === 'DIFFERENTIALS'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            DIVERGENT ONLY ({comparison.differentialTeams.length})
          </button>
          <button
            onClick={() => setShowMode('ALL')}
            className={`px-3 py-1.5 font-bold uppercase border-l border-[#2A2F3A] transition-colors ${
              showMode === 'ALL'
                ? 'bg-[#D97706] text-[#121316]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            ALL 30 TEAMS
          </button>
        </div>
      </div>

      {/* Matchup Control Deck */}
      <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Player A Selector Panel */}
          <div className="md:col-span-4 bg-[#121316] border-2 border-[#2A2F3A] p-3.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#9CA3AF] mb-2">
              <span>CONTESTANT ALPHA</span>
              {statsA && (
                <span className="text-white font-bold tabular-nums">
                  RANK {statsA.rankFormatted} ({statsA.projectedCorrect}/30)
                </span>
              )}
            </div>
            <select
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="w-full bg-[#1A1D23] border-2 border-[#2A2F3A] focus:border-[#D97706] px-3 py-2 font-display text-lg font-bold uppercase tracking-wider text-white focus:outline-none"
            >
              {CONTESTANTS.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 divide-x divide-[#2A2F3A] border-t border-[#2A2F3A] mt-3 pt-2.5 text-center font-mono tabular-nums">
              <div>
                <div className="text-[9px] text-[#9CA3AF]">OVERALL</div>
                <div className="text-xs font-bold text-white">{statsA?.projectedCorrect || 0}-
                  {statsA?.projectedWrong || 0}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#9CA3AF]">H2H SWING LEAD</div>
                <div className="text-xs font-bold text-[#10B981]">
                  {comparison.aDiffAdvantage} / {comparison.differentialTeams.length}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#9CA3AF]">OVR / UND</div>
                <div className="text-xs font-bold text-[#F3F4F6]">
                  {statsA?.overPicksCount} / {statsA?.underPicksCount}
                </div>
              </div>
            </div>
          </div>

          {/* Center Telemetry Summary */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center font-mono">
            <button
              onClick={() => {
                setPlayerA(playerB);
                setPlayerB(playerA);
              }}
              className="px-3 py-1.5 bg-[#121316] border-2 border-[#2A2F3A] hover:border-[#D97706] text-xs font-bold uppercase text-white flex items-center gap-1.5 transition-colors mb-2"
              title="Swap Contestants"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#D97706]" />
              <span>SWAP MATCHUP</span>
            </button>

            <div className="text-[11px] uppercase text-[#9CA3AF] tabular-nums">
              SLATE OVERLAP: <strong className="text-white">{comparison.similarityPct}%</strong> ({comparison.sharedTeams.length}/30)
            </div>
            <div className="text-[11px] uppercase text-[#9CA3AF] tabular-nums mt-0.5">
              DECIDING GAMES: <strong className="text-[#D97706]">{comparison.differentialTeams.length}</strong>
            </div>

            {comparison.differentialTeams.length > 0 && (
              <div className="w-full max-w-[210px] mt-2.5">
                <div className="flex justify-between text-[10px] font-bold mb-1 tabular-nums">
                  <span className="text-white">
                    {playerA.toUpperCase()}: {comparison.aDiffAdvantage}
                  </span>
                  <span className="text-[#D97706]">
                    {playerB.toUpperCase()}: {comparison.bDiffAdvantage}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121316] border border-[#2A2F3A] flex overflow-hidden">
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
          <div className="md:col-span-4 bg-[#121316] border-2 border-[#2A2F3A] p-3.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#9CA3AF] mb-2">
              <span>CONTESTANT BRAVO</span>
              {statsB && (
                <span className="text-white font-bold tabular-nums">
                  RANK {statsB.rankFormatted} ({statsB.projectedCorrect}/30)
                </span>
              )}
            </div>
            <select
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="w-full bg-[#1A1D23] border-2 border-[#2A2F3A] focus:border-[#D97706] px-3 py-2 font-display text-lg font-bold uppercase tracking-wider text-white focus:outline-none"
            >
              {CONTESTANTS.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 divide-x divide-[#2A2F3A] border-t border-[#2A2F3A] mt-3 pt-2.5 text-center font-mono tabular-nums">
              <div>
                <div className="text-[9px] text-[#9CA3AF]">OVERALL</div>
                <div className="text-xs font-bold text-white">{statsB?.projectedCorrect || 0}-
                  {statsB?.projectedWrong || 0}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#9CA3AF]">H2H SWING LEAD</div>
                <div className="text-xs font-bold text-[#10B981]">
                  {comparison.bDiffAdvantage} / {comparison.differentialTeams.length}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#9CA3AF]">OVR / UND</div>
                <div className="text-xs font-bold text-[#F3F4F6]">
                  {statsB?.overPicksCount} / {statsB?.underPicksCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Differential Matrix Table / Cards */}
        <div className="border-t-2 border-[#2A2F3A] pt-4">
          {playerA === playerB ? (
            <div className="py-8 text-center font-mono text-xs uppercase text-[#9CA3AF]">
              SELECT TWO DISTINCT CONTESTANTS TO GENERATE DIFFERENTIAL MATRIX
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                    className={`bg-[#121316] border p-3 font-mono tabular-nums ${
                      isDiff
                        ? 'border-[#2A2F3A] hover:border-[#9CA3AF]'
                        : 'border-[#2A2F3A]/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#2A2F3A]">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <span className="font-bold text-xs text-[#D97706]">{team.abbr}</span>
                        <span className="font-sans text-xs font-semibold text-white truncate">
                          {team.team}
                        </span>
                      </div>

                      <div className="text-right text-[11px] shrink-0">
                        <span className="text-[#9CA3AF]">LINE </span>
                        <strong className="text-white">{team.line.toFixed(1)}</strong>
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
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`px-2.5 py-1.5 border flex items-center justify-between ${
                          aCorrect
                            ? 'bg-[#064E3B]/35 border-[#059669]'
                            : 'bg-[#7F1D1D]/30 border-[#DC2626]'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-[#9CA3AF] uppercase">
                            {playerA}
                          </div>
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
                        className={`px-2.5 py-1.5 border flex items-center justify-between ${
                          bCorrect
                            ? 'bg-[#064E3B]/35 border-[#059669]'
                            : 'bg-[#7F1D1D]/30 border-[#DC2626]'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-[#9CA3AF] uppercase">
                            {playerB}
                          </div>
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
