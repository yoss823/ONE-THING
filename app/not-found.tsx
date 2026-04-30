import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 py-16 text-center text-[#121212]">
      <p className="text-xs uppercase tracking-[0.22em] text-[#8a8a8a]">404</p>
      <h1 className="mt-4 max-w-md font-[var(--font-display)] text-3xl tracking-tight sm:text-4xl">
        This page does not exist.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#666]">
        The link may be wrong or the page was removed. You can go back to the home page.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex rounded-full border border-[#121212] bg-[#121212] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2a2a2a]"
      >
        Home
      </Link>
    </main>
  );
}
