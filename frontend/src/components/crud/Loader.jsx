import React from "react";

const Loader = ({ texto = "Cargando información..." }) => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center py-4 my-2"
      role="status"
      aria-live="polite"
    >
      <div className="spinner-border text-gold mb-2" aria-hidden="true"></div>
      <span className="text-muted small">{texto}</span>
    </div>
  );
};

export default Loader;
