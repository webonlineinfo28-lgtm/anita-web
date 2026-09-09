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

// Variantes con opacidad para backgrounds y bordes.
// Robusta: valida el hex y el alfa; nunca lanza ni devuelve NaN.
export const colorWithAlpha = (hex, alpha) => {
  const fallback = "rgba(236, 72, 153, 0.2)";
  if (typeof hex !== "string") return fallback;
  const m = hex.trim().match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = typeof alpha === "number" && Number.isFinite(alpha)
    ? Math.min(1, Math.max(0, alpha))
    : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
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
