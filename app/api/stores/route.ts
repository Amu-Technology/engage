import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const stores = await prisma.stores.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(stores)
  } catch (error) {
    console.error('店舗一覧の取得に失敗しました:', error)
    return NextResponse.json(
      { error: '店舗一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, address, phone, email } = data

    const store = await prisma.stores.create({
      data: {
        name,
        address,
        phone,
        email,
        status: 'active',
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('店舗登録に失敗しました:', error)
    return NextResponse.json(
      { error: '店舗登録に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: '店舗IDは必須です' },
        { status: 400 }
      )
    }

    const store = await prisma.stores.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('店舗更新に失敗しました:', error)
    return NextResponse.json(
      { error: '店舗更新に失敗しました' },
      { status: 500 }
    )
  }
} 