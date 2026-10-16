const API_KEY = 'a2cfef30';
const formulario = document.querySelector('#formulario');
const busqueda = document.querySelector('#busqueda');
const tipo = document.querySelector('#tipo');
const anio = document.querySelector('#anio');
const resultados = document.querySelector('#resultados');
const template = document.querySelector('#template-pelicula').content;
const error = document.querySelector('#error');
const loading = document.querySelector('#loading');
const total = document.querySelector('#total');
const paginaTexto = document.querySelector('#pagina');
const anterior = document.querySelector('#anterior');
const siguiente = document.querySelector('#siguiente');
const buscar = document.querySelector('#buscar');

let paginaActual = 1;
let totalPaginas = 1;

function mostrarCarga(estado) {
  loading.hidden = !estado;
  buscar.disabled = estado;
  anterior.disabled = estado || paginaActual === 1;
  siguiente.disabled = estado || paginaActual === totalPaginas;
}

function mostrarPeliculas(peliculas) {
  const fragment = document.createDocumentFragment();
  resultados.replaceChildren();

  peliculas.forEach((pelicula) => {
    const tarjeta = template.cloneNode(true);
    const imagen = tarjeta.querySelector('img');
    const sinImagen = tarjeta.querySelector('.sin-imagen');

    if (pelicula.Poster && /^https?:\/\//.test(pelicula.Poster)) {
      imagen.src = pelicula.Poster.replace(/^http:/, 'https:');
      imagen.alt = `Póster de ${pelicula.Title}`;
      imagen.hidden = false;
      imagen.addEventListener('error', () => {
        imagen.hidden = true;
        sinImagen.hidden = false;
      });
    } else {
      sinImagen.hidden = false;
    }

    tarjeta.querySelector('h3').textContent = pelicula.Title;
    const nombres = { movie: 'Película', series: 'Serie', episode: 'Episodio' };
    tarjeta.querySelector('.datos').textContent = `${pelicula.Year} · ${nombres[pelicula.Type] || pelicula.Type}`;
    fragment.appendChild(tarjeta);
  });

  resultados.appendChild(fragment);
}

async function buscarPeliculas(pagina = 1) {
  const titulo = busqueda.value.trim();
  if (!titulo) {
    busqueda.focus();
    return;
  }

  try {
    mostrarCarga(true);
    error.hidden = true;

    const url = new URL('https://www.omdbapi.com/');
    url.searchParams.set('apikey', API_KEY);
    url.searchParams.set('s', titulo);
    url.searchParams.set('page', pagina);
    if (tipo.value) url.searchParams.set('type', tipo.value);
    if (anio.value) url.searchParams.set('y', anio.value);

    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error('Error al consultar OMDb');
    const datos = await respuesta.json();

    if (datos.Response !== 'True') {
      resultados.replaceChildren();
      paginaActual = 1;
      totalPaginas = 1;
      paginaTexto.textContent = 'Página 1';
      total.textContent = '0 resultados';
      error.textContent = datos.Error === 'Movie not found!' ? 'No se encontraron títulos para esta búsqueda.' : (datos.Error || 'No se encontraron resultados.');
      error.hidden = false;
      return;
    }

    paginaActual = pagina;
    totalPaginas = Math.min(100, Math.ceil(Number(datos.totalResults) / 10));
    mostrarPeliculas(datos.Search);
    paginaTexto.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    total.textContent = `${datos.totalResults} resultados`;
  } catch (err) {
    resultados.replaceChildren();
    paginaActual = 1;
    totalPaginas = 1;
    paginaTexto.textContent = 'Página 1';
    total.textContent = 'Sin información disponible';
    error.textContent = 'No se pudo conectar con OMDb. Revisa tu conexión a Internet.';
    error.hidden = false;
  } finally {
    mostrarCarga(false);
  }
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarPeliculas();
});
tipo.addEventListener('change', () => buscarPeliculas());
anio.addEventListener('change', () => buscarPeliculas());
anterior.addEventListener('click', () => buscarPeliculas(paginaActual - 1));
siguiente.addEventListener('click', () => buscarPeliculas(paginaActual + 1));
document.addEventListener('DOMContentLoaded', () => buscarPeliculas());
