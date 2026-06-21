"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center text-slate-950">
      <div>
        <h1 className="text-4xl font-semibold tracking-normal">Something went wrong</h1>
        <p className="mt-2 text-slate-500">Try again, or return to the homepage.</p>
        <button type="button" onClick={reset} className="mt-5 h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white">
          Retry
        </button>
      </div>
    </main>
  );
}
