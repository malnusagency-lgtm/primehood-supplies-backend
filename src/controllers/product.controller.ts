import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/products — Public, with filters
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = req.query.category as string | undefined;
        const brand = req.query.brand as string | undefined;
        const search = req.query.search as string | undefined;
        const featured = req.query.featured as string | undefined;
        const isNewParam = req.query.isNew as string | undefined;
        const sort = (req.query.sort as string) || "featured";
        const page = (req.query.page as string) || "1";
        const limit = (req.query.limit as string) || "50";

        const where: any = {};

        if (category) {
            where.category = { slug: category };
        }

        if (brand) {
            where.brand = { in: brand.split(",") };
        }

        if (search) {
            const q = search.toLowerCase();
            where.OR = [
                { name: { contains: q } }, // SQLite doesn't support mode: insensitive easily, but we'll try
                { description: { contains: q } },
                { brand: { contains: q } },
                { tags: { contains: q } },
            ];
        }

        if (featured === "true") where.featured = true;
        if (isNewParam === "true") where.isNew = true;

        // Sorting
        let orderBy: any = { featured: "desc" };
        switch (sort) {
            case "price-asc":
                orderBy = { price: "asc" };
                break;
            case "price-desc":
                orderBy = { price: "desc" };
                break;
            case "newest":
                orderBy = { createdAt: "desc" };
                break;
            case "rating":
                orderBy = { rating: "desc" };
                break;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy,
                skip,
                take: limitNum,
            }),
            prisma.product.count({ where }),
        ]);

        // Transform for frontend compatibility
        const transformed = products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice,
            currency: "KES" as const,
            images: JSON.parse(p.images),
            category: p.category,
            brand: p.brand,
            sizes: JSON.parse(p.sizes),
            colors: p.colors,
            inStock: p.stockCount > 0,
            stockCount: p.stockCount,
            rating: p.rating,
            reviewCount: p.reviewCount,
            tags: JSON.parse(p.tags),
            featured: p.featured,
            isNew: p.isNew,
        }));

        res.json({
            products: transformed,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// GET /api/products/:slug — Public
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const slug = req.params.slug as string;
        const product: any = await prisma.product.findUnique({
            where: { slug },
            include: { category: true },
        });

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        const transformed = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice,
            currency: "KES" as const,
            images: JSON.parse(product.images),
            category: product.category,
            brand: product.brand,
            sizes: JSON.parse(product.sizes),
            colors: product.colors,
            inStock: product.stockCount > 0,
            stockCount: product.stockCount,
            rating: product.rating,
            reviewCount: product.reviewCount,
            tags: JSON.parse(product.tags),
            featured: product.featured,
            isNew: product.isNew,
        };

        res.json(transformed);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

// POST /api/products — Admin only
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name, slug, description, price, comparePrice,
            images, brand, sizes, colors, stockCount,
            tags, featured, isNew, categoryId,
        } = req.body;

        // Check slug uniqueness
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
            res.status(409).json({ error: "Product slug already exists" });
            return;
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price,
                comparePrice,
                images: JSON.stringify(images || []),
                brand,
                sizes: JSON.stringify(sizes || []),
                colors: colors || null,
                stockCount: stockCount || 0,
                tags: JSON.stringify(tags || []),
                featured: featured || false,
                isNew: isNew || false,
                categoryId,
            },
            include: { category: true },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
};

// PUT /api/products/:id — Admin only
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        const { images, sizes, tags, ...rest } = req.body;
        const data: any = { ...rest };

        if (images) data.images = JSON.stringify(images);
        if (sizes) data.sizes = JSON.stringify(sizes);
        if (tags) data.tags = JSON.stringify(tags);

        const product = await prisma.product.update({
            where: { id },
            data,
            include: { category: true },
        });

        res.json(product);
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

// DELETE /api/products/:id — Admin only
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        await prisma.product.delete({ where: { id } });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

// GET /api/products/brands — Public
export const getBrands = async (_req: Request, res: Response): Promise<void> => {
    try {
        const brands = await prisma.product.findMany({
            select: { brand: true },
            distinct: ["brand"],
            orderBy: { brand: "asc" },
        });

        res.json(brands.map((b) => b.brand));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brands" });
    }
};
