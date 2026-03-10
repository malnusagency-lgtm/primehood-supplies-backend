import { prisma } from "../lib/prisma";

export class ProductService {
    static async getProducts(query: any) {
        const { category, brand, search, featured, isNew, sort = "featured", page = "1", limit = "50" } = query;
        const where: any = {};

        if (category) where.category = { slug: category };
        if (brand) where.brand = { in: brand.split(",") };
        if (search) {
            const q = search.toLowerCase();
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { tags: { contains: q, mode: "insensitive" } },
            ];
        }
        if (featured === "true") where.featured = true;
        if (isNew === "true") where.isNew = true;

        let orderBy: any = { featured: "desc" };
        switch (sort) {
            case "price-asc": orderBy = { price: "asc" }; break;
            case "price-desc": orderBy = { price: "desc" }; break;
            case "newest": orderBy = { createdAt: "desc" }; break;
            case "rating": orderBy = { rating: "desc" }; break;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            prisma.product.findMany({ where, include: { category: true }, orderBy, skip, take: limitNum }),
            prisma.product.count({ where }),
        ]);

        return {
            products: products.map((p: any) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                description: p.description,
                price: p.price,
                comparePrice: p.comparePrice,
                currency: "KES",
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
            })),
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        };
    }

    static async getProductBySlug(slug: string) {
        const product: any = await prisma.product.findUnique({
            where: { slug },
            include: { category: true },
        });

        if (!product) return null;

        return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice,
            currency: "KES",
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
    }

    static async createProduct(data: any) {
        const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
        if (existing) throw new Error("Product slug already exists");

        return prisma.product.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                price: data.price,
                comparePrice: data.comparePrice,
                images: JSON.stringify(data.images || []),
                brand: data.brand,
                sizes: JSON.stringify(data.sizes || []),
                colors: data.colors || null,
                stockCount: data.stockCount || 0,
                tags: JSON.stringify(data.tags || []),
                featured: data.featured || false,
                isNew: data.isNew || false,
                categoryId: data.categoryId,
            },
            include: { category: true },
        });
    }

    static async updateProduct(id: string, data: any) {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return null;

        const { images, sizes, tags, ...rest } = data;
        const processData: any = { ...rest };

        if (images) processData.images = JSON.stringify(images);
        if (sizes) processData.sizes = JSON.stringify(sizes);
        if (tags) processData.tags = JSON.stringify(tags);

        return prisma.product.update({
            where: { id },
            data: processData,
            include: { category: true },
        });
    }

    static async deleteProduct(id: string) {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return null;

        await prisma.product.delete({ where: { id } });
        return true;
    }

    static async getBrands() {
        const brands = await prisma.product.findMany({ select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } });
        return brands.map((b) => b.brand);
    }
}
