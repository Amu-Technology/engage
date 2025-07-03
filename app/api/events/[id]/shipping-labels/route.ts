import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

// 送り状テンプレート更新用のスキーマ
const updateShippingTemplateSchema = z.object({
  shippingLabelTemplate: z.string().optional(),
  participationFee: z.number().optional(),
  requirements: z.string().optional(),
  contactInfo: z.string().optional(),
});

/**
 * @openapi
 * /api/events/{id}/shipping-labels:
 *   put:
 *     summary: 送り状テンプレート更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingLabelTemplate:
 *                 type: string
 *               participationFee:
 *                 type: number
 *               requirements:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: 送り状テンプレート更新
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: eventId } = await params;
    const body = await request.json();

    // バリデーション
    const validatedData = updateShippingTemplateSchema.parse(body);

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

    // イベントを更新
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: validatedData,
    });

    return NextResponse.json({
      message: "送り状テンプレートを更新しました",
      event: updatedEvent,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力データが無効です", details: error.errors },
        { status: 400 }
      );
    }

    console.error("送り状テンプレート更新エラー:", error);
    return NextResponse.json(
      { error: "送り状テンプレートの更新に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/events/{id}/shipping-labels:
 *   get:
 *     summary: 送り状データを取得
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
 *         description: 送り状データ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *                 shippingLabels:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ShippingLabel'
 *                 totalCount:
 *                   type: integer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('送り状印刷API - 開始');
    
    const session = await auth();
    if (!session?.user?.email) {
      console.log('送り状印刷API - 認証エラー');
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    console.log('送り状印刷API - ユーザー情報:', {
      email: session.user.email,
      org_id: user?.org_id,
      organization: user?.organization?.name
    });

    if (!user?.org_id) {
      console.log('送り状印刷API - 組織エラー');
      return NextResponse.json(
        { error: "組織に所属していません" },
        { status: 404 }
      );
    }

    const { id: eventId } = await params;

    console.log('送り状印刷API - イベントID:', eventId);
    console.log('送り状印刷API - 組織ID:', user.org_id);

    // イベント情報を取得
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: user.org_id,
      },
      include: {
        organization: true,
        group: {
          include: {
            leads: {
              include: {
                lead: {
                  select: {
                    id: true,
                    name: true,
                    nameReading: true,
                    email: true,
                    phone: true,
                    mobilePhone: true,
                    homePhone: true,
                    postalCode: true,
                    address: true,
                    company: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log('送り状印刷API - イベントデータ:', {
      id: event?.id,
      title: event?.title,
      groupId: event?.groupId,
      group: event?.group ? { id: event.group.id, name: event.group.name } : null,
      leadCount: event?.group?.leads?.length || 0
    });

    if (!event) {
      console.log('送り状印刷API - イベントが見つかりません');
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    if (!event.groupId || !event.group) {
      console.log('送り状印刷API - グループが設定されていません');
      return NextResponse.json(
        { error: "このイベントにはグループが設定されていません" },
        { status: 400 }
      );
    }

    if (!event.group.leads || event.group.leads.length === 0) {
      console.log('送り状印刷API - グループにリードが登録されていません');
      return NextResponse.json(
        { error: "このグループにリードが登録されていません" },
        { status: 400 }
      );
    }

    // QRコード用の申込URLを生成
    const registrationUrl = event.isPublic && event.accessToken
      ? `${process.env.NEXTAUTH_URL}/events/${eventId}/register?token=${event.accessToken}`
      : `${process.env.NEXTAUTH_URL}/dashboard/events/${eventId}/manage#registration`;

    // 送り状データを作成
    const shippingLabels = event.group.leads.map((leadGroup) => {
      const lead = leadGroup.lead;
      return {
        id: lead.id,
        recipientInfo: {
          name: lead.name,
          nameReading: lead.nameReading,
          postalCode: lead.postalCode,
          address: lead.address,
          phone: lead.phone || lead.mobilePhone || lead.homePhone,
          email: lead.email,
          company: lead.company,
          position: lead.position,
        },
        eventInfo: {
          id: event.id,
          title: event.title,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString(),
          location: event.location,
          description: event.description,
          participationFee: event.participationFee,
          requirements: event.requirements,
          maxParticipants: event.maxParticipants,
        },
        organizationInfo: {
          name: event.organization.name,
          contactInfo: event.contactInfo,
        },
        registrationUrl,
        qrCodeData: registrationUrl,
        printDate: new Date().toISOString(),
      };
    });

    console.log('送り状印刷API - 送り状データ作成完了:', {
      totalCount: shippingLabels.length,
      eventTitle: event.title,
      groupName: event.group.name
    });

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        groupName: event.group.name,
        shippingLabelTemplate: event.shippingLabelTemplate,
        participationFee: event.participationFee,
        requirements: event.requirements,
        contactInfo: event.contactInfo,
      },
      shippingLabels,
      totalCount: shippingLabels.length,
    });
  } catch (error) {
    console.error("送り状データ取得エラー:", error);
    console.error("送り状データ取得エラー詳細:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}