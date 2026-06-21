import { College } from "@/lib/college";

export type CollegeInsights = {
  nirfRank: number;
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
  examAccepted: string[];
  stream: string;
  hostelFee: number;
  totalCost: number;
};

const hasCourse = (college: College, pattern: RegExp) =>
  college.courses.some((course) => pattern.test(course));

export const getCollegeInsights = (college: College): CollegeInsights => {
  const ratingScore = college.rating ?? 2.8;
  const enrollmentScore = Math.min((college.enrollments ?? 1000) / 6000, 1);
  const publicBoost = college.type.toLowerCase().includes("public") ? 0.7 : 0;
  const techBoost = hasCourse(college, /b\.?tech|m\.?tech|engineering|computer/i) ? 0.9 : 0.25;
  const score = ratingScore * 13 + enrollmentScore * 18 + publicBoost * 8 + techBoost * 10;
  const nirfRank = Math.max(1, Math.min(250, Math.round(270 - score * 3.2)));
  const averagePackage = Math.max(350000, Math.round((score * 16000 + 280000) / 10000) * 10000);
  const highestPackage = Math.round(averagePackage * (2.7 + Math.min(score / 140, 0.8)) / 100000) * 100000;
  const placementRate = Math.max(48, Math.min(96, Math.round(score + 38)));
  const tuition = college.averageFees ?? 250000;
  const hostelFee = Math.round(Math.max(45000, Math.min(220000, tuition * 0.18)) / 1000) * 1000;

  return {
    nirfRank,
    averagePackage,
    highestPackage,
    placementRate,
    examAccepted: getExamAccepted(college),
    stream: getPrimaryStream(college),
    hostelFee,
    totalCost: Math.round((tuition + hostelFee) / 1000) * 1000,
  };
};

export const getPrimaryStream = (college: College) => {
  if (hasCourse(college, /mbbs|medical|dental|pharma|nursing/i)) return "Medical";
  if (hasCourse(college, /mba|management|bba/i)) return "MBA";
  if (hasCourse(college, /law|llb|llm/i)) return "Law";
  if (hasCourse(college, /architecture|b\.?arch/i)) return "Architecture";
  if (hasCourse(college, /b\.?tech|m\.?tech|engineering|computer/i)) return "Engineering";
  if (hasCourse(college, /arts|science|commerce|b\.?sc|m\.?sc/i)) return "Arts & Science";
  return "Multidisciplinary";
};

export const getExamAccepted = (college: College) => {
  const exams = new Set<string>();
  if (hasCourse(college, /b\.?tech|engineering/i)) exams.add("JEE Main");
  if (college.type.toLowerCase().includes("public") && hasCourse(college, /m\.?tech/i)) {
    exams.add("GATE");
  }
  if (hasCourse(college, /mba|management/i)) exams.add("CAT");
  if (hasCourse(college, /medical|mbbs|dental/i)) exams.add("NEET");
  if (hasCourse(college, /law|llb/i)) exams.add("CLAT");
  return exams.size ? [...exams] : ["Merit Based"];
};

export const getCutoffEstimate = (college: College, exam: string) => {
  const insights = getCollegeInsights(college);
  const base = insights.nirfRank * 420;
  const examMultiplier = exam === "GATE" ? 0.75 : exam === "CAT" ? 0.55 : exam === "NEET" ? 0.35 : 1;
  return Math.max(800, Math.round(base * examMultiplier));
};

export const getReviews = (college: College) => [
  {
    user: "Aarav S.",
    rating: Math.min(5, Math.max(3.5, Number(((college.rating ?? 3.8) + 1.1).toFixed(1)))),
    review:
      "Strong academics and helpful faculty. Course choices are broad, so shortlisting depends a lot on branch preference.",
  },
  {
    user: "Meera K.",
    rating: Math.min(5, Math.max(3.4, Number(((college.rating ?? 3.6) + 0.8).toFixed(1)))),
    review:
      "Campus facilities are practical, and the college works well for students who compare fees, location, and placements carefully.",
  },
];

export const savedStorageKey = "college-platform:saved";
export const compareStorageKey = "college-platform:compare";
