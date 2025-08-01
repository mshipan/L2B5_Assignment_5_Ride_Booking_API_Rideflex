import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  MONGODB_URI: string;
  NODE_ENV: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  BCRYPT_SALT_ROUND: string;
  EXPRESS_SESSION_SECRET: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
}

const loadEnvVariables = (): EnvConfig => {
  const reqVars: string[] = [
    "PORT",
    "MONGODB_URI",
    "NODE_ENV",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "BCRYPT_SALT_ROUND",
    "EXPRESS_SESSION_SECRET",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
  ];

  reqVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing Require Environment Varialble ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    MONGODB_URI: process.env.MONGODB_URI as string,
    NODE_ENV: process.env.NODE_ENV as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
  };
};

export const envVars = loadEnvVariables();
