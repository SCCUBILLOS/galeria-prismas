import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { formatearMonedaCOP } from "../../config/empresa";

/**
 * Componente estandarizado de tarjeta de obra (Heurística #4: Consistencia y estándares).
 * Incluye botón de favoritos con cambio instantáneo de corazón y botón de agregar al carrito.
 */
const ObraCard = ({ obra }) => {
  const { esFavorito, toggleFavorito, agregarAlCarrito } = useApp();
  const navigate = useNavigate();
  const marcadoFavorito = esFavorito(obra.id);
  const disponible = obra.estado === "Disponible" && obra.stock > 0;

  const handleComprarAhora = () => {
    if (agregarAlCarrito(obra, 1)) {
      navigate("/checkout");
    }
  };

  return (
    <article className="obra-card" aria-label={`Obra ${obra.titulo}`}>
      <div className="obra-card-img-wrapper">
        <Link to={`/obras/detalle/${obra.slug}`} aria-label={`Ver detalle de ${obra.titulo}`}>
          <img
            src={obra.imagenUrl}
            alt={`Obra ${obra.titulo} en técnica ${obra.tecnica} por ${
              obra.artista?.nombre || "artista de Galería Prismas"
            }`}
            className="obra-card-img"
            loading="lazy"
          />
        </Link>
        <div className="position-absolute top-0 start-0 p-2 d-flex gap-1 flex-wrap">
          <span className={`badge ${disponible ? "bg-success" : "bg-secondary"}`}>
            {disponible ? "Disponible" : "Vendida"}
          </span>
          <span className="badge bg-dark">{obra.tecnica}</span>
          {obra.esUnica && <span className="badge bg-warning text-dark">Pieza única</span>}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorito(obra)}
          className={`btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-sm ${
            marcadoFavorito ? "btn-danger" : "btn-light"
          }`}
          aria-label={
            marcadoFavorito
              ? `Quitar ${obra.titulo} de favoritos`
              : `Añadir ${obra.titulo} a favoritos`
          }
          title={marcadoFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <i className={`bi ${marcadoFavorito ? "bi-heart-fill" : "bi-heart"}`} aria-hidden="true"></i>
        </button>
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
            <span>{obra.estilo}</span>
            <span>{obra.dimensiones}</span>
          </div>
          <h3 className="h5 mb-1">
            <Link to={`/obras/detalle/${obra.slug}`} className="text-decoration-none text-dark">
              {obra.titulo}
            </Link>
          </h3>
          {obra.artista && (
            <p className="small text-muted mb-2">
              Por{" "}
              <Link
                to={`/artistas/${obra.artista.slug || obra.artista.id}`}
                className="text-gold text-decoration-none fw-semibold"
              >
                {obra.artista.nombre}
              </Link>
            </p>
          )}
        </div>

        <div className="pt-2 border-top mt-2">
          <div className="d-flex justify-content-between align-items-baseline mb-2">
            <span className="fw-bold fs-5 text-dark">{formatearMonedaCOP(obra.precio)}</span>
            <span className="small text-muted">
              {disponible ? `Stock: ${obra.stock}` : "Agotada"}
            </span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-gold btn-sm flex-grow-1"
              disabled={!disponible}
              onClick={() => agregarAlCarrito(obra, 1)}
            >
              <i className="bi bi-cart-plus me-1" aria-hidden="true"></i>
              {disponible ? "Agregar" : "Vendida"}
            </button>
            {disponible && (
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={handleComprarAhora}
                title="Comprar ahora (ir directo al checkout)"
              >
                Comprar
              </button>
            )}
            <Link
              to={`/obras/detalle/${obra.slug}`}
              className="btn btn-outline-secondary btn-sm"
              aria-label={`Detalle de ${obra.titulo}`}
            >
              Ver
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ObraCard;
