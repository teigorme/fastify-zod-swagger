import { z } from "zod";
import type { FastifyTypeInstance } from "@/@types/fastify-type-instance.js";

const tags = ["auth"]

export async function routes(router: FastifyTypeInstance) {
	router.post(
		"/post",
		{
			schema: {
				tags,
				description: "List users",
				body: {
					name: z.string().min(1).max(255),
					email: z.string().min(1).max(255).email(),
					password: z.string().min(8).max(32),
				}
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			return reply.status(201).send({ email, password });

		},
	);

	router.post(
		"/login",
		{
			schema: {
				tags,
				description: "Create a new user",
				body: z.object({
					email: z.string().min(1).max(255).email(),
					password: z.string().min(8).max(32),
				}),

			},
		},
		async (request, reply) => {
			const { email, password } = request.body;


			return reply.status(201).send({ email, password });
		},
	);
}
