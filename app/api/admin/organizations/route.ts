import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// 組織一覧の取得
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

    const organizations = await prisma.organization.findMany({
      include: {
        users: true
      }
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 組織の作成
export async function POST(request: Request) {
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

    const { name } = await request.json()

    const organization = await prisma.organization.create({
      data: {
        name
      },
      include: {
        users: true
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// 組織の更新
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

    const { id, name } = await request.json()

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name
      },
      include: {
        users: true
      }
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 組織の削除
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

    await prisma.organization.delete({
      where: { id }
    })

    return NextResponse.json({ message: '組織を削除しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織の削除に失敗しました' },
      { status: 500 }
    )
  }
} 