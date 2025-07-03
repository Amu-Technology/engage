import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/activity-types:
 *   get:
 *     summary: アクティビティタイプ一覧取得
 *     responses:
 *       200:
 *         description: アクティビティタイプ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityType'
 */
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

/**
 * @openapi
 * /api/activity-types:
 *   post:
 *     summary: アクティビティタイプ作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               point:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 作成されたアクティビティタイプ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityType'
 */
export async function POST(request: Request) {
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

    const { name, color, point } = await request.json()

    const activityType = await prisma.activityType.create({
      data: {
        name,
        color,
        point,
        organizationId: user.organization.id
      }
    })

    return NextResponse.json(activityType)
  } catch (error) {
    console.error('Error creating activity type:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * @openapi
 * /api/activity-types:
 *   put:
 *     summary: アクティビティタイプ更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               point:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新されたアクティビティタイプ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityType'
 */
export async function PUT(request: Request) {
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

    const { id, name, color, point } = await request.json()

    // 更新対象のアクティビティタイプが同じ組織に属しているか確認
    const existingActivityType = await prisma.activityType.findFirst({
      where: {
        id,
        organizationId: user.organization.id
      }
    })

    if (!existingActivityType) {
      return NextResponse.json({ error: 'アクティビティタイプが見つかりません' }, { status: 404 })
    }

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