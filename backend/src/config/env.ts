import { config } from "dotenv";
import { z } from "zod";

config({ path: process.env.NODE_ENV === "test" ? ".env.test" : undefined });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(43),
  CALLMEBOT_API_KEY: z.string().min(1),
  CALLMEBOT_SENDER_PHONE: z.string().min(1),
  EMAIL_SENDER_ADDRESS: z.string().email(),
  EMAIL_SENDER_NAME: z.string().min(1).default("Asset Management Notifications"),
  EMAIL_APP_PASSWORD: z.string().min(1)
});

export const env = envSchema.parse(process.env);
