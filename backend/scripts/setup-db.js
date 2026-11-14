/**
 * Script automático de preparación de base de datos SQLite para Galería Prismas.
 * Se ejecuta automáticamente con `npm run dev` desde la raíz:
 * 1. Verifica que exista backend/.env (si no existe, lo copia desde backend/.env.example).
 * 2. Genera el cliente Prisma y aplica las migraciones (o sincroniza el esquema).
 * 3. Verifica si la base de datos está vacía; si no hay obras, ejecuta el seed automáticamente.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log("📄 Archivo backend/.env creado automáticamente desde .env.example");
}

console.log("🔧 Sincronizando esquema Prisma y migraciones SQLite...");
execSync("npx prisma migrate deploy", { cwd: rootDir, stdio: "inherit" });
execSync("npx prisma generate", { cwd: rootDir, stdio: "inherit" });

async function checkAndSeed() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const totalObras = await prisma.obra.count();
    if (totalObras === 0) {
      console.log("🌱 Base de datos vacía detectada. Sembrando catálogo inicial...");
      execSync("node prisma/seed.js", { cwd: rootDir, stdio: "inherit" });
    } else {
      console.log(`✅ Base de datos lista (${totalObras} obras cargadas).`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed().catch((err) => {
  console.error("Error preparando la base de datos:", err);
  process.exit(1);
});
