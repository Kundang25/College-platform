"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { College, formatCurrency, formatNumber } from "@/lib/college";
import { getCollegeInsights, getCutoffEstimate } from "@/lib/insights";

export function PredictorClient({ colleges }: { colleges: College[] }) {
  const [exam, setExam] = useState("JEE Main");
  const [rank, setRank] = useState(15000);
  const [category, setCategory] = useState("General");
  const [quota, setQuota] = useState("All India");

  const exams = useMemo(
    () => [...new Set(colleges.flatMap((college) => getCollegeInsights(college).examAccepted))].sort(),
    [colleges],
  );
  const categoryMultiplier = category === "SC/ST" ? 1.65 : category === "OBC/EWS" ? 1.28 : 1;
  const quotaMultiplier = quota === "Home State" ? 1.18 : 1;
  const adjustedRank = rank / (categoryMultiplier * quotaMultiplier);
  const recommendations = colleges
    .filter((college) => getCollegeInsights(college).examAccepted.includes(exam))
    .map((college) => ({
      college,
      cutoff: getCutoffEstimate(college, exam),
      insights: getCollegeInsights(college),
    }))
    .filter((item) => adjustedRank <= item.cutoff)
    .sort((a, b) => a.cutoff - b.cutoff)
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
          <ArrowLeft size={17} />
          Home
        </Link>
        <div className="mt-5 rounded-md bg-[linear-gradient(135deg,#0f766e,#14b8a6,#f59e0b)] p-6 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-teal-50">
            <Sparkles size={17} />
            Predictor Tool
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">Find colleges for your rank.</h1>
          <p className="mt-2 text-teal-50">Uses deterministic cutoff estimates from the dataset for MVP demos.</p>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
          <form className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
            <Field label="Exam">
              <select value={exam} onChange={(event) => setExam(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3">
                {exams.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Rank">
              <input type="number" value={rank} min={1} onChange={(event) => setRank(Number(event.target.value))} className="h-11 w-full rounded-md border border-slate-300 px-3" />
            </Field>
            <Field label="Category">
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3">
                <option>General</option>
                <option>OBC/EWS</option>
                <option>SC/ST</option>
              </select>
            </Field>
            <Field label="Quota">
              <select value={quota} onChange={(event) => setQuota(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3">
                <option>All India</option>
                <option>Home State</option>
              </select>
            </Field>
          </form>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600">
              {formatNumber(recommendations.length)} recommendations for adjusted rank {formatNumber(Math.round(adjustedRank))}
            </p>
            {recommendations.map(({ college, cutoff, insights }) => (
              <Link key={college.id} href={`/colleges/${college.id}`} className="block rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{college.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{college.city}, {college.state}</p>
                  </div>
                  <span className="rounded-md bg-teal-50 px-2 py-1 text-sm font-semibold text-teal-700">Cutoff estimate {formatNumber(cutoff)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">Rank #{insights.nirfRank}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{formatCurrency(insights.averagePackage)} avg package</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{insights.placementRate}% placement</span>
                </div>
                <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3">
                  <div className="text-sm font-semibold text-emerald-950">Good fit because:</div>
                  <div className="mt-2 grid gap-2 text-sm text-emerald-900 sm:grid-cols-3">
                    <Reason label="Rank eligible" />
                    <Reason label={insights.placementRate >= 70 ? "Strong placements" : "Placement data available"} />
                    <Reason label={(college.averageFees ?? 0) <= 200000 ? "Affordable fees" : "Clear fee estimate"} />
                  </div>
                </div>
              </Link>
            ))}
            {recommendations.length === 0 && (
              <section className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-md bg-slate-100 text-slate-600">
                  <Search size={22} />
                </div>
                <h2 className="mt-4 text-lg font-semibold">No confident matches yet</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Try a broader rank, another exam, or Home State quota to see realistic options.
                </p>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Reason({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2 size={16} />
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
