"use client";

import Link from "next/link";
import { ArrowLeft, BookmarkCheck, Compass, GitCompare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { College, formatCurrency } from "@/lib/college";
import { compareStorageKey, getCollegeInsights, savedStorageKey } from "@/lib/insights";

export function DashboardClient({ colleges }: { colleges: College[] }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const load = window.setTimeout(() => {
      setSavedIds(JSON.parse(localStorage.getItem(savedStorageKey) || "[]"));
      setCompareIds(JSON.parse(localStorage.getItem(compareStorageKey) || "[]"));
    }, 0);
    return () => window.clearTimeout(load);
  }, []);

  const saved = useMemo(
    () => savedIds.map((id) => colleges.find((college) => college.id === id)).filter((college): college is College => Boolean(college)),
    [colleges, savedIds],
  );
  const compare = useMemo(
    () => compareIds.map((id) => colleges.find((college) => college.id === id)).filter((college): college is College => Boolean(college)),
    [colleges, compareIds],
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
          <ArrowLeft size={17} />
          Home
        </Link>
        <div className="mt-5 rounded-md bg-[linear-gradient(135deg,#0f766e,#14b8a6)] p-6 text-white">
          <h1 className="text-4xl font-semibold tracking-normal">Saved Dashboard</h1>
          <p className="mt-2 text-teal-50">Your saved colleges and active comparison list.</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel title="Saved Colleges" icon={<BookmarkCheck size={20} />} empty={!saved.length}>
            {saved.map((college) => (
              <CollegeRow key={college.id} college={college} />
            ))}
          </Panel>
          <Panel title="Comparisons" icon={<GitCompare size={20} />} empty={!compare.length}>
            {compare.map((college) => (
              <CollegeRow key={college.id} college={college} />
            ))}
            {compare.length > 0 && (
              <Link href="/compare" className="mt-3 inline-flex h-10 items-center rounded-md bg-teal-700 px-3 text-sm font-semibold text-white">
                Open compare table
              </Link>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}

function Panel({ title, icon, empty, children }: { title: string; icon: React.ReactNode; empty: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold">{icon}{title}</h2>
      {empty ? (
        <div className="mt-4 rounded-md border border-dashed border-slate-300 p-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-md bg-teal-50 text-teal-700">
            <Compass size={22} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">No saved colleges yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Start exploring and save colleges to build a shortlist you can compare.
          </p>
          <Link href="/" className="mt-4 inline-flex h-10 items-center rounded-md bg-teal-700 px-3 text-sm font-semibold text-white">
            Explore colleges
          </Link>
        </div>
      ) : <div className="mt-4 space-y-3">{children}</div>}
    </section>
  );
}

function CollegeRow({ college }: { college: College }) {
  const insights = getCollegeInsights(college);
  return (
    <Link href={`/colleges/${college.id}`} className="block rounded-md border border-slate-200 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
      <div className="font-semibold text-slate-950">{college.name}</div>
      <div className="mt-1 text-sm text-slate-500">{college.city}, {college.state}</div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-md bg-teal-50 px-2 py-1 text-teal-700">Rank #{insights.nirfRank}</span>
        <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">{formatCurrency(insights.averagePackage)} avg package</span>
      </div>
    </Link>
  );
}
