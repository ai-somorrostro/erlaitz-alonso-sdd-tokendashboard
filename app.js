const SIGLAS = {
  texto: { etiqueta: 'Texto' },
  imagen: { etiqueta: 'Imagen' },
  audio: { etiqueta: 'Audio' },
  video: { etiqueta: 'Video' },
};

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
      dia: { tokensIn: 900000, tokensOut: 300000 },
      semana: { tokensIn: 6300000, tokensOut: 2100000 },
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
      dia: { tokensIn: 1450000, tokensOut: 620000 },
      semana: { tokensIn: 9100000, tokensOut: 3900000 },
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
      dia: { tokensIn: 310000, tokensOut: 95000 },
      semana: { tokensIn: 2100000, tokensOut: 640000 },
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
      dia: { tokensIn: 480000, tokensOut: 190000 },
      semana: { tokensIn: 2900000, tokensOut: 1150000 },
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
      dia: { tokensIn: 720000, tokensOut: 260000 },
      semana: { tokensIn: 4400000, tokensOut: 1580000 },
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
      dia: { tokensIn: 120000, tokensOut: 18000 },
      semana: { tokensIn: 840000, tokensOut: 126000 },
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
      dia: { tokensIn: 0, tokensOut: 24000 },
      semana: { tokensIn: 0, tokensOut: 168000 },
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
      return totalTokens(modelo.consumo.dia);
    case 'costeHoy':
      return calcularCoste(modelo.consumo.dia, modelo);
    case 'tokensSemana':
      return totalTokens(modelo.consumo.semana);
    case 'costeSemana':
      return calcularCoste(modelo.consumo.semana, modelo);
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

function render() {
  const visibles = modelosVisibles();
  renderContador(visibles);
  renderTabla(document.getElementById('tabla-modelos'), visibles);
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
