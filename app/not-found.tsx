import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">
          Page not found
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          This TableTap page is not available.
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Please scan the QR code again or ask a staff member for help.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-sage-600 px-6 font-bold text-white"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
