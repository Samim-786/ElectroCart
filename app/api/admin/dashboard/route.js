import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get Dashboard Data for Admin (total orders, total stores, total products, total revenue)
export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    // Fetch counts in parallel (faster)
    const [orders, stores, products] = await Promise.all([
      prisma.order.count(),
      prisma.store.count(),
      prisma.product.count()
    ]);

    // Fetch order revenue only (createdAt + total)
    const allOrders = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true
      }
    });

    // Calculate total revenue
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    const revenue = totalRevenue.toFixed(2);

    const Dashboard = {
      orders,
      stores,
      products,
      revenue,
      allOrders
    };

    return NextResponse.json({ Dashboard });

  } catch (error) {
    console.log("Admin Dashboard Error:", error);

    return NextResponse.json(
      { error: error?.code || error?.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
