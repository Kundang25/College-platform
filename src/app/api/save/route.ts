import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase";

const saveSchema = z.object({
  userId: z.string().min(1),
  collegeId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = saveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid save payload" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ data: parsed.data, mode: "local-fallback" }, { status: 201 });
  }

  const { data, error } = await supabase
    .from("saved_colleges")
    .upsert({
      user_id: parsed.data.userId,
      college_id: parsed.data.collegeId,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
