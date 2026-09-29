# Comparador de modelos de lenguaje

Dashboard interno para comparar, de un vistazo, los modelos de lenguaje open source más relevantes: cuánto cuestan, qué tan rápido empiezan a responder, qué tipo de contenido aceptan y devuelven, y cuánto consume el equipo hoy y esta semana.

> **Los datos son ficticios.** Precios, TTFT y consumo son de prueba y sirven para validar el diseño y la idea, no reflejan valores reales de ningún proveedor.

## Cómo abrirlo

Haz doble clic en `index.html`. No hace falta servidor, instalación, ni paso de compilación: son HTML, CSS y JavaScript planos sin dependencias.

## Qué muestra

| Bloque | Columnas | Notas |
|---|---|---|
| Modelo | nombre | |
| Precio / 1M tokens | `$ in`, `$ out` | Entrada y salida separadas, porque la salida suele costar bastante más |
| TTFT | milisegundos | Cuánto tarda en devolver el primer token |
| Modalidades | `In`, `Out` | Badges de una letra: `T` texto, `I` imagen, `A` audio, `V` video |
| Consumo equipo | `Hoy tokens`, `Hoy coste`, `Semana tokens`, `Semana coste` | Tokens y coste a la vez, en las dos ventanas |

Pulsa cualquier cabecera numérica para ordenar por esa columna; un segundo pulso invierte el sentido. La cabecera activa muestra una flecha y las filas sin valor se quedan siempre al final.

Un guion largo (`—`) significa que no hay dato para ese modelo, no que falle la carga.

## Ficheros

- `index.html` — estructura de la página
- `styles.css` — estilos
- `app.js` — datos de prueba, cálculos de formato y ordenación

Los datos viven en el array `MODELOS` de `app.js`. El coste nunca se almacena: se calcula siempre a partir de los tokens consumidos y del precio por millón, así que cambiar un precio actualiza todos los importes.
