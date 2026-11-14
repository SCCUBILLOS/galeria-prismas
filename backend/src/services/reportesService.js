/**
 * Servicio de reportes e indicadores gerenciales del panel administrativo.
 * Cumple el punto 3A.f de la rúbrica:
 * - Ventas por mes
 * - Obras más vendidas
 * - Inventario valorizado y alertas de stock bajo
 * - PQR por estado
 */
const prisma = require("../config/prisma");

async function obtenerReportesDashboard() {
  const [obras, pedidos, pqrs, movimientos, cursos, exposiciones] = await Promise.all([
    prisma.obra.findMany({ include: { artista: true, categoria: true } }),
    prisma.pedido.findMany({
      where: { estadoPago: "APROBADO" },
      include: { detalles: true },
      orderBy: { fecha: "asc" },
    }),
    prisma.pqr.findMany(),
    prisma.movimientoInventario.findMany({
      include: { obra: true },
      orderBy: { fecha: "desc" },
      take: 25,
    }),
    prisma.curso.findMany({ include: { inscripciones: true } }),
    prisma.exposicion.findMany({ include: { reservas: true } }),
  ]);

  // 1. Ventas por mes
  const nombresMeses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const mapaVentasMes = {};
  for (const p of pedidos) {
    const fecha = new Date(p.fecha);
    const clave = `${nombresMeses[fecha.getUTCMonth()]} ${fecha.getUTCFullYear()}`;
    if (!mapaVentasMes[clave]) {
      mapaVentasMes[clave] = { mes: clave, total: 0, cantidadPedidos: 0 };
    }
    mapaVentasMes[clave].total += p.total;
    mapaVentasMes[clave].cantidadPedidos += 1;
  }
  const ventasPorMes = Object.values(mapaVentasMes);

  // 2. Obras más vendidas
  const mapaObrasVendidas = {};
  for (const p of pedidos) {
    for (const det of p.detalles) {
      if (!mapaObrasVendidas[det.obraId]) {
        mapaObrasVendidas[det.obraId] = {
          obraId: det.obraId,
          titulo: det.tituloObra,
          unidades: 0,
          ingresos: 0,
        };
      }
      mapaObrasVendidas[det.obraId].unidades += det.cantidad;
      mapaObrasVendidas[det.obraId].ingresos += det.subtotal;
    }
  }
  const obrasMasVendidas = Object.values(mapaObrasVendidas)
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 6);

  // 3. Inventario valorizado y alertas de stock bajo
  let valorTotalInventario = 0;
  let totalUnidadesDisponibles = 0;
  const porTecnica = {};
  const alertasStockBajo = [];

  for (const o of obras) {
    const valorObra = o.precio * o.stock;
    valorTotalInventario += valorObra;
    totalUnidadesDisponibles += o.stock;

    if (!porTecnica[o.tecnica]) {
      porTecnica[o.tecnica] = { tecnica: o.tecnica, obras: 0, unidades: 0, valor: 0 };
    }
    porTecnica[o.tecnica].obras += 1;
    porTecnica[o.tecnica].unidades += o.stock;
    porTecnica[o.tecnica].valor += valorObra;

    if (o.stock <= o.stockMinimo) {
      alertasStockBajo.push({
        id: o.id,
        codigo: o.codigo,
        titulo: o.titulo,
        tecnica: o.tecnica,
        stock: o.stock,
        stockMinimo: o.stockMinimo,
        estado: o.estado,
      });
    }
  }

  // 4. PQR por estado
  const estadosBase = { Radicada: 0, "En trámite": 0, Resuelta: 0 };
  for (const item of pqrs) {
    estadosBase[item.estado] = (estadosBase[item.estado] || 0) + 1;
  }
  const pqrPorEstado = Object.entries(estadosBase).map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }));

  const ingresosTotales = pedidos.reduce((acc, p) => acc + p.total, 0);

  return {
    resumen: {
      totalObras: obras.length,
      obrasDisponibles: obras.filter((o) => o.estado === "Disponible" && o.stock > 0).length,
      totalUnidadesDisponibles,
      valorTotalInventario,
      totalPedidos: pedidos.length,
      ingresosTotales,
      totalPqrs: pqrs.length,
      alertasStockCount: alertasStockBajo.length,
      totalCursos: cursos.length,
      totalExposiciones: exposiciones.length,
    },
    ventasPorMes,
    obrasMasVendidas,
    inventarioValorizado: Object.values(porTecnica),
    alertasStockBajo,
    pqrPorEstado,
    ultimosMovimientos: movimientos,
  };
}

module.exports = {
  obtenerReportesDashboard,
};
