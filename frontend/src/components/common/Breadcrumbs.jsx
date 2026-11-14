import React from "react";
import { Link } from "react-router-dom";

/**
 * Migas de pan contextuales obligatorias en todas las páginas internas.
 * Ejemplo: Inicio > Catálogo > Pintura > "Atardecer Urbano"
 */
const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="Migas de pan" className="py-2 mb-3 border-bottom">
      <ol className="breadcrumb mb-0 small">
        <li className="breadcrumb-item">
          <Link to="/" className="text-decoration-none text-gold fw-semibold">
            <i className="bi bi-house-door me-1" aria-hidden="true"></i>
            Inicio
          </Link>
        </li>
        {items.map((item, index) => {
          const esUltimo = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className={`breadcrumb-item ${esUltimo ? "active fw-semibold text-dark" : ""}`}
              aria-current={esUltimo ? "page" : undefined}
            >
              {!esUltimo && item.to ? (
                <Link to={item.to} className="text-decoration-none text-gold">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
