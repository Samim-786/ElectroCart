


import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Add new Address
export async function POST(req) {
    try {
        const {userId}=getAuth(req)
        const {address}=await req.json()
        address.userId=userId
       const newAddress= await  prisma.address.create({
            data:address
        })
        return NextResponse.json({newAddress,message:"Address added successfully"})

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: 400 })
    }
}

// get all address for user

export async function GET(req) {
    try {
        const {userId}=getAuth(req)
       const addresses= await  prisma.address.findMany({
            where:{userId:userId}
        })
        return NextResponse.json({addresses})

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: 400 })
    }
}