/**
 * Generador de ilustraciones artísticas SVG de alta definición para Galería Prismas.
 * Cada imagen se diseña específicamente para representar el título, la técnica,
 * la paleta cromática y los elementos visuales descritos en cada obra, exposición y curso.
 */
const fs = require("fs");
const path = require("path");

const PUBLIC_IMG_DIR = path.join(__dirname, "../../frontend/public/imagenes");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Envuelve el lienzo artístico dentro de un marco museográfico acorde a la técnica
 * con placa curatorial inferior que muestra el título, técnica y artista.
 */
function wrapMuseumCanvas({
  codigo,
  titulo,
  artista,
  tecnica,
  bgGradient,
  innerArtworkSvg,
  frameColor = "#1b1b1b",
  matColor = "#f7f4ee",
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" width="900" height="700" role="img" aria-label="${escapeXml(titulo)} — ${escapeXml(artista)}">
  <defs>
    ${bgGradient}
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
    <filter id="canvasTex" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="1.2" result="light">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
      <feBlend in="SourceGraphic" in2="light" mode="multiply"/>
    </filter>
    <linearGradient id="goldFrame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#8A6516"/>
      <stop offset="100%" stop-color="#5A400C"/>
    </linearGradient>
  </defs>

  <!-- Pared de galería con iluminación cenital -->
  <rect width="900" height="700" fill="#eae5dc"/>
  <radialGradient id="wallSpot" cx="50%" cy="38%" r="65%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#dcd5c9" stop-opacity="0.95"/>
  </radialGradient>
  <rect width="900" height="700" fill="url(#wallSpot)"/>

  <!-- Marco museográfico exterior -->
  <g filter="url(#shadow)">
    <rect x="65" y="36" width="770" height="554" rx="4" fill="${frameColor}" stroke="url(#goldFrame)" stroke-width="4"/>
    <!-- Paspartú / Bisel interior -->
    <rect x="85" y="56" width="730" height="514" fill="${matColor}" stroke="#d2cabb" stroke-width="2"/>
    <!-- Lienzo principal de la obra -->
    <svg x="105" y="74" width="690" height="478" viewBox="0 0 690 478">
      <rect width="690" height="478" fill="url(#bg)"/>
      ${innerArtworkSvg}
      <!-- Firma sutil en esquina del lienzo -->
      <text x="672" y="464" font-family="Georgia, serif" font-size="12" font-style="italic" fill="rgba(255,255,255,0.75)" text-anchor="end">${escapeXml(artista)}</text>
    </svg>
  </g>

  <!-- Placa curatorial de museo -->
  <g transform="translate(180, 610)">
    <rect width="540" height="68" rx="6" fill="#181818" stroke="#8A6516" stroke-width="1.8"/>
    <text x="270" y="27" font-family="Georgia, 'Playfair Display', serif" font-size="19" font-weight="bold" fill="#F7F5F0" text-anchor="middle">${escapeXml(titulo)}</text>
    <text x="270" y="50" font-family="'Inter', Arial, sans-serif" font-size="13" fill="#D4AF37" text-anchor="middle">${escapeXml(artista)}  ·  ${escapeXml(tecnica)}  ·  ${escapeXml(codigo)}</text>
  </g>
</svg>`;
}

const obrasSvgSpecs = [
  {
    file: "GP-OBR-001.svg",
    codigo: "GP-OBR-001",
    titulo: "Atardecer Urbano en Monserrate",
    artista: "Valentina Restrepo",
    tecnica: "Óleo sobre lino (100 x 120 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c1654"/>
      <stop offset="35%" stop-color="#b83b5e"/>
      <stop offset="68%" stop-color="#f08a5d"/>
      <stop offset="100%" stop-color="#f9ed69"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Sol dorado poniéndose tras la sabana -->
      <circle cx="210" cy="215" r="78" fill="#ffd166" opacity="0.88"/>
      <circle cx="210" cy="215" r="115" fill="#f77f00" opacity="0.28"/>
      <!-- Pinceladas de nubes al óleo -->
      <path d="M40 110 Q180 75 330 115 T640 95" stroke="#ffbe0b" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.45"/>
      <path d="M90 155 Q260 130 430 160 T670 140" stroke="#fb5607" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.4"/>
      <!-- Cerros Orientales y Cerro de Monserrate -->
      <path d="M0 360 L120 290 L240 315 L395 190 L485 150 L575 235 L690 210 L690 478 L0 478 Z" fill="#2b193d"/>
      <path d="M350 220 L485 150 L610 245 L690 220 L690 478 L310 478 Z" fill="#1d1128"/>
      <!-- Santuario Blanco de Monserrate en la cumbre (x=485, y=150) -->
      <g transform="translate(465, 118)">
        <rect x="6" y="16" width="28" height="18" fill="#fff8e7"/>
        <polygon points="4,16 20,4 36,16" fill="#e6ccb2"/>
        <rect x="16" y="0" width="8" height="16" fill="#ffffff"/>
        <line x1="20" y1="-9" x2="20" y2="2" stroke="#ffd166" stroke-width="2.5"/>
        <line x1="16" y1="-5" x2="24" y2="-5" stroke="#ffd166" stroke-width="2.5"/>
      </g>
      <!-- Línea del teleférico hacia Monserrate -->
      <line x1="290" y1="365" x2="470" y2="152" stroke="#ffd166" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.75"/>
      <rect x="378" y="252" width="10" height="8" rx="2" fill="#ffbe0b"/>
      <!-- Silueta urbana de Bogotá con luces encendiéndose -->
      <g fill="#12091c">
        <rect x="20" y="340" width="45" height="138"/>
        <rect x="72" y="310" width="52" height="168"/>
        <rect x="132" y="352" width="40" height="126"/>
        <rect x="180" y="295" width="58" height="183"/>
        <rect x="245" y="335" width="48" height="143"/>
        <rect x="300" y="365" width="65" height="113"/>
      </g>
      <!-- Ventanas iluminadas y reflejos dorados de lluvia -->
      <g fill="#ffd166" opacity="0.85">
        <rect x="82" y="325" width="6" height="9"/><rect x="98" y="345" width="6" height="9"/><rect x="82" y="370" width="6" height="9"/>
        <rect x="192" y="310" width="8" height="10"/><rect x="210" y="310" width="8" height="10"/><rect x="192" y="335" width="8" height="10"/><rect x="210" y="360" width="8" height="10"/>
        <rect x="258" y="350" width="7" height="7"/><rect x="272" y="375" width="7" height="7"/>
      </g>
    `,
  },
  {
    file: "GP-OBR-002.svg",
    codigo: "GP-OBR-002",
    titulo: "Cartografía Dorada del Altiplano",
    artista: "Mateo Villamizar",
    tecnica: "Acrílico y laminilla dorada (90 x 110 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Retícula cartográfica precolombina en pan de oro -->
      <g stroke="#D4AF37" fill="none" opacity="0.85">
        <circle cx="345" cy="239" r="185" stroke-width="3"/>
        <circle cx="345" cy="239" r="145" stroke-width="1.5" stroke-dasharray="10,6"/>
        <circle cx="345" cy="239" r="105" stroke-width="2.5"/>
        <circle cx="345" cy="239" r="62" stroke-width="4"/>
        <circle cx="345" cy="239" r="22" fill="#D4AF37"/>
        <line x1="40" y1="239" x2="650" y2="239" stroke-width="1.5"/>
        <line x1="345" y1="20" x2="345" y2="458" stroke-width="1.5"/>
        <line x1="130" y1="60" x2="560" y2="418" stroke-width="1" stroke-dasharray="5,5"/>
        <line x1="560" y1="60" x2="130" y2="418" stroke-width="1" stroke-dasharray="5,5"/>
      </g>
      <!-- Bloques geométricos constructivistas y tejidos muiscas -->
      <polygon points="345,54 495,239 345,424 195,239" fill="none" stroke="#F3E5AB" stroke-width="3.5"/>
      <rect x="85" y="85" width="110" height="110" fill="#8A6516" opacity="0.55" stroke="#D4AF37" stroke-width="2"/>
      <rect x="495" y="280" width="115" height="115" fill="#b45309" opacity="0.45" stroke="#F3E5AB" stroke-width="2"/>
      <path d="M85 360 L195 360 L195 415 L140 415 L140 388 L85 388 Z" fill="#D4AF37" opacity="0.8"/>
      <path d="M495 95 L605 95 L605 150 L550 150 L550 120 L495 120 Z" fill="#D4AF37" opacity="0.8"/>
    `,
  },
  {
    file: "GP-OBR-003.svg",
    codigo: "GP-OBR-003",
    titulo: "Bruma del Páramo de Sumapaz",
    artista: "Lucía Mendoza",
    tecnica: "Fotografía Fine Art (60 x 90 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cfd8dc"/>
      <stop offset="45%" stop-color="#90a4ae"/>
      <stop offset="80%" stop-color="#455a64"/>
      <stop offset="100%" stop-color="#1c262b"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Montañas altoandinas entre neblina -->
      <path d="M0 240 Q170 165 340 220 T690 190 L690 478 L0 478 Z" fill="#607d8b" opacity="0.6"/>
      <path d="M0 295 Q230 230 450 280 T690 265 L690 478 L0 478 Z" fill="#37474f" opacity="0.8"/>
      <!-- Capas de bruma matinal -->
      <rect x="0" y="215" width="690" height="45" fill="#eceff1" opacity="0.45"/>
      <rect x="0" y="275" width="690" height="35" fill="#cfd8dc" opacity="0.38"/>
      <!-- Laguna del páramo -->
      <ellipse cx="350" cy="420" rx="290" ry="42" fill="#78909c" opacity="0.55"/>
      <!-- Frailejones centenarios (Espeletia) característicos de Sumapaz -->
      <g transform="translate(170, 225)">
        <rect x="24" y="65" width="16" height="145" rx="6" fill="#263238"/>
        <circle cx="32" cy="55" r="38" fill="#78909c"/>
        <g stroke="#cfd8dc" stroke-width="4" stroke-linecap="round">
          <line x1="32" y1="55" x2="32" y2="12"/><line x1="32" y1="55" x2="5" y2="25"/><line x1="32" y1="55" x2="60" y2="25"/>
          <line x1="32" y1="55" x2="-4" y2="52"/><line x1="32" y1="55" x2="68" y2="52"/><line x1="32" y1="55" x2="10" y2="78"/><line x1="32" y1="55" x2="54" y2="78"/>
        </g>
        <circle cx="18" cy="6" r="6" fill="#ffd54f"/><circle cx="46" cy="8" r="6" fill="#ffd54f"/><circle cx="32" cy="-2" r="7" fill="#ffca28"/>
      </g>
      <g transform="translate(455, 250) scale(0.85)">
        <rect x="24" y="65" width="16" height="135" rx="6" fill="#1c262b"/>
        <circle cx="32" cy="55" r="36" fill="#607d8b"/>
        <g stroke="#b0bec5" stroke-width="4" stroke-linecap="round">
          <line x1="32" y1="55" x2="32" y2="14"/><line x1="32" y1="55" x2="6" y2="26"/><line x1="32" y1="55" x2="58" y2="26"/>
          <line x1="32" y1="55" x2="0" y2="52"/><line x1="32" y1="55" x2="64" y2="52"/>
        </g>
        <circle cx="32" cy="2" r="7" fill="#ffd54f"/>
      </g>
      <g transform="translate(310, 285) scale(0.65)">
        <rect x="24" y="65" width="16" height="115" rx="6" fill="#263238"/>
        <circle cx="32" cy="55" r="34" fill="#78909c"/>
        <circle cx="32" cy="8" r="6" fill="#ffd54f"/>
      </g>
    `,
  },
  {
    file: "GP-OBR-004.svg",
    codigo: "GP-OBR-004",
    titulo: "Equilibrio en Piedra Barichara",
    artista: "Sebastián Duarte",
    tecnica: "Escultura en piedra arenisca y bronce (45 x 30 x 28 cm)",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#3d352e"/>
      <stop offset="100%" stop-color="#171412"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <!-- Pedestal de roble macizo de galería -->
      <polygon points="225,380 465,380 495,478 195,478" fill="#5c4033" stroke="#3e2723" stroke-width="2"/>
      <rect x="215" y="366" width="260" height="16" rx="2" fill="#8d6e63"/>
      <!-- Bloque monolítico inferior en piedra amarilla de Barichara -->
      <polygon points="260,366 430,366 410,250 280,250" fill="#d4a359" stroke="#a67832" stroke-width="2"/>
      <polygon points="430,366 452,350 432,238 410,250" fill="#a67832"/>
      <!-- Aro de bronce patinado en equilibrio central -->
      <circle cx="348" cy="198" r="56" fill="none" stroke="#cd7f32" stroke-width="18"/>
      <circle cx="348" cy="198" r="56" fill="none" stroke="#ffd166" stroke-width="3" opacity="0.6"/>
      <!-- Bloque superior en voladizo de piedra Barichara -->
      <polygon points="245,142 465,112 445,68 235,96" fill="#e6b86e" stroke="#b5853b" stroke-width="2"/>
      <!-- Sombra proyectada -->
      <ellipse cx="345" cy="366" rx="95" ry="7" fill="rgba(0,0,0,0.45)"/>
    `,
  },
  {
    file: "GP-OBR-005.svg",
    codigo: "GP-OBR-005",
    titulo: "Reflejos de la Ciénaga Grande",
    artista: "Camila Obregón",
    tecnica: "Óleo sobre lino (85 x 115 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff9e00"/>
      <stop offset="42%" stop-color="#ffd166"/>
      <stop offset="52%" stop-color="#06d6a0"/>
      <stop offset="100%" stop-color="#118ab2"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Sol caribeño al amanecer -->
      <circle cx="480" cy="145" r="55" fill="#fff3b0" opacity="0.9"/>
      <!-- Manglares y palafitos de la Ciénaga Grande -->
      <path d="M0 245 Q140 215 280 245 Z" fill="#073b4c"/>
      <!-- Casas palafíticas sobre el agua -->
      <g transform="translate(115, 192)">
        <rect x="0" y="18" width="58" height="32" fill="#e07a5f"/>
        <polygon points="-6,18 29,0 64,18" fill="#81b29a"/>
        <line x1="8" y1="50" x2="8" y2="75" stroke="#3d405b" stroke-width="3"/>
        <line x1="50" y1="50" x2="50" y2="75" stroke="#3d405b" stroke-width="3"/>
      </g>
      <g transform="translate(195, 200)">
        <rect x="0" y="15" width="48" height="28" fill="#f2cc8f"/>
        <polygon points="-5,15 24,0 53,15" fill="#e07a5f"/>
        <line x1="6" y1="43" x2="6" y2="68" stroke="#3d405b" stroke-width="3"/>
        <line x1="42" y1="43" x2="42" y2="68" stroke="#3d405b" stroke-width="3"/>
      </g>
      <!-- Raíces de mangle -->
      <path d="M510 245 Q555 180 610 245 M545 245 Q590 190 645 245 M580 205 Q610 150 665 185" stroke="#073b4c" stroke-width="6" fill="none"/>
      <ellipse cx="595" cy="170" rx="85" ry="38" fill="#0f5132"/>
      <!-- Reflejos lumínicos sobre el espejo de agua -->
      <g stroke="#fff3b0" stroke-width="4" stroke-linecap="round" opacity="0.75">
        <line x1="435" y1="280" x2="525" y2="280"/>
        <line x1="415" y1="305" x2="545" y2="305"/>
        <line x1="440" y1="335" x2="520" y2="335"/>
        <line x1="455" y1="365" x2="505" y2="365"/>
        <line x1="120" y1="310" x2="240" y2="310" stroke="#f2cc8f"/>
      </g>
    `,
  },
  {
    file: "GP-OBR-006.svg",
    codigo: "GP-OBR-006",
    titulo: "Frecuencia Sonora del Chocó",
    artista: "Andrés Santamaría",
    tecnica: "Arte Digital Generativo Giclée (70 x 70 cm)",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#042f2e"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <!-- Ondas acústicas generativas de la selva húmeda -->
      <g fill="none" stroke-linecap="round">
        <circle cx="345" cy="239" r="35" stroke="#10b981" stroke-width="3"/>
        <circle cx="345" cy="239" r="70" stroke="#34d399" stroke-width="2" stroke-dasharray="14,8"/>
        <circle cx="345" cy="239" r="110" stroke="#D4AF37" stroke-width="2.5" stroke-dasharray="4,10"/>
        <circle cx="345" cy="239" r="150" stroke="#06b6d4" stroke-width="1.8"/>
        <circle cx="345" cy="239" r="190" stroke="#10b981" stroke-width="2" stroke-dasharray="25,12"/>
        <!-- Espectrograma ecuatorial central -->
        <path d="M55 239 Q95 120 135 239 T215 239 T295 110 T345 370 T395 120 T475 239 T555 239 T635 239" stroke="#fbbf24" stroke-width="3.5"/>
        <path d="M55 239 Q95 320 135 239 T215 170 T295 330 T345 130 T395 340 T475 190 T555 239 T635 239" stroke="#2dd4bf" stroke-width="2" opacity="0.8"/>
      </g>
    `,
  },
  {
    file: "GP-OBR-007.svg",
    codigo: "GP-OBR-007",
    titulo: "Memoria del Río Magdalena",
    artista: "Camila Obregón",
    tecnica: "Óleo sobre lino (70 x 90 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="45%" stop-color="#ea580c"/>
      <stop offset="55%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <circle cx="170" cy="180" r="48" fill="#fef08a" opacity="0.85"/>
      <!-- Ribera momposina al fondo -->
      <path d="M0 260 Q180 230 390 255 T690 245 L690 270 L0 270 Z" fill="#291509"/>
      <!-- Chalupa tradicional y pescador lanzando atarraya -->
      <g transform="translate(260, 275)">
        <path d="M0 45 Q95 75 210 40 L185 65 Q95 85 25 65 Z" fill="#1c0d06"/>
        <!-- Silueta pescador -->
        <circle cx="135" cy="5" r="9" fill="#1c0d06"/>
        <path d="M135 14 L125 48 L148 48 Z" fill="#1c0d06"/>
        <!-- Atarraya abierta en el aire -->
        <path d="M130 18 Q55 -45 -20 35" stroke="#fef08a" stroke-width="2" fill="none"/>
        <path d="M130 18 L55 -5 M130 18 L20 12 M130 18 L85 -15 M-20 35 Q35 20 90 38" stroke="#fde047" stroke-width="1.2" stroke-dasharray="4,3" fill="none"/>
      </g>
      <!-- Ondas del río Magdalena -->
      <path d="M60 390 Q210 375 370 395 T630 385" stroke="#fde047" stroke-width="3" fill="none" opacity="0.6"/>
    `,
  },
  {
    file: "GP-OBR-008.svg",
    codigo: "GP-OBR-008",
    titulo: "Trama Andina en Rojo Tierra",
    artista: "Mateo Villamizar",
    tecnica: "Acrílico con pigmentos minerales (80 x 80 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c2d12"/>
      <stop offset="50%" stop-color="#9a3412"/>
      <stop offset="100%" stop-color="#431407"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Textura de tejido andino y pigmentos de Ráquira -->
      <g stroke="#fed7aa" stroke-width="3" fill="none" opacity="0.85">
        <path d="M70 80 L170 80 L170 180 L270 180 L270 280 L370 280 L370 380 L470 380"/>
        <path d="M620 80 L520 80 L520 180 L420 180 L420 280 L320 280 L320 380 L220 380"/>
      </g>
      <g fill="#ea580c" stroke="#D4AF37" stroke-width="2.5">
        <polygon points="345,70 435,160 345,250 255,160"/>
        <polygon points="345,230 435,320 345,410 255,320" fill="#b45309"/>
        <polygon points="180,155 250,225 180,295 110,225" fill="#78350f"/>
        <polygon points="510,155 580,225 510,295 440,225" fill="#78350f"/>
      </g>
      <circle cx="345" cy="160" r="22" fill="#D4AF37"/>
      <circle cx="345" cy="320" r="22" fill="#fed7aa"/>
    `,
  },
  {
    file: "GP-OBR-009.svg",
    codigo: "GP-OBR-009",
    titulo: "Tótem de Viento y Acero",
    artista: "Sebastián Duarte",
    tecnica: "Escultura en acero corten (110 x 35 x 35 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#27272a"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Base arquitectónica -->
      <rect x="255" y="410" width="180" height="55" fill="#3f3f46" stroke="#71717a" stroke-width="2"/>
      <!-- Tótem vertical en acero corten plegado -->
      <polygon points="305,410 345,410 330,70 285,95" fill="#9a3412" stroke="#fdba74" stroke-width="1.5"/>
      <polygon points="345,410 395,410 410,105 330,70" fill="#c2410c" stroke="#fed7aa" stroke-width="1.5"/>
      <!-- Aberturas de viento en el acero -->
      <circle cx="345" cy="165" r="24" fill="#18181b" stroke="#fb923c" stroke-width="3"/>
      <circle cx="345" cy="265" r="30" fill="#18181b" stroke="#fb923c" stroke-width="3"/>
      <polygon points="325,330 368,315 368,365 325,355" fill="#18181b"/>
    `,
  },
  {
    file: "GP-OBR-010.svg",
    codigo: "GP-OBR-010",
    titulo: "Silencio en la Candelaria",
    artista: "Lucía Mendoza",
    tecnica: "Fotografía en papel baritado (40 x 60 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e7e5e4"/>
      <stop offset="55%" stop-color="#a8a29e"/>
      <stop offset="100%" stop-color="#292524"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Perspectiva colonial de La Candelaria en blanco y negro cálido -->
      <!-- Fachada colonial izquierda con balcones de madera -->
      <polygon points="0,0 265,130 265,375 0,478" fill="#44403c"/>
      <rect x="55" y="160" width="60" height="95" fill="#1c1917" stroke="#d6d3d1" stroke-width="3"/>
      <rect x="45" y="230" width="80" height="28" fill="none" stroke="#e7e5e4" stroke-width="3"/>
      <rect x="165" y="190" width="42" height="75" fill="#1c1917" stroke="#d6d3d1" stroke-width="2"/>
      <!-- Fachada colonial derecha -->
      <polygon points="690,0 425,130 425,375 690,478" fill="#57534e"/>
      <rect x="485" y="185" width="45" height="80" fill="#1c1917" stroke="#d6d3d1" stroke-width="2"/>
      <rect x="575" y="155" width="62" height="100" fill="#1c1917" stroke="#d6d3d1" stroke-width="3"/>
      <!-- Aleros coloniales -->
      <line x1="0" y1="45" x2="275" y2="140" stroke="#1c1917" stroke-width="12"/>
      <line x1="690" y1="45" x2="415" y2="140" stroke="#1c1917" stroke-width="12"/>
      <!-- Calle empedrada con contraluz matinal -->
      <polygon points="265,375 425,375 690,478 0,478" fill="#78716c"/>
      <g stroke="#d6d3d1" stroke-width="1.5" opacity="0.65">
        <line x1="345" y1="375" x2="345" y2="478"/>
        <line x1="230" y1="400" x2="460" y2="400"/>
        <line x1="160" y1="430" x2="530" y2="430"/>
        <line x1="70" y1="460" x2="620" y2="460"/>
      </g>
      <!-- Farol colonial -->
      <circle cx="240" cy="175" r="10" fill="#fef3c7"/>
    `,
  },
  {
    file: "GP-OBR-011.svg",
    codigo: "GP-OBR-011",
    titulo: "Nocturno en Chapinero Alto",
    artista: "Valentina Restrepo",
    tecnica: "Óleo sobre lienzo (75 x 95 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a192f"/>
      <stop offset="60%" stop-color="#172a45"/>
      <stop offset="100%" stop-color="#020c1b"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Edificios de ladrillo bogotano en Chapinero Alto -->
      <rect x="55" y="105" width="145" height="255" fill="#7c2d12" stroke="#431407" stroke-width="2"/>
      <rect x="215" y="145" width="130" height="215" fill="#9a3412"/>
      <rect x="465" y="95" width="160" height="265" fill="#78350f"/>
      <!-- Ventanas cálidas en la noche -->
      <g fill="#fbbf24">
        <rect x="80" y="135" width="24" height="32"/><rect x="130" y="135" width="24" height="32"/>
        <rect x="80" y="195" width="24" height="32"/><rect x="130" y="255" width="24" height="32"/>
        <rect x="245" y="180" width="22" height="28"/><rect x="290" y="230" width="22" height="28"/>
        <rect x="500" y="130" width="28" height="34"/><rect x="555" y="190" width="28" height="34"/>
      </g>
      <!-- Farolas y reflejos dorados sobre asfalto húmedo -->
      <circle cx="395" cy="245" r="26" fill="#fde047" opacity="0.35"/>
      <circle cx="395" cy="245" r="8" fill="#fef08a"/>
      <line x1="395" y1="253" x2="395" y2="360" stroke="#94a3b8" stroke-width="3"/>
      <rect x="0" y="360" width="690" height="118" fill="#0f172a"/>
      <g stroke="#fbbf24" stroke-width="5" stroke-linecap="round" opacity="0.65">
        <line x1="110" y1="385" x2="110" y2="455"/>
        <line x1="275" y1="390" x2="275" y2="445"/>
        <line x1="395" y1="370" x2="395" y2="468" stroke="#fef08a" stroke-width="8"/>
        <line x1="540" y1="385" x2="540" y2="455"/>
      </g>
    `,
  },
  {
    file: "GP-OBR-012.svg",
    codigo: "GP-OBR-012",
    titulo: "Prisma Solar N.º 4",
    artista: "Andrés Santamaría",
    tecnica: "Arte Digital Algorítmico (65 x 65 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Haz de luz blanca entrante -->
      <line x1="40" y1="280" x2="295" y2="225" stroke="#ffffff" stroke-width="8"/>
      <!-- Espectro solar refractado -->
      <polygon points="375,180 650,95 650,145 385,205" fill="#ef4444" opacity="0.85"/>
      <polygon points="385,205 650,145 650,195 395,230" fill="#f59e0b" opacity="0.85"/>
      <polygon points="395,230 650,195 650,245 405,255" fill="#eab308" opacity="0.85"/>
      <polygon points="405,255 650,245 650,295 415,280" fill="#10b981" opacity="0.85"/>
      <polygon points="415,280 650,295 650,345 425,305" fill="#06b6d4" opacity="0.85"/>
      <polygon points="425,305 650,345 650,395 435,330" fill="#8b5cf6" opacity="0.85"/>
      <!-- Prisma triangular central -->
      <polygon points="345,95 465,345 225,345" fill="rgba(255,255,255,0.12)" stroke="#ffffff" stroke-width="4"/>
      <polygon points="345,125 435,325 255,325" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
    `,
  },
  {
    file: "GP-OBR-013.svg",
    codigo: "GP-OBR-013",
    titulo: "Semilla de Bronce Oxidado",
    artista: "Sebastián Duarte",
    tecnica: "Fundición en bronce a la cera perdida (28 x 22 x 20 cm)",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <!-- Pedestal de mármol negro -->
      <rect x="235" y="375" width="220" height="70" rx="4" fill="#090d16" stroke="#D4AF37" stroke-width="2"/>
      <!-- Semilla escultórica en bronce con pátina verde esmeralda y cantos dorados -->
      <path d="M345 95 C455 140 465 315 345 375 C225 315 235 140 345 95 Z" fill="#0d9488" stroke="#D4AF37" stroke-width="8"/>
      <path d="M345 115 C410 165 410 295 345 355" fill="none" stroke="#fbbf24" stroke-width="5"/>
      <ellipse cx="320" cy="215" rx="28" ry="65" fill="#14b8a6" opacity="0.5"/>
    `,
  },
  {
    file: "GP-OBR-014.svg",
    codigo: "GP-OBR-014",
    titulo: "Jardín Secreto del Cauca",
    artista: "Camila Obregón",
    tecnica: "Acrílico botánico sobre lino crudo (100 x 100 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5ebe0"/>
      <stop offset="100%" stop-color="#e3d5ca"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Follaje tropical del Cauca -->
      <path d="M120 478 Q140 260 280 140 Q240 310 190 478 Z" fill="#1b4332"/>
      <path d="M560 478 Q530 250 390 150 Q440 310 490 478 Z" fill="#2d6a4f"/>
      <ellipse cx="220" cy="280" rx="85" ry="42" transform="rotate(-35 220 280)" fill="#40916c"/>
      <ellipse cx="470" cy="270" rx="85" ry="42" transform="rotate(35 470 270)" fill="#52b788"/>
      <!-- Heliconias rojas y doradas -->
      <g transform="translate(325, 110)">
        <line x1="20" y1="60" x2="20" y2="368" stroke="#1b4332" stroke-width="9"/>
        <polygon points="20,40 85,70 20,95" fill="#d90429" stroke="#ffb703" stroke-width="3"/>
        <polygon points="20,85 -45,115 20,140" fill="#ef233c" stroke="#ffb703" stroke-width="3"/>
        <polygon points="20,130 80,160 20,185" fill="#d90429" stroke="#ffb703" stroke-width="3"/>
        <polygon points="20,175 -40,205 20,230" fill="#ef233c" stroke="#ffb703" stroke-width="3"/>
      </g>
      <!-- Orquídeas Cattleya -->
      <circle cx="215" cy="185" r="32" fill="#c77dff"/>
      <circle cx="215" cy="185" r="14" fill="#7209b7" stroke="#ffd166" stroke-width="3"/>
      <circle cx="485" cy="195" r="28" fill="#e0aaff"/>
      <circle cx="485" cy="195" r="12" fill="#7209b7" stroke="#ffd166" stroke-width="3"/>
    `,
  },
  {
    file: "GP-OBR-015.svg",
    codigo: "GP-OBR-015",
    titulo: "Arquitectura del Silencio II",
    artista: "Mateo Villamizar",
    tecnica: "Acrílico minimalista sobre tabla (50 x 50 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Planos arquitectónicos en blanco titanio, gris grafito y ocre -->
      <rect x="90" y="70" width="240" height="330" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="270" y="120" width="210" height="290" fill="#334155"/>
      <rect x="410" y="85" width="175" height="210" fill="#ca8a04" opacity="0.9"/>
      <line x1="60" y1="340" x2="630" y2="340" stroke="#0f172a" stroke-width="4"/>
      <circle cx="270" cy="230" r="34" fill="#f8fafc"/>
    `,
  },
  {
    file: "GP-OBR-016.svg",
    codigo: "GP-OBR-016",
    titulo: "Pescadores de Taganga al Alba",
    artista: "Lucía Mendoza",
    tecnica: "Fotografía panorámica en dibond (80 x 120 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="40%" stop-color="#fca5a5"/>
      <stop offset="55%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Bahía y cerros de Taganga (Santa Marta) -->
      <path d="M0 265 Q120 155 275 240 Q420 175 560 235 L690 190 L690 265 Z" fill="#1e293b"/>
      <!-- Cayucos de pesca tradicionales en la bahía -->
      <g transform="translate(110, 305)">
        <path d="M0 20 Q60 45 130 20 L115 38 Q60 50 15 38 Z" fill="#b91c1c"/>
        <line x1="25" y1="24" x2="105" y2="24" stroke="#fef08a" stroke-width="3"/>
      </g>
      <g transform="translate(360, 330)">
        <path d="M0 20 Q65 45 140 18 L122 38 Q65 50 18 38 Z" fill="#0f172a"/>
        <line x1="25" y1="23" x2="115" y2="23" stroke="#38bdf8" stroke-width="3"/>
      </g>
      <circle cx="335" cy="160" r="38" fill="#fef9c3" opacity="0.88"/>
    `,
  },
  {
    file: "GP-OBR-017.svg",
    codigo: "GP-OBR-017",
    titulo: "Constelación Muisca",
    artista: "Andrés Santamaría",
    tecnica: "Arte Digital con tintas minerales (45 x 60 cm)",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#09071a"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <!-- Mapa estelar del solsticio y monolitos de El Infiernito -->
      <circle cx="345" cy="210" r="155" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4,6"/>
      <circle cx="345" cy="210" r="110" fill="none" stroke="#fbbf24" stroke-width="1"/>
      <!-- Constelación dorada -->
      <g stroke="#fde047" stroke-width="2" fill="#ffffff">
        <line x1="230" y1="150" x2="310" y2="120"/><line x1="310" y1="120" x2="395" y2="165"/>
        <line x1="395" y1="165" x2="465" y2="135"/><line x1="310" y1="120" x2="345" y2="225"/>
        <line x1="345" y1="225" x2="265" y2="275"/><line x1="345" y1="225" x2="425" y2="265"/>
        <circle cx="230" cy="150" r="5"/><circle cx="310" cy="120" r="7" fill="#fbbf24"/>
        <circle cx="395" cy="165" r="5"/><circle cx="465" cy="135" r="6"/>
        <circle cx="345" cy="225" r="8" fill="#fbbf24"/><circle cx="265" cy="275" r="5"/><circle cx="425" cy="265" r="5"/>
      </g>
      <!-- Monolitos astronómicos de Villa de Leyva abajo -->
      <g fill="#475569" stroke="#D4AF37" stroke-width="1">
        <rect x="135" y="385" width="22" height="75" rx="4"/>
        <rect x="215" y="370" width="24" height="90" rx="4"/>
        <rect x="332" y="355" width="26" height="105" rx="4"/>
        <rect x="445" y="372" width="24" height="88" rx="4"/>
        <rect x="525" y="388" width="22" height="72" rx="4"/>
      </g>
    `,
  },
  {
    file: "GP-OBR-018.svg",
    codigo: "GP-OBR-018",
    titulo: "Vértice en Madera de Guayacán",
    artista: "Sebastián Duarte",
    tecnica: "Escultura en madera de guayacán (55 x 25 x 25 cm)",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1c0a00"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <!-- Pedestal de galería -->
      <rect x="240" y="395" width="210" height="65" fill="#27272a"/>
      <!-- Escultura angular tallada en madera de Guayacán con vetas cálidas -->
      <polygon points="345,65 445,235 375,395 315,395 245,235" fill="#b45309" stroke="#fde68a" stroke-width="2"/>
      <polygon points="345,65 445,235 375,395 345,395" fill="#92400e"/>
      <path d="M290 220 Q345 180 400 220 M280 270 Q345 230 410 270 M305 325 Q345 295 385 325" stroke="#fcd34d" stroke-width="2" fill="none" opacity="0.6"/>
    `,
  },
  {
    file: "GP-OBR-019.svg",
    codigo: "GP-OBR-019",
    titulo: "Cordillera Central en Azul Profundo",
    artista: "Valentina Restrepo",
    tecnica: "Díptico al óleo sobre lienzo (110 x 140 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#172554"/>
      <stop offset="55%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Cumbres nevadas de Los Nevados en azul profundo y plata -->
      <polygon points="0,350 165,135 320,285 495,115 690,320 690,478 0,478" fill="#1e40af"/>
      <!-- Nieve perpetua en las cumbres -->
      <polygon points="165,135 225,200 185,195 165,220 135,190 112,205" fill="#f8fafc"/>
      <polygon points="495,115 568,195 520,185 495,215 465,180 432,195" fill="#f1f5f9"/>
      <!-- División sutil de díptico en el centro -->
      <line x1="345" y1="0" x2="345" y2="478" stroke="#090d16" stroke-width="6"/>
    `,
  },
  {
    file: "GP-OBR-020.svg",
    codigo: "GP-OBR-020",
    titulo: "Horizonte de Sal en Manaure",
    artista: "Lucía Mendoza",
    tecnica: "Fotografía Fine Art (60 x 90 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="48%" stop-color="#f8fafc"/>
      <stop offset="52%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#be185d"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Charcas rosadas y montículos blancos de sal en Manaure (La Guajira) -->
      <polygon points="75,260 195,175 315,260" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <polygon points="365,260 515,155 645,260" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <!-- Reflejos cristalinos de sal -->
      <line x1="0" y1="260" x2="690" y2="260" stroke="#ffffff" stroke-width="5"/>
      <ellipse cx="220" cy="360" rx="165" ry="26" fill="#fbcfe8" opacity="0.65"/>
      <ellipse cx="490" cy="395" rx="145" ry="22" fill="#fce7f3" opacity="0.75"/>
    `,
  },
  {
    file: "GP-OBR-021.svg",
    codigo: "GP-OBR-021",
    titulo: "Cosecha de Luz Cafetera",
    artista: "Valentina Restrepo",
    tecnica: "Óleo sobre lienzo (45 x 55 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Colinas verdes de cafetales en el Quindío -->
      <path d="M0 280 Q180 185 380 265 T690 230 L690 478 L0 478 Z" fill="#15803d"/>
      <path d="M0 355 Q260 265 510 345 T690 325 L690 478 L0 478 Z" fill="#166534"/>
      <!-- Finca tradicional cafetera blanca con zócalo rojo -->
      <g transform="translate(385, 210)">
        <rect x="0" y="22" width="78" height="42" fill="#ffffff"/>
        <rect x="0" y="50" width="78" height="14" fill="#dc2626"/>
        <polygon points="-10,22 39,0 88,22" fill="#9a3412"/>
      </g>
      <!-- Palmas de cera del Quindío -->
      <line x1="165" y1="115" x2="165" y2="285" stroke="#422006" stroke-width="4"/>
      <circle cx="165" cy="110" r="22" fill="#15803d"/>
      <line x1="220" y1="135" x2="220" y2="295" stroke="#422006" stroke-width="4"/>
      <circle cx="220" cy="130" r="20" fill="#166534"/>
      <!-- Granos de café rojos en primer plano -->
      <circle cx="95" cy="410" r="10" fill="#dc2626"/><circle cx="115" cy="420" r="10" fill="#b91c1c"/><circle cx="135" cy="405" r="10" fill="#dc2626"/>
    `,
  },
  {
    file: "GP-OBR-022.svg",
    codigo: "GP-OBR-022",
    titulo: "Estudio Geométrico en Ocre y Carbón",
    artista: "Mateo Villamizar",
    tecnica: "Acrílico y pan de oro (70 x 70 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#292524"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Bloques mate en carbón mineral, ocre y líneas de pan de oro -->
      <rect x="75" y="65" width="235" height="235" fill="#0c0a09" stroke="#D4AF37" stroke-width="3"/>
      <rect x="265" y="165" width="245" height="235" fill="#d97706" opacity="0.92"/>
      <rect x="435" y="75" width="165" height="165" fill="#78350f" stroke="#fde68a" stroke-width="2"/>
      <line x1="55" y1="345" x2="635" y2="125" stroke="#D4AF37" stroke-width="6"/>
      <circle cx="265" cy="265" r="46" fill="#1c1917" stroke="#D4AF37" stroke-width="4"/>
    `,
  },
  {
    file: "GP-OBR-023.svg",
    codigo: "GP-OBR-023",
    titulo: "Estudio de Luz en Monserrate II",
    artista: "Valentina Restrepo",
    tecnica: "Óleo Contemporáneo sobre Lino (70 x 90 cm)",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="38%" stop-color="#7c2d12"/>
      <stop offset="72%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Rayos de luz crepuscular proyectados sobre el Cerro de Monserrate -->
      <polygon points="345,40 120,380 230,380" fill="#fef08a" opacity="0.22"/>
      <polygon points="345,40 310,380 430,380" fill="#fde047" opacity="0.28"/>
      <polygon points="345,40 480,380 610,380" fill="#fef08a" opacity="0.22"/>
      <circle cx="345" cy="135" r="68" fill="#fef9c3" opacity="0.92"/>
      <circle cx="345" cy="135" r="105" fill="#f59e0b" opacity="0.3"/>
      <!-- Silueta de los Cerros Orientales y cumbre de Monserrate -->
      <path d="M0 370 L130 275 L235 305 L345 170 L460 285 L575 235 L690 310 L690 478 L0 478 Z" fill="#1e1b4b"/>
      <path d="M220 315 L345 170 L475 300 L475 478 L220 478 Z" fill="#0f172a"/>
      <!-- Basílica del Señor de Monserrate iluminada en la cima -->
      <g transform="translate(324, 134)">
        <rect x="6" y="18" width="30" height="18" fill="#ffffff" stroke="#D4AF37" stroke-width="1.5"/>
        <polygon points="3,18 21,5 39,18" fill="#f59e0b"/>
        <rect x="17" y="0" width="8" height="18" fill="#ffffff"/>
        <line x1="21" y1="-10" x2="21" y2="2" stroke="#fef08a" stroke-width="2.5"/>
        <line x1="16" y1="-5" x2="26" y2="-5" stroke="#fef08a" stroke-width="2.5"/>
      </g>
      <!-- Funicular / Teleférico subiendo por la ladera iluminada -->
      <line x1="150" y1="395" x2="328" y2="172" stroke="#fde047" stroke-width="2" stroke-dasharray="5,4"/>
      <circle cx="240" cy="282" r="5" fill="#fef08a"/>
      <!-- Pinceladas de reflejos dorados en el piedemonte bogotano -->
      <g stroke="#fbbf24" stroke-width="4" stroke-linecap="round" opacity="0.8">
        <line x1="85" y1="415" x2="195" y2="415"/>
        <line x1="260" y1="435" x2="430" y2="435"/>
        <line x1="485" y1="418" x2="605" y2="418"/>
      </g>
    `,
  },
];

// Exposiciones (4 banners acordes al título de cada exposición)
const exposicionesSvgSpecs = [
  {
    file: "exp-1.svg",
    codigo: "EXPOSICIÓN EN CURSO · SALA BOSQUE POPULAR",
    titulo: "Luz de los Andes: Nuevas Miradas del Paisaje",
    artista: "Curaduría: Dra. Helena Morales",
    tecnica: "18 Obras de Pintura y Fotografía Andina",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#9d174d"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <circle cx="510" cy="145" r="65" fill="#fde047" opacity="0.85"/>
      <polygon points="0,370 155,180 310,295 480,145 690,330 690,478 0,478" fill="#1e293b"/>
      <polygon points="155,180 205,235 155,220 115,240" fill="#f8fafc"/>
      <polygon points="480,145 535,210 480,195 435,215" fill="#f8fafc"/>
    `,
  },
  {
    file: "exp-2.svg",
    codigo: "PRÓXIMA EXPOSICIÓN · PATIO DE ESCULTURAS",
    titulo: "Materia y Geometría: Diálogos entre Piedra y Acero",
    artista: "Sebastián Duarte & Mateo Villamizar",
    tecnica: "Escultura Monumental y Abstracción",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#44403c"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <rect x="120" y="95" width="180" height="290" fill="#d97706" stroke="#fde68a" stroke-width="3"/>
      <polygon points="440,85 565,385 335,385" fill="#9a3412" stroke="#D4AF37" stroke-width="3"/>
      <circle cx="330" cy="240" r="78" fill="none" stroke="#D4AF37" stroke-width="10"/>
    `,
  },
  {
    file: "exp-3.svg",
    codigo: "INSTALACIÓN INMERSIVA · SALA PRISMA LAB",
    titulo: "Cartografías Sonoras del Chocó Biogeográfico",
    artista: "Andrés Santamaría & Colectivo Prisma Medial",
    tecnica: "Arte Digital Multicanal y Paisaje Acústico",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <circle cx="345" cy="239" r="165" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="12,8"/>
      <circle cx="345" cy="239" r="115" fill="none" stroke="#D4AF37" stroke-width="2"/>
      <path d="M40 239 Q120 80 200 239 T360 239 T520 239 T650 239" stroke="#34d399" stroke-width="5" fill="none"/>
    `,
  },
  {
    file: "exp-4.svg",
    codigo: "MEMORIA CURATORIAL · ARCHIVO 2026",
    titulo: "Memorias Anfibias del Caribe",
    artista: "Muestra Individual de Camila Obregón",
    tecnica: "24 Lienzos sobre el Río Magdalena y la Ciénaga",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="55%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#115e59"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <circle cx="345" cy="155" r="55" fill="#fef08a"/>
      <path d="M80 310 Q345 360 610 310" stroke="#fef08a" stroke-width="4" fill="none"/>
      <path d="M210 275 Q345 315 480 270 L450 295 Q345 320 240 295 Z" fill="#134e4a"/>
    `,
  },
];

// Cursos y Talleres (5 imágenes acordes al título de cada taller)
const cursosSvgSpecs = [
  {
    file: "cur-1.svg",
    codigo: "TALLER PRESENCIAL · NIVEL PRINCIPIANTE",
    titulo: "Fundamentos de Pintura al Óleo y Teoría del Color",
    artista: "Instructora: Valentina Restrepo",
    tecnica: "Sábados 9:00 a. m. · Kit de Óleo Incluido",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Paleta de madera y círculo cromático de óleo -->
      <ellipse cx="345" cy="245" rx="195" ry="135" fill="#d97706" stroke="#fde68a" stroke-width="3"/>
      <circle cx="220" cy="245" r="24" fill="#1e293b"/>
      <circle cx="290" cy="165" r="26" fill="#ef4444"/>
      <circle cx="385" cy="155" r="26" fill="#facc15"/>
      <circle cx="465" cy="215" r="26" fill="#3b82f6"/>
      <circle cx="445" cy="305" r="26" fill="#10b981"/>
      <circle cx="340" cy="320" r="26" fill="#ffffff"/>
      <!-- Pinceles cruzados -->
      <line x1="145" y1="380" x2="515" y2="110" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
      <polygon points="515,110 555,85 535,128" fill="#facc15"/>
    `,
  },
  {
    file: "cur-2.svg",
    codigo: "TALLER EXPERIMENTAL · NIVEL INTERMEDIO",
    titulo: "Acrílico Experimental, Texturas Minerales y Pan de Oro",
    artista: "Instructor: Mateo Villamizar",
    tecnica: "Martes y Jueves 6:00 p. m. · Hojilla Dorada",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Láminas de pan de oro y espátula de relieve -->
      <rect x="170" y="95" width="180" height="180" fill="#D4AF37" stroke="#fef08a" stroke-width="3"/>
      <rect x="310" y="185" width="195" height="195" fill="#b45309" opacity="0.85" stroke="#D4AF37" stroke-width="3"/>
      <polygon points="210,360 315,260 350,295" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
    `,
  },
  {
    file: "cur-3.svg",
    codigo: "TALLER 100 % VIRTUAL · NIVEL PRINCIPIANTE",
    titulo: "Retrato Lumínico y Paisaje en Acuarela y Gouache",
    artista: "Instructora: Camila Obregón",
    tecnica: "Miércoles 7:00 p. m. · En Vivo + Grabaciones",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Lavados translúcidos de acuarela botánica -->
      <circle cx="265" cy="225" r="115" fill="#f43f5e" opacity="0.45"/>
      <circle cx="385" cy="215" r="115" fill="#f59e0b" opacity="0.45"/>
      <circle cx="335" cy="295" r="115" fill="#06b6d4" opacity="0.45"/>
      <path d="M335 385 Q335 230 420 140" stroke="#15803d" stroke-width="6" fill="none"/>
      <ellipse cx="380" cy="210" rx="45" ry="20" transform="rotate(-30 380 210)" fill="#16a34a"/>
    `,
  },
  {
    file: "cur-4.svg",
    codigo: "PATIO-TALLER ESCULTÓRICO · NIVEL PRINCIPIANTE",
    titulo: "Modelado Escultórico en Arcilla y Vaciado Básico",
    artista: "Instructor: Sebastián Duarte",
    tecnica: "Sábados 2:00 p. m. · 10 kg de Arcilla Incluidos",
    bgGradient: `<radialGradient id="bg" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#431407"/>
      <stop offset="100%" stop-color="#1c0a00"/>
    </radialGradient>`,
    innerArtworkSvg: `
      <!-- Torneta y busto/volumen en arcilla terracota -->
      <rect x="235" y="385" width="220" height="22" fill="#78716c"/>
      <rect x="325" y="407" width="40" height="55" fill="#57534e"/>
      <path d="M275 385 C265 245 295 115 345 115 C395 115 425 245 415 385 Z" fill="#c2410c" stroke="#fdba74" stroke-width="3"/>
      <ellipse cx="345" cy="195" rx="42" ry="52" fill="#ea580c"/>
    `,
  },
  {
    file: "cur-5.svg",
    codigo: "LABORATORIO VISUAL · NIVEL AVANZADO",
    titulo: "Fotografía de Autor, Iluminación Natural y Curaduría",
    artista: "Instructora: Lucía Mendoza",
    tecnica: "Domingos 10:00 a. m. · Revisión de Portafolio",
    bgGradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#27272a"/>
    </linearGradient>`,
    innerArtworkSvg: `
      <!-- Lente fotográfico y diafragma dorado -->
      <circle cx="345" cy="239" r="145" fill="#18181b" stroke="#D4AF37" stroke-width="6"/>
      <circle cx="345" cy="239" r="105" fill="none" stroke="#e4e4e7" stroke-width="3" stroke-dasharray="18,10"/>
      <circle cx="345" cy="239" r="58" fill="#0284c7" opacity="0.65" stroke="#ffffff" stroke-width="3"/>
      <circle cx="322" cy="215" r="16" fill="#ffffff" opacity="0.8"/>
    `,
  },
];

function generateAll() {
  ensureDir(path.join(PUBLIC_IMG_DIR, "obras"));
  ensureDir(path.join(PUBLIC_IMG_DIR, "exposiciones"));
  ensureDir(path.join(PUBLIC_IMG_DIR, "cursos"));

  for (const spec of obrasSvgSpecs) {
    const svg = wrapMuseumCanvas(spec);
    fs.writeFileSync(path.join(PUBLIC_IMG_DIR, "obras", spec.file), svg, "utf8");
  }

  for (const spec of exposicionesSvgSpecs) {
    const svg = wrapMuseumCanvas(spec);
    fs.writeFileSync(path.join(PUBLIC_IMG_DIR, "exposiciones", spec.file), svg, "utf8");
  }

  for (const spec of cursosSvgSpecs) {
    const svg = wrapMuseumCanvas(spec);
    fs.writeFileSync(path.join(PUBLIC_IMG_DIR, "cursos", spec.file), svg, "utf8");
  }

  console.log(
    `✅ Generadas ${obrasSvgSpecs.length} imágenes de obras, ${exposicionesSvgSpecs.length} de exposiciones y ${cursosSvgSpecs.length} de cursos 100 % acordes a cada título.`
  );
}

generateAll();
