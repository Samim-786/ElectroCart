import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//get all approved stores

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
        where:{status:"approved"},
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
