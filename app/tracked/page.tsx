type TrackedPageProps = {
  searchParams?: Promise<{
    response?: string;
  }>;
};

const contentByResponse = {
  done: {
    symbol: "✅",
    title: "Marked as done.",
    body: "See you tomorrow.",
  },
  skip: {
    symbol: "⏸",
    title: "Skipped for today.",
    body: "We'll adjust over time.",
  },
} as const;

export default async function TrackedPage({ searchParams }: TrackedPageProps) {
  const resolvedSearchParams = await searchParams;
  const response =
    resolvedSearchParams?.response === "done" ? "done" : "skip";
  const content = contentByResponse[response];

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#111]">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[400px] items-center justify-center">
        <div className="flex w-full flex-col items-center gap-4 rounded-[2rem] border border-[#e5e5e5] bg-[#faf8f2] px-8 py-12 text-center shadow-[0_18px_60px_rgba(17,17,17,0.08)]">
          <p className="text-5xl leading-none">{content.symbol}</p>
          <div className="space-y-2">
            <p className="text-xl font-medium text-[#111]">{content.title}</p>
            <p className="text-sm leading-7 text-[#4d4d4d]">{content.body}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
