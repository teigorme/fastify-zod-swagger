import { ENV } from "@/core/env.js";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { LoginSchema } from "@/modules/auth/dtos/auth.schemas.js";
import z from "zod";

type LoginSchema = z.infer<typeof LoginSchema>;

export async function loginUser(input: LoginSchema, server: FastifyInstance) {
  const user = await server.prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!user) return { success: false };

  const isValid = await server.bcrypt.compare(input.password, user.password);
  if (!isValid) return { success: false };

  const tokens = {
    accessToken: server.jwt.sign({ userId: user.id }, { expiresIn: "15min" }),
    refreshToken: jwt.sign({ userId: user.id }, ENV.JWT_REFRESH, {
      expiresIn: "7h",
    }),
  };

  return { success: true, user, tokens };
}
