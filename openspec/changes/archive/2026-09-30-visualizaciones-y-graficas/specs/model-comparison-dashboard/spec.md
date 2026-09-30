# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
