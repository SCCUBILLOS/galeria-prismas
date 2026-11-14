# Guía de Sustentación (10 Minutos) y Preguntas Probables — Galería Prismas

**Asignaturas:** Programación Web y Arquitectura de Información — Universidad Libre (2026-II)  
**Integrantes:** Sara Cárdenas, Nicolás Molina, Brayan Gómez

---

## Parte 1: Guion Cronometrado de Demo en Vivo (10 Minutos)

Antes de entrar al salón o compartir pantalla, abre una sola terminal en la raíz del proyecto y ejecuta:
```bash
npm run dev
```
*(Este único comando verifica `.env`, aplica migraciones SQLite, siembra las 22 obras si está vacío y levanta Frontend en `:5173`, Backend en `:4000` y API Virtual en `:5000`).*

---

### Minutos 0:00 – 2:00 | Contexto UX, Arquitectura de Información y Navegación (Sara Cárdenas)
1. **Problema y Personas (0:45):** Explicar brevemente que los compradores casuales (**Carlos, 34 años**) abandonan galerías que ocultan precios o medidas, mientras que los estudiantes (**Valeria, 22 años**) necesitan horarios flexibles y saber qué materiales llevar antes de pagar.
2. **Inicio y Estándares (1:15):**
   - Mostrar en `http://localhost:5173/` el **Header sticky** con la separación clara de *Obras*, *Exposiciones*, *Cursos*, *Artistas* y *Nosotros*.
   - Demostrar el **Slider de 5 diapositivas publicitarias** y hacer clic en el botón **Pausar/Reanudar**.
   - Presionar la tecla `/` en el teclado para mostrar cómo se enfoca el **buscador global con autocompletado**, escribir `"Óleo"` y abrir `/buscar?q=Óleo` con los resultados agrupados en 4 categorías.
   - Abrir la barra flotante **Accesibilidad (WCAG 2.1)** abajo a la izquierda y activar *Aumentar texto*, *Alto contraste* y *Fuente para dislexia*.

---

### Minutos 2:00 – 5:30 | Flujos de Usuario, Carrito, Pasarela Luhn y Factura PDF (Nicolás Molina)
1. **Catálogo, Filtros y Favoritos (1:15):**
   - Ir a `/obras`, filtrar lateralmente por **Técnica: Óleo** y ordenar por precio.
   - Entrar al detalle de *"Atardecer Urbano en Monserrate"*, mostrar las **migas de pan** (`Inicio > Catálogo > Óleo > "Atardecer Urbano en Monserrate"`), las dimensiones, la reseña de Valentina Restrepo y las obras relacionadas.
   - Hacer clic en **Añadir a favoritos** (el corazón cambia de estado al instante y sube el contador del header).
2. **Carrito, Checkout y Pasarela Ficticia (1:30):**
   - Agregar una obra al carrito, ir a `/carrito`, quitarla y pulsar el botón **"Deshacer"** en el toast (Heurística #3 de Nielsen).
   - Avanzar a `/checkout` (mostrar el aviso de *Pasarela de demostración* y la barra de progreso en 3 pasos).
   - En el Paso 3, pulsar **"Usar Tarjeta Rechazada (...0002)"** para mostrar el manejo de error HTTP 402; luego pulsar **"Usar Tarjeta Aprobada (4242...4242)"**, marcar la casilla de **Ley 1581 de 2012** y confirmar el pago.
3. **Factura PDF, Cursos y Exposiciones (0:45):**
   - En `/pedido/:id/factura`, mostrar el consecutivo `FAC-2026-XXXX`, el IVA del 19 % discriminado y pulsar **Imprimir / Descargar Factura en PDF**.
   - Mostrar rápidamente `/cursos/1` (materiales, horario e inscripción de Valeria) y `/exposiciones/1` (reserva de entradas).

---

### Minutos 5:30 – 8:30 | API Virtual (`/equipo`), PQR, Prisma IA y Panel Admin (Brayan Gómez)
1. **API Virtual de Desarrolladores Lab IV (1:00):**
   - Ir a `/equipo` desde el footer. Explicar que consume `http://localhost:5000/desarrolladores` (`json-server`) con `helpFetch.js` y el mismo `CrudApp` del Laboratorio IV.
   - Editar en vivo un celular con un valor inválido (`123`) para demostrar el bloqueo por regex `^3\d{9}$`, y luego guardar un valor válido (`3001234567`).
2. **PQR e Inteligencia Artificial (1:00):**
   - En `/pqr`, consultar el radicado `PQR-2026-1001` y mostrar su respuesta.
   - Abrir el chat flotante **Prisma IA** y pulsar *"Menos de $2M"* o escribir *"Busco escultura para sala"*, explicando que consulta SQLite desde `/api/ia/chat` con fallback local garantizado.
3. **Panel Admin JWT, Inventario y Reportes (1:00):**
   - Entrar a `/admin/login` (`admin@galeriaprismas.co` / `AdminPrismas2026*`).
   - Mostrar las **4 gráficas gerenciales** en `/admin` (ventas por mes, obras más vendidas, inventario valorizado y PQR por estado).
   - En `/admin/inventario`, mostrar que el movimiento `SALIDA` de la compra recién hecha ya quedó registrado en el kardex.

---

### Minutos 8:30 – 10:00 | Cierre Técnico, Pruebas y Scrum (Todo el Equipo)
- Mostrar la rotación de roles Scrum en los 4 sprints (`docs/scrum/roles.md`) y la ejecución en verde de las pruebas automáticas (`npm test` con Jest + Supertest y Vitest).

---

## Parte 2: Preguntas Probables del Jurado sobre el Código y sus Respuestas

### 1. ¿Cómo reutilizaron exactamente el CRUD del Laboratorio IV tanto en `json-server` como en Express?
- **Respuesta:** Conservamos la arquitectura original de `helpFetch.js` (con `AbortController` y métodos `get`, `post`, `put`, `del`) y los componentes `CrudApp`, `CrudForm`, `CrudTable`, `CrudTableRow`, `Loader` y `Message` (en `frontend/src/components/crud/` y en `referencias/galeria-prismas-crud/`). Parametrizamos `CrudApp` con las props `endpoint`, `fields`, `columns` y `headers`. Así, en `/equipo` apunta a `http://localhost:5000/desarrolladores` (`json-server`), y en `/admin/:entidad` apunta a `http://localhost:4000/api/...` enviando el encabezado `Authorization: Bearer <token>`.

### 2. ¿Qué pasa si dos personas intentan comprar la última unidad de una obra al mismo tiempo, o cómo garantizan que el stock no quede negativo?
- **Respuesta:** En `backend/src/services/checkoutService.js` implementamos una transacción atómica de base de datos con `prisma.$transaction(async (tx) => { ... })`. Dentro de la transacción verificamos `obra.stock < cantidad`; si no alcanza, lanzamos un `AppError` con código HTTP `409 Conflict` y toda la operación hace *rollback*. Si alcanza, descontamos el stock, cambiamos `estado` a `"Vendida"` cuando el nuevo stock es `0`, insertamos el registro en `MovimientoInventario` (`SALIDA`) y emitimos la factura en una sola unidad atómica.

### 3. ¿Cómo se valida el algoritmo de Luhn y el celular colombiano en ambos lados?
- **Respuesta:** Aplicamos **doble validación** (`frontend/src/utils/validadores.js` y `backend/src/validators/commonValidators.js`). El celular colombiano se valida con la expresión regular `/^3\d{9}$/`. El algoritmo de Luhn recorre los dígitos de la tarjeta de derecha a izquierda, duplica cada segundo dígito, resta 9 si el resultado es mayor a 9, suma todos los dígitos y comprueba que `suma % 10 === 0`.

### 4. ¿Cómo está protegido el Asistente de IA para no exponer la API Key y no fallar si no hay internet o clave?
- **Respuesta:** La clave `GEMINI_API_KEY` solo se lee en el servidor (`backend/src/services/iaService.js`) desde `process.env.GEMINI_API_KEY`; jamás existe en el frontend. Además, el endpoint `POST /api/ia/chat` cuenta con un `express-rate-limit` de 25 peticiones por minuto y un motor recomendador local determinístico por reglas (presupuesto, técnica, tamaño y estilo sobre el catálogo real en SQLite) que actúa como *fallback* automático si `GEMINI_API_KEY` está vacía.

### 5. ¿Por qué eligieron el color dorado `#8A6516` para textos sobre fondo blanco?
- **Respuesta:** Un dorado claro convencional (como `#D4AF37`) tiene un ratio de contraste de apenas `2.1:1` sobre blanco (`#FFFFFF`), lo cual incumple el criterio **1.4.3 de WCAG 2.1 Nivel AA** (que exige mínimo `4.5:1` para texto normal). Ajustamos la variable CSS `--color-gold-text: #8a6516`, que alcanza un contraste de **`5.12:1`** sobre blanco, manteniendo la identidad elegante sin sacrificar legibilidad.
