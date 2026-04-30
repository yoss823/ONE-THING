import { ActionCategory } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatCategoryLabel } from "@/lib/email/category-labels";

const CATEGORY_DB_SLUG: Record<string, ActionCategory> = {
  mental_clarity: ActionCategory.MENTAL_CLARITY,
  organization: ActionCategory.ORGANIZATION,
  health_energy: ActionCategory.HEALTH_ENERGY,
  work_business: ActionCategory.WORK_BUSINESS,
  personal_projects: ActionCategory.PERSONAL_PROJECTS,
  relationships: ActionCategory.RELATIONSHIPS,
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeSubscribers: number;
  usersWithPreferences: number;
  avgCategoriesPerSubscriber: number | null;
  localeBreakdown: Array<{ locale: string; count: number }>;
  categoryPopularity: Array<{ category: ActionCategory; label: string; count: number }>;
  categoriesPerUserHistogram: Array<{ categoryCount: number; userCount: number }>;
  subscriptionStatusBreakdown: Array<{ status: string; count: number }>;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    totalUsers,
    activeSubscribers,
    usersWithPreferences,
    localeRows,
    statusRows,
    categoryRows,
    histogramRows,
    avgRow,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.userPreference.count(),
    prisma.userPreference.groupBy({
      by: ["locale"],
      _count: { locale: true },
      orderBy: { _count: { locale: "desc" } },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { _count: { status: "desc" } },
    }),
    prisma.$queryRaw<Array<{ cat: string; cnt: bigint }>>`
      SELECT (unnest(categories))::text AS cat, COUNT(*)::bigint AS cnt
      FROM user_preferences
      GROUP BY 1
      ORDER BY cnt DESC
    `,
    prisma.$queryRaw<Array<{ n: number; cnt: bigint }>>`
      SELECT cardinality(categories) AS n, COUNT(*)::bigint AS cnt
      FROM user_preferences
      GROUP BY 1
      ORDER BY n ASC
    `,
    prisma.$queryRaw<Array<{ avg: number | null }>>`
      SELECT AVG(cardinality(categories))::float AS avg
      FROM user_preferences
    `,
  ]);

  const categoryPopularity = categoryRows
    .map((row) => {
      const slug = row.cat.trim();
      const category = CATEGORY_DB_SLUG[slug];
      if (!category) {
        return null;
      }
      return {
        category,
        label: formatCategoryLabel(category),
        count: Number(row.cnt),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    totalUsers,
    activeSubscribers,
    usersWithPreferences,
    avgCategoriesPerSubscriber: avgRow[0]?.avg ?? null,
    localeBreakdown: localeRows.map((r) => ({
      locale: r.locale || "unknown",
      count: r._count.locale,
    })),
    categoryPopularity,
    categoriesPerUserHistogram: histogramRows.map((r) => ({
      categoryCount: r.n,
      userCount: Number(r.cnt),
    })),
    subscriptionStatusBreakdown: statusRows.map((r) => ({
      status: r.status,
      count: r._count.status,
    })),
  };
}
