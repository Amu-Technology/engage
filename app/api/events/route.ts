import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

// イベントを取得
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get("groupId");
    const leadId = searchParams.get("leadId");

    const where: Prisma.EventWhereInput = {
      organizationId: user.org_id,
    };

    // グループIDでの絞り込み
    if (groupId) {
      where.leadActivities = {
        some: {
          groupId: groupId,
        },
      };
    }

    // リードIDでの絞り込み
    if (leadId) {
      where.leads = {
        some: {
          id: leadId,
        },
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        // イベントから生成された活動履歴を取得
        leadActivities: {
          include: {
            // 活動履歴からグループ情報を取得
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            // 活動履歴からリード情報を取得
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        // 参加者情報を含める
        participations: {
          where: { status: 'CONFIRMED' },
          take: 5, // 最新5件のみ表示用
          orderBy: { registeredAt: 'desc' },
          select: {
            id: true,
            participantName: true,
            participantEmail: true,
            isExternal: true,
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    // 参加者数を別途取得
    const participationCounts = await Promise.all(
      events.map(async (event) => {
        const count = await prisma.eventParticipation.count({
          where: { eventId: event.id }
        });
        return { eventId: event.id, count };
      })
    );

    // 取得したデータを整形する
    const formattedEvents = events.map((event) => {
      // イベントに関連するユニークなグループとリードを抽出
      const groups = new Map<string, { id: string; name: string }>();
      const leads = new Map<
        string,
        { id: string; name: string; email: string | null }
      >();

      event.leadActivities.forEach((activity) => {
        if (activity.group) {
          groups.set(activity.group.id, activity.group);
        }
        if (activity.lead) {
          leads.set(activity.lead.id, activity.lead);
        }
      });

      const participationCount = participationCounts.find(p => p.eventId === event.id)?.count || 0;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        maxParticipants: event.maxParticipants,
        isPublic: event.isPublic,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        relatedGroups: Array.from(groups.values()),
        relatedLeads: Array.from(leads.values()),
        // 参加者統計情報を追加
        participationStats: {
          totalParticipants: participationCount,
          confirmedParticipants: event.participations.length,
          availableSpots: event.maxParticipants 
            ? Math.max(0, event.maxParticipants - event.participations.length)
            : null,
        },
        recentParticipants: event.participations.map((p) => ({
          id: p.id,
          name: p.isExternal ? p.participantName : p.lead?.name || '',
          email: p.isExternal ? p.participantEmail : p.lead?.email,
          isExternal: p.isExternal,
        })),
      };
    });

    console.log(`API Response: Returning ${formattedEvents.length} events`);
    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("イベント取得エラー:", error);
    
    // エラー時も空配列を返却してフロントエンドのクラッシュを防ぐ
    return NextResponse.json([], { 
      status: 200,
      headers: {
        'X-Error': 'Database error occurred',
        'X-Error-Message': error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// 新しいイベントを作成し、関連する活動も記録する
export async function POST(request: NextRequest) {
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

    // イベントを作成
    const event = await prisma.event.create({
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
        organization: {
          connect: {
            id: user.org_id!
          }
        }
      }
    });

    // グループが指定されている場合はLeadActivityを作成
    if (groupId) {
      // グループに所属するリードを取得
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

      // 各リードに対してLeadActivityを作成
      for (const { leadId } of groupLeads) {
        await prisma.leadActivity.create({
          data: {
            type: "EVENT",
            typeId: "default-イベント",
            description: title,
            organizationId: user.org_id!,
            leadId: leadId,
            groupId: groupId,
            eventId: event.id
          }
        });
      }
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("イベント作成エラー:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
