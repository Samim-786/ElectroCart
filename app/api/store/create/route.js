import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { imagekit } from "@/configs/imageKit";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!name || !username || !description || !email || !contact || !address || !image) {
      return NextResponse.json(
        { error: "Missing store info" },
        { status: 400 }
      );
    }

    // Check if store already exists
    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (store)
      return NextResponse.json({ status: store.status });

    // Check if username exists
    const isTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });

    if (isTaken)
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );

    // Upload image to ImageKit
    const buffer = Buffer.from(await image.arrayBuffer());

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    // Generate optimized URL
    const optimizedImage = imagekit.url({
      src: uploaded.url,
      transformation: [
        { q: "auto" }, // quality
        { f: "webp" }, // format
        { w: 512 },    // width
      ],
    });

    // Create store
    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase(),
        email,
        contact,
        address,
        logo: optimizedImage,
      },
    });

    // Link user to store
    await prisma.user.update({
      where: { id: userId },
      data: {
        store: {
          connect: { id: newStore.id },
        },
      },
    });

    return NextResponse.json({
      message: "Applied,waiting for approval...",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 400 }
    );
  }
}

// GET — check store status
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId)
      return NextResponse.json({ status: "not registered" });

    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (store) return NextResponse.json({ status: store.status });

    return NextResponse.json({ status: "not registered" });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}
