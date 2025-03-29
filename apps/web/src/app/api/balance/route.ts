import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const userBalance = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      balance: true,
    },
  });
  if (!userBalance) {
    return NextResponse.json(
      { message: "There is no such user" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    balance: userBalance.balance,
  });
}

export async function PUT(req: NextRequest) {
  const { userId, balance } = await req.json()
  const userBalance = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      balance: {
        increment: balance
      }
    }
  })
  return NextResponse.json(
    { balance: userBalance.balance }
  )
}