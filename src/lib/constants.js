// Claves de almacenamiento centralizadas para evitar typos y colisiones.
export const STORAGE_KEYS = {
  session: "anita_session",
  playlist: "anita_playlist",
  history: "anita_history",
  sharedState: "bingo_shared_state",
  winners: "bingo_winners",
  userCards: "bingo_user_cards",
  permanentCounts: "bingo_permanent_counts",
  currentGame: "bingo_current_game",

  // Sala social / Festival 2.0
  avatars: "anita_avatars",
  roomState: "anita_room_state",
  stats: "anita_stats",
};

// Contraseña del admin: definida en .env (VITE_ADMIN_PASSWORD) con fallback.
export const getAdminPassword = () =>
  import.meta.env.VITE_ADMIN_PASSWORD || "uwu.777";

// Nombre sugerido para el host del festival.
export const HOST_USERNAME = "Anita_sorrita";

// Número de segundos que el bombo espera tras una línea/bingo.
export const PAUSE_AFTER_WIN_MS = 13000;
// Intervalo entre bolas del bombo.
export const DRAW_INTERVAL_MS = 3000;