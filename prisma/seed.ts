import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...\n");

    // === 1. Create admin user ===
    const hashedPassword = await bcrypt.hash("Admin@2026!", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@primehood.co.ke" },
        update: {},
        create: {
            email: "admin@primehood.co.ke",
            password: hashedPassword,
            name: "FG Kibe",
            role: "ADMIN",
        },
    });
    console.log(`✅ Admin user: ${admin.email}`);

    // === 2. Create categories ===
    const categoryData = [
        { name: "Football", slug: "football", icon: "⚽" },
        { name: "Basketball", slug: "basketball", icon: "🏀" },
        { name: "Athletics", slug: "athletics", icon: "🏃" },
        { name: "School Uniforms", slug: "school-uniforms", icon: "👔" },
        { name: "Trophies & Awards", slug: "trophies-awards", icon: "🏆" },
        { name: "Sports Accessories", slug: "accessories", icon: "🎒" },
        { name: "Hockey", slug: "hockey", icon: "🏑" },
        { name: "Volleyball", slug: "volleyball", icon: "🏐" },
        { name: "Swimming", slug: "swimming", icon: "🏊" },
    ];

    const categories: Record<string, string> = {};
    for (const cat of categoryData) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        categories[cat.slug] = created.id;
        console.log(`✅ Category: ${cat.icon} ${cat.name}`);
    }

    // === 3. Seed products ===
    const products = [
        // Football
        {
            slug: "adidas-al-rihla-pro",
            name: "Adidas Al Rihla Pro Ball",
            description: "Official match ball of the FIFA World Cup. Seamless surface for predictable trajectory.",
            price: 15000, comparePrice: 18000, brand: "Adidas",
            images: ["/images/p1.jpeg", "/images/p6.jpeg"],
            stockCount: 25, rating: 5.0, reviewCount: 42, featured: true, isNew: true,
            tags: ["football", "ball", "adidas", "match"],
            categorySlug: "football",
        },
        {
            slug: "nike-flight-ball",
            name: "Nike Flight Ball",
            description: "Revolutionary aerodynamics for consistent flight. All Conditions Control (ACC) technology.",
            price: 14500, brand: "Nike",
            images: ["/images/p4.jpeg", "/images/p6.jpeg"],
            stockCount: 30, rating: 4.8, reviewCount: 35,
            tags: ["football", "ball", "nike"],
            categorySlug: "football",
        },
        {
            slug: "standard-training-football",
            name: "Standard Training Football",
            description: "Durable PU leather football perfect for daily training sessions. Size 5.",
            price: 2500, comparePrice: 3000, brand: "Mikasa",
            images: ["/images/p1.jpeg", "/images/p2.jpeg"],
            stockCount: 100, rating: 4.5, reviewCount: 120,
            tags: ["football", "training", "ball"],
            categorySlug: "football",
        },
        {
            slug: "agility-cones-set",
            name: "Agility Cones (Set of 50)",
            description: "High-visibility marker cones with carrying stand. Essential for drills.",
            price: 1800, brand: "Primehood",
            images: ["/images/p22.jpeg", "/images/p21.jpeg"],
            stockCount: 50, rating: 4.7, reviewCount: 15,
            tags: ["training", "cones", "football"],
            categorySlug: "football",
        },
        {
            slug: "football-goal-net",
            name: "Football Goal Net (Pair)",
            description: "Professional standard 11-a-side goal nets. Weather-resistant nylon.",
            price: 8500, brand: "Primehood",
            images: ["/images/p20.jpeg", "/images/p19.jpeg"],
            stockCount: 10, rating: 4.8, reviewCount: 8,
            tags: ["football", "net", "goal"],
            categorySlug: "football",
        },
        // Basketball
        {
            slug: "molten-bg4500",
            name: "Molten BG4500 Basketball",
            description: "FIBA approved premium leather basketball. Official game ball size 7.",
            price: 8500, comparePrice: 9500, brand: "Molten",
            images: ["/images/p22.jpeg", "/images/p1.jpeg"],
            stockCount: 40, rating: 4.9, reviewCount: 65, featured: true, isNew: true,
            tags: ["basketball", "molten", "fiba"],
            categorySlug: "basketball",
        },
        {
            slug: "spalding-tf-1000",
            name: "Spalding TF-1000 Legacy",
            description: "Deep channel design for superior grip. Indoor competition ball.",
            price: 9000, brand: "Spalding",
            images: ["/images/p22.jpeg", "/images/p4.jpeg"],
            stockCount: 35, rating: 4.8, reviewCount: 40,
            tags: ["basketball", "spalding", "indoor"],
            categorySlug: "basketball",
        },
        {
            slug: "basketball-net-heavy-duty",
            name: "Heavy Duty Basketball Net",
            description: "All-weather chain or nylon net replacement. Anti-whip design.",
            price: 1200, brand: "Primehood",
            images: ["/images/p20.jpeg", "/images/p19.jpeg"],
            stockCount: 60, rating: 4.6, reviewCount: 22,
            tags: ["basketball", "net"],
            categorySlug: "basketball",
        },
        // Athletics
        {
            slug: "running-spikes-sprint",
            name: "Running Spikes (Sprint)",
            description: "Lightweight sprint spikes for 100m-400m. Includes spike key.",
            price: 6500, comparePrice: 7500, brand: "Nike",
            images: ["/images/p7.jpeg", "/images/p6.jpeg"],
            sizes: ["39", "40", "41", "42", "43", "44"],
            stockCount: 45, rating: 4.7, reviewCount: 30, featured: true,
            tags: ["athletics", "spikes", "running"],
            categorySlug: "athletics",
        },
        {
            slug: "relay-batons-set",
            name: "Relay Batons (Set of 8)",
            description: "Aluminum anodized relay batons in assorted colors. IAAF standard.",
            price: 3200, brand: "Primehood",
            images: ["/images/p21.jpeg", "/images/p22.jpeg"],
            stockCount: 25, rating: 4.5, reviewCount: 12,
            tags: ["athletics", "relay", "baton"],
            categorySlug: "athletics",
        },
        {
            slug: "starting-blocks",
            name: "Starting Blocks",
            description: "Professional aluminum starting blocks with adjustable pedals.",
            price: 12500, brand: "Primehood",
            images: ["/images/p18.jpeg", "/images/p19.jpeg"],
            stockCount: 12, rating: 5.0, reviewCount: 8, isNew: true,
            tags: ["athletics", "starting-blocks"],
            categorySlug: "athletics",
        },
        {
            slug: "shot-put-men",
            name: "Shot Put (7.26kg - Men)",
            description: "Competition grade steel shot put. Perfectly balanced.",
            price: 5500, brand: "Primehood",
            images: ["/images/p22.jpeg", "/images/p21.jpeg"],
            stockCount: 15, rating: 4.8, reviewCount: 14,
            tags: ["athletics", "field", "shot-put"],
            categorySlug: "athletics",
        },
        // Uniforms
        {
            slug: "full-team-kit",
            name: "Full Team Kit (15 Players)",
            description: "Complete set of 15 jerseys and shorts. Numbered 1-15 + GK kit.",
            price: 22500, comparePrice: 25000, brand: "Primehood",
            images: ["/images/p8.jpeg", "/images/p10.jpeg"],
            sizes: ["S", "M", "L", "XL"],
            stockCount: 10, rating: 4.9, reviewCount: 88, featured: true, isNew: true,
            tags: ["uniform", "football", "kit", "team"],
            categorySlug: "school-uniforms",
        },
        {
            slug: "training-bibs-set",
            name: "Training Bibs (Set of 10)",
            description: "Breathable mesh bibs. Available in Neon Green, Orange, Yellow.",
            price: 3500, brand: "Primehood",
            images: ["/images/p11.jpeg", "/images/p12.jpeg"],
            stockCount: 50, rating: 4.6, reviewCount: 45,
            tags: ["training", "bibs"],
            categorySlug: "school-uniforms",
        },
        {
            slug: "custom-tracksuit",
            name: "Custom School Tracksuit",
            description: "Polyester tracksuit with jacket and pants. Custom embroidery available.",
            price: 3500, brand: "Primehood",
            images: ["/images/p13.jpeg", "/images/p14.jpeg"],
            sizes: ["S", "M", "L", "XL"],
            stockCount: 100, rating: 4.7, reviewCount: 120,
            tags: ["tracksuit", "school", "uniform"],
            categorySlug: "school-uniforms",
        },
        {
            slug: "referee-kit",
            name: "Official Referee Kit",
            description: "Official referee shirt, shorts, and socks. Wicking fabric.",
            price: 4500, brand: "Primehood",
            images: ["/images/p9.jpeg", "/images/p10.jpeg"],
            sizes: ["M", "L", "XL"],
            stockCount: 20, rating: 4.5, reviewCount: 18,
            tags: ["referee", "uniform"],
            categorySlug: "school-uniforms",
        },
        // Trophies & Awards
        {
            slug: "gold-winner-cup",
            name: "Gold Winner Cup (Large)",
            description: "24-inch gold plated trophy cup with marble base. Engraving included.",
            price: 4500, brand: "Primehood",
            images: ["/images/p22.jpeg", "/images/p21.jpeg"],
            stockCount: 30, rating: 5.0, reviewCount: 52, featured: true,
            tags: ["trophy", "gold", "award"],
            categorySlug: "trophies-awards",
        },
        {
            slug: "silver-runner-up-cup",
            name: "Silver Runner-Up Cup",
            description: "18-inch silver plated trophy cup. Classic design.",
            price: 3200, brand: "Primehood",
            images: ["/images/p22.jpeg", "/images/p20.jpeg"],
            stockCount: 30, rating: 4.8, reviewCount: 41,
            tags: ["trophy", "silver", "award"],
            categorySlug: "trophies-awards",
        },
        {
            slug: "medals-set-50",
            name: "Medals (Set of 50)",
            description: "Gold, Silver, Bronze assorted medals with ribbons.",
            price: 12500, brand: "Primehood",
            images: ["/images/p21.jpeg", "/images/p22.jpeg"],
            stockCount: 100, rating: 4.9, reviewCount: 200, featured: true,
            tags: ["medals", "bulk", "award"],
            categorySlug: "trophies-awards",
        },
        {
            slug: "crystal-plaque",
            name: "Crystal Plaque Award",
            description: "Premium glass/crystal plaque for special recognition. Laser engraving.",
            price: 5500, brand: "Primehood",
            images: ["/images/p17.jpeg", "/images/p18.jpeg"],
            stockCount: 25, rating: 5.0, reviewCount: 15, isNew: true,
            tags: ["plaque", "crystal", "award"],
            categorySlug: "trophies-awards",
        },
        // Hockey
        {
            slug: "composite-hockey-stick",
            name: "Composite Hockey Stick",
            description: "Carbon fiber composite stick for advanced players. Mid-bow.",
            price: 8500, brand: "Grays",
            images: ["/images/p15.jpeg", "/images/p16.jpeg"],
            stockCount: 20, rating: 4.8, reviewCount: 22,
            tags: ["hockey", "stick"],
            categorySlug: "hockey",
        },
        // Volleyball
        {
            slug: "mikasa-v200w",
            name: "Mikasa V200W",
            description: "Official FIVB game ball. Aerodynamic dimple surface.",
            price: 8500, brand: "Mikasa",
            images: ["/images/p1.jpeg", "/images/p4.jpeg"],
            stockCount: 40, rating: 5.0, reviewCount: 80, featured: true, isNew: true,
            tags: ["volleyball", "ball", "fivb"],
            categorySlug: "volleyball",
        },
        {
            slug: "volleyball-knee-pads",
            name: "Volleyball Knee Pads",
            description: "Pro-level shock absorbing knee protection.",
            price: 2500, brand: "Mizuno",
            images: ["/images/p11.jpeg", "/images/p12.jpeg"],
            stockCount: 60, rating: 4.7, reviewCount: 45,
            tags: ["volleyball", "protection"],
            categorySlug: "volleyball",
        },
        {
            slug: "volleyball-net-competition",
            name: "Volleyball Net (Competition)",
            description: "Steel cable top competition net with antennas.",
            price: 6500, brand: "Mikasa",
            images: ["/images/p19.jpeg", "/images/p20.jpeg"],
            stockCount: 15, rating: 4.8, reviewCount: 12,
            tags: ["volleyball", "net"],
            categorySlug: "volleyball",
        },
    ];

    let productCount = 0;
    for (const p of products) {
        const { categorySlug, ...productData } = p;
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                ...productData,
                comparePrice: productData.comparePrice || null,
                sizes: productData.sizes || [],
                featured: productData.featured || false,
                isNew: productData.isNew || false,
                categoryId: categories[categorySlug],
            },
        });
        productCount++;
    }
    console.log(`\n✅ Seeded ${productCount} products`);

    // === 4. Seed sample orders ===
    const customer = await prisma.customer.upsert({
        where: { email: "john@email.com" },
        update: {},
        create: { name: "John Kamau", email: "john@email.com", phone: "0712 345 678" },
    });

    const sampleOrder = await prisma.order.upsert({
        where: { orderNumber: "PH-20260215-001" },
        update: {},
        create: {
            orderNumber: "PH-20260215-001",
            customerId: customer.id,
            subtotal: 15000,
            vat: 2400,
            shipping: 200,
            total: 17600,
            status: "PROCESSING",
            paymentMethod: "MPESA",
            paymentStatus: "PAID",
            address: "123 Moi Ave",
            town: "Westlands",
            county: "Nairobi",
            items: {
                create: [
                    { name: "Adidas Al Rihla Pro Ball", quantity: 1, price: 15000 },
                ],
            },
        },
    });
    console.log(`✅ Sample order: ${sampleOrder.orderNumber}`);

    console.log("\n🎉 Database seeded successfully!\n");
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
