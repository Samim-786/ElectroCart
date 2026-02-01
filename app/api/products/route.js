import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req) {
    try {
        let products = await prisma.product.findMany({
            where: { inStock: true },
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: { select: { name: true, image: true } }
                    }
                },
                store: true
            },
            orderBy: { createdAt: 'desc' }
        })
        products = products.filter(prod => prod.store.isActive)
        return NextResponse.json({ products })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: 400 })
    }
}

