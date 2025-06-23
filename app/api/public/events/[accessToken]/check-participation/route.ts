import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/events/[accessToken]/check-participation - 参加申込状況チェック
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accessToken: string }> }
) {
  try {
    const { accessToken } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!accessToken) {
      return NextResponse.json(
        { error: "アクセストークンが必要です" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスが必要です" },
        { status: 400 }
      );
    }

    // アクセストークンでイベントを検索
    const event = await prisma.event.findFirst({
      where: {
        accessToken: accessToken,
        isPublic: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // 既存の参加申込を検索
    const existingParticipation = await prisma.eventParticipation.findFirst({
      where: {
        eventId: event.id,
        participantEmail: email,
        isExternal: true,
      },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        participantName: true,
        participantEmail: true,
        participantPhone: true,
        participantAddress: true,
        note: true,
      },
    });

    if (existingParticipation) {
      return NextResponse.json({
        hasParticipated: true,
        participation: existingParticipation,
        event: {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
        },
      });
    }

    return NextResponse.json({
      hasParticipated: false,
    });

  } catch (error) {
    console.error("参加申込状況チェックエラー:", error);
    return NextResponse.json(
      { error: "参加申込状況の確認に失敗しました" },
      { status: 500 }
    );
  }
} 