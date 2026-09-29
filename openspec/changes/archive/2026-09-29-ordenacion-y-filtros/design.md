# Design

## Context

Ver `proposal.md` para la motivación. Lo que condiciona el diseño es la forma del código actual:

- `app.js` es un único script sin módulos, sin build y sin dependencias. Todo son funciones puras más unas pocas que tocan el DOM.
- El render es un modelo de **destrucción y reconstrucción completa**: `render()` llama a `renderLeyenda()` y `renderTabla()`, y ambas empiezan por `replaceChildren()`.
- La ordenación ya está resuelta con un objeto de estado a nivel de módulo, `orden`, leído en el momento del render. No hay nada que "notificar": cada interacción vuelve a llamar a `render()`.
- `modelosVisibles()` (`app.js:399`) ya es el punto único por el que pasa la lista canónica antes de pintarse. Su nombre anticipa lo que este cambio va a hacer.
- El proyecto se cuida en accesibilidad de forma observable: `scope` en cada `th`, `aria-sort` en las cabeceras ordenables, `aria-label` en la leyenda, `title` con el motivo en los valores ausentes, y el requisito del spec de que una celda sin dato muestre un marcador explícito en lugar de quedar vacía.

Ese último punto es la norma que gobierna la decisión más importante de este diseño, y la razón por la que el estado vacío no es opcional.

## Goals / Non-Goals

**Goals:**

- Añadir el filtrado sin introducir un modelo de estado nuevo, reutilizando el patrón de `orden` que ya funciona.
- Que el filtrado y la ordenación sean ortogonales: cambiar uno no pisa el otro.
- Con el nombre completo en los badges, que no haga falta ningún glosario en pantalla para leer la tabla.
- Mantener el vocabulario de modalidades con una única fuente de verdad, ahora que la leyenda deja de existir.
- No perder de vista la accesibilidad que el resto del documento ya tiene.

**Non-Goals:**

- No se conservan los badges de una letra ni se añaden alias de sigla. La reversión es completa, no un modo compatible.
- No se filtran columnas, solo filas. El conjunto de columnas es constante y la cabecera siempre se pinta.
- No hay persistencia del estado: nada de `localStorage`, nada en la URL, nada entre recargas. El proyecto abre ficheros locales, no tiene dónde persistir y no se pidió.
- No hay búsqueda difusa, ni por identificador, ni multi-selección de modalidades. La búsqueda es por subcadena sobre el nombre, y cada dirección admite un único tipo o ninguno.
- No se toca el cálculo de valores, el formato, ni el conjunto de datos.

## Decisions

### La barra se construye una vez en el HTML y nunca se reconstruye

Esta es la decisión que condiciona a todas las demás.

`render()` destruye y recrea su contenido. Si la barra se generara desde JavaScript como hoy se genera la leyenda, cada tecla pulsada en el campo de búsqueda lo destruiría y lo recrearía, y **el campo perdería el foco y la posición del cursor a mitad de escritura**. En siete filas el coste de render es irrelevante; perder el foco no lo es, porque hace el filtrado por nombre inusable.

Por tanto: el contenedor de la barra es HTML estático en `index.html`, se crea una vez al cargar, y `render()` no lo toca. Solo se actualizan los valores de los controles y el texto del contador.

**Alternativa descartada:** generar la barra entera desde JS, con `replaceChildren()` incluido, por simetría con `crearCabecera()`. La simetría se paga con un campo de texto que pierde el foco en cada pulsación.

**Consecuencia:** los `<option>` de los dos selectores sí se generan desde JS, en la inicialización y una sola vez, porque el vocabulario vive en `SIGLAS` y no puede duplicarse a mano en el HTML. Esa es la razón por la que la barra es mitad estática y mitad generada: el esqueleto no se puede regenerar, y la lista de tipos sí tiene que derivar de la constante.

### El estado de filtrado vive junto a `orden`, en el mismo modelo

```js
const orden   = { columna: null, direccion: 'asc' };
const filtros = { texto: '', in: 'todas', out: 'todas' };
```

Dos objetos planos a nivel de módulo, sin envoltorio, sin getters, sin suscripciones. La lectura ocurre dentro de `render()`. Es exactamente el patrón que `orden` ya demuestra que funciona aquí, y no obliga a tocar ninguna línea del código de ordenación que hoy está bien.

Se mantiene separado en vez de un único `estado = { orden, filtros }` porque son ejes independientes y agruparlos no compra nada: quien modifica un filtro no debería poder alcanzar el estado de ordenación por accidente.

El valor centinela de los selectores es `'todas'`, no cadena vacía. Es una opción real de la lista y por eso necesita un valor propio; la condición "no hay filtro" se lee entonces como `filtros.in === 'todas'`, que se documenta a sí misma.

**Alternativa descartada:** un objeto único de estado con un `render()`-reactivo. Para siete filas estática es sobreingeniería, y no hay en qué basarse: el proyecto no tiene ni servidor ni estado remoto.

### `modelosVisibles()` es el embudo, y filtra antes de ordenar

```
   MODELOS
      |
      v
   filtros.texto?  -- no coincide --> [descartar]
   filtros.in?    -- no acepta  --> [descartar]
   filtros.out?   -- no produce --> [descartar]
      |
      v
   orden.columna ? -- si --> .sort(compararPorOrden)
      |
      v
   renderTabla(contenedor, filas)
```

El orden de las dos operaciones es filtrar y después ordenar, por razones de claridad sobre todo: el criterio de ordenación se evalúa sobre el conjunto que el usuario ha pedido ver, y así se lee. El resultado visible sería idéntico en el orden contrario.

La consecuencia útil sale gratis: como `orden` es estado de módulo que se lee en el momento de renderizar, y el filtrado no lo toca, **la ordenación sobrevive a los cambios de filtro sin código adicional**, que es justo el comportamiento que exige el escenario correspondiente del delta.

Las tres condiciones de filtro se combinan con Y. Un modelo sobrevive si cumple las tres. No se ofrece la semántica O porque "Texto" o "Imagen" no es una pregunta que alguien se haga sobre una entrada: la pregunta real es "solo los que aceptan imagen", que es un único tipo.

### El estado vacío es una fila del `tbody`, no la ausencia de la tabla

Se mantiene el `<thead>` completo y se sustituye el `<tbody>` por una única fila con un `td` que abarca todas las columnas. Decisiones dentro de eso:

- **La cabecera sobrevive.** Con cero filas, seguir viendo qué columnas existen es lo que permite reorientarse y, además, seguir pudiendo pulsar una cabecera para cambiar de ordenación.
- **El `colspan` se calcula como `HOJAS.length + 1`**, no como un número fijo. La tabla tiene diez columnas ahora, pero escribir el diez a mano es una fuente de fallo silencioso en cuanto se añada o retire una columna.
- **El mensaje enumera los criterios activos** en texto legible ("In: Video"), no solo cuenta. Saber *cuántos* modelos hay no dice *por qué* no hay ninguno.
- **El mensaje ofrece limpiar los filtros** como acción, porque la causa más probable siempre es un criterio mal puesto.

Esto no es un añadido de última hora: es el mismo compromiso que ya está escrito en el spec para las celdas, un nivel más arriba. Una tabla con cabeceras y ningún cuerpo es indistinguible de un script que ha fallado, y el proyecto decidió explícitamente que eso no es una salida aceptable.

**Alternativa descartada:** ocultar la tabla entera y mostrar un mensaje encima. Elimina la orientación que da la cabecera y deja la ordenación inaccesible justo cuando más falta hace para desbloquear la situación.

### Los badges conservan su identidad visual y solo cambian el rótulo

`SIGLAS` pierde el campo `letra` y conserva `etiqueta`. `crearBadge()` pasa a pintar `etiqueta`. Los modificadores de clase `badge--texto`, `badge--imagen`, etc. se quedan: son los que sostienen la comparación por patrón visual que el requisito modificado sigue exigiendo.

Lo que se elimina con la sigla es lo que solo tenía sentido con ella: el `title` con la explicación y el `cursor: help`. El escenario nuevo dice que el badge se lee "sin necesidad de interpretarlo con una clave externa ni de pasar el cursor por encima", así que el tooltip pasa a ser redundante y además ruido.

En CSS, el badge deja de ser una caja cuadrada de 20x20 con tamaño fijo y pasa a dimensionarse por su contenido con `padding` horizontal, y `white-space: nowrap` deja de ser un problema porque ya no hay nada que truncar en una sola palabra.

### La lista de tipos se genera desde `SIGLAS`, y solo desde ahí

Al caer la leyenda desaparecía, sin querer, la segunda copia del vocabulario de modalidades. La primera es `SIGLAS`, y las opciones del filtro serían la segunda: la que este diseño decide no duplicar. Como la opción "Todas" se antepone y el resto se itera sobre `Object.keys(SIGLAS)`, no queda ningún otro sitio que actualizar: añadir un tipo al vocabulario lo hace aparecer en los dos selectores, y quitarlo lo quita de los dos.

Esto es lo que recoge el escenario "El filtro ofrece todos los tipos de contenido", incluido `video`, que ningún modelo usa. Ese escenario no es un cortesía del autor del spec: es la razón de que la generación desde `SIGLAS` sea obligatoria y no una comodidad.

### Los controles se conectan por evento, no por delegación

La tabla ya delega un único `click` porque toda su superficie interactiva son las cabeceras. La barra no encaja en ese patrón: el campo de texto dispara `input` en cada pulsación, los selectores disparan `change`, y el botón dispara `click`. Delegar los tres eventos desde un ancestro común no aporta nada sobre tres escuchadores directos en `iniciar()`, y sería más difícil de seguir.

El campo de búsqueda escucha `input`, no `change`, porque con `change` el filtrado solo se aplicaría al perder el foco y la sensación sería de que el control no responde.

En cuanto a accesibilidad, y siguiendo el nivel de cuidado que ya tiene el documento: el campo lleva un `<label>` visible y no solo `placeholder`; los dos selectores llevan `<label for>`; el botón lleva `type="button"`; y el contador lleva `aria-live="polite"`, para que un lector de pantalla anuncie el nuevo número de filas tras cada cambio de filtro, que de otro modo es un cambio silencioso.

## Risks / Trade-offs

**[El nombre completo ensancha la tabla]** → "Texto" o "Imagen" ocupan más que una letra, y las dos celdas de modalidades suman del orden decien píxeles sobre un ancho mínimo de 1000 px. El contenedor ya es `overflow-x: auto` y el ancho máximo de la página es de 1400 px, así que en un monitor normal cabe sin scrolls nuevos. En pantallas estrechas hay un poco más de scroll horizontal, que es el coste explícito de la decisión. La alternativa de apilar los badges en vertical lo evitaría, pero descuadra la altura de las filas de los dos modelos con imagen, y en una tabla de siete filas eso se nota más que el ancho.

**[Un render completo por pulsación de teclado]** → Con siete modelos es gratis. `render()` reconstruye toda la tabla por cada tecla, y con un `MODELOS` de cientos de filas empezaría a notarse. El techo está documentado a propósito: si el conjunto de datos crece, el `input` del campo de búsqueda necesita un retardo antes de reprocesar. No se implementa ahora porque sería complejidad sin ningún problema que resolver.

**[El vocabulario de modalidades depende ahora de un solo sitio]** → Si alguien quita una entrada de `SIGLAS`, desaparece de los badges y de los dos filtros a la vez, sin ningún segundo lugar que se contradiga. Eso es intencionado, pero significa que `SIGLAS` pasa a ser infraestructura en lugar de un simple dato de presentación, y merece no tocarse a la ligera.

**[Deriva de redacción en el spec que este cambio no toca]** → El escenario "El conjunto de datos incluye un modelo de entrada de audio" sigue justificándose con la palabra "badge" al hablar de ejercitar una modalidad. Tras este cambio la palabra sigue siendo correcta —los badges siguen siendo badges, solo que con el nombre dentro—, así que el escenario no queda contradicho y se deja como está. Queda anotado por si en algún momento molesta leerlo.

**[Un filtro mal escrito degrada silenciosamente]** → Todo el filtrado ocurre sobre el array literal en memoria, sin `fetch` ni backend, así que el único modo de fallo posible es un error de JavaScript, y en ese caso la tabla entera deja de pintarse, lo que es evidente. No hay estado parcial que pueda confundir.

## Migration Plan

No hay migración. No hay datos persistidos, ni esquema, ni despliegue: el proyecto es un fichero HTML que se abre desde el sistema de ficheros. El "despliegue" es abrir `index.html` después de los cambios, y el rollback es revertir el commit.

Lo único que merece una nota es que el cambio afecta a lo que el equipo ve al abrir la herramienta, así que conviene que la barra de filtros y la nueva lectura de las modalidades se anuncien en el momento del merge, porque la leyenda desaparece de la pantalla y quien la buscaba la notará.

## Open Questions

- Si el botón de limpiar los filtros debería aparecer deshabilitado cuando no hay ningún criterio activo, o si conviene que esté siempre disponible y sea inocuo. Es un detalle de pulido que no cambia el spec, ni el enfoque, ni el reparto de tareas, y se puede decidir al implementarlo.
