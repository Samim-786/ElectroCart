//get store info and products

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req){
    try {
        const {searchParams}=new URL(req.url);
        const username=searchParams.get("username").toLowerCase();
        if(!username) return NextResponse.json({error:"missing username"},{status:400});

        //get store info
        const store=await prisma.store.findUnique({
            where:{username,isActive:true},
            include:{Product:{include:{rating:true}}}
        });
        if(!store) return  NextResponse.json({error:"store not found"},{status:400});
        return NextResponse.json({store})
    } catch (error) {
        console.error(error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 400 }
    );
    }
}