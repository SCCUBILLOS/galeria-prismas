-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL DEFAULT 'bi-palette'
);

-- CreateTable
CREATE TABLE "Artista" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Colombia',
    "ciudad" TEXT NOT NULL DEFAULT 'Bogotá',
    "biografia" TEXT NOT NULL,
    "trayectoria" TEXT NOT NULL,
    "estilo" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "correo" TEXT,
    "destacado" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tecnica" TEXT NOT NULL,
    "estilo" TEXT NOT NULL,
    "tamano" TEXT NOT NULL,
    "dimensiones" TEXT NOT NULL,
    "anio" INTEGER NOT NULL DEFAULT 2026,
    "precio" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "stockMinimo" INTEGER NOT NULL DEFAULT 1,
    "esUnica" BOOLEAN NOT NULL DEFAULT true,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT NOT NULL,
    "historiaCuraduria" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "espacioSugerido" TEXT NOT NULL DEFAULT 'Sala principal o estudio',
    "categoriaId" INTEGER NOT NULL,
    "artistaId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Obra_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Obra_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "obraId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockAnterior" INTEGER NOT NULL,
    "stockNuevo" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "usuario" TEXT NOT NULL DEFAULT 'Administrador',
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoInventario_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exposicion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "curador" TEXT NOT NULL,
    "fechaInicio" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "sala" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cupoMaximo" INTEGER NOT NULL DEFAULT 80,
    "cuposDisponibles" INTEGER NOT NULL DEFAULT 80,
    "precioEntrada" INTEGER NOT NULL DEFAULT 0,
    "imagenUrl" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReservaExposicion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigoReserva" TEXT NOT NULL,
    "exposicionId" INTEGER NOT NULL,
    "nombreAsistente" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "fechaVisita" TEXT NOT NULL,
    "horaVisita" TEXT NOT NULL,
    "cantidadEntradas" INTEGER NOT NULL DEFAULT 1,
    "aceptaDatos" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReservaExposicion_exposicionId_fkey" FOREIGN KEY ("exposicionId") REFERENCES "Exposicion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tecnica" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "bioInstructor" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "duracion" TEXT NOT NULL,
    "fechaInicio" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "cuposTotales" INTEGER NOT NULL DEFAULT 15,
    "cuposDisponibles" INTEGER NOT NULL DEFAULT 15,
    "materiales" TEXT NOT NULL,
    "temario" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InscripcionCurso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigoInscripcion" TEXT NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "nombreEstudiante" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "experienciaPrevia" TEXT NOT NULL DEFAULT 'Ninguna',
    "motivacion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Confirmada',
    "aceptaDatos" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InscripcionCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Bogotá',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "insumo" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Bogotá',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroFactura" TEXT NOT NULL,
    "clienteId" INTEGER,
    "nombreCliente" TEXT NOT NULL,
    "documentoCliente" TEXT NOT NULL,
    "correoCliente" TEXT NOT NULL,
    "celularCliente" TEXT NOT NULL,
    "direccionEnvio" TEXT NOT NULL,
    "ciudadEnvio" TEXT NOT NULL,
    "notasEnvio" TEXT,
    "metodoPago" TEXT NOT NULL,
    "ultimos4Tarjeta" TEXT,
    "estadoPago" TEXT NOT NULL DEFAULT 'APROBADO',
    "subtotal" INTEGER NOT NULL,
    "iva" INTEGER NOT NULL,
    "costoEnvio" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "aceptaDatos" BOOLEAN NOT NULL DEFAULT true,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetallePedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "obraId" INTEGER NOT NULL,
    "tituloObra" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    CONSTRAINT "DetallePedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetallePedido_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pqr" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "radicado" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Radicada',
    "respuesta" TEXT,
    "fechaRespuesta" DATETIME,
    "aceptaDatos" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Artista_slug_key" ON "Artista"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Obra_slug_key" ON "Obra"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Obra_codigo_key" ON "Obra"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Exposicion_slug_key" ON "Exposicion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaExposicion_codigoReserva_key" ON "ReservaExposicion"("codigoReserva");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_slug_key" ON "Curso"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "InscripcionCurso_codigoInscripcion_key" ON "InscripcionCurso"("codigoInscripcion");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nit_key" ON "Proveedor"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numeroFactura_key" ON "Pedido"("numeroFactura");

-- CreateIndex
CREATE UNIQUE INDEX "Pqr_radicado_key" ON "Pqr"("radicado");
