import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(32),
});

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(32),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.date(),
  email: z.string(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: UserResponseSchema,
});
