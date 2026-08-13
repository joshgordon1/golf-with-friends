import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getEnvVar } from "./src/config/env";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getEnvVar("DATABASE_URL"),
  },
});
