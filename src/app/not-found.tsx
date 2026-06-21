import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center text-slate-950">
      <div>
        <h1 className="text-4xl font-semibold tracking-normal">Page not found</h1>
        <p className="mt-2 text-slate-500">This page does not exist or the college id is unavailable.</p>
        <Link href="/" className="mt-5 inline-flex h-10 items-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white">
          Back home
        </Link>
      </div>
    </main>
  );
}
