---
name: react-hook-form
description: Gestión de formularios complejos con validación Joi.
---

# Guía de React Hook Form + Joi

Los formularios del proyecto se gestionan con **React Hook Form** y se validan utilizando **Joi**.

## Definición de Validaciones

Los esquemas de validación y los tipos de datos del formulario deben residir en `src/validations/`.

- **Esquema**: Definido con `Joi.object({...})`.
- **Traducciones**: Se debe usar `getJoiLocaleMessages()` de `src/config/i18n.ts` para que los mensajes de error estén localizados.

```typescript
// src/validations/example.ts
import Joi from 'joi'
import { getJoiLocaleMessages } from 'src/config/i18n'

export const exampleSchema = Joi.object({
  name: Joi.string().required(),
}).messages(getJoiLocaleMessages())
```

## Integración en Componentes

Usar el resolver de Joi en el hook `useForm`:

```typescript
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: joiResolver(exampleSchema),
  defaultValues: { ... }
})
```

## Traducciones Base

Las traducciones genéricas para errores de validación (como "Campo obligatorio") están configuradas en `src/config/i18n.ts` y se inyectan en los esquemas mediante el helper mencionado.
