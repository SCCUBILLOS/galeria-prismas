import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatearMonedaCOP } from "../config/empresa";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ObraCard from "../components/common/ObraCard";

/**
 * Página de Favoritos (/favoritos)
 * Permite ver las obras guardadas, quitar favoritos o pasarlas directamente al carrito.
 */
export const FavoritosPage = () => {
  const { favoritos, toggleFavorito, agregarAlCarrito } = useApp();

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Mis Obras Favoritas" }]} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Mis Obras Favoritas ({favoritos.length})</h1>
          <p className="text-muted small mb-0">
            Colección personal de piezas seleccionadas para comparar o adquirir.
          </p>
        </div>
        <Link to="/obras" className="btn btn-outline-dark btn-sm">
          Seguir explorando obras
        </Link>
      </div>

      {favoritos.length === 0 ? (
        <div className="text-center py-5 bg-soft rounded border">
          <i className="bi bi-heart fs-1 text-muted" aria-hidden="true"></i>
          <h2 className="h5 mt-3">Aún no has guardado obras en favoritos</h2>
          <p className="text-muted small">
            Haz clic en el icono de corazón sobre cualquier obra del catálogo para guardarla aquí.
          </p>
          <Link to="/obras" className="btn btn-gold">
            Explorar catálogo de obras
          </Link>
        </div>
      ) : (
        <div className="catalog-grid">
          {favoritos.map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Página de Carrito de Compras (/carrito)
 * Cumple el punto 3A.r: agregar, quitar, cambiar cantidad respetando stock,
 * subtotal, IVA 19 % y total persistido en localStorage.
 */
export const CarritoPage = () => {
  const {
    carrito,
    cambiarCantidadCarrito,
    quitarDelCarrito,
    vaciarCarrito,
    subtotalCarrito,
    ivaCarrito,
    totalCarrito,
  } = useApp();
  const navigate = useNavigate();

  const confirmarVaciar = () => {
    if (window.confirm("¿Deseas vaciar todos los artículos del carrito de compras?")) {
      vaciarCarrito();
    }
  };

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Carrito de Compras" }]} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Carrito de Compras</h1>
          <p className="text-muted small mb-0">
            Revisa tus obras seleccionadas antes de proceder al pago seguro.
          </p>
        </div>
        {carrito.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={confirmarVaciar}
          >
            <i className="bi bi-trash me-1" aria-hidden="true"></i>
            Vaciar carrito
          </button>
        )}
      </div>

      {carrito.length === 0 ? (
        <div className="text-center py-5 bg-soft rounded border">
          <i className="bi bi-bag fs-1 text-muted" aria-hidden="true"></i>
          <h2 className="h5 mt-3">Tu carrito de compras está vacío</h2>
          <p className="text-muted small">
            Explora nuestras pinturas, esculturas y fotografías de edición limitada.
          </p>
          <Link to="/obras" className="btn btn-gold">
            Ir al catálogo de obras
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Obra</th>
                      <th scope="col">Precio unitario</th>
                      <th scope="col" style={{ width: "150px" }}>
                        Cantidad
                      </th>
                      <th scope="col">Subtotal</th>
                      <th scope="col" className="text-end">
                        Quitar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.imagenUrl}
                              alt={item.titulo}
                              width="68"
                              height="68"
                              className="rounded object-fit-cover"
                            />
                            <div>
                              <Link
                                to={`/obras/detalle/${item.slug}`}
                                className="fw-semibold text-dark text-decoration-none d-block"
                              >
                                {item.titulo}
                              </Link>
                              <span className="small text-muted">
                                {item.tecnica} · {item.dimensiones}
                              </span>
                              <div className="small text-gold">
                                Stock disponible: {item.stock}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{formatearMonedaCOP(item.precio)}</td>
                        <td>
                          <div className="input-group input-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              aria-label={`Disminuir cantidad de ${item.titulo}`}
                              onClick={() =>
                                cambiarCantidadCarrito(item.id, item.cantidad - 1)
                              }
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              aria-label={`Cantidad de ${item.titulo}`}
                              value={item.cantidad}
                              min="1"
                              max={item.stock}
                              onChange={(e) =>
                                cambiarCantidadCarrito(item.id, Number(e.target.value))
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              aria-label={`Aumentar cantidad de ${item.titulo}`}
                              disabled={item.cantidad >= item.stock}
                              onClick={() =>
                                cambiarCantidadCarrito(item.id, item.cantidad + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="fw-bold">
                          {formatearMonedaCOP(item.precio * item.cantidad)}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            aria-label={`Quitar ${item.titulo} del carrito`}
                            onClick={() => quitarDelCarrito(item.id)}
                          >
                            <i className="bi bi-trash" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-4 bg-soft">
              <h2 className="h5 mb-3">Resumen de la Compra</h2>
              <div className="d-flex justify-content-between mb-2 small">
                <span>Subtotal obras:</span>
                <span className="fw-semibold">{formatearMonedaCOP(subtotalCarrito)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span>IVA (19 %):</span>
                <span className="fw-semibold">{formatearMonedaCOP(ivaCarrito)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small">
                <span>Transporte especializado asegurado:</span>
                <span className="text-success fw-semibold">Gratis</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="fw-bold">Total a pagar:</span>
                <span className="fs-4 fw-bold text-dark">
                  {formatearMonedaCOP(totalCarrito)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-gold btn-lg w-100 mb-2"
                onClick={() => navigate("/checkout")}
              >
                Continuar al Checkout →
              </button>
              <Link to="/obras" className="btn btn-outline-dark btn-sm w-100">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
