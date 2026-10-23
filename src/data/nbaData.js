export const CONTESTANTS = [
  "Ed",
  "Cory",
  "Beardy",
  "Tank",
  "Samson",
  "Bronson",
  "Tom",
  "Chode",
  "Justin",
  "Jeza"
];

// 2026/27 NBA Regular Season Calendar Parameters (172 Total Season Days)
export const SEASON_CALENDAR = {
  startDate: "2026-10-21", // Opening Night (e.g. Oct 23 = Day 2 / 172)
  endDate: "2027-04-11",   // Regular Season Finale (172 days duration)
  totalSeasonDays: 172
};

export const INITIAL_DATASET = [
  {"team": "Atlanta Hawks", "line": 43.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Over","Tank":"Under","Samson":"Under","Bronson":"Over","Tom":"Under","Chode":"Under","Justin":"Over","Jeza":"Under"}},
  {"team": "Boston Celtics", "line": 51.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Under"}},
  {"team": "Brooklyn Nets", "line": 25.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Under","Bronson":"Under","Tom":"Over","Chode":"Under","Justin":"Under","Jeza":"Over"}},
  {"team": "Charlotte Hornets", "line": 37.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Over","Bronson":"Over","Tom":"Under","Chode":"Over","Justin":"Under","Jeza":"Under"}},
  {"team": "Chicago Bulls", "line": 29.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Over","Tank":"Over","Samson":"Under","Bronson":"Over","Tom":"Under","Chode":"Over","Justin":"Under","Jeza":"Over"}},
  {"team": "Cleveland Cavaliers", "line": 48.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Under","Bronson":"Under","Tom":"Over","Chode":"Over","Justin":"Over","Jeza":"Over"}},
  {"team": "Dallas Mavericks", "line": 33.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Under","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Under"}},
  {"team": "Denver Nuggets", "line": 48.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Over","Jeza":"Over"}},
  {"team": "Detroit Pistons", "line": 48.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Over","Tank":"Over","Samson":"Under","Bronson":"Over","Tom":"Over","Chode":"Under","Justin":"Over","Jeza":"Over"}},
  {"team": "Golden State Warriors", "line": 36.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Under","Justin":"Under","Jeza":"Under"}},
  {"team": "Houston Rockets", "line": 48.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Over","Jeza":"Over"}},
  {"team": "Indiana Pacers", "line": 44.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Under","Justin":"Over","Jeza":"Under"}},
  {"team": "Los Angeles Clippers", "line": 27.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Under","Bronson":"Under","Tom":"Under","Chode":"Under","Justin":"Under","Jeza":"Over"}},
  {"team": "Los Angeles Lakers", "line": 45.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Over","Jeza":"Over"}},
  {"team": "Memphis Grizzlies", "line": 30.5, "picks": {"Ed":"Under","Cory":"Over","Beardy":"Under","Tank":"Under","Samson":"Over","Bronson":"Under","Tom":"Under","Chode":"Under","Justin":"Under","Jeza":"Under"}},
  {"team": "Miami Heat", "line": 46.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Under","Bronson":"Under","Tom":"Over","Chode":"Under","Justin":"Over","Jeza":"Under"}},
  {"team": "Milwaukee Bucks", "line": 25.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Under","Bronson":"Under","Tom":"Under","Chode":"Over","Justin":"Under","Jeza":"Under"}},
  {"team": "Minnesota Timberwolves", "line": 47.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Over","Jeza":"Over"}},
  {"team": "New Orleans Pelicans", "line": 28.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Over","Bronson":"Over","Tom":"Under","Chode":"Under","Justin":"Over","Jeza":"Under"}},
  {"team": "New York Knicks", "line": 51.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Under","Tank":"Over","Samson":"Under","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Under"}},
  {"team": "Oklahoma City Thunder", "line": 61.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Under","Samson":"Over","Bronson":"Under","Tom":"Over","Chode":"Over","Justin":"Over","Jeza":"Over"}},
  {"team": "Orlando Magic", "line": 43.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Under","Tank":"Under","Samson":"Over","Bronson":"Over","Tom":"Under","Chode":"Under","Justin":"Over","Jeza":"Over"}},
  {"team": "Philadelphia 76ers", "line": 49.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Under","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Under"}},
  {"team": "Phoenix Suns", "line": 38.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Over","Bronson":"Under","Tom":"Over","Chode":"Under","Justin":"Under","Jeza":"Under"}},
  {"team": "Portland Trail Blazers", "line": 41.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Under","Samson":"Under","Bronson":"Over","Tom":"Under","Chode":"Under","Justin":"Over","Jeza":"Over"}},
  {"team": "Sacramento Kings", "line": 20.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Under","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Over"}},
  {"team": "San Antonio Spurs", "line": 60.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Under","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Over"}},
  {"team": "Toronto Raptors", "line": 46.5, "picks": {"Ed":"Over","Cory":"Over","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Under","Chode":"Over","Justin":"Over","Jeza":"Under"}},
  {"team": "Utah Jazz", "line": 37.5, "picks": {"Ed":"Over","Cory":"Under","Beardy":"Over","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Over","Chode":"Over","Justin":"Under","Jeza":"Over"}},
  {"team": "Washington Wizards", "line": 34.5, "picks": {"Ed":"Under","Cory":"Under","Beardy":"Under","Tank":"Over","Samson":"Over","Bronson":"Over","Tom":"Under","Chode":"Under","Justin":"Under","Jeza":"Under"}}
];

// Official NBA IDs, ESPN Abbreviations, Conferences, and Early-Season (Day 2) Fallback Records
export const TEAM_METADATA = {
  "Atlanta Hawks": { abbr: "ATL", nbaId: 1610612737, espnSlug: "atl", conf: "East", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Boston Celtics": { abbr: "BOS", nbaId: 1610612738, espnSlug: "bos", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Brooklyn Nets": { abbr: "BKN", nbaId: 1610612751, espnSlug: "bkn", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Charlotte Hornets": { abbr: "CHA", nbaId: 1610612766, espnSlug: "cha", conf: "East", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Chicago Bulls": { abbr: "CHI", nbaId: 1610612741, espnSlug: "chi", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Cleveland Cavaliers": { abbr: "CLE", nbaId: 1610612739, espnSlug: "cle", conf: "East", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Dallas Mavericks": { abbr: "DAL", nbaId: 1610612742, espnSlug: "dal", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Denver Nuggets": { abbr: "DEN", nbaId: 1610612743, espnSlug: "den", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Detroit Pistons": { abbr: "DET", nbaId: 1610612765, espnSlug: "det", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Golden State Warriors": { abbr: "GSW", nbaId: 1610612744, espnSlug: "gs", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Houston Rockets": { abbr: "HOU", nbaId: 1610612745, espnSlug: "hou", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Indiana Pacers": { abbr: "IND", nbaId: 1610612754, espnSlug: "ind", conf: "East", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Los Angeles Clippers": { abbr: "LAC", nbaId: 1610612746, espnSlug: "lac", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Los Angeles Lakers": { abbr: "LAL", nbaId: 1610612747, espnSlug: "lal", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Memphis Grizzlies": { abbr: "MEM", nbaId: 1610612763, espnSlug: "mem", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Miami Heat": { abbr: "MIA", nbaId: 1610612748, espnSlug: "mia", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Milwaukee Bucks": { abbr: "MIL", nbaId: 1610612749, espnSlug: "mil", conf: "East", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Minnesota Timberwolves": { abbr: "MIN", nbaId: 1610612750, espnSlug: "min", conf: "West", sampleWins: 1, sampleLosses: 1, sampleStreak: "W1" },
  "New Orleans Pelicans": { abbr: "NOP", nbaId: 1610612740, espnSlug: "no", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "New York Knicks": { abbr: "NYK", nbaId: 1610612752, espnSlug: "ny", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Oklahoma City Thunder": { abbr: "OKC", nbaId: 1610612760, espnSlug: "okc", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Orlando Magic": { abbr: "ORL", nbaId: 1610612753, espnSlug: "orl", conf: "East", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Philadelphia 76ers": { abbr: "PHI", nbaId: 1610612755, espnSlug: "phi", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Phoenix Suns": { abbr: "PHX", nbaId: 1610612756, espnSlug: "phx", conf: "West", sampleWins: 1, sampleLosses: 0, sampleStreak: "W1" },
  "Portland Trail Blazers": { abbr: "POR", nbaId: 1610612757, espnSlug: "por", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Sacramento Kings": { abbr: "SAC", nbaId: 1610612758, espnSlug: "sac", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "San Antonio Spurs": { abbr: "SAS", nbaId: 1610612759, espnSlug: "sa", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Toronto Raptors": { abbr: "TOR", nbaId: 1610612761, espnSlug: "tor", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Utah Jazz": { abbr: "UTA", nbaId: 1610612762, espnSlug: "utah", conf: "West", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" },
  "Washington Wizards": { abbr: "WAS", nbaId: 1610612764, espnSlug: "wsh", conf: "East", sampleWins: 0, sampleLosses: 1, sampleStreak: "L1" }
};
