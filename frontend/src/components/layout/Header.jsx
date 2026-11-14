import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { EMPRESA, formatearMonedaCOP } from "../../config/empresa";
import { helpFetch } from "../../helpers/helpFetch";

/**
 * Header global sticky con:
 * - Logotipo oficial de Galería Prismas
 * - Menú principal: Obras, Exposiciones, Cursos, Artistas y Nosotros
 * - Navegación utilitaria: Buscar (lupa con autocompletado y atajo '/'), Favoritos (corazón), Carrito y Contacto
 */
const Header = () => {
  const { totalUnidadesCarrito, favoritos, adminSession } = useApp();
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const inputBusquedaRef = useRef(null);
  const navigate = useNavigate();

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

      <div className="bg-dark text-white py-1 small">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <span>
            <i className="bi bi-geo-alt-fill text-warning me-1" aria-hidden="true"></i>
            Sede Bosque Popular — Bogotá, Colombia · Envíos asegurados a todo el país
          </span>
          <div className="d-flex align-items-center gap-3">
            <Link to="/pqr" className="text-white text-decoration-none">
              PQR y Radicados
            </Link>
            <Link to="/preguntas-frecuentes" className="text-white text-decoration-none">
              Ayuda / FAQ
            </Link>
            <Link
              to={adminSession ? "/admin" : "/admin/login"}
              className="text-warning text-decoration-none fw-semibold"
            >
              <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
              {adminSession ? "Panel Admin" : "Admin"}
            </Link>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg py-2" aria-label="Navegación principal">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src="/logo.svg"
              alt="Logotipo Galería Prismas"
              height="46"
              width="200"
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
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
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
            </ul>

            {/* Buscador global con autocompletado */}
            <div className="position-relative me-lg-3 my-2 my-lg-0" style={{ minWidth: "240px" }}>
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

            {/* Navegación utilitaria: Favoritos, Carrito y Contacto */}
            <div className="d-flex align-items-center gap-2">
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
                className="btn btn-outline-dark btn-sm position-relative"
                aria-label={`Carrito de compras (${totalUnidadesCarrito} artículos)`}
                title="Carrito de compras"
              >
                <i className="bi bi-bag" aria-hidden="true"></i>
                <span className="ms-1 d-none d-xl-inline">Carrito</span>
                {totalUnidadesCarrito > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                    {totalUnidadesCarrito}
                  </span>
                )}
              </Link>

              <Link to="/contacto" className="btn btn-gold btn-sm">
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
