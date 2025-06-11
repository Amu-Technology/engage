import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
      },
      orderBy: {
        startDate: "desc",
      },
    });

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

      return {
        ...event,
        leadActivities: undefined, // 整形後は不要なため削除
        relatedGroups: Array.from(groups.values()),
        relatedLeads: Array.from(leads.values()),
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("イベント取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
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
    });
    if (!user?.org_id) {
      return NextResponse.json(
        { error: "組織に所属していません" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, startDate, endDate, location, description, groupId } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "タイトル、開始日時、終了日時は必須です" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.$transaction(async (tx) => {
      // 1. イベントを作成
      const event = await tx.event.create({
        data: {
          title,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          location,
          description,
          organizationId: user.org_id!,
        },
      });

      // 2. グループが指定されていれば、所属リード全員に活動を記録
      if (groupId) {
        const leadsInGroup = await tx.leadGroup.findMany({
          where: { groupId: groupId },
          select: { leadId: true },
        });

        if (leadsInGroup.length > 0) {
          const activityType = await tx.activityType.findFirst({
            where: { name: "イベント参加", organizationId: user.org_id! },
          });

          if (!activityType) {
            throw new Error(
              "「イベント参加」のアクティビティタイプが見つかりません。"
            );
          }

          const activitiesToCreate = leadsInGroup.map((lg) => ({
            leadId: lg.leadId,
            eventId: event.id,
            groupId: groupId,
            organizationId: user.org_id!,
            type: activityType.name,
            typeId: activityType.id,
            description: `イベント「${title}」への参加`,
          }));

          await tx.leadActivity.createMany({
            data: activitiesToCreate,
          });
        }
      }

      return event;
    });

    return NextResponse.json(newEvent, { status: 201 });
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
