import { ENV } from "@/core/env.js";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";

export async function refreshToken(
  oldRefreshToken: string,
  server: FastifyInstance
) {
  if (!oldRefreshToken) {
    return { code: 404, message: "No refresh token provided" };
  }

  const revoked = await server.prisma.revokeRefreshToken.findUnique({
    where: { refreshToken: oldRefreshToken },
  });

  if (revoked) {
    return { code: 401, message: "Refresh token revoked" };
  }

  const decoded = jwt.decode(oldRefreshToken) as { userId: string };
  const user = await server.prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    return { code: 401, message: "Refresh token invalid" };
  }

  const tokens = {
    accessToken: server.jwt.sign({ userId: user.id }, { expiresIn: "15min" }),
    refreshToken: jwt.sign({ userId: user.id }, ENV.JWT_REFRESH, {
      expiresIn: "7h",
    }),
  };

  await server.prisma.revokeRefreshToken.create({
    data: { refreshToken: oldRefreshToken, revoke: true },
  });

  return { code: 201, tokens, user };
}
