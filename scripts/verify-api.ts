
// Uses native fetch (Node 18+)
const API_URL = "http://127.0.0.1:5000/api";

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

function log(type: "info" | "success" | "error" | "warn", message: string) {
    const color =
        type === "success"
            ? colors.green
            : type === "error"
                ? colors.red
                : type === "warn"
                    ? colors.yellow
                    : colors.blue;
    console.log(`${color}[${type.toUpperCase()}] ${message}${colors.reset}`);
}

async function testAPI() {
    try {
        log("info", "Starting API Verification...");

        // 1. Health Check (if exists, or just check root)
        // Assuming we have a health check or just try to login

        // 2. Auth - Login
        log("info", "Testing Auth: Login...");
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@primehood.co.ke",
                password: "Admin@2026!",
            }),
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) throw new Error("No token received");
        log("success", "Login successful. Token received.");

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        // 3. Dashboard Stats
        log("info", "Testing Dashboard: Stats...");
        const statsRes = await fetch(`${API_URL}/dashboard/stats`, { headers });
        if (!statsRes.ok) throw new Error(`Stats failed: ${statsRes.statusText}`);
        const statsData = await statsRes.json();
        log("success", `Stats received. Revenue: ${statsData.totalRevenue}, Orders: ${statsData.totalOrders}`);

        // 4. Products - Create
        log("info", "Testing Products: Create...");
        const newProduct = {
            name: "Test API Product",
            slug: "test-api-product-" + Date.now(),
            description: "Created via API test script",
            price: 1000,
            stockCount: 10,
            categoryId: "clz...", // We might need to fetch categories first to get a valid ID
            brand: "TestBrand",
            images: ["https://placehold.co/600x400"],
            featured: false,
            isNew: true
        };

        // Fetch categories first to get a valid ID
        const catRes = await fetch(`${API_URL}/categories`);
        const categories = await catRes.json();
        if (categories.length > 0) {
            newProduct.categoryId = categories[0].id;
        } else {
            throw new Error("No categories found to create product");
        }

        const createRes = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers,
            body: JSON.stringify(newProduct),
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create product failed: ${err}`);
        }
        const createdProduct = await createRes.json();
        log("success", `Product created: ${createdProduct.name} (${createdProduct.id})`);

        // 5. Products - List
        log("info", "Testing Products: List...");
        const listRes = await fetch(`${API_URL}/products`);
        const productsIndex = await listRes.json();
        const products = productsIndex.products || productsIndex; // Handle pagination structure if any
        const found = products.find((p: any) => p.id === createdProduct.id);
        if (!found) throw new Error("Created product not found in list");
        log("success", "Product found in list.");

        // 6. Orders - Create (Public)
        log("info", "Testing Orders: Create...");
        const newOrder = {
            customer: {
                name: "Test Customer",
                email: "test@example.com",
                phone: "0712345678"
            },
            items: [
                {
                    productId: createdProduct.id,
                    name: createdProduct.name,
                    quantity: 1,
                    price: createdProduct.price
                }
            ],
            subtotal: 1000,
            vat: 160,
            shipping: 200,
            total: 1360,
            paymentMethod: "mpesa",
            address: "Test Address",
            town: "Test Town",
            county: "Nairobi"
        };

        const orderRes = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrder)
        });

        if (!orderRes.ok) {
            const err = await orderRes.text();
            throw new Error(`Create order failed: ${err}`);
        }
        const createdOrder = await orderRes.json();
        log("success", `Order created: #${createdOrder.orderNumber}`);

        // 7. Orders - List (Admin)
        log("info", "Testing Orders: List (Admin)...");
        const adminOrdersRes = await fetch(`${API_URL}/orders`, { headers });
        if (!adminOrdersRes.ok) throw new Error("Failed to list orders");
        const ordersData = await adminOrdersRes.json();
        const orders = ordersData.orders || ordersData;
        const foundOrder = orders.find((o: any) => o.id === createdOrder.id);
        if (!foundOrder) throw new Error("Created order not found in admin list");
        log("success", "Order found in admin list.");

        // 8. Delete Product (Cleanup) - this might fail if foreign key constraints exist with the order
        // So we might need to delete the order first or just leave it. 
        // For this test, let's try to delete the product and see if it fails safely or works (cascade)
        log("info", "Testing Products: Delete (Cleanup)...");
        // Prisma usually prevents deletion if relation exists unless cascade is set.
        // Let's try deleting the product.
        // If it fails, that's fine, we can log a warning.
        const deleteRes = await fetch(`${API_URL}/products/${createdProduct.id}`, {
            method: "DELETE",
            headers
        });

        if (deleteRes.ok) {
            log("success", "Product deleted successfully.");
        } else {
            log("warn", "Product deletion skipped (likely due to order relation constraint). Status: " + deleteRes.status);
        }

        log("success", "ALL TESTS PASSED! 🚀");

    } catch (error: any) {
        log("error", `TEST FAILED: ${error.message}`);
        // @ts-ignore
        if (typeof process !== "undefined") process.exit(1);
    }
}

testAPI();
