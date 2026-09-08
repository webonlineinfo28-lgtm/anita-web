# Auditoría de Código — Anita Festival

## Reglas de Validación

### 1. Design Tokens

**Obligatorio:** Todo componente debe usar los colores del design system cosmos:

```
pink   → #ec4899   (principal)
purple → #a855f7   (secundario)
cyan   → #22d3ee   (acento)
amber  → #fbbf24
emerald → #34d399
rose   → #f43f5e
slate  → #1e293b
```

**Archivo centralizado:** `src/lib/colors.js`

```js
import { COLORS, colorWithAlpha } from "../lib/colors.js";

// Uso correcto
<div style={{ color: COLORS.pink }}>
<div style={{ background: colorWithAlpha(COLORS.pink, 0.2) }}>
```

**Validación:** Comprobar que no hay colores hardcodeados como `#ff0000`, `#00ff00`, etc. Todos los colores deben importarse desde `colors.js`.

### 2. Animaciones

**Obligatorio:** Usar clases de animations.css, nunca `animation:` inline.

```jsx
// Correcto
<div className="animate-twinkle">

// Incorrecto
<div style={{ animation: 'twinkle 3s infinite' }}>
```

### 3. Seguridad SVG

**Prohibido:** `dangerouslySetInnerHTML` con datos de usuario sin sanitizar.

**Requisito:** Usar `normalizeAvatar()` antes de `renderAvatar()`.

**Excepción segura:** El componente `Avatar.jsx` usa `dangerouslySetInnerHTML` pero es seguro porque `renderAvatar()` internamente ejecuta `normalizeAvatar()`.

### 4. Sincronización

**LocalStorage:** Usar `STORAGE_KEYS` de `constants.js`, nunca keys literales.

```jsx
// Correcto
import { STORAGE_KEYS } from "../lib/constants.js";
localStorage.getItem(STORAGE_KEYS.session);

// Incorrecto
localStorage.getItem("anita_session");
```

### 5. Avatares

**Catálogos de avatares (en `lib/avatars.js`):**
- SKIN: human1-8 + starlight, nebula, mint, ember
- EYES: default, happy, sleepy, cool, star, wink, galaxy, heart, cyber, dizzy, flame
- HAIRS: none, spiky, bob, long, curly, buzz, ponytail, mohawk, twintail, afro, bun, braids
- PET_KEYS: cat, owl, dragon, robot, alien, moon, star, blob, ghost

### 6. Bingo

**Reglas del bombo:**
- Intervalo: 3 segundos (DRAW_INTERVAL_MS)
- Pausa tras línea: 13 segundos (PAUSE_AFTER_WIN_MS)
- drawnNumbers[0] = bola más reciente (newest-first)
- Autoridad: solo el host puede controlar el bombo

### 7. XP y Stats

**Eventos de XP (en `stats.js`):**
- bingo: 150 XP
- line: 60 XP
- songAdded: 10 XP
- djSet: 20 XP
- reactionReceived: 5 XP

**Insignias:** Los colores de insignias usan COLORS centralizado (stats.js)

## Checklist de Auditoría

Antes de cualquier cambio, verificar:

- [ ] Colores del design system (tokens.css / colors.js)
- [ ] Animaciones via CSS classes (animations.css)
- [ ] Sin dangerouslySetInnerHTML con datos de usuario
- [ ] normalizeAvatar() antes de renderAvatar()
- [ ] Claves de catálogo válidas (nunca texto libre en SVG)
- [ ] STORAGE_KEYS para localStorage
- [ ] COLORS para todos los colores
- [ ] Commits con formato correcto

## Bugs Conocidos a Verificar

1. **FIX 2026-09-07**: avatars.js línea 474 - `fill="${skin}/>` → `fill="${skin}"/>`
   - El `/>` faltaba (SVG malformado)
   - El escape `\$` impedía interpolación de color
2. drawnNumbers[0] = bola MÁS RECIENTE (newest-first)
3. Historial PlayerPanel = estado interno (useState)
4. Emojis mascotas → SVG 100%
5. **FIX 2026-09-08**: Colores hardcodeados centralizados en colors.js
6. **FIX 2026-09-08**: Animación inline en CosmicBackground → clase CSS
7. **FIX 2026-09-08**: App.jsx usa STORAGE_KEYS en lugar de literales

## Auditoría de Seguridad Completada (2026-09-08)

### Archivos Creados
- `src/lib/colors.js` - Sistema centralizado de colores del design system

### Archivos Modificados
- `src/components/CosmicBackground.jsx` - Animación inline → clase CSS
- `src/components/ChatPanel.jsx` - Colores de reacciones centralizados
- `src/components/Toast.jsx` - Colores de tipos de toast centralizados
- `src/components/ProfilePanel.jsx` - Colores de iconos de stats centralizados
- `src/components/RulesPanel.jsx` - Colores de categorías centralizados
- `src/components/DjBoothCard.jsx` - Colores hardcodeados reemplazados
- `src/components/DjWheel.jsx` - Color de ganador centralizado
- `src/components/LevelUpOverlay.jsx` - Colores de confetti y gradientes centralizados
- `src/components/LoginScreen.jsx` - Colores hardcodeados reemplazados
- `src/components/NowPlaying.jsx` - Color de acento por defecto centralizado
- `src/components/PlayerPanel.jsx` - Color de sombra centralizado
- `src/lib/stats.js` - Colores de badges centralizados
- `src/App.jsx` - Uso de STORAGE_KEYS en lugar de literales

### Validación Técnica
- ✅ 28/28 tests unitarios pasando
- ✅ Build de producción exitoso
- ✅ Sin errores de consola
- ✅ Código fuente sin literales hardcodeados (colores)
- ✅ Código fuente sin literales hardcodeados (localStorage)
- ✅ Animaciones via CSS classes
