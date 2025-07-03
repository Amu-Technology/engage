import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/calendar-activities:
 *   get:
 *     summary: カレンダー活動一覧取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: カレンダー活動一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeadActivity'
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '開始日と終了日が必要です' },
        { status: 400 }
      )
    }

    const activities = await prisma.leadActivity.findMany({
      where: {
        organizationId: user.organization.id,
        updatedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true
          }
        },
        activityType: true
      },
      orderBy: {
        updatedAt: 'asc'
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'アクティビティの取得に失敗しました' },
      { status: 500 }
    )
  }
} 