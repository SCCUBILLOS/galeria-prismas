# Documentación de Endpoints — API REST Galería Prismas

**Base URL Backend Principal:** `http://localhost:4000/api`  
**Base URL API Virtual (Laboratorio IV):** `http://localhost:5000/desarrolladores`  
**Formato de Respuesta de Error Uniforme:**
```json
{
  "ok": false,
  "error": "Error en la solicitud",
  "mensaje": "Descripción clara en español del error",
  "errores": [
    { "campo": "celular", "mensaje": "El celular debe ser colombiano de 10 dígitos e iniciar en 3." }
  ]
}
```

---

## 1. Salud y Autenticación

| Método | Ruta | Protegido | Body (JSON) | Respuesta Exitosa | Errores Posibles |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `GET` | `/api/health` | No | — | `200 OK`: `{ ok: true, estado: "Operativo" }` | — |
| `POST` | `/api/auth/login` | No | `{ "correo": "admin@galeriaprismas.co", "password": "AdminPrismas2026*" }` | `200 OK`: `{ ok: true, token: "<JWT>", usuario: {...} }` | `400` Faltan campos · `401` Credenciales inválidas |

---

## 2. Catálogo de Obras, Categorías y Artistas

| Método | Ruta | Protegido | Parámetros / Body | Respuesta Exitosa | Errores Posibles |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `GET` | `/api/obras` | No | Query: `tecnica`, `estilo`, `tamano`, `estado`, `precioMin`, `precioMax`, `destacada`, `q`, `orden` | `200 OK`: `{ ok: true, total, datos: [...] }` | `500` Error interno |
| `GET` | `/api/obras/:slug` | No | Param: `slug` o `id` | `200 OK`: `{ ok: true, obra: {...}, relacionadas: [...] }` | `404` Obra no encontrada |
| `POST` | `/api/obras` | **Sí (JWT)** | `{ "titulo", "tecnica", "estilo", "precio", "stock", "dimensiones" }` | `201 Created`: `{ ok: true, dato: {...} }` | `400` Validación · `401` Sin token |
| `PUT` | `/api/obras/:id` | **Sí (JWT)** | Campos a actualizar | `200 OK`: `{ ok: true, dato: {...} }` | `404` No existe · `401` Sin token |
| `DELETE` | `/api/obras/:id` | **Sí (JWT)** | — | `200 OK`: `{ ok: true, mensaje: "Obra eliminada correctamente" }` | `404` No existe · `401` Sin token |
| `GET` | `/api/categorias` | No | — | `200 OK`: `{ ok: true, datos: [...] }` | — |
| `POST/PUT/DELETE` | `/api/categorias(/:id)` | **Sí (JWT)** | `{ "nombre", "descripcion" }` | `200/201`: `{ ok: true, dato }` | `400` / `401` |
| `GET` | `/api/artistas` | No | — | `200 OK`: `{ ok: true, datos: [...] }` | — |
| `GET` | `/api/artistas/:slug` | No | Param: `slug` o `id` | `200 OK`: `{ ok: true, artista: {..., obras: [...]} }` | `404` Artista no encontrado |
| `POST/PUT/DELETE` | `/api/artistas(/:id)` | **Sí (JWT)** | `{ "nombre", "ciudad", "estilo", "biografia" }` | `200/201`: `{ ok: true, dato }` | `400` / `401` |

---

## 3. Exposiciones, Reservas, Cursos e Inscripciones

| Método | Ruta | Protegido | Body (JSON) | Respuesta Exitosa | Errores Posibles |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `GET` | `/api/exposiciones` | No | Query opcional: `estado` | `200 OK`: `{ ok: true, datos: [...] }` | — |
| `GET` | `/api/exposiciones/:id` | No | — | `200 OK`: `{ ok: true, exposicion: {...} }` | `404` No existe |
| `POST` | `/api/exposiciones/:id/reservar` | No | `{ "nombreAsistente", "documento", "correo", "celular", "fechaVisita", "horaVisita", "cantidadEntradas", "aceptaDatos": true }` | `201 Created`: `{ ok: true, reserva: { codigoReserva: "RES-2026-XXXX" } }` | `400` Regex inválida · `409` Cupos agotados |
| `GET` | `/api/cursos` | No | Query opcional: `nivel`, `modalidad`, `tecnica` | `200 OK`: `{ ok: true, datos: [...] }` | — |
| `GET` | `/api/cursos/:id` | No | — | `200 OK`: `{ ok: true, curso: {...} }` | `404` No existe |
| `POST` | `/api/cursos/:id/inscribir` | No | `{ "nombreEstudiante", "documento", "correo", "celular", "experienciaPrevia", "aceptaDatos": true }` | `201 Created`: `{ ok: true, inscripcion: { codigoInscripcion: "INS-2026-XXXX" } }` | `400` Regex inválida · `409` Sin cupos |

---

## 4. Checkout, Facturación, Inventario, PQR, IA y Reportes

| Método | Ruta | Protegido | Body / Parámetros | Respuesta Exitosa | Errores Posibles |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/checkout` | No | `{ "nombreCliente", "documentoCliente", "correoCliente", "celularCliente", "direccionEnvio", "ciudadEnvio", "metodoPago", "datosPago", "items": [{ "obraId", "cantidad" }], "aceptaDatos": true }` | `201 Created`: `{ ok: true, pedido: { numeroFactura: "FAC-2026-XXXX", subtotal, iva, total } }` | `400` Luhn/Regex · `402` Pago rechazado o sin fondos · `409` Stock insuficiente |
| `GET` | `/api/pedidos/:id/factura` | No | Param: `id` o `numeroFactura` | `200 OK`: `{ ok: true, pedido: {...} }` | `404` Factura no encontrada |
| `GET` | `/api/inventario` | **Sí (JWT)** | — | `200 OK`: `{ ok: true, obras, movimientos, alertasStockBajo }` | `401` No autorizado |
| `POST` | `/api/inventario/movimientos` | **Sí (JWT)** | `{ "obraId": 1, "tipo": "ENTRADA\|SALIDA\|AJUSTE", "cantidad": 2, "motivo": "..." }` | `201 Created`: `{ ok: true, obra, movimiento }` | `400` Stock insuficiente · `401` |
| `POST` | `/api/pqr` | No | `{ "tipo", "nombre", "documento", "correo", "celular", "asunto", "mensaje", "aceptaDatos": true }` | `201 Created`: `{ ok: true, pqr: { radicado: "PQR-2026-XXXX" } }` | `400` Error de validación |
| `GET` | `/api/pqr/radicado/:radicado` | No | Param: `PQR-2026-1001` | `200 OK`: `{ ok: true, pqr: {...} }` | `404` Radicado no existe |
| `PUT` | `/api/pqr/:id` | **Sí (JWT)** | `{ "estado": "En trámite\|Resuelta", "respuesta": "..." }` | `200 OK`: `{ ok: true, dato: {...} }` | `400` / `401` |
| `POST` | `/api/ia/chat` | No (Rate-Limit) | `{ "mensaje": "Busco óleo para sala de menos de 4 millones" }` | `200 OK`: `{ ok: true, origen, respuesta, obrasRecomendadas: [...] }` | `400` Mensaje vacío · `429` Rate limit |
| `GET` | `/api/reportes` | **Sí (JWT)** | — | `200 OK`: `{ ok: true, resumen, ventasPorMes, obrasMasVendidas, inventarioValorizado, pqrPorEstado }` | `401` Sin token |
| `GET/POST/PUT/DELETE` | `http://localhost:5000/desarrolladores(/:id)` | No | `{ "nombre", "rol", "correo", "celular", "github", "linkedin", "foto", "biografia" }` | `200/201` JSON de `json-server` | `404` No encontrado |
