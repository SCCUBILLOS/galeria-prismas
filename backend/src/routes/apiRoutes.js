/**
 * Enrutador principal de la API REST (/api/...).
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/apiController");
const { verificarAdmin } = require("../middlewares/authMiddleware");
const {
  validarObra,
  validarInscripcionCurso,
  validarReservaExposicion,
  validarPqr,
  validarCheckout,
} = require("../validators/commonValidators");

const router = express.Router();

// Rate limiter para el asistente de IA (requisito 3A.j)
const iaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: "Límite de consultas excedido",
    mensaje: "Has enviado demasiadas consultas seguidas a Prisma IA. Espera unos segundos e inténtalo de nuevo.",
  },
});

// Salud del servicio
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    servicio: "Galería Prismas API REST",
    estado: "Operativo",
    timestamp: new Date().toISOString(),
  });
});

// Autenticación
router.post("/auth/login", ctrl.loginAdmin);

// Búsqueda global agrupada y autocompletado
router.get("/buscar", ctrl.buscarGlobal);

// Categorías
router.get("/categorias", ctrl.getCategorias);
router.post("/categorias", verificarAdmin, ctrl.createCategoria);
router.put("/categorias/:id", verificarAdmin, ctrl.updateCategoria);
router.delete("/categorias/:id", verificarAdmin, ctrl.deleteCategoria);

// Obras de arte
router.get("/obras", ctrl.getObras);
router.get("/obras/:slug", ctrl.getObraDetalle);
router.post("/obras", verificarAdmin, validarObra, ctrl.createObra);
router.put("/obras/:id", verificarAdmin, ctrl.updateObra);
router.delete("/obras/:id", verificarAdmin, ctrl.deleteObra);

// Artistas
router.get("/artistas", ctrl.getArtistas);
router.get("/artistas/:slug", ctrl.getArtistaDetalle);
router.post("/artistas", verificarAdmin, ctrl.createArtista);
router.put("/artistas/:id", verificarAdmin, ctrl.updateArtista);
router.delete("/artistas/:id", verificarAdmin, ctrl.deleteArtista);

// Exposiciones y reservas de entradas
router.get("/exposiciones", ctrl.getExposiciones);
router.get("/exposiciones/:id", ctrl.getExposicionDetalle);
router.post("/exposiciones/:id/reservar", validarReservaExposicion, ctrl.reservarExposicion);
router.post("/exposiciones", verificarAdmin, ctrl.createExposicion);
router.put("/exposiciones/:id", verificarAdmin, ctrl.updateExposicion);
router.delete("/exposiciones/:id", verificarAdmin, ctrl.deleteExposicion);

// Cursos y talleres + inscripciones
router.get("/cursos", ctrl.getCursos);
router.get("/cursos/:id", ctrl.getCursoDetalle);
router.post("/cursos/:id/inscribir", validarInscripcionCurso, ctrl.inscribirCurso);
router.post("/cursos", verificarAdmin, ctrl.createCurso);
router.put("/cursos/:id", verificarAdmin, ctrl.updateCurso);
router.delete("/cursos/:id", verificarAdmin, ctrl.deleteCurso);

// Inventario y movimientos (protegido para admin)
router.get("/inventario", verificarAdmin, ctrl.getInventario);
router.post("/inventario/movimientos", verificarAdmin, ctrl.registrarMovimientoInventario);

// Checkout, pasarela ficticia y facturación
router.post("/checkout", validarCheckout, ctrl.crearCheckout);
router.get("/pedidos", verificarAdmin, ctrl.getPedidos);
router.get("/pedidos/:id/factura", ctrl.getPedidoFactura);

// PQR (Peticiones, Quejas, Reclamos y Sugerencias)
router.post("/pqr", validarPqr, ctrl.crearPqr);
router.get("/pqr/radicado/:radicado", ctrl.consultarPqrPorRadicado);
router.get("/pqr", verificarAdmin, ctrl.getPqrs);
router.put("/pqr/:id", verificarAdmin, ctrl.actualizarEstadoPqr);

// Clientes y Proveedores (CRUD administrativo)
router.get("/clientes", verificarAdmin, ctrl.getClientes);
router.post("/clientes", verificarAdmin, ctrl.createCliente);
router.put("/clientes/:id", verificarAdmin, ctrl.updateCliente);
router.delete("/clientes/:id", verificarAdmin, ctrl.deleteCliente);

router.get("/proveedores", verificarAdmin, ctrl.getProveedores);
router.post("/proveedores", verificarAdmin, ctrl.createProveedor);
router.put("/proveedores/:id", verificarAdmin, ctrl.updateProveedor);
router.delete("/proveedores/:id", verificarAdmin, ctrl.deleteProveedor);

// Asistente Curatorial Prisma IA
router.post("/ia/chat", iaLimiter, ctrl.chatIA);

// Reportes gerenciales del dashboard
router.get("/reportes", verificarAdmin, ctrl.getReportes);

module.exports = router;
