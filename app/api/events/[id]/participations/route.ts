import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventParticipationStatus } from "@prisma/client";

// バリデーションスキーマ
const createParticipationSchema = z.object({
  leadId: z.string().optional(),
  participantName: z.string().min(1, "参加者名は必須です"),
  participantEmail: z.string().email("有効なメールアドレスを入力してください").optional(),
  participantPhone: z.string().optional(),
  note: z.string().optional(),
  isExternal: z.boolean().default(false),
});

// GET /api/events/[id]/participations - 参加者一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: eventId } = await params;

    // イベントの存在確認と組織チェック
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: user.org_id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // 参加者一覧を取得
    const participations = await prisma.eventParticipation.findMany({
      where: {
        eventId: eventId,
        organizationId: user.org_id,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { registeredAt: 'desc' },
      ],
    });

    // レスポンス形式を整理
    const formattedParticipations = participations.map((participation) => ({
      id: participation.id,
      status: participation.status,
      registeredAt: participation.registeredAt,
      responseDate: participation.responseDate,
      note: participation.note,
      isExternal: participation.isExternal,
      leadId: participation.leadId,
      participantName: participation.participantName,
      participantEmail: participation.participantEmail,
      participantPhone: participation.participantPhone,
      lead: participation.lead,
      participant: participation.isExternal ? {
        name: participation.participantName,
        email: participation.participantEmail,
        phone: participation.participantPhone,
      } : participation.lead ? {
        id: participation.lead.id,
        name: participation.lead.name,
        email: participation.lead.email,
        phone: participation.lead.phone,
      } : null,
    }));

    // 統計情報も含める
    const stats = {
      total: participations.length,
      confirmed: participations.filter(p => p.status === 'CONFIRMED').length,
      pending: participations.filter(p => p.status === 'PENDING').length,
      declined: participations.filter(p => p.status === 'DECLINED').length,
      waitlist: participations.filter(p => p.status === 'WAITLIST').length,
      cancelled: participations.filter(p => p.status === 'CANCELLED').length,
    };

    return NextResponse.json({
      participations: formattedParticipations,
      stats,
      event: {
        id: event.id,
        title: event.title,
        maxParticipants: event.maxParticipants,
        availableSpots: event.maxParticipants ? event.maxParticipants - stats.confirmed : null,
      },
    });

  } catch (error) {
    console.error("参加者一覧取得エラー:", error);
    return NextResponse.json(
      { error: "参加者一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/participations - 新規参加申込
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const body = await request.json();

    // バリデーション
    const validatedData = createParticipationSchema.parse(body);

    // イベントの存在確認と組織チェック
    const event = await prisma.event.findFirst({
      where: {
        id: id,
        organizationId: user.org_id,
      },
      include: {
        _count: {
          select: {
            participations: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // 登録期間チェック
    const now = new Date();
    if (event.registrationStart && now < event.registrationStart) {
      return NextResponse.json(
        { error: "まだ登録期間ではありません" },
        { status: 400 }
      );
    }

    if (event.registrationEnd && now > event.registrationEnd) {
      return NextResponse.json(
        { error: "登録期間が終了しています" },
        { status: 400 }
      );
    }

    // 重複チェック
    let whereCondition;
    if (validatedData.isExternal && validatedData.participantEmail) {
      whereCondition = {
        eventId: id,
        participantEmail: validatedData.participantEmail,
        isExternal: true,
      };
    } else if (!validatedData.isExternal && validatedData.leadId) {
      whereCondition = {
        eventId: id,
        leadId: validatedData.leadId,
      };
    } else {
      return NextResponse.json(
        { error: "参加者情報が不完全です" },
        { status: 400 }
      );
    }

    const existingParticipation = await prisma.eventParticipation.findFirst({
      where: whereCondition,
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "既に参加申込済みです" },
        { status: 409 }
      );
    }

    // 定員チェック（確定者のみカウント）
    const confirmedCount = event._count.participations;
    let initialStatus = 'PENDING';
    
    if (event.maxParticipants && confirmedCount >= event.maxParticipants) {
      initialStatus = 'WAITLIST';
    }

    // 参加申込作成
    const participation = await prisma.eventParticipation.create({
      data: {
        eventId: id,
        organizationId: user.org_id,
        leadId: validatedData.isExternal ? null : validatedData.leadId,
        participantName: validatedData.participantName,
        participantEmail: validatedData.participantEmail,
        participantPhone: validatedData.participantPhone,
        note: validatedData.note,
        isExternal: validatedData.isExternal,
        status: initialStatus as EventParticipationStatus,
        registeredAt: now,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      participation: {
        id: participation.id,
        status: participation.status,
        registeredAt: participation.registeredAt,
        isExternal: participation.isExternal,
        participant: participation.isExternal ? {
          name: participation.participantName,
          email: participation.participantEmail,
          phone: participation.participantPhone,
        } : participation.lead,
      },
      message: initialStatus === 'WAITLIST' 
        ? "定員に達しているため、キャンセル待ちとして登録されました" 
        : "参加申込が完了しました",
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力データが無効です", details: error.errors },
        { status: 400 }
      );
    }

    console.error("参加申込エラー:", error);
    return NextResponse.json(
      { error: "参加申込に失敗しました" },
      { status: 500 }
    );
  }
}