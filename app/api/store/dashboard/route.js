//get Dashboard Data for seller (total products,total earnings,total orderes)

import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);

        //get all orders
        const orders = await prisma.order.findMany({ where: { storeId } })

        //get all products with ratings for seller
        const products = await prisma.product.findMany({ where: { storeId } })

        let ratings = [];
        if (products.length > 0) {
            ratings = await prisma.rating.findMany({
                where: { productId: { in: products.map(p => p.id) } },
                include: {
                    user: true,      // Include user data
                    product: true    // Include product data
                }
            });
        }
        
        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
            totalProducts: products.length
        }
        return NextResponse.json({ dashboardData })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: 400 }
        );
    }
}