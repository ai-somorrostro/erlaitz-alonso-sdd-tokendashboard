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

## Ficheros

- `index.html` — estructura de la página
- `styles.css` — estilos
- `app.js` — datos de prueba, cálculos de formato, ordenación y filtrado

Los datos viven en el array `MODELOS` de `app.js`. El coste nunca se almacena: se calcula siempre a partir de los tokens consumidos y del precio por millón, así que cambiar un precio actualiza todos los importes.
