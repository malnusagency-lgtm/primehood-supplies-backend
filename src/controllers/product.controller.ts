import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await ProductService.getProducts(req.query);
        res.json(result);
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductService.getProductBySlug(req.params.slug);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error: any) {
        console.error("Create product error:", error);
        if (error.message === "Product slug already exists") {
            res.status(409).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Failed to create product" });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductService.updateProduct(req.params.id, req.body);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json(product);
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const success = await ProductService.deleteProduct(req.params.id);
        if (!success) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
    try {
        const brands = await ProductService.getBrands();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brands" });
    }
};
