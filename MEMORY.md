# MEMORY — Anita Festival Cosmos Ultimate

> ⚠️ **NOTA**: Las reglas detalladas están ahora en `.clinerules/`
>
> - [`.clinerules/project.md`](./.clinerules/project.md) — Arquitectura y convenciones
> - [`.clinerules/auditoria.md`](./.clinerules/auditoria.md) — Reglas de auditoría

> 2026-09-09 | master | HEAD: 8540b26 (origin/master sincronizado)

---

## Resumen Rápido

**Stack**: React 18 + Vite 5 + Tailwind 3 + Framer Motion + react-player + canvas-confetti

**Sincronización**: localStorage + Supabase ACTIVO (proyecto `AnitaMusic`, tabla `festival_state` con RLS anyone-read/write, 4 filas: main/room/avatars/stats). Transporte híbrido: polling REST 3s + merge + debounce.

---

## Sesión 2026-09-09 — Scroll + Robustez + Sync Online (COMPLETADA)

### Commits
- `41eaa8e` fix(ui): restaurar scroll natural y pulido de robustez
- `8540b26` feat(sync): transporte online robusto - timeout, retry con backoff y resync
- Ambos en `origin/master`. Working tree limpio. Tests 28/28 ✅. Build ✅ (~10.6s).

### 1. Scroll natural (bug principal resuelto)
- CAUSA RAÍZ: `h-screen w-full` + `scrollLocked ? overflow-hidden : overflow-auto` con `useState(true)` → app arrancaba bloqueada; `main` con `overflow-hidden` fijo (doble candado); grid con `maxHeight: calc(100vh-500px) + overflow-y-auto` (scroll anidado).
- SOLUCIÓN: eliminado TODO el sistema de lock (`scrollLocked`, `showScrollBanner`, atajo `Shift+S`, botón flotante de emergencia) de `useRoom.js` y `App.jsx`.
- Layout página: `min-h-screen ... overflow-x-clip pb-32` (el `pb-32` compensa la barra `NowPlaying` fija `bottom-0 z-40`).
- Chat: altura fija `h-[560px] lg:h-[600px]` — solo la lista de mensajes scrollea internamente (`ChatPanel` → `flex-1 overflow-y-auto cosmic-scrollbar`, correcto).
- Scroll interno válido SOLO en: mensajes de chat, bolas de bingo (`max-h-[140px]`), carrusel PlayerPanel (`overflow-x-auto`).
- Botón "Volver arriba" estándar: SOLO el componente `ScrollTopButton` (definido al final de `App.jsx`, con throttling rAF, lucide `ArrowUp`, aparece con `scrollY > 600`, `scrollTo smooth`). FIX: existía un duplicado inline (estado `showTop` + JSX propio) que se superponía — eliminado en commit `65b9548`. NO recrear implementaciones paralelas de este botón.
- `index.css`: `scroll-padding-bottom: 120px`, `body { overflow-y:auto }`, sin `overflow:hidden` global.

### 2. Sync 100% online (sync.js)
- Proyecto Supabase en uso: **`AnitaMusic`** (activo; `AnIta_festival` está PAUSADO y no se puede restaurar por límite free-tier de proyectos activos).
- `.env` ya apunta a `AnitaMusic`. Tabla `festival_state` con RLS "Anyone can read/write" (necesario para sala pública sin auth).
- Robustez añadida a `makeSupabaseTransport`:
  1. `fetchWithTimeout` con AbortController → un fetch colgado ya NO bloquea el flag `polling` para siempre.
  2. Push con retry + backoff exponencial → mensajes/canciones ya no se pierden si falla la red.
  3. Re-sync inmediata en `visibilitychange` (volver a la pestaña) y evento `online` (recuperar red), incluyendo reenvío de pushes pendientes.

### 3. Seguridad
- `.env.example`: eliminadas credenciales reales de Supabase → placeholders. Solo `.env.example` está trackeado; `.env` real NO está en git (verificado con `git ls-files`).
- `.gitignore` saneado: línea basura `pm test` eliminada, duplicados consolidados, patrón `.env` correcto.

### 4. Robustez / pulido
- `waitlist-core.js`, `chat-core.js`, `bingo-core.js`, `stats.js`, `constants.js`: defensas `asList()`/`cleanId()`, claves centralizadas en `STORAGE_KEYS`, timeouts de DjWheel en refs.
- `sync.js`, `useRoom.js`: persistencia con try/catch y fallbacks.
- Codificación: BOMs eliminados, UTF-8 limpio en todo `src/`. Sin scripts temporales en la raíz.
- `waitlist-core.js` quedó refactorizado (funciones en una línea con defensas) — funcionalmente equivalente, 5 exportaciones intactas.

### ⚠️ Lecciones de esta sesión (NO repetir)
- NUNCA editar archivos grandes vía scripts Python/Node con regex sobre el contenido completo — `useBingo.js` quedó truncado a 28 líneas y una redirección de PowerShell lo convirtió a UTF-16 (git lo vio como binario). Restaurar con `git restore` y usar el editor con ediciones pequeñas.
- PowerShell se come los `$` en heredocs/`node -e` anidados — preferir `node -e` con comillas simples cuidadas o el editor tool.
- Verificar con `git ls-files` antes de borrar archivos "temporales" (`.eslintrc.cjs` y `test-page.cjs` eran del proyecto y hubo que restaurarlos).
- No confundir scrollback antiguo del terminal con output actual — leer el archivo directamente para confirmar.

---

## Arquitectura

```
src/
├── components/     # 16 componentes React
├── hooks/useBingo.js
├── lib/            # 9 módulos core (incluye colors.js)
└── styles/         # tokens.css, animations.css, components.css
```

---

## Sistema de Colores Centralizado

**Archivo:** `src/lib/colors.js` (CREADO 2026-09-08)

```js
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

// Variantes con opacidad
export const colorWithAlpha = (hex, alpha) => { ... };

// Mapeos centralizados
export const REACTION_COLORS = { ... };
export const TOAST_COLORS = { ... };
export const STAT_COLORS = { ... };
export const RULE_COLORS = { ... };
```

**Uso obligatorio:** Todos los componentes deben importar colores desde `colors.js`, nunca usar valores hexadecimales hardcodeados.

---

## Avatares SVG

SEGURIDAD: nunca texto libre en SVG. Solo claves del catálogo.
`normalizeAvatar(cfg)` valida cada clave contra su catálogo.

### Catálogos Principales

- **SKIN**: human1-8 + starlight, nebula, mint, ember
- **EYES**: default, happy, sleepy, cool, star, wink, galaxy, heart, cyber, dizzy, flame
- **HAIRS**: none, spiky, bob, long, curly, buzz, ponytail, mohawk, twintail, afro, bun, braids
- **PET_KEYS**: cat, owl, dragon, robot, alien, moon, star, blob, ghost

---

## Stats

### Niveles

Lv1 sparkle/Novato Cósmico 0 | Lv2 music/Casual Festivo 200 | Lv3 mic/Farandulero 500 | Lv4 star/Estrella 1000 | Lv5 crown/Ídolo 2000 | Lv6 flame/Supernova 4000 | Lv7 trophy/Leyenda 7000

### XP

bingo:150 | line:60 | songAdded:10 | djSet:20 | reactionReceived:5

### Insignias

Los colores de insignias ahora usan COLORS centralizado (stats.js)

---

## Bugs Resueltos

⚠️ drawnNumbers[0]=bola MÁS RECIENTE (newest-first) → BingoPanel usa [0] para última
⚠️ Historial PlayerPanel=estado interno (useState) NO prop mutable
⚠️ Emojis mascotas→SVG 100%
✅ FIX 2026-09-07: avatars.js línea 474 - `fill="${skin}/>` → `fill="${skin}">`
✅ FIX 2026-09-08: Colores hardcodeados centralizados en colors.js
✅ FIX 2026-09-08: Animación inline en CosmicBackground → clase CSS
✅ FIX 2026-09-08: App.jsx usa STORAGE_KEYS en lugar de literales
✅ FIX 2026-09-09: scroll natural restaurado — eliminado sistema de lock (scrollLocked/Shift+S/banner) de useRoom.js y App.jsx
✅ FIX 2026-09-09: contenedores de página con min-h-screen + pb-32 (compensa NowPlaying fija); SIN h-screen/overflow-hidden en página
✅ FIX 2026-09-09: chat con altura fija h-[560px] lg:h-[600px] — solo la lista de mensajes scrollea internamente
✅ FIX 2026-09-08: BingoPanel con overflow-hidden para scroll aislado
✅ FIX 2026-09-08: Badge "promotor" color centralizado (COLORS.amber)
✅ FIX 2026-09-08: vercel.json con SPA rewrite configurado
✅ FIX 2026-09-08: supabase-setup.sql creado con RLS y Realtime
✅ FIX 2026-09-08: .env.example creado con variables de entorno

---

## Infraestructura (2026-09-08)

### Archivos Creados/Actualizados
- `vercel.json` - SPA rewrite para enrutamiento correcto
- `supabase-setup.sql` - SQL completo con RLS, Realtime e índices
- `.env.example` - Variables de entorno documentadas

### Deploy
```bash
npm run build && npx vercel --prod
```
Variables: VITE_ADMIN_PASSWORD, VITE_SUPABASE_URL/ANON_KEY (opcional)

---

## Tests

### Unitarios (npm test → node --test)

- src/lib/avatars.test.js
- src/lib/bingo-core.test.js
- src/lib/waitlist-core.test.js
- src/lib/chat-core.test.js
- src/lib/stats.test.js

**Resultado:** 28/28 tests pasando ✅

### E2E Playwright (npm run test:e2e)

- tests/e2e/avatar.spec.js | bingo.spec.js | chat.spec.js | djbooth.spec.js | stats.spec.js | sync.spec.js
- tests/e2e/host-guest.spec.js ⭐ — 2 contextos simultáneos
- tests/e2e/sync-bump.spec.js ⭐ — bumpSongsToFront, waitlist
- tests/e2e/bingo-authority.spec.js ⭐ — Autoridad host, migración cartón
- tests/e2e/fame-integration.spec.js ⭐ — XP, niveles, ranking

---

## Convenciones

- Commits: `tipo(alcance): descripción` (feat|fix|ui|docs|refactor|test|chore|perf)
- `normalizeAvatar()` siempre antes de `renderAvatar()`
- NUNCA `dangerouslySetInnerHTML` con datos de usuario
- Usar `STORAGE_KEYS` de constants.js
- Usar `COLORS` de colors.js para todos los colores
- Animaciones solo via CSS classes (animations.css)

---

## Checklist ✅

[x] Cosmos Premium CSS | [x] DJ Booth Hero | [x] BingoPanel tabs | [x] Chat reacciones
[x] PlayerPanel dock | [x] NowPlaying bar | [x] Toast system | [x] LevelUpOverlay
[x] StatIcon | [x] ErrorBoundary | [x] Avatares SVG 100% | [x] 10 mascotas SVG
[x] stats.js rewrite | [x] ProfilePanel StatIcon | [x] RankingPanel StatIcon
[x] Build✅ | [x] Tests 28/28✅ | [x] Browser 0 errores✅
[x] Fix avatars.js línea 474 | [x] Test mascotas SVG
[x] Sistema de colores centralizado (colors.js)
[x] Animaciones via CSS classes
[x] localStorage usa STORAGE_KEYS
[x] Auditoría de seguridad completa
[x] **.clinerules/** creado con project.md + auditoria.md
[x] Layout sin encimamientos (h-screen, overflow-hidden)
[x] Scrolls aislados (Chat, Bingo)
[x] Refactorización visual Cosmos Ultimate
[x] vercel.json con SPA rewrite
[x] supabase-setup.sql con RLS y Realtime
[x] .env.example documentado
[x] Infraestructura completa

# MEMORY — Anita Festival Cosmos Ultimate

> 2026-09-07 | master | HEAD: [working-copy]

## Arquitectura

React 18 + Vite 5 + Tailwind 3 + Framer Motion + react-player + canvas-confetti. 100% cliente, localStorage sync.

## Archivos clave

```
src/
├── App.jsx / App.css / index.css
├── styles/
│   ├── tokens.css      # Design tokens Cosmos Premium
│   ├── animations.css  # 20+ keyframes
│   └── components.css # Glass, botones, scrollbar
├── components/
│   ├── Avatar.jsx      # SVG avatar procedimental
│   ├── BingoPanel.jsx # Bingo compacto tabs bombo/cartón
│   ├── ChatPanel.jsx  # Chat + reacciones flotantes
│   ├── CosmicBackground.jsx
│   ├── DjBoothCard.jsx # DJ Hero (avatar 120px + aura)
│   ├── DjWheel.jsx     # Ruleta 3D + confetti
│   ├── ErrorBoundary.jsx
│   ├── Header.jsx
│   ├── LevelUpOverlay.jsx # Overlay nivel + confetti
│   ├── LoginScreen.jsx
│   ├── NowPlaying.jsx  # Barra fija inferior
│   ├── PlayerPanel.jsx # Dock canciones
│   ├── ProfilePanel.jsx # Stats + insignias
│   ├── RankingPanel.jsx
│   ├── RulesPanel.jsx
│   ├── StatIcon.jsx    # Clave → lucide-react
│   └── Toast.jsx       # Notificaciones toast
├── hooks/useBingo.js
└── lib/
    ├── avatars.js     # SVG avatars, cats 100% (sin emojis)
    ├── bingo-core.js
    ├── chat-core.js
    ├── constants.js   # STORAGE_KEYS, ADMIN_PASSWORD
    ├── stats.js        # XP/niveles/insignias (icon keys)
    ├── sync.js
    ├── useRoom.js
    └── waitlist-core.js
```

## Sistema de Diseño

- tokens.css: paleta cósmica (pink#ec4899/purple#a855f7/cyan#22d3ee), Space Grotesk
- animations.css: pulse-glow, float, twinkle, equalizer-1/2/3, neon-flicker, shimmer, meteor, rubber-band
- components.css: glass-card/heavy, btn/primary/secondary/ghost/sm/lg/icon, cosmic-scrollbar

## Avatares SVG (avatars.js)

SEGURIDAD: nunca texto libre en SVG. Solo claves del catálogo.
normalizeAvatar(cfg) valida cada clave contra su catálogo.

### Catálogos

SKIN: human1-8 + starlight, nebula, mint, ember
HAIR COLOR: black,brown,blonde,red,gray,blue,purple,green,pink,orange,galaxy,silver,crimson,sunset
EYES: default,happy,sleepy,cool,star,wink,galaxy,heart,cyber,dizzy,flame
BROWS: normal,furrowed,raised,bold,surprised,wavy
MOUTHS: smile,open,grin,frown,flat,kiss,tongue,smirk,wow,fangs,robot,beam
HAIRS: none,spiky,bob,long,curly,buzz,ponytail,mohawk,twintail,afro,bun,braids,flame,waves
ACCESSORIES: none,glasses,sunglasses,monocle,gem,freckles,earrings,eyepatch,blush,warpaint,visor
HATS: none,crown,cap,halo,headphones,tophat,beanie,astronaut,wizard,party,antennae,flowercrown
OUTFIT: hoodie,suit,dress,jacket,shirt,spacesuit,cape,kimono,armor
ACCENT: pink,purple,cyan,amber,emerald,rose,blue,orange,green,red
PET_KEYS: none,cat,owl,dragon,robot,alien,moon,star,blob,ghost

## Stats (stats.js)

ICONOS COMO CLAVES STRING → StatIcon.jsx resuelve a lucide.

### Niveles

Lv1 sparkle/Novato Cósmico 0 | Lv2 music/Casual Festivo 200 | Lv3 mic/Farandulero 500 | Lv4 star/Estrella de la Noche 1000 | Lv5 crown/Ídolo Galáctico 2000 | Lv6 flame/Supernova 4000 | Lv7 trophy/Leyenda del Festival 7000

### Insignias

first-bingo(ticket,#ec4899) | bingo-10(ticket,#fbbf24) | first-line(zap,#a855f7) | dj-debut(disc,#22d3ee) | five-sets(disc,#34d399) | promotor(plus,#f59e0b) | favorite(heart,#ec4899) | star-1000(star,#fbbf24) | cosmic-legend(crown,#a855f7)

### XP

bingo:150 | line:60 | songAdded:10 | djSet:20 | reactionReceived:5

## Bugs resueltos

⚠️ drawnNumbers[0]=bola MÁS RECIENTE (newest-first) → BingoPanel usa [0] para última
⚠️ Historial PlayerPanel=estado interno (useState) NO prop mutable
⚠️ Emojis mascotas→SVG 100%
✅ FIX 2026-09-07: avatars.js línea 474 - `fill="${skin}/>` → `fill="${skin}">`

## Tests

### Unitarios (npm test → node --test)

- src/lib/avatars.test.js (normalizeAvatar, renderAvatar, mergeAvatar, mascotas SVG 100%)
- src/lib/bingo-core.test.js (generación cartón, validación línea/bingo)
- src/lib/waitlist-core.test.js (join/leave, bumpSongsToFront)

### E2E Playwright (npm run test:e2e)

- tests/e2e/avatar.spec.js | bingo.spec.js | chat.spec.js | djbooth.spec.js | stats.spec.js | sync.spec.js
- tests/e2e/host-guest.spec.js ⭐ NUEVO — 2 contextos simultáneos
- tests/e2e/sync-bump.spec.js ⭐ NUEVO — bumpSongsToFront, waitlist
- tests/e2e/bingo-authority.spec.js ⭐ NUEVO — Autoridad host, migración cartón
- tests/e2e/fame-integration.spec.js ⭐ NUEVO — XP, niveles, ranking

## MCP de Auditoría

```bash
node mcp/filesystem-server.js
```

Herramientas: read_file, list_files, search_pattern, audit_component, audit_avatar_usage, test_coverage_report

Ver: mcp/filesystem-prompt.md para instrucciones del sistema.

## Convenciones

Commits: tipo(alcance): descripción (feat|fix|ui|docs|refactor|test|chore|perf)
normalizeAvatar() siempre antes de renderizar. NUNCA dangerouslySetInnerHTML con datos de usuario.

## Checklist ✅

[x] Cosmos Premium CSS | [x] DJ Booth Hero | [x] BingoPanel tabs | [x] Chat reacciones
[x] PlayerPanel dock | [x] NowPlaying bar | [x] Toast system | [x] LevelUpOverlay
[x] StatIcon | [x] ErrorBoundary | [x] Avatares SVG 100% | [x] 10 mascotas SVG
[x] stats.js rewrite | [x] ProfilePanel StatIcon | [x] RankingPanel StatIcon
[x] Build✅ | [x] Tests 27/27✅ | [x] Browser 0 errores✅
[x] Fix avatars.js línea 474 | [x] Test mascotas SVG
[x] MCP audit filesystem | [x] MCP audit prompt
[x] Tests host-guest | [x] Tests sync-bump | [x] Tests bingo-authority | [x] Tests fame-integration
