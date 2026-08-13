import bcrypt from 'bcrypt'
import { prisma } from "../lib/prisma.ts";
import { FastifyPluginAsync } from 'fastify'

export const registerAuthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/signup', async (request, reply) => {
    const { email, password, firstName, lastName, handicapIndex, phoneNumber } = request.body as {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        handicapIndex: number;
        phoneNumber: string;
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.code(409).send({ error: 'Email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        handicapIndex,
        phoneNumber
      },
    })

    const token = fastify.jwt.sign({ userId: user.id })
    reply.setCookie('gwf_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      handicapIndex: user.handicapIndex,
      phoneNumber: user.phoneNumber
    }
  })

  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    const token = fastify.jwt.sign({ userId: user.id })
    reply.setCookie('gwf_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      handicapIndex: user.handicapIndex,
      phoneNumber: user.phoneNumber
    }
  })

  fastify.get('/auth/me', { onRequest: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user as { userId: string }
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })
  })
}
