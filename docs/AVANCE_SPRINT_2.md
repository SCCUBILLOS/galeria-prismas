# Informe de Entrega de Avance — Sprint 2 (Galería Prismas)

**Asignatura:** Programación Web y Arquitectura de Información  
**Universidad Libre — Sede Bogotá (2026-II)**  
**Roles en Sprint 2:**
- **Product Owner:** Brayan Gómez
- **Scrum Master:** Sara Cárdenas
- **Developer:** Nicolás Molina

---

## 1. Alcance Completado hasta el Sprint 2 (Hito Calificable de Avance 1)

En cumplimiento del plan de trabajo por fases (sección 9), al cierre del **Sprint 2** quedaron integrados y verificados los siguientes módulos funcionales:

1. **Monorepo Funcional con 1 Solo Comando (`npm run dev`):**
   - Levanta simultáneamente el Frontend React + Vite (`5173`), el Backend Express + Prisma + SQLite (`4000`) y la API Virtual de Desarrolladores en `json-server` (`5000`).
2. **Base de Datos SQLite + Prisma ORM + Semilla Realista (`seed.js`):**
   - 22 obras de arte catalogadas, 6 artistas con biografía, 5 cursos y talleres, 4 exposiciones, 5 categorías, 3 clientes, 3 proveedores y 1 usuario administrador (`admin@galeriaprismas.co`).
3. **Catálogo con Filtros Laterales, Ordenamiento, Favoritos y Carrito de Compras:**
   - Filtros combinables por técnica, estilo, tamaño, estado y rango de precio.
   - Marcado instantáneo de Favoritos con persistencia en `localStorage`.
   - Carrito de compras que respeta el stock disponible por obra, discrimina subtotal e IVA (19 %) e incluye la opción **"Deshacer"** al quitar un artículo.
4. **Panel de Administración con Login JWT y Reutilización del CRUD del Laboratorio IV:**
   - Autenticación con `jsonwebtoken` y `bcryptjs`.
   - Reutilización íntegra de `helpFetch.js`, `CrudApp.jsx`, `CrudForm.jsx`, `CrudTable.jsx`, `CrudTableRow.jsx`, `Loader.jsx` y `Message.jsx` (ubicados en `referencias/galeria-prismas-crud` y en `frontend/src/components/crud/`).
5. **Control de Stock e Inventario (`/admin/inventario`):**
   - Registro de movimientos de `ENTRADA`, `SALIDA` y `AJUSTE`, historial kardex y alertas automáticas de stock mínimo.
6. **API Virtual de Desarrolladores (`/equipo`):**
   - Conectada a `http://localhost:5000/desarrolladores` con CRUD completo y validación de celular colombiano (`^3\d{9}$`) y correo electrónico con expresiones regulares.
7. **Doble Validación de Datos (Frontend + Backend):**
   - Validación en tiempo real en formularios React y validación en el servidor con `express-validator` y algoritmo de Luhn.

---

## 2. Cómo Verificar este Avance

1. Ejecutar `npm run dev` en la raíz del proyecto.
2. Abrir `http://localhost:5173/obras` y probar los filtros laterales, favoritos y carrito.
3. Abrir `http://localhost:5173/equipo` y probar la edición/creación en la API virtual de desarrolladores.
4. Abrir `http://localhost:5173/admin/login`, ingresar con `admin@galeriaprismas.co` / `AdminPrismas2026*` y probar el CRUD administrativo y el módulo de inventario.
