# 🚀 Guía de Configuración - Anita Festival

## Supabase (Sincronización Multidispositivo)

### Proyecto Configurado ✅

- **Proyecto ID:** `kvplwylfoterjmajnhmo`
- **Nombre:** AnitaMusic
- **Región:** us-east-1
- **Estado:** ACTIVE

### Tabla `festival_state` ✅

```sql
CREATE TABLE festival_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies ✅

- `Anyone can read festival_state` (SELECT)
- `Anyone can write festival_state` (INSERT/UPDATE — necesaria para el upsert REST)

---

## Vercel - Variables de Entorno

### Paso 1: Obtener credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona el proyecto **AnitaMusic**
3. Ve a **Settings → API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Paso 2: Configurar en Vercel (automático, sin gastar deploys)

1. Los secrets ya están en GitHub (`gh secret list`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
   `VERCEL_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`.
2. Sincroniza las variables de entorno de Vercel vía API (no crea deployments):

```bash
gh workflow run "Setup Vercel Env" -R webonlineinfo28-lgtm/anita-web --ref master
```

3. O manualmente en el Dashboard [Vercel Settings → Environment Variables](https://vercel.com/webonlineinfo28-lgtm/anita-web/settings/environment-variables):

| Nombre                   | Valor                                          |
| ------------------------ | ---------------------------------------------- |
| `VITE_SUPABASE_URL`      | `https://kvplwylfoterjmajnhmo.supabase.co`     |
| `VITE_SUPABASE_ANON_KEY` | `[anon key de Supabase]`                       |

4. El deploy se relanza con `npx vercel --prod` (o el workflow `deploy.yml` cuando Vercel
   resetee el límite diario `api-deployments-free-per-day`).

### Paso 3: Verificar

Después del redeploy, abre la app y verifica en DevTools:

```
✓ Conectado a Supabase (multi-dispositivo activo)
```

Sin las variables, la app funciona igual con localStorage (solo mismo navegador).

---

##密码

La contraseña del host está en `VITE_ADMIN_PASSWORD` (default: `uwu777`).

Para cambiarla, añade esta variable en Vercel:

| Nombre                | Valor                   |
| --------------------- | ----------------------- |
| `VITE_ADMIN_PASSWORD` | `tu-contraseña-secreta` |

---

## Testing

### Local

```bash
npm install
npm run dev
```

### Tests

```bash
npm test        # 27 tests
npm run build   # Production build
```

### Preview

```bash
npm run preview
```

---

## Troubleshooting

| Problema            | Solución                                    |
| ------------------- | ------------------------------------------- |
| Supabase no conecta | Verificar credenciales en Vercel + Redeploy |
| Build falla         | `npm install` + `npm run build`             |
| Tests fallan        | `npm test` para ver detalles                |
| 404 en Vercel       | Verificar `base: "./"` en vite.config.js    |
