import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyCookie } from "@fastify/cookie";
import { fastifyHelmet } from "@fastify/helmet";
import { routes } from "@/routes/auth/routes.js";
import { fastify as Fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import { ENV } from "@/core/env.js";
import { fastifyBcrypt } from "fastify-bcrypt";
import prismaPlugin from "@/core/prisma.js";

export const fastify = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(fastifyCors, { origin: "*" });
fastify.register(fastifyHelmet);

fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Fastify API",
      description: "Simple backend service",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

fastify.register(fastifySwaggerUi, {
  routePrefix: "/api",
});

fastify.register(fastifyJwt, {
  secret: ENV.JWT_SECRET,
});

fastify.register(fastifyBcrypt, { saltWorkFactor: 10 });
fastify.register(prismaPlugin);
fastify.register(fastifyCookie);
fastify.register(routes, { prefix: "/api" });

await fastify.listen({
  port: ENV.PORT,
  host: "0.0.0.0",
});

fastify.log.info(`Swagger UI available on http://localhost:${ENV.PORT}/api`);
