# Anita Festival Cosmos Ultimate — Resumen del Proyecto

## Stack
React 18 + Vite 5 + Tailwind 3 + Framer Motion + react-player + canvas-confetti
100% cliente, localStorage sync, Supabase opcional.

## Arquitectura
```
src/
├── App.jsx / App.css / index.css
├── styles/
│   ├── tokens.css      # Colores cosmos (pink#ec4899, purple#a855f7, cyan#22d3ee)
│   ├── animations.css  # 20+ keyframes
│   └── components.css # Glass, botones, scrollbar
├── components/         # 16 componentes React
├── hooks/useBingo.js
└── lib/                # 9 módulos core (incluye colors.js)
```

## Componentes
Avatar.jsx | BingoPanel.jsx | ChatPanel.jsx | CosmicBackground.jsx | DjBoothCard.jsx | DjWheel.jsx | ErrorBoundary.jsx | Header.jsx | LevelUpOverlay.jsx | LoginScreen.jsx | NowPlaying.jsx | PlayerPanel.jsx | ProfilePanel.jsx | RankingPanel.jsx | RulesPanel.jsx | StatIcon.jsx | Toast.jsx

## Módulos Core
avatars.js | bingo-core.js | chat-core.js | colors.js | constants.js | stats.js | sync.js | useRoom.js | waitlist-core.js

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

// Mapeos centralizados para reacciones, toasts, stats y reglas
export const REACTION_COLORS = { ... };
export const TOAST_COLORS = { ... };
export const STAT_COLORS = { ... };
export const RULE_COLORS = { ... };
```

**Regla obligatoria:** Todos los componentes deben importar colores desde `colors.js`. Prohibido usar valores hexadecimales hardcodeados en `style={{ }}`.

## Diseño
### Colores tokens.css
pink=#ec4899 | purple=#a855f7 | cyan=#22d3ee | amber=#fbbf24 | emerald=#34d399 | rose=#f43f5e | slate=#1e293b

### Animaciones animations.css
pulse-glow | float | twinkle | equalizer-1/2/3 | neon-flicker | shimmer | meteor | rubber-band

**Regla obligatoria:** Las animaciones deben aplicarse exclusivamente mediante clases CSS de animations.css. Prohibido el uso de `animation:` inline en estilos.

## Avatares SVG (avatars.js)
SEGURIDAD: normalizeAvatar() antes de renderAvatar(). Solo claves del catálogo.

### Catálogos
SKIN: human1-8 + starlight, nebula, mint, ember
EYES: default, happy, sleepy, cool, star, wink, galaxy, heart, cyber, dizzy, flame
HAIRS: none, spiky, bob, long, curly, buzz, ponytail, mohawk, twintail, afro, bun, braids
PET_KEYS: cat, owl, dragon, robot, alien, moon, star, blob, ghost

## Stats (stats.js)
### Niveles
Lv1 sparkle/Novato Cósmico 0 | Lv2 music/Casual Festivo 200 | Lv3 mic/Farandulero 500 | Lv4 star/Estrella 1000 | Lv5 crown/Ídolo 2000 | Lv6 flame/Supernova 4000 | Lv7 trophy/Leyenda 7000

### XP
bingo:150 | line:60 | songAdded:10 | djSet:20 | reactionReceived:5

### Insignias
Los colores de insignias usan COLORS centralizado (stats.js)

## Bugs Conocidos
⚠️ drawnNumbers[0]=bola MÁS RECIENTE (newest-first)
⚠️ Historial PlayerPanel=estado interno (useState)
✅ FIX 2026-09-07: avatars.js línea 474 - fill="${skin}/>" → fill="${skin}"
✅ FIX 2026-09-08: Colores hardcodeados centralizados en colors.js
✅ FIX 2026-09-08: Animación inline en CosmicBackground → clase CSS
✅ FIX 2026-09-08: App.jsx usa STORAGE_KEYS en lugar de literales

## Tests
```bash
npm test                    # unitarios (node --test) → 28/28 pasando
npx playwright test        # e2e
npx playwright test --project local-sync  # multicliente
```

## Convenciones
Commits: feat|fix|ui|docs|refactor|test|chore|perf(alcance): descripción
normalizeAvatar() antes de renderAvatar()
NUNCA dangerouslySetInnerHTML con datos de usuario
Usar STORAGE_KEYS de constants.js para localStorage
Usar COLORS de colors.js para todos los colores
Animaciones solo via CSS classes (animations.css)

## Deploy
```bash
npm run build && npx vercel --prod
```
Variables: VITE_ADMIN_PASSWORD, VITE_SUPABASE_URL/ANON_KEY (opcional)
