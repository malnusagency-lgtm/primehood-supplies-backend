import { Router } from "express";
import { z } from "zod";
import {
    getOrders,
    createOrder,
    updateOrderStatus,
    getOrderById,
} from "../controllers/order.controller";
import { validate } from "../middleware/validate";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

const createOrderSchema = z.object({
    body: z.object({
        customer: z.object({
            name: z.string().min(1),
            email: z.string().email(),
            phone: z.string().min(1),
        }),
        items: z.array(z.object({
            productId: z.string().optional(),
            name: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().positive(),
        })).min(1),
        subtotal: z.number().min(0),
        vat: z.number().min(0),
        shipping: z.number().min(0),
        total: z.number().positive(),
        paymentMethod: z.enum(["mpesa", "card"]),
        address: z.string().min(1),
        town: z.string().min(1),
        county: z.string().min(1),
    }),
});

// Public: create order from checkout
router.post("/", validate(createOrderSchema), createOrder);

// Admin only
router.get("/", authenticate, requireAdmin, getOrders);
router.get("/:id", authenticate, requireAdmin, getOrderById);
router.put("/:id", authenticate, requireAdmin, updateOrderStatus);

export default router;
