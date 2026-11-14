import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { EMPRESA, formatearMonedaCOP } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import { useApp } from "../context/AppContext";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ObraCard from "../components/common/ObraCard";
import Loader from "../components/crud/Loader";

/**
 * Detalle de Obra (/obras/detalle/:slug)
 * Implementa el flujo de favoritos y compra:
 * Inicio > Catálogo > Técnica > Título de la obra
 */
const ObraDetallePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    agregarAlCarrito,
    esFavorito,
    toggleFavorito,
    registrarVistaReciente,
  } = useApp();

  const [obra, setObra] = useState(null);
  const [relacionadas, setRelacionadas] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/obras/${slug}`)
      .then((res) => {
        if (!res.err && res.obra) {
          setObra(res.obra);
          setRelacionadas(res.relacionadas || []);
          setCantidad(1);
          setError(null);
          registrarVistaReciente(res.obra);
        } else {
          setError(res.statusText || "Obra no encontrada");
        }
        setCargando(false);
      });
  }, [slug, registrarVistaReciente]);

  if (cargando) {
    return (
      <div className="container py-5">
        <Loader texto="Cargando ficha curatorial de la obra..." />
      </div>
    );
  }

  if (error || !obra) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3">Obra no encontrada</h1>
        <p className="text-muted">{error}</p>
        <Link to="/obras" className="btn btn-gold">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const marcadoFavorito = esFavorito(obra.id);
  const disponible = obra.estado === "Disponible" && obra.stock > 0;

  const handleComprarAhora = () => {
    if (agregarAlCarrito(obra, cantidad)) {
      navigate("/checkout");
    }
  };

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Catálogo", to: "/obras" },
          { label: obra.tecnica, to: `/obras/${obra.tecnica}` },
          { label: `"${obra.titulo}"` },
        ]}
      />

      <div className="row g-5 mb-5">
        <div className="col-lg-6">
          <div className="border rounded-3 overflow-hidden shadow-sm bg-soft p-3 text-center">
            <img
              src={obra.imagenUrl}
              alt={`Obra ${obra.titulo} de ${obra.artista?.nombre} en técnica ${obra.tecnica}`}
              className="img-fluid rounded"
              style={{ maxHeight: "540px", objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className={`badge ${disponible ? "bg-success" : "bg-secondary"}`}>
              {disponible ? "Disponible para entrega" : "Obra Vendida"}
            </span>
            <span className="badge bg-dark">{obra.tecnica}</span>
            <span className="badge bg-secondary">{obra.estilo}</span>
            {obra.esUnica && (
              <span className="badge bg-warning text-dark">Pieza única (1/1)</span>
            )}
          </div>

          <h1 className="h2 mb-1">{obra.titulo}</h1>
          <p className="text-muted mb-3">
            Código de catalogación: <strong>{obra.codigo}</strong> · Año {obra.anio}
          </p>

          <div className="p-3 bg-soft rounded border mb-4">
            <div className="d-flex justify-content-between align-items-baseline">
              <span className="display-6 fw-bold text-dark">
                {formatearMonedaCOP(obra.precio)}
              </span>
              <span className="small text-muted">
                IVA 19 % discriminado en el checkout · Envío asegurado gratis
              </span>
            </div>
            <div className="small text-muted mt-1">
              {disponible
                ? `Disponibilidad en sala: ${obra.stock} ${
                    obra.stock === 1 ? "unidad original" : "ejemplares numerados"
                  }`
                : "Esta obra ya forma parte de una colección privada."}
            </div>
          </div>

          <p className="mb-3">{obra.descripcion}</p>

          <dl className="row small border-top border-bottom py-3 mb-4">
            <dt className="col-sm-4 text-muted">Artista:</dt>
            <dd className="col-sm-8 fw-semibold">
              <Link
                to={`/artistas/${obra.artista?.slug}`}
                className="text-gold text-decoration-none"
              >
                {obra.artista?.nombre} ({obra.artista?.ciudad}, {obra.artista?.pais})
              </Link>
            </dd>

            <dt className="col-sm-4 text-muted">Técnica y soporte:</dt>
            <dd className="col-sm-8">{obra.tecnica}</dd>

            <dt className="col-sm-4 text-muted">Dimensiones:</dt>
            <dd className="col-sm-8">
              {obra.dimensiones} (Formato {obra.tamano})
            </dd>

            <dt className="col-sm-4 text-muted">Espacio sugerido:</dt>
            <dd className="col-sm-8">{obra.espacioSugerido}</dd>

            <dt className="col-sm-4 text-muted mb-0">Curaduría y autenticidad:</dt>
            <dd className="col-sm-8 mb-0">{obra.historiaCuraduria}</dd>
          </dl>

          {/* Controles de compra y favoritos */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            {disponible && obra.stock > 1 && (
              <div>
                <label htmlFor="cantidad-obra" className="form-label small fw-semibold mb-1">
                  Cantidad (máx. {obra.stock})
                </label>
                <input
                  id="cantidad-obra"
                  type="number"
                  className="form-control"
                  style={{ width: "90px" }}
                  min="1"
                  max={obra.stock}
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, Math.min(obra.stock, Number(e.target.value))))
                  }
                />
              </div>
            )}

            <button
              type="button"
              className="btn btn-gold btn-lg"
              disabled={!disponible}
              onClick={() => agregarAlCarrito(obra, cantidad)}
            >
              <i className="bi bi-bag-plus me-2" aria-hidden="true"></i>
              {disponible ? "Agregar al carrito" : "Obra vendida"}
            </button>

            {disponible && (
              <button
                type="button"
                className="btn btn-dark btn-lg"
                onClick={handleComprarAhora}
              >
                Comprar ahora
              </button>
            )}

            <button
              type="button"
              className={`btn btn-lg ${
                marcadoFavorito ? "btn-danger" : "btn-outline-dark"
              }`}
              onClick={() => toggleFavorito(obra)}
              aria-pressed={marcadoFavorito}
            >
              <i
                className={`bi ${marcadoFavorito ? "bi-heart-fill" : "bi-heart"} me-2`}
                aria-hidden="true"
              ></i>
              {marcadoFavorito ? "En tus favoritos" : "Añadir a favoritos"}
            </button>
          </div>

          {/* Tarjeta resumida del artista (Insight de Carlos: generar confianza) */}
          {obra.artista && (
            <div className="card border-0 bg-soft p-3">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={obra.artista.fotoUrl}
                  alt={`Retrato de ${obra.artista.nombre}`}
                  width="64"
                  height="64"
                  className="rounded-circle object-fit-cover"
                />
                <div>
                  <h2 className="h6 mb-1">Sobre {obra.artista.nombre}</h2>
                  <p className="small text-muted mb-1">{obra.artista.trayectoria}</p>
                  <Link
                    to={`/artistas/${obra.artista.slug}`}
                    className="small text-gold fw-semibold text-decoration-none"
                  >
                    Ver biografía completa y más obras del artista →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Obras relacionadas */}
      {relacionadas.length > 0 && (
        <section className="pt-4 border-top" aria-label="Obras relacionadas">
          <h2 className="h4 mb-3">Obras Relacionadas por Técnica o Artista</h2>
          <div className="catalog-grid">
            {relacionadas.map((rel) => (
              <ObraCard key={rel.id} obra={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ObraDetallePage;
