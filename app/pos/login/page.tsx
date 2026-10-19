"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const [staffName, setStaffName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffName, pin }),
    });
    const result = (await response.json()) as { error?: string };
    setIsSubmitting(false);
    if (!response.ok) {
      setError(result.error || "Sign-in failed.");
      return;
    }
    router.replace("/pos");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/95 p-8 shadow-card dark:border-white/10 dark:bg-sage-900/95">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sage-600 dark:text-sage-100">Staff access</p>
        <h1 className="mt-3 text-4xl font-black text-ink dark:text-white">Open the service queue</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Use your staff name and the restaurant PIN. Sessions expire after eight hours.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-bold text-ink dark:text-white">
            Staff name
            <input value={staffName} onChange={(event) => setStaffName(event.target.value)} required maxLength={80}
              autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-ink outline-none focus:border-sage-600 dark:border-white/20 dark:bg-white/10 dark:text-white" />
          </label>
          <label className="block text-sm font-bold text-ink dark:text-white">
            Staff PIN
            <input value={pin} onChange={(event) => setPin(event.target.value)} required type="password" inputMode="numeric"
              autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-ink outline-none focus:border-sage-600 dark:border-white/20 dark:bg-white/10 dark:text-white" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="min-h-12 w-full rounded-xl bg-ink px-4 font-black text-white disabled:opacity-50">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
