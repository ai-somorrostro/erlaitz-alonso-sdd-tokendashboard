# Tasks

## 1. Datos de prueba y capa de cálculo

- [x] 1.1 Crear `app.js` con el diccionario `SIGLAS` (`texto/imagen/audio/video` → `T/I/A/V`, con su etiqueta legible) y el array `MODELOS` con 6 modelos que cubran solo texto, texto+imagen y entrada de audio, con `id` kebab-case, `precioIn`, `precioOut`, `ttftMs`, `modalidadesIn`, `modalidadesOut` y `consumo.dia`/`consumo.semana` con `tokensIn`/`tokensOut`; verificar que ningún modelo declara un campo de coste y que existe al menos uno con TTFT ausente para ejercitar el valor emdash
- [x] 1.2 Añadir en `app.js` las funciones de formato `formatearTokens` (miles, abreviando a `1.2M`/`840k`), `formatearPrecio`, `formatearTTFT` (en ms) y `calcularCoste` (`(tokensIn * precioIn + tokensOut * precioOut) / 1e6`), todas devolviendo `—` ante `null`/`undefined`; verificar en la consola del navegador que ningún valor ausente produce `NaN` ni `undefined` y que cambiar el `precioOut` de un modelo cambia el resultado de `calcularCoste` sin tocar ningún otro campo
- [x] 1.3 Declarar en `app.js` la tabla `COLUMNAS` que describe cada columna ordenable (`id`, `etiqueta`, `clave`, `agrupado`) para las 7 columnas numéricas, derivando de la clave las columnas derivadas (`tokensHoy`, `costeHoy`, `tokensSemana`, `costeSemana`) vía `calcularCoste`; verificar que la suma de tokens por ventana (`tokensIn + tokensOut`) coincide con la clave usada para ordenar esa misma columna

## 2. Render estático de la tabla

- [x] 2.1 Crear `index.html` con `<link rel="stylesheet" href="styles.css">` y `<script src="app.js"></script>` (script clásico, sin `type="module"`), un título, una nota visible de que los datos son ficticios y dos contenedores vacíos para leyenda y tabla; verificar abriendo `index.html` con `file://` que no aparece ningún error en consola
- [x] 2.2 Implementar en `app.js` el render del `thead` de dos filas con `rowspan="2"` en Modelo y TTFT, `colspan` en los grupos Precio (2), Modalidades (2) y Consumo (4), `scope="col"` en cada columna y `scope="colgroup"` en cada grupo; verificar en las herramientas de desarrollo que ninguna fila del `thead` tiene celdas que sumen un número distinto de 10
- [x] 2.3 Implementar en `app.js` el render del `tbody` con una fila por modelo y celdas en el orden de las columnas y badges generados a partir de `SIGLAS` para las modalidades, con `title` descriptivo; verificar visualmente que las 6 filas aparecen con precio in/out, TTFT, badges in/out y las 4 columnas de consumo
- [x] 2.4 Implementar en `app.js` el render de la leyenda de modalidades iterando sobre el mismo `SIGLAS` y situándola por encima de la tabla; verificar que las 4 siglas (incluida `V`, que ningún modelo usa) aparecen en pantalla sin hacer scroll y que ninguna letra de la tabla carece de entrada en la leyenda
- [x] 2.5 Añadir en `styles.css` los estilos base de la tabla y de `.badge` (incluida una clase por tipo de contenido), unidades cortas para los valores y `—` como marcador explícito para celdas de modalidades vacías; verificar en el navegador que un modelo sin modalidades de entrada muestra el marcador y no una celda en blanco

## 3. Ordenación por columna

- [x] 3.1 Implementar en `app.js` el estado de ordenación `{ columna, dirección }` y el comparador que ordena una copia del array (`slice().sort`) colocando valores ausentes al final en ambas direcciones; verificar en la consola que `MODELOS` mantiene su orden original tras varias ordenaciones
- [x] 3.2 Conectar el clic en las cabeceras ordenables con el ciclo ascendente/descendente y con el cambio de columna activa, haciendo que cada pulsación re-renderice el `tbody`; verificar que el primer pulso ordena de menor a mayor y el segundo invierte, y que pulsar otra cabecera cambia la ordenación activa
- [x] 3.3 Añadir el indicador de columna activa (flecha `▲`/`▼`) y el atributo `aria-sort` en la cabecera ordenada, y estilizar en `styles.css` el estado activo y el cursor clicable; verificar visualmente que se distingue qué columna ordena y en qué sentido
- [x] 3.4 Comprobar que ordenar por `precioOut` produce un orden distinto de ordenar por `ttftMs` y que ninguna fila mezcla valores de dos modelos distintos tras varias ordenaciones sucesivas; verificar visualmente contra la lista de datos original

## 4. Legibilidad en pantalla ancha y cierre

- [x] 4.1 Ajustar `styles.css` para que la tabla sea legible en un monitor de portátil de 13" sin scroll horizontal obligatorio: anchos de columna estables para badges y cifras, alineación numérica a la derecha y cifras tabulares; verificar redimensionando la ventana a 1280px de ancho que las 10 columnas siguen siendo legibles
- [x] 4.2 Actualizar `README.md` con qué es el dashboard, cómo abrirlo (doble clic en `index.html`, sin servidor ni instalación) y un aviso de que los datos son ficticios; verificar que las instrucciones del README son suficientes para que alguien sin contexto abra y vea la tabla
- [x] 4.3 Recorrer manualmente los 26 escenarios de `openspec/changes/token-dashboard-modelos/specs/model-comparison-dashboard/spec.md` contra el dashboard abierto y anotar cualquier escenario que no se cumpla antes de dar el cambio por terminado
