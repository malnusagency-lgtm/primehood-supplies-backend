import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error("Error:", err.message);

    if (!env.isProduction) {
        console.error(err.stack);
    }

    res.status(500).json({
        error: env.isProduction ? "Internal server error" : err.message,
    });
};
