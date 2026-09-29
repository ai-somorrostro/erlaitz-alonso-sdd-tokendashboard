# Spec Delta

## Purpose

Permite comparar de un vistazo los modelos de lenguaje open source más relevantes, mostrando precio, TTFT, modalidades soportadas y el consumo real del equipo, para decidir con criterio cuál usar.

## ADDED Requirements

### Requirement: Tabla comparativa de modelos
El sistema SHALL presentar una tabla que liste los modelos open source a comparar, con una fila por modelo, mostrando nombre, precio de entrada y precio de salida por millón de tokens, TTFT en milisegundos, modalidades de entrada, modalidades de salida, y el consumo del equipo en tokens y en coste, para las ventanas diaria y semanal.

#### Scenario: La tabla muestra una fila por modelo
- **WHEN** se carga el dashboard
- **THEN** la tabla contiene exactamente una fila por cada modelo del conjunto de datos

#### Scenario: Cada fila expone todas las dimensiones de comparación
- **WHEN** se observa una fila de la tabla
- **THEN** la fila muestra el nombre del modelo, el precio de entrada por millón de tokens, el precio de salida por millón de tokens, el TTFT en milisegundos, las modalidades de entrada, las modalidades de salida, y el consumo del equipo en tokens y en coste para las ventanas diaria y semanal

#### Scenario: Las cabeceras agrupan las columnas por dimensión
- **WHEN** se observa la cabecera de la tabla
- **THEN** las cabeceras de precio, modalidades y consumo están agrupadas bajo un encabezado superior que las engloba, mientras que el nombre de modelo y el TTFT ocupan una única columna sin agrupar

#### Scenario: Entrada y salida se distinguen explícitamente
- **WHEN** se comparan el precio de entrada y el precio de salida de un modelo
- **THEN** ambos aparecen en columnas separadas, cada rotulada como entrada o salida, y nunca en la misma celda

### Requirement: Consumo del equipo en dos unidades
El sistema SHALL mostrar el consumo del equipo en dos unidades simultáneas, tokens y coste, y para dos ventanas temporales, diaria y semanal, de modo que ambos datos de consumo y ambas ventanas sean visibles a la vez sin que el usuario tenga que cambiar de vista.

#### Scenario: Tokens y coste se ven a la vez
- **WHEN** se observa la sección de consumo de una fila
- **THEN** aparecen simultáneamente el número de tokens consumidos y el coste en dinero derivado de esos tokens

#### Scenario: Ventana diaria y ventana semanal se ven a la vez
- **WHEN** se observa la sección de consumo de una fila
- **THEN** aparecen simultáneamente el consumo de la jornada actual y el consumo acumulado de la semana actual

#### Scenario: El coste se deriva de los tokens y del precio
- **WHEN** cambia el precio por millón de tokens de un modelo en el conjunto de datos
- **THEN** el coste mostrado para ese modelo se recalcula a partir de los tokens consumidos y del nuevo precio, sin editar ningún valor de coste almacenado

#### Scenario: El consumo de la semana es coherente con el diario
- **WHEN** se muestra un modelo cuyo consumo diario es un valor conocido
- **THEN** el consumo semanal mostrado es mayor o igual que el diario, ya que la semana incluye ese día

### Requirement: Modalidades representadas por badges
El sistema SHALL representar las modalidades de entrada y de salida de cada modelo como un conjunto de badges compactos, uno por tipo de contenido soportado, en lugar de texto descriptivo, de modo que los modelos se puedan comparar por patrón visual.

#### Scenario: Un modelo con varias modalidades muestra varios badges
- **WHEN** un modelo admite más de un tipo de contenido
- **THEN** su celda de modalidades de entrada muestra un badge por cada tipo admitido, sin truncar ningún badge válido por muy que el modelo admita más de dos

#### Scenario: Las modalidades de entrada y salida ocupan celdas separadas
- **WHEN** un modelo admite un tipo de contenido como entrada pero no lo devuelve
- **THEN** ese tipo aparece como badge en la columna de entrada y no aparece como badge en la columna de salida

#### Scenario: Un modelo sin modalidades de entrada muestra el vacío de forma explícita
- **WHEN** un modelo no declara ninguna modalidad de entrada
- **THEN** su celda de entrada muestra un marcador explícito de que no acepta contenido, en lugar de una celda vacía indistinguible de un fallo de carga

### Requirement: Leyenda de modalidades visible en pantalla
El sistema SHALL mostrar en la propia pantalla, visible sin desplazamiento y por encima de la tabla, una leyenda que indique el significado de cada letra de modalidad usada en los badges, de modo que el significado sea deducible sin interacción.

#### Scenario: La leyenda es visible sin desplazarse
- **WHEN** se carga el dashboard en una pantalla de monitor estándar
- **THEN** la leyenda de modalidades aparece dentro del área visible junto a la tabla, sin necesidad de hacer scroll

#### Scenario: La leyenda cubre todas las letras presentes en la tabla
- **WHEN** un badge aparece en alguna celda de la tabla
- **THEN** existe en la leyenda una entrada que explica ese mismo badge

#### Scenario: La leyenda incluye los tipos aún no usados por el conjunto de datos
- **WHEN** ningún modelo del conjunto de datos utiliza un tipo de contenido
- **THEN** ese tipo sigue apareciendo en la leyenda, de modo que el vocabulario de siglas no cambia al añadir modelos

### Requirement: Ordenación por columna
El sistema SHALL permitir reordenar las filas por el valor de cualquier columna numérica al pulsar su cabecera, alternando entre orden ascendente y descendente, de modo que se pueda localizar rápidamente el modelo más barato o el más rápido.

#### Scenario: El primer pulso ordena ascendentemente
- **WHEN** el usuario pulsa la cabecera de una columna numérica que todavía no está ordenada
- **THEN** las filas se reordenan de menor a mayor valor en esa columna

#### Scenario: Un segundo pulso invierte el orden
- **WHEN** el usuario vuelve a pulsar la cabecera de la columna por la que ya está ordenando
- **THEN** las filas se reordenan de mayor a menor valor en esa columna

#### Scenario: Cambiar de columna cambia la ordenación activa
- **WHEN** el usuario pulsa la cabecera de una columna distinta de la que está ordenando
- **THEN** las filas se reordenan según esa nueva columna y la anterior deja de ser la ordenación activa

#### Scenario: La ordenación no altera los datos mostrados
- **WHEN** el usuario reordena las filas
- **THEN** cada fila sigue mostrando los mismos valores de la misma fila de modelo, sin permutar valores entre modelos

#### Scenario: El estado de ordenación es identificable
- **WHEN** existe una columna activa
- **THEN** se indica visualmente qué columna está ordenando y en qué sentido, de modo que el usuario no tiene que deducirlo de las posiciones

### Requirement: Funcionamiento autónomo y sin dependencias
El sistema SHALL funcionar abriendo su fichero HTML directamente en un navegador, sin servidor, sin paso de compilación y sin librerías ni frameworks de terceros, de modo que cualquier miembro del equipo pueda abrirlo y ver el dashboard.

#### Scenario: La página funciona sin servidor
- **WHEN** un usuario abre el fichero `index.html` directamente desde el sistema de ficheros
- **THEN** la tabla se renderiza con todos sus datos y la interacción de ordenación funciona

#### Scenario: No hay recursos externos
- **WHEN** se inspecciona el documento y sus scripts
- **THEN** no se carga ningún recurso desde un host externo, ni se referencia ninguna librería o framework

#### Scenario: No se realiza ninguna petición de red
- **WHEN** el dashboard está en ejecución
- **THEN** no se realizan peticiones de red para obtener datos, y el contenido proviene de datos de prueba incluidos en el propio código

#### Scenario: Se degradan columnas a valores ausentes
- **WHEN** un modelo del conjunto de datos no aporta un valor para una columna
- **THEN** esa celda muestra un marcador explícito de "no disponible" en lugar de quedar vacía o mostrar `NaN`/`undefined`

### Requirement: Conjunto de datos de prueba representativo
El sistema SHALL incluir un conjunto de datos de prueba que cubra al menos los tres patrones de modalidad relevantes para validar el diseño —solo texto, texto e imagen, y entrada de audio— y que cubra valores numéricos distintos en cada columna para que la ordenación sea verificable.

#### Scenario: El conjunto de datos incluye un modelo de entrada de audio
- **WHEN** se carga el dashboard
- **THEN** algún modelo declara una modalidad de audio en su columna de entrada, para ejercitar un badge distinto de los de texto e imagen

#### Scenario: El conjunto de datos permite distinguir modelos por cada columna
- **WHEN** el usuario ordena por precio de salida
- **THEN** el orden resultante no coincide con el orden resultante de ordenar por TTFT, de modo que se verifica que cada columna ordena por su propio valor

#### Scenario: El conjunto de datos está identificado como ficticio
- **WHEN** se observa el conjunto de datos o la interfaz
- **THEN** queda evidente que los datos son de prueba y no reflejan precios ni consumo reales
