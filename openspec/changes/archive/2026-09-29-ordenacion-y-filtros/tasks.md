# Tasks

## 1. Modalidades con nombre completo y retirada de la leyenda

- [x] 1.1 Quitar el campo `letra` de cada entrada de `SIGLAS` en `app.js`, conservando `etiqueta`, y verificar con una búsqueda de `.letra` en el proyecto que no queda ninguna lectura de ese campo fuera de su definición
- [x] 1.2 Cambiar `crearBadge()` para que pinte `etiqueta` en lugar de `letra`, y retirar el `title` y el `cursor: help` que solo tenían sentido con la sigla, abriendo `index.html` y comprobando que cada badge muestra "Texto", "Imagen" o "Audio" y que al pasar el cursor no aparece ningún globo explicativo
- [x] 1.3 Redimensionar `.badge` en `styles.css` para que su ancho lo fije el contenido con `padding` horizontal en lugar del cuadrado fijo de 20x20, conservando los modificadores `badge--texto`, `badge--imagen`, `badge--audio` y `badge--video`, y verificar abriendo la página que ningún nombre queda truncado y que el color sigue distinguiendo cada tipo
- [x] 1.4 Retirar el `<div class="leyenda">` de `index.html` y eliminar `renderLeyenda()` junto con su llamada dentro de `render()`, y verificar abriendo la página que ya no aparece ningún bloque de leyenda por encima de la tabla
- [x] 1.5 Borrar de `styles.css` las reglas `.leyenda`, `.leyenda-titulo`, `.leyenda-entrada` y `.leyenda-nombre`, y verificar con una búsqueda de `leyenda` en `styles.css` que no queda ninguna regla huérfana
- [x] 1.6 Actualizar el `README.md`: corregir la fila de Modalidades de la tabla de bloques y eliminar la mención a la leyenda, y verificar leyendo el README que ya no aparecen las siglas `T`/`I`/`A`/`V` ni se describe una leyenda

## 2. Lógica de filtrado y composición con la ordenación

- [x] 2.1 Declarar en `app.js` el objeto de estado `const filtros = { texto: '', in: 'todas', out: 'todas' }` junto al `orden` existente, y verificar que la página sigue cargando sin errores y que el estado de ordenación no se ve afectado
- [x] 2.2 Implementar el predicado de búsqueda por nombre como subcadena sin distinguir mayúsculas sobre `modelo.nombre`, y verificar escribiendo "qwen" que quedan las dos filas de Qwen y que escribir "QWEN" da el mismo resultado
- [x] 2.3 Implementar el predicado de modalidad de entrada sobre `modelo.modalidadesIn` cuando el criterio no es `'todas'`, y verificar que el criterio "Imagen" deja las dos filas que aceptan imagen y que el criterio "Audio" deja solo la de Whisper
- [x] 2.4 Implementar el predicado de modalidad de salida sobre `modelo.modalidadesOut` de forma independiente del de entrada, y verificar que el criterio de salida "Imagen" deja solo la fila de Render por lotes mientras el de entrada "Imagen" deja dos, sin que uno herede el resultado del otro
- [x] 2.5 Encadenar los tres predicados con Y dentro de `modelosVisibles()`, antes del `sort` que ya existe, y verificar que con los tres criterios en su valor inicial la tabla muestra las siete filas en el mismo orden que antes del cambio
- [x] 2.6 Comprobar que el filtrado no escribe nunca en `orden`: con un filtro activo, cambiar de columna debe seguir alternando ascendente y descendente, y el orden de las filas supervivientes debe ser el de esa columna y no el de la tabla entera

## 3. Barra de herramientas de filtrado

- [x] 3.1 Añadir en `index.html` el esqueleto estático de la barra de herramientas, con un `label` visible asociado a un `input` de texto, dos `label` asociados a un `select` cada uno, un `button type="button"` de limpiar y un `span` contador con `aria-live="polite"`, y verificar en el inspector que el `input` tiene `label` y no solo `placeholder`
- [x] 3.2 Poblar las opciones de los dos selectores en la inicialización, anteponiendo "Todas" e iterando el resto sobre `Object.keys(SIGLAS)`, y verificar abriendo cada desplegable que aparecen Texto, Imagen, Audio y Video, incluido Video aunque ningún modelo lo use
- [x] 3.3 Conectar el `input` al evento `input`, los dos selectores al `change` y el botón al `click`, de forma que cada uno actualice su parte de `filtros` y llame a `render()`, y verificar escribiendo un texto letra a letra que las filas se van acotando en vivo, que el foco y la posición del cursor se conservan a mitad de palabra y que el campo no parpadea ni se reconstruye
- [x] 3.4 Actualizar en `render()` el texto del contador con el formato "N de M modelos", verificando que refleja el número de filas visibles tras cada cambio de filtro y que se anuncia por `aria-live`
- [x] 3.5 Hacer que el botón de limpiar devuelva los tres criterios a su valor inicial y vuelva a llamar a `render()`, verificando que recuperan las siete filas y que la columna que estuviera ordenando sigue activa y en el mismo sentido
- [x] 3.6 Documentar en el `README.md` la barra de herramientas, los dos criterios de modalidad y el contador, y verificar leyendo el README que las interacciones descritas coinciden con las que la página permite hacer

## 4. Estado vacío explícito

- [x] 4.1 Cuando `modelosVisibles()` devuelva una lista vacía, renderizar una única fila en el `tbody` con un `td` cuyo `colspan` se calcule como `HOJAS.length + 1`, conservando el `thead`, y verificar con el criterio de salida "Video" que se ve la cabecera completa más un mensaje y que no queda un `tbody` vacío
- [x] 4.2 Redactar el mensaje indicando que ningún modelo coincide y enumerando los criterios activos en texto legible, por ejemplo "In: Video", y verificando que el mensaje nombra el filtro concreto en lugar de limitarse a decir que no hay resultados
- [x] 4.3 Incluir en el mensaje una acción para limpiar los filtros, y verificando que un solo clic devuelve las siete filas y deja el campo de búsqueda y los dos selectores en su valor inicial
- [x] 4.4 Anotar en el `README.md` que un conjunto de filtros sin coincidencias produce un mensaje explícito en lugar de una tabla vacía, y verificando que el README lo describe junto al resto de interacciones

## 5. Verificación de integración

- [x] 5.1 Recorrer los veintiún escenarios del delta de `model-comparison-dashboard` —doce del requisito de filtrado, cuatro del de modalidades y cinco del de tabla— y comprobar uno a uno que se cumple el WHEN y el THEN de cada uno
- [x] 5.2 Confirmar que la página sigue funcionando abriendo `index.html` directamente del sistema de ficheros, sin servidor, y que en la pestaña de red no aparece ninguna petición ni recurso externo tras añadir los controles de formulario
- [x] 5.3 Ejecutar `openspec validate ordenacion-y-filtros --strict` y verificar que no reporta errores en el delta
