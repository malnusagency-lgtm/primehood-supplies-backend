import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: { select: { products: true } },
            },
        });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
