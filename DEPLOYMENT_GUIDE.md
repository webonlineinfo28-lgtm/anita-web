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
- `Anyone can update festival_state` (UPDATE)

---

## Vercel - Variables de Entorno

### Paso 1: Obtener credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona el proyecto **AnitaMusic**
3. Ve a **Settings → API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Paso 2: Configurar en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/webonlineinfo28-lgtm/anita-web/settings/environment-variables)
2. Añade las variables:

| Nombre | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | `https://kvplwylfoterjmajnhmo.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `[tu anon key de Supabase]` |

3. Haz clic en **Save**
4. Ve a **Deployments**
5. Selecciona el deployment más reciente
6. Haz clic en **···** → **Redeploy**

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
| Nombre | Valor |
|--------|-------|
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

| Problema | Solución |
|----------|----------|
| Supabase no conecta | Verificar credenciales en Vercel + Redeploy |
| Build falla | `npm install` + `npm run build` |
| Tests fallan | `npm test` para ver detalles |
| 404 en Vercel | Verificar `base: "./"` en vite.config.js |