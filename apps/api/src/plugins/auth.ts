import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { getEnvVar } from '../config/env'

export default fp(async (fastify) => {
  console.log("AUTH PLUGIN ACCESSED")
  fastify.register(cookie)
  fastify.register(jwt, {
    secret: getEnvVar("JWT_SECRET")!,
    cookie: { cookieName: getEnvVar("JWT_COOKIE_NAME")!, signed: false },
  })

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch(error) {
      reply.send(error)
    }
  })
})