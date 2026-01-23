

//Add new Coupn

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId } = getAuth(req)

        const isAdmin = await authAdmin(userId)
        
        if (!isAdmin) return NextResponse.json({ error: "not authorized" }, { status: 401 })

        const { coupon } = await req.json();

        coupon.code = coupon.code.toUpperCase()

        await prisma.coupon.create({ data: coupon }).then(async(coupon)=>{
            //run inngest schedular function to delete coupon on expire
            await inngest.send({
                name:'coupon.expired',
                data:{
                    code:coupon.code,
                    expires_at:coupon.expiresAt,
                }
            })
        })
        
        return NextResponse.json({ message: "Coupon added successfully" })
    } catch (error) {
        console.log("Approve Store Error:", error);
        return NextResponse.json(
            { error: error?.code || error?.message || "Something went wrong" },
            { status: 400 }
        );
    }
}

//delete coupon /api/coupon?id=couponId

export async function DELETE(req) {
    try {
        const { userId } = getAuth(req)

        const isAdmin = await authAdmin(userId)
        
        if (!isAdmin) return NextResponse.json({ error: "not authorized" }, { status: 401 })

        const {params}=req.nextUrl 
        const code=params.get('code')
        await prisma.coupon.delete({where:{code}})

         return NextResponse.json({ message: "Coupon deleted successfully" })

    } catch (error) {
        console.log("Approve Store Error:", error);
        return NextResponse.json(
            { error: error?.code || error?.message || "Something went wrong" },
            { status: 400 }
        );
    }
}

//get All coupons

export async function GET(req) {
    try {
        const { userId } = getAuth(req)

        const isAdmin = await authAdmin(userId)
        
        if (!isAdmin) return NextResponse.json({ error: "not authorized" }, { status: 401 })

        
       const coupons= await prisma.coupon.findMany({})

         return NextResponse.json({coupons})

    } catch (error) {
        console.log("Approve Store Error:", error);
        return NextResponse.json(
            { error: error?.code || error?.message || "Something went wrong" },
            { status: 400 }
        );
    }
}