import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 型定義
interface MatchCandidate {
  leadId: string;
  matchType: string;
  confidence: number;
  matchedFields: Record<string, unknown>;
}

interface Participation {
  id: string;
  participantName: string;
  participantEmail?: string | null;
  participantPhone?: string | null;
  participantAddress?: string | null;
  eventId: string;
}

// 参加者-Lead管理API
// GET /api/admin/participant-lead-management - 紐付け候補一覧取得
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
    const eventId = searchParams.get("eventId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 未紐付け参加者（外部ユーザー）を取得
    const unlinkedParticipations = await prisma.eventParticipation.findMany({
      where: {
        organizationId: user.org_id,
        isExternal: true,
        leadId: null,
        ...(eventId && { eventId }),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
          },
        },
        candidateProfile: true,
      },
      orderBy: { registeredAt: "desc" },
      skip: offset,
      take: limit,
    });

    // 総数取得
    const totalCount = await prisma.eventParticipation.count({
      where: {
        organizationId: user.org_id,
        isExternal: true,
        leadId: null,
        ...(eventId && { eventId }),
      },
    });

    // レスポンス整形
    const formattedParticipations = unlinkedParticipations.map((participation) => ({
      id: participation.id,
      participantName: participation.participantName,
      participantEmail: participation.participantEmail,
      participantPhone: participation.participantPhone,
      participantAddress: participation.participantAddress,
      registeredAt: participation.registeredAt,
      event: participation.event,
      matchCandidates: [] as MatchCandidate[], // 一時的に空配列
      candidateProfile: participation.candidateProfile ? {
        stage: participation.candidateProfile.stage,
        completeness: participation.candidateProfile.completeness,
        readyForLead: participation.candidateProfile.readyForLead,
      } : null,
    }));

    return NextResponse.json({
      participations: formattedParticipations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error("参加者-Lead管理データ取得エラー:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/admin/participant-lead-management - 紐付け候補の自動生成
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
    const { participationIds, algorithm = "hybrid", confidenceThreshold = 0.7 } = body;

    const results = [];

    for (const participationId of participationIds) {
      // 参加者情報取得
      const participation = await prisma.eventParticipation.findFirst({
        where: {
          id: participationId,
          organizationId: user.org_id,
          isExternal: true,
        },
      });

      if (!participation) continue;

      // マッチング候補を検索
      const candidates = await findMatchingLeads(participation, user.org_id, algorithm);
      
      // 信頼度フィルタリング
      const qualifiedCandidates = candidates.filter(
        (candidate) => candidate.confidence >= confidenceThreshold
      );

      // Lead候補プロファイル作成/更新
      await createOrUpdateLeadCandidate(participation, user.org_id);

      results.push({
        participationId,
        candidatesFound: qualifiedCandidates.length,
        candidates: qualifiedCandidates,
      });
    }

    return NextResponse.json({
      message: "マッチング分析が完了しました",
      results,
      summary: {
        processedParticipations: participationIds.length,
        totalCandidatesFound: results.reduce((sum, r) => sum + r.candidatesFound, 0),
      },
    });

  } catch (error) {
    console.error("マッチング分析エラー:", error);
    return NextResponse.json(
      { error: "マッチング分析に失敗しました" },
      { status: 500 }
    );
  }
}

// マッチング候補検索関数
async function findMatchingLeads(participation: Participation, organizationId: number, algorithm: string): Promise<MatchCandidate[]> {
  const candidates: MatchCandidate[] = [];

  // 1. メール完全一致
  if (participation.participantEmail) {
    const emailMatches = await prisma.lead.findMany({
      where: {
        organizationId,
        email: participation.participantEmail,
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    for (const lead of emailMatches) {
      candidates.push({
        leadId: lead.id,
        matchType: "EMAIL_EXACT",
        confidence: 0.95,
        matchedFields: { email: { participant: participation.participantEmail, lead: lead.email } },
      });
    }
  }

  // 2. 名前ファジーマッチング
  if (participation.participantName && algorithm !== "email_only") {
    const nameMatches = await prisma.lead.findMany({
      where: {
        organizationId,
        name: {
          contains: participation.participantName.split(" ")[0], // 姓での検索
        },
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    for (const lead of nameMatches) {
      const similarity = calculateNameSimilarity(participation.participantName, lead.name);
      if (similarity > 0.7) {
        candidates.push({
          leadId: lead.id,
          matchType: "NAME_FUZZY",
          confidence: similarity * 0.8, // 名前マッチングは少し信頼度を下げる
          matchedFields: { name: { participant: participation.participantName, lead: lead.name } },
        });
      }
    }
  }

  // 3. 電話番号マッチング
  if (participation.participantPhone) {
    const normalizedPhone = normalizePhone(participation.participantPhone);
    const phoneMatches = await prisma.lead.findMany({
      where: {
        organizationId,
        OR: [
          { phone: participation.participantPhone },
          { phone: normalizedPhone },
          { mobilePhone: participation.participantPhone },
          { mobilePhone: normalizedPhone },
        ],
      },
      select: { id: true, name: true, email: true, phone: true, mobilePhone: true },
    });

    for (const lead of phoneMatches) {
      candidates.push({
        leadId: lead.id,
        matchType: "PHONE_EXACT",
        confidence: 0.9,
        matchedFields: { 
          phone: { 
            participant: participation.participantPhone, 
            lead: lead.phone || lead.mobilePhone 
          } 
        },
      });
    }
  }

  // 重複除去（同じleadIdは最高信頼度のみ残す）
  const uniqueCandidates = candidates.reduce((acc, candidate) => {
    const existing = acc.find((c) => c.leadId === candidate.leadId);
    if (!existing || candidate.confidence > existing.confidence) {
      acc = acc.filter((c) => c.leadId !== candidate.leadId);
      acc.push(candidate);
    }
    return acc;
  }, [] as MatchCandidate[]);

  return uniqueCandidates;
}

// Lead候補プロファイル作成/更新
async function createOrUpdateLeadCandidate(participation: Participation, organizationId: number) {
  const extractedData = {
    name: participation.participantName,
    email: participation.participantEmail,
    phone: participation.participantPhone,
    address: participation.participantAddress,
    source: "EVENT_PARTICIPATION",
    eventId: participation.eventId,
  };

  // データ完成度計算
  const requiredFields = ['name', 'email', 'phone'];
  const filledFields = requiredFields.filter(field => extractedData[field as keyof typeof extractedData]);
  const completeness = filledFields.length / requiredFields.length;

  await prisma.leadCandidate.upsert({
    where: { participationId: participation.id },
    update: {
      extractedData,
      completeness,
      readyForLead: completeness >= 0.7,
      updatedAt: new Date(),
    },
    create: {
      participationId: participation.id,
      organizationId,
      extractedData,
      completeness,
      readyForLead: completeness >= 0.7,
      stage: "INITIAL",
    },
  });
}

// 名前類似度計算（簡易版）
function calculateNameSimilarity(name1: string, name2: string): number {
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  if (n1 === n2) return 1.0;
  
  // レーベンシュタイン距離ベースの類似度
  const maxLength = Math.max(n1.length, n2.length);
  const distance = levenshteinDistance(n1, n2);
  return 1 - (distance / maxLength);
}

// 電話番号正規化
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').replace(/^0/, '');
}

// レーベンシュタイン距離計算
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}