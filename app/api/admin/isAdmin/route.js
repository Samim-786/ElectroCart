// auth admin
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
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

    return NextResponse.json({ isAdmin: true }, { status: 200 });
  } catch (error) {
    console.log("Admin Route Error:", error);

    return NextResponse.json(
      { error: error?.code || error?.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
