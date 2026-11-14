/**
 * Script utilitario para levantar temporalmente los 3 servicios (Backend 4000, API Virtual 5000 y Frontend 5173),
 * tomar las capturas reales del sitio funcionando con Chrome Headless y apagar los procesos limpiamente.
 */
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "../..");
const capturasDir = path.join(rootDir, "docs", "capturas");
const validacionesDir = path.join(rootDir, "docs", "validaciones");

fs.mkdirSync(capturasDir, { recursive: true });
fs.mkdirSync(validacionesDir, { recursive: true });

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function esperarUrl(url, intentos = 30) {
  return new Promise((resolve, reject) => {
    let actual = 0;
    const probar = async () => {
      actual++;
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch (_e) {
        // continuar esperando
      }
      if (actual >= intentos) return reject(new Error(`Timeout esperando ${url}`));
      setTimeout(probar, 600);
    };
    probar();
  });
}

async function main() {
  console.log("🚀 Levantando Backend (4000), API Virtual (5000) y Frontend (5173)...");

  const backendProc = spawn("node", ["src/server.js"], {
    cwd: path.join(rootDir, "backend"),
    stdio: "ignore",
    shell: true,
  });

  const apiVirtualProc = spawn("npx", ["json-server", "--watch", "db.json", "--port", "5000"], {
    cwd: path.join(rootDir, "api-virtual"),
    stdio: "ignore",
    shell: true,
  });

  const frontendProc = spawn("npx", ["vite", "--port", "5173"], {
    cwd: path.join(rootDir, "frontend"),
    stdio: "ignore",
    shell: true,
  });

  try {
    await esperarUrl("http://localhost:4000/api/health");
    await esperarUrl("http://localhost:5000/desarrolladores");
    await esperarUrl("http://localhost:5173");
    console.log("✅ Los 3 servicios están en línea. Tomando capturas reales...");

    const paginas = [
      {
        archivo: path.join(capturasDir, "fig01-inicio-slider.png"),
        url: "http://localhost:5173/",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig02-catalogo-filtros.png"),
        url: "http://localhost:5173/obras",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig03-detalle-obra.png"),
        url: "http://localhost:5173/obras/detalle/atardecer-urbano-en-monserrate",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig04-exposiciones.png"),
        url: "http://localhost:5173/exposiciones",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig05-cursos-talleres.png"),
        url: "http://localhost:5173/cursos/1",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig06-equipo-api-virtual.png"),
        url: "http://localhost:5173/equipo",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig07-sistema-pqr.png"),
        url: "http://localhost:5173/pqr",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig08-factura-electronica.png"),
        url: "http://localhost:5173/pedido/1/factura",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig09-nosotros-acordeon-mapa.png"),
        url: "http://localhost:5173/nosotros",
        size: "1280,900",
      },
      {
        archivo: path.join(capturasDir, "fig10-admin-login.png"),
        url: "http://localhost:5173/admin/login",
        size: "1280,900",
      },
      {
        archivo: path.join(validacionesDir, "responsive-360px-movil.png"),
        url: "http://localhost:5173/obras",
        size: "360,800",
      },
      {
        archivo: path.join(validacionesDir, "responsive-768px-tablet.png"),
        url: "http://localhost:5173/obras",
        size: "768,900",
      },
    ];

    for (const p of paginas) {
      const cmd = `"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --window-size=${p.size} --virtual-time-budget=3500 --screenshot="${p.archivo}" "${p.url}"`;
      execSync(cmd, { stdio: "ignore" });
      console.log(`📸 Captura guardada: ${path.basename(p.archivo)}`);
    }
  } finally {
    try {
      execSync(`taskkill /PID ${backendProc.pid} /T /F`, { stdio: "ignore" });
    } catch (_e) {}
    try {
      execSync(`taskkill /PID ${apiVirtualProc.pid} /T /F`, { stdio: "ignore" });
    } catch (_e) {}
    try {
      execSync(`taskkill /PID ${frontendProc.pid} /T /F`, { stdio: "ignore" });
    } catch (_e) {}
  }

  console.log("🎉 Capturas completadas y procesos cerrados correctamente.");
}

main().catch((err) => {
  console.error("Error tomando capturas:", err);
  process.exit(1);
});
