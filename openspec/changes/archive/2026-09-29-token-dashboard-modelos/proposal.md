# Proposal

## Why

El equipo no tiene hoy una forma objetiva de elegir entre modelos de lenguaje open source: el precio, la latencia de primera respuesta, las modalidades soportadas y el consumo real del equipo viven dispersos, y comparar "de un vistazo" exige consultar cada fuente por separado. Falta una vista única que responda a las tres preguntas que condicionan cualquier decisión de uso: cuánto cuesta, qué tan rápido empieza a responder y qué contenido acepta y devuelve, con el consumo del equipo como contexto para saber cuánto pesa realmente cada modelo.

## What Changes

- Añadir un dashboard interno estático (HTML + CSS + JS plano, sin librerías ni frameworks) que muestre una tabla comparativa de modelos open source.
- La tabla agrupa sus cabeceras en bloques: precio por millón de tokens (entrada y salida separados), TTFT, modalidades (entrada y salida) y consumo del equipo.
- Mostrar el consumo del equipo en dos unidades simultáneas — tokens y coste en euros/dólares — con ventana diaria y semanal.
- Mostrar las modalidades como badges compactos de una letra (texto, imagen, audio, video) acompañados de una leyenda visible en la propia pantalla, sin depender de tooltips.
- Ordenar la tabla por cualquier columna numérica mediante un clic en su cabecera.
- Alimentar el dashboard con un conjunto de datos de prueba hardcodeado, suficiente para validar el diseño, que cubra modelos de solo texto, texto+imagen y audio.

**No-goals** para este cambio: integración con proveedores reales, persistencia de datos, backend, autenticación, filtros o búsqueda, alertas y vistas adicionales. El objetivo es validar el diseño y la idea con datos ficticios.

## Capabilities

### New Capabilities
- `model-comparison-dashboard`: Renderizado de una tabla comparativa de modelos de lenguaje open source que muestra precio de entrada y salida por millón de tokens, TTFT, modalidades de entrada y salida, y consumo del equipo en tokens y coste con ventana diaria y semanal, incluyendo leyenda de modalidades, ordenación por columna y datos de prueba.

### Modified Capabilities

Ninguna. El proyecto no tiene capacidades definidas todavía.

## Impact

- Ficheros nuevos: `index.html`, `styles.css` y `app.js` en la raíz del repositorio, autocontenidos y ejecutables abriendo `index.html` directamente en el navegador.
- Sin dependencias de npm, sin paso de build, sin servidor.
- Sin impacto en APIs, datos persistidos o sistemas externos.
- El conjunto de datos de prueba vive en `app.js` y no se expone ningún endpoint de red.
