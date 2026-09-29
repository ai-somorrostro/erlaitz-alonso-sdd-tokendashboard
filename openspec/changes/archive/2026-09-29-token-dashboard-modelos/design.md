# Design

## Context

Repositorio vacío de contenido: solo existe `README.md` y el árbol de OpenSpec. No hay package.json, ni tooling, ni convenciones heredadas, ni specs previas. Esto deja elegir la estructura de ficheros desde cero.

Restricción dura del encargo: HTML, CSS y JS plano, sin librerías ni frameworks, abriendo el fichero directamente. Eso descarta cualquier paso de build, cualquier `import` de módulos externos y cualquier dependencia de red en tiempo de carga.

La motivación y el alcance están en proposal.md; el contrato de comportamiento, en `specs/model-comparison-dashboard/spec.md`. Aquí sólo el cómo.

Tensión central: 6 modelos × 10 columnas efectivas es una tabla ancha. El diseño tiene que mantener legible "de un vistazo" en un monitor de portátil sin reducir la información pedida.

## Goals / Non-Goals

**Goals:**
- Tres ficheros autocontenidos (`index.html`, `styles.css`, `app.js`) que funcionan vía `file://`.
- Un único array de datos de prueba como fuente de verdad; todo lo derivado (costes, ordenación) se calcula en render, nunca se almacena.
- Ancho de tabla razonable en pantalla de portátil sin scroll horizontal obligatorio.
- Estructura de HTML semántica (`table`, `thead`, `scope`) para que el orden visual y el orden de lectura asistida coincidan.

**Non-Goals:**
- Persistencia, backend, autenticación, despliegue.
- Precisión real de los datos: los valores del mock no reflejan precios vigentes ni consumo real, y no se recalculan desde ninguna fuente externa.
- Carga asíncrona de datos, virtualización, paginación.
- Accesibilidad completa más allá de HTML semántico y contraste razonable.

## Decisions

### D1: Ficheros planos separados, no un único HTML inline

**Elegido:** `index.html` + `styles.css` + `app.js`, referenciados con `<link>` y `<script src>` (no `type="module"`).

**Por qué:** el requisito de "cero dependencias" y de funcionar con `file://` descarta los ES modules en algunos navegadores (CORS con `file://`), así que el script es clásico y corre siempre.

**Alternativa considerada:** un solo `index.html` con `<style>` y `<script>` embebidos. Es lo más rápido de abrir y probar, pero mezcla presentación, estructura y datos en un fichero y hace la separación de responsabilidades más difícil de leer. Descartado: la separación en tres ficheros cuesta nada y el CSS compartido entre leyenda y badges (que sí queremos) queda natural.

### D2: Datos en `app.js` como array plano, sin fetch

**Elegido:** `const MODELOS = [...]` en el propio `app.js`.

**Por qué:** `fetch('./models.json')` falla bajo `file://` en la mayoría de navegadores por CORS. Como el requisito es abrir el fichero directamente, el fetch no es viable. Mantener el array en JS garantiza que funciona siempre.

**Alternativa considerada:** `models.json` + servidor local (`python -m http.server`). Descartado para la v1 porque añade un paso obligatorio y el encargo pide validar la idea, no montar infraestructura. Cuando llegue la API real, sustituir el literal por un `fetch` es un cambio localizado a una función.

### D3: Estructura de datos por modelo con tokens crudos, coste derivado

**Elegido:** cada modelo guarda tokens, no dinero:

```js
{
  id: 'llama-3.1-70b',
  nombre: 'Llama 3.1 70B',
  precioIn: 0.20,      // por 1M tokens
  precioOut: 0.60,     // por 1M tokens
  ttftMs: 320,
  modalidadesIn:  ['texto', 'imagen'],
  modalidadesOut: ['texto'],
  consumo: {
    dia:   { tokensIn: 900000, tokensOut: 300000 },
    semana:{ tokensIn: 6300000, tokensOut: 2100000 },
  },
  // sin campos de coste: se calculan
}
```

**Por qué:** cumple el escenario "el coste se deriva de los tokens y del precio". Si el coste fuera un campo almacenado, cambiar un precio dejaría cifras de coste obsoletas y alguien tendría que mantenerlas a mano. Con tokens crudos, el precio es la única variable que se toca al actualizar precios, y el consumo se recalcula solo.

**Consecuencia asumida:** el cálculo supone que todo el consumo de un modelo tiene la misma proporción in/out. Para datos de prueba es aceptable; con datos reales habría que decidir si se guarda la proporción o el desglose. Queda anotado en Open Questions.

**Fórmula:** `coste = (tokensIn * precioIn + tokensOut * precioOut) / 1_000_000`. Separada in/out y no un precio medio, porque en la mayoría de estos modelos el output cuesta 3-4× el input y promediar ocultaría justo el dato que más afecta al coste total.

### D4: Cabeceras agrupadas con `colspan`/`rowspan`

**Elegido:** `thead` de dos filas.

```
+--------+-------------+------+-------------+-------------------------------+
|        | Precio / 1M |      | Modalidades | Consumo equipo                |
| Modelo +-------+-------+ TTFT +------+------+--------+--------+------+------+
|        | $ in  | $ out |      | In   | Out  | Hoy tk | Hoy $  |Sem tk|Sem $ |
+--------+------+------+------+------+------+--------+--------+------+------+
```

`rowspan="2"` en Modelo y TTFT, `colspan="2|4|2"` en los grupos, `scope="col"` en cada header, `scope="colgroup"` en los de grupo.

**Por qué:** cumple el requisito de agrupación. Además resuelve la percepción de anchura: agrupado, el ojo lee 5 bloques, no 10 columnas. Con `scope` correcto, la lectura asistida anuncia "Precio, salida, por millón" en vez de perder la relación agrupada.

**Alternativa considerada:** celda doble con tokens grande y `$` debajo (`<div>` dentro del `<td>`), 8 columnas en vez de 10. Mejor densidad, pero mezcla dos unidades en un flujo de lectura que no distingue el dígito grande del pequeño, y el `scope` de columna no aplica a una celda con dos valores. Se descartó en favor de la opción A elegida durante la exploración.

### D5: Badges de letra + leyenda siempre visible

**Elegido:** `<span class="badge badge--texto" title="Texto">T</span>` en la tabla, y una `<div class="leyenda">` con los mismos spans, situada entre la cabecera de la página y la tabla, sin contenedor con scroll ni `position: fixed`.

**Por qué:** cumple "en algún sitio se pueda ver qué significa cada letra" sin depender del hover. `title` refuerza en escritorio pero no sustituye. Arriba y no en `tfoot` porque `tfoot` queda fuera de pantalla cuando la tabla crece, y no hay scroll previsto a 6 filas — la leyenda no debería depender de que la tabla esté corta.

**Vocabulario fijo de 4 siglas:** `T` texto, `I` imagen, `A` audio, `V` video. Los cuatro existen en leyenda desde el día 1 aunque el mock no use `V`, para que el vocabulario no cambie al añadir modelos.

**Corresponcia garantizada por construcción:** los badges se generan siempre desde el mismo diccionario `SIGLAS` (clave = tipo de contenido, valor = letra). Leyenda y tabla iteran sobre `Object.entries(SIGLAS)`, así que es imposible que una letra aparezca en la tabla sin su entrada en la leyenda. Se aplica también el `title` en el badge de leyenda.

**Alternativa considerada:** texto descriptivo ("texto + imagen"). Más legible, pero la celda se alarga con 3-4 tipos y rompe la comparación por patrón visual, que es el objetivo de los badges.

### D6: Ordenación por clave del array, sin mutar datos

**Elegido:** estado `{ columna, dirección }` en un módulo-scope, y `MODELO.slice().sort(...)` en cada render. El array original nunca se reordena.

**Por qué:** cumple "la ordenación no altera los datos mostrados". Con 6 filas el coste de reordenar una copia es irrelevante y evita una clase de bugs (orden acumulativo entre pulsaciones, valores permutados entre modelos) que sí aparecería con un `sort` in-place.

**Claves declaradas explícitamente:** cada columna ordenable declara su clave en una tabla `COLUMNAS` (`{ id, etiqueta, clave, agrupado }`) usada para render de cabeceras y para el comparador a la vez. Añadir una columna no obliga a tocar dos sitios.

**Indicador de orden activa:** una flecha `▲`/`▼` junto a la etiqueta de la cabecera activa, más un atributo `aria-sort` en el `<th>`. Cumple el escenario de "estado de ordenación identificable" sin depender del orden de las filas.

**Valores ausentes:** el comparador coloca `null`/`undefined` al final en ambas direcciones. Un modelo sin TTFT no debe hundirse al principio de la tabla ni invalidar la ordenación.

### D7: Marcadores explícitos para vacíos y para "datos de prueba"

**Elegido:** `renderTokens(v)` devuelve `"—"` y `renderPrecio(v)` devuelve `"—"` para valores ausentes; la celda de modalidades vacía es `—` también, con `title` descriptivo. Una nota visible bajo el título dice que los datos son ficticios.

**Por qué:** los escenarios piden que una celda ausente no pueda confundirse con un fallo de carga ni muestre `NaN`/`undefined`. `—` es el carácter neutro estándar para "no aplica" en tablas. Y marcar el mock como ficticio evita que alguien cite cifras de un dashboard de validación como si fueran reales.

## Risks / Trade-offs

- **[Ancho de tabla en portátil de 13"] → scroll horizontal o texto ilegible.** Mitigación: CSS Grid sobre la propia tabla con `min-width` en el contenedor y scroll horizontal dentro de la tabla solo como último recurso; unidades cortas (`ms`, `$/1M`, `1.2M`, `$0.42`); badges de ancho fijo. Aceptado que en movil haya scroll: el caso de uso declarado es monitor.
- **[Rótulos de modalidad divergen de las siglas]** → Mitigación: diccionario único `SIGLAS` consumido por leyenda y tabla (D5); CSS con una clase por tipo, nunca estilos inline por instancia.
- **[Coste calculado con proporción in/out fija]** → Mitigación: es correcto para datos de prueba; con datos reales, revisar (ver Open Questions). Riesgo asumido conscientemente, no defecto oculto.
- **[El mock envejece]** → el conjunto de datos está en un único array con nombres identificadores (`id` kebab-case), reordenable sin tocar la lógica de render. Un `models.json` cuando haya API real.
- **[Falta de verificación automatizada]** → al no haber build ni runner (por requisito), la validación es manual: abrir `index.html` y recorrer los escenarios de la spec. La spec está escrita para que cada escenario sea una comprobación manual concreta, no aspiracional.

## Migration Plan

No hay migración: es un sistema nuevo sin datos ni consumidores previos. Rollback = borrar los tres ficheros.

## Open Questions

- Cuando exista consumo real, ¿el desglose guardado debe ser `tokensIn`/`tokensOut` por separado (más fiel, más campos) o `tokens` con una proporción por modelo (más simple, como ahora)?
- ¿La ordenación debería persistirse entre recargas (p. ej. en `localStorage`) o empezar siempre por el orden por defecto? Ahora no persiste; para un dashboard de un solo uso en local, empezar limpio parece más predecible.
- ¿El TTFT real se medirá en un escenario controlado y documentado (prompt de longitud fija, un proveedor) o se alimentará de métricas de producción? Afecta a qué significa la columna, pero no a este diseño.
