import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.ts";

export async function registerLeagueRoutes(app: FastifyInstance) {
  app.get("/leagues", async () => {
    return prisma.league.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
      },
    });
  });

  app.post("/leagues", async (request, reply) => {
    const body = request.body as {
      name: string;
      ownerId: string;
    };

    if (!body.name || !body.ownerId) {
      return reply.code(400).send({ error: "name and ownerId are required" });
    }

    const ownerExists = await prisma.user.findUnique({ where: { id: body.ownerId } });
    if (!ownerExists) {
      return reply.code(404).send({ error: "owner not found" });
    }

    const league = await prisma.league.create({
      data: {
        name: body.name,
        ownerId: body.ownerId,
      },
    });

    return reply.code(201).send(league);
  });
}
