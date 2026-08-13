import "dotenv/config";
import { env } from "prisma/config";

export type APIEnv = {
  DATABASE_URL: string;
  API_PORT: string;
  JWT_SECRET: string;
  JWT_COOKIE_NAME: string;
};


export function getEnvVar(key: keyof APIEnv) {
  const envVar = env<APIEnv>(key)?.trim();
  if (envVar) {
    // console.log("Using configured database URL:", envVar);
    return envVar;
  }
}
