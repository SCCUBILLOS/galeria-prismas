/**
 * Configuración centralizada de Galería Prismas.
 * Incluye datos de contacto, ubicación de demostración, horarios y las 4 redes sociales oficiales.
 */
export const EMPRESA = {
  nombre: "Galería Prismas",
  eslogan: "Arte Contemporáneo, Exposiciones y Formación Artística",
  nit: "901.654.321-8",
  responsableDatos: "Galería Prismas S.A.S. — Dirección Curatorial y Académica",
  correoContacto: "contacto@galeriaprismas.co",
  correoPrivacidad: "protecciondatos@galeriaprismas.co",
  telefono: "+57 (601) 432 1000",
  whatsappNumero: "573000000000",
  whatsappUrl:
    "https://wa.me/573000000000?text=Hola%20Galer%C3%ADa%20Prismas%2C%20quisiera%20recibir%20asesor%C3%ADa%20sobre%20obras%2C%20exposiciones%20o%20talleres.",
  direccion: "Universidad Libre, Sede Bosque Popular, Carrera 70 # 53-40, Bogotá, Colombia",
  horario:
    "Martes a sábado de 10:00 a. m. a 7:00 p. m. | Domingos de 11:00 a. m. a 5:00 p. m. (Lunes cerrado por montaje)",
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Universidad+Libre+Sede+Bosque+Popular+Carrera+70+53-40+Bogota+Colombia&output=embed",
  redesSociales: [
    {
      nombre: "Instagram",
      usuario: "@galeriaprismas.co",
      url: "https://www.instagram.com/",
      icono: "bi-instagram",
      color: "#E1306C",
      ariaLabel: "Visitar Instagram oficial de Galería Prismas",
    },
    {
      nombre: "Facebook",
      usuario: "/GaleriaPrismasBogota",
      url: "https://www.facebook.com/",
      icono: "bi-facebook",
      color: "#1877F2",
      ariaLabel: "Visitar página de Facebook de Galería Prismas",
    },
    {
      nombre: "WhatsApp",
      usuario: "+57 300 000 0000",
      url: "https://wa.me/573000000000?text=Hola%20Galer%C3%ADa%20Prismas%2C%20quisiera%20recibir%20informaci%C3%B3n.",
      icono: "bi-whatsapp",
      color: "#25D366",
      ariaLabel: "Escribir por WhatsApp a Galería Prismas (número de demostración)",
    },
    {
      nombre: "LinkedIn",
      usuario: "Galería Prismas Colombia",
      url: "https://www.linkedin.com/",
      icono: "bi-linkedin",
      color: "#0A66C2",
      ariaLabel: "Visitar LinkedIn corporativo de Galería Prismas",
    },
    {
      nombre: "YouTube",
      usuario: "Galería Prismas TV",
      url: "https://www.youtube.com/",
      icono: "bi-youtube",
      color: "#FF0000",
      ariaLabel: "Visitar canal de YouTube de Galería Prismas",
    },
  ],
  apiBaseUrl: "http://localhost:4000/api",
  apiVirtualUrl: "http://localhost:5000/desarrolladores",
};

export function formatearMonedaCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

export function formatearFechaES(fechaStr) {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr.includes("T") ? fechaStr : `${fechaStr}T12:00:00`);
  if (isNaN(d.getTime())) return fechaStr;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
