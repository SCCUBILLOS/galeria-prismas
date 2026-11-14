/**
 * Manejador central de errores y constructor de errores HTTP uniformes.
 */
class AppError extends Error {
  constructor(mensaje, statusCode = 400, errores = []) {
    super(mensaje);
    this.statusCode = statusCode;
    this.errores = errores;
  }
}

const notFoundHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    error: "Ruta no encontrada",
    mensaje: `El recurso solicitado ${req.method} ${req.originalUrl} no existe en la API de Galería Prismas.`,
    errores: [],
  });
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const mensaje = err.message || "Error interno del servidor";

  if (process.env.NODE_ENV !== "test" && statusCode >= 500) {
    console.error("[ERROR API]:", err);
  }

  res.status(statusCode).json({
    ok: false,
    error: statusCode >= 500 ? "Error del servidor" : "Error en la solicitud",
    mensaje,
    errores: err.errores || [],
  });
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
