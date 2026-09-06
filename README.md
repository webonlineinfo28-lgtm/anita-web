# ðŸª© Anita Festival 2.0 â€” la locura cÃ³smica

Sala de fiestas social estilo **plug.dj** con sabor cÃ³smico: **cabina de DJ con lista de espera y rotaciÃ³n**, **avatares procedenciales 100% editables**, **chat de sala con reacciones flotantes**, **bingo compartido** y **sistema de fama con niveles e insignias**.

Stack: **React 18 + Vite 5 + Tailwind 3 + Framer Motion + react-player + canvas-confetti** â€” 100% cliente, sin backend de pago.

## ðŸš€ Comandos

```bash
npm install       # primera vez
npm run dev       # desarrollo (http://localhost:5173)
npm run build     # producciÃ³n â†’ dist/
npm run preview   # servir la build local
npm test          # 27 tests (bingo + avatares + cabina + chat + fama)
```

## ðŸŽ§ La Cabina (plug.dj style)

- **DJ actual**: avatar gigante con glow neÃ³n (su color de acento), corona si es host, canciÃ³n en el aire y barra de progreso.
- **Lista de espera**: cada usuario puede _â€œSubir a la cabinaâ€_ o _â€œSalirâ€_. Al terminar una canciÃ³n, **la cola rota automÃ¡ticamente** y las canciones del siguiente DJ saltan al frente (`bumpSongsToFront`).
- **Sorteo cÃ³smico ðŸŽ¡** (host): ruleta animada de avatares que elige al prÃ³ximo DJ al azar.
- El host puede expulsar a cualquier DJ de la cola.

## ðŸ§‘â€ðŸŽ¤ Avatares editables

- Editor con pestaÃ±as: **Cara** (8 pieles, 6 ojos, 4 cejas, 7 bocas), **Pelo** (8 peinados Ã— 10 colores), **Ropa** (6 atuendos), **Extras** (6 accesorios, 7 sombreros incl. corona/halo/cascos) y **Mascota** (5 compaÃ±eros).
- BotÃ³n **ðŸŽ² Aleatorio** y **â†º Reset**. Se crean **sin imÃ¡genes**: cada avatar es SVG generado por `lib/avatars.js`.
- Seguridad: el config del usuario solo contiene _claves_ del catÃ¡logo â€” nunca entra texto libre al SVG (testeado contra inyecciÃ³n).
- Visible en: login, header, cabina, lista de espera, chat y ranking.

## ðŸ’¬ Chat + reacciones

- Chat de sala con avatar, color de acento por usuario y hora.
- Barra de **reacciones a la canciÃ³n** (ðŸ”¥ â¤ï¸ ðŸ‘ ðŸ˜‚ ðŸ˜® ðŸ¥³) que lanza emojis flotantes sobre la cabina y suma contadores por canciÃ³n (1 reacciÃ³n por usuario y canciÃ³n).

## ðŸŒŸ Fama: XP, niveles e insignias

- Gana XP por: **bingo (150)**, **lÃ­nea (60)**, **canciÃ³n aÃ±adida (10)**, **set de DJ (20)**, **reacciÃ³n recibida (5)**.
- **7 niveles**: Novato CÃ³smico ðŸ¼ â†’ Casual Festivo ðŸ§ƒ â†’ Farandulero ðŸŽ‰ â†’ Estrella de la Noche â­ â†’ Ãdolo GalÃ¡ctico ðŸŒŸ â†’ Supernova ðŸ’« â†’ Leyenda del Festival ðŸ‘‘.
- **9 insignias** coleccionables visibles en tu perfil (botÃ³n ðŸ‘¤ del header).
- Los bingos del juego alimentan la fama vÃ­a el evento `anita-bingo-event`.

## ðŸŽ² Bingo cÃ³smico

- Bombo cada 3 s, **sin nÃºmeros repetidos**, parada real en la bola 75.
- LÃ­nea pausa y retoma sola (13 s); **BINGO** dispara confeti Ã©pico + fanfarria WebAudio y auto-nueva-partida.
- CartÃ³n **permanente por usuario** (los del antiguo bug `undefined` se migran solos) y bloqueado durante la partida.
- Solo el host controla el bombo compartido; los invitados celebran su propia partida.

## ðŸ” Roles

| Rol      | CÃ³mo entrar                  | Permisos                                    |
| -------- | ---------------------------- | ------------------------------------------- |
| Invitado | Cualquier nombre             | Ver sala, chat, reacciones, su cartÃ³n       |
| Host     | _â€œSoy el hostâ€_ + contraseÃ±a | Bombo, gestionar cola, sorteo, expulsar DJs |

ContraseÃ±a vÃ­a `.env` (`VITE_ADMIN_PASSWORD`, fallback `uwu777`).

## ðŸ§  Arquitectura

```
src/
â”œâ”€â”€ App.jsx                 # sesiÃ³n + mÃºsica + rotaciÃ³n de cabina + sala social
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ bingo-core.js       # lÃ³gica pura del bingo (testeable)
â”‚   â”œâ”€â”€ waitlist-core.js    # rotaciÃ³n de cabina DJ (testeable)
â”‚   â”œâ”€â”€ chat-core.js        # mensajes de chat sanitizados (testeable)
â”‚   â”œâ”€â”€ stats.js            # XP, niveles e insignias (testeable)
â”‚   â”œâ”€â”€ avatars.js          # avatares SVG procedenciales (testeable)
â”‚   â”œâ”€â”€ sync.js             # transporte local + Supabase opcional (0â‚¬)
â”‚   â””â”€â”€ constants.js        # claves de storage, contraseÃ±a, tiempos
â”œâ”€â”€ hooks/useBingo.js       # bombo + victorias + sincronizaciÃ³n
â””â”€â”€ components/             # Avatar, AvatarEditor, DjBoothCard, DjWheel,
                            # ChatPanel, ProfilePanel, PlayerPanel, BingoPanel,
                            # RankingPanel, Header, LoginScreen, CosmicBackground
```

### SincronizaciÃ³n

- **Local (siempre)**: `localStorage` + eventos `storage` â†’ pestaÃ±as del mismo navegador al instante (pantalla grande + host).
- **Multidispositivo (opcional, gratis)**: proyecto Supabase gratis + tabla `festival_state` (SQL en la v1 del README histÃ³rico) y claves `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en `.env`. Sin claves, todo funciona igual en local.

---

## ðŸš€ Despliegue Paso a Paso

### OpciÃ³n 1: GitHub + Vercel (Recommended)

```bash
# 1. Sube tu cÃ³digo a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/anita-web.git
git push -u origin main

# 2. En vercel.com
# - Haz clic en "Add New..."
# - Importa tu repositorio de GitHub
# - Vercel detecta automÃ¡ticamente "Vite"
# - Haz clic en "Deploy"
```

### OpciÃ³n 2: CLI de Vercel

```bash
npm i -g vercel
vercel
```

### Variables de Entorno en Vercel

En **Project Settings â†’ Environment Variables**:

| Variable                 | Valor                                         |
| ------------------------ | --------------------------------------------- |
| `VITE_ADMIN_PASSWORD`    | `tu-contraseÃ±a-secreta`                       |
| `VITE_SUPABASE_URL`      | `https://xyztuvwxyz.supabase.co` _(opcional)_ |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` _(opcional)_                     |

> âš ï¸ DespuÃ©s de aÃ±adir variables, haz **Redeploy**.

---

## ðŸ“¡ Supabase (SincronizaciÃ³n Multidispositivo)

### Â¿Por quÃ© Supabase?

Sin Supabase, la app funciona perfectamente sincronizando **solo pestaÃ±as del mismo navegador**. Con Supabase, mÃºltiples dispositivos (telÃ©fono, tablet, PC) comparten el mismo estado en tiempo real. **Gratis hasta 50.000 usuarios mensuales**.

### ConfiguraciÃ³n

**Paso 1:** Crea cuenta en [supabase.com](https://supabase.com)

**Paso 2:** Crea nuevo proyecto y espera a que estÃ© listo

**Paso 3:** En SQL Editor, ejecuta:

```sql
-- Contenido en supabase/migrations/001_create_festival_state.sql
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE TABLE IF NOT EXISTS festival_state (
  id TEXT PRIMARY KEY DEFAULT single,
  payload JSONB NOT NULL DEFAULT {},
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE festival_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON festival_state FOR SELECT USING true;
CREATE POLICY public_write ON festival_state FOR UPDATE USING true WITH CHECK true;
INSERT INTO festival_state (id, payload) VALUES (single, {});
CREATE INDEX IF NOT EXISTS idx_festival_state_updated_at ON festival_state (updated_at DESC);
```

**Paso 4:** Ve a **Settings â†’ API** y copia:

- Project URL â†’ `VITE_SUPABASE_URL`
- `anon` key â†’ `VITE_SUPABASE_ANON_KEY`

**Paso 5:** AÃ±ade las variables en Vercel y haz Redeploy.

---

## ðŸ”§ Troubleshooting

| Problema                    | SoluciÃ³n                                                  |
| --------------------------- | --------------------------------------------------------- |
| Error 404 en Vercel         | AsegÃºrate de que `vite.config.js` tiene `base: "./"`      |
| Supabase no conecta         | Verifica las claves y que el SQL se ejecutÃ³ correctamente |
| Build falla                 | Ejecuta `npm install` localmente y verifica que funciona  |
| ContraseÃ±a host no funciona | Verifica `VITE_ADMIN_PASSWORD` en variables de entorno    |

---

Hecho con ðŸ’œ para la comunidad.

## â˜ï¸ Vercel

Proyecto ya enlazado (`.vercel/`). Build `npm run build`, output `dist`, variables de entorno en _Settings â†’ Environment Variables_. ðŸŽ‰
