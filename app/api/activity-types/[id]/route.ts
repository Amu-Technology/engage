import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const activityType = await prisma.activityType.findUnique({
      where: { id: params.id }
    })

    if (!activityType) {
      return NextResponse.json({ error: 'アクティビティタイプが見つかりません' }, { status: 404 })
    }

    if (activityType.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { name, color, point } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'アクティビティタイプ名は必須です' },
        { status: 400 }
      )
    }

    if (!point || point < 1) {
      return NextResponse.json(
        { error: 'ポイントは1以上である必要があります' },
        { status: 400 }
      )
    }

    const updatedActivityType = await prisma.activityType.update({
      where: { id: params.id },
      data: { name, color, point }
    })

    return NextResponse.json(updatedActivityType)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'アクティビティタイプの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const activityType = await prisma.activityType.findUnique({
      where: { id: params.id }
    })

    if (!activityType) {
      return NextResponse.json({ error: 'アクティビティタイプが見つかりません' }, { status: 404 })
    }

    if (activityType.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    await prisma.activityType.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'アクティビティタイプを削除しました' })
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'アクティビティタイプの削除に失敗しました' },
      { status: 500 }
    )
  }
} 