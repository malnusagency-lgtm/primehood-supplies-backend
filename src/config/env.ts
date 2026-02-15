import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
    PORT: parseInt(process.env.PORT || "5000", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
};
