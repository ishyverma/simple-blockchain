import prisma from "@repo/db/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const signUpSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    type: z.enum(['Miner', 'User'])
})

export async function POST(req: NextRequest) {
    const parsedResult = signUpSchema.safeParse(await req.json());
    if (!parsedResult.success) {
        return NextResponse.json(
            { message: "Invalid input" },
            { status: 404 }
        )
    }
    const { username, password, type } = parsedResult.data
    const hashedPassword = await bcrypt.hash(password, 5)
    if (type === 'Miner') {
        try {
            const miner = await prisma.miner.create({
                data: {
                    username,
                    password: hashedPassword,
                }
            })
            return NextResponse.json({
                message: "Signed up successfully as miner"
            })
        } catch (error) {
            return NextResponse.json(
                { message: "Miner already exists" },
                { status: 404 }
            )
        }
    }
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            }
        })
    } catch (error) {
        return NextResponse.json(
            { message: "User already exists" },
            { status: 404 }
        )
    }
    return NextResponse.json({
        message: "Signed up successfully as user"
    })
}