# Arquitectura Técnica — Galería Prismas

**Autores:** Sara Cárdenas, Nicolás Molina, Brayan Gómez  
**Asignaturas:** Programación Web y Arquitectura de Información — Universidad Libre (2026-II)

---

## 1. Arquitectura Distribuida de 3 Servicios (Monorepo)

El sistema se ejecuta localmente con un único comando (`npm run dev`) orquestado por `concurrently`, levantando 3 servicios independientes:

1. **Frontend (`http://localhost:5173`):** SPA en React 18 + Vite + React Router 6 + Bootstrap 5 + Context API (`AppContext.jsx`).
2. **Backend Principal (`http://localhost:4000/api`):** API REST en Node.js + Express.js separada en capas (`routes/`, `controllers/`, `services/`, `middlewares/`, `validators/`), conectada a **SQLite** mediante **Prisma ORM**.
3. **API Virtual de Desarrolladores (`http://localhost:5000/desarrolladores`):** Servicio REST simulado con `json-server` consumido desde `/equipo` mediante el helper `helpFetch.js` y el CRUD genérico del Laboratorio IV.

```mermaid
flowchart LR
    subgraph Cliente["Navegador Web (Usuario / Administrador)"]
        UI["Frontend React 18 + Vite\nPuerto 5173\n(React Router + AppContext + Bootstrap 5)"]
    end

    subgraph BackendExpress["Backend Principal (Puerto 4000)"]
        Routes["Routes (/api/*)\nHelmet + CORS + RateLimit"]
        Validators["Validators\n(express-validator + Luhn + Regex)"]
        Auth["Auth Middleware\n(JWT + bcrypt)"]
        Controllers["Controllers\n(apiController.js)"]
        Services["Services\n(obras, checkout, ia, reportes)"]
        Prisma["Prisma Client ORM"]
        DB[("Base de Datos SQLite\nbackend/prisma/dev.db")]
    end

    subgraph ApiVirtual["API Virtual Lab IV (Puerto 5000)"]
        JsonServer["json-server\n(/desarrolladores)"]
        DbJson[("api-virtual/db.json")]
    end

    subgraph Externo["Servicio Opcional IA"]
        Gemini["Google Gemini API\n(Si existe GEMINI_API_KEY)"]
    end

    UI -->|"HTTP JSON (helpFetch.js)"| Routes
    UI -->|"CRUD /equipo (helpFetch.js)"| JsonServer
    JsonServer --> DbJson
    Routes --> Validators
    Validators --> Auth
    Auth --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB
    Services -.->|"Fallback automático a motor local si no hay API Key"| Gemini
```

---

## 2. Modelo Entidad-Relación de la Base de Datos (Prisma + SQLite)

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nombre
        string correo UK
        string passwordHash
        string rol
    }
    CATEGORIA {
        int id PK
        string nombre UK
        string slug UK
        string descripcion
    }
    ARTISTA {
        int id PK
        string nombre
        string slug UK
        string ciudad
        string pais
        string estilo
        string biografia
        string trayectoria
    }
    OBRA {
        int id PK
        string titulo
        string slug UK
        string codigo UK
        string tecnica
        string estilo
        string tamano
        string dimensiones
        int precio
        int stock
        int stockMinimo
        string estado
        int categoriaId FK
        int artistaId FK
    }
    MOVIMIENTO_INVENTARIO {
        int id PK
        int obraId FK
        string tipo
        int cantidad
        int stockAnterior
        int stockNuevo
        string motivo
        datetime fecha
    }
    EXPOSICION {
        int id PK
        string titulo
        string slug UK
        string estado
        string fechaInicio
        string fechaFin
        int cuposDisponibles
    }
    RESERVA_EXPOSICION {
        int id PK
        string codigoReserva UK
        int exposicionId FK
        string nombreAsistente
        string documento
        int cantidadEntradas
    }
    CURSO {
        int id PK
        string titulo
        string slug UK
        string nivel
        string modalidad
        string instructor
        int precio
        int cuposDisponibles
    }
    INSCRIPCION_CURSO {
        int id PK
        string codigoInscripcion UK
        int cursoId FK
        string nombreEstudiante
        string documento
    }
    CLIENTE {
        int id PK
        string nombre
        string documento UK
        string correo
        string celular
        string direccion
    }
    PEDIDO {
        int id PK
        string numeroFactura UK
        int clienteId FK
        string metodoPago
        int subtotal
        int iva
        int total
        datetime fecha
    }
    DETALLE_PEDIDO {
        int id PK
        int pedidoId FK
        int obraId FK
        int cantidad
        int precioUnitario
        int subtotal
    }
    PROVEEDOR {
        int id PK
        string nombre
        string nit UK
        string insumo
    }
    PQR {
        int id PK
        string radicado UK
        string tipo
        string asunto
        string estado
        string respuesta
    }

    CATEGORIA ||--o{ OBRA : clasifica
    ARTISTA ||--o{ OBRA : crea
    OBRA ||--o{ MOVIMIENTO_INVENTARIO : registra
    OBRA ||--o{ DETALLE_PEDIDO : incluye
    CLIENTE ||--o{ PEDIDO : realiza
    PEDIDO ||--|{ DETALLE_PEDIDO : contiene
    EXPOSICION ||--o{ RESERVA_EXPOSICION : recibe
    CURSO ||--o{ INSCRIPCION_CURSO : matricula
```

---

## 3. Diagrama de Secuencia del Flujo de Compra, Descuento de Stock y Facturación

```mermaid
sequenceDiagram
    autonumber
    actor C as Comprador (Carlos)
    participant FE as Frontend React (/checkout)
    participant VAL as Validadores (Regex + Luhn)
    participant API as Backend Express (/api/checkout)
    participant DB as SQLite (Transacción Prisma)

    C->>FE: Completa Paso 1 (Datos), Paso 2 (Envío) y Paso 3 (Pago)
    FE->>VAL: Valida celular (^3\d{9}$), correo, documento y algoritmo de Luhn
    alt Datos inválidos en Frontend
        VAL-->>FE: Muestra error junto al campo (.invalid-feedback)
    else Datos válidos
        FE->>API: POST /api/checkout (items, comprador, medio de pago)
        API->>API: Verifica express-validator + reglas de tarjeta (4242, 0002, 1111)
        alt Tarjeta rechazada (...0002) o sin fondos (...1111)
            API-->>FE: HTTP 402 Payment Required (Mensaje claro de rechazo)
            FE-->>C: Muestra alerta explicativa para cambiar medio de pago
        else Pago aprobado
            API->>DB: Inicia prisma.$transaction()
            DB->>DB: Verifica stock >= cantidad por cada obra
            DB->>DB: Descuenta stock (si llega a 0 cambia estado a "Vendida")
            DB->>DB: Crea registro en MovimientoInventario (tipo: SALIDA)
            DB->>DB: Crea/Actualiza Cliente y genera Pedido (FAC-2026-XXXX con IVA 19%)
            DB-->>API: Confirma transacción y retorna Pedido completo
            API-->>FE: HTTP 201 Created (Factura generada)
            FE->>FE: Vacía carrito en localStorage y redirige a /pedido/:id/factura
            FE-->>C: Muestra Factura Electrónica lista para Imprimir / Descargar PDF
        end
    end
```
