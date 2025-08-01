import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().min(1).max(65535).default(3333),
  JWT_SECRET: z.string().uuid(),
  JWT_REFRESH: z.string().uuid(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const ENV = envSchema.parse(process.env);
