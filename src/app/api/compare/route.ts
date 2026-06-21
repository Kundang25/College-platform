import { NextResponse } from "next/server";
import { getColleges } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const colleges = await getColleges();
  const data = ids
    .map((id) => colleges.find((college) => college.id === id))
    .filter(Boolean);

  return NextResponse.json({ data });
}
