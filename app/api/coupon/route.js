

//verify coupon

import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req){
    try {
        const {userId,has}=getAuth(req)
        const {code}=await req.json();
        const coupon=await prisma.coupon.findUnique({
            where:{code:code.toUpperCase(),
                expiresAt:{gt:new Date()}
            }
        })
        if(!coupon) return NextResponse.json({error:"Invalid Coupon"},{status:404})

        if(coupon.forNewUser){
            const userorders=await prisma.order.findMany({where:{userId}})
            if(userorders.length>0) return NextResponse.json({error:"Coupon is valid only for new users"},{status:404});
        }
        if(coupon.forMember){
            const hasPlan=has({plan:'plus'})
            if(!hasPlan) return  NextResponse.json({error:"Coupon is valid for only plus members"},{status:404});
        }
        return NextResponse.json({coupon});   
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: 400 })
    }
}