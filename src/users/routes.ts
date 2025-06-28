import { z } from "zod";
import { FastifyTypeInstance } from "../@types/fastify-type-instance.js";

export async function routes(router: FastifyTypeInstance) {
  router.get(
    "/users",
    {
      schema: {
        tags: ["users"],
        description: "List users",
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.string().email(),
            })
          ),
        },
      },
    },
    async () => {
      return [];
    }
  );

  router.post(
    "/users",
    {
      schema: {
        tags: ["users"],
        description: "Create a new user",
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, email } = request.body;

      const data = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name,
        email,
      };

      return reply.status(201).send(data);
    }
  );
}
