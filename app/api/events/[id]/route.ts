import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: イベント詳細を取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: イベント詳細
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *                 location:
 *                   type: string
 *                 maxParticipants:
 *                   type: integer
 *                 registrationStart:
 *                   type: string
 *                 registrationEnd:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 groupId:
 *                   type: string
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    });

    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const { id } = await params;

    const event = await prisma.event.findFirst({
      where: {
        id: id,
        organizationId: user.org_id
      },
      include: {
        _count: {
          select: {
            participations: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }

    console.log('イベント詳細API - イベントデータ:', {
      id: event.id,
      title: event.title,
      groupId: event.groupId,
      group: event.group ? { id: event.group.id, name: event.group.name } : null
    });

    // レスポンス形式を整理
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.startDate.toISOString(), // フロントエンドの期待する形式に合わせる
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      maxParticipants: event.maxParticipants,
      registrationStart: event.registrationStart?.toISOString() || null,
      registrationEnd: event.registrationEnd?.toISOString() || null,
      isPublic: event.isPublic,
      accessToken: event.accessToken,
      groupId: event.groupId,
      group: {
        name: event.group?.name || '未分類'
      },
      _count: {
        participations: event._count.participations
      }
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('イベント取得エラー:', error);
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     summary: イベント更新
 *     requestBody:
 *       required: true 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               groupId:
 *                 type: string
 *               maxParticipants:
 *                 type: integer
 *               registrationStart:
 *                 type: string
 *               registrationEnd:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               accessToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: イベント更新
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });
    if (!user?.org_id) {
      return NextResponse.json(
        { error: "組織に所属していません" },
        { status: 404 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      startDate, 
      endDate, 
      location, 
      description, 
      groupId,
      maxParticipants,
      registrationStart,
      registrationEnd,
      isPublic,
      accessToken
    } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "タイトル、開始日時、終了日時は必須です" },
        { status: 400 }
      );
    }

    // イベントが存在し、組織に属していることを確認
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        organizationId: user.org_id
      }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // イベントを更新
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        description,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        isPublic: Boolean(isPublic),
        accessToken: isPublic && accessToken ? accessToken : null,
        groupId: groupId || null,
      }
    });

    // グループが変更された場合の処理
    if (groupId !== undefined) {
      // 既存の活動履歴を削除
      await prisma.leadActivity.deleteMany({
        where: { eventId: id }
      });

      // 新しいグループが指定されている場合は新しい活動履歴を作成
      if (groupId) {
        const groupLeads = await prisma.leadGroup.findMany({
          where: {
            groupId: groupId,
            group: {
              organizationId: user.org_id!
            }
          },
          select: {
            leadId: true
          }
        });

        for (const { leadId } of groupLeads) {
          await prisma.leadActivity.create({
            data: {
              type: "EVENT",
              typeId: "default-イベント",
              description: title,
              organizationId: user.org_id!,
              leadId: leadId,
              eventId: id
            }
          });
        }
      }
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('イベント更新エラー:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     summary: イベント削除
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: イベント削除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }
    
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
        // 1. イベントに関連する活動履歴を削除
        await tx.leadActivity.deleteMany({
            where: { eventId: id }
        });
        // 2. イベント本体を削除
        await tx.event.delete({
            where: { id: id, organizationId: user.org_id! }
        });
    });

    return NextResponse.json({ message: 'イベントを削除しました' }, { status: 200 });
  } catch (error) {
    console.error('イベント削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}