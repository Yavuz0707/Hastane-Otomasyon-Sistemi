import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dbPath = join(root, "prisma", "dev.db");

if (existsSync(dbPath)) {
  rmSync(dbPath, { force: true });
}

execFileSync("npx", ["prisma", "db", "execute", "--file", "prisma/migrations/20260519000000_init/migration.sql", "--schema", "prisma/schema.prisma"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});
execFileSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});
execFileSync("node", ["prisma/seed.mjs"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});
