import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase";

const reviewSchema = z.object({
  collegeId: z.string().min(1),
  userName: z.string().min(1).max(80),
  rating: z.number().min(1).max(5),
  review: z.string().min(5).max(1000),
});

export async function POST(request: Request) {
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ data: parsed.data, mode: "local-fallback" }, { status: 201 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      college_id: parsed.data.collegeId,
      user_name: parsed.data.userName,
      rating: parsed.data.rating,
      review: parsed.data.review,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
