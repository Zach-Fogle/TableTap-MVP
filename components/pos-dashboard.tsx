"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PosRequest,
  PosRequestStatus,
  PosTable,
} from "@/lib/mock-pos-store";

type PosSnapshot = {
  requests: PosRequest[];
  tables: PosTable[];
};

type QueueTab = "active" | "completed";

const statusLabels: Record<PosRequestStatus, string> = {
  new: "New",
  seen: "Seen",
  in_progress: "In Progress",
  done: "Done",
};

const statusStyles: Record<PosRequestStatus, string> = {
  new: "bg-red-100 text-red-700",
  seen: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-sage-100 text-sage-700",
};

function tableStatusStyle(status: PosTable["status"]) {
  if (status === "check_requested") {
    return "border-terracotta-500 bg-terracotta-100 text-terracotta-600";
  }

  if (status === "needs_attention") {
    return "border-amber-400 bg-amber-100 text-amber-800";
  }

  if (status === "clear") {
    return "border-sage-500 bg-sage-50 text-sage-700";
  }

  return "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
}

function formatRequestTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PosDashboard() {
  const [snapshot, setSnapshot] = useState<PosSnapshot>({
    requests: [],
    tables: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<QueueTab>("active");

  const loadSnapshot = useCallback(async () => {
    const response = await fetch("/api/mock-pos/requests", {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    setSnapshot((await response.json()) as PosSnapshot);
    setIsLoading(false);
  }, []);

  const updateStatus = async (requestId: string, status: PosRequestStatus) => {
    await fetch(`/api/mock-pos/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadSnapshot();
  };

  useEffect(() => {
    queueMicrotask(() => void loadSnapshot());
    const interval = setInterval(() => void loadSnapshot(), 2500);

    return () => clearInterval(interval);
  }, [loadSnapshot]);

  const activeRequests = useMemo(
    () => snapshot.requests.filter((request) => request.status !== "done"),
    [snapshot.requests],
  );
  const completedRequests = useMemo(
    () => snapshot.requests.filter((request) => request.status === "done"),
    [snapshot.requests],
  );
  const visibleRequests =
    selectedTab === "active" ? activeRequests : completedRequests;

  return (
    <main className="min-h-screen px-5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-black text-ink dark:text-white"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-white dark:bg-white dark:text-ink">
              POS
            </span>
            TableTap POS Demo
          </Link>
          <div className="flex gap-2">
            <Link
              href="/table/7"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sage-700 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-sage-100 dark:ring-white/10"
            >
              Guest demo
            </Link>
            <Link
              href="/pitch"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sage-700 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-sage-100 dark:ring-white/10"
            >
              Pitch
            </Link>
          </div>
        </nav>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-ink p-6 text-white shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-100">
              Active
            </p>
            <p className="mt-3 text-5xl font-black">{activeRequests.length}</p>
            <p className="mt-2 text-sm text-slate-300">Requests waiting</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-6 shadow-card dark:bg-white/10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">
              Completed
            </p>
            <p className="mt-3 text-5xl font-black">
              {completedRequests.length}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Requests handled
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-6 shadow-card dark:bg-white/10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">
              Auto Refresh
            </p>
            <p className="mt-3 text-5xl font-black">2.5s</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Polling demo mode
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-card dark:border-white/10 dark:bg-sage-900/90 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">
                  Floor
                </p>
                <h1 className="text-2xl font-black text-ink dark:text-white">
                  Tables
                </h1>
              </div>
              {isLoading && (
                <span className="text-sm font-bold text-slate-400">
                  Loading...
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {snapshot.tables.map((table) => (
                <Link
                  key={table.id}
                  href={`/pos/table/${table.id}`}
                  className={`min-h-28 rounded-2xl border-2 p-4 transition hover:scale-[1.02] ${tableStatusStyle(table.status)}`}
                >
                  <p className="text-sm font-bold uppercase tracking-[0.16em]">
                    Table
                  </p>
                  <p className="mt-1 text-3xl font-black">{table.id}</p>
                  <p className="mt-2 text-xs font-bold capitalize">
                    {table.status.replace("_", " ")}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-card dark:border-white/10 dark:bg-sage-900/90 sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">
                Queue
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-2xl font-black text-ink dark:text-white">
                  {selectedTab === "active"
                    ? "Active Requests"
                    : "Completed Requests"}
                </h2>
                <div
                  className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-white/10"
                  role="tablist"
                  aria-label="Request queue tabs"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === "active"}
                    onClick={() => setSelectedTab("active")}
                    className={[
                      "min-h-10 rounded-xl px-4 text-sm font-black transition",
                      selectedTab === "active"
                        ? "bg-ink text-white shadow-sm dark:bg-white dark:text-ink"
                        : "text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-white",
                    ].join(" ")}
                  >
                    Active ({activeRequests.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === "completed"}
                    onClick={() => setSelectedTab("completed")}
                    className={[
                      "min-h-10 rounded-xl px-4 text-sm font-black transition",
                      selectedTab === "completed"
                        ? "bg-ink text-white shadow-sm dark:bg-white dark:text-ink"
                        : "text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-white",
                    ].join(" ")}
                  >
                    Completed ({completedRequests.length})
                  </button>
                </div>
              </div>
            </div>

            {snapshot.requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-white/20 dark:text-slate-300">
                No requests yet. Open `/table/7`, send one, and watch it land
                here.
              </div>
            ) : visibleRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-white/20 dark:text-slate-300">
                {selectedTab === "active"
                  ? "No active requests. New table requests will appear here."
                  : "No completed requests yet. Mark an active request Done to move it here."}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleRequests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">
                          Table {request.tableId} ·{" "}
                          {formatRequestTime(request.requestedAt)}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-ink dark:text-white">
                          {request.requestType}
                        </h3>
                        {request.customMessage && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {request.customMessage}
                          </p>
                        )}
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-black ${statusStyles[request.status]}`}
                      >
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    {selectedTab === "active" ? (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(request.id, "seen")}
                          className="min-h-10 rounded-xl bg-amber-100 px-3 text-sm font-bold text-amber-800"
                        >
                          Seen
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(request.id, "in_progress")
                          }
                          className="min-h-10 rounded-xl bg-blue-100 px-3 text-sm font-bold text-blue-800"
                        >
                          Working
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(request.id, "done")}
                          className="min-h-10 rounded-xl bg-sage-600 px-3 text-sm font-bold text-white"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-sage-50 px-4 py-3 text-sm font-bold text-sage-700 dark:bg-sage-600/20 dark:text-sage-100">
                        Completed and removed from the active queue
                        <button
                          type="button"
                          onClick={() => updateStatus(request.id, "new")}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-black text-sage-700 shadow-sm dark:bg-white/10 dark:text-white"
                        >
                          Reopen
                        </button>
                      </div>
                    )}
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
