import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };

        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            res.status(401).json({ error: "User no longer exists" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Admin access required" });
        return;
    }
    next();
};
