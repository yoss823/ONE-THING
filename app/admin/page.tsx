import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { verifyAdminSession } from "@/lib/admin/session";
import { getAdminDashboardStats } from "@/lib/admin/stats";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const token = (await cookies()).get("onestep_admin")?.value;
  if (!token) {
    redirect("/admin/login");
  }

  const adminUserId = await verifyAdminSession(token);
  if (!adminUserId) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
    select: { email: true },
  });

  const stats = await getAdminDashboardStats();

  return (
    <div className="min-h-screen bg-[#fafafa] px-6 py-14 text-[#121212]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-[#e7e7e7] pb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#8a8a8a]">Admin</p>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl tracking-tight">ONE THING — stats</h1>
            {admin?.email ? (
              <p className="mt-2 text-sm text-[#666]">Signed in as {admin.email}</p>
            ) : null}
          </div>
          <AdminLogoutButton />
        </header>

        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total registered users" value={stats.totalUsers} />
          <StatCard label="Active subscriptions" value={stats.activeSubscribers} />
          <StatCard label="Users with preferences" value={stats.usersWithPreferences} />
          <StatCard
            label="Avg. themes per subscriber"
            value={
              stats.avgCategoriesPerSubscriber === null
                ? "—"
                : stats.avgCategoriesPerSubscriber.toFixed(2)
            }
          />
        </section>

        <section className="mb-12 rounded-2xl border border-[#e7e7e7] bg-white p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b]">
            Subscriptions by status
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.subscriptionStatusBreakdown.map((row) => (
              <li key={row.status} className="flex justify-between border-b border-[#f0f0f0] py-2 last:border-0">
                <span className="text-[#444]">{row.status}</span>
                <span className="font-medium">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-[#e7e7e7] bg-white p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b]">
            Interface language (saved preferences)
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.localeBreakdown.map((row) => (
              <li key={row.locale} className="flex justify-between border-b border-[#f0f0f0] py-2 last:border-0">
                <span className="text-[#444]">{row.locale}</span>
                <span className="font-medium">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#e7e7e7] bg-white p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b]">
              Most selected themes (categories)
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {stats.categoryPopularity.map((row) => (
                <li
                  key={row.category}
                  className="flex justify-between border-b border-[#f0f0f0] py-2 last:border-0"
                >
                  <span className="text-[#444]">{row.label}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#e7e7e7] bg-white p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b8b8b]">
              Themes per person (histogram)
            </h2>
            <p className="mt-2 text-xs text-[#8a8a8a]">How many categories each subscriber saved.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {stats.categoriesPerUserHistogram.map((row) => (
                <li
                  key={row.categoryCount}
                  className="flex justify-between border-b border-[#f0f0f0] py-2 last:border-0"
                >
                  <span className="text-[#444]">{row.categoryCount} theme(s)</span>
                  <span className="font-medium">{row.userCount} users</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-[#e7e7e7] bg-white p-5">
      <p className="text-xs text-[#8a8a8a]">{label}</p>
      <p className="mt-2 font-[var(--font-display)] text-3xl tracking-tight text-[#151515]">{value}</p>
    </div>
  );
}
