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
  const [customDaysElapsed, setCustomDaysElapsed] = useState(null); // null = always use live calendar date
  const [copiedReport, setCopiedReport] = useState(false);

  const loadStandings = useCallback(async (resetDayToLive = false) => {
    setIsRefreshing(true);
    if (resetDayToLive) {
      setCustomDaysElapsed(null);
    }
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

  // Automatically fetch live standings on mount, when tab regains focus, and every 5 minutes
  useEffect(() => {
    loadStandings(true);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadStandings(false);
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const intervalId = setInterval(() => {
      loadStandings(false);
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(intervalId);
    };
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

      {/* Non-sticky Broadcast Control Room Header — scrolls naturally with the page */}
      <header className="bg-[#121316] border-b-2 border-[#2A2F3A]">
        <div className="max-w-[1640px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1A1D23] border-2 border-[#D97706] flex flex-col items-center justify-center font-display font-extrabold leading-none shrink-0">
                <span className="text-[10px] sm:text-xs text-[#D97706] tracking-widest">NBA</span>
                <span className="text-[9px] sm:text-[10px] text-white font-mono">26/27</span>
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-2xl font-extrabold uppercase tracking-wider text-white leading-none">
                  <span className="sm:hidden">NBA O/U 2026-27</span>
                  <span className="hidden sm:inline">
                    NBA REGULAR SEASON OVER / UNDER COMPETITION 2026-27
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1 font-mono text-[10px] sm:text-[11px] text-[#9CA3AF] tabular-nums">
                  <span>10 PLAYERS</span>
                  <span className="text-[#2A2F3A]">|</span>
                  <span>DAY {dayPadded}/172</span>
                  <span className="hidden sm:inline text-[#2A2F3A]">|</span>
                  <span className="hidden sm:inline">
                    MODEL:{' '}
                    <strong className="text-[#F3F4F6]">
                      WINS + ({(seasonProgress.pctRemaining * 100).toFixed(1)}% × LINE)
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Quick Sync Button */}
            <button
              onClick={() => loadStandings(true)}
              disabled={isRefreshing}
              className="md:hidden p-2 bg-[#1A1D23] border border-[#2A2F3A] text-[#9CA3AF] hover:text-white"
              title="Refresh ESPN Standings & Live Date"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D97706]' : ''}`} />
            </button>
          </div>

          {/* Compact Action Bar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs tabular-nums">
            {/* Compact Day Stepper */}
            <div className="bg-[#1A1D23] border border-[#2A2F3A] px-2 py-1 flex items-center gap-1.5">
              <span className="text-[10px] text-[#9CA3AF] hidden sm:inline">
                {seasonProgress.isCustomDay ? 'SIM DAY' : 'LIVE DAY'}
              </span>
              <button
                onClick={() =>
                  setCustomDaysElapsed(Math.max(0, seasonProgress.daysElapsed - 1))
                }
                className="w-5 h-5 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] flex items-center justify-center text-white"
                title="Previous Day"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="font-bold text-white px-1 text-[11px]">
                {dayPadded}/172
              </span>
              <button
                onClick={() =>
                  setCustomDaysElapsed(Math.min(172, seasonProgress.daysElapsed + 1))
                }
                className="w-5 h-5 bg-[#121316] border border-[#2A2F3A] hover:border-[#D97706] flex items-center justify-center text-white"
                title="Next Day"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <input
                type="range"
                min={0}
                max={172}
                value={seasonProgress.daysElapsed}
                onChange={(e) => setCustomDaysElapsed(Number(e.target.value))}
                className="w-16 accent-[#D97706] cursor-pointer hidden lg:block ml-1"
                title="Scrub Season Day (0 to 172)"
              />
              {seasonProgress.isCustomDay && (
                <button
                  onClick={() => setCustomDaysElapsed(null)}
                  className="text-[10px] text-[#D97706] hover:text-white px-1 font-bold flex items-center gap-0.5"
                  title={`Reset to Today (Day ${String(seasonProgress.liveDaysElapsed).padStart(3, '0')})`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>TODAY</span>
                </button>
              )}
            </div>

            {/* Record Sandbox Toggle */}
            <button
              onClick={() => setIsSandboxMode((v) => !v)}
              className={`px-2.5 py-1.5 border font-bold uppercase flex items-center gap-1 transition-colors ${
                isSandboxMode
                  ? 'bg-[#D97706] text-[#121316] border-[#D97706]'
                  : 'bg-[#1A1D23] text-[#9CA3AF] border-[#2A2F3A] hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{isSandboxMode ? 'SIM: ON' : 'SIM'}</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 bg-[#1A1D23] border border-[#2A2F3A] hover:border-[#D97706] text-white font-bold uppercase flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3 text-[#D97706]" />
              <span>CSV</span>
            </button>

            {/* Copy Report Button */}
            <button
              onClick={handleCopyReport}
              className={`px-2.5 py-1.5 border font-bold uppercase flex items-center gap-1 transition-colors ${
                copiedReport
                  ? 'bg-[#064E3B] text-[#10B981] border-[#059669]'
                  : 'bg-[#1A1D23] text-white border-[#2A2F3A] hover:border-[#D97706]'
              }`}
            >
              {copiedReport ? (
                <>
                  <Check className="w-3 h-3 text-[#10B981]" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#D97706]" />
                  <span>REPORT</span>
                </>
              )}
            </button>

            {/* Desktop ESPN Sync Status */}
            <div className="hidden md:flex bg-[#1A1D23] border border-[#2A2F3A] px-2.5 py-1.5 items-center gap-2">
              <Radio
                className={`w-3 h-3 ${
                  dataSource === 'ESPN_LIVE' ? 'text-[#10B981]' : 'text-[#D97706]'
                }`}
              />
              <span className="text-[10px] uppercase text-[#9CA3AF]">
                {dataSource === 'ESPN_LIVE' ? 'LIVE' : 'BASE'}
              </span>
              <button
                onClick={() => loadStandings(true)}
                disabled={isRefreshing}
                className="text-[#9CA3AF] hover:text-white disabled:opacity-50"
                title="Refresh ESPN Standings API & Reset to Live Date"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Editorial Insights Strip — compact single horizontal scroll on mobile */}
        <div className="bg-[#1A1D23] border-t border-[#2A2F3A] px-3 sm:px-6 py-1.5 overflow-x-auto whitespace-nowrap">
          <div className="max-w-[1640px] mx-auto flex items-center justify-between gap-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider tabular-nums">
            <div className="flex items-center gap-2.5 text-[#F3F4F6]">
              <span className="px-1.5 py-0.2 bg-[#D97706] text-[#121316] font-bold shrink-0">
                WIRE
              </span>
              {editorialTickerItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[#2A2F3A]">|</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>

            <div className="hidden sm:block text-[#9CA3AF] text-[10px] shrink-0">
              SYNC: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'READY'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Broadcast Workspace */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* 01 // Standings */}
        <div id="leaderboard">
          <LeaderboardSection
            leaderboard={leaderboard}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
        </div>

        {/* 02 // Swing Radar */}
        <div id="swing-radar">
          <SwingRadarSection
            enrichedTeams={enrichedTeams}
            onQuickFilter={handleQuickFilterFromRadar}
          />
        </div>

        {/* 03 // Master Ledger Table */}
        <div id="master-grid">
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

        {/* 04 // Head-to-Head Matrix */}
        <div id="head-to-head">
          <HeadToHeadSection
            enrichedTeams={enrichedTeams}
            leaderboard={leaderboard}
          />
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t-2 border-[#2A2F3A] bg-[#121316] py-4 mt-8 font-mono text-[10px] sm:text-[11px] uppercase text-[#9CA3AF]">
        <div className="max-w-[1640px] mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>NBA O/U COMPETITION 2026-27 // 10-PLAYER SYNDICATE</div>
          <div className="hidden sm:block">
            PROJECTION: ACTUAL WINS + ((1 - DAYS_ELAPSED/172) × PRESEASON_LINE)
          </div>
        </div>
      </footer>
    </div>
  );
}
