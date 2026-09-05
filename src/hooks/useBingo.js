import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  checkWin,
  drawNextNumber,
  generateBingoCard,
} from "../lib/bingo-core.js";
import {
  STORAGE_KEYS,
  PAUSE_AFTER_WIN_MS,
  DRAW_INTERVAL_MS,
} from "../lib/constants.js";
import { createSyncTransport } from "../lib/sync.js";

// --- Acceso seguro a localStorage (no rompe si está bloqueado) ---
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error al guardar:", key, e);
  }
};

const getCurrentUser = () =>
  readJSON(STORAGE_KEYS.session, null)?.user?.trim() || "Anónimo";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

// Obtiene (crea o migra) el cartón permanente del usuario.
function loadUserCard(user) {
  const cards = readJSON(STORAGE_KEYS.userCards, {});

  // Migración: el bug antiguo guardó todos los cartones bajo la clave "undefined".
  if (!cards[user] && cards["undefined"]) {
    cards[user] = { ...cards["undefined"] };
    delete cards["undefined"];
    console.info("Cartón heredado del modo 'undefined' migrado a", user);
  }

  if (!cards[user] || !Array.isArray(cards[user].card)) {
    cards[user] = {
      card: generateBingoCard(),
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };
  } else {
    cards[user].lastUsed = Date.now();
  }
  writeJSON(STORAGE_KEYS.userCards, cards);
  return cards[user].card;
}

function saveCardForUser(user, card) {
  const cards = readJSON(STORAGE_KEYS.userCards, {});
  cards[user] = { card, createdAt: Date.now(), lastUsed: Date.now() };
  writeJSON(STORAGE_KEYS.userCards, cards);
}

function generateGameId() {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  writeJSON(STORAGE_KEYS.currentGame, id);
  return id;
}

function getCurrentGameId() {
  const saved = readJSON(STORAGE_KEYS.currentGame, null);
  return saved || generateGameId();
}

// --- Ranking de ganadores (local + contadores permanentes) ---
function persistWinner(user, winType, gameId, currentWinners) {
  const already = currentWinners.some(
    (w) => w.gameId === gameId && w.user === user && w.winType === winType,
  );
  if (already) return currentWinners;

  const entry = {
    user,
    winType,
    timestamp: Date.now(),
    id: newId(),
    gameId,
  };
  const next = [...currentWinners, entry].slice(-10);
  writeJSON(STORAGE_KEYS.winners, next);

  if (winType === "bingo") {
    const counts = readJSON(STORAGE_KEYS.permanentCounts, {});
    counts[user] = (counts[user] || 0) + 1;
    writeJSON(STORAGE_KEYS.permanentCounts, counts);
  }
  return next;
}

// --- Sonidos del bombo (WebAudio, sin ficheros externos) ---
function makeSoundBox() {
  let ctx = null;

  const ensure = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  };

  const tone = (freq, start, dur, type = "sine", gain = 0.12) => {
    const c = ensure();
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + start);
      g.gain.setValueAtTime(0.0001, c.currentTime + start);
      g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
      osc.connect(g).connect(c.destination);
      osc.start(c.currentTime + start);
      osc.stop(c.currentTime + start + dur + 0.05);
    } catch {
      /* silencio ante cualquier error de audio */
    }
  };

  return {
    unlock() {
      ensure();
    },
    blip() {
      tone(660 + Math.random() * 120, 0, 0.12, "sine", 0.1);
    },
    win(isBingo) {
      if (isBingo) {
        // Fanfarria ascendente
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          tone(f, i * 0.14, 0.3, "triangle", 0.16),
        );
      } else {
        [659.25, 783.99].forEach((f, i) =>
          tone(f, i * 0.12, 0.22, "triangle", 0.14),
        );
      }
    },
  };
}

// ===========================================================================
// HOOK PRINCIPAL DEL BINGO
// ===========================================================================
export function useBingo() {
  const user = getCurrentUser();

  // ---- Estado local ----
  const [card, setCard] = useState(() => loadUserCard(user));
  const [drawnNumbers, setDrawnNumbers] = useState(() => {
    const shared = readJSON(STORAGE_KEYS.sharedState, null);
    return Array.isArray(shared?.drawnNumbers) ? shared.drawnNumbers : [];
  });
  const [isBomboRunning, setIsBomboRunning] = useState(() => {
    const shared = readJSON(STORAGE_KEYS.sharedState, null);
    return Boolean(shared?.isBomboRunning);
  });
  const [winStatus, setWinStatus] = useState(null);
  const [winners, setWinners] = useState(() => readJSON(STORAGE_KEYS.winners, []));
  const [permanentCounts, setPermanentCounts] = useState(() =>
    readJSON(STORAGE_KEYS.permanentCounts, {}),
  );
  const [gameId, setGameId] = useState(() => getCurrentGameId());

  // ---- Refs ----
  const lastWinRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const transportRef = useRef(null);
  const lastAppliedJsonRef = useRef(""); // guard de eco remoto
  const soundRef = useRef(makeSoundBox());
  const isHostRef = useRef(false);

  // Copia del estado actual de bolas para uso seguro en el intervalo.
  const drawnRef = useRef(drawnNumbers);
  useEffect(() => {
    drawnRef.current = drawnNumbers;
  }, [drawnNumbers]);

  // El usuario actual puede variar; lo mantenemos en un ref para timers.
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // App informa al hook si la sesión es la del host (quien controla el bombo).
  const setHostRole = useCallback((isHost) => {
    isHostRef.current = isHost;
  }, []);

  const pushState = useCallback((stateToPush) => {
    transportRef.current?.push(stateToPush);
  }, []);

  // ---- Sincronización: transporte local y/o Supabase ----
  useEffect(() => {
    let disposed = false;
    let unsubscribe = null;

    createSyncTransport().then((transport) => {
      if (disposed) {
        transport.dispose?.();
        return;
      }
      transportRef.current = transport;

      // Estado inicial desde otra fuente de verdad (p.ej. otra pestaña abierta).
      const snapshot = transport.snapshot?.();
      if (snapshot) {
        const json = JSON.stringify(snapshot);
        if (json !== lastAppliedJsonRef.current) {
          lastAppliedJsonRef.current = json;
          if (Array.isArray(snapshot.drawnNumbers))
            setDrawnNumbers(snapshot.drawnNumbers);
          if (typeof snapshot.isBomboRunning === "boolean")
            setIsBomboRunning(snapshot.isBomboRunning);
          if (snapshot.winStatus) setWinStatus(snapshot.winStatus);
        }
      }

      unsubscribe = transport.onState((remote) => {
        if (!remote) return;
        const json = JSON.stringify(remote);
        if (json === lastAppliedJsonRef.current) return; // eco del propio push
        lastAppliedJsonRef.current = json;

        if (Array.isArray(remote.drawnNumbers)) setDrawnNumbers(remote.drawnNumbers);
        if (typeof remote.isBomboRunning === "boolean")
          setIsBomboRunning(remote.isBomboRunning);
        if (remote.winStatus) setWinStatus(remote.winStatus);
        if (Array.isArray(remote.winners) && remote.winners.length)
          setWinners(remote.winners);
        if (remote.permanentCounts) setPermanentCounts(remote.permanentCounts);
      });
    });

    return () => {
      disposed = true;
      unsubscribe?.();
      transportRef.current?.dispose?.();
      transportRef.current = null;
    };
  }, []);

  // ---- Emisión de cambios al transporte ----
  useEffect(() => {
    const payload = {
      drawnNumbers,
      isBomboRunning,
      winStatus,
      winners: winners.slice(-10),
      permanentCounts,
    };
    pushState(payload);
  }, [drawnNumbers, isBomboRunning, winStatus, winners, permanentCounts, pushState]);

  // ---- Bombo: extracción automática sin repetidos ----
  useEffect(() => {
    if (!isBomboRunning) return undefined;
    if (drawnNumbers.length >= 75) {
      setIsBomboRunning(false);
      return undefined;
    }

    const interval = setInterval(() => {
      const current = drawnRef.current;
      if (current.length >= 75) return;
      const next = drawNextNumber(current);
      if (next === null) return;
      // Avance optimista del ref + sonido fuera del updater (seguro en StrictMode).
      drawnRef.current = [next, ...current];
      soundRef.current.blip();
      setDrawnNumbers([next, ...current]);
    }, DRAW_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isBomboRunning, drawnNumbers.length >= 75]);

  // ---- Detección de victorias ----
  useEffect(() => {
    if (!drawnNumbers.length) return;

    const wins = checkWin(card, drawnNumbers);
    const prev = lastWinRef.current;
    lastWinRef.current = wins;

    // BINGO (máxima prioridad)
    if (wins.bingo) {
      if (prev?.bingo) return;
      celebrate("bingo", wins);
      return;
    }

    // Primera línea completada
    if (wins.hasLine && !prev?.hasLine) {
      celebrate("line", wins);
    }
  }, [drawnNumbers, card]);

  function celebrate(type, wins) {
    const me = userRef.current;
    const isHost = isHostRef.current;
    setWinStatus({
      type,
      timestamp: Date.now(),
      lines: type === "line" ? wins.lines : undefined,
    });
    // Solo el host detiene el bombo compartido; los invitados celebran solos.
    if (isHost) setIsBomboRunning(false);

    clearTimeout(resumeTimerRef.current);
    soundRef.current.win(type === "bingo");

    // Aviso a la App para que sume fama al ganador.
    try {
      window.dispatchEvent(
        new CustomEvent("anita-bingo-event", { detail: { type, user: me } }),
      );
    } catch {
      /* CustomEvent no disponible (SSR/tests): ignorar */
    }

    confetti({
      particleCount: type === "bingo" ? 220 : 90,
      spread: type === "bingo" ? 110 : 70,
      colors: ["#ec4899", "#8b5cf6", "#f472b6", "#fbbf24", "#34d399"],
      origin: { x: 0.5, y: 0.4 },
      scalar: 1.3,
      ticks: type === "bingo" ? 240 : 120,
    });

    // Registrar en el ranking (una vez por usuario/tipo/partida).
    setWinners((prevWinners) =>
      persistWinner(me, type, gameId, prevWinners),
    );

    if (!isHost) return;

    if (type === "line") {
      // Tras 13 s la fiesta continúa solita.
      resumeTimerRef.current = setTimeout(() => {
        setWinStatus(null);
        setIsBomboRunning(true);
      }, PAUSE_AFTER_WIN_MS);
    } else {
      // Tras un bingo, nueva partida automática limpia.
      resetTimerRef.current = setTimeout(() => {
        resetGameInternal(me);
      }, PAUSE_AFTER_WIN_MS);
    }
  }

  const resetGameInternal = useCallback((forUser) => {
    const freshCard = generateBingoCard();
    saveCardForUser(forUser, freshCard);
    setCard(freshCard);
    setDrawnNumbers([]);
    setIsBomboRunning(false);
    setWinStatus(null);
    lastWinRef.current = null;
    setGameId(generateGameId());
  }, []);

  // ---- API pública ----

  const toggleBombo = useCallback(() => {
    soundRef.current.unlock();
    clearTimeout(resumeTimerRef.current);
    setWinStatus(null);
    setIsBomboRunning((prev) => !prev);
  }, []);

  const resetGame = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    clearTimeout(resetTimerRef.current);
    resetGameInternal(userRef.current);
  }, [resetGameInternal]);

  const generateNewCard = useCallback(() => {
    if (drawnNumbers.length > 0) {
      console.info("No se puede cambiar el cartón con la partida empezada");
      return false;
    }
    const freshCard = generateBingoCard();
    saveCardForUser(userRef.current, freshCard);
    setCard(freshCard);
    setWinStatus(null);
    lastWinRef.current = null;
    return true;
  }, [drawnNumbers.length]);

  const resetUserCard = useCallback((username) => {
    const key = (username || "Anónimo").trim() || "Anónimo";
    const freshCard = generateBingoCard();
    saveCardForUser(key, freshCard);

    // Si es nuestro propio cartón, refrescarlo en pantalla.
    if (key === userRef.current) setCard(freshCard);
    return true;
  }, []);

  const checkWinForCard = useCallback((cardToCheck, numbers) => {
    return checkWin(cardToCheck, numbers);
  }, []);

  const syncNow = useCallback(() => {
    pushState({
      drawnNumbers,
      isBomboRunning,
      winStatus,
      winners: winners.slice(-10),
      permanentCounts,
    });
  }, [drawnNumbers, isBomboRunning, winStatus, winners, permanentCounts, pushState]);

  return {
    // Estado
    card,
    drawnNumbers,
    isBomboRunning,
    winStatus,
    winners,
    permanentCounts,
    user,
    gameId,

    // Acciones
    toggleBombo,
    resetGame,
    generateNewCard,
    resetUserCard,
    checkWin: checkWinForCard,
    setHostRole,
    syncNow,
  };
}