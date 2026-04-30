"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminForgotPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }
      setMessage(data.message ?? "Check your inbox for a reset link.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-6 py-24 text-[#121212]">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[#e7e7e7] bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8a8a8a]">Admin</p>
        <h1 className="mt-3 font-[var(--font-display)] text-2xl tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-[#666]">
          Enter the admin email address you use to sign in. If it exists, we will send a link to set a new
          password.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-medium text-[#555]" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
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
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/admin/login" className="font-medium text-[#121212] underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
