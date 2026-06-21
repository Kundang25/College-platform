import { NextResponse } from "next/server";
import { getCollegeById } from "@/lib/data";
import { getReviews } from "@/lib/insights";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get("collegeId");

  if (!collegeId) {
    return NextResponse.json({ error: "collegeId is required" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("college_id", collegeId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ data });
    }
  }

  const college = await getCollegeById(collegeId);
  return NextResponse.json({ data: college ? getReviews(college) : [] });
}
