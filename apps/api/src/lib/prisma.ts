import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { getDatabaseUrl } from "../config/database.ts";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });

export const prisma = new PrismaClient({ adapter });
