"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PosRequest, PosTable } from "@/lib/mock-pos-store";

type TableResponse = {
  table: PosTable;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PosTableDetail({ tableId }: { tableId: string }) {
  const [table, setTable] = useState<PosTable | null>(null);

  const loadTable = useCallback(async () => {
    const response = await fetch(`/api/mock-pos/tables/${tableId}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as TableResponse;
      setTable(data.table);
    }
  }, [tableId]);

  const markDone = async (request: PosRequest) => {
    await fetch(`/api/mock-pos/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    await loadTable();
  };

  useEffect(() => {
    queueMicrotask(() => void loadTable());
    const interval = setInterval(() => void loadTable(), 2500);

    return () => clearInterval(interval);
  }, [loadTable]);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 flex items-center justify-between">
          <Link href="/pos" className="font-bold text-sage-700 dark:text-sage-100">
            Back to POS dashboard
          </Link>
          <Link
            href={`/table/${tableId}`}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sage-700 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-sage-100"
          >
            Guest page
          </Link>
        </nav>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-sage-900/90 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sage-600 dark:text-sage-100">
            Mock Toast Terminal
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-ink dark:text-white">
            Table {tableId}
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Simulated open check and service request log.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sage-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-600 dark:text-sage-100">
                Check
              </p>
              <p className="mt-2 text-2xl font-black">$48.50</p>
            </div>
            <div className="rounded-2xl bg-sage-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-600 dark:text-sage-100">
                Guests
              </p>
              <p className="mt-2 text-2xl font-black">2</p>
            </div>
            <div className="rounded-2xl bg-sage-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-600 dark:text-sage-100">
                Status
              </p>
              <p className="mt-2 text-2xl font-black capitalize">
                {table?.status.replace("_", " ") || "Loading"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-black text-ink dark:text-white">
              Service Log
            </h2>
            {!table || table.requests.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500 dark:border-white/20 dark:text-slate-300">
                No TableTap requests have been received for this table.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {table.requests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {formatDateTime(request.requestedAt)}
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {request.requestType}
                        </p>
                        {request.customMessage && (
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {request.customMessage}
                          </p>
                        )}
                      </div>
                      {request.status === "done" ? (
                        <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-black text-sage-700">
                          Done
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markDone(request)}
                          className="min-h-10 rounded-xl bg-sage-600 px-4 text-sm font-bold text-white"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
