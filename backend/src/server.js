/**
 * Punto de entrada del servidor Backend (Express.js) en puerto 4000.
 */
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend Galería Prismas activo en http://localhost:${PORT}/api`);
});
