# 04. Evaluación Heurística (Nielsen), Accesibilidad WCAG 2.1 y Lighthouse

**Asignaturas:** Programación Web (punto 3A.v) y Arquitectura de Información (punto 3B — Pruebas de usabilidad, 10 %)  
**Autores:** Sara Cárdenas, Nicolás Molina, Brayan Gómez

---

## 1. Evaluación de las 10 Heurísticas de Usabilidad de Jakob Nielsen

Escala de severidad de problemas de usabilidad de Nielsen:
- **0:** No es un problema de usabilidad (Cumplimiento óptimo).
- **1:** Problema cosmético.
- **2:** Problema menor.
- **3:** Problema mayor.
- **4:** Catástrofe de usabilidad.

| # | Heurística de Nielsen | Estado / Severidad | Cómo se Implementa en Galería Prismas | Pantalla / Archivo de Evidencia |
| :---: | :--- | :---: | :--- | :--- |
| **H1** | **Visibilidad del estado del sistema** | ✅ Cumple (Severidad 0) | Spinners accesibles (`Loader.jsx`), notificaciones toast al agregar al carrito o favoritos, corazón que cambia de estado al instante, contador dinámico en el header y barra de progreso en 3 pasos en el checkout. | `/`, `/obras`, `/checkout` (`AppContext.jsx`, `FloatingWidgets.jsx`) |
| **H2** | **Relación entre el sistema y el mundo real** | ✅ Cumple (Severidad 0) | Lenguaje curatorial en español de Colombia (técnica, bastidor, curaduría, formato), moneda en pesos colombianos (`Intl.NumberFormat('es-CO')`) y fechas formateadas en español. | `/obras/detalle/:slug`, `/exposiciones` (`empresa.js`) |
| **H3** | **Control y libertad del usuario** | ✅ Cumple (Severidad 0) | Migas de pan en todas las vistas internas, botón **"Deshacer"** en el toast al quitar una obra del carrito, botón "Limpiar / Cancelar" en todos los formularios CRUD, desmarcar favoritos y navegación entre pasos en `/checkout`. | `/carrito`, `/checkout`, `/equipo` (`AppContext.jsx`, `CrudForm.jsx`) |
| **H4** | **Consistencia y estándares** | ✅ Cumple (Severidad 0) | Uso unificado de `ObraCard.jsx` en Inicio, Catálogo, Favoritos, Artistas y Búsqueda; botones CTA `.btn-gold` consistentes y convenciones estándar de comercio electrónico. | Todo el sitio (`ObraCard.jsx`, `main.css`) |
| **H5** | **Prevención de errores** | ✅ Cumple (Severidad 0) | Validación en tiempo real antes de enviar, diálogo de confirmación antes de eliminar registros o vaciar el carrito, selector de cantidad bloqueado al stock máximo de la obra y botón deshabilitado cuando una obra está `Vendida`. | `/carrito`, `/admin/*`, `/equipo` (`CrudApp.jsx`, `FavoritosCarritoPages.jsx`) |
| **H6** | **Reconocer antes que recordar** | ✅ Cumple (Severidad 0) | Chips visibles con los filtros activos en el catálogo, sección "Obras que consultaste recientemente" en Inicio, autocompletado en el buscador global y botones de búsquedas sugeridas en `/buscar`. | `/`, `/obras`, `/buscar` (`HomePage.jsx`, `CatalogoObrasPage.jsx`) |
| **H7** | **Flexibilidad y eficiencia de uso** | ✅ Cumple (Severidad 0) | Atajo de teclado `/` para enfocar el buscador desde cualquier página, botón "Comprar ahora" para ir directo al checkout, filtros combinables, ordenamiento y botones de 1 clic para cargar tarjetas de prueba en el checkout. | `Header.jsx`, `ObraCard.jsx`, `CheckoutFacturaPages.jsx` |
| **H8** | **Diseño estético y minimalista** | ✅ Cumple (Severidad 0) | Paleta neutra blanco/negro/marfil (`#FFFFFF`, `#F7F6F2`, `#141414`) con acentos dorados (`#8A6516`) que ceden todo el protagonismo visual a las fotografías de las obras. | `frontend/src/styles/main.css` |
| **H9** | **Ayudar a reconocer, diagnosticar y recuperarse de errores** | ✅ Cumple (Severidad 0) | Mensajes de error específicos junto a cada campo ("El celular debe ser colombiano de 10 dígitos e iniciar en 3"), explicación clara de rechazos de pago (Luhn, fondos insuficientes, tarjeta rechazada) y página 404 con enlaces útiles. | `/checkout`, `/pqr`, `/*` (`PqrLegalFaqSearch404Pages.jsx`) |
| **H10** | **Ayuda y documentación** | ✅ Cumple (Severidad 0) | Centro de Preguntas Frecuentes (`/preguntas-frecuentes`), indicaciones de tarjetas de prueba en el checkout y asistente conversacional "Prisma IA" disponible en todo momento. | `/preguntas-frecuentes`, `FloatingWidgets.jsx` |

---

## 2. Evaluación de Accesibilidad Web WCAG 2.1 (Nivel AA)

| Principio WCAG 2.1 | Criterio Evaluado | Cumplimiento en Galería Prismas |
| :--- | :--- | :--- |
| **1. Perceptible** | **1.1.1 Contenido no textual:** Todas las imágenes de obras, artistas, slider y logotipo tienen atributo `alt` descriptivo.<br>**1.4.3 Contraste mínimo (AA):** Texto principal `#141414` sobre `#FFFFFF` (ratio **18.5:1**). Dorado de texto `#8A6516` sobre `#FFFFFF` (ratio **5.12:1**, superior al mínimo de 4.5:1). Botones `.btn-gold` (`#6B4E10` con texto `#FFFFFF`, ratio **7.4:1**). | ✅ Cumple AA / AAA |
| **2. Operable** | **2.1.1 Teclado:** Todo el sitio es navegable con `Tab`, `Shift+Tab`, `Enter` y `Escape`.<br>**2.2.2 Pausar, detener, ocultar:** El slider de Inicio tiene botón explícito "Pausar/Reanudar" y el panel de accesibilidad incluye "Pausar animaciones".<br>**2.4.1 Evitar bloques:** Enlace `.skip-link` ("Saltar al contenido principal") al inicio del `Header`.<br>**2.4.7 Foco visible:** Contorno `outline: 3px solid #8a6516` en todos los elementos interactivos. | ✅ Cumple AA |
| **3. Comprensible** | **3.1.1 Idioma de la página:** `<html lang="es">` en `frontend/index.html`.<br>**3.3.1 y 3.3.2 Identificación de errores y etiquetas:** Todos los `<input>` y `<select>` tienen `<label htmlFor="...">` asociado y retroalimentación `.invalid-feedback`. | ✅ Cumple AA |
| **4. Robusto** | **4.1.2 Nombre, función, valor (ARIA):** Atributos `aria-label`, `aria-expanded`, `aria-pressed`, `role="status"` y `role="alert"` en modales, paneles flotantes, carrusel y botones de iconos. | ✅ Cumple AA |

---

## 3. Barra de Accesibilidad Persistente (7 Herramientas)
Disponible desde el botón flotante inferior izquierdo (**Accesibilidad**):
1. **Aumentar texto (`A+`):** Escala progresiva hasta 130 %.
2. **Disminuir texto (`A-`):** Escala hasta 90 %.
3. **Alto contraste:** Invierte la interfaz a negro puro (`#000000`) con texto blanco (`#FFFFFF`) y acentos amarillo de alta visibilidad (`#FFD700`).
4. **Fuente legible para dislexia:** Cambia la tipografía a sans-serif de alta legibilidad con mayor espaciado entre letras (`0.04em`), palabras (`0.12em`) e interlineado (`1.8`).
5. **Resaltar enlaces:** Subraya con grosor reforzado y fondo destacado todos los hipervínculos.
6. **Pausar animaciones:** Detiene transiciones CSS y la rotación automática del slider.
7. **Restablecer valores:** Restaura la configuración original y sincroniza en `localStorage`.
