// Design System Colors - Referencia centralizada de la paleta Cosmos
// Estos valores deben coincidir con los tokens definidos en styles/tokens.css

export const COLORS = {
  pink: "#ec4899",
  purple: "#a855f7",
  cyan: "#22d3ee",
  amber: "#fbbf24",
  emerald: "#34d399",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  lime: "#a3e635",
  yellow: "#fbbf24",
  red: "#ef4444",
};

// Variantes con opacidad para backgrounds y bordes
export const colorWithAlpha = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Mapeo para reacciones de chat
export const REACTION_COLORS = {
  heart: COLORS.pink,
  star: COLORS.amber,
  zap: COLORS.purple,
  party: COLORS.cyan,
  sparkles: COLORS.emerald,
};

// Mapeo para tipos de toast
export const TOAST_COLORS = {
  success: COLORS.emerald,
  info: COLORS.cyan,
  warning: COLORS.amber,
  levelup: COLORS.amber,
};

// Mapeo para iconos de stats
export const STAT_COLORS = {
  bingos: COLORS.pink,
  lines: COLORS.purple,
  djSets: COLORS.cyan,
  reactionsReceived: COLORS.amber,
};

// Mapeo para categorías de reglas
export const RULE_COLORS = {
  cabina: COLORS.pink,
  bingo: COLORS.purple,
  chat: COLORS.cyan,
  fama: COLORS.amber,
  convivencia: COLORS.emerald,
  host: "#f59e0b",
};
