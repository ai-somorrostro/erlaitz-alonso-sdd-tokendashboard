# Tasks

## 1. Formato extendido y marcas de eje

- [x] 1.1 Escribir `formatearTokensExactos(valor)` con separador de millares y sin abreviar, y `formatearPrecioExtendido(valor)` que añade la unidad por millón de tokens; verificar con una evaluación puntual en node que 1450000 devuelve la cifra completa y que 0.006 conserva sus decimales
- [x] 1.2 Escribir `formatearCosteExtendido(valor)` decidiendo los decimales por orden de magnitud igual que hace `formatearPrecio`, con techo en cuatro; verificar con node que 0.00072 no devuelve `$0.00`, que 0.435 devuelve cuatro decimales y que 0 devuelve `$0.0000` y no un marcador de ausencia
- [x] 1.3 Escribir `pasoBonito(maximo, objetivo)` sobre los pasos 1, 2, 2.5, 5 y 10, y `decimalesPara(paso)`; verificar con node, sobre el fixture de los siete modelos, que el eje de tokens de cada uno produce entre tres y cuatro marcas y que el del paso de coste de Whisper necesita cuatro decimales
- [x] 1.4 Comprobar que ningún formatter nuevo modifica `formatearTokens`, `formatearCoste` ni `formatearPrecio`; verificar que la tabla sigue mostrando exactamente los mismos valores que antes del cambio

## 2. Esqueleto del diálogo y su maquetación

- [x] 2.1 Añadir a `index.html` un `<dialog>` fuera de `<main>` con cabecera, fila de navegación, columna izquierda con dos huecos de gráfica y hueco de rejilla de días, y riel derecho de métricas; verificar con una consulta en la consola del navegador que el elemento existe y que sus secciones son las esperadas
- [x] 2.2 Estilar el diálogo con `max-height: calc(100dvh - 2rem)`, `overflow: auto` y `overscroll-behavior: contain`, más el `::backdrop`; verificar que el body queda bloqueado mientras está abierto y que la rueda no desplaza la página por detrás
- [x] 2.3 Declarar la animación de apertura solo bajo `@media (prefers-reduced-motion: no-preference)`; verificar con el navegador en modo de movimiento reducido que no hay transición y con el modo normal que sí la hay
- [x] 2.4 Estilar la retícula de dos columnas y el riel de métricas con las alturas del presupuesto de `design.md`; verificar que el diálogo completo mide como máximo unos 551px de contenido sin abrirlo todavía

## 3. Activación desde la fila

- [x] 3.1 Envolver el nombre del modelo en un `<button>` dentro del `<th scope="row">` con nombre accesible "Ver el detalle de {modelo}" y `aria-haspopup="dialog"`, y resetear en CSS su apariencia para que la fila no cambie de aspecto; verificar que el nombre se ve igual que antes y que `document.activeElement` llega al botón con el tabulador
- [x] 3.2 Añadir el `data-modelo` a cada `<tr>` y una delegación sobre el `<tbody>` que resuelva el modelo por ese atributo; verificar que un clic en cualquier celda de la fila —no solo en el nombre— abre el detalle del modelo correcto
- [x] 3.3 Conectar `showModal()` al abrir y el botón de cerrar a `close()`, dejando el contenido vacío por ahora; verificar con `Enter` y con `Espacio` sobre el botón del nombre que el diálogo abre y se cierra, y que no aparece ningún dato
- [x] 3.4 Devolver el foco al botón de la fila cuando el cierre se produce desde el botón de cerrar del diálogo; verificar con el teclado que tras cerrar el foco está en el nombre del modelo que se estaba viendo y no en el cuerpo del documento

## 4. Contenido del detalle

- [x] 4.1 Derivar por día los tokens de entrada, de salida, el total y el coste con `diaCompleto()`, `totalTokens()` y `calcularCoste()`, sin almacenar nada; verificar que la serie de Qwen 2.5 72B devuelve ausencia en el cuarto día y valor en el último
- [x] 4.2 Derivar `precioEfectivo`, `pesoEnEquipo` por tokens y por coste sobre el conjunto visible, `diaDePico` y `diasConDato`; verificar con node que el precio efectivo de Qwen 2.5 72B da 0.2009 y que el peso de Mixtral 8x22B da 7.4 % de tokens frente a 24.4 % de coste
- [x] 4.3 Rellenar la cabecera con el nombre, los badges de modalidad y el botón de cierre; verificar que un modelo sin modalidades de entrada muestra el marcador explícito y no una celda vacía
- [x] 4.4 Rellenar el riel derecho con precio de entrada y salida, TTFT, las dos ventanas con entrada, salida, total y coste, el peso en el equipo, el día de pico y los días con dato; verificar en los siete modelos que ninguna magnitud sale como marcador de ausencia existiendo en el fixture
- [x] 4.5 Rellenar la rejilla de días con cuatro filas y siete columnas, degradando la columna sin dato a marcador explícito en las cuatro filas; verificar que en Qwen 2.5 72B la columna `-3` muestra ausencia en las cuatro filas y que la celda semanal de su riel también degrada
- [x] 4.6 Añadir la navegación con los modelos visibles y el resaltado del actual, conmutando el contenido sin cerrar el diálogo; verificar que tras filtrar la navegación ofrece exactamente los modelos que la tabla muestra y que al cambiar de modelo el foco permanece en la navegación
- [x] 4.7 Documentar en el README el detalle por modelo, qué es el formato extendido y por qué la tabla sigue abreviada por su ancho de columna; verificar que lo escrito coincide con lo que se ve al abrir `index.html`

## 5. Gráficas con escala absoluta

- [x] 5.1 Calcular el layout absoluto reutilizando el de los paneles de consumo, sustituyendo la normalización por un máximo de serie calibrado con `pasoBonito()`; verificar que el hueco de Qwen 2.5 72B interrumpe el trazado en la misma posición horizontal que su columna `-3` en la rejilla
- [x] 5.2 Dibujar la gráfica de tokens con entrada y salida apiladas, eje de valores absolutos y marcas redondeadas; verificar que el contorno superior de un día coincide con el total de tokens de la columna correspondiente de la rejilla
- [x] 5.3 Dibujar la gráfica de coste con la misma geometría horizontal que la de tokens; verificar que el día de mayor área en las dos gráficas cae en la misma columna para los siete modelos
- [x] 5.4 Rotular el eje de coste con `decimalesPara(paso)`; verificar en Whisper Large v3 y en Render por lotes que el eje muestra cuatro decimales y que su marca más alta no es cero
- [x] 5.5 Pintar las dos series del detalle con `--serie-entrada` y `--serie-salida`, sin variables nuevas; verificar que el salto de luminancia entre las dos se sigue distinguiendo en escala de grises en ambas gráficas
- [x] 5.6 Documentar en el README el eje absoluto y por qué el de coste lleva hasta cuatro decimales; verificar que el ejemplo que aparece en el README es el de un modelo real del fixture

## 6. Comprobación de conjunto

- [x] 6.1 Confirmar que el detalle no introduce recursos externos ni peticiones de red; verificar inspeccionando el documento y la red del navegador con el dashboard en ejecución
- [x] 6.2 Confirmar que todos los nodos de las gráficas del detalle salen del espacio de nombres SVG; verificar que las dos gráficas se dibujan y que no aparece ningún gráfico vacío
- [x] 6.3 Medir el alto del diálogo abierto en una ventana de 768px; verificar que no hay barra de desplazamiento y que la rejilla de días completa queda visible sin desplazar
- [x] 6.4 Abrir los siete modelos uno a uno y recorrer los casos límite del fixture; verificar TTFT ausente en Qwen 2 VL, precio de salida cero real en Whisper, ausencia de modalidades de entrada y TTFT de 2200 ms en Render por lotes, y el día sin dato en Qwen 2.5 72B
- [x] 6.5 Confirmar que los filtros y la ordenación siguen funcionando y que la tabla muestra los mismos valores que antes; verificar con `git diff` que ningún formatter existente ni ningún cálculo de la tabla ha cambiado
- [x] 6.6 Confirmar que con los filtros que dejan cero modelos la tabla sigue mostrando su estado vacío y que no hay forma de abrir el detalle de un modelo invisible; verificar combinando el buscador con un filtro de modalidad hasta llegar al estado vacío
