# Spec Delta

## ADDED Requirements

### Requirement: Detalle por modelo activable desde la fila
El sistema SHALL permitir abrir un detalle de un único modelo activando su fila en la tabla, y SHALL ofrecer los medios de cierre estándar de un diálogo modal, de modo que el usuario pueda pasar de la comparación horizontal entre filas a la lectura completa de un modelo sin cambiar de vista ni abandonar el dashboard. El detalle SHALL presentarse como una capa modal sobre la página, de modo que solo haya una vista de detalle activa a la vez y el resto de la interfaz no pueda alterar lo que el detalle muestra.

#### Scenario: Activar una fila abre el detalle de ese modelo
- **WHEN** el usuario activa una fila de la tabla
- **THEN** se abre el detalle del modelo de esa fila

#### Scenario: El nombre del modelo se activa con el teclado
- **WHEN** el usuario enfoca el nombre de un modelo en la tabla y lo activa con el teclado
- **THEN** se abre el detalle de ese modelo sin necesidad de puntero

#### Scenario: La fila activable conserva su estructura de tabla
- **WHEN** se inspecciona la fila activable
- **THEN** el nombre del modelo sigue siendo un encabezado de fila de la tabla y no un control que sustituya a la fila, de modo que la semántica de la tabla no queda alterada

#### Scenario: El teclado cierra el detalle
- **WHEN** el detalle está abierto y el usuario lo cierra con la tecla de escape
- **THEN** el detalle se cierra

#### Scenario: Pulsar fuera del detalle lo cierra
- **WHEN** el detalle está abierto y el usuario pulsa fuera de su contenido
- **THEN** el detalle se cierra

#### Scenario: El cierre devuelve el foco a la fila de origen
- **WHEN** el detalle se cierra
- **THEN** el foco vuelve al control que lo abrió, de modo que la navegación con teclado no se pierde

#### Scenario: Solo hay un detalle activo
- **WHEN** el detalle de un modelo está abierto
- **THEN** no existe una segunda capa de detalle abierta al mismo tiempo, y la única forma de cambiar de modelo es elegir otro dentro del propio detalle

#### Scenario: El resto de la interfaz no altera el contenido del detalle
- **WHEN** el detalle está abierto
- **THEN** la ordenación y el filtrado de la tabla no son accesibles y por tanto no pueden cambiar el contenido del modelo mostrado

#### Scenario: El contenido del detalle no se recalcula al cambiar de modelo
- **WHEN** el detalle cambia de un modelo a otro desde su propia navegación
- **THEN** el contenido se sustituye por el del modelo elegido sin cerrarse el detalle

#### Scenario: La navegación interna ofrece los modelos visibles
- **WHEN** el detalle está abierto
- **THEN** ofrece cambiar a cualquiera de los modelos que la tabla tiene visibles, y no a modelos que los filtros tienen ocultos

#### Scenario: El detalle cabe sin desplazamiento
- **WHEN** el detalle está abierto en una ventana de al menos 700 píxeles de alto
- **THEN** la totalidad de su contenido es visible sin necesidad de desplazarse

### Requirement: Métricas del detalle en formato extendido
El sistema SHALL presentar en el detalle de cada modelo las mismas magnitudes que la tabla muestra —precio de entrada y de salida, TTFT, modalidades y consumo de las ventanas diaria y semanal— en un formato extendido que no abrevie las cantidades ni redondee los importes hasta volverlos ilegibles, y SHALL añadir las magnitudes derivadas que solo pueden calcularse con el conjunto de modelos delante.

#### Scenario: Las cantidades no se abrevian
- **WHEN** se observa el consumo de un modelo en el detalle
- **THEN** los tokens de entrada, de salida y total aparecen con su valor exacto, sin abreviar a miles ni a millones

#### Scenario: Un importe menor de un céntimo sigue siendo legible
- **WHEN** el coste de un modelo es inferior a un céntimo
- **THEN** aparece con los decimales necesarios para distinguirlo de un coste nulo, en lugar de mostrarse como cero

#### Scenario: Un cero real se distingue de la ausencia de dato
- **WHEN** un modelo tiene un precio o un consumo de cero real
- **THEN** el detalle muestra ese cero explícito y no un marcador de ausencia de dato

#### Scenario: Los precios conservan su unidad
- **WHEN** se observa el precio de un modelo en el detalle
- **THEN** aparece expresado por millón de tokens y con los decimales que lo hacen distinguible de los demás precios

#### Scenario: Un día sin dato no se rellena con un cero
- **WHEN** se observa la rejilla de días de un modelo cuya serie tiene un día sin dato
- **THEN** ese día aparece marcado como no disponible en todas sus cifras, y no como un valor cero

#### Scenario: Una serie sin ningún día con dato degrada la parte temporal
- **WHEN** la serie de un modelo no aporta ningún día con valor
- **THEN** la rejilla de días, ambas gráficas y las magnitudes derivadas que dependen de la serie se marcan como no disponibles

#### Scenario: El detalle indica cuántos días aportan valor
- **WHEN** la serie de un modelo tiene algún día sin dato
- **THEN** el detalle indica sobre cuántos días de la serie se pueden calcular las magnitudes

#### Scenario: El detalle muestra el precio efectivo del consumo
- **WHEN** se observa el detalle de un modelo
- **THEN** aparece el precio por millón de tokens que resulta de dividir el coste de la ventana de consumo por los tokens de esa misma ventana, derivado de los precios y del consumo y no almacenado

#### Scenario: El detalle muestra el peso del modelo en el equipo
- **WHEN** se observa el detalle de un modelo
- **THEN** aparecen los porcentajes de tokens y de coste que ese modelo representa en el día actual respecto al total de los modelos visibles

#### Scenario: El detalle muestra el día de mayor consumo
- **WHEN** se observa el detalle de un modelo
- **THEN** aparece qué día de la serie concentra el mayor número de tokens y cuál es ese total

### Requirement: Gráficas del detalle con escala absoluta
El sistema SHALL mostrar en el detalle dos gráficas por modelo —tokens consumidos por día y coste por día— sobre una misma rejilla de siete días y con un eje vertical de valores absolutos, no normalizados, de modo que la magnitud de un modelo se lea en su propia serie sin recurrir a la tabla. Estas gráficas son el complemento de los paneles de la página, que normalizan cada modelo contra su propio máximo para poder comparar formas: en el detalle hay una sola serie por gráfica y caben los valores reales en la misma altura.

#### Scenario: El eje vertical muestra valores absolutos
- **WHEN** se observa el eje de una gráfica del detalle
- **THEN** sus marcas corresponden a cantidades reales de tokens o de coste y no a proporciones del máximo del modelo

#### Scenario: Las dos gráficas comparten la rejilla de días
- **WHEN** se comparan la gráfica de tokens y la de coste de un mismo detalle
- **THEN** un mismo día ocupa la misma posición horizontal en las dos, de modo que sus valores se puedan alinear a simple vista

#### Scenario: Las marcas del eje son valores redondos y suficientes
- **WHEN** se observa el eje de una gráfica del detalle
- **THEN** sus marcas están separadas por un intervalo legible y hay las suficientes para situar el valor de un día sin ambigüedad

#### Scenario: La entrada y la salida se distinguen dentro de cada gráfica
- **WHEN** se observa una gráfica del detalle
- **THEN** la entrada y la salida aparecen como dos series distinguibles, no sumadas en una sola

#### Scenario: El contorno superior es el total del día
- **WHEN** se lee la altura del área de una gráfica del detalle
- **THEN** su contorno superior corresponde a la suma de la entrada y la salida del día, tanto en la gráfica de tokens como en la de coste

#### Scenario: Un día sin dato interrumpe las dos gráficas
- **WHEN** la serie de un modelo tiene un día sin dato
- **THEN** ese día aparece como un hueco en ambas gráficas y no como un valor cero

#### Scenario: Un eje de coste diminuto no colapsa a cero
- **WHEN** el coste diario de un modelo es muy inferior al de los demás modelos visibles
- **THEN** el eje del coste muestra marcas con los decimales necesarios para distinguir el valor, en lugar de un eje en el que la única marca distinta del origen sea cero

#### Scenario: Las gráficas del detalle no usan librería de gráficos
- **WHEN** se inspecciona el código que dibuja las gráficas del detalle
- **THEN** las formas se generan con el sistema de coordenadas vectoriales nativo del navegador y el detalle no introduce ningún recurso externo ni ninguna petición de red

## MODIFIED Requirements

### Requirement: Las series de consumo no reutilizan la paleta de modalidades
El sistema SHALL distinguir visualmente las series de entrada y salida del consumo de los colores que identifican las modalidades de contenido, de modo que un mismo color no represente dos cosas distintas en la misma pantalla. El color de una serie SHALL codificar la dirección del flujo —entrada o salida— y no la magnitud que la serie mide, de modo que las series que dibujan tokens y las que dibujan coste compartan paleta y signifiquen lo mismo.

#### Scenario: Los colores de las series son distintos de los de los badges
- **WHEN** se comparan los colores de las series de consumo con los de los badges de modalidad
- **THEN** no coinciden entre ambos conjuntos

#### Scenario: Las dos series se distinguen sin depender solo del tono
- **WHEN** se observan las dos series de un panel
- **THEN** se distinguen por una diferencia de luminancia y no únicamente por el tono de color

#### Scenario: El mismo color significa la misma dirección en todas las gráficas
- **WHEN** se comparan las series de la gráfica de tokens y las de la gráfica de coste de un mismo detalle
- **THEN** la serie que representa la entrada lleva el mismo color en las dos gráficas, y lo mismo la serie que representa la salida
