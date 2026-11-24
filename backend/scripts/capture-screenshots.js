/**
 * Script utilitario para capturar las 14 pantallas reales del sitio funcionando con Chrome Headless.
 * Si los servicios ya están corriendo en 4000, 5000 y 5173 los reutiliza; si no, los levanta temporalmente.
 */
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const rootDir = path.resolve(__dirname, "../..");
const capturasDir = path.join(rootDir, "docs", "capturas");
const validacionesDir = path.join(rootDir, "docs", "validaciones");

fs.mkdirSync(capturasDir, { recursive: true });
fs.mkdirSync(validacionesDir, { recursive: true });

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function estaActivo(url) {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch (_e) {
    return false;
  }
}

function esperarUrl(url, intentos = 30) {
  return new Promise((resolve, reject) => {
    let actual = 0;
    const probar = async () => {
      actual++;
      if (await estaActivo(url)) return resolve();
      if (actual >= intentos) return reject(new Error(`Timeout esperando ${url}`));
      setTimeout(probar, 600);
    };
    probar();
  });
}

async function main() {
  const yaCorriendo =
    (await estaActivo("http://localhost:4000/api/health")) &&
    (await estaActivo("http://localhost:5173"));

  let backendProc = null;
  let apiVirtualProc = null;
  let frontendProc = null;

  if (!yaCorriendo) {
    console.log("🚀 Levantando Backend (4000), API Virtual (5000) y Frontend (5173)...");
    backendProc = spawn("node", ["src/server.js"], {
      cwd: path.join(rootDir, "backend"),
      stdio: "ignore",
      shell: true,
    });
    apiVirtualProc = spawn("npx", ["json-server", "--watch", "db.json", "--port", "5000"], {
      cwd: path.join(rootDir, "api-virtual"),
      stdio: "ignore",
      shell: true,
    });
    frontendProc = spawn("npx", ["vite", "--port", "5173"], {
      cwd: path.join(rootDir, "frontend"),
      stdio: "ignore",
      shell: true,
    });
    await esperarUrl("http://localhost:4000/api/health");
    await esperarUrl("http://localhost:5000/desarrolladores");
    await esperarUrl("http://localhost:5173");
  } else {
    console.log("✅ Servicios activos detectados en puertos 4000, 5000 y 5173.");
  }

  try {
    const paginas = [
      {
        archivo: path.join(capturasDir, "fig01-inicio-slider.png"),
        url: "http://localhost:5173/",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig02-catalogo-filtros.png"),
        url: "http://localhost:5173/obras",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig03-detalle-obra.png"),
        url: "http://localhost:5173/obras/detalle/atardecer-urbano-en-monserrate",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig04-exposiciones.png"),
        url: "http://localhost:5173/exposiciones",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig05-cursos-talleres.png"),
        url: "http://localhost:5173/cursos/1",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig06-equipo-api-virtual.png"),
        url: "http://localhost:5173/equipo",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig07-sistema-pqr.png"),
        url: "http://localhost:5173/pqr",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig08-factura-electronica.png"),
        url: "http://localhost:5173/pedido/1/factura",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig09-nosotros-acordeon-mapa.png"),
        url: "http://localhost:5173/nosotros",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig10-admin-login.png"),
        url: "http://localhost:5173/admin/login",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig11-pasarela-pagos.png"),
        url: "http://localhost:5173/pasarela",
        size: "1280,950",
      },
      {
        archivo: path.join(capturasDir, "fig12-crud-base-datos.png"),
        url: "http://localhost:5173/admin/obras",
        size: "1280,950",
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
      const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), "prismas-chr-"));
      const cmd = `"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="${tmpProfile}" --window-size=${p.size} --virtual-time-budget=3500 --screenshot="${p.archivo}" "${p.url}"`;
      execSync(cmd, { stdio: "ignore" });
      console.log(`📸 Captura guardada: ${path.basename(p.archivo)}`);
      try {
        fs.rmSync(tmpProfile, { recursive: true, force: true });
      } catch (_e) {}
    }
  } finally {
    if (!yaCorriendo) {
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
  }

  console.log("🎉 Todas las 14 capturas fueron actualizadas correctamente.");
}

main().catch((err) => {
  console.error("Error tomando capturas:", err);
  process.exit(1);
});
