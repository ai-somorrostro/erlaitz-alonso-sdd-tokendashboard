# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Leyenda de modalidades visible en pantalla

**Reason**: La leyenda existía únicamente para descifrar siglas de una letra. Al rotular cada badge con el nombre completo del tipo, la lectura ya no depende de una clave externa, y mantener el bloque obligaría a repetir en pantalla un vocabulario que la propia tabla muestra sin ambigüedad. La leyenda además ocupaba espacio permanente en pantalla para un conjunto de datos que no crece lo bastante como para justificarlo.

**Migration**: El vocabulario completo de tipos de contenido, incluidos los que ningún modelo utiliza, pasa a estar disponible en los selectores de modalidad del filtro, que ofrecen siempre la lista completa. No hay ninguna acción requerida para quien ya usaba el dashboard más allá de reubicarse en la barra de herramientas.
