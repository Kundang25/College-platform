"use client";

import Link from "next/link";
import { ArrowLeft, Award, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { College, formatCurrency, formatNumber } from "@/lib/college";
import { compareStorageKey, getCollegeInsights } from "@/lib/insights";

type CompareRow = {
  label: string;
  getValue: (college: College) => string;
  score?: (college: College) => number;
  lowerWins?: boolean;
  badge?: string;
};

export function ComparePageClient({ colleges }: { colleges: College[] }) {
  const [ids, setIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const load = window.setTimeout(() => {
      setIds(JSON.parse(localStorage.getItem(compareStorageKey) || "[]"));
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(load);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem(compareStorageKey, JSON.stringify(ids));
  }, [ids, storageReady]);

  const selected = useMemo(
    () => ids.map((id) => colleges.find((college) => college.id === id)).filter((college): college is College => Boolean(college)),
    [colleges, ids],
  );

  const rows: CompareRow[] = [
    { label: "Location", getValue: (college: College) => `${college.city}, ${college.state}` },
    { label: "Fees", getValue: (college: College) => formatCurrency(college.averageFees), score: (college: College) => college.averageFees ?? Infinity, lowerWins: true, badge: "Best Value" },
    { label: "Avg Package", getValue: (college: College) => formatCurrency(getCollegeInsights(college).averagePackage), score: (college: College) => getCollegeInsights(college).averagePackage, badge: "Best Placement" },
    { label: "Highest Package", getValue: (college: College) => formatCurrency(getCollegeInsights(college).highestPackage), score: (college: College) => getCollegeInsights(college).highestPackage, badge: "Highest CTC" },
    { label: "Placement Rate", getValue: (college: College) => `${getCollegeInsights(college).placementRate}%`, score: (college: College) => getCollegeInsights(college).placementRate, badge: "Best Rate" },
    { label: "Rating", getValue: (college: College) => college.rating?.toFixed(2) ?? "Not listed", score: (college: College) => college.rating ?? 0, badge: "Top Rated" },
    { label: "Rank Estimate", getValue: (college: College) => `#${getCollegeInsights(college).nirfRank}`, score: (college: College) => getCollegeInsights(college).nirfRank, lowerWins: true, badge: "Best Rank" },
    { label: "Students", getValue: (college: College) => formatNumber(college.enrollments), score: (college: College) => college.enrollments ?? 0, badge: "Largest" },
    { label: "Exam Accepted", getValue: (college: College) => getCollegeInsights(college).examAccepted.join(", ") },
  ];

  const bestCollegeId = (row: CompareRow) => {
    if (!row.score || selected.length < 2) return null;
    const sorted = [...selected].sort((a, b) => {
      const aScore = row.score?.(a) ?? 0;
      const bScore = row.score?.(b) ?? 0;
      return row.lowerWins ? aScore - bScore : bScore - aScore;
    });
    return sorted[0]?.id ?? null;
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
          <ArrowLeft size={17} />
          Home
        </Link>
        <div className="mt-5 rounded-md bg-[linear-gradient(135deg,#0f766e,#14b8a6)] p-6 text-white">
          <h1 className="text-4xl font-semibold tracking-normal">Compare Colleges</h1>
          <p className="mt-2 text-teal-50">A side-by-side decision table for your shortlist.</p>
        </div>

        {selected.length === 0 ? (
          <section className="mt-5 rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">No colleges in compare yet</h2>
            <p className="mt-1 text-sm text-slate-500">Add colleges from the listing page to build this table.</p>
          </section>
        ) : (
          <section data-testid="compare-table" className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-4 text-xs uppercase tracking-[0.14em] text-slate-500">Feature</th>
                    {selected.map((college) => (
                      <th key={college.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/colleges/${college.id}`} className="font-semibold text-teal-700 hover:text-teal-800">
                            {college.name}
                          </Link>
                          <button
                            type="button"
                            aria-label={`Remove ${college.name}`}
                            title="Remove"
                            onClick={() => setIds((current) => current.filter((id) => id !== college.id))}
                            className="grid size-8 shrink-0 place-items-center rounded-md border border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const winner = bestCollegeId(row);

                    return (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4 font-semibold text-slate-700">{row.label}</td>
                      {selected.map((college) => (
                        <td
                          key={college.id}
                          className={`px-4 py-4 ${
                            winner === college.id ? "bg-emerald-50 text-emerald-950" : "text-slate-600"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{row.getValue(college)}</span>
                            {winner === college.id && row.badge && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                                <Award size={13} />
                                {row.badge}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
