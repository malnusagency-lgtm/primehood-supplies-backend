import { Router } from "express";
import { z } from "zod";
import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getBrands,
} from "../controllers/product.controller";
import { validate } from "../middleware/validate";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        slug: z.string().min(1, "Slug is required"),
        description: z.string().min(1, "Description is required"),
        price: z.number().positive("Price must be positive"),
        comparePrice: z.number().positive().optional(),
        images: z.array(z.string()).optional(),
        brand: z.string().min(1, "Brand is required"),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
        stockCount: z.number().int().min(0).optional(),
        tags: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        isNew: z.boolean().optional(),
        categoryId: z.string().min(1, "Category is required"),
    }),
});

// Public routes
router.get("/", getProducts);
router.get("/brands", getBrands);
router.get("/:slug", getProductBySlug);

// Protected routes (admin only)
router.post("/", authenticate, requireAdmin, validate(createProductSchema), createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;
