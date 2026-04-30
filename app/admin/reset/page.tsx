"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!tokenFromUrl) {
      setError("This link is missing a token. Open the link from your email again.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFromUrl, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Reset failed.");
        return;
      }
      setMessage("Password updated. You can sign in.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#e7e7e7] bg-white p-8 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-[#8a8a8a]">Admin</p>
      <h1 className="mt-3 font-[var(--font-display)] text-2xl tracking-tight">New password</h1>
      <p className="mt-2 text-sm text-[#666]">Choose a strong password (at least 10 characters).</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-xs font-medium text-[#555]" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-3 py-2 text-sm outline-none ring-[#121212] focus:ring-2"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-800">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#121212] py-3 text-sm font-medium text-white hover:bg-[#2a2a2a] disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="font-medium text-[#121212] underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function AdminResetPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-6 py-24 text-[#121212]">
      <Suspense
        fallback={<div className="mx-auto max-w-md text-sm text-[#666]">Loading…</div>}
      >
        <ResetForm />
      </Suspense>
    </div>
  );
}
