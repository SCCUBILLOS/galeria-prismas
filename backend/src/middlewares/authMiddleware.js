/**
 * Middleware de autenticación JWT para proteger rutas de administración e inventario.
 */
const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");

const verificarAdmin = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Acceso no autorizado: se requiere un token Bearer válido.", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "galeria_prismas_unilibre_jwt_secret_2026_seguro";
    const decoded = jwt.verify(token, secret);

    if (decoded.rol !== "ADMIN") {
      throw new AppError("Permisos insuficientes: se requiere rol ADMIN.", 403);
    }

    req.usuario = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError("Token inválido o expirado. Inicia sesión nuevamente.", 401));
  }
};

module.exports = {
  verificarAdmin,
};
