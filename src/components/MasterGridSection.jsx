import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { CONTESTANTS } from '../data/nbaData';
import { TeamLogo } from './TeamLogo';

export const FILTER_TABS = [
  { id: 'ALL', label: 'ALL 30 TEAMS' },
  { id: 'CONTESTED', label: 'CONTESTED (5-5 / 6-4)' },
  { id: 'VOLATILE', label: 'VOLATILE PACE (<= 1.5)' },
  { id: 'UNANIMOUS', label: 'CONSENSUS (90-100%)' },
  { id: 'PACE_OVER', label: 'PACE > LINE' },
  { id: 'PACE_UNDER', label: 'PACE < LINE' },
];

export function MasterGridSection({
  enrichedTeams,
  leaderboard,
  seasonProgress,
  activeFilter,
  onFilterChange,
  selectedPlayer,
  onSelectPlayer,
  isSandboxMode,
  onAdjustTeamWins
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'team', direction: 'asc' });

  const playerScoreMap = useMemo(() => {
    const map = {};
    leaderboard.forEach((entry) => {
      map[entry.player] = entry;
    });
    return map;
  }, [leaderboard]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: key === 'team' ? 'asc' : 'desc' };
    });
  };

  const filteredAndSortedTeams = useMemo(() => {
    let list = [...enrichedTeams];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.team.toLowerCase().includes(q) ||
          t.abbr.toLowerCase().includes(q) ||
          t.conf.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'CONTESTED') {
      list = list.filter((t) => t.isContested);
    } else if (activeFilter === 'VOLATILE') {
      list = list.filter((t) => t.isVolatilePace);
    } else if (activeFilter === 'UNANIMOUS') {
      list = list.filter((t) => t.isUnanimous || t.isNearUnanimous);
    } else if (activeFilter === 'PACE_OVER') {
      list = list.filter((t) => t.projectedWins > t.line);
    } else if (activeFilter === 'PACE_UNDER') {
      list = list.filter((t) => t.projectedWins < t.line);
    }

    list.sort((a, b) => {
      const { key, direction } = sortConfig;
      const dir = direction === 'asc' ? 1 : -1;

      if (key === 'team') return a.team.localeCompare(b.team) * dir;
      if (key === 'line') return (a.line - b.line) * dir;
      if (key === 'wins') return (a.wins - b.wins) * dir;
      if (key === 'projectedWins') return (a.projectedWins - b.projectedWins) * dir;
      if (key === 'paceDiff') return (a.paceDiff - b.paceDiff) * dir;
      if (key === 'overPct') return (a.overPct - b.overPct) * dir;

      if (CONTESTANTS.includes(key)) {
        const statusRank = { CLINCHED: 4, ON_TRACK: 3, TRAILING: 2, ELIMINATED: 1 };
        const diff =
          statusRank[a.playerStatuses[key].status] -
          statusRank[b.playerStatuses[key].status];
        if (diff !== 0) return diff * dir;
        return a.picks[key].localeCompare(b.picks[key]) * dir;
      }
      return 0;
    });

    return list;
  }, [enrichedTeams, searchQuery, activeFilter, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]/50 group-hover:text-white" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#D97706]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#D97706]" />
    );
  };

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#2A2F3A] pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#D97706]" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                03 // THE MASTER LEDGER TABLE
              </h2>
              <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-[#1A1D23] border border-[#2A2F3A] text-[#F3F4F6] tabular-nums">
                SHOWING {filteredAndSortedTeams.length} / 30 TEAMS
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] font-mono">
              FORMULA: ACTUAL WINS + ({seasonProgress ? (seasonProgress.pctRemaining * 100).toFixed(1) : '98.8'}% SEASON REMAINING × LINE) • CLICK HEADERS TO SORT
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER TEAM / ABBR..."
            className="w-full bg-[#1A1D23] border-2 border-[#2A2F3A] focus:border-[#D97706] pl-8 pr-7 py-1.5 text-xs font-mono uppercase text-white placeholder-[#9CA3AF]/60 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar & Legend */}
      <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] p-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider border transition-colors ${
                  active
                    ? 'bg-[#D97706] text-[#121316] border-[#D97706]'
                    : 'bg-[#121316] text-[#9CA3AF] border-[#2A2F3A] hover:border-[#9CA3AF] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Technical Cell Key */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#064E3B] border border-[#059669] inline-block" />
            <span>PACE CORRECT</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#7F1D1D] border border-[#DC2626] inline-block" />
            <span>PACE WRONG</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#10B981]" />
            <span>CLINCHED</span>
          </span>
        </div>
      </div>

      {/* Dense Master Data Grid */}
      <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] overflow-hidden">
        <div className="overflow-x-auto max-h-[780px] overflow-y-auto">
          <table className="w-full border-collapse text-left tabular-nums">
            <thead className="sticky top-0 z-30 bg-[#121316] border-b-2 border-[#2A2F3A]">
              <tr className="font-display text-xs font-bold uppercase tracking-wider text-[#9CA3AF] select-none">
                {/* TEAM */}
                <th
                  onClick={() => handleSort('team')}
                  className="sticky left-0 z-40 bg-[#121316] px-3 py-2.5 min-w-[210px] cursor-pointer group hover:bg-[#1A1D23] border-r-2 border-[#2A2F3A]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">TEAM</span>
                    {renderSortIcon('team')}
                  </div>
                </th>

                {/* LINE */}
                <th
                  onClick={() => handleSort('line')}
                  className="px-2.5 py-2.5 text-center cursor-pointer group hover:bg-[#1A1D23] min-w-[72px] border-r border-[#2A2F3A]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>LINE</span>
                    {renderSortIcon('line')}
                  </div>
                </th>

                {/* ACTUAL */}
                <th
                  onClick={() => handleSort('wins')}
                  className="px-2.5 py-2.5 text-center cursor-pointer group hover:bg-[#1A1D23] min-w-[92px] border-r border-[#2A2F3A]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ACTUAL</span>
                    {renderSortIcon('wins')}
                  </div>
                </th>

                {/* PROJECTION */}
                <th
                  onClick={() => handleSort('projectedWins')}
                  className="px-3 py-2.5 text-center cursor-pointer group hover:bg-[#1A1D23] min-w-[125px] border-r border-[#2A2F3A]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>PROJECTION</span>
                    {renderSortIcon('projectedWins')}
                  </div>
                </th>

                {/* FIELD CONSENSUS */}
                <th
                  onClick={() => handleSort('overPct')}
                  className="px-3 py-2.5 text-center cursor-pointer group hover:bg-[#1A1D23] min-w-[155px] border-r-2 border-[#2A2F3A]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>FIELD CONSENSUS</span>
                    {renderSortIcon('overPct')}
                  </div>
                </th>

                {/* 10 CONTESTANT COLUMNS */}
                {CONTESTANTS.map((player) => {
                  const pStats = playerScoreMap[player];
                  const isSpotlight = selectedPlayer === player;
                  return (
                    <th
                      key={player}
                      onClick={() => onSelectPlayer(isSpotlight ? null : player)}
                      className={`px-2 py-2 text-center cursor-pointer transition-colors min-w-[76px] border-r border-[#2A2F3A] ${
                        isSpotlight
                          ? 'bg-[#D97706] text-[#121316]'
                          : 'hover:bg-[#1A1D23] text-white'
                      }`}
                      title={`Click to highlight ${player.toUpperCase()}`}
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-display text-sm font-bold tracking-wider uppercase">
                          {player}
                        </span>
                        {pStats && (
                          <span
                            className={`font-mono text-[10px] font-bold mt-0.5 ${
                              isSpotlight
                                ? 'text-[#121316]'
                                : pStats.rank === 1
                                ? 'text-[#D97706]'
                                : 'text-[#9CA3AF]'
                            }`}
                          >
                            {pStats.projectedCorrect}/30
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2A2F3A] font-mono text-xs">
              {filteredAndSortedTeams.map((team) => {
                const isPaceOver = team.projectedWins > team.line;
                const deltaStr =
                  team.paceDiff > 0
                    ? `+${team.paceDiff.toFixed(1)}`
                    : team.paceDiff.toFixed(1);

                return (
                  <tr
                    key={team.team}
                    className="h-10 hover:bg-[#21252D] transition-colors group"
                  >
                    {/* Sticky TEAM Column */}
                    <td className="sticky left-0 z-20 bg-[#1A1D23] group-hover:bg-[#21252D] px-3 py-1.5 border-r-2 border-[#2A2F3A] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo
                          team={team.team}
                          abbr={team.abbr}
                          logoUrl={team.logoUrl}
                          fallbackLogoUrl={team.fallbackLogoUrl}
                          size="w-5 h-5"
                        />
                        <span className="font-mono font-bold text-xs text-[#D97706] w-8 shrink-0">
                          {team.abbr}
                        </span>
                        <span className="font-sans font-semibold text-xs text-white truncate">
                          {team.team}
                        </span>
                        {team.is5050 && (
                          <span className="ml-auto text-[9px] font-mono font-bold px-1 py-0.2 bg-[#121316] text-[#D97706] border border-[#D97706]/60 shrink-0">
                            5-5
                          </span>
                        )}
                        {team.isUnanimous && (
                          <span className="ml-auto text-[9px] font-mono font-bold px-1 py-0.2 bg-[#121316] text-[#9CA3AF] border border-[#2A2F3A] shrink-0">
                            10-0
                          </span>
                        )}
                      </div>
                    </td>

                    {/* LINE Column */}
                    <td className="px-2.5 py-1.5 text-center font-bold text-white border-r border-[#2A2F3A] bg-[#121316]/40">
                      {team.line.toFixed(1)}
                    </td>

                    {/* ACTUAL Record Column */}
                    <td className="px-2.5 py-1.5 text-center border-r border-[#2A2F3A]">
                      <div className="flex items-center justify-center gap-1.5">
                        {isSandboxMode && (
                          <button
                            onClick={() => onAdjustTeamWins(team.team, -1)}
                            className="w-4 h-4 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] text-white flex items-center justify-center"
                            title="Subtract 1 Win"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <span className="text-white font-semibold">
                          {team.wins} - {team.losses}
                        </span>
                        {isSandboxMode && (
                          <button
                            onClick={() => onAdjustTeamWins(team.team, 1)}
                            className="w-4 h-4 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] text-white flex items-center justify-center"
                            title="Add 1 Win"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* PROJECTION Column */}
                    <td className="px-3 py-1.5 text-center border-r border-[#2A2F3A]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`font-bold ${
                            isPaceOver ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {team.projectedWins.toFixed(1)}
                        </span>
                        <span
                          className={`text-[10px] px-1 py-0.2 border font-bold ${
                            isPaceOver
                              ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                              : 'bg-[#7F1D1D] text-[#EF4444] border-[#DC2626]'
                          }`}
                        >
                          {deltaStr}
                        </span>
                      </div>
                    </td>

                    {/* FIELD CONSENSUS Column */}
                    <td className="px-3 py-1.5 border-r-2 border-[#2A2F3A]">
                      <div className="flex flex-col justify-center">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-[#10B981]">{team.overPct}% OVR</span>
                          <span className="text-[#EF4444]">{team.underPct}% UND</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#121316] flex overflow-hidden border border-[#2A2F3A]">
                          <div
                            style={{ width: `${team.overPct}%` }}
                            className="bg-[#059669] h-full"
                          />
                          <div
                            style={{ width: `${team.underPct}%` }}
                            className="bg-[#DC2626] h-full"
                          />
                        </div>
                      </div>
                    </td>

                    {/* 10 CONTESTANT CELLS */}
                    {CONTESTANTS.map((player) => {
                      const st = team.playerStatuses[player];
                      const isOver = st.pick === 'Over';
                      const isSpotlight = selectedPlayer === player;

                      // Broadcast cell background tint:
                      // Subtle turf green if projected correct, subtle stadium crimson if projected wrong
                      const cellTint = st.isProjectedCorrect
                        ? 'bg-[#064E3B]/35'
                        : 'bg-[#7F1D1D]/30';

                      const spotlightStyle = isSpotlight
                        ? 'ring-2 ring-inset ring-[#D97706]'
                        : '';

                      return (
                        <td
                          key={player}
                          className={`px-1.5 py-1 text-center border-r border-[#2A2F3A] ${cellTint} ${spotlightStyle}`}
                        >
                          {st.isClinchedCorrect ? (
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 text-[10px] font-bold border ${
                                isOver
                                  ? 'bg-[#059669] text-[#121316] border-[#10B981]'
                                  : 'bg-[#DC2626] text-white border-[#EF4444]'
                              }`}
                              title="Mathematically Clinched"
                            >
                              <Lock className="w-2.5 h-2.5 shrink-0" />
                              <span>{st.code}</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider border ${
                                isOver
                                  ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                                  : 'bg-[#7F1D1D] text-[#EF4444] border-[#DC2626]'
                              } ${st.isEliminated ? 'opacity-40 line-through' : ''}`}
                            >
                              {st.code}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
