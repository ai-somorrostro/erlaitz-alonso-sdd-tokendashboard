# Design

## Context

Ver `proposal.md` para la motivación. Lo que condiciona el diseño es el estado actual y estas restricciones concretas:

- `app.js` renderiza exclusivamente construyendo nodos DOM y vaciando contenedores con `replaceChildren()`. No existe ninguna abstracción de dibujo, ni de estado, ni de ciclo de vida. `render()` reconstruye la tabla, el contador y los dos gráficos en cada tecla del buscador.
- Todo lo que ya se sabe calcular existe y está en funciones puras que reciben datos y devuelven números: `ventanas(modelo)` para las dos ventanas de consumo, `calcularCoste(consumo, modelo)`, `totalTokens(consumo)`, `diaCompleto(dia)`, `serieDe(modelo)`, `tramosDeSerie(dias)` para el corte por huecos. Ninguna almacena resultados.
- El dibujo de los paneles de consumo ya resuelve el problema más difícil de este cambio: áreas apiladas de entrada y salida, con el contorno superior como total del día, `tramosDeSerie()` cortando la serie donde falta un día, y una `d` por serie en lugar de un elemento por día. El layout se calcula aparte del dibujado, con `calcularLayoutPanel()` devolviendo números y cadenas.
- Ese layout normaliza: `yDe()` divide por `layout.maximo`, que es el máximo **de ese modelo**. Poner valores absolutos es cambiar la escala de esa función, no escribir un segundo dibujado.
- Los formatters actuales (`formatearTokens`, `formatearCoste`) están escritos para una columna de tabla de ancho limitado. `formatearPrecio` ya resuelve el problema de magnitud decidiendo decimales según el orden de valor, y `formatearCoste` no lo hace porque en la tabla nunca hizo falta.
- La tabla tiene `min-width: 1000px` y su contenedor `overflow-x: auto`. El ancho de una fila está acotado por el de la tabla, no por el del viewport.
- El proyecto no tiene dependencias, ni compilación, ni tests, ni CI. La verificación es la especificación leída más abrir `index.html`.
- El spec es firme en dos puntos que condicionan cada decisión de formato: los valores ausentes se marcan explícitamente y nunca son `NaN`/`undefined`, y un día sin dato no se confunde con un día de valor cero.

## Goals / Non-Goals

**Goals:**

- Que el detalle se construya con el mismo patrón de render que el resto del proyecto: nodos, `appendChild`, `replaceChildren()`.
- Que el eje absoluto reutilice el apilado y el corte por huecos que ya funcionan, cambiando solo la escala.
- Que la tabla no cambie un solo valor de lo que muestra: el formato extendido es exclusivo del detalle.
- Que no aparezca nada que el conjunto de datos ya no sepa y no se haya pedido.
- Que el detalle entre entero en una ventana de portátil.

**Non-Goals:**

- Cualquier estado global nuevo. El detalle no se renderiza desde `render()`, no lee `orden` ni `filtros`, y no se redibuja mientras está abierto.
- Comparar modelos dentro del detalle más allá de la navegación. No hay un modelo "al lado" con el que comparar, ni series superpuestas, ni Difference mode.
- Editar nada. El detalle es de lectura.
- Tooltips, hover o interacción dentro de las gráficas. La última change los declaró non-goal y nada de este cambio los necesita: el detalle resuelve la legibilidad con el eje absoluto y con la rejilla de días, no con interacción.
- Un desglose numérico del coste por dirección. La gráfica de coste muestra el reparto entrada/salida en la altura de las bandas; abrirlo en dos columnas numéricas sería redundante.
- Cambiar el comportamiento de la tabla, del gráfico de precios o de los paneles de consumo más allá del botón en el nombre de la fila.
- Historial, fechas absolutas o cualquier integración con un origen de datos real.

## Decisions

### 1. `<dialog>` modal, no panel lateral

La razón decisiva no es el espacio, es la sincronía. Con `showModal()` el resto del documento queda `inert`: la ordenación y el filtrado dejan de ser accesibles mientras el detalle está abierto, así que no hay ninguna ruta por la que `render()` pueda cambiar lo que el detalle muestra. El contenido se construye al abrir y se destruye al cerrar, y no hay estado que mantener sincronizado.

El panel lateral obligaría a decidir explícitamente qué pasa si el usuario cambia un filtro con el panel abierto: o se sincroniza el modelo abierto, o se cierra el panel, o se muestra un modelo que ya no es visible. Ninguna de las tres sale gratis y la segunda es un comportamiento raro de pantalla. Además, con el panel lateral hay que escribir a mano la trampa de foco, el `Escape`, el clic fuera y el `aria-modal`, que con `showModal()` vienen del propio elemento.

**Alternativas:**

- **Panel lateral a la derecha.** Descartado por lo anterior y porque el contenido pide ancho: dos gráficas de siete días en paralelo necesitan del orden de 600px cada una, y en un riel de 420px se apilan y el detalle se convierte en un scroll largo, que es exactamente el modo de fallo que se quería evitar al elegir modal.
- **Fila que se expande dentro del `<tbody>`**, con un `colspan` bajo la fila pulsada. Es la opción que mejor conserva el contexto y no necesita capas ni foco. Descartada por una razón concreta y medible: la tabla tiene `min-width: 1000px` y el contenido del detalle necesita más que eso para sus dos gráficas en paralelo, de modo que expande la fila empuja scroll horizontal sobre la tabla entera. Además obligaría a decidir qué ocurre con la fila expandida al reordenar o al filtrar, que es un estado que la tabla hoy no tiene.
- **Un overlay propio con `<div>` y estilos.** Ninguna ventaja sobre `<dialog>` y toda la accesibilidad a mano.

### 2. El control activable es un `<button>` dentro del `<th>` del nombre

La tabla tiene una estructura declarada con semántica real: `<th scope="row">` para el nombre, `<th scope="col">` y `scope="colgroup"` en las cabeceras agrupadas, `aria-sort` en las ordenables, `aria-live` en el contador. Añadir un control dentro del nombre conserva todo eso y además toma gratis el foco, la activación con `Enter` y `Espacio`, y `aria-haspopup="dialog"` declarando la relación.

El clic en cualquier punto de la fila se resuelve con una delegación de eventos sobre el `<tbody>`, que es exactamente el patrón que ya usa `alPulsarCabecera` sobre `#tabla-modelos`. Es conveniencia de ratón, no la vía de accesibilidad: si el botón desaparece, el teclado sigue teniendo su camino.

**Alternativas:**

- **`tabindex="0"` en el `<tr>` con manejador de teclado.** Es lo que se ve en muchos dashboards hechos a mano y es lo que más problemas de lector de pantalla causa: el `<tr>` no es un control, hay que mentir sobre la estructura de la tabla para que anuncie algo activable, y el resultado es peor que un botón real dentro de un encabezado de fila.
- **Una columna nueva con un botón de flecha.** Es la más limpia de implementar, pero cambia la geometría de las cabeceras agrupadas —que el spec describe con `rowSpan`/`colSpan`— y añade una columna que no es información del modelo sino una acción.

El botón necesita un nombre accesible que no sea solo el nombre del modelo, del tipo "Ver el detalle de Llama 3.1 70B", y `aria-haspopup="dialog"`.

### 3. Escala absoluta sobre el mismo algoritmo de panel

`calcularLayoutPanel()` ya produce `paso`, `x`, `yBase`, `maximo` y los `d` de ambas series. El detalle es el mismo cálculo con un `maximo` sustituido por el de la serie del modelo y con la escala calibrada a marcas redondas en lugar de al máximo del día.

La ventaja no es estética: es que el hueco, el apilado y el corte por tramos se resuelven **una sola vez** en el proyecto. Si el detalle escribiera su propio dibujado, habría dos lugares donde un día sin dato puede dibujarse como cero, y el spec tiene un requisito entero dedicado a que no ocurra.

El detalle reutiliza también `tramosDeSerie()`, y por eso el hueco de un modelo aparece en las dos gráficas exactamente en la misma posición horizontal.

### 4. Un único generador de marcas de eje para las dos gráficas

Hace falta un paso "bonito" para el eje: el valor máximo del día del modelo dividido por un número objetivo de tramos, redondeado hacia arriba a un múltiplo de 1, 2, 2.5, 5 o 10 en la potencia de diez correspondiente. Comprobado sobre el fixture actual, produce entre tres y cuatro marcas por eje, y en el eje de tokens salen siempre números redondos:

```
  modelo                  eje de tokens                 eje de coste
  Llama 3.1 70B           0 · 500k · 1.0M · 1.5M       $0.00 · $0.20 · $0.40
  Qwen 2.5 72B            0 · 1.0M · 2.0M              $0.00 · $0.20 · $0.40
  Mixtral 8x22B           0 · 200k · 400k               $0.00 · $0.20 · $0.40
  Llama 3.2 Vision        0 · 200k · 400k · 600k       $0.00 · $0.05 · $0.10
  Qwen 2 VL               0 · 250k · 500k · 750k        $0.00 · $0.05 · $0.10
  Whisper Large v3        0 · 50k · 100k · 150k         $0.0000 · $0.0002 · $0.0004 · $0.0006
  Render por lotes        0 · 10k · 20k · 30k           $0.0000 · $0.0002 · $0.0004 · $0.0006
```

El número de decimales de cada marca sale del propio paso: si el paso es mayor o igual que uno, cero decimales; si no, los necesarios. Es el mismo criterio que ya usa `formatearPrecio` y el resultado es que **el eje se formatea, no el valor de la serie**. Las marcas del eje de coste de Whisper necesitan cuatro decimales y con dos el eje entero colapsaría a una línea plana en cero.

**Alternativas**: calcular el paso con 1/2/5/10 sin el 2.5 da dos marcas en Qwen 2 VL, demasiado pocas para situar un día. Escala logarítmica: ya está descartada en el proyecto, y además el precio de salida de Whisper es exactamente cero real. Compartir el eje entre las dos gráficas: no tienen magnitudes comparables —Whisper mueve 150k tokens y $0.0008—, un eje común aplastaría una de las dos hasta hacerla ilegible.

### 5. Formato extendido como familia paralela, la tabla no se toca

El detalle necesita los mismos números con otro formato: tokens sin abreviar, precios con su unidad por millón, coste con los decimales que lo hacen distinguible de un cero. Se escriben formatters nuevos, con la misma forma que los existentes y adaptando decimales al orden de magnitud igual que hace `formatearPrecio`.

No se modifica `formatearCoste`. Cambiarlo arreglaría las celdas `$0.00` de la tabla, pero la tabla está construida alrededor del ancho de columna: `$0.00072` en una celda de ancho limitado empuja el resto de la fila. Ese arreglo pertenece a un cambio de la tabla, con su propia decisión sobre anchos, y no se cuela aquí. El detalle sí enseña la verdad completa, y el README deja escrito que la tabla sigue abreviada por ancho de columna.

### 6. La rejilla de días va en columnas, no en filas

La primera versión dibujaba la rejilla como una lista: siete filas, una por día, con entrada, salida, total y coste. Con el compromiso de que el detalle no tenga scroll, no cabe: siete filas de datos más cabecera ocupan el doble que cuatro.

Darla la vuelta —cuatro filas, una por magnitud, y una columna por día— ahorra la mitad de la altura y además hace que las columnas se alineen con las posiciones horizontales de las dos gráficas de arriba, de modo que el día del pico en tokens y el día del pico en coste se leen en la misma columna. El hueco de Qwen 2.5 cae en la columna `-3` con `—` en las cuatro filas, alineado con la interrupción de ambos áreas.

Es el punto donde el compromiso de "sin scroll" convirtió una decisión de contenido en algo más que una restricción de maquetación.

### 7. La misma paleta para tokens y para coste

`--serie-entrada` y `--serie-salida` pintan las dos gráficas del detalle. El requirement que las vincula prohíbe que coincidan con la paleta de los badges de modalidad, no que se usen con dos unidades distintas, y ampliarlo para fijar que el color codifica la dirección del flujo y no la magnitud evita que la siguiente persona rehaga la decisión por sorpresa.

Las dos gráficas se parecen, y esa semejanza es deliberada: están apiladas sobre la misma rejilla y la lectura pretendida es alinear columna a columna. Cuando el volumen sube y el coste no, esa divergencia *es* la información. Darle al coste una paleta distinta destruiría precisamente la comparación visual que justifica tener las dos.

El salto de luminancia que documenta la change anterior se hereda sin cambiar nada, y en escala de grises las dos gráficas siguen leyéndose.

### 8. El peso en el equipo se calcula sobre el conjunto visible

Los porcentajes de tokens y de coste que el modelo representa hoy se calculan sobre `modelosVisibles()`, no sobre `MODELOS`. La razón es que el detalle solo es alcanzable desde una fila visible, de modo que un modelo que los filtros han oculto ya no es el conjunto de referencia que el usuario está leyendo, y medirlo contra modelos que no ve lo compara contra una realidad que no está en pantalla. Coherente con el requisito de que las visualizaciones deriven del mismo conjunto que la tabla.

El precio efectivo es el cociente entre el coste de la ventana y sus tokens, multiplicado por un millón. Se deriva de los precios y del consumo, igual que `calcularCoste()` deriva el coste, y no se almacena.

### 9. El presupuesto sin scroll se fija como números, no como intención

La altura del detalle se componentiza para que quepa:

```
  cabecera: nombre, badges de modalidad, botón de cierre           52
  navegación entre los modelos visibles                            34
  separador                                                          1
  título "Consumo de tokens"                                        16
  gráfica de tokens: 110 de trazado + 16 de eje y marcas          126
  separación                                                        12
  título "Coste por día"                                           16
  gráfica de coste: 110 de trazado + 16 de eje y marcas           126
  separación                                                        12
  título "Por día"                                                  16
  cabecera de la rejilla de días                                     20
  4 filas x 21                                                      84
  relleno del diálogo (20 arriba + 16 abajo)                       36
                                                                  ----
                                                                   551
```

551px. En una ventana de 768px de alto quedan del orden de 70px de holgura una vez descontada la interfaz del navegador.

Esto tiene un límite honesto: por debajo de unos 700px de viewport no cabe sin comprometer algo, y el compromiso debe ser el diálogo. `max-height: calc(100dvh - 2rem)` con `overflow: auto` y `overscroll-behavior: contain` hacen que el diálogo sea el único elemento desplazable, en lugar de que la rueda siga desplazando la página por detrás. El body se bloquea mientras está abierto para que el fondo no se mueva bajo el `::backdrop`.

Una animación de apertura mínima —un `transform` y una opacidad— solo se declara bajo `@media (prefers-reduced-motion: no-preference)`. No hay JavaScript de animación.

### 10. El detalle se desmonta al cerrar

Nada de lo que se construye al abrir necesita sobrevivir al cierre: no hay estado de selección que restaurar, y con el fondo `inert` no hay ninguna forma de que los datos cambien mientras está abierto. Vaciar los contenedores con `replaceChildren()` al cerrar, igual que el resto del proyecto vacía antes de dibujar.

La única cosa que hay que devolver es el foco, y el enfoque correcto es delegar en el elemento nativo: si el `<dialog>` se cierra con `close()` y el botón que lo abrió estaba en el documento, el foco vuelve solo. Si se cierra desde el botón de cerrar, el elemento que tenía el foco ha desaparecido y hay que devolverlo explícitamente.

## Risks / Trade-offs

**[La tabla sigue enseñando `$0.00` para dos modelos]** — El detalle lo arregla para quien abra la ficha, pero quien solo mire la tabla sigue viendo un coste real escrito como cero. → Deliberado: arreglarlo en la tabla es una decisión de anchos de columna que pertenece a otro cambio. Se deja escrito en el README que la abreviación de la tabla responde a su ancho, no a que el coste sea cero.

**[La rejilla de días es la segunda representación de la misma serie que las gráficas]** — Las dos gráficas y la rejilla dibujan los mismos catorce números. → Es el reparto de responsabilidades que la change anterior decidió para los paneles pequeños —"la forma la da el gráfico, la magnitud la tabla"— y en el detalle caben las dos mitades a la vez: la forma y el valor exacto. Se acepta la redundancia porque las dos responden a preguntas distintas, una sin eje y otra con eje.

**[Un modelo sin ningún día con dato deja el detalle casi vacío]** — La serie entera degrada. → Es el comportamiento que el spec ya exige en el resto del sitio y la única forma honesta de no dibujar una serie inventada. El fixture actual no tiene ese caso, así que es defensivo, pero el código no puede asumir que siempre hay siete días.

**[`showModal()` es la única pieza de comportamiento de plataforma que usa el proyecto]** — Es la primera vez que el dashboard depende de una API de diálogo nativo para su accesibilidad. → Es la alternativa nativa sin servidor ni librería: `dialog` es HTML, no una dependencia. Y a cambio cubre la trampa de foco, el `Escape` y el fondo `inert`, que de otro modo serían decenas de líneas que nadie probaría.

**[El detalle destapa inconsistencias del fixture]** — `Render por lotes` declara un TTFT de 2200 ms y ninguna modalidad de entrada, cosa que hasta ahora no se veía porque el TTFT vivía en su propia columna, lejos de las modalidades. Unidos en la cabecera del detalle, la contradicción se lee de un vistazo. → No se corrige el fixture en este cambio: el detalle es descriptivo, no interpreta, y mostrar los datos como son es su trabajo. Si la contradicción resulta incómoda, se decide aparte si el modelo necesita un campo que explique que no aplica.

**[El precio efectivo puede leerse como "este modelo sale barato"]** — Mixtral tiene el precio efectivo más alto ($0.9000) y sin embargo es de los más usados. → El detalle lo muestra junto al peso en el equipo, de modo que las dos cifras se leen juntas: alto y poco usado. Separado de la forma del consumo, no al lado de ella.

**[Sin tests, la deriva del formatters nadie la atrapa]** — Es el estado del proyecto y este cambio lo amplía: dos familias de formatters en vez de una, y reglas de degradación por ventana, por día y por serie completa. → La verificación es manual y el README la describe. El fixture se eligió para que los casos límite sean alcanzables a ojo: dos modelos con coste inferior al céntimo, uno con TTFT ausente, uno con precio de salida cero, uno sin modalidades de entrada y uno con un día sin dato. Implementar y luego abrir `index.html` y recorrer esos siete casos es la prueba.

## Migration Plan

No hay despliegue, migración de datos ni compatibilidad que mantener: es un fichero estático abierto desde el sistema de ficheros, y la forma del fixture es interna a `app.js` sin consumidores externos. El orden importa porque cada paso debe ser invisible:

1. Los formatters de formato extendido y `pasoBonito()`, sin conectarlos a nada. La tabla no debe cambiar un solo valor.
2. El esqueleto del `<dialog>` en `index.html` y sus estilos, todavía inerte y sin contenido.
3. El botón en el `<th>` del nombre y la delegación sobre el `<tbody>`, con un detalle vacío que se abre y se cierra. A partir de aquí la tabla es interactiva pero no muestra nada.
4. La rejilla de días y el riel de métricas, alimentados desde `ventanas()`, `calcularCoste()` y las nuevas derivaciones. Aquí ya se puede leer todo menos las gráficas.
5. Las dos gráficas absolutas, reutilizando el layout de los paneles.
6. La navegación entre modelos visibles y la devolución del foco.
7. El README.

El rollback es revertir los ficheros; no hay estado persistente que limpiar.

## Open Questions

- Los valores concretos de presentación —110 de trazado, 21 de fila, el ancho del diálogo, la separación entre bloques— no están fijados por la especificación y se pueden ajustar durante la implementación sin tocar ningún artefacto. Lo que no es ajustable es que el detalle entre entero en 700px de alto, que las dos gráficas compartan rejilla y que el hueco se dibuje igual en las tres piezas.
- Si en algún momento se quisiera comparar dos modelos a la vez, el sitio natural sigue siendo la tabla y los gráficos de la página, no el detalle. La decisión de que el detalle no sirva para comparar es la que permite que sea una foto y no exija sincronía.
