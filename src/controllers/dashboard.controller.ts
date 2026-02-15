import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/dashboard/stats — Admin only
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalProducts,
            totalOrders,
            totalCustomers,
            ordersByStatus,
            recentOrders,
            topProducts,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.customer.count(),
            prisma.order.groupBy({
                by: ["status"],
                _count: { id: true },
            }),
            prisma.order.findMany({
                take: 7,
                orderBy: { createdAt: "desc" },
                select: { total: true, createdAt: true },
            }),
            prisma.orderItem.groupBy({
                by: ["name"],
                _sum: { price: true, quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5,
            }),
        ]);

        // Calculate total revenue
        const revenueResult = await prisma.order.aggregate({
            _sum: { total: true },
            where: { paymentStatus: "PAID" },
        });

        const totalRevenue = revenueResult._sum.total || 0;

        // Format recent sales by day
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const recentSales = dayNames.map((day) => {
            const dayOrders = recentOrders.filter(
                (o) => dayNames[new Date(o.createdAt).getDay()] === day
            );
            return {
                day,
                amount: dayOrders.reduce((sum, o) => sum + o.total, 0),
            };
        });

        res.json({
            totalRevenue,
            totalOrders,
            totalProducts,
            totalCustomers,
            revenueGrowth: 12.5, // Placeholder — would calculate from historical data
            orderGrowth: 8.3,
            recentSales,
            topProducts: topProducts.map((p) => ({
                name: p.name,
                sales: p._sum.quantity || 0,
                revenue: p._sum.price || 0,
            })),
            ordersByStatus: ordersByStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
