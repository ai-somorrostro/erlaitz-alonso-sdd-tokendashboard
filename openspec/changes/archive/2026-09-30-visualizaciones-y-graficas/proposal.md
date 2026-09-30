# Proposal

## Why

La tabla responde "cuánto" y "cuál", pero por construcción no puede responder "cómo evoluciona": no tiene eje temporal. El conjunto de datos solo guarda dos agregados —el día y la semana— así que la forma no existe en ninguna parte del dashboard.

Tampoco se ve el reparto del volumen entre entrada y salida. `totalTokens()` suma ambos, de modo que un modelo que quema tokens de salida a 3× su precio de entrada resulta indistinguible de uno que quema entrada barata. El desglose solo existe hoy en los precios, nunca en el consumo.

Y con 7 modelos el rango de consumo es de 86× (24k a 2.07M tokens hoy), lo que obliga a recorrer 28 números fila a fila para descubrir que un modelo se lleva el presupuesto. Esa es exactamente la tarea que la vista de un vistazo debería hacer y no hace.

## What Changes

- **El consumo pasa a ser una serie.** `consumo` deja de guardar `{dia, semana}` y guarda `dias`: siete días con tokens de entrada y salida. El día es el último elemento y la semana es su suma. La representación única elimina la posibilidad de que ambas se desincronicen y convierte el invariante "la semana incluye el día" en estructural en lugar de en algo que hay que recordar al editar el fixture.
- **Gráfico de precios por modelo.** Barras horizontales con el precio de entrada y el de salida por modelo, el valor rotulado en cada barra y el ancho del trazado acotado, porque estirado a todo el ancho la diferencia entre el modelo más caro y el más barato resulta ilegible.
- **Pequeños múltiplos de consumo.** Un panel por modelo con los siete días, en áreas apiladas de entrada y salida, de forma que el contorno superior del panel es el total. Cada panel lleva su escala propia y el valor absoluto en la cabecera: la forma la da el gráfico, la magnitud la tabla.
- **Las visualizaciones se derivan del conjunto filtrado.** Los gráficos leen exactamente el mismo conjunto de modelos visibles que la tabla, de modo que no existe una segunda fuente de verdad sobre lo que el usuario está viendo.
- **Un hueco en el fixture.** Un modelo pasa a tener un día sin dato, para que la degradación a marcador explícito sea verificable en la nueva granularidad en lugar de quedar como un requisito que ya no tiene caso que lo dispare.
- **Sin dependencias, sin compilación y sin tests.** SVG generado con `createElementNS`, en línea con el resto del proyecto.

No hay cambios de rotura: la forma del fixture es interna al código y no tiene consumidores fuera de `app.js`.

## Capabilities

### New Capabilities

Ninguna. Los gráficos son otra expresión del propósito que ya declara `model-comparison-dashboard` —comparar de un vistazo precio, modalidades y consumo—, de modo que encajan como requisitos nuevos y modificados de esa capacidad en lugar de como una capacidad aparte.

### Modified Capabilities

- `model-comparison-dashboard`: se añaden los requisitos de visualización de precios, de evolución del consumo y de coherencia con el conjunto filtrado; y se modifican los requisitos de consumo en dos unidades, de conjunto de datos de prueba y de funcionamiento autónomo, porque los tres cambian de comportamiento al derivar el consumo de una serie y al cubrir las visualizaciones.

## Impact

- `app.js` — el array `MODELOS` pasa de dos agregados por modelo a una serie de siete días; nueva derivación de ventanas; `valorColumna` consume la derivación en sus cuatro casos de consumo; `render()` reparte el conjunto visible a la tabla, al contador y a los dos gráficos. `totalTokens()` y `calcularCoste()` no cambian: reciben el mismo `{tokensIn, tokensOut}`.
- `index.html` — dos contenedores de gráfico por encima de la tabla, dentro de un bloque que puede ocultarse.
- `styles.css` — rejilla de paneles, estilo de barras y dos variables nuevas de color para las series de entrada y salida, distintas de las de los badges de modalidad.
- `README.md` — documenta los dos gráficos y el cambio de forma del fixture.
- Sin dependencias nuevas, sin paso de compilación, sin peticiones de red. La ausencia de librería de gráficos se apoya en el requisito de funcionamiento autónomo que ya existe, ampliado para cubrir las visualizaciones.
