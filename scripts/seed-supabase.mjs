import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
}

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const splitList = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const raw = JSON.parse(await readFile(new URL("../src/data/colleges.json", import.meta.url), "utf8"));

const rows = raw.map((college) => ({
  id: slugify(`${college["College Name"]}-${college.City ?? ""}-${college.State ?? ""}`),
  name: college["College Name"],
  gender_accepted: college["Genders Accepted"] || null,
  campus_size: college["Campus Size"] || null,
  enrollments: toNumber(college["Total Student Enrollments"]),
  faculty: toNumber(college["Total Faculty"]),
  established_year: toNumber(college["Established Year"]),
  rating: toNumber(college.Rating),
  university: college.University || null,
  courses: splitList(college.Courses),
  facilities: splitList(college.Facilities),
  city: college.City || null,
  state: college.State || null,
  country: college.Country || "India",
  college_type: college["College Type"] || null,
  average_fees: toNumber(college["Average Fees"]),
}));

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const chunkSize = 500;
for (let index = 0; index < rows.length; index += chunkSize) {
  const chunk = rows.slice(index, index + chunkSize);
  const { error } = await supabase.from("colleges").upsert(chunk, { onConflict: "id" });

  if (error) {
    throw error;
  }

  console.log(`Seeded ${Math.min(index + chunkSize, rows.length)} / ${rows.length}`);
}

console.log("College dataset seed complete.");
