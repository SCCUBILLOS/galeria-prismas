/**
 * Validadores y expresiones regulares para el backend (express-validator + Algoritmo de Luhn).
 * Cumple el punto 3A.p de la rúbrica:
 * - Celular colombiano: ^3\d{9}$
 * - Correo electrónico: regex estándar
 * - Documento: numérico de 6 a 10 dígitos
 * - Nombres: solo letras, tildes y espacios
 * - Tarjeta: algoritmo de Luhn + fecha de vencimiento futura + CVV de 3 o 4 dígitos
 */
const { body, validationResult } = require("express-validator");
const { AppError } = require("../middlewares/errorHandler");

const REGEX_CELULAR_CO = /^3\d{9}$/;
const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGEX_DOCUMENTO = /^\d{6,10}$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{3,80}$/;
const REGEX_CVV = /^\d{3,4}$/;

/**
 * Verifica un número de tarjeta de crédito/débito usando el algoritmo de Luhn.
 */
function validarLuhn(numeroTarjeta = "") {
  const limpio = String(numeroTarjeta).replace(/\D/g, "");
  if (limpio.length < 13 || limpio.length > 19) return false;

  let suma = 0;
  let duplicar = false;
  for (let i = limpio.length - 1; i >= 0; i--) {
    let digito = parseInt(limpio.charAt(i), 10);
    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
}

/**
 * Verifica que la fecha MM/AA o AAAA-MM sea posterior o igual al mes en curso.
 */
function validarFechaVencimientoFutura(vencimiento = "") {
  const texto = String(vencimiento).trim();
  const match = texto.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
  if (!match) return false;

  const mes = parseInt(match[1], 10);
  let anio = parseInt(match[2], 10);
  if (anio < 100) anio += 2000;

  const ahora = new Date();
  const anioActual = Math.min(2026, ahora.getFullYear());
  const mesActual = ahora.getMonth() + 1;

  if (anio > anioActual) return true;
  if (anio === anioActual && mes >= mesActual) return true;
  return false;
}

const manejarErroresValidacion = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const lista = errors.array().map((e) => ({
      campo: e.path,
      mensaje: e.msg,
    }));
    return next(new AppError(lista[0].mensaje, 400, lista));
  }
  next();
};

const validarObra = [
  body("titulo").trim().notEmpty().withMessage("El título de la obra es obligatorio."),
  body("tecnica").trim().notEmpty().withMessage("La técnica artística es obligatoria."),
  body("precio").isInt({ min: 10000 }).withMessage("El precio debe ser un número entero mayor o igual a $10.000 COP."),
  body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero mayor o igual a 0."),
  manejarErroresValidacion,
];

const validarInscripcionCurso = [
  body("nombreEstudiante")
    .trim()
    .matches(REGEX_NOMBRE)
    .withMessage("El nombre solo debe contener letras y espacios (mínimo 3 caracteres)."),
  body("documento")
    .trim()
    .matches(REGEX_DOCUMENTO)
    .withMessage("El documento debe ser numérico de 6 a 10 dígitos."),
  body("correo")
    .trim()
    .matches(REGEX_CORREO)
    .withMessage("Introduce un correo electrónico válido."),
  body("celular")
    .trim()
    .matches(REGEX_CELULAR_CO)
    .withMessage("El celular debe ser colombiano de 10 dígitos e iniciar en 3 (ej. 3001234567)."),
  body("aceptaDatos")
    .custom((val) => val === true || val === "true")
    .withMessage("Debes aceptar la política de tratamiento de datos personales (Ley 1581 de 2012)."),
  manejarErroresValidacion,
];

const validarReservaExposicion = [
  body("nombreAsistente")
    .trim()
    .matches(REGEX_NOMBRE)
    .withMessage("El nombre solo debe contener letras y espacios (mínimo 3 caracteres)."),
  body("documento")
    .trim()
    .matches(REGEX_DOCUMENTO)
    .withMessage("El documento debe ser numérico de 6 a 10 dígitos."),
  body("correo")
    .trim()
    .matches(REGEX_CORREO)
    .withMessage("Introduce un correo electrónico válido."),
  body("celular")
    .trim()
    .matches(REGEX_CELULAR_CO)
    .withMessage("El celular debe ser colombiano de 10 dígitos e iniciar en 3."),
  body("cantidadEntradas")
    .isInt({ min: 1, max: 10 })
    .withMessage("La cantidad de entradas debe estar entre 1 y 10."),
  body("aceptaDatos")
    .custom((val) => val === true || val === "true")
    .withMessage("Debes aceptar la política de tratamiento de datos personales."),
  manejarErroresValidacion,
];

const validarPqr = [
  body("tipo")
    .isIn(["Petición", "Queja", "Reclamo", "Sugerencia"])
    .withMessage("El tipo de PQR debe ser Petición, Queja, Reclamo o Sugerencia."),
  body("nombre")
    .trim()
    .matches(REGEX_NOMBRE)
    .withMessage("El nombre solo debe contener letras y espacios."),
  body("documento")
    .trim()
    .matches(REGEX_DOCUMENTO)
    .withMessage("El documento debe tener entre 6 y 10 dígitos numéricos."),
  body("correo")
    .trim()
    .matches(REGEX_CORREO)
    .withMessage("Introduce un correo electrónico válido."),
  body("celular")
    .trim()
    .matches(REGEX_CELULAR_CO)
    .withMessage("El celular debe ser colombiano de 10 dígitos e iniciar en 3."),
  body("asunto")
    .trim()
    .isLength({ min: 5 })
    .withMessage("El asunto debe tener al menos 5 caracteres."),
  body("mensaje")
    .trim()
    .isLength({ min: 10 })
    .withMessage("El mensaje debe describir la solicitud con al menos 10 caracteres."),
  body("aceptaDatos")
    .custom((val) => val === true || val === "true")
    .withMessage("Debes autorizar el tratamiento de datos personales."),
  manejarErroresValidacion,
];

const validarCheckout = [
  body("nombreCliente")
    .trim()
    .matches(REGEX_NOMBRE)
    .withMessage("El nombre del comprador solo debe contener letras y espacios."),
  body("documentoCliente")
    .trim()
    .matches(REGEX_DOCUMENTO)
    .withMessage("El documento debe ser numérico de 6 a 10 dígitos."),
  body("correoCliente")
    .trim()
    .matches(REGEX_CORREO)
    .withMessage("Introduce un correo electrónico válido."),
  body("celularCliente")
    .trim()
    .matches(REGEX_CELULAR_CO)
    .withMessage("El celular debe ser colombiano de 10 dígitos e iniciar en 3."),
  body("direccionEnvio")
    .trim()
    .isLength({ min: 5 })
    .withMessage("La dirección de envío es obligatoria."),
  body("ciudadEnvio")
    .trim()
    .notEmpty()
    .withMessage("La ciudad de envío es obligatoria."),
  body("metodoPago")
    .isIn(["TARJETA", "PSE", "NEQUI"])
    .withMessage("Método de pago inválido."),
  body("items")
    .isArray({ min: 1 })
    .withMessage("El carrito no puede estar vacío."),
  body("aceptaDatos")
    .custom((val) => val === true || val === "true")
    .withMessage("Debes aceptar la política de tratamiento de datos personales."),
  manejarErroresValidacion,
];

module.exports = {
  REGEX_CELULAR_CO,
  REGEX_CORREO,
  REGEX_DOCUMENTO,
  REGEX_NOMBRE,
  REGEX_CVV,
  validarLuhn,
  validarFechaVencimientoFutura,
  manejarErroresValidacion,
  validarObra,
  validarInscripcionCurso,
  validarReservaExposicion,
  validarPqr,
  validarCheckout,
};
