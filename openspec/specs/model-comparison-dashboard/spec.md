# model-comparison-dashboard Specification

## Purpose

Permite comparar de un vistazo los modelos de lenguaje open source más relevantes, mostrando precio, TTFT, modalidades soportadas y el consumo real del equipo, para decidir con criterio cuál usar.

## Requirements

### Requirement: Tabla comparativa de modelos
El sistema SHALL presentar una tabla que liste los modelos open source a comparar, con una fila por modelo cuando no hay criterios de filtrado activos, mostrando nombre, precio de entrada y precio de salida por millón de tokens, TTFT en milisegundos, modalidades de entrada, modalidades de salida, y el consumo del equipo en tokens y en coste, para las ventanas diaria y semanal.

#### Scenario: La tabla muestra una fila por modelo
- **WHEN** se carga el dashboard y no hay criterios de filtrado activos
- **THEN** la tabla contiene exactamente una fila por cada modelo del conjunto de datos

#### Scenario: El filtrado reduce las filas sin perder columnas
- **WHEN** hay criterios de filtrado activos
- **THEN** la tabla conserva el mismo conjunto de columnas y solo varía el número de filas, de modo que el filtrado no oculta ninguna dimensión de comparación

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
El sistema SHALL mostrar el consumo del equipo en dos unidades simultáneas, tokens y coste, y para dos ventanas temporales, diaria y semanal, de modo que ambos datos de consumo y ambas ventanas sean visibles a la vez sin que el usuario tenga que cambiar de vista. Ambas ventanas se derivarán de una única serie de días por modelo, de forma que la ventana diaria y la semanal no puedan dejar de corresponderse entre sí.

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

#### Scenario: Las dos ventanas se derivan de la misma serie
- **WHEN** se observa el consumo de un modelo
- **THEN** la ventana diaria es el último día de su serie y la ventana semanal es la suma de los días de esa serie, sin que exista ningún valor de consumo almacenado aparte

#### Scenario: Un día sin dato impide calcular la semana
- **WHEN** algún día de la serie de un modelo no aporta valor
- **THEN** la ventana semanal de ese modelo se marca como no disponible en lugar de mostrar una suma que subestimaría el consumo

### Requirement: Modalidades representadas por badges
El sistema SHALL representar las modalidades de entrada y de salida de cada modelo como un conjunto de badges compactos, uno por tipo de contenido soportado, rotulados con el nombre completo del tipo de contenido y no con una sigla de una letra, de modo que las modalidades se lean sin información previa y se puedan seguir comparando por patrón visual.

#### Scenario: Un modelo con varias modalidades muestra varios badges
- **WHEN** un modelo admite más de un tipo de contenido
- **THEN** su celda de modalidades de entrada muestra un badge por cada tipo admitido, sin truncar ni fusionar ningún badge válido por muy que el modelo admita más de dos

#### Scenario: Cada badge muestra el nombre completo del tipo
- **WHEN** se observa un badge de modalidad en cualquier celda
- **THEN** muestra el nombre completo del tipo de contenido que representa, sin necesidad de interpretarlo con una clave externa ni de pasar el cursor por encima

#### Scenario: Las modalidades de entrada y salida ocupan celdas separadas
- **WHEN** un modelo admite un tipo de contenido como entrada pero no lo devuelve
- **THEN** ese tipo aparece como badge en la columna de entrada y no aparece como badge en la columna de salida

#### Scenario: Un modelo sin modalidades de entrada muestra el vacío de forma explícita
- **WHEN** un modelo no declara ninguna modalidad de entrada
- **THEN** su celda de entrada muestra un marcador explícito de que no acepta contenido, en lugar de una celda vacía indistinguible de un fallo de carga

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

### Requirement: Filtrado de filas por nombre y modalidad
El sistema SHALL permitir acotar las filas visibles mediante un criterio de búsqueda sobre el nombre del modelo y mediante un criterio de modalidad para la entrada y otro para la salida, de manera independiente, de modo que el usuario pueda reducir la tabla a los modelos que le interesan sin perder de vista el conjunto completo. Los criterios activos SHALL ser visibles en pantalla y reversibles.

#### Scenario: La búsqueda por nombre reduce las filas
- **WHEN** el usuario escribe texto en el campo de búsqueda de nombre de modelo
- **THEN** solo permanecen visibles los modelos cuyo nombre contiene ese texto, sin distinguir mayúsculas de minúsculas

#### Scenario: El filtro de modalidad de entrada y el de salida son independientes
- **WHEN** el usuario selecciona un tipo de contenido en el filtro de entrada
- **THEN** solo permanecen visibles los modelos que aceptan ese tipo como entrada, y los tipos de salida de esos modelos no influyen en la decisión

#### Scenario: El filtro de salida no se deduce del de entrada
- **WHEN** el usuario selecciona un tipo de contenido en el filtro de salida
- **THEN** solo permanecen visibles los modelos que producen ese tipo como salida, aunque ese mismo tipo no se acepte como entrada en ninguno de ellos

#### Scenario: Los criterios se combinan acumulativamente
- **WHEN** hay un texto de búsqueda activo y un tipo de modalidad seleccionado
- **THEN** solo permanecen visibles los modelos que cumplen los dos criterios a la vez, y no los que cumplen solo uno de ellos

#### Scenario: El filtro ofrece todos los tipos de contenido
- **WHEN** el usuario despliega cualquiera de los dos selectores de modalidad
- **THEN** aparecen todos los tipos de contenido del vocabulario, incluidos los que ningún modelo del conjunto de datos utiliza, de modo que el vocabulario no cambia al añadir modelos

#### Scenario: La ordenación activa sobrevive al cambio de filtros
- **WHEN** el usuario está ordenando por una columna y cambia un criterio de filtrado
- **THEN** la misma columna sigue siendo la ordenación activa y conserva su sentido

#### Scenario: La ordenación se aplica al subconjunto filtrado
- **WHEN** el usuario ordena por una columna con filtros activos
- **THEN** solo se reordenan entre sí las filas que superan los filtros, y ninguna fila filtrada aparece en la tabla

#### Scenario: Un filtro que no deja filas muestra un estado vacío explícito
- **WHEN** los criterios activos no dejan ningún modelo
- **THEN** el cuerpo de la tabla muestra un mensaje explícito que indica que ningún modelo coincide, en lugar de un cuerpo vacío indistinguible de un fallo de carga

#### Scenario: El estado vacío identifica los criterios que lo provocaron
- **WHEN** se muestra el estado vacío
- **THEN** el mensaje enumera los criterios de filtrado que están activos, de modo que el usuario sabe cuál deshacer

#### Scenario: El estado vacío ofrece limpiar los filtros
- **WHEN** se muestra el estado vacío
- **THEN** ofrece una acción para retirar todos los criterios de filtrado de una vez y devolver la tabla a su conjunto completo

#### Scenario: Limpiar los filtros devuelve todas las filas
- **WHEN** hay filtros activos y el usuario los retira
- **THEN** vuelven a mostrarse todos los modelos del conjunto de datos, conservando la ordenación que hubiera activa

#### Scenario: El número de modelos visibles es consultable
- **WHEN** hay filtros activos
- **THEN** se indica cuántos modelos están visibles de entre el total, de modo que el usuario no tiene que contarlos

### Requirement: Funcionamiento autónomo y sin dependencias
El sistema SHALL funcionar abriendo su fichero HTML directamente en un navegador, sin servidor, sin paso de compilación y sin librerías ni frameworks de terceros, de modo que cualquier miembro del equipo pueda abrirlo y ver el dashboard, incluidas sus visualizaciones.

#### Scenario: La página funciona sin servidor
- **WHEN** un usuario abre el fichero `index.html` directamente desde el sistema de ficheros
- **THEN** la tabla y los gráficos se renderizan con todos sus datos y la interacción de ordenación funciona

#### Scenario: No hay recursos externos
- **WHEN** se inspecciona el documento y sus scripts
- **THEN** no se carga ningún recurso desde un host externo, ni se referencia ninguna librería o framework

#### Scenario: No se realiza ninguna petición de red
- **WHEN** el dashboard está en ejecución
- **THEN** no se realizan peticiones de red para obtener datos, y el contenido proviene de datos de prueba incluidos en el propio código

#### Scenario: Las visualizaciones no usan librería de gráficos
- **WHEN** se inspecciona el código que dibuja los gráficos
- **THEN** las formas se generan con el sistema de coordenadas vectoriales nativo del navegador, sin ninguna librería de gráficos ni utilería de dibujo de terceros

#### Scenario: Se degradan columnas a valores ausentes
- **WHEN** un modelo del conjunto de datos no aporta un valor para una columna, o bien no aporta un valor para un día de su serie de consumo
- **THEN** esa celda o ese día se marca de forma explícita como no disponible, en lugar de quedar vacío, mostrar `NaN`/`undefined`, o dibujar un día sin dato como si fuera un día de valor cero

### Requirement: Conjunto de datos de prueba representativo
El sistema SHALL incluir un conjunto de datos de prueba que cubra al menos los tres patrones de modalidad relevantes para validar el diseño —solo texto, texto e imagen, y entrada de audio—, que cubra valores numéricos distintos en cada columna para que la ordenación sea verificable, y que aporte por cada modelo una serie de siete días de consumo de entrada y salida que incluya algún día sin dato y un rango amplio de magnitudes.

#### Scenario: El conjunto de datos incluye un modelo de entrada de audio
- **WHEN** se carga el dashboard
- **THEN** algún modelo declara una modalidad de audio en su columna de entrada, para ejercitar un badge distinto de los de texto e imagen

#### Scenario: El conjunto de datos permite distinguir modelos por cada columna
- **WHEN** el usuario ordena por precio de salida
- **THEN** el orden resultante no coincide con el orden resultante de ordenar por TTFT, de modo que se verifica que cada columna ordena por su propio valor

#### Scenario: El conjunto de datos está identificado como ficticio
- **WHEN** se observa el conjunto de datos o la interfaz
- **THEN** queda evidente que los datos son de prueba y no reflejan precios ni consumo reales

#### Scenario: Cada modelo aporta una serie de siete días
- **WHEN** se carga el dashboard
- **THEN** cada modelo aporta una serie de siete días, con tokens de entrada y de salida por día, y la ventana diaria y la semanal se obtienen de esa serie

#### Scenario: El conjunto de datos incluye un día sin dato
- **WHEN** se carga el dashboard
- **THEN** algún modelo tiene al menos un día de su serie sin valor, de modo que la degradación a marcador explícito sea verificable y no quede como un requisito sin caso que la dispare

#### Scenario: El conjunto de datos incluye un día de consumo nulo
- **WHEN** se carga el dashboard
- **THEN** algún modelo tiene un día con valor cero que sí es un dato real, para que un día sin dato y un día de consumo nulo puedan distinguirse en el dibujo

#### Scenario: El conjunto de datos cubre un rango amplio de magnitudes
- **WHEN** se cargan los datos
- **THEN** hay al menos un modelo cuyo consumo diario es varias veces menor que el del modelo de mayor consumo, de modo que la diferencia de magnitud entre paneles sea representativa

### Requirement: Visualización comparativa de precios
El sistema SHALL presentar, por encima de la tabla, un gráfico de barras horizontales con una fila por modelo que muestre el precio de entrada y el precio de salida por millón de tokens, de modo que la comparación del coste por token entre modelos se pueda hacer de un vistazo sin recorrer las filas de la tabla.

#### Scenario: Cada modelo tiene su fila con las dos barras
- **WHEN** se observa el gráfico de precios
- **THEN** aparece una fila por cada modelo visible, con una barra para el precio de entrada y otra para el precio de salida

#### Scenario: El precio se lee aunque la barra sea mínima
- **WHEN** un modelo tiene un precio muy inferior al del resto
- **THEN** su valor numérico sigue siendo legible junto a la barra, de modo que la comparación no depende de la longitud de la barra

#### Scenario: Las barras responden a los precios de la tabla
- **WHEN** se compara un valor del gráfico de precios con la tabla
- **THEN** coinciden el precio de entrada y el precio de salida que la tabla muestra para ese mismo modelo

#### Scenario: Las filas del gráfico se ordenan por su propia métrica
- **WHEN** se observa el gráfico de precios
- **THEN** sus filas están ordenadas de mayor a menor precio de salida, con independencia de en qué columna esté ordenada la tabla

#### Scenario: El trazado no se estira al ancho disponible
- **WHEN** se observa el gráfico de precios
- **THEN** la longitud de las barras está acotada por un ancho máximo fijo, de modo que la diferencia de magnitud entre modelos se mantiene legible en lugar de quedar exagerada

### Requirement: Visualización de la evolución del consumo
El sistema SHALL presentar, por encima de la tabla, un panel por cada modelo visible con la evolución de su consumo de tokens a lo largo de los últimos siete días, de modo que la forma del consumo —que la tabla no puede mostrar por carecer de eje temporal— se pueda leer por modelo.

#### Scenario: Cada modelo visible tiene su propio panel
- **WHEN** se observa el bloque de consumo
- **THEN** hay un panel por cada modelo visible, identificado con el nombre del modelo

#### Scenario: Cada panel muestra siete días
- **WHEN** se cuentan los puntos de un panel
- **THEN** son siete, correspondientes a los siete días más recientes

#### Scenario: El eje temporal es relativo al último día
- **WHEN** se observan las etiquetas del eje de un panel
- **THEN** la última se rotula como el día actual y las anteriores como los días sucesivos hacia atrás, sin depender de fechas concretas que puedan quedar obsoletas

#### Scenario: La entrada y la salida se distinguen dentro del panel
- **WHEN** se observa un panel
- **THEN** el consumo de entrada y el de salida aparecen como dos series distinguibles, no sumados en una sola

#### Scenario: El contorno superior de un panel es el total del día
- **WHEN** se lee la altura del área de un panel
- **THEN** su contorno superior corresponde a la suma de la entrada y la salida del día

#### Scenario: Un panel conserva su forma aunque su magnitud sea mucho menor
- **WHEN** dos paneles tienen consumos de magnitud muy distinta
- **THEN** la forma de cada uno se lee con la misma claridad, sin que el panel de menor consumo quede aplastado hasta ser indistinguible de una línea plana

#### Scenario: El valor absoluto es legible en la cabecera de cada panel
- **WHEN** se observa la cabecera de un panel
- **THEN** aparecen el nombre del modelo y el número absoluto de tokens del día actual

#### Scenario: Un día sin dato se dibuja como hueco
- **WHEN** algún día de la serie de un modelo no aporta valor
- **THEN** ese día aparece como un hueco en el panel y no como un valor cero, de modo que un día sin dato no se confunda con un día de consumo nulo

### Requirement: Coherencia de las visualizaciones con la tabla
El sistema SHALL derivar las visualizaciones del mismo conjunto de modelos visibles que la tabla, de modo que los criterios de filtrado actúen sobre los gráficos igual que sobre las filas y no exista una segunda verdad sobre lo que el usuario está viendo.

#### Scenario: La búsqueda por nombre reduce también los gráficos
- **WHEN** el usuario escribe texto en el campo de búsqueda de nombre de modelo
- **THEN** los gráficos pasan a mostrar solo los modelos que quedan visibles en la tabla

#### Scenario: Los filtros de modalidad reducen también los gráficos
- **WHEN** el usuario selecciona un tipo de contenido en cualquiera de los dos filtros de modalidad
- **THEN** los gráficos pasan a mostrar solo los modelos que quedan visibles en la tabla

#### Scenario: Los criterios combinados reducen los gráficos igual que a la tabla
- **WHEN** hay varios criterios de filtrado activos a la vez
- **THEN** el conjunto de modelos de los gráficos es exactamente el mismo que el de las filas

#### Scenario: Ningún modelo filtrado aparece en los gráficos
- **WHEN** hay criterios de filtrado activos
- **THEN** los gráficos no contienen ninguna barra ni ningún panel de un modelo que no aparezca en la tabla

#### Scenario: Ordenar la tabla no reordena los gráficos
- **WHEN** el usuario ordena la tabla por cualquier columna
- **THEN** el conjunto de modelos de los gráficos no cambia de orden, salvo el orden propio de cada gráfico

#### Scenario: Sin modelos visibles los gráficos se ocultan
- **WHEN** los criterios activos no dejan ningún modelo
- **THEN** el bloque de gráficos no se muestra y la tabla presenta su estado vacío explicando qué criterios lo provocaron

#### Scenario: Los gráficos no mantienen su propio conjunto de datos
- **WHEN** se inspecciona el origen de los datos de las visualizaciones
- **THEN** no existe un segundo origen de modelos independiente del que alimenta la tabla

### Requirement: Las series de consumo no reutilizan la paleta de modalidades
El sistema SHALL distinguir visualmente las series de entrada y salida del consumo de los colores que identifican las modalidades de contenido, de modo que un mismo color no represente dos cosas distintas en la misma pantalla.

#### Scenario: Los colores de las series son distintos de los de los badges
- **WHEN** se comparan los colores de las series de consumo con los de los badges de modalidad
- **THEN** no coinciden entre ambos conjuntos

#### Scenario: Las dos series se distinguen sin depender solo del tono
- **WHEN** se observan las dos series de un panel
- **THEN** se distinguen por una diferencia de luminancia y no únicamente por el tono de color
