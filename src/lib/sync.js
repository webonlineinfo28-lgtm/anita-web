// ---------------------------------------------------------------------------
// Capa de sincronización del festival.
//
// - TRANSPORTE LOCAL (siempre disponible, sin coste): localStorage + evento
//   "storage". Sincroniza pestañas/ventanas del MISMO navegador al instante.
//
// - TRANSPORTE SUPABASE (opcional, gratis): si defines VITE_SUPABASE_URL y
//   VITE_SUPABASE_ANON_KEY en tu .env, sincroniza entre CUALQUIER dispositivo
//   usando la API REST de Supabase (PostgREST) directamente con fetch().
//
// - CANAL HÍBRIDO: la app usa createChannel(storageKey, remoteRowId). Escribe
//   SIEMPRE en localStorage y, si hay claves configuradas, también en la fila
//   remota (rowId) de la tabla `festival_state`. Hace polling del remoto cada
//   3 s y fusiona (merge) los estados por clave para no pisar campos.
//
// Sin claves => la app funciona igual solo con el transporte local.
// ---------------------------------------------------------------------------

import { STORAGE_KEYS } from "./constants.js";

const SUPABASE_POLL_MS = 3000;
const SUPABASE_DEBOUNCE_MS = 400;

function safeJSONParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ---- Utilidades de merge (puras y testeables) -------------------------------

// Deduplica una lista de ítems que tengan `.id`.
export function dedupById(items) {
  const seen = new Set();
  const out = [];
  for (const item of items || []) {
    if (!item) continue;
    const key = item.id ?? JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// Deduplica una lista de usuarios por `user` (los ítems sin user se conservan).
export function dedupByUser(items) {
  const seen = new Set();
  const out = [];
  for (const item of items || []) {
    if (!item) continue;
    const key = typeof item === "string" ? item : item.user ?? null;
    if (key !== null) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(item);
  }
  return out;
}

// Deduplica números manteniendo el orden.
export function dedupNumbers(nums) {
  const seen = new Set();
  const out = [];
  for (const n of nums || []) {
    if (typeof n !== "number" || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

// Fusiona dos objetos de estado del mismo dominio. Los arrays con identidad
// fuerte (mensajes/canciones) se deduplican; los mapas por usuario se fusionan
// campo a campo.
export function mergeDomainStates(local, remote) {
  const base = { ...(local || {}), ...(remote || {}) };

  // Mensajes: dedup por id.
  if (Array.isArray(base.messages)) base.messages = dedupById(base.messages);
  // Playlist e historial: dedup por id.
  if (Array.isArray(base.playlist)) base.playlist = dedupById(base.playlist);
  if (Array.isArray(base.history)) base.history = dedupById(base.history);
  // Waitlist: dedup por usuario.
  if (Array.isArray(base.waitlist)) base.waitlist = dedupByUser(base.waitlist);
  // Bingo: números sin repetir, en orden.
  if (Array.isArray(base.drawnNumbers)) base.drawnNumbers = dedupNumbers(base.drawnNumbers);
  // Ganadores: dedup por id.
  if (Array.isArray(base.winners)) base.winners = dedupById(base.winners);

  return base;
}

// Fusiona un mapa { usuario -> valor } (avatar config o stats) con el remoto.
export function mergeUserMaps(local, remote) {
  const out = {};
  for (const [k, v] of Object.entries(local || {})) {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      const base = { ...out[k], ...v };
      out[k] = base;
    } else {
      out[k] = v;
    }
  }
  for (const [k, v] of Object.entries(remote || {})) {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out[k] = { ...out[k], ...v };
    } else {
      out[k] = v;
    }
  }
  return out;
}
// ---- Transporte local (pestañas del mismo navegador) -----------------------
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

// ---- Transporte remoto vía Supabase REST (sin SDK) -------------------------
// Se activa solo si hay claves. Cada dominio usa su propia fila `rowId`.
function makeSupabaseTransport(url, anonKey, rowId) {
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
  let debounceTimer = null;

  const fetchOnce = async () => {
    const res = await fetch(
      `${endpoint}?id=eq.${rowId}&select=state`,
      { headers },
    );
    if (!res.ok) throw new Error(`Supabase GET ${res.status}`);
    const rows = await res.json();
    return rows?.[0]?.state ?? null;
  };

  const pushOnce = async (state) => {
    const res = await fetch(`${endpoint}?id=eq.${rowId}`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id: rowId,
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
        console.warn("Supabase poll falló (se reintentará):", e.message);
      } finally {
        polling = false;
      }
    }, SUPABASE_POLL_MS);
  };

  let disposed = false;
  fetchOnce()
    .then((remote) => {
      if (disposed || !remote) return;
      last = remote;
      listeners.forEach((fn) => fn(remote));
    })
    .catch(() => {
      /* sin conexión inicial: se reintenta por polling */
    });

  startPolling();

  return {
    kind: "supabase",
    snapshot: () => last,
    push(state) {
      last = state;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        pushOnce(state).catch((e) =>
          console.warn("Supabase push falló (se reintentará):", e.message),
        );
      }, SUPABASE_DEBOUNCE_MS);
    },
    onState(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      disposed = true;
      if (timer) clearInterval(timer);
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}
// ---- Canal híbrido: local + remoto opcional --------------------------------
// API idéntica a los transportes anteriores: snapshot / push / onState / dispose.
export function createChannel(storageKey, remoteRowId) {
  const listeners = new Set();
  let last = null;
  let lastJson = "";

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) last = JSON.parse(raw);
  } catch {
    last = null;
  }
  if (last) lastJson = JSON.stringify(last);

  // Escucha los cambios de OTRA pestaña del mismo navegador.
  const onStorage = (e) => {
    if (e.key !== storageKey) return;
    try {
      const state = e.newValue ? JSON.parse(e.newValue) : null;
      if (!state) return;
      const json = JSON.stringify(state);
      if (json === lastJson) return; // eco del propio push
      lastJson = json;
      last = state;
      listeners.forEach((fn) => fn(state));
    } catch {
      /* payload corrupto: ignorar */
    }
  };
  window.addEventListener("storage", onStorage);

  const push = (next) => {
    // Merge con el estado previo conocido: los hooks pueden emitir patches
    // parciales (p.ej. { messages: [...] }) y el canal siempre guarda un
    // estado COMPLETO para que la fila remota no pierda campos.
    const merged = mergeDomainStates(last || {}, next);
    last = merged;
    lastJson = JSON.stringify(merged);
    try {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch (e) {
      console.error("Error persistiendo", storageKey, e);
    }
    remote?.push(merged);
  };

  // Transporte remoto opcional (misma fila en Supabase). El canal es híbrido:
  // sin claves o sin rowId se comporta exactamente como el canal local de antes.
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  let remote = null;
  if (url && anonKey && remoteRowId) {
    try {
      remote = makeSupabaseTransport(url, anonKey, remoteRowId);
    } catch (e) {
      console.warn("Supabase no disponible, modo local:", e.message);
    }
  }

  // Cuando llega un estado remoto (otro dispositivo), fusionar con el local
  // y avisar a los listeners. El guard anti-eco evita re-aplicar lo propio.
  const unsubRemote = remote?.onState((remoteState) => {
    if (!remoteState) return;
    const merged = mergeDomainStates(last || {}, remoteState);
    const json = JSON.stringify(merged);
    if (json === lastJson) return; // sin cambios reales
    lastJson = json;
    last = merged;
    listeners.forEach((fn) => fn(merged));
  });

  return {
    kind: remote ? "hybrid" : "local",
    snapshot: () => last,
    push,
    onState(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      window.removeEventListener("storage", onStorage);
      unsubRemote?.();
      remote?.dispose?.();
    },
  };
}

// Compatibilidad: transporte del bingo (fila `main`). Ahora es el canal
// híbrido, síncrono y envuelto en Promise para no romper a quien lo espera.
export async function createSyncTransport() {
  return createChannel(STORAGE_KEYS.sharedState, "main");
}

// Canal local genérico para compartición entre pestañas (legacy). Se mantiene
// por compatibilidad con imports existentes; se recomienda createChannel().
export function createLocalChannel(storageKey) {
  return createChannel(storageKey, null);
}