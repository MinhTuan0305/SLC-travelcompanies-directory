// app/api/agencies/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const county = searchParams.get("county");

  const supabase = createClient();
  let query = (await supabase).from("uk_agency").select("*");

  if (county) {
    query = query.ilike('"Head Office COUNTY"', `%${county}%`);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
