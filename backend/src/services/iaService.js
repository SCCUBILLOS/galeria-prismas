/**
 * Servicio del Asistente Curatorial "Prisma IA".
 * Cumple el punto 3A.j de la rúbrica:
 * - Consulta en tiempo real las obras disponibles en la base de datos SQLite.
 * - Si existe GEMINI_API_KEY en backend/.env, invoca la API REST de Google Gemini desde el backend
 *   (la clave nunca sale al navegador).
 * - Si no hay GEMINI_API_KEY (o si falla la red), responde con un motor recomendador local inteligente
 *   por reglas de presupuesto, técnica, estilo, tamaño y espacio del usuario.
 */
const prisma = require("../config/prisma");

function formatearCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

async function recomendarConReglasLocales(mensajeUsuario = "", obrasDisponibles = []) {
  const texto = String(mensajeUsuario).toLowerCase();

  // Detectar presupuesto aproximado mencionado en millones o miles
  let presupuestoMax = null;
  const matchMillones = texto.match(/(\d+(?:[.,]\d+)?)\s*millon/);
  const matchPrecioDirecto = texto.match(/(\d{1,2})\.?(\d{3})\.?(\d{3})/);

  if (matchMillones) {
    presupuestoMax = parseFloat(matchMillones[1].replace(",", ".")) * 1000000;
  } else if (matchPrecioDirecto) {
    presupuestoMax = parseInt(matchPrecioDirecto[1] + matchPrecioDirecto[2] + matchPrecioDirecto[3], 10);
  } else if (texto.includes("econom") || texto.includes("barat") || texto.includes("accesible")) {
    presupuestoMax = 1800000;
  }

  // Detectar técnica preferida
  const tecnicasDetectadas = [];
  if (texto.includes("oleo") || texto.includes("óleo") || texto.includes("pintura")) tecnicasDetectadas.push("Óleo");
  if (texto.includes("acrilico") || texto.includes("acrílico")) tecnicasDetectadas.push("Acrílico");
  if (texto.includes("escultura") || texto.includes("bronce") || texto.includes("piedra") || texto.includes("volumen"))
    tecnicasDetectadas.push("Escultura");
  if (texto.includes("foto") || texto.includes("blanco y negro") || texto.includes("paisaje"))
    tecnicasDetectadas.push("Fotografía");
  if (texto.includes("digital") || texto.includes("modern") || texto.includes("generativ"))
    tecnicasDetectadas.push("Digital");

  // Detectar tamaño o espacio
  let tamanoPreferido = null;
  if (texto.includes("peque") || texto.includes("apartamento") || texto.includes("escritorio") || texto.includes("habitacion")) {
    tamanoPreferido = "Pequeño";
  } else if (texto.includes("gran") || texto.includes("sala principal") || texto.includes("oficina") || texto.includes("recepcion")) {
    tamanoPreferido = "Grande";
  } else if (texto.includes("median") || texto.includes("comedor") || texto.includes("estudio")) {
    tamanoPreferido = "Mediano";
  }

  // Puntuar cada obra disponible
  const puntuadas = obrasDisponibles.map((obra) => {
    let puntos = 1;
    if (presupuestoMax && obra.precio <= presupuestoMax) puntos += 4;
    if (presupuestoMax && obra.precio > presupuestoMax) puntos -= 2;
    if (tecnicasDetectadas.includes(obra.tecnica)) puntos += 5;
    if (tamanoPreferido && obra.tamano === tamanoPreferido) puntos += 3;
    if (obra.destacada) puntos += 1;
    if (
      texto.includes("abstract") &&
      obra.estilo.toLowerCase().includes("abstract")
    ) {
      puntos += 3;
    }
    if (
      texto.includes("minimal") &&
      obra.estilo.toLowerCase().includes("minimal")
    ) {
      puntos += 3;
    }
    return { obra, puntos };
  });

  puntuadas.sort((a, b) => b.puntos - a.puntos || a.obra.precio - b.obra.precio);
  const sugeridas = puntuadas.slice(0, 3).map((item) => item.obra);

  let introduccion =
    "¡Hola! Soy **Prisma IA**, tu curador digital. Analicé el catálogo en tiempo real según tus preferencias";
  if (presupuestoMax) {
    introduccion += ` (presupuesto hasta ${formatearCOP(presupuestoMax)})`;
  }
  if (tecnicasDetectadas.length > 0) {
    introduccion += ` en técnica ${tecnicasDetectadas.join("/")}`;
  }
  introduccion += ". Estas 3 piezas disponibles encajan especialmente bien con tu búsqueda:";

  const listadoTexto = sugeridas
    .map(
      (o, idx) =>
        `${idx + 1}. **${o.titulo}** (${o.tecnica}, ${o.dimensiones}) de *${o.artista.nombre}* — **${formatearCOP(
          o.precio
        )}**. Ideal para: ${o.espacioSugerido}.`
    )
    .join("\n");

  return {
    origen: "Motor Curatorial Local (Fallback Activo)",
    respuesta: `${introduccion}\n\n${listadoTexto}\n\n¿Te gustaría filtrar por otro presupuesto o ver talleres de pintura?`,
    obrasRecomendadas: sugeridas.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      slug: o.slug,
      tecnica: o.tecnica,
      dimensiones: o.dimensiones,
      precio: o.precio,
      imagenUrl: o.imagenUrl,
      artista: o.artista.nombre,
    })),
  };
}

async function consultarAsistenteIA(mensaje = "") {
  const obrasDisponibles = await prisma.obra.findMany({
    where: { estado: "Disponible", stock: { gt: 0 } },
    include: { artista: true, categoria: true },
  });

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const baseRecomendacion = await recomendarConReglasLocales(mensaje, obrasDisponibles);

  if (!apiKey) {
    return baseRecomendacion;
  }

  try {
    const resumenCatalogo = obrasDisponibles
      .slice(0, 12)
      .map(
        (o) =>
          `- ${o.titulo} (slug: ${o.slug}, técnica: ${o.tecnica}, estilo: ${o.estilo}, tamaño: ${o.tamano}, precio: ${o.precio} COP, artista: ${o.artista.nombre}, espacio: ${o.espacioSugerido})`
      )
      .join("\n");

    const promptSistema = `Eres Prisma IA, el curador de arte de Galería Prismas en Bogotá, Colombia. Responde en español (Colombia), de forma breve, amable y experta. Recomienda entre 2 y 3 obras reales únicamente de esta lista:\n${resumenCatalogo}\n\nConsulta del visitante: ${mensaje}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptSistema }] }],
      }),
    });

    if (!response.ok) {
      return baseRecomendacion;
    }

    const data = await response.json();
    const textoGemini =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || baseRecomendacion.respuesta;

    return {
      origen: "Google Gemini API + Catálogo Prisma",
      respuesta: textoGemini,
      obrasRecomendadas: baseRecomendacion.obrasRecomendadas,
    };
  } catch (_err) {
    return baseRecomendacion;
  }
}

module.exports = {
  consultarAsistenteIA,
};
