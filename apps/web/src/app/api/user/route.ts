import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            id: true,
            balance: true
        }
    })
    return NextResponse.json({
        users
    })
}