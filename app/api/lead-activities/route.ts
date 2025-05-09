import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, checkOrganizationAccess, AuthenticatedUser } from '@/lib/auth-middleware'
import { Prisma } from '@prisma/client'

export const GET = withAuth(async (request: Request, { user }: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'リードIDが必要です' }, { status: 400 })
    }

    const hasAccess = await checkOrganizationAccess({ user }, leadId, 'lead')
    if (!hasAccess) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    const activities = await prisma.leadActivity.findMany({
      where: {
        leadId,
        organizationId: user.organization.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        activityType: true
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
})

export const POST = withAuth(async (request: Request, { user }: AuthenticatedUser) => {
  try {
    
    const body = await request.json()
    console.log('受信データ:', body)
    console.log('ユーザー情報:', user)
    const { leadId, typeId, description, type, scheduledAt } = body

    if (!leadId || !typeId || !description || !type || !scheduledAt) {
      console.log('バリデーションエラー:', { leadId, typeId, description, type, scheduledAt })
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    const hasAccess = await checkOrganizationAccess({ user }, leadId, 'lead')
    if (!hasAccess) {
      console.log('アクセス権限エラー:', { leadId, organizationId: user.organization.id })
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    // アクティビティタイプの取得
    const activityType = await prisma.activityType.findFirst({
      where: {
        id: typeId,
        organizationId: user.organization.id
      }
    })

    if (!activityType) {
      console.log('アクティビティタイプ未検出:', { typeId, organizationId: user.organization.id })
      return NextResponse.json({ error: 'アクティビティタイプが見つかりません' }, { status: 404 })
    }

    console.log('アクティビティ作成開始:', {
      leadId,
      typeId,
      type,
      organizationId: user.organization.id,
      scheduledAt
    })

    try {
      // アクティビティの作成
      const activity = await prisma.leadActivity.create({
        data: {
          leadId,
          typeId,
          type,
          description,
          organizationId: user.organization.id,
          updatedAt: new Date(scheduledAt as string)

        },
        include: {
          activityType: true
        }
      })

      console.log('アクティビティ作成成功:', activity)

      // リードの評価を更新
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          evaluation: {
            increment: activityType.point
          }
        }
      })

      return NextResponse.json(activity)
    } catch (dbError) {
      console.error('データベースエラー:', dbError)
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: `データベースエラー: ${dbError.message}` },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: 'アクティビティの作成に失敗しました' },
        { status: 500 }
      )
    }
  } catch (dbError) {
    console.error('データベースエラー:', dbError)
    if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `データベースエラー: ${dbError.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'アクティビティの作成に失敗しました' },
      { status: 500 }
    )
  }
  
}) 