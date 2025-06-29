import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createLeadSchema = z.object({
  participationId: z.string(),
  leadData: z.object({
    name: z.string().min(1, "名前は必須です"),
    email: z.string().email("有効なメールアドレスを入力してください").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    status: z.string().default("potential"),
  }),
  mergeExistingData: z.boolean().default(true),
});

// POST /api/admin/participant-lead-management/create-lead - 参加者からLead作成
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
    const { participationId, leadData, mergeExistingData } = createLeadSchema.parse(body);

    // 参加者情報取得
    const participation = await prisma.eventParticipation.findFirst({
      where: {
        id: participationId,
        organizationId: user.org_id!,
        isExternal: true,
        leadId: null, // まだ紐付けされていない
      },
      include: {
        event: true,
        candidateProfile: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "参加者情報が見つかりません" },
        { status: 404 }
      );
    }

    // 重複チェック
    const existingLead = await prisma.lead.findFirst({
      where: {
        organizationId: user.org_id!,
        OR: [
          { email: leadData.email },
          { name: leadData.name, phone: leadData.phone },
        ].filter(condition => Object.values(condition).some(value => value)),
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { 
          error: "類似するLeadが既に存在します",
          existingLead: {
            id: existingLead.id,
            name: existingLead.name,
            email: existingLead.email,
            phone: existingLead.phone,
          },
          suggestion: "既存Leadとの紐付けを検討してください"
        },
        { status: 409 }
      );
    }

    let newLead;

    await prisma.$transaction(async (tx) => {
      // 参加者データとマージしてLead作成
      const mergedLeadData = mergeExistingData ? {
        name: leadData.name || participation.participantName,
        email: leadData.email || participation.participantEmail,
        phone: leadData.phone || participation.participantPhone,
        address: leadData.address || participation.participantAddress,
        company: leadData.company,
        position: leadData.position,
        status: leadData.status,
        organizationId: user.org_id!,
        referrer: `イベント参加: ${participation.event.title}`,
      } : {
        ...leadData,
        organizationId: user.org_id!,
      };

      // Lead作成
      newLead = await tx.lead.create({
        data: mergedLeadData,
      });

      // EventParticipationに紐付け
      await tx.eventParticipation.update({
        where: { id: participationId },
        data: { leadId: newLead.id },
      });

      // Lead候補プロファイル更新
      if (participation.candidateProfile) {
        await tx.leadCandidate.update({
          where: { participationId },
          data: {
            stage: "CONVERTED",
            readyForLead: true,
            completeness: 1.0,
          },
        });
      }

      // イベント参加のLeadActivity作成
      await tx.leadActivity.create({
        data: {
          leadId: newLead.id,
          organizationId: user.org_id!,
          type: "EVENT",
          typeId: "event-participation",
          description: `イベント「${participation.event.title}」に参加`,
        },
      });
    });

    return NextResponse.json({
      message: "新しいLeadを作成し、参加者と紐付けました",
      lead: {
        id: newLead!.id,
        name: newLead!.name,
        email: newLead!.email,
        phone: newLead!.phone,
        address: newLead!.address,
      },
      actionsPerformed: [
        "Lead作成",
        "EventParticipation紐付け",
        "LeadActivity作成",
        ...(participation.candidateProfile ? ["Lead候補プロファイル更新"] : []),
      ],
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力データが無効です", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Lead作成エラー:", error);
    return NextResponse.json(
      { error: "Lead作成に失敗しました" },
      { status: 500 }
    );
  }
}

// バッチ作成API
// POST /api/admin/participant-lead-management/create-lead/batch
export async function PUT(request: NextRequest) {
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
    const { participationIds } = body;

    const results = [];
    const errors = [];

    for (const participationId of participationIds) {
      try {
        // 参加者情報取得
        const participation = await prisma.eventParticipation.findFirst({
          where: {
            id: participationId,
            organizationId: user.org_id!,
            isExternal: true,
            leadId: null,
          },
          include: {
            candidateProfile: true,
            event: true,
          },
        });

        if (!participation) {
          errors.push({
            participationId,
            error: "参加者情報が見つかりません",
          });
          continue;
        }

        // 候補プロファイルがあり、準備完了の場合のみ処理
        if (!participation.candidateProfile?.readyForLead) {
          errors.push({
            participationId,
            error: "Lead変換の準備ができていません",
            completeness: participation.candidateProfile?.completeness || 0,
          });
          continue;
        }

        // 自動マージでLead作成
        const leadData = {
          name: participation.participantName,
          email: participation.participantEmail,
          phone: participation.participantPhone,
          address: participation.participantAddress,
          status: "potential",
          organizationId: user.org_id!,
          referrer: `イベント参加: ${participation.event.title}`,
        };

        const newLead = await prisma.$transaction(async (tx) => {
          const lead = await tx.lead.create({
            data: leadData,
          });

          await tx.eventParticipation.update({
            where: { id: participationId },
            data: { leadId: lead.id },
          });

          await tx.leadCandidate.update({
            where: { participationId },
            data: { stage: "CONVERTED" },
          });

          return lead;
        });

        results.push({
          participationId,
          leadId: newLead.id,
          status: "success",
        });

      } catch (error) {
        errors.push({
          participationId,
          error: error instanceof Error ? error.message : "不明なエラー",
        });
      }
    }

    return NextResponse.json({
      message: "バッチLead作成が完了しました",
      summary: {
        total: participationIds.length,
        success: results.length,
        errors: errors.length,
      },
      results,
      errors,
    });

  } catch (error) {
    console.error("バッチLead作成エラー:", error);
    return NextResponse.json(
      { error: "バッチ処理に失敗しました" },
      { status: 500 }
    );
  }
}