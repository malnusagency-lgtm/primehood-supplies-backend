import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/customers — Admin only
export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                _count: {
                    select: { orders: true },
                },
                orders: {
                    select: { total: true, createdAt: true },
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { name: "asc" },
        });

        const formattedCustomers = customers.map((c) => {
            const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);
            const lastOrder = c.orders.length > 0 ? c.orders[0].createdAt.toISOString() : null;

            return {
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                county: "Nairobi", // Default or could be extracted from last order if available
                orders: c._count.orders,
                totalSpent,
                lastOrder,
                avatar: c.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2),
            };
        });

        res.json(formattedCustomers);
    } catch (error) {
        console.error("Get customers error:", error);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
};
