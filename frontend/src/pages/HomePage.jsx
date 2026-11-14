import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import ObraCard from "../components/common/ObraCard";
import Loader from "../components/crud/Loader";
import { useApp } from "../context/AppContext";

/**
 * Página de Inicio (/)
 * Cumple el punto 3A.k: Slider con mínimo 5 diapositivas publicitarias, botón de pausa,
 * controles accesibles y texto alternativo descriptivo.
 * Separa claramente venta de obras, agenda de exposiciones y talleres según insights UX.
 */
const SLIDES_PUBLICITARIOS = [
  {
    id: 1,
    etiqueta: "Obra Destacada · Temporada 2026-II",
    titulo: "Atardecer Urbano en Monserrate — Valentina Restrepo",
    descripcion:
      "Óleo sobre lino de gran formato (100 x 120 cm) con certificado curatorial y marquetería flotante incluida.",
    imagen:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1400&q=80",
    alt: "Pintura al óleo Atardecer Urbano en Monserrate exhibida en la sala principal de Galería Prismas",
    ctaTexto: "Explorar obra destacada",
    ctaRuta: "/obras/detalle/atardecer-urbano-en-monserrate",
  },
  {
    id: 2,
    etiqueta: "Exposición En Curso · Entrada Libre con Reserva",
    titulo: "Luz de los Andes: Nuevas Miradas del Paisaje",
    descripcion:
      "Recorre 18 obras inéditas de pintura y fotografía sobre la cordillera colombiana. Reserva tu visita en pocos pasos.",
    imagen:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=80",
    alt: "Visitantes recorriendo la exposición Luz de los Andes en la Sala Bosque Popular",
    ctaTexto: "Reservar entradas gratuitas",
    ctaRuta: "/exposiciones/1",
  },
  {
    id: 3,
    etiqueta: "Talleres Artísticos · Inscripciones Abiertas",
    titulo: "Fundamentos de Pintura al Óleo — Kit Inicial Incluido",
    descripcion:
      "Horarios flexibles de sábado, niveles claros desde principiante y lista transparente de materiales para estudiantes.",
    imagen:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80",
    alt: "Taller práctico de pintura al óleo con pinceles, paleta de madera y lienzos en Galería Prismas",
    ctaTexto: "Ver horarios e inscribirme",
    ctaRuta: "/cursos/1",
  },
  {
    id: 4,
    etiqueta: "Escultura Contemporánea · Piezas Únicas",
    titulo: "Materia y Geometría: Piedra Barichara y Bronce",
    descripcion:
      "Adquiere esculturas certificadas de Sebastián Duarte con ficha técnica transparente y precios sin intermediarios.",
    imagen:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1400&q=80",
    alt: "Escultura tallada en piedra Barichara y bronce sobre pedestal en Galería Prismas",
    ctaTexto: "Ver colección de esculturas",
    ctaRuta: "/obras/Escultura",
  },
  {
    id: 5,
    etiqueta: "Beneficio Exclusivo Coleccionistas",
    titulo: "Envío Asegurado de Cortesía en Toda Colombia",
    descripcion:
      "Embalaje museográfico climatizado, factura electrónica con IVA discriminado y asesoría personalizada con Prisma IA.",
    imagen:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=80",
    alt: "Montaje de obras enmarcadas en pared blanca con iluminación museográfica cálida",
    ctaTexto: "Ir al catálogo completo",
    ctaRuta: "/obras",
  },
];

const HomePage = () => {
  const { accesibilidad, vistasRecientes } = useApp();
  const [slideActual, setSlideActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [destacadas, setDestacadas] = useState([]);
  const [exposiciones, setExposiciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const api = helpFetch();
    Promise.all([
      api.get(`${EMPRESA.apiBaseUrl}/obras?destacada=true&limit=6`),
      api.get(`${EMPRESA.apiBaseUrl}/exposiciones`),
      api.get(`${EMPRESA.apiBaseUrl}/cursos`),
    ]).then(([resObras, resExp, resCursos]) => {
      if (!resObras.err) setDestacadas(resObras.datos || []);
      if (!resExp.err) setExposiciones((resExp.datos || []).slice(0, 3));
      if (!resCursos.err) setCursos((resCursos.datos || []).slice(0, 3));
      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (pausado || accesibilidad.pausarAnimaciones) return;
    const intervalo = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % SLIDES_PUBLICITARIOS.length);
    }, 5500);
    return () => clearInterval(intervalo);
  }, [pausado, accesibilidad.pausarAnimaciones]);

  const slide = SLIDES_PUBLICITARIOS[slideActual];

  return (
    <div className="container py-4">
      {/* Encabezado h1 único de la página (Estándar W3C 3A.t) */}
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-3">
        <div>
          <span className="text-gold fw-bold text-uppercase small">
            Galería de Arte Contemporáneo · Bogotá
          </span>
          <h1 className="h2 mb-0">Galería Prismas: Obras Originales, Exposiciones y Talleres</h1>
        </div>
        <span className="small text-muted">
          Autenticidad garantizada · Precios transparentes en COP
        </span>
      </div>

      {/* Slider Publicitario de 5 imágenes con pausa y controles accesibles (3A.k) */}
      <section
        className="hero-slider mb-5 shadow"
        aria-roledescription="carrusel"
        aria-label="Promociones y anuncios destacados de Galería Prismas"
      >
        <img
          src={slide.imagen}
          alt={slide.alt}
          className="hero-slide-img"
        />
        <div className="hero-slide-content">
          <div style={{ maxWidth: "660px" }}>
            <span className="badge bg-warning text-dark mb-2 px-3 py-2">
              {slide.etiqueta}
            </span>
            <h2 className="display-6 text-white fw-bold mb-3">{slide.titulo}</h2>
            <p className="lead text-light mb-4">{slide.descripcion}</p>
            <div className="d-flex flex-wrap gap-2">
              <Link to={slide.ctaRuta} className="btn btn-gold btn-lg">
                {slide.ctaTexto}
              </Link>
              <Link to="/obras" className="btn btn-outline-light btn-lg">
                Catálogo completo
              </Link>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
            <div className="d-flex gap-2" role="tablist" aria-label="Selector de diapositiva">
              {SLIDES_PUBLICITARIOS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`btn btn-sm ${
                    idx === slideActual ? "btn-warning fw-bold" : "btn-outline-light"
                  }`}
                  onClick={() => setSlideActual(idx)}
                  aria-label={`Ir al anuncio ${idx + 1}: ${s.titulo}`}
                  aria-current={idx === slideActual ? "true" : undefined}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() =>
                  setSlideActual(
                    (slideActual - 1 + SLIDES_PUBLICITARIOS.length) %
                      SLIDES_PUBLICITARIOS.length
                  )
                }
                aria-label="Diapositiva anterior"
              >
                <i className="bi bi-chevron-left" aria-hidden="true"></i> Anterior
              </button>
              <button
                type="button"
                className="btn btn-light btn-sm fw-semibold"
                onClick={() => setPausado(!pausado)}
                aria-pressed={pausado}
                aria-label={pausado ? "Reanudar rotación del carrusel" : "Pausar rotación del carrusel"}
              >
                <i
                  className={`bi ${pausado ? "bi-play-fill" : "bi-pause-fill"} me-1`}
                  aria-hidden="true"
                ></i>
                {pausado ? "Reanudar" : "Pausar"}
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() =>
                  setSlideActual((slideActual + 1) % SLIDES_PUBLICITARIOS.length)
                }
                aria-label="Siguiente diapositiva"
              >
                Siguiente <i className="bi bi-chevron-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Los 3 pilares claros del negocio (Insights de Carlos y Valeria) */}
      <section className="mb-5" aria-label="Pilares de Galería Prismas">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 bg-soft rounded-3 h-100 border">
              <i className="bi bi-easel2 fs-2 text-gold" aria-hidden="true"></i>
              <h2 className="h5 mt-2">1. Compra de Obras Certificadas</h2>
              <p className="small text-muted mb-3">
                Filtra por técnica, precio, estilo o tamaño. Consulta dimensiones reales, disponibilidad y trayectoria del artista antes de comprar.
              </p>
              <Link to="/obras" className="text-gold fw-semibold text-decoration-none small">
                Explorar catálogo de obras →
              </Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-soft rounded-3 h-100 border">
              <i className="bi bi-calendar2-event fs-2 text-gold" aria-hidden="true"></i>
              <h2 className="h5 mt-2">2. Agenda de Exposiciones</h2>
              <p className="small text-muted mb-3">
                Consulta exposiciones en curso y próximas muestras curatoriales. Reserva tus entradas en línea con confirmación inmediata.
              </p>
              <Link to="/exposiciones" className="text-gold fw-semibold text-decoration-none small">
                Ver calendario y reservar →
              </Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-soft rounded-3 h-100 border">
              <i className="bi bi-palette2 fs-2 text-gold" aria-hidden="true"></i>
              <h2 className="h5 mt-2">3. Cursos y Talleres Prácticos</h2>
              <p className="small text-muted mb-3">
                Niveles Principiante, Intermedio y Avanzado en modalidad presencial o virtual, con lista detallada de materiales e instructor.
              </p>
              <Link to="/cursos" className="text-gold fw-semibold text-decoration-none small">
                Inscribirme a un taller →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Obras Destacadas */}
      <section className="mb-5" aria-label="Obras destacadas">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h3 mb-1">Selección Curatorial Destacada</h2>
            <p className="text-muted small mb-0">
              Piezas originales listas para entrega o envío asegurado.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/obras/Óleo" className="btn btn-outline-dark btn-sm">
              Óleo
            </Link>
            <Link to="/obras/Acrílico" className="btn btn-outline-dark btn-sm">
              Acrílico
            </Link>
            <Link to="/obras/Escultura" className="btn btn-outline-dark btn-sm">
              Escultura
            </Link>
            <Link to="/obras/Fotografía" className="btn btn-outline-dark btn-sm">
              Fotografía
            </Link>
            <Link to="/obras" className="btn btn-gold btn-sm">
              Ver las 22 obras
            </Link>
          </div>
        </div>

        {cargando ? (
          <Loader texto="Cargando selección curatorial..." />
        ) : (
          <div className="catalog-grid">
            {destacadas.map((obra) => (
              <ObraCard key={obra.id} obra={obra} />
            ))}
          </div>
        )}
      </section>

      {/* Próximas Exposiciones */}
      <section className="mb-5" aria-label="Exposiciones y agenda">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h3 mb-1">Exposiciones y Eventos</h2>
            <p className="text-muted small mb-0">
              Reserva tus entradas sin costo o programa tu recorrido guiado.
            </p>
          </div>
          <Link to="/exposiciones" className="btn btn-outline-dark btn-sm">
            Ver agenda completa
          </Link>
        </div>

        <div className="row g-4">
          {exposiciones.map((exp) => (
            <div key={exp.id} className="col-md-4">
              <article className="card h-100 shadow-sm border-0">
                <img
                  src={exp.imagenUrl}
                  alt={`Exposición ${exp.titulo}`}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                  loading="lazy"
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <span
                      className={`badge mb-2 ${
                        exp.estado === "En curso"
                          ? "bg-success"
                          : exp.estado === "Próximo"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {exp.estado}
                    </span>
                    <h3 className="h5">{exp.titulo}</h3>
                    <p className="small text-muted mb-2">{exp.subtitulo}</p>
                    <p className="small mb-2">
                      <i className="bi bi-calendar3 text-gold me-1" aria-hidden="true"></i>
                      {formatearFechaES(exp.fechaInicio)} al {formatearFechaES(exp.fechaFin)}
                    </p>
                  </div>
                  <Link to={`/exposiciones/${exp.id}`} className="btn btn-outline-gold btn-sm mt-2">
                    {exp.estado === "Finalizado" ? "Ver memoria" : "Reservar entradas"}
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* Cursos y Talleres */}
      <section className="mb-5" aria-label="Cursos y talleres">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h3 mb-1">Cursos y Talleres de Arte</h2>
            <p className="text-muted small mb-0">
              Horarios flexibles, materiales especificados y acompañamiento de artistas activos.
            </p>
          </div>
          <Link to="/cursos" className="btn btn-outline-dark btn-sm">
            Todos los talleres
          </Link>
        </div>

        <div className="row g-4">
          {cursos.map((curso) => (
            <div key={curso.id} className="col-md-4">
              <article className="card h-100 shadow-sm border-0">
                <img
                  src={curso.imagenUrl}
                  alt={`Taller ${curso.titulo}`}
                  className="card-img-top"
                  style={{ height: "190px", objectFit: "cover" }}
                  loading="lazy"
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex gap-1 mb-2">
                      <span className="badge bg-dark">{curso.nivel}</span>
                      <span className="badge bg-secondary">{curso.modalidad}</span>
                      <span className="badge bg-warning text-dark">{curso.tecnica}</span>
                    </div>
                    <h3 className="h5">{curso.titulo}</h3>
                    <p className="small text-muted mb-1">
                      <strong>Instructor(a):</strong> {curso.instructor}
                    </p>
                    <p className="small text-muted mb-2">
                      <i className="bi bi-clock me-1" aria-hidden="true"></i>
                      {curso.horario}
                    </p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="fw-bold text-dark">{formatearMonedaCOP(curso.precio)}</span>
                    <Link to={`/cursos/${curso.id}`} className="btn btn-gold btn-sm">
                      Ver programa
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* Obras vistas recientemente (Heurística #6: Reconocer antes que recordar) */}
      {vistasRecientes.length > 0 && (
        <section className="p-4 bg-soft rounded-3 border" aria-label="Obras vistas recientemente">
          <h2 className="h5 mb-3">
            <i className="bi bi-clock-history text-gold me-2" aria-hidden="true"></i>
            Obras que consultaste recientemente
          </h2>
          <div className="row g-3">
            {vistasRecientes.map((v) => (
              <div key={v.id} className="col-6 col-md-3">
                <Link
                  to={`/obras/detalle/${v.slug}`}
                  className="d-flex align-items-center gap-2 p-2 bg-white rounded border text-decoration-none text-dark shadow-sm"
                >
                  <img
                    src={v.imagenUrl}
                    alt={v.titulo}
                    width="52"
                    height="52"
                    className="rounded object-fit-cover"
                    loading="lazy"
                  />
                  <div className="small text-truncate">
                    <div className="fw-semibold text-truncate">{v.titulo}</div>
                    <div className="text-gold">{formatearMonedaCOP(v.precio)}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
