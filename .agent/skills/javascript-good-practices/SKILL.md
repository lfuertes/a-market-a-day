---
name: javascript-good-practices
description: Define las reglas específicas para escribir javascript robusto, legible y mantenible.
---

### Variables y Funciones
- Usar `const` por defecto; usar `let` solo cuando hay reasignación
- Preferir arrow functions, especialmente en callbacks
- Mantener funciones pequeñas y con una sola responsabilidad
- Usar nombres de variables y funciones significativos y autoexplicativos
- Escribir funciones puras siempre que sea posible

### Sintaxis Moderna
- Usar template literals en lugar de concatenación de strings
- Desestructurar objetos y arrays para mejorar legibilidad
- Usar optional chaining (`?.`) para evitar accesos a `undefined`
- Usar nullish coalescing (`??`) para valores por defecto
- Preferir métodos de array (`map`, `filter`, `reduce`) sobre bucles tradicionales
- Usar módulos ES (`import` / `export`) para organizar el código

### Asincronía
- Usar `async/await` en lugar de cadenas de `then`
- Manejar errores en async/await con `try/catch`
- Evitar crear Promises innecesarias
- Recordar que funciones `async` siempre retornan Promises

### Inmutabilidad
- Evitar mutar datos directamente
- Usar spread operator (`...`) y métodos inmutables de array
- Usar `Object.assign` o copias profundas cuando sea necesario

### Seguridad y Robustez
- Manejar errores explícitamente
- Limpiar listeners, timers y subscripciones
- Evitar operaciones síncronas costosas que bloqueen el event loop
- Usar `"use strict"` cuando aplique para detección temprana de errores
