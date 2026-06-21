import rawColleges from "@/data/colleges.json";
import { College, RawCollege, normalizeCollege } from "@/lib/college";
import { createServerSupabase } from "@/lib/supabase";

type CollegeRow = {
  id: string;
  name: string;
  gender_accepted: string | null;
  campus_size: string | null;
  enrollments: number | null;
  faculty: number | null;
  established_year: number | null;
  rating: number | null;
  university: string | null;
  courses: string[] | null;
  facilities: string[] | null;
  city: string | null;
  state: string | null;
  country: string | null;
  college_type: string | null;
  average_fees: number | null;
};

const localColleges = (rawColleges as RawCollege[]).map(normalizeCollege);

const fromRow = (row: CollegeRow): College => ({
  id: row.id,
  name: row.name,
  genderAccepted: row.gender_accepted || "Not listed",
  campusSize: row.campus_size || "Not listed",
  enrollments: row.enrollments,
  faculty: row.faculty,
  establishedYear: row.established_year,
  rating: row.rating,
  university: row.university || "Independent / not listed",
  courses: row.courses || [],
  facilities: row.facilities || [],
  city: row.city || "Unknown city",
  state: row.state || "Unknown state",
  country: row.country || "India",
  type: row.college_type || "Not listed",
  averageFees: row.average_fees,
});

export const getColleges = async (): Promise<College[]> => {
  const supabase = createServerSupabase();

  if (!supabase) {
    return localColleges;
  }

  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(1000);

  if (error || !data?.length) {
    return localColleges;
  }

  return (data as CollegeRow[]).map(fromRow);
};

export const getCollegeById = async (id: string) => {
  const colleges = await getColleges();
  return colleges.find((college) => college.id === id) ?? null;
};

export const getDatasetStats = (colleges: College[]) => {
  const states = new Set(colleges.map((college) => college.state));
  const courses = new Set(colleges.flatMap((college) => college.courses));
  const avgFees = colleges
    .map((college) => college.averageFees)
    .filter((fees): fees is number => fees !== null);

  return {
    colleges: colleges.length,
    states: states.size,
    courses: courses.size,
    medianFees: avgFees.sort((a, b) => a - b)[Math.floor(avgFees.length / 2)] ?? null,
  };
};
