import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { generalLimiter } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";

// Route imports
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import uploadRoutes from "./routes/upload.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// === SECURITY ===
app.use(helmet());
app.use(cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// === PARSING ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// === RATE LIMITING ===
app.use(generalLimiter);

// === ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// === ERROR HANDLING ===
app.use(errorHandler);

// === START SERVER ===
app.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║  Primehood Supplies API Server           ║
║  Port: ${env.PORT}                            ║
║  Mode: ${env.NODE_ENV.padEnd(12)}               ║
║  CORS: ${env.CORS_ORIGIN.substring(0, 24).padEnd(24)}   ║
╚══════════════════════════════════════════╝
    `);
});

export default app;
