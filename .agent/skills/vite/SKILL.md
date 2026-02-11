---
name: vite
description: Configuración de Vite y gestión de imports absolutos.
---

# Guía de Vite

Este proyecto utiliza **Vite** como herramienta de construcción y servidor de desarrollo.

## Imports Absolutos

Se debe usar el alias `src` para todos los imports internos para evitar rutas relativas complejas (`../../..`).

- **Configuración**: El alias está definido en `vite.config.ts`.
- **Uso**: Siempre que importes un archivo dentro de `src`, hazlo desde la raíz del alias.

```typescript
// Correcto
import { Button } from 'src/components/atoms/button'

// Incorrecto
import { Button } from '../../../components/atoms/button'
```

## Variables de Entorno

- Las variables de entorno se gestionan mediante archivos `.env` (dev, pre, pro).
- Se accede a ellas mediante `import.meta.env.VITE_NOMBRE_VARIABLE`.
- Solo las variables prefijadas con `VITE_` son accesibles en el cliente.
