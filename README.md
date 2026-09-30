# Comparador de modelos de lenguaje

Dashboard interno para comparar, de un vistazo, los modelos de lenguaje open source más relevantes: cuánto cuestan, qué tan rápido empiezan a responder, qué tipo de contenido aceptan y devuelven, y cuánto consume el equipo hoy y esta semana.

> **Los datos son ficticios.** Precios, TTFT y consumo son de prueba y sirven para validar el diseño y la idea, no reflejan valores reales de ningún proveedor.

## Cómo abrirlo

Haz doble clic en `index.html`. No hace falta servidor, instalación, ni paso de compilación: son HTML, CSS y JavaScript planos sin dependencias.

## Qué muestra

| Bloque | Columnas | Notas |
|---|---|---|
| Modelo | nombre | |
| Precio / 1M tokens | `$ in`, `$ out` | Entrada y salida separadas, porque la salida suele costar bastante más |
| TTFT | milisegundos | Cuánto tarda en devolver el primer token |
| Modalidades | `In`, `Out` | Un badge por tipo, con el nombre completo: Texto, Imagen, Audio, Video |
| Consumo equipo | `Hoy tokens`, `Hoy coste`, `Semana tokens`, `Semana coste` | Tokens y coste a la vez, en las dos ventanas |

Pulsa cualquier cabecera numérica para ordenar por esa columna; un segundo pulso invierte el sentido. La cabecera activa muestra una flecha y las filas sin valor se quedan siempre al final.

## Filtros

Sobre la tabla hay una barra con tres criterios que se combinan entre sí (un modelo sale si los cumple todos):

- **Buscar modelo** — subcadena del nombre, sin distinguir mayúsculas.
- **Modalidad de entrada** — deja solo los modelos que aceptan ese tipo de contenido.
- **Modalidad de salida** — deja solo los modelos que devuelven ese tipo de contenido.

Los dos filtros de modalidad son independientes: "entrada = Imagen" y "salida = Imagen" no significan lo mismo, y ninguno hereda el resultado del otro. Los dos selectores ofrecen siempre la lista completa de tipos, incluidos los que ningún modelo usa todavía, de modo que el vocabulario no cambia al añadir modelos.

A la derecha, el contador indica cuántos modelos están visibles de entre el total. **Limpiar** retira los tres criterios de una vez y deja la ordenación que hubiera activa intacta.

Cuando ningún modelo cumple los criterios, la tabla no se queda en blanco: las cabeceras siguen visibles y el cuerpo muestra *"Ningún modelo coincide con los filtros activos"*, enumerando qué filtros están aplicados y con un botón **Limpiar filtros** para deshacerlos de golpe.

Un guion largo (`—`) significa que no hay dato para ese modelo, no que falle la carga.

## Gráficos

Sobre la tabla hay dos gráficos, dibujados con SVG sin ninguna librería.

### Precio por 1M de tokens

Una fila por modelo con dos barras, la de entrada y la de salida. Las barras comparten una escala lineal, de modo que sus longitudes son comparables entre sí, y **el valor se lee junto a cada barra** en lugar de medirse a ojo: un precio pequeño sigue siendo legible aunque su barra sea un rasgo. Las filas van de mayor a menor precio de salida, con su propio criterio, independiente del de la tabla.

El trazado tiene un ancho máximo fijo y no se estira al ancho del bloque, así que el gráfico mantiene la proporción de las barras en pantallas anchas.

### Evolución del consumo

Un panel por modelo con los últimos siete días, la entrada y la salida apiladas: el contorno superior del área es el total del día. La cabecera lleva el nombre del modelo y **el valor absoluto de tokens de hoy**, que es la lectura rápida; el eje va con días relativos (`-6` … `-1`, `Hoy`) y nunca con fechas concretas, así que recargar no cambia las etiquetas.

Cada panel se normaliza contra su propio máximo, sin eje compartido. Los consumos del conjunto difieren en dos órdenes de magnitud, de modo que un eje común reduciría los paneles pequeños a una línea plana pegada al borde inferior; normalizando se leen todos con el mismo detalle.

Si un día no tiene dato, el trazado se interrumpe y el día queda como hueco, sin unir el anterior con el siguiente. Es distinto de un día con valor cero real, que sí dibuja su serie en el borde: en el panel de un modelo que consume tokens, un día sin dato no es un día sin consumo.

### Filtros

Los dos gráficos siguen los mismos filtros que la tabla y se reducen a la vez que las filas. Ordenar la tabla no reordena la rejilla de paneles, que conserva el orden del conjunto de datos. Cuando ningún modelo supera los filtros, el bloque entero se oculta y la tabla muestra su estado vacío.

## Ficheros

- `index.html` — estructura de la página
- `styles.css` — estilos
- `app.js` — datos de prueba, cálculos de formato, ordenación, filtrado y dibujado de los gráficos

Los datos viven en el array `MODELOS` de `app.js`. El coste nunca se almacena: se calcula siempre a partir de los tokens consumidos y del precio por millón, así que cambiar un precio actualiza todos los importes.

El consumo se guarda como una serie de siete días por modelo, no como dos totales. Las columnas de la tabla se derivan de esa serie: la ventana diaria es el último día y la semanal es su suma. Un día sin dato invalida la semana, que lo suma todo, pero no el día actual, que sí tiene el suyo; por eso un modelo puede mostrar el consumo de hoy y dejar la semana en `—`.

Los colores de los gráficos se definen en `styles.css` con `--serie-entrada` y `--serie-salida`, aparte de los `--badge-*`, que ya significan modalidad. Cada serie tiene además una diferencia de luminancia suficiente para distinguirse en escala de grises.
