import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    ...options
  });
}

const migrate = run("npx", [
  "prisma",
  "db",
  "execute",
  "--file",
  "prisma/migrations/20260519000000_init/migration.sql",
  "--schema",
  "prisma/schema.prisma"
]);

const combinedOutput = `${migrate.stdout ?? ""}\n${migrate.stderr ?? ""}`;
if (migrate.status !== 0 && !combinedOutput.includes('table "User" already exists')) {
  process.stdout.write(migrate.stdout ?? "");
  process.stderr.write(migrate.stderr ?? "");
  process.exit(migrate.status ?? 1);
}

if (migrate.status === 0) {
  process.stdout.write(migrate.stdout ?? "");
} else {
  console.log("Database tables already exist; skipping initial SQL migration.");
}

process.exit(0);
