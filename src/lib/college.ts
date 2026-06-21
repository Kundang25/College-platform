export type RawCollege = {
  "College Name": string;
  "Genders Accepted"?: string;
  "Campus Size"?: string;
  "Total Student Enrollments"?: number | string;
  "Total Faculty"?: number | string;
  "Established Year"?: number | string;
  Rating?: number | string;
  University?: string;
  Courses?: string;
  Facilities?: string;
  City?: string;
  State?: string;
  Country?: string;
  "College Type"?: string;
  "Average Fees"?: number | string;
};

export type College = {
  id: string;
  name: string;
  genderAccepted: string;
  campusSize: string;
  enrollments: number | null;
  faculty: number | null;
  establishedYear: number | null;
  rating: number | null;
  university: string;
  courses: string[];
  facilities: string[];
  city: string;
  state: string;
  country: string;
  type: string;
  averageFees: number | null;
};

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const splitList = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const normalizeCollege = (college: RawCollege): College => ({
  id: slugify(
    `${college["College Name"]}-${college.City ?? ""}-${college.State ?? ""}`,
  ),
  name: college["College Name"],
  genderAccepted: college["Genders Accepted"] || "Not listed",
  campusSize: college["Campus Size"] || "Not listed",
  enrollments: toNumber(college["Total Student Enrollments"]),
  faculty: toNumber(college["Total Faculty"]),
  establishedYear: toNumber(college["Established Year"]),
  rating: toNumber(college.Rating),
  university: college.University || "Independent / not listed",
  courses: splitList(college.Courses),
  facilities: splitList(college.Facilities),
  city: college.City || "Unknown city",
  state: college.State || "Unknown state",
  country: college.Country || "India",
  type: college["College Type"] || "Not listed",
  averageFees: toNumber(college["Average Fees"]),
});

export const formatCurrency = (value: number | null) => {
  if (value === null) {
    return "Not listed";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number | null) =>
  value === null ? "Not listed" : new Intl.NumberFormat("en-IN").format(value);
