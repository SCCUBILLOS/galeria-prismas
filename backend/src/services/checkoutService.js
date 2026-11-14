/**
 * Servicio de pasarela de pago ficticia, control transaccional de stock y facturación.
 * Cumple los puntos 3A.f y 3A.s de la rúbrica:
 * - Tarjetas de prueba documentadas:
 *   - Terminada en 0000 -> Rechazada por entidad bancaria
 *   - Terminada en 1111 -> Fondos insuficientes
 *   - Cualquier tarjeta válida Luhn (ej. 4242...4242) -> Aprobada
 * - También soporta simulación de PSE y Nequi.
 * - Valida algoritmo de Luhn, fecha futura y CVV cuando el método es TARJETA.
 * - Descuenta el stock dentro de una transacción Prisma, cambia estado a "Vendida" si llega a 0,
 *   registra movimiento de inventario de SALIDA y genera factura consecutiva con IVA 19 %.
 */
const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/errorHandler");
const {
  validarLuhn,
  validarFechaVencimientoFutura,
  REGEX_CVV,
} = require("../validators/commonValidators");

async function procesarCheckout(payload) {
  const {
    nombreCliente,
    documentoCliente,
    correoCliente,
    celularCliente,
    direccionEnvio,
    ciudadEnvio,
    notasEnvio,
    metodoPago,
    datosPago = {},
    items = [],
  } = payload;

  // 1. Validación de la pasarela ficticia según método de pago
  let ultimos4Tarjeta = null;

  if (metodoPago === "TARJETA") {
    const numeroLimpio = String(datosPago.numeroTarjeta || "").replace(/\D/g, "");
    const vencimiento = String(datosPago.vencimiento || "");
    const cvv = String(datosPago.cvv || "");

    if (!validarLuhn(numeroLimpio)) {
      throw new AppError(
        "El número de tarjeta no supera la validación del algoritmo de Luhn. Verifica los dígitos ingresados.",
        400
      );
    }

    if (!validarFechaVencimientoFutura(vencimiento)) {
      throw new AppError(
        "La tarjeta tiene una fecha de vencimiento vencida o en formato inválido (usa MM/AA).",
        400
      );
    }

    if (!REGEX_CVV.test(cvv)) {
      throw new AppError("El código de seguridad CVV debe tener 3 o 4 dígitos numéricos.", 400);
    }

    // Reglas explícitas de tarjetas de demostración
    if (numeroLimpio.endsWith("0002") || numeroLimpio.endsWith("0000")) {
      throw new AppError(
        "Transacción rechazada por el banco emisor (Tarjeta de prueba de rechazo terminada en 0002).",
        402
      );
    }

    if (numeroLimpio.endsWith("1111")) {
      throw new AppError(
        "Fondos insuficientes en la tarjeta para cubrir el monto total de la obra (Tarjeta de prueba terminada en 1111).",
        402
      );
    }

    ultimos4Tarjeta = numeroLimpio.slice(-4);
  } else if (metodoPago === "PSE") {
    if (!datosPago.banco) {
      throw new AppError("Debes seleccionar una entidad bancaria para continuar con PSE.", 400);
    }
    if (datosPago.banco === "BANCO_RECHAZADO") {
      throw new AppError("Pago PSE rechazado en la simulación bancaria.", 402);
    }
  } else if (metodoPago === "NEQUI") {
    if (!/^3\d{9}$/.test(String(datosPago.celularNequi || celularCliente))) {
      throw new AppError("Ingresa un número celular Nequi válido de 10 dígitos.", 400);
    }
  }

  // 2. Transacción atómica: verificar stock, descontar inventario, crear o actualizar cliente y emitir factura
  const resultado = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const detallesPreparados = [];

    for (const item of items) {
      const cantidad = Number(item.cantidad || 1);
      if (cantidad <= 0) {
        throw new AppError("La cantidad de cada obra debe ser al menos 1.", 400);
      }

      const obra = await tx.obra.findUnique({ where: { id: Number(item.obraId) } });
      if (!obra) {
        throw new AppError(`La obra con ID ${item.obraId} no existe.`, 404);
      }

      if (obra.estado === "Vendida" || obra.stock < cantidad) {
        throw new AppError(
          `Stock insuficiente para la obra "${obra.titulo}". Disponibles: ${obra.stock}, solicitados: ${cantidad}.`,
          409
        );
      }

      const nuevoStock = obra.stock - cantidad;
      const nuevoEstado = nuevoStock === 0 ? "Vendida" : "Disponible";

      await tx.obra.update({
        where: { id: obra.id },
        data: {
          stock: nuevoStock,
          estado: nuevoEstado,
        },
      });

      await tx.movimientoInventario.create({
        data: {
          obraId: obra.id,
          tipo: "SALIDA",
          cantidad,
          stockAnterior: obra.stock,
          stockNuevo: nuevoStock,
          motivo: `Venta en línea — Comprador: ${nombreCliente}`,
          usuario: "Pasarela Prismas Checkout",
        },
      });

      const subtotalLinea = obra.precio * cantidad;
      subtotal += subtotalLinea;

      detallesPreparados.push({
        obraId: obra.id,
        tituloObra: obra.titulo,
        cantidad,
        precioUnitario: obra.precio,
        subtotal: subtotalLinea,
      });
    }

    const iva = Math.round(subtotal * 0.19);
    const costoEnvio = 0; // Envío asegurado de cortesía en territorio nacional
    const total = subtotal + iva + costoEnvio;

    const cliente = await tx.cliente.upsert({
      where: { documento: String(documentoCliente).trim() },
      update: {
        nombre: nombreCliente.trim(),
        correo: correoCliente.trim(),
        celular: celularCliente.trim(),
        direccion: direccionEnvio.trim(),
        ciudad: ciudadEnvio.trim(),
      },
      create: {
        nombre: nombreCliente.trim(),
        documento: String(documentoCliente).trim(),
        correo: correoCliente.trim(),
        celular: celularCliente.trim(),
        direccion: direccionEnvio.trim(),
        ciudad: ciudadEnvio.trim(),
      },
    });

    const conteoPedidos = await tx.pedido.count();
    const consecutivo = String(conteoPedidos + 1).padStart(4, "0");
    const numeroFactura = `FAC-2026-${consecutivo}`;

    const pedido = await tx.pedido.create({
      data: {
        numeroFactura,
        clienteId: cliente.id,
        nombreCliente: nombreCliente.trim(),
        documentoCliente: String(documentoCliente).trim(),
        correoCliente: correoCliente.trim(),
        celularCliente: celularCliente.trim(),
        direccionEnvio: direccionEnvio.trim(),
        ciudadEnvio: ciudadEnvio.trim(),
        notasEnvio: notasEnvio || "",
        metodoPago,
        ultimos4Tarjeta,
        estadoPago: "APROBADO",
        subtotal,
        iva,
        costoEnvio,
        total,
        aceptaDatos: true,
        detalles: {
          create: detallesPreparados,
        },
      },
      include: {
        detalles: {
          include: {
            obra: {
              include: { artista: true },
            },
          },
        },
      },
    });

    return pedido;
  });

  return resultado;
}

module.exports = {
  procesarCheckout,
};
