import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json({ hasStore: false });
        }

        const store = await prisma.store.findUnique({
            where: { userId }
        });

        return NextResponse.json({ hasStore: !!store });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ hasStore: false });
    }
}