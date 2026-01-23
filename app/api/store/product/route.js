import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { imagekit } from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";

export async function POST(request) {
  try {
    // Auth
    const { userId } = getAuth(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId)
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    // Get form data
    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const images = formData.getAll("images"); // array of File

    if (
      !name ||
      !description ||
      !category ||
      !mrp ||
      !price ||
      images.length < 1
    ) {
      return NextResponse.json(
        { error: "Missing product details" },
        { status: 400 }
      );
    }

    // Upload images to ImageKit
    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        const uploaded = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        return imagekit.url({
          path:uploaded.filePath,
          transformation: [
            { q: "auto" },
            { f: "webp" },
            { w: 1024 },
          ],
        });
      })
    );

    // Save product
    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({
      message: "Product added successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 400 }
    );
  }
}

export async function GET(request){
    try {
        const { userId } = getAuth(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId)
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    const products=await prisma.product.findMany({
        whrere:{storeId}
    })
    return NextResponse.json({products});

    } catch (error) {
        console.error(error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 400 }
    );
    }
}
