import { NextResponse } from "next/server";
import { getColleges } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();
  const state = searchParams.get("state");
  const type = searchParams.get("type");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const colleges = await getColleges();
  const filtered = colleges
    .filter((college) => {
      const searchable = [college.name, college.city, college.state, college.type, ...college.courses]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (!state || college.state === state) &&
        (!type || college.type === type)
      );
    });

  const from = (page - 1) * limit;
  const data = filtered.slice(from, from + limit);

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  });
}
