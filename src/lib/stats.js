// Sistema de FAMA: XP, niveles y insignias coleccionables.

export const XP_EVENTS = {
  bingo: 150,
  line: 60,
  songAdded: 10,
  djSet: 20,
  reactionReceived: 5,
};

// Niveles cósmicos con sus títulos.
export const LEVEL_TITLES = [
  { level: 1, minXp: 0, title: "Novato Cósmico", icon: "🍼" },
  { level: 2, minXp: 200, title: "Casual Festivo", icon: "🧃" },
  { level: 3, minXp: 500, title: "Farandulero", icon: "🎉" },
  { level: 4, minXp: 1000, title: "Estrella de la Noche", icon: "⭐" },
  { level: 5, minXp: 2000, title: "Ídolo Galáctico", icon: "🌟" },
  { level: 6, minXp: 4000, title: "Supernova", icon: "💫" },
  { level: 7, minXp: 7000, title: "Leyenda del Festival", icon: "👑" },
];

export const BADGES = [
  { id: "first-bingo", name: "Primer Bingo", desc: "Consigue tu primer bingo", icon: "🎯", check: (s) => s.bingos >= 1 },
  { id: "bingo-10", name: "Bingo Master", desc: "10 bingos en tu historial", icon: "🏆", check: (s) => s.bingos >= 10 },
  { id: "dea-line", name: "Línea Fatal", desc: "Completa tu primera línea", icon: "📏", check: (s) => s.lines >= 1 },
  { id: "dj-debut", name: "De DJ Debut", desc: "Pon tu primera canción en la cabina", icon: "🎧", check: (s) => s.djSets >= 1 },
  { id: "five-sets", name: "Set de Lujo", desc: "5 sets de DJ", icon: "🎛️", check: (s) => s.djSets >= 5 },
  { id: "promotor", name: "Promotor", desc: "Añade 5 canciones a la fiesta", icon: "📣", check: (s) => s.songsAdded >= 5 },
  { id: "favorite", name: "Muy Querido", desc: "10 reacciones recibidas", icon: "💖", check: (s) => s.reactionsReceived >= 10 },
  { id: "star-1000", name: "Estrella", desc: "Alcanza 1.000 XP", icon: "✨", check: (s) => s.xp >= 1000 },
  { id: "cosmic-legend", name: "Leyenda Cósmica", desc: "Alcanza 5.000 XP", icon: "🌌", check: (s) => s.xp >= 5000 },
];

export function createStats() {
  return {
    xp: 0,
    bingos: 0,
    lines: 0,
    songsAdded: 0,
    djSets: 0,
    reactionsReceived: 0,
    badges: [],
  };
}

// Devuelve el nivel y su título según el XP acumulado.
export function levelFromXp(xp) {
  let current = LEVEL_TITLES[0];
  let next = null;
  for (const lvl of LEVEL_TITLES) {
    if (xp >= lvl.minXp) current = lvl;
  }
  const idx = LEVEL_TITLES.indexOf(current);
  next = idx < LEVEL_TITLES.length - 1 ? LEVEL_TITLES[idx + 1] : null;
  return { ...current, next };
}

export function levelProgress(xp) {
  const lvl = levelFromXp(xp);
  const currentMin = lvl.minXp;
  const nextMin = lvl.next ? lvl.next.minXp : currentMin + 1000;
  const pct =
    nextMin > currentMin
      ? Math.min(100, Math.round(((xp - currentMin) / (nextMin - currentMin)) * 100))
      : 100;
  return { ...lvl, xp, currentMin, nextMin, pct };
}

// Insignias ganadas que el usuario aún no tenía.
function newBadges(stats) {
  return BADGES.filter((b) => !stats.badges.includes(b.id) && b.check(stats));
}

// Aplica un evento y devuelve las stats actualizadas (nuevas insignias incluidas).
export function recordEvent(stats, eventType) {
  const next = { ...stats, badges: [...stats.badges] };

  switch (eventType) {
    case "bingo":
      next.bingos += 1;
      break;
    case "line":
      next.lines += 1;
      break;
    case "songAdded":
      next.songsAdded += 1;
      break;
    case "djSet":
      next.djSets += 1;
      break;
    case "reactionReceived":
      next.reactionsReceived += 1;
      break;
    default:
      return stats;
  }
  next.xp += XP_EVENTS[eventType] || 0;
  next.badges.push(...newBadges(next).map((b) => b.id));
  return next;
}

// Registra un evento para un usuario dentro del mapa { user: stats }.
export function addXp(statsMap, user, eventType) {
  const key = String(user || "Anónimo");
  const current = statsMap?.[key] ? { ...statsMap[key] } : createStats();
  const updated = recordEvent(current, eventType);
  const next = { ...(statsMap || {}) };
  next[key] = updated;
  return next;
}