import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/events/[accessToken] - 公開イベント情報取得（認証不要）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accessToken: string }> }
) {
  try {
    const { accessToken } = await params;

    if (!accessToken) {
      return NextResponse.json(
        { error: "アクセストークンが必要です" },
        { status: 400 }
      );
    }

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
              where: { 
                status: { in: ['CONFIRMED', 'PENDING'] }
              }
            }
          }
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // 定員チェック
    const currentParticipants = event._count.participations;

    // フロントエンドが期待する形式でイベント情報を返す
    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      maxParticipants: event.maxParticipants,
      registrationStart: event.registrationStart?.toISOString() || null,
      registrationEnd: event.registrationEnd?.toISOString() || null,
      isPublic: event.isPublic,
      accessToken: event.accessToken,
      _count: {
        participations: currentParticipants,
      },
    });

  } catch (error) {
    console.error("公開イベント情報取得エラー:", error);
    return NextResponse.json(
      { error: "イベント情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}