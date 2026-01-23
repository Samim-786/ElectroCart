


import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//toggle Store isActive

export async function POST(req){
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
    const {storeId}=await req.json()
    if(!storeId) return NextResponse.json({error:"missing storeId"},{status:400});
    const store=await prisma.store.findUnique({where:{id:storeId}})
    if(!storeId) return NextResponse.json({error:"store not found"},{status:400});
    await prisma.store.update({
        where:{id:storeId},
        data:{isActive:!store.isActive}
    })
    return NextResponse.json({message:"store updated succesfully"})
    } catch (error) {
        console.log("Approve Store Error:", error);
        return NextResponse.json(
      { error: error?.code || error?.message || "Something went wrong" },
      { status: 400 }
    );
    }
}
