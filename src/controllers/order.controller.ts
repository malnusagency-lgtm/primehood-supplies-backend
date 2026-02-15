import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/orders — Admin only
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const status = req.query.status as string | undefined;
        const page = (req.query.page as string) || "1";
        const limit = (req.query.limit as string) || "20";

        const where: any = {};
        if (status) where.status = status.toUpperCase();

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: true,
                    items: { include: { product: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// POST /api/orders — Public (from checkout)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            customer: customerData,
            items,
            subtotal,
            vat,
            shipping,
            total,
            paymentMethod,
            address,
            town,
            county,
        } = req.body;

        // Find or create customer
        let customer = await prisma.customer.findUnique({
            where: { email: customerData.email },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone,
                },
            });
        }

        // Generate order number
        const count = await prisma.order.count();
        const orderNumber = `PH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(count + 1).padStart(3, "0")}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerId: customer.id,
                subtotal,
                vat,
                shipping,
                total,
                paymentMethod: paymentMethod.toUpperCase(),
                address,
                town,
                county,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId || null,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                customer: true,
                items: true,
            },
        });

        // Decrease stock for each item
        for (const item of items) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stockCount: { decrement: item.quantity } },
                });
            }
        }

        res.status(201).json(order);
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

// PUT /api/orders/:id — Admin only
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { status, paymentStatus } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: {
                ...(status && { status: status.toUpperCase() }),
                ...(paymentStatus && { paymentStatus: paymentStatus.toUpperCase() }),
            },
            include: {
                customer: true,
                items: true,
            },
        });

        res.json(order);
    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({ error: "Failed to update order" });
    }
};

// GET /api/orders/:id — Admin only
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true } },
            },
        });

        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
};
