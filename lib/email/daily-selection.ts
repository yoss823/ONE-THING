import { Prisma, ActionCategory } from "@prisma/client";

import {
  selectAction,
  type ActionComplexity,
  type ActionCandidate,
  type CategoryState,
} from "@/lib/actions/selection";
import { prisma } from "@/lib/db";
import { formatCategoryLabel } from "@/lib/email/category-labels";

const COMPLEXITY_BY_ENERGY_LEVEL: Record<number, ActionComplexity> = {
  1: "lighter",
  2: "standard",
  3: "stretch",
};

const COMPLEXITY_BY_VALUE: Record<number, ActionComplexity> = {
  1: "lighter",
  2: "standard",
  3: "stretch",
};

export type SelectedDailyEmailAction = {
  name: string;
  action: string;
  actionId: string;
};

type SelectionParams = {
  userId: string;
  categories: ActionCategory[];
  energyLevel: number;
};

function getDefaultComplexity(energyLevel: number): ActionComplexity {
  return COMPLEXITY_BY_ENERGY_LEVEL[energyLevel] ?? "standard";
}

function countLeadingStatus(
  statuses: DailyDeliveryStatus[],
  targetStatus: DailyDeliveryStatus,
): number {
  let count = 0;

  for (const status of statuses) {
    if (status !== targetStatus) {
      break;
    }

    count += 1;
  }

  return count;
}

function buildCategoryState(
  defaultComplexity: ActionComplexity,
  logs: Array<{
    actionId: string | null;
    status: DailyDeliveryStatus;
    action: {
      texture: string;
    } | null;
  }>,
): CategoryState {
  return {
    defaultComplexity,
    consecutiveDoneCount: countLeadingStatus(
      logs.map((log) => log.status),
      Prisma.DailyDeliveryStatus.COMPLETED,
    ),
    consecutivePauseCount: countLeadingStatus(
      logs.map((log) => log.status),
      Prisma.DailyDeliveryStatus.SKIPPED,
    ),
    recentActionIds: logs.flatMap((log) => (log.actionId ? [log.actionId] : [])),
    recentTextures: logs.flatMap((log) =>
      log.action?.texture ? [log.action.texture] : [],
    ),
  };
}

function buildActionCandidates(
  actions: Array<{
    id: string;
    text: string;
    category: ActionCategory;
    complexity: number;
    texture: string;
  }>,
  lastSentAtByActionId: Map<string, Date>,
): ActionCandidate[] {
  return actions.map((action) => ({
    id: action.id,
    title: action.text,
    categorySlug: action.category,
    complexity: COMPLEXITY_BY_VALUE[action.complexity] ?? "standard",
    texture: action.texture,
    isFallback: false,
    lastSentAt: lastSentAtByActionId.get(action.id) ?? null,
  }));
}

export async function selectDailyEmailActions({
  userId,
  categories,
  energyLevel,
}: SelectionParams): Promise<SelectedDailyEmailAction[]> {
  const [recentLogs, actions] = await Promise.all([
    prisma.dailyDeliveryLog.findMany({
      where: {
        userId,
        type: Prisma.DailyDeliveryType.DAILY,
        actionId: {
          not: null,
        },
      },
      include: {
        action: {
          select: {
            category: true,
            texture: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 120,
    }),
    prisma.action.findMany({
      where: {
        active: true,
        category: {
          in: categories,
        },
      },
      select: {
        id: true,
        text: true,
        category: true,
        complexity: true,
        texture: true,
      },
      orderBy: [{ category: "asc" }, { id: "asc" }],
    }),
  ]);

  const defaultComplexity = getDefaultComplexity(energyLevel);

  return categories.flatMap((category) => {
    const categoryLogs = recentLogs.filter(
      (log) => log.action?.category === category,
    );
    const lastSentAtByActionId = new Map<string, Date>();

    for (const log of categoryLogs) {
      if (!log.actionId || lastSentAtByActionId.has(log.actionId)) {
        continue;
      }

      lastSentAtByActionId.set(log.actionId, log.sentAt);
    }

    const candidates = buildActionCandidates(
      actions.filter((action) => action.category === category),
      lastSentAtByActionId,
    );

    if (candidates.length === 0) {
      return [];
    }

    const categoryState = buildCategoryState(defaultComplexity, categoryLogs);
    const selected = selectAction(candidates, categoryState)?.action ?? candidates[0];

    return [
      {
        name: formatCategoryLabel(category),
        action: selected.title,
        actionId: selected.id,
      },
    ];
  });
}
