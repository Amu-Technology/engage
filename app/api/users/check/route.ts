import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error("ユーザー情報の確認に失敗しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
} 