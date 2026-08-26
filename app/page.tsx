import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-card backdrop-blur dark:border-white/10 dark:bg-sage-900/80">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-sage-600 text-2xl font-bold tracking-tight text-white">
          TT
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-sage-600 dark:text-sage-100">
          Welcome to
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink dark:text-white">
          TableTap
        </h1>
        <p className="mx-auto mt-4 max-w-sm leading-7 text-slate-600 dark:text-slate-300">
          Scan the QR code at your table to request service in just a few taps.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/table/7"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sage-600 px-6 font-bold text-white transition hover:bg-sage-700 focus:outline-none focus:ring-4 focus:ring-sage-500/25"
          >
            View demo table
          </Link>
          <Link
            href="/pitch"
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 font-bold text-sage-700 transition hover:bg-sage-50 focus:outline-none focus:ring-4 focus:ring-sage-500/20 dark:text-sage-100 dark:hover:bg-white/5"
          >
            Manager pitch
          </Link>
        </div>
      </section>
    </main>
  );
}
