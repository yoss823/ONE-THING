import { Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CategorySlug =
  | "mental_clarity"
  | "organization"
  | "health_energy"
  | "work_business"
  | "personal_projects"
  | "relationships";

type ComplexitySlug = "lighter" | "standard" | "stretch";

type LaunchCategory = {
  slug: CategorySlug;
  label: string;
};

type LaunchAction = {
  id: string;
  category_slug: CategorySlug;
  title: string;
  instruction: string;
  minutes: number;
  why_it_matters: string;
  complexity: ComplexitySlug;
  texture: string;
  is_fallback: boolean;
};

type OrganizationBundle = {
  category_slug: "organization";
  actions: Array<Omit<LaunchAction, "category_slug">>;
};

type SeedAction = {
  id: string;
  category: CategorySlug;
  text: string;
  texture: string;
  complexity: number;
  estimatedMinutes: number;
  active: boolean;
};

const prisma = new PrismaClient();
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const complexityMap: Record<ComplexitySlug, number> = {
  lighter: 1,
  standard: 2,
  stretch: 3,
};

function readJson<T>(relativePath: string): T {
  const filePath = path.join(rootDir, relativePath);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function clampMinutes(minutes: number): 5 | 10 | 15 {
  if (minutes <= 5) {
    return 5;
  }

  if (minutes >= 15) {
    return 15;
  }

  return 10;
}

function buildVariant(action: LaunchAction, variant: "core" | "small" | "full"): SeedAction {
  const baseComplexity = complexityMap[action.complexity];
  const baseMinutes = clampMinutes(action.minutes);
  const textByVariant = {
    core: `${action.title}: ${action.instruction}`,
    small: `Small pass: ${action.instruction}`,
    full: `Full pass: ${action.instruction}`,
  };
  const complexityByVariant = {
    core: baseComplexity,
    small: Math.max(1, baseComplexity - 1),
    full: Math.min(3, baseComplexity + 1),
  };
  const minutesByVariant = {
    core: baseMinutes,
    small: clampMinutes(baseMinutes - 5),
    full: clampMinutes(baseMinutes + 5),
  };
  const idSuffix = {
    core: "",
    small: "__small",
    full: "__full",
  };

  return {
    id: `${action.id}${idSuffix[variant]}`,
    category: action.category_slug,
    text: normalizeText(textByVariant[variant]),
    texture: action.texture,
    complexity: complexityByVariant[variant],
    estimatedMinutes: minutesByVariant[variant],
    active: true,
  };
}

function buildOrganizationSeedAction(action: Omit<LaunchAction, "category_slug">): SeedAction {
  return {
    id: action.id,
    category: "organization",
    text: normalizeText(`${action.title}: ${action.instruction}`),
    texture: action.texture,
    complexity: complexityMap[action.complexity],
    estimatedMinutes: clampMinutes(action.minutes),
    active: true,
  };
}

function groupByCategory(actions: LaunchAction[]): Record<CategorySlug, LaunchAction[]> {
  return actions.reduce<Record<CategorySlug, LaunchAction[]>>(
    (result, action) => {
      result[action.category_slug].push(action);
      return result;
    },
    {
      mental_clarity: [],
      organization: [],
      health_energy: [],
      work_business: [],
      personal_projects: [],
      relationships: [],
    },
  );
}

async function main() {
  const categories = readJson<LaunchCategory[]>("data/action-library/launch-categories.json");
  const launchActions = readJson<LaunchAction[]>("data/action-library/launch-actions.json");
  const organizationBundle = readJson<OrganizationBundle>(
    "data/action-library/mvp-organization-actions.json",
  );
  const grouped = groupByCategory(launchActions);

  const seededByCategory = categories.reduce<Record<CategorySlug, SeedAction[]>>(
    (result, category) => {
      if (category.slug === "organization") {
        result.organization = organizationBundle.actions
          .slice(0, 30)
          .map(buildOrganizationSeedAction);
        return result;
      }

      const actionsForCategory = grouped[category.slug];
      const seededActions = actionsForCategory.flatMap((action) =>
        action.is_fallback
          ? [buildVariant(action, "core")]
          : [buildVariant(action, "core"), buildVariant(action, "small"), buildVariant(action, "full")],
      );

      if (seededActions.length < 30) {
        throw new Error(
          `Expected at least 30 actions for ${category.slug}, found ${seededActions.length}.`,
        );
      }

      result[category.slug] = seededActions;
      return result;
    },
    {
      mental_clarity: [],
      organization: [],
      health_energy: [],
      work_business: [],
      personal_projects: [],
      relationships: [],
    },
  );

  const allSeedActions = categories.flatMap((category) => seededByCategory[category.slug]);
  const allSeedActionIds = allSeedActions.map((action) => action.id);

  for (const category of categories) {
    const count = seededByCategory[category.slug].length;

    if (count < 30) {
      throw new Error(`Category ${category.slug} only has ${count} seed actions.`);
    }
  }

  const values = allSeedActions.map((action) => Prisma.sql`
    (
      ${action.id},
      CAST(${action.category} AS "ActionCategory"),
      ${action.text},
      ${action.texture},
      ${action.complexity},
      ${action.estimatedMinutes},
      ${action.active}
    )
  `);

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "actions" (
      "id",
      "category",
      "text",
      "texture",
      "complexity",
      "estimated_minutes",
      "active"
    )
    VALUES ${Prisma.join(values)}
    ON CONFLICT ("id") DO UPDATE SET
      "category" = EXCLUDED."category",
      "text" = EXCLUDED."text",
      "texture" = EXCLUDED."texture",
      "complexity" = EXCLUDED."complexity",
      "estimated_minutes" = EXCLUDED."estimated_minutes",
      "active" = EXCLUDED."active"
  `);

  await prisma.action.updateMany({
    where: {
      id: {
        notIn: allSeedActionIds,
      },
    },
    data: {
      active: false,
    },
  });

  const summary = categories.map((category) => ({
    category: category.slug,
    count: seededByCategory[category.slug].length,
  }));

  console.table(summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
