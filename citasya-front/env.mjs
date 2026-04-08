import { createEnv } from "@t3-oss/env-nextjs";
import * as dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = {
  dev: resolve(__dirname, "./.envs/.env.develop"),
  staging: resolve(__dirname, "./.envs/.env.staging"),
  prod: resolve(__dirname, './.envs/.env.prod'),
};

console.log("APP_ENV =====>", process.env.APP_ENV);

const appEnv = (process.env.APP_ENV || "staging").trim();
console.log("appEnv =====>", appEnv);

if (!envPath[appEnv]) {
  console.error(`Error: No se encontró el archivo de entorno para APP_ENV="${appEnv}".`);
  process.exit(1);
}

console.log("Running environment ", envPath[appEnv]);

dotenv.config({ path: envPath[appEnv] });
export const env = createEnv({
  server: {
  },
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string(),
    NEXT_PUBLIC_GOOGLE_CALENDAR_URL: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env["NEXT_PUBLIC_BACKEND_URL"],
    NEXT_PUBLIC_GOOGLE_CALENDAR_URL: process.env["NEXT_PUBLIC_GOOGLE_CALENDAR_URL"],
  },
});
