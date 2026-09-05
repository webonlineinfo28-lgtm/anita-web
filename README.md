# 🪩 Anita Festival 2.0 — la locura cósmica

Sala de fiestas social estilo **plug.dj** con sabor cósmico: **cabina de DJ con lista de espera y rotación**, **avatares procedentales 100% editables**, **chat de sala con reacciones flotantes**, **bingo compartido** y **sistema de fama con niveles e insignias**.

Stack: **React 18 + Vite 5 + Tailwind 3 + Framer Motion + react-player + canvas-confetti** — 100% cliente, sin backend de pago.

## 🚀 Comandos

```bash
npm install       # primera vez
npm run dev       # desarrollo (http://localhost:5173)
npm run build     # producción → dist/
npm run preview   # servir la build local
npm test          # 27 tests (bingo + avatares + cabina + chat + fama)
```

## 🎧 La Cabina (plug.dj style)

- **DJ actual**: avatar gigante con glow neón (su color de acento), corona si es host, canción en el aire y barra de progreso.
- **Lista de espera**: cada usuario puede _“Subir a la cabina”_ o _“Salir”_. Al terminar una canción, **la cola rota automáticamente** y las canciones del siguiente DJ saltan al frente (`bumpSongsToFront`).
- **Sorteo cósmico 🎡** (host): ruleta animada de avatares que elige al próximo DJ al azar.
- El host puede expulsar a cualquier DJ de la cola.

## 🧑‍🎤 Avatares editables

- Editor con pestañas: **Cara** (8 pieles, 6 ojos, 4 cejas, 7 bocas), **Pelo** (8 peinados × 10 colores), **Ropa** (6 atuendos), **Extras** (6 accesorios, 7 sombreros incl. corona/halo/cascos) y **Mascota** (5 compañeros).
- Botón **🎲 Aleatorio** y **↺ Reset**. Se crean **sin imágenes**: cada avatar es SVG generado por `lib/avatars.js`.
- Seguridad: el config del usuario solo contiene _claves_ del catálogo — nunca entra texto libre al SVG (testeado contra inyección).
- Visible en: login, header, cabina, lista de espera, chat y ranking.

## 💬 Chat + reacciones

- Chat de sala con avatar, color de acento por usuario y hora.
- Barra de **reacciones a la canción** (🔥 ❤️ 👏 😂 😮 🥳) que lanza emojis flotantes sobre la cabina y suma contadores por canción (1 reacción por usuario y canción).

## 🌟 Fama: XP, niveles e insignias

- Gana XP por: **bingo (150)**, **línea (60)**, **canción añadida (10)**, **set de DJ (20)**, **reacción recibida (5)**.
- **7 niveles**: Novato Cósmico 🍼 → Casual Festivo 🧃 → Farandulero 🎉 → Estrella de la Noche ⭐ → Ídolo Galáctico 🌟 → Supernova 💫 → Leyenda del Festival 👑.
- **9 insignias** coleccionables visibles en tu perfil (botón 👤 del header).
- Los bingos del juego alimentan la fama vía el evento `anita-bingo-event`.

## 🎲 Bingo cósmico

- Bombo cada 3 s, **sin números repetidos**, parada real en la bola 75.
- Línea pausa y retoma sola (13 s); **BINGO** dispara confeti épico + fanfarria WebAudio y auto-nueva-partida.
- Cartón **permanente por usuario** (los del antiguo bug `undefined` se migran solos) y bloqueado durante la partida.
- Solo el host controla el bombo compartido; los invitados celebran su propia partida.

## 🔐 Roles

| Rol      | Cómo entrar                  | Permisos                                    |
| -------- | ---------------------------- | ------------------------------------------- |
| Invitado | Cualquier nombre             | Ver sala, chat, reacciones, su cartón       |
| Host     | _“Soy el host”_ + contraseña | Bombo, gestionar cola, sorteo, expulsar DJs |

Contraseña vía `.env` (`VITE_ADMIN_PASSWORD`, fallback `uwu.777`).

## 🧠 Arquitectura

```
src/
├── App.jsx                 # sesión + música + rotación de cabina + sala social
├── lib/
│   ├── bingo-core.js       # lógica pura del bingo (testeable)
│   ├── waitlist-core.js    # rotación de cabina DJ (testeable)
│   ├── chat-core.js        # mensajes de chat sanitizados (testeable)
│   ├── stats.js            # XP, niveles e insignias (testeable)
│   ├── avatars.js          # avatares SVG procedentales (testeable)
│   ├── sync.js             # transporte local + Supabase opcional (0€)
│   └── constants.js        # claves de storage, contraseña, tiempos
├── hooks/useBingo.js       # bombo + victorias + sincronización
└── components/             # Avatar, AvatarEditor, DjBoothCard, DjWheel,
                            # ChatPanel, ProfilePanel, PlayerPanel, BingoPanel,
                            # RankingPanel, Header, LoginScreen, CosmicBackground
```

### Sincronización

- **Local (siempre)**: `localStorage` + eventos `storage` → pestañas del mismo navegador al instante (pantalla grande + host).
- **Multidispositivo (opcional, gratis)**: proyecto Supabase gratis + tabla `festival_state` (SQL en la v1 del README histórico) y claves `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en `.env`. Sin claves, todo funciona igual en local.

---

## 🚀 Despliegue Paso a Paso

### Opción 1: GitHub + Vercel (Recommended)

```bash
# 1. Sube tu código a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/anita-web.git
git push -u origin main

# 2. En vercel.com
# - Haz clic en "Add New..."
# - Importa tu repositorio de GitHub
# - Vercel detecta automáticamente "Vite"
# - Haz clic en "Deploy"
```

### Opción 2: CLI de Vercel

```bash
npm i -g vercel
vercel
```

### Variables de Entorno en Vercel

En **Project Settings → Environment Variables**:

| Variable                 | Valor                                         |
| ------------------------ | --------------------------------------------- |
| `VITE_ADMIN_PASSWORD`    | `tu-contraseña-secreta`                       |
| `VITE_SUPABASE_URL`      | `https://xyztuvwxyz.supabase.co` _(opcional)_ |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` _(opcional)_                     |

> ⚠️ Después de añadir variables, haz **Redeploy**.

---

## 📡 Supabase (Sincronización Multidispositivo)

### ¿Por qué Supabase?

Sin Supabase, la app funciona perfectamente sincronizando **solo pestañas del mismo navegador**. Con Supabase, múltiples dispositivos (teléfono, tablet, PC) comparten el mismo estado en tiempo real. **Gratis hasta 50.000 usuarios mensuales**.

### Configuración

**Paso 1:** Crea cuenta en [supabase.com](https://supabase.com)

**Paso 2:** Crea nuevo proyecto y espera a que esté listo

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

**Paso 4:** Ve a **Settings → API** y copia:

- Project URL → `VITE_SUPABASE_URL`
- `anon` key → `VITE_SUPABASE_ANON_KEY`

**Paso 5:** Añade las variables en Vercel y haz Redeploy.

---

## 🔧 Troubleshooting

| Problema                    | Solución                                                  |
| --------------------------- | --------------------------------------------------------- |
| Error 404 en Vercel         | Asegúrate de que `vite.config.js` tiene `base: "./"`      |
| Supabase no conecta         | Verifica las claves y que el SQL se ejecutó correctamente |
| Build falla                 | Ejecuta `npm install` localmente y verifica que funciona  |
| Contraseña host no funciona | Verifica `VITE_ADMIN_PASSWORD` en variables de entorno    |

---

Hecho con 💜 para la comunidad.

## ☁️ Vercel

Proyecto ya enlazado (`.vercel/`). Build `npm run build`, output `dist`, variables de entorno en _Settings → Environment Variables_. 🎉
