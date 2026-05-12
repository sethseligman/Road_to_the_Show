export type MlbTeam = {
  id: string;
  name: string;
  /** Tailwind background class for a simple “logo tile”. */
  swatch: string;
  /** Primary brand accent for UI bars (hex). */
  accentHex: string;
};

export const MLB_TEAMS: MlbTeam[] = [
  { id: "ARI", name: "Arizona Diamondbacks", swatch: "bg-red-700", accentHex: "#A71930" },
  { id: "ATL", name: "Atlanta Braves", swatch: "bg-red-800", accentHex: "#CE1141" },
  { id: "BAL", name: "Baltimore Orioles", swatch: "bg-orange-700", accentHex: "#DF4601" },
  { id: "BOS", name: "Boston Red Sox", swatch: "bg-red-900", accentHex: "#BD3039" },
  { id: "CHC", name: "Chicago Cubs", swatch: "bg-blue-700", accentHex: "#0E3386" },
  { id: "CWS", name: "Chicago White Sox", swatch: "bg-gray-900", accentHex: "#27251F" },
  { id: "CIN", name: "Cincinnati Reds", swatch: "bg-red-600", accentHex: "#C6011F" },
  { id: "CLE", name: "Cleveland Guardians", swatch: "bg-red-700", accentHex: "#00385D" },
  { id: "COL", name: "Colorado Rockies", swatch: "bg-purple-800", accentHex: "#333366" },
  { id: "DET", name: "Detroit Tigers", swatch: "bg-orange-900", accentHex: "#0C2340" },
  { id: "HOU", name: "Houston Astros", swatch: "bg-orange-600", accentHex: "#EB6E1F" },
  { id: "KC", name: "Kansas City Royals", swatch: "bg-blue-800", accentHex: "#004687" },
  { id: "LAA", name: "Los Angeles Angels", swatch: "bg-red-600", accentHex: "#BA0021" },
  { id: "LAD", name: "Los Angeles Dodgers", swatch: "bg-blue-600", accentHex: "#005A9C" },
  { id: "MIA", name: "Miami Marlins", swatch: "bg-teal-700", accentHex: "#00A3E0" },
  { id: "MIL", name: "Milwaukee Brewers", swatch: "bg-yellow-700", accentHex: "#FFC52F" },
  { id: "MIN", name: "Minnesota Twins", swatch: "bg-blue-900", accentHex: "#002B5C" },
  { id: "NYM", name: "New York Mets", swatch: "bg-orange-500", accentHex: "#FF5910" },
  { id: "NYY", name: "New York Yankees", swatch: "bg-slate-800", accentHex: "#132448" },
  { id: "OAK", name: "Athletics", swatch: "bg-green-800", accentHex: "#003831" },
  { id: "PHI", name: "Philadelphia Phillies", swatch: "bg-red-700", accentHex: "#E81828" },
  { id: "PIT", name: "Pittsburgh Pirates", swatch: "bg-yellow-900", accentHex: "#FDB827" },
  { id: "SD", name: "San Diego Padres", swatch: "bg-yellow-600", accentHex: "#2F241D" },
  { id: "SF", name: "San Francisco Giants", swatch: "bg-orange-700", accentHex: "#FD5A1E" },
  { id: "SEA", name: "Seattle Mariners", swatch: "bg-teal-900", accentHex: "#0C2C56" },
  { id: "STL", name: "St. Louis Cardinals", swatch: "bg-red-800", accentHex: "#C41E3A" },
  { id: "TB", name: "Tampa Bay Rays", swatch: "bg-sky-700", accentHex: "#092C5C" },
  { id: "TEX", name: "Texas Rangers", swatch: "bg-blue-900", accentHex: "#003278" },
  { id: "TOR", name: "Toronto Blue Jays", swatch: "bg-blue-700", accentHex: "#134A8E" },
  { id: "WSH", name: "Washington Nationals", swatch: "bg-red-800", accentHex: "#AB0003" },
];

const DEFAULT_ACCENT = "#132448";

export function teamAccentHex(teamName: string): string {
  const row = MLB_TEAMS.find((t) => t.name === teamName);
  return row?.accentHex ?? DEFAULT_ACCENT;
}
