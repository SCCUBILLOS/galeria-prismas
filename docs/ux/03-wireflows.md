# 03. Diseño de la Interacción y Wireflows — Galería Prismas

**Asignatura:** Arquitectura de Información ("Proyecto de Aula") — Peso: **15 %**  
**Autores:** Sara Cárdenas, Nicolás Molina, Brayan Gómez

---

## 1. Flujo 1: Añadir Obra a Favoritos
**Recorrido:** `Inicio (/) → Catálogo (/obras) → Filtros (técnica/precio) → Detalle de obra (/obras/detalle/:slug) → "Añadir a favoritos"` (el corazón cambia de estado al instante y actualiza el contador del header).

```mermaid
flowchart LR
    A["1. Inicio (/)\nExplora destacados o menú Obras"] --> B["2. Catálogo (/obras)\nAplica filtro Técnica: Óleo\ny Precio <= $4.0M"]
    B --> C["3. Detalle (/obras/detalle/:slug)\nRevisa dimensiones, stock y artista"]
    C --> D["4. Clic en 'Añadir a favoritos'\nCorazón cambia a rojo relleno\nToast de confirmación + Contador Header"]
    D --> E["5. Vista /favoritos\nObra persistida en localStorage"]
```

---

## 2. Flujo 2: Inscripción a Curso o Taller (Persona: Valeria)
**Recorrido:** `Inicio (/) → Cursos (/cursos) → Seleccionar curso → Ver horarios, contenido y materiales (/cursos/:id) → "Inscribirme" → Formulario → Confirmación`.

```mermaid
flowchart LR
    A["1. Inicio (/)\nClic en menú 'Cursos'"] --> B["2. Catálogo de Cursos (/cursos)\nFiltra Nivel: Principiante\nModalidad: Presencial"]
    B --> C["3. Detalle Curso (/cursos/1)\nLee horarios, kit de materiales\nincluido y bio de Valentina Restrepo"]
    C --> D["4. Formulario de Inscripción\nIngresa nombre, documento, correo,\ncelular y acepta Ley 1581"]
    D --> E["5. Confirmación Inmediata\nGenera código INS-2026-XXXX\ny descuenta 1 cupo en SQLite"]
```

---

## 3. Flujo 3: Reserva de Entradas a Exposición
**Recorrido:** `Inicio (/) → Exposiciones (/exposiciones) → Próximas / En curso → Seleccionar evento (/exposiciones/:id) → Fecha/hora → Confirmar entradas`.

```mermaid
flowchart LR
    A["1. Inicio (/)\nClic en 'Exposiciones'"] --> B["2. Agenda (/exposiciones)\nFiltra por 'En curso' o 'Próximo'\ny revisa calendario"]
    B --> C["3. Detalle (/exposiciones/1)\nRevisa curador, sala y cupos"]
    C --> D["4. Selección de Fecha y Hora\nElige fecha, franja horaria\ny número de entradas (1-10)"]
    D --> E["5. Confirmación de Reserva\nRecibe código RES-2026-XXXX\ny actualiza aforo disponible"]
```

---

## 4. Flujo 4: Compra de Obra y Facturación Electrónica (Persona: Carlos)
**Recorrido:** `Catálogo (/obras) → Detalle (/obras/detalle/:slug) → Agregar al carrito → Carrito (/carrito) → Checkout en 3 pasos (/checkout) → Pasarela ficticia → Factura PDF (/pedido/:id/factura)`.

```mermaid
flowchart LR
    A["1. Catálogo / Detalle\nClic en 'Agregar al carrito'\no 'Comprar ahora'"] --> B["2. Carrito (/carrito)\nAjusta cantidad (máx. stock)\nRevisa Subtotal + IVA 19%"]
    B --> C["3. Checkout Paso 1 y 2\nDatos del comprador y\ndirección de envío asegurado"]
    C --> D["4. Checkout Paso 3 (Pasarela)\nValida Luhn / Tarjeta aprobada\nTransacción Prisma descuenta stock"]
    D --> E["5. Factura (/pedido/:id/factura)\nConsecutivo FAC-2026-XXXX\nVista imprimible y descarga PDF"]
```

---

## 5. Wireframes de Fidelidad Media de las Pantallas Clave

### 5.1 Wireframe — Catálogo de Obras con Filtros Laterales (`/obras`)
```text
+-----------------------------------------------------------------------------------+
| [LOGO GALERÍA PRISMAS]   Inicio | Obras | Exposiciones | Cursos | Artistas | [🔍] ♥ 🛍️ |
+-----------------------------------------------------------------------------------+
| Inicio > Catálogo de Obras > Óleo                                  Ordenar: [▼]   |
+-----------------------+-----------------------------------------------------------+
| FILTRAR OBRAS [Limpiar| Mostrando 22 obras                   [Técnica: Óleo]      |
|                       | +-----------------+ +-----------------+ +---------------+ |
| Buscar: [___________] | | [Disp.] [Óleo] ♥| | [Disp.] [Acr.] ♥| | [Disp.][Esc.]♥| |
| Técnica:[Óleo      ▼] | |   IMAGEN OBRA   | |   IMAGEN OBRA   | |  IMAGEN OBRA  | |
| Estilo: [Todos     ▼] | | Atardecer Urbano| | Cartografía Dor.| | Equilibrio... | |
| Tamaño: [Todos     ▼] | | Por V. Restrepo | | Por M. Villamiz.| | Por S. Duarte | |
| Estado: [Disponible▼] | | $ 3.850.000 COP | | $ 3.200.000 COP | | $ 4.600.000   | |
| Precio: [====o----]   | | [Agregar][Ver]  | | [Agregar][Ver]  | | [Agregar][Ver]| |
+-----------------------+-----------------------------------------------------------+
```

### 5.2 Wireframe — Checkout en 3 Pasos (`/checkout`)
```text
+-----------------------------------------------------------------------------------+
| AVISO: Pasarela de demostración, no se procesan pagos reales.                     |
+-----------------------------------------------------------------------------------+
| [1. Datos del Comprador] ========> [2. Envío Asegurado] ========> [3. Pago]       |
+---------------------------------------------------+-------------------------------+
| PASO 3: MEDIO DE PAGO                             | RESUMEN DEL PEDIDO            |
| (•) Tarjeta Crédito/Débito  ( ) PSE  ( ) Nequi    | - Atardecer Urbano  $3.850.000|
|                                                   | Subtotal:           $3.850.000|
| [Usar Aprobada 4242] [Rechazada 0000] [Fondos 1111| IVA (19 %):           $731.500|
| Número Tarjeta (Luhn): [4242424242424242        ] | Envío asegurado:        $0 COP|
| Vencimiento (MM/AA):   [12/29]   CVV: [842]       | ----------------------------- |
| [x] Acepto Política de Tratamiento de Datos (1581)| TOTAL A PAGAR:      $4.581.500|
| [← Volver a envío]     [Pagar y emitir factura]   |                               |
+---------------------------------------------------+-------------------------------+
```
