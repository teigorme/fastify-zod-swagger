import { RegisterSchema } from "@/modules/auth/dtos/auth.schemas.js";
import type { PrismaClient } from "@/generated/prisma/index.js";
import z from "zod";
import { FastifyInstance } from "fastify";

type RegisterSchema = z.infer<typeof RegisterSchema>;

export async function registerUser(
  input: RegisterSchema,
  server: FastifyInstance
) {
  const userExists = await server.prisma.user.findUnique({
    where: { email: input.email },
  });
  if (userExists) return { success: false };

  await server.prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: await server.bcrypt.hash(input.password),
    },
  });

  return { success: true };
}
