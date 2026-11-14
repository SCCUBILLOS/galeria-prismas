# Planificación de Sprints — Galería Prismas

El proyecto se ejecutó en **4 Sprints de 1 semana** bajo el marco ágil **Scrum**, con entregas calificables de avance en el **Sprint 2** y entrega final en el **Sprint 4**.

---

## Resumen de Velocidad por Sprint

| Sprint | Duración | Hito Académico | Historias Completadas | Puntos Fibonacci | Tag Git |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Sprint 1** | Semana 1 | Cimientos, Base de Datos, API y Catálogo Base | HU-01, HU-02, HU-03, HU-04, HU-06, HU-08, HU-09, HU-17, HU-18, HU-19, HU-30, HU-31 | **52 pts** | `sprint-1` |
| **Sprint 2** | Semana 2 | **Entrega de Avance 1** (Filtros, Carrito, Admin CRUD, Stock, API Virtual y Validaciones) | HU-05, HU-07, HU-20, HU-21, HU-22, HU-23, HU-24, HU-25 | **41 pts** | `sprint-2` |
| **Sprint 3** | Semana 3 | Checkout, Pasarela, Factura PDF, Exposiciones, Cursos, PQR, IA y Legal | HU-10, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16, HU-26, HU-27, HU-28, HU-29, HU-32, HU-33 | **54 pts** | `sprint-3` |
| **Sprint 4** | Semana 4 | **Entrega Final** (Accesibilidad WCAG 2.1, Reportes, Heurísticas, Pruebas y Documento Word) | HU-34, HU-35, HU-36 | **18 pts** | `sprint-4` |
| **TOTAL** | **4 Semanas** | **Proyecto Completo (Dos Rúbricas)** | **36 Historias de Usuario (HU-01 a HU-36)** | **165 pts** | — |

---

## Detalle de Cada Sprint

### Sprint 1 — Arquitectura Monorepo, Base de Datos y Catálogo Público
- **Objetivo del Sprint:** Construir el monorepo (`frontend`, `backend`, `api-virtual`), modelar la base de datos SQLite en Prisma con su semilla realista de 22 obras y 6 artistas, y desplegar la experiencia pública de Inicio (con slider de 5 imágenes), catálogo, detalle de obra, artistas, migas de pan y búsqueda global.
- **Historias incluidas:** HU-18 (8), HU-19 (8), HU-01 (5), HU-02 (3), HU-03 (5), HU-04 (5), HU-06 (5), HU-08 (3), HU-09 (3), HU-17 (2), HU-30 (3), HU-31 (2).
- **Entregable verificable:** Sitio navegable con datos reales desde SQLite y tag `sprint-1`.

### Sprint 2 — Entrega de Avance 1: Interacción Comercial, Inventario y CRUDs
- **Objetivo del Sprint:** Incorporar los filtros laterales combinables, el sistema de favoritos, el carrito con control de stock, el panel administrativo protegido con JWT reutilizando el CRUD genérico del Laboratorio IV, el kardex de inventario, la página `/equipo` conectada a `json-server` y las validaciones dobles con regex.
- **Historias incluidas:** HU-05 (5), HU-07 (3), HU-20 (5), HU-21 (5), HU-22 (8), HU-23 (5), HU-24 (5), HU-25 (5).
- **Entregable verificable:** Documento `docs/AVANCE_SPRINT_2.md` y tag `sprint-2`.

### Sprint 3 — Flujos Transaccionales, Eventos, Talleres, PQR e Inteligencia Artificial
- **Objetivo del Sprint:** Implementar el checkout en 3 pasos con pasarela ficticia (algoritmo de Luhn y tarjetas de prueba), facturación electrónica descargable en PDF, reserva de entradas a exposiciones, inscripción a cursos y talleres, radicación y consulta de PQR, asistente curatorial "Prisma IA" con fallback local, acordeón empresarial, mapa de Google Maps y política de tratamiento de datos (Ley 1581 de 2012).
- **Historias incluidas:** HU-10 (3), HU-11 (5), HU-12 (3), HU-13 (3), HU-14 (5), HU-15 (2), HU-16 (2), HU-26 (8), HU-27 (5), HU-28 (5), HU-29 (8), HU-32 (2), HU-33 (3).
- **Entregable verificable:** Los 4 flujos principales de usuario funcionando de punta a punta y tag `sprint-3`.

### Sprint 4 — Entrega Final: Accesibilidad, Reportes Gerenciales, Pruebas y Sustentación
- **Objetivo del Sprint:** Completar la barra de accesibilidad WCAG 2.1 AA, el dashboard administrativo con gráficas de ventas, obras más vendidas, inventario valorizado y PQR por estado, el centro de preguntas frecuentes, la verificación de las 10 heurísticas de Nielsen, las pruebas automáticas (Jest + Supertest y Vitest), la validación W3C/Lighthouse y la generación de `DOCUMENTO_FINAL.docx` y `CHECKLIST_RUBRICAS.md`.
- **Historias incluidas:** HU-34 (5), HU-35 (5), HU-36 (8).
- **Entregable verificable:** Repositorio completo con tag `sprint-4` listo para sustentación.
