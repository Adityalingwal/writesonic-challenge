import {
  createSession,
  getSessionById,
  updateSessionStatus,
  getSessionWithResponseCount,
} from "../../db/dao/session/sessionDAO";
import {
  createPromptsBatch,
  getPromptsBySessionId,
} from "../../db/dao/prompt/promptDAO";
import {
  getResponsesBySessionId,
  getResponseCountBySession,
} from "../../db/dao/response/responseDAO";
import { getMentionsBySessionId } from "../../db/dao/mention/mentionDAO";
import { getCitationsBySessionId } from "../../db/dao/citation/citationDAO";
import { generatePrompts } from "../prompt/generator";
import { addAuditJob } from "../../lib/queue";
import { TrackingSession } from "../../db/dao/session/types";

export interface StartTrackingInput {
  category: string;
  myBrand: string;
  competitors: string[];
  customPrompts?: string[];
}

export interface SessionMetrics {
  overallVisibility: number;
  citationShare: Record<string, number>;
  totalResponses: number;
}

export interface TrackingResult {
  session: TrackingSession;
  prompts: any[];
  responses: any[];
  mentions: any[];
  citations: any[];
  metrics: SessionMetrics;
}

export const startTracking = async (
  input: StartTrackingInput
): Promise<{
  sessionId: string;
  totalPrompts: number;
}> => {
  const { category, myBrand, competitors } = input;

  const allBrands = [myBrand, ...competitors];

  const generatedPrompts = generatePrompts(category);

  const session = await createSession({
    category,
    primaryBrand: myBrand,
    competitors,
    brands: allBrands,
    totalPrompts: generatedPrompts.length,
  });

  await createPromptsBatch(
    generatedPrompts.map((prompt) => ({
      sessionId: session.id,
      promptText: prompt.text,
    }))
  );

  await addAuditJob({
    sessionId: session.id,
    prompts: generatedPrompts.map((p) => p.text),
    brands: allBrands,
    platforms: ["chatgpt"],
  });

  await updateSessionStatus(session.id, "RUNNING");

  return {
    sessionId: session.id,
    totalPrompts: generatedPrompts.length,
  };
};

export const getSessionStatus = async (
  sessionId: string
): Promise<{
  status: string;
  progress: number;
  totalPrompts: number;
  completedResponses: number;
  createdAt: string;
  completedAt?: string;
} | null> => {
  const data = await getSessionWithResponseCount(sessionId);

  if (!data) {
    return null;
  }

  const { session, responseCount } = data;
  const expectedResponses = session.totalPrompts;
  const progress =
    expectedResponses > 0
      ? Math.round((responseCount / expectedResponses) * 100)
      : 0;

  return {
    status: session.status,
    progress,
    totalPrompts: session.totalPrompts,
    completedResponses: responseCount,
    createdAt: session.createdAt,
    completedAt: session.completedAt,
  };
};

export const stopTracking = async (
  sessionId: string
): Promise<TrackingSession | null> => {
  const session = await updateSessionStatus(sessionId, "FAILED");
  return session || null;
};

export const getTrackingResults = async (
  sessionId: string
): Promise<TrackingResult | null> => {
  const session = await getSessionById(sessionId);

  if (!session) {
    return null;
  }

  const [prompts, responses, mentions, citations] = await Promise.all([
    getPromptsBySessionId(sessionId),
    getResponsesBySessionId(sessionId),
    getMentionsBySessionId(sessionId),
    getCitationsBySessionId(sessionId),
  ]);

  const metrics = await calculateMetrics(sessionId, session, mentions);

  return {
    session,
    prompts,
    responses,
    mentions,
    citations,
    metrics,
  };
};

export const calculateMetrics = async (
  sessionId: string,
  session: TrackingSession,
  mentions?: any[]
): Promise<SessionMetrics> => {
  const mentionsData = mentions || (await getMentionsBySessionId(sessionId));
  const responseCount = await getResponseCountBySession(sessionId);

  const mentionCounts: Record<string, number> = {};
  mentionsData.forEach((m) => {
    mentionCounts[m.brandName] =
      (mentionCounts[m.brandName] || 0) + m.mentionCount;
  });

  const totalMentions = Object.values(mentionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const promptsWithMentions = new Set(mentionsData.map((m) => m.promptId)).size;

  const overallVisibility =
    session.totalPrompts > 0
      ? Math.round((promptsWithMentions / session.totalPrompts) * 100)
      : 0;

  const citationShare: Record<string, number> = {};
  for (const [brand, count] of Object.entries(mentionCounts)) {
    citationShare[brand] =
      totalMentions > 0 ? Math.round((count / totalMentions) * 100) : 0;
  }

  const metrics: SessionMetrics = {
    overallVisibility,
    citationShare,
    totalResponses: responseCount,
  };

  return metrics;
};

export const getLeaderboard = async (
  sessionId: string
): Promise<
  {
    rank: number;
    brand: string;
    visibilityScore: number;
    citationShare: number;
    mentionCount: number;
  }[]
> => {
  const session = await getSessionById(sessionId);

  if (!session) {
    return [];
  }

  const [mentions, responseCount] = await Promise.all([
    getMentionsBySessionId(sessionId),
    getResponseCountBySession(sessionId),
  ]);

  const brandStats: Record<
    string,
    {
      mentions: number;
      responsesMentioned: Set<string>;
    }
  > = {};

  session.brands.forEach((brand) => {
    brandStats[brand] = {
      mentions: 0,
      responsesMentioned: new Set(),
    };
  });

  mentions.forEach((mention) => {
    if (brandStats[mention.brandName]) {
      brandStats[mention.brandName].mentions += mention.mentionCount;
      brandStats[mention.brandName].responsesMentioned.add(mention.responseId);
    }
  });

  const totalMentions = Object.values(brandStats).reduce(
    (sum, b) => sum + b.mentions,
    0
  );

  return Object.entries(brandStats)
    .map(([brand, stats]) => ({
      brand,
      mentionCount: stats.mentions,
      visibilityScore:
        responseCount > 0
          ? Math.round((stats.responsesMentioned.size / responseCount) * 100)
          : 0,
      citationShare: Math.round((stats.mentions / (totalMentions || 1)) * 100),
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .map((entry, index) => ({ rank: index + 1, ...entry }));
};

export interface BrandPerformance {
  mentionCount: number;
  isPresent: boolean;
  isWinner: boolean;
  context: string | null;
}

export interface PromptMatrixEntry {
  promptId: string;
  promptText: string;
  brandPerformance: Record<string, BrandPerformance>;
  winner: string | null;
}

export interface BrandAggregatedStats {
  totalMentions: number;
  promptsWon: number;
  promptsPresent: number;
  promptsMissed: number;
  citationShare: number;
}

export interface CompetitiveMatrixResult {
  matrix: PromptMatrixEntry[];
  aggregatedStats: Record<string, BrandAggregatedStats>;
  brands: string[];
  totalPrompts: number;
}

export const getCompetitiveMatrix = async (
  sessionId: string
): Promise<CompetitiveMatrixResult | null> => {
  const session = await getSessionById(sessionId);

  if (!session) {
    return null;
  }

  const [prompts, mentions] = await Promise.all([
    getPromptsBySessionId(sessionId),
    getMentionsBySessionId(sessionId),
  ]);

  const brands = session.brands;
  const totalPrompts = prompts.length;

  const matrix: PromptMatrixEntry[] = prompts.map((prompt) => {
    const promptMentions = mentions.filter((m) => m.promptId === prompt.id);

    const brandPerformance: Record<string, BrandPerformance> = {};
    let maxMentions = 0;

    brands.forEach((brand) => {
      const brandMention = promptMentions.find((m) => m.brandName === brand);
      const mentionCount = brandMention?.mentionCount || 0;

      brandPerformance[brand] = {
        mentionCount,
        isPresent: mentionCount > 0,
        isWinner: false,
        context: brandMention?.context || null,
      };

      if (mentionCount > maxMentions) {
        maxMentions = mentionCount;
      }
    });

    let winner: string | null = null;
    if (maxMentions > 0) {
      const winners = brands.filter(
        (brand) => brandPerformance[brand].mentionCount === maxMentions
      );
      if (winners.length === 1) {
        winner = winners[0];
        brandPerformance[winner].isWinner = true;
      }
    }

    return {
      promptId: prompt.id,
      promptText: prompt.promptText,
      brandPerformance,
      winner,
    };
  });

  const totalMentionsAll = mentions.reduce((sum, m) => sum + m.mentionCount, 0);

  const aggregatedStats: Record<string, BrandAggregatedStats> = {};

  brands.forEach((brand) => {
    const brandMentions = mentions.filter((m) => m.brandName === brand);
    const totalMentions = brandMentions.reduce(
      (sum, m) => sum + m.mentionCount,
      0
    );
    const promptsPresent = new Set(brandMentions.map((m) => m.promptId)).size;
    const promptsWon = matrix.filter((entry) => entry.winner === brand).length;
    const promptsMissed = totalPrompts - promptsPresent;

    aggregatedStats[brand] = {
      totalMentions,
      promptsWon,
      promptsPresent,
      promptsMissed,
      citationShare:
        totalMentionsAll > 0
          ? Math.round((totalMentions / totalMentionsAll) * 100)
          : 0,
    };
  });

  return {
    matrix,
    aggregatedStats,
    brands,
    totalPrompts,
  };
};
