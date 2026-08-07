import Fastify from "fastify";
import { getDatabaseUrl } from "./config/database.ts";
import { prisma } from "./lib/prisma.ts";
import { registerLeagueRoutes } from "./routes/leagues.ts";
import { registerUserRoutes } from "./routes/users.ts";

const app = Fastify({ logger: true });

app.get("/health", async () => ({
  ok: true,
  service: "golf-with-friends-api",
}));

const start = async () => {
  await app.register(registerUserRoutes);
  await app.register(registerLeagueRoutes);

  try {
    console.log("Using database URL:", getDatabaseUrl());

    await prisma.$connect();
    await app.listen({ port: Number(process.env.PORT || 3000), host: "0.0.0.0" });
    
    console.log("API listening on http://localhost:3000");
    console.log("Registered routes: /health, /users, /users/:id, /users/:id (PATCH)");
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
