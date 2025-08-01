import { FastifyTypeInstance } from "@/@types/fastify-type-instance.js";
import {
  RegisterSchema,
  LoginSchema,
  LoginResponseSchema,
} from "@/modules/auth/dtos/auth.schemas.js";
import { registerUser } from "@/modules/auth/use-cases/register-user.use-case.js";
import { loginUser } from "@/modules/auth/use-cases/login-user.use-case.js";
import { refreshToken } from "@/modules/auth/use-cases/refresh-token.use-case.js";
import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";

const tags = ["auth"];

export async function authRoutes(router: FastifyTypeInstance) {
  router.post(
    "/register",
    {
      schema: {
        tags,
        description: "register new users",
        body: RegisterSchema,
        response: {
          400: z.null(),
          201: z.null(),
        },
      },
    },
    async (req, reply) => {
      const result = await registerUser(req.body, req.server);
      if (!result.success) return reply.status(StatusCodes.BAD_REQUEST).send();
      return reply.status(StatusCodes.CREATED).send();
    }
  );

  router.post(
    "/login",
    {
      schema: {
        tags,
        description: "login user",
        body: LoginSchema,
        response: {
          400: z.null(),
          201: LoginResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const result = await loginUser(req.body, req.server);
      if (!result.success) return reply.status(StatusCodes.BAD_REQUEST).send();
      const { tokens, user } = result;

      return reply
        .status(StatusCodes.CREATED)
        .cookie("refreshToken", tokens?.refreshToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/refresh-token",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .send({ accessToken: tokens?.accessToken!, user });
    }
  );

  router.post(
    "/refresh-token",
    {
      schema: {
        tags,
        description: "creaet new refresh-token",
        response: {
          201: LoginResponseSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const result = await refreshToken(req.cookies.refreshToken!, req.server);
      if (result.code === 401 || result.code === 404) {
        return reply.status(result.code).send({ message: result.message });
      }

      const { tokens, user } = result;

      return reply
        .status(StatusCodes.CREATED)
        .cookie("refreshToken", tokens?.refreshToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/refresh-token",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .send({ accessToken: tokens?.accessToken!, user });
    }
  );
}
