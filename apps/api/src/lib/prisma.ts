import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { getEnvVar } from "../config/env.ts";

const adapter = new PrismaPg({ connectionString: getEnvVar("DATABASE_URL") });

export const prisma = new PrismaClient({ adapter });
