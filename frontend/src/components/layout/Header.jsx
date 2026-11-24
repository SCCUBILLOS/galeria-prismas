import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { EMPRESA, formatearMonedaCOP } from "../../config/empresa";
import { helpFetch } from "../../helpers/helpFetch";

/**
 * Header global sticky en React con:
 * - Barra superior con Redes Sociales Oficiales (Instagram, Facebook, WhatsApp, LinkedIn, YouTube)
 * - Los 3 Botones de Accesibilidad WCAG 2.1 directos (1: Tamaño Texto A+, 2: Alto Contraste, 3: Lectura/Reset)
 * - Logotipo oficial de Galería Prismas
 * - Menú principal: Inicio, Obras, Exposiciones, Cursos, Artistas, Nosotros y CRUD BD
 * - Navegación utilitaria alineada y armónica: Buscador, Favoritos, Carrito y botón de Pasarela de Pago
 */
const Header = () => {
  const {
    totalUnidadesCarrito,
    favoritos,
    adminSession,
    accesibilidad,
    aumentarTexto,
    disminuirTexto,
    toggleOpcionAccesibilidad,
    restablecerAccesibilidad,
  } = useApp();

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const inputBusquedaRef = useRef(null);
  const navigate = useNavigate();

  // Ciclar tamaño de fuente con el Botón 1 de accesibilidad (100% -> 115% -> 130% -> 100%)
  const handleCiclarTamanoTexto = () => {
    if (accesibilidad.escalaTexto < 130) {
      aumentarTexto();
    } else {
      disminuirTexto();
      disminuirTexto();
    }
  };

  // Heurística #7 (Flexibilidad y eficiencia de uso): atajo '/' para enfocar la búsqueda
  useEffect(() => {
    const manejarTecla = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea" && tag !== "select") {
        e.preventDefault();
        inputBusquedaRef.current?.focus();
      } else if (e.key === "Escape") {
        setMostrarDropdown(false);
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, []);

  // Autocompletado en tiempo real por obra, artista o curso
  useEffect(() => {
    const q = busqueda.trim();
    if (q.length < 2) {
      setSugerencias(null);
      return;
    }

    const timer = setTimeout(() => {
      helpFetch()
        .get(`${EMPRESA.apiBaseUrl}/buscar?q=${encodeURIComponent(q)}`)
        .then((res) => {
          if (!res.err) {
            setSugerencias(res);
            setMostrarDropdown(true);
          }
        });
    }, 220);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleSubmitBusqueda = (e) => {
    e.preventDefault();
    setMostrarDropdown(false);
    navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
  };

  return (
    <header className="site-header shadow-sm">
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Barra superior institucional: Redes Sociales + 3 Botones de Accesibilidad + Enlaces rápidos */}
      <div className="bg-dark text-white py-1 small border-bottom border-secondary">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Redes Sociales Oficiales visibles en el encabezado */}
          <div className="d-flex align-items-center flex-wrap gap-2" aria-label="Redes sociales oficiales">
            <span className="text-warning fw-semibold d-none d-md-inline">
              Síguenos:
            </span>
            {EMPRESA.redesSociales.map((red) => (
              <a
                key={red.nombre}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-decoration-none d-inline-flex align-items-center gap-1 px-2 py-0 rounded bg-secondary bg-opacity-25"
                aria-label={red.ariaLabel}
                title={`${red.nombre}: ${red.usuario}`}
              >
                <i className={`bi ${red.icono} text-warning`} aria-hidden="true"></i>
                <span className="d-none d-sm-inline" style={{ fontSize: "0.75rem" }}>
                  {red.nombre}
                </span>
              </a>
            ))}
          </div>

          {/* 3 Botones directos de manejo de Accesibilidad de la página (WCAG 2.1) */}
          <div
            className="d-flex align-items-center flex-wrap gap-1"
            role="group"
            aria-label="Tres botones de manejo de accesibilidad"
          >
            <span className="text-light opacity-75 me-1 d-none d-lg-inline" style={{ fontSize: "0.75rem" }}>
              <i className="bi bi-universal-access me-1 text-warning" aria-hidden="true"></i>
              Accesibilidad:
            </span>

            {/* Botón 1 de Accesibilidad: Tamaño de Fuente */}
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${
                accesibilidad.escalaTexto > 100 ? "btn-warning text-dark fw-bold" : "btn-outline-light"
              }`}
              style={{ fontSize: "0.75rem" }}
              onClick={handleCiclarTamanoTexto}
              aria-label={`Cambiar tamaño de letra. Actual: ${accesibilidad.escalaTexto}%`}
              title="Botón 1 Accesibilidad: Aumentar o cambiar tamaño de letra (100%, 115%, 130%)"
            >
              <i className="bi bi-fonts me-1" aria-hidden="true"></i>
              1. Letra ({accesibilidad.escalaTexto}%)
            </button>

            {/* Botón 2 de Accesibilidad: Alto Contraste */}
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${
                accesibilidad.altoContraste ? "btn-warning text-dark fw-bold" : "btn-outline-light"
              }`}
              style={{ fontSize: "0.75rem" }}
              onClick={() => toggleOpcionAccesibilidad("altoContraste")}
              aria-pressed={accesibilidad.altoContraste}
              aria-label="Activar o desactivar modo de alto contraste"
              title="Botón 2 Accesibilidad: Alternar modo de Alto Contraste WCAG"
            >
              <i className="bi bi-circle-half me-1" aria-hidden="true"></i>
              2. Alto Contraste
            </button>

            {/* Botón 3 de Accesibilidad: Fuente Dislexia / Restablecer */}
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${
                accesibilidad.fuenteDislexia ? "btn-warning text-dark fw-bold" : "btn-outline-light"
              }`}
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                if (accesibilidad.fuenteDislexia) {
                  restablecerAccesibilidad();
                } else {
                  toggleOpcionAccesibilidad("fuenteDislexia");
                }
              }}
              aria-pressed={accesibilidad.fuenteDislexia}
              aria-label="Activar fuente de lectura fácil o restablecer accesibilidad"
              title="Botón 3 Accesibilidad: Activar fuente de lectura fácil para dislexia o restablecer"
            >
              <i className="bi bi-eye me-1" aria-hidden="true"></i>
              {accesibilidad.fuenteDislexia ? "3. Restablecer" : "3. Lectura Fácil"}
            </button>
          </div>

          {/* Enlaces rápidos de soporte y panel */}
          <div className="d-none d-xl-flex align-items-center gap-3">
            <Link to="/pqr" className="text-white text-decoration-none">
              PQR
            </Link>
            <Link
              to="/admin/obras"
              className="text-warning text-decoration-none fw-semibold"
            >
              <i className="bi bi-database-fill-gear me-1" aria-hidden="true"></i>
              {adminSession ? "Panel & CRUD" : "CRUD Base de Datos"}
            </Link>
          </div>
        </div>
      </div>

      {/* Barra de navegación principal */}
      <nav className="navbar navbar-expand-xl py-2" aria-label="Navegación principal">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center me-2">
            <img
              src="/logo.svg"
              alt="Logotipo Galería Prismas"
              height="44"
              width="190"
            />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="menuPrincipal"
            aria-expanded={menuAbierto}
            aria-label="Abrir menú de navegación"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`} id="menuPrincipal">
            <ul className="navbar-nav me-auto mb-2 mb-xl-0 gap-1 align-items-xl-center">
              <li className="nav-item">
                <NavLink to="/" end className="nav-link-prisma" onClick={() => setMenuAbierto(false)}>
                  Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/obras" className="nav-link-prisma" onClick={() => setMenuAbierto(false)}>
                  Obras
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/exposiciones"
                  className="nav-link-prisma"
                  onClick={() => setMenuAbierto(false)}
                >
                  Exposiciones
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/cursos" className="nav-link-prisma" onClick={() => setMenuAbierto(false)}>
                  Cursos
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/artistas" className="nav-link-prisma" onClick={() => setMenuAbierto(false)}>
                  Artistas
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/nosotros" className="nav-link-prisma" onClick={() => setMenuAbierto(false)}>
                  Nosotros
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/admin/obras" className="nav-link-prisma" onClick={() => setMenuAbierto(false)}>
                  <i className="bi bi-database me-1 text-gold" aria-hidden="true"></i>
                  CRUD BD
                </NavLink>
              </li>
            </ul>

            {/* Buscador global con autocompletado */}
            <div className="position-relative me-xl-2 my-2 my-xl-0" style={{ minWidth: "205px" }}>
              <form onSubmit={handleSubmitBusqueda} role="search" aria-label="Búsqueda global">
                <div className="input-group input-group-sm">
                  <label htmlFor="buscador-global" className="visually-hidden">
                    Buscar obras, artistas o cursos
                  </label>
                  <input
                    id="buscador-global"
                    ref={inputBusquedaRef}
                    type="search"
                    className="form-control"
                    placeholder="Buscar obra, artista... (/)"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onFocus={() => sugerencias && setMostrarDropdown(true)}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="btn btn-outline-dark"
                    aria-label="Ejecutar búsqueda"
                  >
                    <i className="bi bi-search" aria-hidden="true"></i>
                  </button>
                </div>
              </form>

              {mostrarDropdown && sugerencias && (
                <div
                  className="position-absolute start-0 end-0 bg-white border rounded shadow-lg p-2 mt-1"
                  style={{ zIndex: 1080, maxHeight: "340px", overflowY: "auto" }}
                >
                  <div className="d-flex justify-content-between align-items-center px-2 pb-1 border-bottom small text-muted">
                    <span>Sugerencias rápidas</span>
                    <button
                      type="button"
                      className="btn-close"
                      style={{ fontSize: "0.65rem" }}
                      aria-label="Cerrar sugerencias"
                      onClick={() => setMostrarDropdown(false)}
                    ></button>
                  </div>

                  {sugerencias.obras?.length > 0 && (
                    <div className="mt-2">
                      <div className="px-2 small fw-bold text-gold">Obras</div>
                      {sugerencias.obras.slice(0, 3).map((o) => (
                        <Link
                          key={o.id}
                          to={`/obras/detalle/${o.slug}`}
                          className="d-block px-2 py-1 text-decoration-none text-dark small rounded hover-bg"
                          onClick={() => setMostrarDropdown(false)}
                        >
                          {o.titulo} — <span className="text-muted">{formatearMonedaCOP(o.precio)}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {sugerencias.artistas?.length > 0 && (
                    <div className="mt-2">
                      <div className="px-2 small fw-bold text-gold">Artistas</div>
                      {sugerencias.artistas.slice(0, 2).map((a) => (
                        <Link
                          key={a.id}
                          to={`/artistas/${a.slug}`}
                          className="d-block px-2 py-1 text-decoration-none text-dark small"
                          onClick={() => setMostrarDropdown(false)}
                        >
                          {a.nombre} ({a.estilo})
                        </Link>
                      ))}
                    </div>
                  )}

                  {sugerencias.cursos?.length > 0 && (
                    <div className="mt-2">
                      <div className="px-2 small fw-bold text-gold">Cursos y Talleres</div>
                      {sugerencias.cursos.slice(0, 2).map((c) => (
                        <Link
                          key={c.id}
                          to={`/cursos/${c.id}`}
                          className="d-block px-2 py-1 text-decoration-none text-dark small"
                          onClick={() => setMostrarDropdown(false)}
                        >
                          {c.titulo} ({c.nivel})
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="border-top mt-2 pt-1 text-center">
                    <Link
                      to={`/buscar?q=${encodeURIComponent(busqueda)}`}
                      className="small text-gold fw-semibold text-decoration-none"
                      onClick={() => setMostrarDropdown(false)}
                    >
                      Ver todos los resultados agrupados →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Navegación utilitaria armónica: Favoritos, Carrito, Pasarela de Pago y Contacto */}
            <div className="d-flex align-items-center flex-wrap gap-2">
              <Link
                to="/favoritos"
                className="btn btn-outline-dark btn-sm position-relative"
                aria-label={`Favoritos (${favoritos.length} obras guardadas)`}
                title="Mis obras favoritas"
              >
                <i className="bi bi-heart" aria-hidden="true"></i>
                {favoritos.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {favoritos.length}
                  </span>
                )}
              </Link>

              <Link
                to="/carrito"
                className="btn btn-outline-dark btn-sm position-relative text-nowrap"
                aria-label={`Carrito de compras (${totalUnidadesCarrito} artículos)`}
                title="Carrito de compras"
              >
                <i className="bi bi-bag" aria-hidden="true"></i>
                <span className="ms-1 d-none d-xxl-inline">Carrito</span>
                {totalUnidadesCarrito > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                    {totalUnidadesCarrito}
                  </span>
                )}
              </Link>

              {/* Botón de Pasarela de Pago con diseño institucional limpio y armónico */}
              <Link
                to="/pasarela"
                className="btn btn-gold btn-sm text-nowrap d-inline-flex align-items-center gap-1 shadow-sm"
                onClick={() => setMenuAbierto(false)}
                title="Ir a la Pasarela de Pagos PrismaPay"
              >
                <i className="bi bi-credit-card-2-front" aria-hidden="true"></i>
                <span>Pasarela de Pago</span>
              </Link>

              <Link
                to="/contacto"
                className="btn btn-outline-gold btn-sm text-nowrap"
                onClick={() => setMenuAbierto(false)}
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
