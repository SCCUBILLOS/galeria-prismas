/**
 * Controladores de la API REST de Galería Prismas.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/errorHandler");
const obrasService = require("../services/obrasService");
const checkoutService = require("../services/checkoutService");
const iaService = require("../services/iaService");
const reportesService = require("../services/reportesService");

// --- AUTENTICACIÓN ADMIN ---
exports.loginAdmin = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      throw new AppError("Debes ingresar el correo y la contraseña de administrador.", 400);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: String(correo).trim().toLowerCase() },
    });

    if (!usuario) {
      throw new AppError("Credenciales inválidas. Verifica el correo y la contraseña.", 401);
    }

    const passwordValido = await bcrypt.compare(String(password), usuario.passwordHash);
    if (!passwordValido) {
      throw new AppError("Credenciales inválidas. Verifica el correo y la contraseña.", 401);
    }

    const secret = process.env.JWT_SECRET || "galeria_prismas_unilibre_jwt_secret_2026_seguro";
    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      secret,
      { expiresIn: "12h" }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    next(err);
  }
};

// --- CATEGORÍAS ---
exports.getCategorias = async (_req, res, next) => {
  try {
    const datos = await prisma.categoria.findMany({
      include: { _count: { select: { obras: true } } },
      orderBy: { id: "asc" },
    });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.createCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion, icono } = req.body;
    if (!nombre) throw new AppError("El nombre de la categoría es obligatorio.", 400);
    const slug = obrasService.slugify(nombre);
    const dato = await prisma.categoria.create({
      data: {
        nombre,
        slug,
        descripcion: descripcion || "Categoría curatorial",
        icono: icono || "bi-palette",
      },
    });
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono } = req.body;
    const dato = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nombre, descripcion, icono },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.categoria.delete({ where: { id: Number(id) } });
    res.json({ ok: true, mensaje: "Categoría eliminada" });
  } catch (err) {
    next(err);
  }
};

// --- OBRAS ---
exports.getObras = async (req, res, next) => {
  try {
    const resultado = await obrasService.listarObras(req.query);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

exports.getObraDetalle = async (req, res, next) => {
  try {
    const resultado = await obrasService.obtenerObraPorSlugOId(req.params.slug);
    res.json({ ok: true, ...resultado });
  } catch (err) {
    next(err);
  }
};

exports.createObra = async (req, res, next) => {
  try {
    const dato = await obrasService.crearObra(req.body);
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateObra = async (req, res, next) => {
  try {
    const dato = await obrasService.actualizarObra(req.params.id, req.body);
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteObra = async (req, res, next) => {
  try {
    const resp = await obrasService.eliminarObra(req.params.id);
    res.json({ ok: true, ...resp });
  } catch (err) {
    next(err);
  }
};

// --- ARTISTAS ---
exports.getArtistas = async (_req, res, next) => {
  try {
    const datos = await prisma.artista.findMany({
      include: { obras: true },
      orderBy: { id: "asc" },
    });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.getArtistaDetalle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const esId = /^\d+$/.test(String(slug));
    const artista = await prisma.artista.findFirst({
      where: esId ? { id: Number(slug) } : { slug },
      include: {
        obras: {
          include: { categoria: true },
          orderBy: { id: "asc" },
        },
      },
    });
    if (!artista) throw new AppError("Artista no encontrado.", 404);
    res.json({ ok: true, artista });
  } catch (err) {
    next(err);
  }
};

exports.createArtista = async (req, res, next) => {
  try {
    const { nombre, pais, ciudad, estilo, biografia, trayectoria, fotoUrl, correo } = req.body;
    if (!nombre) throw new AppError("El nombre del artista es obligatorio.", 400);
    const slug = `${obrasService.slugify(nombre)}-${Date.now().toString().slice(-3)}`;
    const dato = await prisma.artista.create({
      data: {
        nombre,
        slug,
        pais: pais || "Colombia",
        ciudad: ciudad || "Bogotá",
        estilo: estilo || "Arte Contemporáneo",
        biografia: biografia || "Artista representado por Galería Prismas.",
        trayectoria: trayectoria || "Expositor nacional.",
        fotoUrl:
          fotoUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        correo: correo || "",
      },
    });
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateArtista = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, pais, ciudad, estilo, biografia, trayectoria, fotoUrl, correo } = req.body;
    const dato = await prisma.artista.update({
      where: { id: Number(id) },
      data: { nombre, pais, ciudad, estilo, biografia, trayectoria, fotoUrl, correo },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteArtista = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.artista.delete({ where: { id: Number(id) } });
    res.json({ ok: true, mensaje: "Artista eliminado" });
  } catch (err) {
    next(err);
  }
};

// --- EXPOSICIONES Y RESERVAS ---
exports.getExposiciones = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const where = estado && estado !== "Todos" ? { estado } : {};
    const datos = await prisma.exposicion.findMany({
      where,
      include: { _count: { select: { reservas: true } } },
      orderBy: { id: "asc" },
    });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.getExposicionDetalle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const esId = /^\d+$/.test(String(id));
    const exposicion = await prisma.exposicion.findFirst({
      where: esId ? { id: Number(id) } : { slug: id },
      include: { reservas: { orderBy: { creadoEn: "desc" }, take: 10 } },
    });
    if (!exposicion) throw new AppError("Exposición no encontrada.", 404);
    res.json({ ok: true, exposicion });
  } catch (err) {
    next(err);
  }
};

exports.createExposicion = async (req, res, next) => {
  try {
    const p = req.body;
    if (!p.titulo) throw new AppError("El título de la exposición es obligatorio.", 400);
    const slug = `${obrasService.slugify(p.titulo)}-${Date.now().toString().slice(-3)}`;
    const cupoMaximo = Number(p.cupoMaximo || 60);
    const dato = await prisma.exposicion.create({
      data: {
        titulo: p.titulo,
        slug,
        subtitulo: p.subtitulo || "Muestra curatorial Galería Prismas",
        descripcion: p.descripcion || "Exposición temporal en sede Bosque Popular.",
        curador: p.curador || "Comité Curatorial",
        fechaInicio: p.fechaInicio || "2026-11-20",
        fechaFin: p.fechaFin || "2027-01-20",
        horario: p.horario || "Martes a sábado 10:00 a. m. - 7:00 p. m.",
        sala: p.sala || "Sala Principal",
        estado: p.estado || "Próximo",
        cupoMaximo,
        cuposDisponibles: p.cuposDisponibles !== undefined ? Number(p.cuposDisponibles) : cupoMaximo,
        precioEntrada: Number(p.precioEntrada || 0),
        imagenUrl:
          p.imagenUrl ||
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80",
      },
    });
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateExposicion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = req.body;
    const dato = await prisma.exposicion.update({
      where: { id: Number(id) },
      data: {
        titulo: p.titulo,
        subtitulo: p.subtitulo,
        descripcion: p.descripcion,
        curador: p.curador,
        fechaInicio: p.fechaInicio,
        fechaFin: p.fechaFin,
        horario: p.horario,
        sala: p.sala,
        estado: p.estado,
        cupoMaximo: p.cupoMaximo !== undefined ? Number(p.cupoMaximo) : undefined,
        cuposDisponibles: p.cuposDisponibles !== undefined ? Number(p.cuposDisponibles) : undefined,
        precioEntrada: p.precioEntrada !== undefined ? Number(p.precioEntrada) : undefined,
        imagenUrl: p.imagenUrl,
      },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteExposicion = async (req, res, next) => {
  try {
    await prisma.exposicion.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true, mensaje: "Exposición eliminada" });
  } catch (err) {
    next(err);
  }
};

exports.reservarExposicion = async (req, res, next) => {
  try {
    const exposicionId = Number(req.params.id);
    const {
      nombreAsistente,
      documento,
      correo,
      celular,
      fechaVisita,
      horaVisita,
      cantidadEntradas,
    } = req.body;

    const cantidad = Number(cantidadEntradas || 1);
    const exp = await prisma.exposicion.findUnique({ where: { id: exposicionId } });
    if (!exp) throw new AppError("La exposición seleccionada no existe.", 404);
    if (exp.estado === "Finalizado") {
      throw new AppError("Esta exposición ya ha finalizado y no admite nuevas reservas.", 400);
    }
    if (exp.cuposDisponibles < cantidad) {
      throw new AppError(`Solo quedan ${exp.cuposDisponibles} cupos disponibles para este evento.`, 409);
    }

    const codigoReserva = `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const [reserva] = await prisma.$transaction([
      prisma.reservaExposicion.create({
        data: {
          codigoReserva,
          exposicionId,
          nombreAsistente: nombreAsistente.trim(),
          documento: String(documento).trim(),
          correo: correo.trim(),
          celular: celular.trim(),
          fechaVisita: fechaVisita || exp.fechaInicio,
          horaVisita: horaVisita || "11:00 a. m.",
          cantidadEntradas: cantidad,
          aceptaDatos: true,
        },
        include: { exposicion: true },
      }),
      prisma.exposicion.update({
        where: { id: exposicionId },
        data: { cuposDisponibles: exp.cuposDisponibles - cantidad },
      }),
    ]);

    res.status(201).json({
      ok: true,
      mensaje: "Reserva de entradas confirmada exitosamente.",
      reserva,
    });
  } catch (err) {
    next(err);
  }
};

// --- CURSOS E INSCRIPCIONES ---
exports.getCursos = async (req, res, next) => {
  try {
    const { nivel, modalidad, tecnica } = req.query;
    const where = {};
    if (nivel && nivel !== "Todos") where.nivel = nivel;
    if (modalidad && modalidad !== "Todas") where.modalidad = modalidad;
    if (tecnica && tecnica !== "Todas") where.tecnica = tecnica;

    const datos = await prisma.curso.findMany({
      where,
      include: { _count: { select: { inscripciones: true } } },
      orderBy: { id: "asc" },
    });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.getCursoDetalle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const esId = /^\d+$/.test(String(id));
    const curso = await prisma.curso.findFirst({
      where: esId ? { id: Number(id) } : { slug: id },
    });
    if (!curso) throw new AppError("Curso o taller no encontrado.", 404);
    res.json({ ok: true, curso });
  } catch (err) {
    next(err);
  }
};

exports.createCurso = async (req, res, next) => {
  try {
    const p = req.body;
    if (!p.titulo) throw new AppError("El título del curso es obligatorio.", 400);
    const slug = `${obrasService.slugify(p.titulo)}-${Date.now().toString().slice(-3)}`;
    const cuposTotales = Number(p.cuposTotales || 15);
    const dato = await prisma.curso.create({
      data: {
        titulo: p.titulo,
        slug,
        tecnica: p.tecnica || "Óleo",
        nivel: p.nivel || "Principiante",
        modalidad: p.modalidad || "Presencial",
        instructor: p.instructor || "Valentina Restrepo",
        bioInstructor: p.bioInstructor || "Artista y docente de Galería Prismas.",
        horario: p.horario || "Sábados 9:00 a. m. - 12:00 m.",
        duracion: p.duracion || "4 semanas",
        fechaInicio: p.fechaInicio || "2026-12-01",
        precio: Number(p.precio || 280000),
        cuposTotales,
        cuposDisponibles: p.cuposDisponibles !== undefined ? Number(p.cuposDisponibles) : cuposTotales,
        materiales: p.materiales || "Materiales básicos incluidos en la primera sesión.",
        temario: p.temario || "Módulo 1: Fundamentos. Módulo 2: Práctica guiada.",
        descripcion: p.descripcion || "Taller artístico teórico-práctico.",
        imagenUrl:
          p.imagenUrl ||
          "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
      },
    });
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = req.body;
    const dato = await prisma.curso.update({
      where: { id: Number(id) },
      data: {
        titulo: p.titulo,
        tecnica: p.tecnica,
        nivel: p.nivel,
        modalidad: p.modalidad,
        instructor: p.instructor,
        bioInstructor: p.bioInstructor,
        horario: p.horario,
        duracion: p.duracion,
        fechaInicio: p.fechaInicio,
        precio: p.precio !== undefined ? Number(p.precio) : undefined,
        cuposTotales: p.cuposTotales !== undefined ? Number(p.cuposTotales) : undefined,
        cuposDisponibles: p.cuposDisponibles !== undefined ? Number(p.cuposDisponibles) : undefined,
        materiales: p.materiales,
        temario: p.temario,
        descripcion: p.descripcion,
        imagenUrl: p.imagenUrl,
      },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteCurso = async (req, res, next) => {
  try {
    await prisma.curso.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true, mensaje: "Curso eliminado" });
  } catch (err) {
    next(err);
  }
};

exports.inscribirCurso = async (req, res, next) => {
  try {
    const cursoId = Number(req.params.id);
    const {
      nombreEstudiante,
      documento,
      correo,
      celular,
      experienciaPrevia,
      motivacion,
    } = req.body;

    const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) throw new AppError("El curso seleccionado no existe.", 404);
    if (curso.cuposDisponibles <= 0) {
      throw new AppError("Lo sentimos, los cupos de este taller ya están agotados.", 409);
    }

    const codigoInscripcion = `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const [inscripcion] = await prisma.$transaction([
      prisma.inscripcionCurso.create({
        data: {
          codigoInscripcion,
          cursoId,
          nombreEstudiante: nombreEstudiante.trim(),
          documento: String(documento).trim(),
          correo: correo.trim(),
          celular: celular.trim(),
          experienciaPrevia: experienciaPrevia || "Principiante",
          motivacion: motivacion || "",
          estado: "Confirmada",
          aceptaDatos: true,
        },
        include: { curso: true },
      }),
      prisma.curso.update({
        where: { id: cursoId },
        data: { cuposDisponibles: curso.cuposDisponibles - 1 },
      }),
    ]);

    res.status(201).json({
      ok: true,
      mensaje: "Inscripción al taller confirmada exitosamente.",
      inscripcion,
    });
  } catch (err) {
    next(err);
  }
};

// --- INVENTARIO Y MOVIMIENTOS ---
exports.getInventario = async (_req, res, next) => {
  try {
    const [obras, movimientos] = await Promise.all([
      prisma.obra.findMany({
        include: { artista: true, categoria: true },
        orderBy: { stock: "asc" },
      }),
      prisma.movimientoInventario.findMany({
        include: { obra: true },
        orderBy: { fecha: "desc" },
        take: 40,
      }),
    ]);

    const alertasStockBajo = obras.filter((o) => o.stock <= o.stockMinimo);

    res.json({
      ok: true,
      obras,
      movimientos,
      alertasStockBajo,
    });
  } catch (err) {
    next(err);
  }
};

exports.registrarMovimientoInventario = async (req, res, next) => {
  try {
    const { obraId, tipo, cantidad, motivo } = req.body;
    const cant = Number(cantidad);
    if (!obraId || !["ENTRADA", "SALIDA", "AJUSTE"].includes(tipo) || isNaN(cant) || cant < 0) {
      throw new AppError("Datos de movimiento inválidos. Indica obraId, tipo (ENTRADA/SALIDA/AJUSTE) y cantidad.", 400);
    }

    const obra = await prisma.obra.findUnique({ where: { id: Number(obraId) } });
    if (!obra) throw new AppError("Obra no encontrada.", 404);

    let stockNuevo = obra.stock;
    if (tipo === "ENTRADA") {
      stockNuevo = obra.stock + cant;
    } else if (tipo === "SALIDA") {
      if (obra.stock < cant) {
        throw new AppError(`No hay stock suficiente para retirar ${cant} unidades (Stock actual: ${obra.stock}).`, 400);
      }
      stockNuevo = obra.stock - cant;
    } else if (tipo === "AJUSTE") {
      stockNuevo = cant;
    }

    const nuevoEstado = stockNuevo === 0 ? "Vendida" : "Disponible";

    const [obraActualizada, movimiento] = await prisma.$transaction([
      prisma.obra.update({
        where: { id: obra.id },
        data: { stock: stockNuevo, estado: nuevoEstado },
      }),
      prisma.movimientoInventario.create({
        data: {
          obraId: obra.id,
          tipo,
          cantidad: cant,
          stockAnterior: obra.stock,
          stockNuevo,
          motivo: motivo || `Movimiento manual (${tipo})`,
          usuario: req.usuario?.nombre || "Administrador",
        },
        include: { obra: true },
      }),
    ]);

    res.status(201).json({
      ok: true,
      mensaje: "Movimiento de inventario aplicado correctamente.",
      obra: obraActualizada,
      movimiento,
    });
  } catch (err) {
    next(err);
  }
};

// --- CHECKOUT, PEDIDOS Y FACTURACIÓN ---
exports.crearCheckout = async (req, res, next) => {
  try {
    const pedido = await checkoutService.procesarCheckout(req.body);
    res.status(201).json({
      ok: true,
      mensaje: "Pago aprobado y factura generada exitosamente.",
      pedido,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPedidos = async (_req, res, next) => {
  try {
    const datos = await prisma.pedido.findMany({
      include: { detalles: true, cliente: true },
      orderBy: { fecha: "desc" },
    });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.getPedidoFactura = async (req, res, next) => {
  try {
    const { id } = req.params;
    const esId = /^\d+$/.test(String(id));
    const pedido = await prisma.pedido.findFirst({
      where: esId ? { id: Number(id) } : { numeroFactura: id },
      include: {
        detalles: {
          include: {
            obra: {
              include: { artista: true },
            },
          },
        },
        cliente: true,
      },
    });
    if (!pedido) throw new AppError("La factura o pedido solicitado no existe.", 404);
    res.json({ ok: true, pedido });
  } catch (err) {
    next(err);
  }
};

// --- PQR (RADICACIÓN, CONSULTA Y GESTIÓN ADMIN) ---
exports.crearPqr = async (req, res, next) => {
  try {
    const { tipo, nombre, documento, correo, celular, asunto, mensaje } = req.body;
    const conteo = await prisma.pqr.count();
    const radicado = `PQR-2026-${1001 + conteo}`;

    const pqr = await prisma.pqr.create({
      data: {
        radicado,
        tipo,
        nombre: nombre.trim(),
        documento: String(documento).trim(),
        correo: correo.trim(),
        celular: celular.trim(),
        asunto: asunto.trim(),
        mensaje: mensaje.trim(),
        estado: "Radicada",
        aceptaDatos: true,
      },
    });

    res.status(201).json({
      ok: true,
      mensaje: `Tu ${tipo} fue radicada exitosamente con el número ${radicado}.`,
      pqr,
    });
  } catch (err) {
    next(err);
  }
};

exports.consultarPqrPorRadicado = async (req, res, next) => {
  try {
    const { radicado } = req.params;
    const pqr = await prisma.pqr.findUnique({
      where: { radicado: String(radicado).trim().toUpperCase() },
    });
    if (!pqr) {
      throw new AppError(`No se encontró ninguna solicitud con el radicado ${radicado}.`, 404);
    }
    res.json({ ok: true, pqr });
  } catch (err) {
    next(err);
  }
};

exports.getPqrs = async (_req, res, next) => {
  try {
    const datos = await prisma.pqr.findMany({ orderBy: { creadoEn: "desc" } });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.actualizarEstadoPqr = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;
    if (!["Radicada", "En trámite", "Resuelta"].includes(estado)) {
      throw new AppError("El estado debe ser Radicada, En trámite o Resuelta.", 400);
    }

    const dato = await prisma.pqr.update({
      where: { id: Number(id) },
      data: {
        estado,
        respuesta: respuesta ?? undefined,
        fechaRespuesta: respuesta ? new Date() : undefined,
      },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

// --- CLIENTES Y PROVEEDORES (CRUD ADMIN) ---
exports.getClientes = async (_req, res, next) => {
  try {
    const datos = await prisma.cliente.findMany({
      include: { _count: { select: { pedidos: true } } },
      orderBy: { id: "asc" },
    });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.createCliente = async (req, res, next) => {
  try {
    const { nombre, documento, correo, celular, direccion, ciudad } = req.body;
    const dato = await prisma.cliente.create({
      data: {
        nombre,
        documento: String(documento),
        correo,
        celular: String(celular),
        direccion: direccion || "Calle 53 # 70-10",
        ciudad: ciudad || "Bogotá",
      },
    });
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, documento, correo, celular, direccion, ciudad } = req.body;
    const dato = await prisma.cliente.update({
      where: { id: Number(id) },
      data: { nombre, documento: String(documento), correo, celular: String(celular), direccion, ciudad },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteCliente = async (req, res, next) => {
  try {
    await prisma.cliente.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true, mensaje: "Cliente eliminado" });
  } catch (err) {
    next(err);
  }
};

exports.getProveedores = async (_req, res, next) => {
  try {
    const datos = await prisma.proveedor.findMany({ orderBy: { id: "asc" } });
    res.json({ ok: true, datos });
  } catch (err) {
    next(err);
  }
};

exports.createProveedor = async (req, res, next) => {
  try {
    const { nombre, nit, contacto, correo, celular, insumo, ciudad } = req.body;
    const dato = await prisma.proveedor.create({
      data: {
        nombre,
        nit: String(nit),
        contacto,
        correo,
        celular: String(celular),
        insumo: insumo || "Insumos museográficos",
        ciudad: ciudad || "Bogotá",
      },
    });
    res.status(201).json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.updateProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, nit, contacto, correo, celular, insumo, ciudad } = req.body;
    const dato = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: { nombre, nit: String(nit), contacto, correo, celular: String(celular), insumo, ciudad },
    });
    res.json({ ok: true, dato });
  } catch (err) {
    next(err);
  }
};

exports.deleteProveedor = async (req, res, next) => {
  try {
    await prisma.proveedor.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true, mensaje: "Proveedor eliminado" });
  } catch (err) {
    next(err);
  }
};

// --- BÚSQUEDA GLOBAL CON AUTOCOMPLETADO Y AGRUPACIÓN ---
exports.buscarGlobal = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      return res.json({
        ok: true,
        q: "",
        obras: [],
        artistas: [],
        cursos: [],
        exposiciones: [],
      });
    }

    const [obras, artistas, cursos, exposiciones] = await Promise.all([
      prisma.obra.findMany({
        where: {
          OR: [
            { titulo: { contains: q } },
            { tecnica: { contains: q } },
            { estilo: { contains: q } },
            { artista: { nombre: { contains: q } } },
          ],
        },
        include: { artista: true, categoria: true },
        take: 10,
      }),
      prisma.artista.findMany({
        where: {
          OR: [
            { nombre: { contains: q } },
            { estilo: { contains: q } },
            { ciudad: { contains: q } },
          ],
        },
        take: 6,
      }),
      prisma.curso.findMany({
        where: {
          OR: [
            { titulo: { contains: q } },
            { tecnica: { contains: q } },
            { instructor: { contains: q } },
            { nivel: { contains: q } },
          ],
        },
        take: 6,
      }),
      prisma.exposicion.findMany({
        where: {
          OR: [
            { titulo: { contains: q } },
            { subtitulo: { contains: q } },
            { curador: { contains: q } },
          ],
        },
        take: 6,
      }),
    ]);

    res.json({
      ok: true,
      q,
      obras,
      artistas,
      cursos,
      exposiciones,
    });
  } catch (err) {
    next(err);
  }
};

// --- ASISTENTE PRISMA IA ---
exports.chatIA = async (req, res, next) => {
  try {
    const { mensaje } = req.body;
    if (!mensaje || String(mensaje).trim().length < 2) {
      throw new AppError("Escribe una consulta o preferencia para que Prisma IA pueda recomendarte obras.", 400);
    }
    const resultado = await iaService.consultarAsistenteIA(mensaje);
    res.json({
      ok: true,
      aviso: "Respuesta generada por el asistente Prisma IA a partir del catálogo oficial de la galería.",
      ...resultado,
    });
  } catch (err) {
    next(err);
  }
};

// --- REPORTES DASHBOARD ---
exports.getReportes = async (_req, res, next) => {
  try {
    const datos = await reportesService.obtenerReportesDashboard();
    res.json({ ok: true, ...datos });
  } catch (err) {
    next(err);
  }
};
