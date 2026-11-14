/**
 * Semilla (Seed) de datos realistas en español (Colombia) para Galería Prismas.
 * Incluye:
 * - 1 usuario administrador (admin@galeriaprismas.co / AdminPrismas2026*)
 * - 5 categorías de obras
 * - 6 artistas colombianos y latinoamericanos con biografía y trayectoria
 * - 22 obras de arte (pinturas al óleo y acrílico, esculturas, fotografía y arte digital)
 * - 4 exposiciones (Próximas, En curso y Finalizadas)
 * - 5 cursos y talleres con niveles, horarios, materiales y temario
 * - 3 clientes de prueba y 3 proveedores
 * - Pedidos históricos, movimientos de inventario y PQRs de ejemplo para reportes
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando siembra de datos en Galería Prismas...");

  // Limpiar tablas en orden seguro de llaves foráneas
  await prisma.detallePedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.movimientoInventario.deleteMany();
  await prisma.reservaExposicion.deleteMany();
  await prisma.inscripcionCurso.deleteMany();
  await prisma.pqr.deleteMany();
  await prisma.obra.deleteMany();
  await prisma.artista.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.exposicion.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. Usuario Administrador
  const passwordHash = await bcrypt.hash("AdminPrismas2026*", 10);
  await prisma.usuario.create({
    data: {
      nombre: "Sara Cárdenas — Dirección Curatorial",
      correo: "admin@galeriaprismas.co",
      passwordHash,
      rol: "ADMIN",
    },
  });

  // 2. Categorías
  const categoriasData = [
    {
      nombre: "Pinturas",
      slug: "pinturas",
      descripcion: "Obras originales en óleo, acrílico y técnicas mixtas sobre lienzo y madera.",
      icono: "bi-brush",
    },
    {
      nombre: "Esculturas",
      slug: "esculturas",
      descripcion: "Piezas tridimensionales en bronce, acero corten, cerámica y maderas nobles.",
      icono: "bi-box",
    },
    {
      nombre: "Fotografía",
      slug: "fotografia",
      descripcion: "Fotografía artística de autor impresa en papel algodón de archivo (edición limitada).",
      icono: "bi-camera",
    },
    {
      nombre: "Arte Digital",
      slug: "arte-digital",
      descripcion: "Ilustración generativa y composición digital impresa en Giclée numerado y firmado.",
      icono: "bi-cpu",
    },
    {
      nombre: "Novedades y Destacados",
      slug: "novedades",
      descripcion: "Selección curatorial de adquisiciones recientes y obras emblemáticas de la temporada.",
      icono: "bi-stars",
    },
  ];

  const categorias = {};
  for (const cat of categoriasData) {
    const creada = await prisma.categoria.create({ data: cat });
    categorias[cat.slug] = creada;
  }

  // 3. Artistas (6 artistas)
  const artistasData = [
    {
      nombre: "Valentina Restrepo",
      slug: "valentina-restrepo",
      pais: "Colombia",
      ciudad: "Medellín",
      estilo: "Expresionismo Contemporáneo",
      biografia:
        "Maestra en Artes Plásticas de la Universidad Nacional de Colombia. Su obra explora la memoria urbana de los Andes a través de empastes de óleo y veladuras cálidas con acentos minerales.",
      trayectoria:
        "14 años de trayectoria. Ganadora del Salón Joven de Pintura de Antioquia (2021) y expositora en ARTBO Sección Referentes (2024).",
      fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      correo: "v.restrepo@galeriaprismas.co",
      destacado: true,
    },
    {
      nombre: "Mateo Villamizar",
      slug: "mateo-villamizar",
      pais: "Colombia",
      ciudad: "Bogotá",
      estilo: "Abstracción Geométrica",
      biografia:
        "Arquitecto y pintor bogotano. Combina pigmentos acrílicos, pan de oro y trazos geométricos inspirados en la cartografía precolombina y el brutalismo moderno.",
      trayectoria:
        "Exposiciones individuales en Bogotá, Ciudad de México y Madrid. Docente invitado de composición cromática y teoría del color.",
      fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      correo: "m.villamizar@galeriaprismas.co",
      destacado: true,
    },
    {
      nombre: "Camila Obregón",
      slug: "camila-obregon",
      pais: "Colombia",
      ciudad: "Barranquilla",
      estilo: "Realismo Poético Caribe",
      biografia:
        "Pintora e investigadora visual del litoral Caribe. Trabaja la luz tropical, los reflejos del río Magdalena y la flora anfibia mediante óleo sobre lino belga.",
      trayectoria:
        "Becaria del Ministerio de Cultura (2022) y residente artística en Casa Wabi. Sus obras forman parte de colecciones privadas en Colombia y España.",
      fotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      correo: "c.obregon@galeriaprismas.co",
      destacado: true,
    },
    {
      nombre: "Sebastián Duarte",
      slug: "sebastian-duarte",
      pais: "Colombia",
      ciudad: "Barichara",
      estilo: "Escultura Orgánica y Constructivista",
      biografia:
        "Escultor especializado en piedra Barichara, bronce a la cera perdida y acero oxidado. Sus volúmenes buscan el equilibrio entre peso tectónico y ligereza espacial.",
      trayectoria:
        "Autor de 8 esculturas de formato público en Santander y Cundinamarca. Mención de honor en la Bienal de Escultura Contemporánea (2023).",
      fotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      correo: "s.duarte@galeriaprismas.co",
      destacado: true,
    },
    {
      nombre: "Lucía Mendoza",
      slug: "lucia-mendoza",
      pais: "Colombia",
      ciudad: "Cali",
      estilo: "Fotografía Documental y Paisaje",
      biografia:
        "Fotógrafa documental y artista visual. Retrata páramos altoandinos, neblinas del Pacífico y arquitecturas vernáculas en blanco y negro y cianotipia.",
      trayectoria:
        "Publicada en revistas internacionales de fotografía de autor. Curadora del Festival de la Imagen del Valle (2024).",
      fotoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
      correo: "l.mendoza@galeriaprismas.co",
      destacado: true,
    },
    {
      nombre: "Andrés Santamaría",
      slug: "andres-santamaria",
      pais: "Colombia",
      ciudad: "Bogotá",
      estilo: "Arte Generativo y Minimalismo",
      biografia:
        "Ingeniero de sonido y artista medial. Transforma frecuencias acústicas de bosques colombianos en cartografías visuales de alta precisión impresas en papel museo.",
      trayectoria:
        "Expositor en el Festival Internacional de la Imagen de Manizales y Voltaje Salón de Arte y Tecnología.",
      fotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
      correo: "a.santamaria@galeriaprismas.co",
      destacado: true,
    },
  ];

  const artistas = {};
  for (const art of artistasData) {
    const creado = await prisma.artista.create({ data: art });
    artistas[art.slug] = creado;
  }

  // 4. Obras de Arte (22 obras con datos completos)
  const obrasData = [
    {
      titulo: "Atardecer Urbano en Monserrate",
      slug: "atardecer-urbano-en-monserrate",
      codigo: "GP-OBR-001",
      tecnica: "Óleo",
      estilo: "Expresionista",
      tamano: "Grande",
      dimensiones: "100 x 120 cm",
      anio: 2026,
      precio: 3850000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Óleo sobre lienzo de lino que captura el tránsito de la luz dorada sobre los cerros orientales de Bogotá tras la lluvia vespertina.",
      historiaCuraduria:
        "Certificado de autenticidad firmado por Valentina Restrepo. Incluye bastidor en cedro inmunizado y marquetería flotante negra.",
      imagenUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Sala principal o recepción corporativa",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["valentina-restrepo"].id,
    },
    {
      titulo: "Cartografía Dorada del Altiplano",
      slug: "cartografia-dorada-del-altiplano",
      codigo: "GP-OBR-002",
      tecnica: "Acrílico",
      estilo: "Abstracto",
      tamano: "Grande",
      dimensiones: "90 x 110 cm",
      anio: 2026,
      precio: 3200000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Composición geométrica en acrílico y laminilla dorada sobre lienzo. Inspirada en los tejidos muiscas y la topografía de la sabana.",
      historiaCuraduria:
        "Obra exhibida en la muestra inaugural de la temporada 2026. Pieza única con barniz UV de conservación.",
      imagenUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Comedor moderno o estudio ejecutivo",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["mateo-villamizar"].id,
    },
    {
      titulo: "Bruma del Páramo de Sumapaz",
      slug: "bruma-del-paramo-de-sumapaz",
      codigo: "GP-OBR-003",
      tecnica: "Fotografía",
      estilo: "Contemporáneo",
      tamano: "Mediano",
      dimensiones: "60 x 90 cm",
      anio: 2025,
      precio: 1450000,
      stock: 5,
      stockMinimo: 2,
      esUnica: false,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Fotografía de autor en papel Hahnemühle Photo Rag 308g. Retrata frailejones centenarios emergiendo de la niebla matutina.",
      historiaCuraduria:
        "Edición limitada y numerada de 5 ejemplares firmados por Lucía Mendoza.",
      imagenUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Estudio de lectura o habitación principal",
      categoriaId: categorias["fotografia"].id,
      artistaId: artistas["lucia-mendoza"].id,
    },
    {
      titulo: "Equilibrio en Piedra Barichara",
      slug: "equilibrio-en-piedra-barichara",
      codigo: "GP-OBR-004",
      tecnica: "Escultura",
      estilo: "Minimalista",
      tamano: "Mediano",
      dimensiones: "45 x 30 x 28 cm",
      anio: 2026,
      precio: 4600000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Escultura tallada a mano en piedra arenisca amarilla de Barichara con ensamble en bronce patinado.",
      historiaCuraduria:
        "Pieza única tallada directamente por Sebastián Duarte. Incluye pedestal de roble macizo opcional.",
      imagenUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Consola de entrada o biblioteca",
      categoriaId: categorias["esculturas"].id,
      artistaId: artistas["sebastian-duarte"].id,
    },
    {
      titulo: "Reflejos de la Ciénaga Grande",
      slug: "reflejos-de-la-cienaga-grande",
      codigo: "GP-OBR-005",
      tecnica: "Óleo",
      estilo: "Realismo",
      tamano: "Grande",
      dimensiones: "85 x 115 cm",
      anio: 2026,
      precio: 3600000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Paisaje lumínico al óleo que retrata las aguas tranquilas y los manglares del Caribe colombiano al amanecer.",
      historiaCuraduria:
        "Obra seleccionada en curaduría de paisaje contemporáneo colombiano.",
      imagenUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Sala de estar iluminada",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["camila-obregon"].id,
    },
    {
      titulo: "Frecuencia Sonora del Chocó",
      slug: "frecuencia-sonora-del-choco",
      codigo: "GP-OBR-006",
      tecnica: "Digital",
      estilo: "Minimalista",
      tamano: "Mediano",
      dimensiones: "70 x 70 cm",
      anio: 2026,
      precio: 1250000,
      stock: 8,
      stockMinimo: 2,
      esUnica: false,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Arte generativo impreso en sistema Giclée de 12 tintas pigmentadas a partir de paisajes sonoros de la selva húmeda.",
      historiaCuraduria:
        "Edición seriada con sello seco de Galería Prismas y código QR del audio original.",
      imagenUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Oficina creativa o estudio musical",
      categoriaId: categorias["arte-digital"].id,
      artistaId: artistas["andres-santamaria"].id,
    },
    {
      titulo: "Memoria del Río Magdalena",
      slug: "memoria-del-rio-magdalena",
      codigo: "GP-OBR-007",
      tecnica: "Óleo",
      estilo: "Realismo",
      tamano: "Mediano",
      dimensiones: "70 x 90 cm",
      anio: 2025,
      precio: 2750000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Estudio pictórico de las chalupas y atarrayas al caer la tarde en Mompox, ejecutado con espátula y pincel fino.",
      historiaCuraduria:
        "Obra original sobre lino preparado artesanalmente.",
      imagenUrl: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Sala familiar o hall de acceso",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["camila-obregon"].id,
    },
    {
      titulo: "Trama Andina en Rojo Tierra",
      slug: "trama-andina-en-rojo-tierra",
      codigo: "GP-OBR-008",
      tecnica: "Acrílico",
      estilo: "Abstracto",
      tamano: "Mediano",
      dimensiones: "80 x 80 cm",
      anio: 2026,
      precio: 2400000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Acrílico texturizado con pigmentos naturales de Villa de Leyva y Ráquira sobre bastidor de galería.",
      historiaCuraduria:
        "Pertenece a la serie Tierra y Geometría (2026).",
      imagenUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Comedor o sala contemporánea",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["mateo-villamizar"].id,
    },
    {
      titulo: "Tótem de Viento y Acero",
      slug: "totem-de-viento-y-acero",
      codigo: "GP-OBR-009",
      tecnica: "Escultura",
      estilo: "Contemporáneo",
      tamano: "Grande",
      dimensiones: "110 x 35 x 35 cm",
      anio: 2025,
      precio: 5400000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Escultura vertical en acero corten plegado con pátina cálida estabilizada para interiores o terrazas cubiertas.",
      historiaCuraduria:
        "Obra única soldada y pulida en el taller de Barichara.",
      imagenUrl: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Terraza cubierta o doble altura",
      categoriaId: categorias["esculturas"].id,
      artistaId: artistas["sebastian-duarte"].id,
    },
    {
      titulo: "Silencio en la Candelaria",
      slug: "silencio-en-la-candelaria",
      codigo: "GP-OBR-010",
      tecnica: "Fotografía",
      estilo: "Realismo",
      tamano: "Pequeño",
      dimensiones: "40 x 60 cm",
      anio: 2026,
      precio: 980000,
      stock: 6,
      stockMinimo: 2,
      esUnica: false,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Contraluz matinal en las calles empedradas del centro histórico de Bogotá, impresa en papel baritado de museo.",
      historiaCuraduria:
        "Serie Crónicas de Agua y Piedra, edición numerada.",
      imagenUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Corredor o estudio",
      categoriaId: categorias["fotografia"].id,
      artistaId: artistas["lucia-mendoza"].id,
    },
    {
      titulo: "Nocturno en Chapinero Alto",
      slug: "nocturno-en-chapinero-alto",
      codigo: "GP-OBR-011",
      tecnica: "Óleo",
      estilo: "Expresionista",
      tamano: "Mediano",
      dimensiones: "75 x 95 cm",
      anio: 2026,
      precio: 2950000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Luces de ladrillo y asfalto húmedo trabajadas con pincelada suelta en tonos azul de Prusia y ocre dorado.",
      historiaCuraduria:
        "Incluye certificado de autenticidad y marco de madera tipo caja americana.",
      imagenUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Apartamento tipo loft o sala principal",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["valentina-restrepo"].id,
    },
    {
      titulo: "Prisma Solar N.º 4",
      slug: "prisma-solar-n-4",
      codigo: "GP-OBR-012",
      tecnica: "Digital",
      estilo: "Abstracto",
      tamano: "Mediano",
      dimensiones: "65 x 65 cm",
      anio: 2026,
      precio: 1180000,
      stock: 4,
      stockMinimo: 2,
      esUnica: false,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Descomposición algorítmica del espectro solar ecuatorial en líneas de alta densidad sobre papel algodón 100 %.",
      historiaCuraduria:
        "Edición limitada de 10 copias firmadas por Andrés Santamaría.",
      imagenUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Oficina moderna o sala minimalista",
      categoriaId: categorias["arte-digital"].id,
      artistaId: artistas["andres-santamaria"].id,
    },
    {
      titulo: "Semilla de Bronce Oxidado",
      slug: "semilla-de-bronce-oxidado",
      codigo: "GP-OBR-013",
      tecnica: "Escultura",
      estilo: "Minimalista",
      tamano: "Pequeño",
      dimensiones: "28 x 22 x 20 cm",
      anio: 2026,
      precio: 2800000,
      stock: 1,
      stockMinimo: 1,
      esUnica: false,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Fundición en bronce a la cera perdida con pátina verde esmeralda y cantos bruñidos al espejo.",
      historiaCuraduria:
        "Último ejemplar disponible de una serie de 3 fundiciones.",
      imagenUrl: "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Escritorio principal o repisa de diseño",
      categoriaId: categorias["esculturas"].id,
      artistaId: artistas["sebastian-duarte"].id,
    },
    {
      titulo: "Jardín Secreto del Cauca",
      slug: "jardin-secreto-del-cauca",
      codigo: "GP-OBR-014",
      tecnica: "Acrílico",
      estilo: "Contemporáneo",
      tamano: "Grande",
      dimensiones: "100 x 100 cm",
      anio: 2026,
      precio: 3400000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Interpretación botánica contemporánea de heliconias y orquídeas nativas sobre fondo neutro de lino crudo.",
      historiaCuraduria:
        "Destacado en la categoría de Novedades de la galería.",
      imagenUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Comedor principal o sala amplia",
      categoriaId: categorias["novedades"].id,
      artistaId: artistas["camila-obregon"].id,
    },
    {
      titulo: "Arquitectura del Silencio II",
      slug: "arquitectura-del-silencio-ii",
      codigo: "GP-OBR-015",
      tecnica: "Acrílico",
      estilo: "Minimalista",
      tamano: "Pequeño",
      dimensiones: "50 x 50 cm",
      anio: 2025,
      precio: 1650000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Planos superpuestos en blanco titanio, gris grafito y ocre sobre tabla entelada.",
      historiaCuraduria:
        "Ideal para coleccionistas que inician su acervo personal.",
      imagenUrl: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Estudio o habitación",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["mateo-villamizar"].id,
    },
    {
      titulo: "Pescadores de Taganga al Alba",
      slug: "pescadores-de-taganga-al-alba",
      codigo: "GP-OBR-016",
      tecnica: "Fotografía",
      estilo: "Realismo",
      tamano: "Grande",
      dimensiones: "80 x 120 cm",
      anio: 2025,
      precio: 1950000,
      stock: 3,
      stockMinimo: 1,
      esUnica: false,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Toma panorámica de formato medio con montaje en dibond de aluminio y acrílico antirreflejo.",
      historiaCuraduria:
        "Ganadora de mención en el Salón Nacional de Fotografía Documental.",
      imagenUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Sala de juntas o sala principal",
      categoriaId: categorias["fotografia"].id,
      artistaId: artistas["lucia-mendoza"].id,
    },
    {
      titulo: "Constelación Muisca",
      slug: "constelacion-muisca",
      codigo: "GP-OBR-017",
      tecnica: "Digital",
      estilo: "Contemporáneo",
      tamano: "Pequeño",
      dimensiones: "45 x 60 cm",
      anio: 2026,
      precio: 890000,
      stock: 10,
      stockMinimo: 3,
      esUnica: false,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Mapa estelar del solsticio en el observatorio de El Infiernito (Villa de Leyva), impreso con tintas minerales.",
      historiaCuraduria:
        "Incluye paspartú libre de ácido de 5 cm.",
      imagenUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Estudio, biblioteca o regalo de colección",
      categoriaId: categorias["arte-digital"].id,
      artistaId: artistas["andres-santamaria"].id,
    },
    {
      titulo: "Vértice en Madera de Guayacán",
      slug: "vertice-en-madera-de-guayacan",
      codigo: "GP-OBR-018",
      tecnica: "Escultura",
      estilo: "Abstracto",
      tamano: "Mediano",
      dimensiones: "55 x 25 x 25 cm",
      anio: 2026,
      precio: 3900000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Madera de guayacán recuperada de derribo natural, tallada y tratada con cera de abejas pura.",
      historiaCuraduria:
        "Pieza certificada de manejo forestal responsable.",
      imagenUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Sala de estar cálida",
      categoriaId: categorias["esculturas"].id,
      artistaId: artistas["sebastian-duarte"].id,
    },
    {
      titulo: "Cordillera Central en Azul Profundo",
      slug: "cordillera-central-en-azul-profundo",
      codigo: "GP-OBR-019",
      tecnica: "Óleo",
      estilo: "Expresionista",
      tamano: "Grande",
      dimensiones: "110 x 140 cm",
      anio: 2025,
      precio: 4900000,
      stock: 0,
      stockMinimo: 1,
      esUnica: true,
      estado: "Vendida",
      destacada: false,
      descripcion:
        "Díptico monumental al óleo sobre las cumbres nevadas del Parque Nacional Natural Los Nevados.",
      historiaCuraduria:
        "Adquirida para colección privada en Bogotá (Febrero 2026).",
      imagenUrl: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Muro principal de gran formato",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["valentina-restrepo"].id,
    },
    {
      titulo: "Horizonte de Sal en Manaure",
      slug: "horizonte-de-sal-en-manaure",
      codigo: "GP-OBR-020",
      tecnica: "Fotografía",
      estilo: "Minimalista",
      tamano: "Mediano",
      dimensiones: "60 x 90 cm",
      anio: 2026,
      precio: 1520000,
      stock: 4,
      stockMinimo: 2,
      esUnica: false,
      estado: "Disponible",
      destacada: true,
      descripcion:
        "Tonos rosados y blancos de las charcas de sal en La Guajira bajo el sol cenital.",
      historiaCuraduria:
        "Impresión Fine Art certificada de la colección Novedades 2026.",
      imagenUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Espacios minimalistas y luminosos",
      categoriaId: categorias["novedades"].id,
      artistaId: artistas["lucia-mendoza"].id,
    },
    {
      titulo: "Cosecha de Luz Cafetera",
      slug: "cosecha-de-luz-cafetera",
      codigo: "GP-OBR-021",
      tecnica: "Óleo",
      estilo: "Realismo",
      tamano: "Pequeño",
      dimensiones: "45 x 55 cm",
      anio: 2026,
      precio: 1850000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Obra intimista al óleo sobre las laderas verdes del Quindío entre cafetales y guaduales.",
      historiaCuraduria:
        "Pintada del natural durante residencia artística en Filandia.",
      imagenUrl: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Rincón de lectura o comedor",
      categoriaId: categorias["pinturas"].id,
      artistaId: artistas["valentina-restrepo"].id,
    },
    {
      titulo: "Estudio Geométrico en Ocre y Carbón",
      slug: "estudio-geometrico-en-ocre-y-carbon",
      codigo: "GP-OBR-022",
      tecnica: "Acrílico",
      estilo: "Abstracto",
      tamano: "Mediano",
      dimensiones: "70 x 70 cm",
      anio: 2026,
      precio: 2150000,
      stock: 1,
      stockMinimo: 1,
      esUnica: true,
      estado: "Disponible",
      destacada: false,
      descripcion:
        "Contraste de bloques mate en carbón mineral con líneas de pan de oro bruñido.",
      historiaCuraduria:
        "Obra enmarcada en roble ahumado lista para colgar.",
      imagenUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=80",
      espacioSugerido: "Sala contemporánea o despacho",
      categoriaId: categorias["novedades"].id,
      artistaId: artistas["mateo-villamizar"].id,
    },
  ];

  const obrasCreadas = [];
  for (const obra of obrasData) {
    const creada = await prisma.obra.create({ data: obra });
    obrasCreadas.push(creada);
    await prisma.movimientoInventario.create({
      data: {
        obraId: creada.id,
        tipo: "ENTRADA",
        cantidad: creada.stock > 0 ? creada.stock : 1,
        stockAnterior: 0,
        stockNuevo: creada.stock > 0 ? creada.stock : 1,
        motivo: "Ingreso inicial de catálogo curatorial 2026-II",
        usuario: "Sara Cárdenas (Curaduría)",
      },
    });
  }

  // 5. Exposiciones (4 exposiciones: En curso, Próximas y Finalizada)
  const exposicionesData = [
    {
      titulo: "Luz de los Andes: Nuevas Miradas del Paisaje",
      slug: "luz-de-los-andes-2026",
      subtitulo: "Pintura y fotografía contemporánea sobre la cordillera colombiana",
      descripcion:
        "Una travesía sensorial por las nieblas de páramo, los cerros tutelares y la transformación lumínica de nuestras montañas a través de 18 piezas inéditas.",
      curador: "Dra. Helena Morales — Curadora Invitada",
      fechaInicio: "2026-10-15",
      fechaFin: "2026-12-20",
      horario: "Martes a sábado: 10:00 a. m. – 7:00 p. m. | Domingos: 11:00 a. m. – 5:00 p. m.",
      sala: "Sala Principal Bosque Popular",
      estado: "En curso",
      cupoMaximo: 80,
      cuposDisponibles: 62,
      precioEntrada: 0,
      imagenUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80",
    },
    {
      titulo: "Materia y Geometría: Diálogos entre Piedra y Acero",
      slug: "materia-y-geometria-2026",
      subtitulo: "Retrospectiva escultórica y abstracción constructiva",
      descripcion:
        "Sebastián Duarte y Mateo Villamizar establecen un diálogo espacial entre volúmenes monolíticos de Barichara y planos geométricos dorados.",
      curador: "Sara Cárdenas — Dirección Curatorial",
      fechaInicio: "2026-11-25",
      fechaFin: "2027-01-30",
      horario: "Martes a sábado: 10:00 a. m. – 7:00 p. m.",
      sala: "Patio de Esculturas y Sala 2",
      estado: "Próximo",
      cupoMaximo: 60,
      cuposDisponibles: 55,
      precioEntrada: 0,
      imagenUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=80",
    },
    {
      titulo: "Cartografías Sonoras del Chocó Biogeográfico",
      slug: "cartografias-sonoras-choco",
      subtitulo: "Instalación inmersiva de arte digital y paisaje acústico",
      descripcion:
        "Experiencia multicanal donde los cantos de aves y lluvias del Pacífico se convierten en grabados generativos frente al espectador.",
      curador: "Andrés Santamaría & Colectivo Prisma Medial",
      fechaInicio: "2026-12-05",
      fechaFin: "2027-02-15",
      horario: "Jueves a domingo: 11:00 a. m. – 6:00 p. m.",
      sala: "Sala Multimedia Prisma Lab",
      estado: "Próximo",
      cupoMaximo: 40,
      cuposDisponibles: 38,
      precioEntrada: 15000,
      imagenUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1000&q=80",
    },
    {
      titulo: "Memorias Anfibias del Caribe",
      slug: "memorias-anfibias-del-caribe",
      subtitulo: "Óleos y crónicas visuales del río Magdalena y la Ciénaga",
      descripcion:
        "Muestra individual de Camila Obregón que reunió 24 lienzos sobre la arquitectura vernácula y los oficios ribereños.",
      curador: "Comité Curatorial Galería Prismas",
      fechaInicio: "2026-07-10",
      fechaFin: "2026-09-28",
      horario: "Exposición finalizada — Catálogo de archivo disponible",
      sala: "Sala Principal Bosque Popular",
      estado: "Finalizado",
      cupoMaximo: 80,
      cuposDisponibles: 0,
      precioEntrada: 0,
      imagenUrl: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const exposicionesCreadas = [];
  for (const exp of exposicionesData) {
    const creada = await prisma.exposicion.create({ data: exp });
    exposicionesCreadas.push(creada);
  }

  // 6. Cursos y Talleres (5 cursos pensados para la persona Valeria)
  const cursosData = [
    {
      titulo: "Fundamentos de Pintura al Óleo y Teoría del Color",
      slug: "fundamentos-pintura-oleo-teoria-color",
      tecnica: "Óleo",
      nivel: "Principiante",
      modalidad: "Presencial",
      instructor: "Valentina Restrepo",
      bioInstructor:
        "Maestra en Artes Plásticas (UNAL) con 14 años de experiencia artística y 8 años formando pintores desde nivel cero.",
      horario: "Sábados de 9:00 a. m. a 12:30 p. m.",
      duracion: "6 semanas (21 horas prácticas)",
      fechaInicio: "2026-11-28",
      precio: 380000,
      cuposTotales: 15,
      cuposDisponibles: 9,
      materiales:
        "Kit inicial incluido en la primera sesión: 5 tubos de óleo profesional (primarios + blanco + tierra), 3 pinceles de cerda suave, aceite de linaza sin olor y 2 lienzos de 30x40 cm. El estudiante solo debe traer delantal y libreta de bocetos.",
      temario:
        "Módulo 1: Preparación del soporte y manejo seguro de solventes sin olor. Módulo 2: Círculo cromático y mezclas de color reales. Módulo 3: Luz, sombra y volumen (claroscuro). Módulo 4: Empaste, veladuras y proyecto final guiado.",
      descripcion:
        "Ideal para estudiantes como Valeria que desean aprender óleo desde cero con acompañamiento paso a paso, horarios de fin de semana y materiales claros.",
      imagenUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
    },
    {
      titulo: "Acrílico Experimental, Texturas Minerales y Pan de Oro",
      slug: "acrilico-experimental-texturas-pan-de-oro",
      tecnica: "Acrílico",
      nivel: "Intermedio",
      modalidad: "Presencial",
      instructor: "Mateo Villamizar",
      bioInstructor:
        "Arquitecto y artista plástico especializado en abstracción geométrica y pigmentos minerales.",
      horario: "Martes y jueves de 6:00 p. m. a 8:00 p. m.",
      duracion: "4 semanas (16 horas)",
      fechaInicio: "2026-12-01",
      precio: 320000,
      cuposTotales: 12,
      cuposDisponibles: 7,
      materiales:
        "Espátulas metálicas, pasta de relieve acrílica, 4 colores acrílicos de alta viscosidad, bastidor de 50x50 cm y cuadernillo de hojilla dorada.",
      temario:
        "Módulo 1: Composición áurea y retículas. Módulo 2: Cargas minerales y pastas de relieve. Módulo 3: Aplicación de hojilla dorada y barnizado de conservación.",
      descripcion:
        "Taller vespertino para estudiantes y profesionales que buscan horarios flexibles entre semana y técnicas contemporáneas de abstracción.",
      imagenUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
    },
    {
      titulo: "Retrato Lumínico y Paisaje en Acuarela y Gouache",
      slug: "retrato-luminico-paisaje-acuarela-gouache",
      tecnica: "Acrílico",
      nivel: "Principiante",
      modalidad: "Virtual",
      instructor: "Camila Obregón",
      bioInstructor:
        "Pintora e ilustradora botánica, becaria del Ministerio de Cultura y residente en Casa Wabi.",
      horario: "Miércoles de 7:00 p. m. a 9:00 p. m. (En vivo + grabaciones)",
      duracion: "5 semanas (10 horas en vivo + tutoría)",
      fechaInicio: "2026-11-25",
      precio: 240000,
      cuposTotales: 20,
      cuposDisponibles: 14,
      materiales:
        "Block de papel algodón de 300 g (mínimo A4), set básico de acuarelas o gouache de 12 colores, pincel redondo #4 y #8, cinta de enmascarar.",
      temario:
        "Módulo 1: Control de humedad y degradados. Módulo 2: Paleta botánica tropical. Módulo 3: Atmósfera y reflejos en agua. Módulo 4: Composición final.",
      descripcion:
        "Modalidad 100 % virtual con sesiones grabadas para quienes requieren máxima flexibilidad de horario sin desplazarse.",
      imagenUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    },
    {
      titulo: "Modelado Escultórico en Arcilla y Vaciado Básico",
      slug: "modelado-escultorico-arcilla-vaciado",
      tecnica: "Escultura",
      nivel: "Principiante",
      modalidad: "Presencial",
      instructor: "Sebastián Duarte",
      bioInstructor:
        "Escultor monumental con 15 años de experiencia en talla directa, cerámica y fundición.",
      horario: "Sábados de 2:00 p. m. a 5:30 p. m.",
      duracion: "4 semanas (14 horas)",
      fechaInicio: "2026-12-05",
      precio: 410000,
      cuposTotales: 10,
      cuposDisponibles: 6,
      materiales:
        "La galería suministra 10 kg de arcilla terracota, torneta de trabajo, estecas de madera y quema en horno cerámico de la pieza final.",
      temario:
        "Módulo 1: Estructura interna y proporciones. Módulo 2: Modelado orgánico y constructivo. Módulo 3: Ahuecado y texturas. Módulo 4: Acabados y pátinas en frío.",
      descripcion:
        "Aprende volumen tridimensional en el patio-taller de la galería con todos los insumos pesados incluidos.",
      imagenUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80",
    },
    {
      titulo: "Fotografía de Autor, Iluminación Natural y Curaduría de Portafolio",
      slug: "fotografia-autor-iluminacion-portafolio",
      tecnica: "Fotografía",
      nivel: "Avanzado",
      modalidad: "Presencial",
      instructor: "Lucía Mendoza",
      bioInstructor:
        "Fotógrafa documental y curadora del Festival de la Imagen del Valle.",
      horario: "Domingos de 10:00 a. m. a 1:00 p. m.",
      duracion: "4 semanas (12 horas)",
      fechaInicio: "2026-11-29",
      precio: 350000,
      cuposTotales: 12,
      cuposDisponibles: 8,
      materiales:
        "Cámara réflex o mirrorless (o teléfono móvil con modo RAW manual), trípode opcional y selección de 10 fotografías propias para revisión curatorial.",
      temario:
        "Módulo 1: Narrativa visual y ensayo fotográfico. Módulo 2: Medición puntual y luz natural. Módulo 3: Revelado digital para impresión Fine Art. Módulo 4: Montaje y statement de artista.",
      descripcion:
        "Dirigido a fotógrafos y artistas visuales que desean preparar su serie para convocatorias y exposiciones en galería.",
      imagenUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const cursosCreados = [];
  for (const cur of cursosData) {
    const creado = await prisma.curso.create({ data: cur });
    cursosCreados.push(creado);
  }

  // 7. Clientes de prueba (incluyendo a Carlos y Valeria de la investigación UX)
  const clientesData = [
    {
      nombre: "Carlos Andrés Mendoza",
      documento: "1020765432",
      correo: "carlos.mendoza@coleccionista.co",
      celular: "3154829103",
      direccion: "Carrera 11 # 84-42 Apto 502",
      ciudad: "Bogotá",
    },
    {
      nombre: "Valeria Sofía Castellanos",
      documento: "1032984512",
      correo: "valeria.castellanos@estudiante.edu.co",
      celular: "3108472910",
      direccion: "Calle 53 # 71-18",
      ciudad: "Bogotá",
    },
    {
      nombre: "Alejandro Pineda Vargas",
      documento: "79845120",
      correo: "a.pineda@arquitectura.co",
      celular: "3209184756",
      direccion: "Avenida El Poblado # 10-45",
      ciudad: "Medellín",
    },
  ];

  const clientesCreados = [];
  for (const cli of clientesData) {
    const creado = await prisma.cliente.create({ data: cli });
    clientesCreados.push(creado);
  }

  // 8. Proveedores
  await prisma.proveedor.createMany({
    data: [
      {
        nombre: "Marquetería y Conservación Museo S.A.S.",
        nit: "9004821931",
        contacto: "Hernando Quintero",
        correo: "contacto@marqueteriamuseo.co",
        celular: "3114567890",
        insumo: "Marcos en cedro y vidrio con filtro UV de museo",
        ciudad: "Bogotá",
      },
      {
        nombre: "Papeles y Lienzos Bellas Artes Colombia",
        nit: "8301928374",
        contacto: "Patricia Gómez",
        correo: "ventas@lienzosbellasartes.co",
        celular: "3147891234",
        insumo: "Lienzos de lino belga, papel Hahnemühle y pigmentos",
        ciudad: "Bogotá",
      },
      {
        nombre: "Logística de Arte Segura Ltda.",
        nit: "9012384756",
        contacto: "Camilo Rincón",
        correo: "operaciones@logisticaarte.co",
        celular: "3186549870",
        insumo: "Embalaje climatizado y transporte de obras de arte",
        ciudad: "Medellín",
      },
    ],
  });

  // 9. Pedidos de ejemplo (para que las gráficas de ventas por mes y obras más vendidas tengan datos ricos desde el primer arranque)
  const pedido1Subtotal = 4900000;
  const pedido1Iva = Math.round(pedido1Subtotal * 0.19);
  await prisma.pedido.create({
    data: {
      numeroFactura: "FAC-2026-0001",
      clienteId: clientesCreados[0].id,
      nombreCliente: clientesCreados[0].nombre,
      documentoCliente: clientesCreados[0].documento,
      correoCliente: clientesCreados[0].correo,
      celularCliente: clientesCreados[0].celular,
      direccionEnvio: clientesCreados[0].direccion,
      ciudadEnvio: clientesCreados[0].ciudad,
      notasEnvio: "Entregar en portería con certificado de autenticidad en sobre lacrado.",
      metodoPago: "TARJETA",
      ultimos4Tarjeta: "4242",
      estadoPago: "APROBADO",
      subtotal: pedido1Subtotal,
      iva: pedido1Iva,
      costoEnvio: 0,
      total: pedido1Subtotal + pedido1Iva,
      fecha: new Date("2026-09-18T14:30:00Z"),
      detalles: {
        create: [
          {
            obraId: obrasCreadas[18].id, // Cordillera Central en Azul Profundo
            tituloObra: obrasCreadas[18].titulo,
            cantidad: 1,
            precioUnitario: 4900000,
            subtotal: 4900000,
          },
        ],
      },
    },
  });

  const pedido2Subtotal = 1450000 + 1250000;
  const pedido2Iva = Math.round(pedido2Subtotal * 0.19);
  await prisma.pedido.create({
    data: {
      numeroFactura: "FAC-2026-0002",
      clienteId: clientesCreados[2].id,
      nombreCliente: clientesCreados[2].nombre,
      documentoCliente: clientesCreados[2].documento,
      correoCliente: clientesCreados[2].correo,
      celularCliente: clientesCreados[2].celular,
      direccionEnvio: clientesCreados[2].direccion,
      ciudadEnvio: clientesCreados[2].ciudad,
      notasEnvio: "Despacho asegurado a Medellín.",
      metodoPago: "PSE",
      ultimos4Tarjeta: null,
      estadoPago: "APROBADO",
      subtotal: pedido2Subtotal,
      iva: pedido2Iva,
      costoEnvio: 0,
      total: pedido2Subtotal + pedido2Iva,
      fecha: new Date("2026-10-12T16:15:00Z"),
      detalles: {
        create: [
          {
            obraId: obrasCreadas[2].id, // Bruma del Páramo de Sumapaz
            tituloObra: obrasCreadas[2].titulo,
            cantidad: 1,
            precioUnitario: 1450000,
            subtotal: 1450000,
          },
          {
            obraId: obrasCreadas[5].id, // Frecuencia Sonora del Chocó
            tituloObra: obrasCreadas[5].titulo,
            cantidad: 1,
            precioUnitario: 1250000,
            subtotal: 1250000,
          },
        ],
      },
    },
  });

  const pedido3Subtotal = 1780000;
  const pedido3Iva = Math.round(pedido3Subtotal * 0.19);
  await prisma.pedido.create({
    data: {
      numeroFactura: "FAC-2026-0003",
      clienteId: clientesCreados[0].id,
      nombreCliente: clientesCreados[0].nombre,
      documentoCliente: clientesCreados[0].documento,
      correoCliente: clientesCreados[0].correo,
      celularCliente: clientesCreados[0].celular,
      direccionEnvio: clientesCreados[0].direccion,
      ciudadEnvio: clientesCreados[0].ciudad,
      notasEnvio: "Compra de dos grabados para estudio.",
      metodoPago: "NEQUI",
      ultimos4Tarjeta: null,
      estadoPago: "APROBADO",
      subtotal: pedido3Subtotal,
      iva: pedido3Iva,
      costoEnvio: 0,
      total: pedido3Subtotal + pedido3Iva,
      fecha: new Date("2026-11-04T11:20:00Z"),
      detalles: {
        create: [
          {
            obraId: obrasCreadas[16].id, // Constelación Muisca
            tituloObra: obrasCreadas[16].titulo,
            cantidad: 2,
            precioUnitario: 890000,
            subtotal: 1780000,
          },
        ],
      },
    },
  });

  // 10. Inscripción y reserva inicial
  await prisma.inscripcionCurso.create({
    data: {
      codigoInscripcion: "INS-2026-001",
      cursoId: cursosCreados[0].id,
      nombreEstudiante: "Valeria Sofía Castellanos",
      documento: "1032984512",
      correo: "valeria.castellanos@estudiante.edu.co",
      celular: "3108472910",
      experienciaPrevia: "Principiante — he practicado dibujo en grafito",
      motivacion: "Quiero aprender mezcla de color en óleo con horarios de sábado.",
      estado: "Confirmada",
      aceptaDatos: true,
    },
  });

  await prisma.reservaExposicion.create({
    data: {
      codigoReserva: "RES-2026-001",
      exposicionId: exposicionesCreadas[0].id,
      nombreAsistente: "Carlos Andrés Mendoza",
      documento: "1020765432",
      correo: "carlos.mendoza@coleccionista.co",
      celular: "3154829103",
      fechaVisita: "2026-11-21",
      horaVisita: "11:00 a. m.",
      cantidadEntradas: 2,
      aceptaDatos: true,
    },
  });

  // 11. PQRs de ejemplo en los 3 estados (Radicada, En trámite, Resuelta)
  await prisma.pqr.createMany({
    data: [
      {
        radicado: "PQR-2026-1001",
        tipo: "Petición",
        nombre: "Carlos Andrés Mendoza",
        documento: "1020765432",
        correo: "carlos.mendoza@coleccionista.co",
        celular: "3154829103",
        asunto: "Solicitud de dossier de alta resolución de Valentina Restrepo",
        mensaje:
          "Buen día, quisiera recibir información sobre el marco incluido en la obra Atardecer Urbano en Monserrate.",
        estado: "Resuelta",
        respuesta:
          "Estimado Carlos: hemos enviado a su correo el certificado técnico. La obra incluye marquetería flotante en cedro negro lista para instalación.",
        fechaRespuesta: new Date("2026-11-05T15:00:00Z"),
        aceptaDatos: true,
      },
      {
        radicado: "PQR-2026-1002",
        tipo: "Sugerencia",
        nombre: "Valeria Sofía Castellanos",
        documento: "1032984512",
        correo: "valeria.castellanos@estudiante.edu.co",
        celular: "3108472910",
        asunto: "Abrir grupo dominical para el taller de acuarela botánica",
        mensaje:
          "Me encantaría que el taller de Camila Obregón tuviera también una sesión presencial un domingo al mes.",
        estado: "En trámite",
        respuesta:
          "Tu sugerencia fue remitida al comité académico para programar una sesión práctica en diciembre.",
        fechaRespuesta: null,
        aceptaDatos: true,
      },
      {
        radicado: "PQR-2026-1003",
        tipo: "Reclamo",
        nombre: "Alejandro Pineda Vargas",
        documento: "79845120",
        correo: "a.pineda@arquitectura.co",
        celular: "3209184756",
        asunto: "Actualización de guía de transporte hacia Medellín",
        mensaje:
          "Solicito el número de guía actualizado de la transportadora especializada para mi pedido FAC-2026-0002.",
        estado: "Radicada",
        respuesta: null,
        fechaRespuesta: null,
        aceptaDatos: true,
      },
    ],
  });

  console.log("✅ Semilla completada exitosamente: 22 obras, 6 artistas, 5 cursos, 4 exposiciones, 3 clientes, 3 proveedores, 3 pedidos y 3 PQRs.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
