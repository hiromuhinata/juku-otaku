import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("jukus")
    .select("*, juku_tags(tag), juku_targets(target)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API jukus GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[API jukus GET] fetched:", data?.length, "rows");
  return NextResponse.json({ data });
}
