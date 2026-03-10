import { prisma } from "../lib/prisma";

export class OrderService {
    static async getOrders(query: any) {
        const { status, page = "1", limit = "20" } = query;
        const where: any = {};
        if (status) where.status = typeof status === "string" ? status.toUpperCase() : undefined;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: { customer: true, items: { include: { product: true } } },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            orders,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        };
    }

    static async createOrder(data: any) {
        const { customer: customerData, items, subtotal, vat, shipping, total, paymentMethod, address, town, county } = data;

        let customer = await prisma.customer.findUnique({ where: { email: customerData.email } });
        if (!customer) {
            customer = await prisma.customer.create({
                data: { name: customerData.name, email: customerData.email, phone: customerData.phone },
            });
        }

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
            include: { customer: true, items: true },
        });

        // Safe decrement for stock
        for (const item of items) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stockCount: { decrement: item.quantity } },
                });
            }
        }

        return order;
    }

    static async updateOrderStatus(id: string, updateData: any) {
        return prisma.order.update({
            where: { id },
            data: {
                ...(updateData.status && { status: updateData.status.toUpperCase() }),
                ...(updateData.paymentStatus && { paymentStatus: updateData.paymentStatus.toUpperCase() }),
            },
            include: { customer: true, items: true },
        });
    }

    static async getOrderById(id: string) {
        return prisma.order.findUnique({
            where: { id },
            include: { customer: true, items: { include: { product: true } } },
        });
    }

    static async getOrderByNumber(orderNumber: string, email: string) {
        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: { customer: true, items: { include: { product: true } } },
        });

        if (!order || order.customer.email.toLowerCase() !== email.toLowerCase()) {
            return null;
        }

        return order;
    }

    static async checkStock(items: { productId: string; quantity: number }[]) {
        const results: { productId: string; name: string; requested: number; available: number; inStock: boolean }[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, stockCount: true },
            });

            if (!product) {
                results.push({
                    productId: item.productId,
                    name: "Unknown Product",
                    requested: item.quantity,
                    available: 0,
                    inStock: false,
                });
            } else {
                results.push({
                    productId: product.id,
                    name: product.name,
                    requested: item.quantity,
                    available: product.stockCount,
                    inStock: product.stockCount >= item.quantity,
                });
            }
        }

        return {
            allInStock: results.every((r) => r.inStock),
            items: results,
        };
    }
}
