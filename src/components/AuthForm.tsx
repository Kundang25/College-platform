"use client";

import Link from "next/link";
import { ArrowLeft, Globe, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";
  const next = searchParams.get("next") || "/dashboard";

  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      setMessage("Supabase env vars are not configured yet. Add them to .env.local to enable auth.");
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      setMessage("Supabase env vars are not configured yet. Add them to .env.local to enable auth.");
      return;
    }

    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isSignup) {
      setMessage("Account created. Check email confirmation if enabled, then log in.");
      return;
    }

    router.replace(next);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
          <ArrowLeft size={17} />
          Home
        </Link>

        <section className="mt-5 grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_420px]">
          <div className="bg-[linear-gradient(135deg,#0f766e,#14b8a6_58%,#f59e0b_132%)] p-6 text-white sm:p-8">
            <div className="grid size-12 place-items-center rounded-md bg-white/15 backdrop-blur">
              <ShieldCheck size={24} />
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-normal">
              Save shortlists, compare picks, and get rank recommendations securely.
            </h1>
            <p className="mt-4 max-w-lg leading-7 text-teal-50">
              Sign in to unlock the dashboard, compare table, and predictor. Google login is fastest; email login is available for traditional accounts.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-medium sm:grid-cols-3">
              <span className="rounded-md bg-white/15 px-3 py-2">Private shortlist</span>
              <span className="rounded-md bg-white/15 px-3 py-2">Protected tools</span>
              <span className="rounded-md bg-white/15 px-3 py-2">Supabase Auth</span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid size-11 place-items-center rounded-md bg-teal-50 text-teal-700">
              {isSignup ? <UserPlus size={22} /> : <LogIn size={22} />}
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal">
              {isSignup ? "Create account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isSignup
                ? "Create an account with email, or use Google from the login page."
                : "Continue with Google or use your email password account."}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={signInWithGoogle}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:border-teal-300 hover:text-teal-700 disabled:opacity-60"
            >
              <Globe size={18} />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              Email
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-teal-700"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  minLength={6}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-teal-700"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                <Mail size={17} />
                {loading ? "Working..." : isSignup ? "Sign up with email" : "Login with email"}
              </button>
            </form>

            {message && (
              <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {message}
              </p>
            )}

            <p className="mt-4 text-sm text-slate-500">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-teal-700">
                {isSignup ? "Login" : "Create one"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
