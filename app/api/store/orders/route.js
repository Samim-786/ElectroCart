import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//update seller order status
export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        const storeId = await authSeller(userId);
        if (!storeId) return NextResponse.json({ error: 'not authorized' }, { status: 401 })

        const { orderId, status } = await req.json()
        await prisma.order.update({
            where: { id: orderId, storeId },
            data: { status }
        })
        return NextResponse.json({ message: "Order status updated" })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: 400 }
        );
    }
}

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId); 
        
        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { storeId: storeId }, // Fixed field name
            include: {
                user: {
                    select: { name: true, email: true, image: true } // Better security: only get what you need
                },
                address: true,
                orderItems: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Seller Orders Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}