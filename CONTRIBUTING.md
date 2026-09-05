# 🎪 Anita Festival - Reglas del Proyecto

## 📋 Índice

1. [Reglas de Commits](#-reglas-de-commits)
2. [Reglas de Código](#-reglas-de-código)
3. [Reglas de Convivencia](#-reglas-de-convivencia)
4. [Flujo de Trabajo](#-flujo-de-trabajo)

---

## 📝 Reglas de Commits

### Formato obligatorio

```
<tipo>(<alcance>): <descripción>

[opcional: cuerpo]

[opcional: pie]
```

### Tipos permitidos

| Tipo       | Uso                                  | Ejemplo                              |
| ---------- | ------------------------------------ | ------------------------------------ |
| `feat`     | Nueva funcionalidad                  | `feat(bingo): añadir bombo de bolas` |
| `fix`      | Corrección de bug                    | `fix(chat): corregir escape de HTML` |
| `docs`     | Solo documentación                   | `docs: actualizar README`            |
| `style`    | Formato, lint (sin lógica)           | `style: formatear con Prettier`      |
| `refactor` | Refactorización sin cambio funcional | `refactor(stats): extraer helper`    |
| `perf`     | Mejora de rendimiento                | `perf(bingo): cachear cartones`      |
| `test`     | Añadir o corregir tests              | `test: nuevos casos para bingo`      |
| `chore`    | Mantenimiento, deps, build           | `chore: actualizar Vite`             |
| `ui`       | Cambios solo visuales                | `ui(header): nuevo diseño`           |
| `hotfix`   | Corrección urgente en producción     | `hotfix: pausar bingo crash`         |

### Reglas estrictas

- ❌ **NO** usar `fix:` para cambios visuales
- ❌ **NO** usar `feat:` si solo cambias estilos
- ❌ **NO** commitear código roto o sin tests
- ❌ **NO** commits grandes (>500 líneas sin justificación)
- ✅ **SIEMPRE** usar imperative mood: "add" no "added"
- ✅ **SIEMPRE** descripción corta (≤72 caracteres)
- ✅ **SIEMPRE** enlazar issue si existe: `Closes #123`

### Ejemplos buenos

```
feat(bingo): añadir sistema de líneas diagonales
fix(chat): sanitizar mensajes contra XSS
ui(header): integrar panel de reglas
docs(readme): añadir sección de desarrollo local
```

### Ejemplos malos (y por qué)

```
❌ "fixes" → debe ser "fix"
❌ "WIP" → nunca hacer commit WIP
❌ "Updated stuff" → sin descripción clara
❌ "feat: add feature" → redundant words
✅ "feat(waitlist): rotar DJs automáticamente"
```

---

## 💻 Reglas de Código

### Estructura de componentes

```jsx
// 1. Imports ordenados
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

// 2. Tipos/Interfaces (si TypeScript)
// 3. Constantes
// 4. Componente principal
// 5. Funciones helper (al final, exportadas si se reutilizan)

export default function MiComponente({ prop1, onAction }) {
  const [state, setState] = useState(defaultState)
  return <div>...</div>
}
```

### Orden de imports

1. React built-ins (`react`, `react-dom`)
2. Librerías externas (`framer-motion`, `lucide-react`)
3. Componentes locales (`./Avatar`, `../lib/stats`)
4. Utilidades (`../lib/avatars`)
5. Tipos/Constantes (`../lib/constants`)

### Nomenclatura

| Elemento         | Estilo                                       | Ejemplo                          |
| ---------------- | -------------------------------------------- | -------------------------------- |
| Componentes      | PascalCase                                   | `BingoPanel`                     |
| Archivos         | PascalCase (componentes), kebab-case (otros) | `BingoPanel.jsx`, `chat-core.js` |
| Funciones        | camelCase                                    | `handleSubmit`, `onClick`        |
| Constantes       | UPPER_SNAKE                                  | `MAX_PLAYERS`, `CHAT_MAX`        |
| Variables estado | camelCase                                    | `showModal`, `isLoading`         |
| Props            | camelCase                                    | `onLogin`, `userData`            |
| Clases CSS       | kebab-case                                   | `text-pink-500`                  |

### Reglas de React

- ✅ Usar `useCallback` para callbacks en lists/dependencies
- ✅ Usar `useMemo` para cálculos costosos
- ✅ Componentes funcionales (NO clases)
- ✅ Animaciones con `framer-motion` (NO animate CSS manual)
- ❌ No usar `index` como key en listas
- ❌ No mutar estado directamente
- ❌ No hacer fetch en render (usar `useEffect`)

### Estilos

- ✅ Tailwind CSS para todo
- ✅ Glassmorphism para modales/paneles
- ❌ No inline styles excepto para valores dinámicos
- ❌ No CSS custom excepto en `login-screen.css` y similares

---

## 🤝 Reglas de Convivencia

### Antes de hacer PR

- [ ] Tests pasando (`npm test`)
- [ ] Lint pasando (`npm run lint`)
- [ ] Build pasando (`npm run build`)
- [ ] No console.log residual
- [ ] Responsive verificado

### Code Review

- Responder en ≤24h
- Aceptar o rechazar con razón clara
- No tomar críticas como personales
- Agradecer mejoras sugeridas
- Mínimo 1 aprobación para merge

### Comunicación

- Canal principal: GitHub Issues
- Dudas rápidas: en el PR mismo
- Idioma: **Español** para todo el proyecto

---

## 🔄 Flujo de Trabajo

### Rama principal

```
main (production)
  └── develop (staging)
       ├── feature/nueva-funcionalidad
       ├── fix/bug-descripcion
       ├── ui/cambio-visual
       └── hotfix/urgente
```

### Ciclo de vida

1. **Crear rama** desde `develop`
2. **Desarrollar** con commits pequeños
3. **Testear** localmente
4. **Abrir PR** a `develop`
5. **Code Review** esperar approvals
6. **Merge** con squash si hay commits WIP
7. **Delete** rama tras merge

### Pull Request template

```markdown
## Descripción

Breve explicación del cambio

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Testing

- [ ] Tests unitarios añadidos
- [ ] Tests E2E añadidos
- [ ] Tests existentes pasan

## Checklist

- [ ] Código sigue las reglas del proyecto
- [ ] Auto-review completado
```

---

## ⚡ Comandos Rápidos

```bash
# Desarrollo
npm run dev          # Iniciar dev server
npm run dev:fast     # Dev sin optimizaciones

# Calidad
npm test             # Tests unitarios
npm run lint         # Verificar código
npm run lint:fix     # Auto-corregir
npm run format       # Formatear todo

# Build
npm run build        # Production build
npm run build:analyze # Analizar bundle

# Testing E2E
npm run test:e2e     # Playwright tests
npx playwright test --ui  # UI de tests
```

---

_Última actualización: 2026-09-05_
_Mantenedor: Equipo Anita Festival_
