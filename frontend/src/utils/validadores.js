/**
 * Validadores del frontend (punto 3A.p):
 * - Celular colombiano: ^3\d{9}$
 * - Correo electrónico con regex estándar
 * - Documento: solo numérico de 6 a 10 dígitos
 * - Nombres: solo letras y espacios
 * - Tarjeta: algoritmo de Luhn, fecha futura MM/AA y CVV de 3 o 4 dígitos
 */
export const REGEX_CELULAR_CO = /^3\d{9}$/;
export const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const REGEX_DOCUMENTO = /^\d{6,10}$/;
export const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{3,80}$/;
export const REGEX_CVV = /^\d{3,4}$/;

export function validarCelularColombiano(valor = "") {
  return REGEX_CELULAR_CO.test(String(valor).trim());
}

export function validarCorreo(valor = "") {
  return REGEX_CORREO.test(String(valor).trim());
}

export function validarDocumento(valor = "") {
  return REGEX_DOCUMENTO.test(String(valor).trim());
}

export function validarNombre(valor = "") {
  return REGEX_NOMBRE.test(String(valor).trim());
}

export function validarCVV(valor = "") {
  return REGEX_CVV.test(String(valor).trim());
}

export function validarLuhn(numeroTarjeta = "") {
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

export function validarFechaVencimientoFutura(vencimiento = "") {
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
