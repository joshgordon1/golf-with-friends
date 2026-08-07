import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.ts";
import { User } from "../../generated/prisma/client.ts";

export async function registerUserRoutes(app: FastifyInstance) {
  app.get("/users", async () => {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
      },
    });
  });

  app.get("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.code(404).send({ error: "user not found" });
    }

    return user;
  });

  // POST: Create a new user
  app.post("/users", async (request, reply) => {
    const body = request.body as User;

    if (!body.email) {
      return reply.code(400).send({ error: "email is required" });
    }

    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          firstName: body.firstName ?? null,
          lastName: body.lastName ?? null,
          phoneNumber: body.phoneNumber ?? null,
          handicapIndex: body.handicapIndex ?? null,
        },
      });

      return reply.code(201).send(user);
    } catch (error: unknown) {
      if (error instanceof Error && /Unique constraint failed/.test(error.message)) {
        return reply.code(409).send({ error: "a user with that email already exists" });
      }

      if (error instanceof Error) {
        request.log.error({ err: error }, "Failed to create user");
        return reply.code(500).send({
          error: "database write failed",
          details: error.message,
        });
      }

      return reply.code(500).send({ error: "database write failed" });
    }
  });


  // PATCH: Update User Data
  app.patch("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<User> & { [key: string]: unknown };

    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null && value !== "") {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return reply.code(400).send({ error: "at least one field is required" });
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return reply.code(200).send(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        request.log.error({ err: error }, "Failed to update user");
        return reply.code(500).send({
          error: "database write failed",
          details: error.message,
        });
      }

      return reply.code(500).send({ error: "database write failed" });
    }
  });

    
}
