---
name: react
description: Estándares de desarrollo para proyectos de React, incluyendo arquitectura y estructura de carpetas.
---

# Desarrollo React

Esta guía establece los estándares y patrones para el desarrollo de React. Todo nuevo código debe seguir estas directrices para mantener la coherencia y escalabilidad del proyecto.

## Arquitectura: Atomic Design

El proyecto utiliza **Atomic Design** para organizar los componentes en `src/components/`:

- **Atoms**: Componentes básicos e indivisibles (botones, inputs, iconos). No deben tener lógica de negocio.
- **Molecules**: Grupos de átomos que funcionan juntos (un campo de formulario con etiqueta y error).
- **Organisms**: Componentes complejos que forman secciones de la interfaz (cabeceras, tarjetas de datos, listas complejas). Pueden contener lógica de negocio mediante hooks.
- **Pages**: Unidades de nivel superior que representan rutas. Orquestan organismos y gestionan el estado global de la vista.
- **System**: Componentes transversales del sistema (layouts, proveedores de contexto, etc.).

## Tech Stack Core

- **Framework**: Vite + React (TypeScript)
- **UI & Styling**: Tailwind CSS (por defecto)
- **Routing**: React Router DOM
- **Global State**: Zustand
- **Server State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Joi (validación)
- **API**: Axios
- **I18n**: i18next + react-i18next

## Convenciones de Nomenclatura

- **Archivos**: Los componentes deben residir en una carpeta con nombre en `kebab-case` y el archivo principal debe ser `index.tsx`. Los hooks y lógica usan `kebab-case.ts`.
  - Ejemplo: `user-profile-card/index.tsx`, `use-get-users.ts`.
- **Componentes**: `PascalCase` para el nombre de la función o constante exportada. El nombre del archivo dentro de la carpeta siempre será `index.tsx`.
- **Hooks**: Prefijo `use` seguido de `kebab-case`.
  - Ejemplo: `const useMyCustomHook = () => ...` en el archivo `use-my-custom-hook.ts`.
- **Tipos/Interfaces**: `PascalCase`. Preferiblemente definidos en `src/model/` o dentro de la carpeta del componente (ej: `types.d.ts`) si son locales.

## Estructura de Directorios (src/)

```text
src/
├── assets/         # Imágenes, estilos globales, fuentes
├── components/     # Átomos, moléculas, organismos, páginas
├── config/         # Configuraciones (API, Rutas, Query Keys, i18n)
├── context/        # React Contexts (uso limitado)
├── hooks/          # Custom hooks reutilizables (la mayoría de la lógica va aquí)
├── lib/            # Configuraciones de librerías externas
├── model/          # Tipos e interfaces de TypeScript (.d.ts)
├── services/       # Llamadas API agrupadas por entidad (Axios)
├── utils/          # Funciones auxiliares puras
└── validations/    # Esquemas de validación Joi
```

## Patrones de Implementación

### 1. Componentes

Cada componente debe exportar su interfaz de props. Evita usar placeholders y usa componentes de la librería de UI elegida. El archivo debe llamarse `index.tsx` dentro de su carpeta.

```tsx
// src/components/atoms/my-component/index.tsx
export interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  return (
    <section className="p-4 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <button
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        onClick={onAction}
      >
        Acción
      </button>
    </section>
  );
};
```

### 2. Gestión de Rutas (React Router)

Las rutas deben estar centralizadas en un archivo de configuración para evitar "magic strings" en la aplicación.

- **Ubicación**: `src/config/routes.ts`
- **Uso**: Importar el objeto `routes` para navegación y definición de `Route`.

```ts
// src/config/routes.ts
const routes = {
  root: "/",
  users: "/users",
  userDetail: "/users/:id",
};
export default routes;
```

### 3. Gestión de Query Keys (React Query)

Para mantener la coherencia en la invalidación y el acceso a la caché, las keys de React Query deben ser constantes.

- **Ubicación**: `src/config/queries.ts`
- **Patrón**: Usar constantes descriptivas.

```ts
// src/config/queries.ts
export const USERS = "users";
export const PROJECTS = "projects";
```

### 4. Custom Hooks (Lógica y Datos)

Encapsula la lógica de fetching y mutaciones en hooks.

```tsx
// src/hooks/use-get-something.ts
import { useQuery } from "@tanstack/react-query";
import { USERS } from "src/config/queries";
import { myService } from "src/services/my-service";

export const useGetUsers = () => {
  return useQuery({
    queryKey: [USERS],
    queryFn: () => myService.getUsers(),
  });
};
```

### 5. Servicios API (Axios)

Usa una instancia centralizada (ej. `src/services/index.ts`) que maneje:

- **Base URL** desde variables de entorno.
- **Interceptores** para tokens de autorización.
- **Renovación automática de tokens**: Implementada mediante la librería **axios-auth-refresh**, permitiendo capturar errores 401 y renovar el token de forma transparente para el resto de la aplicación.

### 6. Gestión de Modelos (Tipado)

Define todos los tipos e interfaces en `src/model/` usando la extensión `.d.ts`.

- Nombra los archivos según la entidad: `user.d.ts`, `project.d.ts`.

### 7. Gestión de Estado (Zustand)

Usa Zustand para estado global de la aplicación.

```tsx
// src/components/system/app/store.ts
interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));
```

### 8. Context API (Estado Local y Prop Drilling)

Para estados locales que necesiten ser compartidos entre varios subcomponentes de una página u organismo, y para evitar el **prop drilling**, se recomienda el uso de **React Context**.

- **Ámbito**: Úsalo cuando el estado sea específico de una sección o flujo concreto (ej. un formulario complejo dividido en varios pasos o componentes de una página), no para estado global.
- **Implementación**: Crea un hook personalizado para consumir el contexto, asegurando un tipado correcto y manejando casos donde el provider no esté presente.

### 9. Estados de Carga (Skeletons)

Prioriza el uso de Skeletons estructurales sobre Spinners de pantalla completa.

```tsx
export const UserCard = ({
  user,
  isLoading,
}: {
  user?: User;
  isLoading: boolean;
}) => {
  if (isLoading) return <UserCardSkeleton />;
  if (!user) return null;

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
    </div>
  );
};
```

## Internacionalización (i18n)

El proyecto utiliza un flujo de trabajo automatizado para la gestión de traducciones:

1. **Uso de Literales como Claves**: Al usar el hook `useTranslation`, utiliza directamente el texto literal en el idioma base (ej. español) como clave.
   ```tsx
   const { t } = useTranslation();
   return <button>{t("Guardar cambios")}</button>;
   ```
2. **Extracción Automática**: Antes de realizar un commit, se debe ejecutar el script de extracción para actualizar los archivos de traducción:
   ```bash
   npm run i18n:parse
   ```
   Este script (`i18next "src/**/*.{js,jsx,ts,tsx}" -c i18next-parser.config.cjs`) escanea el código fuente, identifica las nuevas claves y las añade automáticamente a los archivos JSON de traducción de todos los idiomas configurados.
3. **Mantenimiento**: No edites los archivos de traducción manualmente para añadir claves; deja que el parser lo haga por ti para evitar discrepancias entre el código y los recursos de i18n.

## Testing

El proyecto debe mantener un estándar de calidad riguroso mediante diferentes niveles de prueba:

### 1. Pruebas Unitarias y de Integración

- **Herramientas**: Vitest + React Testing Library.
- **Cobertura**: Es obligatorio alcanzar un mínimo del 80% de code coverage para que el código sea aceptado.
- **Ubicación**: Archivos `.test.tsx` u `.spec.ts` dentro de la carpeta del componente (ej: `my-component/my-component.test.tsx`) o junto a la lógica que prueban.
- **Ejecución**: Usa `npm run test:ci` para validar la cobertura localmente o en el CI.

### 2. Pruebas End-to-End (E2E)

- **Herramientas**: Uso de Playwright o Cypress para simular flujos completos de usuario.
- **Enfoque**: Probar las rutas críticas de la aplicación y la integración real entre el frontend y el backend.
- **Ubicación**: Carpeta `tests/e2e/` en la raíz del proyecto.

## Mejores Prácticas

1. **Memoización**: Usa `useMemo` y `useCallback` de forma consciente.
2. **Early Return**: Maneja estados de carga y error al inicio del componente.
3. **Skeleton Loading**: Evita el uso de Spinners genéricos que bloqueen toda la vista. Prefiere siempre el uso de Skeletons o Placeholders que imiten la estructura del contenido final. Esto mejora la percepción de velocidad y la experiencia de usuario (UX) al reducir el salto visual cuando los datos cargan.
4. **Descomposición**: Divide componentes grandes en piezas más pequeñas (Atoms/Molecules).
5. **Tipado Estricto**: Evita el uso de any.
