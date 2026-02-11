---
name: axios
description: Comunicación con la API e interceptores.
---

# Guía de Axios

La comunicación con el backend se centraliza en una instancia de **Axios**.

## Instancia Base e Interceptores

La configuración principal se encuentra en `src/services/index.ts`.

- **Interceptor de Petición**: Añade automáticamente el `Authorization: Bearer <token>` si el usuario está autenticado.
- **Refresh Token**: Se utiliza `axios-auth-refresh` para renovar automáticamente el token JWT cuando un endpoint devuelve un 401.

## Organización de Servicios

Cada entidad de la API debe tener su propio archivo en `src/services/` (e.g., `recipes.ts`, `ingredients.ts`). Estos archivos importan la instancia base de `src/services/index.ts`.

```typescript
// src/services/recipes.ts
import axios from './index'

export const getRecipes = () => axios.get('/recipes').then(res => res.data)
```
