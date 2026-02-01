import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { userId, has } = getAuth(req);
        if (!userId) return NextResponse.json({ message: "Not authorized" }, { status: 401 });

        const { addressId, items, couponCode, paymentMethod } = await req.json();

        // 1. Validation Logic
        if (!addressId || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
            return NextResponse.json({ message: "Missing order details" }, { status: 400 });
        }

        // 2. Coupon Validation
        let coupon = null;
        if (couponCode) {
            coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });
            if (!coupon) return NextResponse.json({ message: "Coupon not found" }, { status: 400 });
            if (new Date() > new Date(coupon.expiresAt)) {
                return NextResponse.json({ message: "Coupon expired" }, { status: 400 });
            }
        }

        // 3. User Eligibility Checks
        const isPlusMember = has({ plan: 'plus' });
        if (coupon?.forNewUser) {
            const hasPreviousOrders = await prisma.order.findFirst({ where: { userId } });
            if (hasPreviousOrders) return NextResponse.json({ error: "New users only" }, { status: 400 });
        }
        if (coupon?.forMember && !isPlusMember) {
            return NextResponse.json({ error: "Plus members only" }, { status: 400 });
        }

        // 4. Fetch and Group Products
        const products = await prisma.product.findMany({
            where: { id: { in: items.map(i => i.id) } }
        });

        const ordersByStore = new Map();
        products.forEach(product => {
            const itemDetails = items.find(i => i.id === product.id);
            if (!ordersByStore.has(product.storeId)) ordersByStore.set(product.storeId, []);
            ordersByStore.get(product.storeId).push({ 
                ...itemDetails, 
                price: product.price 
            });
        });

        let totalCartAmount = 0;
        let isShippingFeeAdded = false;

        // 5. Execute DB Transaction (Create PENDING orders)
        const createdOrderIds = await prisma.$transaction(async (tx) => {
            const ids = [];

            for (const [storeId, sellerItems] of ordersByStore.entries()) {
                let storeTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                if (coupon) storeTotal -= (storeTotal * coupon.discount) / 100;
                if (!isPlusMember && !isShippingFeeAdded) {
                    storeTotal += 5; // Flat shipping fee
                    isShippingFeeAdded = true;
                }

                totalCartAmount += storeTotal;

                const order = await tx.order.create({
                    data: {
                        userId,
                        storeId,
                        addressId,
                        total: parseFloat(storeTotal.toFixed(2)),
                        paymentMethod,
                        isPaid: false, // Default to false
                        orderItems: {
                            create: sellerItems.map(item => ({
                                productId: item.id,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        }
                    }
                });
                ids.push(order.id);
            }

            // Clear Cart
            await tx.user.update({
                where: { id: userId },
                data: { cart: {} }
            });

            return ids;
        });

        // 6. Handle Stripe Payment
        if (paymentMethod === 'STRIPE') {
            const origin = req.headers.get('origin');
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: `Order Total (${createdOrderIds.length} stores)` },
                        unit_amount: Math.round(totalCartAmount * 100) // Cents
                    },
                    quantity: 1
                }],
                expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
                mode: 'payment',
                success_url: `${origin}/loading?nextUrl=orders&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderIds: createdOrderIds.join(','),
                    userId,
                    appId: 'electroCart'
                }
            });

            return NextResponse.json({ session});
        }

        return NextResponse.json({ message: "Order placed successfully", orderIds: createdOrderIds });

    } catch (error) {
        console.error("Order Error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const orders = await prisma.order.findMany({
            where: {
                userId,
                OR: [
                    { paymentMethod: PaymentMethod.COD },
                    { AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }] }
                ]
            },
            include: {
                orderItems: { include: { product: true } },
                address: true,
                store: { select: { name: true, logo: true } } // Added store info for UI
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}