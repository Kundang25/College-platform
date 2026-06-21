"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { College, formatCurrency, formatNumber } from "@/lib/college";
import { getCollegeImage } from "@/lib/college-images";
import {
  compareStorageKey,
  getCollegeInsights,
  getPrimaryStream,
  savedStorageKey,
} from "@/lib/insights";
import { createBrowserSupabase } from "@/lib/supabase";

type Props = {
  colleges: College[];
  states: string[];
  types: string[];
};

type SortMode = "rating" | "fees-low" | "fees-high" | "students" | "rank";

const pageSize = 20;

export function CollegeExplorer({ colleges, states, types }: Props) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [state, setState] = useState("All");
  const [type, setType] = useState("All");
  const [stream, setStream] = useState("All");
  const [exam, setExam] = useState("All");
  const [maxFees, setMaxFees] = useState(1000000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>("rating");
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadStoredLists = window.setTimeout(() => {
      setSaved(JSON.parse(localStorage.getItem(savedStorageKey) || "[]"));
      setCompare(JSON.parse(localStorage.getItem(compareStorageKey) || "[]"));
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(loadStoredLists);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem(savedStorageKey, JSON.stringify(saved));
  }, [saved, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem(compareStorageKey, JSON.stringify(compare));
  }, [compare, storageReady]);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const streams = useMemo(
    () => [...new Set(colleges.map((college) => getPrimaryStream(college)))].sort(),
    [colleges],
  );
  const exams = useMemo(
    () => [
      ...new Set(colleges.flatMap((college) => getCollegeInsights(college).examAccepted)),
    ].sort(),
    [colleges],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return colleges
      .filter((college) => {
        const insights = getCollegeInsights(college);
        const collegeStream = getPrimaryStream(college);
        const searchable = [
          college.name,
          college.city,
          college.state,
          college.type,
          collegeStream,
          insights.examAccepted.join(" "),
          college.courses.slice(0, 16).join(" "),
          college.facilities.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          (state === "All" || college.state === state) &&
          (type === "All" || college.type === type) &&
          (stream === "All" || collegeStream === stream) &&
          (exam === "All" || insights.examAccepted.includes(exam)) &&
          (college.averageFees ?? 0) <= maxFees &&
          (college.rating ?? 0) >= minRating
        );
      })
      .sort((a, b) => {
        if (sort === "fees-low") return (a.averageFees ?? Infinity) - (b.averageFees ?? Infinity);
        if (sort === "fees-high") return (b.averageFees ?? 0) - (a.averageFees ?? 0);
        if (sort === "students") return (b.enrollments ?? 0) - (a.enrollments ?? 0);
        if (sort === "rank") return getCollegeInsights(a).nirfRank - getCollegeInsights(b).nirfRank;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
  }, [colleges, deferredQuery, exam, maxFees, minRating, sort, state, stream, type]);

  const topColleges = useMemo(
    () =>
      [...colleges]
        .sort((a, b) => getCollegeInsights(a).nirfRank - getCollegeInsights(b).nirfRank)
        .slice(0, 4),
    [colleges],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const visible = filtered.slice((activePage - 1) * pageSize, activePage * pageSize);
  const compareColleges = compare
    .map((id) => colleges.find((college) => college.id === id))
    .filter((college): college is College => Boolean(college));

  const toggleSaved = (id: string) => {
    setSaved((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  const toggleCompare = (id: string) => {
    setCompare((current) => {
      if (current.includes(id)) return current.filter((compareId) => compareId !== id);
      return current.length >= 4 ? current : [...current, id];
    });
  };

  const signOut = async () => {
    const supabase = createBrowserSupabase();
    await supabase?.auth.signOut();
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid size-9 place-items-center rounded-md bg-teal-700 text-white">
                <GraduationCap size={20} />
              </span>
              College Discovery
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <NavButton href="/compare" icon={<GitCompare size={16} />} label="Compare" />
              <NavButton href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
              <NavButton href="/predictor" icon={<Sparkles size={16} />} label="Predictor" />
              <button
                type="button"
                title="Toggle theme"
                aria-label="Toggle theme"
                onClick={() => setDarkMode((value) => !value)}
                className="grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {userEmail ? (
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1">
                  <div className="grid size-7 place-items-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                    {userEmail[0]?.toUpperCase() ?? <User size={14} />}
                  </div>
                  <button
                    type="button"
                    onClick={signOut}
                    title="Sign out"
                    aria-label="Sign out"
                    className="grid size-7 place-items-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-red-600"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <NavButton href="/login" icon={<User size={16} />} label="Login" />
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="bg-[linear-gradient(135deg,#0f766e_0%,#14b8a6_52%,#f59e0b_130%)] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:min-h-[380px] lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-md bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur">
              <Sparkles size={16} />
              Search across {formatNumber(colleges.length)} Indian colleges
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal sm:text-6xl">
              Find colleges that match your rank, budget, and career goals.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-teal-50">
              Compare {formatNumber(colleges.length)} Indian colleges across fees, placements,
              rankings, cutoffs, courses, and location signals.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#colleges"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-teal-800 shadow-sm hover:bg-slate-50"
              >
                Explore Colleges
                <ArrowRight size={17} />
              </a>
              <Link
                href="/compare"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Compare Colleges
                <GitCompare size={17} />
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-3 sm:grid-cols-2">
            <HeroStat label="Colleges" value={formatNumber(colleges.length)} />
            <HeroStat label="States" value={formatNumber(states.length)} />
            <HeroStat label="Saved" value={formatNumber(saved.length)} />
            <HeroStat label="Compare List" value={`${compare.length}/4`} />
          </div>
        </div>
      </section>

      <main
        id="colleges"
        className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[310px_1fr] lg:px-8"
      >
        <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 font-semibold">
            <SlidersHorizontal size={18} />
            Filters
          </div>

          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="search">
            Search
          </label>
          <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-slate-300 px-3 focus-within:border-teal-700">
            <Search size={17} className="text-slate-500" />
            <input
              id="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, course, city..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <Select label="State" value={state} onChange={setState} options={["All", ...states]} />
          <Select label="Type" value={type} onChange={setType} options={["All", ...types]} />
          <Select label="Stream" value={stream} onChange={setStream} options={["All", ...streams]} />
          <Select label="Exam" value={exam} onChange={setExam} options={["All", ...exams]} />

          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="maxFees">
            Max average fees: {formatCurrency(maxFees)}
          </label>
          <input
            id="maxFees"
            type="range"
            min={0}
            max={1000000}
            step={25000}
            value={maxFees}
            onChange={(event) => setMaxFees(Number(event.target.value))}
            className="mt-3 w-full accent-teal-700"
          />

          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="minRating">
            Minimum rating: {minRating.toFixed(1)}
          </label>
          <input
            id="minRating"
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={minRating}
            onChange={(event) => setMinRating(Number(event.target.value))}
            className="mt-3 w-full accent-amber-500"
          />

          <Select
            label="Sort"
            value={sort}
            onChange={(value) => setSort(value as SortMode)}
            options={["rating", "rank", "fees-low", "fees-high", "students"]}
            labels={{
              rating: "Best rating",
              rank: "Best rank estimate",
              "fees-low": "Fees: low to high",
              "fees-high": "Fees: high to low",
              students: "Largest enrollment",
            }}
          />
        </aside>

        <section className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Top colleges</h2>
                <p className="text-sm text-slate-500">Ranked with deterministic dataset estimates.</p>
              </div>
              <Link href="/predictor" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
                Try predictor
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {topColleges.map((college) => {
                const insights = getCollegeInsights(college);
                return (
                  <Link
                    key={college.id}
                    href={`/colleges/${college.id}`}
                    className="overflow-hidden rounded-md border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
                  >
                    <div
                      className="h-24 bg-cover bg-center"
                      style={{ backgroundImage: `url(${getCollegeImage(college)})` }}
                    />
                    <div className="p-3">
                      <div className="grid size-10 place-items-center rounded-md bg-teal-50 text-teal-700">
                        <Trophy size={20} />
                      </div>
                      <div className="mt-3 line-clamp-2 text-sm font-semibold">{college.name}</div>
                      <div className="mt-2 text-xs text-slate-500">Rank estimate #{insights.nirfRank}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {compareColleges.length > 0 && <CompareStrip colleges={compareColleges} />}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">
              Showing {formatNumber(visible.length)} of {formatNumber(filtered.length)} colleges
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setState("All");
                setType("All");
                setStream("All");
                setExam("All");
                setMaxFees(1000000);
                setMinRating(0);
                setSort("rating");
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-500"
            >
              <X size={15} />
              Reset
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-md bg-slate-100 text-slate-600">
                <Search size={22} />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No colleges found</h2>
              <p className="mt-1 text-sm text-slate-500">Try removing a filter or searching another course.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visible.map((college) => {
                const insights = getCollegeInsights(college);
                return (
                  <article
                    key={college.id}
                    className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
                  >
                    <div
                      className="h-36 bg-cover bg-center"
                      style={{ backgroundImage: `linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.26)),url(${getCollegeImage(college)})` }}
                    />
                    <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-md bg-slate-100 text-teal-700">
                        <Building2 size={23} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/colleges/${college.id}`}
                              className="text-lg font-semibold leading-6 hover:text-teal-700"
                            >
                              {college.name}
                            </Link>
                            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                              <MapPin size={15} />
                              {college.city}, {college.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge icon={<Trophy size={14} />} label={`Rank estimate #${insights.nirfRank}`} />
                      <Badge icon={<BriefcaseBusiness size={14} />} label={`Avg package ${formatCurrency(insights.averagePackage)}`} />
                      <Badge icon={<Star size={14} />} label={`${college.rating?.toFixed(2) ?? "N/A"} rating`} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <Metric label="Fees" value={formatCurrency(college.averageFees)} />
                      <Metric label="Placement" value={`${insights.placementRate}%`} />
                      <Metric label="Students" value={formatNumber(college.enrollments)} />
                      <Metric label="Stream" value={insights.stream} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {college.courses.slice(0, 4).map((course, index) => (
                        <span key={`${college.id}-${course}-${index}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {course}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <ActionButton
                        label={saved.includes(college.id) ? "Saved" : "Save"}
                        active={saved.includes(college.id)}
                        onClick={() => toggleSaved(college.id)}
                        icon={saved.includes(college.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      />
                      <ActionButton
                        label={compare.includes(college.id) ? "Comparing" : "Compare"}
                        active={compare.includes(college.id)}
                        onClick={() => toggleCompare(college.id)}
                        icon={<GitCompare size={16} />}
                      />
                      <Link
                        href={`/colleges/${college.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-sm">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="h-9 rounded-md border border-slate-300 px-3 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-medium text-slate-600">
              Page {activePage} of {pageCount}
            </span>
            <button
              type="button"
              disabled={activePage === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="h-9 rounded-md border border-slate-300 px-3 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 font-medium text-slate-700">
            <Link href="/">About</Link>
            <Link href="/login">Privacy Policy</Link>
            <Link href="/dashboard">Contact</Link>
            <Link href="/">Data Sources</Link>
          </div>
          <p>Data sourced from public college datasets with deterministic NIRF, placement, and cutoff estimates for demo use.</p>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-teal-300 hover:text-teal-700"
    >
      {icon}
      {label}
    </Link>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/20 bg-white/15 p-4 backdrop-blur">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-teal-50">{label}</div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="mt-4 block text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
        active
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
      {icon}
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-16 rounded-md border border-slate-200 bg-slate-50 p-2">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function CompareStrip({ colleges }: { colleges: College[] }) {
  return (
    <div className="rounded-md border border-teal-200 bg-teal-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-teal-950">Compare shortlist</h2>
          <p className="text-sm text-teal-800">{colleges.map((college) => college.name).join(" vs ")}</p>
        </div>
        <Link
          href="/compare"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Open table
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
