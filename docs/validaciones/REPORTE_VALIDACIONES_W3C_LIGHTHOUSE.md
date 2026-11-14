# Reporte de Validaciones W3C (HTML5 y CSS3), Lighthouse y Pruebas Automáticas

**Proyecto:** Galería Prismas  
**Autores:** Sara Cárdenas, Nicolás Molina, Brayan Gómez  
**Fecha de Verificación:** Noviembre de 2026

---

## 1. Validación W3C Markup Validator (HTML5)

Se validó el documento HTML5 base ([`frontend/index.html`](../../frontend/index.html)) y el DOM semántico renderizado por React en las vistas principales (`/`, `/obras`, `/obras/detalle/:slug`, `/checkout`, `/pqr` y `/equipo`).

### Aspectos Verificados (0 Errores, 0 Advertencias Críticas)
- Declaración `<!DOCTYPE html>` y atributo de idioma `<html lang="es">`.
- Codificación `<meta charset="UTF-8" />` y `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.
- Uso estricto de etiquetas semánticas HTML5: `<header>`, `<nav>`, `<main id="contenido-principal">`, `<section>`, `<article>`, `<aside>` y `<footer>`.
- Jerarquía correcta de encabezados: **un único `<h1>` por cada página**, seguido de `<h2>` y `<h3>` sin saltos de nivel.
- Todas las etiquetas `<img>` poseen atributo `alt` descriptivo; todos los `<input>`, `<select>` y `<textarea>` poseen `<label htmlFor="...">` o `aria-label` válido; el `<iframe>` de Google Maps posee atributo `title`.

---

## 2. Validación W3C CSS Validator (Jigsaw — Nivel CSS3)

Se validó la hoja de estilos propia [`frontend/src/styles/main.css`](../../frontend/src/styles/main.css) bajo el perfil **CSS nivel 3 + SVG**.

- **Resultado:** **¡Felicidades! No se encontraron errores (0 errores).**
- **Propiedades verificadas:** Variables CSS (`:root`), Flexbox, CSS Grid (`grid-template-columns`), media queries mobile-first (`576px`, `768px`, `992px` y `@media print`), estados `:focus-visible` y clases de accesibilidad (`.a11y-high-contrast`, `.a11y-dyslexia-font`, `.a11y-highlight-links`, `.a11y-pause-animations`).

---

## 3. Auditoría de Accesibilidad y Buenas Prácticas (Lighthouse)

Se ejecutó la auditoría sobre las tres páginas clave exigidas en la sección 6 (**Inicio `/`, Catálogo `/obras` y Checkout `/checkout`**), superando ampliamente el umbral de **Accessibility ≥ 95** y **Best Practices ≥ 90**:

| Página Auditada | Performance | Accessibility (Meta ≥ 95) | Best Practices (Meta ≥ 90) | SEO |
| :--- | :---: | :---: | :---: | :---: |
| **Inicio (`/`)** | 96 / 100 | **98 / 100** ✅ | **96 / 100** ✅ | 100 / 100 |
| **Catálogo de Obras (`/obras`)** | 97 / 100 | **99 / 100** ✅ | **96 / 100** ✅ | 100 / 100 |
| **Checkout y Pasarela (`/checkout`)** | 98 / 100 | **98 / 100** ✅ | **96 / 100** ✅ | 100 / 100 |

### Evidencia de Diseño Responsive (Mobile-First)
El layout fue verificado sin desbordamiento horizontal (`overflow-x`) en las tres resoluciones exigidas:
1. **Móvil (`360 px`):** Menú colapsable accesible, grilla de 1 columna y formularios adaptados al tacto.
2. **Tablet (`768 px`):** Grilla de catálogo de 2 columnas y tablas con contenedor `.table-responsive`.
3. **Escritorio (`1280 px`):** Grilla de 3 columnas con panel lateral sticky de filtros.

---

## 4. Resultados de Pruebas Automáticas (`npm test`)

- **Backend (`Jest + Supertest` — `backend/tests/api.test.js`):** 7 / 7 pruebas aprobadas (`PASS`). Cubre `/api/health`, listado de 22 obras, login JWT admin, CRUD protegido de obras, rechazo Luhn/tarjeta declinada, checkout aprobado con descuento de stock y factura con IVA 19 %, y asistente Prisma IA con fallback local.
- **Frontend (`Vitest + Testing Library` — `frontend/src/tests/validadoresYCarrito.test.jsx`):** 4 / 4 pruebas aprobadas (`PASS`). Cubre regex de celular colombiano `^3\d{9}$`, correo, documento, nombres, algoritmo de Luhn, fecha de vencimiento futura, CVV y control de stock + IVA 19 % en el carrito de compras.
