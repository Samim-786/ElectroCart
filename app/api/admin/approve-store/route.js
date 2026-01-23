import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Approve store
export async function POST(req) {
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

    const { storeId, status } = await req.json();

    if (!storeId || !status) {
      return NextResponse.json(
        { error: "storeId and status are required" },
        { status: 400 }
      );
    }

    if (status === "approved") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "approved", isActive: true }
      });
    } else if (status === "rejected") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "rejected", isActive: false }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: `${status} successfully` },
      { status: 200 }
    );

  } catch (error) {
    console.log("Approve Store Error:", error);
    return NextResponse.json(
      { error: error?.code || error?.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

//get all pending and rejeced stores

export async function GET(req){
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
    const stores=await prisma.store.findMany({
        where:{status:{in:["pending","rejected"]}},
        include:{user:true}
    })
     return NextResponse.json({stores})
    } catch (error) {
        console.log("Approve Store Error:", error);
        return NextResponse.json(
      { error: error?.code || error?.message || "Something went wrong" },
      { status: 400 }
    );
    }
}
