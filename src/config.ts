import Fastify from "fastify";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyCors } from "@fastify/cors";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyHelmet from "@fastify/helmet";

import { routes } from "@/routes/auth/routes.js";
import prismaPlugin from "./lib/prisma.js";

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
fastify.register(prismaPlugin).register(routes)

