import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const dataDir = path.join(root, "data");
const backupDir = path.join(root, "data", "backups");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dbPath)) {
  console.error("Database not found:", dbPath);
  process.exit(1);
}

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = path.join(backupDir, `app-backup-${stamp}.db`);
fs.copyFileSync(dbPath, target);

console.log("Backup created:", target);

