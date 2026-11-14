import React from "react";
import { Link } from "react-router-dom";
import { EMPRESA } from "../../config/empresa";

/**
 * Footer institucional con logotipo, mapa del sitio, enlace obligatorio a /equipo,
 * política de datos personales (Ley 1581 de 2012) y las 4 redes sociales con aria-label.
 */
const Footer = () => {
  return (
    <footer className="site-footer bg-dark text-white pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="bg-white d-inline-block p-2 rounded mb-3">
              <img src="/logo.svg" alt="Logotipo Galería Prismas" height="42" width="185" />
            </div>
            <p className="small text-light opacity-75">
              Plataforma digital de arte contemporáneo, exposiciones curatoriales y talleres de formación artística. Proyecto universitario — Universidad Libre (Bogotá).
            </p>
            <p className="small mb-1">
              <i className="bi bi-geo-alt text-warning me-2" aria-hidden="true"></i>
              {EMPRESA.direccion}
            </p>
            <p className="small mb-3">
              <i className="bi bi-clock text-warning me-2" aria-hidden="true"></i>
              {EMPRESA.horario}
            </p>
            <div className="d-flex gap-2" aria-label="Redes sociales de Galería Prismas">
              {EMPRESA.redesSociales.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "38px", height: "38px" }}
                  aria-label={red.ariaLabel}
                  title={red.nombre}
                >
                  <i className={`bi ${red.icono}`} aria-hidden="true"></i>
                </a>
              ))}
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h2 className="h6 text-warning text-uppercase fw-bold mb-3">Catálogo</h2>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>
                <Link to="/obras" className="text-light text-decoration-none">
                  Todas las Obras
                </Link>
              </li>
              <li>
                <Link to="/obras/Óleo" className="text-light text-decoration-none">
                  Pinturas al Óleo
                </Link>
              </li>
              <li>
                <Link to="/obras/Acrílico" className="text-light text-decoration-none">
                  Acrílico Contemporáneo
                </Link>
              </li>
              <li>
                <Link to="/obras/Escultura" className="text-light text-decoration-none">
                  Esculturas
                </Link>
              </li>
              <li>
                <Link to="/obras/Fotografía" className="text-light text-decoration-none">
                  Fotografía de Autor
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-3">
            <h2 className="h6 text-warning text-uppercase fw-bold mb-3">Agenda y Academia</h2>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>
                <Link to="/exposiciones" className="text-light text-decoration-none">
                  Exposiciones y Reservas
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="text-light text-decoration-none">
                  Cursos y Talleres
                </Link>
              </li>
              <li>
                <Link to="/artistas" className="text-light text-decoration-none">
                  Artistas Representados
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-light text-decoration-none">
                  Sobre Galería Prismas
                </Link>
              </li>
              <li>
                <Link to="/equipo" className="text-warning fw-semibold text-decoration-none">
                  <i className="bi bi-people-fill me-1" aria-hidden="true"></i>
                  Equipo de Desarrolladores (API Virtual)
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h2 className="h6 text-warning text-uppercase fw-bold mb-3">Atención y Legal</h2>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>
                <Link to="/pqr" className="text-light text-decoration-none">
                  Radicar o Consultar PQR
                </Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="text-light text-decoration-none">
                  Preguntas Frecuentes (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/politica-de-datos" className="text-light text-decoration-none">
                  Política de Tratamiento de Datos (Ley 1581)
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-light text-decoration-none">
                  Contacto y Ubicación
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-light text-decoration-none">
                  Administración e Inventario
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-wrap justify-content-between align-items-center small text-light opacity-75">
          <span>
            © 2026 {EMPRESA.nombre} — Universidad Libre · Ingeniería de Sistemas (Sara Cárdenas, Nicolás Molina, Brayan Gómez).
          </span>
          <span>Cumple WCAG 2.1 AA · W3C HTML5 &amp; CSS3 · Ley 1581 de 2012</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
