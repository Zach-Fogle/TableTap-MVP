"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  RequestIcon,
  type RequestIconName,
} from "@/components/request-icons";

const REQUEST_OPTIONS: ReadonlyArray<{
  label: string;
  icon: RequestIconName;
}> = [
  { label: "Refill", icon: "refill" },
  { label: "Extra Sauce", icon: "sauce" },
  { label: "Napkins", icon: "napkins" },
  { label: "Plates", icon: "plates" },
  { label: "Check Please", icon: "check" },
];

type SubmissionState = "idle" | "submitting" | "success" | "error";

export default function RequestPanel({ tableId }: { tableId: string }) {
  const [selectedRequest, setSelectedRequest] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRequest = Boolean(selectedRequest || customMessage.trim());
  const isLocked =
    submissionState === "submitting" || submissionState === "success";

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasRequest || isLocked) {
      return;
    }

    setSubmissionState("submitting");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          requestType: selectedRequest || "Custom Request",
          customMessage: customMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Request could not be delivered.");
      }

      setSubmissionState("success");
      setSelectedRequest("");
      setCustomMessage("");

      // Keep the form locked briefly to prevent accidental duplicate alerts.
      resetTimer.current = setTimeout(() => {
        setSubmissionState("idle");
      }, 4000);
    } catch {
      setSubmissionState("error");
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-card backdrop-blur dark:border-white/10 dark:bg-sage-900/90">
      <header className="relative overflow-hidden bg-sage-700 px-6 pb-7 pt-6 text-white">
        <div
          className="absolute -right-12 -top-16 size-48 rounded-full border-[28px] border-white/5"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-lg font-extrabold tracking-tight text-sage-700 shadow-sm">
              TT
            </div>
            <div>
              <p className="font-bold tracking-tight">TableTap</p>
              <p className="text-xs text-sage-100">Restaurant service</p>
            </div>
          </div>
          <div className="rounded-full bg-white/12 px-4 py-2 text-sm font-bold ring-1 ring-white/20">
            Table {tableId}
          </div>
        </div>
        <div className="relative mt-7">
          <p className="text-sm font-medium text-sage-100">How can we help?</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Request something
          </h1>
        </div>
      </header>

      <form className="p-5 sm:p-7" onSubmit={handleSubmit}>
        <fieldset disabled={isLocked}>
          <legend className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            Choose a request
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {REQUEST_OPTIONS.map((option, index) => {
              const isSelected = selectedRequest === option.label;
              const spansFullWidth = index === REQUEST_OPTIONS.length - 1;

              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedRequest(isSelected ? "" : option.label)
                  }
                  className={[
                    "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 font-bold transition duration-150 focus:outline-none focus:ring-4 focus:ring-sage-500/20 active:scale-[0.98]",
                    spansFullWidth ? "col-span-2" : "",
                    isSelected
                      ? "border-sage-600 bg-sage-50 text-sage-700 shadow-sm dark:bg-sage-600/25 dark:text-sage-100"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sage-500/50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
                  ].join(" ")}
                >
                  <RequestIcon name={option.icon} className="size-7" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6">
          <label
            htmlFor="custom-request"
            className="text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            Add a note{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="custom-request"
            value={customMessage}
            maxLength={500}
            disabled={isLocked}
            onChange={(event) => setCustomMessage(event.target.value)}
            placeholder="e.g. No ice, please"
            rows={3}
            className="mt-3 w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-sage-500 focus:ring-4 focus:ring-sage-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {customMessage.length}/500
          </p>
        </div>

        {submissionState === "success" && (
          <div
            role="status"
            className="mt-4 flex items-center gap-3 rounded-2xl bg-sage-50 p-4 text-sm font-bold text-sage-700 dark:bg-sage-600/20 dark:text-sage-100"
          >
            <span className="flex size-7 animate-check-in items-center justify-center rounded-full bg-sage-600 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="size-4"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            Your request has been sent.
          </div>
        )}

        {submissionState === "error" && (
          <div
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-200"
          >
            We couldn&apos;t send your request. Please try again or ask a staff
            member for help.
          </div>
        )}

        <button
          type="submit"
          disabled={!hasRequest || isLocked}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-terracotta-500 px-6 text-base font-bold text-white shadow-lg shadow-terracotta-500/20 transition hover:bg-terracotta-600 focus:outline-none focus:ring-4 focus:ring-terracotta-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-700"
        >
          {submissionState === "submitting" ? (
            <>
              <span
                className="size-5 animate-spin-soft rounded-full border-2 border-white/35 border-t-white"
                aria-hidden="true"
              />
              Sending request...
            </>
          ) : submissionState === "success" ? (
            "Sent"
          ) : (
            "Send request"
          )}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
          Your request goes directly to the restaurant team.
        </p>
      </form>
    </section>
  );
}
