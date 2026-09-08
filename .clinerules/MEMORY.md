# MEMORIA — Anita Festival Cosmos Ultimate

> 2026-09-07 | master | HEAD: a04325d

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
- components.css: glass-card/heavy, btn/primary/secondary/ghost/sm/lg/icon, cosmic-scrollbar, text-gradient-cosmic/glow-*

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

### Mascotas 100% SVG (sin emojis)

cat | owl | dragon | robot | alien | moon | star | blob | ghost
Cada una: función SVG paths/circles. petSlot() contenedor circular (83,18,r=13).

Cache LRU: renderAvatar(cfg) con Map max 256. Mismo config = mismo SVG.

## Stats (stats.js)

ICONOS COMO CLAVES STRING → StatIcon.jsx resuelve a lucide. Previene UI roto por datos corruptos.

### Niveles

Lv1 sparkle/Novato Cósmico 0 | Lv2 music/Casual Festivo 200 | Lv3 mic/Farandulero 500 | Lv4 star/Estrella de la Noche 1000 | Lv5 crown/Ídolo Galáctico 2000 | Lv6 flame/Supernova 4000 | Lv7 trophy/Leyenda del Festival 7000

### Insignias

first-bingo(ticket,#ec4899) | bingo-10(ticket,#fbbf24) | first-line(zap,#a855f7) | dj-debut(disc,#22d3ee) | five-sets(disc,#34d399) | promotor(plus,#f59e0b) | favorite(heart,#ec4899) | star-1000(star,#fbbf24) | cosmic-legend(crown,#a855f7)

### XP

bingo:150 | line:60 | songAdded:10 | djSet:20 | reactionReceived:5

Funciones: levelFromXp(xp), levelProgress(xp), recordEvent(stats,eventType), addXp(statsMap,user,eventType)

## Layout App.jsx

HEADER → DJ BOOTH HERO(centrado,avatar 120px,aura,equalizer) → Grid( Bingo[tabs] | Chat[burbujas] | Ranking[medals] ) → PlayerPanel[dock] → NowPlaying[footer fijo] → Toast[top-right] → LevelUpOverlay

Estados clave:

```js
const [toasts, setToasts] = useState([])
const pushToast = useCallback((type, message) => ...)
const [levelUp, setLevelUp] = useState(null) // {level, title}
const djAccent = AVATAR_PALETTES.accent?.[room.avatars[room.dj]?.accent] || "#ec4899"
```

## Componentes nuevos

NowPlaying: props→{track,dj,djAvatar,accent,isPlaying,played,playedSeconds,canControl,onTogglePlay,onSkip,onReact}
Toast: props→{toasts:[{id,type,message}],onClose}
LevelUpOverlay: props→{level,title,avatar,user,onClose} | confetti(canvas-confetti lazy) + fanfarria(WebAudio) + auto-dismiss 6s
StatIcon: props→{name,size=14,className,style} | fallback Sparkles
ErrorBoundary: fallback visual con retry

## Bugs resueltos

⚠️ drawnNumbers[0]=bola MÁS RECIENTE (newest-first) → BingoPanel usa [0] para última, slice(0,3) para historial
⚠️ Historial PlayerPanel=estado interno (useState) NO prop mutable
⚠️ Emojis mascotas→SVG 100% (verificar: grep emojis avatars.js→vacío)
⚠️ stats.js→títulos UTF-8 + icon keys (no placeholders)

## Convenciones

Commits: tipo(alcance): descripción (feat|fix|ui|docs|refactor|test|chore|perf)
normalizeAvatar() siempre antes de renderizar. NUNCA dangerouslySetInnerHTML. Password via getAdminPassword(). Timeouts DjWheel en refs. Tests: npm test → 27/27.

## Deploy

npm run build && npx vercel --prod. Variables: VITE_ADMIN_PASSWORD, VITE_SUPABASE_URL/ANON_KEY(opcional).

## Checklist ✅

[x] Cosmos Premium CSS | [x] DJ Booth Hero | [x] BingoPanel tabs | [x] Chat reacciones
[x] PlayerPanel dock | [x] NowPlaying bar | [x] Toast system | [x] LevelUpOverlay
[x] StatIcon | [x] ErrorBoundary | [x] Avatares SVG 100% | [x] 10 mascotas SVG
[x] Ojos:galaxy/heart/cyber/dizzy/flame | [x] Pelos:afro/bun/braids/flame/waves
[x] Accesorios | [x] Sombreros | [x] Atuendos | [x] Pelvis fantásticas
[x] stats.js rewrite | [x] ProfilePanel StatIcon | [x] RankingPanel StatIcon
[x] Build✅ | [x] Tests 27/27✅ | [x] Browser 0 errores✅
