# 🧠 MEMORIA DEL PROYECTO — Anita Festival 2.0

> Este archivo es la memoria persistente del proyecto. Cada sesión (IA o humana)
> debe leerlo y actualizarlo al terminar. Nada de lo aprendido se pierde.

## 1. Resumen del producto

Sala de fiestas social estilo **plug.dj** con sabor cósmico:
- **Cabina DJ** con lista de espera y rotación automática, sorteo cósmico (host), expulsión de DJs.
- **Avatares procedenciales 100% editables** (SVG sin imágenes, sin texto libre → seguro contra inyección).
- **Chat de sala** con reacciones flotantes (❤️🔥👍😂🤪🥳) y contadores por canción.
- **Bingo compartido**: bombo cada 3s, sin repetidos, para real en la bola 75, línea pausa 13s, BINGO con confeti + fanfarria WebAudio y auto-nueva-partida.
- **Fama**: XP, 7 niveles, 9 insignias. Gana XP por bingo(150), línea(60), canción(10), set de DJ(20), reacción recibida(5).

Stack: **React 18 + Vite 6 + Tailwind 3 + Framer Motion + react-player + canvas-confetti** — 100% cliente, sin backend de pago.

## 2. Comandos del proyecto

```bash
npm install       # primera vez
npm run dev       # desarrollo (http://localhost:5173)
npm run build     # producción → dist/
npm run preview   # servir la build local
npm test          # 27 tests unit (bingo + avatares + cabina + chat + fama)
npx playwright test # tests E2E (requiere dev server)
```

## 3. 🔑 Identificadores críticos (NO perder)

| Elemento | Valor |
| -------- | ----- |
| Repo GitHub | `webonlineinfo28-lgtm/anita-web` |
| Branch principal | `master` |
| Proyecto Vercel ID | `prj_5AhjbJo7jrbdS7EW2LPr8RCFCCq1` |
| Vercel Org ID | `team_MEW8F9FRa5t1GScDAeCQFn5A` |
| Proyecto Vercel nombre | `anita-festival` |
| Supabase Project ID | `kvplwylfoterjmajnhmo` (AnitaMusic, región eu-west-1, ACTIVE_HEALTHY) |
| Supabase URL | `https://kvplwylfoterjmajnhmo.supabase.co` |
| Tabla sync | `festival_state` (id TEXT PK + state JSONB + updated_at TIMESTAMPTZ) |
| Filas por dominio | `main` (bingo), `room` (sala social), `avatars`, `stats` |
| Contraseña host | `VITE_ADMIN_PASSWORD` (default fallback `uwu777`, en .env `uwu.777`) |
| Otro proyecto Supabase | `gmpiidpdwgoxwkcerdjg` (AnIta_festival, INACTIVE — no usar) |

### Secrets en GitHub (`gh secret list`)
VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ADMIN_PASSWORD.

### .env local (NO commitear)
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (anon key legacy de Supabase) — está en `.env` (gitignored).

## 4. 🗄️ Supabase — capa de sincronización

- Transporte en `src/lib/sync.js`: REST PostgREST directo con `fetch()` (sin SDK).
- **Requisito crítico (migración 002)**: RLS necesita política `FOR ALL ... WITH CHECK (true)`
  porque la app escribe con `POST ... Prefer: resolution=merge-duplicates` (upsert = INSERT).
  Sin política INSERT, toda escritura fallaba con `42501` (bug histórico detectado 2026-09-06).
- Realtime: la tabla `festival_state` está en la publicación `supabase_realtime`.
- Migraciones en `supabase/migrations/`:
  - `001_create_festival_state.sql` — tabla + políticas (solo SELECT/UPDATE → insuficiente).
  - `002_fix_rls_and_realtime.sql` — política `FOR ALL`, realtime, seeds (`main/room/avatars/stats`).

### Arquitectura del canal híbrido
- `createChannel(storageKey, remoteRowId)` escribe SIEMPRE en localStorage y, si hay
  `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, también en la fila remota.
- Polling cada 3s + debounce de push 400ms. Merge por dominio con dedup:
  - mensajes/playlist/historia/winners → dedup por `id`
  - waitlist → dedup por `user`
  - drawnNumbers → dedup numérico en orden
- Funciones exportadas testeables: `mergeDomainStates`, `mergeUserMaps`, `dedupById`, `dedupByUser`, `dedupNumbers`.
- `createSyncTransport()` = canal híbrido para `main` (compatibilidad bingo).
- `createLocalChannel()` = canal local puro (legacy).

### Hooks conectados
- `useBingo.js` → `createSyncTransport()` (fila `main`).
- `useRoom.js` → `createChannel(roomState, "room")` + `createChannel(avatars, "avatars")` + `createChannel(stats, "stats")`.
- avatars/stats se fusionan con `mergeUserMaps` (mapa {usuario → config/xp}).

## 5. ⚙️ Vercel + GitHub Actions

### Workflows
- `.github/workflows/tests.yml` — corre `npm test` + `npm run build` en push/PR a master/develop/autonoma-integration.
- `.github/workflows/deploy.yml` — deploy a producción. **DESHABILITADO** (on: comentado) por el límite
  `api-deployments-free-per-day` (más de 100/day). Re-habilitar sacando los comentarios del `on:`.
  Sintaxis corregida a `${{ secrets.VERCEL_TOKEN }}`.
- `.github/workflows/setup-vercel-env.yml` — Sincroniza variables de entorno a Vercel vía API sin gastar
  deploys (`gh workflow run "Setup Vercel Env" -R webonlineinfo28-lgtm/anita-web --ref master`).
- `scripts/setup-vercel-env.mjs` — script que hace upsert de env vars de producción en Vercel.

### Pipeline de deploy (cuando se re-habilite)
```
npm ci → npm test → npm run build → vercel pull --prod → vercel build --prod → vercel deploy --prebuilt --prod
```

### Autonoma E2E
- `tests/autonoma/sdk.js` + `tests/autonoma/factories.js` — integración con test runner Autonoma.
- El planner Autonoma fue problemático en "Set up test data"; se crearon los E2E manualmente.
- Tests E2E en `tests/e2e/` (djbooth, bingo, chat, avatar, stats, sync, basic, login).
- `.pipeline-state.json` de Autonoma estaba en `C:\Users\rbrub\.autonoma\c-users-rbrub-desktop-anita-web-copia-2\` (recipeBuilder failed → no seguir).

## 6. 🧪 Estado de tests y calidad

- **27/27 unit tests** pasan (`npm test`): bingo-core, avatars, chat-core, stats, waitlist-core.
- Build de producción exitoso (`npm run build`).
- Playwright configurado (tests e2e). El `playwright-report/` no debe subirse (gitignore).

## 7. 🎬 Sincronización de video (DJ Booth)

### Arquitectura de sync de video
- **Estado**: `played` (0-1 fracción) y `playedSeconds` (segundos exactos) en `useRoom.js`
- **Eventos de react-player**:
  - `onProgress`: actualiza estado local y broadcast throttled (cada 2s)
  - `onSeek`: sincroniza seeks entre dispositivos inmediatamente
  - `onDuration`: almacena duración para cálculos de seek
- **Broadcast**: posición incluida en eventos `togglePlay` y `playNext` para consistencia
- **DjBoothCard**: barra de progreso usa `played * 100` (fallback a `progress`)
- **PlayerPanel**: recibe `played`, `playedSeconds`, `onProgress`, `onSeek`, `onDuration`
- **Fallback**: sin posición remota, cada dispositivo reproduce localmente

### Flujo de sincronización
```
Admin pausa en 2:30 → broadcast {isPlaying:false, played:0.375, playedSeconds:150}
                                          ↓
                              Supabase (fila "room")
                                          ↓
                           Polling 3s → Otros dispositivos
                                          ↓
                    ReactPlayer seeks to 2:30 + pausa
```

## 8. 🚧 Mejoras pensadas (futuras)

- Columna `version` + trigger `updated_at` para control de concurrencia optimista.
- Heartbeat de presencia para limpiar usuarios inactivos de la waitlist.
- Realtime WebSocket (la tabla ya está en la publicación) como upgrade opcional.
- Backoff exponencial con jitter en el polling de Supabase.
- Protección RLS más fina (p.ej. limitar escrituras por origen) — hoy es público a propósito.
- VITE_ADMIN_PASSWORD: rotar periódicamente en GitHub Secrets + Vercel.

## 9. 📋 Log de decisiones importantes

| Fecha | Decisión |
| ----- | -------- |
| 2026-09-06 | Detectar bug RLS: sin política INSERT el upsert fallaba (42501) → migración 002 con `FOR ALL`. |
| 2026-09-06 | La sala social (chat/DJ/playlist/reacciones) NO se sincronizaba a Supabase (solo localStorage) → canales híbridos por dominio. |
| 2026-09-06 | Límite Vercel `api-deployments-free-per-day` → deploy.yml deshabilitado temporalmente; env vars vía API (sin gastar deploys). |
| 2026-09-06 | Deploy manual disponible: `npm run build && npx vercel --prod` (tras el reset del cupo). |
| 2026-09-06 | **Sincronización de video profesional**: implementado sync de posición de video entre admin y usuarios con throttling, seek sync, y fallback a progreso local. |