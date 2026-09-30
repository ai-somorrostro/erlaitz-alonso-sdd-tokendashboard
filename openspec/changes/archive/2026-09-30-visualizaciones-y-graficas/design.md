# Design

## Context

Ver `proposal.md` para la motivación. Lo que condiciona el diseño es el estado actual y estas restricciones concretas:

- `app.js` renderiza exclusivamente construyendo nodos DOM y vaciando el contenedor con `replaceChildren()` (`renderTabla`, `render()`). No existe ninguna abstracción de dibujo.
- `render()` se dispara con **cada tecla** del buscador (`alEscribirNombre` → `render()`), de modo que el coste de redibujar está en el camino caliente de la interacción más frecuente.
- `modelosVisibles()` es el único punto donde se decide qué modelos se ven: filtra y ordena, y devuelve ese mismo array. `render()` lo llama una vez y lo reparte al contador y a la tabla.
- El stylesheet está construido sobre variables CSS (`--acento`, `--badge-*`), y los badges de modalidad ya usan una paleta con significado propio: Texto, Imagen, Audio y Video.
- El proyecto no tiene dependencias, ni paso de compilación, ni infraestructura de tests, ni CI. La verificación hasta ahora es la especificación leída más abrir `index.html`.
- La especificación tiene una posición firme sobre los valores ausentes: marcador explícito en lugar de celda vacía indistinguible de un fallo de carga, y en ningún caso `NaN` ni `undefined`.

## Goals / Non-Goals

**Goals:**

- Que los gráficos se alimenten del mismo conjunto que la tabla, sin una segunda ruta de datos.
- Que añadir un gráfico no exija un patrón de render distinto del que ya usa la tabla.
- Que el dibujo happening en el camino caliente de cada tecla sea barato.
- Que los valores ausentes en la nueva granularidad por día se distingan de los valores cero reales.
- Que la paleta de las series no colisione con la de las modalidades.

**Non-Goals:**

- Gráficos interactivos: no hay hover con tooltip, no hay zoom, no hay selección de un rango de días. Un `<title>` nativo por barra y por día es el máximo.
- Historial real. Siguen siendo datos de prueba; el cambio no prepara ninguna integración con un origen externo.
- Split del consumo en columnas de la tabla. La tabla sigue mostrando el total; el desglose entrada/salida vive solo en el gráfico, y eso es deliberado.
- Cualquier abstracción de render incremental, Virtual DOM, o gestor de estado.

## Decisions

### 1. SVG, no Canvas

El argumento decisivo no es la calidad del dibujo, es que el proyecto ya tiene un patrón de render y SVG encaja en él mientras que Canvas obliga a un segundo.

- SVG es DOM. `crearGrafico()` sigue la forma de `crearFila()` y `crearCabecera()`: construir nodos, `appendChild`, y un `replaceChildren()` por contenedor.
- Canvas exigiría un camino imperativo aparte con su propio estado, redibujado explícito desde `render()`, que es justo el segundo sistema que el resto del diseño evita.
- El CSS manda sobre el color. Las formas SVG se pintan con `--serie-entrada` y `--serie-salida` desde `styles.css`. Canvas obligaría a leer los colores desde JavaScript y a pasarlos a cada llamada de dibujo, con la paleta duplicada en dos sitios y sin una fuente única.
- Accesibilidad coherente con el resto. El proyecto ya usa `aria-sort`, `aria-live` y `scope`. SVG admite `role="img"` con `<title>` y `<desc>`. Canvas es opaco para un lector de pantalla: la única salida sería una alternativa de texto fuera de pantalla, más trabajo que el gráfico mismo a este tamaño.
- Canvas necesita `devicePixelRatio` y un listener de `resize` para no salir borroso. SVG sale gratis.
- El único argumento real a favor de Canvas son los miles de elementos. Aquí el peor caso son 7 paneles × 2 series = 14 `<path>`, más las barras de precio.

**Alternativas**: Chart.js o D3, descartadas de entrada — contradicen el requisito de funcionamiento autónomo y el usuario pidió explícitamente no usarlas.

### 2. La serie sustituye a los dos agregados

`consumo` pasa a ser `{ dias: [7 × { tokensIn, tokensOut }] }`. El día es el último elemento y la semana es la suma.

La alternativa descartada era añadir `dias` **junto a** `dia` y `semana`, que es más barata de escribir pero deja dos representaciones del mismo hecho. Con esa forma, `dia` debería ser el último día y `semana` la suma, y nada obliga a que lo sean: un día que alguien edite el fixture sin tocar el otro deja la tabla contradiciéndose a sí misma, y ninguna prueba lo detecta porque no hay pruebas. La forma de una sola serie hace que el invariante de la especificación sea estructural.

Consecuencia útil: `totalTokens()` y `calcularCoste()` **no cambian ni una línea**. Siguen recibiendo un `{tokensIn, tokensOut}`. Lo único nuevo es una función que devuelve ese objeto para la ventana diaria y para la semanal, y los cuatro casos de consumo de `valorColumna` pasan a pedirlo.

**Alternativas**: mantener `dia` y `semana` como día actual y semana calendario reales, con 28 días. Descartada porque obliga a 392 números en el fixture, que nadie mantiene a mano, o a un generador con semilla que vuelve el fixture opaco a inspección. Con datos inventados, 7 días alcanza y el conjunto sigue siendo legible de un vistazo, que es la propiedad que hace útil un fixture de prueba.

### 3. Eje relativo, no fechas

El último día de la serie es siempre hoy; los siete puntos se rotulan `-6 … -1` y el último como el día actual.

La alternativa con fechas reales en el fixture no caduca, pero cuando se abra el 1 de octubre seguirá enseñando la semana del 24 al 30 de septiembre como si fuera la actual. La de días de la semana calculados al cargar es peor: miente sobre qué día es hoy en cuanto el fixture no coincide con la fecha de apertura.

La etiqueta relativa nunca miente y el conjunto de datos sigue siendo determinista, lo que importa cuando el objetivo del prototipo es revisar el diseño y no ver cómo cambia entre recargas.

**Coste asumido**: se pierde la lectura "el fin de semana se consume menos". Con datos inventados ese patrón lo escribiría el propio fixture, así que no es información que se pierda sino ruido que se evita.

### 4. Escala propia por panel

Cada panel se normaliza contra su propio máximo. La escala compartida no es peor opción, es imposible: para que la silueta del panel menor sea legible necesita ocupar en torno al 20 % del alto, así que el máximo no puede pasar por 120k tokens, y el modelo de mayor consumo llega a 2.07M. El cociente es de 86× y haría falta de 5× o menos. Log no ayuda, porque hay un modelo con precio de salida exactamente cero.

El reparto de responsabilidades que sale de ahí: **la forma la da el gráfico, la magnitud la tabla**. El valor absoluto del día actual va en la cabecera de cada panel, junto al nombre del modelo, para que la lectura de magnitud no dependa de la altura.

**Alternativas**: un conmutador entre escala compartida y escala propia. Descartada porque añade estado y un escenario de especificación para resolver un problema que la escala propia ya resuelve, y porque la escala compartida no es una opción menos detallada sino una no functional.

### 5. Áreas apiladas, no dos líneas superpuestas

Entrada y salida se dibujan apiladas, de modo que el contorno superior del panel es el total de tokens del día, que es exactamente lo que cuenta la columna de la tabla. Con dos líneas superpuestas habría que sumar mentalmente para obtener el total, y con la entrada siempre por encima o por debajo de la salida según el modelo, las dos tenderían a solaparse en el extremo de la serie.

Una propiedad que sale gratis: el modelo sin tokens de entrada —cero real, no un hueco— dibuja una banda de altura cero y solo se ve la de salida, que dice la verdad sin una línea de código especial.

### 6. Un solo `modelosVisibles()`, cuatro consumidores

`render()` pide el conjunto visible una vez y lo reparte al contador, a la tabla y a los dos gráficos. Los gráficos no mantienen lista propia.

Esto tiene un efecto secundario que hay que respetar: `modelosVisibles()` devuelve el array **ya ordenado** por la columna activa (`filtrados.sort(...)` muta y devuelve). Como la especificación exige que ordenar la tabla no reordene los gráficos, cada gráfico ordena una copia con `.slice()`. Sin el `.slice()`, el gráfico estaría ordenando el array de la tabla.

**Alternativas**: mantener un conjunto propio en los gráficos y "sincronizarlo" con el de la tabla. Es exactamente la segunda verdad que la especificación prohíbe, y obligaría a dos lugares donde sincronizar.

### 7. Colores nuevos para las series

`--serie-entrada` y `--serie-salida` se definen nuevas, distintas de `--badge-texto-fondo` y compañía, que ya significan modalidad. Reutilizar la paleta de badges sería la vía obviamente práctica — dos variables que ya existen y combinan bien con el resto — y produciría dos significados para el mismo color en la misma pantalla: azul significaría a la vez Texto y entrada.

Las dos series se distinguen también por luminancia, no solo por tono, para que el gráfico no dependa de la percepción del color.

### 8. Un `<path>` por serie y panel

La `d` de cada área se construye como string y se asigna al atributo de un solo `<path>`. La alternativa —un `<rect>` por día y por serie— serían 98 elementos en lugar de 14, reconstruidos en cada tecla.

### 9. Redibujo completo, sin render incremental

`render()` ya reconstruye la tabla entera en cada tecla y no hay problema. Los gráficos siguen el mismo patrón. Un render diferencial sería una dependencia y una abstracción que nadie ha pedido.

### 10. El bloque se oculta, no muestra un segundo estado vacío

Cuando ningún modelo supera los filtros, el bloque de gráficos se oculta con el atributo `hidden` y no dibuja su propio mensaje. La causa ya está explicada en el estado vacío de la tabla, que enumera los criterios activos y ofrece limpiarlos, y el contador con `aria-live` va anunciando el recuento durante todo el proceso de filtrado. Dos mensajes de "no hay nada" compitiendo en la misma pantalla serían peores que uno.

## Risks / Trade-offs

**[El fixture crece y pierde legibilidad]** — De 7 modelos × 2 agregados a 7 × 7 días. → Formato compacto, una línea por día, y el bloque de cada modelo alineado para que las columnas de días se comparen a simple vista. Si en el futuro son 10 modelos son 490 números, y ahí el fixture sí deja de ser mantenible a mano: es el punto en el que la decisión de no generar con semilla se paga, y el punto en el que hay que revisarla.

**[Un día sin dato rompe la semana de forma visible]** — Toda la semana de ese modelo pasa a "no disponible" por un solo día. → Es deliberado: la alternativa es una suma que subestima el gasto sin avisar, que es el peor fallo posible en un panel de coste. El hueco se dibuja en el panel, así que se ve por qué.

**["Semana" significa los últimos siete días, no la semana calendario]** → Queda escrito en el README junto a los datos de prueba. Cuando haya datos reales, la decisión entre ventana rodante y semana natural tendrá que tomarse en ese momento, y este diseño no la precludes: la serie es una lista de días y las dos ventanas se derivan al final.

**[El redibujo en el camino caliente crece]** — Se reconstruyen 14 `<path>` y las cabeceras en cada tecla. → Despreciable frente al coste actual de reconstruir la tabla entera, que es la comparación que importa. El SVG es lo que permite que el coste siga siendo proporcional al número de paneles y no al de días.

**[`createElementNS` se olvida]** — Un `createElement` en un contexto SVG produce un elemento HTML que no se dibuja, y el síntoma es un gráfico vacío sin error. → Todos los nodos de gráfico salen de un único helper de creación de elementos del espacio de nombres, de modo que el error sería igual de notorio en todos los sitios y no solo en uno.

**[Sin tests, la deriva de los datos no la atrapa nadie]** → Es el estado del proyecto y este cambio no lo empeora, pero tampoco lo cubre. El fixture incluye deliberadamente un día sin dato y un día con cero real, precisamente para que ambos casos se puedan comprobar a ojo al abrir `index.html`. La verificación es manual, y el README dice cómo.

**[El modelo con menor consumo no es el más barato por token]** — Un panel pequeño junto al nombre de un modelo barato puede inducir a leer "este modelo sale barato" cuando lo que dice es "este modelo se usa poco". → Ninguna visualización muestra coste por token junto a la forma, para no alimentar esa lectura. Si algún día hace falta, sería una tercera vista, no un añadido a estas dos.

## Migration Plan

No hay despliegue, migración de datos ni compatibilidad que mantener: es un fichero estático abierto desde el sistema de ficheros, y la forma del fixture es interna a `app.js` sin consumidores externos. El orden importa por todo lo demás:

1. Reestructurar `MODELOS` a la serie y añadir la derivación de ventanas, dejando temporalmente las columnas de la tabla como estaban. En este punto la tabla debe seguir mostrando exactamente lo mismo que antes.
2. Cambiar los cuatro casos de consumo de `valorColumna` para consumir la derivación. Verificar que la tabla no cambia: mismo orden, mismos importes.
3. Solo entonces añadir los gráficos, que ya reciben el conjunto correcto.

El rollback es revertir los ficheros; no hay estado persistente que limpiara.

## Open Questions

- Los valores concretos de presentación —ancho máximo del trazado de precios, alto de un panel, separación entre paneles— no están fijados por la especificación y se pueden ajustar durante la implementación sin tocar ningún artefacto. Lo único que no es ajustable es que el trazado esté acotado y que los paneles no se estiren al filtrar.
- Si el conjunto de prueba llegara a 10 modelos, la decisión de escribir la serie a mano en lugar de generarla con semilla deja de ser sostenible. Está anotada como riesgo arriba y la revisión corresponde al momento en que se proponga ese tamaño, no a este cambio.
