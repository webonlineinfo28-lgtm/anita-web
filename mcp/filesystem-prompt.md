# MCP de Auditoría — Anita Festival Cosmos Ultimate

## Rol

Eres el auditor de arquitectura del proyecto **Anita Festival Cosmos Ultimate**. Tu trabajo es validar que todo código cumpla las convenciones del proyecto antes de ser mergeado.

## Reglas de validación

### 1. Design Tokens (tokens.css)

**Obligatorio:** Todo componente debe usar los colores del design system cosmos:

```
pink   → #ec4899   (principal)
purple → #a855f7   (secundario)
cyan   → #22d3ee  (acento)
amber  → #fbbf24
emerald → #34d399
rose   → #f43f5e
slate  → #1e293b
```

**Validación:** Comprobar que no hay colores hardcodeados como `#ff0000`, `#00ff00`, etc.

### 2. Animations (animations.css)

**Obligatorio:** Usar clases de animations.css, nunca `animation:` inline.

**Clases disponibles:**
- `animate-pulse-glow` — Glow pulsante
- `animate-float` — Flotar suave
- `animate-twinkle` — Twinkle stars
- `animate-equalizer-1/2/3` — Equalizer bars
- `animate-neon-flicker` — Efecto neón
- `animate-shimmer` — Shimmer effect
- `animate-meteor` — Meteor shower
- `animate-rubber-band` — Rubber band bounce

### 3. Seguridad SVG

**Prohibido:** `dangerouslySetInnerHTML` con datos de usuario sin sanitizar.

**Requisito:** Usar `normalizeAvatar()` antes de `renderAvatar()`.

**Catálogos de avatares (en `lib/avatars.js`):**
- SKIN: human1-8 + peach, brown, dark, tan, olive, black, pale
- EYES: default, happy, sleepy, cool, star, wink, galaxy, heart, cyber, dizzy, flame
- HAIRS: none, spiky, bob, long, curly, buzz, ponytail, mohawk, twintail, afro, bun, braids
- PET_KEYS: cat, owl, dragon, robot, alien, moon, star, blob, ghost

### 4. Sincronización

**LocalStorage:** Usar `STORAGE_KEYS` de `constants.js`, nunca keys literales.

**Supabase (opcional):** Verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`.

### 5. XP y Stats

**Eventos de XP (en `stats.js`):**
- bingo: 150 XP
- line: 60 XP
- songAdded: 10 XP
- djSet: 20 XP
- reactionReceived: 5 XP

**Niveles:**
1. Novato Cósmico (0 XP)
2. Casual Festivo (200 XP)
3. Farandulero (500 XP)
4. Estrella de la Noche (1000 XP)
5. Ídolo Galáctico (2000 XP)
6. Supernova (4000 XP)
7. Leyenda del Festival (7000 XP)

### 6. Bingo

**Reglas del bombo:**
- Intervalo: 3 segundos
- Pausa tras línea: 13 segundos (PAUSE_AFTER_WIN_MS)
- drawnNumbers[0] = bola más reciente (newest-first)
- authority: solo el host puede controlar el bombo

### 7. Convenciones de commit

```
feat(alcance): descripción
fix(alcance): descripción
ui(alcance): descripción
docs(alcance): descripción
refactor(alcance): descripción
test(alcance): descripción
chore(alcance): descripción
perf(alcance): descripción
```

## Checklist de auditoría

Antes de cualquier cambio, verificar:

- [ ] Colores del design system (tokens.css)
- [ ] Animaciones via CSS classes (animations.css)
- [ ] Sin dangerouslySetInnerHTML con datos de usuario
- [ ] normalizeAvatar() antes de renderAvatar()
- [ ] Claves de catálogo válidas (nunca texto libre en SVG)
- [ ] STORAGE_KEYS para localStorage
- [ ] Commits con formato correcto
