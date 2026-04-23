import { ActionCategory, Prisma, UserEventType } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  COMPLEXITY_ORDER,
  selectAction,
  type ActionCandidate,
  type ActionComplexity,
  type CategoryState,
} from "@/lib/actions/selection";

const CATEGORY_LABELS: Record<ActionCategory, string> = {
  [ActionCategory.MENTAL_CLARITY]: "Mental Clarity",
  [ActionCategory.ORGANIZATION]: "Organization",
  [ActionCategory.HEALTH_ENERGY]: "Health & Energy",
  [ActionCategory.WORK_BUSINESS]: "Work & Business",
  [ActionCategory.PERSONAL_PROJECTS]: "Personal Projects",
  [ActionCategory.RELATIONSHIPS]: "Relationships",
};

export const dailyEmailUserInclude = Prisma.validator<Prisma.UserInclude>()({
  preference: true,
  subscription: true,
  adaptationState: true,
  dailySends: {
    orderBy: {
      sentAt: "desc",
    },
    take: 30,
    include: {
      action: {
        select: {
          category: true,
          text: true,
          texture: true,
        },
      },
    },
  },
  userEvents: {
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    include: {
      action: {
        select: {
          category: true,
        },
      },
    },
  },
});

export type DailyEmailUser = Prisma.UserGetPayload<{
  include: typeof dailyEmailUserInclude;
}>;

export type SelectedUserAction = {
  actionId: string;
  actionText: string;
  category: ActionCategory;
  categoryLabel: string;
};

function clampIndex(value: number): number {
  return Math.max(0, Math.min(COMPLEXITY_ORDER.length - 1, value));
}

function toComplexity(score: number): ActionComplexity {
  return COMPLEXITY_ORDER[clampIndex(score - 1)];
}

function getBaseComplexity(user: DailyEmailUser): ActionComplexity {
  if (!user.preference) {
    throw new Error(`User ${user.id} is missing preferences.`);
  }

  const availableMinutesIndex =
    user.preference.availableMinutes <= 5
      ? 0
      : user.preference.availableMinutes <= 10
        ? 1
        : 2;
  const energyIndex = clampIndex(user.preference.energyLevel - 1);
  const baseIndex = Math.min(availableMinutesIndex, energyIndex);
  const modifier = user.adaptationState?.currentComplexityModifier ?? 0;

  return COMPLEXITY_ORDER[clampIndex(baseIndex + modifier)];
}

function getCategoryState(
  user: DailyEmailUser,
  category: ActionCategory,
): CategoryState {
  const sentForCategory = user.dailySends.filter(
    (send) => send.status === "sent" && send.action?.category === category,
  );
  const eventsForCategory = user.userEvents.filter(
    (event) =>
      event.action?.category === category &&
      (event.eventType === UserEventType.CLICKED_YES ||
        event.eventType === UserEventType.CLICKED_PAUSE),
  );

  let consecutiveDoneCount = 0;
  let consecutivePauseCount = 0;

  for (const event of eventsForCategory) {
    if (event.eventType === UserEventType.CLICKED_YES) {
      if (consecutivePauseCount > 0) {
        break;
      }

      consecutiveDoneCount += 1;
      continue;
    }

    if (consecutiveDoneCount > 0) {
      break;
    }

    consecutivePauseCount += 1;
  }

  return {
    defaultComplexity: getBaseComplexity(user),
    consecutiveDoneCount,
    consecutivePauseCount,
    recentActionIds: sentForCategory
      .map((send) => send.actionId)
      .filter((actionId): actionId is string => Boolean(actionId)),
    recentTextures: sentForCategory
      .map((send) => send.action?.texture)
      .filter((texture): texture is string => Boolean(texture)),
  };
}

function buildCandidate(action: {
  id: string;
  text: string;
  texture: string;
  complexity: number;
  category: ActionCategory;
}): ActionCandidate {
  return {
    id: action.id,
    title: action.text,
    categorySlug: action.category.toLowerCase(),
    complexity: toComplexity(action.complexity),
    texture: action.texture,
    isFallback: action.id.includes("fallback"),
    lastSentAt: null,
  };
}

export async function selectActionForUser(
  user: DailyEmailUser,
): Promise<SelectedUserAction[]> {
  if (!user.preference) {
    console.warn(`Skipping daily action selection for user ${user.id}: missing preferences.`);
    return [];
  }

  const categories = user.preference.categories.filter(Boolean);

  if (categories.length === 0) {
    console.warn(`Skipping daily action selection for user ${user.id}: no selected categories.`);
    return [];
  }

  const selections: SelectedUserAction[] = [];

  for (const category of categories) {
    const actions = await prisma.action.findMany({
      where: {
        active: true,
        category,
        estimatedMinutes: {
          lte: user.preference.availableMinutes,
        },
      },
      orderBy: [{ complexity: "asc" }, { id: "asc" }],
    });
    const fallbackPool =
      actions.length > 0
        ? actions
        : await prisma.action.findMany({
            where: {
              active: true,
              category,
            },
            orderBy: [{ complexity: "asc" }, { id: "asc" }],
          });

    if (fallbackPool.length === 0) {
      console.warn(
        `Skipping category ${category} for user ${user.id}: no active actions found.`,
      );
      continue;
    }

    const sentById = new Map(
      user.dailySends
        .filter((send) => send.status === "sent" && send.action?.category === category)
        .flatMap((send) => (send.actionId ? [[send.actionId, send.sentAt] as const] : [])),
    );
    const actionById = new Map(fallbackPool.map((action) => [action.id, action]));
    const selection = selectAction(
      fallbackPool.map((action) => {
        const candidate = buildCandidate(action);
        candidate.lastSentAt = sentById.get(action.id) ?? null;
        return candidate;
      }),
      getCategoryState(user, category),
    );

    if (!selection) {
      console.warn(
        `Skipping category ${category} for user ${user.id}: selector returned no action.`,
      );
      continue;
    }

    const action = actionById.get(selection.action.id);

    if (!action) {
      console.warn(
        `Skipping category ${category} for user ${user.id}: selected action ${selection.action.id} was not found in the pool.`,
      );
      continue;
    }

    selections.push({
      actionId: action.id,
      actionText: action.text,
      category,
      categoryLabel: CATEGORY_LABELS[category],
    });
  }

  return selections;
}
