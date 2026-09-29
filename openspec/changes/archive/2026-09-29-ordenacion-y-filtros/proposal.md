# Proposal

## Why

La tabla permite ordenar, pero no permite acotar. Quien llega con una pregunta concreta —"¿qué modelos aceptan imagen?", "¿cuánto cuesta Llama?"— tiene que recorrer las filas a ojo, y con un conjunto de datos que crezca la tabla se vuelve más difícil aún. Falta la otra mitad de la interacción: filtrar.

De paso, la representación de modalidades está pidiendo una revisión. Las siglas de una letra (`T`, `I`, `A`, `V`) obligan a aprender un vocabulario antes de poder leer la tabla, y ese aprendizaje se pagaba con un bloque de leyenda permanente en pantalla. Con un equipo interno y un conjunto de datos pequeño, el nombre completo es más barato de leer que la sigla más la leyenda que la explica.

## What Changes

- **Añadido** una barra de herramientas sobre la tabla con un campo de búsqueda por nombre de modelo y dos selectores de modalidad, uno para entrada y otro para salida.
- **Añadido** un estado vacío explícito cuando los filtros no dejan ninguna fila, coherente con el marcador explícito que ya se usa en cada celda sin dato.
- **Añadido** la composición entre filtrado y ordenación: la ordenación activa se conserva al cambiar los filtros y se aplica sobre el subconjunto filtrado.
- **Modificado** la representación de las modalidades: pasan de sigla de una letra a nombre completo, manteniendo la lectura por patrón visual.
- **Eliminado** la leyenda de modalidades. Su trabajo de dar a conocer el vocabulario completo pasa a hacerlo el selector de modalidad, que ofrece siempre todos los tipos.
- Sin cambios en la ordenación por columna, que ya está implementada y especificada. Este cambio la hace componer con el filtrado en lugar de introducirla.

## Capabilities

### New Capabilities

Ninguna. El filtrado es una capacidad nueva, pero pertenece a la capacidad que ya posee la tabla, las modalidades y la ordenación, así que se expresa como un requisito nuevo dentro de ella en lugar de como una capacidad aparte.

### Modified Capabilities

- `model-comparison-dashboard`: cuatro movimientos de requisitos.
  - Se añade un requisito de filtrado de filas por nombre de modelo y por modalidad de entrada y de salida, con su estado vacío y su composición con la ordenación.
  - Se modifica el requisito de representación de modalidades, que deja de exigir badges compactos de una letra y pasa a exigir el nombre completo del tipo de contenido.
  - Se modifica el requisito de tabla comparativa, porque su escenario afirmaba que la tabla contiene "exactamente una fila por cada modelo" y eso el filtrado lo contradice directamente. La afirmación se limita ahora al caso en que no hay filtros activos.
  - Se elimina el requisito de leyenda de modalidades, junto con sus escenarios.

El detalle que conviene no perder: el requisito de la leyenda tenía un escenario propio, *"La leyenda incluye los tipos aún no usados por el conjunto de datos"*, que garantizaba que `video` apareciese pese a que ningún modelo lo use. Ese escenario desaparece con el requisito, pero **su intención no se pierde**: la reescribe el selector de modalidad del filtro, que ofrece siempre la lista completa de tipos. Es el mismo compromiso de vocabulario, mudado de sitio.

## Impact

- `index.html`: se retira el bloque de leyenda y se añade la barra de herramientas.
- `app.js`: el vocabulario de modalidades deja de exponer la sigla; se elimina el render de la leyenda; se añade el estado de filtrado y su lógica, la composición con la ordenación y el render del estado vacío.
- `styles.css`: se retiran los estilos de leyenda y se añaden los de la barra; las celdas de modalidades ensanchan para acoger el nombre completo.
- `README.md`: la documentación de la tabla describe hoy las siglas y la leyenda, y describe la ordenación como la única interacción.
- Sin dependencias nuevas, sin cambios de arquitectura, sin servidor y sin paso de compilación: el proyecto sigue abriendo su `index.html` directamente en el navegador.

La reversión de la representación de modalidades es deliberada. El argumento original a favor de la sigla era la compacidad y la comparación por patrón, que pesa en una rejilla densa con decenas de modelos; aquí pesan siete, y el coste de aprender el vocabulario supera al de la compacidad. La comparación por patrón no se pierde del todo: los chips conservan su tinte de color por tipo.
