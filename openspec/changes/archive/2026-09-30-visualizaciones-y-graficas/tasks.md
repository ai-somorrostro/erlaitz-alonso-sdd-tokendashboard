# Tasks

La verificación de este proyecto es manual: se abre `index.html` desde el sistema de ficheros y se comprueba el comportamiento observable, tal y como se ha hecho hasta ahora. No hay runner de tests. Cada tarea indica su comprobación.

Durante la implementación se ejecutaron además comprobaciones automáticas de apoyo, con `app.js` evaluado en Node y un `document` simulado, para lo que no hace falta un navegador:

- La suma de cada serie de siete días reproduce los totales de día y de semana del fixture anterior, y la degradación de un día sin dato afecta solo a la ventana semanal.
- La geometría de los dos gráficos: escala de precios común, ancho acotado a 880 px, orden por `precioOut` sobre una copia, dos elementos de trazo por panel, hueco del día sin dato, siete etiquetas relativas y rejilla de cuatro columnas.
- El dibujado completo produce un nodo `svg` en el espacio de nombres correcto, con 2 barras y 2 valores por fila de precios y 2 `path` por panel, y el bloque se oculta con `renderGraficos([])`.
- Ordenar la tabla por `precioIn` deja la rejilla de paneles en el orden del conjunto de datos y el gráfico de precios en el suyo.
- `index.html` sigue enlazando solo `styles.css` y `app.js`, sin ninguna URL externa.

Lo que queda por mirar en el navegador es el aspecto: que las formas se vean tal y como dicen los números, y el recorrido de los escenarios.

## 1. Serie de consumo y derivación de ventanas

- [x] 1.1 Reestructurar `MODELOS`: sustituir `consumo: { dia, semana }` por `consumo: { dias: [7 × { tokensIn, tokensOut }] }` repartiendo los totales actuales de día y de semana en siete días que los sumen. Verificación: abrir `index.html` y comprobar que las cuatro columnas de consumo muestran los mismos valores que antes del cambio.
- [x] 1.2 Añadir la derivación que devuelve el par `{ tokensIn, tokensOut }` de la ventana diaria y de la semanal a partir de la serie, con el día como último elemento y la semana como suma, y devolviendo `null` si algún día de la serie no aporta valor. Verificación: en la consola del navegador, la ventana semanal de un modelo con serie completa es igual a la suma de sus siete días y la diaria es igual al último día.
- [x] 1.3 Cambiar los cuatro casos de consumo de `valorColumna` para que consuman la derivación, sin modificar `totalTokens` ni `calcularCoste`. Verificación: la tabla mantiene los mismos importes y la ordenación por las cuatro columnas de consumo sigue funcionando; el diff no toca esas dos funciones.

## 2. Conjunto de datos representativo para la granularidad por día

- [x] 2.1 Añadir a un modelo de consumo alto un día de su serie sin valor. Verificación: la ventana semanal de ese modelo muestra el marcador explícito de no disponible en la tabla, en lugar de un importe calculado a partir de seis días.
- [x] 2.2 Ajustar las series para que al menos un modelo tenga un consumo diario varias veces menor que el del modelo de mayor consumo. Verificación: la diferencia de magnitud se aprecia comparando los totales de hoy en la tabla.
- [x] 2.3 Confirmar que en el conjunto hay a la vez un día con valor cero real y un día sin valor, y que son distinguibles. Verificación: el modelo sin tokens de entrada mantiene ceros explícitos en su serie y esos días dibujan serie, mientras que el día sin valor del modelo del punto 2.1 no aporta ninguno.

## 3. Andamiaje de dibujo y contenedores

- [x] 3.1 Añadir en `index.html` un bloque de gráficos por encima de la tabla, con un contenedor para el gráfico de precios y otro para los paneles de consumo. Verificación: al abrir `index.html` los dos contenedores existen y quedan por encima de la tabla.
- [x] 3.2 Añadir el helper único de creación de elementos en el espacio de nombres SVG, más el helper de texto y de atributo que lo acompaña, y hacer que toda forma de los gráficos salga de ahí. Verificación: la inspección del código no encuentra ninguna creación de elemento de gráfico con `createElement`, y las formas se dibujan visibles en el navegador.
- [x] 3.3 Definir en `styles.css` `--serie-entrada` y `--serie-salida`, distintas de las variables de los badges de modalidad y con diferencia de luminancia entre ellas. Verificación: ningún valor de las dos series coincide con los de `--badge-*`, y la diferencia de luminancia entre ambas es perceptible.

## 4. Gráfico comparativo de precios

- [x] 4.1 Construir el gráfico de precios: una fila por modelo visible, con una barra para el precio de entrada y otra para el de salida, y el valor rotulado junto a cada barra. Verificación: cada modelo visible tiene su fila con las dos barras, sus números coinciden con los de la tabla y el valor del modelo más barato es legible aunque su barra sea mínima.
- [x] 4.2 Acotar el ancho del trazado con un máximo fijo en lugar de estirarlo al ancho del bloque. Verificación: con el conjunto completo, la barra del modelo más caro no ocupa todo el ancho disponible.
- [x] 4.3 Ordenar las filas de mayor a menor precio de salida sobre una copia del conjunto con `slice()`, nunca sobre el array que usa la tabla. Verificación: ordenar la tabla por varias columnas deja el orden del gráfico intacto y el conjunto de modelos de la tabla no ha cambiado de orden.
- [x] 4.4 Documentar el gráfico de precios en el `README.md`. Verificación: el README describe qué muestra, que el valor se lee junto a la barra y que el trazado está acotado.

## 5. Paneles de evolución del consumo

- [x] 5.1 Construir un panel por modelo visible, con cabecera de nombre del modelo y valor absoluto de tokens del día. Verificación: hay un panel por cada modelo visible y su cabecera muestra el nombre junto al número de tokens de hoy.
- [x] 5.2 Dibujar entrada y salida como áreas apiladas, con un `<path>` por serie y la `d` construida como string, de modo que el contorno superior del panel sea el total del día. Verificación: la altura del contorno superior coincide con la suma de entrada y salida del día, y cada panel contiene dos elementos de trazo y no catorce.
- [x] 5.3 Normalizar cada panel contra su propio máximo, sin eje compartido. Verificación: la forma del panel de menor consumo se lee igual de bien que la de los paneles grandes, y ninguno queda reducido a una línea plana pegada al borde inferior.
- [x] 5.4 Dibujar el día sin dato como hueco, partiendo la `d` en dos tramos, en lugar de dejarlo a altura cero. Verificación: en el panel del modelo con el día sin dato el trazado se interrumpe, y ese día no se confunde con el día de cero real del modelo sin tokens de entrada, que sí dibuja su serie en el borde.
- [x] 5.5 Rotular el eje con días relativos que terminan en el día actual, sin fechas concretas. Verificación: las siete etiquetas son relativas y la última es la del día en curso; recargar la página no las cambia.
- [x] 5.6 Fijar la rejilla en cuatro columnas con ancho máximo por panel y alineación a la izquierda, de modo que al filtrar no queden huecos intermedios ni paneles estirados. Verificación: con el conjunto completo las filas son de cuatro y de tres; con un solo modelo visible el panel mantiene su ancho y no ocupa todo el bloque.
- [x] 5.7 Documentar los paneles en el `README.md`. Verificación: el README describe la forma, el valor absoluto de la cabecera, la escala propia de cada panel y la lectura del hueco.

## 6. Acoplamiento con el conjunto filtrado

- [x] 6.1 Pasar el conjunto visible a los dos gráficos desde `render()`, sin que ninguno mantenga lista propia. Verificación: escribir en el buscador y aplicar los dos filtros de modalidad reduce los paneles y las barras a la vez que las filas, y la inspección del código no encuentra un segundo origen de modelos.
- [x] 6.2 Comprobar que ordenar la tabla no reordena la rejilla de paneles, que conserva el orden del conjunto de datos. Verificación: ordenar por varias columnas deja los paneles en el mismo orden.
- [x] 6.3 Ocultar el bloque de gráficos con el atributo `hidden` cuando ningún modelo supera los filtros. Verificación: con criterios que no dejan filas, el bloque de gráficos no ocupa espacio y la tabla presenta su estado vacío enumerando los filtros activos.
- [x] 6.4 Documentar en el `README.md` que los gráficos siguen los filtros y que se ocultan cuando no queda ningún modelo. Verificación: el README lo afirma y el comportamiento observado coincide.

## 7. Verificación de conjunto

- [ ] 7.1 Recorrer en el navegador la lista de escenarios de los cuatro requisitos añadidos y comprobar que los tres requisitos modificados siguen cumpliéndose tal y como los modificaba el delta. Verificación: cada escenario de visualización de precios, de evolución del consumo, de coherencia con la tabla y de paleta de series queda comprobado, y el consumo derivado, el funcionamiento sin dependencias y el conjunto de datos siguen cumpliendo lo que el delta fija.
- [x] 7.2 Confirmar que no se ha introducido ninguna dependencia ni ninguna petición de red. Verificación: `index.html` sigue enlazando únicamente `styles.css` y `app.js`, y la pestaña de red del navegador no muestra peticiones al abrir la página.
