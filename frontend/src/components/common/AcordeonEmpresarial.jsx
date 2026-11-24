import React, { useState } from "react";
import { EMPRESA } from "../../config/empresa";

/**
 * Componente React reutilizable: Acordeón Empresarial (Misión, Visión, Objetivos, Valores e Historia)
 * + Tarjetas de Redes Sociales Oficiales.
 * Cumple los puntos 3A.g (mínimo 4 redes sociales) y 3A.m (Acordeón con información empresarial).
 */
const ITEMS_ACORDEON_EMPRESA = [
  {
    id: "mision",
    icono: "bi-compass-fill",
    titulo: "1. Misión de la Empresa",
    resumen: "Propósito curatorial, comercial y formativo de Galería Prismas",
    contenido: (
      <div>
        <p className="mb-2">
          <strong>Galería Prismas</strong> tiene como misión democratizar y acercar el arte contemporáneo colombiano a compradores casuales, coleccionistas y estudiantes mediante una plataforma digital transparente, accesible (WCAG 2.1 AA) y curada.
        </p>
        <p className="mb-0">
          Integramos en un solo ecosistema tres pilares: la comercialización de obras originales con certificado de autenticidad y precios claros sin sobrecostos ocultos, la difusión cultural mediante exposiciones abiertas al público y la formación práctica en talleres de artes plásticas.
        </p>
      </div>
    ),
  },
  {
    id: "vision",
    icono: "bi-eye-fill",
    titulo: "2. Visión Corporativa 2030",
    resumen: "Proyección nacional e internacional de la galería y escuela de arte",
    contenido: (
      <div>
        <p className="mb-2">
          Para el año <strong>2030</strong>, consolidarnos como la galería de arte y academia cultural líder en Colombia y referente en Latinoamérica por su innovación tecnológica, su arquitectura de información centrada en el usuario y su compromiso con el comercio justo para los artistas plásticos.
        </p>
        <p className="mb-0">
          Aspiramos a conectar a más de 500 artistas emergentes y consolidados con hogares, oficinas y colecciones de todo el país a través de experiencias digitales confiables, facturación electrónica inmediata y logística museográfica asegurada.
        </p>
      </div>
    ),
  },
  {
    id: "objetivos",
    icono: "bi-bullseye",
    titulo: "3. Objetivos Estratégicos de la Empresa",
    resumen: "Objetivo general y objetivos específicos medibles de Galería Prismas",
    contenido: (
      <div>
        <p className="fw-semibold mb-2">
          Objetivo General:
        </p>
        <p className="mb-3">
          Transformar la experiencia de adquisición de obras de arte, reserva de exposiciones e inscripción a talleres en Colombia mediante una plataforma web intuitiva, segura y accesible en máximo tres clics.
        </p>
        <p className="fw-semibold mb-1">
          Objetivos Específicos:
        </p>
        <ul className="mb-0 ps-3">
          <li>
            <strong>Transparencia comercial:</strong> Publicar el 100 % del catálogo con precios en pesos colombianos (COP), dimensiones reales, técnica, disponibilidad de stock en tiempo real y biografía verificada del autor.
          </li>
          <li>
            <strong>Formación artística accesible:</strong> Ofrecer cursos y talleres con niveles explícitos (Principiante, Intermedio y Avanzado), horarios flexibles y listado transparente de materiales incluidos.
          </li>
          <li>
            <strong>Circulación cultural:</strong> Organizar exposiciones periódicas con sistema de reserva digital gratuita de entradas y control automatizado de aforo.
          </li>
          <li>
            <strong>Seguridad transaccional:</strong> Garantizar pagos verificados con algoritmo de Luhn, pasarela multimétodo (Tarjeta, PSE, Nequi, QR) y facturación electrónica con IVA discriminado del 19 %.
          </li>
          <li>
            <strong>Inclusión digital:</strong> Mantener el cumplimiento estricto de las pautas WCAG 2.1 nivel AA con controles de tamaño de fuente, alto contraste y navegación por teclado.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "valores",
    icono: "bi-award-fill",
    titulo: "4. Valores Corporativos",
    resumen: "Principios éticos y curatoriales que guían nuestro trabajo",
    contenido: (
      <div className="row g-2">
        <div className="col-md-6">
          <div className="p-2 bg-soft rounded border h-100">
            <strong className="text-gold d-block">Autenticidad y Transparencia</strong>
            Cada pieza cuenta con código único de catalogación, certificado firmado y precio público sin inflación especulativa.
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-2 bg-soft rounded border h-100">
            <strong className="text-gold d-block">Trato Justo al Artista</strong>
            Reconocemos la autoría moral y patrimonial de nuestros artistas con liquidaciones transparentes y visibilidad biográfica.
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-2 bg-soft rounded border h-100">
            <strong className="text-gold d-block">Accesibilidad Universal</strong>
            Creemos que el arte es para todas las personas; diseñamos nuestras salas físicas y digitales sin barreras.
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-2 bg-soft rounded border h-100">
            <strong className="text-gold d-block">Excelencia Pedagógica</strong>
            Nuestros talleres son dictados por maestros activos en el circuito artístico nacional.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "historia",
    icono: "bi-bank2",
    titulo: "5. Reseña Histórica y Políticas de Calidad",
    resumen: "Origen del proyecto, garantía de envío museográfico y cumplimiento legal",
    contenido: (
      <div>
        <p className="mb-2">
          Fundada en Bogotá D.C. a partir de una investigación de experiencia de usuario con coleccionistas y estudiantes universitarios, <strong>Galería Prismas</strong> nació para resolver la desorientación que sufrían los compradores al enfrentarse a catálogos desordenados o sin precios.
        </p>
        <p className="mb-0">
          Cumplimos íntegramente con la <strong>Ley 1581 de 2012 (Habeas Data)</strong>, el Estatuto del Consumidor Colombiano (Ley 1480 de 2011) y las normas de facturación electrónica con discriminación de IVA (19 %).
        </p>
      </div>
    ),
  },
];

const AcordeonEmpresarial = ({ mostrarRedes = true }) => {
  const [abierto, setAbierto] = useState("mision");

  const toggleItem = (id) => {
    setAbierto((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="acordeon-empresarial-wrapper">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <span className="text-gold fw-bold text-uppercase small">
            Identidad Institucional · Galería Prismas S.A.S.
          </span>
          <h2 className="h3 mb-0">Misión, Visión y Objetivos de la Empresa</h2>
        </div>
        <div className="d-flex gap-1 mt-2 mt-sm-0">
          {ITEMS_ACORDEON_EMPRESA.slice(0, 3).map((it) => (
            <button
              key={it.id}
              type="button"
              className={`btn btn-sm ${
                abierto === it.id ? "btn-gold" : "btn-outline-dark"
              }`}
              onClick={() => setAbierto(it.id)}
            >
              {it.id === "mision"
                ? "Misión"
                : it.id === "vision"
                ? "Visión"
                : "Objetivos"}
            </button>
          ))}
        </div>
      </div>

      <div className="accordion shadow-sm rounded-3 overflow-hidden border" id="acordeonInstitucional">
        {ITEMS_ACORDEON_EMPRESA.map((item) => {
          const expandido = abierto === item.id;
          return (
            <div className="accordion-item border-0 border-bottom" key={item.id}>
              <h3 className="accordion-header" id={`encabezado-${item.id}`}>
                <button
                  className={`accordion-button fw-bold ${expandido ? "" : "collapsed"}`}
                  type="button"
                  aria-expanded={expandido}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    backgroundColor: expandido ? "#f7f6f2" : "#ffffff",
                    color: "#141414",
                  }}
                >
                  <i
                    className={`bi ${item.icono} text-gold me-2 fs-5`}
                    aria-hidden="true"
                  ></i>
                  <div>
                    <div>{item.titulo}</div>
                    <div className="small fw-normal text-muted" style={{ fontSize: "0.78rem" }}>
                      {item.resumen}
                    </div>
                  </div>
                </button>
              </h3>
              <div
                id={`panel-${item.id}`}
                className={`accordion-collapse collapse ${expandido ? "show" : ""}`}
                aria-labelledby={`encabezado-${item.id}`}
              >
                <div className="accordion-body bg-white small">{item.contenido}</div>
              </div>
            </div>
          );
        })}
      </div>

      {mostrarRedes && (
        <div className="mt-4 p-3 bg-soft rounded-3 border">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <div>
              <h3 className="h6 fw-bold mb-0">
                <i className="bi bi-share-fill text-gold me-2" aria-hidden="true"></i>
                Síguenos en Nuestras Redes Sociales Oficiales
              </h3>
              <span className="small text-muted">
                Conéctate con nuestras inauguraciones, lanzamientos de catálogo y talleres en vivo:
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {EMPRESA.redesSociales.map((red) => (
              <a
                key={red.nombre}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-dark btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 bg-white shadow-sm"
                aria-label={red.ariaLabel}
              >
                <i
                  className={`bi ${red.icono} fs-5`}
                  style={{ color: red.color }}
                  aria-hidden="true"
                ></i>
                <div className="text-start lh-1">
                  <div className="fw-bold small">{red.nombre}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {red.usuario}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcordeonEmpresarial;
