/**
 * Servicio de obras de arte: filtros, búsqueda, orden, paginación, CRUD e inventario.
 */
const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/errorHandler");

function slugify(texto = "") {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function listarObras(query = {}) {
  const {
    tecnica,
    estilo,
    tamano,
    estado,
    categoria,
    artistaId,
    precioMin,
    precioMax,
    destacada,
    q,
    orden = "recientes",
    page = 1,
    limit = 50,
  } = query;

  const where = {};

  if (tecnica && tecnica !== "Todas") {
    where.tecnica = { contains: tecnica };
  }
  if (estilo && estilo !== "Todos") {
    where.estilo = { contains: estilo };
  }
  if (tamano && tamano !== "Todos") {
    where.tamano = tamano;
  }
  if (estado && estado !== "Todos") {
    where.estado = estado;
  }
  if (artistaId) {
    where.artistaId = Number(artistaId);
  }
  if (destacada !== undefined) {
    where.destacada = destacada === "true" || destacada === true;
  }
  if (categoria) {
    where.categoria = { slug: categoria };
  }
  if (precioMin || precioMax) {
    where.precio = {};
    if (precioMin) where.precio.gte = Number(precioMin);
    if (precioMax) where.precio.lte = Number(precioMax);
  }
  if (q && String(q).trim() !== "") {
    const termino = String(q).trim();
    where.OR = [
      { titulo: { contains: termino } },
      { tecnica: { contains: termino } },
      { estilo: { contains: termino } },
      { descripcion: { contains: termino } },
      { artista: { nombre: { contains: termino } } },
    ];
  }

  let orderBy = { id: "asc" };
  if (orden === "precio_asc") orderBy = { precio: "asc" };
  else if (orden === "precio_desc") orderBy = { precio: "desc" };
  else if (orden === "titulo_asc") orderBy = { titulo: "asc" };
  else if (orden === "recientes") orderBy = { id: "desc" };

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const take = Number(limit);

  const [total, datos] = await Promise.all([
    prisma.obra.count({ where }),
    prisma.obra.findMany({
      where,
      include: {
        artista: true,
        categoria: true,
      },
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    ok: true,
    total,
    pagina: Number(page),
    totalPaginas: Math.ceil(total / take) || 1,
    datos,
  };
}

async function obtenerObraPorSlugOId(identificador) {
  const esId = /^\d+$/.test(String(identificador));
  const obra = await prisma.obra.findFirst({
    where: esId ? { id: Number(identificador) } : { slug: String(identificador) },
    include: {
      artista: true,
      categoria: true,
      movimientos: {
        orderBy: { fecha: "desc" },
        take: 10,
      },
    },
  });

  if (!obra) {
    throw new AppError("La obra solicitada no existe en el catálogo.", 404);
  }

  const relacionadas = await prisma.obra.findMany({
    where: {
      id: { not: obra.id },
      OR: [{ tecnica: obra.tecnica }, { artistaId: obra.artistaId }],
    },
    include: { artista: true, categoria: true },
    take: 4,
  });

  return { obra, relacionadas };
}

async function crearObra(payload) {
  const baseSlug = slugify(payload.titulo);
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  const codigo = payload.codigo || `GP-OBR-${Math.floor(100 + Math.random() * 900)}`;
  const stock = payload.stock !== undefined ? Number(payload.stock) : 1;
  const estado = stock > 0 ? payload.estado || "Disponible" : "Vendida";

  let categoriaId = payload.categoriaId ? Number(payload.categoriaId) : null;
  if (categoriaId) {
    const existeCat = await prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!existeCat) categoriaId = null;
  }
  if (!categoriaId) {
    const primeraCat = await prisma.categoria.findFirst({ orderBy: { id: "asc" } });
    categoriaId = primeraCat.id;
  }

  let artistaId = payload.artistaId ? Number(payload.artistaId) : null;
  if (artistaId) {
    const existeArt = await prisma.artista.findUnique({ where: { id: artistaId } });
    if (!existeArt) artistaId = null;
  }
  if (!artistaId) {
    const primerArt = await prisma.artista.findFirst({ orderBy: { id: "asc" } });
    artistaId = primerArt.id;
  }

  const nueva = await prisma.obra.create({
    data: {
      titulo: payload.titulo,
      slug,
      codigo,
      tecnica: payload.tecnica || "Óleo",
      estilo: payload.estilo || "Contemporáneo",
      tamano: payload.tamano || "Mediano",
      dimensiones: payload.dimensiones || "70 x 90 cm",
      anio: Number(payload.anio || 2026),
      precio: Number(payload.precio),
      stock,
      stockMinimo: Number(payload.stockMinimo || 1),
      esUnica: payload.esUnica !== undefined ? Boolean(payload.esUnica) : stock === 1,
      estado,
      destacada: Boolean(payload.destacada),
      descripcion: payload.descripcion || "Obra certificada por Galería Prismas.",
      historiaCuraduria: payload.historiaCuraduria || "Certificado de autenticidad incluido.",
      imagenUrl:
        payload.imagenUrl ||
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: payload.espacioSugerido || "Sala principal o estudio",
      categoriaId,
      artistaId,
    },
    include: { artista: true, categoria: true },
  });

  await prisma.movimientoInventario.create({
    data: {
      obraId: nueva.id,
      tipo: "ENTRADA",
      cantidad: stock,
      stockAnterior: 0,
      stockNuevo: stock,
      motivo: "Creación de obra en panel administrativo",
    },
  });

  return nueva;
}

async function actualizarObra(id, payload) {
  const actual = await prisma.obra.findUnique({ where: { id: Number(id) } });
  if (!actual) throw new AppError("Obra no encontrada.", 404);

  const nuevoStock = payload.stock !== undefined ? Number(payload.stock) : actual.stock;
  const nuevoEstado =
    nuevoStock === 0 ? "Vendida" : payload.estado === "Vendida" ? "Vendida" : "Disponible";

  const actualizada = await prisma.obra.update({
    where: { id: Number(id) },
    data: {
      titulo: payload.titulo ?? actual.titulo,
      tecnica: payload.tecnica ?? actual.tecnica,
      estilo: payload.estilo ?? actual.estilo,
      tamano: payload.tamano ?? actual.tamano,
      dimensiones: payload.dimensiones ?? actual.dimensiones,
      anio: payload.anio !== undefined ? Number(payload.anio) : actual.anio,
      precio: payload.precio !== undefined ? Number(payload.precio) : actual.precio,
      stock: nuevoStock,
      stockMinimo: payload.stockMinimo !== undefined ? Number(payload.stockMinimo) : actual.stockMinimo,
      esUnica: payload.esUnica !== undefined ? Boolean(payload.esUnica) : actual.esUnica,
      estado: nuevoEstado,
      destacada: payload.destacada !== undefined ? Boolean(payload.destacada) : actual.destacada,
      descripcion: payload.descripcion ?? actual.descripcion,
      historiaCuraduria: payload.historiaCuraduria ?? actual.historiaCuraduria,
      imagenUrl: payload.imagenUrl ?? actual.imagenUrl,
      espacioSugerido: payload.espacioSugerido ?? actual.espacioSugerido,
      categoriaId: payload.categoriaId ? Number(payload.categoriaId) : actual.categoriaId,
      artistaId: payload.artistaId ? Number(payload.artistaId) : actual.artistaId,
    },
    include: { artista: true, categoria: true },
  });

  if (nuevoStock !== actual.stock) {
    await prisma.movimientoInventario.create({
      data: {
        obraId: actual.id,
        tipo: "AJUSTE",
        cantidad: Math.abs(nuevoStock - actual.stock),
        stockAnterior: actual.stock,
        stockNuevo: nuevoStock,
        motivo: "Actualización desde CRUD de obras",
      },
    });
  }

  return actualizada;
}

async function eliminarObra(id) {
  const actual = await prisma.obra.findUnique({ where: { id: Number(id) } });
  if (!actual) throw new AppError("Obra no encontrada.", 404);
  await prisma.obra.delete({ where: { id: Number(id) } });
  return { mensaje: "Obra eliminada correctamente" };
}

module.exports = {
  slugify,
  listarObras,
  obtenerObraPorSlugOId,
  crearObra,
  actualizarObra,
  eliminarObra,
};
