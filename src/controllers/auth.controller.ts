import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        // Check admin role
        if (user.role !== "ADMIN") {
            res.status(403).json({ error: "Admin access only" });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: "Failed to get user" });
    }
};
