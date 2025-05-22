import { fastify } from "fastify";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyCors } from "@fastify/cors";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyHelmet from "@fastify/helmet";

import { routes } from "./users/routes.js";

const app = fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: "*" });
app.register(fastifyHelmet)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Fastify API",
      description: "Sample backend service",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/api",
});

app.register(routes);

async function run() {
  try {
    await app.ready();
    await app.listen({
      port: 3333,
      host: "0.0.0.0",
    });

    app.log.info(`Swagger UI available on http://localhost:3333/api`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

run();
