import { Request, Response } from "express";
import { OrderService } from "../services/order.service";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await OrderService.getOrders(req.query);
        res.json(result);
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderService.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderService.updateOrderStatus(req.params.id as string, req.body);
        res.json(order);
    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({ error: "Failed to update order" });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderService.getOrderById(req.params.id as string);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
};
