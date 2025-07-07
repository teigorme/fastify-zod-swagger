import { z } from "zod";
import type { FastifyTypeInstance } from "@/@types/fastify-type-instance.js";
import { fastify } from "@/server.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken"
import { ENV } from "@/lib/env.js";

const tags = ["auth"];

export async function routes(router: FastifyTypeInstance) {
	router.post(
		"/register",
		{
			schema: {
				tags,
				description: "register new users",
				body: z.object({
					name: z.string().min(1).max(255),
					email: z.string().min(1).max(255).email(),
					password: z.string().min(8).max(32),
				}),
				response: {
					400: z.null().describe("Bad Request"),
					201: z.null().describe("Created"),
				},
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			const user = await fastify.prisma.user.findUnique({ where: { email } });
			if (user) {
				return reply.status(StatusCodes.BAD_REQUEST).send();
			}

			await fastify.prisma.user.create({
				data: { email, name, password: await fastify.bcrypt.hash(password) },
			});

			return reply.status(StatusCodes.CREATED).send();
		},
	);

	router.post(
		"/login",
		{
			schema: {
				tags,
				description: "login user",
				body: z.object({
					email: z.string().min(1).max(255).email(),
					password: z.string().min(8).max(32),
				}),
				response: {
					201: z.object({
						accessToken: z.string().jwt(),
						user: z.object({
							id: z.string(),
							name: z.string(),
							role: z.enum(["USER", "ADMIN"]),
							createdAt: z.date(),
							email: z.string(),
						}),
					}),
					400: z.null().describe("Bad Request"),
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;
			const user = await fastify.prisma.user.findUnique({
				where: { email },
			});

			if (!user || !(await fastify.bcrypt.compare(password, user.password))) {
				return reply.status(StatusCodes.BAD_REQUEST).send();
			}
			const tokens = {
				accessToken: fastify.jwt.sign({ userId: user.id }, {
					expiresIn: "15min",
				}),
				refreshToken: jwt.sign({ userId: user.id }, ENV.JWT_REFRESH, {
					expiresIn: "7h",
				}),
			};

			return reply
				.status(StatusCodes.CREATED)
				.cookie("refreshToken", tokens.refreshToken, {
					httpOnly: true,
					secure: ENV.NODE_ENV === "production",
					sameSite: "strict",
					path: "/api/refresh-token",
					maxAge: 30 * 24 * 60 * 60 * 1000,
				})
				.send({
					accessToken: tokens.accessToken,
					user,
				});
		},
	);

	router.post(
		"/refresh-token",
		{
			schema: {
				tags,
				description: "refresh-token",
				response: {
					201: z.object({
						accessToken: z.string().jwt(),
						user: z.object({
							id: z.string(),
							name: z.string(),
							role: z.enum(["USER", "ADMIN"]),
							createdAt: z.date(),
							email: z.string(),
						}),
					}),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			process.env.NODE_ENV
			try {
				const refreshToken = request.cookies.refreshToken as string;
				if (!refreshToken) {
					return reply
						.status(StatusCodes.NOT_FOUND)
						.send({ message: "No refresh token provided" });
				}

				const revoked = await fastify.prisma.revokeRefreshToken.findUnique({
					where: { refreshToken },
				});

				if (revoked) {
					return reply.status(StatusCodes.UNAUTHORIZED).send({
						message: "Refresh token revoked",
					});
				}

				const decoded = jwt.decode(refreshToken) as {
					userId: string;
				};

				const user = await fastify.prisma.user.findUnique({
					where: { id: decoded.userId },
				});

				if (!user) {
					return reply.status(StatusCodes.UNAUTHORIZED).send({
						message: "Refresh token invalid",
					});
				}

				const tokens = {
					accessToken: fastify.jwt.sign({ userId: user.id }, {
						expiresIn: "15min",
					}),
					refreshToken: jwt.sign({ userId: user.id }, ENV.JWT_REFRESH, {
						expiresIn: "7h",
					}),
				};

				await fastify.prisma.revokeRefreshToken.create({
					data: { refreshToken, revoke: true },
				});

				return reply
					.status(StatusCodes.CREATED)
					.cookie("refreshToken", tokens.refreshToken, {
						httpOnly: true,
						secure: ENV.NODE_ENV === "production",
						sameSite: "strict",
						path: "/api/refresh-token",
						maxAge: 30 * 24 * 60 * 60 * 1000,
					})
					.send({
						accessToken: tokens.accessToken,
						user,
					});
			} catch (_e) {
				return reply.status(StatusCodes.UNAUTHORIZED).send({
					message: "Refresh token invalid",
				});
			}
		},
	);
}
