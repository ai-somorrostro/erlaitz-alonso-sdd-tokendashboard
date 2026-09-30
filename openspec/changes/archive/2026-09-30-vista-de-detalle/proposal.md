# Proposal

## Why

La tabla es el único sitio donde existe un modelo, y está optimizada para comparar filas, no para entender una. Tres cosas que el dashboard necesita y que en ella no se pueden leer:

- **El formato compacto descarta información que no es ruido.** `formatearCoste` redondea a dos decimales, y el equipo entero gastó **$1.49** hoy. Whisper Large v3 cuesta `$0.00072` y Render por lotes `$0.00048`: los dos enseñan `$0.00` en la columna *Hoy coste*, y Render por lotes también en *Semana coste*. Ninguno vale cero. El spec insiste mucho en no confundir "sin dato" con "cero real"; aquí el fallo es el espejo, un cero de formato donde no hay cero, y `formatearPrecio` ya demuestra que la solución —decimales según magnitud— está dentro del proyecto.
- **No existe ninguna serie de dinero.** El consumo por día solo se dibuja en tokens. El coste de cada día vive en el fixture y en ningún sitio de la pantalla. La pregunta "cuándo empezó este modelo a costarme caro" no tiene respuesta.
- **El reparto entre modelos es invisible.** Mixtral 8x22B se lleva el 24.4 % del coste de hoy con el 7.4 % de los tokens; Qwen 2.5 72B consume el 37.7 % de los tokens por el 27.9 % del coste. Son las dos cifras que justificarían el propósito declarado del dashboard —decidir con criterio cuál usar— y no se pueden obtener sin recorrer 28 números fila a fila.

Además, `design.md` (decisión 4) renunció explícitamente a poner valores absolutos en los paneles de consumo: *"la forma la da el gráfico, la magnitud la tabla"*. Era la decisión correcta con 300px de ancho y un panel por modelo. Un detalle de un solo modelo es el sitio donde esa renuncia ya no aplica, porque solo tiene que caber una serie en una escala.

## What Changes

- **La fila pasa a ser activable.** Un `<button>` dentro del `<th>` del nombre abre el detalle; el clic en cualquier punto de la fila es la misma acción. La semántica de tabla no se toca: `scope="row"` sigue siendo un encabezado de fila, no un control disfrazado.
- **El detalle es un `<dialog>` modal**, no un panel lateral. Gana con `showModal()` la trampa de foco, el cierre con `Escape` y el fondo `inert`, y con el fondo inerte nada detrás puede disparar un `render()`, así que el contenido es una foto y no hay estado que sincronizar. Un panel lateral obliga a escribir todo eso a mano y a decidir qué pasa si el filtro cambia con el panel abierto.
- **Dos gráficas con escala absoluta**, una de tokens por día y otra de coste por día, sobre la misma rejilla de siete días. Es el mismo algoritmo de área apilada y el mismo tratamiento del hueco que usan los paneles de consumo, con un eje con valores reales en lugar de normalizado.
- **Los ejes absolutos obligan a un formato de coste por magnitud.** Whisper y Render por lotes necesitan un eje con cuatro decimales; con dos, el eje entero sería una línea plana en cero y la gráfica un rectángulo vacío.
- **Una rejilla de días de 4 filas por 7 columnas** con los valores exactos de entrada, salida, total y coste. En el detalle caben las dos mitades del reparto de responsabilidades que el `design.md` repartió entre el gráfico y la tabla.
- **Métricas derivadas nuevas**, que hoy no existen en ninguna vista: precio efectivo del consumo real, peso del modelo en el equipo por tokens y por coste, día de pico, y días con dato de la serie.
- **Navegación entre los modelos visibles** dentro del propio detalle, para no perder la comparación al cerrar y reabrir.
- **El detalle entra sin scroll** en cualquier viewport de al menos 700px de alto.
- **Sin dependencias, sin compilación y sin tests.** SVG generado con `createElementNS`, igual que el resto del proyecto.

No hay cambios de rotura: la forma del fixture es interna a `app.js` y no tiene consumidores fuera de él.

## Capabilities

### New Capabilities

Ninguna. El detalle por modelo es otra expresión del propósito que ya declara `model-comparison-dashboard` —comparar de un vistazo precio, modalidades y consumo—, de modo que encaja como requisitos nuevos y modificados de esa capacidad en lugar de como una capacidad aparte.

### Modified Capabilities

- `model-comparison-dashboard`: se añaden el requisito de detalle activable desde la fila, el de métricas en formato extendido y el de gráficas del detalle con escala absoluta; y se modifica el requisito de series de consumo para que fije que el color codifica la dirección del flujo y no la unidad medida, porque el detalle dibuja tokens y dinero con la misma paleta.

## Impact

- `app.js` — `<button>` en el `th` del nombre y delegación de clic sobre `<tbody>`; construcción y desmontaje del `dialog`; formatters de formato extendido y de coste por magnitud; `pasoBonito()` para las marcas de eje; layout de las dos gráficas absolutas reutilizando el apilado y el corte por huecos de `tramosDeSerie()`; derivación de precio efectivo, peso en el equipo, día de pico y días con dato; derivación de tokens, coste y total por día.
- `index.html` — un `<dialog>` con su esqueleto, fuera de `<main>`, más la fila de navegación entre modelos.
- `styles.css` — estilos del modal, de las gráficas absolutas, de la rejilla de días y de la navegación; `max-height: calc(100dvh - 2rem)`, `overflow` y `overscroll-behavior` en el diálogo.
- `README.md` — documenta el detalle, el formato extendido y por qué el eje de coste lleva hasta cuatro decimales.
- Sin dependencias nuevas, sin paso de compilación, sin peticiones de red, sin infraestructura de tests.
