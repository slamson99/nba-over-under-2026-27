import { CONTESTANTS, TEAM_METADATA, SEASON_CALENDAR } from '../data/nbaData';

const ESPN_STANDINGS_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';

/**
 * Normalizes team names or abbreviations from ESPN API to match our baseline dataset
 */
const ESPN_ABBR_TO_TEAM = {
  ATL: "Atlanta Hawks",
  BOS: "Boston Celtics",
  BKN: "Brooklyn Nets",
  CHA: "Charlotte Hornets",
  CHI: "Chicago Bulls",
  CLE: "Cleveland Cavaliers",
  DAL: "Dallas Mavericks",
  DEN: "Denver Nuggets",
  DET: "Detroit Pistons",
  GS: "Golden State Warriors",
  GSW: "Golden State Warriors",
  HOU: "Houston Rockets",
  IND: "Indiana Pacers",
  LAC: "Los Angeles Clippers",
  LAL: "Los Angeles Lakers",
  MEM: "Memphis Grizzlies",
  MIA: "Miami Heat",
  MIL: "Milwaukee Bucks",
  MIN: "Minnesota Timberwolves",
  NO: "New Orleans Pelicans",
  NOP: "New Orleans Pelicans",
  NY: "New York Knicks",
  NYK: "New York Knicks",
  OKC: "Oklahoma City Thunder",
  ORL: "Orlando Magic",
  PHI: "Philadelphia 76ers",
  PHX: "Phoenix Suns",
  POR: "Portland Trail Blazers",
  SAC: "Sacramento Kings",
  SA: "San Antonio Spurs",
  SAS: "San Antonio Spurs",
  TOR: "Toronto Raptors",
  UTAH: "Utah Jazz",
  UTA: "Utah Jazz",
  WSH: "Washington Wizards",
  WAS: "Washington Wizards"
};

/**
 * Calculates the real-time Calendar Time-Decay Season Parameters
 * - Total Season Days = 172 days
 * - Days Elapsed = Current Date - Season Start Date (computed dynamically from live system clock)
 * - % Season Completed = Days Elapsed / Total Season Days (capped between 0 and 1)
 * - % Season Remaining = 1 - % Season Completed
 */
export function getLiveDaysElapsed() {
  const totalSeasonDays = SEASON_CALENDAR.totalSeasonDays || 172;
  const [startYear, startMonth, startDay] = SEASON_CALENDAR.startDate.split('-').map(Number);
  const now = new Date();
  const startUTC = Date.UTC(startYear, startMonth - 1, startDay);
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((todayUTC - startUTC) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(totalSeasonDays, diffDays));
}

export function getSeasonProgress(customDaysElapsed = null) {
  const totalSeasonDays = SEASON_CALENDAR.totalSeasonDays || 172;
  const liveDaysElapsed = getLiveDaysElapsed();

  let daysElapsed;
  if (typeof customDaysElapsed === 'number' && !Number.isNaN(customDaysElapsed)) {
    daysElapsed = Math.max(0, Math.min(totalSeasonDays, Math.round(customDaysElapsed)));
  } else {
    daysElapsed = liveDaysElapsed;
  }

  const pctCompleted = Math.max(0, Math.min(1, daysElapsed / totalSeasonDays));
  const pctRemaining = 1 - pctCompleted;

  return {
    totalSeasonDays,
    daysElapsed,
    liveDaysElapsed,
    isCustomDay: customDaysElapsed !== null && daysElapsed !== liveDaysElapsed,
    daysRemaining: totalSeasonDays - daysElapsed,
    pctCompleted,
    pctRemaining,
    startDate: SEASON_CALENDAR.startDate,
    endDate: SEASON_CALENDAR.endDate
  };
}

/**
 * Fetches live NBA standings from ESPN API v2 (with cache-busting query param so browsers always get fresh records)
 */
export async function fetchLiveStandings() {
  const response = await fetch(`${ESPN_STANDINGS_URL}?_t=${Date.now()}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`ESPN API returned status ${response.status}`);
  }
  const data = await response.json();
  const parsedMap = {};

  const extractEntries = (node) => {
    if (node?.standings?.entries) {
      for (const entry of node.standings.entries) {
        const teamObj = entry.team || {};
        const abbr = (teamObj.abbreviation || '').toUpperCase();
        const displayName = teamObj.displayName || '';
        const matchedName =
          ESPN_ABBR_TO_TEAM[abbr] ||
          (displayName === 'LA Clippers' ? 'Los Angeles Clippers' : displayName);

        if (matchedName) {
          const stats = entry.stats || [];
          const getStat = (name, type) => {
            const found = stats.find(
              (s) => s.name === name || s.type === type || s.abbreviation === name
            );
            return found;
          };

          const winsObj = getStat('wins', 'wins');
          const lossesObj = getStat('losses', 'losses');
          const streakObj = getStat('streak', 'streak');
          const winPctObj = getStat('winPercent', 'winpercent');

          const wins = winsObj ? Number(winsObj.value) : 0;
          const losses = lossesObj ? Number(lossesObj.value) : 0;
          const streak =
            streakObj?.displayValue ||
            (streakObj?.value > 0
              ? `W${streakObj.value}`
              : streakObj?.value < 0
              ? `L${Math.abs(streakObj.value)}`
              : '-');

          const logoUrl =
            teamObj.logos?.[0]?.href ||
            `https://a.espncdn.com/i/teamlogos/nba/500/${abbr.toLowerCase()}.png`;

          parsedMap[matchedName] = {
            wins,
            losses,
            gamesPlayed: wins + losses,
            winPct: winPctObj
              ? Number(winPctObj.value)
              : wins + losses > 0
              ? wins / (wins + losses)
              : 0,
            streak,
            logoUrl
          };
        }
      }
    }
    if (Array.isArray(node?.children)) {
      for (const child of node.children) {
        extractEntries(child);
      }
    }
  };

  extractEntries(data);
  return parsedMap;
}

/**
 * Computes full enriched metrics for all 30 teams using the Calendar Time-Decay Run Rate:
 * Projected Wins = round(Actual Wins + (% Season Remaining * Preseason Line), 1)
 */
export function computeEnrichedTeams(
  dataset,
  standingsMap,
  useFallbackWhenZero = true,
  customDaysElapsed = null
) {
  const seasonProgress = getSeasonProgress(customDaysElapsed);
  const { pctRemaining } = seasonProgress;

  const totalLiveGames = Object.values(standingsMap || {}).reduce(
    (sum, t) => sum + (t.gamesPlayed || 0),
    0
  );

  const isUsingSamplePace = totalLiveGames === 0 && useFallbackWhenZero;

  const enrichedTeams = dataset.map((item) => {
    const meta = TEAM_METADATA[item.team] || {};
    const live = standingsMap?.[item.team];

    const wins = isUsingSamplePace
      ? meta.sampleWins ?? 0
      : live?.wins ?? meta.sampleWins ?? 0;
    const losses = isUsingSamplePace
      ? meta.sampleLosses ?? 0
      : live?.losses ?? meta.sampleLosses ?? 0;
    const streak = isUsingSamplePace
      ? meta.sampleStreak || 'W1'
      : live?.streak || meta.sampleStreak || '-';

    const gamesPlayed = wins + losses;
    const winPct = gamesPlayed > 0 ? wins / gamesPlayed : 0;

    // Calendar Time-Decay Run Rate Formula:
    // Projected Wins = Actual Wins + (% Season Remaining * Preseason Line)
    const rawProjectedWins = wins + pctRemaining * item.line;
    const projectedWins = Number(rawProjectedWins.toFixed(1));

    const paceDiff = Number((projectedWins - item.line).toFixed(1));
    const currentPaceOutcome = projectedWins > item.line ? 'Over' : 'Under';

    // Clinched / Eliminated checks (82-game NBA regular season)
    const maxPossibleWins = 82 - losses;
    const isOverClinched = wins > item.line;
    const isUnderClinched = maxPossibleWins < item.line;
    const clinchedOutcome = isOverClinched ? 'Over' : isUnderClinched ? 'Under' : null;

    // Field Splits (10 Contestants)
    let overCount = 0;
    let underCount = 0;
    CONTESTANTS.forEach((player) => {
      if (item.picks[player] === 'Over') overCount++;
      else if (item.picks[player] === 'Under') underCount++;
    });

    const overPct = Math.round((overCount / CONTESTANTS.length) * 100);
    const underPct = Math.round((underCount / CONTESTANTS.length) * 100);

    // Split classification
    const maxSplitPct = Math.max(overPct, underPct);
    const majorityPick = overPct > underPct ? 'Over' : underPct > overPct ? 'Under' : 'Split';
    const isUnanimous = maxSplitPct === 100;
    const isNearUnanimous = maxSplitPct === 90;
    const is5050 = overPct === 50 && underPct === 50;
    const isContested = maxSplitPct <= 60;
    // Volatile Pace Teams: abs(Projected Wins - Line) <= 1.5
    const isVolatilePace = Math.abs(paceDiff) <= 1.5;

    // Find lone wolf if 90/10 split
    let loneWolf = null;
    if (isNearUnanimous) {
      const minoritySide = overPct === 10 ? 'Over' : 'Under';
      loneWolf = CONTESTANTS.find((p) => item.picks[p] === minoritySide) || null;
    }

    const logoUrl =
      live?.logoUrl ||
      `https://cdn.nba.com/logos/nba/${meta.nbaId}/global/L/logo.svg`;
    const fallbackLogoUrl = `https://a.espncdn.com/i/teamlogos/nba/500/${meta.espnSlug || 'nba'}.png`;

    // Evaluate status for each contestant on this team
    const playerStatuses = {};
    CONTESTANTS.forEach((player) => {
      const pick = item.picks[player];
      const isClinchedCorrect = clinchedOutcome !== null && clinchedOutcome === pick;
      const isEliminated = clinchedOutcome !== null && clinchedOutcome !== pick;
      const isProjectedCorrect = isClinchedCorrect || (!isEliminated && currentPaceOutcome === pick);

      playerStatuses[player] = {
        pick,
        code: pick === 'Over' ? 'OVR' : 'UND',
        isProjectedCorrect,
        isClinchedCorrect,
        isEliminated,
        status: isClinchedCorrect
          ? 'CLINCHED'
          : isEliminated
          ? 'ELIMINATED'
          : isProjectedCorrect
          ? 'ON_TRACK'
          : 'TRAILING'
      };
    });

    return {
      ...item,
      abbr: meta.abbr || item.team.slice(0, 3).toUpperCase(),
      nbaId: meta.nbaId,
      conf: meta.conf || 'East',
      logoUrl,
      fallbackLogoUrl,
      wins,
      losses,
      gamesPlayed,
      winPct,
      streak,
      projectedWins,
      paceDiff,
      currentPaceOutcome,
      maxPossibleWins,
      clinchedOutcome,
      overCount,
      underCount,
      overPct,
      underPct,
      maxSplitPct,
      majorityPick,
      isUnanimous,
      isNearUnanimous,
      loneWolf,
      is5050,
      isContested,
      isVolatilePace,
      playerStatuses
    };
  });

  return { enrichedTeams, isUsingSamplePace, totalLiveGames, seasonProgress };
}

/**
 * Computes Leaderboard rankings for the 10 contestants
 */
export function computeLeaderboard(enrichedTeams) {
  const standings = CONTESTANTS.map((player) => {
    let projectedCorrect = 0;
    let clinchedWins = 0;
    let eliminatedPicks = 0;
    let overPicksCount = 0;
    let underPicksCount = 0;
    let loneWolfCorrect = 0;
    let loneWolfTotal = 0;
    let volatileCorrect = 0;

    enrichedTeams.forEach((team) => {
      const st = team.playerStatuses[player];
      if (st.pick === 'Over') overPicksCount++;
      else underPicksCount++;

      if (st.isProjectedCorrect) projectedCorrect++;
      if (st.isClinchedCorrect) clinchedWins++;
      if (st.isEliminated) eliminatedPicks++;

      if (team.loneWolf === player) {
        loneWolfTotal++;
        if (st.isProjectedCorrect) loneWolfCorrect++;
      }

      if (team.isVolatilePace && st.isProjectedCorrect) {
        volatileCorrect++;
      }
    });

    return {
      player,
      projectedCorrect,
      projectedWrong: 30 - projectedCorrect,
      clinchedWins,
      eliminatedPicks,
      maxPossibleScore: 30 - eliminatedPicks,
      overPicksCount,
      underPicksCount,
      loneWolfCorrect,
      loneWolfTotal,
      volatileCorrect,
      winAccuracyPct: Number(((projectedCorrect / 30) * 100).toFixed(1))
    };
  });

  standings.sort((a, b) => {
    if (b.projectedCorrect !== a.projectedCorrect) {
      return b.projectedCorrect - a.projectedCorrect;
    }
    if (b.clinchedWins !== a.clinchedWins) {
      return b.clinchedWins - a.clinchedWins;
    }
    return a.player.localeCompare(b.player);
  });

  const topScore = standings[0]?.projectedCorrect || 0;

  let currentRank = 1;
  standings.forEach((entry, idx) => {
    if (idx > 0 && entry.projectedCorrect < standings[idx - 1].projectedCorrect) {
      currentRank = idx + 1;
    }
    entry.rank = currentRank;
    entry.rankFormatted = String(currentRank).padStart(2, '0');
    const diff = topScore - entry.projectedCorrect;
    entry.pointsBack = diff;
    entry.deficitFormatted = diff === 0 ? '-' : `-${diff.toFixed(1)}`;
  });

  return standings;
}

/**
 * Generates clean, emoji-free editorial broadcast ticker items
 */
export function generateEditorialTicker(leaderboard, enrichedTeams, seasonProgress) {
  if (!leaderboard.length || !enrichedTeams.length) return [];

  const topScore = leaderboard[0].projectedCorrect;
  const topWrong = 30 - topScore;
  const leaders = leaderboard
    .filter((p) => p.projectedCorrect === topScore)
    .map((p) => p.player.toUpperCase());

  const leaderSegment =
    leaders.length === 1
      ? `LEADER: ${leaders[0]} (${topScore}-${topWrong} PROJECTED)`
      : `CO-LEADERS: ${leaders.join(' / ')} (${topScore}-${topWrong} PROJECTED)`;

  const deadlocks = enrichedTeams
    .filter((t) => t.is5050)
    .map((t) => `${t.abbr} (5-5 SPLIT)`);

  const battlegroundSegment =
    deadlocks.length > 0
      ? `KEY BATTLEGROUNDS: ${deadlocks.join(', ')}`
      : `CONTESTED SPLITS ACTIVE`;

  const unanimousOvers = enrichedTeams
    .filter((t) => t.isUnanimous && t.majorityPick === 'Over')
    .map((t) => t.abbr);

  const consensusSegment =
    unanimousOvers.length > 0
      ? `CONSENSUS: ${unanimousOvers.join(', ')} UNANIMOUS OVER`
      : '';

  const volatileCount = enrichedTeams.filter((t) => t.isVolatilePace).length;
  const volatileSegment = `VOLATILE PACE (<=1.5 DELTA): ${volatileCount} TEAMS`;

  const weightSegment = seasonProgress
    ? `TIME-DECAY WEIGHT: ${(seasonProgress.pctRemaining * 100).toFixed(1)}% PRESEASON LINE`
    : '';

  return [
    leaderSegment,
    battlegroundSegment,
    consensusSegment,
    volatileSegment,
    weightSegment
  ].filter(Boolean);
}

/**
 * Generates CSV string for all 30 teams + picks + projections
 */
export function generateCSVExport(enrichedTeams, leaderboard, seasonProgress) {
  const headers = [
    'TEAM',
    'ABBR',
    'LINE',
    'WINS',
    'LOSSES',
    'PROJECTED_WINS',
    'DELTA_VS_LINE',
    'PACE_SIDE',
    'OVER_PCT',
    'UNDER_PCT',
    ...CONTESTANTS.map((c) => `${c.toUpperCase()}_PICK`),
    ...CONTESTANTS.map((c) => `${c.toUpperCase()}_STATUS`)
  ];

  const rows = enrichedTeams.map((t) => [
    `"${t.team}"`,
    t.abbr,
    t.line,
    t.wins,
    t.losses,
    t.projectedWins.toFixed(1),
    (t.paceDiff > 0 ? `+${t.paceDiff.toFixed(1)}` : t.paceDiff.toFixed(1)),
    t.currentPaceOutcome.toUpperCase(),
    `${t.overPct}%`,
    `${t.underPct}%`,
    ...CONTESTANTS.map((c) => t.picks[c].toUpperCase()),
    ...CONTESTANTS.map((c) => (t.playerStatuses[c].isProjectedCorrect ? 'CORRECT' : 'WRONG'))
  ]);

  // Add summary row for projected scores
  const summaryRow = [
    '"PROJECTED_SCORE"',
    `DAY_${seasonProgress?.daysElapsed || 2}_OF_172`,
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    ...CONTESTANTS.map((c) => {
      const found = leaderboard.find((l) => l.player === c);
      return found ? `${found.projectedCorrect}/30` : '-';
    }),
    ...CONTESTANTS.map((c) => {
      const found = leaderboard.find((l) => l.player === c);
      return found ? `RANK_${found.rankFormatted}` : '-';
    })
  ];

  return [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow.join(',')].join('\n');
}

/**
 * Generates clean, emoji-free plaintext report suitable for Discord / WhatsApp / Slack
 */
export function generatePlaintextReport(leaderboard, enrichedTeams, seasonProgress) {
  const dayStr = String(seasonProgress?.daysElapsed ?? 2).padStart(3, '0');
  const remPct = ((seasonProgress?.pctRemaining ?? 0.988) * 100).toFixed(1);

  const lines = [
    '==========================================================',
    'NBA REGULAR SEASON OVER / UNDER COMPETITION 2026-27',
    `SEASON PROGRESS: DAY ${dayStr} / ${seasonProgress?.totalSeasonDays ?? 172} (${remPct}% LINE WEIGHT)`,
    '==========================================================',
    '',
    'RK  CONTESTANT   PROJ    RECORD  CLINCH  ELIM   DEFICIT',
    '----------------------------------------------------------'
  ];

  leaderboard.forEach((entry) => {
    const rk = entry.rankFormatted.padEnd(4, ' ');
    const name = entry.player.toUpperCase().padEnd(12, ' ');
    const proj = `${entry.projectedCorrect}/30`.padEnd(7, ' ');
    const rec = `${entry.projectedCorrect}-${entry.projectedWrong}`.padEnd(8, ' ');
    const cln = String(entry.clinchedWins).padEnd(8, ' ');
    const elm = String(entry.eliminatedPicks).padEnd(7, ' ');
    const def = entry.deficitFormatted;
    lines.push(`${rk}${name} ${proj} ${rec}${cln}${elm}${def}`);
  });

  const deadlocks = enrichedTeams.filter((t) => t.is5050);
  const volatile = enrichedTeams
    .filter((t) => t.isVolatilePace)
    .sort((a, b) => Math.abs(a.paceDiff) - Math.abs(b.paceDiff))
    .slice(0, 5);

  lines.push('');
  lines.push('----------------------------------------------------------');
  lines.push('KEY 5-5 DEADLOCK SPLITS:');
  deadlocks.forEach((t) => {
    const delta = t.paceDiff > 0 ? `+${t.paceDiff.toFixed(1)}` : t.paceDiff.toFixed(1);
    lines.push(
      `  * ${t.abbr} (${t.team}): ${t.wins}-${t.losses} | PROJ ${t.projectedWins.toFixed(1)} vs ${t.line} LINE (${delta}) -> ${t.currentPaceOutcome.toUpperCase()}`
    );
  });

  lines.push('');
  lines.push('VOLATILE PACE TEAMS (<= 1.5 DELTA):');
  volatile.forEach((t) => {
    const delta = t.paceDiff > 0 ? `+${t.paceDiff.toFixed(1)}` : t.paceDiff.toFixed(1);
    lines.push(
      `  * ${t.abbr}: PROJ ${t.projectedWins.toFixed(1)} vs ${t.line} (${delta}) | SPLIT: ${t.overCount} OVR - ${t.underCount} UND`
    );
  });
  lines.push('==========================================================');

  return '```\n' + lines.join('\n') + '\n```';
}
