"use client";

import { BriefcaseBusiness, IndianRupee, Star } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { College, formatCurrency, formatNumber } from "@/lib/college";
import { CollegeInsights } from "@/lib/insights";

type Review = {
  user: string;
  rating: number;
  review: string;
};

type Props = {
  college: College;
  insights: CollegeInsights;
  reviews: Review[];
  trend: { year: number; value: number }[];
};

const tabs = ["Overview", "Fees", "Placements", "Courses", "Reviews"] as const;
type Tab = (typeof tabs)[number];

export function CollegeDetailTabs({ college, insights, reviews, trend }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const placementTrend = [
    { year: 2022, package: Math.round(insights.averagePackage * 0.82) },
    { year: 2023, package: Math.round(insights.averagePackage * 0.93) },
    { year: 2024, package: insights.averagePackage },
  ];

  return (
    <div className="space-y-5">
      <div className="sticky top-3 z-10 overflow-x-auto rounded-md border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-10 rounded-md px-3 text-sm font-semibold ${
                activeTab === tab
                  ? "bg-teal-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" && (
        <Panel title="Overview">
          <p className="leading-7 text-slate-600">
            {college.name} is a {college.type.toLowerCase()} institution in {college.city},
            {` ${college.state}`}. The dataset lists {formatNumber(college.enrollments)} students,
            {` ${formatNumber(college.faculty)}`} faculty members, and {college.courses.length} courses.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FactCard label="Established" value={formatNumber(college.establishedYear)} />
            <FactCard label="Campus size" value={college.campusSize} />
            <FactCard label="Exam accepted" value={insights.examAccepted.join(", ")} />
          </div>
        </Panel>
      )}

      {activeTab === "Fees" && (
        <Panel title="Fees">
          <div className="grid gap-3 sm:grid-cols-3">
            <FactCard icon={<IndianRupee size={18} />} label="Tuition fee" value={formatCurrency(college.averageFees)} />
            <FactCard label="Hostel estimate" value={formatCurrency(insights.hostelFee)} />
            <FactCard label="Total estimate" value={formatCurrency(insights.totalCost)} />
          </div>
        </Panel>
      )}

      {activeTab === "Placements" && (
        <Panel title="Placements">
          <div className="grid gap-3 sm:grid-cols-3">
            <FactCard icon={<BriefcaseBusiness size={18} />} label="Average package" value={formatCurrency(insights.averagePackage)} />
            <FactCard label="Highest package" value={formatCurrency(insights.highestPackage)} />
            <FactCard label="Placement rate" value={`${insights.placementRate}%`} />
          </div>
          <Chart title="Average Package Trend" data={placementTrend} dataKey="package" formatter={formatCurrency} />
          <Chart title="Cutoff Trend" data={trend} dataKey="value" formatter={(value) => formatNumber(value)} />
        </Panel>
      )}

      {activeTab === "Courses" && (
        <Panel title="Courses">
          <div className="flex flex-wrap gap-2">
            {college.courses.map((course, index) => (
              <span key={`${course}-${index}`} className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                {course}
              </span>
            ))}
          </div>
        </Panel>
      )}

      {activeTab === "Reviews" && (
        <Panel title="Student Reviews">
          <div className="space-y-3">
            {reviews.map((review) => (
              <article key={review.user} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{review.user}</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                    <Star size={15} />
                    {review.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{review.review}</p>
              </article>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function Chart({
  title,
  data,
  dataKey,
  formatter,
}: {
  title: string;
  data: Record<string, number>[];
  dataKey: string;
  formatter: (value: number) => string;
}) {
  return (
    <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatter(Number(value))} width={86} />
            <Tooltip formatter={(value) => formatter(Number(value))} />
            <Line type="monotone" dataKey={dataKey} stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FactCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-semibold text-slate-950">{value}</div>
    </div>
  );
}
