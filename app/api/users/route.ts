import { NextResponse } from 'next/server'
import { UserProvider } from '@/lib/providers/user-provider'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from "@/lib/prisma"

const prismaClient = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 })
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      include: {
        stores: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      store: user.stores,
    })
  } catch (error) {
    console.error("ユーザー情報の取得に失敗しました:", error)
    return NextResponse.json(
      { error: "ユーザー情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'IDは必須です' }, { status: 400 })
    }

    const updatedUser = await UserProvider.updateUser(id, data)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('ユーザー情報の更新に失敗しました:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, role, store_id } = data

    // 既存のユーザーを検索
    const existingUser = await prismaClient.users.findUnique({
      where: { email: session.user.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このユーザーは既に登録されています' },
        { status: 400 }
      )
    }

    // 新規ユーザーを作成
    const user = await prismaClient.users.create({
      data: {
        email: session.user.email,
        name: name || session.user.name || null,
        role: role || 'store_staff',
        store_id: store_id || null,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('ユーザー登録に失敗しました:', error)
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    )
  }
} 