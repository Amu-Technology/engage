import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateMatchSchema = z.object({
  action: z.enum(["approve", "reject", "merge"]),
  note: z.string().optional(),
});

// PUT /api/admin/participant-lead-management/matches/[matchId] - マッチング承認/却下
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
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
    const { action, note } = updateMatchSchema.parse(body);

    // マッチング情報取得
    const match = await prisma.participantLeadMatch.findFirst({
      where: {
        id: matchId,
        organizationId: user.org_id as number,
      },
      include: {
        participation: true,
        lead: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "マッチング情報が見つかりません" },
        { status: 404 }
      );
    }

    let result = {};

    switch (action) {
      case "approve":
        // マッチングを承認し、参加者とLeadを紐付け
        await prisma.$transaction(async (tx) => {
          // マッチングステータス更新
          await tx.participantLeadMatch.update({
            where: { id: matchId },
            data: {
              status: "APPROVED",
              reviewedBy: user.id,
              reviewedAt: new Date(),
            },
          });

          // EventParticipationにleadIdを設定
          await tx.eventParticipation.update({
            where: { id: match.participationId },
            data: { leadId: match.leadId },
          });

          // マージ履歴記録
          await tx.mergeHistory.create({
            data: {
              organizationId: user.org_id as number,
              operationType: "PARTICIPANT_TO_EXISTING",
              sourceType: "EventParticipation",
              sourceId: match.participationId,
              targetType: "Lead",
              targetId: match.leadId!,
              mergedData: {
                action: "link_participation_to_lead",
                participationData: match.participation,
                note,
              },
              rollbackData: {
                participationId: match.participationId,
                previousLeadId: null,
              },
              executedBy: user.id,
              status: "EXECUTED",
            },
          });
        });

        result = { message: "マッチングを承認し、紐付けを完了しました" };
        break;

      case "reject":
        // マッチングを却下
        await prisma.participantLeadMatch.update({
          where: { id: matchId },
          data: {
            status: "REJECTED",
            reviewedBy: user.id,
            reviewedAt: new Date(),
          },
        });

        result = { message: "マッチングを却下しました" };
        break;

      case "merge":
        // データマージを実行
        await prisma.$transaction(async (tx) => {
          const participation = match.participation;
          const lead = match.lead!;

          // Leadデータをマージ更新
          const mergedData = {
            // 既存データを保持しつつ、参加者データで補強
            email: lead.email || participation.participantEmail,
            phone: lead.phone || participation.participantPhone,
            address: lead.address || participation.participantAddress,
            // その他のマージロジック
          };

          await tx.lead.update({
            where: { id: lead.id },
            data: mergedData,
          });

          // EventParticipationとLinkを設定
          await tx.eventParticipation.update({
            where: { id: participation.id },
            data: { leadId: lead.id },
          });

          // マッチングステータス更新
          await tx.participantLeadMatch.update({
            where: { id: matchId },
            data: {
              status: "MERGED",
              reviewedBy: user.id,
              reviewedAt: new Date(),
              mergedAt: new Date(),
            },
          });

          // マージ履歴記録
          await tx.mergeHistory.create({
            data: {
              organizationId: user.org_id as number,
              operationType: "DATA_ENHANCEMENT",
              sourceType: "EventParticipation",
              sourceId: participation.id,
              targetType: "Lead",
              targetId: lead.id,
              mergedData: {
                action: "merge_participation_data_to_lead",
                beforeData: lead,
                afterData: mergedData,
                note,
              },
              rollbackData: {
                leadId: lead.id,
                originalData: lead,
              },
              executedBy: user.id,
              status: "EXECUTED",
            },
          });
        });

        result = { message: "データマージを完了し、紐付けしました" };
        break;
    }

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力データが無効です", details: error.errors },
        { status: 400 }
      );
    }

    console.error("マッチング操作エラー:", error);
    return NextResponse.json(
      { error: "操作に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/participant-lead-management/matches/[matchId] - マッチング削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
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

    await prisma.participantLeadMatch.delete({
      where: {
        id: matchId,
        organizationId: user.org_id,
      },
    });

    return NextResponse.json({ message: "マッチング候補を削除しました" });

  } catch (error) {
    console.error("マッチング削除エラー:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}