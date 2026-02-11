---
name: react-query
description: Gestión de estado asíncrono y caché de datos.
---

# Guía de React Query

Utilizamos **TanStack Query** para manejar las peticiones a la API, el manejo de errores y la caché.

## Configuración Principal

El cliente de Query se configura en `src/config/react-query.ts`.

## Gestión de Keys

Para mantener la consistencia y evitar errores tipográficos, todas las keys de consulta deben estar centralizadas en `src/config/queries.ts`.

```typescript
// src/config/queries.ts
export const RECIPES = 'recipes'
export const INGREDIENTS = 'ingredients'
```

## Uso en Hooks

No se deben llamar a las mutaciones o queries directamente en los componentes de las páginas. En su lugar, se deben crear hooks especializados en `src/hooks/`.

```typescript
// src/hooks/use-get-recipes.ts
export const useGetRecipes = () => {
  return useQuery({
    queryKey: [QUERIES.RECIPES],
    queryFn: () => recipesService.getAll(),
  })
}
```

## Invalidación de Caché

Tras una mutación (crear/editar/borrar), es obligatorio invalidar las keys correspondientes para refrescar los datos.

```typescript
const queryClient = useQueryClient()
// ...
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [QUERIES.RECIPES] })
}
```
