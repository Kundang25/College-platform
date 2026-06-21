import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  GraduationCap,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";
import { CollegeDetailTabs } from "@/components/CollegeDetailTabs";
import { getCollegeImage } from "@/lib/college-images";
import { formatNumber } from "@/lib/college";
import { getCollegeById, getColleges } from "@/lib/data";
import { getCollegeInsights, getCutoffEstimate, getReviews } from "@/lib/insights";

export async function generateStaticParams() {
  const colleges = await getColleges();
  return colleges.slice(0, 300).map((college) => ({ id: college.id }));
}

export default async function CollegeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const college = await getCollegeById(id);

  if (!college) notFound();

  const insights = getCollegeInsights(college);
  const reviews = getReviews(college);
  const exam = insights.examAccepted[0] ?? "JEE Main";
  const cutoff = getCutoffEstimate(college, exam);
  const trend = [
    { year: 2022, value: Math.round(cutoff * 1.14) },
    { year: 2023, value: Math.round(cutoff * 1.05) },
    { year: 2024, value: cutoff },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-500"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div
            className="bg-cover bg-center p-5 text-white sm:p-7"
            style={{
              backgroundImage: `linear-gradient(135deg,rgba(15,118,110,0.94),rgba(20,184,166,0.82),rgba(245,158,11,0.62)),url(${getCollegeImage(college)})`,
            }}
          >
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-teal-50">
              <GraduationCap size={17} />
              {college.type}
            </p>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
                  {college.name}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-teal-50">
                  <MapPin size={18} />
                  {college.city}, {college.state}, {college.country}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[560px]">
                <Metric icon={<Trophy size={18} />} label="Rank estimate" value={`#${insights.nirfRank}`} />
                <Metric icon={<Star size={18} />} label="Rating" value={college.rating?.toFixed(2) ?? "Not listed"} />
                <Metric label="Placement" value={`${insights.placementRate}%`} />
                <Metric label="Stream" value={insights.stream} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 py-6 lg:grid-cols-[1fr_340px]">
          <CollegeDetailTabs college={college} insights={insights} reviews={reviews} trend={trend} />

          <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold">College facts</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Fact label="Ownership" value={college.type} />
              <Fact label="Gender accepted" value={college.genderAccepted} />
              <Fact label="University" value={college.university} />
              <Fact label="Facilities" value={formatNumber(college.facilities.length)} />
            </dl>
            <div className="mt-5 rounded-md bg-teal-50 p-3 text-sm text-teal-950">
              <div className="flex items-center gap-2 font-semibold">
                <Bookmark size={17} />
                Shortlist tip
              </div>
              <p className="mt-1 text-teal-900">
                Save and compare this college from the homepage, then open Dashboard or Compare.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="min-h-24 rounded-md border border-white/20 bg-white/15 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-medium text-teal-50">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
