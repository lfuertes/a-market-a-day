---
name: react-router
description: Configuración de rutas centralizada y seguridad.
---

# Guía de React Router

La navegación se gestiona de forma centralizada para facilitar el mantenimiento.

## Configuración de Rutas

Todas las rutas deben definirse en un objeto constante en `src/config/routes.ts`.

```typescript
const routes = {
  root: '/',
  login: '/login',
  recipesList: '/recipes',
  recipesEdit: '/recipes/:recipeCode/edit',
  // ...
}
```

## Navegación y Parámetros

- Usar `useNavigate` para navegación programática.
- Usar `useParams` para extraer variables de la URL (e.g., `:recipeCode`).
- Usar `generatePath` de `react-router-dom` cuando necesites construir una URL con parámetros.
