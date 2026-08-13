import Fastify from "fastify";
import { getEnvVar } from "./config/env.ts";
import { prisma } from "./lib/prisma.ts";
import { registerLeagueRoutes } from "./routes/leagues.ts";
import { registerUserRoutes } from "./routes/users.ts";
import { registerAuthRoutes } from "./routes/auth.ts";
import authPlugin from "./plugins/auth.ts";

const app = Fastify({ logger: true });

app.get("/health", async () => ({
  ok: true,
  service: "golf-with-friends-api",
}));

const start = async () => {
  // Before registering any routes, we need to register the auth plugin so it can be used by the routes
  await app.register(authPlugin);
  await app.register(registerUserRoutes);
  await app.register(registerLeagueRoutes);
  await app.register(registerAuthRoutes);

  try {
    console.log("Using database URL:", getEnvVar("DATABASE_URL"));

    await prisma.$connect();
    await app.listen({ port: Number(getEnvVar("API_PORT") || 3001), host: "0.0.0.0" });

  } catch (error) {
    console.error("Failed to start the API. Check the database connection and local Postgres container.", error);
    process.exit(1);
  }
};

void start();

const shutdown = async () => {
  await prisma.$disconnect();
  await app.close();
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
