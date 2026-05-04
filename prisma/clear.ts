import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearData() {
    console.log("🧹 Clearing existing data for launch...");
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.customer.deleteMany({});
    console.log("✅ Orders and customers cleared.");
}

clearData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
