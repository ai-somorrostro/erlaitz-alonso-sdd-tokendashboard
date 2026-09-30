const SIGLAS = {
  texto: { etiqueta: 'Texto' },
  imagen: { etiqueta: 'Imagen' },
  audio: { etiqueta: 'Audio' },
  video: { etiqueta: 'Video' },
};

// El consumo se guarda como una serie de siete días, del más antiguo al más reciente.
// El último día es hoy. La ventana diaria y la semanal se derivan de aquí, no se almacenan.
// Un día sin dato es `null`: un cero sigue siendo un cero, y los dos casos se dibujan distinto.
const MODELOS = [
  {
    id: 'llama-3-1-70b',
    nombre: 'Llama 3.1 70B',
    precioIn: 0.35,
    precioOut: 0.40,
    ttftMs: 320,
    modalidadesIn: ['texto'],
    modalidadesOut: ['texto'],
    consumo: {
      dias: [
        { tokensIn: 720000, tokensOut: 240000 },
        { tokensIn: 850000, tokensOut: 285000 },
        { tokensIn: 960000, tokensOut: 320000 },
        { tokensIn: 1100000, tokensOut: 360000 },
        { tokensIn: 980000, tokensOut: 330000 },
        { tokensIn: 790000, tokensOut: 265000 },
        { tokensIn: 900000, tokensOut: 300000 },
      ],
    },
  },
  {
    id: 'qwen-2-5-72b',
    nombre: 'Qwen 2.5 72B',
    precioIn: 0.12,
    precioOut: 0.39,
    ttftMs: 240,
    modalidadesIn: ['texto'],
    modalidadesOut: ['texto'],
    consumo: {
      dias: [
        { tokensIn: 1100000, tokensOut: 470000 },
        { tokensIn: 1250000, tokensOut: 530000 },
        { tokensIn: 1380000, tokensOut: 590000 },
        null,
        { tokensIn: 1520000, tokensOut: 650000 },
        { tokensIn: 1350000, tokensOut: 580000 },
        { tokensIn: 1450000, tokensOut: 620000 },
      ],
    },
  },
  {
    id: 'mixtral-8x22b',
    nombre: 'Mixtral 8x22B',
    precioIn: 0.90,
    precioOut: 0.90,
    ttftMs: 480,
    modalidadesIn: ['texto'],
    modalidadesOut: ['texto'],
    consumo: {
      dias: [
        { tokensIn: 240000, tokensOut: 75000 },
        { tokensIn: 285000, tokensOut: 88000 },
        { tokensIn: 330000, tokensOut: 102000 },
        { tokensIn: 355000, tokensOut: 112000 },
        { tokensIn: 300000, tokensOut: 92000 },
        { tokensIn: 280000, tokensOut: 76000 },
        { tokensIn: 310000, tokensOut: 95000 },
      ],
    },
  },
  {
    id: 'llama-3-2-vision',
    nombre: 'Llama 3.2 Vision',
    precioIn: 0.19,
    precioOut: 0.19,
    ttftMs: 410,
    modalidadesIn: ['texto', 'imagen'],
    modalidadesOut: ['texto'],
    consumo: {
      dias: [
        { tokensIn: 340000, tokensOut: 135000 },
        { tokensIn: 390000, tokensOut: 155000 },
        { tokensIn: 445000, tokensOut: 178000 },
        { tokensIn: 480000, tokensOut: 190000 },
        { tokensIn: 420000, tokensOut: 168000 },
        { tokensIn: 345000, tokensOut: 134000 },
        { tokensIn: 480000, tokensOut: 190000 },
      ],
    },
  },
  {
    id: 'qwen-2-vl',
    nombre: 'Qwen 2 VL',
    precioIn: 0.15,
    precioOut: 0.15,
    ttftMs: null,
    modalidadesIn: ['texto', 'imagen'],
    modalidadesOut: ['texto'],
    consumo: {
      dias: [
        { tokensIn: 520000, tokensOut: 185000 },
        { tokensIn: 590000, tokensOut: 210000 },
        { tokensIn: 670000, tokensOut: 240000 },
        { tokensIn: 710000, tokensOut: 255000 },
        { tokensIn: 640000, tokensOut: 230000 },
        { tokensIn: 550000, tokensOut: 200000 },
        { tokensIn: 720000, tokensOut: 260000 },
      ],
    },
  },
  {
    id: 'whisper-large-v3',
    nombre: 'Whisper Large v3',
    precioIn: 0.006,
    precioOut: 0,
    ttftMs: 150,
    modalidadesIn: ['audio'],
    modalidadesOut: ['texto'],
    consumo: {
      dias: [
        { tokensIn: 100000, tokensOut: 15000 },
        { tokensIn: 118000, tokensOut: 18000 },
        { tokensIn: 132000, tokensOut: 20000 },
        { tokensIn: 128000, tokensOut: 19000 },
        { tokensIn: 120000, tokensOut: 18000 },
        { tokensIn: 122000, tokensOut: 18000 },
        { tokensIn: 120000, tokensOut: 18000 },
      ],
    },
  },
  {
    id: 'render-por-lotes',
    nombre: 'Render por lotes (sin prompt)',
    precioIn: 0,
    precioOut: 0.02,
    ttftMs: 2200,
    modalidadesIn: [],
    modalidadesOut: ['imagen'],
    consumo: {
      dias: [
        { tokensIn: 0, tokensOut: 15000 },
        { tokensIn: 0, tokensOut: 18000 },
        { tokensIn: 0, tokensOut: 25000 },
        { tokensIn: 0, tokensOut: 30000 },
        { tokensIn: 0, tokensOut: 26000 },
        { tokensIn: 0, tokensOut: 30000 },
        { tokensIn: 0, tokensOut: 24000 },
      ],
    },
  },
];

const SIN_VALOR = '—';

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function totalTokens(consumo) {
  if (!consumo) return null;
  if (!esNumero(consumo.tokensIn) || !esNumero(consumo.tokensOut)) return null;
  return consumo.tokensIn + consumo.tokensOut;
}

function calcularCoste(consumo, modelo) {
  if (!consumo || !modelo) return null;
  if (!esNumero(consumo.tokensIn) || !esNumero(consumo.tokensOut)) return null;
  if (!esNumero(modelo.precioIn) || !esNumero(modelo.precioOut)) return null;
  return (consumo.tokensIn * modelo.precioIn + consumo.tokensOut * modelo.precioOut) / 1000000;
}

function diaCompleto(dia) {
  return Boolean(dia) && esNumero(dia.tokensIn) && esNumero(dia.tokensOut);
}

function serieDe(modelo) {
  const consumo = modelo && modelo.consumo;
  if (!consumo || !Array.isArray(consumo.dias) || consumo.dias.length === 0) return null;
  return consumo.dias;
}

// La ventana diaria es el último día de la serie. La semanal es la suma de todos.
// Cada ventana degrada por separado: un día sin dato invalida la semana —que lo suma
// todo— pero no el día actual, que sí tiene el suyo. Así la tabla nunca enseña una
// suma que subestima el gasto sin avisar.
function ventanas(modelo) {
  const dias = serieDe(modelo);
  if (!dias) return { dia: null, semana: null };
  const ultimo = dias[dias.length - 1];
  const dia = diaCompleto(ultimo) ? { tokensIn: ultimo.tokensIn, tokensOut: ultimo.tokensOut } : null;
  if (!dias.every(diaCompleto)) return { dia, semana: null };
  return {
    dia,
    semana: dias.reduce(
      (total, diaActual) => ({
        tokensIn: total.tokensIn + diaActual.tokensIn,
        tokensOut: total.tokensOut + diaActual.tokensOut,
      }),
      { tokensIn: 0, tokensOut: 0 }
    ),
  };
}

function redondear(valor, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

function formatearTokens(valor) {
  if (!esNumero(valor)) return SIN_VALOR;
  if (Math.abs(valor) >= 1000000) return redondear(valor / 1000000, 1) + 'M';
  if (Math.abs(valor) >= 1000) return redondear(valor / 1000, 1) + 'k';
  return String(valor);
}

function formatearPrecio(valor) {
  if (!esNumero(valor)) return SIN_VALOR;
  const decimales = valor > 0 && valor < 0.01 ? 4 : 2;
  return '$' + redondear(valor, decimales).toFixed(decimales);
}

function formatearCoste(valor) {
  if (!esNumero(valor)) return SIN_VALOR;
  if (Math.abs(valor) >= 1000) return '$' + redondear(valor / 1000, 1) + 'k';
  return '$' + redondear(valor, 2).toFixed(2);
}

function formatearTTFT(valor) {
  if (!esNumero(valor)) return SIN_VALOR;
  return valor + ' ms';
}

const COLUMNAS = [
  { id: 'precio-in', etiqueta: '$ in', clave: 'precioIn', agrupado: 'precio', tipo: 'precio' },
  { id: 'precio-out', etiqueta: '$ out', clave: 'precioOut', agrupado: 'precio', tipo: 'precio' },
  { id: 'ttft', etiqueta: 'TTFT', clave: 'ttftMs', agrupado: null, tipo: 'ttft' },
  { id: 'tokens-hoy', etiqueta: 'Hoy tokens', clave: 'tokensHoy', agrupado: 'consumo', tipo: 'tokens' },
  { id: 'coste-hoy', etiqueta: 'Hoy coste', clave: 'costeHoy', agrupado: 'consumo', tipo: 'coste' },
  { id: 'tokens-semana', etiqueta: 'Semana tokens', clave: 'tokensSemana', agrupado: 'consumo', tipo: 'tokens' },
  { id: 'coste-semana', etiqueta: 'Semana coste', clave: 'costeSemana', agrupado: 'consumo', tipo: 'coste' },
];

const GRUPOS = [
  { id: 'precio', etiqueta: 'Precio / 1M tokens' },
  { id: 'modalidades', etiqueta: 'Modalidades' },
  { id: 'consumo', etiqueta: 'Consumo equipo' },
];

const COLUMNAS_MODALIDADES = [
  { id: 'modalidades-in', etiqueta: 'In', tipo: 'modalidades', grupo: 'modalidades' },
  { id: 'modalidades-out', etiqueta: 'Out', tipo: 'modalidades', grupo: 'modalidades' },
];

const HOJAS = [
  ...COLUMNAS.filter(columna => columna.agrupado === 'precio'),
  ...COLUMNAS.filter(columna => columna.agrupado === null),
  ...COLUMNAS_MODALIDADES,
  ...COLUMNAS.filter(columna => columna.agrupado === 'consumo'),
].map(hoja => ({ ...hoja, grupo: hoja.grupo !== undefined ? hoja.grupo : hoja.agrupado }));

function valorColumna(modelo, clave) {
  switch (clave) {
    case 'precioIn':
      return modelo.precioIn;
    case 'precioOut':
      return modelo.precioOut;
    case 'ttftMs':
      return modelo.ttftMs;
    case 'tokensHoy':
      return totalTokens(ventanas(modelo).dia);
    case 'costeHoy':
      return calcularCoste(ventanas(modelo).dia, modelo);
    case 'tokensSemana':
      return totalTokens(ventanas(modelo).semana);
    case 'costeSemana':
      return calcularCoste(ventanas(modelo).semana, modelo);
    default:
      return null;
  }
}

function formatearValor(columna, modelo) {
  const valor = valorColumna(modelo, columna.clave);
  if (!esNumero(valor)) return SIN_VALOR;
  switch (columna.tipo) {
    case 'precio':
      return formatearPrecio(valor);
    case 'ttft':
      return formatearTTFT(valor);
    case 'coste':
      return formatearCoste(valor);
    default:
      return formatearTokens(valor);
  }
}

const TITULOS_VACIOS = {
  precioIn: 'Precio de entrada no disponible',
  precioOut: 'Precio de salida no disponible',
  ttftMs: 'TTFT no medido',
  tokensHoy: 'Consumo de hoy no disponible',
  costeHoy: 'Consumo de hoy no disponible',
  tokensSemana: 'Consumo de la semana no disponible',
  costeSemana: 'Consumo de la semana no disponible',
};

function crearMarcador(titulo) {
  const marcador = document.createElement('span');
  marcador.className = 'vacio';
  marcador.textContent = SIN_VALOR;
  marcador.title = titulo;
  return marcador;
}

function crearBadge(tipo) {
  const sigla = SIGLAS[tipo];
  const badge = document.createElement('span');
  badge.className = 'badge badge--' + tipo;
  badge.textContent = sigla.etiqueta;
  return badge;
}

function crearCeldaModalidades(tipos, tituloVacio) {
  const celda = document.createElement('td');
  celda.className = 'celda-modalidades';
  if (!tipos || tipos.length === 0) {
    celda.appendChild(crearMarcador(tituloVacio));
    return celda;
  }
  tipos.forEach(tipo => celda.appendChild(crearBadge(tipo)));
  return celda;
}

function crearCeldaColumna(columna, modelo) {
  const celda = document.createElement('td');
  celda.className = 'celda-' + columna.tipo;
  const valor = valorColumna(modelo, columna.clave);
  if (!esNumero(valor)) {
    celda.appendChild(crearMarcador(TITULOS_VACIOS[columna.clave] || 'Valor no disponible'));
    return celda;
  }
  celda.textContent = formatearValor(columna, modelo);
  return celda;
}

function crearFila(modelo) {
  const fila = document.createElement('tr');
  const celdaModelo = document.createElement('th');
  celdaModelo.scope = 'row';
  celdaModelo.className = 'celda-modelo';
  celdaModelo.textContent = modelo.nombre;
  fila.appendChild(celdaModelo);
  HOJAS.forEach(hoja => {
    fila.appendChild(
      hoja.grupo === 'modalidades'
        ? crearCeldaModalidades(
            hoja.id === 'modalidades-in' ? modelo.modalidadesIn : modelo.modalidadesOut,
            hoja.id === 'modalidades-in'
              ? 'No admite contenido de entrada'
              : 'No genera contenido de salida'
          )
        : crearCeldaColumna(hoja, modelo)
    );
  });
  return fila;
}

function crearCabeceraHoja(hoja) {
  const celda = document.createElement('th');
  celda.scope = 'col';
  celda.className = 'col-' + hoja.tipo;
  celda.dataset.columna = hoja.id;
  const activa = hoja.clave !== undefined && orden.columna === hoja.clave;
  if (hoja.clave) {
    celda.setAttribute('aria-sort', activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none');
  }
  if (activa) celda.className += ' es-activa';
  if (!hoja.clave) {
    celda.textContent = hoja.etiqueta;
    return celda;
  }
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'th-boton';
  boton.dataset.clave = hoja.clave;
  const etiqueta = document.createElement('span');
  etiqueta.className = 'th-etiqueta';
  etiqueta.textContent = hoja.etiqueta;
  const indicador = document.createElement('span');
  indicador.className = 'th-orden';
  indicador.textContent = activa ? (orden.direccion === 'asc' ? '▲' : '▼') : '';
  boton.appendChild(etiqueta);
  boton.appendChild(indicador);
  celda.appendChild(boton);
  return celda;
}

function crearCabecera() {
  const thead = document.createElement('thead');
  const filaGrupos = document.createElement('tr');
  const filaHojas = document.createElement('tr');

  const celdaModelo = document.createElement('th');
  celdaModelo.scope = 'col';
  celdaModelo.rowSpan = 2;
  celdaModelo.className = 'col-modelo';
  celdaModelo.textContent = 'Modelo';
  filaGrupos.appendChild(celdaModelo);

  let grupoAbierto = null;

  HOJAS.forEach(hoja => {
    if (hoja.grupo === grupoAbierto) return;
    grupoAbierto = hoja.grupo;
    if (hoja.grupo === null) {
      const celdaSimple = crearCabeceraHoja(hoja);
      celdaSimple.rowSpan = 2;
      filaGrupos.appendChild(celdaSimple);
      return;
    }
    const grupo = GRUPOS.find(candidato => candidato.id === hoja.grupo);
    const celdaGrupo = document.createElement('th');
    celdaGrupo.scope = 'colgroup';
    celdaGrupo.colSpan = HOJAS.filter(candidata => candidata.grupo === hoja.grupo).length;
    celdaGrupo.className = 'col-grupo col-grupo--' + hoja.grupo;
    celdaGrupo.textContent = grupo ? grupo.etiqueta : hoja.grupo;
    filaGrupos.appendChild(celdaGrupo);
  });

  HOJAS.filter(hoja => hoja.grupo !== null).forEach(hoja => filaHojas.appendChild(crearCabeceraHoja(hoja)));

  thead.appendChild(filaGrupos);
  thead.appendChild(filaHojas);
  return thead;
}

function etiquetaModalidad(tipo) {
  return SIGLAS[tipo] ? SIGLAS[tipo].etiqueta : tipo;
}

function criteriosActivos() {
  const criterios = [];
  if (filtros.texto) criterios.push('Nombre: "' + filtros.texto + '"');
  if (filtros.in !== TODAS) criterios.push('Entrada: ' + etiquetaModalidad(filtros.in));
  if (filtros.out !== TODAS) criterios.push('Salida: ' + etiquetaModalidad(filtros.out));
  return criterios;
}

function crearMensajeSinCoincidencias() {
  const mensaje = document.createElement('div');
  mensaje.className = 'sin-coincidencias';

  const titulo = document.createElement('p');
  titulo.className = 'sin-coincidencias-titulo';
  titulo.textContent = 'Ningún modelo coincide con los filtros activos';
  mensaje.appendChild(titulo);

  const criterios = criteriosActivos();
  if (criterios.length > 0) {
    const detalle = document.createElement('p');
    detalle.className = 'sin-coincidencias-criterios';
    detalle.textContent = 'Filtros activos: ' + criterios.join(' · ');
    mensaje.appendChild(detalle);
  }

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-filtro';
  boton.textContent = 'Limpiar filtros';
  boton.addEventListener('click', limpiarFiltros);
  mensaje.appendChild(boton);

  return mensaje;
}

function crearFilaSinCoincidencias() {
  const fila = document.createElement('tr');
  const celda = document.createElement('td');
  celda.className = 'celda-sin-coincidencias';
  celda.colSpan = HOJAS.length + 1;
  celda.appendChild(crearMensajeSinCoincidencias());
  fila.appendChild(celda);
  return fila;
}

function renderTabla(contenedor, modelos) {
  contenedor.replaceChildren();
  contenedor.appendChild(crearCabecera());
  const tbody = document.createElement('tbody');
  if (modelos.length === 0) {
    tbody.appendChild(crearFilaSinCoincidencias());
  } else {
    modelos.forEach(modelo => tbody.appendChild(crearFila(modelo)));
  }
  contenedor.appendChild(tbody);
}

function renderContador(visibles) {
  const contador = document.getElementById('contador-modelos');
  contador.textContent = visibles.length + ' de ' + MODELOS.length + ' modelos';
}

/* Gráficos
 *
 * Todo lo que se dibuja sale de `elementoSvg` y `textoSvg`: los elementos de
 * gráfico nunca se crean con `document.createElement`, porque fuera del espacio
 * de nombres SVG el navegador no los trata como formas. El color no se pasa
 * desde aquí: cada serie se pinta con una clase y la paleta vive en el CSS.
 *
 * El cálculo de posiciones está separado del dibujado a propósito: son
 * funciones puras que devuelven números y cadenas, y así se pueden comprobar
 * sin abrir el navegador.
 */

const NS_SVG = 'http://www.w3.org/2000/svg';

function elementoSvg(nombre, atributos) {
  const elemento = document.createElementNS(NS_SVG, nombre);
  if (!atributos) return elemento;
  Object.keys(atributos).forEach(clave => {
    const valor = atributos[clave];
    if (valor === null || valor === undefined) return;
    elemento.setAttribute(clave, String(valor));
  });
  return elemento;
}

function textoSvg(contenido, atributos) {
  const texto = elementoSvg('text', atributos);
  texto.textContent = contenido;
  return texto;
}

function recortar(texto, maximo) {
  return texto.length > maximo ? texto.slice(0, maximo - 1) + '…' : texto;
}

function vaciar(contenedor) {
  contenedor.replaceChildren();
}

/* Gráfico de precios: una fila por modelo, con las barras de entrada y de
 * salida apiladas en vertical y el valor rotulado al final de cada una. */

const GRAFICO_PRECIOS = {
  anchoMaximo: 880,
  anchoMinimo: 360,
  altoBarra: 11,
  separacionBarras: 5,
  separacionFilas: 16,
  margenIzquierdo: 200,
  margenDerecho: 104,
  margenSuperior: 44,
  margenInferior: 12,
  // Un precio de cero real es un dato, no una ausencia: la barra no desaparece,
  // se queda en un rasgo mínimo y el valor escrito al lado lo deja legible.
  anchoMinimoBarra: 2,
  caracteresNombre: 27,
};

function anchoDeTrazadoPrecios(config, ancho) {
  return Math.max(60, ancho - config.margenIzquierdo - config.margenDerecho);
}

function escalaDePrecios(visibles) {
  const maximo = visibles.reduce(
    (mayor, modelo) =>
      Math.max(
        mayor,
        esNumero(modelo.precioIn) ? modelo.precioIn : 0,
        esNumero(modelo.precioOut) ? modelo.precioOut : 0
      ),
    0
  );
  return maximo > 0 ? maximo : 1;
}

function calcularLayoutPrecios(visibles, ancho) {
  const config = GRAFICO_PRECIOS;
  // La copia es obligatoria: `visibles` es la lista ordenada que usa la tabla y
  // este gráfico tiene su propio criterio, el precio de salida.
  const ordenados = visibles.slice().sort((uno, otro) => otro.precioOut - uno.precioOut);
  const escala = escalaDePrecios(visibles);
  const anchoTrazado = anchoDeTrazadoPrecios(config, ancho);
  const altoFila = config.altoBarra * 2 + config.separacionBarras + config.separacionFilas;
  const x = config.margenIzquierdo;

  const barras = (modelo, clave, y) => {
    const valor = esNumero(modelo[clave]) ? modelo[clave] : 0;
    return {
      serie: clave === 'precioIn' ? 'entrada' : 'salida',
      etiqueta: formatearPrecio(modelo[clave]),
      y,
      // Acotado por el ancho del trazado, nunca por el del bloque.
      ancho: Math.max(config.anchoMinimoBarra, (valor / escala) * anchoTrazado),
    };
  };

  const filas = ordenados.map((modelo, indice) => {
    const y = config.margenSuperior + indice * altoFila;
    return {
      modelo,
      nombre: recortar(modelo.nombre, config.caracteresNombre),
      y,
      barras: [
        barras(modelo, 'precioIn', y),
        barras(modelo, 'precioOut', y + config.altoBarra + config.separacionBarras),
      ],
    };
  });

  return {
    config,
    filas,
    x,
    anchoTrazado,
    escala,
    ancho,
    alto: config.margenSuperior + filas.length * altoFila + config.margenInferior,
  };
}

function anchoDisponible(contenedor, config) {
  const medido = contenedor.clientWidth;
  const disponible = esNumero(medido) && medido > 0 ? medido : config.anchoMaximo;
  return Math.round(Math.max(config.anchoMinimo, Math.min(disponible, config.anchoMaximo)));
}

function renderLeyendaPrecios(layout) {
  const grupo = elementoSvg('g', { class: 'grafico-leyenda' });
  [
    { serie: 'entrada', texto: 'Entrada', x: 0 },
    { serie: 'salida', texto: 'Salida', x: 96 },
  ].forEach(item => {
    grupo.appendChild(
      elementoSvg('rect', {
        class: 'leyenda-muestra leyenda-muestra--' + item.serie,
        x: item.x,
        y: layout.config.margenSuperior - 26,
        width: 10,
        height: 10,
        rx: 2,
      })
    );
    grupo.appendChild(
      textoSvg(item.texto, {
        class: 'leyenda-texto',
        x: item.x + 16,
        y: layout.config.margenSuperior - 17,
      })
    );
  });
  return grupo;
}

function renderFilaPrecios(fila, layout) {
  const grupo = elementoSvg('g', { class: 'grafico-fila' });
  grupo.appendChild(
    textoSvg(fila.nombre, { class: 'fila-nombre', x: 0, y: fila.y + layout.config.altoBarra * 0.8 })
  );
  fila.barras.forEach(barra => {
    grupo.appendChild(
      elementoSvg('rect', {
        class: 'barra-precio barra-precio--' + barra.serie,
        x: layout.x,
        y: barra.y,
        width: Math.round(barra.ancho),
        height: layout.config.altoBarra,
        rx: 2,
      })
    );
    grupo.appendChild(
      textoSvg(barra.etiqueta, {
        class: 'barra-valor',
        x: layout.x + Math.round(barra.ancho) + 6,
        y: barra.y + layout.config.altoBarra * 0.8,
      })
    );
  });
  return grupo;
}

function renderGraficoPrecios(contenedor, visibles) {
  vaciar(contenedor);
  if (visibles.length === 0) return;
  const layout = calcularLayoutPrecios(visibles, anchoDisponible(contenedor, GRAFICO_PRECIOS));
  const svg = elementoSvg('svg', {
    class: 'svg-precios',
    viewBox: '0 0 ' + layout.ancho + ' ' + layout.alto,
    width: layout.ancho,
    height: layout.alto,
    role: 'img',
    'aria-label': 'Precio por millón de tokens de entrada y de salida de cada modelo visible',
  });
  svg.appendChild(elementoSvg('title', {}));
  svg.firstChild.textContent = 'Precio por 1M de tokens, por modelo';
  svg.appendChild(renderLeyendaPrecios(layout));
  layout.filas.forEach(fila => svg.appendChild(renderFilaPrecios(fila, layout)));
  contenedor.appendChild(svg);
}

/* Paneles de consumo: un panel por modelo con su propia escala, apilando la
 * entrada debajo de la salida, de modo que el contorno superior del área es el
 * total del día. */

const PANEL_CONSUMO = {
  ancho: 300,
  altoCabecera: 26,
  altoTrazado: 96,
  altoEje: 20,
  margenIzquierdo: 18,
  margenDerecho: 18,
  caracteresNombre: 24,
};

function diasRelativos(cantidad) {
  const etiquetas = [];
  for (let indice = 0; indice < cantidad; indice += 1) {
    const retroceso = cantidad - 1 - indice;
    etiquetas.push(retroceso === 0 ? 'Hoy' : '-' + retroceso);
  }
  return etiquetas;
}

function maximoDeSerie(dias) {
  const maximo = dias.reduce((mayor, dia) => {
    if (!diaCompleto(dia)) return mayor;
    return Math.max(mayor, dia.tokensIn + dia.tokensOut);
  }, 0);
  return maximo > 0 ? maximo : 1;
}

// Un día sin dato corta el trazado. Se agrupan los días con dato en tramos
// consecutivos en lugar de inventar un cero: el hueco tiene que leerse como
// ausencia, no como un día que no se consumió nada.
function tramosDeSerie(dias) {
  const tramos = [];
  let inicio = 0;
  for (let indice = 0; indice <= dias.length; indice += 1) {
    const corta = indice === dias.length || !diaCompleto(dias[indice]);
    if (!corta) continue;
    if (indice > inicio) tramos.push({ desde: inicio, hasta: indice - 1 });
    inicio = indice + 1;
  }
  return tramos;
}

function calcularLayoutPanel(modelo) {
  const config = PANEL_CONSUMO;
  const dias = serieDe(modelo) || [];
  const yBase = config.altoCabecera + config.altoTrazado;
  const anchoTrazado = config.ancho - config.margenIzquierdo - config.margenDerecho;
  const paso = dias.length > 1 ? anchoTrazado / (dias.length - 1) : 0;
  const ultimo = dias[dias.length - 1];
  return {
    config,
    dias,
    yBase,
    paso,
    maximo: maximoDeSerie(dias),
    anchoTrazado,
    totalHoy: diaCompleto(ultimo) ? ultimo.tokensIn + ultimo.tokensOut : null,
    alto: yBase + config.altoEje,
  };
}

// `d` de un área: se sube por el borde superior, se recorre y se cierra por el
// borde inferior, que es el valor sobre el que se apoya.
function areaTramo(puntos, ySuperior, yInferior) {
  if (puntos.length === 0) return '';
  const primero = puntos[0];
  const ultimo = puntos[puntos.length - 1];
  const superior = puntos.map(punto => 'L' + punto.x + ',' + punto.ySuperior).join(' ');
  return [
    'M' + primero.x + ',' + yInferior(primero),
    superior,
    'L' + ultimo.x + ',' + yInferior(ultimo),
    'Z',
  ].join(' ');
}

// Una sola `d` por serie con un subtrazo por tramo, de forma que un panel tiene
// dos elementos de trazo y no uno por día.
function trazadosDeSerie(dias, layout) {
  const yDe = valor => layout.yBase - (valor / layout.maximo) * layout.config.altoTrazado;
  const tramos = tramosDeSerie(dias);
  const xDe = indice => layout.config.margenIzquierdo + indice * layout.paso;
  const tramosEntrada = [];
  const tramosSalida = [];
  tramos.forEach(tramo => {
    const puntos = [];
    for (let indice = tramo.desde; indice <= tramo.hasta; indice += 1) {
      const dia = dias[indice];
      puntos.push({ x: xDe(indice), yEntrada: yDe(dia.tokensIn), yTotal: yDe(dia.tokensIn + dia.tokensOut) });
    }
    tramosEntrada.push(areaTramo(puntos, punto => punto.yEntrada, () => layout.yBase));
    tramosSalida.push(areaTramo(puntos, punto => punto.yTotal, punto => punto.yEntrada));
  });
  return { entrada: tramosEntrada.join(' '), salida: tramosSalida.join(' ') };
}

function renderPanelConsumo(modelo) {
  const layout = calcularLayoutPanel(modelo);
  const config = layout.config;
  const svg = elementoSvg('svg', {
    class: 'svg-panel',
    viewBox: '0 0 ' + config.ancho + ' ' + layout.alto,
    width: config.ancho,
    height: layout.alto,
    role: 'img',
    'aria-label': 'Consumo diario de ' + modelo.nombre + ' durante los últimos siete días',
  });
  const titulo = elementoSvg('title', {});
  titulo.textContent = modelo.nombre;
  svg.appendChild(titulo);

  svg.appendChild(
    textoSvg(recortar(modelo.nombre, config.caracteresNombre), {
      class: 'panel-nombre',
      x: 0,
      y: 15,
    })
  );
  svg.appendChild(
    textoSvg(layout.totalHoy === null ? SIN_VALOR : formatearTokens(layout.totalHoy), {
      class: 'panel-total',
      x: config.ancho,
      y: 15,
      'text-anchor': 'end',
    })
  );

  svg.appendChild(
    elementoSvg('line', {
      class: 'panel-base',
      x1: config.margenIzquierdo,
      y1: layout.yBase,
      x2: config.margenIzquierdo + layout.anchoTrazado,
      y2: layout.yBase,
    })
  );

  const trazados = trazadosDeSerie(layout.dias, layout);
  svg.appendChild(elementoSvg('path', { class: 'area-area area-area--entrada', d: trazados.entrada }));
  svg.appendChild(elementoSvg('path', { class: 'area-area area-area--salida', d: trazados.salida }));

  diasRelativos(layout.dias.length).forEach((etiqueta, indice) => {
    svg.appendChild(
      textoSvg(etiqueta, {
        class: 'panel-eje',
        x: config.margenIzquierdo + indice * layout.paso,
        y: layout.yBase + 14,
        'text-anchor': 'middle',
      })
    );
  });

  return svg;
}

function renderPanelesConsumo(contenedor, visibles) {
  vaciar(contenedor);
  if (visibles.length === 0) return;
  // El orden de la rejilla es el del conjunto de datos, no el que tenga la
  // tabla, que llega ordenada por la columna activa.
  const porIdDeDatos = new Map(MODELOS.map((modelo, indice) => [modelo.id, indice]));
  visibles
    .slice()
    .sort((uno, otro) => porIdDeDatos.get(uno.id) - porIdDeDatos.get(otro.id))
    .forEach(modelo => contenedor.appendChild(renderPanelConsumo(modelo)));
}

function renderGraficos(visibles) {
  const bloque = document.getElementById('bloque-graficos');
  // El bloque desaparece entero cuando no queda ningún modelo, en vez de
  // dejar un hueco vacío con los dos gráficos dentro.
  bloque.hidden = visibles.length === 0;
  renderGraficoPrecios(document.getElementById('grafico-precios'), visibles);
  renderPanelesConsumo(document.getElementById('paneles-consumo'), visibles);
}

function render() {
  const visibles = modelosVisibles();
  renderContador(visibles);
  renderTabla(document.getElementById('tabla-modelos'), visibles);
  renderGraficos(visibles);
}

const orden = { columna: null, direccion: 'asc' };

const TODAS = 'todas';

const filtros = { texto: '', in: TODAS, out: TODAS };

function coincideConNombre(modelo) {
  if (!filtros.texto) return true;
  return modelo.nombre.toLowerCase().includes(filtros.texto.toLowerCase());
}

function coincideConModalidadIn(modelo) {
  if (filtros.in === TODAS) return true;
  return modelo.modalidadesIn.includes(filtros.in);
}

function coincideConModalidadOut(modelo) {
  if (filtros.out === TODAS) return true;
  return modelo.modalidadesOut.includes(filtros.out);
}

function compararPorOrden(uno, otro) {
  const valorUno = valorColumna(uno, orden.columna);
  const valorOtro = valorColumna(otro, orden.columna);
  const faltaUno = !esNumero(valorUno);
  const faltaOtro = !esNumero(valorOtro);
  if (faltaUno && faltaOtro) return 0;
  if (faltaUno) return 1;
  if (faltaOtro) return -1;
  return (valorUno - valorOtro) * (orden.direccion === 'asc' ? 1 : -1);
}

function modelosVisibles() {
  const filtrados = MODELOS.filter(
    modelo =>
      coincideConNombre(modelo) &&
      coincideConModalidadIn(modelo) &&
      coincideConModalidadOut(modelo)
  );
  if (!orden.columna) return filtrados;
  return filtrados.sort(compararPorOrden);
}

function alternarOrden(clave) {
  if (orden.columna === clave) {
    orden.direccion = orden.direccion === 'asc' ? 'desc' : 'asc';
    return;
  }
  orden.columna = clave;
  orden.direccion = 'asc';
}

function alPulsarCabecera(evento) {
  const boton = evento.target.closest('.th-boton');
  if (!boton) return;
  alternarOrden(boton.dataset.clave);
  render();
}

function poblarOpcionesModalidad(select) {
  Object.entries(SIGLAS).forEach(([tipo, sigla]) => {
    const opcion = document.createElement('option');
    opcion.value = tipo;
    opcion.textContent = sigla.etiqueta;
    select.appendChild(opcion);
  });
}

function alEscribirNombre(evento) {
  filtros.texto = evento.target.value;
  render();
}

function alElegirModalidadIn(evento) {
  filtros.in = evento.target.value;
  render();
}

function alElegirModalidadOut(evento) {
  filtros.out = evento.target.value;
  render();
}

function limpiarFiltros() {
  filtros.texto = '';
  filtros.in = TODAS;
  filtros.out = TODAS;
  document.getElementById('filtro-nombre').value = '';
  document.getElementById('filtro-in').value = TODAS;
  document.getElementById('filtro-out').value = TODAS;
  render();
}

function iniciar() {
  document.getElementById('tabla-modelos').addEventListener('click', alPulsarCabecera);
  poblarOpcionesModalidad(document.getElementById('filtro-in'));
  poblarOpcionesModalidad(document.getElementById('filtro-out'));
  document.getElementById('filtro-nombre').addEventListener('input', alEscribirNombre);
  document.getElementById('filtro-in').addEventListener('change', alElegirModalidadIn);
  document.getElementById('filtro-out').addEventListener('change', alElegirModalidadOut);
  document.getElementById('limpiar-filtros').addEventListener('click', limpiarFiltros);
  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', iniciar);
}
