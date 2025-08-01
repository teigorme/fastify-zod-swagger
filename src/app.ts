import { fastify as Fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyCookie } from "@fastify/cookie";
import { fastifyHelmet } from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import { fastifyBcrypt } from "fastify-bcrypt";

import { ENV } from "@/core/env.js";
import prismaPlugin from "@/core/prisma.js";
import { authRoutes } from "@/modules/auth/controller/auth.controller.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      transport: {
        target: "@fastify/one-line-logger",
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyCors, { origin: "*" });
  app.register(fastifyHelmet);
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Fastify API",
        description: "Simple backend service",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });
  app.register(fastifySwaggerUi, {
    routePrefix: "/api",
  });

  app.register(fastifyJwt, {
    secret: ENV.JWT_SECRET,
  });
  app.register(fastifyBcrypt, { saltWorkFactor: 10 });
  app.register(fastifyCookie);
  app.register(prismaPlugin);

  // rotas
  app.register(authRoutes, { prefix: "/api" });

  return app;
}
