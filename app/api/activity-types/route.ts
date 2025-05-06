import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
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

    const activityTypes = await prisma.activityType.findMany({
      where: { organizationId: user.organization.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(activityTypes || [])
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'アクティビティタイプの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { name, color, point, organizationId } = await request.json()

    const activityType = await prisma.activityType.create({
      data: {
        name,
        color,
        point,
        organizationId
      }
    })

    return NextResponse.json(activityType)
  } catch (error) {
    console.error('Error creating activity type:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id, name, color, point } = await request.json()

    const activityType = await prisma.activityType.update({
      where: { id },
      data: {
        name,
        color,
        point
      }
    })

    return NextResponse.json(activityType)
  } catch (error) {
    console.error('Error updating activity type:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 