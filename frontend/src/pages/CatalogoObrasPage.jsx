import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { EMPRESA } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ObraCard from "../components/common/ObraCard";
import Loader from "../components/crud/Loader";

/**
 * Catálogo de Obras (/obras y /obras/:tecnica)
 * Navegación local con filtros laterales combinables (Precio, Técnica, Estilo, Tamaño, Estado),
 * búsqueda, ordenamiento y migas de pan contextuales.
 */
const CatalogoObrasPage = () => {
  const { tecnica: tecnicaParam } = useParams();
  const [searchParams] = useSearchParams();

  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtros, setFiltros] = useState({
    tecnica: tecnicaParam || searchParams.get("tecnica") || "Todas",
    estilo: "Todos",
    tamano: "Todos",
    estado: "Todos",
    precioMax: 6000000,
    q: searchParams.get("q") || "",
    orden: "recientes",
  });

  useEffect(() => {
    if (tecnicaParam) {
      setFiltros((prev) => ({ ...prev, tecnica: tecnicaParam }));
    }
  }, [tecnicaParam]);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtros.tecnica !== "Todas") params.set("tecnica", filtros.tecnica);
    if (filtros.estilo !== "Todos") params.set("estilo", filtros.estilo);
    if (filtros.tamano !== "Todos") params.set("tamano", filtros.tamano);
    if (filtros.estado !== "Todos") params.set("estado", filtros.estado);
    if (filtros.precioMax < 6000000) params.set("precioMax", String(filtros.precioMax));
    if (filtros.q.trim()) params.set("q", filtros.q.trim());
    params.set("orden", filtros.orden);

    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/obras?${params.toString()}`)
      .then((res) => {
        if (!res.err) {
          setObras(res.datos || []);
        }
        setCargando(false);
      });
  }, [filtros]);

  const limpiarFiltros = () => {
    setFiltros({
      tecnica: "Todas",
      estilo: "Todos",
      tamano: "Todos",
      estado: "Todos",
      precioMax: 6000000,
      q: "",
      orden: "recientes",
    });
  };

  const breadcrumbs = [{ label: "Catálogo de Obras", to: "/obras" }];
  if (filtros.tecnica !== "Todas") {
    breadcrumbs.push({ label: filtros.tecnica });
  }

  return (
    <div className="container py-4">
      <Breadcrumbs items={breadcrumbs} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">
            Catálogo de Obras {filtros.tecnica !== "Todas" ? `— ${filtros.tecnica}` : ""}
          </h1>
          <p className="text-muted small mb-0">
            Explora piezas originales con precios claros, dimensiones exactas y certificado de autenticidad.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <label htmlFor="select-orden" className="small fw-semibold text-nowrap mb-0">
            Ordenar por:
          </label>
          <select
            id="select-orden"
            className="form-select form-select-sm"
            value={filtros.orden}
            onChange={(e) => setFiltros({ ...filtros, orden: e.target.value })}
          >
            <option value="recientes">Más recientes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="titulo_asc">Nombre (A - Z)</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Filtros laterales (Navegación local - sección 1.3) */}
        <aside className="col-lg-3" aria-label="Filtros del catálogo de obras">
          <div className="card shadow-sm border-0 p-3 sticky-lg-top" style={{ top: "5.5rem" }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h2 className="h6 mb-0 fw-bold">
                <i className="bi bi-sliders me-2 text-gold" aria-hidden="true"></i>
                Filtrar Obras
              </h2>
              <button
                type="button"
                className="btn btn-link btn-sm text-gold p-0 text-decoration-none"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>
            </div>

            <div className="mb-3">
              <label htmlFor="filtro-q" className="form-label small fw-semibold">
                Buscar por título o artista
              </label>
              <input
                id="filtro-q"
                type="search"
                className="form-control form-control-sm"
                placeholder="Ej. Monserrate, Restrepo..."
                value={filtros.q}
                onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="filtro-tecnica" className="form-label small fw-semibold">
                Técnica artística
              </label>
              <select
                id="filtro-tecnica"
                className="form-select form-select-sm"
                value={filtros.tecnica}
                onChange={(e) => setFiltros({ ...filtros, tecnica: e.target.value })}
              >
                <option value="Todas">Todas las técnicas</option>
                <option value="Óleo">Óleo</option>
                <option value="Acrílico">Acrílico</option>
                <option value="Escultura">Escultura</option>
                <option value="Fotografía">Fotografía</option>
                <option value="Digital">Digital</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="filtro-estilo" className="form-label small fw-semibold">
                Estilo
              </label>
              <select
                id="filtro-estilo"
                className="form-select form-select-sm"
                value={filtros.estilo}
                onChange={(e) => setFiltros({ ...filtros, estilo: e.target.value })}
              >
                <option value="Todos">Todos los estilos</option>
                <option value="Expresionista">Expresionista</option>
                <option value="Abstracto">Abstracto</option>
                <option value="Realismo">Realismo</option>
                <option value="Minimalista">Minimalista</option>
                <option value="Contemporáneo">Contemporáneo</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="filtro-tamano" className="form-label small fw-semibold">
                Formato / Tamaño
              </label>
              <select
                id="filtro-tamano"
                className="form-select form-select-sm"
                value={filtros.tamano}
                onChange={(e) => setFiltros({ ...filtros, tamano: e.target.value })}
              >
                <option value="Todos">Todos los tamaños</option>
                <option value="Pequeño">Pequeño (hasta 60 cm)</option>
                <option value="Mediano">Mediano (60 - 95 cm)</option>
                <option value="Grande">Grande (más de 95 cm)</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="filtro-estado" className="form-label small fw-semibold">
                Disponibilidad
              </label>
              <select
                id="filtro-estado"
                className="form-select form-select-sm"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="Todos">Todas (Disponibles y Vendidas)</option>
                <option value="Disponible">Solo Disponibles</option>
                <option value="Vendida">Vendidas (Archivo)</option>
              </select>
            </div>

            <div className="mb-2">
              <label htmlFor="filtro-precio" className="form-label small fw-semibold d-flex justify-content-between">
                <span>Precio máximo:</span>
                <span className="text-gold">
                  ${(filtros.precioMax / 1000000).toFixed(1)}M COP
                </span>
              </label>
              <input
                id="filtro-precio"
                type="range"
                className="form-range"
                min="900000"
                max="6000000"
                step="250000"
                value={filtros.precioMax}
                onChange={(e) => setFiltros({ ...filtros, precioMax: Number(e.target.value) })}
              />
            </div>
          </div>
        </aside>

        {/* Resultados del catálogo */}
        <div className="col-lg-9">
          {/* Chips de filtros activos (Heurística #6) */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 bg-soft p-2 px-3 rounded border">
            <span className="small fw-semibold">
              Mostrando <strong>{obras.length}</strong> obras
            </span>
            <div className="d-flex flex-wrap gap-1">
              {filtros.tecnica !== "Todas" && (
                <span className="badge bg-dark">Técnica: {filtros.tecnica}</span>
              )}
              {filtros.estilo !== "Todos" && (
                <span className="badge bg-dark">Estilo: {filtros.estilo}</span>
              )}
              {filtros.tamano !== "Todos" && (
                <span className="badge bg-dark">Tamaño: {filtros.tamano}</span>
              )}
              {filtros.estado !== "Todos" && (
                <span className="badge bg-dark">Estado: {filtros.estado}</span>
              )}
            </div>
          </div>

          {cargando ? (
            <Loader texto="Filtrando catálogo de obras..." />
          ) : obras.length > 0 ? (
            <div className="catalog-grid">
              {obras.map((obra) => (
                <ObraCard key={obra.id} obra={obra} />
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-soft rounded border">
              <i className="bi bi-search fs-1 text-muted" aria-hidden="true"></i>
              <h2 className="h5 mt-3">No encontramos obras con esos filtros</h2>
              <p className="text-muted small">
                Prueba ampliando el rango de precio o restableciendo los criterios de búsqueda.
              </p>
              <button type="button" className="btn btn-gold btn-sm" onClick={limpiarFiltros}>
                Restablecer todos los filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogoObrasPage;
