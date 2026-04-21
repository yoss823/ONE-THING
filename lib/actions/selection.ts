export const COMPLEXITY_ORDER = ["lighter", "standard", "stretch"] as const;

export type ActionComplexity = (typeof COMPLEXITY_ORDER)[number];
export type FeedbackKind = "done" | "pause" | "none";

export type ActionCandidate = {
  id: string;
  title: string;
  categorySlug: string;
  complexity: ActionComplexity;
  texture: string;
  isFallback: boolean;
  lastSentAt: Date | null;
};

export type CategoryState = {
  defaultComplexity: ActionComplexity;
  consecutiveDoneCount: number;
  consecutivePauseCount: number;
  recentActionIds: string[];
  recentTextures: string[];
};

export type SelectionResult = {
  action: ActionCandidate;
  targetComplexity: ActionComplexity;
  relaxedRules: string[];
};

export function deriveTargetComplexity(state: CategoryState): ActionComplexity {
  const baseIndex = COMPLEXITY_ORDER.indexOf(state.defaultComplexity);

  if (state.consecutiveDoneCount >= 5) {
    return COMPLEXITY_ORDER[Math.min(baseIndex + 1, COMPLEXITY_ORDER.length - 1)];
  }

  if (state.consecutivePauseCount >= 3) {
    return COMPLEXITY_ORDER[Math.max(baseIndex - 1, 0)];
  }

  return state.defaultComplexity;
}

export function selectAction(
  candidates: ActionCandidate[],
  state: CategoryState,
): SelectionResult | null {
  if (!candidates.length) {
    return null;
  }

  const relaxedRules: string[] = [];
  const targetComplexity = deriveTargetComplexity(state);
  const recentExactIds = new Set(state.recentActionIds.slice(0, 10));
  const recentTextures = new Set(state.recentTextures.slice(0, 3));
  const newestTexture = state.recentTextures[0] ?? null;

  let pool = candidates.filter((candidate) => !recentExactIds.has(candidate.id));

  if (!pool.length) {
    pool = [...candidates];
    relaxedRules.push("exact_repeat_cooldown_relaxed");
  }

  const nonFallbackPool = pool.filter((candidate) => !candidate.isFallback);
  if (nonFallbackPool.length) {
    pool = nonFallbackPool;
  } else {
    relaxedRules.push("fallback_pool_used");
  }

  const complexityPool = pool.filter(
    (candidate) => candidate.complexity === targetComplexity,
  );
  if (complexityPool.length) {
    pool = complexityPool;
  } else {
    relaxedRules.push("complexity_mismatch_allowed");
  }

  const newestTexturePool = pool.filter(
    (candidate) => candidate.texture !== newestTexture,
  );
  if (newestTexturePool.length) {
    pool = newestTexturePool;
  } else if (newestTexture) {
    relaxedRules.push("most_recent_texture_repeated");
  }

  const freshTexturePool = pool.filter(
    (candidate) => !recentTextures.has(candidate.texture),
  );
  if (freshTexturePool.length) {
    pool = freshTexturePool;
  } else if (recentTextures.size > 0) {
    relaxedRules.push("three_send_texture_window_relaxed");
  }

  const sortedPool = [...pool].sort((left, right) => {
    const leftTime = left.lastSentAt?.getTime() ?? 0;
    const rightTime = right.lastSentAt?.getTime() ?? 0;

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.title.localeCompare(right.title);
  });

  const action = sortedPool[0];

  return {
    action,
    targetComplexity,
    relaxedRules,
  };
}

export function evolveCategoryState(
  state: CategoryState,
  feedback: FeedbackKind,
): CategoryState {
  if (feedback === "done") {
    return {
      ...state,
      consecutiveDoneCount: state.consecutiveDoneCount + 1,
      consecutivePauseCount: 0,
    };
  }

  if (feedback === "pause") {
    return {
      ...state,
      consecutiveDoneCount: 0,
      consecutivePauseCount: state.consecutivePauseCount + 1,
    };
  }

  return state;
}
