import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";

// Toggle stock of a product
export async function POST(request) {
  try {
    // Auth
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: "Missing details: productId" },
        { status: 400 }
      );
    }

    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.storeId !== storeId) {
      return NextResponse.json(
        { error: "No product found" },
        { status: 404 }
      );
    }

    await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock },
    });

    return NextResponse.json({
      message: "Product stock updated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 400 }
    );
  }
}
