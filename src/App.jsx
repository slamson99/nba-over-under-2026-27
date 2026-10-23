import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RefreshCw,
  Sliders,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Radio
} from 'lucide-react';
import { INITIAL_DATASET, TEAM_METADATA } from './data/nbaData';
import {
  fetchLiveStandings,
  computeEnrichedTeams,
  computeLeaderboard,
  generateEditorialTicker,
  generateCSVExport,
  generatePlaintextReport
} from './utils/standingsService';
import { LeaderboardSection } from './components/LeaderboardSection';
import { SwingRadarSection } from './components/SwingRadarSection';
import { MasterGridSection } from './components/MasterGridSection';
import { HeadToHeadSection } from './components/HeadToHeadSection';

export default function App() {
  const [standingsMap, setStandingsMap] = useState(null);
  const [dataSource, setDataSource] = useState('LOADING'); // 'ESPN_LIVE' | 'BASELINE' | 'SANDBOX'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter, Spotlight & Stepper states
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [customDaysElapsed, setCustomDaysElapsed] = useState(2); // Default: Day 2 / 172
  const [copiedReport, setCopiedReport] = useState(false);

  const loadStandings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const liveMap = await fetchLiveStandings();
      const totalGames = Object.values(liveMap).reduce(
        (acc, item) => acc + (item.gamesPlayed || 0),
        0
      );

      if (Object.keys(liveMap).length >= 25 && totalGames > 0) {
        setStandingsMap(liveMap);
        setDataSource('ESPN_LIVE');
      } else {
        const fallback = {};
        Object.entries(TEAM_METADATA).forEach(([teamName, meta]) => {
          fallback[teamName] = {
            wins: meta.sampleWins,
            losses: meta.sampleLosses,
            gamesPlayed: meta.sampleWins + meta.sampleLosses,
            winPct:
              meta.sampleWins + meta.sampleLosses > 0
                ? meta.sampleWins / (meta.sampleWins + meta.sampleLosses)
                : 0,
            streak: meta.sampleStreak,
            logoUrl:
              liveMap[teamName]?.logoUrl ||
              `https://cdn.nba.com/logos/nba/${meta.nbaId}/global/L/logo.svg`
          };
        });
        setStandingsMap(fallback);
        setDataSource('BASELINE');
      }
      setLastUpdated(new Date());
    } catch (err) {
      const fallback = {};
      Object.entries(TEAM_METADATA).forEach(([teamName, meta]) => {
        fallback[teamName] = {
          wins: meta.sampleWins,
          losses: meta.sampleLosses,
          gamesPlayed: meta.sampleWins + meta.sampleLosses,
          winPct:
            meta.sampleWins + meta.sampleLosses > 0
              ? meta.sampleWins / (meta.sampleWins + meta.sampleLosses)
              : 0,
          streak: meta.sampleStreak,
          logoUrl: `https://cdn.nba.com/logos/nba/${meta.nbaId}/global/L/logo.svg`
        };
      });
      setStandingsMap(fallback);
      setDataSource('BASELINE');
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  // Allow interactive What-If win adjustments in Sandbox mode
  const handleAdjustTeamWins = (teamName, delta) => {
    setStandingsMap((prev) => {
      if (!prev) return prev;
      const current = prev[teamName] || { wins: 0, losses: 0 };
      const newWins = Math.max(0, Math.min(82, current.wins + delta));
      const newLosses = Math.max(0, Math.min(82 - newWins, current.losses));
      const gp = newWins + newLosses;
      return {
        ...prev,
        [teamName]: {
          ...current,
          wins: newWins,
          losses: newLosses,
          gamesPlayed: gp,
          winPct: gp > 0 ? newWins / gp : 0
        }
      };
    });
    setDataSource('SANDBOX');
  };

  // Compute enriched teams, season calendar progress, leaderboard, and editorial ticker
  const { enrichedTeams, seasonProgress } = useMemo(
    () => computeEnrichedTeams(INITIAL_DATASET, standingsMap, true, customDaysElapsed),
    [standingsMap, customDaysElapsed]
  );

  const leaderboard = useMemo(
    () => computeLeaderboard(enrichedTeams),
    [enrichedTeams]
  );

  const editorialTickerItems = useMemo(
    () => generateEditorialTicker(leaderboard, enrichedTeams, seasonProgress),
    [leaderboard, enrichedTeams, seasonProgress]
  );

  // Export CSV handler
  const handleExportCSV = () => {
    const csvContent = generateCSVExport(enrichedTeams, leaderboard, seasonProgress);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `nba_over_under_2026_27_day_${String(seasonProgress.daysElapsed).padStart(3, '0')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Report for Discord / WhatsApp / Slack
  const handleCopyReport = async () => {
    const reportText = generatePlaintextReport(leaderboard, enrichedTeams, seasonProgress);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = reportText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickFilterFromRadar = (filterId) => {
    setActiveFilter(filterId);
    scrollToSection('master-grid');
  };

  const dayPadded = String(seasonProgress.daysElapsed).padStart(3, '0');

  return (
    <div className="min-h-screen bg-[#121316] text-[#F3F4F6] flex flex-col">
      {/* Top Parquet Maple Accent Line */}
      <div className="h-1 w-full bg-[#D97706]" />

      {/* Broadcast Control Room Header */}
      <header className="sticky top-0 z-50 bg-[#121316] border-b-2 border-[#2A2F3A]">
        {/* Primary Broadcast Header Row */}
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Institutional Title Block */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#1A1D23] border-2 border-[#D97706] flex flex-col items-center justify-center font-display font-extrabold leading-none">
              <span className="text-xs text-[#D97706] tracking-widest">NBA</span>
              <span className="text-[10px] text-white font-mono">26/27</span>
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-white leading-none">
                NBA REGULAR SEASON OVER / UNDER COMPETITION 2026-27
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-[11px] text-[#9CA3AF] tabular-nums">
                <span>10 CONTESTANTS</span>
                <span className="text-[#2A2F3A]">|</span>
                <span>30 FRANCHISES</span>
                <span className="text-[#2A2F3A]">|</span>
                <span>
                  TIME-DECAY MODEL:{' '}
                  <strong className="text-[#F3F4F6]">
                    WINS + ({(seasonProgress.pctRemaining * 100).toFixed(1)}% × LINE)
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Manual Day Stepper + Sync + Export CSV + Copy Report */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums">
            {/* Compact Manual Day Stepper & Season Progress */}
            <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] px-2.5 py-1 flex items-center gap-2">
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2 text-[10px] text-[#9CA3AF]">
                  <span>SEASON PROGRESS</span>
                  <span className="text-[#D97706] font-bold">
                    {(seasonProgress.pctCompleted * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    onClick={() => setCustomDaysElapsed((d) => Math.max(0, (d ?? 2) - 1))}
                    className="w-5 h-5 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] flex items-center justify-center text-white"
                    title="Previous Season Day"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-white px-1">
                    DAY {dayPadded} / {seasonProgress.totalSeasonDays}
                  </span>
                  <button
                    onClick={() => setCustomDaysElapsed((d) => Math.min(172, (d ?? 2) + 1))}
                    className="w-5 h-5 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] flex items-center justify-center text-white"
                    title="Next Season Day"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={172}
                    value={seasonProgress.daysElapsed}
                    onChange={(e) => setCustomDaysElapsed(Number(e.target.value))}
                    className="w-20 accent-[#D97706] cursor-pointer hidden sm:block ml-1"
                    title="Scrub Season Day (0 to 172)"
                  />
                  {seasonProgress.daysElapsed !== 2 && (
                    <button
                      onClick={() => setCustomDaysElapsed(2)}
                      className="text-[10px] text-[#9CA3AF] hover:text-white px-1"
                      title="Reset to Day 002"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {/* Ultra-thin Progress Bar */}
                <div className="w-full h-0.5 bg-[#121316] mt-1 overflow-hidden">
                  <div
                    style={{ width: `${seasonProgress.pctCompleted * 100}%` }}
                    className="h-full bg-[#D97706]"
                  />
                </div>
              </div>
            </div>

            {/* Record Sandbox Toggle */}
            <button
              onClick={() => setIsSandboxMode((v) => !v)}
              className={`px-3 py-2 border-2 font-bold uppercase flex items-center gap-1.5 transition-colors ${
                isSandboxMode
                  ? 'bg-[#D97706] text-[#121316] border-[#D97706]'
                  : 'bg-[#1A1D23] text-[#9CA3AF] border-[#2A2F3A] hover:border-[#9CA3AF] hover:text-white'
              }`}
              title="Toggle +/- Win Stepper Controls in Table"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">SIMULATE WINS</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-[#1A1D23] border-2 border-[#2A2F3A] hover:border-[#D97706] text-white font-bold uppercase flex items-center gap-1.5 transition-colors"
              title="Download Full 30-Team Ledger as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#D97706]" />
              <span>EXPORT CSV</span>
            </button>

            {/* Copy Report Button (Discord / Slack / WhatsApp) */}
            <button
              onClick={handleCopyReport}
              className={`px-3 py-2 border-2 font-bold uppercase flex items-center gap-1.5 transition-colors ${
                copiedReport
                  ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                  : 'bg-[#1A1D23] text-white border-[#2A2F3A] hover:border-[#D97706]'
              }`}
              title="Copy Formatted Plaintext Standings for Discord / WhatsApp / Slack"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>REPORT COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>COPY REPORT</span>
                </>
              )}
            </button>

            {/* ESPN Sync Status */}
            <div className="bg-[#1A1D23] border-2 border-[#2A2F3A] px-2.5 py-2 flex items-center gap-2">
              <Radio
                className={`w-3.5 h-3.5 ${
                  dataSource === 'ESPN_LIVE' ? 'text-[#10B981]' : 'text-[#D97706]'
                }`}
              />
              <span className="text-[11px] uppercase text-[#9CA3AF] hidden xl:inline">
                {dataSource === 'ESPN_LIVE' ? 'ESPN FEED' : 'BASELINE'}
              </span>
              <button
                onClick={loadStandings}
                disabled={isRefreshing}
                className="text-[#9CA3AF] hover:text-white disabled:opacity-50"
                title="Refresh ESPN Standings API"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Editorial Insights Strip (Clean Text-Only Sports Marquee) */}
        <div className="bg-[#1A1D23] border-t border-[#2A2F3A] px-4 sm:px-6 py-1.5">
          <div className="max-w-[1640px] mx-auto flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider tabular-nums">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#F3F4F6]">
              <span className="px-1.5 py-0.2 bg-[#D97706] text-[#121316] font-bold">
                WIRE
              </span>
              {editorialTickerItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[#2A2F3A]">|</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>

            <div className="text-[#9CA3AF] text-[10px]">
              SYNC: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'READY'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Broadcast Workspace */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* 01 // The Podium Standings */}
        <div id="leaderboard" className="scroll-mt-28">
          <LeaderboardSection
            leaderboard={leaderboard}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
        </div>

        {/* 02 // High-Stakes & Swing Radar */}
        <div id="swing-radar" className="scroll-mt-28">
          <SwingRadarSection
            enrichedTeams={enrichedTeams}
            onQuickFilter={handleQuickFilterFromRadar}
          />
        </div>

        {/* 03 // The Master Ledger Table */}
        <div id="master-grid" className="scroll-mt-28">
          <MasterGridSection
            enrichedTeams={enrichedTeams}
            leaderboard={leaderboard}
            seasonProgress={seasonProgress}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
            isSandboxMode={isSandboxMode}
            onAdjustTeamWins={handleAdjustTeamWins}
          />
        </div>

        {/* 04 // Head-to-Head Differential Matrix */}
        <div id="head-to-head" className="scroll-mt-28">
          <HeadToHeadSection
            enrichedTeams={enrichedTeams}
            leaderboard={leaderboard}
          />
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t-2 border-[#2A2F3A] bg-[#121316] py-5 mt-10 font-mono text-[11px] uppercase text-[#9CA3AF]">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            NBA REGULAR SEASON OVER / UNDER COMPETITION 2026-27 // 10-PLAYER SYNDICATE LEDGER
          </div>
          <div>
            PROJECTION ENGINE: ACTUAL WINS + ((1 - DAYS_ELAPSED/172) × PRESEASON_LINE)
          </div>
        </div>
      </footer>
    </div>
  );
}
