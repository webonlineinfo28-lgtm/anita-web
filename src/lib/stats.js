// ---------------------------------------------------------------------------
// Sistema de FAMA: XP, niveles e insignias coleccionables.
// Los iconos son CLAVES de resolución (no emojis/placeholders): el componente
// StatIcon mapea cada clave a un icono lucide. Esto evita datos corruptos y
// permite cambiar el arte gráfico en un solo sitio.
// ---------------------------------------------------------------------------

import { COLORS } from "./colors.js";

export const XP_EVENTS = {
  bingo: 150,
  line: 60,
  songAdded: 10,
  djSet: 20,
  reactionReceived: 5,
};

// Niveles cósmicos. `icon` es una clave resuelta por <StatIcon/>.
export const LEVEL_TITLES = [
  { level: 1, minXp: 0,     title: "Novato Cósmico",      icon: "sparkle" },
  { level: 2, minXp: 200,   title: "Casual Festivo",      icon: "music"   },
  { level: 3, minXp: 500,   title: "Farandulero",         icon: "mic"     },
  { level: 4, minXp: 1000,  title: "Estrella de la Noche",icon: "star"    },
  { level: 5, minXp: 2000,  title: "Ídolo Galáctico",     icon: "crown"   },
  { level: 6, minXp: 4000,  title: "Supernova",           icon: "flame"   },
  { level: 7, minXp: 7000,  title: "Leyenda del Festival",icon: "trophy"  },
];

export const BADGES = [
  { id: "first-bingo", name: "Primer Bingo",        desc: "Consigue tu primer bingo",            icon: "ticket", color: COLORS.pink, check: (s) => s.bingos >= 1 },
  { id: "bingo-10",    name: "Bingo Master",        desc: "10 bingos en tu historial",          icon: "ticket", color: COLORS.amber, check: (s) => s.bingos >= 10 },
  { id: "first-line",  name: "Línea Fatal",         desc: "Completa tu primera línea",          icon: "zap",    color: COLORS.purple, check: (s) => s.lines >= 1 },
  { id: "dj-debut",    name: "DJ Debut",            desc: "Pon tu primera canción en la cabina",icon: "disc",   color: COLORS.cyan, check: (s) => s.djSets >= 1 },
  { id: "five-sets",   name: "Set de Lujo",         desc: "5 sets de DJ",                       icon: "disc",   color: COLORS.emerald, check: (s) => s.djSets >= 5 },
  { id: "promotor",    name: "Promotor",            desc: "Añade 5 canciones a la fiesta",      icon: "plus",   color: COLORS.amber, check: (s) => s.songsAdded >= 5 },
  { id: "favorite",    name: "Muy Querido",         desc: "10 reacciones recibidas",            icon: "heart",  color: COLORS.pink, check: (s) => s.reactionsReceived >= 10 },
  { id: "star-1000",   name: "Estrella",            desc: "Alcanzaste 1.000 XP",                icon: "star",   color: COLORS.amber, check: (s) => s.xp >= 1000 },
  { id: "cosmic-legend", name: "Leyenda Cósmica",   desc: "Alcanzaste 5.000 XP",                icon: "crown",  color: COLORS.purple, check: (s) => s.xp >= 5000 },
];

export function createStats() {
  return { xp: 0, bingos: 0, lines: 0, songsAdded: 0, djSets: 0, reactionsReceived: 0, badges: [] };
}

export function levelFromXp(xp) {
  let current = LEVEL_TITLES[0];
  for (const lvl of LEVEL_TITLES) if (xp >= lvl.minXp) current = lvl;
  const idx = LEVEL_TITLES.indexOf(current);
  const next = idx < LEVEL_TITLES.length - 1 ? LEVEL_TITLES[idx + 1] : null;
  return { ...current, next };
}

export function levelProgress(xp) {
  const lvl = levelFromXp(xp);
  const currentMin = lvl.minXp;
  const nextMin = lvl.next ? lvl.next.minXp : currentMin + 1000;
  const pct = nextMin > currentMin ? Math.min(100, Math.round(((xp - currentMin) / (nextMin - currentMin)) * 100)) : 100;
  return { ...lvl, xp, currentMin, nextMin, pct };
}

function newBadges(stats) {
  return BADGES.filter((b) => !stats.badges.includes(b.id) && b.check(stats));
}

export function recordEvent(stats, eventType) {
  const next = { ...stats, badges: [...stats.badges] };
  switch (eventType) {
    case "bingo":      next.bingos += 1; break;
    case "line":       next.lines += 1; break;
    case "songAdded":  next.songsAdded += 1; break;
    case "djSet":      next.djSets += 1; break;
    case "reactionReceived": next.reactionsReceived += 1; break;
    default: return stats;
  }
  next.xp += XP_EVENTS[eventType] || 0;
  next.badges.push(...newBadges(next).map((b) => b.id));
  return next;
}

export function addXp(statsMap, user, eventType) {
  const key = String(user || "Anónimo");
  const current = statsMap?.[key] ? { ...statsMap[key] } : createStats();
  const updated = recordEvent(current, eventType);
  const next = { ...(statsMap || {}) };
  next[key] = updated;
  return next;
}
