// ---------------------------------------------------------------------------
// Capa de sincronizaciÃ³n del festival.
//
// - TRANSPORTE LOCAL (siempre disponible, sin coste): localStorage + evento
//   "storage". Sincroniza pestaÃ±as/ventanas del MISMO navegador al instante y
//   preserva el estado al recargar.
//
// - TRANSPORTE SUPABASE (opcional, gratis): si defines VITE_SUPABASE_URL y
//   VITE_SUPABASE_ANON_KEY en tu .env, sincroniza entre CUALQUIER dispositivo
//   usando la API REST de Supabase (PostgREST) directamente con fetch(),
//   sin SDK ni paquetes extra.
//
// Sin claves => la app funciona igual solo con el transporte local.
// ---------------------------------------------------------------------------

import { STORAGE_KEYS } from "./constants.js";

const SUPABASE_POLL_MS = 3000;

function makeLocalTransport() {
  const listeners = new Set();
  let last = null;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.sharedState);
    if (raw) last = JSON.parse(raw);
  } catch {
    last = null;
  }

  const onStorage = (e) => {
    if (e.key === STORAGE_KEYS.sharedState && e.newValue) {
      try {
        const state = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn(state));
      } catch {
        /* payload corrupto: ignorar */
      }
    }
  };
  window.addEventListener("storage", onStorage);

  return {
    kind: "local",
    snapshot: () => last,
    push(state) {
      try {
        last = state;
        localStorage.setItem(STORAGE_KEYS.sharedState, JSON.stringify(state));
      } catch (e) {
        console.error("Error persistiendo el estado del bingo:", e);
      }
    },
    onState(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      window.removeEventListener("storage", onStorage);
    },
  };
}

// Transporte opcional vÃ­a Supabase REST (sin SDK). No se activa si faltan
// las claves. El creador de la tabla estÃ¡ documentado en el README.
function makeSupabaseTransport(url, anonKey) {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/festival_state`;
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  };
  const listeners = new Set();
  let last = null;
  let timer = null;
  let polling = false;

  const fetchOnce = async () => {
    const res = await fetch(
      `${endpoint}?id=eq.main&select=state`,
      { headers },
    );
    if (!res.ok) throw new Error(`Supabase GET ${res.status}`);
    const rows = await res.json();
    return rows?.[0]?.payload ?? null;
  };

  const pushOnce = async (state) => {
    const res = await fetch(`${endpoint}?id=eq.main`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id: "main",
        state: state,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`Supabase POST ${res.status}`);
  };

  const startPolling = () => {
    timer = setInterval(async () => {
      if (polling) return;
      polling = true;
      try {
        const remote = await fetchOnce();
        if (remote) {
          const json = JSON.stringify(remote);
          if (json !== JSON.stringify(last)) {
            last = remote;
            listeners.forEach((fn) => fn(remote));
          }
        }
      } catch (e) {
        console.warn("Supabase poll fallÃ³ (se reintentarÃ¡):", e.message);
      } finally {
        polling = false;
      }
    }, SUPABASE_POLL_MS);
  };

  // Primer fetch de arranque (no bloquea).
  let disposed = false;
  fetchOnce()
    .then((remote) => {
      if (disposed || !remote) return;
      last = remote;
      listeners.forEach((fn) => fn(remote));
    })
    .catch(() => {
      /* sin conexiÃ³n inicial: se reintenta por polling */
    });

  startPolling();

  return {
    kind: "supabase",
    snapshot: () => last,
    push(state) {
      last = state;
      pushOnce(state).catch((e) =>
        console.warn("Supabase push fallÃ³ (se reintentarÃ¡):", e.message),
      );
    },
    onState(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      disposed = true;
      if (timer) clearInterval(timer);
    },
  };
}

// Devuelve el transporte adecuado segÃºn el entorno.
export async function createSyncTransport() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      return makeSupabaseTransport(url, anonKey);
    } catch (e) {
      console.warn("Supabase no disponible, usando transporte local:", e.message);
    }
  }
  return makeLocalTransport();
}

// Canal local genÃ©rico para comparticiÃ³n entre pestaÃ±as de CUALQUIER clave
// (usado por el estado de la sala: chat, lista de espera, reacciones, fame).
// La firma es igual que la del transporte del bingo: snapshot/push/onState.
export function createLocalChannel(storageKey) {
  const listeners = new Set();
  let last = null;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) last = JSON.parse(raw);
  } catch {
    last = null;
  }

  const onStorage = (e) => {
    if (e.key === storageKey && e.newValue) {
      try {
        const state = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn(state));
      } catch {
        /* payload corrupto: ignorar */
      }
    }
  };
  window.addEventListener("storage", onStorage);

  return {
    kind: "local",
    snapshot: () => last,
    push(state) {
      try {
        last = state;
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.error("Error persistiendo", storageKey, e);
      }
    },
    onState(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      window.removeEventListener("storage", onStorage);
    },
  };
}