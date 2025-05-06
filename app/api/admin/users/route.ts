import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// ユーザー一覧の取得
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        organization: true
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// ユーザーの更新
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { id, name, email, role, org_id } = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        org_id
      },
      include: {
        organization: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// ユーザーの削除
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { id } = await request.json()

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'ユーザーを削除しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    )
  }
} 