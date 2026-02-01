import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * POST: Add a new rating
 * Expects: { orderId, productId, rating, review }
 */
export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, productId, rating, review } = await req.json();

        // 1. Verify the order exists and belongs to this user
        // We use findFirst because we are filtering by id AND userId
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
            },
            include: {
                orderItems: true // Load items to verify the product was in this order
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
        }

        // 2. Security Check: Verify the product was actually part of this order
        const productInOrder = order.orderItems.find(item => item.productId === productId);
        if (!productInOrder) {
            return NextResponse.json({ error: "Product not found in this order" }, { status: 400 });
        }

        // 3. Check if already rated (though your schema unique constraint also handles this)
        const isAlreadyRated = await prisma.rating.findFirst({
            where: {
                userId,
                productId,
                orderId
            }
        });

        if (isAlreadyRated) {
            return NextResponse.json({ error: "You have already rated this product for this order" }, { status: 400 });
        }

        // 4. Create the rating
        const newRating = await prisma.rating.create({
            data: {
                userId,
                productId,
                orderId,
                rating: Number(rating), // Ensure it's a number
                review
            }
        });

        return NextResponse.json({ 
            message: "Rating added successfully", 
            rating: newRating 
        }, { status: 201 });

    } catch (error) {
        console.error("RATING_POST_ERROR:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * GET: Fetch all ratings for the logged-in user
 */
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ratings = await prisma.rating.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        name: true,
                        images: true,
                        price: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ ratings });
    } catch (error) {
        console.error("RATING_GET_ERROR:", error);
        return NextResponse.json(
            { error: "Could not fetch ratings" },
            { status: 500 }
        );
    }
}