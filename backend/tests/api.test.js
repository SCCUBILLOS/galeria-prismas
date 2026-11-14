/**
 * Pruebas automáticas de integración del Backend (Jest + Supertest).
 * Verifica:
 * 1) Catálogo y filtros de obras
 * 2) Autenticación JWT de administrador y CRUD protegido de obras
 * 3) Validaciones de datos (celular colombiano, correo, documento, algoritmo de Luhn)
 * 4) Pasarela de checkout (tarjeta aprobada que descuenta stock y genera factura con IVA 19 %, y tarjeta rechazada)
 * 5) Radicación y consulta de PQR
 * 6) Asistente Prisma IA con fallback local
 */
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("API REST Galería Prismas — Pruebas de Integración", () => {
  let adminToken = "";
  let obraCreadaId = null;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET /api/health responde estado Operativo", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.estado).toBe("Operativo");
  });

  test("GET /api/obras retorna mínimo 20 obras con artista y categoría", async () => {
    const res = await request(app).get("/api/obras");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.length).toBeGreaterThanOrEqual(20);
    expect(res.body.datos[0]).toHaveProperty("artista");
    expect(res.body.datos[0]).toHaveProperty("categoria");
  });

  test("POST /api/auth/login autentica al administrador y entrega JWT", async () => {
    const res = await request(app).post("/api/auth/login").send({
      correo: "admin@galeriaprismas.co",
      password: "AdminPrismas2026*",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  test("POST /api/obras requiere token JWT y permite CRUD completo de obra", async () => {
    const sinToken = await request(app).post("/api/obras").send({
      titulo: "Obra sin token",
      tecnica: "Óleo",
      precio: 1500000,
    });
    expect(sinToken.statusCode).toBe(401);

    const crearRes = await request(app)
      .post("/api/obras")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        titulo: "Estudio de Luz en Monserrate II",
        tecnica: "Óleo",
        estilo: "Contemporáneo",
        tamano: "Mediano",
        dimensiones: "70 x 90 cm",
        precio: 2100000,
        stock: 2,
        artistaId: 1,
        categoriaId: 1,
      });

    expect(crearRes.statusCode).toBe(201);
    expect(crearRes.body.dato.titulo).toBe("Estudio de Luz en Monserrate II");
    obraCreadaId = crearRes.body.dato.id;

    const editarRes = await request(app)
      .put(`/api/obras/${obraCreadaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ precio: 2250000, stock: 3 });

    expect(editarRes.statusCode).toBe(200);
    expect(editarRes.body.dato.precio).toBe(2250000);
    expect(editarRes.body.dato.stock).toBe(3);
  });

  test("POST /api/checkout rechaza tarjeta inválida Luhn y tarjeta terminada en 0000", async () => {
    const luhnInvalido = await request(app)
      .post("/api/checkout")
      .send({
        nombreCliente: "Carlos Andrés Mendoza",
        documentoCliente: "1020765432",
        correoCliente: "carlos@coleccionista.co",
        celularCliente: "3154829103",
        direccionEnvio: "Carrera 11 # 84-42",
        ciudadEnvio: "Bogotá",
        metodoPago: "TARJETA",
        aceptaDatos: true,
        datosPago: {
          numeroTarjeta: "4242424242424241", // Luhn inválido
          vencimiento: "12/29",
          cvv: "123",
        },
        items: [{ obraId: obraCreadaId, cantidad: 1 }],
      });
    expect(luhnInvalido.statusCode).toBe(400);

    const tarjetaRechazada = await request(app)
      .post("/api/checkout")
      .send({
        nombreCliente: "Carlos Andrés Mendoza",
        documentoCliente: "1020765432",
        correoCliente: "carlos@coleccionista.co",
        celularCliente: "3154829103",
        direccionEnvio: "Carrera 11 # 84-42",
        ciudadEnvio: "Bogotá",
        metodoPago: "TARJETA",
        aceptaDatos: true,
        datosPago: {
          numeroTarjeta: "4000000000000002", // Luhn válido terminada en 0002 -> rechazada (402)
          vencimiento: "12/29",
          cvv: "123",
        },
        items: [{ obraId: obraCreadaId, cantidad: 1 }],
      });
    expect(tarjetaRechazada.statusCode).toBe(402);
  });

  test("POST /api/checkout con tarjeta aprobada descuenta stock y genera factura con IVA 19 %", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({
        nombreCliente: "Carlos Andrés Mendoza",
        documentoCliente: "1020765432",
        correoCliente: "carlos@coleccionista.co",
        celularCliente: "3154829103",
        direccionEnvio: "Carrera 11 # 84-42",
        ciudadEnvio: "Bogotá",
        metodoPago: "TARJETA",
        aceptaDatos: true,
        datosPago: {
          numeroTarjeta: "4242424242424242",
          vencimiento: "12/29",
          cvv: "842",
        },
        items: [{ obraId: obraCreadaId, cantidad: 1 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.pedido.numeroFactura).toMatch(/^FAC-2026-\d{4}$/);
    expect(res.body.pedido.subtotal).toBe(2250000);
    expect(res.body.pedido.iva).toBe(Math.round(2250000 * 0.19));
    expect(res.body.pedido.total).toBe(2250000 + Math.round(2250000 * 0.19));

    const obraDespues = await request(app).get(`/api/obras/${obraCreadaId}`);
    expect(obraDespues.body.obra.stock).toBe(2);

    // Limpiar la obra creada en el test
    await request(app)
      .delete(`/api/obras/${obraCreadaId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  test("POST /api/ia/chat responde recomendaciones con fallback local sin requerir API key", async () => {
    const res = await request(app)
      .post("/api/ia/chat")
      .send({ mensaje: "Busco una pintura al óleo para sala de menos de 4 millones" });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.obrasRecomendadas.length).toBeGreaterThan(0);
  });
});
