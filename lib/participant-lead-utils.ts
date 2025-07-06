/**
 * EventParticipation-Lead 紐付け機能のユーティリティ関数
 */

import { prisma } from "@/lib/prisma";

// 参加者データの完成度を計算
export function calculateDataCompleteness(participationData: {
  participantName?: string;
  participantEmail?: string;
  participantPhone?: string;
  participantAddress?: string;
}): number {
  const requiredFields = ['participantName', 'participantEmail'];
  const optionalFields = ['participantPhone', 'participantAddress'];
  
  const requiredScore = requiredFields.filter(field => {
    const value = participationData[field as keyof typeof participationData];
    return value && value.trim().length > 0;
  }).length / requiredFields.length;
  
  const optionalScore = optionalFields.filter(field => {
    const value = participationData[field as keyof typeof participationData];
    return value && value.trim().length > 0;
  }).length / optionalFields.length;
  
  // 必須項目70% + 任意項目30%の重み付け
  return (requiredScore * 0.7) + (optionalScore * 0.3);
}

// 名前の類似度計算（日本語対応）
export function calculateNameSimilarity(name1: string, name2: string): number {
  // 正規化（ひらがな・カタカナ・英数字・スペース処理）
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[ァ-ヶ]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0x60))
      .replace(/\s+/g, '')
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0));
  };

  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  if (n1 === n2) return 1.0;
  
  // 部分一致チェック（姓・名の順序違いに対応）
  const parts1 = name1.trim().split(/\s+/);
  const parts2 = name2.trim().split(/\s+/);
  
  if (parts1.length >= 2 && parts2.length >= 2) {
    // 姓名の組み合わせチェック
    const combinations = [
      [parts1[0], parts1[1], parts2[0], parts2[1]], // 姓-名 vs 姓-名
      [parts1[0], parts1[1], parts2[1], parts2[0]], // 姓-名 vs 名-姓
    ];
    
    for (const [surname1, name1_part, surname2, name2_part] of combinations) {
      if (normalize(surname1) === normalize(surname2) && normalize(name1_part) === normalize(name2_part)) {
        return 0.95;
      }
    }
  }
  
  // レーベンシュタイン距離ベースの類似度
  const maxLength = Math.max(n1.length, n2.length);
  const distance = levenshteinDistance(n1, n2);
  return Math.max(0, 1 - (distance / maxLength));
}

// 電話番号の正規化と比較
export function normalizePhoneNumber(phone: string): string {
  return phone
    .replace(/[^\d]/g, '')
    .replace(/^0/, '')
    .replace(/^81/, ''); // 国際番号の日本(+81)を除去
}

export function comparePhoneNumbers(phone1: string, phone2: string): boolean {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  return normalized1 === normalized2 || 
         phone1.replace(/[^\d]/g, '') === phone2.replace(/[^\d]/g, '');
}

// メールアドレスの類似度チェック
export function compareEmailAddresses(email1: string, email2: string): {
  exact: boolean;
  domainMatch: boolean;
  similarity: number;
} {
  const normalize = (email: string) => email.toLowerCase().trim();
  const e1 = normalize(email1);
  const e2 = normalize(email2);
  
  if (e1 === e2) {
    return { exact: true, domainMatch: true, similarity: 1.0 };
  }
  
  const [local1, domain1] = e1.split('@');
  const [local2, domain2] = e2.split('@');
  
  const domainMatch = domain1 === domain2;
  
  // ローカル部の類似度
  const localSimilarity = 1 - (levenshteinDistance(local1, local2) / Math.max(local1.length, local2.length));
  
  return {
    exact: false,
    domainMatch,
    similarity: domainMatch ? Math.max(0.7, localSimilarity) : localSimilarity * 0.5,
  };
}

// 住所の部分一致チェック
export function compareAddresses(address1: string, address2: string): number {
  if (!address1 || !address2) return 0;
  
  const normalize = (addr: string) => addr.replace(/[都道府県市区町村]/g, '').replace(/\s+/g, '');
  const a1 = normalize(address1);
  const a2 = normalize(address2);
  
  // 完全一致
  if (a1 === a2) return 1.0;
  
  // 部分一致（長い方の50%以上が含まれている）
  const longer = a1.length > a2.length ? a1 : a2;
  const shorter = a1.length > a2.length ? a2 : a1;
  
  if (longer.includes(shorter) && shorter.length / longer.length >= 0.5) {
    return 0.8;
  }
  
  // 編集距離ベース
  const maxLength = Math.max(a1.length, a2.length);
  const distance = levenshteinDistance(a1, a2);
  return Math.max(0, 1 - (distance / maxLength));
}

// 総合マッチングスコア計算
export function calculateOverallMatchScore(
  participation: {
    participantName: string;
    participantEmail?: string;
    participantPhone?: string;
    participantAddress?: string;
  },
  lead: {
    name: string;
    email?: string;
    phone?: string;
    mobilePhone?: string;
    address?: string;
  }
): {
  overall: number;
  details: {
    name: number;
    email: number;
    phone: number;
    address: number;
  };
  matchedFields: string[];
} {
  const scores = {
    name: 0,
    email: 0,
    phone: 0,
    address: 0,
  };
  
  const matchedFields: string[] = [];
  
  // 名前スコア
  scores.name = calculateNameSimilarity(participation.participantName, lead.name);
  if (scores.name > 0.8) matchedFields.push('name');
  
  // メールスコア
  if (participation.participantEmail && lead.email) {
    const emailComparison = compareEmailAddresses(participation.participantEmail, lead.email);
    scores.email = emailComparison.similarity;
    if (emailComparison.exact) matchedFields.push('email');
  }
  
  // 電話番号スコア
  if (participation.participantPhone && (lead.phone || lead.mobilePhone)) {
    const phoneMatch = comparePhoneNumbers(
      participation.participantPhone, 
      lead.phone || lead.mobilePhone || ''
    );
    scores.phone = phoneMatch ? 1.0 : 0;
    if (phoneMatch) matchedFields.push('phone');
  }
  
  // 住所スコア
  if (participation.participantAddress && lead.address) {
    scores.address = compareAddresses(participation.participantAddress, lead.address);
    if (scores.address > 0.7) matchedFields.push('address');
  }
  
  // 重み付き総合スコア
  const weights = {
    name: 0.3,
    email: 0.4,
    phone: 0.2,
    address: 0.1,
  };
  
  const overall = Object.entries(scores).reduce((sum, [field, score]) => {
    return sum + (score * weights[field as keyof typeof weights]);
  }, 0);
  
  return {
    overall,
    details: scores,
    matchedFields,
  };
}

// 重複検出の閾値設定
export const MATCH_THRESHOLDS = {
  HIGH_CONFIDENCE: 0.9,    // 自動マージ可能
  MEDIUM_CONFIDENCE: 0.7,  // 手動確認推奨
  LOW_CONFIDENCE: 0.5,     // 候補として表示
  MINIMUM: 0.3,            // 最低閾値
} as const;

// マッチングタイプの判定
export function determineMatchType(
  overall: number,
  details: { name: number; email: number; phone: number; address: number },
  matchedFields: string[]
): 'EMAIL_EXACT' | 'PHONE_EXACT' | 'NAME_FUZZY' | 'PATTERN_ML' | 'LOW_CONFIDENCE' {
  if (details.email === 1.0) return 'EMAIL_EXACT';
  if (details.phone === 1.0) return 'PHONE_EXACT';
  if (details.name > 0.8 && matchedFields.length >= 2) return 'NAME_FUZZY';
  if (overall >= MATCH_THRESHOLDS.MEDIUM_CONFIDENCE) return 'PATTERN_ML';
  return 'LOW_CONFIDENCE';
}

// レーベンシュタイン距離計算（効率化版）
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator  // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// バッチ処理用のマッチング分析
export async function batchMatchAnalysis(
  participationIds: string[],
  organizationId: number
) {
  const results = [];
  
  for (const participationId of participationIds) {
    try {
      // 参加者情報取得
      const participation = await prisma.eventParticipation.findFirst({
        where: {
          id: participationId,
          organizationId,
          isExternal: true,
        },
      });
      
      if (!participation) continue;
      
      // 候補Lead検索
      const leads = await prisma.lead.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          mobilePhone: true,
          address: true,
        },
      });
      
      const matches = [];
      
      for (const lead of leads) {
        const matchResult = calculateOverallMatchScore({
          participantName: participation.participantName,
          participantEmail: participation.participantEmail || undefined,
          participantPhone: participation.participantPhone || undefined,
          participantAddress: participation.participantAddress || undefined,
        }, {
          name: lead.name,
          email: lead.email || undefined,
          phone: lead.phone || undefined,
          mobilePhone: lead.mobilePhone || undefined,
          address: lead.address || undefined,
        });
        
        if (matchResult.overall >= MATCH_THRESHOLDS.MINIMUM) {
          matches.push({
            leadId: lead.id,
            lead,
            ...matchResult,
            matchType: determineMatchType(matchResult.overall, matchResult.details, matchResult.matchedFields),
          });
        }
      }
      
      // 信頼度順でソート
      matches.sort((a, b) => b.overall - a.overall);
      
      results.push({
        participationId,
        participation,
        matches: matches.slice(0, 5), // 上位5件
      });
      
    } catch (error) {
      console.error(`Matching analysis failed for participation ${participationId}:`, error);
    }
  }
  
  return results;
}