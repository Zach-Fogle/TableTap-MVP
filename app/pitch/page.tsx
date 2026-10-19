import Link from "next/link";

const benefits = [
  {
    title: "Fewer missed requests",
    body: "Guests can ask for napkins, refills, plates, sauce, or the check without waiting to catch eye contact during a rush.",
  },
  {
    title: "Clear request ownership",
    body: "Authenticated staff can claim, reassign, and complete table-numbered requests in one restaurant-scoped queue.",
  },
  {
    title: "Bounded evaluation",
    body: "The next step is a staff walkthrough focused on ownership, queue coverage, duplicates, and operational fit before any live pilot.",
  },
];

const walkthroughSteps = [
  "Have a server submit, claim, and complete one routine request.",
  "Test reassignment and ask how the table's server stays informed.",
  "Introduce a duplicate request and a period with no queue coverage.",
  "Record confusion, missing controls, and staff effort before deciding on a pilot.",
];

const demoRequests = [
  { table: "7", request: "Refill", status: "New" },
  { table: "12", request: "Check Please", status: "Seen" },
  { table: "3", request: "Extra Sauce", status: "Done" },
];

export default function PitchPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-ink dark:text-white"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-sage-600 text-white">
              TT
            </span>
            TableTap
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/table/7"
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-sage-700 shadow-sm ring-1 ring-sage-600/10 transition hover:bg-white dark:bg-white/10 dark:text-sage-100 dark:ring-white/10"
            >
              Guest workflow
            </Link>
            <Link
              href="/pos"
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-sage-700 shadow-sm ring-1 ring-sage-600/10 transition hover:bg-white dark:bg-white/10 dark:text-sage-100 dark:ring-white/10"
            >
              Staff queue
            </Link>
          </div>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-card backdrop-blur dark:border-white/10 dark:bg-sage-900/90 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-sage-600 dark:text-sage-100">
              Restaurant service workflow
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">
              A QR request button for every table.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              TableTap lets guests ask for common service items without
              interrupting the floor. Staff receive clear table-numbered
              alerts, and management can test the workflow before committing to
              deeper POS integration.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/table/7"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-terracotta-500 px-6 font-bold text-white shadow-lg shadow-terracotta-500/20 transition hover:bg-terracotta-600"
              >
                Scan-style demo
              </Link>
              <a
                href="/pos"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sage-50 px-6 font-bold text-sage-700 ring-1 ring-sage-600/10 transition hover:bg-sage-100 dark:bg-white/10 dark:text-sage-100 dark:ring-white/10"
              >
                Open POS view
              </a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/70 bg-ink p-5 text-white shadow-card dark:border-white/10">
            <div className="rounded-[1.5rem] bg-white/8 p-5 ring-1 ring-white/10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-100">
                    Staff view
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Live requests</h2>
                </div>
                <span className="rounded-full bg-terracotta-500 px-3 py-1 text-xs font-bold">
                  Demo
                </span>
              </div>
              <div className="space-y-3">
                {demoRequests.map((item) => (
                  <div
                    key={`${item.table}-${item.request}`}
                    className="rounded-2xl bg-white p-4 text-ink"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-600">
                          Table {item.table}
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {item.request}
                        </p>
                      </div>
                      <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-bold text-sage-700">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <h2 className="text-xl font-black text-ink dark:text-white">
                {benefit.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                {benefit.body}
              </p>
            </article>
          ))}
        </section>

        <section
          id="walkthrough"
          className="mt-6 rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-card dark:border-white/10 dark:bg-sage-900/90 sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-sage-600 dark:text-sage-100">
                Recommended next step
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white">
                Run an employee walkthrough.
              </h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                Test whether staff understand ownership, coverage, duplicate
                handling, and completion before introducing the workflow to
                live guests.
              </p>
            </div>
            <ol className="space-y-3">
              {walkthroughSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-2xl bg-sage-50 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sage-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
