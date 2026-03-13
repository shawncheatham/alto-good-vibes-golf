import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ courses: [] });
  }

  const apiKey = process.env.GOLF_COURSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(q)}`,
      {
        headers: { Authorization: `Key ${apiKey}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ courses: [] });
    }

    const data = await res.json();
    return NextResponse.json({ courses: data.courses ?? data ?? [] });
  } catch {
    return NextResponse.json({ courses: [] });
  }
}
