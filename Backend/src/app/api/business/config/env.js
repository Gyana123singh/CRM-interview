import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables configuration:", parsed.error.format());
}

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/crm_db";

export const env = parsed.success ? { ...parsed.data, MONGODB_URI: mongoUri } : {
  DATABASE_URL: mongoUri,
  MONGODB_URI: mongoUri,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "5000",
};

export default env;
