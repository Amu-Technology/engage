import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// バリデーションスキーマ
const publicParticipationSchema = z.object({
  participantName: z.string().min(1, "参加者名は必須です"),
  participantEmail: z.string().email("有効なメールアドレスを入力してください"),
  participantPhone: z.string().optional(),
  participantAddress: z.string().optional(),
  note: z.string().optional(),
});

// POST /api/public/events/[accessToken]/participate - 外部ユーザー参加申込（認証不要）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accessToken: string }> }
) {
  try {
    const { accessToken } = await params;
    const body = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "アクセストークンが必要です" },
        { status: 400 }
      );
    }

    // バリデーション
    const validatedData = publicParticipationSchema.parse(body);

    // アクセストークンでイベントを検索
    const event = await prisma.event.findFirst({
      where: {
        accessToken: accessToken,
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            participations: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
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
        { 
          error: "まだ登録期間ではありません",
          registrationStart: event.registrationStart 
        },
        { status: 400 }
      );
    }

    if (event.registrationEnd && now > event.registrationEnd) {
      return NextResponse.json(
        { 
          error: "登録期間が終了しています",
          registrationEnd: event.registrationEnd 
        },
        { status: 400 }
      );
    }

    // 重複チェック（同じメールアドレス）
    const existingParticipation = await prisma.eventParticipation.findFirst({
      where: {
        eventId: event.id,
        participantEmail: validatedData.participantEmail,
        isExternal: true,
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { 
          error: "このメールアドレスで既に参加申込済みです",
          participationId: existingParticipation.id,
          status: existingParticipation.status,
        },
        { status: 409 }
      );
    }

    // 定員チェック
    const confirmedCount = event._count.participations;
    let initialStatus: 'PENDING' | 'WAITLIST' = 'PENDING';
    
    if (event.maxParticipants && confirmedCount >= event.maxParticipants) {
      initialStatus = 'WAITLIST';
    }

    // 参加申込作成
    const participation = await prisma.eventParticipation.create({
      data: {
        eventId: event.id,
        organizationId: event.organizationId,
        leadId: null, // 外部ユーザーなのでnull
        participantName: validatedData.participantName,
        participantEmail: validatedData.participantEmail,
        participantPhone: validatedData.participantPhone,
        participantAddress: validatedData.participantAddress,
        note: validatedData.note,
        isExternal: true,
        status: initialStatus,
        registeredAt: now,
      },
    });

    // レスポンス
    const responseMessage = initialStatus === 'WAITLIST' 
      ? "定員に達しているため、キャンセル待ちとして登録されました。キャンセルが発生次第、順次確定のご連絡をいたします。"
      : "参加申込が完了しました。確定のご連絡をお待ちください。";

    return NextResponse.json({
      participation: {
        id: participation.id,
        status: participation.status,
        registeredAt: participation.registeredAt,
        participant: {
          name: participation.participantName,
          email: participation.participantEmail,
          phone: participation.participantPhone,
        },
      },
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
      },
      message: responseMessage,
      isWaitlist: initialStatus === 'WAITLIST',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "入力データが無効です", 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error("外部ユーザー参加申込エラー:", error);
    return NextResponse.json(
      { error: "参加申込に失敗しました。しばらく経ってから再度お試しください。" },
      { status: 500 }
    );
  }
}